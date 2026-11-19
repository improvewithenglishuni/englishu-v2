#!/usr/bin/env python3
"""Vox-style flat paper plates: fine-grain paper with soft dry-brush blotches (no creases).

  python tools/make_vox_plate.py --palette vox            # builds all plates for the theme
  python tools/make_vox_plate.py --palette vox --kind light
  python tools/make_vox_plate.py --kind card --base "#A1ACCA" --out public/assets/worlds/vox/plate_spot.jpg

kinds: light (lavender paper + pale-blue blotches), dark (slate, maps/portraits), charcoal
(people/charts), peri (periwinkle people world), card (flat colour with grain, for cards).
Colours come from src/kit/themes/<palette>.json (ui block).
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

import paperlib as pl


def streaks(h, w, rng, angle, length=60, thick=1.2):
    n = rng.normal(0, 1, (h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), sigmaX=length, sigmaY=thick)
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    n = cv2.warpAffine(n, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    return n / (np.abs(n).max() + 1e-6)


def brush_blotch(h, w, cx, cy, rx, ry, rng, angle):
    m = pl.blob_mask(h, w, cx, cy, rx, ry, rng, soft=0.3)
    s = streaks(h, w, rng, angle) * 0.5 + 0.5
    edge = 4 * m * (1 - m)
    m = pl.smoothstep(0.42, 0.58, m + 0.55 * (s - 0.5) * edge * 2)
    return cv2.GaussianBlur(m, (0, 0), 2.5)


def make(kind, base, blotch, w, h, seed, blotch_alpha=0.9, n_blotch=None):
    rng = np.random.default_rng(seed)
    img = np.ones((h, w, 3), np.float32) * pl.hex_rgb(base)
    spots = {
        "light": [(0.92, 0.10, 330, 300, -20), (0.10, 0.90, 330, 380, 15), (0.05, 0.52, 190, 300, 70), (0.55, 0.62, 300, 300, 30)],
        "dark": [(0.9, 0.2, 300, 260, -20), (0.1, 0.8, 320, 340, 20)],
        "charcoal": [(0.88, 0.15, 280, 240, -20)],
        "peri": [(0.1, 0.9, 300, 300, 20)],
        "card": [],
    }[kind]
    if n_blotch is not None:
        spots = spots[:n_blotch]
    bc = pl.hex_rgb(blotch)
    for fx, fy, rx, ry, ang in spots:
        m = brush_blotch(h, w, fx * w + rng.uniform(-40, 40), fy * h + rng.uniform(-40, 40), rx * 1.25, ry * 1.2, rng, ang)
        # blotch has its own faint tonal variation, like thinned watercolour
        tone = 1.0 + (pl.fbm(h, w, 160, 3, rng) - 0.5) * 0.05
        a = (m * blotch_alpha)[..., None]
        img = img * (1 - a) + bc * tone[..., None] * a
    # paper tooth: fine speckle + faint fibres + large soft mottle
    g = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 0.7)
    amp = 0.011 if kind in ("light", "card", "peri") else 0.016
    mott = (pl.fbm(h, w, 380, 3, rng) - 0.5) * 0.018
    img += (g * amp + mott)[..., None]
    img += (streaks(h, w, rng, rng.uniform(0, 180), 8, 0.7) * 0.006)[..., None]
    specks = (rng.random((h, w)) < 0.00012).astype(np.float32)
    img -= cv2.GaussianBlur(specks, (0, 0), 0.9)[..., None] * 0.35
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    img *= (1 - 0.05 * pl.smoothstep(0.6, 1.4, r))[..., None]
    return np.clip(img, 0, 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--palette", default="vox")
    ap.add_argument("--kind", choices=["light", "dark", "charcoal", "peri", "card", "all"], default="all")
    ap.add_argument("--base")
    ap.add_argument("--blotch")
    ap.add_argument("--width", type=int, default=1200)
    ap.add_argument("--height", type=int, default=2300)
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--out")
    a = ap.parse_args()
    t = pl.load_theme(a.palette)
    ui = t["ui"]
    out_dir = pl.ASSETS / "worlds" / t["name"]
    plan = {
        "light": (t["lightBase"], t["lightDots"], "plate_light.jpg"),
        "dark": (t["darkBase"], t["darkSecondary"], "plate_dark.jpg"),
        "charcoal": (ui["charcoal"], "#3F3D40", "plate_charcoal.jpg"),
        "peri": (ui["periwinkle"], "#98A4C6", "plate_peri.jpg"),
    }
    cards = {"spot": t["spot"], "accent": t["accent"], "ink": ui["slate"], "paper": t["paper"], "pale": ui["periwinkle"]}
    jobs = []
    if a.kind == "all":
        jobs = [(k, *v) for k, v in plan.items()] + [("card", c, c, f"plate_{n}.jpg") for n, c in cards.items()]
    elif a.kind == "card":
        jobs = [("card", a.base, a.base, Path(a.out).name if a.out else "plate_card.jpg")]
    else:
        b, bl, fn = plan[a.kind]
        jobs = [(a.kind, a.base or b, a.blotch or bl, fn)]
    for kind, base, blotch, fn in jobs:
        w, h = (a.width, a.height) if kind != "card" else (900, 900)
        img = make(kind, base, blotch, w, h, a.seed)
        p = Path(a.out) if (a.out and len(jobs) == 1) else out_dir / fn
        pl.save_rgb(p, img)
        print(p)


if __name__ == "__main__":
    main()
