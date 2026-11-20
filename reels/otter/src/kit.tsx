// Shared building blocks for the otter Reel (Vox mixed-media kit).
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import '@fontsource/rubik/hebrew-500.css';
import '@fontsource/rubik/hebrew-700.css';
import '@fontsource/rubik/hebrew-900.css';
import '@fontsource/rubik/latin-500.css';
import '@fontsource/rubik/latin-700.css';
import '@fontsource/rubik/latin-900.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/latin-900-italic.css';
import '@fontsource/frank-ruhl-libre/hebrew-700.css';
import '@fontsource/frank-ruhl-libre/hebrew-900.css';

// ---- Palette: ink black, field-guide grey, white line, ONE accent (Vox yellow)
export const C = {
  ink: '#111214',
  paper: '#E3E3E0',
  line: '#F2F2EE',
  yellow: '#F7E21B',
  black: '#0B0B0C',
  navy: '#0A2370', // brand: end card only
  red: '#B01F25', // brand: end card only
  cream: '#F5F0E5', // brand: end card only
};
export const SANS = 'Rubik';
export const SERIF_EN = '"Playfair Display"';
export const SERIF_HE = '"Frank Ruhl Libre"';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const lerp = (f: number, a: number, b: number, from: number, to: number, e = ease) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

export const Plate: React.FC<{ src: 'plate_ink.png' | 'plate_paper.png' }> = ({ src }) => (
  <AbsoluteFill>
    <Img src={staticFile(src)} style={{ width: '100%', height: '100%' }} />
  </AbsoluteFill>
);

// Film grain + light vignette over everything. Seed changes every 2 frames.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="1080" height="1920" style={{ position: 'absolute', opacity, mixBlendMode: 'overlay' }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)' }} />
    </AbsoluteFill>
  );
};

// A full-frame real photo. Slow zoom (6%) only because it fills the frame.
export const FullPhoto: React.FC<{
  src: string; dur: number; pos?: string; zoom?: boolean; filter?: string; style?: React.CSSProperties;
}> = ({ src, dur, pos = '50% 50%', zoom = true, filter = 'contrast(1.06) saturate(0.85)', style }) => {
  const f = useCurrentFrame();
  const s = zoom ? interpolate(f, [0, dur], [1, 1.06], clamp) : 1;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${s})`, filter, ...style }} />
    </AbsoluteFill>
  );
};

// Torn-edge polygon for magazine clippings (deterministic jitter).
export const tornClip = (seed: number, teeth = 34, depth = 1.6) => {
  const r = (i: number) => {
    const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${r(i) * depth}%`);
  for (let i = 0; i <= teeth / 2; i++) pts.push(`${100 - r(i + 50) * depth * 0.6}% ${(i / (teeth / 2)) * 100}%`);
  for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * 100}% ${100 - r(i + 100) * depth}%`);
  for (let i = teeth / 2; i >= 0; i--) pts.push(`${r(i + 150) * depth * 0.6}% ${(i / (teeth / 2)) * 100}%`);
  return `polygon(${pts.join(',')})`;
};

// Hand-drawn stroke that draws on (pathLength normalised to 1).
export const Draw: React.FC<{
  d: string; p: number; color?: string; width?: number; dash?: string; opacity?: number; filter?: string; cap?: 'round' | 'butt';
}> = ({ d, p, color = C.yellow, width = 8, dash, opacity = 1, filter, cap = 'round' }) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap={cap}
    strokeLinejoin="round"
    strokeDasharray={dash ?? '1 1'}
    strokeDashoffset={dash ? undefined : 1 - Math.max(0, Math.min(1, p))}
    opacity={opacity}
    filter={filter}
  />
);

// Wobbly "felt-tip" filter so vector strokes feel hand-drawn.
export const Wobble: React.FC<{ id: string; seed?: number; scale?: number }> = ({ id, seed = 3, scale = 5 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} />
  </filter>
);

// Hand-drawn ring (not closed, overshoots like a pen loop).
export const ringPath = (cx: number, cy: number, rx: number, ry: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = -0.6 + (i / 60) * (Math.PI * 2 + 0.9);
    const k = 1 + 0.06 * Math.sin(t * 3) + (i / 60) * 0.07;
    pts.push(`${(cx + Math.cos(t) * rx * k).toFixed(1)},${(cy + Math.sin(t) * ry * k).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
};

// Text that types on (clip reveal). rtl reveals from the right.
export const TypeOn: React.FC<{ p: number; rtl?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, rtl, children, style }) => {
  const hide = (1 - Math.max(0, Math.min(1, p))) * 100;
  return (
    <div style={{ clipPath: rtl ? `inset(-20% 0 -20% ${hide}%)` : `inset(-20% ${hide}% -20% 0)`, ...style }}>{children}</div>
  );
};

// Pop-in helper (spring scale + tiny rotation).
export const usePop = (start: number, rot = -3) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - start, fps, config: { damping: 12, stiffness: 170, mass: 0.7 } });
  return { transform: `scale(${s}) rotate(${(1 - s) * rot}deg)`, opacity: f < start ? 0 : 1 };
};

