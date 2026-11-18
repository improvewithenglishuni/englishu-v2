import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ANTON} from './fonts';
import {exitFactor, pop, POP, SETTLE} from './motion';
import {Place} from './Place';
import {mulberry32} from './random';
import {useTheme} from './theme';

/**
 * The key English word: Anton caps, cream fill, thin ink outline + hard offset shadow.
 * The part after `splitAt` is the target part (accent). It can split apart (`splitFrame`)
 * and/or its letters can scatter (`scatterFrame`) to act out the meaning.
 */
export const KeyWord: React.FC<{
  text: string;
  /** index where the target part starts (e.g. 3 for CON|TRAIL); -1 = no split */
  splitAt?: number;
  /** which part gets the accent */
  accent?: 'second' | 'first' | 'none';
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  fontSize?: number;
  splitFrame?: number;
  gap?: number;
  scatterFrame?: number;
  scatter?: number;
  seed?: number;
}> = ({text, splitAt = -1, accent = 'second', x, y, scale = 1, rotate = 0, at = 0, exitAt, fontSize = 190, splitFrame, gap = 80, scatterFrame, scatter = 1, seed = 7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const s = pop(frame, at, fps);
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  const split = splitFrame === undefined ? 0 : spring({frame: frame - splitFrame, fps, config: POP});
  const o = Math.max(2, Math.round(fontSize / 60)); // outline px
  const sh = Math.round(fontSize / 26); // hard shadow px
  const outline = [
    [o, 0], [-o, 0], [0, o], [0, -o], [o, o], [-o, o], [o, -o], [-o, -o],
  ].map(([a, b]) => `${a}px ${b}px 0 ${theme.ink}`);
  const textShadow = [...outline, `${sh + o}px ${sh + o}px 0 ${theme.ink}`].join(', ');
  const rnd = mulberry32(seed);
  const letters = text.split('');
  const mid = (letters.length - 1) / 2;
  return (
    <Place x={x} y={y} scale={scale * (0.7 + 0.3 * s) * e} rotate={rotate} opacity={Math.min(1, s * 2.5)}>
      <div style={{display: 'flex', alignItems: 'flex-end', whiteSpace: 'nowrap', fontFamily: ANTON, fontSize, lineHeight: 1, letterSpacing: fontSize * 0.01}}>
        {letters.map((ch, i) => {
          const second = splitAt >= 0 && i >= splitAt;
          const isAccent = splitAt >= 0 && ((accent === 'second' && second) || (accent === 'first' && !second));
          // split: first part moves left, second right, so the word stays centred
          const dxSplit = splitAt >= 0 ? (second ? gap / 2 : -gap / 2) * split : 0;
          // scatter: each letter jumps to its own height/size/angle, staggered
          const r1 = rnd();
          const r2 = rnd();
          const r3 = rnd();
          const sc = scatterFrame === undefined ? 0 : spring({frame: frame - scatterFrame - i * 2, fps, config: SETTLE});
          const dy = ((r1 - 0.5) * fontSize * 0.55 + (i % 2 ? 1 : -1) * fontSize * 0.12) * sc * scatter;
          const dx = (i - mid) * fontSize * 0.07 * sc * scatter;
          const rot = (r2 - 0.5) * 14 * sc * scatter;
          const scl = 1 + (r3 - 0.5) * 0.35 * sc * scatter;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: isAccent ? theme.accent : theme.cream,
                textShadow,
                transform: `translate(${dxSplit + dx}px, ${dy}px) rotate(${rot}deg) scale(${scl})`,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          );
        })}
      </div>
    </Place>
  );
};
