"""Shared procedural-paper helpers for the EnglishU Reel kit.

Everything here is deterministic for a given seed. numpy + OpenCV + scipy only.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

import cv2
import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent.parent
THEMES_DIR = ROOT / "src" / "kit" / "themes"
ASSETS = ROOT / "public" / "assets"


# --------------------------------------------------------------------------- theme
def load_theme(name_or_path: str) -> dict:
    p = Path(name_or_path)
    if not p.suffix:
        p = THEMES_DIR / f"{name_or_path}.json"
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def hex_rgb(h: str) -> np.ndarray:
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255.0


# --------------------------------------------------------------------------- noise
def value_noise(h: int, w: int, cell: float, rng: np.random.Generator) -> np.ndarray:
    """Smooth value noise in [-1, 1] with features about `cell` px wide."""
    gh, gw = max(2, int(math.ceil(h / cell)) + 2), max(2, int(math.ceil(w / cell)) + 2)
    g = rng.uniform(-1, 1, (gh, gw)).astype(np.float32)
    big = cv2.resize(g, (int(gw * cell), int(gh * cell)), interpolation=cv2.INTER_CUBIC)
    oy, ox = rng.integers(0, max(1, big.shape[0] - h)), rng.integers(0, max(1, big.shape[1] - w))
    return np.clip(big[oy : oy + h, ox : ox + w], -1.2, 1.2)


def fbm(h: int, w: int, base_cell: float, octaves: int, rng, gain=0.5, lac=2.0) -> np.ndarray:
    out = np.zeros((h, w), np.float32)
    amp, cell, tot = 1.0, base_cell, 0.0
    for _ in range(octaves):
        out += amp * value_noise(h, w, max(cell, 1.5), rng)
        tot += amp
        amp *= gain
        cell /= lac
    return out / tot


def noise1d(n: int, scales: list[tuple[float, float]], rng) -> np.ndarray:
    """1-D multi-octave jitter: scales = [(wavelength_px, amplitude_px), ...]."""
    out = np.zeros(n, np.float32)
    x = np.arange(n, dtype=np.float32)
    for wl, amp in scales:
        k = max(2, int(n / wl) + 3)
        pts = rng.uniform(-1, 1, k).astype(np.float32)
        xp = np.linspace(0, n - 1, k)
        # cubic-ish interpolation via cv2 resize on a row
        row = cv2.resize(pts[None, :], (n, 1), interpolation=cv2.INTER_CUBIC)[0]
        out += amp * row
    return out


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0 + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


# --------------------------------------------------------------------------- crumple
def crumple_height(h: int, w: int, rng, crease: float = 1.0, scale: float = 1.0) -> np.ndarray:
    """Height map of crumpled paper.

    Ridged Voronoi (F2-F1) with a random ridge/valley sign per cell gives straight,
    sharp crease lines that meet at vertices (the faceted look of crumpled paper).
    Three cell sizes are stacked, domain-warped a little so lines are not perfectly straight,
    plus low-frequency fbm for the large bends of the sheet.
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    warp_x = fbm(h, w, 260 * scale, 3, rng) * 22 * scale
    warp_y = fbm(h, w, 260 * scale, 3, rng) * 22 * scale
    X, Y = xx + warp_x, yy + warp_y
    pts = np.stack([X.ravel(), Y.ravel()], 1)

    height = fbm(h, w, 520 * scale, 3, rng) * 18 * scale  # big gentle bends
    for cell, amp in ((240, 1.0), (115, 0.55), (52, 0.22)):
        cell *= scale
        n = int(h * w / (cell * cell)) + 8
        seeds = np.stack([rng.uniform(-cell, w + cell, n), rng.uniform(-cell, h + cell, n)], 1)
        sign = rng.choice([-1.0, 1.0], n).astype(np.float32) * rng.uniform(0.5, 1.0, n).astype(np.float32)
        d, idx = cKDTree(seeds).query(pts, k=2, workers=-1)
        ridge = (d[:, 1] - d[:, 0]).reshape(h, w).astype(np.float32)
        # sign of nearest cell decides fold direction; clip keeps facets planar-ish
        s = sign[idx[:, 0]].reshape(h, w)
        tent = np.minimum(ridge, cell * 0.55)
        height += amp * crease * s * tent * 0.55
    return height


