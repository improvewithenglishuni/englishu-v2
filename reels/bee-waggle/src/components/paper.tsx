import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C, H, W} from '../theme';

/** Jagged polygon around a rectangle: the torn-paper edge. */
export const tornRect = (w: number, h: number, amp: number, seed: string, step = 18) => {
  const pts: string[] = [];
  const j = (i: number) => (random(`${seed}-${i}`) - 0.5) * 2 * amp;
  let i = 0;
  for (let x = 0; x <= w; x += step) pts.push(`${x},${j(i++)}`);
  for (let y = 0; y <= h; y += step) pts.push(`${w + j(i++)},${y}`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x},${h + j(i++)}`);
  for (let y = h; y >= 0; y -= step) pts.push(`${j(i++)},${y}`);
  return pts.join(' ');
};

/** Organic die-cut blob path (sticker shape for photos without a cut-out). */
export const blobPath = (cx: number, cy: number, rx: number, ry: number, seed: string, n = 9, wob = 0.08) => {
  const pts = Array.from({length: n}, (_, k) => {
    const a = (k / n) * Math.PI * 2;
    const r = 1 + (random(`${seed}-${k}`) - 0.5) * 2 * wob;
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
  });
  // Catmull-Rom -> cubic Bezier closed path
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
};

/** Shared SVG defs: stipple (halftone-ish dots), paper grain filter. Render once per svg that uses them. */
export const StippleDefs: React.FC<{id: string; color?: string; size?: number; opacity?: number}> = ({
  id,
  color = C.ink,
  size = 7,
  opacity = 0.22,
}) => (
  <defs>
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx={size / 2} cy={size / 2} r={size * 0.17} fill={color} opacity={opacity} />
    </pattern>
  </defs>
);

/** The locked world plate: the attached white squiggle paper, full bleed, slow continuous drift. */
export const Plate: React.FC<{dim?: number}> = ({dim = 0}) => {
  const f = useCurrentFrame();
  const s = 1.04 + 0.04 * Math.sin(f / 210);
  const x = Math.sin(f / 260) * 14;
  const y = Math.cos(f / 300) * 18;
  return (
    <AbsoluteFill style={{backgroundColor: C.paper, overflow: 'hidden'}}>
      <Img
        src={staticFile('squiggle.jpg')}
        style={{
          position: 'absolute',
          width: W,
          height: H,
          objectFit: 'cover',
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          filter: 'contrast(1.12) brightness(0.99)',
        }}
      />
      {/* faint sage wash so the white paper sits in the same family as the inspo's sage-grey */}
      <AbsoluteFill style={{backgroundColor: C.sage, mixBlendMode: 'multiply', opacity: 0.32}} />
      {dim > 0 && <AbsoluteFill style={{backgroundColor: C.hive, opacity: dim}} />}
    </AbsoluteFill>
  );
};

/** Animated film grain + soft vignette over everything. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 12;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.13, mixBlendMode: 'multiply'}}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,26,12,0.22) 100%)'}}
      />
    </AbsoluteFill>
  );
};

/** A torn sage paper strip with stipple, used as mid-ground. */
export const TornStrip: React.FC<{
  w: number;
  h: number;
  x: number;
  y: number;
  rot?: number;
  color?: string;
  seed: string;
  stipple?: boolean;
  style?: React.CSSProperties;
}> = ({w, h, x, y, rot = 0, color = C.sage, seed, stipple = true, style}) => (
  <svg
    width={w + 40}
    height={h + 40}
    viewBox={`-20 -20 ${w + 40} ${h + 40}`}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `rotate(${rot}deg)`,
      filter: 'drop-shadow(0 10px 14px rgba(40,26,12,0.18))',
      ...style,
    }}
  >
    <StippleDefs id={`st-${seed}`} />
    <polygon points={tornRect(w, h, 7, seed)} fill={color} />
    {stipple && <polygon points={tornRect(w, h, 7, seed)} fill={`url(#st-${seed})`} />}
  </svg>
);
