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

/* Mock-up v9 (Sharon, Nov 28): new hook question on the outro's torn paper strip, tag hangs from a balcony and
   slaps onto the page across the cut, then leaves; 1995-2007 in 4 s; DISPARITY only when the gap is large (thump);
   bar looks different when salaries lead; y value of the last threshold passed in bold; push-in + shake on the
   break-away; tag-a-friend note in the last 2 s.
   Based on mock-up v8 (Sharon, Nov 28): the v6 chart, unchanged, with the v7 first frame (big Hebrew hook on a paper strip,
   red price tag slamming in with the 2025 average price counting up), plus a third palm and no Hebrew under the price.
   v6 notes follow. Mock-up v6 (Sharon, Nov 28, fourth round): EXORBITANT on the tag in a permanent-marker font, one whole line under
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
export const V9 = {
  cut: 96, // hard cut from the painted street to the chart; the counter starts here
  fastTo: 96 + 120, // 1995 -> 2007.5 in 4 s
  drawTo: 756, // 2007.5 -> 2025, about 1 s per year
  tagOff: 96 + 62, // the slapped-on tag leaves the page
  share: 816, // tag-a-friend note, last 2 s before the end card
  end: 876, // story 29.2 s
};
export const TOTAL_V9 = V9.end + END_CARD_FRAMES; // 30.4 s

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

const yearAt = (f: number) =>
  f < V9.fastTo
    ? interpolate(f, [V9.cut, V9.fastTo], [Y0, 2007.5], clamp)
    : interpolate(f, [V9.fastTo, V9.drawTo], [2007.5, Y1], {...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1)});
const firstFrame = (cond: (t: number) => boolean) => {
  for (let f = V9.cut; f <= V9.drawTo; f++) if (cond(yearAt(f))) return f;
  return V9.drawTo;
};
const pAt = (t: number) => {
  const i = Math.min(Math.floor(t - 1995), 29);
  const u = Math.max(0, Math.min(1, t - 1995 - i));
  return [PRICE[i] + (PRICE[i + 1] - PRICE[i]) * u, WAGE[i] + (WAGE[i + 1] - WAGE[i]) * u];
};
/** DISPARITY lands once prices lead salaries by 45 index points or more (2016) */
export const LABEL_AT = firstFrame((t) => t > 2008 && pAt(t)[0] - pAt(t)[1] >= 45);
/** the break-away: 2021-2022 jump */
export const BREAK_AT = firstFrame((t) => t >= 2021.6);

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
    <Grain id="g9p" />
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
  const x = interpolate(f, [0, V9.cut], [70, 40]);
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

