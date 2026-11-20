/**
 * Beats in frames (30 fps). Seconds are ESTIMATES from the word count (~2.6 Hebrew words/s);
 * with the real voiceover, edit ONLY the seconds in SEC.
 * Budget: 35.2 s story + 2.7 s end card = 37.9 s (Sharon allowed a couple of extra seconds; final pacing waits for her voiceover).
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const SEC = {
  hook: 0.0, // the real scar on grandma's arm (sticker): zoom all the way in, THEN the marker circle (2.5 s)
  patient: 2.5, // what smallpox looked like ("marked a disease")
  zero: 4.0, // 300M up, then down to 0 (crowd disappears)
  jenner: 7.7, // 1796: Jenner (named, on a clipping)
  quote: 10.3, // milkmaids: cowpox from cows
  vaccination: 12.5, // TARGET WORD 2: VACCINATION (vacca = cow), 3.5 s
  eradicate: 16.0, // WHO 1967 + TARGET WORD 1: ERADICATE (dust) + the English sentence
  outbreak: 21.4, // ring vaccination, needle moves person to person
  chart: 25.4, // reported cases fall to 0
  victory: 28.3, // map: dots thin out, last case (zoom in/out), grey, ERADICATED stamp (about 1.1 s fully visible), 1980
  flex: 33.9, // callback: the arm with the scar flexes (Rosie pose)
  end: 35.2, // end card
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

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // 1137 frames = 37.9 s
