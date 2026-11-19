import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {SANS} from './SerifTitle';
import {useUi} from './theme';
import {clamp01, exitFactor, pop, SETTLE} from './motion';

/**
 * A scanned newspaper / document with a yellow highlighter that sweeps across the key line,
 * plus a grey source tab ("The New York Times") in the corner. Use a REAL scan (public domain:
 * Chronicling America, Library of Congress, Wikimedia) — never invent newspaper text.
 * `marks` are rectangles in % of the frame (x, y, w, h) swept left -> right in order.
 */
export const Clipping: React.FC<{
  src: string;
  source?: string;
  marks: {x: number; y: number; w: number; h: number; at: number; dur?: number}[];
  zoom?: [number, number];
  focus?: [number, number];
  /** 'fill' = fills the frame (crop), 'fit' = whole picture on white */
  fit?: 'fill' | 'fit';
}> = ({src, source, marks, zoom = [1.02, 1.1], focus = [50, 50], fit = 'fill'}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const ui = useUi();
  const t = interpolate(frame, [0, durationInFrames], zoom, {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#FCFCFC', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${t})`, transformOrigin: `${focus[0]}% ${focus[1]}%`}}>
        <Img src={src} style={{width: '100%', height: '100%', objectFit: fit === 'fill' ? 'cover' : 'contain', objectPosition: `${focus[0]}% ${focus[1]}%`}} />
        {marks.map((m, i) => {
          const p = interpolate(frame, [m.at, m.at + (m.dur ?? 14)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <div key={i} style={{position: 'absolute', left: `${m.x}%`, top: `${m.y}%`, width: `${m.w * p}%`, height: `${m.h}%`, background: ui.yellow, mixBlendMode: 'multiply'}} />;
        })}
      </AbsoluteFill>
      {source ? (
        <div style={{position: 'absolute', left: 50, top: 60, padding: '10px 26px', background: 'rgba(110,110,116,0.88)', color: '#FCFCFC', fontFamily: SANS, fontWeight: 700, fontSize: 40, opacity: clamp01(pop(frame, 6, fps, SETTLE)) * exitFactor(frame, undefined, fps)}}>{source}</div>
      ) : null}
    </AbsoluteFill>
  );
};
