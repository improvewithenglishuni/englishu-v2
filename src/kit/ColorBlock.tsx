import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {exitFactor, pop, SETTLE} from './motion';
import {TornStrip} from './TornStrip';

/**
 * A torn block of coloured paper: the flat colour field that sits behind photo cutouts and
 * numbers (Vox's "colour card"). Always textured, never a flat rectangle. Centre-anchored.
 * tone -> texture: spot (second colour), accent, ink (near-black), paper (white), pale.
 */
const TEX = {spot: 'plate_spot.jpg', accent: 'plate_accent.jpg', ink: 'plate_ink.jpg', paper: 'plate_paper.jpg', pale: 'plate_pale.jpg'} as const;

export const ColorBlock: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotate?: number;
  tone?: keyof typeof TEX;
  at?: number;
  exitAt?: number;
  from?: 'start' | 'end';
  seed?: number;
}> = ({cx, cy, w, h, rotate = 0, tone = 'spot', at = 0, exitAt, from = 'start', seed = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = Math.min(1, pop(frame, at, fps, SETTLE) * 1.0) * exitFactor(frame, exitAt, fps);
  const a = (rotate * Math.PI) / 180;
  return (
    <TornStrip
      x={cx - (w / 2) * Math.cos(a)}
      y={cy - (w / 2) * Math.sin(a)}
      rotate={rotate}
      length={w}
      width={h}
      seed={seed}
      texture={TEX[tone]}
      reveal={r}
      revealFrom={from}
    />
  );
};
