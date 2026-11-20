import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {StippleDefs} from './paper';

/**
 * Flat illustrated honeybee in the style of the inspo frame (side view, facing right):
 * amber fuzzy body, dark-brown bands, big dark eye, translucent wings, thin legs,
 * stipple texture. viewBox 0 0 420 280. Rotation/position are set by the parent.
 */
export const Bee: React.FC<{
  size?: number; // rendered width in px
  flap?: boolean; // wings flapping (flying) vs folded (walking/dancing)
  id?: string;
  style?: React.CSSProperties;
}> = ({size = 300, flap = false, id = 'bee', style}) => {
  const f = useCurrentFrame();
  const wing = flap ? 0.35 + 0.65 * Math.abs(Math.sin(f * 1.9)) : 1;
  const sid = `${id}-st`;
  const legs = '#3A2312';
  return (
    <svg width={size} height={(size * 280) / 420} viewBox="0 0 420 280" style={{overflow: 'visible', ...style}}>
      <StippleDefs id={sid} color="#5A3410" size={6} opacity={0.35} />
      <defs>
        <clipPath id={`${id}-abd`}>
          <ellipse cx="140" cy="160" rx="100" ry="64" transform="rotate(-12 140 160)" />
        </clipPath>
        <radialGradient id={`${id}-fuzz`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#F6C25C" />
          <stop offset="1" stopColor="#D9891F" />
        </radialGradient>
      </defs>

      {/* far legs */}
      <g stroke={legs} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        <polyline points="215,185 200,225 214,262" />
        <polyline points="255,185 262,228 290,258" />
      </g>

      {/* abdomen with bands */}
      <g clipPath={`url(#${id}-abd)`}>
        <rect x="20" y="80" width="260" height="170" fill={`url(#${id}-fuzz)`} />
        {[62, 104, 146].map((x, k) => (
          <rect key={k} x={x} y="70" width="24" height="190" fill={C.ink} transform={`rotate(-14 ${x} 160)`} />
        ))}
        <rect x="20" y="80" width="260" height="170" fill={`url(#${sid})`} />
        <ellipse cx="160" cy="200" rx="110" ry="28" fill="#000" opacity="0.12" />
      </g>
      {/* stinger */}
      <polygon points="38,182 14,196 40,194" fill={C.ink} />

      {/* thorax */}
      <ellipse cx="258" cy="140" rx="58" ry="54" fill={`url(#${id}-fuzz)`} />
      <ellipse cx="258" cy="140" rx="58" ry="54" fill={`url(#${sid})`} />
      <path d="M 214 118 Q 258 92 300 120" stroke="#F8D27E" strokeWidth="8" fill="none" opacity="0.7" />

      {/* head */}
      <ellipse cx="330" cy="146" rx="36" ry="40" fill="#C97F22" />
      <ellipse cx="330" cy="146" rx="36" ry="40" fill={`url(#${sid})`} />
      {/* eye */}
      <ellipse cx="338" cy="136" rx="17" ry="24" fill="#27261F" />
      <ellipse cx="333" cy="126" rx="5" ry="7" fill="#fff" opacity="0.55" />
      {/* mandible */}
      <path d="M 352 172 q 12 6 6 18" stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* antennae */}
      <g stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M 344 112 Q 352 74 392 58" />
        <path d="M 334 110 Q 334 70 366 46" />
      </g>

      {/* near legs */}
      <g stroke={legs} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="236,182 222,222 236,264" />
        <polyline points="272,184 286,226 318,252" />
        <polyline points="300,178 326,214 352,224" />
      </g>
      {/* pollen basket */}
      <ellipse cx="226" cy="224" rx="11" ry="15" fill={C.amberDeep} />

      {/* wings (pivot at thorax top) */}
      <g transform={`translate(250 104) scale(1 ${wing}) translate(-250 -104)`}>
        <ellipse cx="178" cy="78" rx="96" ry="30" transform="rotate(-14 178 78)" fill="#FFFFFF" opacity="0.62" />
        <ellipse cx="196" cy="96" rx="74" ry="22" transform="rotate(-6 196 96)" fill="#F4F6F2" opacity="0.7" />
        <g stroke="#9AA6A0" strokeWidth="2" fill="none" opacity="0.9">
          <path d="M 250 100 L 110 92" />
          <path d="M 200 86 Q 160 64 120 74" />
          <path d="M 236 98 Q 200 110 140 104" />
        </g>
      </g>
    </svg>
  );
};

/** Top-down bee for the comb / dance-path views (heading = up). viewBox 0 0 120 200. */
export const BeeTop: React.FC<{size?: number; id?: string; style?: React.CSSProperties; dim?: boolean}> = ({
  size = 90,
  id = 'bt',
  style,
  dim,
}) => (
  <svg width={size} height={(size * 200) / 120} viewBox="0 0 120 200" style={{overflow: 'visible', ...style}}>
    <defs>
      <clipPath id={`${id}-c`}>
        <ellipse cx="60" cy="128" rx="34" ry="56" />
      </clipPath>
    </defs>
    {/* legs */}
    <g stroke="#3A2312" strokeWidth="5" strokeLinecap="round" fill="none">
      <path d="M 40 72 L 12 60 M 80 72 L 108 60 M 38 88 L 8 96 M 82 88 L 112 96 M 40 104 L 16 130 M 80 104 L 104 130" />
    </g>
    <g clipPath={`url(#${id}-c)`}>
      <rect x="0" y="60" width="120" height="140" fill={dim ? '#B97A24' : '#E9A23B'} />
      {[108, 132, 156].map((y) => (
        <rect key={y} x="0" y={y} width="120" height="12" fill={C.ink} />
      ))}
    </g>
    <ellipse cx="60" cy="78" rx="28" ry="26" fill={dim ? '#A86E1E' : '#D98E2B'} />
    <ellipse cx="60" cy="40" rx="20" ry="18" fill="#3A2312" />
    <g stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round">
      <path d="M 52 26 Q 44 6 30 0" />
      <path d="M 68 26 Q 76 6 90 0" />
    </g>
    <ellipse cx="34" cy="100" rx="16" ry="44" transform="rotate(14 34 100)" fill="#fff" opacity="0.55" />
    <ellipse cx="86" cy="100" rx="16" ry="44" transform="rotate(-14 86 100)" fill="#fff" opacity="0.55" />
  </svg>
);
