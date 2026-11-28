import React from 'react';
import {Composition} from 'remotion';
import {ApartmentMockup, TOTAL} from './Reel';
import {ApartmentMockupV2, TOTAL_V2} from './ReelV2';
import {ApartmentMockupV3, TOTAL_V3} from './ReelV3';
import {ApartmentMockupV4, TOTAL_V4} from './ReelV4';

export const Root: React.FC = () => (
  <>
    <Composition id="ApartmentMockupV4" component={ApartmentMockupV4} durationInFrames={TOTAL_V4} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV3" component={ApartmentMockupV3} durationInFrames={TOTAL_V3} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV2" component={ApartmentMockupV2} durationInFrames={TOTAL_V2} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockup" component={ApartmentMockup} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
  </>
);
