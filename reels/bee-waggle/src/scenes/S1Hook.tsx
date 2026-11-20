import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MEDIA} from '../theme';
import {Bee} from '../components/bee';
import {Branch, Comb, Sticker} from '../components/props';
import {TornStrip} from '../components/paper';
import {exitOut, pop, prog, wiggle} from '../components/anim';

/** The hero sticker: a real bee on honeycomb (or the drawn stand-in). Reused in the callback. */
export const BeeOnComb: React.FC<{dancing: boolean; f: number; startDance: number}> = ({dancing, f, startDance}) => {
  const t = Math.max(0, f - startDance);
  const waggle = dancing ? Math.sin(t * 1.35) * 9 : 0;
  const shift = dancing ? Math.sin(t * 1.35) * 8 : 0;
  return (
    <Sticker src={MEDIA.beeOnComb} cutout={MEDIA.beeOnCombIsCutout} w={860} h={760} seed="hero">
      <div style={{position: 'absolute', inset: 0, background: '#E7B867'}}>
        <Comb w={860} h={760} seed="hero-comb" honey={0.3} />
        <div
          style={{
            position: 'absolute',
            left: 170 + shift,
            top: 210,
            transform: `rotate(${-8 + waggle}deg)`,
            transformOrigin: '60% 60%',
          }}
        >
          <Bee size={520} id="hero-bee" />
        </div>
      </div>
    </Sticker>
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

export const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const s = pop(f, 0, 13);
  const push = 1 + 0.07 * prog(f, 0, dur);
  // flying bee leaves the blossom and drops into the hive sticker
  const fly = prog(f, 4, 40);
  const fx = interpolate(fly, [0, 1], [760, 420]);
  const fy = interpolate(fly, [0, 1], [250, 760]) - Math.sin(fly * Math.PI) * 120;
  const fs = interpolate(fly, [0, 0.85, 1], [1, 0.7, 0]);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <TornStrip w={1300} h={300} x={-120} y={1180} rot={-6} seed="s1strip" />
      <Branch style={{left: 330, top: -120, transform: `scale(0.8) rotate(${wiggle(f, 0, 1.5, 2, 60)}deg)`}} />
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 470,
          transform: `scale(${s * push}) rotate(${-3 + wiggle(f, 45, 3, 6, 40)}deg)`,
        }}
      >
        <BeeOnComb dancing={f > 45} f={f} startDance={45} />
      </div>
      {fs > 0.01 && (
        <div style={{position: 'absolute', left: fx, top: fy, transform: `scale(${fs}) rotate(28deg) scaleX(-1)`}}>
          <Bee size={230} flap id="s1fly" />
        </div>
      )}
      {!MEDIA.beeOnComb && <SlotTag text="real photo: bee on honeycomb" style={{left: 150, top: 1180, opacity: s}} />}
    </AbsoluteFill>
  );
};
