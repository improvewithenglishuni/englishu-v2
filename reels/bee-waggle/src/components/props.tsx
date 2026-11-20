import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_HE, FONT_KEY, H, SUBS, W, FPS} from '../theme';
import {blobPath, StippleDefs} from './paper';

/** Rust branch with stipple and gold grain lines + one white blossom (from the inspo frame). */
export const Branch: React.FC<{style?: React.CSSProperties; bloom?: number}> = ({style, bloom = 1}) => (
  <svg width={900} height={700} viewBox="0 0 900 700" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <StippleDefs id="br-st" color="#E7C79A" size={6} opacity={0.6} />
    <path d="M -40 20 C 160 130 330 250 470 330 C 610 410 760 520 960 640 L 950 668 C 740 552 600 444 456 362 C 320 284 150 170 -56 52 Z" fill={C.rust} />
    <path d="M 300 236 C 300 150 330 70 360 -20 L 392 -12 C 364 70 336 160 336 254 Z" fill="#B88A55" />
    <path d="M -40 20 C 160 130 330 250 470 330 L 456 362 C 320 284 150 170 -56 52 Z" fill="url(#br-st)" />
    <path d="M 300 236 C 300 150 330 70 360 -20 L 392 -12 C 364 70 336 160 336 254 Z" fill="url(#br-st)" />
    <path d="M 620 430 q 50 -20 90 30 M 640 452 q 50 -16 80 26" stroke="#E2C08A" strokeWidth="5" fill="none" opacity="0.85" />
    {/* blossom */}
    <g transform={`translate(470 330) scale(${bloom})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-92" rx="70" ry="86" transform={`rotate(${a + 10})`} fill="#FBFCFB" stroke="#E6ECE8" strokeWidth="3" />
      ))}
      <circle r="34" fill="#4E8F6B" />
      <circle r="22" fill="#2E6B57" />
      {Array.from({length: 14}).map((_, k) => {
        const a = (k / 14) * Math.PI * 2 - 1.4;
        const len = 46 + 18 * random(`st${k}`);
        return (
          <g key={k}>
            <line x1="0" y1="0" x2={Math.cos(a) * len} y2={Math.sin(a) * len} stroke="#E8E2A0" strokeWidth="3" />
            <ellipse cx={Math.cos(a) * len} cy={Math.sin(a) * len} rx="6" ry="8" fill={C.amber} />
          </g>
        );
      })}
    </g>
  </svg>
);

/** Honeycomb hex grid filling a box. */
export const Comb: React.FC<{
  w: number;
  h: number;
  r?: number;
  fill?: string;
  stroke?: string;
  honey?: number; // fraction of cells filled with honey
  style?: React.CSSProperties;
  seed?: string;
}> = ({w, h, r = 46, fill = '#E7B867', stroke = '#C58A2E', honey = 0.25, style, seed = 'comb'}) => {
  const hx = Math.sqrt(3) * r;
  const cells: React.ReactNode[] = [];
  let i = 0;
  for (let row = -1; row * r * 1.5 < h + r; row++) {
    for (let col = -1; col * hx < w + hx; col++) {
      const cx = col * hx + (row % 2 ? hx / 2 : 0);
      const cy = row * r * 1.5;
      const pts = Array.from({length: 6}, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${cx + Math.cos(a) * (r - 3)},${cy + Math.sin(a) * (r - 3)}`;
      }).join(' ');
      const isHoney = random(`${seed}${i++}`) < honey;
      cells.push(
        <polygon key={i} points={pts} fill={isHoney ? '#D88F1E' : fill} stroke={stroke} strokeWidth={5} />,
      );
    }
  }
  return (
    <svg width={w} height={h} style={{position: 'absolute', overflow: 'hidden', ...style}}>
      <StippleDefs id={`${seed}-st`} color="#7A4A10" size={7} opacity={0.3} />
      {cells}
      <rect width={w} height={h} fill={`url(#${seed}-st)`} />
    </svg>
  );
};

/** Paper-cut sun with rays. */
export const Sun: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 200, style}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{position: 'absolute', overflow: 'visible', ...style}}>
      <StippleDefs id="sun-st" color="#8A4E0A" size={6} opacity={0.3} />
      <g transform={`rotate(${f * 0.6})`}>
        {Array.from({length: 12}).map((_, k) => (
          <polygon key={k} points="-9,-62 9,-62 0,-96" fill={C.amber} transform={`rotate(${k * 30})`} />
        ))}
      </g>
      <circle r="56" fill="#fff" />
      <circle r="50" fill={C.amber} />
      <circle r="50" fill="url(#sun-st)" />
    </svg>
  );
};

/** Location pin. */
export const Pin: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 120, style}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <ellipse cx="50" cy="124" rx="18" ry="5" fill="#000" opacity="0.2" />
    <path d="M 50 122 C 40 96 10 74 10 46 A 40 40 0 1 1 90 46 C 90 74 60 96 50 122 Z" fill="#fff" />
    <path d="M 50 114 C 42 92 16 72 16 46 A 34 34 0 1 1 84 46 C 84 72 58 92 50 114 Z" fill={C.stampRed} />
    <circle cx="50" cy="46" r="14" fill="#fff" />
  </svg>
);

