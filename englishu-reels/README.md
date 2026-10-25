# EnglishU Reels

Vox-style educational Instagram Reels (1080 × 1920, 30 fps), built with
[Remotion](https://www.remotion.dev). Hebrew narration, English vocabulary,
code-generated motion graphics, no paid video APIs.

## Commands

```console
npm i                              # install (once)
npm run dev                        # preview in Remotion Studio (http://localhost:3000)
npx remotion render <ReelId>       # render the final MP4 into out/
npx remotion still <ReelId> out/cover.png --frame=45   # cover image
npm run lint                       # check the code
npm run fonts                      # re-download the local fonts (public/fonts)
npm run sfx                        # optional: download extra free sound effects
```

## How it's organized

| Path | What |
|---|---|
| `.claude/skills/vox-remotion/` | The **vox-remotion** skill: the full Reel workflow for Claude Code |
| `.claude/skills/remotion-*` | Official Remotion skills |
| `src/vox/` | The Vox kit: timeline, scene shell, cutouts, markers, Hebrew text, vocab cards, captions |
| `src/reels/<slug>/` | One folder per Reel: `spec.ts` (voice + visuals + timing), `scenes.tsx`, `SOURCES.md` |
| `src/reels/demo/` | `VoxKitDemo`: a short demo of every kit block |
| `public/reels/<slug>/` | That Reel's images, cutouts, props and voiceover files |
| `public/fonts`, `public/sfx` | Local fonts and sound effects |

To make a Reel, ask Claude Code (in this folder) to "make a Vox Reel about …".

## License

Remotion is free for individuals and companies of up to 3 people.
[Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
