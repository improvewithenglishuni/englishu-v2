import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP} from './motion';
import {SANS} from './SerifTitle';
import {useTheme, useUi} from './theme';

export type Tick = {v: number; label: string};

/** The coral X that lands on the last point ("it was gone"). */
export const RedX: React.FC<{x: number; y: number; size?: number; at?: number; color?: string}> = ({x, y, size = 70, at = 0, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const s = pop(frame, at, fps, POP);
  if (s <= 0.001) return null;
  const bar = {position: 'absolute' as const, left: '50%', top: '50%', width: size, height: size * 0.27, borderRadius: size * 0.06, background: color ?? '#E0615E'};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `scale(${s}) rotate(${(1 - s) * 90}deg)`}}>
      <div style={{...bar, transform: 'translate(-50%,-50%) rotate(45deg)'}} />
      <div style={{...bar, transform: 'translate(-50%,-50%) rotate(-45deg)'}} />
    </div>
  );
};

/**
 * Vox line chart: thin steel gridlines, bold grey sans tick labels, ONE thick slate line that
 * draws itself, and an optional coral X on the last point. Light paper: slate line.
 * `dark`: coral line, steel grid, lavender labels. `highlight`: a black bar behind one y label
 * and its gridline (the "2.5 million" moment).
 * box = frame pixels of the plotting area. Points are in data units.
 */
export const LineChart: React.FC<{
  box: {x: number; y: number; w: number; h: number};
  points: [number, number][];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: Tick[];
  yTicks: Tick[];
  dark?: boolean;
  /** frames [start, end] of the draw-on */
  draw?: [number, number];
  end?: 'x' | 'dot' | 'none';
  highlight?: {v: number; at: number};
  strokeWidth?: number;
  at?: number;
  exitAt?: number;
  labelSize?: number;
}> = ({box, points, xDomain, yDomain, xTicks, yTicks, dark = false, draw = [10, 60], end = 'none', highlight, strokeWidth = 10, at = 0, exitAt, labelSize = 34}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const sx = (v: number) => box.x + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * box.w;
  const sy = (v: number) => box.y + box.h - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * box.h;
  const pts = useMemo(() => points.map(([a, b]) => [sx(a), sy(b)] as [number, number]), [points, box.x, box.y, box.w, box.h]);
  const lens = useMemo(() => {
    const c = [0];
    for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return c;
  }, [pts]);
  const total = lens[lens.length - 1];
  const p = interpolate(frame, draw, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const upto = p * total;
  let d = '';
  let tip: [number, number] = pts[0];
  for (let i = 0; i < pts.length; i++) {
    if (lens[i] <= upto) {
      d += `${i === 0 ? 'M' : 'L'}${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} `;
      tip = pts[i];
    } else {
      const k = (upto - lens[i - 1]) / (lens[i] - lens[i - 1]);
      tip = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
      d += `L${tip[0].toFixed(1)},${tip[1].toFixed(1)}`;
      break;
    }
  }
  const e = exitFactor(frame, exitAt, fps);
  const a = clamp01(pop(frame, at, fps)) * e;
  if (a <= 0.001) return null;
  const grid = dark ? '#5E667D' : '#7C88A6';
  const label = dark ? '#A8B0CE' : '#8A8B93';
  const line = dark ? '#E0615E' : ui.chartLine;
  const hl = highlight ? clamp01(pop(frame, highlight.at, fps)) : 0;
  const W = 1080;
  const H = 1920;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: a}}>
      {highlight && hl > 0 ? (
        <rect x={box.x - 130} y={sy(highlight.v) - 34} width={(box.w + 150) * hl} height={68} fill="#050506" />
      ) : null}
      {yTicks.map((t) => (
        <g key={t.v}>
          <line x1={box.x} x2={box.x + box.w} y1={sy(t.v)} y2={sy(t.v)} stroke={grid} strokeWidth={2.5} />
          <text x={box.x - 24} y={sy(t.v) + labelSize * 0.35} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={labelSize} fill={highlight && highlight.v === t.v && hl > 0.5 ? '#E6E8F4' : label}>
            {t.label}
          </text>
        </g>
      ))}
      <line x1={box.x} x2={box.x + box.w} y1={box.y + box.h} y2={box.y + box.h} stroke={grid} strokeWidth={2.5} />
      {xTicks.map((t) => (
        <text key={t.v} x={sx(t.v)} y={box.y + box.h + labelSize * 1.6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={labelSize} fill={label}>
          {t.label}
        </text>
      ))}
      <path d={d} fill="none" stroke={line} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      {end === 'dot' && p >= 1 ? <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={16} fill={useTheme().accent ?? '#E0615E'} /> : null}
      {end === 'x' && p >= 0.999 ? <foreignObject x={0} y={0} width={W} height={H} style={{overflow: 'visible'}}><RedX x={pts[pts.length - 1][0] + 6} y={pts[pts.length - 1][1]} size={74} at={draw[1]} /></foreignObject> : null}
    </svg>
  );
};