/** Simple flower marker (food source) for diagrams. */
export const Flower: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 90, style}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{position: 'absolute', overflow: 'visible', ...style}}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx="0" cy="-24" rx="18" ry="24" transform={`rotate(${a})`} fill="#fff" stroke="#DDE4DF" strokeWidth="2" />
    ))}
    <circle r="12" fill={C.amber} />
  </svg>
);

/** Skep-style hive icon for diagrams. */
export const Hive: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 110, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <StippleDefs id="hv-st" color="#5A3410" size={5} opacity={0.35} />
    {[0, 1, 2, 3].map((k) => (
      <rect key={k} x={18 - k * 6} y={18 + k * 18} width={64 + k * 12} height="19" rx="9" fill={k % 2 ? '#D9963A' : C.amber} />
    ))}
    <rect x="0" y="18" width="100" height="74" fill="url(#hv-st)" />
    <path d="M 42 92 v -14 a 8 8 0 0 1 16 0 v 14 Z" fill={C.ink} />
  </svg>
);

/**
 * Die-cut sticker. With a cut-out PNG: traces the subject outline (white border via stacked drop-shadows).
 * With a plain photo: organic blob shape with a white rim. Children render instead of an image (stand-in art).
 */
export const Sticker: React.FC<{
  src?: string | null;
  cutout?: boolean;
  w: number;
  h: number;
  seed: string;
  border?: number;
  children?: React.ReactNode;
  imgStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}> = ({src, cutout, w, h, seed, border = 14, children, imgStyle, style}) => {
  const shadow = 'drop-shadow(0 18px 22px rgba(40,26,12,0.32))';
  if (src && cutout) {
    const ring = [0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `drop-shadow(${(Math.cos((a * Math.PI) / 180) * border).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * border).toFixed(1)}px 0 #fff)`)
      .join(' ');
    return (
      <div style={{position: 'absolute', width: w, height: h, filter: shadow, ...style}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'contain', filter: ring, ...imgStyle}} />
      </div>
    );
  }
  const d = blobPath(w / 2, h / 2, w / 2 - border - 4, h / 2 - border - 4, seed);
  return (
    <div style={{position: 'absolute', width: w, height: h, filter: shadow, ...style}}>
      <svg width={w} height={h} style={{position: 'absolute'}}>
        <path d={d} fill="#fff" stroke="#fff" strokeWidth={border * 2} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, clipPath: `path('${d}')`, overflow: 'hidden'}}>
        {src ? (
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', ...imgStyle}} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

/** Paper label (Hebrew or gloss). */
export const Label: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  rot?: number;
  dir?: 'rtl' | 'ltr';
  style?: React.CSSProperties;
}> = ({children, bg = C.cream, color = C.ink, size = 54, rot = -2, dir = 'rtl', style}) => (
  <div
    dir={dir}
    style={{
      position: 'absolute',
      background: bg,
      color,
      fontFamily: FONT_HE,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.1,
      padding: '16px 36px',
      transform: `rotate(${rot}deg)`,
      boxShadow: '6px 8px 0 rgba(42,26,15,0.30)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Burned-in subtitles: Hebrew RTL; English LTR with the target word in amber. Bottom-aligned at y=1500. */
export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const s = SUBS.find((x) => t >= x.from && t < x.to);
  if (!s) return null;
  const isEn = s.lang === 'en';
  const words = s.text.split(' ');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        dir={isEn ? 'ltr' : 'rtl'}
        style={{
          position: 'absolute',
          left: 90,
          width: 900,
          top: 1300,
          height: 200,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: FONT_HE,
          fontWeight: 800,
          fontSize: isEn ? 60 : 66,
          lineHeight: 1.18,
          color: '#fff',
          WebkitTextStroke: '8px #1B120B',
          paintOrder: 'stroke fill',
          textShadow: '0 4px 10px rgba(0,0,0,0.25)',
        }}
      >
        <span>
          {isEn
            ? words.map((w, k) => (
                <span key={k} style={{color: s.key && w.toLowerCase().startsWith(s.key) ? C.amber : '#fff'}}>
                  {w}
                  {k < words.length - 1 ? ' ' : ''}
                </span>
              ))
            : s.text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** Big English key word style (Anton, cream fill, dark outline, offset shadow). */
export const keyWordStyle = (size: number): React.CSSProperties => ({
  fontFamily: FONT_KEY,
  fontSize: size,
  lineHeight: 1,
  color: C.cream,
  WebkitTextStroke: `${Math.round(size / 30)}px ${C.ink}`,
  paintOrder: 'stroke fill',
  textShadow: `${Math.round(size / 28)}px ${Math.round(size / 22)}px 0 rgba(42,26,15,0.35)`,
  letterSpacing: 2,
});

export const fullW = W;
export const fullH = H;
