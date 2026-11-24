// Drawn objects for the Post-it Reel (layer 2/3 cutouts). All words live outside these drawings except "KG" on the weight.
import React from 'react';
import {C} from '../lib/paper';

/** Pad of sticky notes; `peel` 0..1 curls the bottom-left corner (where real notes curl: the glue is on the top edge). */
export const PostItPad: React.FC<{size: number; peel?: number; sheets?: number; topOpacity?: number}> = ({size: S, peel = 0, sheets = 7, topOpacity = 1}) => {
  const s = peel * S * 0.42;
  const edge = Array.from({length: sheets});
  return (
    <svg width={S + 20} height={S + sheets * 5 + 20} viewBox={`0 0 ${S + 20} ${S + sheets * 5 + 20}`} style={{overflow: 'visible'}}>
      {edge.map((_, i) => (
        <rect key={i} x={0} y={(sheets - i) * 5} width={S} height={S} fill={i % 2 ? '#E9C232' : '#F0CB36'} />
      ))}
      <g opacity={topOpacity}>
        {/* the note under the peel shows through */}
        <rect x={0} y={0} width={S} height={S} fill="#EFC834" />
        <path d={`M0,0 L${S},0 L${S},${S} L${s},${S} L0,${S - s} Z`} fill={C.accent} />
        {/* glue band, barely visible, top edge */}
        <rect x={0} y={0} width={S} height={S * 0.14} fill="#F7D54A" />
        {s > 1 && (
          <>
            <path d={`M${s},${S} L0,${S - s} L${s * 1.05},${S - s * 1.05} Z`} fill="rgba(60,45,0,0.25)" transform={`translate(4 6)`} />
            <path d={`M${s},${S} L0,${S - s} L${s},${S - s} Z`} fill="url(#flap)" />
          </>
        )}
      </g>
      <defs>
        <linearGradient id="flap" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF1A8" />
          <stop offset="1" stopColor="#F2CE45" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/** One loose sticky note (square), optional content drawn on it. */
export const Note: React.FC<{size: number; color?: string; children?: React.ReactNode}> = ({size, color = C.accent, children}) => (
  <svg width={size} height={size * 1.02} viewBox="0 0 100 102" style={{overflow: 'visible'}}>
    <rect x={0} y={0} width={100} height={100} fill={color} />
    <rect x={0} y={0} width={100} height={14} fill="#F7D54A" />
    <path d="M0,100 Q50,104 100,100 L100,102 L0,102 Z" fill="rgba(0,0,0,0.08)" />
    {children}
  </svg>
);

export const GlueJar: React.FC<{w?: number; level?: number}> = ({w = 220, level = 0.62}) => {
  const h = w * 1.15;
  return (
    <svg width={w} height={h} viewBox="0 0 100 115" style={{overflow: 'visible'}}>
      <rect x={14} y={0} width={72} height={20} rx={5} fill={C.charcoal} />
      <rect x={18} y={4} width={64} height={3} fill="#5A585D" />
      <rect x={6} y={18} width={88} height={95} rx={16} fill="#DDE3EE" />
      <rect x={6} y={18 + 95 * (1 - level)} width={88} height={95 * level} rx={14} fill={C.accentDeep} />
      <path d={`M6,${18 + 95 * (1 - level) + 6} Q30,${18 + 95 * (1 - level) - 4} 50,${18 + 95 * (1 - level) + 4} T94,${18 + 95 * (1 - level)}`} stroke="#F5D75C" strokeWidth={4} fill="none" />
      <rect x={16} y={28} width={9} height={64} rx={4} fill="rgba(255,255,255,0.65)" />
      {/* plain lab label, no words */}
      <rect x={30} y={56} width={52} height={30} rx={3} fill="#FFFFFF" />
      <rect x={36} y={64} width={40} height={4} fill={C.charcoal} opacity={0.6} />
      <rect x={36} y={73} width={28} height={4} fill={C.charcoal} opacity={0.35} />
    </svg>
  );
};

export const Weight: React.FC<{w?: number}> = ({w = 170}) => (
  <svg width={w} height={w} viewBox="0 0 100 100">
    <path d="M32,30 Q32,6 50,6 Q68,6 68,30" stroke={C.charcoal} strokeWidth={10} fill="none" />
    <path d="M14,40 Q14,28 28,28 L72,28 Q86,28 86,40 L94,86 Q96,98 82,98 L18,98 Q4,98 6,86 Z" fill={C.charcoal} />
    <text x={50} y={76} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={24} fill="#FFFFFF">KG</text>
  </svg>
);

/** Open hymn book seen from above; pages carry music staves. */
export const Hymnal: React.FC<{w?: number}> = ({w = 640}) => {
  const staves = (x0: number) =>
    [0, 1, 2, 3].map((k) => (
      <g key={`${x0}-${k}`}>
        {[0, 1, 2, 3, 4].map((l) => (
          <rect key={l} x={x0} y={34 + k * 52 + l * 6} width={126} height={1.4} fill={C.charcoal} opacity={0.45} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <ellipse key={`n${n}`} cx={x0 + 14 + n * 20} cy={34 + k * 52 + ((n * 7 + k * 3) % 5) * 6} rx={3.4} ry={2.6} fill={C.charcoal} opacity={0.7} />
        ))}
      </g>
    ));
  return (
    <svg width={w} height={w * 0.72} viewBox="0 0 320 230" style={{overflow: 'visible'}}>
      <rect x={0} y={6} width={320} height={224} rx={8} fill={C.charcoal} />
      <path d="M10,10 L156,14 L156,222 L10,218 Z" fill={C.cream} />
      <path d="M164,14 L310,10 L310,218 L164,222 Z" fill="#F7F0DC" />
      <rect x={155} y={12} width={10} height={212} fill="rgba(0,0,0,0.12)" />
      {staves(20)}
      {staves(174)}
    </svg>
  );
};

/** Paper bookmark strip; `glue` shows the yellow adhesive band at its bottom. */
export const Bookmark: React.FC<{w?: number; h?: number; glue?: number; yellow?: number}> = ({w = 70, h = 300, glue = 0, yellow = 0}) => {
  const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
      <rect x={0} y={0} width={w} height={h} fill={mix([255, 255, 255], [244, 207, 58], yellow)} />
      <rect x={w * 0.42} y={h * 0.08} width={w * 0.16} height={h * 0.18} rx={3} fill={C.charcoal} opacity={1 - yellow} />
      {glue > 0 && <rect x={0} y={h - h * 0.2} width={w} height={h * 0.2} fill={C.accentDeep} opacity={glue * (1 - yellow)} />}
    </svg>
  );
};

export const TrashBin: React.FC<{w?: number}> = ({w = 230}) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 100 110">
    <path d="M8,14 L92,14 L82,108 L18,108 Z" fill={C.charcoal} />
    <rect x={2} y={6} width={96} height={12} rx={4} fill="#4A484D" />
    {[30, 50, 70].map((x) => (
      <rect key={x} x={x - 2} y={28} width={4} height={66} rx={2} fill="#5E5C62" />
    ))}
  </svg>
);

