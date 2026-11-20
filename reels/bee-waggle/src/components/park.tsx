import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, H, W} from '../theme';
import {StippleDefs} from './paper';

/** Speckled "spray" edge texture (inspo stipple) as a reusable SVG filter. */
const SprayDefs: React.FC<{id: string; color?: string}> = ({id, color = '#20140a'}) => (
  <defs>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="1" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 5.2" result="dots" />
      <feMorphology in="SourceAlpha" operator="erode" radius="16" result="inner" />
      <feGaussianBlur in="inner" stdDeviation="10" result="innerB" />
      <feComposite in="SourceAlpha" in2="innerB" operator="out" result="edge" />
      <feComposite in="dots" in2="edge" operator="in" result="edgeDots" />
      <feFlood floodColor={color} floodOpacity="0.28" />
      <feComposite in2="edgeDots" operator="in" result="speck" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="speck" />
      </feMerge>
    </filter>
  </defs>
);

const cloudD = (w: number, h: number) =>
  `M 0 ${h} C ${-w * 0.02} ${h * 0.55} ${w * 0.14} ${h * 0.4} ${w * 0.26} ${h * 0.5} C ${w * 0.28} ${h * 0.1} ${w * 0.56} ${-h * 0.05} ${w * 0.64} ${h * 0.32} C ${w * 0.76} ${h * 0.12} ${w * 0.98} ${h * 0.28} ${w * 0.92} ${h * 0.6} C ${w * 1.04} ${h * 0.62} ${w * 1.04} ${h} ${w} ${h} Z`;

const Cloud: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={cloudD(w, h)} fill="#FBFCFA" />
    <path d={cloudD(w, h)} fill="#DCE5EC" transform={`translate(0 ${h * 0.18}) scale(1 0.82)`} opacity="0.7" />
  </g>
);

/** Langstroth hive box (inspo): pale wood boxes with grain, lid, entrance slot, on a stand. viewBox 0 0 400 520 */
export const HiveBox: React.FC<{style?: React.CSSProperties; w?: number}> = ({style, w = 380}) => (
  <svg width={w} height={(w * 520) / 400} viewBox="0 0 400 520" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <SprayDefs id="hb-spray" color="#4a3220" />
    <ellipse cx="210" cy="508" rx="210" ry="18" fill="#1E3A12" opacity="0.25" />
    <g filter="url(#hb-spray)">
      {/* stand */}
      <rect x="40" y="470" width="320" height="28" fill="#8C6A44" />
      {/* boxes: front face + side face */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x="40" y={70 + k * 134} width="250" height="132" fill={k % 2 ? '#E9D3B6' : '#F1DFC6'} />
          <polygon points={`290,${70 + k * 134} 360,${50 + k * 134} 360,${182 + k * 134} 290,${202 + k * 134}`} fill="#CDB394" />
          <path d={`M 70 ${110 + k * 134} q 60 -16 120 4 t 90 -6`} stroke="#D4B793" strokeWidth="3" fill="none" />
          <path d={`M 60 ${150 + k * 134} q 80 12 150 -2 t 70 6`} stroke="#D4B793" strokeWidth="3" fill="none" />
          <rect x="140" y={95 + k * 134} width="60" height="8" rx="4" fill="#A9825A" />
        </g>
      ))}
      {/* lid */}
      <polygon points="24,70 300,70 376,46 112,46" fill="#F6E8D4" />
      <rect x="24" y="62" width="276" height="20" fill="#E2CBAE" />
      <polygon points="300,62 376,40 376,58 300,82" fill="#C9AE8E" />
      {/* entrance */}
      <rect x="60" y="458" width="200" height="12" fill="#2A1A0F" />
    </g>
  </svg>
);

/**
 * The outdoor world: a bright sunny day in the park. Full-bleed, layered, with parallax.
 * cam: 0..1 camera progress (drives parallax + push). hive: draw the hive box at the right.
 */
