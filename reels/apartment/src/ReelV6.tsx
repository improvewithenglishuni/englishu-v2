import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
import '@fontsource/permanent-marker/400.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* Mock-up v6 (Sharon, Nov 28, fourth round): EXORBITANT on the tag in a permanent-marker font, one whole line under
   PRICE, and the chart starts in 1995 (CBS wage series linked across its four pieces).
   Based on v5 (Sharon, Nov 28, third round): no coral band, the hook question on a floating cloud; a real hanging
   price tag (red, eyelet, string loop, "PRICE" header, EXORBITANT in the white box) tied to a balcony.
   Based on v4 (Sharon, Nov 28, second round):
   - first frame: a painted, textured Tel Aviv street (after her three reference images) with a bold yellow price tag
     on a string coming in from the side, "EXORBITANT"; the hook question in a top band
   - no text under the chart
   - the year counter starts running right after the cut
   - DISCREPANCY appears within 4 s of the cut, as a label riding the gap bar
   - brand end card (public/brand/englishu-end-card.mp4) */

export const END_CARD_FRAMES = 126;
export const V6 = {
  cut: 96, // hard cut from the painted street to the chart; the counter starts here
  drawTo: 96 + 645, // 1995 -> 2025, about 0.7 s per year
  discrepancyLabel: 96 + 114, // 3.8 s after the cut
  tagBack: 96 + 668,
  end: 900, // story 30.0 s
};
export const TOTAL_V6 = V6.end + END_CARD_FRAMES; // 30.4 s

const C = {
  paper: '#F7F6F0',
  grid: '#E8ECF2',
  ink: '#3E414C',
  soft: '#8B8F99',
  blue: '#1F3A8A',
  red: '#C8322B',
  hi: '#FDF551',
  tag: '#FBE45B',
  band: '#E0615E',
};
const FONT = "'Playpen Sans Hebrew', sans-serif";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* CBS data, annual averages, 1995 = 100 (tools/sources/data/apartment_chart_1995-2025.csv).
   Prices: Dwellings Price Index (continuous). Wages: average wage per employee job, four CBS pieces linked
   (1995-2001 / 2002-2004 / 2004-2011 / 2011-2025). */
const Y0 = 1995;
const YEARS = Array.from({length: 31}, (_, i) => 1995 + i);
const PRICE = [100.0, 116.0, 126.6, 131.4, 136.9, 130.3, 125.7, 132.4, 124.9, 123.9, 124.2, 124.8, 122.8, 132.1, 150.2, 176.7, 195.2, 201.6, 219.9, 233.8, 247.5, 266.0, 276.4, 274.1, 279.2, 287.8, 312.1, 366.0, 378.5, 396.7, 405.4];
const WAGE = [100.0, 113.1, 126.3, 135.9, 146.7, 157.6, 164.1, 163.0, 159.2, 162.5, 166.3, 172.0, 175.8, 182.5, 183.7, 190.0, 197.3, 201.8, 206.8, 210.1, 214.7, 219.6, 226.2, 234.1, 240.8, 256.6, 262.8, 270.3, 287.2, 303.6, 312.3];
const N = YEARS.length - 1;
const Y1 = Y0 + N;

const yearAt = (f: number) => interpolate(f, [V6.cut, V6.drawTo], [Y0, Y1], {...clamp, easing: Easing.bezier(0.25, 0, 0.75, 1)});

const PX0 = 190;
const PX1 = 740;
const PY0 = 1400;
const PY1 = 600;
const YMAX = 320; // +320%
const yOf = (v: number) => PY0 - ((v - 100) / YMAX) * (PY0 - PY1);
const valueAt = (arr: number[], t: number) => {
  const i = Math.min(Math.floor(t - Y0), N - 1);
  const u = t - Y0 - i;
  return arr[i] + (arr[i + 1] - arr[i]) * Math.max(0, Math.min(1, u));
};
const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

/* ---------------- textures ---------------- */
const Grain: React.FC<{opacity?: number; id: string}> = ({opacity = 0.13, id}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity}}>
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="1080" height="1920" filter={`url(#${id})`} />
  </svg>
);

const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
        backgroundSize: '54px 54px',
        backgroundPosition: '-1px 26px',
      }}
    />
    <Grain id="g6p" />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/* ---------------- 1. Painted Tel Aviv street + price tag ---------------- */
