import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/700.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
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

/* Mock-up v3 (Sharon, Nov 28): the "never getting there" line is the hook, on a real Tel Aviv building with a
   swinging EXORBITANT price tag; hard cut to the chart; a corrected title; almost no words at the end;
   the brand end card (public/brand/englishu-end-card.mp4, 4.2 s, with its own sound). */

export const END_CARD_FRAMES = 126; // 4.2 s at 30 fps, fixed brand card

export const V3 = {
  hook: 0, // חוסכים לדירה ומרגישים שאתם אף פעם לא מגיעים?
  cut: 96, // hard cut to the chart
  exorbitant: 104, // Apartment prices in Israel have become exorbitant.
  compare: 196, // בואו נשווה אותם למשכורות, מאז 2011.
  drawFrom: 220, // 2011
  drawTo: 690, // 2025 (about 1.1 s per year)
  discrepancy: 705, // That's the discrepancy.
  tagBack: 760, // the tag from the hook drops back in
  end: 880, // brand end card
};
export const TOTAL_V3 = V3.end + END_CARD_FRAMES; // 1006 frames = 33.5 s

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

const EASE = Easing.bezier(0.3, 0, 0.7, 1);
const yearAt = (f: number) => interpolate(f, [V3.drawFrom, V3.drawTo], [2011, 2025], {...clamp, easing: EASE});
/** first frame at which the chart reaches a given year (used to time "ואז המחירים זינקו") */
const frameOfYear = (year: number) => {
  for (let f = V3.drawFrom; f <= V3.drawTo; f++) if (yearAt(f) >= year) return f;
  return V3.drawTo;
};
const JUMP = frameOfYear(2021.1);

/* plot geometry: y axis on the left, time left to right */
const PX0 = 190;
const PX1 = 740;
const PY0 = 1360; // 0%
const PY1 = 580; // +120%
const yOf = (v: number) => PY0 - ((v - 100) / 120) * (PY0 - PY1);
const valueAt = (arr: number[], t: number) => {
  const i = Math.min(Math.floor(t - 2011), 13);
  const u = t - 2011 - i;
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

/* ---------------- shared bits ---------------- */
const Grain: React.FC<{opacity?: number}> = ({opacity = 0.13}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity}}>
    <filter id="grain3">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="1080" height="1920" filter="url(#grain3)" />
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
    <Grain />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.1}}>
      <filter id="fibres3">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves={2} seed={11} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#fibres3)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(60,55,40,0.12) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/** Paper price tag with a hole and a string; text in red ballpoint over a highlighter swipe */
