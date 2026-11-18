import React from 'react';
import {KeyWord, PaperLabel, Swoosh} from '../../kit';
import {Strip, Until} from './paper';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

/** Scene 5 (dark world): 1967 and the key word ERADICATE. */
export const Scene04Eradicate: React.FC<SmallpoxProps> = (p) => (
  <>
    <Strip from={T.wipe1 + 10} to={T.eradOut} x={-120} y={1250} rotate={-20} length={1500} width={190} taper={1.3} seed={9} texture="plate_pale.jpg" />
    <PaperLabel text={p.year1967.text} font="anton" dir="ltr" fontSize={140} x={p.year1967.x} y={p.year1967.y} scale={p.year1967.scale} rotate={p.year1967.rotate} at={T.year1967} exitAt={T.eradOut} seed={4} />
    <KeyWord text={p.eradicate.text} splitAt={p.eradicate.splitAt} x={p.eradicate.x} y={p.eradicate.y} scale={p.eradicate.scale} rotate={p.eradicate.rotate} at={T.keyword} splitFrame={T.split} gap={40} exitAt={T.eradOut} fontSize={170} seed={5} />
    <Until to={T.eradOut + 6}>
      <Swoosh x={p.eradicate.x + 10} y={p.eradicate.y + 150} at={T.swoosh} width={640} />
    </Until>
    <PaperLabel text={p.meaning.text} font="rubik" dir="ltr" fontSize={72} x={p.meaning.x} y={p.meaning.y} scale={p.meaning.scale} rotate={p.meaning.rotate} at={T.meaning} exitAt={T.eradOut} seed={7} />
  </>
);
