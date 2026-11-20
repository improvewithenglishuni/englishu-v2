# Sea otters holding paws (Reel 4: DRIFT, BOND)

Remotion rebuild of mock-up v2 in the Vox mixed-media look (real photos and footage + scribble animation, ink black / field-guide grey, Vox yellow accent, Rubik 900 + Playfair italic / Frank Ruhl Libre).

```bash
npm install
npx remotion studio          # edit and preview
npx remotion render OtterReel out/otter-reel.mp4 --concurrency=4
```

- Scenes and timings: `src/OtterReel.tsx` (`LINES` = subtitles/recording script, `SCENES` = beat timings, taken from mock-up v2; retime both to the voiceover).
- Shared kit (palette, fonts, grain, hand-drawn strokes, scribble otter): `src/kit.tsx`.
- Plates and the archival crop: `python3 tools/prep.py`.
- Voiceover: not recorded yet. Add `<Audio src={staticFile('vo.wav')} />` in `OtterReel` and retime.
