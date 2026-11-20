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

// Placeholder timing (seconds) until the real voiceover is recorded.
// Each scene: [start, end]. Re-time these to the recording; everything else follows.
export const SCENES = {
  s1: [0, 3.0],
  s2: [3.0, 6.0],
  s3: [6.0, 13.0],
  s4: [13.0, 17.0],
  s5: [17.0, 24.0],
  s6: [24.0, 28.0],
  s7: [28.0, 32.4],
  end: [32.4, 35.1],
} as const;

export const TOTAL_SEC = SCENES.end[1];

export type Sub = {from: number; to: number; text: string; lang?: 'he' | 'en'; key?: string};

// Subtitle phrases (absolute seconds). English lines stay until the scene changes.
export const SUBS: Sub[] = [
  {from: 0.15, to: 1.6, text: 'דבורה חוזרת לכוורת...'},
  {from: 1.6, to: 3.0, text: 'ומתחילה לרקוד.'},
  {from: 3.1, to: 4.4, text: 'זה לא ריקוד של שמחה.'},
  {from: 4.4, to: 6.0, text: 'זו כתובת.'},
  {from: 6.1, to: 8.0, text: 'הזווית של הדבורה מראה את הכיוון,'},
  {from: 8.0, to: 9.5, text: 'ביחס לשמש.'},
  {from: 9.6, to: 10.8, text: 'ואורך הנענוע?'},
  {from: 10.8, to: 11.9, text: 'ככל שהוא ארוך יותר,'},
  {from: 11.9, to: 13.0, text: 'האוכל רחוק יותר.'},
  {from: 13.15, to: 17.0, text: 'Bees convey precise directions through a dance.', lang: 'en', key: 'convey'},
  {from: 17.15, to: 19.1, text: 'והכול קורה בחושך מוחלט.'},
  {from: 19.1, to: 21.0, text: 'אז איך שאר הדבורים מבינות?'},
  {from: 21.0, to: 22.5, text: 'הן קוראות את הריקוד'},
  {from: 22.5, to: 24.0, text: 'עם המחושים.'},
  {from: 24.15, to: 28.0, text: 'Scientists worked for years to decipher this dance.', lang: 'en', key: 'decipher'},
  {from: 28.15, to: 29.9, text: 'בפעם הבאה שתראו דבורה, תזכרו:'},
  {from: 29.9, to: 32.4, text: 'ייתכן שהיא רק עכשיו קיבלה כתובת.'},
];

export const sec = (s: number) => Math.round(s * FPS);
