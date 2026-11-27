import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* ------------------------------------------------------------------ */
/* Timing (frames at 30 fps). Estimates until Sharon's voiceover exists. */
export const T = {
  l1: 0, // hook
  l2: 84, // English sentence
  l3: 210, // chart starts
  l4: 324, // lines draw, wage +58%
  l5: 430, // price runs away
  l6: 555, // friend saving
  l7: 669, // callback
  end: 795, // end card
};
export const TOTAL = 876;

/* Palette (look v1.1) */
const C = {
  paper: '#F7F6F0',
  grid: '#E8ECF2',
  ink: '#3E414C',
  blue: '#1F3A8A',
  red: '#C8322B',
  hi: '#FDF551',
  note: '#FFF0A6',
  tape: 'rgba(161,172,202,0.72)',
};
const FONT = "'Playpen Sans Hebrew', sans-serif";

/* CBS data, annual averages rebased 2011 = 100 (tools/sources/data/apartment_chart_2011-2025.csv) */
const YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const PRICE = [100.0, 103.2, 112.6, 119.8, 126.8, 136.2, 141.5, 140.4, 143.0, 147.4, 159.8, 187.4, 193.8, 203.2, 207.7];
const WAGE = [100.0, 102.3, 104.8, 106.5, 108.8, 111.3, 114.6, 118.6, 122.1, 130.0, 133.2, 137.0, 145.5, 153.9, 158.3];

/* Chart geometry: years run RIGHT to LEFT (2011 at the right). y is to scale. */
const X0 = 900; // 2011
const X1 = 150; // 2025
const Y_AXIS = 1330; // value 100
const K = 12.5; // px per index point -> 207.7 lands above the top edge (true value, off the page)
const xOf = (t: number) => X0 - ((t - 2011) / 14) * (X0 - X1);
const yOf = (v: number) => Y_AXIS - (v - 100) * K;

/* ------------------------------------------------------------------ */
/* helpers */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const noise = (i: number, seed: number) =>
  Math.sin(i * 1.7 + seed * 3.1) * 0.6 + Math.sin(i * 0.53 + seed * 7.3) * 0.4;