// ---------------- Subtitles ----------------
export type Line = { from: number; to: number; text: string; en?: boolean; word?: string };
export const Subtitles: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const l = lines.find((x) => t >= x.from && t < x.to);
  if (!l) return null;
  const parts = l.word ? l.text.split(new RegExp(`(${l.word})`, 'i')) : [l.text];
  return (
    <div
      dir={l.en ? 'ltr' : 'rtl'}
      style={{
        position: 'absolute', left: 90, width: 860, top: 1500, minHeight: 200,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 58, lineHeight: 1.22, color: 'white',
        WebkitTextStroke: '10px rgba(0,0,0,0.9)', paintOrder: 'stroke fill',
        textShadow: '0 4px 14px rgba(0,0,0,0.45)',
      }}
    >
      <span>
        {parts.map((p, i) =>
          l.word && p.toLowerCase() === l.word.toLowerCase() ? (
            <span key={i} style={{ color: C.yellow, fontWeight: 900 }}>{p}</span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </span>
    </div>
  );
};

// ---------------- Scribble line-art otter (inspiration 4: ghostly white pen loops) ----------------
// Otter floating on its back, head on the left, in a 420 x 160 box.
export const OTTER_PATHS = [
  'M70,95 C90,60 180,52 260,58 C320,62 360,72 385,88 C395,95 392,108 378,112 C340,124 260,130 180,126 C120,123 80,118 70,95 Z',
  'M22,90 C20,66 40,54 60,56 C82,58 96,72 94,92 C92,112 72,122 52,120 C32,118 24,106 22,90 Z',
  'M38,62 C38,52 48,50 52,58',
  'M18,88 C14,84 16,78 24,80',
  'M44,82 C50,86 56,86 62,82',
  'M150,64 C142,44 160,36 170,54',
  'M178,60 C174,40 194,36 198,56',
  'M330,64 C334,40 356,38 362,58',
  'M352,70 C362,50 384,52 384,72',
  'M386,94 C406,90 422,96 420,104 C408,112 394,110 380,108',
  'M110,80 C140,74 170,74 200,80 M120,100 C160,94 220,96 280,100 M200,112 C240,108 290,108 340,102',
];

export const ScribbleOtter: React.FC<{ p?: number; color?: string; seed?: number; width?: number; ghosts?: number }> = ({
  p = 1, color = C.line, seed = 1, width = 3.2, ghosts = 3,
}) => {
  const f = useCurrentFrame();
  const boil = Math.floor(f / 4) % 3; // line "boil" like hand-drawn animation
  return (
    <svg viewBox="0 0 430 160" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        {Array.from({ length: ghosts }).map((_, g) => (
          <Wobble key={g} id={`ow${seed}-${g}-${boil}`} seed={seed * 10 + g * 3 + boil} scale={7} />
        ))}
      </defs>
      {Array.from({ length: ghosts }).map((_, g) => (
        <g key={g} filter={`url(#ow${seed}-${g}-${boil})`} opacity={g === 0 ? 0.95 : 0.45}>
          {OTTER_PATHS.map((d, i) => (
            <Draw key={i} d={d} p={p * 1.15 - i * 0.012} color={color} width={g === 0 ? width : width * 0.7} />
          ))}
        </g>
      ))}
    </svg>
  );
};

export const ANCHOR =
  'M0,-70 C-12,-70 -12,-52 0,-52 C12,-52 12,-70 0,-70 M0,-52 L0,58 M-26,-32 L26,-32 M-48,22 C-44,52 -20,62 0,60 C20,62 44,52 48,22 M-48,22 L-58,34 M-48,22 L-36,30 M48,22 L58,34 M48,22 L36,30';

// Black-outlined data box (inspiration 2: field-guide annotation)
export const DataBox: React.FC<{ x: number; y: number; w: number; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, dark, children, style }) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, padding: '30px 34px',
      border: `6px solid ${dark ? C.line : C.black}`, color: dark ? C.line : C.black,
      background: dark ? 'rgba(17,18,20,0.55)' : 'rgba(235,235,232,0.6)', textAlign: 'center', ...style,
    }}
  >
    {children}
  </div>
);

// Rough yellow highlighter brush behind a word (inspiration 3)
export const Brush: React.FC<{ p: number; w: number; h: number }> = ({ p, w, h }) => (
  <svg width={w} height={h} viewBox="0 0 100 30" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <defs>
      <filter id="brushf" x="-5%" y="-30%" width="110%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="3" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
      </filter>
      <clipPath id="brushclip"><rect x={100 - p * 100} y="-10" width={p * 100 + 1} height="50" /></clipPath>
    </defs>
    <g clipPath="url(#brushclip)">
      <path d="M1,6 C30,3 70,4 99,5 L99,25 C70,27 30,26 1,24 Z" fill={C.yellow} filter="url(#brushf)" />
    </g>
  </svg>
);
