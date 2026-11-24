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
  const draw = prog(f, 4, 52, (t) => t);
  const pin = pop(f, 50, 9);
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

/** One row of the distance comparison: waggle run on comb -> how long it lasts -> how far the food is. */
const DistanceRow: React.FC<{y: number; s: number; runLen: number; runP: number; dist: number; label: string; seed: string; f: number}> = ({
  y,
  s,
  runLen,
  runP,
  dist,
  label,
  seed,
  f,
}) => {
  const pts = zigzag(0, 0, runLen, 0, Math.max(4, Math.round(runLen / 26)), 15);
  const shown = pts.slice(0, Math.max(1, Math.ceil(runP * pts.length)));
  const last = shown[shown.length - 1];
  const x0 = 170;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: 420, transform: `scale(${s})`, transformOrigin: '50% 30%'}}>
      <HiveFrame x={110} y={0} w={860} h={170} seed={`${seed}c`} r={28} />
      <svg width={1080} height={420} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polyline points={shown.map(([x, yy]) => `${x0 + x},${104 + yy}`).join(' ')} stroke="#fff" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap={DASH.cap} strokeDasharray={DASH.array} />
        {/* duration bar: how long the waggle lasts */}
        <rect x={x0} y={200} width={Math.max(0, runLen * runP)} height={22} rx={11} fill={C.amber} />
        <circle cx={130} cy={211} r={22} fill="#fff" stroke={C.ink} strokeWidth={5} />
        <line x1={130} y1={211} x2={130 + Math.sin(f / 3) * 14} y2={211 - Math.cos(f / 3) * 14} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        {/* distance to the food */}
        <Line x1={210} y1={330} x2={210 + dist} y2={330} p={runP} color={DASH.color} w={DASH.width} dash />
      </svg>
      <div style={{position: 'absolute', left: x0 + last[0] - 24, top: 104 + last[1] - 36, transform: 'rotate(90deg)'}}>
        <BeeTop size={48} id={`${seed}b`} buzz={runP > 0 && runP < 1} />
      </div>
      <HiveBox w={92} style={{left: 100, top: 272}} />
      <Flower size={86} style={{left: 210 + dist * Math.max(runP, 0.001) - 43, top: 287, opacity: runP > 0.05 ? 1 : 0}} />
    </div>
  );
};

/** Beat 3: angle = direction relative to the sun; waggle length = distance. */
export const S3Diagram: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const SPLIT = 104; // part A (angle) -> part B (distance), on "ואורך הנענוע?"
  const aOut = interpolate(f, [SPLIT - 8, SPLIT], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---- Part A: outside (top) and the same angle on the vertical comb (bottom)
  const P = {x: 540, y: 640};
  const sun = {x: 540, y: 200};
  const flower = polar(P.x, P.y, ANG, 360);
  const frameS = pop(f, 40, 14);
  const comb = {x: 540, y: 1235};
  const runEnd = polar(comb.x, comb.y, ANG, 300);
  const beeP = prog(f, 62, 98);
  const zz = zigzag(comb.x, comb.y, runEnd.x, runEnd.y, 12, 14);
  const beeIdx = Math.min(zz.length - 1, Math.floor(beeP * (zz.length - 1)));
  const lbl = polar(P.x, P.y, ANG / 2, 170);
  const lbl2 = polar(comb.x, comb.y, ANG / 2, 150);

  // ---- Part B
  const b1 = pop(f, SPLIT + 4, 13);
  const b2 = pop(f, SPLIT + 40, 13);
  const shortRun = prog(f, SPLIT + 12, SPLIT + 30);
  const longRun = prog(f, SPLIT + 48, SPLIT + 82);

  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < SPLIT && (
        <AbsoluteFill style={{opacity: aOut}}>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <Line x1={P.x} y1={P.y - 40} x2={sun.x} y2={sun.y + 80} p={prog(f, 8, 22)} color={DASH.color} w={DASH.width} dash />
            <Line x1={P.x} y1={P.y - 40} x2={flower.x} y2={flower.y} p={prog(f, 14, 28)} color={C.amber} w={12} />
            <Arc cx={P.x} cy={P.y - 40} r={130} a={ANG} p={prog(f, 26, 38)} />
          </svg>
          <Sun size={170} style={{left: sun.x - 85, top: sun.y - 85, transform: `scale(${pop(f, 0)})`}} />
          <div style={{position: 'absolute', left: P.x - 60, top: P.y - 50, transform: `scale(${pop(f, 3)})`}}>
            <HiveBox w={120} />
          </div>
          <Flower size={104} style={{left: flower.x - 52, top: flower.y - 52, transform: `scale(${pop(f, 12)})`}} />
          <Hand x={lbl.x} y={lbl.y - 40} size={76} lang="en" s={pop(f, 34, 10)} color={C.amberDeep}>
            40°
          </Hand>
          <Arrow x1={P.x + 150} y1={P.y - 60} x2={comb.x + 150} y2={comb.y - 150} bend={-0.35} p={prog(f, 40, 56)} dash color={DASH.color} w={DASH.width} />
          {/* the comb, standing vertically inside the dark hive */}
          <HiveFrame x={140} y={900} w={800} h={380} seed="s3frame" scale={frameS} r={30} />
          <svg width={1080} height={1920} style={{position: 'absolute', opacity: frameS}}>
            <Line x1={comb.x} y1={comb.y} x2={comb.x} y2={950} p={prog(f, 46, 58)} color="#fff" w={9} />
            {f > 58 && <polyline points={`${comb.x - 16},${972} ${comb.x},${948} ${comb.x + 16},${972}`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <polyline points={zz.slice(0, beeIdx + 1).map(([x, y]) => `${x},${y}`).join(' ')} stroke="#fff" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap={DASH.cap} strokeDasharray={DASH.array} />
            <Arc cx={comb.x} cy={comb.y} r={110} a={ANG} p={prog(f, 70, 84)} color="#fff" />
          </svg>
          <Sun size={74} style={{left: comb.x - 37, top: 912, transform: `scale(${pop(f, 56, 10)})`}} />
          <Hand x={lbl2.x + 14} y={lbl2.y - 24} size={70} lang="en" s={pop(f, 82, 10)} color="#fff" halo={C.ink}>
            40°
          </Hand>
          {beeP > 0 && (
            <div style={{position: 'absolute', left: zz[beeIdx][0] - 30, top: zz[beeIdx][1] - 50, transform: `rotate(${ANG + (beeIdx % 2 ? 12 : -12)}deg)`}}>
              <BeeTop size={60} id="s3bee" buzz />
            </div>
          )}
        </AbsoluteFill>
      )}
      {f >= SPLIT - 2 && (
        <AbsoluteFill>
          <DistanceRow y={250} s={b1} runLen={150} runP={shortRun} dist={230} label="קרוב" seed="r1" f={f} />
          <DistanceRow y={700} s={b2} runLen={620} runP={longRun} dist={640} label="רחוק" seed="r2" f={f} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
