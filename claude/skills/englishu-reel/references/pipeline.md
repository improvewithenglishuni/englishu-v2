# Production pipeline

## Contents
- Higgsfield tools, prices and approvals
- Uploading her files and delivering results
- The sandbox: what is there and its limits
- Voiceover recipe
- Emphasising the target word in audio
- Cutting the visuals to her voice
- Rendering overlays and animation
- Sound design and mix
- End card and final assembly
- Mistakes to avoid (lessons learned)

## Higgsfield tools, prices and approvals

- `balance` shows credits. Prices (verified): video `gemini_omni`, 720p only, **3 credits per second** (4-10 s clips, so 5 s = 15, 6 s = 18, 10 s = 30); images `nano_banana_pro`, **2 credits**. Re-check with a free preflight (`get_cost: true`) before quoting, because prices change.
- Skip Higgsfield's own voice and assembly steps (the vox skill's defaults): she records her voice and the sandbox edit is free.
- Typical plan: 1-2 clips (5-8 s each, only where motion matters), 3-6 stills, keep a small reserve for one redo. If a clip fails, swap in a still instead of paying for a retry.
- Always attach the style reference (`image_references`, media id in `SKILL.md`). Ask for silent clips with no text, no marker strokes, main action centered, bottom fifth and right edge clear.
- If the prompt looks like a preset, the tool answers with a notice. Decline the "3D RENDER" preset by retrying with `declined_preset_id: 5a77643c-b6cc-4efd-bdc6-ab8ff48dfa82`.
- She sees an approval prompt for each paid call. "No approval received" means nothing ran and nothing was spent: tell her, and ask her to tap Allow.
- Save the plan and decisions in the conversation; she wants every spend confirmed ("don't use credits without my explicit permission").

## Uploading her files and delivering results

- Files she attaches in chat are visible to you but NOT to the sandbox. For the sandbox to use a file, open `media_upload_widget` (type `audio` or `image`; **one file per box**, so open one box per file). She replies with a media id. Also ask her to attach it in chat if you need to look at it.
- Download inside the sandbox with `curl` from the cloudfront URL returned by `show_medias` / `show_generations` (audio arrives as `.mp3`, images as `.png`).
- Deliver a finished video: `media_upload` (content_type `video/mp4`) returns a PUT URL; run the `curl -X PUT -H "Content-Type: video/mp4" --data-binary @file.mp4 '<url>'` command inside the sandbox (retry up to 3 times on a 520), then `media_confirm` (type video), then `show_result` to show the player. Also write out the cloudfront URL in the reply in case the player does not open.
- Finished stills, such as end cards: same flow with `image/png`.

## The sandbox: what is there and its limits

`sandbox_exec` is a Linux cloud box. Files persist even after "sandbox restarted" notices.

- Available: ffmpeg/ffprobe, ImageMagick (`convert`, not `magick`), Python with numpy, scipy, cv2, PIL, faster-whisper (`small`, cpu, int8), Node with Playwright/Chromium (`NODE_PATH=$(npm root -g) node script.js`). `pip install` does not work (home directory is read-only), so use what exists. Fonts download from GitHub raw URLs.
- **Each call must finish in under about 120 s**, and the connector often drops long calls ("server isn't responding"). Run anything heavy (overlay renders, frame generation, GrabCut cutouts) in the background with `nohup sh -c "cd $D && command > log.txt 2>&1; echo FIN >> log.txt" &`, then poll the log in a separate short call. A dropped call does not kill the background job.
- Use absolute `file://` paths for fonts and images in HTML.

## Voiceover recipe

Goal: clean, natural, continuous speech with no breaths, no dead silence and no clipped words.

1. Convert to mono 48 kHz WAV. Transcribe with faster-whisper (`language="he"`, `word_timestamps=True`) to get word times; for English lines transcribe a window with `language="en"`. Detect silences with `silencedetect=noise=-45dB:d=0.3` (or -35 dB on noisier recordings).
2. **Choose complete takes.** She restarts sentences or records a fixed last line in a second file: pick the full take of each line and the newest version she names.
3. Light cleanup on the raw recording: `highpass=f=90,afftdn=nr=20:nf=-40:tn=1` is only for detecting speech edges. Do NOT use that strong denoise on the final audio (it made her voice warble). Final chain: `highpass=f=85, afftdn=nr=6:nf=-72, lowpass=f=14000, atempo=1.05 (to 1.07), deesser=i=0.4, acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120, loudnorm=I=-16:TP=-1.5:LRA=9`.
4. Assemble line by line. Cap long internal pauses at about 0.4 s and keep gaps between lines at 0.28-0.45 s (0.9 s before the closing line is fine, shorter if she asks). Breaths shorter than the cap stay or are cut only at energy minima; never cut inside a word.
5. **Fill every gap with her own room tone**, taken from the quiet start of the recording and tiled with 50 ms crossfades, and smooth the speech mask with a 30 ms moving average. Dead digital silence made the edits audible ("you can tell they're cut").
6. Level each line to about -37 dB RMS (gain limited to +6 dB) so the quiet takes do not get noise-boosted later.
7. If a limiter is needed after boosting a word: `alimiter=limit=0.95:level=disabled`.
8. Re-transcribe the cleaned track to get final word times for subtitles and cuts.

To edit the cleaned track later (extra pause, shorter pause, stretch a word), work on the final WAV: find cut points with a 5 ms RMS minimum search, join with a 12-15 ms crossfade, and fill inserted silence with tiled room tone from the quietest 0.25 s window of the file.

