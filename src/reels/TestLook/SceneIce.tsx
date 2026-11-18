import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arrows, Crystal, KeyWord, SETTLE, TornStrip, mulberry32, radialArrows} from '../../kit';
import type {TestLookProps} from './schema';
import {T} from './timing';

const N = 30;

/** Dark world: a pale torn layer, 30 paper hexagons scattering outward along orange arrows, DISPERSE. */
export const SceneIce: React.FC<TestLookProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cx = p.crystals.x;
  const cy = p.crystals.y;
  const arrows = useMemo(() => radialArrows(cx, cy, 10, 210, 470, 4), [cx, cy]);
  const crystals = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({length: N}, (_, i) => {
      // tight phyllotaxis cluster to start
      const r0 = 44 * Math.sqrt(i + 0.5);
      const a0 = i * 2.39996;
      // fly out along the nearest arrow direction (with a little spread)
      const arrow = arrows[i % arrows.length];
      const a1 = arrow.angle + (rnd() - 0.5) * 0.5;
      const r1 = 330 + rnd() * 470;
      return {
        x0: cx + Math.cos(a0) * r0,
        y0: cy + Math.sin(a0) * r0,
        x1: cx + Math.cos(a1) * r1,
        y1: cy + Math.sin(a1) * r1,
        s: 0.62 + rnd() * 0.42,
        rot0: (rnd() - 0.5) * 20,
        rot1: (rnd() - 0.5) * 70,
        delay: Math.floor(r0 / 30) + Math.floor(rnd() * 4),
        variant: i % 6,
      };
    });
  }, [arrows, cx, cy]);

  return (
    <>
      {/* pale torn paper layer glued across the navy card */}
      <TornStrip x={-120} y={1240} rotate={-24} length={1500} width={330} taper={1.3} seed={9} texture="plate_pale.jpg" />
      <Arrows arrows={arrows} at={T.arrows} stagger={2} duration={9} strokeWidth={9} x={p.arrows.x} y={p.arrows.y} scale={p.arrows.scale} rotate={p.arrows.rotate} />
      {crystals.map((c, i) => {
        const t = spring({frame: frame - T.scatter - c.delay, fps, config: SETTLE, durationInFrames: 40});
        return (
          <Crystal
            key={i}
            variant={c.variant}
            enter="none"
            x={c.x0 + (c.x1 - c.x0) * t}
            y={c.y0 + (c.y1 - c.y0) * t}
            scale={c.s * p.crystals.scale}
            rotate={c.rot0 + (c.rot1 - c.rot0) * t + p.crystals.rotate}
          />
        );
      })}
      <KeyWord
        text={p.disperse.text}
        accent="none"
        x={p.disperse.x}
        y={p.disperse.y}
        scale={p.disperse.scale}
        rotate={p.disperse.rotate}
        at={T.disperse}
        scatterFrame={T.disperseScatter}
        fontSize={170}
        seed={5}
      />
    </>
  );
};
