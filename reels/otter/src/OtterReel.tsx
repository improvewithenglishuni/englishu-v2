// Sea otters holding paws — EnglishU Reel 4 (DRIFT, BOND).
// Rebuilt from mock-up v2: same beats, same running time (32.8 s story + 2.7 s end card).
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  ANCHOR, Brush, C, DataBox, Draw, FullPhoto, Grain, Line, Plate, SANS, SERIF_EN, SERIF_HE, ScribbleOtter, Subtitles,
  TypeOn, Wobble, clamp, ease, lerp, ringPath, tornClip, usePop,
} from './kit';

const S = (s: number) => Math.round(s * 30);
export const STORY = S(32.8);
export const END = S(2.7);
export const TOTAL = STORY + END;

// Recording script = subtitle text (timings from mock-up v2; retime to her voice).
const LINES: Line[] = [
  { from: 0, to: 3.0, text: 'למה לוטרות ים מחזיקות ידיים כשהן ישנות?' },
  { from: 3.0, to: 5.8, text: 'הן ישנות על הגב, בקבוצות, באמצע המים.' },
  { from: 5.8, to: 8.0, text: 'והזרם? הוא לא נח לרגע.' },
  { from: 8.0, to: 12.0, text: 'Asleep, otters can drift away from their group.', en: true, word: 'drift' },
  { from: 12.0, to: 14.8, text: 'אז לפעמים הן מחזיקות כפה בכפה.' },
  { from: 14.8, to: 16.4, text: 'אבל בטבע זה נדיר.' },
  { from: 16.4, to: 19.5, text: 'לרוב הן עוטפות את עצמן באצות, כמו עוגן.' },
  { from: 19.5, to: 20.8, text: 'ואמא לוטרה?' },
  { from: 20.8, to: 22.5, text: 'כשהיא צוללת לחפש אוכל,' },
  { from: 22.5, to: 24.4, text: 'היא לפעמים עוטפת את הגור באצות,' },
  { from: 24.4, to: 25.5, text: 'שהזרם לא ייקח אותו.' },
  { from: 25.5, to: 29.0, text: 'A mother and her pup share a strong bond.', en: true, word: 'bond' },
  { from: 29.0, to: 32.8, text: 'שלחו את זה למי שלא הייתם רוצים להיסחף ממנו.' },
];

// ---------------------------------------------------------------- 1 + 11: hook photo (real, magazine clipping)
// hands.jpg is 1024x768; clasped paws at ~ (500, 240).
const PHOTO_W = 1080, PHOTO_H = 810, PHOTO_Y = 380;
const PAW = { x: 500 * (1080 / 1024), y: PHOTO_Y + 240 * (1080 / 1024) };

