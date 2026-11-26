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

/**
 * Detailed top-down honeybee (heading = up), modelled on the inspo frames:
 * fuzzy thorax, banded abdomen with soft shading, elbowed antennae, veined translucent wings,
 * jointed legs and a cast shadow. viewBox 0 0 120 200.
 * buzz: wings blur/vibrate (during the waggle run).
 */
export const BeeTop: React.FC<{size?: number; id?: string; style?: React.CSSProperties; dim?: boolean; buzz?: boolean}> = ({
  size = 90,
  id = 'bt',
  style,
  dim,
  buzz,
}) => {
  const f = useCurrentFrame();
  const wv = buzz ? Math.sin(f * 2.7) * 7 : 0;
  const body = dim ? '#B5822F' : '#E2A23E';
  const band = '#2E1C0E';
  const fuzz = dim ? '#9C6A24' : '#C1832C';
  return (
    <svg width={size} height={(size * 200) / 120} viewBox="0 0 120 200" style={{overflow: 'visible', ...style}}>
      <defs>
        <clipPath id={`${id}-c`}>
          <path d="M 60 92 C 92 92 96 140 84 168 C 76 186 66 194 60 196 C 54 194 44 186 36 168 C 24 140 28 92 60 92 Z" />
        </clipPath>
        <radialGradient id={`${id}-sh`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* cast shadow */}
      <ellipse cx="68" cy="128" rx="40" ry="70" fill="#1A0F06" opacity="0.18" />
      {/* legs (jointed) */}
      <g stroke="#3A2312" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="46,70 26,62 16,46" />
        <polyline points="74,70 94,62 104,46" />
        <polyline points="44,82 18,88 8,104" />
        <polyline points="76,82 102,88 112,104" />
        <polyline points="46,94 24,118 20,146" />
        <polyline points="74,94 96,118 100,146" />
      </g>
      <g fill="#C97A2A">
        <ellipse cx="23" cy="122" rx="5" ry="8" />
        <ellipse cx="97" cy="122" rx="5" ry="8" />
      </g>
      {/* abdomen */}
      <g clipPath={`url(#${id}-c)`}>
        <rect x="0" y="88" width="120" height="112" fill={body} />
        {[118, 140, 160, 178].map((y, k) => (
          <path key={y} d={`M 20 ${y} Q 60 ${y + 10} 100 ${y} L 100 ${y + 11 - k} Q 60 ${y + 21 - k} 20 ${y + 11 - k} Z`} fill={band} />
        ))}
        {[110, 132, 153].map((y) => (
          <path key={y} d={`M 24 ${y} Q 60 ${y + 9} 96 ${y}`} stroke="#F7D488" strokeWidth="3" fill="none" opacity="0.7" />
        ))}
        <rect x="0" y="88" width="120" height="112" fill={`url(#${id}-sh)`} />
      </g>
      {/* thorax (fuzzy) */}
      <circle cx="60" cy="76" r="25" fill={fuzz} />
      <circle cx="60" cy="76" r="25" fill="none" stroke={fuzz} strokeWidth="6" strokeDasharray="2 3" />
      <ellipse cx="60" cy="74" rx="14" ry="12" fill="#6B4318" opacity="0.55" />
      <circle cx="60" cy="76" r="25" fill={`url(#${id}-sh)`} />
      {/* head */}
      <ellipse cx="60" cy="44" rx="17" ry="14" fill="#4A2E18" />
      <ellipse cx="46" cy="42" rx="6" ry="10" fill="#1E1A14" />
      <ellipse cx="74" cy="42" rx="6" ry="10" fill="#1E1A14" />
      <ellipse cx="44" cy="38" rx="2" ry="3" fill="#fff" opacity="0.5" />
      {/* antennae (elbowed) */}
      <g stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="54,32 48,18 34,6" />
        <polyline points="66,32 72,18 86,6" />
      </g>
      {/* wings (folded back over the abdomen) */}
      <g transform={`rotate(${wv} 60 72)`}>
        <path d="M 52 70 C 28 84 22 134 34 150 C 44 140 52 104 56 76 Z" fill="#F4F8F6" opacity="0.62" stroke="#fff" strokeWidth="1.5" />
        <path d="M 54 82 C 38 98 36 124 42 134" stroke="#8E9C95" strokeWidth="1.2" fill="none" />
      </g>
      <g transform={`rotate(${-wv} 60 72)`}>
        <path d="M 68 70 C 92 84 98 134 86 150 C 76 140 68 104 64 76 Z" fill="#F4F8F6" opacity="0.62" stroke="#fff" strokeWidth="1.5" />
        <path d="M 66 82 C 82 98 84 124 78 134" stroke="#8E9C95" strokeWidth="1.2" fill="none" />
      </g>
    </svg>
  );
};

