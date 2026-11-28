import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, DASH, PAPER_SHADOW} from '../theme';
import {BeeTop} from '../components/bee';
import {DanceFigure} from '../components/dance';
import {Flower, Pin, Sun} from '../components/props';
import {HiveBox} from '../components/park';
import {Arrow, Hand, HiveFrame} from '../components/explain';
import {exitOut, pop, prog, zigzag} from '../components/anim';

/**
 * Beat 2: "It's not a happy dance. It's an address."
 * The figure-eight on a hive frame, every part labelled; the pin lands where the waggle run points.
 */
export const S2Address: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const frame = pop(f, 0, 14);
  const DRAW_END = Math.min(70, dur - 16); // the figure-eight finishes, then the pin lands, before the cut
  const draw = prog(f, 4, DRAW_END, (t) => t);
  const pin = pop(f, DRAW_END + 3, 9); // the pin lands on "כתובת"
  const center = {x: 540, y: 720};
  const sc = 1.15;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <HiveFrame x={90} y={330} w={900} h={780} seed="s2frame" scale={frame} r={34}>
        <DanceFigure size={760} draw={draw} beeAt={draw} dashed color="#fff" stroke={12} beeSize={70} id="s2" style={{left: 436 - 380, top: 358 - 380, transform: `scale(${sc})`}} />
      </HiveFrame>
      {/* the pin: where the waggle run points */}
      <div
        style={{
          position: 'absolute',
          left: center.x - 60,
          top: center.y - 170 * sc - 150,
          transform: `translateY(${(1 - pin) * -160}px) scale(${Math.max(0, pin)})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Pin size={116} />
      </div>
    </AbsoluteFill>
  );
};

/** A straight line drawn on by progress p. */
const Line: React.FC<{x1: number; y1: number; x2: number; y2: number; p: number; color: string; w?: number; dash?: boolean}> = ({
  x1,
  y1,
  x2,
  y2,
  p,
  color,
  w = 10,
  dash,
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x1 + (x2 - x1) * p}
    y2={y1 + (y2 - y1) * p}
    stroke={color}
    strokeWidth={w}
    strokeLinecap="round"
    strokeDasharray={dash ? DASH.array : undefined}
    style={dash ? {filter: PAPER_SHADOW} : undefined}
  />
);

/** Angle arc from "up" to angle a (deg, clockwise), drawn by p. */
const Arc: React.FC<{cx: number; cy: number; r: number; a: number; p: number; color?: string}> = ({cx, cy, r, a, p, color = C.ink}) => {
  const end = ((a * p - 90) * Math.PI) / 180;
  const x = cx + Math.cos(end) * r, y = cy + Math.sin(end) * r;
  if (p <= 0.01) return null;
  return <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${x} ${y}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />;
};

const ANG = 40;
const polar = (cx: number, cy: number, a: number, r: number) => ({x: cx + Math.sin((a * Math.PI) / 180) * r, y: cy - Math.cos((a * Math.PI) / 180) * r});

/**
 * One panel of the distance comparison, at the same scale as the angle diagram: a honeycomb frame where the
 * waggle run grows in orange as the bee waggles, and under it the hive, the distance and the flower it points to.
 */
const DistancePanel: React.FC<{y: number; s: number; runLen: number; runP: number; dist: number; seed: string; f: number}> = ({
  y,
  s,
  runLen,
  runP,
  dist,
  seed,
  f,
}) => {
  const x0 = 170;
  const cy = 190; // run's centre line inside the panel
  const pts = zigzag(0, 0, runLen, 0, Math.max(4, Math.round(runLen / 34)), 22);
  const n = Math.max(1, Math.ceil(runP * (pts.length - 1)) + 1);
  const shown = pts.slice(0, n);
  const last = shown[shown.length - 1];
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: 480, transform: `scale(${s})`, transformOrigin: '50% 40%'}}>
      <HiveFrame x={90} y={0} w={900} h={330} seed={`${seed}c`} r={34} />
      <svg width={1080} height={480} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {/* the waggle run, highlighted in orange, growing as the bee waggles */}
        <polyline points={shown.map(([x, yy]) => `${x0 + x},${cy + yy}`).join(' ')} stroke="#fff" strokeWidth={22} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        <polyline points={shown.map(([x, yy]) => `${x0 + x},${cy + yy}`).join(' ')} stroke={C.amber} strokeWidth={13} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* the distance it encodes: hive -> flower */}
        <g style={{filter: PAPER_SHADOW}}>
          <line x1={215} y1={415} x2={215 + dist * runP} y2={415} stroke={DASH.color} strokeWidth={DASH.width} strokeDasharray={DASH.array} strokeLinecap={DASH.cap} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: x0 + last[0] - 34, top: cy + last[1] - 52, transform: 'rotate(90deg)'}}>
        <BeeTop size={68} id={`${seed}b`} buzz={runP > 0 && runP < 1} />
      </div>
      <HiveBox w={96} style={{left: 105, top: 352}} />
      <Flower size={104} style={{left: 215 + dist * Math.max(runP, 0.001) - 52, top: 363, opacity: runP > 0.02 ? 1 : 0, transform: `scale(${runP >= 1 ? 1 + 0.08 * Math.sin(f / 5) : 1})`}} />
    </div>
  );
};

/** Beat 3: angle = direction relative to the sun; waggle length = distance. */
export const S3Diagram: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const SPLIT = 125; // part A (angle) -> part B (distance), on "והמשך שלו"
  const aOut = interpolate(f, [SPLIT - 8, SPLIT], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const g = (f * 105) / SPLIT; // part A was designed for 105 frames
  // ---- Part A: outside (top) and, at the same time, the same angle on the vertical comb (bottom):
  // the figure-eight dance itself, tilted by the angle, next to an "up = sun" arrow.
  const P = {x: 540, y: 600};
  const sun = {x: 540, y: 170};
  const flower = polar(P.x, P.y, ANG, 330);
  const frameS = pop(g, 0, 14);
  const comb = {x: 540, y: 1040}; // centre of the comb frame
  const figDraw = prog(g, 4, 60, (t) => t);
  const figBee = g < 60 ? figDraw : ((g - 60) / 48) % 1;
  const lbl = polar(P.x, P.y - 40, ANG / 2, 170);
  const lbl2 = polar(comb.x, comb.y, ANG / 2, 165);

  // ---- Part B
  // both panels arrive together; the short run grows first, then the long one on "כמה רחוק", then both hold
  const b1 = pop(f, SPLIT + 2, 13);
  const b2 = pop(f, SPLIT + 5, 13);
  const shortRun = prog(f, SPLIT + 8, SPLIT + 24, (t) => t);
  const longRun = prog(f, SPLIT + 26, SPLIT + 52, (t) => t);

  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < SPLIT && (
        <AbsoluteFill style={{opacity: aOut}}>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <Line x1={P.x} y1={P.y - 40} x2={sun.x} y2={sun.y + 80} p={prog(g, 8, 22)} color={DASH.color} w={DASH.width} dash />
            <Line x1={P.x} y1={P.y - 40} x2={flower.x} y2={flower.y} p={prog(g, 14, 28)} color={C.amber} w={12} />
            <Arc cx={P.x} cy={P.y - 40} r={130} a={ANG} p={prog(g, 26, 38)} />
          </svg>
          <Sun size={170} style={{left: sun.x - 85, top: sun.y - 85, transform: `scale(${pop(g, 0)})`}} />
          <div style={{position: 'absolute', left: P.x - 60, top: P.y - 50, transform: `scale(${pop(g, 3)})`}}>
            <HiveBox w={120} />
          </div>
          <Flower size={104} style={{left: flower.x - 52, top: flower.y - 52, transform: `scale(${pop(g, 12)})`}} />
          <Hand x={lbl.x} y={lbl.y - 40} size={76} lang="en" s={pop(g, 34, 10)} color={C.amberDeep}>
            40°
          </Hand>
          {/* the comb, standing vertically inside the dark hive */}
          <HiveFrame x={140} y={770} w={800} h={530} seed="s3frame" scale={frameS} r={30} />
          <AbsoluteFill style={{opacity: frameS}}>
            {/* "up" on the comb stands for the sun */}
            <svg width={1080} height={1920} style={{position: 'absolute'}}>
              <Line x1={comb.x} y1={comb.y} x2={comb.x} y2={comb.y - 182} p={prog(g, 2, 16)} color="#fff" w={7} />
              {g > 16 && <polyline points={`${comb.x - 15},${comb.y - 160} ${comb.x},${comb.y - 184} ${comb.x + 15},${comb.y - 160}`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
              <Arc cx={comb.x} cy={comb.y} r={125} a={ANG} p={prog(g, 26, 38)} color="#fff" />
            </svg>
            <Sun size={62} style={{left: comb.x - 31, top: comb.y - 244, transform: `scale(${pop(g, 10, 10)})`}} />
            {/* the same figure-eight as before, tilted by the angle */}
            <DanceFigure
              size={760}
              draw={figDraw}
              beeAt={figBee}
              dashed
              color="#fff"
              stroke={DASH.width}
              beeSize={64}
              id="s3fig"
              style={{left: comb.x - 380, top: comb.y - 380, transform: `rotate(${ANG}deg) scale(0.72)`}}
            />
            <Hand x={lbl2.x + 18} y={lbl2.y - 20} size={70} lang="en" s={pop(g, 34, 10)} color="#fff" halo={C.ink}>
              40°
            </Hand>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {f >= SPLIT - 2 && (
        <AbsoluteFill>
          <DistancePanel y={190} s={b1} runLen={190} runP={shortRun} dist={240} seed="r1" f={f} />
          <DistancePanel y={700} s={b2} runLen={700} runP={longRun} dist={700} seed="r2" f={f} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
