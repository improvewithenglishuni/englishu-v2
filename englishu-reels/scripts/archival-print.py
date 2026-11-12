"""Vox archival print treatment: B&W, contrast, halftone dots blended with tone, cream paper."""
import sys, math
from PIL import Image, ImageDraw, ImageOps, ImageFilter, ImageEnhance

INK = (29, 27, 25)
PAPER = (236, 228, 210)

def halftone(gray, cell, angle):
    big = gray.rotate(angle, expand=True, fillcolor=255)
    w, h = big.size
    dots = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(dots)
    px = big.load()
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            v = px[min(x + cell // 2, w - 1), min(y + cell // 2, h - 1)]
            r = (cell * 0.72) * math.sqrt(1 - v / 255)
            if r > 0.3:
                c = (x + cell / 2, y + cell / 2)
                d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=0)
    dots = dots.rotate(-angle, expand=True, fillcolor=255)
    dw, dh = dots.size
    gw, gh = gray.size
    return dots.crop(((dw - gw) // 2, (dh - gh) // 2, (dw - gw) // 2 + gw, (dh - gh) // 2 + gh))

def main(src, dst, width=1400, cell=6, mix=0.55, crop=None):
    im = Image.open(src).convert("RGB")
    if crop:
        l, t, r, b = crop
        W, H = im.size
        im = im.crop((int(l * W), int(t * H), int(r * W), int(b * H)))
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    gray = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1)
    gray = ImageEnhance.Contrast(gray).enhance(1.25)
    dots = halftone(gray, cell, 45).filter(ImageFilter.GaussianBlur(0.4))
    tone = Image.blend(gray, dots, mix)
    # map grayscale to ink→paper duotone
    lut_r = [round(INK[0] + (PAPER[0] - INK[0]) * i / 255) for i in range(256)]
    lut_g = [round(INK[1] + (PAPER[1] - INK[1]) * i / 255) for i in range(256)]
    lut_b = [round(INK[2] + (PAPER[2] - INK[2]) * i / 255) for i in range(256)]
    out = Image.merge("RGB", (tone.point(lut_r), tone.point(lut_g), tone.point(lut_b)))
    out.save(dst, quality=90)
    print(dst, out.size)

if __name__ == "__main__":
    args = sys.argv[1:]
    crop = tuple(float(v) for v in args[2].split(",")) if len(args) > 2 and args[2] else None
    main(args[0], args[1], crop=crop)