const wobblePts = (pts: [number, number][], amp: number, seed: number, sub = 6) => {
  const out: [number, number][] = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const [ax, ay] = pts[s];
    const [bx, by] = pts[s + 1];
    for (let j = 0; j < sub; j++) {
      const u = j / sub;
      const i = s * sub + j;
      out.push([ax + (bx - ax) * u + noise(i, seed) * amp, ay + (by - ay) * u + noise(i + 99, seed) * amp]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const toD = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

/** A pen stroke that draws itself between `from` and `from + dur`. */
const Stroke: React.FC<{
  d: string;
  from: number;
  dur: number;
  color: string;
  width?: number;
  fill?: string;
}> = ({d, from, dur, color, width = 6, fill = 'none'}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={p >= 1 ? fill : 'none'}
    />
  );
};

const roughRect = (x: number, y: number, w: number, h: number, seed: number, amp = 2.2) =>
  toD(wobblePts([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + 1]], amp, seed, 5));

/** Handwritten text that is "written" with a wipe in its reading direction. */
const Write: React.FC<{
  text: React.ReactNode;
  from: number;
  dur: number;
  top: number;
  left?: number;
  right?: number;
  width?: number;
  size: number;
  color?: string;
  weight?: number;
  dir?: 'rtl' | 'ltr';
  align?: 'left' | 'right' | 'center';
  rotate?: number;
  lineHeight?: number;
}> = ({text, from, dur, top, left, right, width, size, color = C.ink, weight = 400, dir = 'rtl', align, rotate = 0, lineHeight = 1.25}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  if (p <= 0) return null;
  const hidden = (1 - p) * 104;
  const clip = dir === 'rtl' ? `inset(-20% -4% -20% ${hidden}%)` : `inset(-20% ${hidden}% -20% -4%)`;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        width,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        direction: dir,
        textAlign: align ?? (dir === 'rtl' ? 'right' : 'left'),
        lineHeight,
        clipPath: clip,
        transform: `rotate(${rotate}deg)`,
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The locked plate: off-white grid paper with grain and a soft vignette. */
const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${C.grid} 2px, transparent 2px), linear-gradient(90deg, ${C.grid} 2px, transparent 2px)`,
        backgroundSize: '54px 54px',
        backgroundPosition: '-1px 26px',
      }}
    />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.13}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#grain)" />
    </svg>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.1}}>
      <filter id="fibres">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves={2} seed={11} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#fibres)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/* Washi tape strip */
const Tape: React.FC<{x: number; y: number; w?: number; rot: number}> = ({x, y, w = 190, rot}) => {
  const teeth = (side: 0 | 1) =>
    Array.from({length: 7}, (_, i) => `${side ? w - (i % 2) * 7 : (i % 2) * 7}px ${(i / 6) * 100}%`).join(',');
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: 58,
        background: C.tape,
        transform: `rotate(${rot}deg)`,
        clipPath: `polygon(${teeth(0)}, ${Array.from({length: 7}, (_, i) => `${w - (i % 2) * 7}px ${100 - (i / 6) * 100}%`).join(',')})`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Stand-in "photos" (hand-drawn) until the real taped prints arrive in Stage 3 */
const BuildingArt: React.FC<{w: number; h: number; forSale?: boolean}> = ({w, h, forSale}) => {
  const floors = 7;
  const bx = w * 0.12;
  const bw = w * 0.76;
  const top = h * 0.14;
  const fh = (h - top) / floors;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`sky${forSale ? 1 : 0}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9C9DE" />
          <stop offset="1" stopColor="#E7ECF1" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E9E3D6" />
          <stop offset="1" stopColor="#D2CBBB" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#sky${forSale ? 1 : 0})`} />
      <rect x={bx} y={top} width={bw} height={h - top} fill="url(#wall)" />
      {Array.from({length: floors}, (_, fl) => {
        const y = top + fl * fh;
        return (
          <g key={fl}>
            <rect x={bx - 14} y={y + fh * 0.72} width={bw + 28} height={fh * 0.1} fill="#C4BCAA" />
            {[0, 1, 2].map((c) => (
              <g key={c}>
                <rect x={bx + bw * (0.08 + c * 0.32)} y={y + fh * 0.18} width={bw * 0.2} height={fh * 0.5} fill="#5E6B7E" />
                <rect x={bx + bw * (0.08 + c * 0.32)} y={y + fh * 0.18} width={bw * 0.2} height={fh * 0.12} fill="#8796A8" />
              </g>
            ))}
            <path d={`M${bx - 14} ${y + fh * 0.72} h${bw + 28}`} stroke="#9A927F" strokeWidth={2} />
          </g>
        );
      })}
      {forSale && (
        <g transform={`translate(${bx + bw * 0.38} ${top + fh * 3.62}) rotate(-2)`}>
          <rect width={bw * 0.42} height={fh * 0.6} fill="#FFFFFF" stroke={C.red} strokeWidth={7} />
          <text x={bw * 0.21} y={fh * 0.42} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={fh * 0.32} fill={C.red} direction="rtl">
            למכירה
          </text>
        </g>
      )}
      <rect width={w} height={h} fill="rgba(255,240,220,0.08)" />
    </svg>
  );
};

const TapedPrint: React.FC<{x: number; y: number; w: number; h: number; rot: number; forSale?: boolean; children?: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  rot,
  forSale,
  children,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w + 36, height: h + 36, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', inset: 0, background: '#FCFCFA', boxShadow: '0 18px 34px rgba(40,35,30,0.28), 0 2px 4px rgba(40,35,30,0.2)'}} />
    <div style={{position: 'absolute', left: 18, top: 18}}>
      <BuildingArt w={w} h={h} forSale={forSale} />
    </div>
    <Tape x={-50} y={-22} rot={-28} />
    <Tape x={w - 110} y={-18} rot={24} />
    {children}
  </div>
);

/* Price tag doodle (red ballpoint outline) */
const tagPath = (w: number, h: number) => {
  const n = 36;
  return toD(
    wobblePts(
      [
        [n, 0],
        [w, 0],
        [w, h],
        [n, h],
        [0, h / 2],
        [n, 0.5],
      ],
      1.6,
      5,
      5,
    ),
  );
};
const Tag: React.FC<{w: number; h: number; drawFrom: number; children?: React.ReactNode; fill?: string}> = ({w, h, drawFrom, children, fill = '#FFFDF6'}) => (
  <div style={{position: 'relative', width: w + 20, height: h + 20}}>
    <svg width={w + 20} height={h + 20} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g transform="translate(10 10)">
        <Stroke d={tagPath(w, h)} from={drawFrom} dur={16} color={C.red} width={6} fill={fill} />
        <Stroke d={`M${36 + 18} ${h / 2} m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0`} from={drawFrom + 12} dur={6} color={C.red} width={5} />
      </g>
    </svg>
    {children}
  </div>
);

