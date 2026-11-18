import React from 'react';
import {Subtitles, themes, TornWipe, World, WorldLayer} from '../../kit';
import {SceneIce} from './SceneIce';
import {SceneSky} from './SceneSky';
import type {TestLookProps} from './schema';
import {T} from './timing';

/** 7 s look test: light world -> torn wipe -> dark world, one camera push throughout. */
export const TestLook: React.FC<TestLookProps> = (props) => {
  const theme = themes[props.theme];
  return (
    <World
      theme={theme}
      push={[1, 1.06]}
      hud={<Subtitles lines={[{text: props.subtitle, from: T.subtitleIn, to: T.subtitleOut}]} />}
    >
      <WorldLayer variant="light">
        <SceneSky {...props} />
      </WorldLayer>
      <TornWipe at={T.wipe} duration={T.wipeDur} angle={-35} seed={6}>
        <WorldLayer variant="dark">
          <SceneIce {...props} />
        </WorldLayer>
      </TornWipe>
    </World>
  );
};
