import {Composition} from 'remotion';
import {FortuneReel, TOTAL} from './FortuneReel';
export const Root = () => (
  <Composition id="FortuneReel" component={FortuneReel} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{voiceover: ''}} />
);
