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

// Timing locked to Sharon's voiceover (vo/clean/voice.wav, from "New Recording 27").
// Each scene: [start, end] in seconds. Subtitle phrases follow what she actually says.
export const SCENES = {
  s1: [0, 3.95],
  s2: [3.95, 8.7],
  s3: [8.7, 15.25],
  s4: [15.25, 20.3],
  s5: [20.3, 26.85],
  s6: [26.85, 30.95],
  s7: [30.95, 36.6],
  end: [36.6, 39.3],
} as const;

export const TOTAL_SEC = SCENES.end[1];

export type Sub = {from: number; to: number; text: string; lang?: 'he' | 'en'; key?: string};

// Subtitle phrases (absolute seconds). English lines stay until the scene changes.
export const SUBS: Sub[] = [
  {from: 0.1, to: 2.0, text: 'דבורה חוזרת לכוורת שלה'},
  {from: 2.0, to: 3.95, text: 'ומתחילה לרקוד,'},
  {from: 3.95, to: 5.95, text: 'אבל זה לא ריקוד של שמחה.'},
  {from: 5.95, to: 8.7, text: 'זו כתובת.'},
  {from: 8.85, to: 9.95, text: 'הזווית שלה מראה לה'},
  {from: 9.95, to: 11.5, text: 'את הכיוון ביחס לשמש,'},
  {from: 11.5, to: 13.6, text: 'וככל שהנענוע ארוך יותר,'},
  {from: 13.6, to: 15.25, text: 'האוכל רחוק יותר.'},
  {from: 15.25, to: 16.35, text: 'כלומר,'},
  {from: 16.35, to: 20.3, text: 'Bees convey precise directions through a dance.', lang: 'en', key: 'convey'},
  {from: 20.45, to: 21.95, text: 'ובחושך מוחלט,'},
  {from: 21.95, to: 23.95, text: 'אז איך שאר הדבורים מבינות?'},
  {from: 23.95, to: 25.3, text: 'הן קוראות את הריקוד'},
  {from: 25.3, to: 26.85, text: 'עם המחושים.'},
  {from: 27.0, to: 30.95, text: 'Scientists worked for years to decipher this dance.', lang: 'en', key: 'decipher'},
  {from: 31.1, to: 34.1, text: 'בקיצור, זה הוויז של הדבורים,'},
  {from: 34.1, to: 36.6, text: 'בלי אפליקציה ובלי צורך בקליטה.'},
];

export const sec = (s: number) => Math.round(s * FPS);

/** The one dash style (inspo): white, rounded ends, no dark backing. On white paper it gets a soft warm shadow. */
export const DASH = {color: '#fff', width: 6, array: '30 18', cap: 'round' as const};
export const PAPER_SHADOW = 'drop-shadow(0 2px 2.5px rgba(110,82,50,0.55))';
