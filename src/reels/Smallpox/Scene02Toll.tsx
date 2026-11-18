import React, {useMemo} from 'react';
import {Crystal, KeyWord, mulberry32, PaperLabel} from '../../kit';
import {Strip} from './paper';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

/** Scenes 2-3 (light world): 300M, a field of paper "people" that then vanishes, and 0. */
export const Scene02Toll: React.FC<SmallpoxProps> = (p) => {
  const people = useMemo(() => {
    const r = mulberry32(33);
    const out: {x: number; y: number; s: number; rot: number; v: number}[] = [];
    while (out.length < 30) {
      const x = 110 + r() * 760;
      const y = 380 + r() * 1100;
      if (y > 640 && y < 1090) continue; // keep the number clear
      out.push({x, y, s: 0.45 + r() * 0.35, rot: (r() - 0.5) * 50, v: out.length % 6});
    }
    return out;
  }, []);
  return (
    <>
      <Strip from={T.armOut} to={T.zeroOut} x={-120} y={560} rotate={9} length={1500} width={170} taper={1.2} seed={11} texture="plate_pale.jpg" />
      {people.map((c, i) => (
        <Crystal key={i} variant={c.v} x={c.x} y={c.y} scale={c.s} rotate={c.rot} at={T.people + i * 2} exitAt={T.tollOut + (i % 10)} />
      ))}
      <KeyWord text={p.toll.text} splitAt={3} x={p.toll.x} y={p.toll.y} scale={p.toll.scale} rotate={p.toll.rotate} at={T.toll} exitAt={T.tollOut} fontSize={340} seed={9} />
      <PaperLabel text="במאה ה-20" fontSize={80} x={p.toll.x} y={p.toll.y + 290} rotate={-3} at={T.tollLabel} exitAt={T.tollOut} seed={3} />
      <PaperLabel text="והיום?" fontSize={96} x={540} y={470} rotate={2} at={T.today} exitAt={T.zeroOut} seed={5} />
      <KeyWord text={p.zero.text} splitAt={1} accent="first" x={p.zero.x} y={p.zero.y} scale={p.zero.scale} rotate={p.zero.rotate} at={T.zero} exitAt={T.zeroOut} fontSize={640} seed={2} />
    </>
  );
};