/* Sticky note with the hook question */
const Sticky: React.FC<{x: number; y: number; rot: number; slap: number}> = ({x, y, rot, slap}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - slap, fps, config: {damping: 12, stiffness: 180}});
  const scale = interpolate(s, [0, 1], [1.12, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 640,
        height: 420,
        background: C.note,
        transform: `rotate(${rot}deg) scale(${scale})`,
        boxShadow: '0 16px 26px rgba(40,35,20,0.25)',
        padding: '46px 44px',
        boxSizing: 'border-box',
        fontFamily: FONT,
        fontSize: 62,
        lineHeight: 1.32,
        color: C.ink,
        direction: 'rtl',
        textAlign: 'right',
        fontWeight: 700,
      }}
    >
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(255,255,255,0.35), transparent 40%)'}} />
      כמה שנות משכורת ממוצעת צריך כדי לקנות דירה בישראל?
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes */

const HookScene: React.FC = () => (
  <Paper>
    <TapedPrint x={110} y={250} w={790} h={1100} rot={-2.5} />
    <Sticky x={250} y={170} rot={3} slap={-6} />
  </Paper>
);

/* Highlighter swipe behind a word */
const Swipe: React.FC<{from: number; x: number; y: number; w: number; h: number}> = ({from, x, y, w, h}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 10], [0, 1], clamp);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: C.hi,
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        borderRadius: '6px 14px 8px 12px',
        transform: 'rotate(-1.2deg)',
        mixBlendMode: 'multiply',
      }}
    />
  );
};

const Sparkle: React.FC<{from: number; x: number; y: number}> = ({from, x, y}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 14], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const o = Math.sin(p * Math.PI);
  return (
    <svg width={80} height={80} style={{position: 'absolute', left: x - 40, top: y - 40, opacity: o, transform: `scale(${0.6 + p * 0.6}) rotate(${p * 40}deg)`}}>
      <path d="M40 6 L45 35 L74 40 L45 45 L40 74 L35 45 L6 40 L35 35 Z" fill={C.ink} />
    </svg>
  );
};

const TITLE_TOP = 196;
const WORD = {x: 335, y: TITLE_TOP + 10, w: 540, h: 92}; // the EXORBITANT box (line 1)

