import React from 'react';
import {KeyWord, PaperLabel} from '../../kit';
import {Strip} from './paper';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

/** Scene 7 (dark world): 1980, declared over, the name crossed out. */
export const Scene06Erased: React.FC<SmallpoxProps> = (p) => (
  <>
    <Strip from={T.ringsOut} to={T.s7Out} x={-100} y={1170} rotate={-6} length={1400} width={180} taper={1.2} seed={15} texture="plate_pale.jpg" />
    <KeyWord text={p.year1980.text} accent="none" x={p.year1980.x} y={p.year1980.y} scale={p.year1980.scale} rotate={p.year1980.rotate} at={T.y1980} exitAt={T.s7Out} fontSize={330} seed={6} />
    <PaperLabel text="הוכרז: נגמר" fontSize={92} x={540} y={1030} rotate={-3} at={T.declared} exitAt={T.s7Out} seed={10} />
    <PaperLabel text="אבעבועות שחורות" fontSize={76} x={520} y={1250} rotate={2} at={T.strikeLabel} strike={T.strike} exitAt={T.s7Out} seed={12} />
  </>
);
