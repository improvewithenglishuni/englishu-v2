import React, {useMemo} from 'react';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {C, DASH} from '../theme';
import {BeeTop} from './bee';
import {dancePathD} from './anim';

/** Fraction of the figure-eight path that is the first straight waggle run (for syncing labels/buzz). */
export const RUN_FRAC = 0.2;

/**
 * The waggle-dance figure-eight, drawn on by `draw` (0..1), with a top-down bee tracing it at `beeAt`.
 * dashed: white dashed line (inspo) instead of a solid marker stroke.
 */
export const DanceFigure: React.FC<{
  size?: number;
  draw: number;
  beeAt?: number | null;
  color?: string;
  stroke?: number;
  dashed?: boolean;
  pen?: boolean; // a glowing pen tip at the drawing head (for sketching over real footage)
  beeSize?: number;
  style?: React.CSSProperties;
  id?: string;
}> = ({size = 760, draw, beeAt = null, color = C.amber, stroke = 16, dashed, pen, beeSize = 60, style, id = 'df'}) => {
  const d = useMemo(() => dancePathD(), []);
  const len = useMemo(() => getLength(d), [d]);
  let bee: React.ReactNode = null;
  if (beeAt !== null) {
    const l = Math.min(len - 0.01, Math.max(0.01, beeAt * len));
    const p = getPointAtLength(d, l);
    const t = getTangentAtLength(d, l);
    const ang = (Math.atan2(t.y, t.x) * 180) / Math.PI + 90;
    const onRun = Math.abs(p.x) < 22; // straight middle section = waggle run
    bee = (
      <g transform={`translate(${p.x} ${p.y}) rotate(${ang}) translate(${-beeSize / 2} ${-beeSize * 0.75})`}>
        <BeeTop size={beeSize} id={`${id}-bee`} buzz={onRun} />
      </g>
    );
  }
  return (
    <svg width={size} height={size} viewBox="-380 -380 760 760" style={{position: 'absolute', overflow: 'visible', ...style}}>
      <defs>
        <filter id={`${id}-rough`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="800" height="800">
          <path d={d} fill="none" stroke="#fff" strokeWidth={stroke + 30} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        </mask>
      </defs>
      {dashed ? (
        <g mask={`url(#${id}-m)`}>
          <path d={d} fill="none" stroke={DASH.color} strokeWidth={DASH.width + 1} strokeDasharray={DASH.array} strokeLinecap={DASH.cap} />
        </g>
      ) : (
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
          filter={`url(#${id}-rough)`}
        />
      )}
      {pen && draw > 0.001 && draw < 0.999 && (() => {
        const q = getPointAtLength(d, Math.max(0.01, draw * len));
        return (
          <g>
            <circle cx={q.x} cy={q.y} r={22} fill="#fff" opacity={0.25} />
            <circle cx={q.x} cy={q.y} r={9} fill="#fff" />
          </g>
        );
      })()}
      {bee}
    </svg>
  );
};
