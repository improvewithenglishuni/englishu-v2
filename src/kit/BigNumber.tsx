import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ANTON} from './fonts';
import {exitFactor, pop} from './motion';
import {Place} from './Place';
import {useTheme} from './theme';

/** A year or count in Anton caps with an ink outline and hard offset shadow (1796, 0, 300,000,000). */
export const BigNumber: React.FC<{
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  scale?: number;
  rotate?: number;
  at?: number;
  exitAt?: number;
  fill?: 'cream' | 'ink' | 'accent' | 'spot';
}> = ({text, x, y, fontSize = 300, scale = 1, rotate = 0, at = 0, exitAt, fill = 'cream'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const theme = useTheme();
  const s = pop(frame, at, fps);
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  const o = Math.max(3, Math.round(fontSize / 55));
  const col = {cream: theme.cream, ink: theme.ink, accent: theme.accent, spot: theme.spot}[fill];
  const edge = fill === 'ink' ? theme.cream : theme.ink;
  return (
    <Place x={x} y={y} scale={scale * (0.6 + 0.4 * s) * e} rotate={rotate + (1 - s) * 5} opacity={Math.min(1, s * 3)}>
      <div
        style={{
          fontFamily: ANTON,
          fontSize,
          lineHeight: 1,
          color: col,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          WebkitTextStroke: `${o}px ${edge}`,
          paintOrder: 'stroke fill',
          textShadow: `${o * 1.6}px ${o * 1.9}px 0 ${edge}`,
        }}
      >
        {text}
      </div>
    </Place>
  );
};
