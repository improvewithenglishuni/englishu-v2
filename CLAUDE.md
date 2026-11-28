# EnglishU Reels

## Sound effects
A ready sound-effects library is in `public/sfx/` (six folders: mechanical, tech, tactile, ambience, whooshes, miscellaneous).
Read `public/sfx/README.md` before adding sound to any Reel: it has the mix levels, the rules (variation, at most two soft whooshes,
J-cut, restraint) and a Remotion example. `public/sfx/manifest.json` lists every file and its variations.
Use it for every Reel unless Sharon says otherwise.

## End card (every Reel, no exceptions)
Every Reel ends with the same brand end card: `public/brand/englishu-end-card.mp4`
(1080 × 1920, 30 fps, 4.2 s = 126 frames, with its own sound). It is Sharon's chosen card (Nov 25, 2026) and the only one to use.
- Append it unchanged as the last 126 frames. Never redesign it, re-time it, or replace it with a still or a stand-in.
  The source and rebuild steps are on branch `claude/lucid-mendel-lnkgiw`, folder `end-card/`.
- Remotion: set `Config.setPublicDir('../../public')` in the Reel's `remotion.config.ts`, then
  `<Sequence from={END} durationInFrames={126}><OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} /></Sequence>`.
- Budget the length with it: story ≤ 30.8 s, so story plus the 4.2 s card ≤ 35 s.
- Do not put other sound effects over the end card; it has its own.
- `public/brand/englishu-end-card-still.png` is its last frame, for thumbnails. `public/brand/logo.png` is the logo.
