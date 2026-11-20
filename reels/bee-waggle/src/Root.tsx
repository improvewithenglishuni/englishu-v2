import React from 'react';
import {Composition} from 'remotion';
import {BeeReel} from './BeeReel';
import {FPS, H, TOTAL_SEC, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="BeeReel" component={BeeReel} durationInFrames={Math.round(TOTAL_SEC * FPS)} fps={FPS} width={W} height={H} />
);
