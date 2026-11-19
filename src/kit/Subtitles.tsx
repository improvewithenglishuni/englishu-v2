import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';
import {useTheme} from './theme';

export type SubtitleLine = {text: string; from: number; to: number};

/** Instagram safe area: keep the bottom fifth and the right edge clear. */
export const SAFE = {bottom: 1920 * 0.8, right: 130, left: 90, top: 220};

/** Wrap Latin runs in LTR spans so English words keep their order inside Hebrew lines. */
const bidi = (text: string) =>
  text.split(/([A-Za-z][A-Za-z0-9 '’.,\-]*[A-Za-z0-9.])/g).map((part, i) =>
    /[A-Za-z]/.test(part) ? (
      <span key={i} dir="ltr" style={{unicodeBidi: 'isolate'}}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

/**
 * Hebrew subtitles: small, white, dark outline, bottom-aligned just above the bottom fifth.
 * `lines` timings are in frames.
 */
export const Subtitles: React.FC<{
  lines: SubtitleLine[];
  font?: 'heebo' | 'rubik';
  fontSize?: number;
  /** y of the text baseline area bottom (default: top of the bottom fifth) */
  bottom?: number;
  /** 'box' = Vox-style dark caption box hugging each line (works on light and dark); 'outline' = white with dark outline */
  variant?: 'box' | 'outline';
}> = ({lines, font = 'rubik', fontSize = 50, bottom = SAFE.bottom - 24, variant = 'outline'}) => {
  const frame = useCurrentFrame();
  const {height, width} = useVideoConfig();
  const theme = useTheme();
  const line = lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const inP = interpolate(frame, [line.from, line.from + 4], [0, 1], {extrapolateRight: 'clamp'});
  const outP = interpolate(frame, [line.to - 3, line.to], [1, 0], {extrapolateLeft: 'clamp'});
  const o = 3;
  const outline = [[o, 0], [-o, 0], [0, o], [0, -o], [o, o], [-o, o], [o, -o], [-o, -o]]
    .map(([a, b]) => `${a}px ${b}px 0 ${theme.ink}`)
    .join(', ');
  return (
    <AbsoluteFill>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: width - SAFE.left - SAFE.right,
          bottom: height - bottom,
          textAlign: 'center',
          fontFamily: variant === 'box' ? `var(--kit-font, ${FONTS[font]})` : FONTS[font],
          fontWeight: 800,
          fontSize,
          lineHeight: 1.18,
          color: '#FFFFFF',
          textShadow: variant === 'box' ? undefined : `${outline}, 0 4px 10px rgba(0,0,0,0.35)`,
          opacity: Math.min(inP, outP),
          transform: `translateY(${(1 - inP) * 10}px)`,
        }}
      >
        {variant === 'box' ? (
          <span style={{background: 'rgba(23,23,26,0.86)', color: '#FCFCFC', padding: '2px 22px', borderRadius: 4, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', lineHeight: 1.7, fontWeight: 600}}>
            {bidi(line.text)}
          </span>
        ) : (
          bidi(line.text)
        )}
      </div>
    </AbsoluteFill>
  );
};
