import React from 'react';
import {Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, SETTLE} from './motion';
import {SANS} from './SerifTitle';
import {Place} from './Place';
import {useUi} from './theme';

/**
 * A key person as a duotone CUTOUT (transparent PNG from tools/make_figure_cutout.py) standing
 * on a plain dark plate, with the quote beside/above in bold white sans. Words from `dimFrom`
 * on start grey and light up one by one (`wordGap` frames apart), the way the narrator reaches
 * them. Also fine for a statement with no person: omit `src`.
 * Figure is anchored bottom-left by default (x,y = its bottom-centre).
 */
export const QuoteCutout: React.FC<{
  src?: string;
  /** figure bottom-centre */
  x?: number;
  y?: number;
  width?: number;
  quote: string;
  dir?: 'rtl' | 'ltr';
  /** index of the first word that starts dim */
  dimFrom?: number;
  wordGap?: number;
  textBox?: {x: number; y: number; w: number};
  fontSize?: number;
  at?: number;
  exitAt?: number;
  /** small caption under the quote: who said it */
  by?: string;
}> = ({src, x = 330, y = 1500, width = 760, quote, dir = 'ltr', dimFrom, wordGap = 7, textBox = {x: 520, y: 330, w: 500}, fontSize = 74, at = 0, exitAt, by}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const s = clamp01(pop(frame, at, fps, SETTLE));
  const e = exitFactor(frame, exitAt, fps);
  if (s * e <= 0.001) return null;
  const words = quote.split(' ');
  return (
    <>
      {src ? (
        <div style={{position: 'absolute', left: x - width / 2 - (1 - s) * 80, top: y, width, transform: 'translateY(-100%)', opacity: s * e}}>
          <Img src={src} style={{width: '100%', display: 'block'}} />
        </div>
      ) : null}
      <Place x={textBox.x + textBox.w / 2} y={textBox.y} opacity={s * e}>
        <div dir={dir} style={{width: textBox.w, fontFamily: SANS, fontWeight: 800, fontSize, lineHeight: 1.1, color: ui.white, letterSpacing: -0.5}}>
          {words.map((w, i) => {
            const lit = dimFrom === undefined || i < dimFrom ? 1 : clamp01((frame - at - 10 - (i - dimFrom) * wordGap) / 6);
            return (
              <span key={i} style={{color: lit >= 1 ? ui.white : lit <= 0 ? '#8A8B94' : '#C8C9D2', marginInlineEnd: fontSize * 0.26}}>
                {w}
              </span>
            );
          })}
          {by ? <div style={{marginTop: fontSize * 0.4, fontSize: fontSize * 0.45, fontWeight: 700, color: ui.dim}}>{by}</div> : null}
        </div>
      </Place>
    </>
  );
};
