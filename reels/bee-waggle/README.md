# Bee waggle dance Reel (Remotion, all code)

Vertical 1080 x 1920, 30 fps, about 32.4 s of story plus a 2.7 s end card.
Every visual is drawn in code (React + SVG): no AI-generated images.

## Run it

```bash
npm install
npm run studio      # live preview in the browser
./scripts/fetch_media.sh   # download + cut the CC footage into public/media (needs Wikimedia access)
./scripts/render.sh        # -> out/bee-waggle-preview.mp4
python3 scripts/make_audio.py   # rebuild the music bed + SFX after re-timing
```

## World

- Outdoor beats (1 and 7): a bright sunny park (`src/components/park.tsx`): sky + sun glow, drifting clouds,
  layered hills with stipple edges, trees, a flowered meadow, swaying grass, a wooden hive box, with parallax.
- Explainer beats (2, 3, 4, 6): the attached white squiggle paper (`public/squiggle.jpg`) with faint hex corners
  and drifting pollen. Diagrams sit on a wooden hive frame (tan comb, white hex lines) and carry hand-lettered
  labels (Amatic SC for Hebrew, Patrick Hand SC for English).
- "Die-cut" moments use a white-rimmed magnifier lens that points at its source.
- Palette: paper white, sage `#D6DED7`, rust branch `#7E2A12`, ink `#2A1A0F`, and ONE accent, honey amber `#E9A23B`.
  The red stamp and pin are the only red. Brand navy/red appear only on the end card.
- One dark variant: the hive interior (beat 5).
- Fonts: Rubik (Hebrew + labels), Anton (CONVEY, DECIPHER, DECIPHERED).

## Beats (`src/theme.ts` -> `SCENES`, `SUBS`)

| # | Time | On screen | Scene file |
|---|---|---|---|
| 1 | 0-3 | Bee leaves the blossom, drops into a die-cut "bee on honeycomb" sticker, which starts to waggle | `S1Hook.tsx` |
| 2 | 3-6 | Figure-eight draws on in amber marker with a bee tracing it; location pin pops on the waggle run | `S2S3.tsx` |
| 3 | 6-13 | Sun / hive / flower angle mirrored on the vertical comb; then short vs long waggle (close / far) | `S2S3.tsx` |
| 4 | 13-17 | CONVEY letters travel the dance path from the dancer to the followers; gloss `convey = להעביר מסר` | `S4S5.tsx` |
| 5 | 17-24 | Full-frame hive (real footage slot), lights go out; die-cut antennae close-up with vibration arcs | `S4S5.tsx` |
| 6 | 24-28 | A scribble resolves letter by letter into DECIPHER; gloss `decipher = לפענח` | `S6S7End.tsx` |
| 7 | 28-32.4 | Opening bee returns; red DECIPHERED stamp slams over the figure-eight; pin pops | `S6S7End.tsx` |
| end | 32.4-35.1 | Brand end card | `S6S7End.tsx` |

## Real footage

`scripts/fetch_media.sh` downloads two CC-licensed clips from Wikimedia Commons and cuts them into
`public/media/` (not committed):

| File | Used in | Source |
|---|---|---|
| `hive.mp4` | beat 5, full frame | "Waggle Dance.webm", OakleyOrig, CC BY 2.0 |
| `comb.mp4` | magnifier lens, beats 1 and 7 | same clip, square crop |
| `dancer.mp4` | antennae moment, beat 5 | Su et al. 2008, PLoS ONE, CC BY 3.0 (red-dot dancer) |

Field recordings (`public/media/audio/`, committed): hive interior "Honeybee-hive.ogg" (CC0), bees among flowers
YLE archive 263673 (CC BY 3.0), "Bombus buzz.ogg" (public domain). See the header of `scripts/make_audio.py`
for how each sound is used.

Caption credit: "Waggle dance footage: OakleyOrig (CC BY 2.0); Su et al. 2008, PLoS ONE (CC BY 3.0). Bee sounds: YLE archive (CC BY 3.0). Via Wikimedia Commons".

## Voiceover

Timing is placeholder. After recording: transcribe, put the real phrase times in `SUBS`, move the scene
boundaries in `SCENES`, re-run `scripts/make_audio.py` (SFX times are listed there), and add the cleaned
voice as an `<Audio>` track in `src/BeeReel.tsx`.
