import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS, FontName} from './fonts';
import {exitFactor, pop} from './motion';
import {Place} from './Place';
import {useTheme} from './theme';
import {tornRectPath} from './torn';

/**
 * Torn cream paper label with dark text (the hook). Pops in from above with a slight overshoot.
 * Hebrew by default (dir="rtl").
 */
export const PaperLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  font?: FontName;
  fontSize?: number;
  /** 'cream' (default) or 'accent' for the payoff card */
  tone?: 'cream' | 'accent';
  dir?: 'rtl' | 'ltr';
  seed?: number;
  strike?: number;
}> = ({text, x, y, scale = 1, rotate = -3, at = 0, exitAt, font = 'rubik', fontSize = 104, tone = 'cream', dir = 'rtl', seed = 2, strike}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const s = pop(frame, at, fps);
  const e = exitFactor(frame, exitAt, fps);
  const d = useMemo(() => tornRectPath(1000, 300, {seed}), [seed]);
  if (s * e <= 0.001) return null;
  const strikeP = strike === undefined ? 0 : Math.max(0, Math.min(1, (frame - strike) / 8));
  return (
    <Place
      x={x}
      y={y + (1 - s) * -160}
      scale={scale * (0.85 + 0.15 * s) * e}
      rotate={rotate - (1 - s) * 8}
      opacity={Math.min(1, s * 3)}
    >
      <div style={{position: 'relative', padding: `${fontSize * 0.2}px ${fontSize * 0.42}px ${fontSize * 0.26}px`, filter: 'drop-shadow(6px 9px 6px rgba(0,0,0,0.32))'}}>
        <svg viewBox="-6 -6 1012 312" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          <path d={d} fill={tone === 'accent' ? theme.accent : theme.cream} />
        </svg>
        <div
          dir={dir}
          style={{
            position: 'relative',
            fontFamily: FONTS[font],
            fontWeight: 900,
            fontSize,
            lineHeight: 1.05,
            color: theme.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
          {strikeP > 0 ? (
            <div style={{position: 'absolute', left: 0, top: '52%', height: fontSize * 0.09, width: `${strikeP * 100}%`, background: theme.accent, borderRadius: 8, transform: 'rotate(-2deg)', mixBlendMode: 'multiply'}} />
          ) : null}
        </div>
      </div>
    </Place>
  );
};