## Emphasising the target word in audio

She wants emphasis that is **barely noticeable**:

- Slow only the word, in three slices with gradually lower tempo, joined with 12 ms crossfades. DISPERSE used 0.95 / 0.88 / 0.84. RETAINED used 0.96 / 0.92 / 0.88 after a first attempt (0.90 / 0.77 / 0.66) was "too slow".
- Raise that word by 1.5-3 dB with 25-30 ms ramps in and out.
- A small pause after the word (about 0.28 s), then a longer hold on the key visual.
- Never slow the neighbouring words (an early version caught "quickly" and she noticed). Measure the word's start with the transcription and cut in the gap before it.
- Stretch the visuals by the same amount so the picture and voice stay in sync.

## Cutting the visuals to her voice

Record first, then build visuals to the real timing (never the other way round). Build a timeline table: line, start, end. Map every overlay, subtitle and sound time through the same function whenever a pause is inserted or removed (an inserted pause of x seconds shifts everything after it by x). Visual changes every 1.5-4 s; hold full graphics (such as the era timeline) for at least a second. After any edit re-check lip-sync points: label pop on the spoken word, subtitles following her phrases, etc.

## Rendering overlays and animation

- **Text and labels**: write HTML pages (1080 x 1920, transparent body) and screenshot them with Playwright (`omitBackground: true`), then `convert -trim` each PNG and note its offset, and overlay with ffmpeg at the recorded x, y.
- **ffmpeg overlay chain**: one input per overlay (`-loop 1 -t DUR -i file.png` or an image sequence `-framerate 30 -i dir/%03d.png`), `format=rgba, fade=t=in:st=0:d=0.08:alpha=1, fade=t=out:..., setpts=PTS-STARTPTS+START/TB`, then `overlay=x=..:y=..:eof_action=pass:enable='between(t,A,B)'`. **Never use `fade` with `d=0`: ffmpeg treats it as a 1-second fade** (a label once faded in over a full second). Wrap expressions in parentheses when adding offsets. Pop-in from above: `y + (-70 + 70*(t-a)/0.18)` for the first 0.18 s.
- **Animated graphics** (spotlight, magnifier, timeline, wiggle, RETAINED slam): render frames in Python/PIL or with the Web Animations API in Playwright (pause all animations, set `currentTime` per frame, screenshot), then encode to MP4 or use the PNG sequence as an overlay input.
- **Stills as motion**: `scale=2160:3840,zoompan=z='1+0.07*on/N':x=...:y=...:d=1:s=1080x1920:fps=30`. Clips are slowed with `setpts=K*PTS`; pad with `tpad=stop_mode=clone:stop_duration=0.5` so a short clip never runs out.
- Concatenate segments with the concat demuxer (`-c copy`) after encoding all with identical settings (`libx264 -crf 18 -pix_fmt yuv420p -r 30`).
- Check the result by extracting a contact sheet of frames and looking at it before delivering.

## Sound design and mix

- **Music**: an original synthesized bed (no copyright issues): about 92 BPM, A minor, F, C, G pad with a soft plucked arpeggio from bar 2 and a quiet kick on beats 1 and 3 plus hats from bar 3; fade out over the last 2 s. Normalize to about -27 LUFS.
- **Ambience**: the audio track of the generated clips (whoosh, chain jingle) extracted and time-aligned with the same speed changes as the video, with 0.12-0.15 s fades at segment edges; silence elsewhere. About -30 LUFS.
- **SFX** (about -29 LUFS), sparse: a paper "pop" when a label appears (not on every word), a soft low thump plus sparkle on the target word, a small pop per timeline item, a soft rising note per wiggle, at most two soft whooshes in the whole Reel. No whoosh on every cut, no pop on key-word graphics like CONTRAIL, no ticking or other sounds under props she did not ask for.
- **Mix**: voice stereo, `sidechaincompress=threshold=0.02:ratio=3:attack=80:release=1500:makeup=1` on the music keyed by the voice (slow release so short pauses do not make the music pump), `amix=inputs=4:normalize=0:duration=longest`, trim to the picture length, `loudnorm=I=-14:TP=-1.5:LRA=11`. If any sound is removed later, mute the region in the final normalized stem instead of re-running loudnorm (it would boost what remains).
- The whole mix runs on the final video length; if an edit changes length, re-time the music fade.

## End card and final assembly

Append the animated end card (see `visual-style.md`) after the last line: re-encode both parts to 30 fps `yuv420p`, normalize audio to 48 kHz stereo and join with `concat=n=2:v=1:a=1`. Then upload and show the result.

## Mistakes to avoid (lessons learned)

- A heavy denoise made the ending of the voice "iffy"; the real cause was a quiet take being boosted. Level per line and denoise lightly.
- Cutting a gap in the voice with digital silence, or cutting inside a soft consonant, made the edits audible.
- A pre-roll pause before the target word and a whole-word slowdown were both too noticeable; use the gradual three-slice version.
- Red marker outlines on every shot felt redundant; swoosh sounds on every cut felt annoying.
- Photos composited onto flat paper looked disconnected from the animated clips.
- Resolution matters: a 941 px-wide sheet gave 110 px per item. Ask for wider, fewer-per-image sheets.
- The English subtitle disappeared when she finished speaking; keep it until the slide changes.
- Don't assume files are visible across chat and sandbox; use the upload box for the sandbox.
