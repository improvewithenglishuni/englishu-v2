import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {PlateVariant, WorldLayer} from './World';

const Inner: React.FC<{variant: PlateVariant | 'none'; push: [number, number]; fade: number; children: React.ReactNode}> = ({variant, push, fade, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], push, {extrapolateRight: 'clamp'});
  const o = fade > 0 ? interpolate(frame, [0, fade], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return (
    <AbsoluteFill style={{opacity: o, transform: `scale(${s})`, transformOrigin: '50% 45%'}}>
      {variant === 'none' ? children : <WorldLayer variant={variant}>{children}</WorldLayer>}
    </AbsoluteFill>
  );
};

/**
 * One Vox scene = one hard cut. Frames inside are LOCAL (0 = the cut), so every component's
 * `at` is relative to the scene. Each scene has its own plate (light / dark / peri / charcoal)
 * and its own slow push, so the picture is never static. `fade` = 0 is a hard cut; 4-6 is a
 * quick dissolve. Use 'none' when the first child is a full-frame image.
 */
export const Scene: React.FC<{
  from: number;
  to: number;
  variant?: PlateVariant | 'none';
  push?: [number, number];
  fade?: number;
  children: React.ReactNode;
}> = ({from, to, variant = 'light', push = [1, 1.05], fade = 0, children}) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)} layout="none">
    <Inner variant={variant} push={push} fade={fade}>
      {children}
    </Inner>
  </Sequence>
);
