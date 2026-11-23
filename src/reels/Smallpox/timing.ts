/**
 * Beats in frames (30 fps). Seconds are ESTIMATES from the word count (~2.6 Hebrew words/s);
 * with the real voiceover, edit ONLY the seconds in SEC.
 * Timed to the recorded voiceover (v33): 53.2 s story + 2.7 s end card = 55.9 s (Sharon allowed a couple of extra seconds; final pacing waits for her voiceover).
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const SEC = {
  hook: 0.0, // the real scar on grandma's arm (sticker): zoom all the way in, THEN the marker circle (2.5 s)
  patient: 3.5, // what smallpox looked like ("marked a disease")
  zero: 7.5, // 300M up, then down to 0 (crowd disappears)
  jenner: 13.8, // 1796: Jenner (named, on a clipping)
  quote: 18.3, // milkmaids: cowpox from cows
  vaccination: 22.9, // TARGET WORD 2: VACCINATION (vacca = cow), 3.5 s
  eradicate: 26.9, // WHO 1967 + TARGET WORD 1: ERADICATE (dust) + the English sentence
  outbreak: 32.7, // ring vaccination, needle moves person to person
  chart: 39.0, // reported cases fall to 0
  victory: 41.9, // map: dots thin out, last case (zoom in/out), grey, ERADICATED stamp (about 1.1 s fully visible), 1980
  flex: 49.9, // callback: the arm with the scar flexes (Rosie pose)
  end: 53.2, // end card
} as const;

export const T = {
  hook: f(SEC.hook),
  patient: f(SEC.patient),
  zero: f(SEC.zero),
  jenner: f(SEC.jenner),
  quote: f(SEC.quote),
  vaccination: f(SEC.vaccination),
  era: f(SEC.eradicate),
  outbreak: f(SEC.outbreak),
  chart: f(SEC.chart),
  victory: f(SEC.victory),
  flex: f(SEC.flex),
  end: f(SEC.end),
} as const;

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // 1677 frames = 55.9 s
