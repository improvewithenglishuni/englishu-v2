#!/usr/bin/env python3
"""Torn paper strips and torn full-width edges.

  python tools/make_torn.py --kind straight --length 2600 --width 260 --taper 1.8 --out contrail.png
  python tools/make_torn.py --kind diagonal --angle -55
  python tools/make_torn.py --kind curved --sag 180
  python tools/make_torn.py --kind edge --length 1400 --width 900     # sheet with a torn bottom edge
  python tools/make_torn.py --svg tornclip.svg --length 1080 --width 300   # SVG clipPath only

The strip core is crumpled paper; a 6-14 px band of exposed white fibres runs along every
torn side; a soft shadow is baked in (disable with --no-shadow).
Default output: public/assets/torn/<kind>_<seed>.png
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

import paperlib as pl


def strip_alpha(L, W, rng, taper=1.0, kind="straight", sides="both", big=190, amp=38):
    """Return (alpha_outer, alpha_core) for a horizontal strip L x (W*max(taper,1))."""
    Wmax = int(W * max(1.0, taper)) + 2 * amp + 40
    H = Wmax
    x = np.arange(L, dtype=np.float32)
    width = W * (1 + (taper - 1) * x / max(L - 1, 1))
    cy = H / 2
    top = cy - width / 2 + pl.torn_profile(L, rng, big=(big, amp), mid=(42, amp * 0.35), small=(9, 2.2))
    bot = cy + width / 2 + pl.torn_profile(L, rng, big=(big, amp), mid=(42, amp * 0.35), small=(9, 2.2))
    if kind == "edge":
        top = np.full(L, -10.0, np.float32)
        bot = H - amp - 30 + pl.torn_profile(L, rng, big=(big, amp), mid=(42, amp * 0.35), small=(9, 2.2))
    if sides == "one":
        top = cy - width / 2 + pl.noise1d(L, [(400, 3)], rng)
    band_t = 11 + pl.noise1d(L, [(60, 4), (12, 1.5)], rng)  # ~6..15 px fibre band
    band_b = 11 + pl.noise1d(L, [(60, 4), (12, 1.2)], rng)
    if sides == "one":
        band_t = np.zeros(L, np.float32) + 0.5
    yy = np.arange(H, dtype=np.float32)[:, None]
    aa = lambda d: np.clip(d + 0.5, 0, 1)  # 1px antialias
    outer = aa(yy - top[None, :]) * aa(bot[None, :] - yy)
    core = aa(yy - top[None, :] - band_t[None, :]) * aa(bot[None, :] - band_b[None, :] - yy)
    if kind == "edge":
        core = aa(bot[None, :] - band_b[None, :] - yy)
    return outer.astype(np.float32), core.astype(np.float32)


def bend(img, sag):
    """Bend a horizontal strip along a parabola (sag px at the middle)."""
    h, w = img.shape[:2]
    pad = int(abs(sag)) + 4
    img = cv2.copyMakeBorder(img, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=0)
    h2 = img.shape[0]
    t = np.linspace(0, 1, w, dtype=np.float32)
    off = sag * 4 * t * (1 - t)
    mx = np.tile(np.arange(w, dtype=np.float32), (h2, 1))
    my = np.arange(h2, dtype=np.float32)[:, None] - off[None, :]
    return cv2.remap(img, mx, my.astype(np.float32), cv2.INTER_LINEAR, borderValue=0)


def rotate(img, angle):
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1)
    c, s = abs(M[0, 0]), abs(M[0, 1])
    nw, nh = int(h * s + w * c), int(h * c + w * s)
    M[0, 2] += nw / 2 - w / 2
    M[1, 2] += nh / 2 - h / 2
    return cv2.warpAffine(img, M, (nw, nh), flags=cv2.INTER_LINEAR, borderValue=0)


def make_strip(theme, kind="straight", length=2400, width=260, taper=1.0, angle=-55.0, sag=160.0,
               sides="both", seed=3, shadow=True, color=None):
    rng = np.random.default_rng(seed)
    outer, core = strip_alpha(length, width, rng, taper, kind, sides)
    H, L = outer.shape
    tex = pl.crumpled_texture(H, L, color or theme["paper"], rng, crease=1.6, scale=0.85,
                              light_strength=0.16, ambient=0.45)
    fib_col = np.clip(pl.hex_rgb(color or theme["paper"]) * 1.06 + 0.07, 0, 1)
    tex = tex * 0.95
    band = np.clip(outer - core, 0, 1)
    fuzz = cv2.GaussianBlur(rng.uniform(0, 1, (H, L)).astype(np.float32), (0, 0), 0.8)
    fib = fib_col[None, None, :] * (0.93 + 0.1 * fuzz[..., None])
    rgb = tex * (1 - band[..., None]) + fib * band[..., None]
    # inner edge of fibre band: faint shadow line where the top layer ends
    ring = np.clip(cv2.GaussianBlur(core, (0, 0), 1.5) - core, 0, 1)
    rgb *= (1 - 0.18 * ring[..., None])
    # hairy outer edge
    edge = np.clip(outer - cv2.erode(outer, np.ones((5, 5), np.uint8)), 0, 1)
    alpha = np.clip(outer - edge * (fuzz > 0.5) * 0.85, 0, 1)
    stack = np.dstack([rgb, alpha])
    if kind == "curved":
        stack = bend(stack, sag)
    if kind == "diagonal":
        stack = rotate(stack, angle)
    rgb, alpha = stack[..., :3], stack[..., 3]
    if shadow:
        return pl.trim(pl.compose_rgba_with_shadow(rgb, alpha, offset=(7, 10), blur=9, opacity=0.35, pad=40))
    return pl.trim((np.dstack([rgb, alpha]) * 255 + 0.5).astype(np.uint8))


def torn_svg(length, width, seed, amp=26, big=140, step=6):
    """SVG <clipPath> polygon of a horizontal torn strip (same profile maths as the PNGs)."""
    rng = np.random.default_rng(seed)
    n = length
    top = width * 0.0 + pl.torn_profile(n, rng, big=(big, amp))
    bot = width + pl.torn_profile(n, rng, big=(big, amp))
    pts = [(x, top[x]) for x in range(0, n, step)] + [(x, bot[x]) for x in range(n - 1, -1, -step)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-amp*2} {n} {width + amp*4}">'
            f'<defs><clipPath id="torn-{seed}" clipPathUnits="userSpaceOnUse"><path d="{d}"/></clipPath></defs>'
            f'<path d="{d}" fill="#fff"/></svg>')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--kind", choices=["straight", "diagonal", "curved", "edge"], default="straight")
    ap.add_argument("--palette", default="plane")
    ap.add_argument("--color", help="paper colour hex (default theme paper)")
    ap.add_argument("--length", type=int, default=2400)
    ap.add_argument("--width", type=int, default=260)
    ap.add_argument("--taper", type=float, default=1.0, help="end width / start width")
    ap.add_argument("--angle", type=float, default=-55, help="for --kind diagonal (degrees, ccw)")
    ap.add_argument("--sag", type=float, default=160, help="for --kind curved")
    ap.add_argument("--sides", choices=["both", "one"], default="both")
    ap.add_argument("--seed", type=int, default=3)
    ap.add_argument("--no-shadow", action="store_true")
    ap.add_argument("--svg", help="write an SVG clipPath instead of a PNG")
    ap.add_argument("--out")
    a = ap.parse_args()
    if a.svg:
        Path(a.svg).write_text(torn_svg(a.length, a.width, a.seed))
        print(a.svg)
        return
    theme = pl.load_theme(a.palette)
    rgba = make_strip(theme, a.kind, a.length, a.width, a.taper, a.angle, a.sag, a.sides, a.seed,
                      not a.no_shadow, a.color)
    out = Path(a.out) if a.out else pl.ASSETS / "torn" / f"{a.kind}_{a.seed}.png"
    pl.save_rgba(out, rgba)
    print(out, rgba.shape)


if __name__ == "__main__":
    main()
