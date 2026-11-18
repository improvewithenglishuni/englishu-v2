/** Hand-drawn SVG paths: wobbly arrows and the marker swoosh. Different for every seed. */
import {makeJitter, mulberry32} from './random';

type P = [number, number];

/** Catmull-Rom through points -> smooth cubic path. */
export const smoothPath = (pts: P[]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};

/** Wobbly line from a to b, bowed by `bend` (fraction of length, signed). */
export const wobblyLine = (a: P, b: P, seed: number, bend = 0.08, wobble = 2.2, n = 9): P[] => {
  const j = makeJitter(seed, [[3, wobble], [1.3, wobble * 0.4]]);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    const bow = Math.sin(Math.PI * t) * bend * len + j(i);
    return [a[0] + dx * t + nx * bow, a[1] + dy * t + ny * bow] as P;
  });
};

/** Arrow: shaft path + head path (open V). */
export const handArrow = (a: P, b: P, seed: number, bend = 0.08, head = 34) => {
  const shaftPts = wobblyLine(a, b, seed, bend);
  const n = shaftPts.length;
  const tip = shaftPts[n - 1];
  const prev = shaftPts[n - 2];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const rnd = mulberry32(seed + 99);
  const spread = (26 + rnd() * 8) * (Math.PI / 180);
  const l1 = head * (0.9 + rnd() * 0.25);
  const l2 = head * (0.9 + rnd() * 0.25);
  const h1: P = [tip[0] - Math.cos(ang - spread) * l1, tip[1] - Math.sin(ang - spread) * l1];
  const h2: P = [tip[0] - Math.cos(ang + spread) * l2, tip[1] - Math.sin(ang + spread) * l2];
  return {
    shaft: smoothPath(shaftPts),
    head: `M${h1[0].toFixed(1)},${h1[1].toFixed(1)} L${tip[0].toFixed(1)},${tip[1].toFixed(1)} L${h2[0].toFixed(1)},${h2[1].toFixed(1)}`,
  };
};

/** Arrows radiating from a centre (for "disperse"/"spread" moments). */
export const radialArrows = (
  cx: number,
  cy: number,
  count: number,
  inner: number,
  outer: number,
  seed = 4,
  outward = true,
) => {
  const rnd = mulberry32(seed);
  return Array.from({length: count}, (_, i) => {
    const ang = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.35;
    const r0 = inner * (0.85 + rnd() * 0.3);
    const r1 = outer * (0.8 + rnd() * 0.35);
    const a: P = [cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0];
    const b: P = [cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1];
    return {x1: outward ? a[0] : b[0], y1: outward ? a[1] : b[1], x2: outward ? b[0] : a[0], y2: outward ? b[1] : a[1], bend: (rnd() - 0.5) * 0.12, angle: ang};
  });
};

/** Z-shaped marker swoosh (top stroke, diagonal back, bottom stroke) + dry-brush tail lines. */
export const swooshPaths = (width: number, seed: number) => {
  const rnd = mulberry32(seed);
  const j = (k: number) => (rnd() - 0.5) * k;
  const w = width;
  const main: P[] = [
    [0 + j(10), 18 + j(8)],
    [w * 0.35, 6 + j(6)],
    [w * 0.72, -4 + j(6)],
    [w * 0.98 + j(10), -10 + j(6)],
    [w * 0.6, 26 + j(6)],
    [w * 0.22 + j(10), 68 + j(6)],
    [w * 0.5, 62 + j(4)],
    [w * 0.8, 58 + j(4)],
  ];
  const tailStart: P = main[main.length - 1];
  const tails = Array.from({length: 6}, (_, i) => {
    const dy = (i - 2.5) * 4.2 + j(2);
    const len = w * (0.22 + rnd() * 0.14);
    return smoothPath([
      [tailStart[0] - 20, tailStart[1] + dy],
      [tailStart[0] + len * 0.5, tailStart[1] + dy + j(3)],
      [tailStart[0] + len, tailStart[1] + dy - 2 + j(3)],
    ]);
  });
  return {main: smoothPath(main), tails};
};
