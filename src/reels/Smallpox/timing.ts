/**
 * Beats in frames (30 fps). Seconds are ESTIMATES from the word count (~2.6 Hebrew words/s);
 * with the real voiceover, edit ONLY the seconds in SEC.
 * Budget: 32.2 s story + 2.7 s end card = 34.9 s (hard cap 35 s).
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const SEC = {
  hook: 0.0, // the scar on grandma's arm = the mark of a disease that killed 300M
  zero: 2.2, // 300M up, then down to 0
  jenner: 7.4, // 1796: Jenner portrait sticker + name label
  quote: 10.0, // painting of the vaccination as a sticker
  vaccination: 12.2, // TARGET WORD 2: VACCINATION (vacca = cow)
  wipe1: 14.0, // -> peri plate
  eradicate: 14.0, // 1967 + TARGET WORD 1: ERADICATE (uprooted) + the English sentence
  outbreak: 19.1, // rings of vaccinators
  wipe2: 27.0, // -> light world
  victory: 27.0, // 1980, nagmar, scar = victory
  end: 32.2, // end card
} as const;

export const T = {
  hook: f(SEC.hook),
  zero: f(SEC.zero),
  jenner: f(SEC.jenner),
  quote: f(SEC.quote),
  vaccination: f(SEC.vaccination),
  wipe1: f(SEC.wipe1),
  era: f(SEC.eradicate),
  outbreak: f(SEC.outbreak),
  wipe2: f(SEC.wipe2),
  victory: f(SEC.victory),
  end: f(SEC.end),
} as const;

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // 1047 = 34.9 s
