import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/800.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
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

/* Mock-up v7 (review of Nov 28): story-first pacing.
   0-3 s   painted street, hook text big on a paper strip, a real price tag (average price 2025, CBS) slams in and counts up
   3 s     the tag crosses the cut onto the notebook page and becomes the rider on the red line
   3-5 s   1995-2007 races by (salaries kept up), then the chart slows down from 2008
   ~8 s    taped real photo cutaway; ~16.4 s the break-away: shake, thump, DISPARITY lands with its gloss
   push-in on the gap from 2018; hold at 2025; EXORBITANT gets its own 3 s; tag-a-friend line; brand end card */

export const END_CARD_FRAMES = 126;
export const V7 = {
  cut: 90,
  fastTo: 150, // 1995 -> 2007.5 in 2 s
  drawTo: 570, // 2007.5 -> 2025, about 0.8 s per year
  photoIn: 228,
  photoOut: 318,
  hold: 570,
  exorbitant: 630,
  share: 720,
  end: 780,
};
export const TOTAL_V7 = V7.end + END_CARD_FRAMES; // 906 frames = 30.2 s

const C = {
  paper: '#F7F6F0',
  grid: '#E8ECF2',
  ink: '#3E414C',
  soft: '#8B8F99',
  blue: '#1F3A8A',
  red: '#C8322B',
  hi: '#FDF551',
  note: '#FFF0A6',
  tape: 'rgba(161,172,202,0.72)',
};
const FONT = "'Playpen Sans Hebrew', sans-serif"; // Latin handwriting
const HEB = "'Rubik', sans-serif"; // clean Hebrew
const MARK = "'Permanent Marker', cursive";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* CBS data, 1995 = 100 (tools/sources/data/apartment_chart_1995-2025.csv) */
const Y0 = 1995;
const YEARS = Array.from({length: 31}, (_, i) => 1995 + i);
const N = YEARS.length - 1;
const Y1 = Y0 + N;
const PRICE = [100.0, 116.0, 126.6, 131.4, 136.9, 130.3, 125.7, 132.4, 124.9, 123.9, 124.2, 124.8, 122.8, 132.1, 150.2, 176.7, 195.2, 201.6, 219.9, 233.8, 247.5, 266.0, 276.4, 274.1, 279.2, 287.8, 312.1, 366.0, 378.5, 396.7, 405.4];
const WAGE = [100.0, 113.1, 126.3, 135.9, 146.7, 157.6, 164.1, 163.0, 159.2, 162.5, 166.3, 172.0, 175.8, 182.5, 183.7, 190.0, 197.3, 201.8, 206.8, 210.1, 214.7, 219.6, 226.2, 234.1, 240.8, 256.6, 262.8, 270.3, 287.2, 303.6, 312.3];
const AVG_PRICE_2025 = 2330800; // CBS Table 2.2, 2025 annual average, NIS

/** chart year at a frame: fast through 1995-2007, then slow */
const yearAt = (f: number) =>
  f < V7.fastTo
    ? interpolate(f, [V7.cut, V7.fastTo], [Y0, 2007.5], clamp)
    : interpolate(f, [V7.fastTo, V7.drawTo], [2007.5, Y1], clamp);
const frameOfYear = (y: number) => (y <= 2007.5 ? V7.cut + ((y - Y0) / 12.5) * (V7.fastTo - V7.cut) : V7.fastTo + ((y - 2007.5) / 17.5) * (V7.drawTo - V7.fastTo));
export const BREAK = Math.round(frameOfYear(2021.8)); // the jump: shake, thump, DISPARITY

/* plot geometry */
const PX0 = 150;
const PX1 = 740;
const PY0 = 1430;
const PY1 = 560;
const YMAX = 320;
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
const noise = (i: number, seed: number) => Math.sin(i * 1.7 + seed * 3.1) * 0.6 + Math.sin(i * 0.53 + seed * 7.3) * 0.4;
/** hand-drawn straight line with a slight pen wobble */
const handLine = (x1: number, y1: number, x2: number, y2: number, seed: number, amp = 2.2, n = 18) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = x1 + (x2 - x1) * u + (i > 0 && i < n ? noise(i, seed) * amp : 0);
    const y = y1 + (y2 - y1) * u + (i > 0 && i < n ? noise(i + 40, seed) * amp : 0);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

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
    <Grain id="g7p" />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
    {children}
  </AbsoluteFill>
);
const Tape: React.FC<{x: number; y: number; w?: number; rot: number}> = ({x, y, w = 150, rot}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 46, background: C.tape, transform: `rotate(${rot}deg)`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)'}} />
);

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


