import React from 'react';
import {Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {exitFactor, pop} from './motion';
import {Place} from './Place';
import {useTheme, worldAsset} from './theme';

/** Crumpled paper cloud (tools/make_props.py clouds). Drifts slowly; pops in at `at`. */
export const PaperCloud: React.FC<{
  variant?: number;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  /** px per second of horizontal drift */
  drift?: number;
}> = ({variant = 0, x, y, scale = 1, rotate = 0, at = 0, exitAt, drift = 6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const s = pop(frame, at, fps) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  return (
    <Place x={x + (drift * frame) / fps} y={y} scale={scale * (0.6 + 0.4 * s)} rotate={rotate} opacity={Math.min(1, s * 2)}>
      <Img src={worldAsset(theme, `cloud_${variant % 6}.png`)} style={{display: 'block'}} />
    </Place>
  );
};
