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
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  // Plain @font-face rules (always present), plus an explicit load we wait for, with a safety timeout.
  const style = document.createElement('style');
  style.textContent = faces
    .map(
      ([family, file, weight, range]) =>
        `@font-face{font-family:'${family}';src:url('${staticFile('fonts/' + file)}') format('woff2');font-weight:${weight};unicode-range:${range};font-display:block;}`,
    )
    .join('\n');
  document.head.appendChild(style);
  const handle = delayRender('fonts', {timeoutInMilliseconds: 60000});
  let done = false;
  const finish = () => {
    if (!done) {
      done = true;
      continueRender(handle);
    }
  };
  Promise.all(faces.map(([family, , weight]) => document.fonts.load(`${weight} 40px '${family}'`, 'אבג ABC')))
    .then(finish, finish);
  setTimeout(finish, 15000);
};
