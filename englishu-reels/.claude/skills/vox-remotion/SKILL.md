---
name: vox-remotion
description: "Produce a complete narrated Vox-style motion-graphics explainer Reel with Remotion (code-generated animation, no paid video APIs): topic research, fact-checked Hebrew script with English vocabulary woven in, a locked house style, scene-by-scene build in React, separately specified voiceover and visuals with exact timing, burned RTL subtitles, and a rendered 1080×1920 30fps MP4 for Instagram Reels. Two house styles: Vox-style Mixed Media collage (flat editorial, cutouts, marker annotations, kinetic type) and cinematic paper-diorama documentary (sepia newsprint, censor bars, burnt-orange accent, letterpress props, fake-oner whips). Use whenever the user asks for a Vox-style Reel/video, motion-graphics explainer, animated explainer, EnglishU Reel, vocabulary Reel, 'make a Reel about X', or 'run the vox pipeline' in this Remotion project — instead of the Higgsfield-based vox-motion-graphics skill."
---

# Vox-Style Motion Graphics Reels (Remotion)

Turn one request — a topic, or nothing at all — into a finished Vox-style
explainer Reel: bold editorial collage visuals, a documentary narrator,
tight fact-driven writing, one final MP4. Everything is built as code in this
Remotion project: no Higgsfield, no paid generation APIs, local assets.

This is the Remotion adaptation of the `vox-motion-graphics` skill. Its story
engine, writing formula, visual language and quality bar are kept; the
generation and assembly steps are replaced. See
`references/migration-notes.md` for exactly what changed and why.

**The Vox look, in one line:** archival photo cutouts with paper edges drifting
over flat color fields and textured paper, halftone accents, hand-drawn circles
and underlines, abstract growing charts and maps, snappy camera pushes — a
motion-designed magazine spread, never a filmed scene.

**Two house styles** — pick per brief, each with its own reference file:

- **Mixed Media collage** (default; `references/mixed-media.md`) — flat,
  bright, playful-editorial. Best for vocabulary stories, "why X" explainers,
  data stories.
- **Paper-diorama documentary** (`references/diorama.md`) — sepia newsprint
  worlds, censor-bar cutouts, one burnt-orange accent, letterpress prop
  labels, fake-oner whips. Best for history, money, power, anything
  "cinematic".

**EnglishU twist:** narration is Hebrew; English vocabulary is woven into the
Hebrew sentences and visualized on screen at the moment it is spoken
(`references/hebrew-rtl.md`).

## Required companions (official Remotion skills in this project)

Load these as you go — they are the source of truth for Remotion APIs:

| When | Load |
|---|---|
| Any Remotion code | `remotion-best-practices` → `remotion-markup` |
| Scene structure, Studio editability | `remotion-interactivity` (timeline-structure.md) |
| RTL text | `remotion-markup/arabic-text.md` (covers Hebrew) |
| Marker annotations on text | `remotion-markup/text-highlights.md` |
| Transitions / overlays (light leaks) | `remotion-markup/transitions.md`, `light-leaks.md` |
| Effects (halftone, paper, tear, zoomBlur…) | `remotion-markup/effects.md` |
| Maps | `remotion-maps` (prefer the free MapLibre or static-map technique) |
| Captions from audio (optional) | `remotion-captions` |
| Audio length, media metadata | `remotion-multimedia` |
| Rendering | `remotion-render` |
| Any API you are unsure of | `remotion-docs` — never guess an API |

**Override:** `remotion-markup/voiceover.md` recommends ElevenLabs. Do not use
it (or any paid TTS) unless the user explicitly opts in. Follow
`references/audio.md` instead.

## The Vox kit (already in this project)

`src/vox/` is the shared toolkit every Reel is built from. Read
`references/kit.md` for its API. Highlights:

- `timeline.ts` — `ReelSpec` / `SceneSpec`: voiceover, visual brief, cues,
  captions and SFX per scene; durations fit the recorded voice automatically.
- `Reel.tsx` — `VoxReel` + `calculateReelMetadata`: lays scenes, voiceover,
  SFX, music and captions on separate tracks.
- `components/` — `SceneShell` (fake-oner whips + push-in + grain),
  `PaperBackground`, `Cutout`, `MarkerStroke`, `RtlText`, `VocabCard`,
  `Stamp`, `CensorBar`, `BarChart`, `CaptionChunk`, `useImpactShake`.
- `theme.ts` — Reel size, Instagram safe zones, palettes for both styles,
  fonts (stored locally in `public/fonts`).

