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

/** Extra life on the white explainer plate: faint hex lines in two corners + drifting pollen motes. */
export const PlateDecor: React.FC = () => {
  const f = useCurrentFrame();
  const hex = (cx: number, cy: number, r: number, k: string) => {
    const pts = Array.from({length: 6}, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
    }).join(' ');
    return <polygon key={k} points={pts} fill="none" stroke="#9EAAA2" strokeWidth={3} />;
  };
  const corner = (ox: number, oy: number, rows: number, cols: number, k: string) => {
    const r = 54, hx = Math.sqrt(3) * r;
    const out: React.ReactNode[] = [];
    for (let row = 0; row < rows; row++)
      for (let col = 0; col < cols; col++) {
        if (random(`${k}${row}-${col}`) < 0.35) continue;
        out.push(hex(ox + col * hx + (row % 2 ? hx / 2 : 0), oy + row * r * 1.5, r - 3, `${k}${row}-${col}`));
      }
    return out;
  };
  const motes = Array.from({length: 18}).map((_, k) => {
    const sp = 0.3 + random(`ms${k}`) * 0.6;
    const x = (random(`mx${k}`) * W + f * sp * 0.6) % W;
    const y = (random(`my${k}`) * H - f * sp + H * 4) % H;
    return <circle key={k} cx={x} cy={y} r={3 + random(`mr${k}`) * 5} fill={C.amber} opacity={0.35 + random(`mo${k}`) * 0.3} />;
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.35}}>
        <defs>
          <radialGradient id="cfadeA" cx="1" cy="0" r="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <radialGradient id="cfadeB" cx="0" cy="1" r="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="cmA">
            <rect width={W} height={H} fill="url(#cfadeA)" />
          </mask>
          <mask id="cmB">
            <rect width={W} height={H} fill="url(#cfadeB)" />
          </mask>
        </defs>
        <g mask="url(#cmA)">{corner(640, -20, 7, 6, 'ca')}</g>
        <g mask="url(#cmB)">{corner(-60, 1420, 7, 6, 'cb')}</g>
      </svg>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {motes}
      </svg>
    </AbsoluteFill>
  );
};
