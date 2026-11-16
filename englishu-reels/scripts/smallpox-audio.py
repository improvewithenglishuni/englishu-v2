"""Build the SMALLPOX Reel soundtrack: original music bed + sparse SFX + voice, mixed per the EnglishU recipe.

usage: python3 -I smallpox-audio.py <public/reels/smallpox dir>
reads vo.wav and sfx-cues.json from that dir, writes music.wav, sfx.wav and mix.wav.
"""
import json
import os
import subprocess
import sys

import numpy as np

SR = 48000
rng = np.random.default_rng(7)
D = sys.argv[1]
cues = json.load(open(os.path.join(D, "sfx-cues.json")))
TOTAL = cues["total"]
N = int(TOTAL * SR)
t_all = np.arange(N) / SR


def env(n, a, r):
    e = np.ones(n)
    ai = max(1, int(a * SR))
    e[:ai] = np.linspace(0, 1, ai)
    e *= np.exp(-np.arange(n) / (r * SR)) if r else 1
    return e


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# ---------------------------------------------------------------- music bed
BPM = 92
beat = 60 / BPM
bar = 4 * beat
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
music = np.zeros(N)
nbars = int(np.ceil(TOTAL / bar))
for b in range(nbars):
    start = int(b * bar * SR)
    length = min(int(bar * SR), N - start)
    if length <= 0:
        break
    tt = np.arange(length) / SR
    ch = chords[b % 4]
    pad = sum(np.sin(2 * np.pi * note(m) * tt) + 0.35 * np.sin(2 * np.pi * note(m) * 2.003 * tt) for m in ch)
    pad *= np.minimum(1, tt / 0.35) * np.minimum(1, (bar - tt) / 0.35) * 0.06
    music[start:start + length] += pad
    # soft plucked arpeggio from bar 2
    if b >= 1:
        arp = ch + [ch[0] + 12]
        for k in range(8):
            ts = start + int(k * beat / 2 * SR)
            n_ = min(int(0.5 * SR), N - ts)
            if n_ <= 0:
                continue
            tk = np.arange(n_) / SR
            f = note(arp[k % 4] + 12)
            music[ts:ts + n_] += 0.05 * np.sin(2 * np.pi * f * tk) * np.exp(-tk / 0.12) * np.minimum(1, tk / 0.004)
    # quiet kick on beats 1 and 3, hats from bar 3
    for k in (0, 2):
        ts = start + int(k * beat * SR)
        n_ = min(int(0.3 * SR), N - ts)
        if n_ > 0:
            tk = np.arange(n_) / SR
            freq = 50 + 70 * np.exp(-tk / 0.04)
            music[ts:ts + n_] += 0.16 * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tk / 0.12)
    if b >= 2:
        for k in range(8):
            ts = start + int((k + 0.5) * beat / 2 * SR)
            n_ = min(int(0.04 * SR), N - ts)
            if n_ > 0:
                hn = rng.standard_normal(n_)
                hn = hn - np.convolve(hn, np.ones(8) / 8, mode="same")  # crude highpass
                music[ts:ts + n_] += 0.025 * hn * np.exp(-np.arange(n_) / (0.012 * SR))
fade = int(2.0 * SR)
music[-fade:] *= np.linspace(1, 0, fade)
music[: int(0.6 * SR)] *= np.linspace(0, 1, int(0.6 * SR))

# ---------------------------------------------------------------- sfx
def paper_pop():
    n = int(0.09 * SR)
    x = rng.standard_normal(n)
    x = x - np.convolve(x, np.ones(6) / 6, mode="same")
    body = np.sin(2 * np.pi * 180 * np.arange(n) / SR) * 0.6
    return (0.5 * x + body) * env(n, 0.002, 0.018)


def thump():
    n = int(0.45 * SR)
    tk = np.arange(n) / SR
    freq = 45 + 60 * np.exp(-tk / 0.05)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tk / 0.16)


def sparkle():
    n = int(0.7 * SR)
    out = np.zeros(n)
    for k in range(7):
        s = int(k * 0.045 * SR)
        m = n - s
        tk = np.arange(m) / SR
        f = rng.uniform(2600, 5200)
        out[s:] += np.sin(2 * np.pi * f * tk) * np.exp(-tk / 0.08) * 0.35
    return out


def chime():
    n = int(1.4 * SR)
    tk = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * tk) * np.exp(-tk / d) for f, a, d in
               ((880, 1, 0.6), (1320, 0.5, 0.4), (1760, 0.25, 0.3), (2637, 0.12, 0.2)))
    return tone * np.minimum(1, tk / 0.004)


def load_wav(name):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(D, "..", "..", name), "-ac", "1",
                          "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).astype(np.float64)


bank = {"pop": paper_pop(), "thump": thump(), "sparkle": sparkle(), "chime": chime(),
        "whoosh": load_wav("sfx/whoosh.wav") * 0.6, "tear": load_wav("sfx/paper.wav") * 0.8}
for k, v in bank.items():
    bank[k] = v / (np.max(np.abs(v)) + 1e-9)
sfx = np.zeros(N)
whooshes = 0
for c in cues["sfx"]:
    if c["kind"] == "whoosh":
        whooshes += 1
        assert whooshes <= 2, "EnglishU rule: at most two whooshes per Reel"
    s = bank[c["kind"]] * (10 ** (c.get("gain_db", 0) / 20))
    a = int(c["at"] * SR)
    m = min(len(s), N - a)
    sfx[a:a + m] += s[:m]


def write(name, x):
    path = os.path.join(D, name)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", path],
                   input=x.astype(np.float64).tobytes(), check=True)
    return path


mpath = write("music-raw.wav", music)
spath = write("sfx-raw.wav", sfx)
# normalize stems: music about -27 LUFS, sfx about -29 LUFS (measured on the active parts)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mpath, "-af", "loudnorm=I=-27:TP=-3:LRA=11", "-ar", str(SR),
                os.path.join(D, "music.wav")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", spath, "-af", "volume=-14dB", "-ar", str(SR),
                os.path.join(D, "sfx.wav")], check=True)
os.remove(mpath)
os.remove(spath)

# mix: voice keys a slow sidechain duck on the music, then everything is summed and normalized
fc = ("[0:a]aformat=channel_layouts=stereo,apad=whole_dur={T}[vo];"
      "[vo]asplit[vo1][vo2];"
      "[1:a]aformat=channel_layouts=stereo[mu];"
      "[mu][vo2]sidechaincompress=threshold=0.02:ratio=3:attack=80:release=1500:makeup=1[duck];"
      "[2:a]aformat=channel_layouts=stereo[fx];"
      "[vo1][duck][fx]amix=inputs=3:normalize=0:duration=longest,atrim=0:{T},loudnorm=I=-14:TP=-1.5:LRA=11[out]"
      ).format(T=TOTAL)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(D, "vo.wav"), "-i", os.path.join(D, "music.wav"),
                "-i", os.path.join(D, "sfx.wav"), "-filter_complex", fc, "-map", "[out]", "-ar", str(SR),
                os.path.join(D, "mix.wav")], check=True)
print("mix written", TOTAL, "s;", whooshes, "whooshes;", len(cues["sfx"]), "sfx")
