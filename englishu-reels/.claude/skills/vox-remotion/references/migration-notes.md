# Higgsfield → Remotion: what was kept, what changed, what it costs

Compares this skill with the original `vox-motion-graphics` skill (left
untouched, so both workflows can be compared).

## Preserved (copied or adapted 1:1)

- **Visual identity:** Mixed Media collage look (archival cutouts with paper
  borders, flat color fields, halftone and grain, marker annotations, data
  graphics, maps, redaction bars, scale comparisons) and the paper-diorama
  look (sepia newsprint, censor bars, single burnt-orange accent,
  letterpress labels, tungsten light, grain). Same palettes in spirit, now
  exact hex values in `theme.ts`.
- **Story engine:** through-line object, question hook answered last,
  fake-oner, impact every ~3 s, one reveal shot.
- **Writing formula:** cold open → stakes → evidence → turn → kicker; one idea
  per unit; curious, precise, wry; explains, never hypes.
- **Research discipline:** two-source rule, Sources list, no invented numbers.
- **Topic discovery** criteria and avoid-list.
- **Operating mode:** hands-off, plan message, no unnecessary questions,
  finished MP4 as the deliverable.
- **Motion vocabulary:** snappy ease-out entrances with overshoot, slow
  push-ins, whips between ideas, parallax layers, one loud thing at a time.
- **Music brief** for the diorama style.

## Changed

| Original (Higgsfield) | Remotion version | Why |
|---|---|---|
| Style key image (preset media_id) attached to every clip | Style locked in code: `theme.ts` palette + fonts + kit components | No image model; code guarantees consistency |
| Block prompts (STYLE/SCENE/MOTION/AUDIO/NEGATIVE) | Scene sheet `spec.ts`: voiceover + `visual` build brief + cues + captions + SFX | The brief is now built, not generated |
| `generate_video` clips (gemini_omni / seedance) | React scene components built from the kit | Free, deterministic, editable |
| Fixed 10 s blocks, ~20–24 English words | Variable 4–9 s scenes fitted to the recorded voice, ~8–18 Hebrew words | Reels pacing; exact sync |
| `seed_audio` TTS narrator | User's own recording (default) or free local TTS for drafts | No paid TTS; Hebrew quality |
| `explainer_video` assembly with burned subtitles | `VoxReel` tracks (scenes, voice, SFX, music, captions) + `npx remotion render` | Remotion is the assembler |
| NO text in clips (AI letters garble) | Real kinetic typography, vocabulary cards, labeled numbers | Code renders perfect text, a big upgrade |
| Native SFX from seedance | Local SFX files on cues | No generative audio |
| English narration | Hebrew narration with English vocabulary, RTL everywhere | EnglishU audience |
| 720×1280 clips | 1080×1920 @ 30 fps natively | Full Reels resolution |
| Moderation map, preset-recommendation workarounds, credit estimates | Removed | No API |
| Prop assets as Higgsfield job ids | Prop components / local files | Local assets |

## Quality limitations of Remotion (be honest with the user)

1. **No generated footage or imagery.** Everything on screen is either a real
   image you source or something drawn in code. Photoreal invented scenes,
   cinematic camera flights through 3D worlds and "impossible" shots are out
   of reach without a generative model.
2. **The diorama style is 2.5D.** Layered paper with parallax, blur and light
   gradients approximates the miniature-world look; it reads as crafted
   paper animation rather than a photographed set. Real fire, smoke, fluid
   and volumetric light can only be suggested.
3. **Asset quality limits the result.** Cutouts depend on the source photo
   and background removal; a poor cutout edge shows on a 1080 px frame.
4. **Hebrew voice:** free Hebrew TTS is clearly synthetic and mispronounces
   English words; a recorded human voice is needed for final quality (it is
   also more authentic for a teacher's brand).
5. **More build time per Reel.** Each scene is code. The kit removes most of
   the repetition, but a 60 s Reel is still a few hours of iteration, versus
   minutes of waiting for generation.
6. **Render time is local CPU time** (minutes per Reel) — no cloud queue, but
   no credits either.
7. **WebGL effects** (`@remotion/effects`) need `--gl=angle` and should be
   verified with a still render on the machine that renders.

## Gains over the original

- Exact, frame-accurate sync between voice, captions and visuals.
- Crisp, correct text in Hebrew and English (the original had to ban text).
- Unlimited free revisions; change one cue without regenerating anything.
- No moderation failures, no style drift between clips, no credit spend.
- Everything is versioned in git and reusable across Reels.
