#!/bin/bash
# Render in chunks (a stalled frame only costs one chunk), then join without re-encoding.
set -e
cd "$(dirname "$0")/.."
mkdir -p out/chunks
TOTAL=$(npx remotion compositions --log=error 2>/dev/null | awk '/BeeReel/{print $4}' || true)
TOTAL=${TOTAL:-1053}
STEP=270
: > out/chunks/list.txt
for ((s=0; s<TOTAL; s+=STEP)); do
  e=$((s+STEP-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  f=out/chunks/c_$s.mp4
  for try in 1 2 3; do
    [ -s "$f" ] && break
    npx remotion render BeeReel "$f" --frames=$s-$e --codec=h264 --crf=18 --muted --concurrency=3 --timeout=240000 --log=error || rm -f "$f"
  done
  [ -s "$f" ] || { echo "chunk $s-$e FAILED"; exit 1; }
  echo "file 'c_$s.mp4'" >> out/chunks/list.txt
  echo "chunk $s-$e done"
done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i public/audio/bed_sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/bee-waggle-preview.mp4
echo RENDER_DONE
