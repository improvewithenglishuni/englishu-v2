"""Prepares every image, clip and sound for the fortune-cookie Reel.
Inputs: the Wikimedia Commons downloads (see CREDITS.md) in RAW (default: ./sources).
Run from the reel folder:  python3 tools/prep.py [RAW]
Needs: pillow, numpy, rembg (isnet-general-use), ffmpeg."""
import os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance

RAW = sys.argv[1] if len(sys.argv) > 1 else 'sources'
OUT = 'public/img'
AUD = 'public/audio'
os.makedirs(OUT, exist_ok=True)
os.makedirs(AUD, exist_ok=True)
rng = np.random.default_rng(5)


def sticker(rgba, border=12, max_side=1400):
    """White paper border around a cutout (alpha dilation), slightly rough edge."""
    rgba = rgba.copy()
    rgba.thumbnail((max_side, max_side), Image.LANCZOS)
    pad = border * 3
    W, H = rgba.size
    canvas = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
    canvas.paste(rgba, (pad, pad), rgba)
    a = canvas.split()[3].point(lambda v: 255 if v > 40 else 0)
    grown = a.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.5))
    grown = grown.point(lambda v: 255 if v > 110 else 0)
    paper = Image.new('RGBA', canvas.size, (250, 250, 246, 255))
    paper.putalpha(grown)
    paper.alpha_composite(canvas)
    bbox = paper.getbbox()
    return paper.crop(bbox)


def torn(img, max_side=1300, border=14, jag=7):
    """Photo as a torn paper clipping: white border, ragged outline."""
    img = img.convert('RGB')
    img.thumbnail((max_side, max_side), Image.LANCZOS)
    W, H = img.size
    b = border
    out = Image.new('RGBA', (W + 2 * b, H + 2 * b), (0, 0, 0, 0))

    def edge(n, amp):
        return np.cumsum(rng.normal(0, 1, n)) * 0 + rng.normal(0, amp, n)

    def outline(w, h, inset, amp):
        pts = []
        for x in np.linspace(0, w, 60):
            pts.append((x, inset + abs(rng.normal(0, amp))))
        for y in np.linspace(0, h, 90):
            pts.append((w - inset - abs(rng.normal(0, amp)), y))
        for x in np.linspace(w, 0, 60):
            pts.append((x, h - inset - abs(rng.normal(0, amp))))
        for y in np.linspace(h, 0, 90):
            pts.append((inset + abs(rng.normal(0, amp)), y))
        return pts

    mask = Image.new('L', out.size, 0)
    ImageDraw.Draw(mask).polygon(outline(*out.size, 0, jag), fill=255)
    paper = Image.new('RGBA', out.size, (250, 250, 246, 255))
    paper.putalpha(mask)
    inner = Image.new('L', (W, H), 0)
    ImageDraw.Draw(inner).polygon(outline(W, H, 0, 2), fill=255)
    photo = img.convert('RGBA')
    photo.putalpha(inner)
    paper.alpha_composite(photo, (b, b))
    return paper


def full(path, cx, cy=0.5, zoom=1.0):
    """Full-bleed 9:16 crop (1080x1920 plus 8% margin for the slow zoom), centred on (cx, cy) in 0..1."""
    im = Image.open(path).convert('RGB')
    W, H = im.size
    h = int(min(H, W * 16 / 9) / zoom)
    w = int(h * 9 / 16)
    x = int(min(max(cx * W - w / 2, 0), W - w))
    y = int(min(max(cy * H - h / 2, 0), H - h))
    return im.crop((x, y, x + w, y + h)).resize((1080, 1920), Image.LANCZOS)


def cutout(path, model):
    from rembg import remove
    im = Image.open(path).convert('RGB')
    im.thumbnail((1800, 1800))
    return remove(im, session=model)


def muted(img, sat=0.75, contrast=1.05):
    img = ImageEnhance.Color(img).enhance(sat)
    return ImageEnhance.Contrast(img).enhance(contrast)