/* ---------------- the price tag ---------------- */
/** Red hanging price tag: clipped top corners, eyelet, PRICE header with a whole underline, white box with content */
const HangTag: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => {
  const h = w * 1.3;
  const cut = w * 0.16;
  const eyeY = w * 0.15;
  const boxTop = h * 0.4;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.32))'}}>
        <defs>
          <linearGradient id={`tr${Math.round(w)}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3342C" />
            <stop offset="1" stopColor="#C4231D" />
          </linearGradient>
        </defs>
        <path d={`M${cut} 0 H${w - cut} L${w} ${cut} V${h - 10} Q${w} ${h} ${w - 10} ${h} H10 Q0 ${h} 0 ${h - 10} V${cut} Z`} fill={`url(#tr${Math.round(w)})`} />
        <circle cx={w / 2} cy={eyeY} r={w * 0.07} fill="#B5462E" stroke="#8E2E1E" strokeWidth={w * 0.012} />
        <circle cx={w / 2} cy={eyeY} r={w * 0.037} fill="#F3EFE6" />
        <rect x={w * 0.06} y={boxTop} width={w * 0.88} height={h * 0.54} rx={w * 0.03} fill="#FFFFFF" />
        <path d={`M${w * 0.18} ${h * 0.335} H${w * 0.82}`} stroke="#FFFFFF" strokeWidth={w * 0.014} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.19, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: w * 0.15, color: '#FFFFFF', letterSpacing: w * 0.006}}>
        PRICE
      </div>
      <div style={{position: 'absolute', left: w * 0.06, width: w * 0.88, top: boxTop, height: h * 0.54, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        {children}
      </div>
    </div>
  );
};

