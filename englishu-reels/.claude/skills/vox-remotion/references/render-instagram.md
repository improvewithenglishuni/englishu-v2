# Rendering the final MP4 for Instagram Reels

## Render in the Claude cloud environment (default)

The user does not install or run anything: Claude renders the MP4 in its
cloud environment and delivers the file (SendUserFile). Verified working:

- Remotion's own browser download (`remotion.media`) is blocked by the
  network policy (HTTP 403), but Playwright's preinstalled **Chrome Headless
  Shell 153** works. `remotion.config.ts` selects it automatically when
  `/opt/pw-browsers/...` exists, and uses all CPU cores there. No flags needed.
- Speed on the 4-core sandbox: ~0.45 s per frame for kit scenes → a 60 s Reel
  (1,800 frames) takes ~13–15 min, longer than one foreground command may
  run: start long renders as a background command (Bash `run_in_background`)
  and verify when it finishes. Rendering in parts is the fallback (below).
- Always verify before delivering (step 5) and look at a contact sheet of
  frames; never report success from the render log alone.
- If `/opt/pw-browsers` is missing in a future environment, look for another
  Chrome/Chromium (`find / -name "chrome-headless-shell"`), set
  `--browser-executable`, and only then fall back to FFmpeg-only rendering.

Fallback — render in parts and join them (cut on a scene boundary so a tiny
AAC seam at the join is never under the voice):

```bash
npx remotion render JeansReel out/part1.mp4 --frames=0-899
npx remotion render JeansReel out/part2.mp4 --frames=900-1799
printf "file 'part1.mp4'\nfile 'part2.mp4'\n" > out/parts.txt
ffmpeg -f concat -safe 0 -i out/parts.txt -c copy out/jeans-reel.mp4
```

## Rendering on your own computer (optional)

Export settings are already set in `remotion.config.ts`:
H.264, CRF 20, `yuv420p`, PNG frames (crisp text), AAC 320 kbps. Size and
frame rate come from the composition (1080 × 1920, 30 fps).

## 1. Preview first

```bash
npm run dev                     # Remotion Studio at http://localhost:3000
```

Open the Reel, play it through with sound, toggle `showSafeZones`.

## 2. Check key frames as stills

```bash
npx remotion still JeansReel out/check-hook.png --frame=45
```

## 3. Render the MP4

```bash
npx remotion render JeansReel            # → out/<spec.id>.mp4
# or choose the file name:
npx remotion render JeansReel out/jeans-reel-v1.mp4
```

Useful flags:
- `--concurrency=50%` — use half the CPU cores (lower if the computer gets hot).
- `--frames=0-299` — render only part (for a quick check).
- `--gl=angle` — required when the Reel uses WebGL effects from
  `@remotion/effects` (halftone(), paper(), zoomBlur()…).
- `--props='{"spec": …}'` — render a variant without editing code.

Studio also has a **Render** button (bottom right) that does the same with a
form.

Render time is roughly 0.1–0.5 s per frame depending on the computer and the
effects used: a 60 s Reel (1,800 frames) takes a few minutes on a recent
laptop.

## 4. Cover image (thumbnail)

```bash
npx remotion still JeansReel out/jeans-cover.png --frame=<frame with the hook headline>
```

Upload it as the Reel cover in Instagram. Keep the headline in the center
1080 × 1350 area (Instagram's profile grid crops covers to 4:5).

## 5. Verify the file

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt -show_entries format=duration -of compact out/jeans-reel-v1.mp4
```

Expect: `h264 1080x1920 30/1 yuv420p` + `aac`, and the duration you planned.
Also check that it decodes cleanly and the sound lands on cue:

```bash
ffmpeg -v error -i out/x.mp4 -f null - 2>&1 | wc -l          # 0 = no decode errors
ffmpeg -ss <cue seconds> -t 0.3 -i out/x.mp4 -af volumedetect -vn -f null - 2>&1 | grep max_volume
ffmpeg -i out/x.mp4 -vf "select='not(mod(n\,90))',scale=270:-1,tile=8x1" -frames:v 1 out/sheet.jpg
```

Voice should peak around −3 to −6 dB, SFX −6 to −12 dB, silence ≈ −90 dB.
Then watch the MP4 once on a phone, with sound, before posting.

## 6. Posting

- Transfer the MP4 to the phone (AirDrop, Google Drive, WhatsApp to self
  as *document* to avoid recompression).
- Reels: up to 3 minutes; 45–60 s is the sweet spot for explainers.
- Caption: hook line in Hebrew + vocabulary list (word — meaning) + credits
  for any CC-BY images + 3–5 hashtags.
