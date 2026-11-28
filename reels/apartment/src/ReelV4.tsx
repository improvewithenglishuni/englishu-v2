import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
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

/* Mock-up v4 (Sharon, Nov 28, second round):
   - first frame: a painted, textured Tel Aviv street (after her three reference images) with a bold yellow price tag
     on a string coming in from the side, "EXORBITANT"; the hook question in a top band
   - no text under the chart
   - the year counter starts running right after the cut
   - DISCREPANCY appears within 4 s of the cut, as a label riding the gap bar
   - brand end card (public/brand/englishu-end-card.mp4) */

export const END_CARD_FRAMES = 126;
export const V4 = {
  cut: 96, // hard cut from the painted street to the chart; the counter starts here
  drawTo: 96 + 468, // 2011 -> 2025, about 1.1 s per year
  discrepancyLabel: 96 + 114, // 3.8 s after the cut
  tagBack: 96 + 492,
  end: 96 + 690, // story 26.2 s
};
export const TOTAL_V4 = V4.end + END_CARD_FRAMES; // 30.4 s

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

/* CBS data, annual averages, 2011 = 100 (tools/sources/data/apartment_chart_2011-2025.csv) */
const Y0 = 2011;
const YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const PRICE = [100.0, 103.2, 112.6, 119.8, 126.8, 136.2, 141.5, 140.4, 143.0, 147.4, 159.8, 187.4, 193.8, 203.2, 207.7];
const WAGE = [100.0, 102.3, 104.8, 106.5, 108.8, 111.3, 114.6, 118.6, 122.1, 130.0, 133.2, 137.0, 145.5, 153.9, 158.3];
const N = YEARS.length - 1;
const Y1 = Y0 + N;

const yearAt = (f: number) => interpolate(f, [V4.cut, V4.drawTo], [Y0, Y1], {...clamp, easing: Easing.bezier(0.25, 0, 0.75, 1)});

const PX0 = 190;
const PX1 = 740;
const PY0 = 1400;
const PY1 = 600;
const yOf = (v: number) => PY0 - ((v - 100) / 120) * (PY0 - PY1);
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
    <Grain id="g4p" />
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

