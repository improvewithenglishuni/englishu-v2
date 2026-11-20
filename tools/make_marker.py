"""Bake a thick red felt-tip MARKER circle (see Sharon's reference): a loop that starts with a tail
swooping in from the outside, goes ~1.1 turns clockwise and ends inside its own start, with streaky
bristle texture, dry frayed ends and darker ink where the line crosses itself.

Writes:
  public/assets/vox/marker_circle.png   1000x1000 RGBA, 5 px per "sticker unit", centred on the circle
  src/kit/markerCircle.json             centre line (in sticker units) used for the draw-on mask
Run: python3 tools/make_marker.py
"""
import json
import math
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PX = 5  # px per unit
S = 1000
rng = np.random.default_rng(11)

# ---- centre line -----------------------------------------------------------------------------
RX, RY = 64.0, 62.0
PHI0, SWEEP = 200.0, 462.0  # degrees (screen angles, y down; increasing = clockwise)
n = 9000
phi = np.radians(PHI0 + np.linspace(0, SWEEP, n))
t = np.linspace(0, 1, n)
flare = 0.40 * np.exp(-(np.degrees(phi) - PHI0) / 38.0)  # the tail comes in from outside
r = 1.0 + flare - 0.055 * t + 0.012 * np.sin(3 * phi + 1) + 0.008 * np.sin(5 * phi)
cx = np.cos(phi) * RX * r
cy = np.sin(phi) * RY * r
seg = np.hypot(np.diff(cx), np.diff(cy))
arc = np.concatenate([[0], np.cumsum(seg)])
L = arc[-1]
# resample evenly
Ns = int(L / 0.1)
sgrid = np.linspace(0, L, Ns)
X = np.interp(sgrid, arc, cx)
Y = np.interp(sgrid, arc, cy)
u = sgrid / L
tx = np.gradient(X)
ty = np.gradient(Y)
tl = np.hypot(tx, ty)
tx, ty = tx / tl, ty / tl
nx, ny = -ty, tx

# ---- stroke profile ---------------------------------------------------------------------------
def sm(a, b, x):
    k = np.clip((x - a) / (b - a), 0, 1)
    return k * k * (3 - 2 * k)

def noise1(len_, scale, seed):
    r_ = np.random.default_rng(seed)
    k = max(2, int(len_ / scale) + 2)
    pts = r_.random(k)
    xs = np.linspace(0, k - 1, len_)
    i0 = np.floor(xs).astype(int)
    f = xs - i0
    f = f * f * (3 - 2 * f)
    return pts[i0] * (1 - f) + pts[np.minimum(i0 + 1, k - 1)] * f

W = 10.4  # full stroke width in units (about 52 px)
half = 0.5 * W * (0.93 + 0.14 * noise1(Ns, 120, 3)) * (0.74 + 0.26 * sm(0, 0.03, u)) * (0.82 + 0.18 * (1 - sm(0.97, 1.0, u)))

NV = 110
v = np.linspace(-1, 1, NV)
NS = 18  # bristle strands
strand_base = rng.uniform(0.8, 1.0, NS)
strand_ph = rng.uniform(0, 6.28, (NS, 3))
strand_fr = rng.uniform(0.012, 0.05, (NS, 3))
start_off = rng.uniform(0.0, 0.014, NS)
end_off = rng.uniform(0.0, 0.014, NS)
cov_s = np.zeros((NS, Ns))
for j in range(NS):
    wv = np.zeros(Ns)
    for q in range(3):
        wv += np.sin(sgrid * strand_fr[j, q] * 6 + strand_ph[j, q])
    wv = 0.5 + wv / 6.0
    dry = 0.08 if abs(j - (NS - 1) / 2) < NS * 0.25 else 0.22  # edges go dry more easily
    c = np.where(wv < dry * 2.2, 0.25 + 0.4 * wv / (dry * 2.2), 1.0) * strand_base[j]
    c = c * sm(start_off[j] - 0.01, start_off[j] + 0.012, u) * (1 - sm(1 - end_off[j] - 0.012, 1 - end_off[j], u))
    cov_s[j] = c
# interpolate strands across v
pos = (v * 0.5 + 0.5) * (NS - 1)
j0 = np.floor(pos).astype(int)
j1 = np.minimum(j0 + 1, NS - 1)
fj = pos - j0
cov = cov_s[j0][:, :] * (1 - fj)[:, None] + cov_s[j1][:, :] * fj[:, None]  # (NV, Ns)
cov = cov.T  # (Ns, NV)
# ragged edges
for side, sgn in ((0, -1), (1, 1)):
    e = 0.04 + 0.12 * noise1(Ns, 14, 40 + side)
    edge = np.clip((1 - e[:, None] - sgn * v[None, :]) / 0.05, 0, 1)
    cov = np.where((sgn * v[None, :]) > 0, cov * edge, cov)
# pin-holes / grain
grain = rng.random((Ns // 5 + 1, NV // 4 + 1))
grain = np.kron(grain, np.ones((5, 4)))[:Ns, :NV]
cov = cov * np.where(grain < 0.035, 0.35, 1.0)

# ---- scatter into the canvas (two layers: first loop A, closing pass B; B multiplies over A) --
USPLIT = 0.866
s0 = USPLIT * L
ramp = np.clip((sgrid - (s0 - 1.0)) / 2.0, 0, 1)
wA = np.cos(ramp * np.pi / 2)
wB = np.sin(ramp * np.pi / 2)
cxp = S / 2
hw = half[:, None] * v[None, :]
px = (X[:, None] + nx[:, None] * hw) * PX + cxp
py = (Y[:, None] + ny[:, None] * hw) * PX + cxp
ix = np.rint(px).astype(int)
iy = np.rint(py).astype(int)
ok = (ix >= 0) & (ix < S) & (iy >= 0) & (iy < S)
dens = (Ns / (L * PX)) * (NV / (W * PX))
base = np.array([238, 12, 12], float)
for name, wt in (('a', wA), ('b', wB)):
    D = np.zeros((S, S))
    w = (cov * wt[:, None])[ok]
    np.add.at(D, (iy[ok], ix[ok]), w)
    D = cv2.GaussianBlur(D / dens, (0, 0), 0.8)
    alpha = np.clip(D * 1.25, 0, 1)
    alpha = np.clip((alpha - 0.12) / 0.55, 0, 1)
    rgb = np.ones((S, S, 3)) * base[None, None, :]
    out = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], alpha * 255]).astype(np.uint8)
    cv2.imwrite(os.path.join(ROOT, f'public/assets/vox/marker_{name}.png'), out)

# ---- centre lines for the draw-on masks (units, relative to centre) -------------------------
def pts_between(i0, i1, k):
    idx = np.linspace(i0, i1, k).astype(int)
    return [[round(float(X[i]), 2), round(float(Y[i]), 2)] for i in idx]

iS = int(USPLIT * (Ns - 1))
A = pts_between(0, iS, 160)
B = pts_between(iS, Ns - 1, 60)
with open(os.path.join(ROOT, 'src/kit/markerCircle.json'), 'w') as f:
    json.dump({'size': 200, 'width': float(W), 'split': USPLIT, 'a': A, 'b': B}, f)
print('ok length units', round(L, 1), 'max extent', float(max(np.abs(np.array(A + B)).max(), 0) + W / 2))
