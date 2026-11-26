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

// Script v3 (Sharon, 26 Nov). Timing is ESTIMATED until she records it; then re-time to vo/clean/voice.wav.
// Scene keys are names, not order: on screen the order is s1, s4, s2, s3, s5, s6, s8, s7, end.
export const SCENES = {
  s1: [0, 3.3], //  איך דבורות מתקשרות בלי מילים ובלי Waze?
  s4: [3.3, 8.0], // Bees convey precise directions to a food source by dancing.
  s2: [8.0, 10.4], // אבל זה לא סתם ריקוד:
  s3: [10.4, 17.4], // הזווית של הנענוע ... והמשך שלו ...
  s5: [17.4, 25.0], // ובכוורת יש חושך מוחלט ... כמו קוד סודי.
  s6: [25.0, 28.8], // Scientists worked for years to decipher this dance.
  s8: [28.8, 34.4], // והפענוח עבד: דבורה רובוטית ...
  s7: [34.4, 38.8], // בקיצור, מה ש-Waze עושה עם לוויינים, הדבורים עושות עם ריקוד.
  end: [38.8, 41.5],
} as const;

export const TOTAL_SEC = SCENES.end[1];

export type Sub = {from: number; to: number; text: string; lang?: 'he' | 'en'; key?: string};

// Subtitle phrases (absolute seconds, estimated). English lines stay until the scene changes.
export const SUBS: Sub[] = [
  {from: 0.1, to: 1.7, text: 'איך דבורות מתקשרות'},
  {from: 1.7, to: 3.3, text: 'בלי מילים ובלי Waze?'},
  {from: 3.4, to: 8.0, text: 'Bees convey precise directions to a food source by dancing.', lang: 'en', key: 'convey'},
  {from: 8.05, to: 10.4, text: 'אבל זה לא סתם ריקוד:'},
  {from: 10.45, to: 12.2, text: 'הזווית של הנענוע'},
  {from: 12.2, to: 13.8, text: 'אומרת לאיזה כיוון האוכל,'},
  {from: 13.8, to: 15.6, text: 'והמשך שלו'},
  {from: 15.6, to: 17.4, text: 'אומר כמה רחוק הוא נמצא.'},
  {from: 17.5, to: 19.3, text: 'ובכוורת יש חושך מוחלט,'},
  {from: 19.3, to: 21.0, text: 'אז הן לא רואות את הריקוד:'},
  {from: 21.0, to: 23.2, text: 'הן קוראות אותו עם המחושים,'},
  {from: 23.2, to: 25.0, text: 'כמו קוד סודי.'},
  {from: 25.1, to: 28.8, text: 'Scientists worked for years to decipher this dance.', lang: 'en', key: 'decipher'},
  {from: 28.9, to: 30.2, text: 'והפענוח עבד:'},
  {from: 30.2, to: 32.0, text: 'דבורה רובוטית רקדה את הקוד,'},
  {from: 32.0, to: 34.4, text: 'והדבורים האמיתיות כיוונו את הטיסה לפיו.'},
  {from: 34.5, to: 36.6, text: 'בקיצור, מה ש-Waze עושה עם לוויינים,'},
  {from: 36.6, to: 38.8, text: 'הדבורים עושות עם ריקוד.'},
];

export const sec = (s: number) => Math.round(s * FPS);

/** The one dash style (inspo): white, rounded ends, no dark backing. On white paper it gets a soft warm shadow. */
export const DASH = {color: '#fff', width: 6, array: '30 18', cap: 'round' as const};
export const PAPER_SHADOW = 'drop-shadow(0 2px 2.5px rgba(110,82,50,0.55))';
