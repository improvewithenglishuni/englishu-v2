import { Composition } from 'remotion';
import { OtterReel, TOTAL } from './OtterReel';
export const Root = () => (
  <Composition id="OtterReel" component={OtterReel} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
