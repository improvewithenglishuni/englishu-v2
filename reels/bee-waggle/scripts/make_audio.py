"""Original synthesized music bed + sparse SFX for the bee Reel (no samples, no copyright).
Re-run after re-timing: python3 scripts/make_audio.py  -> public/audio/bed_sfx.wav
The voiceover will be added on its own track once recorded."""
import numpy as np, wave, os

SR = 48000
DUR = 35.1
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.3):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e

def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]

def note(f, dur, r=0.35, harm=(1, .5, .25)):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    return s * env(n, 0.004, r)

def pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    return s * a / len(freqs)

mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
bed = np.zeros(N)
bpm = 92; beat = 60 / bpm; bar = 4 * beat
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
arp = [0, 1, 2, 1, 2, 0, 1, 2]
nbars = int(DUR / bar) + 1
for b in range(nbars):
    ch = chords[b % 4]
    add(bed, 0.32 * pad([mtof(m - 12) for m in ch], bar + 0.6), b * bar)
    if b >= 1:
        for k in range(8):
            m = ch[arp[k]] + 12
            add(bed, 0.16 * note(mtof(m), 0.6, 0.22), b * bar + k * beat / 2)
    if b >= 2:
        for k in (0, 2):
            n = int(0.25 * SR); tt = np.arange(n) / SR
            kick = np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12)
            add(bed, 0.35 * kick, b * bar + k * beat)
# fade out over the last 2 s
fo = np.clip((DUR - t_all) / 2.0, 0, 1)
bed *= fo
bed = bed / np.max(np.abs(bed)) * 0.16

sfx = np.zeros(N)
def paper_pop():
    n = int(0.09 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 60)
    s = np.convolve(s, np.ones(6) / 6, 'same')
    return 0.6 * s + 0.5 * np.sin(2 * np.pi * 620 * t) * np.exp(-t * 70)
def thump_sparkle():
    n = int(0.9 * SR); t = np.arange(n) / SR
    th = np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 20)) * t) * np.exp(-t * 7)
    sp = sum(np.sin(2 * np.pi * f * t) * np.exp(-(t - d).clip(0) * 9) * (t > d) for f, d in [(1760, .06), (2349, .12), (2637, .18), (3520, .24)])
    return 0.8 * th + 0.12 * sp
def whoosh(d=0.7):
    n = int(d * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n)
    s = np.convolve(s, np.ones(40) / 40, 'same')
    return 0.9 * s * np.sin(np.pi * t / d) ** 2
def stamp():
    n = int(0.5 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (90 + 50 * np.exp(-t * 40)) * t) * np.exp(-t * 14)
    slap = rng.standard_normal(n) * np.exp(-t * 45)
    return 0.9 * body + 0.45 * slap
def chime():
    n = int(1.6 * SR); t = np.arange(n) / SR
    return 0.25 * sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) for f in (880, 1318.5, 1760))

for at in [1.3, 4.55, 6.02, 9.65, 10.98, 15.3, 20.75, 26.55]:
    add(sfx, paper_pop(), at)
add(sfx, thump_sparkle(), 15.15)   # CONVEY completes
add(sfx, thump_sparkle(), 26.15)   # DECIPHER resolves
add(sfx, whoosh(0.8), 16.65)       # whoosh 1 of 2: into the dark hive
add(sfx, whoosh(0.6), 32.3)        # whoosh 2 of 2: end card page
add(sfx, chime(), 33.68)           # CTA lands
sfx = sfx / np.max(np.abs(sfx)) * 0.32

mix = bed + sfx
mix = np.tanh(mix * 1.1) / 1.1
st = np.stack([mix, mix], 1)
os.makedirs('public/audio', exist_ok=True)
with wave.open('public/audio/bed_sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', DUR)
