import React from 'react';
import {PaperLabel} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import {Cow, Strip} from './paper';

/** Scene 4 (light world): 1796, the cow, the first vaccine. */
export const Scene03Cow: React.FC<SmallpoxProps> = (p) => (
  <>
    <Strip from={T.zeroOut} to={T.cowOut} x={1220} y={1200} rotate={192} length={1500} width={180} taper={1.2} seed={13} texture="plate_pale.jpg" />
    <PaperLabel text={p.year1796.text} font="anton" dir="ltr" fontSize={150} x={p.year1796.x} y={p.year1796.y} scale={p.year1796.scale} rotate={p.year1796.rotate} at={T.year1796} exitAt={T.cowOut} seed={6} />
    <Cow x={p.cow.x} y={p.cow.y} scale={p.cow.scale} rotate={p.cow.rotate} at={T.cow} exitAt={T.cowOut} />
    <PaperLabel text="החיסון הראשון" fontSize={84} x={560} y={1330} rotate={3} at={T.firstVaccine} exitAt={T.cowOut} seed={9} />
  </>
);
