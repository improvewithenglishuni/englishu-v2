// Fortune cookies Reel (ATTRIBUTE, MISCONCEPTION) — rebuild of fortune-cookie-mockup-v1
// with real photos, real footage, sound and the end card.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Arc, C, FONT, Grain, KeyWord, Label, Plate, Sticker, Subtitle, clamp, lerp, prog, qPoint, usePop} from './kit';
import {ChinaMap, PacificMap, pacificProj} from './maps';

// ---- Timeline (frames @30fps), taken from mock-up v1. Retime to the voiceover.
export const SCENES = {
  hook: [0, 96],
  china: [96, 180],
  y1878: [180, 285],
  attribute: [285, 405],
  garden: [405, 477],
  voyage: [477, 540],
  war: [540, 705],
  misconception: [705, 840],
  crack: [840, 936],
  slip: [936, 1035],
  end: [1035, 1116],
} as const;
export const TOTAL = 1116; // 37.2 s

// ---- Recording script = subtitles (from the mock-up, unchanged)
export const LINES: {from: number; to: number; text: string; ltr?: boolean; hl?: string}[] = [
  {from: 0, to: 96, text: 'מה הדבר הכי "סיני" במסעדה סינית, שבכלל לא סיני?'},
  {from: 96, to: 180, text: 'עוגיות מזל, fortune cookies. בסין כמעט לא מכירים אותן.'},
  {from: 180, to: 285, text: 'זה התחיל ביפן, לפני יותר ממאה שנה: קרקרים עם פתק בפנים.'},
  {from: 285, to: 405, text: 'Historians attribute the fortune cookie to Japanese immigrants.', ltr: true, hl: 'attribute'},
  {from: 405, to: 540, text: 'בסן פרנסיסקו הגישו אותה לצד תה, בגן תה יפני.'},
  {from: 540, to: 705, text: 'ואז באה מלחמת העולם השנייה: מאפיות יפניות נסגרו, ויצרנים סיניים כנראה השתלטו על השוק.'},
  {from: 705, to: 840, text: "It's a common misconception that the fortune cookie is Chinese.", ltr: true, hl: 'misconception'},
  {from: 840, to: 936, text: 'שלחו את זה למי שבטוח שהוא מבין באוכל סיני.'},
  {from: 936, to: 1035, text: 'ותשאלו אותו: מאיפה העוגייה?'},
];