/** One white International-Style apartment block with rounded balconies */
const Block: React.FC<{x: number; w: number; top: number; floors: number; tint: string; shade: string; round?: 'left' | 'right'}> = ({
  x,
  w,
  top,
  floors,
  tint,
  shade,
  round = 'right',
}) => {
  const fh = 112;
  const h = floors * fh;
  const r = 70;
  const bodyPath =
    round === 'right'
      ? `M${x} ${top} H${x + w - r} Q${x + w} ${top} ${x + w} ${top + r} V${top + h} H${x} Z`
      : `M${x + r} ${top} H${x + w} V${top + h} H${x} V${top + r} Q${x} ${top} ${x + r} ${top} Z`;
  return (
    <g>
      <path d={bodyPath} fill={tint} />
      {/* shaded side */}
      <rect x={round === 'right' ? x + w * 0.72 : x} y={top + r * 0.6} width={w * 0.28} height={h - r * 0.6} fill={shade} opacity={0.55} />
      {Array.from({length: floors}, (_, i) => {
        const y = top + i * fh;
        return (
          <g key={i}>
            {/* balcony slab with rounded end */}
            <rect x={x - 14} y={y + fh * 0.7} width={w + 28} height={14} rx={7} fill="#FFFFFF" opacity={0.95} />
            <rect x={x - 14} y={y + fh * 0.7 + 14} width={w + 28} height={6} fill={shade} opacity={0.5} />
            {/* windows and shutters */}
            {[0.1, 0.42, 0.72].map((u, k) => (
              <g key={k}>
                <rect x={x + w * u} y={y + fh * 0.18} width={w * 0.17} height={fh * 0.46} fill="#5D6E86" />
                <rect x={x + w * u} y={y + fh * 0.18} width={w * 0.17} height={fh * 0.2} fill="#C98A5A" opacity={k === 1 ? 0.9 : 0} />
                <rect x={x + w * u} y={y + fh * 0.18} width={w * 0.17} height={fh * 0.08} fill="#7F92AB" />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
};

const Palm: React.FC<{x: number; base: number; h: number; lean: number; sway: number}> = ({x, base, h, lean, sway}) => {
  const tx = x + lean;
  const ty = base - h;
  const fronds = [-150, -115, -75, -35, 5, 40];
  return (
    <g>
      <path d={`M${x} ${base} Q ${x + lean * 0.3} ${base - h * 0.5} ${tx} ${ty}`} stroke="#8A6A45" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M${x} ${base} Q ${x + lean * 0.3} ${base - h * 0.5} ${tx} ${ty}`} stroke="#6E5236" strokeWidth={22} strokeDasharray="6 26" fill="none" />
      {fronds.map((a, i) => {
        const ang = ((a + sway) * Math.PI) / 180;
        const L = 170 + (i % 2) * 30;
        const ex = tx + Math.cos(ang) * L;
        const ey = ty + Math.sin(ang) * L * 0.6 + 60;
        const mx = tx + Math.cos(ang) * L * 0.5;
        const my = ty + Math.sin(ang) * L * 0.6 - 30;
        return <path key={i} d={`M${tx} ${ty} Q ${mx} ${my} ${ex} ${ey} Q ${mx + 10} ${my + 34} ${tx} ${ty + 6}`} fill={i % 2 ? '#3F7D3A' : '#2F6A33'} />;
      })}
    </g>
  );
};

/** A real-looking hanging price tag: red card with clipped top corners, a metal eyelet, a white string loop,
    a white "PRICE" header and a white box where the price would be, which says EXORBITANT. */
const HangTag: React.FC<{w: number; scale?: number}> = ({w}) => {
  const h = w * 1.55;
  const cut = w * 0.16;
  const eyeY = w * 0.17;
  const boxTop = h * 0.42;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.32))'}}>
        <defs>
          <linearGradient id={`tagred${w}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3342C" />
            <stop offset="1" stopColor="#C4231D" />
          </linearGradient>
        </defs>
        <path d={`M${cut} 0 H${w - cut} L${w} ${cut} V${h - 10} Q${w} ${h} ${w - 10} ${h} H10 Q0 ${h} 0 ${h - 10} V${cut} Z`} fill={`url(#tagred${w})`} />
        {/* eyelet */}
        <circle cx={w / 2} cy={eyeY} r={w * 0.075} fill="#B5462E" stroke="#8E2E1E" strokeWidth={w * 0.012} />
        <circle cx={w / 2} cy={eyeY} r={w * 0.04} fill="#F3EFE6" />
        {/* white price box */}
        <rect x={w * 0.06} y={boxTop} width={w * 0.88} height={h * 0.5} rx={w * 0.03} fill="#FFFFFF" />
        {/* thin rules around "price" like a sale tag */}
        <path d={`M${w * 0.16} ${h * 0.345} H${w * 0.84}`} stroke="#FFFFFF" strokeWidth={w * 0.012} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.2, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: w * 0.17, color: '#FFFFFF', letterSpacing: w * 0.006}}>
        PRICE
      </div>
      <div
        style={{
          position: 'absolute',
          left: w * 0.06,
          width: w * 0.88,
          top: boxTop,
          height: h * 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Permanent Marker', cursive",
          fontWeight: 400,
          fontSize: w * 0.125,
          letterSpacing: 0,
          color: '#1A1A1A',
          transform: 'rotate(-25deg)',
        }}
      >
        EXORBITANT
      </div>
    </div>
  );
};

/** A painted cloud carrying the hook question */
const CloudText: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, V6.cut], [70, 40]);
  const bob = Math.sin(f / 16) * 6;
  const puffs: [number, number, number][] = [
    [150, 250, 150],
    [300, 170, 170],
    [480, 140, 190],
    [660, 175, 165],
    [800, 250, 140],
    [250, 310, 130],
    [470, 320, 150],
    [680, 310, 130],
  ];
  return (
    <div style={{position: 'absolute', left: x, top: 90 + bob, width: 950, height: 480}}>
      <svg width={950} height={480} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 18px 20px rgba(70,90,130,0.25))'}}>
        <filter id="cloudpaint">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={10} />
        </filter>
        <g filter="url(#cloudpaint)">
          {puffs.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy + 20} r={r} fill="#E6ECF6" />
          ))}
          {puffs.map(([cx, cy, r], i) => (
            <circle key={`w${i}`} cx={cx} cy={cy} r={r * 0.96} fill="#FFFFFF" />
          ))}
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 70,
          width: 740,
          top: 150,
          direction: 'rtl',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.25,
          color: C.ink,
        }}
      >
        חוסכים לדירה ומרגישים
        <br />
        שאתם אף פעם לא מגיעים?
      </div>
    </div>
  );
};

