/**
 * Fonts: Anton (key words), Rubik + Heebo (Hebrew labels/subtitles), Frank Ruhl Libre (Hebrew serif),
 * Playfair Display (Vox serif titles) and Barlow Condensed (Vox chart/axis sans).
 *
 * Default: @remotion/google-fonts (Studio and normal renders).
 * Set REMOTION_LOCAL_FONTS=1 to load the same files from public/fonts instead
 * (run `node scripts/fetch-fonts.mjs` once). Needed where the render browser has no internet.
 */
import {loadFont as loadLocal} from '@remotion/fonts';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadFrank} from '@remotion/google-fonts/FrankRuhlLibre';
import {loadFont as loadHeebo} from '@remotion/google-fonts/Heebo';
import {loadFont as loadRubik} from '@remotion/google-fonts/Rubik';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadDavid} from '@remotion/google-fonts/DavidLibre';
import {loadFont as loadAmatic} from '@remotion/google-fonts/AmaticSC';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {staticFile} from 'remotion';
import manifest from './fontManifest.json';
import specs from './fontSpecs.json';

type W = '400' | '700' | '800' | '900';
type S = 'latin' | 'hebrew';
const spec = (m: string) => specs.find((s) => s.module === m)!;
const opts = (m: string) => ({weights: spec(m).weights as W[], subsets: spec(m).subsets as S[]});

const LOCAL = process.env.REMOTION_LOCAL_FONTS === '1' && manifest.length > 0;

let families: {anton: string; rubik: string; heebo: string; frank: string; playfair: string; barlow: string; david: string; hand: string};
if (LOCAL) {
  for (const f of manifest as Array<{family: string; weight: string; file: string; unicodeRange: string}>) {
    loadLocal({family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange});
  }
  families = {anton: 'Anton', rubik: 'Rubik', heebo: 'Heebo', frank: 'Frank Ruhl Libre', playfair: 'Playfair Display', barlow: 'Barlow Condensed', david: 'David Libre', hand: 'Amatic SC'};
} else {
  families = {
    anton: loadAnton('normal', opts('Anton') as never).fontFamily,
    rubik: loadRubik('normal', opts('Rubik') as never).fontFamily,
    heebo: loadHeebo('normal', opts('Heebo') as never).fontFamily,
    frank: loadFrank('normal', opts('FrankRuhlLibre') as never).fontFamily,
    playfair: loadPlayfair('normal', {weights: ['700', '900'], subsets: ['latin']} as never).fontFamily,
    barlow: loadBarlow('normal', {weights: ['700', '800'], subsets: ['latin']} as never).fontFamily,
    david: loadDavid('normal', opts('DavidLibre') as never).fontFamily,
    hand: loadAmatic('normal', {weights: ['700'], subsets: ['hebrew', 'latin']} as never).fontFamily,
  };
}

export const ANTON = families.anton;
export const RUBIK = families.rubik;
export const HEEBO = families.heebo;
export const FRANK = families.frank;
/** Vox serif titles (Latin) and condensed bold sans labels (Latin). Hebrew falls back to Frank Ruhl / Heebo. */
export const PLAYFAIR = families.playfair;
export const BARLOW = families.barlow;
export const FONTS = families;
export type FontName = keyof typeof FONTS;

export const DAVID = families.david;
/** Handwriting (Hebrew + Latin) for name tags only. */
export const HAND = families.hand;
/**
 * ONE typeface per video, chosen by the theme's `typeface` (see theme.ts) and applied to every
 * Vox-kit element through the CSS variable --kit-font set by <World>. Both cover Hebrew AND Latin.
 *  modern   = Rubik       (airplane / tech / science / today topics)
 *  historic = David Libre (smallpox, history, empires, old documents)
 */
export const TYPEFACES = {
  modern: `${RUBIK}, ${HEEBO}, sans-serif`,
  historic: `${DAVID}, ${FRANK}, serif`,
} as const;
export type Typeface = keyof typeof TYPEFACES;