const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sway = Math.sin(f / 18) * 4;
  const drift = interpolate(f, [0, V4.cut], [0, -40]);
  // tag swings in from the left on its string, settles with a little wobble
  const inS = spring({frame: f - 6, fps, config: {damping: 13, stiffness: 90}});
  const tagX = interpolate(inS, [0, 1], [-900, 150]);
  const wob = 5 * Math.exp(-Math.max(0, f - 22) / 16) * Math.sin(Math.max(0, f - 22) / 3.5);
  // a heavy "thud": the tag gets bigger
  const thud = spring({frame: f - 58, fps, config: {damping: 8, stiffness: 160}});
  const sc = interpolate(thud, [0, 1], [1, 1.06]);
  const bandIn = spring({frame: f, fps, config: {damping: 16, stiffness: 140}});
  const TW = 720;
  const TH = 320;
  const holeX = tagX + 70;
  const holeY = 1110;
  return (
    <AbsoluteFill style={{background: '#9FB6D9'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8EA7D6" />
            <stop offset="0.6" stopColor="#B9CBE8" />
            <stop offset="1" stopColor="#E9DCC6" />
          </linearGradient>
          <filter id="paint4" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} />
          </filter>
          <filter id="wash4">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={3} seed={3} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0" />
          </filter>
        </defs>
        <rect width="1080" height="1920" fill="url(#sky4)" />
        <rect width="1080" height="1100" filter="url(#wash4)" opacity={0.7} />
        <g transform={`translate(${drift} 0)`} filter="url(#paint4)">
          {/* far buildings */}
          <rect x={-40} y={880} width={260} height={700} fill="#D9CFC0" />
          <rect x={860} y={820} width={300} height={760} fill="#D6CBB9" />
          {/* main blocks */}
          <Block x={60} w={420} top={760} floors={7} tint="#F3EDE2" shade="#C9BBA6" round="right" />
          <Block x={560} w={480} top={660} floors={8} tint="#EFE6D6" shade="#C4B39A" round="left" />
          {/* street */}
          <rect x={-60} y={1560} width={1200} height={400} fill="#BFA98A" />
          <rect x={-60} y={1560} width={1200} height={26} fill="#E6DCCB" />
          <Palm x={500} base={1600} h={560} lean={-30} sway={sway} />
          <Palm x={980} base={1620} h={480} lean={25} sway={-sway} />
          {/* bushes */}
          <ellipse cx={140} cy={1580} rx={170} ry={70} fill="#4E8A43" />
          <ellipse cx={760} cy={1590} rx={150} ry={60} fill="#3F7D3A" />
        </g>
      </svg>
      <Grain id="g4s" opacity={0.16} />

      {/* top band with the hook question (on screen from frame 1) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: interpolate(bandIn, [0, 1], [-40, 0]),
          height: 360,
          background: C.band,
          boxShadow: '0 10px 20px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 46,
          boxSizing: 'border-box',
        }}
      >
        <div style={{width: 860, marginRight: 50, direction: 'rtl', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: 1.22, color: '#FFFFFF'}}>
          חוסכים לדירה ומרגישים
          <br />
          שאתם אף פעם לא מגיעים?
        </div>
      </div>

      {/* string from the left edge into the tag's hole */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path
          d={`M-20 ${holeY - 210} C ${holeX * 0.25} ${holeY - 230}, ${holeX * 0.45} ${holeY + 40}, ${holeX} ${holeY}`}
          stroke="#111"
          strokeWidth={16}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {/* the tag */}
      <div style={{position: 'absolute', left: tagX, top: holeY - TH / 2, width: TW, height: TH, transformOrigin: '70px 50%', transform: `rotate(${-3 + wob}deg) scale(${sc})`}}>
        <svg width={TW} height={TH} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.3))'}}>
          <path d={`M100 0 H${TW} V${TH} H100 L0 ${TH * 0.7} V${TH * 0.3} Z`} fill={C.tag} />
          <path d={`M118 22 H${TW - 22} V${TH - 22} H118 L24 ${TH * 0.68} V${TH * 0.32} Z`} fill="none" stroke="#111" strokeWidth={14} strokeLinejoin="round" />
          <circle cx={70} cy={TH / 2} r={34} fill="#F7A487" />
        </svg>
        <div style={{position: 'absolute', left: 130, right: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 84, color: '#111', letterSpacing: 1}}>
          EXORBITANT
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* small version of the same tag for the callback */
const MiniTag: React.FC = () => {
  const TW = 330;
  const TH = 120;
  return (
    <div style={{position: 'relative', width: TW, height: TH}}>
      <svg width={TW} height={TH} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.25))'}}>
        <path d={`M44 0 H${TW} V${TH} H44 L0 ${TH * 0.7} V${TH * 0.3} Z`} fill={C.tag} />
        <path d={`M52 9 H${TW - 9} V${TH - 9} H52 L10 ${TH * 0.68} V${TH * 0.32} Z`} fill="none" stroke="#111" strokeWidth={6} strokeLinejoin="round" />
        <circle cx={30} cy={TH / 2} r={13} fill="#F7A487" />
      </svg>
      <div style={{position: 'absolute', left: 56, right: 12, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 40, color: '#111'}}>
        EXORBITANT
      </div>
    </div>
  );
};

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
  if (wLabY - pLabY < 104) {
    const mid = (pLabY + wLabY) / 2;
    pLabY = mid - 52;
    wLabY = mid + 52;
  }
  const pct = (v: number) => `+${Math.round(v - 100)}%`;
  const breathe = 1 + Math.sin(f / 7) * 0.12;
  const barX = tipX + 26;
  const gap = wY - pY;
  const barOpacity = interpolate(gap, [4, 24], [0, 1], clamp);

  const SX0 = 150;
  const SX1 = 930;
  const knobX = SX0 + ((t - Y0) / N) * (SX1 - SX0);
  const ticks = [0, 50, 100];

  // DISCREPANCY label rides the bar (appears 3.2 s after the cut)
  const lab = spring({frame: f - V4.discrepancyLabel, fps, config: {damping: 13, stiffness: 150}});
  const midY = (pY + wY) / 2;

  // callback: the EXORBITANT tag drops back and hangs from the final year on the slider
  const back = spring({frame: f - V4.tagBack, fps, config: {damping: 11, stiffness: 120}});
  const backSwing = 12 * Math.exp(-Math.max(0, f - V4.tagBack - 8) / 18) * Math.sin(Math.max(0, f - V4.tagBack - 8) / 4);

  return (
    <Paper>
      <div style={{position: 'absolute', top: 130, left: 60, width: 890, textAlign: 'center', fontFamily: FONT, color: C.ink}}>
        <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>Apartment Prices vs. Salaries</div>
        <div style={{fontSize: 40, color: C.soft, marginTop: 10}}>Israel · growth since {Y0}</div>
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
        <rect x={barX - 9 * breathe} y={pY + 14} width={18 * breathe} height={Math.max(0, gap - 28)} rx={8} fill={C.hi} opacity={barOpacity * 0.95} style={{mixBlendMode: 'multiply'}} />
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

      {f >= V4.tagBack && (
        <div style={{position: 'absolute', left: knobX, top: 470, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${backSwing}deg)`}}>
          <div style={{position: 'absolute', left: -2, top: 0, width: 4, height: interpolate(back, [0, 1], [0, 12]), background: '#111'}} />
          <div style={{position: 'absolute', left: -372, top: interpolate(back, [0, 1], [-700, 4]), transform: 'rotate(3deg) scale(0.9)', transformOrigin: '372px 0'}}>
            <MiniTag />
          </div>
        </div>
      )}
    </Paper>
  );
};

/* ---------------- the Reel ---------------- */
export const ApartmentMockupV4: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={0} durationInFrames={V4.cut} name="1 painted street + tag">
        <StreetScene />
      </Sequence>
      <Sequence from={V4.cut} durationInFrames={V4.end - V4.cut} name="2 chart">
        <Sequence from={-V4.cut} layout="absolute-fill">
          <ChartScene />
        </Sequence>
      </Sequence>
      <Sequence from={V4.end} durationInFrames={END_CARD_FRAMES} name="brand end card">
        <OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} />
      </Sequence>
    </AbsoluteFill>
  );
};
