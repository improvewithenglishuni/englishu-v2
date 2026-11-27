import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
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
  const letterW = 102;
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
              ...keyWordStyle(180),
              color: locked ? C.key : C.ink,
              opacity: started ? (locked ? 1 : 0.55) : 0,
            }}
          >
            {locked ? ch : g}
          </div>
        );
      })}
      <Label size={50} rot={2} style={{left: 540, top: 820, transform: `translateX(-50%) rotate(2deg) scale(${gloss})`}}>
        <span dir="ltr" style={{fontFamily: FONT_KEY, fontWeight: 400, letterSpacing: 1, color: C.key}}>decipher</span> = לפענח
      </Label>
    </AbsoluteFill>
  );
};

/** Beat 7: callback. Back in the park, looking into the hive again through the magnifying glass. */
export const S7Callback: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur, 8);
  const cam = 0.4 + 0.6 * prog(f, 0, dur, (t) => t);
  const R = 330;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
      <Lens cx={430} cy={720} r={R} s={pop(f, 4, 13)} px={HIVE.entrance.x - 20} py={HIVE.y + 200} handle>
        <BeeLensContent f={f} r={R} dancing startDance={0} clipFrom={45} />
      </Lens>
    </AbsoluteFill>
  );
};

/**
 * The fixed EnglishU end card, used unchanged in every Reel: "Reel outro" v75
 * (englishu-v2, branch claude/lucid-mendel-lnkgiw, end-card/final/englishu-end-card.mp4; 1080x1920, 30 fps, 4.2 s).
 * Its own sound (paper crumple, marker swoops, pen scribble, click) is mixed in by scripts/make_audio.py.
 */
export const EndCard: React.FC<{dur: number}> = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    <OffthreadVideo src={staticFile('media/endcard.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);
