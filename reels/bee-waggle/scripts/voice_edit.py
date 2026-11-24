"""Build the clean, continuous voiceover from Sharon's recordings -> vo/clean/voice.wav + vo/clean/pieces.json

Recording: vo/rec27.wav ("New Recording 27"). Only complete, final takes are used (see LINES).

Edit rules (englishu-reel pipeline):
  * cut only in the gaps, at the quietest 10 ms point, with 15 ms crossfades; never inside a word
  * pauses inside a line are capped (comma ~0.3 s); gaps between lines are set per line below
  * gaps are filled with her own room tone (never digital silence) so edits are inaudible; breaths in
    the long gaps go away with the trimmed silence
  * each line is levelled to the same loudness (gain limited) before the shared cleanup chain
  * cleanup is light on purpose (no heavy denoise: it makes the voice warble); a 2-pole 100 Hz high-pass removes air
    puffs / plosive thumps; gentle compression keeps her intonation natural
"""
import json
import os
import subprocess
import wave

import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
VO = os.path.join(ROOT, 'vo')
os.makedirs(os.path.join(VO, 'clean'), exist_ok=True)


def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(VO, name), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


rec = {'rec27': load('rec27.wav')}

# Current read: "New Recording 27" (complete, final takes only; restarts, "נו." and a stray "ואנחנו" are cut).
# (Earlier read: recordings 24 + 25; see git history.)
# (id, recording, start, end, gap AFTER this line in seconds, text)
LINES = [
    ('l1', 'rec27', 0.05, 6.36, 0.30, 'דבורה חוזרת לכוורת שלה ומתחילה לרקוד, אבל זה לא ריקוד של שמחה.'),
    ('l2', 'rec27', 6.38, 8.75, 0.50, 'זו כתובת.'),
    ('l3', 'rec27', 23.05, 29.38, 0.30, 'הזווית שלה מראה לה את הכיוון ביחס לשמש, וככל שהנענוע ארוך יותר, האוכל רחוק יותר.'),
    ('l3b', 'rec27', 29.52, 30.42, 0.22, 'כלומר,'),
    ('l4', 'rec27', 30.48, 34.12, 0.55, 'Bees convey precise directions through a dance.'),
    ('l5', 'rec27', 42.88, 46.48, 0.35, 'ובחושך מוחלט, אז איך שאר הדבורים מבינות?'),
    ('l6', 'rec27', 46.50, 48.92, 0.55, 'הן קוראות את הריקוד עם המחושים.'),
    ('l7', 'rec27', 50.12, 53.78, 0.60, 'Scientists worked for years to decipher this dance.'),
    ('l8', 'rec27', 58.48, 63.98, 0.0, 'בקיצור, זה הוויז של הדבורים, בלי אפליקציה ובלי צורך בקליטה.'),
]
MAX_INNER_PAUSE = 0.32  # cap for pauses inside a line
XF = int(0.015 * SR)  # 15 ms crossfades
HOP = int(0.01 * SR)


def frame_db(x):
    n = len(x) // HOP
    return 20 * np.log10(np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(1)) + 1e-9)


# room tone: the quietest 0.4 s of the recording, tiled with crossfades
d24 = frame_db(rec['rec27'])
win = 40
best = min(range(len(d24) - win), key=lambda i: d24[i:i + win].mean())
tone_src = rec['rec27'][best * HOP:(best + win) * HOP]


def room_tone(n):
    out = np.zeros(n, np.float32)
    seg = len(tone_src)
    pos = 0
    while pos < n:
        piece = tone_src.copy()
        if pos > 0:
            piece[:XF] *= np.linspace(0, 1, XF)
        piece[-XF:] *= np.linspace(1, 0, XF)
        end = min(n, pos + seg)
        out[pos:end] += piece[:end - pos]
        pos += seg - XF
    return out


def quietest(x, a, b):
    """Sample index of the quietest 10 ms frame between sample a and b."""
    a, b = max(0, int(a)), int(b)
    if b - a < HOP * 2:
        return (a + b) // 2
    seg = x[a:b]
    d = frame_db(seg)
    return a + int(np.argmin(d)) * HOP + HOP // 2


def speech_spans(x):
    """Speech spans (sample indices) inside a line, using a level relative to the line's own peak."""
    d = frame_db(x)
    thr = d.max() - 38
    act = d > thr
    spans = []
    s = None
    for i, a in enumerate(act):
        if a and s is None:
            s = i
        if (not a or i == len(act) - 1) and s is not None:
            spans.append([s, i + 1])
            s = None
    merged = []
    for a, b in spans:
        if merged and a - merged[-1][1] < 15:  # gaps < 150 ms are part of the flow
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return [(a * HOP, b * HOP) for a, b in merged if b - a >= 5]


