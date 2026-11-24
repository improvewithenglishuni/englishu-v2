"""Word-level transcription of the voiceover (faster-whisper). Usage: python3 scripts/transcribe.py file.wav [he|en]"""
import json
import subprocess
import sys

import numpy as np

from faster_whisper import WhisperModel

path = sys.argv[1]
lang = sys.argv[2] if len(sys.argv) > 2 else 'he'
model = WhisperModel('small', device='cpu', compute_type='int8')
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, _ = model.transcribe(audio, language=lang, word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    for w in s.words:
        out.append({'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)})
    print(f'[{s.start:6.2f}-{s.end:6.2f}] {s.text}')
json.dump(out, open(path.replace('.wav', f'.{lang}.words.json'), 'w'), ensure_ascii=False, indent=0)
