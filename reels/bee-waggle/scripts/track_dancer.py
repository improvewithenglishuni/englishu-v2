"""Track the red-dot dancer in public/media/dancer.mp4 -> src/data/dancer-track.json
(one [x, y] per video frame, in the clip's 720x720 pixel space, lightly smoothed).
Red paint mask -> largest blob near the previous position -> gap fill -> 7-frame moving average."""
import json
import subprocess
from collections import deque

import numpy as np

W = H = 240
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/media/dancer.mp4', '-vf', f'scale={W}:{H}',
                      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.int16)


def blobs(m):
    seen = np.zeros_like(m, bool)
    out = []
    for y, x in zip(*np.nonzero(m)):
        if seen[y, x]:
            continue
        q = deque([(y, x)])
        seen[y, x] = True
        pts = []
        while q:
            cy, cx = q.popleft()
            pts.append((cy, cx))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        a = np.array(pts)
        out.append((len(pts), a[:, 1].mean(), a[:, 0].mean()))
    return out


xs, ys, prev = [], [], None
for f in frames:
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    cand = [c for c in blobs((r > 140) & (r - g > 80) & (r - b > 70)) if c[0] >= 5]
    if not cand:
        xs.append(np.nan)
        ys.append(np.nan)
        continue
    c = max(cand) if prev is None else min(cand, key=lambda c: (c[1] - prev[0]) ** 2 + (c[2] - prev[1]) ** 2 - c[0] * 3)
    prev = (c[1], c[2])
    xs.append(c[1] * 3)
    ys.append(c[2] * 3)
xs, ys = np.array(xs), np.array(ys)
idx = np.arange(len(xs))
ok = ~np.isnan(xs)
xs, ys = np.interp(idx, idx[ok], xs[ok]), np.interp(idx, idx[ok], ys[ok])
k = 7
sm = lambda v: np.convolve(np.pad(v, k // 2, mode='edge'), np.ones(k) / k, 'valid')
json.dump([[round(float(x), 1), round(float(y), 1)] for x, y in zip(sm(xs), sm(ys))], open('src/data/dancer-track.json', 'w'))
print('frames', len(xs), 'gaps filled', int((~ok).sum()))
