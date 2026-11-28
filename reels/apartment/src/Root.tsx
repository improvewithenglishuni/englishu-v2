import React from 'react';
import {Composition} from 'remotion';
import {ApartmentMockup, TOTAL} from './Reel';
import {ApartmentMockupV2, TOTAL_V2} from './ReelV2';
import {ApartmentMockupV3, TOTAL_V3} from './ReelV3';
import {ApartmentMockupV4, TOTAL_V4} from './ReelV4';
import {ApartmentMockupV5, TOTAL_V5} from './ReelV5';
import {ApartmentMockupV6, TOTAL_V6} from './ReelV6';
import {ApartmentMockupV7, TOTAL_V7} from './ReelV7';
import {ApartmentMockupV8, TOTAL_V8} from './ReelV8';
import {ApartmentMockupV9, TOTAL_V9} from './ReelV9';
import {ApartmentMockupV10, TOTAL_V10} from './ReelV10';
import {ApartmentMockupV11, TOTAL_V11} from './ReelV11';

export const Root: React.FC = () => (
  <>
    <Composition id="ApartmentMockupV11" component={ApartmentMockupV11} durationInFrames={TOTAL_V11} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV10" component={ApartmentMockupV10} durationInFrames={TOTAL_V10} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV9" component={ApartmentMockupV9} durationInFrames={TOTAL_V9} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV8" component={ApartmentMockupV8} durationInFrames={TOTAL_V8} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV7" component={ApartmentMockupV7} durationInFrames={TOTAL_V7} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV6" component={ApartmentMockupV6} durationInFrames={TOTAL_V6} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV5" component={ApartmentMockupV5} durationInFrames={TOTAL_V5} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV4" component={ApartmentMockupV4} durationInFrames={TOTAL_V4} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV3" component={ApartmentMockupV3} durationInFrames={TOTAL_V3} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockupV2" component={ApartmentMockupV2} durationInFrames={TOTAL_V2} fps={30} width={1080} height={1920} />
    <Composition id="ApartmentMockup" component={ApartmentMockup} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
  </>
);