const HookStack: React.FC<{ zoom: number; ring: number; tie?: number }> = ({ zoom, ring, tie = 0 }) => {
  // zoom around the paws, pulling them toward frame centre as it grows
  const k = (zoom - 1) / 1.6;
  const tx = (540 - PAW.x) * k, ty = (720 - PAW.y) * k;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.ink }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${zoom})`, transformOrigin: `${PAW.x}px ${PAW.y}px` }}>
        {/* shallow depth of field: the same photo, huge and blurred, fills the frame */}
        <Img src={staticFile('hands.jpg')} style={{ position: 'absolute', left: -700, top: -160, width: 2480, height: 1860, objectFit: 'cover', filter: 'blur(26px) brightness(0.55) saturate(0.7)' }} />
        <div style={{ position: 'absolute', left: 0, top: PHOTO_Y, width: PHOTO_W, height: PHOTO_H, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.55))' }}>
          <Img src={staticFile('hands.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', clipPath: tornClip(2, 40, 1.4), filter: 'contrast(1.05) saturate(0.9)' }} />
        </div>
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs><Wobble id="hw" seed={5} scale={4} /></defs>
          <Draw d={ringPath(PAW.x, PAW.y, 120, 95)} p={ring} width={9} filter="url(#hw)" />
          {tie > 0 && (
            <Draw d={`M${PAW.x - 70},${PAW.y + 30} C${PAW.x - 20},${PAW.y + 90} ${PAW.x + 40},${PAW.y - 60} ${PAW.x - 10},${PAW.y - 40} C${PAW.x - 60},${PAW.y - 20} ${PAW.x + 30},${PAW.y + 60} ${PAW.x + 80},${PAW.y + 20}`} p={tie} width={7} filter="url(#hw)" />
          )}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, S(1.5), S(2.25)], [1, 1.04, 2.6], { ...clamp, easing: ease });
  const ring = lerp(f, S(2.15), S(2.7), 0, 1);
  const cap = lerp(f, 6, 26, 0, 1);
  const capOut = interpolate(f, [S(1.4), S(1.6)], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <HookStack zoom={zoom} ring={ring} />
      {/* documentary caption, Playfair italic (inspiration 5) */}
      <div style={{ position: 'absolute', left: 70, top: PHOTO_Y + PHOTO_H + 30, opacity: capOut }}>
        <TypeOn p={cap}>
          <span style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: C.line }}>Vancouver Aquarium, 2006</span>
        </TypeOn>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2: raft (real photo, Vox annotation)
const Raft: React.FC = () => {
  const f = useCurrentFrame();
  const d = S(2.8);
  const s = interpolate(f, [0, d], [1, 1.06], clamp);
  const line = lerp(f, 8, 26, 0, 1);
  const lab = lerp(f, 18, 36, 0, 1);
  const sub = lerp(f, 30, 46, 0, 1);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.ink }}>
      <Img src={staticFile('raft1.jpg')} style={{ position: 'absolute', height: 3100, width: 4650, left: -2343, top: -1180, transform: `scale(${s})`, transformOrigin: '540px 1150px', filter: 'contrast(1.08) saturate(0.8)' }} />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><Wobble id="rw" seed={8} scale={4} /></defs>
        {/* hand-drawn bracket over the raft, pointer up to the label */}
        <Draw d="M90,1100 C90,1060 100,1052 140,1052 L940,1048 C980,1048 990,1056 990,1096" p={line} width={7} filter="url(#rw)" />
        <Draw d="M780,1048 L800,880" p={line} width={6} filter="url(#rw)" />
      </svg>
      <div dir="rtl" style={{ position: 'absolute', right: 150, top: 700, textAlign: 'right' }}>
        <TypeOn p={lab} rtl>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.yellow, lineHeight: 1 }}>בקבוצות</div>
        </TypeOn>
        <TypeOn p={sub}>
          <div dir="ltr" style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 52, color: C.line, marginTop: 10 }}>(a “raft”)</div>
        </TypeOn>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 3: the current (real footage + white flow lines)
const Current: React.FC = () => {
  const f = useCurrentFrame();
  const flows = [
    { y: 520, delay: 4 }, { y: 640, delay: 12 }, { y: 1180, delay: 8 }, { y: 1300, delay: 18 },
  ];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile('float.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(0.75) brightness(0.92)' }} />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><Wobble id="cw" seed={2} scale={5} /></defs>
        {flows.map((fl, i) => {
          const p = lerp(f, fl.delay, fl.delay + 26, 0, 1);
          const drift = interpolate(f, [0, 66], [0, -60], clamp);
          // motion flows right to left (Hebrew reading direction)
          return (
            <g key={i} transform={`translate(${drift},0)`}>
              <Draw d={`M1040,${fl.y} C880,${fl.y - 40} 760,${fl.y + 40} 600,${fl.y} C440,${fl.y - 40} 320,${fl.y + 40} 160,${fl.y}`} p={p} color={C.line} width={6} filter="url(#cw)" />
              <Draw d={`M200,${fl.y - 28} L150,${fl.y} L204,${fl.y + 24}`} p={lerp(f, fl.delay + 22, fl.delay + 30, 0, 1)} color={C.line} width={6} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 4: DRIFT (ink plate, scribble otters pull apart)
const Drift: React.FC = () => {
  const f = useCurrentFrame();
  const apart = lerp(f, S(1.0), S(2.6), 0, 1, (t) => t * t * (3 - 2 * t));
  const draw = lerp(f, 0, 22, 0, 1);
  const word = usePop(S(0.35), -4);
  const gloss = usePop(S(2.0), 3);
  const trail = apart;
  const L = { x: 330 - apart * 150, y: 470 - apart * 150, r: -4 - apart * 10 };
  const R = { x: 720 + apart * 140, y: 640 + apart * 130, r: 3 + apart * 9 };
  return (
    <AbsoluteFill>
      <Plate src="plate_ink.png" />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><Wobble id="dw" seed={9} scale={4} /></defs>
        <Draw d="M330,600 C260,560 180,470 110,360" p={trail} width={5} dash="2 22" opacity={trail > 0.02 ? 0.9 : 0} />
        <Draw d="M720,760 C800,800 900,860 1010,900" p={trail} width={5} dash="2 22" opacity={trail > 0.02 ? 0.9 : 0} />
      </svg>
      <div style={{ position: 'absolute', left: L.x - 270, top: L.y, width: 540, height: 205, transform: `rotate(${L.r}deg)` }}>
        <ScribbleOtter p={draw} seed={1} width={4.5} />
      </div>
      <div style={{ position: 'absolute', left: R.x - 270, top: R.y, width: 540, height: 205, transform: `rotate(${R.r}deg) scaleX(-1)` }}>
        <ScribbleOtter p={draw} seed={2} width={4.5} />
      </div>
      {/* the word rides the motion: DR goes with one otter, IFT with the other */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 940, display: 'flex', justifyContent: 'center', ...word }}>
        <div dir="ltr" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 230, color: C.yellow, letterSpacing: 4, display: 'flex' }}>
          <span style={{ transform: `translate(${-apart * 120}px, ${-apart * 30}px) rotate(${-apart * 4}deg)`, display: 'inline-block' }}>DR</span>
          <span style={{ transform: `translate(${apart * 120}px, ${apart * 30}px) rotate(${apart * 4}deg)`, display: 'inline-block' }}>IFT</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 300, width: 480, top: 1230, ...gloss }}>
        <DataBox x={0} y={0} w={480} dark style={{ padding: '18px 20px' }}>
          <div dir="rtl" style={{ fontFamily: SERIF_HE, fontWeight: 700, fontSize: 84, lineHeight: 1.05 }}>להיסחף</div>
        </DataBox>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5: paw in paw (field-guide paper + clipping + data box)
const PawInPaw: React.FC = () => {
  const f = useCurrentFrame();
  const clip = usePop(0, -6);
  const outline = lerp(f, 10, 34, 0, 1);
  const box = usePop(22, 2);
  const lead = lerp(f, 30, 48, 0, 1);
  return (
    <AbsoluteFill>
      <Plate src="plate_paper.png" />
      {/* yellow band behind, like the falcon frame */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, height: 34, background: C.yellow }} />
      <div style={{ position: 'absolute', left: 170, top: 330, width: 820, height: 680, transform: `${clip.transform} rotate(-3deg)`, opacity: clip.opacity }}>
        <svg width="860" height="720" style={{ position: 'absolute', left: -20, top: -20, overflow: 'visible' }}>
          <defs><Wobble id="pw" seed={4} scale={6} /></defs>
          <Draw d="M10,30 C200,8 600,14 850,22 C858,240 856,480 846,700 C600,712 260,714 14,704 C6,470 4,240 10,30" p={outline} width={7} filter="url(#pw)" />
        </svg>
        <div style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.35))' }}>
          <div style={{ width: '100%', height: '100%', clipPath: tornClip(7, 30, 2.2), border: '10px solid white', boxSizing: 'border-box', background: 'white' }}>
            <Img src={staticFile('hands.jpg')} style={{ width: 1180, height: 885, marginLeft: -340, marginTop: -110, filter: 'contrast(1.08) saturate(0.85)' }} />
          </div>
        </div>
      </div>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <path d="M290,1180 L290,1250 L560,1250 L560,560" fill="none" stroke={C.black} strokeWidth={4} strokeDasharray="14 12" pathLength={1}
          style={{ strokeDasharray: '0.02 0.016', strokeDashoffset: 0, clipPath: `inset(${(1 - lead) * 100}% 0 0 0)` }} />
      </svg>
      <div style={{ position: 'absolute', left: 90, top: 1040, ...box }}>
        <DataBox x={0} y={0} w={420} style={{ padding: '22px 24px' }}>
          <div dir="rtl" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, lineHeight: 1.05 }}>כפה בכפה</div>
          <div style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 36, marginTop: 6 }}>Enhydra lutris</div>
        </DataBox>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 6: twist — rare in the wild (blurred evidence + brush word)
const Twist: React.FC = () => {
  const f = useCurrentFrame();
  const brush = lerp(f, 4, 16, 0, 1);
  const word = usePop(10, -2);
  const tag = lerp(f, 18, 34, 0, 1);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Img src={staticFile('hands.jpg')} style={{ position: 'absolute', left: -460, top: 260, width: 2000, height: 1500, objectFit: 'cover', filter: 'blur(14px) saturate(0.6) brightness(1.05)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(227,227,224,.9) 0%, rgba(227,227,224,.15) 35%, rgba(227,227,224,.15) 65%, rgba(227,227,224,.9) 100%)' }} />
      <div style={{ position: 'absolute', left: 140, top: 700, width: 800, height: 260 }}>
        <Brush p={brush} w={800} h={260} />
        <div dir="rtl" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF_HE, fontWeight: 900, fontSize: 230, color: C.black, ...word }}>
          נדיר
        </div>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 150, top: 1030, textAlign: 'right' }}>
        <TypeOn p={tag} rtl>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.black }}>בטבע</div>
        </TypeOn>
        <TypeOn p={lerp(f, 26, 44, 0, 1)}>
          <div dir="ltr" style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: C.black }}>(the famous photo: an aquarium)</div>
        </TypeOn>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 7: kelp anchor (real photo + drawn kelp line and anchor)
const Kelp: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = S(1.0);
  const kelp = lerp(f, t0, t0 + 24, 0, 1);
  const anchor = usePop(t0 + 20, -8);
  const lab = lerp(f, 6, 24, 0, 1);
  return (
    <AbsoluteFill>
      <FullPhoto src="sleep1.jpg" dur={S(3.1)} pos="58% 50%" />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><Wobble id="kw" seed={6} scale={6} /></defs>
        <Draw d="M560,930 C620,1000 500,1060 560,1120 C620,1180 500,1220 540,1260" p={kelp} width={9} filter="url(#kw)" />
      </svg>
      <div style={{ position: 'absolute', left: 540 - 70, top: 1300, width: 140, height: 150, ...anchor }}>
        <svg viewBox="-70 -80 140 150" width="140" height="150">
          <defs><Wobble id="aw" seed={7} scale={4} /></defs>
          <Draw d={ANCHOR} p={1} width={9} filter="url(#aw)" />
        </svg>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 150, top: 260, textAlign: 'right' }}>
        <TypeOn p={lab} rtl>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.yellow, textShadow: '0 3px 12px rgba(0,0,0,.5)' }}>אצות קֶלפּ</div>
        </TypeOn>
        <TypeOn p={lerp(f, 16, 32, 0, 1)}>
          <div dir="ltr" style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 46, color: 'white', textShadow: '0 3px 12px rgba(0,0,0,.6)' }}>(kelp)</div>
        </TypeOn>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 8: mother — Steller's 1751 engraving (archival document)
const Mother: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, S(1.3)], [1.0, 1.05], clamp);
  const ring = lerp(f, 8, 26, 0, 1);
  const cap = lerp(f, 4, 20, 0, 1);
  return (
    <AbsoluteFill>
      <Plate src="plate_paper.png" />
      <div style={{ position: 'absolute', left: -140, top: 520, width: 1360, height: 531, transform: `rotate(-2deg) scale(${s})`, filter: 'drop-shadow(0 16px 26px rgba(0,0,0,.35))' }}>
        <Img src={staticFile('steller_fig2.jpg')} style={{ width: '100%', height: '100%', clipPath: tornClip(11, 44, 1.6) }} />
        <svg width="1360" height="531" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs><Wobble id="mw" seed={12} scale={5} /></defs>
          {/* ring the pup on her chest */}
          <Draw d={ringPath(395, 165, 92, 120)} p={ring} width={9} filter="url(#mw)" />
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 90, top: 1110 }}>
        <TypeOn p={cap}>
          <div style={{ fontFamily: SERIF_EN, fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: C.black }}>G. W. Steller, 1751</div>
        </TypeOn>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 150, top: 330 }}>
        <TypeOn p={lerp(f, 10, 24, 0, 1)} rtl>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 76, color: C.black }}>אמא + גור</div>
        </TypeOn>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 9-11: dive, wrap, hold (ink plate, scribble animation)
const Dive: React.FC = () => {
  const f = useCurrentFrame();
  const dive = lerp(f, 4, S(1.6), 0, 1, (t) => t);
  const wrap = lerp(f, S(1.75), S(3.2), 0, 1);
  const hold = lerp(f, S(3.6), S(4.6), 0, 1);
  const surface = 470;
  // spiral dive path (inspiration 4): from the surface, right to left and down
  const spiral = 'M820,500 C980,620 960,840 760,880 C600,910 540,800 620,740 C700,690 790,800 680,980 C600,1110 520,1180 420,1230';
  // positions sampled along the spiral for the ghost sequence
  const pts = [
    { x: 830, y: 560, r: 60 }, { x: 880, y: 770, r: 110 }, { x: 690, y: 860, r: 200 }, { x: 700, y: 1000, r: 130 }, { x: 480, y: 1200, r: 160 },
  ];
  const idx = Math.min(pts.length - 1, Math.floor(dive * (pts.length - 1) + 0.0001));
  const mother = pts[idx];
  const bob = Math.sin(f / 7) * 6;
  const sway = hold > 0 ? Math.sin(f / 3) * 4 * (1 - hold * 0.5) : 0;
  return (
    <AbsoluteFill>
      <Plate src="plate_ink.png" />
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs><Wobble id="vw" seed={13} scale={5} /></defs>
        {/* surface line */}
        <Draw d={`M0,${surface + 30} C180,${surface + 10} 360,${surface + 50} 540,${surface + 30} C720,${surface + 10} 900,${surface + 50} 1080,${surface + 30}`} p={lerp(f, 0, 16, 0, 1)} color={C.line} width={3} opacity={0.6} filter="url(#vw)" />
        {/* her dive path */}
        <Draw d={spiral} p={dive} width={7} filter="url(#vw)" />
        {/* kelp wraps the pup, then runs down to the sea floor */}
        <Draw d="M300,420 C340,380 420,380 440,430 C460,480 340,500 300,470 C260,440 330,400 400,410 C470,420 470,470 420,500 C400,700 470,900 410,1100 C380,1200 430,1300 400,1380" p={wrap} width={8} filter="url(#vw)" />
        {/* current lines push right to left in the last beat */}
        {[300, 380, 560].map((y, i) => (
          <Draw key={i} d={`M1060,${y} C900,${y - 30} 820,${y + 30} 660,${y}`} p={lerp(f, S(3.55) + i * 4, S(3.55) + i * 4 + 16, 0, 1)} color={C.line} width={5} filter="url(#vw)" />
        ))}
      </svg>
      {/* pup at the surface (small scribble otter) */}
      <div style={{ position: 'absolute', left: 220 + sway, top: surface - 60 + bob, width: 300, height: 112 }}>
        <ScribbleOtter seed={5} width={5} p={lerp(f, 0, 18, 0, 1)} />
      </div>
      {/* mother: ghost sequence along the spiral */}
      {pts.slice(0, idx + 1).map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: p.x - 210, top: p.y - 80, width: 420, height: 160, transform: `rotate(${p.r}deg)`, opacity: i === idx ? 1 : 0.3 + i * 0.08 }}>
          <ScribbleOtter seed={7 + i} ghosts={i === idx ? 3 : 1} width={i === idx ? 4.5 : 3} />
        </div>
      ))}
      {/* anchor at the bottom of the kelp */}
      <div style={{ position: 'absolute', left: 400 - 60, top: 1360, width: 120, height: 130, opacity: wrap > 0.95 ? 1 : 0 }}>
        <svg viewBox="-70 -80 140 150" width="120" height="130">
          <Draw d={ANCHOR} p={lerp(f, S(3.1), S(3.5), 0, 1)} width={9} />
        </svg>
      </div>
      {/* bubbles */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = interpolate((f + i * 9) % 40, [0, 40], [mother.y - 20, mother.y - 200]);
        return <div key={i} style={{ position: 'absolute', left: mother.x + (i % 2 ? 40 : -30) + i * 6, top: y, width: 14 + i * 3, height: 14 + i * 3, borderRadius: 99, border: `3px solid ${C.line}`, opacity: 0.5 }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 12: BOND (real photo clipping + links that lock the letters)
const Bond: React.FC = () => {
  const f = useCurrentFrame();
  const clip = usePop(0, 4);
  const tie = lerp(f, 8, 30, 0, 1);
  const letters = ['B', 'O', 'N', 'D'];
  const gloss = usePop(S(1.9), -3);
  const lead = lerp(f, S(2.0), S(2.5), 0, 1);
  return (
    <AbsoluteFill>
      <Plate src="plate_paper.png" />
      <div style={{ position: 'absolute', left: 60, top: 170, width: 960, height: 620, transform: `${clip.transform} rotate(2deg)`, opacity: clip.opacity, filter: 'drop-shadow(0 14px 24px rgba(0,0,0,.35))' }}>
        <div style={{ width: '100%', height: '100%', clipPath: tornClip(21, 36, 2), background: 'white', padding: 10, boxSizing: 'border-box' }}>
          <Img src={staticFile('pup3.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 55%', filter: 'contrast(1.06) saturate(0.85)' }} />
        </div>
        <svg width="960" height="620" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs><Wobble id="bw" seed={22} scale={5} /></defs>
          {/* a loop that ties mother and pup together */}
          <Draw d="M300,330 C300,220 480,200 560,260 C640,320 640,420 520,430 C400,440 330,400 330,340" p={tie} width={8} filter="url(#bw)" />
        </svg>
      </div>
      {/* the word: each letter drops in, then a chain link locks it to the next one */}
      <div dir="ltr" style={{ position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {letters.map((ch, i) => {
          const st = S(0.5) + i * 7;
          const y = lerp(f, st, st + 10, -90, 0);
          const o = f < st ? 0 : 1;
          return (
            <div key={ch} style={{ position: 'relative', width: 190, height: 230, opacity: o, transform: `translateY(${y}px)` }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 190, color: C.black }}>{ch}</div>
              <svg width="190" height="230" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                <defs><Wobble id={`lk${i}`} seed={30 + i} scale={4} /></defs>
                <Draw d={ringPath(95, 118, 108, 120)} p={lerp(f, st + 10, st + 24, 0, 1)} width={10} filter={`url(#lk${i})`} />
              </svg>
            </div>
          );
        })}
      </div>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <line x1="540" y1="1150" x2="540" y2={1150 + 70 * lead} stroke={C.black} strokeWidth={4} strokeDasharray="12 10" />
      </svg>
      <div style={{ position: 'absolute', left: 340, width: 400, top: 1225, ...gloss }}>
        <DataBox x={0} y={0} w={400} style={{ padding: '16px 20px' }}>
          <div dir="rtl" style={{ fontFamily: SERIF_HE, fontWeight: 700, fontSize: 84, lineHeight: 1.05 }}>קשר</div>
        </DataBox>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 13: callback — back to the hook, zoom out, the paws get "tied"
