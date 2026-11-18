import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Place} from './Place';
import {swooshPaths} from './paths';
import {useTheme} from './theme';

/** The ONE hand-drawn accent swoosh (Z-shaped marker underline), drawn on via stroke-dashoffset. */
export const Swoosh: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  duration?: number;
  width?: number;
  strokeWidth?: number;
  seed?: number;
  color?: string;
}> = ({x, y, scale = 1, rotate = -2, at = 0, duration = 14, width = 640, strokeWidth = 26, seed = 3, color}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const {main, tails} = useMemo(() => swooshPaths(width, seed), [width, seed]);
  const p = interpolate(frame, [at, at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tailP = interpolate(frame, [at + duration * 0.8, at + duration * 1.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0) return null;
  const c = color ?? theme.accent;
  const W = width * 1.5;
  return (
    <Place x={x} y={y} scale={scale} rotate={rotate} style={{mixBlendMode: 'normal', filter: 'saturate(1.05)'}}>
      <svg width={W} height={200} viewBox={`-40 -60 ${W} 200`} style={{display: 'block', overflow: 'visible'}}>
        <path d={main} fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.92} />
        {tails.map((t, i) => (
          <path key={i} d={t} fill="none" stroke={c} strokeWidth={3 + (i % 3)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tailP} opacity={0.75} />
        ))}
      </svg>
    </Place>
  );
};
