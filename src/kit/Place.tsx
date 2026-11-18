import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Positions children with their CENTRE at (x, y) in frame pixels. */
export const Place: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  origin?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({x, y, scale = 1, rotate = 0, opacity = 1, origin = '50% 50%', style, children}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: origin,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);
