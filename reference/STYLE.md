# EnglishU Reel style — source of truth

Derived from `plane-reel.mp4` (1080x1920, 30 fps, 34.5 s). Frames `frame_01.jpg` … `frame_23.jpg`
were pulled one every 1.5 s. All hex values below were **sampled from those frames**
(k-means over the frame + pixel probes), not guessed.

## 1. The world

Every frame is a photographed paper collage, filled edge to edge. There is never a flat
digital fill: even the "empty" parts of the sky have creases, fibres and halftone dots.

**Light world (sky)** — `frame_01–07`, `frame_19–23`
* A sheet of matte blue paper, gently crumpled. The creases are *soft and large*
  (long faint ridges and a few sharp kinks), lit from the upper left. The base reads as
  ~`#5E8CA8` in the video (k-means 46–69 % of pixels: `#608FAA`, `#5C8BA6`, `#5B8AA6`).
  The user's own note said `#64A9D9`; the real frames are more muted/grey. Our default theme
  uses the sampled value, which reads correctly once the plate is lit.
* Fine paper fibre/specks over everything; a little darker towards the corners.
* **Halftone patches**: 2–3 irregular areas where a dot screen sits on the paper (very visible
  top-left of `frame_06`, bottom-right of `frame_02`). Dots are a *slightly darker blue*
  (~`#4F7C99`), roughly a 14–16 px pitch on a ~45° grid, and the dot size fades out at the patch
  edge instead of stopping hard.
* **Clouds** are crumpled white-paper cutouts (`#D0CFCA` lit, `#F1EEE3` at highlights) with a
  cumulus outline of 3–5 round lobes and a flat-ish base. The lower third of each cloud carries
  a halftone shade (grey dots). A thin, brighter, *fibrous* torn edge rims each cloud, and a soft
  shadow sits down-right (~6–10 px offset, ~30 % black, blurred ~10 px).
* **The contrail** is the hero object: a long strip of *heavily crumpled* white paper
  (`#D0CFCA` / `#B3B4B2` in the creases) with **torn edges on both sides**. The torn edge is a
  scalloped, multi-scale wobble (big 80–150 px bulges + small jitter) and has a lighter, fuzzy
  fibre band 6–14 px wide where the paper core is exposed. It runs diagonally bottom-left to
  top-right behind the plane and grows wider away from the plane.

**Dark world (night / "inside the science")** — `frame_07–15`
* Deep navy card stock. Two dark tones appear: `#1F2A3B` and `#2D384B` (the hexagon and
  DISPERSE frames). The engine section is bluer, `#101C41` — *note:* that is close to the brand
  navy `#0A2370`, which the rules forbid in the body. Our dark default stays on the greyer
  `#1D2A3C`, which is what the hexagon scenes actually use.
* The dark paper is a fine-tooth card (dense small grain, faint fibres), *less crumpled* than the
  sky, with a subtle grid-like texture in places.
* A **lighter torn-paper layer** sits on it: pale blue `#ACD4ED`/`#B0CCDC` with torn edges.
* The transition into the dark world is shown as white paper torn and curled back at the corners
  (`frame_08`): the light world is a sheet ripped away to reveal the dark one.
* **Ice crystals**: small paper hexagons, pale grey-blue face `#CDD5DA`, a slightly whiter rim
  (the cut edge), and a thin blue-grey line drawing `#869AA2`: an inner hexagon plus six spokes
  from the centre. Each has a small soft shadow. They cluster, overlap, and later scatter.
* **Orange paper shape** `#E2753D` (engine exhaust) with white dots punched in it.
* **Hand-drawn arrows**: thin (6–9 px) slightly wobbly marker lines with an open "V" head.
  Dark ink `#1E2A3A` on light paper, accent orange `#D39655`/`#E8A04B` on the dark world.

## 2. Palette (default theme = plane)

| Role | Hex (sampled) | Notes |
|---|---|---|
| light base (sky paper) | `#5E8CA8` | rendered average; the plate base is set so the lit result lands here |
| light halftone dots | `#4F7C99` | darker tone of the base |
| dark base (navy card) | `#1D2A3C` | hexagon / DISPERSE scenes |
| dark secondary | `#2D384B` | lighter fibres / patches on navy |
| paper white | `#D0CFCA` lit, `#F4F0E4` highlight | clouds, contrail, label |
| cream (label + key word fill) | `#F3EFE4` | |
| ink (label text, outlines, arrows on light) | `#172A40` | |
| pale paper layer (dark world) | `#ACD4ED` | |
| **accent** | `#E8A04B` | the only saturated colour |

Brand navy `#0A2370` and brand red `#B01F25` never appear in the body.

## 3. Typography

* **Hook label** (`frame_01–02`, `frame_21–23`): a cream card `#F4F0E4`, almost rectangular
  but with slightly uneven, paper-cut edges; rotated about −3°; soft drop shadow down-right.
  Text is a very heavy Hebrew sans (Rubik Black-like), ink `#172A40`, ~110 px cap height,
  with a little padding (≈40 px sides). In the payoff it gets an orange variant (accent card,
  ink text) and the old label is struck through by hand.
* **Key word** (`frame_04–06`, `frame_14–15`): Anton-style condensed caps, ~180 px tall.
  Fill cream `#F3EFE4`, a **thin dark outline** (~3 px, ink) and a **hard offset shadow**
  (ink, ~6 px down-right, no blur) — a printed sticker look, not glow. The target part
  (TRAIL) is filled with the accent and slides away from the first part, leaving a gap.
  For DISPERSE, letters jump to different heights / sizes ("scatter") to act out the meaning.
* **Subtitles**: Rubik/Heebo ExtraBold ~46 px, white, dark outline/shadow, centred,
  baseline around y≈1500 — i.e. just above the bottom fifth. English words inside Hebrew lines
  stay LTR in place. Max ~2 lines.

## 4. Accent usage

Only three things are orange: the second half of the key word, **one** hand-drawn marker
swoosh (a Z-shaped double stroke under the word, with a dry-brush tail, multiplied onto the
paper so it darkens where it crosses white: sampled `#BD651B` on paper), and arrows in the
dark world. No orange fills elsewhere except the one story prop (engine exhaust).

## 5. Motion

* One locked plate per world; the camera slowly pushes in (subtle, ~1.0 → 1.06) — frames look
  like one continuous shot of a table-top collage.
* The plane enters from bottom-left and climbs to top-right; the contrail grows behind it.
* Labels pop in (scale + slight overshoot); the key word splits (CON | TRAIL) by sliding.
* World change happens by tearing/peeling paper, never a hard cut.
* Hexagons start in a dense cluster then drift outward radially; arrows draw on.
* Only one or two things move at once; everything else holds still on the paper.

## 6. Composition rules

* Keep the bottom fifth (y > 1536) free of important content and the right edge (~120 px)
  clear (Instagram UI). Subtitles sit just above that line.
* Cutouts are always bordered by thin white paper (8–12 px, a bit irregular) and softly
  shadowed; never bare rectangles. Rotations stay within ±4° for labels/photos.
