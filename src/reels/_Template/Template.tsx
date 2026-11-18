import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import {END_CARD_SECONDS, EndCard, Subtitles, themes, World, WorldLayer} from '../../kit';
import {Scene01Hook} from './Scene01Hook';
import {Scene02Word} from './Scene02Word';
import type {TemplateProps} from './schema';

/**
 * Copy this folder to start a new Reel (see README). One world, one camera push, scenes glued
 * on top. Wrap later scenes in <TornWipe> + <WorldLayer variant="dark"> to change worlds.
 */
export const Template: React.FC<TemplateProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} hud={<Subtitles lines={props.subtitles} />}>
        <WorldLayer variant="light">
          <Scene01Hook {...props} />
          <Scene02Word {...props} />
        </WorldLayer>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
