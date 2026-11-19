import React, {useId} from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP, SETTLE} from './motion';
import {Place} from './Place';
import {SANS} from './SerifTitle';
import {useUi} from './theme';

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
