#!/usr/bin/env python3
"""Turn any photo into a collage cutout: background removed, high-contrast B&W,
irregular white paper border, soft shadow, transparent PNG.

  python tools/make_cutout.py photo.jpg                       # -> public/assets/cutouts/photo.png
  python tools/make_cutout.py photo.jpg --halftone --border 10 --max-size 1100
  python tools/make_cutout.py photo.jpg --method grabcut       # skip rembg
  python tools/make_cutout.py photo.jpg --color                # keep colour (desaturated)

Background removal: rembg (u2net) when installed, otherwise OpenCV GrabCut seeded from the
image border, keeping the largest connected component with holes filled.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from scipy import ndimage

import paperlib as pl


def mask_rembg(rgb, model=None):
    from rembg import new_session, remove  # noqa
    out = remove(rgb, session=new_session(model) if model else None)  # RGBA uint8
    return (out[..., 3].astype(np.float32) / 255.0)


def mask_grabcut(rgb, iters=6):
    h, w = rgb.shape[:2]
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    m = np.full((h, w), cv2.GC_PR_FGD, np.uint8)
    b = max(4, int(min(h, w) * 0.02))
    m[:b], m[-b:], m[:, :b], m[:, -b:] = cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD
    # pixels very close to the mean border colour are probably background
    border = np.concatenate([bgr[:b].reshape(-1, 3), bgr[-b:].reshape(-1, 3),
                             bgr[:, :b].reshape(-1, 3), bgr[:, -b:].reshape(-1, 3)]).astype(np.float32)
    d = np.linalg.norm(bgr.astype(np.float32) - border.mean(0), axis=-1)
    m[(d < border.std(0).mean() * 1.5) & (m == cv2.GC_PR_FGD)] = cv2.GC_PR_BGD
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, m, None, bg, fg, iters, cv2.GC_INIT_WITH_MASK)
    return ((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)).astype(np.float32)


def clean(mask):
    hard = mask > 0.5
    lab, n = ndimage.label(hard)
    if n > 1:
        sizes = ndimage.sum(hard, lab, range(1, n + 1))
        hard = lab == (int(np.argmax(sizes)) + 1)
    hard = ndimage.binary_fill_holes(hard)
    soft = cv2.GaussianBlur(hard.astype(np.float32), (0, 0), 0.8)
    return np.minimum(soft, np.where(mask > 0.05, 1.0, soft))


def bw_contrast(rgb, color=False, clip=2.0):
    rgb = cv2.bilateralFilter(rgb, 7, 30, 5)  # CLAHE would amplify sensor noise
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(lab[..., 0])
    if color:
        lab[..., 0] = l
        out = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB).astype(np.float32) / 255
        g = out.mean(-1, keepdims=True)
        return np.clip(g + (out - g) * 0.45, 0, 1)  # desaturate
    g = l.astype(np.float32) / 255
    g = np.clip((g - 0.5) * 1.18 + 0.52, 0, 1)  # extra punch
    return np.repeat(g[..., None], 3, -1)


def halftone(img, pitch=7, strength=0.5):
    g = img.mean(-1)
    h, w = g.shape
    dots = pl.halftone_layer(h, w, np.clip(1 - g, 0, 1) * 1.2, pitch, 45)
    return np.clip(img * (1 - strength * dots[..., None]), 0, 1)


def make_cutout(rgb, method="auto", border=10, halftone_on=False, color=False, seed=1, max_size=1200, model=None):
    s = max_size / max(rgb.shape[:2])
    if s < 1:
        rgb = cv2.resize(rgb, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    mask = None
    if method in ("auto", "rembg"):
        try:
            mask = mask_rembg(rgb, model)
            print("background: rembg")
        except Exception as e:  # noqa
            if method == "rembg":
                raise
            print("rembg unavailable (%s), using GrabCut" % type(e).__name__)
    if mask is None:
        mask = mask_grabcut(rgb)
        print("background: grabcut")
    mask = clean(mask)
    img = bw_contrast(rgb, color)
    if halftone_on:
        img = halftone(img)
    pad = border * 3 + 40
    img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(1, 1, 1))
    mask = cv2.copyMakeBorder(mask, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    # irregular white paper border: threshold the distance field with a noisy radius
    rng = np.random.default_rng(seed)
    dist = ndimage.distance_transform_edt(mask < 0.5).astype(np.float32)
    h, w = mask.shape
    radius = border + pl.fbm(h, w, 90, 3, rng) * border * 0.35
    paper = np.clip(radius - dist + 0.5, 0, 1)
    paper = cv2.GaussianBlur(paper, (0, 0), 0.6)
    paper_col = np.array([0.965, 0.96, 0.94], np.float32)
    tex = 1 + pl.fibres(h, w, rng, strength=0.03)[..., None]
    rgb_out = (img * mask[..., None] + paper_col * (1 - mask[..., None])) * tex
    alpha = np.maximum(paper, mask)
    rgba = pl.compose_rgba_with_shadow(np.clip(rgb_out, 0, 1), alpha, offset=(8, 11), blur=11, opacity=0.38, pad=10)
    return pl.trim(rgba, 6)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("--out")
    ap.add_argument("--method", choices=["auto", "rembg", "grabcut"], default="auto")
    ap.add_argument("--border", type=int, default=10, help="white border width px (8-12)")
    ap.add_argument("--halftone", action="store_true")
    ap.add_argument("--color", action="store_true", help="keep (desaturated) colour instead of B&W")
    ap.add_argument("--max-size", type=int, default=1200)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--model", help="rembg model name, e.g. u2net (176 MB) or bria-rmbg (1 GB, default of new rembg)")
    a = ap.parse_args()
    bgr = cv2.imread(a.input, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    rgba = make_cutout(rgb, a.method, a.border, a.halftone, a.color, a.seed, a.max_size, a.model)
    out = Path(a.out) if a.out else pl.ASSETS / "cutouts" / (Path(a.input).stem + ".png")
    pl.save_rgba(out, rgba)
    print(out, rgba.shape)


if __name__ == "__main__":
    main()
