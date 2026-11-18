import React from 'react';
import {Arrows, PaperLabel} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import {Arm, Strip} from './paper';

/** Scene 1 (light world): the scar on the arm + the hook label. */
export const Scene01Arm: React.FC<SmallpoxProps> = (p) => (
  <>
    <Strip from={0} to={T.armOut} x={-140} y={1250} rotate={-15} length={1500} width={190} taper={1.25} seed={4} texture="plate_pale.jpg" />
    <Arm x={p.arm.x} y={p.arm.y} scale={p.arm.scale} rotate={p.arm.rotate} at={T.arm} exitAt={T.armOut} pulseAt={T.scarArrow + 6} />
    <Arrows arrows={[{x1: p.arm.x - 400 * p.arm.scale, y1: p.arm.y - 400 * p.arm.scale, x2: p.arm.x - 215 * p.arm.scale, y2: p.arm.y - 165 * p.arm.scale, bend: 0.2}]} at={T.scarArrow} duration={12} strokeWidth={9} exitAt={T.armOut} />
    <PaperLabel text={p.hook.text} fontSize={86} x={p.hook.x} y={p.hook.y} scale={p.hook.scale} rotate={p.hook.rotate} at={T.hook} exitAt={T.hookOut} />
  </>
);
