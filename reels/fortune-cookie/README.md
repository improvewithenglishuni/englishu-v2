# Fortune cookies Reel (ATTRIBUTE, MISCONCEPTION)

Remotion rebuild of `fortune-cookie-mockup-v1` (34.5 s, 10 beats) with real photos and footage, sound and the end card. 37.2 s total.

```bash
npm install
npx remotion studio                                    # preview / nudge
npx remotion render FortuneReel out/fortune-cookie-reel.mp4 --concurrency=3
node tools/stills.mjs out/stills 70 250 520            # quick stills (half size)
```

- `src/FortuneReel.tsx`: `SCENES` (beat timings from the mock-up), `LINES` (recording script = subtitles), `SFX` (sound cues), one component per beat, end card.
- `src/kit.tsx`: Vox palette, plates, grain, sticker, torn label, subtitle, key word, arcs. `src/maps.tsx`: China and Pacific maps (Natural Earth).
- `tools/plates.py`: the light/dark paper plates. `tools/magazine.py`: magazine-cutout cookies (run after prep). `tools/prep.py`: cutouts (rembg), torn clippings, 9:16 tea-garden clip, sound trims. Source downloads live in `sources/` (git-ignored; list in CREDITS.md).
- Voiceover: not recorded yet. Put Sharon's take in `public/vo.wav`, render with `--props='{"voiceover":"vo.wav"}'`, then retime `SCENES`, `LINES` and `SFX` to it.
