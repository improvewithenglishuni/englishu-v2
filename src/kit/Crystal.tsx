import React from 'react';
import {Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {exitFactor, pop} from './motion';
import {Place} from './Place';
import {useTheme, worldAsset} from './theme';

/** Paper hexagon ice crystal (tools/make_props.py crystals). */
export const Crystal: React.FC<{
  variant?: number;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  enter?: 'pop' | 'none';
}> = ({variant = 0, x, y, scale = 1, rotate = 0, at = 0, exitAt, enter = 'pop'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const s = (enter === 'pop' ? pop(frame, at, fps) : 1) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  return (
    <Place x={x} y={y} scale={scale * s} rotate={rotate}>
      <Img src={worldAsset(theme, `crystal_${variant % 6}.png`)} style={{display: 'block'}} />
    </Place>
  );
};
