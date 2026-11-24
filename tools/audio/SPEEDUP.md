v40 = unsped timeline in timing.ts/Root.tsx, then ffmpeg setpts=PTS/1.08,fps=30 + atempo=1.08 (replaces the x1.06 of v39). Pauses between lines trimmed to 0.14-0.5 s in the voice build.

v44: global speed 1.11 (voice +~3%), and the silent gaps between scenes (windows 3.05-3.50, 7.34-7.65, 10.77-11.18, 22.63-23.10, 26.66-27.18, 32.27-32.80, 34.69-35.16, 41.54-42.01, 52.22-52.60 on the unsped timeline) play at 2.2x via per-segment trim/setpts/atempo + concat. 59.6 s -> 52.2 s.
