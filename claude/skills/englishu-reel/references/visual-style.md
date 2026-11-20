# Visual style

## Contents
- The cohesive-world rule
- Two ways to build scenes cheaply
- Master prompt (Higgsfield and ChatGPT)
- Palette and typography
- Labels, key-word graphics and subtitles
- Highlight devices
- The timeline-of-eras device
- Emphasising the target word on screen
- End card
- Avoid list

## The cohesive-world rule

Reel 1 (planes) looked like one designer made it: every frame was a full-bleed paper collage in the same world (crumpled sky-blue paper with halftone clouds, torn paper strips, dark navy paper for the science), subjects were cutouts integrated into the layers, the white contrail was literally a torn paper strip, and everything ran to the edges of the frame. Reel 2 (jeans) combined finished rectangular photos on flat cream paper, full-frame denim crops and a white grid, with lots of empty background, so it felt like separate pictures.

So, before generating anything:

1. **Choose a world** for the whole Reel: one background family and one palette. Examples: sky paper (planes), aged map paper (geography), denim and workwear paper (jeans), circuit-board paper (tech), parchment and engravings (history).
2. **Every shot fills the frame** with layered paper: a base paper or gradient, one or two torn-edge strips, the subject as a cutout with a thin white paper border and a soft shadow, small accents (stars, stamps, arrows, halftone dots), and paper grain over everything.
3. **Never place a finished rectangular photo on a blank background.** If a photo is needed, tear its edges, overlap it with other layers, and let paper texture fill the rest of the frame.
4. **Keep the palette limited** (3-4 colors from the world plus one accent) and reuse the same backgrounds across scenes so cuts feel continuous.
5. **Leave space** for text: bottom fifth and right edge simple (Instagram UI and subtitles), top 15% calm for a hook label, main subject centered.

## Two ways to build scenes cheaply

Credits: stills 2 each, video 3 per second. She often has only a handful left, and can also generate images in ChatGPT.

**A. Complete scenes (best look).** Generate each scene as a finished 9:16 collage with the style reference attached (and, for consistency, a previously approved scene attached too). Use stills for explanation shots (2 credits each) and short clips only where motion carries the story (the hook, the key transformation). Animate stills for free in the edit: slow push-in (1.0 to 1.07), pans, parallax between layers.

**B. Plates plus cutouts (best value).** Generate 1-2 empty "world plates" (background paper layers with no subject) and one **cutout sheet**: 8-10 separate objects on a plain light-grey background, evenly spaced, not touching, black-and-white photo style with a thin white border, one color pop. Cut the objects out in the sandbox (OpenCV GrabCut on each cell, keep the largest component, fill small holes, add a white border and shadow) and composite and animate them over the plates for free. This worked well for the end card and the era timeline.

A mix is fine: complete scenes for the hook and the key reveal, plates plus cutouts for the rest.

## Master prompt

Use this for Higgsfield (`nano_banana_pro` with the style reference as `image_references`) and for ChatGPT (attach 2-3 frames from the plane Reel and say "match this style exactly"). Fill the brackets.

```
Full-bleed 9:16 vertical editorial mixed-media paper collage, matching the attached
style reference exactly. WORLD: [e.g. crumpled sky-blue paper with halftone cloud
cutouts and torn white paper strips]. SUBJECT: [one subject] as an archival photo
cutout with a thin white paper border and soft paper shadow, centered. The collage
fills the entire frame edge to edge with layered torn paper, halftone dots and paper
grain; no blank margins and no rectangular photo on a plain background. Limited
palette: [navy, cream, muted blue, one orange or red accent]. Keep the bottom fifth
and the right edge simple; leave the top 15% calm for a title.
NEGATIVE: readable text, letters, numbers, logos, watermark, marker scribbles,
circles, arrows, photorealistic 3D render, famous real people, hands.
```

Variants to add after SUBJECT: "cross-section diagram with torn-paper arrows" (process), "split into two torn halves, dry on top and humid below" (comparison), "large empty navy area in the middle for a word" (vocabulary moment), "asset sheet of 8 separate objects on plain light grey, widely spaced" (cutout sheet).

For eras or comparisons, ask for **two wide images of four items each** instead of one sheet of eight (the first jeans sheet gave only 110 px per item; the wide version was about three times sharper). Higgsfield may suggest a "3D render" preset for these prompts: decline it (`declined_preset_id`), it would replace the collage look.

For a sequence of related stills (decades, versions of the same object), generate the first and attach it as a reference to the rest, saying "recreate with the exact same framing, change only the era".

## Palette and typography

| Use | Value |
|---|---|
| Navy | `#0A2370` (logo), `#152A3E` (plane Reel) |
| Red | `#B01F25` (logo), accent for key words and labels |
| Cream paper | `#F5F0E5` |
| Sky blue / orange | `#64A9D9` / `#E8A04C` (plane world only) |

Do not use yellow: it clashes with the logo's red and navy and makes the Reel look like a Vox imitation instead of EnglishU.

Fonts (download from `github.com/google/fonts/raw/main/ofl/...` in the sandbox): **Rubik** (labels, subtitles, CTA), **Frank Ruhl Libre** (serif headlines and Hebrew key words), **Anton** (big English key words such as CONTRAIL). Hebrew needs `dir=rtl` in the HTML; English lines inside a Hebrew video need `dir=ltr`.

