import React, {useMemo} from 'react';
import {Img} from 'remotion';
import {useTheme, worldAsset} from './theme';
import {tornStripPath} from './torn';

/**
 * A torn paper strip. Anchored at its START (left-centre) at (x, y) and rotated around it.
 *  - `src`: a PNG from tools/make_torn.py (best quality: crumpled core, fibre band, shadow), or
 *  - no `src`: drawn live from the SVG clip-path generator, filled with a paper texture.
 * `reveal` (0..1) shows part of it, growing from `revealFrom` ('start' or 'end').
 */
export const TornStrip: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  src?: string;
  /** for the procedural strip */
  length?: number;
  width?: number;
  taper?: number;
  seed?: number;
  /** texture file in the theme folder, e.g. plate_paper.jpg or plate_pale.jpg */
  texture?: string;
  fibre?: string;
  reveal?: number;
  revealFrom?: 'start' | 'end';
  opacity?: number;
}> = ({x, y, rotate = 0, scale = 1, src, length = 1200, width = 220, taper = 1, seed = 1, texture = 'plate_paper.jpg', fibre, reveal = 1, revealFrom = 'start', opacity = 1}) => {
  const theme = useTheme();
  const r = Math.max(0, Math.min(1, reveal));
  const hide = `${((1 - r) * 100).toFixed(2)}%`;
  const clip = revealFrom === 'start' ? `inset(0 ${hide} 0 0)` : `inset(0 0 0 ${hide})`;
  const h = width * Math.max(1, taper) + 140;
  const d = useMemo(() => tornStripPath(length, width, {seed, taper}), [length, width, seed, taper]);
  if (r <= 0) return null;
  const outer: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    transform: `translateY(-50%) rotate(${rotate}deg) scale(${scale})`,
    transformOrigin: '0 50%',
    opacity,
  };
  if (src) {
    return (
      <div style={outer}>
        <Img src={src} style={{display: 'block', clipPath: clip}} />
      </div>
    );
  }
  return (
    <div style={{...outer, width: length, height: h, filter: 'drop-shadow(7px 10px 8px rgba(0,0,0,0.33))'}}>
      {/* hidden <Img> makes the render wait for the texture used by the SVG <image> */}
      <Img src={worldAsset(theme, texture)} style={{display: 'none'}} />
      <div style={{position: 'absolute', inset: 0, clipPath: clip}}>
        <svg width={length} height={h} viewBox={`0 ${-h / 2} ${length} ${h}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id={`ts-${seed}`}>
              <path d={d} />
            </clipPath>
            <filter id={`tsf-${seed}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
            </filter>
          </defs>
          <g clipPath={`url(#ts-${seed})`}>
            <image href={worldAsset(theme, texture)} x={0} y={-h / 2} width={Math.max(length, h)} height={Math.max(length, h)} preserveAspectRatio="xMidYMid slice" />
          </g>
          {/* exposed white fibres along both torn sides */}
          <path d={d} fill="none" stroke={fibre ?? 'rgba(250,249,245,0.9)'} strokeWidth={14} clipPath={`url(#ts-${seed})`} filter={`url(#tsf-${seed})`} />
        </svg>
      </div>
    </div>
  );
};
