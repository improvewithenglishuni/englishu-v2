#!/bin/bash
# Final pacing pass: the story plays 5% faster (pitch-preserving audio, so her voice keeps its natural pitch);
# the fixed end card stays at its own speed.  Usage: scripts/speedup.sh <in.mp4> <out.mp4> [factor]
set -e
cd "$(dirname "$0")/.."
IN="$1"; OUT="$2"; K="${3:-1.05}"
END=$(python3 -c "import re;s=open('src/theme.ts').read();print(re.search(r'end:\s*\[([\d.]+)',s).group(1))")
ffmpeg -v error -y -i "$IN" -filter_complex "\
[0:v]trim=0:$END,setpts=(PTS-STARTPTS)/$K[v1];[0:a]atrim=0:$END,asetpts=PTS-STARTPTS,atempo=$K[a1];\
[0:v]trim=start=$END,setpts=PTS-STARTPTS[v2];[0:a]atrim=start=$END,asetpts=PTS-STARTPTS[a2];\
[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
