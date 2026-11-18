/**
 * SVG clip-path generator for torn paper (same idea as tools/make_torn.py).
 * Every function returns an SVG path string in pixel units, usable as
 * `clipPath: \`path("${d}")\`` in CSS or as <path d={d}/> in SVG.
 */
import {makeJitter} from './random';

export type TornOptions = {
  seed?: number;
  /** big bulges [wavelength, amplitude] */
  big?: [number, number];
  mid?: [number, number];
  small?: [number, number];
  step?: number;
};

const jitterFor = (o: TornOptions, salt: number) =>
  makeJitter((o.seed ?? 1) * 13 + salt, [o.big ?? [170, 30], o.mid ?? [42, 9], o.small ?? [9, 2.2]]);

const fmt = (n: number) => n.toFixed(1);

/** A horizontal strip from x=0..length, centred on y=0, both long sides torn. */
export const tornStripPath = (
  length: number,
  width: number,
  o: TornOptions & {taper?: number; ends?: 'cut' | 'torn'} = {},
) => {
  const step = o.step ?? 6;
  const top = jitterFor(o, 1);
  const bot = jitterFor(o, 2);
  const taper = o.taper ?? 1;
  const w = (x: number) => (width * (1 + (taper - 1) * (x / length))) / 2;
  const pts: string[] = [];
  for (let x = 0; x <= length; x += step) pts.push(`${fmt(x)},${fmt(-w(x) + top(x))}`);
  for (let x = length; x >= 0; x -= step) pts.push(`${fmt(x)},${fmt(w(x) + bot(x))}`);
  return `M${pts.join(' L')} Z`;
};

/** A rectangle whose four sides are slightly irregular (labels, paper cards). */
export const tornRectPath = (w: number, h: number, o: TornOptions = {}) => {
  const step = o.step ?? 8;
  const opt = {big: [120, 3] as [number, number], mid: [30, 1.6] as [number, number], small: [7, 0.8] as [number, number], ...o};
  const j = [1, 2, 3, 4].map((s) => jitterFor(opt, s));
  const pts: string[] = [];
  for (let x = 0; x <= w; x += step) pts.push(`${fmt(x)},${fmt(j[0](x))}`);
  for (let y = 0; y <= h; y += step) pts.push(`${fmt(w + j[1](y))},${fmt(y)}`);
  for (let x = w; x >= 0; x -= step) pts.push(`${fmt(x)},${fmt(h + j[2](x))}`);
  for (let y = h; y >= 0; y -= step) pts.push(`${fmt(j[3](y))},${fmt(y)}`);
  return `M${pts.join(' L')} Z`;
};

/**
 * Points of a torn edge line crossing a frame. The line passes through (cx, cy) with
 * direction `angleDeg`; returns points from -half..+half along it.
 */
export const tornEdgePoints = (
  cx: number,
  cy: number,
  angleDeg: number,
  half: number,
  o: TornOptions = {},
) => {
  const step = o.step ?? 6;
  const j = jitterFor(o, 5);
  const a = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const pts: Array<[number, number]> = [];
  for (let s = -half; s <= half; s += step) {
    const off = j(s + half);
    pts.push([cx + ux * s - uy * off, cy + uy * s + ux * off]);
  }
  return pts;
};

/** Closed region on one side of a torn edge (side = +1: the side the normal points to). */
export const tornHalfPlanePath = (pts: Array<[number, number]>, angleDeg: number, side: 1 | -1, reach = 4000) => {
  const a = (angleDeg * Math.PI) / 180;
  const nx = -Math.sin(a) * side * reach;
  const ny = Math.cos(a) * side * reach;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const body = pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' L');
  return `M${body} L${fmt(last[0] + nx)},${fmt(last[1] + ny)} L${fmt(first[0] + nx)},${fmt(first[1] + ny)} Z`;
};

/** Band between an edge and a copy offset by a varying width toward `side` (the torn fibre margin). */
export const tornBandPath = (
  pts: Array<[number, number]>,
  angleDeg: number,
  side: 1 | -1,
  width: [number, number],
  seed = 3,
) => {
  const a = (angleDeg * Math.PI) / 180;
  const nx = -Math.sin(a) * side;
  const ny = Math.cos(a) * side;
  const jw = makeJitter(seed * 17, [[90, 1], [20, 0.35]]);
  const inner = pts.map(([x, y], i) => {
    const t = Math.max(0, Math.min(1, (jw(i * 6) + 1) / 2));
    const w = width[0] + (width[1] - width[0]) * t;
    return [x + nx * w, y + ny * w] as [number, number];
  });
  const outer = pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' L');
  const back = inner
    .reverse()
    .map(([x, y]) => `${fmt(x)},${fmt(y)}`)
    .join(' L');
  return `M${outer} L${back} Z`;
};
