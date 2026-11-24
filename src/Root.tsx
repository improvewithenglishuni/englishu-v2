import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/800.css';
import '@fontsource/rubik/900.css';
import '@fontsource/frank-ruhl-libre/700.css';
import '@fontsource/frank-ruhl-libre/900.css';
import {Composition, continueRender, delayRender} from 'remotion';
import {PostItReel, POSTIT_DURATION} from './postit/PostItReel';
import {EndCard, END_CARD_FRAMES} from './lib/EndCard';

// wait for the Hebrew + Latin faces before any frame is captured
const fontHandle = delayRender('fonts');
Promise.all([
  document.fonts.load('800 60px Rubik', 'אבג ABC'),
  document.fonts.load('900 150px Rubik', 'ABC'),
  document.fonts.load('700 60px Rubik', 'אבג'),
  document.fonts.load('900 90px "Frank Ruhl Libre"', 'אבג'),
  document.fonts.load('700 60px "Frank Ruhl Libre"', 'אבג'),
]).then(() => continueRender(fontHandle));

export const Root: React.FC = () => (
  <>
    <Composition id="PostItReel" component={PostItReel} durationInFrames={POSTIT_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="EndCard" component={EndCard} durationInFrames={END_CARD_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