## Labels, key-word graphics and subtitles

- **Paper label**: cream background, navy text, Rubik 900, padding 14-18 x 34-40 px, hard shadow `6px 8px 0 rgba(0,0,0,.35)`, rotated -4 to +4 degrees, pops in from above over 0.15-0.2 s. Navy label with cream text for translations; red label with cream text for the question or the key word (למה?, RETAINED).
- **Big English key word**: Anton or Frank Ruhl Libre 900, 150-190 px, cream with a 5-6 px navy stroke and a soft offset shadow. The target word gets the red or orange accent. Words can split to show meaning: CONTRAIL breaks into CON and TRAIL (TRAIL in the accent color), DISPERSE letters drift apart in sync with the visual.
- Translations, years and similar labels sit **clear of the subject** (a translation label once covered the jeans; keep 60+ px of separation).
- **Subtitles** (Hebrew, burned in): Rubik 800, 66-68 px, white with a black stroke, centered in a box `left 90, width 900, top 1300, height 200`, bottom-aligned (so one or two lines sit above the bottom fifth). Split into phrases that follow what she actually said, not the original script. The English target sentence is displayed in LTR and stays on screen until the next slide.

## Highlight devices

Use the highlight to point at a detail, at most twice per Reel, never the red marker circle.

- **Spotlight vignette** (good for the hook). A navy-black vignette (`rgb 8,14,34`, alpha up to 0.66, 150 px feather) over the whole frame with a circular hole on the detail. The hole shrinks from about 950 px to 250 px radius over about 14 frames with ease-out, holds with a tiny pulse, then the dark fades over the last 5 frames. Render as an RGBA PNG sequence and overlay it.
- **Magnifying glass** (good for the "why?" question). A drawn sprite (dark ring about 40 px thick with a brass inner line, handle toward the lower right, white paper border, soft shadow, glass highlight arc). It enlarges the area under the lens about 1.3x, slides in from the lower right with ease-out over about 13 frames, then drifts slightly. Build frames in Python/PIL and encode them to a clip.
- Other options when needed: paper cutout lift (the detail gets a torn border and a shadow), pulsing stitch glow. Pick the position by checking a frame grid first.

## The timeline-of-eras device

To show something persisting through time (the RETAIN moment): a 2 x 4 grid of the same object across eras, each cut out with a white sticker border and shadow, with a paper year tag under it (the "today" tag in red). Lower the grid so the translation label above does not overlap it (first row starts around y = 600 for 260 px-high items). Pairs pop in 0.17-0.22 s apart. After a couple of beats, each wiggles in turn (about 0.26 s apart): a damped rotation of about +-7.5 degrees at 9 Hz over 0.3 s, a 5 px hop, and a soft rising note per wiggle. Keep the full grid on screen for at least a second before cutting on.

## Emphasising the target word on screen

When she says the target word: the red label slams in from large (scale 1.9 to 0.95 to 1.05 to 1.0 with a slight rotation) with a 3-frame white flash, a soft low thump and a sparkle; show only the first item of the timeline while the word is spoken; after her small pause the rest of the story appears and the translation label slides in under the word. Audio emphasis recipe is in `pipeline.md`.

## End card

Fixed brand card, about 2.7 s at the end of every Reel, animated (page slides up, logo sticker drops in with tape, red circle grows behind the bust, cutouts pop in one by one, navy bar wipes in for the second headline, tags pop, CTA clipping lands with a soft chime, slow push-in).

- Content: "עוד עובדה מעניינת." (serif, large), then "עוד מילה באנגלית." in a navy bar with cream text, then a torn clipping "לעוד כאלה ← עקבו" with `@improve.with.englishu` in red.
- Look: torn, irregular page on dark newsprint with faint grid, black-and-white modern cutouts (marble bust holding a smartphone as the hero, DNA, rocket, satellite, brain, headphones, drone, sneakers) with red or navy offset outlines and navy tags for the themes (מדע, טכנולוגיה, תרבות, היסטוריה), the logo as a taped paper sticker with a white torn edge.
- Palette: logo red and navy only. The still is media id `de8eba37-e3b0-4ff9-a5f7-d0cecb43a6b3`; the modern cutout sheet came from Higgsfield job `5b8958c6-cf22-462b-84d5-3f0eebd3b523`. Reuse them; regenerating costs credits.
- Rejected directions: a plain dark "documentary signature" typographic card (too generic), a dictionary index-card card, and any yellow accents.
- The 1-1.5 s duration in the original brief was too short to read; 2.7 s works. Keep the text short: two headlines plus the CTA and the handle.

## Avoid list

- Rectangular photos on flat paper, empty backgrounds, mixed unrelated looks in one Reel
- Red marker circles or underlines (also never in generated clips)
- Text inside generated images or clips
- Yellow accents, generic "template" cards
- Translation or labels covering the main graphic
- Real famous people, brand logos, copyrighted characters
- Hands and realistic humans in generated collages (they look fake next to paper cutouts), unless a reference photo makes them work