The `Kit/VoxKitDemo` composition shows every block working. Extend the kit
when a Reel needs something new and reusable; keep one-off visuals in the
Reel's own folder.

## Operating mode

This skill runs **hands-off**, like the original:

- If the user gave a topic, angle, duration, vocabulary, or style — honor it.
  Everything else, decide yourself using the defaults below.
- Before building, post one short plan message (topic, angle, scene count,
  target vocabulary, style, voice plan) so the user can interrupt — then
  proceed without waiting, unless they asked to be consulted.
- Never stop to ask a question a default answers.
- **The one human step:** when narration is the user's own voice (the
  default), the run pauses after the silent animatic is built and previewed,
  hands over the recording script (`references/audio.md`), and resumes when
  the files are in place. Everything before and after is automatic.
- A finished run ends with a rendered MP4. Delivering only a Studio preview at
  the end of a full run is a failure — but while iterating, use Studio and do
  not render on every change.

## Defaults

| Setting | Default | Override when… |
|---|---|---|
| Style | Mixed Media collage | user asks for cinematic/diorama, or the topic is history/power/money |
| Format | 1080 × 1920, 30 fps, H.264 + AAC (`REEL`, `remotion.config.ts`) | never for Reels |
| Duration | 45–60 s → 7–9 scenes of 4–9 s | user gives a length (Reels: keep ≤ 90 s) |
| Character | Faceless (no mascot) | user asks for a host |
| Language | Hebrew narration; 2–4 English target words woven in | user asks otherwise |
| Level | B2–C1 (Israeli Bagrut / Amirnet students) | user specifies |
| Voice | User records their own narration, one file per scene | user wants free local TTS for drafts → `references/audio.md` |
| Subtitles | ON — Hebrew RTL, Heebo Black, English words in Anton + accent color | user says no subtitles |
| Music | None, or a quiet free bed at ~0.1 volume | user supplies a track or plans to add Instagram audio in-app |
| Assets | Public-domain / CC archival images + code-drawn SVG props | user supplies images |

## Story engine (what separates a banger from postcards)

A sequence of pretty, disconnected scenes reads as a museum slideshow. What
makes the reference-grade videos hit:

- **One through-line object.** A single physical metaphor travels through
  EVERY scene and escalates (a burning fuse crossing all scenes, a balloon
  being pumped toward a needle). The viewer holds it the whole runtime; the
  finale pays it off. Design this object before writing any scene — in
  Remotion it is one reusable component that appears in every scene.