/** Page with the title; chart lives on the same page (lines 2-5). */
const ChartPage: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ---- line drawing progress (t = year) ----
  const drawStart = T.l4;
  const drawEnd = T.l4 + 92;
  const t = interpolate(f, [drawStart, drawEnd], [2011, 2025], clamp);
  const n = Math.floor((t - 2011) * 6); // 6 sub-steps per year
  const pricePts = wobblePts(YEARS.map((y, i) => [xOf(y), yOf(PRICE[i])] as [number, number]), 2.2, 2);
  const wagePts = wobblePts(YEARS.map((y, i) => [xOf(y), yOf(WAGE[i])] as [number, number]), 2.2, 9);
  const cut = (pts: [number, number][]) => {
    const whole = (t - 2011) * 6;
    const head = pts.slice(0, n + 1);
    const frac = whole - n;
    if (n + 1 < pts.length && frac > 0) {
      const [ax, ay] = pts[n];
      const [bx, by] = pts[n + 1];
      head.push([ax + (bx - ax) * frac, ay + (by - ay) * frac]);
    }
    return head;
  };
  const showLines = f >= drawStart;
  const priceNow = cut(pricePts);
  const wageNow = cut(wagePts);
  const tip = priceNow[priceNow.length - 1];
  const wageTip = wageNow[wageNow.length - 1];

  // ---- the tag: number (line 2) -> blank tag riding the red tip -> torn off the page ----
  const tagNumOpacity = interpolate(f, [T.l3, T.l3 + 10], [1, 0], clamp);
  const toStart = interpolate(f, [T.l3 + 8, T.l3 + 34], [0, 1], clamp);
  const tagScaleBase = interpolate(toStart, [0, 1], [1, 0.42]);
  const homeX = 330;
  const homeY = 640;
  let tagX = homeX;
  let tagY = homeY;
  let tagRot = -4;
  if (f >= T.l3 + 8) {
    const sx = xOf(2011) - 70;
    const sy = Y_AXIS - 150;
    tagX = interpolate(toStart, [0, 1], [homeX, sx]);
    tagY = interpolate(toStart, [0, 1], [homeY, sy]);
    tagRot = interpolate(toStart, [0, 1], [-4, 8]);
  }
  if (showLines) {
    tagX = tip[0] - 70;
    tagY = tip[1] - 150;
    tagRot = 8 + Math.sin(f / 4) * 3;
  }
  // after the tip leaves the page, the tag keeps flying up and off the frame
  const exitFrame = drawEnd - 5;
  if (f > exitFrame) {
    const k = f - exitFrame;
    tagY = -60 - k * 22;
    tagX = tip[0] - 70 - k * 4;
    tagRot = 8 + k * 6;
  }

  // ---- tear at the exit point ----
  const tear = spring({frame: f - (drawEnd - 6), fps, config: {damping: 11, stiffness: 160}});

  // ---- title word jolts as the line passes ----
  const joltT = f - (drawEnd - 14);
  const jolt = joltT > 0 && joltT < 30 ? Math.sin(joltT * 0.9) * 5 * Math.exp(-joltT / 9) : 0;

  // ---- year marker ----
  const markerX = xOf(t);
  const axisDraw = interpolate(f, [T.l3 + 4, T.l3 + 30], [0, 1], clamp);

  return (
    <Paper>
      {/* Title (line 2) */}
      <Swipe from={T.l2 + 44} x={WORD.x - 12} y={WORD.y + 8} w={WORD.w + 24} h={WORD.h - 4} />
      <div style={{position: 'absolute', left: WORD.x, top: WORD.y - 2, width: WORD.w, transformOrigin: '50% 60%', transform: `rotate(${jolt}deg)`}}>
        <Write text="EXORBITANT" from={T.l2 + 8} dur={22} top={0} left={0} width={WORD.w} size={84} weight={700} dir="ltr" align="left" />
      </div>
      <Write text="The" from={T.l2} dur={8} top={TITLE_TOP + 8} left={150} width={170} size={84} weight={700} dir="ltr" align="right" />
      <Write text="Price of an Apartment" from={T.l2 + 26} dur={20} top={TITLE_TOP + 114} left={70} width={880} size={70} weight={700} dir="ltr" align="center" />
      <Sparkle from={T.l2 + 50} x={WORD.x + WORD.w + 8} y={WORD.y + 6} />
      <Sparkle from={T.l2 + 56} x={WORD.x - 14} y={WORD.y + 92} />
      {/* Hebrew gloss under the title, red ballpoint */}
      <Write text="מופקע, מופרז" from={T.l2 + 58} dur={18} top={TITLE_TOP + 218} left={95} width={860} size={54} color={C.red} align="center" />

      {/* Chart (lines 3-5) */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* x axis (right to left) and y axis at the right */}
        <Stroke d={toD(wobblePts([[930, Y_AXIS], [110, Y_AXIS]], 1.3, 3, 10))} from={T.l3 + 4} dur={24} color={C.ink} width={6} />
        <Stroke d={toD(wobblePts([[930, Y_AXIS], [930, 560]], 1.3, 4, 10))} from={T.l3 + 12} dur={20} color={C.ink} width={6} />
        <Stroke d="M912 590 L930 556 L948 590" from={T.l3 + 30} dur={6} color={C.ink} width={6} />
        <Stroke d="M128 1312 L104 1330 L128 1348" from={T.l3 + 28} dur={6} color={C.ink} width={6} />
        {/* ticks at 2011, 2015, 2020, 2025 */}
        {[2011, 2015, 2020, 2025].map((y, i) => (
          <Stroke key={y} d={`M${xOf(y)} ${Y_AXIS - 12} L${xOf(y) + 1} ${Y_AXIS + 14}`} from={T.l3 + 18 + i * 3} dur={5} color={C.ink} width={5} />
        ))}
        {/* tick at 150 on the y axis */}
        <Stroke d={`M918 ${yOf(150)} L944 ${yOf(150)}`} from={T.l3 + 34} dur={5} color={C.ink} width={5} />

        {/* start dot */}
        {f >= T.l3 + 70 && (
          <>
            <circle cx={xOf(2011)} cy={Y_AXIS} r={interpolate(f, [T.l3 + 70, T.l3 + 78], [0, 13], clamp)} fill={C.red} />
            <circle cx={xOf(2011)} cy={Y_AXIS} r={interpolate(f, [T.l3 + 74, T.l3 + 82], [0, 7], clamp)} fill={C.blue} />
          </>
        )}

        {/* the two lines */}
        {showLines && (
          <>
            <path d={toD(wageNow)} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={toD(priceNow)} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* year marker: hand-drawn pointer sliding along the axis */}
        {f >= T.l3 + 40 && (
          <g transform={`translate(${markerX} ${Y_AXIS + 22})`} opacity={interpolate(f, [T.l3 + 40, T.l3 + 48], [0, 1], clamp)}>
            <path d="M0 0 L-16 26 L16 26 Z" fill={C.ink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}

        {/* arrow to the "+108%" note at the exit point */}
        <Stroke d={toD(wobblePts([[326, 96], [270, 50], [232, 22]], 1.5, 6, 6))} from={T.l5 + 24} dur={10} color={C.red} width={6} />
        <Stroke d="M226 52 L226 22 L256 30" from={T.l5 + 32} dur={5} color={C.red} width={6} />
      </svg>

      {/* torn paper where the line leaves the page */}
      {f >= drawEnd - 6 && (
        <svg
          width={220}
          height={110}
          style={{position: 'absolute', left: 102, top: -6, transformOrigin: '110px 0', transform: `scaleY(${tear})`, overflow: 'visible'}}
        >
          <path d="M0 0 L30 38 L52 22 L80 70 L104 44 L128 96 L150 52 L176 74 L198 26 L220 0 Z" fill="#E9E5DA" />
          <path d="M0 0 L30 38 L52 22 L80 70 L104 44 L128 96 L150 52 L176 74 L198 26 L220 0" fill="none" stroke="#FFFFFF" strokeWidth={6} />
          <path d="M30 38 L52 22 L80 70 L104 44 L128 96 L150 52 L176 74 L198 26" fill="none" stroke="rgba(60,50,40,0.25)" strokeWidth={3} transform="translate(0 6)" />
        </svg>
      )}

      {/* the tag */}
      {f < exitFrame + 30 && (
        <div style={{position: 'absolute', left: tagX, top: tagY, transformOrigin: '0 0', transform: `rotate(${tagRot}deg) scale(${tagScaleBase})`}}>
          <Tag w={500} h={210} drawFrom={T.l2 + 84}>
            <div style={{position: 'absolute', left: 76, top: 30, width: 420, textAlign: 'center', fontFamily: FONT, color: C.ink, opacity: tagNumOpacity}}>
              <Write text="14.3 שנות שכר" from={T.l2 + 96} dur={14} top={0} left={0} width={420} size={52} weight={700} align="center" />
              <Write text="ממוצע, 2025" from={T.l2 + 108} dur={12} top={88} left={0} width={420} size={40} align="center" />
            </div>
            <div style={{position: 'absolute', left: 120, top: 34, width: 280, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 120, color: C.red, opacity: 1 - tagNumOpacity}}>
              ₪
            </div>
          </Tag>
        </div>
      )}

      {/* legend */}
      <Write text="מחיר דירה ——" from={T.l3 + 44} dur={16} top={1150} left={100} width={420} size={48} color={C.red} weight={700} />
      <Write text="שכר ממוצע ——" from={T.l3 + 58} dur={16} top={1218} left={100} width={420} size={48} color={C.blue} weight={700} />
      {/* base note */}
      <div style={{opacity: interpolate(f, [T.l4 + 8, T.l4 + 22], [1, 0], clamp)}}>
        <Write text="2011 = 100" from={T.l3 + 80} dur={16} top={Y_AXIS - 96} right={200} width={300} size={44} dir="ltr" align="right" />
      </div>
      {/* y tick label */}
      <Write text="150" from={T.l3 + 36} dur={8} top={yOf(150) - 30} left={820} width={90} size={38} dir="ltr" align="right" />

      {/* year label under the marker */}
      {f >= T.l3 + 40 && (
        <div
          style={{
            position: 'absolute',
            left: markerX - 80,
            top: Y_AXIS + 52,
            width: 160,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 50,
            color: C.ink,
            opacity: interpolate(f, [T.l3 + 40, T.l3 + 48], [0, 1], clamp),
          }}
        >
          {Math.floor(t + 0.0001)}
        </div>
      )}

      {/* end values, only while narrated */}
      {f >= drawEnd && <Write text="+58%" from={drawEnd + 2} dur={12} top={wageTip[1] - 108} left={60} width={260} size={64} color={C.blue} weight={700} dir="ltr" align="left" />}
      <Write text="+108%" from={T.l5 + 34} dur={14} top={40} left={330} width={300} size={72} color={C.red} weight={700} dir="ltr" align="left" />
    </Paper>
  );
};

/* Piggy bank doodle (blue ballpoint), stays small */
const Piggy: React.FC<{from: number}> = ({from}) => {
  const body = toD(
    wobblePts(
      Array.from({length: 25}, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return [150 + Math.cos(a) * 120, 130 + Math.sin(a) * 85] as [number, number];
      }),
      1.4,
      12,
      2,
    ),
  );
  return (
    <svg width={340} height={280} style={{position: 'absolute', left: 90, top: 1130, overflow: 'visible'}}>
      <Stroke d={body} from={from} dur={20} color={C.blue} width={7} fill="rgba(31,58,138,0.06)" />
      <Stroke d="M262 108 q34 4 34 26 q0 22 -34 22" from={from + 16} dur={8} color={C.blue} width={7} />
      <Stroke d="M282 126 l0 1 M282 140 l0 1" from={from + 22} dur={3} color={C.blue} width={9} />
      <Stroke d="M200 54 l16 -36 l20 40" from={from + 20} dur={6} color={C.blue} width={7} />
      <Stroke d="M90 205 l-6 46 M130 212 l-3 44 M180 212 l3 44 M220 205 l6 46" from={from + 24} dur={8} color={C.blue} width={7} />
      <Stroke d="M120 52 l60 -6" from={from + 30} dur={5} color={C.blue} width={8} />
      <Stroke d="M32 118 q-30 -6 -24 -30 q8 -18 22 -2" from={from + 32} dur={6} color={C.blue} width={6} />
      <circle cx={238} cy={100} r={6} fill={C.blue} opacity={useCurrentFrame() > from + 24 ? 1 : 0} />
    </svg>
  );
};

const Coin: React.FC<{from: number}> = ({from}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 14], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  return (
    <svg width={60} height={60} style={{position: 'absolute', left: 210, top: 1000 + p * 150, opacity: p < 0.9 ? 1 : 0}}>
      <circle cx={30} cy={30} r={24} fill="#FFFDF6" stroke={C.blue} strokeWidth={6} />
      <text x={30} y={41} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={C.blue}>
        ₪
      </text>
    </svg>
  );
};

