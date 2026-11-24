// Fortune cookies Reel (ATTRIBUTE, MISCONCEPTION) — rebuild of fortune-cookie-mockup-v1
// with real photos, real footage, sound and the end card.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arc, C, FONT, Grain, KeyWord, Label, Plate, Sticker, Subtitle, clamp, lerp, prog, qPoint, usePop} from './kit';
import {BaseMap, MAP, MapArrow, MapLabel, chinaProj, pacificProj} from './maps';

// ---- Timeline (frames @30fps), taken from mock-up v1. Retime to the voiceover.
// v2: the hook is 1 s longer (restaurant + thinking time before the cookie), D shifts everything after it.
const D = 30;
export const SCENES = {
  hook: [0, 96 + D],
  china: [96 + D, 180 + D],
  y1878: [180 + D, 285 + D],
  attribute: [285 + D, 405 + D],
  garden: [405 + D, 477 + D],
  voyage: [477 + D, 540 + D],
  war: [540 + D, 705 + D],
  misconception: [705 + D, 840 + D],
  crack: [840 + D, 936 + D],
  slip: [936 + D, 1035 + D],
  end: [1035 + D, 1116 + D],
} as const;
export const TOTAL = 1116 + D; // 38.2 s

// ---- Recording script = subtitles (from the mock-up, unchanged)
export const LINES: {from: number; to: number; text: string; ltr?: boolean; hl?: string}[] = [
  {from: 0, to: 96 + D, text: 'מה הדבר הכי "סיני" במסעדה סינית, שבכלל לא סיני?'},
  {from: 96 + D, to: 180 + D, text: 'עוגיות מזל, fortune cookies. בסין כמעט לא מכירים אותן.'},
  {from: 180 + D, to: 285 + D, text: 'זה התחיל ביפן, לפני יותר ממאה שנה: קרקרים עם פתק בפנים.'},
  {from: 285 + D, to: 405 + D, text: 'Historians attribute the fortune cookie to Japanese immigrants.', ltr: true, hl: 'attribute'},
  {from: 405 + D, to: 540 + D, text: 'בסן פרנסיסקו הגישו אותה לצד תה, בגן תה יפני.'},
  {from: 540 + D, to: 705 + D, text: 'ואז באה מלחמת העולם השנייה: מאפיות יפניות נסגרו, ויצרנים סיניים כנראה השתלטו על השוק.'},
  {from: 705 + D, to: 840 + D, text: "It's a common misconception that the fortune cookie is Chinese.", ltr: true, hl: 'misconception'},
  {from: 840 + D, to: 936 + D, text: 'שלחו את זה למי שבטוח שהוא מבין באוכל סיני.'},
  {from: 936 + D, to: 1035 + D, text: 'ותשאלו אותו: מאיפה העוגייה?'},
];

