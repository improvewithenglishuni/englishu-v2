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
        theme: 'smallpox',
        voiceover: '',
        arm: {x: 520, y: 1010, scale: 0.92, rotate: -3},
        hook: {x: 520, y: 400, scale: 1, rotate: -3, text: 'הצלקת של סבא וסבתא'},
        toll: {x: 540, y: 860, scale: 1, rotate: -2, text: '300M'},
        zero: {x: 540, y: 960, scale: 1, rotate: 0, text: '0'},
        cow: {x: 500, y: 960, scale: 1, rotate: -3},
        year1796: {x: 540, y: 520, scale: 1, rotate: -3, text: '1796'},
        year1967: {x: 540, y: 470, scale: 1, rotate: -3, text: '1967'},
        eradicate: {x: 540, y: 880, scale: 1, rotate: 0, text: 'ERADICATE', splitAt: 1},
        meaning: {x: 540, y: 1180, scale: 1, rotate: 2, text: 'eradicate = למגר / לשרש'},
        outbreakLabel: {x: 540, y: 380, scale: 1, rotate: -2, text: 'outbreak = התפרצות'},
        rings: {x: 540, y: 960, scale: 1, rotate: 0},
        year1980: {x: 540, y: 740, scale: 1, rotate: -2, text: '1980'},
        closeLabel: {x: 520, y: 390, scale: 1, rotate: -3, text: 'סימן לניצחון'},
        subtitles: [
          {text: 'תסתכלו על הזרוע של סבא או סבתא. רואים צלקת קטנה ועגולה?', from: s(0.0), to: s(3.4)},
          {text: 'זה הסימן של מחלה שהרגה כשלוש מאות מיליון איש במאה ה-20.', from: s(3.4), to: s(6.6)},
          {text: 'והיום? אפס חולים בעולם.', from: s(6.6), to: s(8.4)},
          {text: 'ב-1796 רופא שם לב שחולבות שנדבקו מפרות, לא חלו בה.', from: s(8.4), to: s(10.9)},
          {text: 'ככה נולד החיסון הראשון.', from: s(10.9), to: s(13.0)},
          {text: 'ב-1967 העולם החליט:', from: s(13.0), to: s(15.0)},
          {text: 'They set out to eradicate smallpox, for good.', from: s(15.0), to: s(17.6)},
          {text: 'לא מחסנים את כולם. כשהתפרץ outbreak,', from: s(17.6), to: s(21.6)},
          {text: 'חיסנו את כל מי שסביב החולים. מעגל אחרי מעגל.', from: s(21.6), to: s(25.0)},
          {text: 'ב-1980 הוכרז: נגמר. המחלה היחידה שהעולם מחק לגמרי.', from: s(25.0), to: s(29.8)},
          {text: 'אז בפעם הבאה שתראו צלקת כזו... תזכרו: זה סימן לניצחון.', from: s(29.8), to: s(34.6)},
        ],
        endCard: true,
      }}
    />
  </>
);