const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sway = Math.sin(f / 18) * 4;
  // the tag drops from above, catches on its string tied to a balcony railing, and swings
  const drop = spring({frame: f - 8, fps, config: {damping: 9, stiffness: 120}});
  const swing = 16 * Math.exp(-f / 30) * Math.cos(f / 5) + Math.sin(f / 21) * 1.5;
  const tie = {x: 690, y: 852}; // balcony railing (2nd floor from the top) of the right-hand building
  const stringLen = 120;
  const tagW = 330;
  const fall = 0 * drop; // the tag is already hanging at frame 0 (the hook text stays clear)
  return (
    <AbsoluteFill style={{background: '#9FB6D9'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sky5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8EA7D6" />
            <stop offset="0.6" stopColor="#B9CBE8" />
            <stop offset="1" stopColor="#E9DCC6" />
          </linearGradient>
          <filter id="paint5" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} />
          </filter>
          <filter id="wash5">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={3} seed={3} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0" />
          </filter>
        </defs>
        <rect width="1080" height="1920" fill="url(#sky5)" />
        <rect width="1080" height="1100" filter="url(#wash5)" opacity={0.7} />
        <g filter="url(#paint5)">
          <rect x={-40} y={880} width={260} height={700} fill="#D9CFC0" />
          <rect x={860} y={820} width={300} height={760} fill="#D6CBB9" />
          <Block x={60} w={420} top={760} floors={7} tint="#F3EDE2" shade="#C9BBA6" round="right" />
          <Block x={560} w={480} top={660} floors={8} tint="#EFE6D6" shade="#C4B39A" round="left" />
          <rect x={-60} y={1560} width={1200} height={400} fill="#BFA98A" />
          <rect x={-60} y={1560} width={1200} height={26} fill="#E6DCCB" />
          <Palm x={500} base={1600} h={560} lean={-30} sway={sway} />
          <Palm x={990} base={1620} h={480} lean={25} sway={-sway} />
          <ellipse cx={140} cy={1580} rx={170} ry={70} fill="#4E8A43" />
          <ellipse cx={760} cy={1590} rx={150} ry={60} fill="#3F7D3A" />
        </g>
      </svg>
      <Grain id="g6s" opacity={0.16} />

      <CloudText />

      {/* the hanging tag: string tied to the balcony, tag swings below it */}
      <div style={{position: 'absolute', left: tie.x, top: tie.y + fall, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${swing}deg)`}}>
        <svg width={120} height={stringLen + 60} style={{position: 'absolute', left: -60, top: -10, overflow: 'visible'}}>
          {/* knot on the railing and the string loop down to the eyelet */}
          <circle cx={60} cy={10} r={7} fill="#F4F1E8" stroke="#BDB6A6" strokeWidth={2} />
          <path d={`M60 10 C 46 ${stringLen * 0.5}, 52 ${stringLen * 0.9}, 60 ${stringLen + 10 + tagW * 0.17}`} stroke="#F4F1E8" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
          <path d={`M60 10 C 74 ${stringLen * 0.5}, 68 ${stringLen * 0.9}, 60 ${stringLen + 10 + tagW * 0.17}`} stroke="#E3DED2" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
        </svg>
        <div style={{position: 'absolute', left: -tagW / 2, top: stringLen, transform: 'rotate(-2deg)'}}>
          <HangTag w={tagW} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* small version of the same tag for the callback */
const MiniTag: React.FC = () => <HangTag w={150} />;

/* ---------------- 2. The chart ---------------- */
const ChartScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = yearAt(f);
  const span = Math.max(t - Y0, 0.6);
  const xOf = (year: number) => PX0 + ((year - Y0) / span) * (PX1 - PX0);
  const linePts = (arr: number[]) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < YEARS.length && YEARS[i] <= t; i++) pts.push([xOf(YEARS[i]), yOf(arr[i])]);
    if (t > Y0 && t < Y1) pts.push([xOf(t), yOf(valueAt(arr, t))]);
    return pts;
  };
  const pNow = valueAt(PRICE, t);
  const wNow = valueAt(WAGE, t);
  const tipX = xOf(t);
  const pY = yOf(pNow);
  const wY = yOf(wNow);
  let pLabY = pY;
  let wLabY = wY;
  if (Math.abs(wLabY - pLabY) < 104) {
    const mid = (pLabY + wLabY) / 2;
    const priceOnTop = pY <= wY;
    pLabY = priceOnTop ? mid - 52 : mid + 52;
    wLabY = priceOnTop ? mid + 52 : mid - 52;
  }
  const pct = (v: number) => `+${Math.round(v - 100)}%`;
  const breathe = 1 + Math.sin(f / 7) * 0.12;
  const barX = tipX + 26;
  const gap = Math.abs(wY - pY);
  const topY = Math.min(pY, wY);
  const barOpacity = interpolate(gap, [4, 24], [0, 1], clamp);

  const SX0 = 150;
  const SX1 = 930;
  const knobX = SX0 + ((t - Y0) / N) * (SX1 - SX0);
  const ticks = [0, 100, 200, 300];

  // DISCREPANCY label rides the bar (appears 3.2 s after the cut)
  const lab = spring({frame: f - V6.discrepancyLabel, fps, config: {damping: 13, stiffness: 150}});
  const midY = (pY + wY) / 2;

  // callback: the EXORBITANT tag drops back and hangs from the final year on the slider
  const back = spring({frame: f - V6.tagBack, fps, config: {damping: 11, stiffness: 120}});
  const backSwing = 12 * Math.exp(-Math.max(0, f - V6.tagBack - 8) / 18) * Math.sin(Math.max(0, f - V6.tagBack - 8) / 4);

  return (
    <Paper>
      <div style={{position: 'absolute', top: 130, left: 60, width: 890, textAlign: 'center', fontFamily: FONT, color: C.ink}}>
        <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>Apartment Prices vs. Salaries</div>
        <div style={{fontSize: 36, color: C.soft, marginTop: 10}}>Israel · growth since {Y0} · CBS data</div>
      </div>

      {/* year slider: starts moving at the cut */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M${SX0} 470 C ${SX0 + 200} 468, ${SX1 - 300} 473, ${SX1} 470`} stroke={C.soft} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M${SX0} 470 L ${knobX} 470`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={knobX} cy={470} r={20} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <path d={`M${knobX} 470 L ${knobX} 458 M ${knobX} 470 L ${knobX + 8} 476`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${(t - Y0) * 160} ${knobX} 470)`} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: knobX - 70,
          top: 386,
          width: 140,
          height: 56,
          background: '#FFFDF6',
          border: `4px solid ${C.ink}`,
          borderRadius: '10px 14px 9px 12px',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: '50px',
          color: C.ink,
        }}
      >
        {Math.floor(t + 1e-4)}
      </div>

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M${PX0} ${PY0} L${PX0} ${PY1 - 20}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M${PX0} ${PY0} L${PX1 + 20} ${PY0}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        {ticks.map((k) => (
          <path key={k} d={`M${PX0 - 12} ${yOf(100 + k)} L${PX0 + 12} ${yOf(100 + k)}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {ticks.slice(1).map((k) => (
          <path key={`g${k}`} d={`M${PX0 + 16} ${yOf(100 + k)} L${PX1} ${yOf(100 + k)}`} stroke={C.soft} strokeWidth={2} strokeDasharray="6 12" opacity={0.6} />
        ))}
        {/* the gap bar */}
        <rect x={barX - 9 * breathe} y={topY + 14} width={18 * breathe} height={Math.max(0, gap - 28)} rx={8} fill={C.hi} opacity={barOpacity * 0.95} style={{mixBlendMode: 'multiply'}} />
        <path d={smooth(linePts(WAGE))} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={smooth(linePts(PRICE))} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={tipX} cy={wY} r={11} fill={C.blue} />
        <circle cx={tipX} cy={pY} r={11} fill={C.red} />
        {/* pointer from the label to the bar */}
        {lab > 0.05 && <path d={`M${barX - 150} ${midY} L${barX - 16} ${midY}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={lab} />}
      </svg>

      {ticks.map((k) => (
        <div key={k} style={{position: 'absolute', left: 40, top: yOf(100 + k) - 24, width: 130, textAlign: 'right', fontFamily: FONT, fontSize: 36, color: C.soft}}>
          {k === 0 ? '0%' : `+${k}%`}
        </div>
      ))}

      {/* live labels at the tips */}
      <div style={{position: 'absolute', left: tipX + 48, top: pLabY - 52, width: 300, fontFamily: FONT, color: C.red}}>
        <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>מחיר דירה</div>
        <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(pNow)}</div>
      </div>
      <div style={{position: 'absolute', left: tipX + 48, top: wLabY - 52, width: 300, fontFamily: FONT, color: C.blue}}>
        <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>שכר ממוצע</div>
        <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(wNow)}</div>
      </div>

      {/* DISCREPANCY: a paper label that rides the middle of the gap, left of the bar */}
      {lab > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: barX - 150 - 330,
            top: midY - 34,
            width: 330,
            height: 68,
            transformOrigin: '100% 50%',
            transform: `scale(${lab}) rotate(-2deg)`,
            background: 'rgba(255,253,244,0.94)',
            border: `4px solid ${C.ink}`,
            borderRadius: '8px 12px 9px 11px',
            boxShadow: '0 6px 10px rgba(40,35,20,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 40,
            color: C.ink,
          }}
        >
          DISCREPANCY
        </div>
      )}

      {f >= V6.tagBack && (
        <div style={{position: 'absolute', left: 430, top: 470, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${backSwing}deg)`}}>
          <div style={{position: 'absolute', left: -2, top: 0, width: 3, height: interpolate(back, [0, 1], [0, 26]), background: '#BDB6A6'}} />
          <div style={{position: 'absolute', left: -75, top: interpolate(back, [0, 1], [-700, 0])}}>
            <MiniTag />
          </div>
        </div>
      )}
    </Paper>
  );
};

/* ---------------- the Reel ---------------- */
export const ApartmentMockupV6: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`400 40px "Permanent Marker"`, 'EXORBITANT'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={0} durationInFrames={V6.cut} name="1 painted street + tag">
        <StreetScene />
      </Sequence>
      <Sequence from={V6.cut} durationInFrames={V6.end - V6.cut} name="2 chart">
        <Sequence from={-V6.cut} layout="absolute-fill">
          <ChartScene />
        </Sequence>
      </Sequence>
      <Sequence from={V6.end} durationInFrames={END_CARD_FRAMES} name="brand end card">
        <OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} />
      </Sequence>
    </AbsoluteFill>
  );
};
