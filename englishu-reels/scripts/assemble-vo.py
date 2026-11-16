"""Assemble a clean voiceover from chosen takes in one raw recording.

EnglishU recipe: cut only in gaps (energy minima), cap long internal pauses,
fill every gap with the speaker's own room tone, level each line, light cleanup.

usage: python3 -I assemble-vo.py raw.wav takes.json out.wav
takes.json: {"room": [start, end], "lines": [{"id": "l1", "from": s, "to": e, "gap_after": 0.35}, ...]}
`from`/`to` must lie in silence around the take; edges are refined to the speech.
"""
import json
import subprocess
import sys

import numpy as np

SR = 48000
WIN = int(0.01 * SR)  # 10 ms energy frames
PAUSE_CAP = 0.40
PAD_IN, PAD_OUT = 0.06, 0.14
XF = int(0.015 * SR)  # 15 ms crossfades
TARGET_RMS_DB = -33.0
MAX_GAIN_DB = 6.0


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).copy()


def frame_db(x):
    n = len(x) // WIN
    fr = x[: n * WIN].reshape(n, WIN)
    rms = np.sqrt(np.mean(fr ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    # 30 ms moving average smooths the speech mask
    return np.convolve(db, np.ones(3) / 3, mode="same")


def room_tone(raw, a, b, n):
    tone = raw[int(a * SR): int(b * SR)]
    out = np.zeros(n, dtype=np.float32)
    pos = 0
    fade = np.linspace(0, 1, XF, dtype=np.float32)
    while pos < n:
        seg = tone.copy()
        if pos > 0:
            seg[:XF] *= fade
            out[pos - XF: pos] *= fade[::-1]
            pos -= XF
        take = min(len(seg), n - pos)
        out[pos: pos + take] += seg[:take]
        pos += take
    return out


def join(a, b):
    if len(a) < XF or len(b) < XF:
        return np.concatenate([a, b])
    f = np.linspace(0, 1, XF, dtype=np.float32)
    mid = a[-XF:] * (1 - f) + b[:XF] * f
    return np.concatenate([a[:-XF], mid, b[XF:]])


def main(raw_path, takes_path, out_path):
    raw = load(raw_path)
    cfg = json.load(open(takes_path))
    ra, rb = cfg["room"]
    noise_db = float(np.median(frame_db(raw[int(ra * SR): int(rb * SR)])))
    thr = noise_db + 10  # speech threshold above the room's noise floor
    print(f"room noise {noise_db:.1f} dB, speech threshold {thr:.1f} dB")

    out = room_tone(raw, ra, rb, int(0.25 * SR))
    timeline = []
    for line in cfg["lines"]:
        a, b = int(line["from"] * SR), int(line["to"] * SR)
        seg = raw[a:b]
        db = frame_db(seg)
        voiced = np.where(db > thr)[0]
        s = max(0, voiced[0] - int(PAD_IN * 100))
        e = min(len(db), voiced[-1] + int(PAD_OUT * 100))
        # cap long internal pauses: rebuild from voiced runs
        speech = db[s:e] > thr
        # find silent runs longer than the cap
        runs, i = [], 0
        while i < len(speech):
            if not speech[i]:
                j = i
                while j < len(speech) and not speech[j]:
                    j += 1
                if (j - i) * 0.01 > PAUSE_CAP:
                    runs.append((i, j))
                i = j
            else:
                i += 1
        keep, cur = [], s
        for (ri, rj) in runs:
            half = int(PAUSE_CAP * 100 / 2)
            keep.append((cur, s + ri + half))
            cur = s + rj - half
        keep.append((cur, e))
        clip = np.zeros(0, dtype=np.float32)
        for (ka, kb) in keep:
            part = seg[ka * WIN: kb * WIN]
            clip = part if len(clip) == 0 else join(clip, part)
        # level the line
        cdb = frame_db(clip)
        loud = cdb[cdb > thr]
        rms_db = 20 * np.log10(np.sqrt(np.mean(np.square(10 ** (loud / 20)))))
        gain = min(MAX_GAIN_DB, TARGET_RMS_DB - rms_db)
        clip = clip * (10 ** (gain / 20))
        start = len(out) / SR
        out = join(out, clip)
        timeline.append({"id": line["id"], "start": round(start, 3), "end": round(len(out) / SR, 3),
                         "gain_db": round(gain, 1), "pauses_capped": len(runs)})
        gap = room_tone(raw, ra, rb, int(line.get("gap_after", 0.35) * SR)) * (10 ** (gain / 20))
        out = join(out, gap)
    tmp = out_path + ".pre.f32"
    out.astype(np.float32).tofile(tmp)
    chain = ("highpass=f=85,afftdn=nr=6:nf=-72,lowpass=f=14000,atempo=1.05,deesser=i=0.4,"
             "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=9")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                    "-af", chain, "-ar", str(SR), out_path], check=True)
    for t in timeline:  # times after the 1.05 tempo change
        t["start"] = round(t["start"] / 1.05, 3)
        t["end"] = round(t["end"] / 1.05, 3)
    json.dump(timeline, open(out_path + ".timeline.json", "w"), indent=1)
    for t in timeline:
        print(t)


if __name__ == "__main__":
    main(*sys.argv[1:4])