const FriendScene: React.FC = () => (
  <Paper>
    <TapedPrint x={300} y={190} w={640} h={860} rot={2.2} forSale />
    <Piggy from={T.l6 + 14} />
    <Coin from={T.l6 + 54} />
    <Coin from={T.l6 + 80} />
  </Paper>
);

const CallbackScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const land = spring({frame: f - (T.l7 + 10), fps, config: {damping: 10, stiffness: 120}});
  const y = interpolate(land, [0, 1], [-420, 860]);
  const rot = interpolate(land, [0, 1], [30, -6]);
  return (
    <Paper>
      <TapedPrint x={110} y={250} w={790} h={1100} rot={-2.5} />
      <Sticky x={250} y={170} rot={3} slap={-100} />
      <div style={{position: 'absolute', left: 230, top: y, transform: `rotate(${rot}deg)`}}>
        <Tag w={560} h={220} drawFrom={-100} fill="#FFFDF6">
          <div style={{position: 'absolute', left: 92, top: 62, width: 470, height: 110}}>
            <div
              style={{
                position: 'absolute',
                left: 4,
                top: 14,
                width: 460,
                height: 88,
                background: C.hi,
                mixBlendMode: 'multiply',
                borderRadius: '6px 14px 8px 12px',
                clipPath: `inset(0 ${interpolate(f, [T.l7 + 40, T.l7 + 50], [100, 0], clamp)}% 0 0)`,
              }}
            />
            <div style={{position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: 76, color: C.ink, textAlign: 'center', letterSpacing: 1}}>EXORBITANT</div>
          </div>
        </Tag>
      </div>
      <Sparkle from={T.l7 + 40} x={800} y={880} />
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* Subtitles: low, handwriting typeface, commas not dashes */
const SUBS: {from: number; to: number; text: string; dir: 'rtl' | 'ltr'}[] = [
  {from: T.l2, to: T.l2 + 66, text: 'An average apartment now costs an exorbitant', dir: 'ltr'},
  {from: T.l2 + 66, to: T.l3, text: 'fourteen years of the average salary.', dir: 'ltr'},
  {from: T.l3, to: T.l3 + 52, text: 'כדי לראות איך זה קרה, נתחיל ב-2011,', dir: 'rtl'},
  {from: T.l3 + 52, to: T.l4, text: 'ונשים את מחיר הדירה ואת השכר באותה נקודה.', dir: 'rtl'},
  {from: T.l4, to: T.l4 + 52, text: 'משם השכר טיפס בהדרגה,', dir: 'rtl'},
  {from: T.l4 + 52, to: T.l5, text: 'ועלה ב-58 אחוז.', dir: 'rtl'},
  {from: T.l5, to: T.l5 + 60, text: 'אבל מחיר הדירה ברח קדימה,', dir: 'rtl'},
  {from: T.l5 + 60, to: T.l6, text: 'ויותר מהכפיל את עצמו.', dir: 'rtl'},
  {from: T.l6, to: T.l6 + 60, text: 'אם יש לכם חבר שחוסך לדירה,', dir: 'rtl'},
  {from: T.l6 + 60, to: T.l7, text: 'שלחו לו את זה,', dir: 'rtl'},
  {from: T.l7, to: T.l7 + 30, text: 'ותגידו לו:', dir: 'rtl'},
  {from: T.l7 + 30, to: T.end, text: "It's not you. The price is exorbitant.", dir: 'ltr'},
];

const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const s = SUBS.find((x) => f >= x.from && f < x.to);
  if (!s) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 150,
        bottom: 1920 - 1665,
        textAlign: 'center',
        direction: s.dir,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 58,
        lineHeight: 1.25,
        color: C.ink,
        textShadow: `0 0 10px ${C.paper}, 0 0 4px ${C.paper}, 0 0 2px ${C.paper}`,
      }}
    >
      {s.text}
    </div>
  );
};

