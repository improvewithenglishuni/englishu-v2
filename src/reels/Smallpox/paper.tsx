import React, {useId, useMemo} from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, exitFactor, mulberry32, Place, pop, smoothPath, TornStrip, useTheme, worldAsset} from '../../kit';

const uid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

/**
 * A paper-craft piece drawn in code: the silhouette gets an irregular white paper border, the
 * crumpled paper texture of the world, a soft shadow, optional tint and halftone details.
 * Use this when there is no photo (public-domain photos go through tools/make_cutout.py instead).
 * `silhouette` children must NOT set fill/stroke (they are reused for border, fill and clip).
 */
export const PaperPiece: React.FC<{
  w: number;
  h: number;
  silhouette: React.ReactNode;
  details?: React.ReactNode;
  texture?: 'plate_paper.jpg' | 'plate_pale.jpg';
  tint?: string;
  border?: number;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  seed?: number;
}> = ({w, h, silhouette, details, texture = 'plate_paper.jpg', tint, border = 12, x, y, scale = 1, rotate = 0, at = 0, exitAt, seed = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const id = uid();
  const s = pop(frame, at, fps);
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  const pad = 40;
  const W = w + pad * 2;
  const H = h + pad * 2;
  const tex = worldAsset(theme, texture);
  return (
    <Place x={x} y={y} scale={scale * (0.75 + 0.25 * s) * e} rotate={rotate - (1 - s) * 6} opacity={Math.min(1, s * 3)}>
      <div style={{filter: 'drop-shadow(7px 11px 9px rgba(0,0,0,0.36))'}}>
        <svg width={W} height={H} viewBox={`${-pad} ${-pad} ${W} ${H}`} style={{display: 'block', overflow: 'visible'}}>
          <defs>
            <filter id={`w${id}`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
            </filter>
            <pattern id={`t${id}`} patternUnits="userSpaceOnUse" x={0} y={0} width={1200} height={2300}>
              <image href={tex} width={1200} height={2300} />
            </pattern>
            <clipPath id={`c${id}`}>{silhouette}</clipPath>
          </defs>
          <g filter={`url(#w${id})`}>
            <g fill="#F8F6EF" stroke="#F8F6EF" strokeWidth={border * 2} strokeLinejoin="round">
              {silhouette}
            </g>
            <g fill={`url(#t${id})`}>{silhouette}</g>
          </g>
          <g clipPath={`url(#c${id})`}>
            {tint ? <rect x={-pad} y={-pad} width={W} height={H} fill={tint} style={{mixBlendMode: 'multiply'}} /> : null}
            {details}
          </g>
        </svg>
        <Img src={tex} style={{display: 'none'}} />
      </div>
    </Place>
  );
};

/** Rotated halftone dot field that fades out along a direction (shading for paper pieces). */
export const Halftone: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity?: number;
  pitch?: number;
  dot?: number;
  angle?: number;
  /** direction the dots fade away from solid (0 = left->right) */
  fade?: 'right' | 'left' | 'down' | 'up' | 'none';
}> = ({x, y, w, h, color, opacity = 0.3, pitch = 17, dot = 4.2, angle = 28, fade = 'right'}) => {
  const id = uid();
  const g =
    fade === 'right' ? [0, 0, 1, 0] : fade === 'left' ? [1, 0, 0, 0] : fade === 'down' ? [0, 0, 0, 1] : fade === 'up' ? [0, 1, 0, 0] : [0, 0, 0, 0];
  return (
    <g opacity={opacity}>
      <defs>
        <pattern id={`d${id}`} width={pitch} height={pitch} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          <circle cx={pitch / 2} cy={pitch / 2} r={dot} fill={color} />
        </pattern>
        <linearGradient id={`g${id}`} x1={g[0]} y1={g[1]} x2={g[2]} y2={g[3]}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={fade === 'none' ? '#fff' : '#000'} />
        </linearGradient>
        <mask id={`m${id}`}>
          <rect x={x} y={y} width={w} height={h} fill={`url(#g${id})`} />
        </mask>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#d${id})`} mask={`url(#m${id})`} />
    </g>
  );
};

/** The vaccination scar on an upper arm: a round, slightly sunken disc (the visual motif). */
export const Arm: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  /** frame the scar starts to pulse */
  pulseAt?: number;
}> = ({x, y, scale = 1, rotate = -4, at = 0, exitAt, pulseAt = 9999}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const k = frame >= pulseAt ? 1 + 0.07 * Math.sin((frame - pulseAt) / 5) * interpolate(frame - pulseAt, [0, 12], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  const outline = smoothPath([
    [110, -20], [95, 180], [92, 360], [108, 520], [130, 640], [200, 715], [330, 745], [480, 760], [600, 770],
    [665, 800], [735, 815], [782, 780], [790, 725], [772, 668], [752, 640], [752, 596], [725, 566], [690, 575], [682, 622], [650, 650], [520, 600], [400, 545],
    [330, 510], [320, 380], [330, 200], [350, -20],
  ]) + ' Z';
  const sil = <path d={outline} />;
  const details = (
    <>
      <Halftone x={60} y={100} w={330} h={700} color={theme.ink} opacity={0.3} fade="right" angle={32} />
      <Halftone x={300} y={560} w={500} h={260} color={theme.ink} opacity={0.22} fade="up" angle={32} pitch={15} dot={3.6} />
      {/* fingers */}
      <path d="M 700 700 C 735 700 765 706 782 716 M 700 740 C 735 742 768 748 786 758" fill="none" stroke={theme.ink} strokeWidth={4} strokeLinecap="round" opacity={0.3} />
      {/* shirt sleeve */}
      <path d="M -30 -30 H 440 V 190 C 320 232 180 220 -30 150 Z" fill={theme.paleLayer} />
      <Halftone x={-30} y={-30} w={470} h={250} color={theme.ink} opacity={0.18} fade="down" pitch={15} dot={3.4} />
      <path d="M -30 150 C 180 220 320 232 440 190" fill="none" stroke={theme.ink} strokeWidth={4} opacity={0.45} />
      {/* the scar */}
      <g transform={`translate(215 345) scale(${k * 1.45})`}>
        <circle r={80} fill={theme.accent} opacity={0.16} />
        <circle r={62} fill="none" stroke={theme.accent} strokeWidth={7} strokeDasharray="3 13" strokeLinecap="round" opacity={0.85} />
        <circle r={42} fill="#C98E78" opacity={0.75} />
        <circle r={42} fill="none" stroke={theme.ink} strokeWidth={3} opacity={0.35} />
        <circle r={17} fill="#B87A66" opacity={0.8} />
        <circle cx={-11} cy={-11} r={7} fill="#fff" opacity={0.28} />
      </g>
    </>
  );
  return <PaperPiece w={800} h={900} silhouette={sil} details={details} tint="#EBCFAE" x={x} y={y} scale={scale} rotate={rotate} at={at} exitAt={exitAt} seed={4} />;
};

/** A paper cow (the 1796 story). */
export const Cow: React.FC<{x: number; y: number; scale?: number; rotate?: number; at?: number; exitAt?: number}> = ({x, y, scale = 1, rotate = -3, at = 0, exitAt}) => {
  const theme = useTheme();
  const sil = (
    <>
      <rect x={110} y={120} width={430} height={205} rx={96} />
      <path d="M 510 135 C 585 95 685 115 725 190 C 750 240 735 305 690 325 C 640 345 560 325 530 275 Z" />
      <ellipse cx={590} cy={112} rx={50} ry={22} transform="rotate(-28 590 112)" />
      <path d="M 640 112 C 648 72 680 52 705 58 C 688 80 678 102 668 128 Z" />
      <rect x={150} y={290} width={48} height={195} rx={20} />
      <rect x={232} y={296} width={48} height={188} rx={20} />
      <rect x={400} y={296} width={48} height={188} rx={20} />
      <rect x={482} y={290} width={48} height={195} rx={20} />
      <path d="M 120 150 C 64 170 46 262 66 336 L 92 330 C 80 262 92 196 132 184 Z" />
      <ellipse cx={78} cy={346} rx={26} ry={34} />
      <ellipse cx={310} cy={330} rx={48} ry={32} />
    </>
  );
  const details = (
    <>
      <ellipse cx={250} cy={185} rx={78} ry={46} fill={theme.ink} />
      <ellipse cx={420} cy={238} rx={64} ry={42} fill={theme.ink} />
      <ellipse cx={168} cy={246} rx={40} ry={30} fill={theme.ink} />
      <ellipse cx={612} cy={168} rx={48} ry={36} fill={theme.ink} />
      <ellipse cx={78} cy={348} rx={26} ry={36} fill={theme.ink} />
      <ellipse cx={706} cy={288} rx={36} ry={26} fill="#E7B7A8" />
      <circle cx={668} cy={196} r={11} fill="#fff" />
      <circle cx={670} cy={197} r={6} fill={theme.ink} />
      <ellipse cx={310} cy={336} rx={40} ry={24} fill="#E7B7A8" />
      <Halftone x={100} y={200} w={460} h={300} color={theme.ink} opacity={0.2} fade="up" />
    </>
  );
  return <PaperPiece w={780} h={520} silhouette={sil} details={details} x={x} y={y} scale={scale} rotate={rotate} at={at} exitAt={exitAt} seed={8} />;
};

/** The outbreak: a jagged paper blob in the accent colour. */
export const Blob: React.FC<{x: number; y: number; scale?: number; at?: number; exitAt?: number}> = ({x, y, scale = 1, at = 0, exitAt}) => {
  const theme = useTheme();
  const d = useMemo(() => {
    const r = mulberry32(12);
    const n = 22;
    const pts = Array.from({length: n}, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rad = i % 2 ? 92 + r() * 14 : 128 + r() * 16;
      return [150 + Math.cos(a) * rad, 150 + Math.sin(a) * rad];
    });
    return 'M' + pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' L') + ' Z';
  }, []);
  const sil = <path d={d} />;
  const details = (
    <>
      <circle cx={150} cy={150} r={58} fill={theme.ink} opacity={0.18} />
      <Halftone x={0} y={0} w={300} h={300} color={theme.ink} opacity={0.3} fade="down" dot={3.6} pitch={15} />
    </>
  );
  return <PaperPiece w={300} h={300} silhouette={sil} details={details} tint={theme.accent} border={10} x={x} y={y} scale={scale} at={at} exitAt={exitAt} seed={14} />;
};