/* ---------------- 1. hook ---------------- */
const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sway = Math.sin(f / 18) * 4;
  // tag slams down onto its string (thump at about frame 12), then swings
  const drop = spring({frame: f, fps, config: {damping: 10, stiffness: 170}});
  const fall = interpolate(drop, [0, 1], [-1700, 0]);
  const swing = 10 * Math.exp(-Math.max(0, f - 10) / 24) * Math.sin(Math.max(0, f - 10) / 4.5) + Math.sin(f / 21) * 1.2;
  // the price counts up fast
  const count = interpolate(f, [10, 52], [0, AVG_PRICE_2025], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const tie = {x: 560, y: 760};
  const tagW = 500;
  const swipe = interpolate(f, [6, 18], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#9FB6D9'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8EA7D6" />
            <stop offset="0.6" stopColor="#B9CBE8" />
            <stop offset="1" stopColor="#E9DCC6" />
          </linearGradient>
          <filter id="paint7" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} />
          </filter>
          <filter id="wash7">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={3} seed={3} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0" />
          </filter>
        </defs>
        <rect width="1080" height="1920" fill="url(#sky7)" />
        <rect width="1080" height="900" filter="url(#wash7)" opacity={0.7} />
        <g filter="url(#paint7)">
          <rect x={-40} y={700} width={260} height={1100} fill="#D9CFC0" />
          <rect x={860} y={640} width={300} height={1160} fill="#D6CBB9" />
          <Block x={40} w={430} top={600} floors={11} tint="#F3EDE2" shade="#C9BBA6" round="right" />
          <Block x={560} w={480} top={540} floors={12} tint="#EFE6D6" shade="#C4B39A" round="left" />
          <rect x={-60} y={1800} width={1200} height={200} fill="#BFA98A" />
          <rect x={-60} y={1800} width={1200} height={22} fill="#E6DCCB" />
          <Palm x={470} base={1840} h={620} lean={-30} sway={sway} />
          <Palm x={1000} base={1850} h={520} lean={25} sway={-sway} />
          <ellipse cx={140} cy={1810} rx={190} ry={80} fill="#4E8A43" />
          <ellipse cx={780} cy={1820} rx={170} ry={70} fill="#3F7D3A" />
        </g>
      </svg>
      <Grain id="g7s" opacity={0.16} />

      {/* the tag, tied to a balcony railing */}
      <div style={{position: 'absolute', left: tie.x, top: tie.y + fall, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${swing}deg)`}}>
        <svg width={120} height={120} style={{position: 'absolute', left: -60, top: -10, overflow: 'visible'}}>
          <circle cx={60} cy={10} r={7} fill="#F4F1E8" stroke="#BDB6A6" strokeWidth={2} />
          <path d="M60 10 C 44 50, 50 80, 60 105" stroke="#F4F1E8" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
          <path d="M60 10 C 76 50, 70 80, 60 105" stroke="#E3DED2" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
        </svg>
        <div style={{position: 'absolute', left: -tagW / 2, top: 30, transform: 'rotate(-2deg)'}}>
          <HangTag w={tagW}>
            <div style={{fontFamily: MARK, fontSize: 78, color: '#1A1A1A', transform: 'rotate(-5deg)', whiteSpace: 'nowrap'}}>₪{fmt(count)}</div>
            <div style={{fontFamily: HEB, fontWeight: 700, fontSize: 30, color: C.soft, direction: 'rtl', marginTop: 10}}>דירה ממוצעת, 2025</div>
          </HangTag>
        </div>
      </div>

      {/* hook text on a torn paper strip, big, on screen from frame 0 */}
      <div style={{position: 'absolute', left: 50, width: 900, top: 250, background: '#FCFBF6', boxShadow: '0 12px 22px rgba(0,0,0,0.22)', transform: 'rotate(-1.5deg)', padding: '26px 24px 30px', boxSizing: 'border-box', clipPath: 'polygon(0 4%, 6% 0, 14% 3%, 25% 0, 38% 4%, 52% 1%, 66% 4%, 80% 0, 92% 3%, 100% 0, 100% 96%, 90% 100%, 76% 97%, 60% 100%, 45% 96%, 30% 100%, 16% 97%, 4% 100%, 0 96%)'}}>
        <div style={{direction: 'rtl', textAlign: 'center', fontFamily: HEB, fontWeight: 800, fontSize: 64, lineHeight: 1.2, color: '#1E2028'}}>
          חוסכים לדירה ומרגישים
          <br />
          שאתם{' '}
          <span style={{position: 'relative', display: 'inline-block'}}>
            <span style={{position: 'absolute', left: -8, right: -8, top: 14, bottom: 4, background: C.hi, borderRadius: '6px 14px 8px 12px', transform: 'rotate(-1deg)', clipPath: `inset(0 0 0 ${(1 - swipe) * 100}%)`}} />
            <span style={{position: 'relative'}}>אף פעם</span>
          </span>{' '}
          לא מגיעים?
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 2. the chart ---------------- */
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
  if (Math.abs(wLabY - pLabY) < 120) {
    const mid = (pLabY + wLabY) / 2;
    const priceOnTop = pY <= wY;
    pLabY = priceOnTop ? mid - 60 : mid + 60;
    wLabY = priceOnTop ? mid + 60 : mid - 60;
  }
  const pct = (v: number) => `+${Math.round(v - 100)}%`;
  const breathe = 1 + Math.sin(f / 7) * 0.12;
  const barX = tipX + 22;
  const gap = Math.abs(wY - pY);
  const topY = Math.min(pY, wY);
  const barOpacity = interpolate(gap, [4, 24], [0, 1], clamp);

  // camera: push-in on the gap from 2018, shake at the break-away
  const push = interpolate(t, [2018, 2025], [1, 1.07], clamp);
  const sh = f >= BREAK - 2 && f < BREAK + 16 ? Math.exp(-(f - BREAK + 2) / 6) : 0;
  const shakeX = sh * 9 * Math.sin(f * 2.3);
  const shakeY = sh * 7 * Math.cos(f * 2.9);

  // DISPARITY lands at the break-away, with its gloss
  const lab = spring({frame: f - BREAK, fps, config: {damping: 12, stiffness: 170}});
  const labSwipe = interpolate(f, [BREAK + 6, BREAK + 16], [0, 1], clamp);
  const midY = (pY + wY) / 2;

  // the rider tag: crosses the cut, then rides the red tip; grows into the EXORBITANT moment
  const intoChart = spring({frame: f - V7.cut, fps, config: {damping: 14, stiffness: 120}});
  const grow = spring({frame: f - V7.exorbitant, fps, config: {damping: 12, stiffness: 120}});
  const riderW = interpolate(intoChart, [0, 1], [500, 150]);
  const startX = 560 - 250;
  const startY = 790;
  const rideX = tipX - riderW - 34;
  const rideY = pY - riderW * 1.3 - 30;
  let tagX = interpolate(intoChart, [0, 1], [startX, rideX]);
  let tagY = interpolate(intoChart, [0, 1], [startY, rideY]);
  let tagW = riderW;
  if (f >= V7.exorbitant) {
    tagW = interpolate(grow, [0, 1], [150, 400]);
    tagX = interpolate(grow, [0, 1], [rideX, 540 - 200 - 60]);
    tagY = interpolate(grow, [0, 1], [rideY, 520]);
  }
  const showNumber = 1 - interpolate(f, [V7.cut + 4, V7.cut + 14], [0, 1], clamp);
  const exo = interpolate(f, [V7.exorbitant + 8, V7.exorbitant + 24], [0, 1], clamp);

  // taped photo cutaway
  const pin = spring({frame: f - V7.photoIn, fps, config: {damping: 13, stiffness: 140}});
  const pout = interpolate(f, [V7.photoOut, V7.photoOut + 10], [0, 1], clamp);

  // share note
  const share = spring({frame: f - V7.share, fps, config: {damping: 11, stiffness: 170}});
  const dim = interpolate(f, [V7.exorbitant, V7.exorbitant + 12], [0, 0.55], clamp);

  return (
    <Paper>
      {/* giant faded year behind the chart */}
      <div style={{position: 'absolute', left: 0, width: 960, top: 760, textAlign: 'center', fontFamily: HEB, fontWeight: 800, fontSize: 330, color: C.ink, opacity: 0.075, letterSpacing: -6}}>
        {Math.floor(t + 1e-4)}
      </div>

      <div style={{position: 'absolute', inset: 0, transformOrigin: `560px ${(pY + wY) / 2}px`, transform: `translate(${shakeX}px, ${shakeY}px) scale(${push})`}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {/* hand-drawn axes */}
          <path d={handLine(PX0, PY0, PX0, PY1 - 30, 3)} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={handLine(PX0, PY0, PX1 + 40, PY0, 4)} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M${PX0 - 16} ${PY1 - 6} L${PX0} ${PY1 - 36} L${PX0 + 16} ${PY1 - 6}`} stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[100, 200, 300].map((k) => (
            <path key={k} d={handLine(PX0 + 14, yOf(100 + k), PX1, yOf(100 + k), k, 1.2, 12)} stroke={C.soft} strokeWidth={2.5} strokeDasharray="8 14" fill="none" opacity={0.6} />
          ))}
          <rect x={barX - 10 * breathe} y={topY + 16} width={20 * breathe} height={Math.max(0, gap - 32)} rx={9} fill={C.hi} opacity={barOpacity * 0.95} style={{mixBlendMode: 'multiply'}} />
          <path d={smooth(linePts(WAGE))} stroke={C.blue} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={smooth(linePts(PRICE))} stroke={C.red} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={tipX} cy={wY} r={14} fill={C.blue} />
          <circle cx={tipX} cy={pY} r={14} fill={C.red} />
          {lab > 0.05 && <path d={handLine(barX - 150, midY, barX - 18, midY, 9, 1.5, 8)} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" opacity={lab} />}
        </svg>

        {[0, 100, 200, 300].map((k) => (
          <div key={k} style={{position: 'absolute', left: 20, top: yOf(100 + k) - 24, width: 116, textAlign: 'right', fontFamily: FONT, fontSize: 36, color: C.soft}}>
            {k === 0 ? '0%' : `+${k}%`}
          </div>
        ))}

        {/* live labels */}
        <div style={{position: 'absolute', left: tipX + 36, top: pLabY - 56, width: 180, color: C.red}}>
          <div style={{fontFamily: HEB, fontSize: 34, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>מחיר דירה</div>
          <div style={{fontFamily: FONT, fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(pNow)}</div>
        </div>
        <div style={{position: 'absolute', left: tipX + 36, top: wLabY - 56, width: 180, color: C.blue}}>
          <div style={{fontFamily: HEB, fontSize: 34, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>שכר ממוצע</div>
          <div style={{fontFamily: FONT, fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(wNow)}</div>
        </div>

        {/* DISPARITY + gloss, riding the gap */}
        {lab > 0.01 && (
          <div style={{position: 'absolute', left: barX - 150 - 340, top: midY - 52, width: 340, transformOrigin: '100% 50%', transform: `scale(${lab}) rotate(-2deg)`}}>
            <div style={{position: 'relative', background: 'rgba(255,253,244,0.96)', border: `4px solid ${C.ink}`, borderRadius: '8px 12px 9px 11px', boxShadow: '0 6px 10px rgba(40,35,20,0.18)', padding: '6px 0 2px', textAlign: 'center'}}>
              <span style={{position: 'absolute', left: 30, right: 30, top: 14, height: 40, background: C.hi, borderRadius: 8, clipPath: `inset(0 ${(1 - labSwipe) * 100}% 0 0)`}} />
              <div style={{position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: 46, color: C.ink}}>DISPARITY</div>
              <div style={{position: 'relative', fontFamily: HEB, fontWeight: 700, fontSize: 32, color: C.red, direction: 'rtl', marginTop: -4}}>פער</div>
            </div>
          </div>
        )}
      </div>

      {/* taped real photo cutaway */}
      {f >= V7.photoIn - 2 && f < V7.photoOut + 12 && (
        <div style={{position: 'absolute', left: interpolate(pout, [0, 1], [170, -520]), top: interpolate(pin, [0, 1], [-560, 560]), width: 400, height: 520, transform: 'rotate(-4deg)'}}>
          <div style={{position: 'absolute', inset: 0, background: '#FCFCFA', boxShadow: '0 18px 30px rgba(40,35,30,0.3)'}} />
          <Img src={staticFile('apartment/tlv_building.jpg')} style={{position: 'absolute', left: 16, top: 16, width: 368, height: 488, objectFit: 'cover'}} />
          <Tape x={-36} y={-16} rot={-26} />
          <Tape x={290} y={-12} rot={22} />
        </div>
      )}

      {/* dim the chart for the EXORBITANT moment */}
      <AbsoluteFill style={{background: C.paper, opacity: dim}} />

      {/* the rider tag */}
      {f >= V7.cut && (
        <div style={{position: 'absolute', left: tagX, top: tagY, transform: `rotate(${f >= V7.exorbitant ? -3 : 6 + Math.sin(f / 5) * 3}deg)`}}>
          <HangTag w={tagW}>
            {showNumber > 0.01 && (
              <div style={{position: 'absolute', fontFamily: MARK, fontSize: tagW * 0.156, color: '#1A1A1A', opacity: showNumber, transform: 'rotate(-5deg)', whiteSpace: 'nowrap'}}>₪{fmt(AVG_PRICE_2025)}</div>
            )}
            <div style={{fontFamily: MARK, fontSize: tagW * 0.4, color: C.red, opacity: (1 - showNumber) * (1 - exo)}}>₪</div>
            {exo > 0 && (
              <div style={{position: 'absolute', fontFamily: MARK, fontSize: tagW * 0.14, color: '#1A1A1A', transform: 'rotate(-18deg)', opacity: exo}}>
                <span style={{position: 'absolute', left: -10, right: -10, top: '20%', bottom: '8%', background: C.hi, clipPath: `inset(0 ${(1 - exo) * 100}% 0 0)`}} />
                <span style={{position: 'relative'}}>EXORBITANT</span>
              </div>
            )}
          </HangTag>
        </div>
      )}

      {/* EXORBITANT gloss and the number that earns it */}
      {f >= V7.exorbitant + 14 && (
        <div style={{position: 'absolute', left: 60, width: 890, top: 1080, textAlign: 'center', opacity: interpolate(f, [V7.exorbitant + 14, V7.exorbitant + 24], [0, 1], clamp)}}>
          <div style={{fontFamily: HEB, fontWeight: 800, fontSize: 60, color: C.red, direction: 'rtl'}}>מופקע</div>
          <div style={{fontFamily: HEB, fontWeight: 700, fontSize: 46, color: C.ink, direction: 'rtl', marginTop: 18}}>דירה ממוצעת = 14.3 שנות שכר ממוצע</div>
          <div style={{fontFamily: HEB, fontWeight: 700, fontSize: 30, color: C.soft, direction: 'rtl', marginTop: 6}}>2025, נתוני הלמ״ס</div>
        </div>
      )}

      {/* tag-a-friend */}
      {f >= V7.share && (
        <div style={{position: 'absolute', left: 150, width: 680, top: 1310, transform: `rotate(-2deg) scale(${interpolate(share, [0, 1], [1.25, 1])})`, opacity: Math.min(1, share * 3), background: C.note, boxShadow: '0 14px 22px rgba(40,35,20,0.25)', padding: '26px 20px', textAlign: 'center', fontFamily: HEB, fontWeight: 800, fontSize: 56, color: '#1E2028', direction: 'rtl'}}>
          תייגו חבר שחוסך לדירה
        </div>
      )}

      {/* title, kept below Instagram's top bar */}
      <div style={{position: 'absolute', top: 250, left: 50, width: 900, textAlign: 'center', fontFamily: FONT, color: C.ink}}>
        <div style={{fontSize: 60, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>Apartment Prices vs. Salaries</div>
        <div style={{fontSize: 42, color: C.ink, opacity: 0.7, marginTop: 8}}>Israel · 1995 = 100 · CBS data</div>
      </div>
    </Paper>
  );
};

/* ---------------- sound (library rules: sparse, J-cut, at most two whooshes) ---------------- */
const SFX: {at: number; src: string; vol: number}[] = [
  {at: 9, src: 'sfx/miscellaneous/stamp_thud_01.wav', vol: 0.32}, // tag slams in
  {at: 12, src: 'sfx/mechanical/stopwatch_tick_01.wav', vol: 0.12}, // price counts up
  {at: V7.cut - 3, src: 'sfx/whooshes/soft_whoosh_01.wav', vol: 0.18}, // cut (whoosh 1 of 2)
  {at: V7.cut + 2, src: 'sfx/tactile/paper_movement_02.wav', vol: 0.2}, // tag lands on the page
  {at: V7.photoIn + 8, src: 'sfx/miscellaneous/tape_press_01.wav', vol: 0.22},
  {at: V7.photoOut - 2, src: 'sfx/tactile/paper_movement_03.wav', vol: 0.16},
  {at: BREAK - 2, src: 'sfx/miscellaneous/soft_thump_reveal_01.wav', vol: 0.34}, // break-away + DISPARITY
  {at: V7.exorbitant - 2, src: 'sfx/whooshes/low_whoosh_01.wav', vol: 0.16}, // tag grows (whoosh 2 of 2)
  {at: V7.exorbitant + 8, src: 'sfx/tactile/marker_stroke_01.wav', vol: 0.2},
  {at: V7.share - 2, src: 'sfx/miscellaneous/tape_press_02.wav', vol: 0.2},
];

export const ApartmentMockupV7: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'abc'),
      document.fonts.load(`400 40px "Permanent Marker"`, 'EXORBITANT ₪0'),
      document.fonts.load(`700 40px "Rubik"`, 'אבג'),
      document.fonts.load(`800 40px "Rubik"`, 'אבג'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={0} durationInFrames={V7.cut} name="1 hook">
        <StreetScene />
      </Sequence>
      <Sequence from={V7.cut} durationInFrames={V7.end - V7.cut} name="2 chart">
        <Sequence from={-V7.cut} layout="absolute-fill">
          <ChartScene />
        </Sequence>
      </Sequence>
      <Sequence from={0} durationInFrames={V7.end} name="room tone">
        <Audio src={staticFile('sfx/ambience/room_tone_01.wav')} volume={0.04} loop />
      </Sequence>
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={90} name={`sfx ${s.src.split('/').pop()}`}>
          <Audio src={staticFile(s.src)} volume={s.vol} />
        </Sequence>
      ))}
      <Sequence from={V7.end} durationInFrames={END_CARD_FRAMES} name="brand end card">
        <OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} />
      </Sequence>
    </AbsoluteFill>
  );
};
