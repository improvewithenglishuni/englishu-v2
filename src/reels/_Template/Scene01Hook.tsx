import React from 'react';
import {PaperCloud, PaperLabel} from '../../kit';
import type {TemplateProps} from './schema';
import {T} from './timing';

/** Scene 1: the hook label on the world. Add cutouts / props for the topic here. */
export const Scene01Hook: React.FC<TemplateProps> = (p) => (
  <>
    <PaperCloud variant={0} x={200} y={260} scale={0.6} at={0} />
    <PaperCloud variant={3} x={860} y={1250} scale={0.7} at={5} drift={-5} />
    <PaperLabel text={p.hook.text} x={p.hook.x} y={p.hook.y} scale={p.hook.scale} rotate={p.hook.rotate} at={T.hook} exitAt={T.hookOut} />
  </>
);
