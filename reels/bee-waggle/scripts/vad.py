"""Energy-based speech segments for a voiceover wav. Usage: python3 scripts/vad.py file.wav"""
import subprocess
import sys

import numpy as np

SR = 48000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-af', 'highpass=f=100,lowpass=f=7000', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
hop = int(0.01 * SR)
n = len(x) // hop
db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
floor = np.percentile(db, 10)
thr = floor + 12
act = db > thr
# close tiny gaps (<120 ms) and drop tiny blips (<60 ms)
segs = []
s = None
for i, a in enumerate(act):
    if a and s is None:
        s = i
    if (not a or i == n - 1) and s is not None:
        segs.append([s, i])
        s = None
merged = []
for a, b in segs:
    if merged and a - merged[-1][1] < 12:
        merged[-1][1] = b
    else:
        merged.append([a, b])
merged = [m for m in merged if m[1] - m[0] >= 6]
print(f'noise floor {floor:.1f} dB, threshold {thr:.1f} dB')
for a, b in merged:
    print(f'{a / 100:6.2f} - {b / 100:6.2f}  ({(b - a) / 100:.2f}s)  peak {db[a:b].max():.1f}')
