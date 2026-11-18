import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const END_CARD_SECONDS = 2.7;

const Inner: React.FC<{src: string; fade: number; total: number}> = ({src, fade, total}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, fade], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(frame, [0, total], [1, 1.05], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
    </AbsoluteFill>
  );
};

/**
 * Brand end card (public/endcard.png) for 2.7 s, slow push 1.0 -> 1.05, fading in from the
 * video over 0.25 s. Place it as the LAST child; `at` is the frame it starts.
 * Brand navy/red belong here (and in the logo) only.
 */
export const EndCard: React.FC<{at: number; src?: string}> = ({at, src = staticFile('endcard.png')}) => {
  const {fps} = useVideoConfig();
  const total = Math.round(END_CARD_SECONDS * fps);
  return (
    <Sequence from={at} durationInFrames={total} name="EndCard">
      <Inner src={src} fade={Math.round(0.25 * fps)} total={total} />
    </Sequence>
  );
};
