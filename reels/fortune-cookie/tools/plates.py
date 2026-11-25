"""Procedural Vox paper plates for the fortune-cookie Reel (no AI art, free).
light: #EDEEF3 paper, halftone patch top-right, torn periwinkle band at the bottom.
dark:  #3A3C4A paper, darker halftone patch, torn charcoal band at the bottom.
Run from the reel folder: python3 tools/plates.py"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
rng = np.random.default_rng(11)


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma)), np.float32) / 255 - 0.5


def paper(base, amp=1.0):
    m = 10 * noise(40, 30) + 6 * noise(10, 4) + 5 * noise(2, 0.8)
    return hexrgb(base)[None, None, :] + amp * m[..., None]


def halftone(img, cx, cy, r, color, dot=5, step=18, alpha=0.55):
    d = ImageDraw.Draw(img, 'RGBA')
    c = tuple(int(v) for v in hexrgb(color)) + (int(255 * alpha),)
    for y in range(int(cy - r), int(cy + r), step):
        for x in range(int(cx - r), int(cx + r), step):
            dist = np.hypot(x - cx, y - cy) / r
            if dist > 1:
                continue
            rad = dot * (1 - dist) ** 0.7
            if rad > 0.6:
                d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=c)


def torn_band(img, top, color, shadow=True, jag=14):
    """A torn paper strip from y=top to the bottom, with a ragged edge and a white fibre line."""
    xs = np.arange(0, W + 8, 8)
    base = top + 30 * np.sin(xs / 210 + 1.3) + 18 * np.sin(xs / 77)
    edge = base + rng.normal(0, jag / 3, len(xs))
    pts = [(int(x), int(y)) for x, y in zip(xs, edge)] + [(W, H), (0, H)]
    if shadow:
        sh = Image.new('L', (W, H), 0)
        ImageDraw.Draw(sh).polygon([(x, y - 6) for x, y in pts[:-2]] + [(W, H), (0, H)], fill=90)
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        img.paste((0, 0, 0), (0, 0), sh)
    fib = [(x, y - 4 - rng.random() * 5) for x, y in pts[:-2]] + [(W, H), (0, H)]
    ImageDraw.Draw(img).polygon(fib, fill=(246, 246, 250))
    band = Image.new('RGB', (W, H), tuple(int(v) for v in hexrgb(color)))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    tex = np.asarray(band, np.float32) + 8 * noise(30, 20)[..., None] + 5 * noise(3, 1)[..., None]
    img.paste(Image.fromarray(tex.clip(0, 255).astype(np.uint8)), (0, 0), mask)


def make(name, base, band, dots, band_top):
    a = paper(base)
    img = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    halftone(img, 900, 260, 330, dots)
    halftone(img, 120, 1150, 220, dots, alpha=0.35)
    torn_band(img, band_top, band)
    img.save(f'public/img/{name}.png')


make('plate_light', '#EDEEF3', '#A1ACCA', '#A1ACCA', 1490)
make('plate_dark', '#3A3C4A', '#2B2C37', '#55586B', 1490)
print('plates ok')


# ---- v9: cream recycled-paper plate (Sharon's reference): fibrous mottling, specks, faint creases
def cream():
    base = np.array([239, 235, 226], np.float32)
    m = 6 * noise(60, 40) + 6 * noise(14, 5) + 8 * noise(3, 0.9) + 3 * noise(1, 0)
    img = base[None, None, :] + m[..., None]
    im = Image.fromarray(img.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im, 'RGBA')
    # fibres: short thin hairs
    for _ in range(2600):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        a = rng.uniform(0, np.pi)
        L = rng.uniform(3, 16)
        c = int(rng.uniform(90, 170))
        d.line((x, y, x + L * np.cos(a), y + L * np.sin(a)), fill=(c, c - 4, c - 10, int(rng.uniform(25, 80))), width=1)
    # specks
    for _ in range(420):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        r = rng.uniform(0.5, 1.8)
        c = int(rng.uniform(60, 150))
        d.ellipse((x - r, y - r, x + r, y + r), fill=(c, c - 5, c - 12, int(rng.uniform(35, 110))))
    # faint creases: a light ridge with a soft shadow beside it
    cre = Image.new('L', (W, H), 0)
    sh = Image.new('L', (W, H), 0)
    dc, ds = ImageDraw.Draw(cre), ImageDraw.Draw(sh)
    for _ in range(5):
        x0, y0 = rng.uniform(-200, W), rng.uniform(-200, H)
        ang = rng.uniform(-0.9, 0.9) + np.pi / 6
        L = rng.uniform(700, 1800)
        pts = [(x0 + t * np.cos(ang) + rng.normal(0, 6), y0 + t * np.sin(ang) + rng.normal(0, 6)) for t in np.linspace(0, L, 30)]
        dc.line(pts, fill=150, width=3)
        ds.line([(x + 4, y + 5) for x, y in pts], fill=90, width=5)
    im.paste((252, 251, 248), (0, 0), cre.filter(ImageFilter.GaussianBlur(2.5)))
    im.paste((205, 199, 188), (0, 0), sh.filter(ImageFilter.GaussianBlur(5)))
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    im.save('public/img/plate_cream.png')


cream()
print('cream ok')
