import React, {useId} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP, SETTLE} from './motion';
import {useUi} from './theme';

export const ringPositions = (cx: number, cy: number, r: number, n: number, rot = 0) =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rot;
    return {x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r};
  });

export const gridPositions = (x0: number, y0: number, cols: number, rows: number, dx: number, dy: number) =>
  Array.from({length: cols * rows}, (_, i) => ({x: x0 + (i % cols) * dx, y: y0 + Math.floor(i / cols) * dy, col: i % cols, row: Math.floor(i / cols)}));

const BODY = 'M28 52 L72 52 L80 104 L66 104 L63 150 L53 150 L50 118 L47 150 L37 150 L34 104 L20 104 Z';

export type PersonTone = 'ink' | 'faded' | 'red' | 'white';

/**
 * The Vox pictogram: a hand-inked black figure, optionally with a fuzzy ink halo (infected /
 * focus), a soft yellow glow (being vaccinated) and a dashed box (the patient). Centre-anchored,
 * `size` = figure height in px.
 */
export const Person: React.FC<{
  x: number;
  y: number;
  size?: number;
  tone?: PersonTone;
  /** halo colour (fuzzy ink edge), e.g. ui.halo; undefined = none */
  halo?: string;
  glow?: string;
  dashed?: boolean;
  at?: number;
  exitAt?: number;
  rotate?: number;
}> = ({x, y, size = 150, tone = 'ink', halo, glow, dashed, at = 0, exitAt, rotate = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const id = useId().replace(/:/g, '');
  const s = pop(frame, at, fps, POP);
  const e = exitFactor(frame, exitAt, fps);
  const k = clamp01(s) * e;
  if (k <= 0.001) return null;
  const fill = {ink: ui.black, faded: '#5A4A52', red: '#E0615E', white: '#F4F3F9'}[tone];
  const w = size * 0.8;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - size / 2, width: w, height: size, transform: `scale(${s * e}) rotate(${rotate}deg)`, transformOrigin: '50% 60%', opacity: tone === 'faded' ? 0.85 : 1}}>
      <svg viewBox="0 0 100 160" width={w} height={size} style={{overflow: 'visible'}}>
        <defs>
          <filter id={`r${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
          <filter id={`h${id}`} x="-60%" y="-40%" width="220%" height="180%">
            <feMorphology operator="dilate" radius="6" in="SourceAlpha" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="8" result="n" />
            <feDisplacementMap in="d" in2="n" scale="10" result="x" />
            <feGaussianBlur in="x" stdDeviation="1.6" />
          </filter>
          <filter id={`g${id}`} x="-100%" y="-80%" width="300%" height="260%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        {glow ? (
          <g filter={`url(#g${id})`} opacity={0.9}>
            <circle cx="50" cy="28" r="26" fill={glow} />
            <path d={BODY} fill={glow} />
          </g>
        ) : null}
        {halo ? (
          <g filter={`url(#h${id})`} opacity={0.9} fill={halo}>
            <circle cx="50" cy="28" r="19" />
            <path d={BODY} />
          </g>
        ) : null}
        <g filter={`url(#r${id})`} fill={fill}>
          <circle cx="50" cy="28" r="19" />
          <path d={BODY} />
        </g>
        {dashed ? <rect x="-6" y="-10" width="112" height="176" fill="none" stroke={ui.black} strokeWidth="4.5" strokeDasharray="12 10" rx="2" /> : null}
      </svg>
    </div>
  );
};

/** Smooth closed loop through points (double stroke like Vox's yellow rings), draws on. */
export const Ring: React.FC<{points: {x: number; y: number}[]; color?: string; at?: number; duration?: number; exitAt?: number; strokeWidth?: number}> = ({points, color, at = 0, duration = 20, exitAt, strokeWidth = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const p = interpolate(frame, [at, at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = exitFactor(frame, exitAt, fps);
  if (p <= 0 || e <= 0.001) return null;
  const n = points.length;
  const c = (i: number) => points[(i + n) % n];
  const d = (jit: number) => {
    let s = `M${c(0).x + jit},${c(0).y - jit}`;
    for (let i = 0; i < n; i++) {
      const p0 = c(i - 1), p1 = c(i), p2 = c(i + 1), p3 = c(i + 2);
      s += ` C${p1.x + (p2.x - p0.x) / 6 + jit},${p1.y + (p2.y - p0.y) / 6},${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6 - jit},${p2.x},${p2.y}`;
    }
    return s;
  };
  const col = color ?? ui.yellow;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: e}}>
      {[0, 7].map((j) => (
        <path key={j} d={d(j)} fill="none" stroke={col} strokeWidth={strokeWidth} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      ))}
    </svg>
  );
};

/** Straight ink connectors (contact lines, the "passes it on to six people" fan). */
export const Links: React.FC<{lines: {x1: number; y1: number; x2: number; y2: number; at?: number}[]; color?: string; strokeWidth?: number; exitAt?: number; elbow?: boolean}> = ({lines, color, strokeWidth = 7, exitAt, elbow = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const e = exitFactor(frame, exitAt, fps);
  if (e <= 0.001) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: e}}>
      {lines.map((l, i) => {
        const p = clamp01(pop(frame, l.at ?? 0, fps, SETTLE));
        if (p <= 0.01) return null;
        const d = elbow ? `M${l.x1},${l.y1} L${l.x1},${l.y2} L${l.x2},${l.y2}` : `M${l.x1},${l.y1} L${l.x2},${l.y2}`;
        return <path key={i} d={d} fill="none" stroke={color ?? '#4A4C57'} strokeWidth={strokeWidth} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** Ink syringe, diagonal, with a rough edge. Centre-anchored. */
export const Syringe: React.FC<{x: number; y: number; size?: number; rotate?: number; at?: number; exitAt?: number; color?: string}> = ({x, y, size = 360, rotate = -35, at = 0, exitAt, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const id = useId().replace(/:/g, '');
  const s = pop(frame, at, fps, POP) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  const c = color ?? ui.black;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size * 0.15, width: size, height: size * 0.3, transform: `rotate(${rotate}deg) scale(${s})`, transformOrigin: '50% 50%'}}>
      <svg viewBox="0 0 400 120" width={size} height={size * 0.3} style={{overflow: 'visible'}}>
        <defs>
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
          </filter>
        </defs>
        <g filter={`url(#${id})`} fill={c}>
          <rect x="10" y="50" width="34" height="20" rx="3" />
          <rect x="2" y="30" width="14" height="60" rx="4" />
          <rect x="44" y="44" width="200" height="32" rx="4" />
          <rect x="244" y="32" width="14" height="56" rx="4" />
          <rect x="258" y="56" width="132" height="8" />
        </g>
      </svg>
    </div>
  );
};
