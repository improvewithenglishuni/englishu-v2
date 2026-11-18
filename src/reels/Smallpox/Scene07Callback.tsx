import React from 'react';
import {PaperLabel} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import {Arm, Strip} from './paper';

/** Scene 8 (light world again): back to the scar on the arm, now a victory mark. */
export const Scene07Callback: React.FC<SmallpoxProps> = (p) => (
  <>
    <Strip from={T.wipe2 + 10} to={T.end + 60} x={1220} y={1250} rotate={196} length={1500} width={190} taper={1.25} seed={21} texture="plate_pale.jpg" />
    <Arm x={p.arm.x} y={p.arm.y} scale={p.arm.scale} rotate={p.arm.rotate + 2} at={T.arm2} pulseAt={T.arm2 + 14} />
    <PaperLabel text={p.closeLabel.text} tone="accent" fontSize={88} x={p.closeLabel.x} y={p.closeLabel.y} scale={p.closeLabel.scale} rotate={p.closeLabel.rotate} at={T.closeLabel} seed={14} />
  </>
);