def tighten(x):
    """Cap long pauses inside a line, cutting at energy minima and filling with room tone."""
    spans = speech_spans(x)
    if not spans:
        return x
    pad = int(0.06 * SR)
    out = [x[:spans[0][1]]]
    for (a0, b0), (a1, b1) in zip(spans, spans[1:]):
        gap = (a1 - b0) / SR
        if gap <= MAX_INNER_PAUSE:
            out.append(x[b0:b1])
            continue
        cut_a = quietest(x, b0, min(b0 + pad * 2, a1))
        cut_b = quietest(x, max(a1 - pad * 2, cut_a), a1)
        fill_len = int(MAX_INNER_PAUSE * SR) - (cut_a - b0) - (a1 - cut_b)
        out.append(x[b0:cut_a])
        out.append(room_tone(max(XF * 2, fill_len)))
        out.append(x[cut_b:b1])
    out.append(x[spans[-1][1]:])
    return join(out)


def join(parts):
    """Concatenate with short crossfades."""
    res = parts[0].astype(np.float32)
    for p in parts[1:]:
        p = p.astype(np.float32)
        if len(res) > XF and len(p) > XF:
            fade = np.linspace(0, 1, XF)
            res[-XF:] = res[-XF:] * (1 - fade) + p[:XF] * fade
            res = np.concatenate([res, p[XF:]])
        else:
            res = np.concatenate([res, p])
    return res


def level(x, target_db=-23.0, max_gain_db=6.0):
    d = frame_db(x)
    active = d[d > d.max() - 30]
    rms_db = 10 * np.log10(np.mean(10 ** (active / 10))) if len(active) else -60
    g = np.clip(target_db - rms_db, -12, max_gain_db)
    return x * (10 ** (g / 20))


out_parts = [room_tone(int(0.12 * SR))]
pieces = []
t = 0.12
for lid, r, a, b, gap_after, text in LINES:
    x = rec[r]
    a_i = quietest(x, int((a - 0.08) * SR), int((a + 0.04) * SR))
    b_i = quietest(x, int((b - 0.04) * SR), int((b + 0.10) * SR))
    line = level(tighten(x[a_i:b_i]))
    line[:XF] *= np.linspace(0, 1, XF)
    line[-XF:] *= np.linspace(1, 0, XF)
    pieces.append({'id': lid, 'text': text, 'start': round(t, 3), 'end': round(t + len(line) / SR, 3)})
    out_parts.append(line)
    t += len(line) / SR
    if gap_after:
        out_parts.append(room_tone(int(gap_after * SR)))
        t += gap_after
out_parts.append(room_tone(int(0.3 * SR)))
raw_mix = np.concatenate(out_parts)

tmp = os.path.join(VO, 'clean', 'voice_raw.wav')
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(raw_mix, -1, 1) * 32767).astype('<i2').tobytes())

# cleanup chain: air puffs/plosives (100 Hz HP + dynamic low cut), light denoise, de-ess, gentle compression,
# a touch of presence, broadcast loudness. Tempo 1.04 (pitch kept) keeps the read lively without rushing.
chain = ','.join([
    'highpass=f=100:poles=2',
    'afftdn=nr=6:nf=-75',
    'lowpass=f=14500',
    'atempo=1.04',
    'deesser=i=0.35',
    'acompressor=threshold=-22dB:ratio=2.2:attack=10:release=150:makeup=1',
    'equalizer=f=3200:t=q:w=1.0:g=1.5',
    'loudnorm=I=-16:TP=-1.5:LRA=11',
])
final = os.path.join(VO, 'clean', 'voice.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', chain, '-ar', str(SR), '-ac', '1', final], check=True)
TEMPO = 1.04
for p in pieces:
    p['start'] = round(p['start'] / TEMPO, 3)
    p['end'] = round(p['end'] / TEMPO, 3)
json.dump(pieces, open(os.path.join(VO, 'clean', 'pieces.json'), 'w'), ensure_ascii=False, indent=1)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final], capture_output=True, text=True).stdout)
print(f'voice.wav {dur:.2f}s')
for p in pieces:
    print(f"{p['start']:6.2f}-{p['end']:6.2f}  {p['text']}")
