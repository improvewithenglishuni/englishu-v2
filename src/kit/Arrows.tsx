import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {handArrow} from './paths';
import {useTheme} from './theme';

export type ArrowSpec = {x1: number; y1: number; x2: number; y2: number; bend?: number};

/** Thin hand-drawn arrows that draw on one after another (stroke-dashoffset). */
export const Arrows: React.FC<{
  arrows: ArrowSpec[];
  at?: number;
  stagger?: number;
  duration?: number;
  color?: 'accent' | 'ink' | string;
  strokeWidth?: number;
  seed?: number;
  /** move/scale/rotate the whole group (around frame centre) */
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  exitAt?: number;
}> = ({arrows, at = 0, stagger = 3, duration = 10, color = 'accent', strokeWidth = 7, seed = 11, x = 0, y = 0, scale = 1, rotate = 0, exitAt}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const theme = useTheme();
  const c = color === 'accent' ? theme.accent : color === 'ink' ? theme.ink : color;
  const paths = useMemo(() => arrows.map((a, i) => handArrow([a.x1, a.y1], [a.x2, a.y2], seed + i * 17, a.bend ?? 0.06)), [arrows, seed]);
  const fade = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (fade <= 0) return null;
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`, opacity: fade}}>
      <svg width={width} height={height} style={{overflow: 'visible'}}>
        {paths.map((p, i) => {
          const t0 = at + i * stagger;
          const shaft = interpolate(frame, [t0, t0 + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const head = interpolate(frame, [t0 + duration * 0.85, t0 + duration * 1.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          if (shaft <= 0) return null;
          const common = {fill: 'none', stroke: c, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: 1};
          return (
            <g key={i}>
              <path d={p.shaft} {...common} strokeDashoffset={1 - shaft} />
              {head > 0 ? <path d={p.head} {...common} strokeDashoffset={1 - head} /> : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
