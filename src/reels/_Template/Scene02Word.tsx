import React from 'react';
import {KeyWord, Swoosh} from '../../kit';
import type {TemplateProps} from './schema';
import {T} from './timing';

/** Scene 2: the key English word, split into its parts, one swoosh. */
export const Scene02Word: React.FC<TemplateProps> = (p) => (
  <>
    <KeyWord text={p.keyword.text} splitAt={p.keyword.splitAt} x={p.keyword.x} y={p.keyword.y} scale={p.keyword.scale} rotate={p.keyword.rotate} at={T.keyword} splitFrame={T.split} />
    <Swoosh x={p.keyword.x + 20} y={p.keyword.y + 170} at={T.swoosh} width={560} />
  </>
);
