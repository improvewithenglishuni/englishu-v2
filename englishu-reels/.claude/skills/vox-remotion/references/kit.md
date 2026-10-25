# Vox kit API (`src/vox/`)

All sizes are in pixels on the 1080 × 1920 canvas; all `at` / `enterAt` /
`drawAt` values are **frames relative to the scene start** — get them from
cues with `useCue("name")` so voice and visuals share one timing source.

## Files

| File | Purpose |
|---|---|
| `theme.ts` | `REEL` (1080×1920@30), `SAFE` zones, `palettes` (`mixed-media`, `diorama`), `fonts` |
| `fonts.json` | local font manifest (written by `scripts/fetch-fonts.mjs`) |
| `timeline.ts` | `ReelSpec`, `SceneSpec`, `resolveScenes()`, `timeCaptions()` |
| `scene-context.ts` | `useScene()`, `usePalette()`, `useCue(name, fallbackSeconds?)` |
| `Reel.tsx` | `VoxReel`, `calculateReelMetadata`, `SceneComponents` |
| `components/*` | building blocks below |

## Registering a Reel

```tsx
// src/reels/<slug>/scenes.tsx
export const jeansScenes: SceneComponents = { "s01-hook": Hook, "s02-stakes": Stakes };

// src/Root.tsx (inside <Folder name="Reels">)
const JeansReel: React.FC<ReelProps> = (props) => <VoxReel {...props} scenes={jeansScenes} />;
<Composition
  id="JeansReel"
  component={JeansReel}
  durationInFrames={REEL.fps * 60}
  fps={REEL.fps}
  width={REEL.width}
  height={REEL.height}
  defaultProps={{ spec: jeansSpec, showSafeZones: false } satisfies ReelProps}
  calculateMetadata={calculateReelMetadata}
/>
```

`calculateReelMetadata` measures voice files, sets the true duration, and sets
the default output name to `spec.id`. A scene id without a component renders
a placeholder card showing its voiceover and visual brief, so a Reel can be
previewed before every scene is built.

## Components

### `SceneShell` — wrap every scene
`enter`, `exit`: `"up" | "down" | "left" | "right" | "zoom" | "none"` (motion-blurred whips; match scene N exit to N+1 enter) · `whipFrames` (7) · `push` (0.06 = slow push-in over the scene) · `grain` (0.22)

### `PaperBackground`
`color` · `halftone`: `"none" | "corner" | "full"` · `dotColor` · `vignette` (0–1)

### `PaperGrain`, `Tape`
Grain overlay (`opacity`, `animated`); masking tape strip (`style`, `width`).

### `Cutout` — archival photo cutout
`src` (public path or URL) · `kind`: `"silhouette"` (transparent PNG, border follows outline) | `"print"` · `x, y` (center-x, top) · `width` · `rotate` · `enterAt` · `from`: `"pop" | "left" | "right" | "top" | "bottom"` · `drift` (px of slow parallax) · `border` · `tone`: `"color" | "mono" | "sepia"`

### `MarkerStroke` — self-drawing hand-drawn marker
`shape`: `"circle"` (box `x, y, width, height`) | `"underline"` (`x, y, width`) | `"arrow"` (`x, y` → `to`) · `drawAt` · `drawFrames` (14) · `color` · `thickness` (12) · `arc` (bow) · `seed` (change for a different wobble)

### `RtlText` — Hebrew kinetic type with English islands
`text` · `fontSize` · `color` · `englishColor` · `fontFamily` / `englishFont` · `animate` (word pop) · `startAt` · `stagger` (3) · `align`: `"right" | "center"`
`tokenize(text)` is exported for custom layouts.

### `VocabCard` — EnglishU word card
`word` · `meaning` (Hebrew) · `note` (stress/IPA/part of speech) · `at` · `x` (center) · `y` (top) · `rotate`

### `Stamp` — letterpress slam
`text` (Hebrew → Rubik Dirt, else Anton) · `at` · `x, y` (center) · `rotate` · `fontSize` · `color` · `blend` (`"multiply"` on light paper, `"normal"` on dark fields)

### `CensorBar`
`at` · `x, y, width, height` · `from`: `"left" | "right" | "slam"` · `color` · `rotate`

### `BarChart`
`values` · `labels` · `valueLabels` · `highlight` (index in accent) · `at` · `x` · `y` (baseline) · `width` · `maxHeight` · `rtl` (true)

### `useImpactShake(at, strength?, frames?)`
Returns a CSS `translate` string; put it on the scene's content wrapper for
slams and stamps.

### `CaptionChunk`, `SafeZones`
Used by `VoxReel`; captions come from `SceneSpec.captions`. Toggle
`showSafeZones` in Studio's props panel while laying out.

## Extending the kit

- New reusable building block → `src/vox/components/`, palette-aware via
  `usePalette()`, timing via frame props, no CSS animations.
- Make Studio-editable instances where useful (`remotion-interactivity`).
- Keep the demo (`src/reels/demo`) rendering: it is the kit's smoke test.
