#!/usr/bin/env python3
"""Archive photo / print -> Vox-style halftone cutout (transparent PNG).

Ink dots on paper, an irregular white paper border, a soft shadow and (optionally) a flat
colour block peeking out behind it, offset like a marker stroke. Small sources are fine: the
halftone screen hides the upscale.

  python tools/make_photo_cutout.py tools/sources/gillray.jpg --width 760 --backdrop "#F2B632"
  python tools/make_photo_cutout.py tools/sources/vial.jpg --mask tools/sources/vial_mask.jpg --width 640

--mask   grayscale mask image (white = keep). Without it the whole rectangle is the subject.
--ink    dot / line colour (default: the newsprint ink), --paper the paper under the dots.
"""
import argparse
from pathlib import Path

import cv2
import numpy as np
from scipy import ndimage

import paperlib as pl


def hexf(h):
    return pl.hex_rgb(h).astype(np.float32) / (255.0 if pl.hex_rgb(h).max() > 1 else 1.0)


def make(src, width, mask_path=None, pitch=6.5, border=11, backdrop=None, ink="#17140F", paper="#F4EEDC",
         contrast=1.25, seed=1, offset=(26, 22), invert=False):
    g = cv2.imread(str(src), cv2.IMREAD_GRAYSCALE)
    s = width / g.shape[1]
    g = cv2.resize(g, (width, round(g.shape[0] * s)), interpolation=cv2.INTER_CUBIC)
    g = cv2.GaussianBlur(g, (0, 0), 0.9)
    f = g.astype(np.float32) / 255
    lo, hi = np.percentile(f, 2), np.percentile(f, 98)
    f = np.clip((f - lo) / max(hi - lo, 1e-3), 0, 1)
    f = np.clip((f - 0.5) * contrast + 0.5, 0, 1)
    if invert:
        f = 1 - f
    h, w = f.shape
    if mask_path:
        m = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
        m = cv2.resize(m, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
        m = cv2.GaussianBlur((m > 0.5).astype(np.float32), (0, 0), 2.2)
        m = np.clip((m - 0.5) * 3 + 0.5, 0, 1)
    else:
        m = np.ones((h, w), np.float32)
    dots = pl.halftone_layer(h, w, np.clip(1 - f, 0, 1) * 1.25, pitch, 45)
    tone = 0.62 * (1 - dots) + 0.38 * f  # dots carry the shape, a little continuous tone keeps faces
    inkc, papc = hexf(ink), hexf(paper)
    img = papc * tone[..., None] + inkc * (1 - tone[..., None])
    img = np.clip(img * 1.0, 0, 1)
    pad = border * 3 + 40 + max(abs(offset[0]), abs(offset[1]))
    img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=tuple(float(x) for x in papc))
    m = cv2.copyMakeBorder(m, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    H, W = m.shape
    rng = np.random.default_rng(seed)
    dist = ndimage.distance_transform_edt(m < 0.5).astype(np.float32)
    rad = border + pl.fbm(H, W, 90, 3, rng) * border * 0.4
    paper_a = cv2.GaussianBlur(np.clip(rad - dist + 0.5, 0, 1), (0, 0), 0.6)
    tex = 1 + pl.fibres(H, W, rng, strength=0.03)[..., None]
    rgb = (img * m[..., None] + papc * (1 - m[..., None])) * tex
    alpha = np.maximum(paper_a, m)
    if backdrop:
        bd = np.clip((border + 18) - dist + 0.5, 0, 1)
        bd = cv2.GaussianBlur(bd, (0, 0), 1.4)
        bd = pl.fbm(H, W, 60, 2, rng) * 6  # wobble field
        edge = np.clip((border + 20 + bd) - dist + 0.5, 0, 1)
        M = np.float32([[1, 0, offset[0]], [0, 1, offset[1]]])
        edge = cv2.warpAffine(edge, M, (W, H))
        col = hexf(backdrop) * (1 + pl.fibres(H, W, rng, strength=0.05)[..., None])
        a2 = np.maximum(alpha, edge)
        rgb = np.where(alpha[..., None] > 0.5, rgb, np.where(edge[..., None] > 0.3, col, rgb))
        alpha = a2
    rgba = pl.compose_rgba_with_shadow(np.clip(rgb, 0, 1), alpha, offset=(8, 11), blur=11, opacity=0.36, pad=14)
    return pl.trim(rgba, 6)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("--out")
    ap.add_argument("--mask")
    ap.add_argument("--width", type=int, default=760)
    ap.add_argument("--pitch", type=float, default=6.5)
    ap.add_argument("--border", type=int, default=11)
    ap.add_argument("--backdrop")
    ap.add_argument("--ink", default="#17140F")
    ap.add_argument("--paper", default="#F4EEDC")
    ap.add_argument("--contrast", type=float, default=1.25)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--invert", action="store_true")
    a = ap.parse_args()
    rgba = make(a.input, a.width, a.mask, a.pitch, a.border, a.backdrop, a.ink, a.paper, a.contrast, a.seed, invert=a.invert)
    out = Path(a.out) if a.out else pl.ASSETS / "cutouts" / (Path(a.input).stem + ".png")
    pl.save_rgba(out, rgba)
    print(out, rgba.shape)


if __name__ == "__main__":
    main()
