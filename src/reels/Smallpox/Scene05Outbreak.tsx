import React, {useMemo} from 'react';
import {Arrows, Crystal, PaperLabel} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import {Blob, HandRing} from './paper';

const RINGS = [
  {r: 370, n: 19, at: T.ring3, out: T.ringsOut, rot: 0.1},
  {r: 250, n: 13, at: T.ring2, out: T.ringsOut + 10, rot: 0.4},
  {r: 130, n: 7, at: T.ring1, out: T.ringsOut + 20, rot: 0.7},
];

/** Scene 6 (dark world): an outbreak, and rings of vaccinated people closing around it. */
export const Scene05Outbreak: React.FC<SmallpoxProps> = (p) => {
  const cx = p.rings.x;
  const cy = p.rings.y;
  const arrows = useMemo(
    () =>
      Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        return {x1: cx + Math.cos(a) * 470, y1: cy + Math.sin(a) * 470, x2: cx + Math.cos(a) * 405, y2: cy + Math.sin(a) * 405, bend: 0.05};
      }),
    [cx, cy],
  );
  return (
    <>
      <PaperLabel text={p.outbreakLabel.text} font="rubik" dir="ltr" fontSize={70} x={p.outbreakLabel.x} y={p.outbreakLabel.y} scale={p.outbreakLabel.scale} rotate={p.outbreakLabel.rotate} at={T.outbreakLabel} exitAt={T.ringsOut + 20} seed={8} />
      {RINGS.map((g, k) => (
        <React.Fragment key={k}>
          <HandRing cx={cx} cy={cy} r={g.r + 58} at={g.at} exitAt={g.out} seed={k + 1} />
          {Array.from({length: g.n}, (_, i) => {
            const a = (i / g.n) * Math.PI * 2 + g.rot;
            return (
              <Crystal key={i} variant={(i + k) % 6} x={cx + Math.cos(a) * g.r} y={cy + Math.sin(a) * g.r} scale={0.62} rotate={i * 23} at={g.at + 4 + i * 2} exitAt={g.out + (i % 5)} />
            );
          })}
        </React.Fragment>
      ))}
      <Blob x={cx} y={cy} scale={p.rings.scale} at={T.blob} exitAt={T.blobOut} />
      <Arrows arrows={arrows} at={T.arrows} stagger={2} duration={9} strokeWidth={8} exitAt={T.ring1 + 20} />
    </>
  );
};