/**
 * The robot bee (after Michelsen et al. 1992: a computer-driven model bee that danced in the hive).
 * Top-down, heading up, same proportions as BeeTop: brushed-metal body with rivets and segment seams,
 * stiff metal wing plates, a red sensor eye and wire antennae. viewBox 0 0 120 200.
 */
export const RobotBeeTop: React.FC<{size?: number; id?: string; style?: React.CSSProperties; buzz?: boolean}> = ({
  size = 90,
  id = 'rb',
  style,
  buzz,
}) => {
  const f = useCurrentFrame();
  const wv = buzz ? Math.sin(f * 2.7) * 5 : 0;
  return (
    <svg width={size} height={(size * 200) / 120} viewBox="0 0 120 200" style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8D949B" />
          <stop offset="0.45" stopColor="#E4E8EC" />
          <stop offset="0.6" stopColor="#C3C9CF" />
          <stop offset="1" stopColor="#7C838A" />
        </linearGradient>
      </defs>
      <ellipse cx="68" cy="128" rx="40" ry="70" fill="#1A0F06" opacity="0.2" />
      {/* jointed wire legs */}
      <g stroke="#5E656C" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="46,70 26,62 16,46" />
        <polyline points="74,70 94,62 104,46" />
        <polyline points="44,82 18,88 8,104" />
        <polyline points="76,82 102,88 112,104" />
        <polyline points="46,94 24,118 20,146" />
        <polyline points="74,94 96,118 100,146" />
      </g>
      {/* abdomen: metal capsule with seams and rivets */}
      <path d="M 60 92 C 92 92 96 140 84 168 C 76 186 66 194 60 196 C 54 194 44 186 36 168 C 24 140 28 92 60 92 Z" fill={`url(#${id}-metal)`} stroke="#5E656C" strokeWidth="2" />
      {[118, 140, 162].map((y) => (
        <path key={y} d={`M 30 ${y} Q 60 ${y + 9} 90 ${y}`} stroke="#5E656C" strokeWidth="2.5" fill="none" />
      ))}
      {[[42, 108], [78, 108], [40, 130], [80, 130], [44, 152], [76, 152]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#5E656C" />
      ))}
      {/* thorax: a motor housing */}
      <rect x="36" y="56" width="48" height="42" rx="12" fill={`url(#${id}-metal)`} stroke="#5E656C" strokeWidth="2" />
      <circle cx="60" cy="77" r="9" fill="#5E656C" />
      <circle cx="60" cy="77" r="4" fill="#C3C9CF" />
      {/* head + sensor eye */}
      <rect x="44" y="30" width="32" height="26" rx="9" fill={`url(#${id}-metal)`} stroke="#5E656C" strokeWidth="2" />
      <circle cx="60" cy="42" r="5" fill="#E0412E" />
      <circle cx="58.5" cy="40.5" r="1.6" fill="#fff" opacity="0.8" />
      <g stroke="#5E656C" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <polyline points="52,30 46,16 34,6" />
        <polyline points="68,30 74,16 86,6" />
      </g>
      <circle cx="34" cy="6" r="3" fill="#5E656C" />
      <circle cx="86" cy="6" r="3" fill="#5E656C" />
      {/* metal wing plates */}
      <g transform={`rotate(${wv} 60 72)`}>
        <path d="M 50 70 L 24 136 L 40 142 L 56 78 Z" fill="#DDE3E8" opacity="0.85" stroke="#7C838A" strokeWidth="2" />
      </g>
      <g transform={`rotate(${-wv} 60 72)`}>
        <path d="M 70 70 L 96 136 L 80 142 L 64 78 Z" fill="#DDE3E8" opacity="0.85" stroke="#7C838A" strokeWidth="2" />
      </g>
    </svg>
  );
};
