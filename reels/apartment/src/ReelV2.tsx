import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';

/* Mock-up v2: one continuous chart, in the spirit of the "How Do Couples Meet?" reference.
   Year slider at the top, lines grow left to right while the time axis stretches, live values at the tips,
   a highlighter bar that tracks the gap (DISCREPANCY), explanation only at the end. */

/* ---------------- timing (30 fps; estimates until Sharon records) ---------------- */
export const V2 = {
  hook: 0, // כמה שנות משכורת...
  start: 96, // בואו נתחיל ב-2011.
  drawFrom: 120, // 2011
  drawTo: 600, // 2025 (16 s, about 1.1 s per year)
  jump: 470, // ואז המחירים זינקו.
  explain: 600, // המשכורת עלתה ב-58 אחוז...
  english: 708, // That's the discrepancy...
  discrepancyWord: 726,
  exorbitantWord: 790,
  fourteen: 815,
  relate: 870, // חוסכים לדירה...
  end: 960,
};
export const TOTAL_V2 = 1041;

const C = {
  paper: '#F7F6F0',
  grid: '#E8ECF2',
  ink: '#3E414C',
  soft: '#8B8F99',
  blue: '#1F3A8A',
  red: '#C8322B',
  hi: '#FDF551',
};
const FONT = "'Playpen Sans Hebrew', sans-serif";
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* CBS data, annual averages, 2011 = 100 (tools/sources/data/apartment_chart_2011-2025.csv) */
const YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const PRICE = [100.0, 103.2, 112.6, 119.8, 126.8, 136.2, 141.5, 140.4, 143.0, 147.4, 159.8, 187.4, 193.8, 203.2, 207.7];
const WAGE = [100.0, 102.3, 104.8, 106.5, 108.8, 111.3, 114.6, 118.6, 122.1, 130.0, 133.2, 137.0, 145.5, 153.9, 158.3];

/* ---------------- plot geometry: y axis on the LEFT, time left to right ---------------- */
const PX0 = 190; // y axis
const PX1 = 740; // the tips always sit here (the time axis stretches, like the reference)
const PY0 = 1360; // value 100 (0%)
const PY1 = 580; // value 220 (+120%)
const yOf = (v: number) => PY0 - ((v - 100) / 120) * (PY0 - PY1);

const valueAt = (arr: number[], t: number) => {
  const i = Math.min(Math.floor(t - 2011), 13);
  const u = t - 2011 - i;
  return arr[i] + (arr[i + 1] - arr[i]) * Math.max(0, Math.min(1, u));
};

/* Smooth curve through points (Catmull-Rom -> cubic Bezier) */
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

/* ---------------- paper plate ---------------- */
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