export const ParkWorld: React.FC<{cam?: number; hive?: boolean; hiveX?: number; hiveY?: number; hiveW?: number}> = ({
  cam = 0,
  hive = true,
  hiveX = 600,
  hiveY = 830,
  hiveW = 400,
}) => {
  const f = useCurrentFrame();
  const par = (depth: number) => `translate(${-cam * 60 * depth}px, ${cam * 20 * depth}px) scale(${1 + cam * 0.05 * depth})`;
  const flowers = Array.from({length: 120}).map((_, k) => ({
    x: random(`fx${k}`) * W,
    y: 1240 + random(`fy${k}`) ** 0.8 * 680,
    c: ['#FFFFFF', '#F6CF45', '#C8A2E8', '#FFFFFF', '#F6CF45'][k % 5],
    r: 4 + random(`fr${k}`) * 9,
  }));
  const blades = Array.from({length: 46}).map((_, k) => ({
    x: (k / 45) * W + (random(`bx${k}`) - 0.5) * 40,
    h: 120 + random(`bh${k}`) * 220,
    lean: (random(`bl${k}`) - 0.5) * 60,
    ph: random(`bp${k}`) * 6,
  }));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* sky */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #A9D3EE 0%, #CBE6F4 38%, #EEF5E8 62%, #F4F1DE 100%)'}} />
      {/* sun + glow */}
      <AbsoluteFill style={{transform: par(0.2)}}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 78% 15%, rgba(255,240,180,0.95) 0%, rgba(255,236,170,0.55) 9%, rgba(255,236,170,0) 30%)'}} />
        <div style={{position: 'absolute', left: 760, top: 200, width: 150, height: 150, borderRadius: '50%', background: '#FFE27A', boxShadow: '0 0 60px 30px rgba(255,226,122,0.55)'}} />
      </AbsoluteFill>
      {/* clouds (drift) */}
      <svg width={W} height={H} style={{position: 'absolute', transform: par(0.35)}}>
        <Cloud x={-120 + f * 0.25} y={330} w={420} h={130} />
        <Cloud x={560 - f * 0.18} y={470} w={560} h={170} />
        <Cloud x={120 + f * 0.12} y={600} w={300} h={90} />
      </svg>
      {/* hills */}
      <svg width={W} height={H} style={{position: 'absolute', transform: par(0.5)}}>
        <SprayDefs id="hill-spray" color="#1f3346" />
        <g filter="url(#hill-spray)">
          <path d="M -60 900 C 120 760 260 800 380 740 C 520 670 640 760 760 720 C 900 670 1020 740 1160 700 L 1160 1300 L -60 1300 Z" fill={C.hill1} />
          <path d="M -60 960 C 140 860 300 900 460 850 C 620 800 760 900 900 860 C 1000 830 1080 860 1160 840 L 1160 1300 L -60 1300 Z" fill={C.hill2} />
          <path d="M -60 1060 C 200 980 360 1010 560 990 C 760 970 900 1020 1160 960 L 1160 1300 L -60 1300 Z" fill={C.hill3} />
        </g>
      </svg>
      {/* trees + meadow */}
      <svg width={W} height={H} style={{position: 'absolute', transform: par(0.75)}}>
        <SprayDefs id="mead-spray" color="#173d1c" />
        <g filter="url(#mead-spray)">
          {[
            [90, 1040, 1],
            [210, 1070, 0.8],
            [980, 1030, 1.1],
          ].map(([x, y, s], k) => (
            <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
              <rect x="-10" y="-20" width="20" height="90" fill="#6B4A2E" />
              <circle cx="0" cy="-70" r="70" fill={C.meadowDark} />
              <circle cx="-48" cy="-30" r="50" fill="#3F8550" />
              <circle cx="46" cy="-34" r="54" fill="#5BA866" />
            </g>
          ))}
          <path d="M -60 1120 C 220 1070 520 1110 760 1080 C 920 1060 1040 1080 1160 1070 L 1160 1960 L -60 1960 Z" fill={C.meadow} />
          <path d="M -60 1300 C 300 1250 700 1300 1160 1250 L 1160 1960 L -60 1960 Z" fill="#6DB061" />
        </g>
        {flowers.map((o, k) => (
          <circle key={k} cx={o.x} cy={o.y} r={o.r * (0.5 + (o.y - 1240) / 900)} fill={o.c} opacity="0.95" />
        ))}
      </svg>
      {hive && (
        <div style={{position: 'absolute', inset: 0, transform: par(0.85)}}>
          <HiveBox w={hiveW} style={{left: hiveX, top: hiveY}} />
        </div>
      )}
      {/* foreground grass, swaying */}
      <svg width={W} height={H} style={{position: 'absolute', transform: par(1.1)}}>
        {blades.map((b, k) => {
          const sway = Math.sin(f / 18 + b.ph) * 10;
          const x = b.x, y = H + 10;
          return (
            <path
              key={k}
              d={`M ${x - 7} ${y} Q ${x + b.lean * 0.4} ${y - b.h * 0.6} ${x + b.lean + sway} ${y - b.h} Q ${x + b.lean * 0.4 + 4} ${y - b.h * 0.55} ${x + 7} ${y} Z`}
              fill={k % 3 ? '#3FAF4E' : '#2F8F3E'}
            />
          );
        })}
      </svg>
      <StippleSvg />
    </AbsoluteFill>
  );
};

const StippleSvg: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', opacity: 0.5, mixBlendMode: 'multiply'}}>
    <StippleDefs id="park-st" color="#3a4a30" size={8} opacity={0.12} />
    <rect width={W} height={H} fill="url(#park-st)" />
  </svg>
);
