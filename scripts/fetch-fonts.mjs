// Downloads the exact Google Font files that src/kit/fonts.ts uses into public/fonts/,
// for renders on machines where the headless browser cannot reach Google Fonts.
// Usage: node scripts/fetch-fonts.mjs   then render with REMOTION_LOCAL_FONTS=1
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const specs = JSON.parse(fs.readFileSync('src/kit/fontSpecs.json', 'utf8'));
const outDir = 'public/fonts';
fs.mkdirSync(outDir, {recursive: true});
const manifest = [];
const seen = new Map();
for (const s of specs) {
  const info = require(`@remotion/google-fonts/${s.module}`).getInfo();
  for (const w of s.weights) {
    for (const sub of s.subsets) {
      const url = info.fonts.normal[w][sub];
      let file = seen.get(url);
      if (!file) {
        file = `${s.module}-${sub}-${path.basename(new URL(url).pathname)}`;
        if (!fs.existsSync(path.join(outDir, file))) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${res.status} ${url}`);
          fs.writeFileSync(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
          console.log('fetched', file);
        }
        seen.set(url, file);
      }
      manifest.push({family: info.fontFamily, weight: w, subset: sub, file, unicodeRange: info.unicodeRanges[sub]});
    }
  }
}
fs.writeFileSync('src/kit/fontManifest.json', JSON.stringify(manifest, null, 1));
console.log(`wrote ${manifest.length} faces (files in ${outDir}, list in src/kit/fontManifest.json)`);
