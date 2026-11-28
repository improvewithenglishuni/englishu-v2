import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, MEDIA} from '../theme';
import {Bee, BeeTop} from '../components/bee';
import {Comb} from '../components/props';
import {ParkWorld} from '../components/park';
import {Lens} from '../components/explain';
import {exitOut, pop, prog} from '../components/anim';

/** What we see through the lens: a bee dancing on the comb, with followers (or the real photo). */
export const BeeLensContent: React.FC<{f: number; r: number; dancing: boolean; startDance: number; real?: boolean; clipFrom?: number}> = ({
  f,
  r,
  dancing,
  startDance,
  real = true,
  clipFrom = 0,
}) => {
  if (real && MEDIA.comb)
    return (
      <OffthreadVideo
        src={staticFile(MEDIA.comb)}
        startFrom={clipFrom}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 + 0.0008 * f})`}}
      />
    );
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


export const HIVE = {x: 600, y: 820, w: 400, entrance: {x: 760, y: 1282}};

/**
 * Beat 1 (hook): frame 0 is already a large magnifier full of real, moving bees (a strange, real image beats a
 * calm scene in the first second). As the question begins, the magnifier shrinks down onto the hive while the
 * forager flies in, revealing the park; the camera then pushes toward the entrance. The ending loops back to
 * this same hive-and-magnifier shot.
 */
export const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const cam = prog(f, 0, dur, (t) => t);
  // the magnifier: big and full at frame 0, held, then shrinks onto the hive entrance
  const R = 470; // 940 px wide: most of the frame width
  const shrink = prog(f, 16, 50, (t) => t * t * (3 - 2 * t));
  const lx = interpolate(shrink, [0, 1], [540, HIVE.entrance.x]);
  const ly = interpolate(shrink, [0, 1], [820, HIVE.entrance.y - 70]);
  const ls = interpolate(shrink, [0, 1], [1, 0.06]);
  // the forager flies in from the left to the hive entrance as the magnifier lands there
  const fly = prog(f, 22, 60);
  const fx = interpolate(fly, [0, 0.5, 1], [-80, 520, HIVE.entrance.x]);
  const fy = interpolate(fly, [0, 0.5, 1], [520, 760, HIVE.entrance.y]) - Math.sin(fly * Math.PI) * 80;
  const fs = interpolate(fly, [0, 0.8, 1], [1, 0.55, 0.05]);
  // then the camera pushes in toward the entrance
  const push = interpolate(f, [56, dur], [1, 1.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t)});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${HIVE.entrance.x}px ${HIVE.entrance.y - 60}px`}}>
        <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
        {f >= 22 && fs > 0.06 && (
          <div style={{position: 'absolute', left: fx - 100, top: fy - 70, transform: `scale(${fs}) rotate(${interpolate(fly, [0, 1], [8, 30])}deg)`}}>
            <Bee size={200} flap id="s1fly" />
          </div>
        )}
      </AbsoluteFill>
      {ls > 0.07 && (
        <Lens cx={lx} cy={ly} r={R} s={ls} handle>
          <BeeLensContent f={f} r={R} dancing startDance={0} clipFrom={15} />
        </Lens>
      )}
    </AbsoluteFill>
  );
};
