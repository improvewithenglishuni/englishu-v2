import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const HE = 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F';
const LA = 'U+0000-00FF, U+2190-21FF, U+2000-206F';
const faces: [string, string, string, string][] = [
  ['Rubik', 'rubik-hebrew-500-normal.woff2', '500', HE],
  ['Rubik', 'rubik-hebrew-700-normal.woff2', '700', HE],
  ['Rubik', 'rubik-hebrew-800-normal.woff2', '800', HE],
  ['Rubik', 'rubik-hebrew-900-normal.woff2', '900', HE],
  ['Rubik', 'rubik-latin-500-normal.woff2', '500', LA],
  ['Rubik', 'rubik-latin-700-normal.woff2', '700', LA],
  ['Rubik', 'rubik-latin-800-normal.woff2', '800', LA],
  ['Rubik', 'rubik-latin-900-normal.woff2', '900', LA],
  ['Anton', 'anton-latin-400-normal.woff2', '400', LA],
  ['Amatic SC', 'amatic-sc-hebrew-700-normal.woff2', '700', HE],
  ['Amatic SC', 'amatic-sc-latin-700-normal.woff2', '700', LA],
  ['Patrick Hand SC', 'patrick-hand-sc-latin-400-normal.woff2', '400', LA],
  ['Londrina Solid', 'londrina-solid-latin-400-normal.woff2', '400', LA],
  ['Londrina Solid', 'londrina-solid-latin-900-normal.woff2', '900', LA],
];

let ready: Promise<void> | null = null;

/** Inject @font-face rules once and return a promise that resolves when the faces are loaded (max 8 s). */
export const fontsReady = (): Promise<void> => {
  if (ready) return ready;
  if (typeof document === 'undefined') return Promise.resolve();
  const style = document.createElement('style');
  style.textContent = faces
    .map(
      ([family, file, weight, range]) =>
        `@font-face{font-family:'${family}';src:url('${staticFile('fonts/' + file)}') format('woff2');font-weight:${weight};unicode-range:${range};font-display:block;}`,
    )
    .join('\n');
  document.head.appendChild(style);
  const load = Promise.all(faces.map(([family, , weight]) => document.fonts.load(`${weight} 40px '${family}'`, 'אבג ABC'))).then(
    () => undefined,
    () => undefined,
  );
  ready = Promise.race([load, new Promise<void>((r) => setTimeout(r, 8000))]);
  return ready;
};

/** Hook: hold the frame until the fonts are ready (documented delayRender-in-component pattern). */
export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', {timeoutInMilliseconds: 60000}));
  useEffect(() => {
    fontsReady().then(() => continueRender(handle));
  }, [handle]);
};
