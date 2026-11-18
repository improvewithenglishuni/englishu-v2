import React from 'react';
import {Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {exitFactor, pop} from './motion';
import {Place} from './Place';

/**
 * A photo cutout made by tools/make_cutout.py (white paper border + shadow already baked in).
 * `shadow` adds an extra live shadow when the cutout lifts off the paper.
 */
export const Cutout: React.FC<{
  src: string;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  enter?: 'pop' | 'none';
  shadow?: boolean;
  width?: number;
}> = ({src, x, y, scale = 1, rotate = 0, at = 0, exitAt, enter = 'pop', shadow = false, width}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = enter === 'pop' ? pop(frame, at, fps) : frame >= at ? 1 : 0;
  const e = exitFactor(frame, exitAt, fps);
  const k = s * e;
  if (k <= 0.001) return null;
  return (
    <Place x={x} y={y} scale={scale * k} rotate={rotate + (1 - s) * -6}>
      <Img
        src={src}
        style={{
          width,
          display: 'block',
          filter: shadow ? 'drop-shadow(10px 14px 12px rgba(0,0,0,0.25))' : undefined,
        }}
      />
    </Place>
  );
};