/** Flat paper-cutout hand with sleeve, palm facing left (pushes things right-to-left). */
export const PushHand: React.FC<{w?: number}> = ({w = 300}) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 200 110" style={{overflow: 'visible'}}>
    <rect x={110} y={28} width={100} height={56} rx={10} fill="#FFFFFF" />
    <rect x={104} y={26} width={18} height={60} rx={6} fill="#D9DCE6" />
    <path d="M106,30 L60,24 Q38,22 34,40 L30,74 Q30,92 50,92 L106,86 Z" fill="#E6B48C" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={14} y={26 + i * 15} width={52} height={13} rx={6.5} fill="#E6B48C" />
    ))}
    <rect x={50} y={88} width={40} height={12} rx={6} fill="#E6B48C" transform="rotate(-25 50 92)" />
  </svg>
);

/** Choir loft: three rows of singers in white robes holding hymn books. `hero` marks Art Fry's position. */
export const ChoirLoft: React.FC<{w?: number}> = ({w = 820}) => {
  const skins = ['#E6B48C', '#C98E66', '#F0C7A4', '#A8714E', '#DDA57C'];
  const hair = ['#3B2A22', '#6B4A32', '#2A2A2A', '#8C6A44', '#4A3426'];
  const rows = [
    {y: 70, n: 6, s: 0.8},
    {y: 160, n: 6, s: 0.9},
    {y: 260, n: 5, s: 1},
  ];
  return (
    <svg width={w} height={w * 0.62} viewBox="0 0 500 380">
      <rect x={0} y={0} width={500} height={380} fill="#B9AE98" />
      <rect x={0} y={0} width={500} height={120} fill="#A69A82" />
      {[60, 190, 320, 450].map((x) => (
        <path key={x} d={`M${x - 30},120 L${x - 30},40 Q${x},0 ${x + 30},40 L${x + 30},120 Z`} fill="#CFC6B0" opacity={0.7} />
      ))}
      {rows.map((r, ri) => (
        <g key={ri}>
          <rect x={0} y={r.y + 70 * r.s} width={500} height={26} fill={ri === 2 ? '#5B4636' : '#6A5443'} />
          {Array.from({length: r.n}).map((_, i) => {
            const cx = (500 / r.n) * (i + 0.5);
            const k = (ri * 7 + i * 3) % 5;
            return (
              <g key={i} transform={`translate(${cx} ${r.y}) scale(${r.s})`}>
                <path d="M-30,80 Q-30,30 0,28 Q30,30 30,80 Z" fill="#FAFAF6" />
                <path d="M-12,30 L0,46 L12,30 Z" fill="#D9D3C4" />
                <circle cx={0} cy={10} r={17} fill={skins[k]} />
                <path d="M-17,6 Q-16,-12 0,-10 Q16,-12 17,6 Q8,-2 -17,6 Z" fill={hair[k]} />
                <rect x={-14} y={50} width={28} height={18} rx={2} fill={C.charcoal} transform="rotate(-8)" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

/** Light bulb drawn with a marker; `draw` 0..1 animates the stroke on, `lit` 0..1 fills it. */
export const DrawnBulb: React.FC<{size: number; draw: number; lit: number}> = ({size, draw, lit}) => {
  const len = 420;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <path d="M50,14 C30,14 22,30 24,44 C26,56 36,60 38,72 L62,72 C64,60 74,56 76,44 C78,30 70,14 50,14 Z" fill={`rgba(253,245,81,${lit * 0.9})`} />
      <path d="M50,14 C30,14 22,30 24,44 C26,56 36,60 38,72 L62,72 C64,60 74,56 76,44 C78,30 70,14 50,14 Z M40,80 L60,80 M42,87 L58,87 M46,93 L54,93" fill="none" stroke={C.charcoal} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      {lit > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = (-150 + i * 30) * (Math.PI / 180);
          return <line key={i} x1={50 + Math.cos(a) * 42} y1={44 + Math.sin(a) * 42} x2={50 + Math.cos(a) * (42 + 12 * lit)} y2={44 + Math.sin(a) * (42 + 12 * lit)} stroke={C.charcoal} strokeWidth={4} strokeLinecap="round" opacity={lit} />;
        })}
    </svg>
  );
};
