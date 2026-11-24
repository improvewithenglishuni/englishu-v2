// node tools/stills.mjs out/stills 10 50 90 ...  (scale 0.5) — bundles once, renders many stills
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const opts = {serveUrl, id: 'FortuneReel', browserExecutable: '/usr/bin/google-chrome', chromiumOptions: {gl: 'swangle'}};
const composition = await selectComposition(opts);
for (const f of frames) {
  await renderStill({...opts, composition, frame: Number(f), output: `${out}/f${String(f).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', scale: 0.5});
  console.log('still', f);
}
