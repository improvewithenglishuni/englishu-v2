import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import {END_CARD_SECONDS, EndCard, Subtitles, themes, TornWipe, World, WorldLayer} from '../../kit';
import {Scene01Arm} from './Scene01Arm';
import {Scene02Toll} from './Scene02Toll';
import {Scene03Cow} from './Scene03Cow';
import {Scene04Eradicate} from './Scene04Eradicate';
import {Scene05Outbreak} from './Scene05Outbreak';
import {Scene06Erased} from './Scene06Erased';
import {Scene07Callback} from './Scene07Callback';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

/**
 * Smallpox Reel: ERADICATE (C1) + OUTBREAK (B2). One camera push over the whole film.
 * Light world (arm, toll, cow) -> torn wipe -> dark world (mechanism) -> torn wipe -> light again.
 */
export const Smallpox: React.FC<SmallpoxProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} push={[1, 1.06]} hud={<Subtitles lines={props.subtitles} />}>
        <WorldLayer variant="light">
          <Scene01Arm {...props} />
          <Scene02Toll {...props} />
          <Scene03Cow {...props} />
        </WorldLayer>
        <TornWipe at={T.wipe1} duration={24} angle={-35} seed={6}>
          <WorldLayer variant="dark">
            <Scene04Eradicate {...props} />
            <Scene05Outbreak {...props} />
            <Scene06Erased {...props} />
          </WorldLayer>
        </TornWipe>
        <TornWipe at={T.wipe2} duration={24} angle={28} seed={8}>
          <WorldLayer variant="light">
            <Scene07Callback {...props} />
          </WorldLayer>
        </TornWipe>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