const PriceTag: React.FC<{w: number; h: number; lines: string[]; size: number; swipe?: number}> = ({w, h, lines, size, swipe = 1}) => {
  const n = h * 0.42;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 14px 18px rgba(30,25,20,0.35))'}}>
        <path d={`M${n} 4 L${w - 4} 4 L${w - 4} ${h - 4} L${n} ${h - 4} L4 ${h / 2} Z`} fill="#FFFDF4" stroke={C.red} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={n * 0.62} cy={h / 2} r={h * 0.075} fill="none" stroke={C.red} strokeWidth={6} />
      </svg>
      <div style={{position: 'absolute', left: n + 10, right: 18, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        {lines.map((l, i) => (
          <div key={i} style={{position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.05, color: C.ink}}>
            {i === 0 && (
              <span
                style={{
                  position: 'absolute',
                  left: -8,
                  right: -8,
                  top: size * 0.18,
                  bottom: size * 0.02,
                  background: C.hi,
                  mixBlendMode: 'multiply',
                  borderRadius: '6px 14px 8px 12px',
                  clipPath: `inset(0 ${(1 - swipe) * 100}% 0 0)`,
                }}
              />
            )}
            <span style={{position: 'relative'}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- 1. Hook: real Tel Aviv building, swinging price tag ---------------- */
const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = interpolate(f, [0, V3.cut], [1, 1.06], clamp);
  // the tag drops in on a string and swings, damped
  const drop = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110}});
  const swing = 22 * Math.exp(-Math.max(0, f - 10) / 22) * Math.sin(Math.max(0, f - 10) / 4.2);
  // then it gets heavy: a thud and it grows (the price is too much)
  const heavy = spring({frame: f - 62, fps, config: {damping: 9, stiffness: 140}});
  const scale = interpolate(heavy, [0, 1], [1, 1.14]);
  const pivotX = 540;
  const stringLen = interpolate(drop, [0, 1], [-200, 560]);
  return (
    <AbsoluteFill style={{background: '#222'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 40%'}}>
        <Img src={staticFile('apartment/tlv_building.jpg')} style={{width: 1080, height: 1920, objectFit: 'cover'}} />
      </AbsoluteFill>
      <Grain opacity={0.08} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.38) 100%)'}} />
      {/* string + tag, pivoting at the top edge */}
      <div style={{position: 'absolute', left: pivotX, top: -10, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${swing}deg)`}}>
        <div style={{position: 'absolute', left: -2, top: 0, width: 4, height: Math.max(0, stringLen), background: '#F4F1E8', boxShadow: '0 0 2px rgba(0,0,0,0.4)'}} />
        {/* the tag hangs level from the string, like a sign */}
        <div style={{position: 'absolute', left: -340, top: stringLen - 6, transformOrigin: '340px 0', transform: `scale(${scale})`}}>
          <PriceTag w={680} h={250} lines={['EXORBITANT', 'PRICES']} size={80} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 2. The chart ---------------- */
const ChartScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = yearAt(f);
  const span = Math.max(t - 2011, 1.2);
  const xOf = (year: number) => PX0 + ((year - 2011) / span) * (PX1 - PX0);
  const linePts = (arr: number[]) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < YEARS.length && YEARS[i] <= t; i++) pts.push([xOf(YEARS[i]), yOf(arr[i])]);
    if (t > 2011 && t < 2025) pts.push([xOf(t), yOf(valueAt(arr, t))]);
    return pts;
  };
  const started = f >= V3.drawFrom - 6;
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
  const gapOpacity = interpolate(wY - pY, [6, 40], [0, 1], clamp);
  const breathe = 1 + Math.sin(f / 7) * 0.12;

  const SX0 = 150;
  const SX1 = 930;
  const knobX = SX0 + ((t - 2011) / 14) * (SX1 - SX0);
  const ticks = [0, 50, 100];

  // DISCREPANCY written, arrow to the bar
  const dWrite = interpolate(f, [V3.discrepancy + 6, V3.discrepancy + 24], [0, 1], clamp);
  const dArrow = interpolate(f, [V3.discrepancy + 22, V3.discrepancy + 34], [0, 1], clamp);
  // callback: the EXORBITANT tag drops back and hangs from the 2025 knob
  const back = spring({frame: f - V3.tagBack, fps, config: {damping: 11, stiffness: 120}});
  const backSwing = 14 * Math.exp(-Math.max(0, f - V3.tagBack - 8) / 18) * Math.sin(Math.max(0, f - V3.tagBack - 8) / 4);

  return (
    <Paper>
      {/* Title: what the chart actually shows */}
      <div style={{position: 'absolute', top: 128, left: 60, width: 890, textAlign: 'center', fontFamily: FONT, color: C.ink}}>
        <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap'}}>Apartment Prices vs. Salaries</div>
        <div style={{fontSize: 40, color: C.soft, marginTop: 10}}>Israel · growth since 2011</div>
      </div>

      {/* Year slider */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={`M${SX0} 470 C ${SX0 + 200} 468, ${SX1 - 300} 473, ${SX1} 470`} stroke={C.soft} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M${SX0} 470 L ${knobX} 470`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={knobX} cy={470} r={20} fill={C.paper} stroke={C.ink} strokeWidth={6} />
        <path
          d={`M${knobX} 470 L ${knobX} 458 M ${knobX} 470 L ${knobX + 8} 476`}
          stroke={C.ink}
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(${(t - 2011) * 160} ${knobX} 470)`}
        />
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

      {/* Chart */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M${PX0} ${PY0} L${PX0} ${PY1 - 20}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <path d={`M${PX0} ${PY0} L${PX1 + 20} ${PY0}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        {ticks.map((k) => (
          <path key={k} d={`M${PX0 - 12} ${yOf(100 + k)} L${PX0 + 12} ${yOf(100 + k)}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        ))}
        {ticks.slice(1).map((k) => (
          <path key={`g${k}`} d={`M${PX0 + 16} ${yOf(100 + k)} L${PX1} ${yOf(100 + k)}`} stroke={C.soft} strokeWidth={2} strokeDasharray="6 12" opacity={0.6} />
        ))}
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
        {started && (
          <>
            <path d={smooth(linePts(WAGE))} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={smooth(linePts(PRICE))} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={tipX} cy={wY} r={11} fill={C.blue} />
            <circle cx={tipX} cy={pY} r={11} fill={C.red} />
          </>
        )}
        {dArrow > 0 && (
          <path
            d={`M470 712 Q 610 800 ${tipX + 12} ${(pY + wY) / 2}`}
            stroke={C.ink}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - dArrow}
          />
        )}
      </svg>

      {ticks.map((k) => (
        <div key={k} style={{position: 'absolute', left: 40, top: yOf(100 + k) - 24, width: 130, textAlign: 'right', fontFamily: FONT, fontSize: 36, color: C.soft, direction: 'ltr'}}>
          {k === 0 ? '0%' : `+${k}%`}
        </div>
      ))}
      <div style={{position: 'absolute', left: PX0 - 60, top: PY0 + 14, width: 120, textAlign: 'center', fontFamily: FONT, fontSize: 36, color: C.soft}}>2011</div>

      {started && (
        <>
          <div style={{position: 'absolute', left: tipX + 48, top: pLabY - 52, width: 300, fontFamily: FONT, color: C.red}}>
            <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>מחיר דירה</div>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(pNow)}</div>
          </div>
          <div style={{position: 'absolute', left: tipX + 48, top: wLabY - 52, width: 300, fontFamily: FONT, color: C.blue}}>
            <div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.1, direction: 'rtl', textAlign: 'left'}}>שכר ממוצע</div>
            <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.1}}>{pct(wNow)}</div>
          </div>
        </>
      )}

      {/* DISCREPANCY, written left to right in the space above the lines */}
      {dWrite > 0 && (
        <div style={{position: 'absolute', top: 628, left: 205, fontFamily: FONT, fontWeight: 700, fontSize: 54, color: C.ink, clipPath: `inset(-20% ${(1 - dWrite) * 104}% -20% -4%)`}}>
          DISCREPANCY
        </div>
      )}

      {/* the hook's EXORBITANT tag comes back and hangs from 2025 */}
      {f >= V3.tagBack && (
        <div style={{position: 'absolute', left: knobX, top: 470, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${backSwing}deg)`}}>
          <div style={{position: 'absolute', left: -2, top: 0, width: 4, height: interpolate(back, [0, 1], [0, 26]), background: C.ink}} />
          <div
            style={{
              position: 'absolute',
              left: -310,
              top: interpolate(back, [0, 1], [-700, 18]),
              transform: 'rotate(4deg)',
              transformOrigin: '310px 0',
            }}
          >
            <PriceTag w={310} h={96} lines={['EXORBITANT']} size={36} />
          </div>
        </div>
      )}
    </Paper>
  );
};

/* ---------------- subtitles ---------------- */
const SUBS: {from: number; to: number; text: string; dir: 'rtl' | 'ltr'}[] = [
  {from: V3.hook, to: V3.cut, text: 'חוסכים לדירה ומרגישים\nשאתם אף פעם לא מגיעים?', dir: 'rtl'},
  {from: V3.exorbitant, to: V3.compare, text: 'Apartment prices in Israel\nhave become exorbitant.', dir: 'ltr'},
  {from: V3.compare, to: V3.compare + 70, text: 'בואו נשווה אותם למשכורות,\nמאז 2011.', dir: 'rtl'},
  {from: JUMP, to: JUMP + 54, text: 'ואז המחירים זינקו.', dir: 'rtl'},
  {from: V3.discrepancy, to: V3.discrepancy + 70, text: "That's the discrepancy.", dir: 'ltr'},
];

const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const s = SUBS.find((x) => f >= x.from && f < x.to);
  if (!s) return null;
  const onPhoto = f < V3.cut;
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
        fontSize: 58,
        lineHeight: 1.25,
        color: onPhoto ? '#FFFFFF' : C.ink,
        textShadow: onPhoto
          ? '0 2px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.8)'
          : `0 0 10px ${C.paper}, 0 0 4px ${C.paper}, 0 0 2px ${C.paper}`,
      }}
    >
      {s.text}
    </div>
  );
};

/* ---------------- the Reel ---------------- */
export const ApartmentMockupV3: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={0} durationInFrames={V3.cut} name="1 hook (photo)">
        <HookScene />
      </Sequence>
      <Sequence from={V3.cut} durationInFrames={V3.end - V3.cut} name="2 chart">
        <Sequence from={-V3.cut} layout="absolute-fill">
          <ChartScene />
        </Sequence>
      </Sequence>
      <Sequence from={0} durationInFrames={V3.end}>
        <Subtitles />
      </Sequence>
      {/* Brand end card: always this file, unchanged, with its own sound */}
      <Sequence from={V3.end} durationInFrames={END_CARD_FRAMES} name="brand end card">
        <OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} />
      </Sequence>
    </AbsoluteFill>
  );
};