const EndCard: React.FC = () => {
  // STAND-IN for the approved brand end card (Higgsfield media de8eba37...). Brand colours live only here.
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8], [0, 1], clamp);
  const sc = interpolate(f, [0, TOTAL - T.end], [1, 1.05], clamp);
  return (
    <AbsoluteFill style={{opacity: o, background: '#F5F0E5', alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`}}>
      <Img src={staticFile('logo.png')} style={{width: 520, mixBlendMode: 'multiply'}} />
      <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 700, fontSize: 58, color: '#0A2370'}}>@improve.with.englishu</div>
      <div style={{marginTop: 14, fontFamily: FONT, fontSize: 44, color: '#B01F25'}}>englishu.co.il</div>
    </AbsoluteFill>
  );
};

/* Wait for the handwriting font before rendering any frame */
const useFont = () => {
  const [h] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
    ]).then(() => continueRender(h));
  }, [h]);
};

export const ApartmentMockup: React.FC = () => {
  useFont();
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={T.l1} durationInFrames={T.l2 - T.l1} name="1 hook">
        <HookScene />
      </Sequence>
      <Sequence from={0} durationInFrames={T.l6} name="2-5 title + chart" layout="absolute-fill">
        {/* ChartPage uses absolute frame numbers; hidden during the hook */}
        <ChartGate />
      </Sequence>
      <Sequence from={T.l6} durationInFrames={T.l7 - T.l6} name="6 friend">
        <Shift by={T.l6}>
          <FriendScene />
        </Shift>
      </Sequence>
      <Sequence from={T.l7} durationInFrames={TOTAL - T.l7} name="7 callback">
        <CallbackGate />
      </Sequence>
      <Subtitles />
      <Sequence from={T.end} durationInFrames={TOTAL - T.end} name="end card">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

/* Scenes below use absolute frame numbers (T.*); these gates keep them in global time. */
const ChartGate: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.l2) return null;
  return <ChartPage />;
};
const CallbackGate: React.FC = () => <Shift by={T.l7}><CallbackScene /></Shift>;
const Shift: React.FC<{by: number; children: React.ReactNode}> = ({by, children}) => (
  <Sequence from={-by} layout="absolute-fill">
    {children}
  </Sequence>
);
