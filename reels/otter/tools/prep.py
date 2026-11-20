"""Builds the procedural plates and archival crops for the otter Reel.
Plates are deliberately smooth (no crumpled/creased paper): they are the
general-purpose Vox grounds — ink-black dry brush and mottled field-guide grey."""
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
W, H = 1080, 1920
rng = np.random.default_rng(7)

def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma)), np.float32) / 255

def streaks(angle, length):
    S = 1200  # work at half res on an oversized square, then centre-crop
    n = rng.random((S, S)).astype(np.float32) * 255
    acc = np.zeros_like(n)
    for k in range(length):
        acc += np.roll(n, k, axis=1)
    acc /= length
    # vary stroke strength row-wise so it reads as dry brush, not static
    rows = np.asarray(Image.fromarray((rng.random((S // 8, 1)) * 255).astype(np.uint8)).resize((1, S), Image.BICUBIC), np.float32)
    acc = (acc - acc.mean()) * (0.3 + rows / 255 * 1.4) + 128
    im = Image.fromarray(np.clip(acc, 0, 255).astype(np.uint8)).rotate(angle, resample=Image.BICUBIC)
    c = (S - W // 2) // 2, (S - H // 2) // 2
    im = im.crop((c[0], c[1], c[0] + W // 2, c[1] + H // 2))
    return np.asarray(im.resize((W, H), Image.BICUBIC), np.float32) / 255

# 1. Ink plate: near-black with diagonal dry-brush streaks (inspiration 4)
s = streaks(-28, 60)
s = (s - s.mean()) / (s.std() + 1e-6)
mask = blur_noise(60, 50)
ink = 16 + 7 * s * (0.3 + mask) + 7 * (mask - 0.5)
ink = np.clip(ink, 8, 40)
Image.fromarray(np.stack([ink, ink + 1, ink + 3], -1).clip(0, 255).astype(np.uint8)).save('public/plate_ink.png')

# 2. Field-guide paper: pale grey, soft mottling (inspiration 2), no creases
m1 = blur_noise(40, 30); m2 = blur_noise(12, 6); m3 = blur_noise(3, 1.2)
g = 226 + 14 * (m1 - 0.5) + 8 * (m2 - 0.5) + 6 * (m3 - 0.5)
Image.fromarray(np.stack([g, g, g - 2], -1).clip(0, 255).astype(np.uint8)).save('public/plate_paper.png')

# 3. Steller 1751, Fig. 2 (mother on her back with pup) as an archival clipping
st = Image.open('public/steller.jpg').convert('L')
fig2 = st.crop((20, 10, 1890, 740))
fig2 = ImageOps.autocontrast(fig2, cutoff=1)
sepia = ImageOps.colorize(fig2, black=(32, 28, 24), white=(238, 232, 218))
sepia.save('public/steller_fig2.jpg', quality=92)
# white-line version (ink inverted) for the dark plate
inv = ImageOps.invert(fig2)
inv = ImageEnhance.Contrast(inv).enhance(1.4)
Image.merge('RGBA', (inv, inv, inv, inv)).save('public/steller_fig2_ink.png')
print('ok')