// Full-bleed real photo: the ONLY kind of image that gets a slow zoom (about 6% over the scene).
const FullPhoto: React.FC<{src: string; dur: number}> = ({src, dur}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], [1, 1.06], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.dark}}>
      <Img src={staticFile(`img/${src}`)} style={{width: 1080, height: 1920, transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, rgba(20,20,30,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

// ======================================================================
// 1. HOOK: a typical Chinese restaurant while the question lands; a beat to think; then the cookie
const COOKIE_IN = 66; // ~2.2 s of restaurant alone (question + thinking time)
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dim = prog(f, COOKIE_IN - 6, COOKIE_IN + 8);
  return (
    <AbsoluteFill>
      <FullPhoto src="full_restaurant.jpg" dur={SCENES.hook[1]} />
      <AbsoluteFill style={{background: `rgba(25,22,28,${0.38 * dim})`}} />
      {f >= COOKIE_IN - 2 && <Sticker src="broken.png" x={540} y={820} w={860} rot={-3} delay={COOKIE_IN} />}
    </AbsoluteFill>
  );
};

// 2. CHINA: cookies drop onto China and bounce off it ("barely known there")
const China: React.FC = () => {
  const f = useCurrentFrame();
  const proj = chinaProj();
  const c = proj([104, 34]) as number[];
  const lab = usePop(4);
  const cookies = [
    {d: 14, x0: c[0] - 140, xEnd: -220, r: -260},
    {d: 22, x0: c[0] + 90, xEnd: 1300, r: 300},
    {d: 30, x0: c[0] - 20, xEnd: -260, r: -320},
  ];
  return (
    <AbsoluteFill>
      <BaseMap proj={proj} fills={{'156': MAP.red}} />
      <MapLabel x={c[0]} y={c[1] + 40} text="סין" size={120} o={Math.min(1, lab * 1.5)} />
      {cookies.map((k, i) => {
        const t = f - k.d;
        if (t < 0) return null;
        // fall onto China, bounce, then fly off
        const fall = Math.min(1, t / 10);
        const y0 = c[1] - 40;
        const y = t < 10 ? -200 + (y0 + 200) * fall * fall : y0 - 900 * ((t - 10) / 30) + 1300 * ((t - 10) / 30) ** 2;
        const x = t < 10 ? k.x0 : k.x0 + (k.xEnd - k.x0) * Math.min(1, (t - 10) / 32);
        const rot = t < 10 ? 0 : (k.r * (t - 10)) / 32;
        return (
          <Img
            key={i}
            src={staticFile('img/cookie.png')}
            style={{position: 'absolute', left: x - 120, top: y - 115, width: 240, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.3))'}}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 3. 1878: the Japanese print + timeline that starts from the right
const Y1878: React.FC = () => {
  const f = useCurrentFrame();
  const line = prog(f, 14, 40);
  const pop = usePop(26);
  return (
    <AbsoluteFill>
      <Plate dark />
      <Sticker src="print1878.png" x={540} y={560} w={960} rot={-1.5} delay={0} />
      {/* timeline: right to left */}
      <div style={{position: 'absolute', left: 120 + 840 * (1 - line), top: 1150, width: 840 * line, height: 6, background: C.paper, borderRadius: 3}} />
      <div style={{position: 'absolute', left: 900 - 22, top: 1131, width: 44, height: 44, borderRadius: '50%', background: C.coral, transform: `scale(${pop})`}} />
      <div style={{position: 'absolute', left: 120, top: 1180, fontFamily: FONT, fontWeight: 500, fontSize: 40, color: '#C9CCDA', opacity: line}}>
        היום
      </div>
      <KeyWord text="1878" size={140} style={{position: 'absolute', right: 110, top: 960, transform: `scale(${pop})`, transformOrigin: 'right bottom'}} />
      <Sticker src="tsujiura.png" x={860} y={240} w={180} rot={7} delay={52} />
    </AbsoluteFill>
  );
};

// 4. ATTRIBUTE: the word rides a tag from the cookie to Hagiwara's press and pins the origin on it
const Attribute: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  // the tag rides the arc from the cookie, then hangs off the press photo on a red string
  const anchor = [205, 588]; // pin on the photo's lower edge
  const hole = [236, 800]; // where the tag's hole ends up (hangs below the pin)
  const p0 = [810, 1130];
  const p1 = [900, 560];
  const ride = lerp(f, 14, 40, 0, 1);
  const pt = qPoint(ride, p0, p1, hole);
  const landed = f >= 40;
  const t = (f - 40) / fps;
  const swing = landed ? 9 * Math.exp(-2.2 * t) * Math.sin(t * 7.5) : 0;
  const tie = prog(f, 38, 46);
  const gloss = usePop(52);
  const rot = landed ? 13 + swing : -4 + 8 * Math.sin(ride * 6); // at rest the free end droops
  const sc = 0.5 + 0.5 * Math.min(1, ride * 2);
  // string: from the pin down to the tag's hole, sagging a little
  const sx = anchor[0], sy = anchor[1];
  const ex = sx + (pt.x - sx) * tie, ey = sy + (pt.y - sy) * tie;
  const string = `M ${sx} ${sy} Q ${(sx + ex) / 2 - 30} ${(sy + ey) / 2 + 20} ${ex} ${ey}`;
  return (
    <AbsoluteFill>
      <Plate />
      <Sticker src="press.png" x={470} y={420} w={840} rot={-1.5} delay={0} />
      <Label x={470} y={180} size={44} delay={4} rot={-2}>
        {'מקוטו הגיווארה'}
      </Label>
      <Sticker src="cookie.png" x={810} y={1210} w={310} rot={8} delay={6} />
      <div style={{opacity: 1 - prog(f, 42, 54)}}>
        <Arc d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${hole[0]} ${hole[1]}`} p={prog(f, 10, 38)} />
      </div>
      {/* pin on the photo */}
      <div style={{position: 'absolute', left: sx - 13, top: sy - 13, width: 26, height: 26, borderRadius: '50%', background: C.stamp, border: '4px solid #fbfbf8', boxShadow: '0 3px 6px rgba(0,0,0,0.35)', opacity: tie > 0 ? 1 : 0}} />
      {/* red string */}
      {tie > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <path d={string} stroke="rgba(0,0,0,0.18)" strokeWidth={6} fill="none" transform="translate(3,5)" />
          <path d={string} stroke={C.stamp} strokeWidth={5} fill="none" strokeLinecap="round" />
        </svg>
      )}
      {/* the word on a price tag; its hole is the transform origin so it swings from the string */}
      <div
        style={{
          position: 'absolute',
          left: pt.x - 45,
          top: pt.y,
          transformOrigin: '45px 0px',
          transform: `translateY(-50%) rotate(${rot}deg) scale(${sc})`,
          opacity: f < 12 ? 0 : 1,
          filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.28))',
        }}
      >
        {/* manila shipping tag: clipped corners at the hole end, red reinforced eyelet */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(170deg, #EBDCB2 0%, #E2CF9C 55%, #D8C38C 100%)',
            padding: '22px 40px 20px 96px',
            clipPath: 'polygon(0 22%, 9% 0, 100% 0, 100% 100%, 9% 100%, 0 78%)',
          }}
        >
          <div style={{position: 'absolute', left: 22, top: '50%', width: 46, height: 46, marginTop: -23, borderRadius: '50%', background: '#B7322B', boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.3)'}} />
          <div style={{position: 'absolute', left: 36, top: '50%', width: 18, height: 18, marginTop: -9, borderRadius: '50%', background: C.light, boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.35)'}} />
          <KeyWord text="ATTRIBUTE" size={96} color="#2F2A22" style={{WebkitTextStroke: '0px', textShadow: 'none', letterSpacing: 2}} />
        </div>
        {/* loose end of the string before it is tied */}
        {!landed && f >= 12 && (
          <svg width={80} height={80} style={{position: 'absolute', left: 0, top: '50%', overflow: 'visible'}}>
            <path d="M 45 0 q -30 10 -40 40" stroke={C.stamp} strokeWidth={5} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: 80,
          width: 520,
          top: 1010,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 92,
          color: C.charcoal,
          transform: `scale(${gloss})`,
          opacity: Math.min(1, gloss * 2),
        }}
      >
        לייחס
      </div>
    </AbsoluteFill>
  );
};

// 5. GARDEN: real footage of the Japanese Tea Garden gate, Golden Gate Park
const Garden: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 72], [1, 1.06], clamp);
  return (
    <AbsoluteFill style={{background: C.dark}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>
        <OffthreadVideo src={staticFile('img/teagarden.mp4')} muted style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(20,20,30,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

// 6. VOYAGE: Japan -> San Francisco on a Pacific map, the old tea-garden postcard lands at SF
const Voyage: React.FC = () => {
  const f = useCurrentFrame();
  const proj = pacificProj();
  const jp = proj([139.7, 35.7]) as number[];
  const sf = proj([-122.4, 37.8]) as number[];
  const ctrl = [(jp[0] + sf[0]) / 2, jp[1] - 360];
  const p = prog(f, 4, 30);
  const pt = qPoint(p, jp, ctrl, sf);
  const l1 = usePop(0);
  const l2 = usePop(26);
  return (
    <AbsoluteFill>
      <BaseMap proj={proj} fills={{'392': MAP.red, '840': MAP.blue}} />
      <MapArrow from={[jp[0] + 30, jp[1] - 20]} ctrl={ctrl} to={[sf[0] - 34, sf[1] - 22]} p={p} />
      <Img
        src={staticFile('img/cookie.png')}
        style={{position: 'absolute', left: pt.x - 60, top: pt.y - 58, width: 120, transform: `rotate(${pt.a}deg)`, opacity: p > 0 && p < 0.97 ? 1 : 0, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))'}}
      />
      <MapLabel x={jp[0] + 10} y={jp[1] + 120} text="יפן" size={88} o={Math.min(1, l1 * 1.5)} />
      <MapLabel x={sf[0] - 150} y={sf[1] + 120} text="סן פרנסיסקו" size={72} o={Math.min(1, l2 * 1.5)} />
      <Sticker src="tg_postcard.png" x={560} y={1230} w={680} rot={2.5} delay={30} from="up" />
    </AbsoluteFill>
  );
};

// 7. WAR: two full-frame photos — Lange, Oakland 1942 -> a Chinatown fortune-cookie factory
const War: React.FC = () => {
  const f = useCurrentFrame();
  const cut = 78;
  return (
    <AbsoluteFill>
      {f < cut ? (
        <>
          <FullPhoto src="full_lange.jpg" dur={cut} />
          <Label x={540} y={1250} size={48} delay={8} rot={-1.5}>
            {'אוקלנד, 1942'}
          </Label>
        </>
      ) : (
        <Sequence from={cut} layout="none">
          <FullPhoto src="full_ggfc.jpg" dur={SCENES.war[1] - SCENES.war[0] - cut} />
          <Label x={540} y={200} size={48} delay={8} rot={1.5}>
            {"צ'יינה טאון"}
          </Label>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// 8. MISCONCEPTION: the "CHINA" tag peels off the cookie and falls
const Misconception: React.FC = () => {
  const f = useCurrentFrame();
  const word = usePop(10);
  const gloss = usePop(30);
  const fall = Math.max(0, f - 44);
  const tagY = 860 + 0.9 * fall * fall;
  const tagRot = -12 + (fall > 0 ? Math.min(70, fall * 4) : 0) + Math.sin(f / 3) * (fall > 0 ? 6 : 0);
  const wobble = f > 36 && f < 44 ? Math.sin((f - 36) * 2.2) * 5 : 0;
  return (
    <AbsoluteFill>
      <Plate dark />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', transform: `scale(${word})`, opacity: Math.min(1, word * 2)}}>
        <KeyWord text="MISCONCEPTION" size={104} />
      </div>
      <div
        dir="rtl"
        style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 76, color: C.yellow, transform: `scale(${gloss})`, opacity: Math.min(1, gloss * 2)}}
      >
        תפיסה מוטעית
      </div>
      <Sticker src="cookie.png" x={540} y={900} w={620} rot={-3} delay={0} />
      {tagY < 2100 && (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: tagY,
            transform: `translate(-50%, -50%) rotate(${tagRot + wobble}deg)`,
            background: C.coral,
            color: '#fff',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 70,
            letterSpacing: 6,
            padding: '10px 36px',
            boxShadow: '0 10px 16px rgba(0,0,0,0.3)',
            border: '5px solid #fbfbf8',
          }}
        >
          CHINA
          <div style={{position: 'absolute', left: -20, top: -18, width: 90, height: 34, background: 'rgba(235,225,195,0.85)', transform: 'rotate(-28deg)', opacity: fall > 0 ? 0 : 1}} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// 9. CRACK: the cookie breaks in two, crumbs fly
const Crack: React.FC = () => {
  const f = useCurrentFrame();
  const open = lerp(f, 24, 40, 0, 1);
  const shake = f > 14 && f < 24 ? Math.sin(f * 2.6) * 4 : 0;
  const crumbs = Array.from({length: 14}, (_, i) => i);
  return (
    <AbsoluteFill>
      <Plate />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `rotate(${shake}deg)`, transformOrigin: '540px 900px'}}>
        {f < 24 && (
          <Img src={staticFile('img/cookie.png')} style={{position: 'absolute', left: 540 - 330, top: 900 - 312, width: 660, transform: 'rotate(-4deg)', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.3))'}} />
        )}
        {f >= 24 && (<>
        <Img
          src={staticFile('img/half_left.png')}
          style={{position: 'absolute', left: 200 - 250 * open, top: 820 + 60 * open, width: 520, transform: `rotate(${-10 * open}deg)`, filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.3))'}}
        />
        <Img
          src={staticFile('img/half_right.png')}
          style={{position: 'absolute', left: 500 + 210 * open, top: 560 + 0 * open, width: 400, transform: `rotate(${12 * open}deg)`, filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.3))'}}
        />
        </>)}
      </div>
      {f > 24 &&
        crumbs.map((i) => {
          const t = (f - 24) / 30;
          const ang = (i / crumbs.length) * Math.PI * 2 + i;
          const v = 260 + (i % 4) * 90;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 560 + Math.cos(ang) * v * t,
                top: 930 + Math.sin(ang) * v * t + 500 * t * t,
                width: 10 + (i % 3) * 7,
                height: 8 + (i % 4) * 5,
                background: i % 2 ? '#D99A4A' : '#E8B66A',
                borderRadius: 4,
                transform: `rotate(${i * 40 + f * 9}deg)`,
                opacity: 1 - Math.min(1, t),
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
};

// 10. SLIP: callback to the hook — the slip now holds the viewer's own fortune
const Slip: React.FC = () => {
  const f = useCurrentFrame();
  const up = usePop(2, 16);
  const l1 = Math.floor(lerp(f, 14, 40, 0, 1) * 15);
  const l2 = Math.floor(lerp(f, 40, 56, 0, 1) * 13);
  const words1 = 'פטור מאנגלית';
  const shown = words1.slice(0, Math.floor(lerp(f, 12, 48, 0, words1.length, (x) => x)));
  const score = usePop(54, 10);
  const mark = prog(f, 62, 74);
  void l1;
  void l2;
  return (
    <AbsoluteFill>
      <Plate />
      <Img src={staticFile('img/half_left.png')} style={{position: 'absolute', left: -50, top: 1000, width: 520, transform: 'rotate(-10deg)', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.3))'}} />
      <Img src={staticFile('img/half_right.png')} style={{position: 'absolute', left: 740, top: 840, width: 360, transform: 'rotate(14deg)', filter: 'drop-shadow(0 12px 14px rgba(0,0,0,0.3))'}} />
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 640 + (1 - up) * 700,
          transform: `translate(-50%, -50%) rotate(${-3 + (1 - up) * 10}deg)`,
          width: 860,
          height: 330,
          background: '#FBFAF4',
          boxShadow: '0 16px 26px rgba(0,0,0,0.28)',
          clipPath: 'polygon(0 3%, 100% 0, 99% 97%, 1% 100%)',
        }}
      >
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: '#C9CFDF', opacity: 0.7}} />
        <div dir="rtl" style={{position: 'absolute', left: 40, right: 40, top: 46, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 84, lineHeight: 1.3, color: '#2E3A6E'}}>
          {shown}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', transform: `scale(${score})`}}>
          <div dir="rtl" style={{position: 'relative', fontFamily: FONT, fontWeight: 700, fontSize: 96, color: '#2E3A6E', padding: '0 22px'}}>
            <div style={{position: 'absolute', left: 0, top: 10, bottom: 6, width: `${mark * 100}%`, background: C.yellow, zIndex: -1, transform: 'skew(-6deg)'}} />
            134
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 11. END CARD (brand colours allowed here only)
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const page = interpolate(f, [0, 10], [1920, 0], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
  const logo = usePop(8);
  const h1 = usePop(14);
  const bar = prog(f, 24, 34);
  const cta = usePop(38);
  return (
    <AbsoluteFill style={{background: '#0E1430'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
        }}
      />
      <AbsoluteFill style={{transform: `translateY(${page}px)`}}>
        <div style={{position: 'absolute', left: 50, top: 200, width: 980, height: 1500, background: C.cream, transform: 'rotate(-1.5deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.35)'}} />
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 380,
            transform: `translateX(-50%) scale(${logo}) rotate(${(1 - logo) * -12 + 2}deg)`,
            background: '#fff',
            padding: 26,
            borderRadius: 18,
            boxShadow: '0 16px 26px rgba(0,0,0,0.25)',
          }}
        >
          <Img src={staticFile('img/logo-cut.png')} style={{width: 480, display: 'block'}} />
          <div style={{position: 'absolute', left: 150, top: -18, width: 170, height: 46, background: 'rgba(230,220,190,0.8)', transform: 'rotate(-4deg)'}} />
        </div>
        <div dir="rtl" style={{position: 'absolute', width: 1080, top: 900, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 92, color: C.navy, transform: `scale(${h1})`}}>
          עוד עובדה מעניינת.
        </div>
        <div style={{position: 'absolute', left: 120, top: 1040, width: 840, height: 130, overflow: 'hidden'}}>
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              inset: 0,
              background: C.navy,
              color: C.cream,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 76,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              clipPath: `inset(0 0 0 ${(1 - bar) * 100}%)`,
            }}
          >
            עוד מילה באנגלית.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 1270,
            transform: `translateX(-50%) rotate(-2deg) scale(${cta})`,
            background: '#fff',
            padding: '24px 46px',
            boxShadow: '8px 10px 0 rgba(0,0,0,0.25)',
            textAlign: 'center',
            fontFamily: FONT,
          }}
        >
          <div dir="rtl" style={{fontWeight: 700, fontSize: 58, color: C.navy}}>
            לעוד כאלה ← עקבו
          </div>
          <div dir="ltr" style={{fontWeight: 700, fontSize: 52, color: C.red, marginTop: 6}}>
            @improve.with.englishu
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ======================================================================
// Sound design (VOX rules: sparse, J-cut 2 frames early, max two soft whooshes)
const SFX: {at: number; src: string; v: number}[] = [
  {at: COOKIE_IN - 2, src: 'sfx/soft_thump_reveal_01.wav', v: 0.3}, // the cookie lands
  {at: 94 + D, src: 'sfx/paper_movement_01.wav', v: 0.2},
  {at: 96 + 22 + D, src: 'sfx/book_slide_on_desk_01.wav', v: 0.1},
  {at: 178 + D, src: 'sfx/page_turn_01.wav', v: 0.22},
  {at: 180 + 12 + D, src: 'sfx/marker_stroke_01.wav', v: 0.14},
  {at: 283 + D, src: 'sfx/book_slide_on_desk_02.wav', v: 0.2},
  {at: 285 + 38 + D, src: 'sfx/tape_press_01.wav', v: 0.3},
  {at: 403 + D, src: 'audio/pour_tea.wav', v: 0.12},
  {at: 477 + 2 + D, src: 'sfx/marker_stroke_02.wav', v: 0.14},
  {at: 477 + 28 + D, src: 'sfx/paper_movement_02.wav', v: 0.18},
  {at: 538 + D, src: 'sfx/camera_shutter_mechanical_01.wav', v: 0.2},
  {at: 540 + 76 + D, src: 'sfx/camera_shutter_mechanical_02.wav', v: 0.16},
  {at: 703 + D, src: 'sfx/soft_thump_reveal_02.wav', v: 0.25},
  {at: 705 + 42 + D, src: 'sfx/paper_movement_03.wav', v: 0.22},
  {at: 840 + 22 + D, src: 'audio/crunch_a.wav', v: 0.55},
  {at: 934 + D, src: 'sfx/paper_shuffle_01.wav', v: 0.14},
  {at: 936 + 60 + D, src: 'sfx/marker_stroke_03.wav', v: 0.16},
  {at: 1033 + D, src: 'sfx/soft_whoosh_02.wav', v: 0.16}, // whoosh 2 of 2 (end card)
  {at: 1035 + 8 + D, src: 'sfx/stamp_thud_01.wav', v: 0.2},
];

const SCENE_COMPONENTS: [keyof typeof SCENES, React.FC][] = [
  ['hook', Hook],
  ['china', China],
  ['y1878', Y1878],
  ['attribute', Attribute],
  ['garden', Garden],
  ['voyage', Voyage],
  ['war', War],
  ['misconception', Misconception],
  ['crack', Crack],
  ['slip', Slip],
  ['end', EndCard],
];

export const FortuneReel: React.FC<{voiceover?: string}> = ({voiceover}) => (
  <AbsoluteFill style={{background: C.light}}>
    {SCENE_COMPONENTS.map(([k, Comp]) => (
      <Sequence key={k} from={SCENES[k][0]} durationInFrames={SCENES[k][1] - SCENES[k][0]} name={k}>
        <Comp />
      </Sequence>
    ))}
    <Sequence from={0} durationInFrames={SCENES.end[0]} name="grain">
      <Grain />
    </Sequence>
    {LINES.map((l, i) => (
      <Sequence key={i} from={l.from} durationInFrames={l.to - l.from} name={`sub${i + 1}`}>
        <Subtitle text={l.text} ltr={l.ltr} hl={l.hl} />
      </Sequence>
    ))}
    {/* sound */}
    <Audio src={staticFile('sfx/room_tone_01.wav')} volume={0.05} loop />
    {SFX.map((s, i) => (
      <Sequence key={i} from={Math.max(0, s.at)} name={`sfx ${s.src.split('/').pop()}`}>
        <Audio src={staticFile(s.src)} volume={s.v} />
      </Sequence>
    ))}
    {voiceover && <Audio src={staticFile(voiceover)} volume={0.5} />}
  </AbsoluteFill>
);
