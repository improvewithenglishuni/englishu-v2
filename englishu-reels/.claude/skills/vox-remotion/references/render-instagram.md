# Rendering the final MP4 for Instagram Reels

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
Then watch the MP4 once on a phone, with sound, before posting.

## 6. Posting

- Transfer the MP4 to the phone (AirDrop, Google Drive, WhatsApp to self
  as *document* to avoid recompression).
- Reels: up to 3 minutes; 45–60 s is the sweet spot for explainers.
- Caption: hook line in Hebrew + vocabulary list (word — meaning) + credits
  for any CC-BY images + 3–5 hashtags.