/** A hand-drawn circle that draws itself on (a vaccination ring). */
export const HandRing: React.FC<{cx: number; cy: number; r: number; at: number; exitAt?: number; seed?: number; width?: number}> = ({cx, cy, r, at, exitAt, seed = 1, width = 7}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const d = useMemo(() => {
    const rnd = mulberry32(seed * 31 + 5);
    const n = 72;
    const ph = rnd() * 6;
    const pts = Array.from({length: n + 3}, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const rad = r + Math.sin(a * 3 + ph) * 5 + (rnd() - 0.5) * 3;
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    });
    return 'M' + pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' L');
  }, [cx, cy, r, seed]);
  const p = interpolate(frame, [at, at + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0 || fade <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: fade * 0.9}}>
      <path d={d} fill="none" stroke={theme.cream} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

/** A torn strip that tears in at `from` and tears out at `to` (so each scene owns its own strip). */
export const Strip: React.FC<React.ComponentProps<typeof TornStrip> & {from: number; to: number}> = ({from, to, ...rest}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to + 14) return null;
  const reveal = frame < to ? ease(frame, [from, from + 14], [0, 1]) : ease(frame, [to, to + 14], [1, 0]);
  return <TornStrip {...rest} reveal={reveal} revealFrom={frame < to ? 'start' : 'end'} />;
};

/** Renders children only until frame `to` (for one-shot accents that must not linger). */
export const Until: React.FC<{to: number; children: React.ReactNode}> = ({to, children}) => {
  const frame = useCurrentFrame();
  return frame < to ? <>{children}</> : null;
};
