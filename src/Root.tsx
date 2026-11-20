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
        voiceover: '',
        subtitles: [
          {text: 'הצלקת על הזרוע של סבתא — סימן של חיסון', from: s(0), to: s(2.2)},
          {text: 'חיסון נגד מחלה כזו', from: s(2.2), to: s(3.7)},
          {text: 'שהרגה 300 מיליון במאה ה-20', from: s(3.7), to: s(5.2)},
          {text: 'והיום? אפס חולים בעולם', from: s(5.3), to: s(7.3)},
          {text: 'ב-1796 הרופא ג׳נר שם לב:', from: s(7.4), to: s(10)},
          {text: 'חולבות שחלו באבעבועות פרות — לא חלו בשחורות', from: s(10), to: s(12.2)},
          {text: 'vaccination — מהלטינית "פרה"', from: s(12.2), to: s(15.3)},
          {text: 'ב-1967 ארגון הבריאות העולמי החל מבצע עולמי:', from: s(15.4), to: s(17.2)},
          {text: 'They set out to eradicate smallpox, for good.', from: s(17.2), to: s(19.7)},
          {text: 'לא מחסנים את כולם.', from: s(19.8), to: s(21.6)},
          {text: 'כשפרץ outbreak — מחסנים את כל מי שסביב', from: s(21.6), to: s(23.7)},
          {text: 'מעגל אחרי מעגל — עד אפס', from: s(23.8), to: s(26.6)},
          {text: 'במשך אלפי שנים היא פגעה כמעט בכל העולם', from: s(26.7), to: s(28.4)},
    {text: 'המקרה הטבעי האחרון — בסומליה', from: s(28.4), to: s(29.5)},
    {text: 'ב-1980 הוכרז: האבעבועות נעלמו', from: s(29.5), to: s(30.9)},
          {text: 'בפעם הבאה שתראו צלקת כזו — זה ניצחון', from: s(30.9), to: s(32.2)},
        ],
        endCard: false,
      }}
    />
  </>
);
