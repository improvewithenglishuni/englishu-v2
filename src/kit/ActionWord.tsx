import React, {useId} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP, SETTLE} from './motion';
import {Place} from './Place';
import {SANS} from './SerifTitle';
import {useUi} from './theme';

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Small hand-drawn tangle of roots hanging under a letter. */
const Roots: React.FC<{w: number; seed: number; color: string}> = ({w, seed, color}) => {
  const h = w * 0.9;
  const cx = w / 2;
  const strands = [-0.42, -0.18, 0.05, 0.3, 0.48].map((o, i) => {
    const sway = (rnd(seed + i) - 0.5) * w * 0.5;
    const len = h * (0.55 + rnd(seed * 3 + i) * 0.45);
    return `M${cx + o * w * 0.25} 0 Q${cx + o * w + sway} ${len * 0.5} ${cx + o * w * 1.4 + sway * 0.6} ${len}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', left: 0, top: '86%', overflow: 'visible'}}>
      {strands.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={Math.max(3, w * 0.07)} strokeLinecap="round" />
      ))}
    </svg>
  );
};

/**
 * A target word that ACTS OUT its meaning, letter by letter (Vox/plane-reel "DISPERSE" idea).
 *  mode 'uproot' (ERADICATE = e-radix, "out of the root"): the word stands on a ground line with
 *     roots under every letter; at `actAt` the letters are yanked up and out one by one.
 *  mode 'pop' (VACCINATION from vacca = cow): letters pop in one by one; letters [hiFrom, hiTo)
 *     light up in the accent colour and a small gloss appears under the word.
 * Colours: white on dark plates, 'slate' on light paper.
 */
export const ActionWord: React.FC<{
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  mode?: 'uproot' | 'pop' | 'vanish';
  color?: 'white' | 'slate' | 'yellow';
  /** frame the word first appears */
  at?: number;
  /** frame the letters start leaving (uproot) / the highlight lights up (pop) */
  actAt?: number;
  hiFrom?: number;
  hiTo?: number;
  /** small line under the word, e.g. "vacca = פרה" */
  gloss?: string;
  glossDir?: 'rtl' | 'ltr';
  exitAt?: number;
}> = ({text, x, y, fontSize = 150, mode = 'uproot', color = 'white', at = 0, actAt = 40, hiFrom = 0, hiTo = 0, gloss, glossDir = 'rtl', exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const e = exitFactor(frame, exitAt, fps);
  const main = color === 'white' ? ui.white : color === 'yellow' ? '#FDF551' : ui.slate;
  const letters = text.split('');
  const cwOf = (ch: string) => fontSize * (ch === 'I' ? 0.34 : ch === 'M' || ch === 'W' ? 0.86 : 0.66);
  const cw = fontSize * 0.66;
  const totalW = letters.reduce((a, ch) => a + cwOf(ch), 0);
  const ground = color === 'white' ? '#8D90A0' : '#8A8FA6';
  const root = color === 'white' ? '#E4E7F2' : '#4E5878';
  if (e <= 0.001) return null;
  return (
    <>
      {mode === 'uproot' ? (
        <div style={{position: 'absolute', left: x - totalW / 2 - 30, top: y + fontSize * 0.44, width: totalW + 60, height: 6, background: ground, opacity: clamp01(pop(frame, at, fps, SETTLE)) * e, borderRadius: 3}} />
      ) : null}
      <Place x={x} y={y} opacity={e}>
        <div dir="ltr" style={{display: 'flex', fontFamily: SANS, fontWeight: 800, fontSize, lineHeight: 1, color: main, letterSpacing: fontSize * 0.01, textShadow: color === 'yellow' ? '0 10px 0 rgba(0,0,0,0.4)' : undefined}}>
          {letters.map((ch, i) => {
            const enter = clamp01(pop(frame, at + i * 2, fps, POP));
            if (mode === 'uproot') {
              const t0 = actAt + i * 3;
              const out = interpolate(frame, [t0, t0 + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const yank = out * out;
              const shake = out > 0 && out < 0.35 ? Math.sin(frame * 2.2 + i) * 6 : 0;
              return (
                <span key={i} style={{position: 'relative', display: 'inline-block', width: cwOf(ch), textAlign: 'center', transform: `translate(${shake + (rnd(i + 2) - 0.5) * 120 * yank}px, ${-yank * 900}px) rotate(${(rnd(i + 5) - 0.5) * 80 * yank}deg) scale(${enter})`, opacity: 1 - clamp01((out - 0.7) / 0.3)}}>
                  {ch}
                  <Roots w={cwOf(ch)} seed={i + 1} color={root} />
                </span>
              );
            }
            if (mode === 'vanish') {
              const t0 = actAt + i * 3;
              const out = interpolate(frame, [t0, t0 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <span key={i} style={{display: 'inline-block', width: cwOf(ch), textAlign: 'center', transform: `translateY(${(1 - enter) * 60 - out * 30}px) scale(${(0.4 + 0.6 * enter) * (1 - 0.5 * out)})`, opacity: enter * (1 - out), filter: `blur(${out * 14}px)`}}>
                  {ch}
                </span>
              );
            }
            const lit = i >= hiFrom && i < hiTo ? clamp01((frame - actAt - (i - hiFrom) * 3) / 6) : 0;
            return (
              <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - enter) * 60}px) scale(${0.4 + 0.6 * enter})`, opacity: enter, color: lit > 0.5 ? '#E0615E' : main, transition: 'none'}}>
                {ch}
              </span>
            );
          })}
        </div>
        {gloss && mode === 'pop' ? (
          <div dir={glossDir} style={{textAlign: 'center', marginTop: fontSize * 0.2, fontFamily: SANS, fontWeight: 700, fontSize: fontSize * 0.36, color: main, opacity: clamp01((frame - actAt) / 8)}}>{gloss}</div>
        ) : null}
      </Place>
    </>
  );
};

