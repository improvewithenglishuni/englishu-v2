// Post-it Reel scenes. Each scene: plate (layer 1), cutouts (layer 2), key object / labels / word (layer 3).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, GlowRing, PhotoOr, Plate, Tag, TargetWord, TornSheet, sticker, usePop} from '../lib/paper';
import {Bookmark, ChoirLoft, DrawnBulb, GlueJar, Hymnal, Note, PostItPad, PushHand, TrashBin, Weight} from './art';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 1, 0.68, 1);

// content column centre (right 130 px stay clear)
const CX = 475;

/* 1. HOOK: the pad, its corner peels, glow ring on the corner */
export const SceneHook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const peel = interpolate(f, [30, 58], [0, 1], {...clamp, easing: ease});
  const S = 600;
  const x = CX - S / 2;
  const y = 330;
  return (
    <AbsoluteFill>
      <Plate kind="light" seed="hook" />
      <PhotoOr path="postit/photos/hook.jpg" duration={dur}>
        <div style={{position: 'absolute', left: x, top: y, transform: `rotate(-3deg) scale(${interpolate(f, [0, dur], [1, 1.04])})`, filter: sticker(9, 0.32)}}>
          <PostItPad size={S} peel={peel} />
        </div>
        <GlowRing x={x + S * 0.19} y={y + S * 0.8} r={140} delay={52} />
      </PhotoOr>
    </AbsoluteFill>
  );
};

