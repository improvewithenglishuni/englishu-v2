import React, {useMemo} from 'react';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {C} from '../theme';
import {BeeTop} from './bee';
import {dancePathD} from './anim';

/**
 * The waggle-dance figure-eight drawn as a marker line, with a top-down bee tracing it.
 * draw: 0..1 how much of the path is drawn. beeAt: 0..1 where the bee is (null = hide bee).
 */
export const DanceFigure: React.FC<{
  size?: number;
  draw: number;
  beeAt?: number | null;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
  id?: string;
}> = ({size = 760, draw, beeAt = null, color = C.amber, stroke = 16, style, id = 'df'}) => {
  const d = useMemo(() => dancePathD(), []);
  const len = useMemo(() => getLength(d), [d]);
  let bee: React.ReactNode = null;
  if (beeAt !== null) {
    const l = Math.min(len - 0.01, Math.max(0.01, beeAt * len));
    const p = getPointAtLength(d, l);
    const t = getTangentAtLength(d, l);
    const ang = (Math.atan2(t.y, t.x) * 180) / Math.PI + 90;
    bee = (
      <g transform={`translate(${p.x} ${p.y}) rotate(${ang}) translate(-30 -40)`}>
        <BeeTop size={60} id={`${id}-bee`} />
      </g>
    );
  }
  return (
    <svg width={size} height={size} viewBox="-380 -380 760 760" style={{position: 'absolute', overflow: 'visible', ...style}}>
      <defs>
        <filter id={`${id}-rough`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </defs>
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
      {bee}
    </svg>
  );
};
