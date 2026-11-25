v40 = unsped timeline in timing.ts/Root.tsx, then ffmpeg setpts=PTS/1.08,fps=30 + atempo=1.08 (replaces the x1.06 of v39). Pauses between lines trimmed to 0.14-0.5 s in the voice build.

v44: global speed 1.11 (voice +~3%), and the silent gaps between scenes (windows 3.05-3.50, 7.34-7.65, 10.77-11.18, 22.63-23.10, 26.66-27.18, 32.27-32.80, 34.69-35.16, 41.54-42.01, 52.22-52.60 on the unsped timeline) play at 2.2x via per-segment trim/setpts/atempo + concat. 59.6 s -> 52.2 s.

v46: replaced the 2.2x gap windows with beat-aligned cuts (one 8th note = 60/BPM/2 = 0.295 s removed from the middle of each gap, 12 ms crossfade, so the music grid never shifts) at unsped 3.12, 7.30, 10.82, 22.68, 26.70, 32.32, 34.74, 41.59, 52.20; then x1.11 over everything; the final 1.11 s (unsped) of the hold is cut with a 0.7 s fade-out. Result 50.3 s.

v51: do NOT use ffmpeg loudnorm on the final mix (its dynamic mode rides the gain by ~2 dB and pumps in the pauses). Use a fixed gain + limiter: ffmpeg -af "volume=2.44dB,alimiter=limit=0.84:attack=5:release=60:level=disabled" on mix13_cut.wav -> out/precut.wav, then tools/audio/smallpox_final_cut.py out/precut.wav 2.22 out/NAME.mp4 precut (speed 1.1655).