/* 2. 3M LAB, 1968: glue jar and a test rig meant to hold a heavy weight */
export const SceneLab: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const jar = usePop(4);
  const rig = usePop(10);
  const drop = spring({frame: f - 34, fps, config: {damping: 9, mass: 0.9}});
  const strain = Math.sin(Math.max(0, f - 40) / 3) * Math.exp(-Math.max(0, f - 40) / 14) * 6;
  return (
    <AbsoluteFill>
      <Plate kind="peri" seed="lab" />
      <Tag x={CX} y={190} text="1968 · מעבדת 3M" delay={0} rotate={-2} />
      {/* rig: stand bar, glued paper strip, weight */}
      <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${rig})`, transformOrigin: `${CX + 60}px 470px`}}>
        <div style={{position: 'absolute', left: CX - 120, top: 450, width: 420, height: 34, background: C.charcoal, borderRadius: 8, filter: sticker(6, 0.3)}} />
        <div style={{position: 'absolute', left: CX + 300, top: 440, width: 34, height: 640, background: C.charcoal, borderRadius: 8, filter: sticker(6, 0.3)}} />
        <div style={{position: 'absolute', left: CX + 40, top: 476, width: 74, height: 300 + strain, background: '#FFFFFF', boxShadow: '4px 8px 10px rgba(0,0,0,0.2)'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 34, background: C.accentDeep}} />
        </div>
        <div style={{position: 'absolute', left: CX - 8, top: interpolate(drop, [0, 1], [180, 760 + strain]), filter: sticker(6, 0.3), opacity: drop > 0.01 ? 1 : 0}}>
          <Weight w={170} />
        </div>
      </div>
      <div style={{position: 'absolute', left: CX - 360, top: 860, transform: `scale(${jar}) rotate(${(1 - jar) * -14 - 4}deg)`, filter: sticker(8, 0.3)}}>
        <GlueJar w={240} />
      </div>
    </AbsoluteFill>
  );
};

/* 3. ADHESIVE: a note sticks, peels off easily, sticks back */
export const SceneAdhesive: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const page = usePop(0);
  const land = spring({frame: f - 40, fps, config: {damping: 13}});
  // peel 62->74 lifts the note from its top hinge, 84->92 presses it back
  const lift = interpolate(f, [62, 74, 84, 92], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.quad)});
  const noteX = interpolate(land, [0, 1], [760, CX - 40]);
  const noteY = interpolate(land, [0, 1], [560, 820]);
  return (
    <AbsoluteFill>
      <Plate kind="light" seed="adh" />
      <TargetWord word="ADHESIVE" gloss="דבק" delay={2} y={210} />
      <div style={{position: 'absolute', left: CX - 330, top: 720, transform: `scale(${page}) rotate(-2deg)`, filter: 'drop-shadow(6px 14px 14px rgba(20,20,30,0.25))'}}>
        <svg width={560} height={600} viewBox="0 0 560 600">
          <path d="M0,0 L560,0 L560,600 L0,600 Z" fill="#FFFFFF" />
          {Array.from({length: 13}).map((_, i) => (
            <rect key={i} x={40} y={70 + i * 40} width={i % 4 === 3 ? 260 : 470} height={6} rx={3} fill="#D7DAE4" />
          ))}
        </svg>
      </div>
      <div style={{position: 'absolute', left: noteX, top: noteY, transformOrigin: '50% 0%', transform: `rotate(${4 - lift * 22}deg) perspective(900px) rotateX(${lift * 48}deg) translateY(${-lift * 40}px)`, filter: sticker(5, 0.25 + lift * 0.2)}}>
        <Note size={330} />
      </div>
    </AbsoluteFill>
  );
};

/* 4. NOBODY WANTED IT: the jar alone on a shelf, dust, a question mark */
export const SceneNobody: React.FC = () => {
  const f = useCurrentFrame();
  const q = usePop(24, 9);
  const jar = usePop(2);
  return (
    <AbsoluteFill>
      <Plate kind="dark" seed="nobody" />
      {/* cobweb in the top-left corner */}
      <svg width={360} height={360} style={{position: 'absolute', left: 0, top: 0, opacity: 0.45}}>
        {[0, 20, 40, 60, 80].map((a) => (
          <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 340} y2={Math.sin((a * Math.PI) / 180) * 340} stroke="#C9CCD8" strokeWidth={2} />
        ))}
        {[80, 150, 220, 290].map((r) => (
          <path key={r} d={`M${r},0 Q${r * 0.8},${r * 0.35} ${r * 0.7},${r * 0.7} Q${r * 0.35},${r * 0.8} 0,${r}`} stroke="#C9CCD8" strokeWidth={2} fill="none" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: -40, top: 1040, width: 1200, height: 46, background: '#2A2B33', boxShadow: '0 18px 24px rgba(0,0,0,0.35)'}} />
      <div style={{position: 'absolute', left: CX - 130, top: 1040 - 300, transform: `scale(${jar})`, transformOrigin: '50% 100%', filter: sticker(8, 0.4)}}>
        <GlueJar w={260} />
      </div>
      {/* dust drifting down */}
      {Array.from({length: 26}).map((_, i) => {
        const x = CX - 220 + random(`dx${i}`) * 440;
        const speed = 1.2 + random(`ds${i}`) * 1.6;
        const y = ((random(`dy${i}`) * 900 + f * speed) % 900) + 200;
        return <div key={i} style={{position: 'absolute', left: x + Math.sin((f + i * 10) / 12) * 10, top: y, width: 6, height: 6, borderRadius: 3, background: '#D8D4C8', opacity: 0.55}} />;
      })}
      <div style={{position: 'absolute', left: CX + 90, top: 330, transform: `scale(${q}) rotate(${12 + Math.sin(f / 9) * 4}deg)`, fontFamily: 'Rubik', fontWeight: 900, fontSize: 330, color: C.accent, filter: sticker(9, 0.4), lineHeight: 1}}>?</div>
    </AbsoluteFill>
  );
};

/* 5. DISMISS: a hand pushes the glue sample right-to-left into the bin */
export const SceneDismiss: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [48, 74], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const fall = interpolate(f, [74, 90], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const handOut = interpolate(f, [84, 104], [0, 1], {...clamp, easing: ease});
  const tableY = 1180;
  const sampleX = interpolate(push, [0, 1], [CX + 150, CX - 170]) - fall * 30;
  const sampleY = tableY - 60 + fall * 160;
  const handX = interpolate(push, [0, 1], [CX + 260, CX - 40]) + handOut * 600;
  const binP = usePop(6);
  return (
    <AbsoluteFill>
      <Plate kind="light" seed="dismiss" />
      <TargetWord word="DISMISS" gloss="לפסול / לדחות" delay={2} y={210} />
      <div style={{position: 'absolute', left: -40, top: tableY, width: 1200, height: 34, background: '#C9CCD8'}} />
      <div style={{position: 'absolute', left: sampleX, top: sampleY, transform: `rotate(${fall * -70}deg)`, opacity: interpolate(fall, [0.7, 1], [1, 0], clamp)}}>
        <div style={{width: 150, height: 60, background: C.cream, filter: sticker(4, 0.25), position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 46, background: C.accentDeep}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: CX - 420, top: tableY - 120, transform: `scale(${binP})`, transformOrigin: '50% 100%', filter: sticker(7, 0.3)}}>
        <TrashBin w={250} />
      </div>
      <div style={{position: 'absolute', left: handX, top: tableY - 120, filter: sticker(5, 0.28), opacity: f > 30 ? 1 : 0, transform: `translateX(${interpolate(f, [30, 46], [500, 0], {...clamp, easing: ease})}px)`}}>
        <PushHand w={330} />
      </div>
    </AbsoluteFill>
  );
};

/* 6. ART FRY IN THE CHOIR, 1974 */
export const SceneChoir: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const card = usePop(0, 14);
  const W = 860;
  const cardX = CX - W / 2;
  const cardY = 330;
  // hero singer: front row, second from the right (index 3 of 5)
  const heroX = cardX + 20 + (W - 40) * ((500 / 5) * 3.5) / 500;
  const heroY = cardY + 20 + (W - 40) * 0.62 * (275 / 380);
  return (
    <AbsoluteFill>
      <Plate kind="dark" seed="choir" />
      <PhotoOr path="postit/photos/choir.jpg" duration={dur}>
        <div style={{position: 'absolute', left: cardX, top: cardY, transform: `scale(${interpolate(card, [0, 1], [0.9, 1]) * interpolate(f, [0, dur], [1, 1.03])}) rotate(-1.5deg)`, opacity: card}}>
          <TornSheet x={-14} y={-14} w={W + 28} h={(W - 40) * 0.62 + 68} color="#FFFFFF" seed="choir-card" amp={8} />
          <div style={{position: 'absolute', left: 6, top: 6}}>
            <ChoirLoft w={W - 12} />
          </div>
        </div>
        <GlowRing x={heroX} y={heroY} r={88} delay={22} />
      </PhotoOr>
      <Tag x={CX} y={190} text="1974 · מקהלת הכנסייה" delay={4} />
      <Tag x={heroX} y={cardY + (W - 40) * 0.62 + 90} text="ארט פריי" delay={26} rotate={2} size={54} />
    </AbsoluteFill>
  );
};

/* 7. THE BOOKMARK KEEPS FALLING OUT (falls right-to-left) */
const BookStage: React.FC<{kind: 'peri' | 'light'; seed: string; shake?: number; children?: React.ReactNode}> = ({kind, seed, shake = 0, children}) => (
  <AbsoluteFill>
    <Plate kind={kind} seed={seed} />
    <div style={{position: 'absolute', left: CX - 340, top: 640, transform: `rotate(${-3 + shake}deg)`, transformOrigin: '50% 60%', filter: sticker(8, 0.32)}}>
      <Hymnal w={680} />
    </div>
    {children}
  </AbsoluteFill>
);

const bookShake = (f: number, start: number) => {
  const t = f - start;
  return t < 0 ? 0 : Math.sin(t / 1.6) * 5 * Math.exp(-t / 10);
};

export const SceneFalls: React.FC = () => {
  const f = useCurrentFrame();
  const shake = bookShake(f, 18);
  const out = interpolate(f, [20, 34], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const fall = interpolate(f, [34, 66], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const x = CX - 30 - fall * 380;
  const y = 470 - out * 120 + fall * 1100;
  return (
    <BookStage kind="peri" seed="falls" shake={shake}>
      <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${shake - fall * 110}deg)`, filter: sticker(4, 0.3)}}>
        <Bookmark />
      </div>
    </BookStage>
  );
};

