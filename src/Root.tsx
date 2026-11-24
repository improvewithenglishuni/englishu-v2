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
        voiceover: 'assets/smallpox_audio_v38.wav',
        subtitles: [
          {text: 'שמתם לב שלסבא או סבתא יש צלקת על הזרוע?', from: s(0.3), to: s(3.7)},
          {text: 'זה כנראה בגלל שחיסנו אותם נגד מחלה שנקראת smallpox', from: s(3.9), to: s(8.1)},
          {text: 'מחלה שהרגה 300 מיליון איש במאה ה-20', from: s(8.3), to: s(11.7)},
          {text: 'והיום יש אפס חולים בעולם', from: s(11.9), to: s(14.9)},
          {text: 'ב-1796 הרופא ג׳נר שם לב לתופעה מעניינת', from: s(15.2), to: s(19.45)},
          {text: 'חולבות שנדבקו במחלה קלה של פרות לא נדבקו ב-smallpox', from: s(19.55), to: s(24.1)},
          {text: 'ומכאן הגיע המילה vaccination, מהלטינית "פרה"', from: s(24.35), to: s(28.3)},
          {text: 'In 1967, the world set out to eradicate smallpox, for good.', from: s(28.6), to: s(34.1)},
          {text: 'אבל לא חיסנו את כולם בבת אחת', from: s(34.4), to: s(36.9)},
          {text: 'כשפרץ outbreak,', from: s(37.0), to: s(38.5)},
          {text: 'חיסנו את כל מי שהיה מסביב', from: s(38.55), to: s(40.95)},
          {text: 'מעגל אחרי מעגל, עד אפס חולים', from: s(41.0), to: s(43.9)},
          {text: 'אחרי אלפי שנים שבהן פגעה המחלה כמעט בכל העולם', from: s(44.3), to: s(48.0)},
          {text: 'המקרה הטבעי האחרון היה בסומליה', from: s(48.2), to: s(50.8)},
          {text: 'ב-1980 הוכרז סופית,', from: s(50.95), to: s(53.2)},
          {text: 'המחלה נעלמה לחלוטין', from: s(53.25), to: s(55.6)},
          {text: 'אז הצלקת של סבתא היא בעצם סימן של ניצחון', from: s(55.9), to: s(59.9)},
        ],
        endCard: false,
      }}
    />
  </>
);
