import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MEDIA} from '../theme';
import {Bee, BeeTop} from '../components/bee';
import {Branch, Comb} from '../components/props';
import {ParkWorld} from '../components/park';
import {Lens} from '../components/explain';
import {exitOut, pop, prog} from '../components/anim';

/** What we see through the lens: a bee dancing on the comb, with followers (or the real photo). */
export const BeeLensContent: React.FC<{f: number; r: number; dancing: boolean; startDance: number}> = ({f, r, dancing, startDance}) => {
  if (MEDIA.beeOnComb)
    return <Img src={staticFile(MEDIA.beeOnComb)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
  const t = Math.max(0, f - startDance);
  const wag = dancing ? Math.sin(t * 1.6) * 14 : 0;
  const run = dancing ? ((t % 40) / 40) * 120 - 60 : 0;
  const followers = [
    {x: 0.18, y: 0.3, r: 60},
    {x: 0.8, y: 0.28, r: -70},
    {x: 0.2, y: 0.78, r: 110},
    {x: 0.82, y: 0.74, r: -115},
  ];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Comb w={r * 2} h={r * 2} r={46} seed="lens-comb" honey={0.14} />
      {followers.map((b, k) => (
        <div key={k} style={{position: 'absolute', left: b.x * r * 2 - 55, top: b.y * r * 2 - 92, transform: `rotate(${b.r + Math.sin(f / 7 + k) * 5}deg)`}}>
          <BeeTop size={110} id={`lf${k}`} />
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: r - 85 + Math.sin((wag * Math.PI) / 180) * 10,
          top: r - 150 - run,
          transform: `rotate(${wag}deg)`,
        }}
      >
        <BeeTop size={170} id="lens-dancer" buzz={dancing} />
      </div>
    </div>
  );
};

/** A tiny tag that marks a drawn stand-in for real footage/photo (shows only while the slot is empty). */
export const SlotTag: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div
    style={{
      position: 'absolute',
      fontFamily: 'Rubik',
      fontWeight: 700,
      fontSize: 24,
      color: C.ink,
      background: 'rgba(250,247,240,0.85)',
      border: `2px dashed ${C.ink}`,
      padding: '4px 12px',
      ...style,
    }}
  >
    {text}
  </div>
);

export const HIVE = {x: 600, y: 820, w: 400, entrance: {x: 760, y: 1282}};

export const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const cam = prog(f, 0, dur, (t) => t);
  // the forager leaves the blossom and flies down to the hive entrance
  const fly = prog(f, 0, 40);
  const fx = interpolate(fly, [0, 0.5, 1], [220, 640, HIVE.entrance.x]);
  const fy = interpolate(fly, [0, 0.5, 1], [430, 640, HIVE.entrance.y]) - Math.sin(fly * Math.PI) * 60;
  const fs = interpolate(fly, [0, 0.8, 1], [1, 0.55, 0.05]);
  const lens = pop(f, 38, 12);
  const R = 330;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
      <Branch style={{left: -360, top: -170, transform: `scale(0.82) scaleX(-1) rotate(${Math.sin(f / 20) * 1.2}deg)`}} />
      {fs > 0.06 && (
        <div style={{position: 'absolute', left: fx - 100, top: fy - 70, transform: `scale(${fs}) rotate(${interpolate(fly, [0, 1], [10, 30])}deg)`}}>
          <Bee size={200} flap id="s1fly" />
        </div>
      )}
      {f >= 36 && (
        <Lens cx={420} cy={720} r={R} s={lens} px={HIVE.entrance.x - 20} py={HIVE.y + 200}>
          <BeeLensContent f={f} r={R} dancing={f > 50} startDance={50} />
        </Lens>
      )}
      {!MEDIA.beeOnComb && f >= 44 && <SlotTag text="real photo: bee on honeycomb" style={{left: 240, top: 1080}} />}
    </AbsoluteFill>
  );
};
