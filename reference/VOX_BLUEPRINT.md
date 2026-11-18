# Vox-style Reel blueprint (self-contained)

Everything needed to make a new EnglishU Reel in this style. No past video is required as a reference:
the rules below ARE the reference. (The look was distilled from Vox's own explainers on their
motion-graphics method and from the first approved Reel; if a rule here and a memory of an old video
disagree, this file wins.)

## 1. The look in six rules
1. **One locked world per Reel.** One light plate + at most one dark plate (`tools/make_plate.py --palette <name>`). Scenes change only the layers on top. A slow camera push (1.00 -> 1.06) runs over the whole film.
2. **Three layers per scene.** Back: the plate plus a big torn colour card (`ColorBlock`). Middle: photo cutouts (`Cutout`), black-and-white halftone with a white paper border and a colour block peeking out behind, like a marker offset. Front: big type (`BigNumber`, `KeyWord`) and torn cream labels (`PaperLabel`).
3. **Photos first.** Real archive photos, engravings, paintings and cartoons carry the story; code-drawn shapes are only the fallback. Every beat that names a person, object, place or document shows that thing.
4. **Palette = topic world, not brand.** Newsprint default: warm newsprint `#E8DDC6`, ink `#17140F`, cream `#F7F2E4`, ONE spot colour (mustard `#F2B632`) for colour cards, ONE accent (vermilion `#E5412D`) for the key word half, strike lines and the payoff label. Brand navy/red only on the logo and end card.
5. **Decoration must be topic-relevant.** No ice crystals, hexagons, clouds, plane shapes or other motifs unless the topic IS that thing (ice crystals are for contrails only). When unsure, use more photo, not more ornament.
6. **Something new every 1.5-4 s.** Stagger entrances 4-6 frames, rotate pop-ins a few degrees, wipe between worlds with `TornWipe`.

## 2. Script to scene table (write this first)
| Beat | Seconds | Narration line | Visual (photo + card + type) | Entrance |
Rules: <= 90 Hebrew words, <= 8 beats, ONE surprising fact, hook challenges an assumption in the first 2 s, the English sentence with the target word lands about one third in, the Hebrew translation appears on screen only, reflective callback at the end. Total including the 2.7 s end card <= 35 s (story <= 32.2 s).

## 3. Photo pipeline (the part that needs care)
1. Pick public-domain images (NASA, CDC, Wikimedia Commons PD, Library of Congress). Record source and licence in `tools/sources/SOURCES.md`.
2. If the shell cannot reach the site (the sandbox proxy allows only GitHub, npm and PyPI), download inside the Higgsfield sandbox (`sandbox_exec`, free, open internet; use sleeps because Wikimedia answers 429), shrink to small grayscale JPEGs (long side 160-240 px, JPEG q40, about 4-11 KB), print them as base64 lines with a per-line checksum (sum of bytes mod 256, two hex chars), and rebuild them with `tools/sources/chk.py` (verifies every line). This is only a file courier: no Higgsfield credits, no generation.
3. `python tools/make_photo_cutout.py tools/sources/x.jpg --width 760 --backdrop "#F2B632" --out public/assets/cutouts/<reel>/x.png`. Add `--mask mask.jpg` for object cutouts (white = keep).
4. Low-resolution sources are fine: the 6.5 px halftone screen hides the upscale.

## 4. Components (src/kit)
`World/WorldLayer/TornWipe`, `ColorBlock` (tone spot|accent|ink|paper|pale), `Cutout`, `BigNumber`, `KeyWord` (split/scatter), `PaperLabel` (strike), `Swoosh` (once), `Arrows`, `Subtitles` (Hebrew, safe area), `EndCard`. Place content above y = 1480 (subtitles live at about 1500-1600; right 130 px stays clear).

## 5. New topic checklist
1. Duplicate `src/kit/themes/newsprint.json` only if the topic needs another world; otherwise reuse it.
2. Collect 3-6 photos, make cutouts, write the scene table, render stills of every beat (`remotion still --scale=0.4`), fix collisions, then render (`REMOTION_LOCAL_FONTS=1 npx remotion render ... --concurrency=1`).
3. QA gate: (a) full-bleed layered paper with texture in every frame, (b) one world, newsprint palette plus spot and accent, (c) brand colours absent from the body, (d) every photo is a halftone cutout with white border and shadow, (e) a new element every 1.5-4 s, (f) <= 35 s including the end card, (g) nothing under y 1480 except subtitles, (h) no ornament unrelated to the topic.
4. Sound is about half the quality: one soft paper sound per card or cutout entrance, at most two whooshes, a quiet original bed. Her voice is never generated.
