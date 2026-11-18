/**
 * Beats in frames (30 fps), derived from seconds. These are ESTIMATES from the script's word
 * count (~2.6 Hebrew words/s). When Sharon's voiceover exists, retime ONLY the seconds below.
 */
export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

/** start second of every script line (the end of one line is the start of the next) */
export const SEC = {
  l1: 0.0, // תסתכלו על הזרוע... רואים צלקת?
  l2: 3.4, // שלוש מאות מיליון, המאה ה-20
  l3: 6.6, // והיום? אפס
  l4: 8.4, // 1796, הפרה, החיסון הראשון
  l5: 13.0, // 1967 + the English sentence
  l5en: 15.0, // "They set out to eradicate smallpox, for good."
  l6: 17.6, // outbreak + rings
  l7: 25.0, // 1980, נגמר
  l8: 29.8, // the scar again, callback
  end: 34.6, // end card starts
} as const;

export const T = {
  // scene 1: arm + hook
  arm: f(0.0),
  hook: f(0.3),
  hookOut: f(3.2),
  scarArrow: f(1.3),
  // scene 2: 300M
  armOut: f(3.3),
  toll: f(3.5),
  tollLabel: f(4.3),
  people: f(4.0),
  tollOut: f(6.5),
  // scene 3: zero
  today: f(6.7),
  zero: f(7.2),
  zeroOut: f(8.3),
  // scene 4: cow 1796
  cow: f(8.6),
  year1796: f(8.8),
  firstVaccine: f(10.9),
  cowOut: f(12.8),
  // wipe to dark
  wipe1: f(12.8),
  // scene 5: eradicate
  year1967: f(13.3),
  keyword: f(15.0),
  split: f(15.5),
  swoosh: f(16.0),
  meaning: f(16.3),
  eradOut: f(17.4),
  // scene 6: outbreak + rings
  outbreakLabel: f(17.9),
  blob: f(18.1),
  arrows: f(18.7),
  ring3: f(19.1),
  ring2: f(20.6),
  ring1: f(22.0),
  blobOut: f(23.8),
  // scene 7: 1980
  ringsOut: f(25.0),
  y1980: f(25.4),
  declared: f(26.3),
  strikeLabel: f(27.2),
  strike: f(28.1),
  s7Out: f(29.6),
  // wipe back to light
  wipe2: f(29.5),
  // scene 8: callback
  arm2: f(30.3),
  closeLabel: f(31.2),
  // total
  end: f(34.6),
} as const;

export const TOTAL_FRAMES = T.end + Math.round(2.7 * FPS); // + end card
