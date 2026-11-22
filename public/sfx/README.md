# Sound effects library for EnglishU Reels

Six folders (from "The VOX Sound Design System"): `mechanical`, `tech`, `tactile`, `ambience`, `whooshes`, `miscellaneous`.
135 synthesized WAV files (no licensing issues). Each sound has 2-4 variations: `paper_movement_01.wav`, `_02`, `_03`.
`manifest.json` lists every sound and its variations, so code can pick one at random.
Ambience files are ~8 s seamless loops. `electrical_hum` is in both `tech` and `ambience`.
`miscellaneous` holds extras not on the original cheat sheet: soft_thump_reveal, stamp_thud, tape_press, sparkle_soft.
Real recordings can be dropped into the same folders (same naming) at any time.

## Rules when building a Reel
- Levels: Sharon's voice about -6 dB, music about -5 dB, sound effects between -10 and -20 dB. In Remotion `volume` is linear: -10 dB = 0.32, -15 dB = 0.18, -20 dB = 0.10. Ambience loops very low (about 0.03-0.06).
- Duck the music under the voice.
- Hierarchy and restraint: sound-design only the most important thing on screen; ignore minor text and arrows.
- Be literal where it helps: marker_stroke for drawn lines, paper_movement/page_turn for articles, book_slide_on_desk for sliding cards, cloth_movement for collapsing windows, mouse_click/keyboard for UI, camera_shutter_mechanical for a flash, stopwatch_tick for charts and timers, soft_thump_reveal for a key reveal.
- Rotate variations: never use the same file twice in a row. Pick the next variation, a different sound, or stack two sounds (whoosh + paper).
- Sync can be a few frames loose (fits the stop-motion feel). Start the sound 1-3 frames BEFORE the visual (J-cut).
- At most TWO soft whooshes per Reel.
- Quiet ambience (room_tone, projector_hum, paper-like) under the whole Reel.
- Keep effects out of the exact moment Sharon says a target word, except a soft thump/sparkle that belongs to it.

## Remotion example
```tsx
import {Audio, Sequence, staticFile} from 'remotion';

// plays a paper sound starting 2 frames before the card appears at frame 90
<Sequence from={88}>
  <Audio src={staticFile('sfx/tactile/paper_movement_02.wav')} volume={0.2} />
</Sequence>

// quiet ambience under the whole Reel
<Audio src={staticFile('sfx/ambience/room_tone_01.wav')} volume={0.05} loop />
```
