import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Cutout, KeyWord, PaperCloud, PaperLabel, Swoosh, TornStrip, asset} from '../../kit';
import type {TestLookProps} from './schema';
import {T} from './timing';

const PLANE_W = 883; // px width of public/assets/cutouts/plane.png
const TRAIL_LEN = 2442; // px length of public/assets/torn/contrail.png

/** Light world: clouds, plane + contrail, hook label, CONTRAIL with swoosh. */
export const SceneSky: React.FC<TestLookProps> = (p) => {
  const frame = useCurrentFrame();
  const a = (p.plane.flightAngle * Math.PI) / 180;
  const hx = Math.cos(a);
  const hy = Math.sin(a);
  // plane travels along its heading: fast arrival, then a slow cruise (never stops dead)
  const arrive = interpolate(frame, [T.planeIn, T.planeArrive], [-1100, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const cruise = interpolate(frame, [T.planeArrive, T.wipe + T.wipeDur], [0, 70], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const along = arrive + cruise;
  const px = p.plane.x + hx * along;
  const py = p.plane.y + hy * along;
  // contrail: a fixed strip in the world whose narrow end sits where the tail ends up
  const tailOff = PLANE_W * p.plane.scale * 0.08; // strip end hides under the fuselage
  const endAlong = 70;
  const ax = p.plane.x + hx * (endAlong - tailOff) + p.contrail.x;
  const ay = p.plane.y + hy * (endAlong - tailOff) + p.contrail.y;
  const len = TRAIL_LEN * p.contrail.scale;
  const reveal = (len - (endAlong - along)) / len;
  const trailAngle = p.plane.flightAngle + 180 + p.contrail.rotate;

  return (
    <>
      {p.clouds.map((c, i) => (
        <PaperCloud key={i} variant={c.variant} x={c.x} y={c.y} scale={c.scale} rotate={c.rotate} at={T.clouds + i * 5} drift={i % 2 ? -5 : 6} />
      ))}
      <TornStrip src={asset('torn/contrail.png')} x={ax} y={ay} rotate={trailAngle} scale={p.contrail.scale} reveal={reveal} revealFrom="end" />
      <Cutout src={asset('cutouts/plane.png')} x={px} y={py} scale={p.plane.scale} rotate={p.plane.rotate} enter="none" at={T.planeIn} />
      <PaperLabel text={p.label.text} x={p.label.x} y={p.label.y} scale={p.label.scale} rotate={p.label.rotate} at={T.label} exitAt={T.labelOut} />
      <KeyWord
        text={p.keyword.text}
        splitAt={p.keyword.splitAt}
        x={p.keyword.x}
        y={p.keyword.y}
        scale={p.keyword.scale}
        rotate={p.keyword.rotate}
        at={T.keyword}
        splitFrame={T.split}
        gap={90}
      />
      <Swoosh x={p.swoosh.x} y={p.swoosh.y} scale={p.swoosh.scale} rotate={p.swoosh.rotate} at={T.swoosh} width={560} />
    </>
  );
};
