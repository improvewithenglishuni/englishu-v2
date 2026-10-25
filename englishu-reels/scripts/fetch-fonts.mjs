// Downloads the Vox kit fonts (Hebrew + Latin subsets) into public/fonts so
// previews and renders work offline and never depend on Google's servers.
// Run once: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from "node:fs/promises";

const FONTS = [
  { module: "SecularOne", weights: ["400"] },
  { module: "Heebo", weights: ["500", "800", "900"] },
  { module: "Anton", weights: ["400"] },
  { module: "FrankRuhlLibre", weights: ["500", "900"] },
  { module: "RubikDirt", weights: ["400"] },
  { module: "SpecialElite", weights: ["400"] },
];
const SUBSETS = ["hebrew", "latin", "latin-ext"];

await mkdir("public/fonts", { recursive: true });
const manifest = [];
for (const { module, weights } of FONTS) {
  const info = (await import(`@remotion/google-fonts/${module}`)).getInfo();
  for (const weight of weights) {
    for (const subset of SUBSETS) {
      const url = info.fonts.normal?.[weight]?.[subset];
      if (!url) continue;
      const file = `fonts/${module}-${weight}-${subset}.woff2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} for ${url}`);
      await writeFile(`public/${file}`, Buffer.from(await res.arrayBuffer()));
      manifest.push({ family: info.fontFamily, weight, file, unicodeRange: info.unicodeRanges[subset] });
      console.log("✓", file);
    }
  }
}
await writeFile("src/vox/fonts.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`Saved ${manifest.length} font files and src/vox/fonts.json`);
