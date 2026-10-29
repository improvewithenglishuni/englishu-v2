# Voiceover, SFX and music (free, local)

## Voiceover options

| Option | Cost | Quality for Hebrew + English words | Use for |
|---|---|---|---|
| **A. Record your own voice** (default) | free | best: real teacher voice, correct English pronunciation | final Reels |
| B. Free local TTS: Phonikud + Piper Hebrew voices | free, runs offline | robotic-ish; English words inside Hebrew are mispronounced | timing drafts only |
| C. Paid TTS (ElevenLabs etc.) | subscription | good | only if the user explicitly opts in |

Option B's voices are published under a **non-commercial** license (check
the model card before any public or business use). Treat B as a scratch
track for timing, then replace it with a recording.

## Recording workflow (option A)

1. Hand the user a **recording script**: one numbered line per scene, exactly
   the `voiceover.text`, with the English words marked.
2. Record **one file per scene** (phone voice memo is fine). Quiet room,
   phone 15–20 cm from the mouth, same place for every take, ~1 s of silence
   before speaking.
3. Save as `public/reels/<slug>/vo/s01.m4a`, `s02.m4a`, … (wav/mp3/m4a all
   work).
4. Trim leading/trailing silence so timing is tight (`remotion-markup/
   silence-detection.md`), and normalize loudness so scenes match:

   ```bash
   ffmpeg -i in.m4a -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 out.wav
   ```

5. Set `voiceover.file` for each scene. `calculateReelMetadata` measures each
   file and refits every scene: `offset (0.25 s) + voice length + tail
   (0.35 s)`. Total Reel length updates by itself.

## Setting cues to the voice (precise timing)

A cue is seconds from scene start. A word spoken at time *t* inside the voice
file has cue = `t + offset` (offset defaults to 0.25).

- **By ear (simplest):** in Studio, open the Reel, scrub to where the word is
  heard, read the frame number; cue = `(frame − scene.from) / 30`. The scene's
  start frame is visible on the timeline (`Scenes` track).
- **By waveform:** open the file in any audio editor (Audacity is free), read
  the word's start time, add the offset.
- **Automatic (optional):** transcribe with Whisper locally for word
  timestamps (`remotion-captions/transcribe-captions.md`). Hebrew word timing
  from Whisper is approximate — check the key words by ear.

Only the key beats need exact cues (target words, impacts). Everything else
can be eyeballed.

## Sound effects

Local files in `public/sfx/` (generated with ffmpeg, peak-normalized to −3 dB,
safe to use): `whoosh.wav` (whips), `pop.wav` (cutout pops), `paper.wav`
(paper rustle/rip), `tick.wav` (bar steps, list items), `stamp.wav` (slams,
stamps). Normalize any new SFX the same way, or quiet sounds vanish:
`ffmpeg -i in.wav -af "volume=<−3 minus measured max_volume>dB" out.wav`.

Richer free options:
- `node scripts/fetch-sfx.mjs` downloads Remotion's free SFX
  (whoosh, whip, page-turn, shutter-old, switch, mouse-click, ding,
  record-scratch) into `public/sfx/remotion/`.
- Pixabay sound effects or freesound.org (check each file's license; prefer
  CC0) → save into `public/sfx/`.

Rules: SFX volume 0.3–0.6; never put a loud SFX on top of a target word;
one SFX per impact; a whoosh at every scene boundary keeps the fake-oner
flowing.

## Music

- Default: none, or a quiet bed (`spec.music`, volume ≤ 0.12, loops).
- Free sources: YouTube Audio Library (download, check "attribution
  required"), Pixabay Music. Keep the license note in `SOURCES.md`.
- Alternative: render without music and add a track inside Instagram
  (trending audio helps reach). Keep the in-app music volume low under the
  narration.
