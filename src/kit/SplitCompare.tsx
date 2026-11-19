import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, pop, SETTLE} from './motion';
import {SansHeading} from './SerifTitle';
import {useUi} from './theme';

/**
 * Two things side by side (Vox: Malaria | Ebola). Vertical dark divider that grows from the
 * middle, a bold heading over each half. Put the pictures/figures for each half as children
 * (centre of the left half is x = 270, right half x = 810 in a 1080 frame).
 * `vertical`: stack top/bottom instead (better on a 9:16 frame): halves centred at y = 560 / 1360.
 */
export const SplitCompare: React.FC<{
  left: string;
  right: string;
  at?: number;
  vertical?: boolean;
  dir?: 'rtl' | 'ltr';
  headingSize?: number;
  children?: React.ReactNode;
}> = ({left, right, at = 0, vertical = false, dir = 'ltr', headingSize = 104, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const g = clamp01(pop(frame, at, fps, SETTLE));
  return (
    <>
      {vertical ? (
        <div style={{position: 'absolute', left: 540 - 440 * g, top: 960 - 4, width: 880 * g, height: 8, background: ui.slate, borderRadius: 4}} />
      ) : (
        <div style={{position: 'absolute', left: 536, top: 960 - 520 * g, width: 8, height: 1040 * g, background: ui.slate, borderRadius: 4}} />
      )}
      <SansHeading text={left} x={vertical ? 540 : 270} y={vertical ? 330 : 520} width={vertical ? 900 : 500} fontSize={headingSize} dir={dir} at={at + 4} />
      <SansHeading text={right} x={vertical ? 540 : 810} y={vertical ? 1130 : 520} width={vertical ? 900 : 500} fontSize={headingSize} dir={dir} at={at + 10} />
      {children}
    </>
  );
};
