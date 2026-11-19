// One-off: random "case" dots on land, in WorldMap's 1000x520 space (same projection as WorldMap.tsx).
import {createRequire} from 'module';
import fs from 'fs';
import {geoNaturalEarth1, geoContains, geoBounds} from 'd3-geo';
import {feature} from 'topojson-client';
const require = createRequire(import.meta.url);
const world = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-110m.json')));
const feats = feature(world, world.objects.countries).features.filter((f) => f.properties.name !== 'Antarctica' && f.properties.name !== 'Fiji');
// The 31 countries/territories with endemic smallpox in January 1967 (Fenner et al., WHO 1988, ch. 10), modern names.
const ENDEMIC_1967 = new Set(['Burundi','Dem. Rep. Congo','Ethiopia','Kenya','Malawi','Mozambique','Rwanda','South Africa','Zimbabwe','Uganda','Tanzania','Zambia','Cameroon','Benin','Ghana','Guinea','Liberia','Mali','Niger','Nigeria','Sierra Leone','Togo','Burkina Faso','Brazil','Afghanistan','Bangladesh','India','Indonesia','Nepal','Pakistan','Yemen']);
const proj = geoNaturalEarth1().fitSize([1000, 520], {type: 'FeatureCollection', features: feats});
const endemic = feats.filter((f) => ENDEMIC_1967.has(f.properties.name));
console.log('endemic polygons', endemic.length);
const bounds = endemic.map((f) => geoBounds(f));
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const w = (lon, lat) => {
  if (lon > 66 && lon < 96 && lat > 6 && lat < 32) return 1; // South Asia
  if (lon > -20 && lon < 52 && lat > -35 && lat < 16) return 0.8; // Africa
  if (lon > 96 && lon < 125 && lat > -10 && lat < 38) return 0.6; // East/SE Asia
  if (lon > -82 && lon < -35 && lat > -35 && lat < 12) return 0.55; // S America
  return 0.18;
};
// Evenly spread (Poisson-disk style) so the dots cover each endemic country, not clumps.
const out = [];
const MIN = 3.1;
const cand = [];
for (let i = 0; i < 400000; i++) {
  const lon = -180 + rnd() * 360;
  const lat = -58 + rnd() * 130;
  let hit = false;
  for (let k = 0; k < endemic.length && !hit; k++) {
    const [[a, b], [c, d]] = bounds[k];
    if (c < a ? false : lon < a || lon > c || lat < b || lat > d) continue;
    if (geoContains(endemic[k], [lon, lat])) hit = true;
  }
  if (!hit) continue;
  const p = proj([lon, lat]);
  if (p) cand.push(p);
}
const cell = MIN, grid = new Map();
const key = (x, y) => Math.floor(x / cell) + ',' + Math.floor(y / cell);
for (const p of cand) {
  const gx = Math.floor(p[0] / cell), gy = Math.floor(p[1] / cell);
  let ok = true;
  for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) {
    for (const q of grid.get((gx + dx) + ',' + (gy + dy)) || []) if ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 < MIN * MIN) { ok = false; break; }
  }
  if (!ok) continue;
  const k = key(p[0], p[1]);
  if (!grid.has(k)) grid.set(k, []);
  grid.get(k).push(p);
  out.push([Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
}
const som = proj([44.77, 1.72]);
fs.writeFileSync('src/reels/Smallpox/caseDots.json', JSON.stringify({dots: out, somalia: som.map((v) => Math.round(v * 10) / 10)}));
console.log(out.length, som);
