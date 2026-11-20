import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_HE, FONT_KEY, MEDIA} from '../theme';
import {DanceFigure} from '../components/dance';
import {Branch, Label, Pin, keyWordStyle} from '../components/props';
import {TornStrip} from '../components/paper';
import {exitOut, pop, prog} from '../components/anim';
import {BeeLensContent, HIVE} from './S1Hook';
import {ParkWorld} from '../components/park';
import {Lens} from '../components/explain';
import {BeeTop} from '../components/bee';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&?@*';

/** Beat 6: DECIPHER. A scrambled scribble resolves letter by letter into the word. */
export const S6Decipher: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const word = 'DECIPHER';
  const letterW = 112;
  const x0 = 540 - (letterW * word.length) / 2;
  const scribble = prog(f, 0, 18);
  const lockAt = (i: number) => 22 + i * 6;
  const resolved = word.split('').filter((_, i) => f >= lockAt(i)).length / word.length;
  // scribble: a tangle of loops across the word area
  const pts = Array.from({length: 26}, (_, k) => {
    const x = 120 + (k / 25) * 840;
    const y = 640 + Math.sin(k * 1.7) * 90 + (random(`sc${k}`) - 0.5) * 120;
    return `${x.toFixed(0)},${y.toFixed(0)}`;
  });
  const gloss = pop(f, 76, 12);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="s6clip">
            <rect x={120 + resolved * 840} y={0} width={1080} height={1920} />
          </clipPath>
        </defs>
        <polyline
          points={pts.join(' ')}
          stroke={C.ink}
          strokeWidth={10}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={4000}
          strokeDashoffset={4000 * (1 - scribble)}
          clipPath="url(#s6clip)"
          opacity={0.85}
        />
      </svg>
      {word.split('').map((ch, i) => {
        const locked = f >= lockAt(i);
        const started = f >= 14 + i * 2;
        const g = GLYPHS[Math.floor(random(`g${i}-${Math.floor(f / 2)}`) * GLYPHS.length)];
        const land = pop(f, lockAt(i), 8);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + i * letterW + letterW / 2,
              top: 645,
              transform: `translate(-50%, -50%) scale(${locked ? 0.9 + 0.1 * land : 0.8}) rotate(${locked ? 0 : (random(`r${i}-${Math.floor(f / 2)}`) - 0.5) * 30}deg)`,
              ...keyWordStyle(190),
              color: locked ? C.amber : C.cream,
              opacity: started ? (locked ? 1 : 0.55) : 0,
            }}
          >
            {locked ? ch : g}
          </div>
        );
      })}
      <Label size={50} rot={2} style={{left: 540, top: 820, transform: `translateX(-50%) rotate(2deg) scale(${gloss})`}}>
        <span dir="ltr" style={{fontFamily: FONT_KEY, fontWeight: 400, letterSpacing: 1}}>decipher</span> = לפענח
      </Label>
    </AbsoluteFill>
  );
};

/** Beat 7: callback. Back in the park; the bee in the lens again; the decoded dance on a paper card, stamped. */
export const S7Callback: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur, 8);
  const cam = 0.4 + 0.6 * prog(f, 0, dur, (t) => t);
  const stamp = interpolate(f, [40, 47], [2.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stampO = f >= 40 ? 1 : 0;
  const shake = f >= 47 && f < 53 ? Math.sin(f * 3) * 6 : 0;
  const card = pop(f, 0, 14);
  const R = 300;
  return (
    <AbsoluteFill style={{opacity: out, transform: `translateX(${shake}px)`}}>
      <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
      <Branch style={{left: -360, top: -170, transform: `scale(0.82) scaleX(-1) rotate(${Math.sin(f / 20) * 1.2}deg)`}} />
      <Lens cx={380} cy={900} r={R} s={pop(f, 4, 13)} px={HIVE.entrance.x - 20} py={HIVE.y + 200}>
        <BeeLensContent f={f} r={R} dancing startDance={0} clipFrom={45} />
      </Lens>
      {/* the decoded dance on a taped squiggle-paper card (top right) */}
      <div style={{position: 'absolute', left: 520, top: 150, width: 500, height: 560, transform: `rotate(5deg) scale(${card})`}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', boxShadow: '0 18px 26px rgba(30,20,10,0.3)', border: '10px solid #fff'}}>
          <Img src={staticFile('squiggle.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <DanceFigure size={760} draw={1} beeAt={(f / 70) % 1} beeSize={70} id="s7" style={{left: 240 - 380, top: 270 - 380, transform: 'scale(0.55)'}} />
        </div>
        <div style={{position: 'absolute', left: 170, top: -20, width: 160, height: 44, background: 'rgba(230,220,190,0.85)', transform: 'rotate(-4deg)'}} />
        <div
          style={{
            position: 'absolute',
            left: 250,
            top: 280,
            opacity: stampO,
            transform: `translate(-50%, -50%) rotate(-14deg) scale(${stamp})`,
            border: `9px solid ${C.stampRed}`,
            borderRadius: 10,
            padding: '6px 22px',
            fontFamily: FONT_KEY,
            fontSize: 86,
            color: C.stampRed,
            letterSpacing: 4,
            background: 'rgba(250,247,240,0.35)',
            mixBlendMode: 'multiply',
          }}
        >
          DECIPHERED
        </div>
        <div style={{position: 'absolute', left: 300, top: 40, transform: `scale(${pop(f, 92, 9)})`}}>
          <Pin size={96} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Brand end card (brand navy/red only here). */
export const EndCard: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const page = interpolate(f, [0, 10], [1920, 0], {extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
  const logo = pop(f, 8, 10);
  const h1 = pop(f, 14, 13);
  const bar = prog(f, 24, 34);
  const cta = pop(f, 38, 11);
  const push = 1 + 0.04 * prog(f, 0, 81);
  return (
    <AbsoluteFill style={{background: '#0E1430'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
        }}
      />
      <AbsoluteFill style={{transform: `translateY(${page}px) scale(${push})`}}>
        <TornStrip w={980} h={1500} x={50} y={200} rot={-1.5} color={C.brandCream} seed="endpage" stipple={false} />
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
          <Img src={staticFile('logo-cut.png')} style={{width: 480, display: 'block'}} />
          <div style={{position: 'absolute', left: 150, top: -18, width: 170, height: 46, background: 'rgba(230,220,190,0.8)', transform: 'rotate(-4deg)'}} />
        </div>
        <div
          dir="rtl"
          style={{position: 'absolute', width: 1080, top: 900, textAlign: 'center', fontFamily: FONT_HE, fontWeight: 900, fontSize: 92, color: C.navy, transform: `scale(${h1})`}}
        >
          עוד עובדה מעניינת.
        </div>
        <div style={{position: 'absolute', left: 120, top: 1040, width: 840, height: 130, overflow: 'hidden'}}>
          <div
            dir="rtl"
            style={{
              position: 'absolute',
              inset: 0,
              background: C.navy,
              color: C.brandCream,
              fontFamily: FONT_HE,
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
            fontFamily: FONT_HE,
          }}
        >
          <div dir="rtl" style={{fontWeight: 800, fontSize: 58, color: C.navy}}>
            לעוד כאלה ← עקבו
          </div>
          <div dir="ltr" style={{fontWeight: 800, fontSize: 52, color: C.red, marginTop: 6}}>
            @improve.with.englishu
          </div>
        </div>
        <div style={{position: 'absolute', left: 160, top: 1500, transform: `rotate(30deg) scale(${cta})`}}>
          <BeeTop size={90} id="endbee" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
