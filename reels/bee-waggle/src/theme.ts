// Bee waggle dance Reel: one world, one palette.
// World: white squiggle paper (attached plate) + sage paper strips + honey-amber accent,
// rust-brown branch, dark honey-brown for the "inside the hive" beat (the one dark variant).

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  paper: '#EEF0EE',
  sage: '#D6DED7',
  sageDark: '#B9C6BC',
  ink: '#2A1A0F', // dark brown text / outlines
  amber: '#E9A23B', // THE accent (key words, dance path, angle)
  amberDeep: '#C9811F',
  rust: '#7E2A12', // branch, stamp
  stampRed: '#B5341F',
  hive: '#2B1A0E', // dark variant base
  hiveMid: '#4A2E16',
  cream: '#FAF7F0',
  key: '#C8294A', // crimson for the English key words (inspo 'ROUND AND WAGGLE')
  comb: '#C9A266', // tan honeycomb (inspo)
  combDark: '#B48A50',
  wood: '#C8A57A',
  woodLight: '#E3CBA8',
  woodDark: '#9C7A52',
  sky: '#BFDDF0',
  hill1: '#A9C3D8',
  hill2: '#7FA9C6',
  hill3: '#5F8DB0',
  meadow: '#7DBB6E',
  meadowDark: '#4E9A5B',
  // brand: end card ONLY
  navy: '#0A2370',
  red: '#B01F25',
  brandCream: '#F5F0E5',
};

export const FONT_HE = "'Rubik', sans-serif";
// Key English words: rounded hand-drawn condensed caps (inspo 'ROUND AND WAGGLE').
export const FONT_KEY = "'Londrina Solid', 'Anton', 'Rubik', sans-serif";
// Hand-lettered diagram annotations (the Vox / inspo look): English in Patrick Hand SC, Hebrew in Amatic SC.
export const FONT_HAND = "'Londrina Solid', 'Patrick Hand SC', sans-serif";
export const FONT_HAND_HE = "'Amatic SC', 'Patrick Hand SC', sans-serif";

/**
 * Real footage (CC-licensed, from Wikimedia Commons). Run scripts/fetch_media.sh to download and cut
 * the clips into public/media/. Credits for the Instagram caption:
 *   "Waggle dance footage: OakleyOrig (CC BY 2.0); Su et al. 2008, PLoS ONE (CC BY 3.0), via Wikimedia Commons"
 */
export const MEDIA = {
  hive: 'media/hive.mp4', // full-frame hive interior, beat 5
  comb: 'media/comb.mp4', // square crop for the magnifier lens, beats 1 and 7
  dancer: 'media/dancer.mp4', // red-dot dancer with followers, antennae moment in beat 5
};

// Script v3, timed to Sharon's voiceover (vo/clean/voice.wav from "New Recording 34" + "33").
// Scene keys are names, not order: on screen the order is s1, s4, s3, s5, s6, s8, s7, end.
// (s2, the stand-alone figure-eight, is no longer used: the angle frame now shows the figure-eight itself.)
export const SCENES = {
  s1: [0, 4.0], //  איך דבורות מתקשרות בלי מילים ובלי Waze?
  s4: [4.0, 8.45], // Bees convey precise directions to a food source by dancing.
  s3: [8.45, 15.75], // אבל זה לא סתם ריקוד: הזווית ... והמשך שלו ...
  s5: [15.75, 23.0], // ובכוורת יש חושך מוחלט ... כמו קוד סודי.
  s6: [23.0, 26.85], // Scientists worked for years to decipher this dance.
  s8: [26.85, 33.35], // והפענוח עבד: דבורה רובוטית ...
  s7: [33.35, 38.2], // בקיצור, מה ש-Waze עושה עם לוויינים, הדבורים עושות עם ריקוד.
  end: [38.2, 40.9],
} as const;

export const TOTAL_SEC = SCENES.end[1];

export type Sub = {from: number; to: number; text: string; lang?: 'he' | 'en'; key?: string};

// Subtitle phrases (absolute seconds), following what she actually says.
export const SUBS: Sub[] = [
  {from: 0.1, to: 1.6, text: 'איך דבורות מתקשרות'},
  {from: 1.6, to: 4.0, text: 'בלי מילים ובלי Waze?'},
  {from: 4.0, to: 8.45, text: 'Bees convey precise directions to a food source by dancing.', lang: 'en', key: 'convey'},
  {from: 8.45, to: 9.76, text: 'אבל זה לא סתם ריקוד:'},
  {from: 9.76, to: 11.1, text: 'הזווית של הנענוע'},
  {from: 11.1, to: 12.72, text: 'אומרת לאיזה כיוון האוכל,'},
  {from: 12.72, to: 13.98, text: 'והמשך שלו'},
  {from: 13.98, to: 15.75, text: 'אומר כמה רחוק הוא נמצא.'},
  {from: 15.8, to: 17.68, text: 'ובכוורת יש חושך מוחלט,'},
  {from: 17.68, to: 19.04, text: 'אז הן לא רואות את הריקוד:'},
  {from: 19.04, to: 20.78, text: 'הן קוראות אותו עם המחושים,'},
  {from: 20.78, to: 23.0, text: 'כמו קוד סודי.'},
  {from: 23.1, to: 26.85, text: 'Scientists worked for years to decipher this dance.', lang: 'en', key: 'decipher'},
  {from: 26.88, to: 28.22, text: 'והפענוח עבד:'},
  {from: 28.22, to: 30.24, text: 'דבורה רובוטית רקדה את הקוד,'},
  {from: 30.24, to: 33.35, text: 'והדבורים האמיתיות כיוונו את הטיסה לפיו.'},
  {from: 33.6, to: 35.98, text: 'בקיצור, מה ש-Waze עושה עם לוויינים,'},
  {from: 35.98, to: 38.2, text: 'הדבורים עושות עם ריקוד.'},
];

export const sec = (s: number) => Math.round(s * FPS);

/** The one dash style (inspo): white, rounded ends, no dark backing. On white paper it gets a soft warm shadow. */
export const DASH = {color: '#fff', width: 6, array: '30 18', cap: 'round' as const};
export const PAPER_SHADOW = 'drop-shadow(0 2px 2.5px rgba(110,82,50,0.55))';
