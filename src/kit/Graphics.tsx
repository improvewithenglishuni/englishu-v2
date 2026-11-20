import React, {useId} from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP, SETTLE} from './motion';
import {Place} from './Place';
import {SANS} from './SerifTitle';
import {HAND} from './fonts';
import {useUi} from './theme';
import markerCircle from './markerCircle.json';

/**
 * A magazine-cutout upper arm with a smallpox vaccination scar: white paper border with a rough
 * torn edge, soft shadow, sleeve at the top. The arm slides up and settles, the scar pops, then a
 * dashed yellow ring draws around it and pulses. x,y = centre; `height` = px.
 */
export const ScarArm: React.FC<{x: number; y: number; height?: number; rotate?: number; at?: number; scarAt?: number; exitAt?: number}> = ({x, y, height = 1100, rotate = -7, at = 0, scarAt = 14, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const id = useId().replace(/:/g, '');
  const s = clamp01(pop(frame, at, fps, SETTLE));
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  const sc = pop(frame, scarAt, fps, POP);
  const ring = interpolate(frame, [scarAt + 8, scarAt + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + 0.04 * Math.sin((frame - scarAt) * 0.35);
  const arm = 'M165 170 C120 360 112 640 135 960 L505 960 C525 640 515 340 478 170 Z';
  const w = (height * 640) / 960;
  const R = 2 * Math.PI * 96;
  return (
    <Place x={x} y={y + (1 - s) * 500} rotate={rotate} opacity={s * e}>
      <svg width={w} height={height} viewBox="0 0 640 960" style={{overflow: 'visible'}}>
        <defs>
          <filter id={`${id}r`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="14" />
          </filter>
          <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity="0.38" />
          </filter>
          <filter id={`${id}k`} x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="22" />
          </filter>
          <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#D79A8C" />
            <stop offset="0.45" stopColor="#EDBDAE" />
            <stop offset="1" stopColor="#CC8F83" />
          </linearGradient>
        </defs>
        <g filter={`url(#${id}s)`}>
          <g filter={`url(#${id}r)`}>
            <path d={arm} fill={ui.white} stroke={ui.white} strokeWidth={46} strokeLinejoin="round" />
            <path d="M120 -10 L520 -10 L552 250 C420 292 250 292 108 252 Z" fill={ui.white} stroke={ui.white} strokeWidth={46} strokeLinejoin="round" />
          </g>
        </g>
        <g filter={`url(#${id}r)`}>
          <path d={arm} fill={`url(#${id}g)`} />
          <path d="M120 -10 L520 -10 L552 250 C420 292 250 292 108 252 Z" fill={ui.slate} />
          <path d="M150 40 C230 90 300 120 330 250" stroke="#2C2F39" strokeWidth={6} fill="none" opacity={0.7} />
          <path d="M430 30 C410 110 400 170 420 270" stroke="#2C2F39" strokeWidth={6} fill="none" opacity={0.7} />
          <path d="M120 255 C250 296 420 296 552 254" stroke="#2C2F39" strokeWidth={8} fill="none" opacity={0.55} />
        </g>
        <g transform={`translate(380 560) scale(${sc})`} filter={`url(#${id}k)`}>
          <circle r={82} fill="#C98177" opacity={0.55} />
          <circle r={62} fill="#B5645E" />
          <circle r={38} fill="#E9B2A4" />
          {[[-14, -10, 7], [12, -16, 6], [16, 12, 7], [-10, 16, 6], [0, 0, 7], [-22, 4, 5]].map(([a, b, r], i) => (
            <circle key={i} cx={a} cy={b} r={r} fill="#9A4A47" />
          ))}
        </g>
        <g transform={`translate(380 560) scale(${pulse})`}>
          <circle r={96} fill="none" stroke={ui.yellow} strokeWidth={9} strokeDasharray="22 14" strokeDashoffset={R * (1 - ring)} opacity={ring} strokeLinecap="round" />
          <circle r={112} fill="none" stroke={ui.yellow} strokeWidth={26} opacity={0.18 * ring} />
        </g>
      </svg>
    </Place>
  );
};

/** A big number that counts up from 0 (hook stat), tabular so it does not jitter. */
export const CountUp: React.FC<{to: number; x: number; y: number; fontSize?: number; color?: 'white' | 'slate' | 'red'; at?: number; duration?: number; exitAt?: number; suffix?: string}> = ({to, x, y, fontSize = 190, color = 'slate', at = 0, duration = 45, exitAt, suffix = ''}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const s = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  const t = interpolate(frame, [at, at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const v = Math.round(to * (1 - Math.pow(1 - t, 3)));
  const col = {white: ui.white, slate: ui.slate, red: '#D6403B'}[color];
  return (
    <Place x={x} y={y} opacity={s} scale={0.8 + 0.2 * s}>
      <div dir="ltr" style={{fontFamily: SANS, fontWeight: 800, fontSize, color: col, fontVariantNumeric: 'tabular-nums', letterSpacing: -2, whiteSpace: 'nowrap'}}>{v.toLocaleString('en-US')}{suffix}</div>
    </Place>
  );
};

/**
 * A real picture laid across the FULL WIDTH of the frame (a band), slow push-in, optional dim.
 * Use for landscape pictures whose source is ~1000 px wide or less: they stay crisp because they
 * are shown at about 1:1 instead of being blown up to fill the 1920 px height.
 * y = centre of the band; aspect = source height / width.
 */
export const PictureBand: React.FC<{src: string; y: number; aspect: number; zoom?: [number, number]; focus?: [number, number]; at?: number; exitAt?: number; dim?: number}> = ({src, y, aspect, zoom = [1.0, 1.1], focus = [50, 50], at = 0, exitAt, dim = 0}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  const s = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  const z = interpolate(frame, [at, durationInFrames], zoom, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const h = Math.round(width * aspect);
  return (
    <div style={{position: 'absolute', left: 0, top: y - h / 2, width, height: h, overflow: 'hidden', opacity: s, boxShadow: '0 18px 50px rgba(0,0,0,0.45)'}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focus[0]}% ${focus[1]}%`, transform: `scale(${z})`, transformOrigin: `${focus[0]}% ${focus[1]}%`}} />
      {dim > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(20,20,24,${dim})`}} /> : null}
    </div>
  );
};

/**
 * A die-cut sticker (image with a white outline already baked in) on the plate: soft shadow,
 * slight rotation, slides up and settles. x,y = centre. `width` in px (height follows `aspect`).
 */
export const Sticker: React.FC<{src: string; x: number; y: number; width: number; aspect: number; rotate?: number; at?: number; exitAt?: number; children?: React.ReactNode}> = ({src, x, y, width, aspect, rotate = -3, at = 0, exitAt, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = clamp01(pop(frame, at, fps, SETTLE));
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  return (
    <Place x={x} y={y + (1 - s) * 420} rotate={rotate} opacity={s * e}>
      <div style={{position: 'relative', width, height: width * aspect, filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.38))'}}>
        <Img src={src} style={{width: '100%', height: '100%', display: 'block'}} />
        {children}
      </div>
    </Place>
  );
};

const polyLen = (pts: number[][]) => pts.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
const polyD = (pts: number[][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
const markerD = {a: polyD(markerCircle.a), b: polyD(markerCircle.b)};
const markerLen = {a: polyLen(markerCircle.a), b: polyLen(markerCircle.b), all: 0};
markerLen.all = markerLen.a + markerLen.b;

/**
 * The real vaccination-scar photo as a die-cut sticker with a scar EFFECT: the sticker slowly
 * pushes in on the scars while a soft coral glow pulses over them (no ring, no outline).
 * Scar centre is given as fractions of the sticker (default for arm_sticker.png).
 */
export const ScarSticker: React.FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  rotate?: number;
  at?: number;
  scarAt?: number;
  scar?: {x: number; y: number};
  aspect?: number;
  scars?: number[][];
  zoomFrom?: number;
  zoomTo?: number;
  zoomDur?: number;
  /** the camera pans while zooming so the `scar` point of the sticker ends up at this frame point */
  scarTarget?: {x: number; y: number};
  /** red felt-tip marker loop (baked texture, drawn on): centre as fractions of the sticker, scale 1 = about 64 sticker px radius, rot in degrees */
  marker?: {cx: number; cy: number; scale?: number; rot?: number; at: number; dur?: number};
  exitAt?: number;
}> = ({src, x, y, width, rotate = -5, at = 0, scarAt = 12, zoomFrom = 1, zoomTo = 1.28, zoomDur = 60, scar = {x: 0.5, y: 0.5}, aspect = 1202 / 960, scars = [[0.469, 0.408], [0.504, 0.491], [0.529, 0.552]], scarTarget, marker, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mkId = useId().replace(/:/g, '');
  const glow = clamp01((frame - scarAt) / 10) * (0.55 + 0.25 * Math.sin((frame - scarAt) * 0.28));
  const zp0 = clamp01((frame - scarAt) / zoomDur);
  const zp = scarTarget ? (zp0 < 0.5 ? 2 * zp0 * zp0 : 1 - Math.pow(-2 * zp0 + 2, 2) / 2) : zp0;
  const zoom = zoomFrom + (zoomTo - zoomFrom) * zp;
  const e = exitFactor(frame, exitAt, fps);
  const s = clamp01(pop(frame, at, fps, SETTLE));
  if (s * e <= 0.001) return null;
  const h = width * aspect;
  let px = x;
  let py = y;
  if (scarTarget) {
    const vx = (scar.x - 0.5) * width;
    const vy = (scar.y - 0.5) * h;
    const r = (rotate * Math.PI) / 180;
    const s0 = {x: x + (vx * Math.cos(r) - vy * Math.sin(r)), y: y + (vx * Math.sin(r) + vy * Math.cos(r))};
    px = x + (scarTarget.x - s0.x) * zp;
    py = y + (scarTarget.y - s0.y) * zp;
  }
  const mp = marker ? clamp01((frame - marker.at) / (marker.dur ?? 16)) : 0;
  return (
    <Place x={px} y={py + (1 - s) * 420} rotate={rotate} opacity={s * e}>
      <div style={{position: 'relative', width, height: h, transform: `scale(${zoom})`, transformOrigin: `${scar.x * 100}% ${scar.y * 100}%`, filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.38))'}}>
        <Img src={src} style={{width: '100%', height: '100%', display: 'block'}} />
        {scars.map(([a, b], i) => (
          <div key={i} style={{position: 'absolute', left: `${(a as number) * 100}%`, top: `${(b as number) * 100}%`, width: width * 0.2, height: width * 0.2, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,97,94,0.95) 0%, rgba(224,97,94,0.45) 40%, rgba(224,97,94,0) 70%)', mixBlendMode: 'multiply', opacity: glow}} />
        ))}
        {marker && mp > 0 ? (
          <svg width={width} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <defs>
              {(['a', 'b'] as const).map((k) => {
                const total = markerLen[k] + 0;
                const start = k === 'a' ? 0 : markerLen.a;
                const prog = clamp01((mp * markerLen.all - start) / total);
                return (
                  <mask key={k} id={`mm${k}${mkId}`} maskUnits="userSpaceOnUse" x={-100} y={-100} width={200} height={200}>
                    <path d={markerD[k]} pathLength={1} fill="none" stroke="#fff" strokeWidth={markerCircle.width * 1.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - prog} />
                  </mask>
                );
              })}
            </defs>
            <g transform={`translate(${marker.cx * width} ${marker.cy * h}) rotate(${marker.rot ?? 0}) scale(${marker.scale ?? 1})`} style={{mixBlendMode: 'multiply', isolation: 'isolate'}}>
              <g style={{isolation: 'isolate'}}>
                <image href={staticFile('assets/vox/marker_a.png')} x={-100} y={-100} width={200} height={200} mask={`url(#mma${mkId})`} />
                <image href={staticFile('assets/vox/marker_b.png')} x={-100} y={-100} width={200} height={200} mask={`url(#mmb${mkId})`} style={{mixBlendMode: 'multiply'}} />
              </g>
            </g>
          </svg>
        ) : null}
      </div>
    </Place>
  );
};

/** One big number that counts UP to `peak` and later back DOWN to `end` (e.g. 300,000,000 -> 0). */
export const Tally: React.FC<{peak: number; end?: number; x: number; y: number; fontSize?: number; upAt: number; upDur: number; downAt: number; downDur: number; at?: number; exitAt?: number}> = ({peak, end = 0, x, y, fontSize = 150, upAt, upDur, downAt, downDur, at = 0, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  const up = interpolate(frame, [upAt, upAt + upDur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const down = interpolate(frame, [downAt, downAt + downDur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const peakNow = peak * (1 - Math.pow(1 - up, 3));
  // count down geometrically (every frame drops a fixed fraction), so it keeps passing through
  // every magnitude (...,000 -> 00 -> 0) instead of jumping from millions to zero at the end
  const v = down <= 0 ? Math.round(peakNow) : Math.round(Math.max(end, Math.pow(peakNow + 1, 1 - down) - 1 + end * down));
  const done = down >= 1;
  return (
    <Place x={x} y={y} opacity={s} scale={0.8 + 0.2 * s}>
      <div dir="ltr" style={{fontFamily: SANS, fontWeight: 800, fontSize, color: done ? '#FCFCFC' : '#E5372F', fontVariantNumeric: 'tabular-nums', letterSpacing: -4, whiteSpace: 'nowrap', textShadow: `0 ${fontSize * 0.03}px ${fontSize * 0.06}px rgba(0,0,0,0.38)`}}>{v.toLocaleString('en-US')}</div>
    </Place>
  );
};

/** Big flat disc (Vox yellow) behind a cutout person. */
export const Disc: React.FC<{x: number; y: number; r: number; color?: string; at?: number; exitAt?: number}> = ({x, y, r, color = '#F5DD3C', at = 0, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  return (
    <Place x={x} y={y} scale={s} opacity={0.95}>
      <div style={{width: r * 2, height: r * 2, borderRadius: '50%', background: color, mixBlendMode: 'multiply'}} />
    </Place>
  );
};

/** Black torn-slab label with white text, or (paper) a white crumpled torn-paper tag with handwritten ink. */
export const NameLabel: React.FC<{x: number; y: number; line1: string; line2?: string; dir?: 'rtl' | 'ltr'; fontSize?: number; rotate?: number; paper?: boolean; at?: number; exitAt?: number}> = ({x, y, line1, line2, dir = 'rtl', fontSize = 84, rotate = -2, paper = false, at = 0, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const s = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (s <= 0.001) return null;
  if (paper) {
    const fs = fontSize * 1.35;
    const padX = fs * 0.55;
    const padY = fs * 0.28;
    return (
      <Place x={x} y={y} rotate={rotate} scale={0.85 + 0.15 * s} opacity={s}>
        <div style={{position: 'relative', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.38))'}}>
          <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('assets/vox/crumple_paper.png')})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'none'}} />
          <div dir={dir} style={{position: 'relative', padding: `${padY}px ${padX}px`, textAlign: 'center', fontFamily: SANS, color: '#26242E', whiteSpace: 'nowrap', transform: 'rotate(-1deg)'}}>
            <div style={{fontWeight: 800, fontSize: fs * 0.8, lineHeight: 1.05}}>{line1}</div>
            {line2 ? <div style={{fontWeight: 700, fontSize: fs * 0.52, lineHeight: 1.1, color: '#45424F'}}>{line2}</div> : null}
          </div>
        </div>
      </Place>
    );
  }
  return (
    <Place x={x} y={y} rotate={rotate} scale={0.85 + 0.15 * s} opacity={s}>
      <div dir={dir} style={{background: '#17171A', padding: `${fontSize * 0.22}px ${fontSize * 0.5}px`, boxShadow: '0 12px 18px rgba(0,0,0,0.35)', textAlign: 'center', fontFamily: SANS, color: '#FCFCFC', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: 800, fontSize, lineHeight: 1.1}}>{line1}</div>
        {line2 ? <div style={{fontWeight: 600, fontSize: fontSize * 0.6, lineHeight: 1.2, color: '#CDD0DE'}}>{line2}</div> : null}
      </div>
    </Place>
  );
};

const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

const rr = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A crowd of small pictograms filling the plate (a very large population). They pop in
 * (staggered from `at`) and, if `vanishFrom`/`vanishTo` are given, drop away at random moments
 * in that window (the number going down to zero).
 */
export const Crowd: React.FC<{x0: number; y0: number; cols: number; rows: number; dx: number; dy: number; size: number; color?: string; at?: number; vanishFrom?: number; vanishTo?: number; /** a wave of colour spreads outward from (cx,cy): each person turns from `color` to `lit` */ wave?: {at: number; lit: string; cx: number; cy: number; speed: number; opacity?: number}}> = ({x0, y0, cols, rows, dx, dy, size, color = '#4B4D5A', at = 0, vanishFrom, vanishTo, wave}) => {
  const frame = useCurrentFrame();
  const items: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const enter = clamp01((frame - at - rr(i) * 24) / 8);
      const gone = vanishFrom !== undefined && vanishTo !== undefined ? clamp01((frame - (vanishFrom + rr(i + 500) * (vanishTo - vanishFrom))) / 6) : 0;
      const o = enter * (1 - gone);
      if (o <= 0.01) continue;
      const px = x0 + c * dx + (r % 2 ? dx / 2 : 0);
      const py = y0 + r * dy;
      const litK = wave ? clamp01((frame - wave.at - Math.hypot(px - wave.cx, py - wave.cy) / wave.speed) / 8) : 0;
      const fillC = wave ? mixHex(color, wave.lit, litK) : color;
      items.push(
        <g key={i} transform={`translate(${px} ${py}) scale(${((0.6 + 0.4 * enter) * (1 - 0.3 * gone) * size) / 160}) translate(-50 -80)`} opacity={o}>
          {litK > 0.02 ? (
            <g opacity={litK * o} fill="#FDF551" stroke="#FDF551" strokeLinejoin="round" strokeLinecap="round">
              {/* faint glow BORDER: stacked, widening, fading outlines of the figure (no fill wash) */}
              {[[150, 0.05], [110, 0.07], [78, 0.09], [52, 0.12], [34, 0.12], [22, 0.18], [13, 0.26], [7, 0.4]].map(([w, a]) => (
                <g key={w} strokeWidth={w} strokeOpacity={a} fillOpacity={0}>
                  <circle cx={50} cy={28} r={19} />
                  <path d="M28 52 L72 52 L80 104 L66 104 L63 150 L53 150 L50 118 L47 150 L37 150 L34 104 L20 104 Z" />
                </g>
              ))}
            </g>
          ) : null}
          <circle cx={50} cy={28} r={19} fill={fillC} />
          <path d="M28 52 L72 52 L80 104 L66 104 L63 150 L53 150 L50 118 L47 150 L37 150 L34 104 L20 104 Z" fill={fillC} />
        </g>,
      );
    }
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="crowdGlow">
          <stop offset="0" stopColor="#FDF551" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#FDF551" stopOpacity={0.3} />
          <stop offset="1" stopColor="#FDF551" stopOpacity={0} />
        </radialGradient>
      </defs>
      {items}
    </svg>
  );
};

/**
 * A card that looks cut out of a magazine: white border with JAGGED, scissor-cut edges and a soft
 * shadow. `children` sit inside (the picture or graphic). x,y = centre.
 */
export const Jagged: React.FC<{x: number; y: number; width: number; height: number; rotate?: number; fill?: string; at?: number; exitAt?: number; border?: number; children?: React.ReactNode}> = ({x, y, width, height, rotate = 2, fill, at = 0, exitAt, border = 22, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const s = clamp01(pop(frame, at, fps, SETTLE));
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  return (
    <Place x={x} y={y + (1 - s) * 420} rotate={rotate} opacity={s * e}>
      <div style={{position: 'relative', width, height, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.36))'}}>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.07" numOctaves="2" seed="11" result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale="26" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <div style={{position: 'absolute', inset: -border, background: '#FAFAF7', filter: `url(#${id})`}} />
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: fill}}>{children}</div>
      </div>
    </Place>
  );
};


/**
 * Tiny germs that rush at a (vaccinated) person, hit its invisible shield and bounce away.
 * (cx,cy) = person centre; rx,ry = body ellipse the germs cannot enter.
 */
export const Germs: React.FC<{cx: number; cy: number; rx: number; ry: number; n?: number; at: number; stagger?: number; color?: string; spike?: string; size?: number}> = ({cx, cy, rx, ry, n = 12, at, stagger = 2, color = '#E0615E', spike = '#3E414C', size = 38}) => {
  const frame = useCurrentFrame();
  const out: React.ReactNode[] = [];
  const IN = 11;
  const OUT = 16;
  for (let i = 0; i < n; i++) {
    const ang = -0.15 * Math.PI + (i / (n - 1)) * 1.3 * Math.PI + (rr(i + 3) - 0.5) * 0.12;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const edge = 1 / Math.sqrt((ca / rx) ** 2 + (sa / ry) ** 2);
    const f = frame - (at + i * stagger);
    if (f < 0 || f > IN + OUT + 6) continue;
    const far = 760;
    const bounceAng = ang + (rr(i + 9) - 0.5) * 1.4;
    let px: number;
    let py: number;
    let o = 1;
    let rot: number;
    if (f <= IN) {
      const k = f / IN;
      const r = far + (edge + 14 - far) * (k * k);
      px = cx + ca * r;
      py = cy + sa * r;
      rot = f * 14;
    } else {
      const k = Math.min(1, (f - IN) / OUT);
      const e2 = 1 - Math.pow(1 - k, 2.2);
      const r = edge + 14 + 360 * e2;
      px = cx + Math.cos(bounceAng) * r + (ca - Math.cos(bounceAng)) * (edge + 14) * (1 - e2);
      py = cy + Math.sin(bounceAng) * r + (sa - Math.sin(bounceAng)) * (edge + 14) * (1 - e2);
      rot = IN * 14 + (f - IN) * 34;
      o = 1 - clamp01((k - 0.55) / 0.45);
    }
    const hit = f > IN && f < IN + 7 ? 1 - (f - IN) / 7 : 0;
    const R = size / 2;
    out.push(
      <g key={i} transform={`translate(${px} ${py})`} opacity={o}>
        {hit > 0 ? <circle cx={0} cy={0} r={R * (1.2 + (1 - hit) * 1.6)} fill="none" stroke="#FDF551" strokeWidth={4} opacity={hit} /> : null}
        <g transform={`rotate(${rot})`}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <line key={k} x1={Math.cos((k * Math.PI) / 4) * R * 0.8} y1={Math.sin((k * Math.PI) / 4) * R * 0.8} x2={Math.cos((k * Math.PI) / 4) * R * 1.35} y2={Math.sin((k * Math.PI) / 4) * R * 1.35} stroke={spike} strokeWidth={3.2} strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={R * 0.82} fill={color} stroke={spike} strokeWidth={2.4} />
          <circle cx={-R * 0.25} cy={-R * 0.2} r={R * 0.16} fill="#F4F3F9" opacity={0.7} />
        </g>
      </g>,
    );
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {out}
    </svg>
  );
};


/**
 * A line drawing that is INKED IN as if drawn by hand: a pen scribbles back and forth over the
 * picture (boustrophedon rows) and reveals the ink where it passes. PNG with transparent paper.
 * x,y = centre; aspect = height / width.
 */
export const DrawOn: React.FC<{src: string; x: number; y: number; width: number; aspect: number; rotate?: number; at?: number; dur?: number; rows?: number; exitAt?: number}> = ({src, x, y, width, aspect, rotate = 0, at = 0, dur = 30, rows = 13, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const e = exitFactor(frame, exitAt, fps);
  const p = clamp01((frame - at) / dur);
  if (p <= 0 || e <= 0.001) return null;
  const h = width * aspect;
  const rh = h / rows;
  const pts: string[] = [];
  for (let r = 0; r < rows; r++) {
    const yy = (r + 0.5) * rh;
    const a = r % 2 === 0 ? -rh : width + rh;
    const b = r % 2 === 0 ? width + rh : -rh;
    pts.push(`${r === 0 ? 'M' : 'L'}${a} ${yy - rh * 0.25}`, `L${b} ${yy + rh * 0.25}`);
  }
  const eased = p * p * (3 - 2 * p) * 0.35 + p * 0.65;
  return (
    <Place x={x} y={y} rotate={rotate} opacity={e}>
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{overflow: 'visible', display: 'block', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.22))'}}>
        <defs>
          <mask id={`dr${id}`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={width + 40} height={h + 40}>
            <path d={pts.join(' ')} pathLength={1} fill="none" stroke="#fff" strokeWidth={rh * 1.7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - eased} />
          </mask>
        </defs>
        <image href={src} x={0} y={0} width={width} height={h} mask={`url(#dr${id})`} />
      </svg>
    </Place>
  );
};
