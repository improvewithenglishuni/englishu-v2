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
# native-resolution crops (shown 1:1, never upscaled): the dark-hive shot and the antennae magnifier
ffmpeg -v error -y -ss 0.8 -t 8 -i .cache/waggle.webm -vf "crop=1080:1080:420:0,eq=saturation=0.95" -an -r 30 -c:v libx264 -crf 17 -pix_fmt yuv420p -movflags +faststart public/media/hive_sq.mp4
ffmpeg -v error -y -ss 1.5 -t 6.5 -i .cache/waggle.webm -vf "crop=720:720:160:180" -an -r 30 -c:v libx264 -crf 17 -pix_fmt yuv420p -movflags +faststart public/media/lens_native.mp4
# red-dot dancer surrounded by followers (antennae beat)
ffmpeg -v error -y -t 11.5 -i .cache/dancer.ogv -vf "crop=480:480:120:0,scale=720:720:flags=lanczos" $enc public/media/dancer.mp4
# field recordings for the sound design (scripts/make_audio.py)
mkdir -p public/media/audio
get 3/3f/Honeybee-hive.ogg hive.ogg
get 1/11/263673_ylearkisto_mehilainen-tarhamehilainen-parvi-bees-honeybees-a-swarm-of-bees-buzzing-among-the-flowers-apis-mellifera.wav meadow.wav
get c/ca/Bombus_buzz.ogg bombus.ogg
mp3="-ac 2 -ar 48000 -c:a libmp3lame -b:a 192k"
ffmpeg -v error -y -ss 60 -t 20 -i .cache/hive.ogg -af loudnorm=I=-20:TP=-2 $mp3 public/media/audio/hive-hum.mp3
ffmpeg -v error -y -ss 20 -t 20 -i .cache/meadow.wav -af loudnorm=I=-20:TP=-2 $mp3 public/media/audio/meadow.mp3
ffmpeg -v error -y -i .cache/bombus.ogg -af loudnorm=I=-18:TP=-2 $mp3 public/media/audio/flyby.mp3
ls -la public/media public/media/audio