/* 8. THE WEAK GLUE: bookmark returns with a glue band and stays put */
export const SceneStays: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const press = spring({frame: f - 4, fps, config: {damping: 14}});
  const y = interpolate(press, [0, 1], [-340, 470]);
  const shake = bookShake(f, 30);
  return (
    <BookStage kind="light" seed="stays" shake={shake}>
      <div style={{position: 'absolute', left: CX - 30, top: y, transform: `rotate(${shake * 0.9}deg)`, filter: sticker(4, 0.3)}}>
        <Bookmark glue={1} />
      </div>
    </BookStage>
  );
};

/* 9. THE NOTE IS BORN: bookmark becomes a yellow sticky note */
export const SceneBorn: React.FC = () => {
  const f = useCurrentFrame();
  const m = interpolate(f, [8, 26], [0, 1], {...clamp, easing: ease});
  const w = interpolate(m, [0, 1], [70, 300]);
  const h = interpolate(m, [0, 1], [300, 300]);
  const x = interpolate(m, [0, 1], [CX - 30, CX + 20]);
  const y = interpolate(m, [0, 1], [470, 700]);
  return (
    <BookStage kind="light" seed="born">
      <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${m * 5}deg)`, filter: sticker(5, 0.3)}}>
        <Bookmark w={w} h={h} glue={1} yellow={m} />
      </div>
      <GlowRing x={x + w / 2} y={y + h / 2} r={210} delay={20} />
      <Tag x={CX} y={190} text="1980 · בחנויות בכל ארה״ב" delay={40} />
    </BookStage>
  );
};

/* 10. CALLBACK: the hook pad; the top note peels off, a bulb is drawn on it and lights up */
export const SceneCallback: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const S = 600;
  const x = CX - S / 2;
  const y = 330;
  const peel = interpolate(f, [6, 20], [0, 1], {...clamp, easing: ease});
  const off = interpolate(f, [16, 36], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const draw = interpolate(f, [38, 60], [0, 1], clamp);
  const lit = interpolate(f, [70, 80], [0, 1], clamp);
  // the peeled note travels right-to-left and up, keeping hold into the end card
  const nx = x - off * 120;
  const ny = y - off * 30;
  return (
    <AbsoluteFill>
      <Plate kind="light" seed="hook" />
      <PhotoOr path="postit/photos/hook.jpg" duration={dur}>
        <div style={{position: 'absolute', left: x + 40, top: y + 60, transform: `rotate(4deg) scale(${interpolate(f, [0, dur], [1, 1.03])})`, filter: sticker(9, 0.32)}}>
          <PostItPad size={S} peel={off > 0 ? 0 : peel} />
        </div>
      </PhotoOr>
      {off > 0 && (
        <div style={{position: 'absolute', left: nx, top: ny, transform: `rotate(${-3 - off * 9}deg) scale(${1 + off * 0.04})`, filter: sticker(6, 0.25 + off * 0.2)}}>
          <Note size={S - 20} />
          <div style={{position: 'absolute', left: (S - 20) * 0.2, top: (S - 20) * 0.2}}>
            <DrawnBulb size={(S - 20) * 0.6} draw={draw} lit={lit} />
          </div>
        </div>
      )}
      {lit > 0 && <GlowRing x={nx + (S - 20) / 2 - 40} y={ny + (S - 20) / 2 - 20} r={200} delay={72} />}
    </AbsoluteFill>
  );
};
