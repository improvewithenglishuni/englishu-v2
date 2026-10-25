// Optional: downloads Remotion's free hosted sound effects into public/sfx so
// renders use local files. The kit already ships simple generated SFX
// (whoosh, pop, paper, tick, stamp); these are richer recorded alternatives.
// Run once: node scripts/fetch-sfx.mjs
import { mkdir, writeFile } from "node:fs/promises";

const NAMES = ["whoosh", "whip", "page-turn", "shutter-old", "switch", "mouse-click", "ding", "record-scratch"];

await mkdir("public/sfx/remotion", { recursive: true });
for (const name of NAMES) {
  const res = await fetch(`https://remotion.media/${name}.wav`);
  if (!res.ok) {
    console.warn(`✗ ${name}: HTTP ${res.status}`);
    continue;
  }
  await writeFile(`public/sfx/remotion/${name}.wav`, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ public/sfx/remotion/${name}.wav`);
}
