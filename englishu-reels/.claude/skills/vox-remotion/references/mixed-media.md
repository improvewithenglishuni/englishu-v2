# Mixed Media Collage — Remotion translation

The default house style. Goal of every scene: a **motion-designed editorial
collage** — the visual grammar of a Vox video — never a filmed scene.
This file maps the original skill's visual vocabulary onto concrete Remotion
building blocks.

## The visual vocabulary → how to build it

Every scene combines two or three devices, chosen to literally illustrate
that scene's narration line.

| Device (original) | Build it with |
|---|---|
| **Archival cutouts** — photo subjects with rough white paper borders, drifting or snapping into place | `Cutout kind="silhouette"` on a transparent PNG (white outline follows the subject) or `kind="print"` for a rectangular photo print. `tone="mono"` for archival feel. Add `Tape` strips. Edge roughness: `roughenEdges()` / `tear()` effects. |
| **Flat color fields** — warm yellow, off-white paper, deep navy, coral red; one dominant per scene | `PaperBackground color={palette.fields[i]}`. Never invent colors outside `palettes["mixed-media"]`. |
| **Paper & print textures** — grain, halftone, newsprint, torn edges, tape, drop shadows | `PaperBackground` (halftone `corner`/`full`, grain, vignette), `SceneShell` grain, `Tape`, `Cutout` drop shadow. Optional upgrades: `paper()`, `halftone()`, `noise()` effects. |
| **Hand-drawn annotations** — marker circles drawing themselves, underlines sweeping in, arrows | `MarkerStroke shape="circle" / "underline" / "arrow"` (self-drawing, wobbly). On text: `@remotion/rough-notation` `<Highlight>`, `<Circle>`, `<Underline>` (see `remotion-markup/text-highlights.md`). |
| **Data graphics** — bars growing, lines drawing, pies separating | `BarChart` (RTL order by default). Lines: an SVG path + `evolvePath` from `@remotion/paths`. Pies: `@remotion/shapes` `<Pie>` with animated `progress`. Labels and real numbers ARE allowed now — keep them big (≥ 56 px). |
| **Maps** — flat maps, animated routes, pulsing dots, regions filling | `remotion-maps` skill: **static-map** or **MapLibre** (free, no key). Or a simplified SVG map with routes drawn by `evolvePath`. |
| **Redaction & highlight blocks** — bars sliding over areas, spotlight vignettes | `CensorBar`; spotlight = dark `AbsoluteFill` with a radial-gradient hole over the subject. |
| **Scale comparisons** — one object multiplying into rows, small next to towering | Map over an array of `Cutout`s with staggered `enterAt`; size contrast via `width`. |
| **Kinetic typography** (new — impossible in the original) | `RtlText` word-by-word pop; `VocabCard`; `Stamp`. One loud text element at a time. |

## Motion vocabulary

Vox motion is snappy and intentional: quick ease-out entrances, elements
sliding/popping into place with slight overshoot (`spring` damping ~10–14),
slow deliberate camera push-ins during "listen to this" beats
(`SceneShell push`), whip-pans or page-flips between ideas (`SceneShell
enter/exit`), parallax drift between collage layers (`Cutout drift` with
different values per layer). Something should always be moving, but only one
thing should be *loud* at a time.

Timing guide at 30 fps:

| Beat | Frames |
|---|---|
| Cutout pop-in (spring settle) | 10–18 |
| Marker circle draw | 12–16 |
| Underline sweep | 8–10 |
| Whip in/out | 6–8 |
| Stagger between list items | 3–6 |
| Hold a key visual before the next loud beat | ≥ 20 |

## Design rules (replaces the original NEGATIVE line)

The NEGATIVE line policed an AI model. In code the risks are different:

- No photoreal full-frame video: photos live *inside* the collage as
  elements. A full-bleed photo is only allowed as a `print` with a border.
- No more than one loud element per moment; everything else drifts.
- No text smaller than 44 px; headlines ≥ 84 px (Remotion video-layout rule).
- No text in Instagram's UI zones (`SAFE`).
- No color drift: only palette colors, one dominant field per scene.
- No CSS `transition`/`animation` — every motion is driven by
  `useCurrentFrame()` (renders would break).
- No talking heads, no lip-sync, no stock-video look.

## Scene brief template (the `visual` field)

```
FIELD: <palette field> + texture (halftone corner/full, grain)
ELEMENTS: <cutouts / props / chart / map / type>, positions (top-third, center, lower-third)
MOTION: <entrance choreography + camera move + what animates during the scene>
BEATS: <cue name> → <what happens> (one line per cue)
ENTER/EXIT: <whip direction in> / <whip direction out>
SOUND: <SFX on which cues> — never under a key word of the voice
```

## Worked example 1 (translated from the original Block 1)

Narration: *"כל יום, בני אדם זורקים מספיק אוכל כדי להאכיל שני מיליארד איש.
ורוב האוכל הזה לא מגיע לצלחת בכלל."*

```
FIELD: warm yellow (fields[0]), halftone corner, grain
ELEMENTS: photo cutouts of an apple, a bread loaf and a full dinner plate in a 3×2
  grid (silhouette, color); a torn-paper bin shape at the bottom (SVG)
MOTION: cutouts pop in with overshoot, 4 frames apart; slow push-in (push 0.08);
  on "never reaches" they flip (rotateY) and tumble downward into the bin one by one
BEATS: grid → 0.2 · tumble → 3.4 · circle → 5.0 (marker circle around the last plate)
ENTER/EXIT: zoom / up
SOUND: pop.wav per cutout (volume 0.3), paper.wav at tumble, tick.wav per landing
```

## Worked example 2 (translated from the original Block 4)

Narration: *"ב־1970, לשלוח מכולה אחת מעבר לים עלה פי עשרה ממה שזה עולה היום.
ואז הקופסאות השתלטו."*

```
FIELD: deep navy (fields[2]), white halftone dots at 12% opacity
ELEMENTS: flat world map (static-map technique, desaturated) sliding up; coral
  dotted route drawn across the ocean between two pulsing dots; archival cargo-ship
  cutout (mono) riding the route; BarChart [10, 1] with labels "1970" / "היום"
MOTION: map slides in ease-out; route draws right→left (RTL reading); camera drifts
  following the ship; bars shrink in snappy steps; container cutouts multiply into a stack
BEATS: map → 0 · route → 0.8 · bars → 2.6 · stack → 4.2
ENTER/EXIT: up / left
SOUND: whoosh at 0, tick.wav per bar step, stamp.wav when the stack lands
```

## Script example (structure reference, Hebrew, ~45 s)

Topic: "למה אומרים deadline?"

```
s01  למה אנחנו אומרים deadline על משהו שאין בו שום מוות?
s02  כי פעם, המילה הזאת באמת הייתה עניין של חיים ומוות.
s03  במלחמת האזרחים האמריקאית, deadline היה קו אמיתי שסומן סביב מחנה שבויים.
s04  שבוי שחצה אותו — נורה. בלי אזהרה.
s05  רק בתחילת המאה העשרים, עיתונאים התחילו להשתמש במילה לזמן סגירת הגיליון.
s06  והנה הקטע: המילה לא התרככה. אנחנו פשוט שכחנו מאיפה היא באה.
s07  אז בפעם הבאה שיש לכם deadline — תזכרו שזה פעם היה קו שאסור לחצות.
```

Notice the shape: cold-open question → stakes → two evidence beats → the turn
→ kicker that reframes scene 1 and repeats the target word. (Facts in this
example still need Phase R verification before use.)
