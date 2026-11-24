// Shared kit for the fortune-cookie Reel: Vox plates, grain, stickers, labels, subtitles.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
// One typeface: David Libre, the David-like serif for historical topics (Hebrew + Latin)
import '@fontsource/david-libre/hebrew-400.css';
import '@fontsource/david-libre/hebrew-500.css';
import '@fontsource/david-libre/hebrew-700.css';
import '@fontsource/david-libre/latin-400.css';
import '@fontsource/david-libre/latin-500.css';
import '@fontsource/david-libre/latin-700.css';

// Vox plates (Nov 2026 look). Brand navy/red/cream: logo and end card ONLY.
export const C = {
  light: '#EDEEF3',
  dark: '#3A3C4A',
  peri: '#A1ACCA',
  charcoal: '#353336',
  paper: '#F4F3F9',
  coral: '#E0615E',
  yellow: '#FDF551',
  stamp: '#E5372F',
  navy: '#0A2370',
  red: '#B01F25',
  cream: '#F5F0E5',
};
export const FONT = '"David Libre"';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: e});
export const prog = (f: number, a: number, b: number) => lerp(f, a, b, 0, 1);

export const usePop = (delay: number, damping = 13) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, stiffness: 170, mass: 0.8}});
};

export const Plate: React.FC<{dark?: boolean}> = ({dark}) => (
  <AbsoluteFill>
    <Img src={staticFile(`img/${dark ? 'plate_dark' : 'plate_light'}.png`)} style={{width: '100%', height: '100%'}} />
  </AbsoluteFill>
);

// Paper grain + light vignette over everything (seed changes every 2 frames).
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 9;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'multiply'}}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(20,20,30,0.22) 100%)'}} />
    </AbsoluteFill>
  );
};

// A cutout/clipping placed on the plate: pop-in, slight rotation, soft paper shadow.
export const Sticker: React.FC<{
  src: string;
  x: number; // centre x
  y: number; // centre y
  w: number;
  rot?: number;
  delay?: number;
  from?: 'pop' | 'right' | 'left' | 'up' | 'none';
  shadow?: number;
  style?: React.CSSProperties;
}> = ({src, x, y, w, rot = 0, delay = 0, from = 'pop', shadow = 1, style}) => {
  const p = usePop(delay);
  let tx = 0,
    ty = 0,
    sc = 1,
    r = rot;
  if (from === 'pop') {
    sc = 0.6 + 0.4 * p;
    r = rot + (1 - p) * -8;
  } else if (from === 'right') tx = (1 - p) * 1100;
  else if (from === 'left') tx = (1 - p) * -1100;
  else if (from === 'up') ty = (1 - p) * 1300;
  const op = from === 'none' ? 1 : Math.min(1, p * 3);
  return (
    <Img
      src={staticFile(`img/${src}`)}
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y,
        width: w,
        transform: `translate(${tx}px, ${ty}px) translateY(-50%) rotate(${r}deg) scale(${sc})`,
        opacity: op,
        filter: `drop-shadow(0 ${10 * shadow}px ${14 * shadow}px rgba(20,20,35,${0.35 * shadow}))`,
        ...style,
      }}
    />
  );
};

// Torn cream paper label with dark text (Hebrew by default).
export const Label: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  rot?: number;
  delay?: number;
  ltr?: boolean;
  bg?: string;
  color?: string;
  maxW?: number;
}> = ({x, y, children, size = 40, rot = -2, delay = 0, ltr, bg = C.paper, color = C.charcoal, maxW = 860}) => {
  const p = usePop(delay, 15);
  return (
    <div
      dir={ltr ? 'ltr' : 'rtl'}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.7 + 0.3 * p})`,
        opacity: Math.min(1, p * 3),
        background: bg,
        color,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.25,
        padding: '14px 28px 16px',
        maxWidth: maxW,
        textAlign: 'center',
        clipPath:
          'polygon(0% 6%, 4% 0%, 12% 4%, 22% 0%, 35% 5%, 48% 1%, 60% 4%, 74% 0%, 86% 5%, 96% 1%, 100% 8%, 99% 92%, 94% 100%, 82% 96%, 70% 100%, 56% 95%, 42% 100%, 30% 96%, 16% 100%, 5% 95%, 0% 100%)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
        whiteSpace: 'pre-line',
      }}
    >
      {children}
    </div>
  );
};

// Subtitle box on the torn band (the recording script).
export const Subtitle: React.FC<{text: string; ltr?: boolean; hl?: string}> = ({text, ltr, hl}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 3], [0, 1], clamp);
  let body: React.ReactNode = text;
  if (hl && text.includes(hl)) {
    const [a, b] = text.split(hl);
    body = (
      <>
        {a}
        <span style={{color: C.yellow}}>{hl}</span>
        {b}
      </>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1585,
        display: 'flex',
        justifyContent: 'center',
        opacity: op,
      }}
    >
      <div
        dir={ltr ? 'ltr' : 'rtl'}
        style={{
          background: 'rgba(43,42,48,0.94)',
          color: '#fff',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1.28,
          padding: '16px 34px 18px',
          borderRadius: 14,
          maxWidth: 840,
          textAlign: 'center',
          transform: 'translateY(-50%)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
        }}
      >
        {body}
      </div>
    </div>
  );
};

// Big English key word: white, dark outline, David Libre 700.
export const KeyWord: React.FC<{text: string; size?: number; color?: string; style?: React.CSSProperties}> = ({
  text,
  size = 120,
  color = '#fff',
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      color,
      letterSpacing: 2,
      WebkitTextStroke: `${Math.round(size / 22)}px ${C.charcoal}`,
      paintOrder: 'stroke fill',
      textShadow: '0 8px 0 rgba(0,0,0,0.18)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

// Hand-drawn dashed arc that draws on.
export const Arc: React.FC<{d: string; p: number; color?: string; width?: number; dash?: boolean}> = ({
  d,
  p,
  color = C.coral,
  width = 8,
  dash = true,
}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs>
      <mask id={`m${d.length}`}>
        <path d={d} stroke="#fff" strokeWidth={width + 6} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
      </mask>
    </defs>
    <path
      d={d}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={dash ? '26 18' : undefined}
      mask={`url(#m${d.length})`}
    />
  </svg>
);

// Point + tangent on a quadratic bezier (for things riding an arc).
export const qPoint = (t: number, p0: number[], p1: number[], p2: number[]) => {
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return {x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI};
};
