"""Generates the shared paper textures for the Reels (grain + crumple), once.
Usage: python3 -I tools/make_paper_textures.py public/postit"""
import sys, numpy as np
from PIL import Image, ImageFilter
out = sys.argv[1]
W, H = 1080, 1920
rng = np.random.default_rng(7)

# 1) fine grain: grey speckle with alpha, multiply-blended in the Reel
g = rng.normal(0, 1, (H, W))
g = np.array(Image.fromarray(((g * 40) + 128).clip(0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))).astype(float)
fib = rng.normal(0, 1, (H // 6, W // 2))
fib = np.array(Image.fromarray(((fib * 50) + 128).clip(0, 255).astype('uint8')).resize((W, H), Image.BICUBIC)).astype(float)
v = (g * 0.7 + fib * 0.3)
rgba = np.zeros((H, W, 4), 'uint8')
rgba[..., :3] = v.clip(0, 255)[..., None].astype('uint8')
rgba[..., 3] = 255
Image.fromarray(rgba).convert('L').save(f'{out}/grain.jpg', quality=80)

# 2) crumple: layered low-frequency noise, lit from top-left -> soft creases
h = np.zeros((H, W))
for scale, amp in [(8, 1.0), (16, 0.6), (40, 0.35), (90, 0.15)]:
    n = rng.normal(0, 1, (max(2, H * scale // 1920), max(2, W * scale // 1920)))
    n = np.array(Image.fromarray(((n + 4) * 30).clip(0, 255).astype('uint8')).resize((W, H), Image.BICUBIC)).astype(float)
    h += (np.abs(n - 120)) * amp  # abs -> ridge-like creases
gy, gx = np.gradient(h)
light = -(gx * -0.6 + gy * -0.8)
light = (light - light.mean()) / (light.std() + 1e-6)
shade = (128 + light * 22).clip(0, 255).astype('uint8')
Image.fromarray(shade).save(f'{out}/crumple.jpg', quality=85)
print('ok')
