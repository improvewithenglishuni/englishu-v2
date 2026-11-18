import React from 'react';
import {Composition} from 'remotion';
import {TestLook} from './reels/TestLook/TestLook';
import {testLookSchema} from './reels/TestLook/schema';
import {Template} from './reels/_Template/Template';
import {templateSchema} from './reels/_Template/schema';

// defaultProps stay inline here so Remotion Studio can save tweaked positions back into this file.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TestLook"
      component={TestLook}
      durationInFrames={210}
      fps={30}
      width={1080}
      height={1920}
      schema={testLookSchema}
      defaultProps={{
        theme: 'plane',
        plane: {x: 700, y: 900, scale: 0.6, rotate: -56, flightAngle: -34},
        contrail: {x: 0, y: 0, scale: 0.85, rotate: 0},
        clouds: [
          {x: 190, y: 250, scale: 0.62, rotate: 0, variant: 0},
          {x: 900, y: 600, scale: 0.55, rotate: 0, variant: 1},
          {x: 760, y: 1360, scale: 0.75, rotate: 0, variant: 2},
        ],
        label: {x: 520, y: 380, scale: 1, rotate: -3, text: 'זה לא עשן.'},
        keyword: {x: 540, y: 400, scale: 1, rotate: 0, text: 'CONTRAIL', splitAt: 3},
        swoosh: {x: 560, y: 585, scale: 1, rotate: -3},
        crystals: {x: 540, y: 880, scale: 1, rotate: 0},
        arrows: {x: 0, y: 0, scale: 1, rotate: 0},
        disperse: {x: 520, y: 880, scale: 0.86, rotate: 0, text: 'DISPERSE'},
        subtitle: 'לפס הלבן הזה קוראים contrail',
      }}
    />
    <Composition
      id="Template"
      component={Template}
      durationInFrames={30 * 12}
      fps={30}
      width={1080}
      height={1920}
      schema={templateSchema}
      defaultProps={{
        theme: 'plane',
        voiceover: '',
        hook: {x: 520, y: 380, scale: 1, rotate: -3, text: 'כותרת הוק'},
        keyword: {x: 540, y: 420, scale: 1, rotate: 0, text: 'KEYWORD', splitAt: 3},
        subtitles: [
          {text: 'שורת כתובית ראשונה', from: 10, to: 100},
          {text: 'ושורה שנייה עם English בפנים', from: 100, to: 200},
        ],
        endCard: false,
      }}
    />
  </>
);
