/**
 * Beats in frames (30 fps). Seconds are ESTIMATES from the word count (~2.6 Hebrew words/s);
 * with the real voiceover, edit ONLY the seconds in SEC.
 * Budget: 33.2 s story + 2.7 s end card = 35.9 s (Sharon allowed a couple of extra seconds: ERADICATE holds 1 s longer).
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const SEC = {
  hook: 0.0, // the real scar on grandma's arm (sticker)
  patient: 2.2, // what smallpox looked like ("marked a disease")
  zero: 3.7, // 300M up, then down to 0 (crowd disappears)
  jenner: 7.4, // 1796: Jenner (named, on a clipping)
  quote: 10.0, // milkmaids: cowpox from cows
  vaccination: 12.2, // TARGET WORD 2: VACCINATION (vacca = cow), 3.2 s
  eradicate: 15.4, // WHO 1967 + TARGET WORD 1: ERADICATE (vanishes) + the English sentence
  outbreak: 20.8, // ring vaccination, needle moves person to person
  chart: 24.8, // reported cases fall to 0
  victory: 27.7, // map: case dots fade, last case (zoom in/out), grey, ERADICATED stamp, 1980
  flex: 31.9, // callback: the arm with the scar flexes (Rosie pose)
  end: 33.2, // end card
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

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // 1047 = 34.9 s