const HEB = "'Rubik', sans-serif";
const MARK = "'Permanent Marker', cursive";
const AVG_PRICE_2025 = 2330800; // CBS Table 2.2, 2025 annual average, NIS
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Red hanging price tag: clipped top corners, eyelet, PRICE header with a whole underline, white box with content */
const PriceTag: React.FC<{w: number; children: React.ReactNode}> = ({w, children}) => {
  const h = w * 1.3;
  const cut = w * 0.16;
  const eyeY = w * 0.15;
  const boxTop = h * 0.4;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.32))'}}>
        <defs>
          <linearGradient id={`ptr${Math.round(w)}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E3342C" />
            <stop offset="1" stopColor="#C4231D" />
          </linearGradient>
        </defs>
        <path d={`M${cut} 0 H${w - cut} L${w} ${cut} V${h - 10} Q${w} ${h} ${w - 10} ${h} H10 Q0 ${h} 0 ${h - 10} V${cut} Z`} fill={`url(#ptr${Math.round(w)})`} />
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

const StreetScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sway = Math.sin(f / 18) * 4;
  // tag slams down onto its string (thump at about frame 12), then swings
  const drop = spring({frame: f, fps, config: {damping: 10, stiffness: 230}});
  const fall = interpolate(drop, [0, 1], [-2600, 0]);
  const swing = 10 * Math.exp(-Math.max(0, f - 10) / 24) * Math.sin(Math.max(0, f - 10) / 4.5) + Math.sin(f / 21) * 1.2;
  // the price counts up fast
  const count = interpolate(f, [10, 52], [0, AVG_PRICE_2025], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const tie = {x: 720, y: 737}; // on the 2nd-floor balcony slab of the right-hand building
  const tagW = 440;
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
          <Palm x={60} base={1860} h={480} lean={-20} sway={sway * 0.8} />
          <ellipse cx={140} cy={1810} rx={190} ry={80} fill="#4E8A43" />
          <ellipse cx={780} cy={1820} rx={170} ry={70} fill="#3F7D3A" />
        </g>
      </svg>
      <Grain id="g9s" opacity={0.16} />

      {/* the tag, tied to a balcony railing */}
      <div style={{position: 'absolute', left: tie.x, top: tie.y + fall, width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${swing}deg)`}}>
        <svg width={120} height={120} style={{position: 'absolute', left: -60, top: -10, overflow: 'visible'}}>
          <circle cx={60} cy={10} r={7} fill="#F4F1E8" stroke="#BDB6A6" strokeWidth={2} />
          <path d="M60 10 C 44 50, 50 80, 60 105" stroke="#F4F1E8" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
          <path d="M60 10 C 76 50, 70 80, 60 105" stroke="#E3DED2" strokeWidth={5} fill="none" style={{filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.45))'}} />
        </svg>
        <div style={{position: 'absolute', left: -tagW / 2, top: 30, transform: 'rotate(-2deg)'}}>
          <PriceTag w={tagW}>
            <div style={{fontFamily: MARK, fontSize: 64, color: '#1A1A1A', transform: 'rotate(-5deg)', whiteSpace: 'nowrap'}}>₪{fmt(count)}</div>
          </PriceTag>
        </div>
      </div>

      {/* hook question on the outro's torn paper strip (public/brand/torn_strip.png, same size and tape) */}
      <div style={{position: 'absolute', left: 0, top: 230, width: 1080, height: 196}}>
        <Img src={staticFile('brand/torn_strip.png')} style={{position: 'absolute', left: -60, top: -30, width: 1200, height: 256, filter: 'drop-shadow(0 2px 1.5px rgba(0,0,0,.2)) drop-shadow(0 8px 10px rgba(0,0,0,.13))'}} />
        <div style={{position: 'absolute', left: 60, right: 130, top: 30, direction: 'rtl', textAlign: 'center', fontFamily: HEB, fontWeight: 800, fontSize: 56, lineHeight: 1.16, color: '#1E2028'}}>
          כמה{' '}
          <span style={{position: 'relative', display: 'inline-block'}}>
            <span style={{position: 'absolute', left: -8, right: -8, top: 12, bottom: 2, background: C.hi, borderRadius: '6px 14px 8px 12px', transform: 'rotate(-1deg)', clipPath: `inset(0 0 0 ${(1 - swipe) * 100}%)`}} />
            <span style={{position: 'relative'}}>שנות משכורת</span>
          </span>{' '}
          צריך
          <br />
          כדי לקנות דירה בישראל?
        </div>
        <div style={{position: 'absolute', left: 445, top: -38, width: 190, height: 58, background: 'rgba(236,230,205,.85)', boxShadow: '0 2px 4px rgba(0,0,0,.1)'}} />
      </div>
    </AbsoluteFill>
  );
};


/* small version of the same tag for the callback */


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
  const ticks = [0, 50, 100, 150, 200, 250, 300];

  // DISPARITY lands only when the gap is large
  const lab = spring({frame: f - LABEL_AT, fps, config: {damping: 13, stiffness: 150}});
  const midY = (pY + wY) / 2;
  const priceLeads = pNow >= wNow;

  // the y value of the last threshold the gap's top line has passed is bold
  const topVal = Math.max(pNow, wNow) - 100;
  const boldTick = Math.max(0, Math.floor(topVal / 50) * 50);
  const boldColor = priceLeads ? C.red : C.blue;

  // payoff: push-in on the gap from 2018, a shake at the 2021-2022 break-away
  const push = interpolate(t, [2018, 2025], [1, 1.08], clamp);
  const sh = f >= BREAK_AT - 2 && f < BREAK_AT + 18 ? Math.exp(-(f - BREAK_AT + 2) / 6) : 0;
  const shakeX = sh * 9 * Math.sin(f * 2.3);
  const shakeY = sh * 7 * Math.cos(f * 2.9);

  // the hook's tag slaps onto the page across the cut, then leaves
  const slap = spring({frame: f - V9.cut, fps, config: {damping: 9, stiffness: 200}});
  const leave = interpolate(f, [V9.tagOff, V9.tagOff + 14], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});

  // tag-a-friend note
  const share = spring({frame: f - V9.share, fps, config: {damping: 11, stiffness: 170}});

  return (
    <Paper>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `560px ${midY}px`, transform: `translate(${shakeX}px, ${shakeY}px) scale(${push})`}}>
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
        <defs>
          <pattern id="hatch9" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="#DCE4F4" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#7F95C8" strokeWidth="4" />
          </pattern>
        </defs>
        {ticks.filter((k) => k % 100 === 0 && k > 0).map((k) => (
          <path key={`g${k}`} d={`M${PX0 + 16} ${yOf(100 + k)} L${PX1} ${yOf(100 + k)}`} stroke={C.soft} strokeWidth={2} strokeDasharray="6 12" opacity={0.6} />
        ))}
        {/* the gap bar */}
        {priceLeads ? (
          <rect x={barX - 10 * breathe} y={topY + 14} width={20 * breathe} height={Math.max(0, gap - 28)} rx={8} fill={C.hi} opacity={barOpacity * 0.95} style={{mixBlendMode: 'multiply'}} />
        ) : (
          <rect x={barX - 8} y={topY + 14} width={16} height={Math.max(0, gap - 28)} rx={6} fill="url(#hatch9)" stroke={C.blue} strokeWidth={2} strokeDasharray="5 5" opacity={barOpacity * 0.8} />
        )}
        <path d={smooth(linePts(WAGE))} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={smooth(linePts(PRICE))} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={tipX} cy={wY} r={11} fill={C.blue} />
        <circle cx={tipX} cy={pY} r={11} fill={C.red} />
        {/* pointer from the label to the bar */}
        {lab > 0.05 && <path d={`M${barX - 150} ${midY} L${barX - 16} ${midY}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" opacity={lab} />}
      </svg>

      {ticks.map((k) => (
        <div key={k} style={{position: 'absolute', left: 30, top: yOf(100 + k) - 24, width: 140, textAlign: 'right', fontFamily: FONT, fontSize: k === boldTick ? 42 : 32, fontWeight: k === boldTick ? 700 : 400, color: k === boldTick ? boldColor : C.soft}}>
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

      {/* DISPARITY: a paper label on the middle of the gap, left of the bar (only once the gap is large) */}
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
          DISPARITY
        </div>
      )}

      </div>

      {/* the hook's tag, slapped onto the notebook page, leaves after about 2 s */}
      {f >= V9.cut && f < V9.tagOff + 16 && (
        <div style={{position: 'absolute', left: 250 + leave * 900, top: 540 - leave * 200, transformOrigin: '0 0', transform: `rotate(${-6 + leave * 30}deg) scale(${interpolate(slap, [0, 1], [1.0, 0.82])})`, opacity: 1 - leave * 0.2}}>
          <PriceTag w={440}>
            <div style={{fontFamily: MARK, fontSize: 64, color: '#1A1A1A', transform: 'rotate(-5deg)', whiteSpace: 'nowrap'}}>₪{fmt(AVG_PRICE_2025)}</div>
          </PriceTag>
        </div>
      )}

      {/* tag-a-friend, last 2 s */}
      {f >= V9.share && (
        <>
          <AbsoluteFill style={{background: C.paper, opacity: interpolate(f, [V9.share, V9.share + 8], [0, 0.35], clamp)}} />
          <div style={{position: 'absolute', left: 140, width: 700, top: 1080, transform: `rotate(-2deg) scale(${interpolate(share, [0, 1], [1.25, 1])})`, opacity: Math.min(1, share * 3), background: '#FFF0A6', boxShadow: '0 14px 22px rgba(40,35,20,0.25)', padding: '30px 20px', textAlign: 'center', fontFamily: HEB, fontWeight: 800, fontSize: 58, color: '#1E2028', direction: 'rtl'}}>
            תייגו חבר שחוסך לדירה
          </div>
        </>
      )}
    </Paper>
  );
};

/* ---------------- the Reel ---------------- */
export const ApartmentMockupV9: React.FC = () => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`700 40px "Playpen Sans Hebrew"`, 'אבג abc'),
      document.fonts.load(`400 40px "Permanent Marker"`, 'EXORBITANT ₪0'),
      document.fonts.load(`800 40px "Rubik"`, 'אבג'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Sequence from={0} durationInFrames={V9.cut} name="1 painted street + tag">
        <StreetScene />
      </Sequence>
      <Sequence from={V9.cut} durationInFrames={V9.end - V9.cut} name="2 chart">
        <Sequence from={-V9.cut} layout="absolute-fill">
          <ChartScene />
        </Sequence>
      </Sequence>
      <Sequence from={9} durationInFrames={60} name="sfx tag thud">
        <Audio src={staticFile('sfx/miscellaneous/stamp_thud_01.wav')} volume={0.32} />
      </Sequence>
      <Sequence from={12} durationInFrames={60} name="sfx count tick">
        <Audio src={staticFile('sfx/mechanical/stopwatch_tick_01.wav')} volume={0.12} />
      </Sequence>
      <Sequence from={V9.cut - 1} durationInFrames={60} name="sfx tag slaps on the page">
        <Audio src={staticFile('sfx/tactile/paper_movement_02.wav')} volume={0.24} />
      </Sequence>
      <Sequence from={V9.tagOff - 2} durationInFrames={60} name="sfx tag leaves">
        <Audio src={staticFile('sfx/whooshes/soft_whoosh_01.wav')} volume={0.15} />
      </Sequence>
      <Sequence from={LABEL_AT - 2} durationInFrames={60} name="sfx DISPARITY thump">
        <Audio src={staticFile('sfx/miscellaneous/soft_thump_reveal_01.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={BREAK_AT - 2} durationInFrames={60} name="sfx break-away hit">
        <Audio src={staticFile('sfx/miscellaneous/stamp_thud_02.wav')} volume={0.34} />
      </Sequence>
      <Sequence from={V9.share - 2} durationInFrames={60} name="sfx share note">
        <Audio src={staticFile('sfx/miscellaneous/tape_press_01.wav')} volume={0.22} />
      </Sequence>
      <Sequence from={0} durationInFrames={V9.end} name="room tone">
        <Audio src={staticFile('sfx/ambience/room_tone_01.wav')} volume={0.04} loop />
      </Sequence>
      <Sequence from={V9.end} durationInFrames={END_CARD_FRAMES} name="brand end card">
        <OffthreadVideo src={staticFile('brand/englishu-end-card.mp4')} />
      </Sequence>
    </AbsoluteFill>
  );
};
