/**
 * Fonts: Anton (key words), Rubik + Heebo (Hebrew labels/subtitles), Frank Ruhl Libre (serif).
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
import {staticFile} from 'remotion';
import manifest from './fontManifest.json';
import specs from './fontSpecs.json';

type W = '400' | '700' | '800' | '900';
type S = 'latin' | 'hebrew';
const spec = (m: string) => specs.find((s) => s.module === m)!;
const opts = (m: string) => ({weights: spec(m).weights as W[], subsets: spec(m).subsets as S[]});

const LOCAL = process.env.REMOTION_LOCAL_FONTS === '1' && manifest.length > 0;

let families: {anton: string; rubik: string; heebo: string; frank: string};
if (LOCAL) {
  for (const f of manifest as Array<{family: string; weight: string; file: string; unicodeRange: string}>) {
    loadLocal({family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange});
  }
  families = {anton: 'Anton', rubik: 'Rubik', heebo: 'Heebo', frank: 'Frank Ruhl Libre'};
} else {
  families = {
    anton: loadAnton('normal', opts('Anton') as never).fontFamily,
    rubik: loadRubik('normal', opts('Rubik') as never).fontFamily,
    heebo: loadHeebo('normal', opts('Heebo') as never).fontFamily,
    frank: loadFrank('normal', opts('FrankRuhlLibre') as never).fontFamily,
  };
}

export const ANTON = families.anton;
export const RUBIK = families.rubik;
export const HEEBO = families.heebo;
export const FRANK = families.frank;
export const FONTS = families;
export type FontName = keyof typeof FONTS;
