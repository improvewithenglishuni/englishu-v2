"""Sound design for the bee Reel -> public/audio/bed_sfx.wav

Principle: no stock "UI" sounds (pops, whooshes, sparkles, chimes). Every sound comes from the bee's world
or carries information:
  * real field recordings (public/media/audio/*.mp3, from Wikimedia Commons):
      meadow.mp3   - honeybees among flowers, YLE archive (CC BY 3.0)       -> outdoor park shots
      hive-hum.mp3 - inside a honeybee hive, "Honeybee-hive.ogg" (CC0)     -> inside the hive / the lens
      flyby.mp3    - "Bombus buzz.ogg" (public domain)                     -> the forager flying in
  * a "sonic zoom": as the magnifier opens, the meadow fades out and the hive hum fades in
  * waggle buzz: a real buzz, pulsed at the waggle rate (~13 Hz), plays exactly while a bee waggles,
    so a short waggle *sounds* short and a long one long (the distance code you can hear)
  * CONVEY: a tiny wing-flick as each letter reaches a follower, rising in pitch
  * tactile foley (Vox recipe): a real marker on paper when a line draws on, a real paper movement when a
    paper panel arrives (four different takes, never the same one twice), each J-cut a few frames early;
    only each scene's hero motion gets a sound (hierarchy and restraint)
  * music: a plucked (Karplus-Strong, string-like) ostinato + soft bowed pad, no drums;
    it drops out in the dark hive so the real hum carries the moment, and resolves on the end card.
Re-run after re-timing:  python3 scripts/make_audio.py
"""
import os
import subprocess
import wave

import numpy as np

SR = 48000
FPS = 30


def read_scenes():
    """Scene timings straight from src/theme.ts, so picture and sound can never drift apart."""
    import re
    src = open(os.path.join(os.path.dirname(__file__), '..', 'src', 'theme.ts'), encoding='utf-8').read()
    block = src[src.index('export const SCENES'):src.index('} as const')]
    return {k: (float(a), float(b)) for k, a, b in re.findall(r'(\w+):\s*\[([\d.]+),\s*([\d.]+)\]', block)}


T = read_scenes()
DUR = T['end'][1]
st = lambda k: T[k][0]
dur_f = lambda k: round((T[k][1] - T[k][0]) * FPS)
# in-scene cues (mirror the constants in the scene files)
S2_DRAW = (4, min(70, dur_f('s2') - 16))   # S2Address: figure-eight draw-on frames
S3_SPLIT = 100                             # S3Diagram: angle -> distance; part A plays 105 designed frames in SPLIT
S4_LEAD = 6                                # S4Convey: letters leave the dancer
S5_LENS = 108                              # S5Dark: magnifier opens
S8_SPLIT = round(dur_f('s8') * 0.5)        # S8Robot: comb -> park
S7_HALF = round(dur_f('s7') * 0.48)        # S7Waze: satellite -> magnifier


def s2(frame):
    return st('s2') + frame / FPS


def s3a(designed_frame):
    return st('s3') + designed_frame * S3_SPLIT / 105 / FPS


def s3b(frames_after_split):
    return st('s3') + (S3_SPLIT + frames_after_split) / FPS


N = int(SR * DUR)
rng = np.random.default_rng(11)
ROOT = os.path.join(os.path.dirname(__file__), '..')


def load(name):
    """Decode a media/audio mp3 to mono float32 via ffmpeg."""
    path = os.path.join(ROOT, 'public', 'media', 'audio', name)
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    i = max(0, i)
    j = min(len(buf), i + len(sig) - s0)
    buf[i:j] += gain * sig[s0:s0 + j - i]


def env_lin(n, pts):
    """Piecewise-linear envelope from [(t_sec, value), ...]."""
    t = np.arange(n) / SR
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def segment(src, start, dur, fade=0.4):
    n = int(dur * SR)
    a = int(start * SR)
    s = np.resize(src[a:], n) if len(src) - a < n else src[a:a + n].copy()
    f = int(fade * SR)
    if f:
        s[:f] *= np.linspace(0, 1, f)
        s[-f:] *= np.linspace(1, 0, f)
    return s


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(X, len(x))