// ======================================================================
// 1. HOOK: the real cookie, then a zoom onto the slip with a yellow glow ring
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const z = lerp(f, 24, 62, 0, 1);
  const s = 1 + 1.4 * z;
  // slip centre inside the sticker (sticker at x 70..1010, top 260)
  const P = [698, 538]; // the slip's printed text, in sticker space
  const target = [540, 640];
  const ring = prog(f, 56, 70);
  return (
    <AbsoluteFill>
      <Plate />
      <AbsoluteFill
        style={{
          transformOrigin: `${P[0]}px ${P[1]}px`,
          transform: `translate(${(target[0] - P[0]) * z}px, ${(target[1] - P[1]) * z}px) scale(${s})`,
        }}
      >
        <Sticker src="broken.png" x={540} y={300 + 432} w={940} rot={-2} delay={0} />
      </AbsoluteFill>
      {ring > 0 && (
        <div
          style={{
            position: 'absolute',
            left: target[0] - 270,
            top: target[1] - 270,
            width: 540,
            height: 540,
            borderRadius: '50%',
            border: `16px solid ${C.yellow}`,
            boxShadow: `0 0 40px 10px ${C.yellow}AA, inset 0 0 30px 6px ${C.yellow}88`,
            transform: `scale(${0.7 + 0.3 * ring})`,
            opacity: ring,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// 2. CHINA: cookies drop onto China and bounce off it ("barely known there")
const China: React.FC = () => {
  const f = useCurrentFrame();
  const cookies = [
    {d: 14, x0: 420, xEnd: -220, r: -260},
    {d: 22, x0: 640, xEnd: 1300, r: 300},
    {d: 30, x0: 520, xEnd: -260, r: -320},
  ];
  return (
    <AbsoluteFill>
      <Plate />
      <ChinaMap x={140} y={260} w={800} h={700} />
      <Label x={560} y={1000} size={58} delay={4} rot={-2}>
        סין
      </Label>
      {cookies.map((c, i) => {
        const t = f - c.d;
        if (t < 0) return null;
        // fall to the map (y 560), bounce, then fly off
        const fall = Math.min(1, t / 10);
        const y = t < 10 ? -200 + 760 * fall * fall : 560 - 900 * ((t - 10) / 30) + 1300 * ((t - 10) / 30) ** 2;
        const x = t < 10 ? c.x0 : c.x0 + (c.xEnd - c.x0) * Math.min(1, (t - 10) / 32);
        const rot = t < 10 ? 0 : (c.r * (t - 10)) / 32;
        return (
          <Img
            key={i}
            src={staticFile('img/cookie.png')}
            style={{position: 'absolute', left: x - 120, top: y - 115, width: 240, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.3))'}}
          />
        );
      })}
      <Label x={540} y={1260} size={52} delay={36} rot={1.5} ltr>
        fortune cookies
      </Label>
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
      <Label x={540} y={1300} size={38} delay={34} rot={1}>
        {'איור יפני מ-1878: אופה מכין קרקרי מזל'}
      </Label>
      <Sticker src="tsujiura.png" x={860} y={240} w={180} rot={7} delay={52} />
    </AbsoluteFill>
  );
};

// 4. ATTRIBUTE: the word rides a tag from the cookie to Hagiwara's press and pins the origin on it
const Attribute: React.FC = () => {
  const f = useCurrentFrame();
  const p0 = [790, 1060];
  const p1 = [880, 520];
  const p2 = [470, 690];
  const ride = lerp(f, 14, 40, 0, 1);
  const pt = qPoint(ride, p0, p1, p2);
  const land = usePop(40, 9);
  const gloss = usePop(52);
  const tagScale = 1 + 0.12 * Math.sin(Math.min(1, land) * Math.PI);
  return (
    <AbsoluteFill>
      <Plate />
      <Sticker src="press.png" x={470} y={420} w={840} rot={-1.5} delay={0} />
      <Label x={470} y={175} size={34} delay={4} rot={-2}>
        {'המכבש המקורי של מקוטו הגיווארה, מהגר יפני (בערך 1914)'}
      </Label>
      <Sticker src="cookie.png" x={790} y={1120} w={330} rot={8} delay={6} />
      <Arc d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} p={prog(f, 10, 38)} />
      {/* the word on a paper tag */}
      <div
        style={{
          position: 'absolute',
          left: pt.x,
          top: pt.y,
          transform: `translate(-50%, -50%) rotate(${ride < 1 ? -4 + 8 * Math.sin(ride * 6) : -3}deg) scale(${(0.5 + 0.5 * Math.min(1, ride * 2)) * tagScale})`,
          background: C.dark,
          padding: '18px 34px 18px 70px',
          borderRadius: 14,
          clipPath: 'polygon(0 50%, 12% 0, 100% 0, 100% 100%, 12% 100%)',
          boxShadow: '0 10px 18px rgba(0,0,0,0.25)',
          opacity: f < 12 ? 0 : 1,
        }}
      >
        <div style={{position: 'absolute', left: 34, top: '50%', width: 22, height: 22, marginTop: -11, borderRadius: '50%', background: C.light}} />
        <KeyWord text="ATTRIBUTE" size={92} color="#fff" style={{WebkitTextStroke: '0px', textShadow: 'none', letterSpacing: 3}} />
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 840,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
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
      <Label x={540} y={190} size={44} delay={4} rot={-2}>
        {'גן התה היפני, סן פרנסיסקו'}
      </Label>
    </AbsoluteFill>
  );
};

// 6. VOYAGE: Japan -> San Francisco on a Pacific map, the old tea-garden postcard lands at SF
const Voyage: React.FC = () => {
  const f = useCurrentFrame();
  const proj = pacificProj();
  const jp = proj([139.7, 35.7]) as number[];
  const sf = proj([-122.4, 37.8]) as number[];
  const ctrl = [(jp[0] + sf[0]) / 2, jp[1] - 330];
  const p = prog(f, 4, 30);
  const pt = qPoint(p, jp, ctrl, sf);
  return (
    <AbsoluteFill>
      <Plate />
      <PacificMap />
      <Arc d={`M ${jp[0]} ${jp[1]} Q ${ctrl[0]} ${ctrl[1]} ${sf[0]} ${sf[1]}`} p={p} />
      <div style={{position: 'absolute', left: jp[0] - 14, top: jp[1] - 14, width: 28, height: 28, borderRadius: '50%', background: C.coral, border: '5px solid #fff'}} />
      <div style={{position: 'absolute', left: sf[0] - 14, top: sf[1] - 14, width: 28, height: 28, borderRadius: '50%', background: C.coral, border: '5px solid #fff', opacity: p > 0.95 ? 1 : 0}} />
      <Img
        src={staticFile('img/cookie.png')}
        style={{position: 'absolute', left: pt.x - 60, top: pt.y - 58, width: 120, transform: `rotate(${pt.a}deg)`, opacity: p > 0 && p < 1 ? 1 : 0, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))'}}
      />
      <Label x={jp[0] + 30} y={jp[1] + 90} size={42} delay={0} rot={-3}>
        יפן
      </Label>
      <Label x={sf[0] - 60} y={sf[1] + 90} size={42} delay={26} rot={2}>
        סן פרנסיסקו
      </Label>
      <Sticker src="tg_postcard.png" x={600} y={1150} w={700} rot={2.5} delay={30} from="up" />
    </AbsoluteFill>
  );
};

// 7. WAR: 1942 Lange photo (Japanese-American business closed) -> Chinese-American cookie factory
const War: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Plate />
      <Sticker src="lange.png" x={520} y={520} w={880} rot={-2} delay={0} />
      <Label x={520} y={1000} size={34} delay={10} rot={1.5}>
        {'אוקלנד, 1942: עסק של משפחה יפנית נסגר בעקבות צו הפינוי'}
      </Label>
      {f >= 76 && (
        <>
          <Sticker src="ggfc.png" x={600} y={1010} w={820} rot={2.5} delay={78} from="right" />
          <Label x={560} y={1390} size={34} delay={92} rot={-1.5}>
            {"מפעל עוגיות מזל בצ'יינה טאון, סן פרנסיסקו"}
          </Label>
        </>
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
        style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.yellow, transform: `scale(${gloss})`, opacity: Math.min(1, gloss * 2)}}
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
            fontWeight: 900,
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
  const t1 = 'מחכה לך פטור';
  const t2 = 'מאנגלית באמירנט';
  const words1 = `${t1} ${t2}`;
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
        <div dir="rtl" style={{position: 'absolute', left: 40, right: 40, top: 46, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 58, lineHeight: 1.3, color: '#2E3A6E'}}>
          {shown}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', transform: `scale(${score})`}}>
          <div dir="rtl" style={{position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#2E3A6E', padding: '0 18px'}}>
            <div style={{position: 'absolute', left: 0, top: 10, bottom: 6, width: `${mark * 100}%`, background: C.yellow, zIndex: -1, transform: 'skew(-6deg)'}} />
            ציון: 134
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
        <div dir="rtl" style={{position: 'absolute', width: 1080, top: 900, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, color: C.navy, transform: `scale(${h1})`}}>
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
              fontWeight: 900,
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
          <div dir="rtl" style={{fontWeight: 800, fontSize: 58, color: C.navy}}>
            לעוד כאלה ← עקבו
          </div>
          <div dir="ltr" style={{fontWeight: 800, fontSize: 52, color: C.red, marginTop: 6}}>
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
  {at: 0, src: 'sfx/soft_thump_reveal_01.wav', v: 0.28},
  {at: 22, src: 'sfx/soft_whoosh_01.wav', v: 0.16}, // whoosh 1 of 2 (hook zoom)
  {at: 54, src: 'sfx/sparkle_soft_01.wav', v: 0.22},
  {at: 94, src: 'sfx/paper_movement_01.wav', v: 0.2},
  {at: 96 + 22, src: 'sfx/book_slide_on_desk_01.wav', v: 0.1},
  {at: 178, src: 'sfx/page_turn_01.wav', v: 0.22},
  {at: 180 + 12, src: 'sfx/marker_stroke_01.wav', v: 0.14},
  {at: 283, src: 'sfx/book_slide_on_desk_02.wav', v: 0.2},
  {at: 285 + 38, src: 'sfx/tape_press_01.wav', v: 0.3},
  {at: 403, src: 'audio/pour_tea.wav', v: 0.12},
  {at: 477 + 2, src: 'sfx/marker_stroke_02.wav', v: 0.14},
  {at: 477 + 28, src: 'sfx/paper_movement_02.wav', v: 0.18},
  {at: 538, src: 'sfx/camera_shutter_mechanical_01.wav', v: 0.2},
  {at: 540 + 76, src: 'sfx/book_slide_on_desk_03.wav', v: 0.2},
  {at: 703, src: 'sfx/soft_thump_reveal_02.wav', v: 0.25},
  {at: 705 + 42, src: 'sfx/paper_movement_03.wav', v: 0.22},
  {at: 840 + 22, src: 'audio/crunch_a.wav', v: 0.55},
  {at: 934, src: 'sfx/paper_shuffle_01.wav', v: 0.14},
  {at: 936 + 60, src: 'sfx/marker_stroke_03.wav', v: 0.16},
  {at: 1033, src: 'sfx/soft_whoosh_02.wav', v: 0.16}, // whoosh 2 of 2 (end card)
  {at: 1035 + 8, src: 'sfx/stamp_thud_01.wav', v: 0.2},
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
