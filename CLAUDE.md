# EnglishU Reels (Remotion)

Sharon (teacher, solo founder of EnglishU) makes ~30-35 s Hebrew-narrated, Vox-style motion-graphics Reels (1080x1920, 30 fps) that teach one surprising fact and two English target words for Psychometric/Amirnet students. She dictates by voice and is not a developer: explain in plain language, show stills/renders instead of describing.

## Read first
- `reference/VOX_BLUEPRINT.md` is the single source of truth for the look and the rules. Also `reference/STYLE.md`, `README.md`.
- Example reel: `src/reels/Smallpox/` (`Smallpox.tsx`, `timing.ts`, `SCRIPT.md`). Kit components: `src/kit/`.
- Image/data sources and licences: `tools/sources/SOURCES.md` (log every new source).

## Working rules
- **Draft first.** Write the script and a play-by-play table (second, subtitle, visual) and read it as a story before any code.
- **Never spend money** (Higgsfield credits, paid APIs) without Sharon's explicit approval of a specific price. Everything free needs no permission.
- **Never put text inside AI-generated images.** All Hebrew/English text is added in Remotion.
- Every image must visualize and relate to its narration; historical reels include real images of the topic; chart the key quantity from a named source; explain the significance of any date shown.
- One typeface per video (Rubik modern / David Libre historic). Vox palette; brand navy/red only on logo and end card. Hard-cut scenes on textured plates; no flat fields, no wide image bands with empty margins; only crisp images.
- Two target words per video, each acted out (ERADICATE vanishes; VACCINATION pops). Word slides stay >= 3 s.
- People shown on screen are named (name + title) on a clipping plate. No titles on non-subject slides, no dashed outlines, animate the action.
- Hebrew subtitles only below y=1480; keep content above it and the right 130 px clear. Keep timings in `timing.ts`; subtitles in `src/Root.tsx`.
- Never pass credentials to any third-party sandbox.

## Commands
- Preview: `npx remotion studio`
- Typecheck: `npx tsc --noEmit`
- Still: `REMOTION_LOCAL_FONTS=1 npx remotion still Smallpox out/f.png --frame=300`
- Render: `REMOTION_LOCAL_FONTS=1 npx remotion render Smallpox out/smallpox.mp4 --concurrency=1`
- Always check stills of every scene before rendering; edit `Root.tsx` carefully (it holds the subtitle arrays).

## Photos
If the network allows, download public-domain/licensed images directly (Wikimedia, Wellcome, LoC, CDC). Wikimedia rate-limits: use thumbnail URLs and sleep on 429. Log source and licence.
