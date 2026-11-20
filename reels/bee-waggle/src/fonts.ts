import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string, string?][] = [
  ['Rubik', 'rubik-hebrew-500-normal.woff2', '500', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['Rubik', 'rubik-hebrew-700-normal.woff2', '700', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['Rubik', 'rubik-hebrew-800-normal.woff2', '800', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['Rubik', 'rubik-hebrew-900-normal.woff2', '900', 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F'],
  ['Rubik', 'rubik-latin-500-normal.woff2', '500', 'U+0000-00FF, U+2190-21FF, U+2000-206F'],
  ['Rubik', 'rubik-latin-700-normal.woff2', '700', 'U+0000-00FF, U+2190-21FF, U+2000-206F'],
  ['Rubik', 'rubik-latin-800-normal.woff2', '800', 'U+0000-00FF, U+2190-21FF, U+2000-206F'],
  ['Rubik', 'rubik-latin-900-normal.woff2', '900', 'U+0000-00FF, U+2190-21FF, U+2000-206F'],
  ['Anton', 'anton-latin-400-normal.woff2', '400'],
];

let started = false;
export const loadFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('fonts');
  Promise.all(
    faces.map(([family, file, weight, range]) => {
      const ff = new FontFace(family, `url(${staticFile('fonts/' + file)}) format('woff2')`, {
        weight,
        ...(range ? {unicodeRange: range} : {}),
      });
      return ff.load().then((loaded) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded));
    }),
  ).then(() => continueRender(handle));
};
