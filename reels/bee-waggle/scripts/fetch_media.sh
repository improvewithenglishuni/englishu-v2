#!/bin/bash
# Download the CC-licensed waggle-dance footage from Wikimedia Commons and cut the Reel clips.
#   Waggle_Dance.webm  - OakleyOrig, CC BY 2.0  (full-frame hive, lens comb)
#   pone.0002365.s004  - Su et al. 2008, PLoS ONE, CC BY 3.0 (red-dot dancer + followers)
# Wikimedia's robot policy needs a User-Agent with a contact URL.
set -e
cd "$(dirname "$0")/.."
mkdir -p public/media .cache
UA="ClaudeCode-ReelBuilder/1.0 (https://claude.ai/code; educational video research)"
get() { [ -s ".cache/$2" ] || curl -sf -A "$UA" -o ".cache/$2" "https://upload.wikimedia.org/wikipedia/commons/$1"; }
get 6/63/Waggle_Dance.webm waggle.webm
get c/ca/East-Learns-from-West-Asiatic-Honeybees-Can-Understand-Dance-Language-of-European-Honeybees-pone.0002365.s004.ogv dancer.ogv
enc="-an -r 30 -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart"
# full-frame vertical hive (beat 5)
ffmpeg -v error -y -ss 4 -t 9 -i .cache/waggle.webm -vf "crop=608:1080:656:0,scale=1080:1920:flags=lanczos,eq=saturation=0.95" $enc public/media/hive.mp4
# square comb crop for the magnifier lens (beats 1 and 7)
ffmpeg -v error -y -ss 10 -t 7 -i .cache/waggle.webm -vf "crop=1080:1080:420:0,scale=720:720:flags=lanczos" $enc public/media/comb.mp4
# red-dot dancer surrounded by followers (antennae beat)
ffmpeg -v error -y -t 11.5 -i .cache/dancer.ogv -vf "crop=480:480:120:0,scale=720:720:flags=lanczos" $enc public/media/dancer.mp4
ls -la public/media