/* handwritten text, revealed in its reading direction */
const Write: React.FC<{
  text: string;
  from: number;
  dur: number;
  style: React.CSSProperties;
  dir?: 'rtl' | 'ltr';
}> = ({text, from, dur, style, dir = 'rtl'}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], clamp);
  if (p <= 0) return null;
  const h = (1 - p) * 104;
  return (
    <div
      style={{
        position: 'absolute',
        fontFamily: FONT,
        direction: dir,
        whiteSpace: 'pre',
        clipPath: dir === 'rtl' ? `inset(-20% -4% -20% ${h}%)` : `inset(-20% ${h}% -20% -4%)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/* ---------------- the Reel ---------------- */
export const ApartmentMockupV2: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
    ]).then(() => continueRender(handle));
  }, [handle]);

  const f = useCurrentFrame();

  // current time on the chart
  const t = interpolate(f, [V2.drawFrom, V2.drawTo], [2011, 2025], {...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1)});
  const span = Math.max(t - 2011, 1.2); // the time axis stretches as the years go by
  const xOf = (year: number) => PX0 + ((year - 2011) / span) * (PX1 - PX0);

  const linePts = (arr: number[]) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < YEARS.length && YEARS[i] <= t; i++) pts.push([xOf(YEARS[i]), yOf(arr[i])]);
    if (t > 2011 && t < 2025) pts.push([xOf(t), yOf(valueAt(arr, t))]);
    return pts;
  };
  const started = f >= V2.drawFrom - 6;
  const pPts = linePts(PRICE);
  const wPts = linePts(WAGE);
  const pNow = valueAt(PRICE, t);
  const wNow = valueAt(WAGE, t);
  const tipX = xOf(t);
  const pY = yOf(pNow);
  const wY = yOf(wNow);

  // labels at the tips, kept apart
  let pLabY = pY;
  let wLabY = wY;
  const minGap = 104;
  if (wLabY - pLabY < minGap) {
    const mid = (pLabY + wLabY) / 2;
    pLabY = mid - minGap / 2;
    wLabY = mid + minGap / 2;
  }
  const pct = (v: number) => `+${Math.round(v - 100)}%`;

  // the gap bar ("discrepancy"), tracks the tips and breathes slightly
  const gapOpacity = interpolate(wY - pY, [6, 40], [0, 1], clamp);
  const breathe = 1 + Math.sin(f / 7) * 0.12;

  // slider
  const SX0 = 150;
  const SX1 = 930;
  const knobX = SX0 + ((t - 2011) / 14) * (SX1 - SX0);
  const fadeIn = interpolate(f, [0, 10], [0.0, 1], clamp);

  // highlighter on EXORBITANT when it is said
  const swipe = interpolate(f, [V2.exorbitantWord, V2.exorbitantWord + 10], [0, 1], clamp);
  // y ticks
  const ticks = [0, 50, 100];

  return (
    <Paper>
      {/* Title */}
      <div style={{position: 'absolute', top: 120, left: 60, width: 890, textAlign: 'center', fontFamily: FONT, fontWeight: 700, color: C.ink, lineHeight: 1.12}}>
        <div style={{fontSize: 84, position: 'relative', display: 'inline-block'}}>
          The{' '}
          <span style={{position: 'relative', display: 'inline-block'}}>
            <span
              style={{
                position: 'absolute',
                left: -10,
                right: -10,
                top: 16,
                bottom: 6,
                background: C.hi,
                mixBlendMode: 'multiply',
                borderRadius: '6px 14px 8px 12px',
                transform: 'rotate(-1.2deg)',
                clipPath: `inset(0 ${(1 - swipe) * 100}% 0 0)`,
              }}
            />
            <span style={{position: 'relative'}}>EXORBITANT</span>
          </span>
        </div>
        <div style={{fontSize: 72}}>Price of an Apartment</div>
      </div>

      {/* 2025 note: 14.3 years of salary (only while narrated) */}
      <Write
        text="2025: דירה ממוצעת = 14.3 שנות שכר ממוצע"
        from={V2.fourteen}
        dur={22}
        style={{top: 1418, left: 60, width: 890, textAlign: 'center', fontSize: 40, fontWeight: 700, color: C.red}}
      />

      {/* Year slider */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
        <path d={`M${SX0} 470 C ${SX0 + 200} 468, ${SX1 - 300} 473, ${SX1} 470`} stroke={C.soft} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M${SX0} 470 L ${knobX} 470`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={knobX} cy={470} r={20} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <path d={`M${knobX} 470 L ${knobX} 458 M ${knobX} 470 L ${knobX + 8} 476`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${(t - 2011) * 160} ${knobX} 470)`} />
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
          opacity: fadeIn,
        }}
      >
        {Math.floor(t + 1e-4)}
      </div>

      {/* Chart */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* y axis on the left, baseline */}
        <path d={`M${PX0} ${PY0} L${PX0} ${PY1 - 20}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M${PX0} ${PY0} L${PX1 + 20} ${PY0}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        {ticks.map((k) => (
          <path key={k} d={`M${PX0 - 12} ${yOf(100 + k)} L${PX0 + 12} ${yOf(100 + k)}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {ticks.slice(1).map((k) => (
          <path key={`g${k}`} d={`M${PX0 + 16} ${yOf(100 + k)} L${PX1} ${yOf(100 + k)}`} stroke={C.soft} strokeWidth={2} strokeDasharray="6 12" opacity={0.6} />
        ))}

        {/* the gap bar */}
        {started && t > 2011.4 && (
          <rect
            x={tipX + 26 - 9 * breathe}
            y={pY + 14}
            width={18 * breathe}
            height={Math.max(0, wY - pY - 28)}
            rx={8}
            fill={C.hi}
            opacity={gapOpacity * 0.95}
            style={{mixBlendMode: 'multiply'}}
          />
        )}

        {/* lines */}
        {started && (
          <>
            <path d={smooth(wPts)} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={smooth(pPts)} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={tipX} cy={wY} r={11} fill={C.blue} />
            <circle cx={tipX} cy={pY} r={11} fill={C.red} />
          </>
        )}

        {/* arrow from the word DISCREPANCY to the bar */}
        {f >= V2.discrepancyWord + 18 && (
          <path
            d={`M520 690 Q 640 800 ${tipX + 10} ${(pY + wY) / 2}`}
            stroke={C.ink}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - interpolate(f, [V2.discrepancyWord + 18, V2.discrepancyWord + 30], [0, 1], clamp)}
          />
        )}
      </svg>

      {/* y tick labels */}
      {ticks.map((k) => (
        <div key={k} style={{position: 'absolute', left: 40, top: yOf(100 + k) - 24, width: 130, textAlign: 'right', fontFamily: FONT, fontSize: 36, color: C.soft, direction: 'ltr'}}>
          {k === 0 ? '0%' : `+${k}%`}
        </div>
      ))}
      {/* first and current year under the axis */}
      <div style={{position: 'absolute', left: PX0 - 60, top: PY0 + 14, width: 120, textAlign: 'center', fontFamily: FONT, fontSize: 36, color: C.soft}}>2011</div>

      {/* live labels at the tips */}
      {started && (
        <>
          <div style={{position: 'absolute', left: tipX + 48, top: pLabY - 52, width: 300, fontFamily: FONT, color: C.red, direction: 'rtl', textAlign: 'left'}}>
            <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, textAlign: 'left'}}>מחיר דירה</div>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1, direction: 'ltr', textAlign: 'left'}}>{pct(pNow)}</div>
          </div>
          <div style={{position: 'absolute', left: tipX + 48, top: wLabY - 52, width: 300, fontFamily: FONT, color: C.blue, direction: 'rtl', textAlign: 'left'}}>
            <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, textAlign: 'left'}}>שכר ממוצע</div>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1, direction: 'ltr', textAlign: 'left'}}>{pct(wNow)}</div>
          </div>
        </>
      )}

      {/* DISCREPANCY, written when it is said, in the empty space above the lines */}
      <Write text="DISCREPANCY" from={V2.discrepancyWord} dur={20} dir="ltr" style={{top: 596, left: 212, fontSize: 56, fontWeight: 700, color: C.ink}} />

      <Subtitles />
      <EndCardV2 />
    </Paper>
  );
};

/* ---------------- subtitles ---------------- */
const SUBS: {from: number; to: number; text: string; dir: 'rtl' | 'ltr'}[] = [
  {from: V2.hook, to: V2.start, text: 'כמה שנות משכורת עולה היום\nדירה ממוצעת בישראל?', dir: 'rtl'},
  {from: V2.start, to: V2.start + 60, text: 'בואו נתחיל ב-2011.', dir: 'rtl'},
  {from: V2.jump, to: V2.jump + 54, text: 'ואז המחירים זינקו.', dir: 'rtl'},
  {from: V2.explain, to: V2.explain + 50, text: 'המשכורת עלתה ב-58 אחוז,', dir: 'rtl'},
  {from: V2.explain + 50, to: V2.english, text: 'ומחיר הדירה יותר מהכפיל את עצמו.', dir: 'rtl'},
  {from: V2.english, to: V2.english + 50, text: "That's the discrepancy.", dir: 'ltr'},
  {from: V2.english + 50, to: V2.english + 97, text: 'Today, an average apartment costs', dir: 'ltr'},
  {from: V2.english + 97, to: V2.relate, text: 'an exorbitant fourteen years of salary.', dir: 'ltr'},
  {from: V2.relate, to: V2.relate + 50, text: 'חוסכים לדירה ומרגישים\nשאתם לא מתקרבים?', dir: 'rtl'},
  {from: V2.relate + 50, to: V2.end, text: 'זה לא אתם.', dir: 'rtl'},
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
        whiteSpace: 'pre-line',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 56,
        lineHeight: 1.25,
        color: C.ink,
        textShadow: `0 0 10px ${C.paper}, 0 0 4px ${C.paper}, 0 0 2px ${C.paper}`,
      }}
    >
      {s.text}
    </div>
  );
};

/* ---------------- end card (stand-in for the approved brand card) ---------------- */
const EndCardV2: React.FC = () => {
  const f = useCurrentFrame() - V2.end;
  if (f < 0) return null;
  const o = interpolate(f, [0, 8], [0, 1], clamp);
  const sc = interpolate(f, [0, TOTAL_V2 - V2.end], [1, 1.05], clamp);
  return (
    <AbsoluteFill style={{opacity: o, background: '#F5F0E5', alignItems: 'center', justifyContent: 'center', transform: `scale(${sc})`}}>
      <Img src={staticFile('logo.png')} style={{width: 520, mixBlendMode: 'multiply'}} />
      <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 700, fontSize: 58, color: '#0A2370'}}>@improve.with.englishu</div>
      <div style={{marginTop: 14, fontFamily: FONT, fontSize: 44, color: '#B01F25'}}>englishu.co.il</div>
    </AbsoluteFill>
  );
};
