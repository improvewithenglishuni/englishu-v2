# SMALLPOX Reel (with Sharon's voiceover)

Composition: `SmallpoxReelVO`, 75.4 s (72.7 s story + 2.7 s end card), 1080×1920, 30 fps.

## Voiceover

- Source: `New_Recording_14.m4a` (207 s, not committed). Takes chosen by transcript: always the
  last complete take of each line; stutters and restarts removed. Take list: `vo-takes.json`.
- Built with `scripts/assemble-vo.py` (cuts only in gaps, pauses capped at 0.4 s, gaps filled with
  her room tone, per-line leveling, light cleanup, atempo 1.05) → `public/reels/smallpox/vo.wav`.
- "eradicate" got the gentle emphasis (three slices at 0.96 / 0.92 / 0.88, +2 dB).
- Subtitles follow what she actually said (ivrit-ai whisper-large-v3-turbo transcript).

## Soundtrack

`python3 -I scripts/smallpox-audio.py public/reels/smallpox` builds the original synthesized music bed
(92 BPM, Am–F–C–G), the sparse SFX from `public/reels/smallpox/sfx-cues.json` (max two whooshes,
enforced), and `mix.wav` (music ducked under the voice, loudnorm −14 LUFS). Run it before rendering.

## Render

`npx remotion render SmallpoxReelVO out/smallpox-reel-vo.mp4`