def main():
    from rembg import new_session
    model = new_session('isnet-general-use')
    R = lambda f: os.path.join(RAW, f)

    # --- Cookies -------------------------------------------------------------
    whole = Image.open(R('cookie_png.png')).convert('RGBA')
    sticker(whole, border=10).save(f'{OUT}/cookie.png')

    broken = cutout(R('broken.jpg'), model)  # two halves + the slip
    sticker(broken, border=12).save(f'{OUT}/broken.png')
    # split into the two halves for the "crack" animation: connected components
    # (the slip is attached to the right half)
    from scipy import ndimage
    a = np.asarray(broken.split()[3]) > 40
    lab, n = ndimage.label(ndimage.binary_closing(a, iterations=2))
    sizes = ndimage.sum(a, lab, range(1, n + 1))
    big = np.argsort(sizes)[::-1][:2] + 1
    cx = [ndimage.center_of_mass(lab == k)[1] for k in big]
    order = [b for _, b in sorted(zip(cx, big))]
    arr = np.asarray(broken).copy()
    for name, k in zip(['half_left', 'half_right'], order):
        m = arr.copy()
        m[..., 3] = np.where(lab == k, m[..., 3], 0)
        sticker(Image.fromarray(m), border=10).save(f'{OUT}/{name}.png')
    cut_x = n
    print('components', cut_x)

    # --- Archival / photos as torn clippings ----------------------------------
    p = Image.open(R('print1878.jpg')).convert('L')
    p = ImageOps.autocontrast(p, cutoff=1)
    ImageOps.colorize(p, black=(38, 34, 30), white=(242, 236, 222)).save(f'{OUT}/print1878_flat.jpg', quality=92)
    torn(ImageOps.colorize(p, black=(38, 34, 30), white=(242, 236, 222)), 1400).save(f'{OUT}/print1878.png')

    torn(muted(Image.open(R('tsujiura.jpg'))), 700).save(f'{OUT}/tsujiura.png')
    press = Image.open(R('press1.jpg'))
    press = press.crop((int(press.width * 0.04), int(press.height * 0.26), int(press.width * 0.98), int(press.height * 0.80)))
    torn(muted(press), 1200).save(f'{OUT}/press.png')
    torn(Image.open(R('tg_postcard.jpg')), 1300).save(f'{OUT}/tg_postcard.png')
    torn(ImageOps.grayscale(Image.open(R('lange_grocer.jpg'))).convert('RGB'), 1300).save(f'{OUT}/lange.png')
    torn(muted(Image.open(R('ggfc.jpg'))), 1300).save(f'{OUT}/ggfc.png')

    # --- Full-frame photos (these, and only these, get the slow zoom) --------
    full(R('rest_flavor.jpg'), 0.24).save(f'{OUT}/full_restaurant.jpg', quality=92)
    full(R('lange_full.jpg'), 0.52, zoom=1.0).save(f'{OUT}/full_lange.jpg', quality=92)
    full(R('ggfc.jpg'), 0.36).save(f'{OUT}/full_ggfc.jpg', quality=92)

    # --- Video: Japanese Tea Garden gate, Golden Gate Park, cropped to 9:16 ---
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '3.4', '-t', '3.6', '-i', R('teagarden.webm'),
                    '-vf', 'scale=-2:1920:flags=lanczos,crop=1080:1920:iw*0.47-540:0,unsharp=5:5:0.6,format=yuv420p',
                    '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', 'public/img/teagarden.mp4'], check=True)

    # --- Sounds from Commons (public domain) -----------------------------------
    def cut(src, dst, start, dur, fade=0.02):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', R(src),
                        '-af', f'afade=t=in:d={fade},afade=t=out:st={dur - 0.08}:d=0.08,loudnorm=I=-20:TP=-2',
                        '-ar', '48000', '-ac', '2', f'{AUD}/{dst}'], check=True)

    cut('crunch.ogg', 'crunch_a.wav', CRUNCH_A, 0.6)
    cut('crunch.ogg', 'crunch_b.wav', CRUNCH_B, 0.6)
    cut('pour_tea.ogg', 'pour_tea.wav', 0.6, 2.2, fade=0.15)
    print('prep ok')


# crunch offsets inside "Eating potato snacks.ogg" (found with tools/find_peaks.py)
CRUNCH_A = float(os.environ.get('CRUNCH_A', 10.0))
CRUNCH_B = float(os.environ.get('CRUNCH_B', 20.0))

if __name__ == '__main__':
    main()
