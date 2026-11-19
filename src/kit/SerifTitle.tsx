import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {BARLOW, FRANK, HEEBO, PLAYFAIR} from './fonts';
import {clamp01, exitFactor, pop, SETTLE} from './motion';
import {Place} from './Place';
import {useUi} from './theme';

/** Both resolve to the video's ONE typeface (--kit-font, set by <World> from theme.typeface). */
export const SERIF = `var(--kit-font, ${PLAYFAIR}, ${FRANK}, serif)`;
export const SANS = `var(--kit-font, ${BARLOW}, ${HEEBO}, sans-serif)`;

/**
 * Vox title: high-contrast bold serif (chart titles, map titles, quoted words laid over a
 * picture) with an optional small sans "Source: ..." line under it. Latin = Playfair Display,
 * Hebrew falls back to Frank Ruhl Libre (also a serif), so one component serves both.
 * Colour: 'white' on pictures and dark plates, 'slate' on light paper, 'lavender' on charcoal.
 */
export const SerifTitle: React.FC<{
  text: string;
  x: number;
  y: number;
  width?: number;
  fontSize?: number;
  color?: 'white' | 'slate' | 'lavender' | 'heading';
  source?: string;
  italic?: boolean;
  dir?: 'rtl' | 'ltr';
  align?: 'center' | 'left' | 'right';
  at?: number;
  exitAt?: number;
  /** soft shadow so white text reads on a busy picture */
  shadow?: boolean;
  /** no entrance animation: on screen, in place, from the first frame */
  fixed?: boolean;
}> = ({text, x, y, width = 900, fontSize = 92, color = 'slate', source, italic = false, dir = 'ltr', align = 'center', at = 0, exitAt, shadow = false, fixed = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const s = fixed ? 1 : pop(frame, at, fps, SETTLE);
  const e = exitFactor(frame, exitAt, fps);
  const k = clamp01(s) * e;
  if (k <= 0.001) return null;
  const col = {white: ui.white, slate: ui.slate, lavender: '#9FA8C3', heading: ui.heading}[color];
  return (
    <Place x={x} y={y + (1 - s) * 26} opacity={k}>
      <div dir={dir} style={{width, textAlign: align, color: col}}>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontStyle: italic ? 'italic' : 'normal',
            fontSize,
            lineHeight: 1.12,
            letterSpacing: -fontSize * 0.01,
            textShadow: shadow ? '0 3px 18px rgba(0,0,0,0.55)' : undefined,
          }}
        >
          {text}
        </div>
        {source ? (
          <div dir="ltr" style={{fontFamily: SANS, fontWeight: 700, fontSize: fontSize * 0.27, marginTop: fontSize * 0.1, color: color === 'white' ? ui.land : ui.dim, textAlign: align, letterSpacing: 0.5}}>
            {source}
          </div>
        ) : null}
      </div>
    </Place>
  );
};

/** Bold condensed sans heading (Vox: "Malaria", "Ring vaccination"). */
export const SansHeading: React.FC<{
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: 'heading' | 'slate' | 'white';
  width?: number;
  dir?: 'rtl' | 'ltr';
  at?: number;
  exitAt?: number;
}> = ({text, x, y, fontSize = 110, color = 'heading', width = 900, dir = 'ltr', at = 0, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const s = pop(frame, at, fps, SETTLE);
  const k = clamp01(s) * exitFactor(frame, exitAt, fps);
  if (k <= 0.001) return null;
  return (
    <Place x={x} y={y + (1 - s) * 22} opacity={k}>
      <div dir={dir} style={{width, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize, lineHeight: 1.05, color: {heading: ui.heading, slate: ui.slate, white: ui.white}[color], letterSpacing: -fontSize * 0.012}}>
        {text}
      </div>
    </Place>
  );
};
