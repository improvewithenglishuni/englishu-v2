import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SCENES, sec} from './theme';
import {loadFonts} from './fonts';
import {Grain, Plate} from './components/paper';
import {Subtitles} from './components/props';
import {S1Hook} from './scenes/S1Hook';
import {S2Address, S3Diagram} from './scenes/S2S3';
import {S4Convey, S5Dark} from './scenes/S4S5';
import {EndCard, S6Decipher, S7Callback} from './scenes/S6S7End';

loadFonts();

const scene = (key: keyof typeof SCENES, C: React.FC<{dur: number}>) => {
  const [a, b] = SCENES[key];
  const dur = sec(b) - sec(a);
  return (
    <Sequence key={key} from={sec(a)} durationInFrames={dur} name={key}>
      <C dur={dur} />
    </Sequence>
  );
};

export const BeeReel: React.FC = () => {
  const f = useCurrentFrame();
  // the plate dims into the hive for beat 5 (the one dark variant), then comes back
  const dim = interpolate(f, [sec(16.8), sec(17.2), sec(23.8), sec(24.2)], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill>
      <Plate dim={dim} />
      {scene('s1', S1Hook)}
      {scene('s2', S2Address)}
      {scene('s3', S3Diagram)}
      {scene('s4', S4Convey)}
      {scene('s5', S5Dark)}
      {scene('s6', S6Decipher)}
      {scene('s7', S7Callback)}
      <Sequence from={0} durationInFrames={sec(SCENES.end[0])}>
        <Subtitles />
      </Sequence>
      {scene('end', EndCard)}
      <Grain />
      <Audio src={staticFile('audio/bed_sfx.wav')} />
    </AbsoluteFill>
  );
};
