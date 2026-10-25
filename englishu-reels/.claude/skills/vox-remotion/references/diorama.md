# Paper-Diorama Documentary — Remotion translation ("WHO BLINKS?" playbook)

The second house style: a cinematic vintage paper-diorama documentary —
aged sepia newsprint worlds, censor-bar cutout figures, one burnt-orange
accent, letterpress prop typography, warm tungsten light, tilt-shift depth.
Use it when the brief says cinematic / dramatic / investigative, or the topic
is history, geopolitics, money or power.

In the original, a video model rendered real 3D paper worlds. In Remotion we
build them as **2.5D layered paper stages**: flat paper layers at different
depths, moved by a virtual camera. Plan for that; see "Quality limits" below.

## Style tokens → code

| Token | Build it with |
|---|---|
| aged sepia newsprint world | `palettes.diorama` fields; `PaperBackground` with `halftone="full"`, `dotColor="rgba(40,25,10,0.18)"`; newsprint texture image (public-domain scanned newspaper page) at 15–25% opacity, `mixBlendMode: "multiply"` |
| monochrome halftone print | `Cutout tone="mono"`; optional `halftone()` effect on cutouts |
| archival cutout figures with black censor bars over their eyes | `Cutout` + `CensorBar from="slam"` positioned over the eyes |
| single burnt-orange accent | `palette.accent` (#c4501b) — exactly one orange element per scene |
| distressed letterpress | `Stamp` (Rubik Dirt for Hebrew, Anton for English) with `blend="multiply"`; serif headlines in `fonts.heSerif` (Frank Ruhl Libre 900) |
| warm tungsten light, deep shadows | overlay `AbsoluteFill` with `radial-gradient(circle at 40% 30%, rgba(255,190,120,0.35), transparent 60%)` + strong `vignette` (0.5–0.6) |
| macro tilt-shift shallow depth of field | blur the top and bottom layers (`filter: blur(6–10px)`) and keep the middle sharp; or `linearProgressiveBlur()` effect |
| film grain and dust | `SceneShell grain={0.3}` + a few dust specks (`random()`-placed dots that flicker per frame) |
| handcrafted stop-motion feel | step the camera: quantize motion to every 2nd frame (`Math.floor(frame / 2) * 2`) for "on twos" |

## Layered paper stage (the diorama "world")

```
<SceneShell enter="zoom" exit="zoom" push={0.12} grain={0.3}>
  <PaperBackground color={p.fields[0]} halftone="full" vignette={0.55} />
  {/* far layer: torn newsprint canyon wall, moves least, blurred */}
  {/* mid layer: cutout figures with censor bars — sharp */}
  {/* near layer: big orange prop edge, moves most, blurred */}
  {/* tungsten light overlay */}
</SceneShell>
```

Parallax rule: each layer's translation = camera move × depth factor
(far 0.3, mid 0.6, near 1.2). A slow push with different layer speeds sells
depth far better than any single moving image. Torn paper edges: SVG polygons
with noisy edges (`noise2D`), or `tear()` / `roughenEdges()` effects.

## Prop typography

Signature of this style: short letterpress text ON props. One label per
scene, 1–2 words or a number ("EXPIRED", "1,000", "?מי ימצמץ"), on a torn
burnt-orange paper element, via `Stamp`. In Remotion the label is real text,
so it is always crisp and correct — no gibberish lettering to fence off.

## Reusable props (keep objects consistent)

The original kept Higgsfield job ids for props. Here a prop is a component or
an image file in `public/reels/<slug>/props/`, reused in every scene. A prop
that recurs across Reels moves to `src/vox/components/props/`. Build props
as SVG in code where possible (missile, powder keg, fuse, hourglass,
treaty document) — they scale perfectly and can animate (a fuse that burns
down with `evolvePath`).

## Fake-oner scene shape

Every scene = one continuous camera move; every boundary hidden in motion:

```
ENTER: emerges from motion blur (zoom / whip matching previous exit)
SHOT: [impact moment every ~3 s: slam / stamp / shockwave / snap]
      [one speed change: slow push → sudden whip or dive]
EXIT: ends fully motion-blurred mid-dive / whip / fall
SOUND: 3–5 concrete events on cues (slam, page rips, stamp punch, paper wind)
```

Worked example (opening scene of "WHO BLINKS?" adapted):

```
FIELD: sepia (fields[0]), full halftone, vignette 0.55, tungsten overlay
ELEMENTS: halftone eye (mono cutout, huge, 2× frame width); censor bar;
  three newspaper-page portraits (prints, mono) stacked; treaty document (SVG prop)
MOTION: from black, extreme close-up of the eye, very slow push (0–1.0 s);
  censor bar SLAMS (impact + shake) at 1.0; fast pull-back reveals it is a newspaper
  portrait; page rips away (clip-path tear + whip) to portrait 2, then 3, each faster;
  camera DIVES into the treaty as the orange stamp "EXPIRED" punches at 4.6
BEATS: bar → 1.0 · rip1 → 2.2 · rip2 → 2.9 · rip3 → 3.4 · stamp → 4.6
ENTER/EXIT: none (from black) / zoom
SOUND: stamp.wav at bar (guillotine), paper.wav × 3 accelerating, stamp.wav at 4.6, whoosh at exit
```

## Quality limits of this style in Remotion

- No real 3D lighting, depth of field or volumetric dust — it is faked with
  layers, gradients and blur. It reads as "crafted paper animation", not as a
  photographed miniature.
- No real fire/embers/smoke. Use particle sparks (`random()`), an orange glow,
  or choose a different metaphor (hourglass, fuse drawn as a path).
- True 3D is possible with `@remotion/three` (see `remotion-markup/3d.md`),
  but it costs much more build time; use it only for one hero shot.
- Recognizable faces of public figures: same editorial rule as before —
  mid-shot cutouts with censor bars; check the image license.

## Music

No music generator here either. Options: no music (voice + SFX is often
enough), a free library track (see `audio.md`), or add Instagram audio
in-app. A brief that matched the reference: ~46 BPM heartbeat pulse,
sub-bass drone + low cello, almost no highs, 8-second breathing swells,
loud open, single climax at 80% of runtime, rapid decay to silence.
