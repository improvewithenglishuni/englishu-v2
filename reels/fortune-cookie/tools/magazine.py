"""Magazine-cutout versions of the cookie images: straight, uneven scissor cuts that keep a
little of the original photo's background, a thin paper edge and a faint print texture,
instead of an even white sticker border. Run from the reel folder after prep.py:
    python3 tools/magazine.py [sources]
Writes public/img/broken.png, half_left.png, half_right.png, cookie.png."""
import sys
import numpy as np
import cv2
from PIL import Image

RAW = sys.argv[1] if len(sys.argv) > 1 else 'sources'
OUT = 'public/img'
PAPER = np.array([240, 236, 226], np.float32)


def scissor_mask(alpha, rng, margin=(10, 34), eps=14):
    """Polygon of straight cuts around the subject, at an uneven distance from it."""
    m = (alpha > 40).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    k = int(np.mean(margin))
    grown = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * k + 1, 2 * k + 1)))
    cnts, _ = cv2.findContours(grown, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros_like(m)
    for c in cnts:
        if cv2.contourArea(c) < 2000:
            continue
        poly = cv2.approxPolyDP(c, eps, True).reshape(-1, 2).astype(np.float32)
        ctr = poly.mean(0)
        # push each corner in or out a little so the margin is uneven, like a hand cut
        d = poly - ctr
        n = d / (np.linalg.norm(d, axis=1, keepdims=True) + 1e-6)
        poly = poly + n * rng.uniform(margin[0] - k, margin[1] - k, (len(poly), 1))
        cv2.fillPoly(out, [poly.round().astype(np.int32)], 1)
    return np.maximum(out, m)  # never cut into the subject


def magazine(rgb, alpha, seed, has_bg=True):
    rng = np.random.default_rng(seed)
    H, W = alpha.shape
    pad = 50
    rgb = cv2.copyMakeBorder(rgb, pad, pad, pad, pad, cv2.BORDER_REPLICATE).astype(np.float32)
    alpha = cv2.copyMakeBorder(alpha, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    cut = scissor_mask(alpha, rng)
    a = (alpha > 40)[..., None]
    if has_bg:
        img = rgb  # the original photo background shows inside the cut, like a real clipping
    else:
        img = np.where(a, rgb, PAPER + rng.normal(0, 3, rgb.shape))
    # print texture: slight desaturation + a fine dot screen
    grey = img.mean(2, keepdims=True)
    img = img * 0.9 + grey * 0.1
    yy, xx = np.mgrid[0:img.shape[0], 0:img.shape[1]]
    dots = (np.sin(xx * 0.9) * np.sin(yy * 0.9) + 1) / 2
    img = img * (1 - 0.05 * dots[..., None])
    # thin, slightly lighter paper edge where the scissors went through
    edge = cut - cv2.erode(cut, np.ones((5, 5), np.uint8))
    img = np.where(edge[..., None] > 0, img * 0.55 + 255 * 0.45, img)
    A = (cv2.GaussianBlur(cut.astype(np.float32), (3, 3), 0) * 255)
    rgba = np.dstack([np.clip(img, 0, 255), A]).astype(np.uint8)
    ys, xs = np.where(cut > 0)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def main():
    from rembg import new_session, remove
    s = new_session('isnet-general-use')
    im = Image.open(f'{RAW}/broken.jpg').convert('RGB')
    im.thumbnail((1400, 1400))
    alpha = np.asarray(remove(im, session=s).split()[3])
    rgb = np.asarray(im)
    magazine(rgb, alpha, 3).save(f'{OUT}/broken.png')
    # the two halves (the slip belongs to the right half)
    m = cv2.morphologyEx((alpha > 40).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(m)
    big = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:2]
    big.sort(key=lambda i: cent[i][0])
    for name, k, seed in zip(['half_left', 'half_right'], big, [5, 7]):
        magazine(rgb, np.where(lab == k, alpha, 0).astype(np.uint8), seed).save(f'{OUT}/{name}.png')
    w = Image.open(f'{RAW}/cookie_png.png').convert('RGBA')
    magazine(np.asarray(w.convert('RGB')), np.asarray(w.split()[3]), 11, has_bg=False).save(f'{OUT}/cookie.png')
    print('magazine cutouts ok')


if __name__ == '__main__':
    main()