def pluck(freq, dur, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    buf = bright * buf + (1 - bright) * np.convolve(buf, np.ones(4) / 4, 'same')
    out = np.empty(n)
    for k in range(n):
        out[k] = buf[k % p]
        buf[k % p] = decay * 0.5 * (buf[k % p] + buf[(k + 1) % p])
    out *= np.minimum(1, np.arange(n) / (0.003 * SR))
    return out


def bowed(freqs, dur):
    """Soft bowed-string pad: detuned saws, low-passed, slow swell."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.12):
            ph = (f * (1 + det / 100)) * t + 0.002 * np.sin(2 * np.pi * 5 * t)
            s += 2 * (ph % 1) - 1
    s = onepole_lp(s / (2 * len(freqs)), 900)
    a = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.9)
    return s * a


mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

meadow = onepole_lp(load('meadow.mp3'), 7000)  # tame the recording's hiss
hum = load('hive-hum.mp3')
flyby = load('flyby.mp3')
marker = load('marker.mp3')  # "377124 tubbsmedia marker-lines" (CC0): lines at 0.4-1.7, 3.15-5.1, 6.3-7.6, 8.75-10.25 s
paper = load('paper.mp3')  # "Book paper pages assorted" (PD): four takes at 0, 1, 2, 3 s (0.8 s each)
JC = 0.12  # J-cut: sounds lead their visual by ~4 frames

amb = np.zeros(N)
sfx = np.zeros(N)
mus = np.zeros(N)

# ---------------- ambience ----------------
# Park (beat 1): meadow, then the "sonic zoom" into the hive as the magnifier opens (~1.3-1.8 s)
m1 = segment(meadow, 0, 3.7, fade=0.05) * env_lin(int(3.7 * SR), [(0, 0.0), (0.15, 1.0), (1.25, 1.0), (1.9, 0.15), (3.7, 0.0)])
add(amb, m1, 0, 0.55)
h1 = segment(hum, 2, 3.6, fade=0.05) * env_lin(int(3.6 * SR), [(0, 0), (1.25, 0), (1.9, 1), (3.3, 1), (3.6, 0)])
add(amb, h1, 0.0, 0.6)
# Dark hive (beat 5): hum swells in muffled, opens up when the antennae lens appears (~20.7 s)
h5 = segment(hum, 5, 7.6, fade=0.3)
muff = onepole_lp(h5, 500)
_o = 0.3 + S5_LENS / FPS  # lens opens, relative to the hum's start
mix5 = muff * env_lin(len(h5), [(0, 1), (_o - 0.25, 1), (_o + 0.35, 0.3), (7.6, 0.3)]) + h5 * env_lin(len(h5), [(0, 0), (_o - 0.25, 0), (_o + 0.35, 0.9), (7.6, 0.9)])
mix5 *= env_lin(len(h5), [(0, 0), (0.6, 1.0), (6.8, 1.0), (7.6, 0)])
add(amb, mix5, st('s5') - 0.3, 0.95)
# Robot beat, part B (park): meadow as the real bees fly out
add(amb, segment(meadow, 3, T['s8'][1] - st('s8') - S8_SPLIT / FPS + 0.3, fade=0.3), st('s8') + S8_SPLIT / FPS - 0.15, 0.5)
# Waze beat: meadow, the hive faintly underneath once the magnifier opens, out on the end card
m7 = segment(meadow, 6, T['s7'][1] - st('s7') + 1.0, fade=0.5)
add(amb, m7, st('s7') - 0.15, 0.5)
h7 = segment(hum, 12, T['s7'][1] - st('s7') - S7_HALF / FPS + 0.6, fade=0.6)
add(amb, h7, st('s7') + S7_HALF / FPS - 0.2, 0.3)

# ---------------- the forager flies in (beat 1) ----------------
fb = segment(flyby, 1.0, 1.45, fade=0.05)
fb *= env_lin(len(fb), [(0, 0.2), (0.7, 1.0), (1.15, 0.7), (1.45, 0.0)])
add(sfx, fb, 0.0, 0.9)

# ---------------- tactile foley: paper panels arriving, marker lines drawing ----------------
def paper_take(k, rate=1.0):
    t = segment(paper, k * 1.0, 0.8, fade=0.02)
    if rate != 1.0:
        t = np.interp(np.arange(0, len(t), rate), np.arange(len(t)), t)
    return t


def marker_line(start, dur):
    return segment(marker, start, dur, fade=0.05)


add(sfx, paper_take(0), st('s2') - JC, 0.55)              # beat 2: the hive frame arrives
add(sfx, marker_line(0.4, (S2_DRAW[1] - S2_DRAW[0]) / FPS), s2(S2_DRAW[0]) - JC, 0.45)      # beat 2: the figure-eight draws on (the hero)
add(sfx, marker_line(3.2, 0.75), s3a(8) - JC, 0.4)      # beat 3: sun + flower lines draw on
add(sfx, paper_take(1), s3a(40) - JC, 0.5)               # beat 3: the comb frame arrives
add(sfx, paper_take(2), s3b(4) - JC, 0.45)              # beat 3: short-waggle row
add(sfx, paper_take(3, 1.08), s3b(40) - JC, 0.45)       # beat 3: long-waggle row (pitched take)
add(sfx, marker_line(6.3, 0.7), st('s6') - JC, 0.4)       # beat 6: the scramble scribble

# ---------------- waggle buzz: plays exactly while a bee waggles ----------------
buzz_src = bandpass(segment(flyby, 2.0, 4.0, fade=0.0), 150, 2500)


def waggle_buzz(dur):
    s = np.resize(buzz_src, int(dur * SR))
    t = np.arange(len(s)) / SR
    pulse = 0.55 + 0.45 * np.sin(2 * np.pi * 13 * t) ** 2  # ~13 Hz waggle
    edge = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.05)
    return s * pulse * edge


# beat 2: the figure-eight bee's two waggle runs; beat 3: the angle run, then short vs long run
_d = (S2_DRAW[1] - S2_DRAW[0]) / FPS
for start, dur, g in [
    (s2(S2_DRAW[0]), 0.2 * _d, 0.55),                 # S2: first waggle run of the figure-eight
    (s2(S2_DRAW[0]) + 0.5 * _d, 0.2 * _d, 0.55),      # S2: second run
    (s3a(62), s3a(98) - s3a(62), 0.6),                # S3: the angled run on the comb
    (s3b(12), (30 - 12) / FPS, 0.6),                  # S3: short waggle
    (s3b(48), (82 - 48) / FPS, 0.6),                  # S3: long waggle
]:
    add(sfx, waggle_buzz(dur), start, g)

# ---------------- CONVEY: a wing-flick as each letter reaches a follower ----------------
for i in range(6):
    arrive = 13.0 + (4 + i * 5 + 15) / 30
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    rate = 1.0 + 0.08 * i
    grain = np.interp(np.arange(n) * rate, np.arange(len(buzz_src)), buzz_src)[:n]
    grain *= np.sin(np.pi * t / t[-1]) ** 2
    add(sfx, grain, st('s4') + (arrive - 13.0) + S4_LEAD / FPS - 0.02, 0.5)
add(sfx, pluck(mtof(76), 1.6, 0.4) * 0.5 + pluck(mtof(81), 1.6, 0.4) * 0.4, st('s4') + 2.17 + S4_LEAD / FPS, 0.35)  # word complete

# ---------------- DECIPHER: scrambled flutter that settles into a resolved chord ----------------
fl = np.resize(buzz_src, int(1.6 * SR)) * env_lin(int(1.6 * SR), [(0, 0), (0.2, 0.5), (1.3, 0.35), (1.6, 0)])
fl *= 0.6 + 0.4 * rng.standard_normal(len(fl)).clip(-1, 1)
add(sfx, onepole_lp(fl, 1800), st('s6') + 0.55, 0.35)
for k, m in enumerate([69, 73, 76]):
    add(sfx, pluck(mtof(m), 2.0, 0.35), st('s6') + 2.13 + k * 0.05, 0.3)

# ---------------- robot bee: a duller, motor-like buzz on its runs, then real bees fly out ----------------
robo_src = onepole_lp(np.interp(np.arange(0, len(buzz_src), 0.8), np.arange(len(buzz_src)), buzz_src), 1400)  # pitched down, darker
for k in range(int(S8_SPLIT / 64) + 1):
    for frac in (0.0, 0.5):  # the two straight runs of each 64-frame figure-eight lap
        t0 = st('s8') + (k * 64 + frac * 64) / FPS
        if t0 < st('s8') + S8_SPLIT / FPS - 0.3:
            seg = np.resize(robo_src, int(0.42 * SR))
            seg *= (0.6 + 0.4 * np.sin(2 * np.pi * 13 * np.arange(len(seg)) / SR) ** 2) * env_lin(len(seg), [(0, 0), (0.03, 1), (0.37, 1), (0.42, 0)])
            add(sfx, seg, t0, 0.45)
add(sfx, paper_take(2), st('s8') - JC, 0.5)  # the comb frame arrives
fo = segment(flyby, 3.0, 1.6, fade=0.1) * env_lin(int(1.6 * SR), [(0, 0.3), (0.5, 1.0), (1.2, 0.6), (1.6, 0)])
add(sfx, fo, st('s8') + (S8_SPLIT + 10) / FPS, 0.75)  # the real bees fly the danced route

# ---------------- music: OFF (Sharon didn't like the composed bed) ----------------
# Set MUSIC = True to bring the plucked/bowed bed back, or better: drop in a licensed documentary track
# (Musicbed / Artlist / Epidemic) or add music in the Instagram app at upload.
MUSIC = False  # the old composed bed stays off
# Licensed music bed: Epidemic Sound "Musical, Loop, Synth Sequence, Soft, Mellow" (via Higgsfield's Epidemic
# catalog). Warm, low synth sequence with nothing above ~1 kHz: no hats or ticks, and it sits under her voice.
music = load('music.mp3')
bed_m = segment(music, 0.0, DUR, fade=0.0)
t_m = np.arange(len(bed_m)) / SR
bed_m *= np.interp(t_m,
                   [0, 0.6, st('s5') - 0.4, st('s5') + 0.4, T['s5'][1] - 0.4, T['s5'][1] + 0.3, st('end'), DUR - 1.6, DUR],
                   [0, 1.0, 1.0, 0.45, 0.45, 1.0, 1.0, 1.15, 0])  # softer in the dark hive, lifts on the end card

# end card: the meadow carries on and fades out
add(amb, segment(meadow, 11, 2.9, fade=1.2), st('end') - 0.1, 0.4)

bpm = 92
beat = 60 / bpm
bar = 4 * beat
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
pattern = [0, 2, 1, 2, 0, 2, 1, 2]
nbars = int(DUR / bar) + 1 if MUSIC else 0
for b in range(nbars):
    t0 = b * bar
    if 16.8 <= t0 < 23.5:  # the dark hive: music drops out, the real hum carries it
        continue
    ch = prog[b % 4]
    add(mus, bowed([mtof(m - 12) for m in ch], bar + 0.8), t0, 0.22)
    if b >= 1:
        for k, idx in enumerate(pattern):
            at = t0 + k * beat / 2
            if 16.8 <= at < 23.5:
                continue
            add(mus, pluck(mtof(ch[idx] + 12), 0.9, 0.55, 0.994), at, 0.13)
# end card: one warm resolving chord instead of a chime
for k, m in enumerate([57, 64, 69, 72] if MUSIC else []):
    add(mus, pluck(mtof(m), 2.6, 0.4, 0.997), 32.45 + k * 0.06, 0.22)
t_all = np.arange(N) / SR
mus *= np.clip((DUR - t_all) / 1.5, 0, 1)
mus *= np.interp(t_all, [0, 16.4, 16.9, 23.4, 24.2, DUR], [1, 1, 0, 0, 1, 1])


# frequency pocket: dip the music 4.5 dB around 1-4 kHz so the voice can sit on top without fighting it
M = np.fft.rfft(mus)
fr = np.fft.rfftfreq(len(mus), 1 / SR)
M *= np.where((fr > 1000) & (fr < 4000), 10 ** (-4.5 / 20), 1.0)
mus = np.fft.irfft(M, len(mus))


def norm(x, peak):
    m = np.max(np.abs(x))
    return x / m * peak if m > 0 else x


mix = norm(amb, 0.2) + norm(sfx, 0.24) + norm(bed_m, 0.2) + (norm(mus, 0.17) if MUSIC else 0)
mix = np.tanh(mix * 1.2) / 1.2
st = np.stack([mix, mix], 1)
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
with wave.open(os.path.join(ROOT, 'public', 'audio', 'bed_sfx.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', DUR)
