/**
 * Beats in frames (30 fps). Seconds are ESTIMATES from the word count (~2.6 Hebrew words/s);
 * with the real voiceover, edit ONLY the seconds in SEC.
 * Budget: 32.2 s story + 2.7 s end card = 34.9 s (hard cap 35 s).
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export const SEC = {
  hook: 0.0, // the scar on grandma's arm = the mark of a disease that killed 300M
  zero: 4.4, // "and today? zero"
  jenner: 7.4, // 1796, cows
  wipe1: 13.0, // -> dark world
  eradicate: 13.0, // 1967 + the English sentence at 15.0
  outbreak: 18.9, // rings of vaccinators
  wipe2: 27.0, // -> light world
  victory: 27.0, // 1980, nagmar, scar = victory
  end: 32.2, // end card
} as const;

export const T = {
  hook: f(SEC.hook),
  zero: f(SEC.zero),
  jenner: f(SEC.jenner),
  wipe1: f(SEC.wipe1),
  era: f(SEC.eradicate),
  outbreak: f(SEC.outbreak),
  wipe2: f(SEC.wipe2),
  victory: f(SEC.victory),
  end: f(SEC.end),
} as const;

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // 1047 = 34.9 s