const Callback: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, S(2.6)], [2.6, 1], { ...clamp, easing: ease });
  const ring = lerp(f, S(2.4), S(3.0), 0, 1);
  const tie = lerp(f, S(2.9), S(3.6), 0, 1);
  return <HookStack zoom={zoom} ring={ring} tie={tie} />;
};

// ---------------------------------------------------------------- end card (brand colours only here)
const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const page = lerp(f, 0, 12, 1920, 0);
  const logo = usePop(8, -10);
  const h1 = lerp(f, 14, 26, 0, 1);
  const bar = lerp(f, 24, 36, 0, 1);
  const cta = usePop(40, 4);
  const push = interpolate(f, [0, END], [1, 1.04], clamp);
  return (
    <AbsoluteFill style={{ background: '#1d1d1f' }}>
      <AbsoluteFill style={{ transform: `translateY(${page}px) scale(${push})`, background: C.cream, clipPath: tornClip(31, 40, 1.2) }}>
        <div style={{ position: 'absolute', left: 260, top: 260, width: 560, height: 409, ...logo }}>
          <Img src={staticFile('logo.png')} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.25))' }} />
        </div>
        <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: SERIF_HE, fontWeight: 900, fontSize: 104, color: C.navy, opacity: h1, transform: `translateY(${(1 - h1) * 30}px)` }}>
          עוד עובדה מעניינת.
        </div>
        <div style={{ position: 'absolute', left: 90, right: 90, top: 880, height: 150, background: C.navy, clipPath: `inset(0 0 0 ${(1 - bar) * 100}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div dir="rtl" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.cream }}>עוד מילה באנגלית.</div>
        </div>
        <div style={{ position: 'absolute', left: 180, right: 180, top: 1110, padding: '26px 20px', background: 'white', textAlign: 'center', transform: `${cta.transform} rotate(-2deg)`, opacity: cta.opacity, boxShadow: '8px 10px 0 rgba(0,0,0,.25)' }}>
          <div dir="rtl" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 60, color: C.navy }}>לעוד כאלה ← עקבו</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.red, marginTop: 8 }}>@improve.with.englishu</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- timeline
const SCENES: { from: number; to: number; C: React.FC }[] = [
  { from: 0, to: 3.0, C: Hook },
  { from: 3.0, to: 5.8, C: Raft },
  { from: 5.8, to: 8.0, C: Current },
  { from: 8.0, to: 12.0, C: Drift },
  { from: 12.0, to: 14.8, C: PawInPaw },
  { from: 14.8, to: 16.4, C: Twist },
  { from: 16.4, to: 19.5, C: Kelp },
  { from: 19.5, to: 20.8, C: Mother },
  { from: 20.8, to: 25.5, C: Dive },
  { from: 25.5, to: 29.0, C: Bond },
  { from: 29.0, to: 32.8, C: Callback },
];

export const OtterReel: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    {SCENES.map(({ from, to, C: Scene }, i) => (
      <Sequence key={i} from={S(from)} durationInFrames={S(to) - S(from)}>
        <Scene />
      </Sequence>
    ))}
    <Sequence from={STORY} durationInFrames={END}>
      <EndCard />
    </Sequence>
    <Grain />
    <Sequence from={0} durationInFrames={STORY}>
      <Subtitles lines={LINES} />
    </Sequence>
  </AbsoluteFill>
);