def shade_from_height(height: np.ndarray, strength: float, ambient: float,
                      light=(-0.55, -0.7, 0.9)) -> np.ndarray:
    """Lambert shading, light from the top-left. Returns a mean-1 multiplier."""
    gy, gx = np.gradient(height)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(height)
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    lam = np.clip((nx * L[0] + ny * L[1] + nz * L[2]) * inv, 0, 1)
    shade = ambient + (1 - ambient) * lam
    return shade / shade.mean()


def fibres(h: int, w: int, rng, density=0.0006, length=(6, 28), strength=0.05) -> np.ndarray:
    """Short random paper fibres + speckle. Returns additive luminance offset."""
    img = np.zeros((h, w), np.float32)
    n = int(h * w * density)
    x0 = rng.uniform(0, w, n)
    y0 = rng.uniform(0, h, n)
    ang = rng.uniform(0, math.pi, n)
    ln = rng.uniform(*length, n)
    val = rng.choice([-1.0, 1.0], n) * rng.uniform(0.3, 1.0, n)
    for i in range(n):
        x1 = int(x0[i] + math.cos(ang[i]) * ln[i])
        y1 = int(y0[i] + math.sin(ang[i]) * ln[i])
        cv2.line(img, (int(x0[i]), int(y0[i])), (x1, y1), float(val[i]), 1, cv2.LINE_AA)
    img = cv2.GaussianBlur(img, (0, 0), 0.6)
    speck = rng.normal(0, 1, (h, w)).astype(np.float32)
    speck = cv2.GaussianBlur(speck, (0, 0), 0.8)
    return strength * img + strength * 0.6 * speck


def halftone_layer(h: int, w: int, mask: np.ndarray, pitch: float, angle_deg: float,
                   max_r: float | None = None) -> np.ndarray:
    """Coverage (0..1) of a rotated dot screen whose dot radius follows `mask` (0..1)."""
    max_r = max_r or pitch * 0.42
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = math.radians(angle_deg)
    u = (xx * math.cos(a) + yy * math.sin(a)) / pitch
    v = (-xx * math.sin(a) + yy * math.cos(a)) / pitch
    du = (u - np.round(u)) * pitch
    dv = (v - np.round(v)) * pitch
    dist = np.sqrt(du * du + dv * dv)
    r = max_r * np.clip(mask, 0, 1)
    return np.clip(r - dist + 0.5, 0, 1) * (r > 0.3)