- **A question hook, answered last.** Put the question ON a prop ("WHO
  PAYS?", "?מי משלם") in scene 1 or the finale; the narration withholds the
  answer until the kicker. For EnglishU the hook is often the target word
  itself: "?למה אומרים deadline".
- **Fake-oner.** Every scene begins and ends in full motion blur
  (`SceneShell` enter/exit whips and zooms), so hard cuts read as one
  continuous camera move. Match the exit direction of scene N with the
  entry of scene N+1.
- **An impact every ~3 seconds** (slam, stamp, shockwave, snap) and at least
  one speed change per scene (a slow push → a whip). Alternate extreme close
  framing and wide collage; whiplash the scale (giant face → tiny figures →
  colossal prop).
- **One reveal shot** the whole Reel is remembered by (cutouts arranged into a
  meaningful silhouette, a camera pull-back that reveals the full picture).
- **Vocabulary as a beat.** Each target word gets its own visual payoff at
  the exact moment it is spoken (`VocabCard`, stamp, or kinetic type), then
  recurs once later so it sticks.

## Pipeline

| Phase | What happens | Where |
|---|---|---|
| T Topic | use the given topic, or research what's trending and pick one | WebSearch / WebFetch |
| R Research | verified facts, numbers, names; keep a Sources list | WebSearch / WebFetch → `SOURCES.md` |
| 1 Style lock | choose house style → palette, fonts, through-line object | `theme.ts`, style reference file |
| 2 Script | N Hebrew scenes, Vox formula, vocabulary placed | reasoning |
| 3 Scene sheet | `spec.ts`: voiceover text + visual brief + cues + captions per scene | `src/reels/<slug>/spec.ts` |
| 4 Assets | archival images → cutouts; code-drawn SVG props | `public/reels/<slug>/` (`references/assets.md`) |
| 5 Build | one React scene component per scene, kit + Remotion skills | `src/reels/<slug>/scenes.tsx` |
| 6 Animatic | preview in Studio with estimated timing; fix visuals | `npm run dev` |
| 7 Voice | record (or free TTS) one file per scene → timing auto-fits → set cues | `references/audio.md` |
| 8 Sound | SFX on cues; optional music bed | `sfx` in spec |
| 9 QA | checklist below, stills at key frames | `npx remotion still` |
| 10 Render | final MP4 + cover still, verified with ffprobe | `references/render-instagram.md` |

All phases are free.

## Phase T — Topic

**Topic given** → use it, go to Phase R.

**No topic** → find one that's popular *right now*:

1. WebSearch 2–3 angles: `trending topics this week <current month year>`,
   `most searched questions this week`, plus one vertical the user cares
   about (for EnglishU: words in the news, Israeli teen culture, tech).
2. A good Vox-able topic has: a **"why/how" question** at its core, at least
   one **surprising number or reversal**, strong **visual potential** (maps,
   charts, objects, archival imagery), broad appeal — and for EnglishU, **2–4
   useful B2–C1 English words** that belong to the story naturally.
3. Avoid: breaking tragedies and active disasters, raw celebrity gossip with
   no data angle, anything you can't verify with two independent sources.
4. Pick the strongest candidate yourself and state it in the plan message
   (with one runner-up).

## Phase R — Research

Never script from memory. WebSearch the topic, fetch the 2–3 best sources,
collect: the hook stat, 3–5 concrete facts/numbers/dates, the
counterintuitive turn, and who/what/where specifics that make scenes vivid.
Cross-check every number against a second source. Save
`src/reels/<slug>/SOURCES.md` (facts + URLs + image licenses) and include the
Sources list in the delivery message. No fabricated quotes, no invented
numbers — a vague true line beats a specific false one. Etymology claims
(common in vocabulary Reels) need a dictionary source (OED, Etymonline,
Merriam-Webster) — they are full of popular myths.

## Phase 1 — Style lock

There is no style-key image any more: the style is locked in code.

1. Choose the house style → `spec.style` (`"mixed-media"` or `"diorama"`).
   Palette and fonts come from `theme.ts`; never invent per-scene colors.
2. Design the **through-line object** and build it once as a component.
3. Pick the dominant field color per scene from `palette.fields` (one per
   scene, rotate so neighbours differ).

## Phase 2 — Script (Vox formula, Hebrew)

Write N scenes, one idea each. Hebrew narration at a measured pace runs
~2–2.4 words/second, so a 4–9 s scene holds **~8–18 Hebrew words**. Plain
spoken text only: no stage directions. Write it exactly as it will be said
(numbers as words in the voiceover text if TTS is used; captions may use
digits).

- **Scene 1 — cold open.** The most surprising fact or question, stated flat.
  No greeting, no "בסרטון הזה".
- **Scene 2 — stakes.** Why this is weird or why it matters to the viewer.
- **Middle scenes — evidence.** One idea per scene, each anchored to a
  concrete number, date, place, or comparison from Phase R. Escalate.
- **Scene N−1 — the turn.** The counterintuitive reveal ("אבל הנה הקטע").
- **Scene N — resolution + kicker.** Land the answer, end on a line that
  reframes the opening fact (and re-uses the main target word).

Tone: curious, precise, a little wry. Short declarative sentences. The
narrator explains, never hypes. English words appear inside the Hebrew
sentence exactly as an Israeli teacher would say them
(`references/hebrew-rtl.md` → "Weaving English into Hebrew").

## Phase 3 — Scene sheet (replaces block prompts)

Write `src/reels/<slug>/spec.ts`. Each scene separates what is **heard**
from what is **seen**:

```ts
{
  id: "s03-prison-line",
  voiceover: { text: "במלחמת האזרחים, deadline היה קו אמיתי בכלא.", file: "reels/deadline/vo/s03.wav" },
  visual: "Sepia field. Archival prison-camp photo slides up (print, mono). A coral marker line draws across it; censor bar slams; VocabCard 'deadline / מועד אחרון' on the word.",
  cues: { photo: 0.2, line: 1.4, vocab: 1.9, bar: 3.1 },
  captions: [{ text: "במלחמת האזרחים," }, { text: "deadline היה קו אמיתי בכלא." }],
  sfx: [{ file: "sfx/whoosh.wav", at: 0 }, { file: "sfx/stamp.wav", at: 3.1 }],
}
```

- `visual` is written in the Vox visual language — the same vocabulary as the
  original block prompts (`references/mixed-media.md` / `diorama.md`), but
  it is now a build brief: name the cutouts, the field color, the
  annotations/charts/maps, the motion, and which cue drives each beat.
- `cues` are seconds from scene start. Visual components read them with
  `useCue("name")`; SFX use the same numbers. One source of timing.
- Omit `duration` to fit the voiceover; set it only for silent beats.
- Text IS allowed now (the original banned it because AI lettering garbles):
  real kinetic typography, labeled numbers and vocabulary cards are a
  strength of Remotion. Still keep it lean: one headline OR one card OR one
  label as the loud element per moment.

## Phase 4 — Assets

Follow `references/assets.md`: public-domain/CC archival images, local
background removal for cutouts, code-drawn SVG props for anything generic.
Record every image's source and license in `SOURCES.md`.

## Phase 5–6 — Build and animatic

1. Create `src/reels/<slug>/scenes.tsx` with one component per scene id and
   register the Reel in `src/Root.tsx` inside `<Folder name="Reels">` (copy
   the `VoxKitDemo` registration; `calculateMetadata={calculateReelMetadata}`).
2. Every scene: `SceneShell` → `PaperBackground` → content. Read
   `references/kit.md` for each component's props.
3. Open Studio (`npm run dev`) and keep it open while building. Use
   `showSafeZones: true` in the Studio props panel to check Instagram's UI
   overlap.
4. Before voice exists, durations come from a word-count estimate — the
   animatic is for judging visuals, not final timing.

## Phase 7–8 — Voice and sound

See `references/audio.md`. Summary: one audio file per scene in
`public/reels/<slug>/vo/`, referenced from `voiceover.file`. Scene lengths
re-fit automatically (`voice offset + voice length + tail`). Then set each
`cues` value to where the matching word is spoken, and place SFX on cues.

## Phase 9 — QA checklist (all must pass before render)

- [ ] Every fact traces to `SOURCES.md`; every image has a license entry.
- [ ] Hebrew reads right-to-left in headlines AND captions; English phrases
      are not reversed; punctuation sits at the correct end.
- [ ] Each target word's visual lands within ±3 frames of the spoken word.
- [ ] Nothing important inside the safe-zone overlay (top 220 px, bottom
      440 px, right 150 px).
- [ ] An impact roughly every 3 s; only one loud element at a time.
- [ ] Every scene enters and exits in motion (no dead static first/last frame).
- [ ] Voice is never covered by SFX/music (SFX ≤ 0.6, music ≤ 0.12).
- [ ] Through-line object appears in every scene; question hook paid off.
- [ ] `npm run lint` passes.

Render 4–6 stills at cue frames
(`npx remotion still <Id> out/check.png --frame=<n>`) and look at them.

## Phase 10 — Render (mandatory at the end of a full run)

```bash
npx remotion render <ReelId>            # → out/<spec.id>.mp4, settings from remotion.config.ts
npx remotion still <ReelId> out/<spec.id>-cover.png --frame=<hook frame>
```

Render in this cloud environment — the user never installs or runs
anything. Then verify with ffprobe (1080×1920, 30 fps, h264 + aac, expected
duration), a full decode, audio levels at cues and a frame contact sheet, and
deliver the MP4 with SendUserFile. Details, long-render splitting, cover
image and upload tips: `references/render-instagram.md`.

## Delivery

Final message: the MP4 path, the topic + angle in one sentence, the full
script (Hebrew, with the English target words listed and glossed), the
Sources list, and suggested Instagram caption + hashtags in Hebrew with the
vocabulary list.

## Failure handling

- Hebrew words appear in the wrong order → a container lost `dir="rtl"`, or
  words were split into inline-blocks without it. Use `RtlText` /
  `tokenize()`; see `references/hebrew-rtl.md`.
- An English phrase appears reversed ("jeans skinny") → it was split into
  separate tokens; keep multi-word English as one LTR unit.
- Fonts fall back to a system font in the render → run
  `node scripts/fetch-fonts.mjs` (fonts live in `public/fonts`).
- A scene runs long → shorten the line or re-record; don't speed up the voice
  more than ~5% (`playbackRate` on the voice Audio makes it sound rushed).
- Visual beat early/late → adjust that scene's `cues` only; nothing else moves.
- Render timeout on a heavy scene → reduce simultaneous blur/effects layers,
  or raise `--timeout`. WebGL effects need `--gl=angle` (see
  `remotion-markup/effects.md`).
- A map needs an API key → switch to the MapLibre or static-map technique.
