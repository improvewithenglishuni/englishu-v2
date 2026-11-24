#!/bin/bash
# Final mix onto the rendered picture: voice on top, ambience/SFX ducked under her (sidechain),
# then Instagram loudness (-14 LUFS, -1.5 dBTP).  Usage: scripts/mix.sh <video-only.mp4> <out.mp4>
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i "$1" -i public/audio/bed_sfx.wav -i public/audio/voice.wav -filter_complex "\
[2:a]aformat=sample_rates=48000:channel_layouts=stereo,apad[vo];[vo]asplit[vk][vm];\
[1:a]aformat=sample_rates=48000:channel_layouts=stereo[bed];\
[bed][vk]sidechaincompress=threshold=0.025:ratio=3:attack=40:release=450:makeup=1[duck];\
[duck][vm]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=disabled[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$2"
