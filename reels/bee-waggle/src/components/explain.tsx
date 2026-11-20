import React from 'react';
import {C, FONT_HAND, FONT_HAND_HE} from '../theme';
import {Comb} from './props';

/** A wooden hive frame holding comb (inspo: frame with a lighter top bar). Children render on the comb. */
export const HiveFrame: React.FC<{
  w: number;
  h: number;
  x: number;
  y: number;
  seed: string;
  scale?: number;
  rot?: number;
  r?: number;
  children?: React.ReactNode;
}> = ({w, h, x, y, seed, scale = 1, rot = 0, r = 36, children}) => {
  const bar = 26;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `scale(${scale}) rotate(${rot}deg)`,
        filter: 'drop-shadow(10px 16px 0 rgba(42,26,15,0.16)) drop-shadow(0 18px 24px rgba(42,26,15,0.22))',
      }}
    >
      {/* side + bottom wood */}
      <div style={{position: 'absolute', inset: 0, background: C.wood, borderRadius: 4}} />
      <div style={{position: 'absolute', left: 14, top: bar + 6, right: 14, bottom: 14, overflow: 'hidden'}}>
        <Comb w={w - 28} h={h - bar - 20} r={r} seed={seed} />
        {children}
      </div>
      {/* top bar (lighter, overhanging) */}
      <div style={{position: 'absolute', left: -22, right: -22, top: -6, height: bar + 6, background: C.woodLight, borderRadius: 3, boxShadow: `0 6px 0 ${C.woodDark}`}} />
    </div>
  );
};

/** Hand-lettered annotation. lang 'he' uses Amatic SC (RTL), 'en' uses Patrick Hand SC. */
export const Hand: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  size?: number;
  color?: string;
  lang?: 'he' | 'en';
  rot?: number;
  s?: number;
  anchor?: 'left' | 'center' | 'right';
  outline?: boolean;
  halo?: string;
  style?: React.CSSProperties;
}> = ({children, x, y, size = 64, color = C.ink, lang = 'he', rot = 0, s = 1, anchor = 'center', outline = true, halo = '#fff', style}) => {
  const fs = lang === 'he' ? size * 1.18 : size;
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) rotate(${rot}deg) scale(${s})`,
        fontFamily: lang === 'he' ? FONT_HAND_HE : FONT_HAND,
        fontWeight: lang === 'he' ? 700 : 400,
        fontSize: fs,
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        // thicken the thin hand font with a same-colour stroke, then a soft halo for contrast
        WebkitTextStroke: `${(fs / 26).toFixed(1)}px ${color}`,
        textShadow: outline ? `0 0 ${fs / 9}px ${halo}, 0 0 ${fs / 9}px ${halo}, 0 0 ${fs / 18}px ${halo}, 0 0 2px ${halo}` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Hand-drawn arrow (quadratic curve with a head), drawn on by p. Coordinates are absolute (frame space). */
export const Arrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bend?: number;
  p?: number;
  color?: string;
  w?: number;
  dash?: boolean;
  head?: boolean;
}> = ({x1, y1, x2, y2, bend = 0.2, p = 1, color = C.ink, w = 7, dash, head = true}) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * bend, cy = my + dx * bend;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const len = Math.hypot(dx, dy) * 1.25;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const hl = 26;
  const h1 = `${x2 - Math.cos(ang - 0.45) * hl},${y2 - Math.sin(ang - 0.45) * hl}`;
  const h2 = `${x2 - Math.cos(ang + 0.45) * hl},${y2 - Math.sin(ang + 0.45) * hl}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <path
        d={d}
        stroke={color}
        strokeWidth={w}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dash ? `2 ${w * 2.6}` : `${len}`}
        strokeDashoffset={dash ? 0 : len * (1 - p)}
        opacity={dash ? Math.min(1, p * 3) : 1}
      />
      {head && p > 0.95 && <polyline points={`${h1} ${x2},${y2} ${h2}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

/**
 * Magnifier lens (inspo "UP = SUN" frame): a white-rimmed circle with a pointer wedge toward the source,
 * popping in with scale s. Children render clipped inside.
 */
export const Lens: React.FC<{
  cx: number;
  cy: number;
  r: number;
  s: number;
  px?: number;
  py?: number;
  children: React.ReactNode;
  rim?: number;
}> = ({cx, cy, r, s, px, py, children, rim = 14}) => {
  let wedge: React.ReactNode = null;
  if (px !== undefined && py !== undefined) {
    const a = Math.atan2(py - cy, px - cx);
    const b1 = [cx + Math.cos(a - 0.5) * r, cy + Math.sin(a - 0.5) * r];
    const b2 = [cx + Math.cos(a + 0.5) * r, cy + Math.sin(a + 0.5) * r];
    wedge = (
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: Math.min(1, s), overflow: 'visible'}}>
        <polygon points={`${b1[0]},${b1[1]} ${px},${py} ${b2[0]},${b2[1]}`} fill="rgba(42,26,15,0.22)" />
      </svg>
    );
  }
  return (
    <>
      {wedge}
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          transform: `scale(${s})`,
          boxShadow: `0 0 0 ${rim}px #fff, 0 22px 30px ${rim}px rgba(30,20,10,0.32)`,
          overflow: 'hidden',
          background: C.comb,
        }}
      >
        {children}
      </div>
    </>
  );
};