/**
 * A red rubber stamp slamming onto the picture: block red letters, double border, grungy ink,
 * tilted, with a short shake on impact. Use ONCE, to re-state the key word at the payoff.
 */
export const Stamp: React.FC<{
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  color?: string;
}> = ({text, x, y, fontSize = 150, rotate = -8, at = 0, exitAt, color = '#E5483F'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const e = exitFactor(frame, exitAt, fps);
  const f = frame - at;
  if (f < 0 || e <= 0.001) return null;
  const drop = clamp01(f / 5);
  const scale = 2.6 - 1.6 * (1 - Math.pow(1 - drop, 3)) + (f > 5 ? Math.max(0, 0.06 * Math.sin((f - 5) * 1.3) * Math.exp(-(f - 5) / 5)) : 0);
  const shake = f >= 5 && f < 13 ? Math.sin(f * 4) * (13 - f) * 1.4 : 0;
  const inkA = clamp01(f / 3);
  return (
    <Place x={x} y={y} rotate={rotate} scale={scale} opacity={inkA * e} style={{transform: `translate(-50%, -50%) translate(${shake}px, ${shake * 0.6}px) rotate(${rotate}deg) scale(${scale})`}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.9" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </svg>
      <div style={{filter: `url(#${id})`, border: `${fontSize * 0.07}px solid ${color}`, borderRadius: fontSize * 0.08, padding: `${fontSize * 0.08}px ${fontSize * 0.2}px`, boxShadow: `inset 0 0 0 ${fontSize * 0.035}px transparent`}}>
        <div style={{border: `${fontSize * 0.025}px solid ${color}`, borderRadius: fontSize * 0.04, padding: `${fontSize * 0.04}px ${fontSize * 0.12}px`}}>
          <div dir="ltr" style={{fontFamily: SANS, fontWeight: 800, fontSize, lineHeight: 1.05, color, letterSpacing: fontSize * 0.04, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{text}</div>
        </div>
      </div>
    </Place>
  );
};