def blob_mask(h: int, w: int, cx: float, cy: float, rx: float, ry: float, rng, soft=0.35) -> np.ndarray:
    """Irregular soft blob (0..1) for halftone patches."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    d += fbm(h, w, max(rx, ry) * 0.6, 3, rng) * 0.45
    return 1 - smoothstep(1 - soft, 1 + soft * 0.3, d)


# --------------------------------------------------------------------------- textures
def crumpled_texture(h: int, w: int, base_hex: str, rng, crease=1.0, scale=1.0,
                     light_strength=0.06, ambient=0.55, fibre=0.035, soften=0.0, specks=0.0) -> np.ndarray:
    """RGB float image (0..1) of crumpled paper in the given colour.

    soften: blur (px) on the height map -> rounded wrinkles instead of sharp facets.
    specks: density of small dark paper specks (the reference sky has them).
    """
    height = crumple_height(h, w, rng, crease=crease, scale=scale)
    if soften > 0:
        height = cv2.GaussianBlur(height, (0, 0), soften)
    shade = shade_from_height(height, light_strength, ambient)
    base = hex_rgb(base_hex)
    img = base[None, None, :] * shade[..., None]
    img += fibres(h, w, rng, strength=fibre)[..., None]
    # low-frequency blotchiness (paper is never perfectly even)
    img *= (1 + 0.035 * fbm(h, w, 300, 2, rng))[..., None]
    if specks > 0:
        sp = np.zeros((h, w), np.float32)
        n = int(h * w * specks)
        for x, y, r in zip(rng.uniform(0, w, n), rng.uniform(0, h, n), rng.uniform(0.8, 2.6, n)):
            cv2.circle(sp, (int(x), int(y)), int(round(r)), float(rng.uniform(0.3, 1.0)), -1, cv2.LINE_AA)
        sp = cv2.GaussianBlur(sp, (0, 0), 0.7)
        img *= (1 - 0.45 * sp)[..., None]
    return np.clip(img, 0, 1)


# --------------------------------------------------------------------------- torn edges
def torn_profile(n: int, rng, big=(140, 26), mid=(42, 9), small=(9, 2.2)) -> np.ndarray:
    """Offset profile for a torn edge, multi-octave."""
    return noise1d(n, [big, mid, small], rng)


def fibre_band(alpha_core: np.ndarray, alpha_outer: np.ndarray, rng) -> np.ndarray:
    """Fuzzy alpha for the exposed-fibre band: break up the outermost pixels."""
    h, w = alpha_outer.shape
    fuzz = rng.uniform(0, 1, (h, w)).astype(np.float32)
    fuzz = cv2.GaussianBlur(fuzz, (0, 0), 0.7)
    band = np.clip(alpha_outer - alpha_core, 0, 1)
    # outer half of band gets eaten by noise -> hairy edge
    edge = np.clip(alpha_outer - cv2.erode(alpha_outer, np.ones((5, 5), np.uint8)), 0, 1)
    return np.clip(alpha_outer - edge * (fuzz > 0.55) * 0.9, 0, 1), band


def compose_rgba_with_shadow(rgb: np.ndarray, alpha: np.ndarray, offset=(8, 10), blur=10.0,
                             opacity=0.32, pad: int = 40) -> np.ndarray:
    """Place rgb/alpha on a padded transparent canvas with a soft drop shadow. Returns uint8 RGBA."""
    h, w = alpha.shape
    H, W = h + 2 * pad, w + 2 * pad
    a = np.zeros((H, W), np.float32)
    a[pad : pad + h, pad : pad + w] = alpha
    c = np.zeros((H, W, 3), np.float32)
    c[pad : pad + h, pad : pad + w] = rgb
    M = np.float32([[1, 0, offset[0]], [0, 1, offset[1]]])
    sh = cv2.warpAffine(a, M, (W, H))
    sh = cv2.GaussianBlur(sh, (0, 0), blur) * opacity
    out_a = a + sh * (1 - a)
    out_c = (c * a[..., None]) / np.maximum(out_a[..., None], 1e-6)  # shadow is black
    rgba = np.dstack([np.clip(out_c, 0, 1), np.clip(out_a, 0, 1)])
    return (rgba * 255 + 0.5).astype(np.uint8)


def trim(rgba: np.ndarray, margin: int = 4) -> np.ndarray:
    ys, xs = np.where(rgba[..., 3] > 2)
    if len(xs) == 0:
        return rgba
    y0, y1 = max(0, ys.min() - margin), min(rgba.shape[0], ys.max() + margin + 1)
    x0, x1 = max(0, xs.min() - margin), min(rgba.shape[1], xs.max() + margin + 1)
    return rgba[y0:y1, x0:x1]


def save_rgba(path: Path, rgba: np.ndarray):
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 6])


def save_rgb(path: Path, rgb01: np.ndarray, quality=93):
    path.parent.mkdir(parents=True, exist_ok=True)
    img = (np.clip(rgb01, 0, 1) * 255 + 0.5).astype(np.uint8)
    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    if path.suffix.lower() in (".jpg", ".jpeg"):
        cv2.imwrite(str(path), bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])
    else:
        cv2.imwrite(str(path), bgr)
