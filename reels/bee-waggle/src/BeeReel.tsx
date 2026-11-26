import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SCENES, sec} from './theme';
import {useFonts} from './fonts';
import {Grain, Plate, PlateDecor} from './components/paper';
import {Subtitles} from './components/props';
import {S1Hook} from './scenes/S1Hook';
import {S2Address, S3Diagram} from './scenes/S2S3';
import {S4Convey, S5Dark} from './scenes/S4S5';
import {EndCard, S6Decipher} from './scenes/S6S7End';
import {S7Waze, S8Robot} from './scenes/S8S7';


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
  useFonts();
  const f = useCurrentFrame();
  // the plate dims into the hive for beat 5 (the one dark variant), then comes back
  const [d0, d1] = SCENES.s5;
  const dim = interpolate(f, [sec(d0 - 0.2), sec(d0 + 0.2), sec(d1 - 0.2), sec(d1 + 0.2)], [0, 0.9, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="rough-type">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      </svg>
      <Plate dim={dim} />
      <PlateDecor />
      {/* on screen: s1, s4, s2, s3, s5, s6, s8, s7 (scene keys are names, see theme.ts) */}
      {scene('s1', S1Hook)}
      {scene('s4', S4Convey)}
      {scene('s2', S2Address)}
      {scene('s3', S3Diagram)}
      {scene('s5', S5Dark)}
      {scene('s6', S6Decipher)}
      {scene('s8', S8Robot)}
      {scene('s7', S7Waze)}
      <Sequence from={0} durationInFrames={sec(SCENES.end[0])}>
        <Subtitles />
      </Sequence>
      {scene('end', EndCard)}
      <Grain />
      <Audio src={staticFile('audio/bed_sfx.wav')} volume={0.6} />
      <Audio src={staticFile('audio/voice.wav')} />
    </AbsoluteFill>
  );
};
