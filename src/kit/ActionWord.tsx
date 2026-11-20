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
  /** vanish mode: outline-only letters that fill like liquid from the point `fillFromX` starting at `fillAt` */
  hollow?: boolean;
  fillAt?: number;
  fillFromX?: number;
  /** bolder letters (weight 900 + thin stroke) */
  heavy?: boolean;
}> = ({text, x, y, fontSize = 150, mode = 'uproot', color = 'white', at = 0, actAt = 40, hiFrom = 0, hiTo = 0, gloss, glossDir = 'rtl', exitAt, hollow = false, fillAt = 0, fillFromX = 540, heavy = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const uid = useId().replace(/:/g, '');
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
        <div dir="ltr" style={{display: 'flex', fontFamily: SANS, fontWeight: heavy ? 900 : 800, fontSize, lineHeight: 1, color: main, letterSpacing: fontSize * 0.01, textShadow: color === 'yellow' && !hollow ? '0 10px 0 rgba(0,0,0,0.4)' : undefined}}>
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
              const t0 = actAt + i * 2 + rnd(i + 11) * 6;
              const out = interpolate(frame, [t0, t0 + 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const rise = out * out * 260 + out * 40;
              const cwi = cwOf(ch);
              const cx = x - totalW / 2 + letters.slice(0, i).reduce((acc, c) => acc + cwOf(c), 0) + cwi / 2;
              const lvl = hollow ? clamp01((frame - fillAt - Math.abs(cx - fillFromX) * 0.03) / 22) : 1;
              const tf = `translate(${(rnd(i + 3) - 0.5) * 50 * out}px, ${(1 - enter) * 60 - rise}px) scale(${(0.4 + 0.6 * enter) * (1 + 0.35 * out)})`;
              const op = enter * (1 - clamp01((out - 0.15) / 0.85));
              if (hollow) {
                const base = fontSize * 0.86;
                const capH = fontSize * 0.72;
                const top = base + 4 - (capH + 8) * lvl;
                const wave: string[] = [`M-6 ${fontSize + 6}`, `L-6 ${top}`];
                for (let wx = -6; wx <= cwi + 6; wx += 6) wave.push(`L${wx} ${top + (lvl > 0 && lvl < 1 ? Math.sin((wx + frame * 1.6) * 0.16 + i) * 2.4 : 0)}`);
                wave.push(`L${cwi + 6} ${fontSize + 6}`, 'Z');
                const common = {x: cwi / 2, y: base, textAnchor: 'middle' as const, fontSize, style: {fontFamily: SANS, fontWeight: 800}};
                // DISINTEGRATE into thin air: a fractal noise field decides which specks of the letter go first
                // (fine, organic grains, no square pixels). Eroded specks are cut into 5 age bands; each band
                // is scattered a little, blown up and to the right (wind), softened and faded, so the letter
                // crumbles to dust that drifts away instead of turning into smoke.
                const dis = frame >= actAt;
                const t1 = actAt + i * 2;
                const DUR = 28;
                const pv = clamp01((frame - t1) / DUR);
                if (dis && pv >= 1) return <span key={i} style={{display: 'inline-block', width: cwi, height: fontSize}} />;
                const fid = `dz${uid}${i}`;
                const NB = 5;
                const LO = 0.17;
                const SPAN = 0.66;
                const th = LO + SPAN * pv;
                const mat = (a: number, b: number) => `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${a} 0 0 0 ${b}`;
                const remainFade = 1 - clamp01((pv - 0.8) / 0.2);
                const bands = [...Array(NB).keys()].map((k) => {
                  const q = clamp01((pv - k / NB) / (1 - k / NB));
                  const lo = LO + (SPAN * k) / NB;
                  const hi = LO + (SPAN * (k + 1)) / NB;
                  const wind = 0.5 + 0.5 * rnd(i * 5 + k + 21);
                  return {
                    k,
                    lo,
                    hi,
                    dx: fontSize * (0.1 + 0.55 * wind) * Math.pow(q, 1.15),
                    dy: -fontSize * (0.25 + 0.5 * rnd(i * 3 + k + 7)) * Math.pow(q, 1.1) - fontSize * 0.2 * q,
                    scatter: 10 + 80 * q,
                    blur: 0.3 + 1.6 * q,
                    op: 1 - clamp01((q - 0.45) / 0.55),
                  };
                });
                return (
                  <span key={i} style={{display: 'inline-block', width: cwi, height: fontSize, transform: `translateY(${(1 - enter) * 60}px) scale(${0.4 + 0.6 * enter})`, opacity: enter}}>
                    <svg width={cwi} height={fontSize} viewBox={`0 0 ${cwi} ${fontSize}`} style={{overflow: 'visible', display: 'block'}}>
                      <defs>
                        <clipPath id={`lq${uid}${i}`}>
                          <path d={wave.join(' ')} />
                        </clipPath>
                        {dis ? (
                          <filter id={fid} filterUnits="userSpaceOnUse" x={-cwi} y={-fontSize * 1.5} width={cwi * 2 + fontSize * 1.4} height={fontSize * 3} colorInterpolationFilters="sRGB">
                            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed={i * 5 + 2} result="noise" />
                            <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed={i * 3 + 11} result="sc" />
                            <feColorMatrix in="noise" type="matrix" values={mat(18, 0.5 - 18 * th)} result="keepM" />
                            <feColorMatrix in="noise" type="matrix" values={mat(-18, 0.5 + 18 * th)} result="goneM" />
                            <feComposite in="SourceGraphic" in2="keepM" operator="in" result="rem" />
                            <feColorMatrix in="rem" type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${remainFade} 0`} result="remF" />
                            {bands.map((b) => (
                              <React.Fragment key={b.k}>
                                <feColorMatrix in="noise" type="matrix" values={mat(18, 0.5 - 18 * b.lo)} result={`a${b.k}`} />
                                <feColorMatrix in="noise" type="matrix" values={mat(-18, 0.5 + 18 * b.hi)} result={`b${b.k}`} />
                                <feComposite in={`a${b.k}`} in2={`b${b.k}`} operator="in" result={`ab${b.k}`} />
                                <feComposite in={`ab${b.k}`} in2="goneM" operator="in" result={`m${b.k}`} />
                                <feComposite in="SourceGraphic" in2={`m${b.k}`} operator="in" result={`s${b.k}`} />
                                <feDisplacementMap in={`s${b.k}`} in2="sc" scale={b.scatter} xChannelSelector="R" yChannelSelector="G" result={`d${b.k}`} />
                                <feOffset in={`d${b.k}`} dx={b.dx} dy={b.dy} result={`o${b.k}`} />
                                <feGaussianBlur in={`o${b.k}`} stdDeviation={b.blur} result={`g${b.k}`} />
                                <feColorMatrix in={`g${b.k}`} type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${b.op.toFixed(3)} 0`} result={`f${b.k}`} />
                              </React.Fragment>
                            ))}
                            <feMerge>
                              <feMergeNode in="remF" />
                              {bands.map((b) => (
                                <feMergeNode key={b.k} in={`f${b.k}`} />
                              ))}
                            </feMerge>
                          </filter>
                        ) : null}
                      </defs>
                      <g filter={dis ? `url(#${fid})` : undefined}>
                        <text {...common} fill={main} clipPath={`url(#lq${uid}${i})`}>{ch}</text>
                        <text {...common} fill="none" stroke={main} strokeWidth={Math.max(3, fontSize * 0.022)} strokeLinejoin="round">{ch}</text>
                      </g>
                    </svg>
                  </span>
                );
              }
              return (
                <span key={i} style={{display: 'inline-block', width: cwi, textAlign: 'center', transform: tf, opacity: op, filter: `blur(${out * 22}px)`}}>
                  {ch}
                </span>
              );
            }
            const lit = i >= hiFrom && i < hiTo ? clamp01((frame - actAt - (i - hiFrom) * 3) / 6) : 0;
            return (
              <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - enter) * 60}px) scale(${0.4 + 0.6 * enter})`, opacity: enter, color: lit > 0.5 ? '#E0615E' : main, WebkitTextStroke: heavy ? `${fontSize * 0.04}px ${lit > 0.5 ? '#E0615E' : main}` : undefined, transition: 'none'}}>
                {ch}
              </span>
            );
          })}
        </div>
        {gloss && mode === 'pop' ? (
          <div dir={glossDir} style={{textAlign: 'center', marginTop: fontSize * 0.2, fontFamily: SANS, fontWeight: 700, fontSize: fontSize * 0.36, color: hiTo > hiFrom ? '#E0615E' : main, opacity: clamp01((frame - actAt) / 8)}}>{gloss}</div>
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
  heavy?: boolean;
}> = ({text, x, y, fontSize = 150, rotate = -8, at = 0, exitAt, color = '#E5483F', heavy = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const id = useId().replace(/:/g, '');
  const e = exitFactor(frame, exitAt, fps);
  const f = frame - at;
  if (f < 0 || e <= 0.001) return null;
  const HIT = 8; // frame the rubber face touches the page
  const k = clamp01(f / HIT);
  const dk = Math.pow(k, 2.2);
  const lift = clamp01((f - (HIT + 3)) / 12);
  const stW = fontSize * (0.7 * text.length + 0.25);
  const stH = fontSize * 1.5;
  const stScale = (1.5 - 0.5 * dk) * (1 + 0.3 * lift * lift);
  const stY = -(1 - dk) * 380 - lift * lift * 460;
  const stOp = clamp01(f / 3) * (1 - clamp01((lift - 0.45) / 0.55)) * e;
  const inkF = f - HIT;
  const printed = inkF >= 0;
  const spread = printed ? 1 + 0.05 * (1 - clamp01(inkF / 5)) : 1;
  const blur = printed ? 3 * (1 - clamp01(inkF / 6)) : 0;
  const shake = printed && inkF < 8 ? Math.sin(inkF * 4.5) * (8 - inkF) * 1.2 : 0;
  const scale = spread;
  const inkA = printed ? 1 : 0;
  return (
    <>
      <Place x={x} y={y} rotate={rotate} scale={scale} opacity={inkA * e} style={{transform: `translate(-50%, -50%) translate(${shake}px, ${shake * 0.6}px) rotate(${rotate}deg) scale(${scale})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.9" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </svg>
      <div style={{filter: `url(#${id})`, border: `${fontSize * (heavy ? 0.085 : 0.07)}px solid ${color}`, borderRadius: fontSize * 0.08, padding: `${fontSize * 0.08}px ${fontSize * 0.2}px`, boxShadow: `inset 0 0 0 ${fontSize * 0.035}px transparent`}}>
        <div style={{border: `${fontSize * (heavy ? 0.03 : 0.025)}px solid ${color}`, borderRadius: fontSize * 0.04, padding: `${fontSize * 0.04}px ${fontSize * 0.12}px`}}>
          <div dir="ltr" style={{fontFamily: SANS, fontWeight: 900, fontSize, lineHeight: 1.05, color, letterSpacing: fontSize * 0.04, textTransform: 'uppercase', whiteSpace: 'nowrap', WebkitTextStroke: heavy ? `${fontSize * 0.03}px ${color}` : undefined}}>{text}</div>
        </div>
      </div>
    </Place>
      {stOp > 0.01 ? (
        <Place x={x} y={y} style={{transform: `translate(-50%, -50%) rotate(${rotate}deg) translateY(${stY}px) scale(${stScale})`, opacity: stOp, filter: 'drop-shadow(0 26px 24px rgba(0,0,0,0.45))'}}>
          <div style={{position: 'relative', width: stW, height: stH}}>
            <div style={{position: 'absolute', inset: 0, background: '#7F2B29', borderRadius: 10, border: `${fontSize * 0.04}px solid rgba(255,255,255,0.14)`}} />
            <div style={{position: 'absolute', left: -22, top: -56, width: stW + 44, height: 60, background: '#5A5E70', borderRadius: 12}} />
            <div style={{position: 'absolute', left: stW / 2 - 55, top: -150, width: 110, height: 100, background: '#454959'}} />
            <div style={{position: 'absolute', left: stW / 2 - 105, top: -230, width: 210, height: 96, background: '#363845', borderRadius: 48}} />
          </div>
        </Place>
      ) : null}
    </>
  );
};
