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

export const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const cam = prog(f, 0, dur, (t) => t);
  // the forager flies in from the left and down to the hive entrance
  const fly = prog(f, 0, 36);
  const fx = interpolate(fly, [0, 0.5, 1], [-80, 520, HIVE.entrance.x]);
  const fy = interpolate(fly, [0, 0.5, 1], [520, 760, HIVE.entrance.y]) - Math.sin(fly * Math.PI) * 80;
  const fs = interpolate(fly, [0, 0.8, 1], [1, 0.55, 0.05]);
  // camera pushes in toward the entrance as she goes inside...
  const push = interpolate(f, [26, 46], [1, 1.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t)});
  // ...then a magnifying glass grows out of the entrance: we are looking inside the hive
  const zoom = prog(f, 38, 54, (t) => 1 - (1 - t) ** 3);
  const R = 330;
  const lx = interpolate(zoom, [0, 1], [HIVE.entrance.x, 430]);
  const ly = interpolate(zoom, [0, 1], [HIVE.entrance.y - 60, 700]);
  const ls = interpolate(zoom, [0, 0.85, 1], [0.08, 1.04, 1]);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${HIVE.entrance.x}px ${HIVE.entrance.y - 60}px`}}>
        <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
        {fs > 0.06 && (
          <div style={{position: 'absolute', left: fx - 100, top: fy - 70, transform: `scale(${fs}) rotate(${interpolate(fly, [0, 1], [8, 30])}deg)`}}>
            <Bee size={200} flap id="s1fly" />
          </div>
        )}
      </AbsoluteFill>
      {f >= 38 && (
        <Lens cx={lx} cy={ly} r={R} s={ls} handle>
          <BeeLensContent f={f} r={R} dancing={f > 50} startDance={50} />
        </Lens>
      )}
    </AbsoluteFill>
  );
};
