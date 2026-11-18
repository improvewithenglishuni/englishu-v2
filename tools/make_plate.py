#!/usr/bin/env python3
"""Crumpled paper plate (the locked world behind a whole Reel).

  python tools/make_plate.py --theme light                  # plane palette, light world
  python tools/make_plate.py --theme dark --palette plane
  python tools/make_plate.py --theme paper                  # heavily crumpled white texture
  python tools/make_plate.py --theme light --base "#7FA36B" --out public/assets/worlds/x/plate_light.jpg

Writes public/assets/worlds/<palette>/plate_<theme>.jpg (1200x2300 by default, so a
1.06 camera push still has spare pixels around a 1080x1920 frame).
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

import paperlib as pl

PRESETS = {
    # crease: crease depth; light: normal strength; ambient: keep high so it stays bright
    "light": dict(color="lightBase", dots="lightDots", crease=1.7, scale=1.1, light=0.15, ambient=0.5, soften=5.0, specks=0.00006,
                  fibre=0.03, patches=3, pitch=15),
    "dark": dict(color="darkBase", dots="darkSecondary", crease=0.35, scale=1.0, light=0.05, ambient=0.72,
                 fibre=0.045, patches=2, pitch=12),
    "paper": dict(color="paper", dots=None, crease=1.6, scale=0.85, light=0.16, ambient=0.45,
                  fibre=0.03, patches=0, pitch=12),
    "pale": dict(color="paleLayer", dots=None, crease=0.9, scale=0.8, light=0.07, ambient=0.6,
                 fibre=0.03, patches=0, pitch=12),
}


def make_plate(theme: dict, kind: str, w: int, h: int, seed: int, base: str | None = None,
               patches: int | None = None, crease: float | None = None) -> np.ndarray:
    p = PRESETS[kind]
    rng = np.random.default_rng(seed)
    color = base or theme[p["color"]]
    img = pl.crumpled_texture(h, w, color, rng, crease=crease if crease is not None else p["crease"],
                              scale=p["scale"], light_strength=p["light"], ambient=p["ambient"],
                              fibre=p["fibre"], soften=p.get("soften", 0.0), specks=p.get("specks", 0.0))
    if kind == "dark":
        # card stock tooth: fine directional grain + slightly lighter fibre streaks
        tooth = rng.normal(0, 1, (h, w)).astype(np.float32)
        tooth = cv2.GaussianBlur(tooth, (0, 0), 1.1)
        streak = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), sigmaX=0.8, sigmaY=6)
        img += (0.018 * tooth + 0.012 * streak)[..., None]
        sec = pl.hex_rgb(theme["darkSecondary"])
        mottle = pl.smoothstep(0.1, 0.7, pl.fbm(h, w, 420, 3, rng))
        img = img * (1 - 0.35 * mottle[..., None]) + sec * (0.35 * mottle[..., None])

    n_patch = p["patches"] if patches is None else patches
    if n_patch and p["dots"]:
        dot_col = pl.hex_rgb(theme[p["dots"]])
        cov = np.zeros((h, w), np.float32)
        # patches go near edges/corners like the reference (never mid-frame centre)
        spots = [(0.12, 0.10), (0.92, 0.78), (0.05, 0.62), (0.85, 0.25), (0.5, 0.97)]
        rng.shuffle(spots)
        for fx, fy in spots[:n_patch]:
            cx, cy = fx * w + rng.uniform(-60, 60), fy * h + rng.uniform(-60, 60)
            m = pl.blob_mask(h, w, cx, cy, rng.uniform(220, 380), rng.uniform(260, 460), rng)
            cov = np.maximum(cov, pl.halftone_layer(h, w, m, p["pitch"], 45 + rng.uniform(-8, 8)))
        # dots are printed on the paper: they follow the same lighting
        lum = img.mean(-1, keepdims=True) / max(pl.hex_rgb(color).mean(), 1e-3)
        img = img * (1 - 0.85 * cov[..., None]) + (dot_col * lum) * (0.85 * cov[..., None])

    # very gentle darkening toward the plate edges (the light falls off on a table top)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    img *= (1 - 0.07 * pl.smoothstep(0.6, 1.4, r))[..., None]
    return np.clip(img, 0, 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--theme", choices=list(PRESETS), default="light", help="which plate to build")
    ap.add_argument("--palette", default="plane", help="palette json name in src/kit/themes")
    ap.add_argument("--base", help="override base colour hex")
    ap.add_argument("--width", type=int, default=1200)
    ap.add_argument("--height", type=int, default=2300)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--patches", type=int, help="number of halftone patches (default per theme)")
    ap.add_argument("--crease", type=float, help="crease depth override")
    ap.add_argument("--out")
    a = ap.parse_args()
    theme = pl.load_theme(a.palette)
    img = make_plate(theme, a.theme, a.width, a.height, a.seed, a.base, a.patches, a.crease)
    out = Path(a.out) if a.out else pl.ASSETS / "worlds" / theme["name"] / f"plate_{a.theme}.jpg"
    pl.save_rgb(out, img)
    print(out, "mean", "#%02X%02X%02X" % tuple((img.reshape(-1, 3).mean(0) * 255).astype(int)))


if __name__ == "__main__":
    main()
