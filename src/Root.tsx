import React from 'react';
import {Composition} from 'remotion';
import {TestLook} from './reels/TestLook/TestLook';
import {testLookSchema} from './reels/TestLook/schema';
import {Template} from './reels/_Template/Template';
import {templateSchema} from './reels/_Template/schema';
import {Smallpox} from './reels/Smallpox/Smallpox';
import {smallpoxSchema} from './reels/Smallpox/schema';
import {TOTAL_FRAMES} from './reels/Smallpox/timing';

const s = (sec: number) => Math.round(sec * 30);

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
    <Composition
      id="Smallpox"
      component={Smallpox}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
      schema={smallpoxSchema}
      defaultProps={{
        theme: 'vox',
        voiceover: 'assets/smallpox_audio_v41.wav',
        subtitles: [
          {text: 'שמתם לב שלסבא או סבתא יש צלקת על הזרוע?', from: s(0.15), to: s(3.3)},
          {text: 'זה כנראה בגלל שחיסנו אותם נגד מחלה שנקראת smallpox', from: s(3.4), to: s(7.55)},
          {text: 'מחלה שהרגה 300 מיליון איש במאה ה-20', from: s(7.6), to: s(10.98)},
          {text: 'והיום יש אפס חולים בעולם', from: s(11.1), to: s(13.95)},
          {text: 'ב-1796 הרופא ג׳נר שם לב לתופעה מעניינת', from: s(14.2), to: s(18.5)},
          {text: 'חולבות שנדבקו במחלה קלה של פרות לא נדבקו ב-smallpox', from: s(18.5), to: s(22.9)},
          {text: 'ומכאן הגיע המילה vaccination, מהלטינית "פרה"', from: s(23.0), to: s(26.9)},
          {text: 'In 1967, the world set out to eradicate smallpox, for good.', from: s(27.1), to: s(32.5)},
          {text: 'אבל לא חיסנו את כולם בבת אחת', from: s(32.7), to: s(35.0)},
          {text: 'כשפרץ outbreak,', from: s(35.08), to: s(36.6)},
          {text: 'חיסנו את כל מי שהיה מסביב', from: s(36.62), to: s(38.95)},
          {text: 'מעגל אחרי מעגל, עד אפס חולים', from: s(38.95), to: s(41.7)},
          {text: 'אחרי אלפי שנים שבהן פגעה המחלה כמעט בכל העולם', from: s(41.95), to: s(45.55)},
          {text: 'המקרה הטבעי האחרון היה בסומליה', from: s(45.6), to: s(48.0)},
          {text: 'ב-1980 הוכרז סופית,', from: s(48.05), to: s(50.35)},
          {text: 'המחלה נעלמה לחלוטין', from: s(50.4), to: s(52.5)},
          {text: 'אז הצלקת של סבתא היא בעצם סימן של ניצחון', from: s(52.9), to: s(56.85)},
        ],
        endCard: false,
      }}
    />
  </>
);
