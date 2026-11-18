#!/usr/bin/env python3
"""Procedural paper props: clouds, hexagon ice crystals, global grain tile.

  python tools/make_props.py clouds   --count 6 --seed 10
  python tools/make_props.py crystals --count 6 --radius 64
  python tools/make_props.py grain    --size 512
  python tools/make_props.py all

Outputs go to public/assets/props/ (and public/assets/grain.png).
Arrows and the swoosh are SVG paths generated at render time in src/kit/paths.ts
(slightly different on every seed), so they are not baked here.
"""
import argparse
import math

import cv2
import numpy as np
from scipy import ndimage

import paperlib as pl


# ------------------------------------------------------------------ cloud
def cloud_alpha(w, h, rng):
    m = np.zeros((h, w), np.uint8)
    base_y = int(h * 0.78)
    cv2.ellipse(m, (w // 2, base_y), (int(w * 0.44), int(h * 0.16)), 0, 0, 360, 1, -1)
    n = int(rng.integers(3, 6))
    xs = np.linspace(w * 0.2, w * 0.8, n) + rng.uniform(-w * 0.04, w * 0.04, n)
    for i, x in enumerate(xs):
        mid = 1 - abs(i - (n - 1) / 2) / max((n - 1) / 2, 1)  # taller lobes in the middle
        r = int(h * (0.2 + 0.2 * mid + rng.uniform(-0.03, 0.05)))
        cv2.circle(m, (int(x), base_y - int(r * 0.55)), r, 1, -1)
    m[base_y + int(h * 0.07):] = 0  # flat-ish base
    sdf = ndimage.distance_transform_edt(m) - ndimage.distance_transform_edt(1 - m)
    sdf = sdf.astype(np.float32) + pl.noise1d(1, [(1, 0)], rng)[0]
    jitter = pl.fbm(h, w, 40, 3, rng) * 5 + pl.fbm(h, w, 8, 2, rng) * 1.5
    return np.clip(sdf + jitter + 0.5, 0, 1)


def make_cloud(theme, w=720, h=400, seed=0):
    rng = np.random.default_rng(seed)
    pad = 30
    W, H = w + 2 * pad, h + 2 * pad
    outer = np.zeros((H, W), np.float32)
    outer[pad:pad + h, pad:pad + w] = cloud_alpha(w, h, rng)
    tex = pl.crumpled_texture(H, W, theme["paper"], rng, crease=1.5, scale=0.55, light_strength=0.15, ambient=0.5)
    tex *= 0.95
    # halftone shade on the lower part (grey dots)
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    lower = pl.smoothstep(pad + h * 0.45, pad + h * 0.85, yy) * (0.6 + 0.4 * pl.smoothstep(-0.2, 0.4, pl.fbm(H, W, 120, 2, rng)))
    dots = pl.halftone_layer(H, W, lower, 9, 45 + rng.uniform(-10, 10))
    dot_col = pl.hex_rgb(theme["paper"]) * np.array([0.72, 0.76, 0.82], np.float32)
    tex = tex * (1 - 0.65 * dots[..., None]) + dot_col * 0.65 * dots[..., None]
    # fibre rim
    core = cv2.erode(outer, np.ones((9, 9), np.uint8))
    core = cv2.GaussianBlur(core, (0, 0), 1.2)
    band = np.clip(outer - core, 0, 1)
    fib = np.clip(pl.hex_rgb(theme["paper"]) * 1.06 + 0.07, 0, 1)
    rgb = tex * (1 - band[..., None]) + fib * band[..., None]
    fuzz = cv2.GaussianBlur(rng.uniform(0, 1, (H, W)).astype(np.float32), (0, 0), 0.8)
    edge = np.clip(outer - cv2.erode(outer, np.ones((4, 4), np.uint8)), 0, 1)
    alpha = np.clip(outer - edge * (fuzz > 0.5) * 0.8, 0, 1)
    return pl.trim(pl.compose_rgba_with_shadow(rgb, alpha, offset=(6, 9), blur=9, opacity=0.33, pad=30))


# ------------------------------------------------------------------ crystal
def hex_pts(cx, cy, r, rot=90, jitter=0.0, rng=None):
    pts = []
    for k in range(6):
        a = math.radians(rot + 60 * k)
        rr = r * (1 + (rng.uniform(-jitter, jitter) if rng is not None else 0))
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return np.array(pts, np.float32)


def make_crystal(theme, radius=64, seed=0, ss=3):
    rng = np.random.default_rng(seed)
    R = radius * ss
    S = int(R * 2.4)
    c = S / 2
    rot = 90 + rng.uniform(-6, 6)  # pointy-top, slightly irregular cut
    outer = np.zeros((S, S), np.float32)
    cv2.fillPoly(outer, [np.round(hex_pts(c, c, R, rot, 0.025, rng) * 4).astype(np.int32)], 1.0, cv2.LINE_AA, shift=2)
    face = pl.hex_rgb(theme["crystalFace"])
    line = pl.hex_rgb(theme["crystalLine"])
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    grad = 1 + 0.06 * ((c - xx) + (c - yy)) / (2 * R)  # light from top-left
    rgb = face[None, None, :] * grad[..., None]
    rgb *= (1 + 0.04 * pl.fbm(S, S, R * 0.7, 3, rng))[..., None]
    # occasional pale-blue watercolour blotch like the reference
    if rng.uniform() < 0.5:
        bl = pl.blob_mask(S, S, c + rng.uniform(-R, R) * 0.4, c + rng.uniform(-R, R) * 0.4, R * 0.35, R * 0.3, rng)
        rgb = rgb * (1 - 0.12 * bl[..., None]) + np.array([0.62, 0.76, 0.86]) * 0.12 * bl[..., None]
    # brighter cut rim
    rim = np.clip(outer - cv2.erode(outer, np.ones((4 * ss, 4 * ss), np.uint8)), 0, 1)
    rgb = rgb * (1 - rim[..., None] * 0.7) + np.array([0.94, 0.95, 0.95]) * rim[..., None] * 0.7
    # line drawing: inner hexagon + six spokes
    ink = np.zeros((S, S), np.float32)
    inner = hex_pts(c, c, R * 0.66, rot)
    th = max(1, int(round(2.4 * ss * radius / 64)))
    cv2.polylines(ink, [np.round(inner * 4).astype(np.int32)], True, 1.0, th, cv2.LINE_AA, shift=2)
    for p in inner:
        cv2.line(ink, (int(c * 4), int(c * 4)), (int(p[0] * 4), int(p[1] * 4)), 1.0, th, cv2.LINE_AA, shift=2)
    ink *= 0.85 + 0.15 * pl.fbm(S, S, 20, 2, rng)
    rgb = rgb * (1 - ink[..., None]) + line * ink[..., None]
    small = lambda im: cv2.resize(im, (S // ss, S // ss), interpolation=cv2.INTER_AREA)
    rgb, outer = small(np.clip(rgb, 0, 1).astype(np.float32)), small(outer)
    return pl.trim(pl.compose_rgba_with_shadow(rgb, outer, offset=(3, 5), blur=4, opacity=0.45, pad=14))


# ------------------------------------------------------------------ grain
def make_grain(size=512, seed=0):
    """Tileable grain: filtering white noise in the frequency domain keeps it periodic."""
    rng = np.random.default_rng(seed)
    out = np.zeros((size, size), np.float32)
    fy = np.fft.fftfreq(size)[:, None]
    fx = np.fft.fftfreq(size)[None, :]
    f = np.sqrt(fx * fx + fy * fy) + 1e-6
    for cutoff, amp in ((0.5, 1.0), (0.12, 0.6), (0.03, 0.35)):
        spec = np.fft.fft2(rng.normal(0, 1, (size, size)))
        spec *= np.exp(-(f / cutoff) ** 2)
        layer = np.real(np.fft.ifft2(spec)).astype(np.float32)
        out += amp * layer / layer.std()
    out = out / out.std()
    g = np.clip(128 + out * 34, 0, 255).astype(np.uint8)
    return np.dstack([g, g, g])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("what", choices=["clouds", "crystals", "grain", "all"])
    ap.add_argument("--palette", default="plane")
    ap.add_argument("--count", type=int, default=6)
    ap.add_argument("--seed", type=int, default=10)
    ap.add_argument("--radius", type=int, default=64)
    ap.add_argument("--size", type=int, default=512)
    a = ap.parse_args()
    theme = pl.load_theme(a.palette)
    out = pl.ASSETS / "worlds" / theme["name"]
    if a.what in ("clouds", "all"):
        for i in range(a.count):
            w = int(np.random.default_rng(a.seed + i).uniform(560, 820))
            pl.save_rgba(out / f"cloud_{i}.png", make_cloud(theme, w, int(w * 0.52), a.seed + i))
        print("clouds ->", out)
    if a.what in ("crystals", "all"):
        for i in range(a.count):
            pl.save_rgba(out / f"crystal_{i}.png", make_crystal(theme, a.radius, a.seed + 100 + i))
        print("crystals ->", out)
    if a.what in ("grain", "all"):
        cv2.imwrite(str(pl.ASSETS / "grain.png"), make_grain(a.size, a.seed))
        print("grain ->", pl.ASSETS / "grain.png")


if __name__ == "__main__":
    main()
