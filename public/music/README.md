# Music beds for EnglishU Reels

Five warm solo-piano tracks, written new (not copied) in the style of Sharon's reference recordings 16-20.
Rendered from MIDI with the FluidR3 grand piano (free soundfont, MIT licence), soft touch, sustain pedal,
warm EQ and a small room reverb. 48 kHz stereo WAV, loudness-normalized to about -18 LUFS.

| File | Reference | Tempo | Chords | Feel |
|---|---|---|---|---|
| `piano_d_major_80bpm.wav` | Rec 17 | 80 BPM, triplet 8ths | D, D, Em, A, D | gentle, flowing arpeggios |
| `piano_g_major_107bpm.wav` | Rec 16 | 107 BPM, 8ths | G, Gmaj7, Bm, Bm7, Em, D, G | high, bell-like arpeggios |
| `piano_a_minor_112bpm.wav` | Rec 18 | 112 BPM, 16ths | Am, C/G, Fmaj7, G, Am, Dm, E, Am | moving 16ths over a low A bass |
| `piano_c_major_rhythmic_92bpm.wav` | Rec 19 | 92 BPM, 16ths | C, C, Ab, C, F, Ab, G, C | syncopated short chords (3-3-2) + soft shaker |
| `piano_g_major_bright_112bpm.wav` | Rec 20 | 112 BPM, 8ths | G, Em, C, G/B, C, G, D, G | arpeggios with long high melody notes |

Each ends on a held tonic chord with a fade, so it can be trimmed or looped at a bar line.

## Using in a Reel
Music sits under the voice at about -5 dB and is ducked while Sharon speaks (see `public/sfx/README.md` for the full mix levels).

```tsx
<Audio src={staticFile('music/piano_d_major_80bpm.wav')} volume={0.3} />
```

## Regenerating / making more
Scripts are in `tools/music/` (`pianolib.py` = renderer, `tracks.py` = tracks 16/18/19/20, `piano17.py` = the D-major track).
They need `fluidsynth`, `fluid-soundfont-gm`, and Python `numpy scipy mido`.
