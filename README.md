# englishu-v2
## Reels (Remotion)

```bash
npm install
npm run studio          # preview and nudge in Remotion Studio
npm run render:postit   # renders out/postit-reel.mp4
```

- `src/lib/` shared paper world (plates, stickers, tags, subtitles, target-word slide) and the end card.
- `src/postit/` the Post-it Reel (Reel 6). Script: `claude/postit-reel-script.md`.
- Real photos and the voiceover are picked up automatically when present:
  `public/postit/photos/hook.jpg`, `public/postit/photos/choir.jpg`, `public/postit/vo.wav`.
