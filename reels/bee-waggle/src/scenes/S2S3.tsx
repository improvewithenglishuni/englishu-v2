import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {BeeTop} from '../components/bee';
import {DanceFigure} from '../components/dance';
import {Comb, Flower, Hive, Label, Pin, Sun} from '../components/props';
import {TornStrip} from '../components/paper';
import {exitOut, pop, prog, zigzag} from '../components/anim';

/** Beat 2: "It's not a happy dance. It's an address." Figure-eight drawn in marker, then a pin. */
export const S2Address: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const panel = pop(f, 0, 14);
  const draw = prog(f, 4, 50);
  const pin = pop(f, 46, 9);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <TornStrip
        w={940}
        h={940}
        x={70}
        y={250}
        rot={2}
        seed="s2panel"
        style={{transform: `rotate(2deg) scale(${panel})`}}
      />
      <DanceFigure size={760} draw={draw} beeAt={draw} style={{left: 160, top: 340}} id="s2" />
      <div
        style={{
          position: 'absolute',
          left: 540 - 60,
          top: 720 - 180 - 156,
          transform: `translateY(${(1 - pin) * -160}px) scale(${Math.max(0, pin)})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Pin size={120} />
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
    strokeDasharray={dash ? '4 22' : undefined}
  />
);

/** Angle arc from "up" to angle a (deg, clockwise), drawn by p. */
const Arc: React.FC<{cx: number; cy: number; r: number; a: number; p: number}> = ({cx, cy, r, a, p}) => {
  const end = ((a * p - 90) * Math.PI) / 180;
  const x = cx + Math.cos(end) * r, y = cy + Math.sin(end) * r;
  if (p <= 0.01) return null;
  return <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${x} ${y}`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
};

const ANG = 40;

/** Beat 3: angle = direction relative to the sun; waggle length = distance. */
export const S3Diagram: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const SPLIT = 105; // part A (angle) -> part B (distance)
  const aOut = interpolate(f, [SPLIT - 8, SPLIT], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rad = (ANG * Math.PI) / 180;

  // ---- Part A: outside view (top) mirrors onto the comb (bottom)
  const hive = {x: 540, y: 690};
  const L = 400;
  const flower = {x: hive.x + Math.sin(rad) * L, y: hive.y - Math.cos(rad) * L};
  const comb = {x: 540, y: 1120}; // dancer start on comb
  const run = 300;
  const runEnd = {x: comb.x + Math.sin(rad) * run, y: comb.y - Math.cos(rad) * run};
  const beeP = prog(f, 62, 100);
  const zz = zigzag(comb.x, comb.y, runEnd.x, runEnd.y, 12, 14);
  const beeIdx = Math.min(zz.length - 1, Math.floor(beeP * (zz.length - 1)));
  const combPanel = pop(f, 36, 14);

  // ---- Part B: short vs long waggle
  const b1 = pop(f, SPLIT + 4, 13);
  const b2 = pop(f, SPLIT + 44, 13);
  const shortRun = prog(f, SPLIT + 12, SPLIT + 30);
  const longRun = prog(f, SPLIT + 52, SPLIT + 84);

  const Row: React.FC<{y: number; s: number; runLen: number; runP: number; dist: number; label: string; seed: string}> = ({
    y,
    s,
    runLen,
    runP,
    dist,
    label,
    seed,
  }) => {
    const pts = zigzag(0, 0, runLen, 0, Math.round(runLen / 26), 16);
    const shown = pts.slice(0, Math.max(1, Math.ceil(runP * pts.length)));
    const last = shown[shown.length - 1];
    return (
      <div style={{position: 'absolute', left: 0, top: y, width: 1080, height: 420, transform: `scale(${s})`, transformOrigin: '50% 50%'}}>
        <TornStrip w={960} h={400} x={60} y={0} rot={seed === 'r1' ? -1.5 : 1.5} seed={seed} />
        {/* comb strip with waggle run */}
        <div style={{position: 'absolute', left: 110, top: 40, width: 860, height: 150, overflow: 'hidden', borderRadius: 6}}>
          <Comb w={860} h={150} r={30} seed={`${seed}c`} honey={0.15} />
        </div>
        <svg width={1080} height={420} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <polyline
            points={shown.map(([x, yy]) => `${150 + x},${115 + yy}`).join(' ')}
            stroke={C.ink}
            strokeWidth={9}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* distance line */}
          <Line x1={190} y1={320} x2={190 + dist} y2={320} p={runP} color={C.amber} w={10} dash />
        </svg>
        <div style={{position: 'absolute', left: 150 + last[0] - 22, top: 115 + last[1] - 36, transform: 'rotate(90deg)'}}>
          <BeeTop size={44} id={`${seed}b`} />
        </div>
        <Hive size={100} style={{left: 110, top: 262}} />
        <Flower size={90} style={{left: 190 + dist * Math.max(runP, 0.001) - 10, top: 275, opacity: runP > 0.05 ? 1 : 0}} />
        <Label size={44} rot={seed === 'r1' ? 3 : -3} style={{right: 70, top: -26}}>
          {label}
        </Label>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < SPLIT && (
        <AbsoluteFill style={{opacity: aOut}}>
          {/* outside: sun, hive, flower */}
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <Line x1={hive.x} y1={hive.y} x2={hive.x} y2={260} p={prog(f, 8, 24)} color={C.ink} w={9} dash />
            <Line x1={hive.x} y1={hive.y} x2={flower.x} y2={flower.y} p={prog(f, 14, 30)} color={C.amber} w={12} />
            <Arc cx={hive.x} cy={hive.y} r={150} a={ANG} p={prog(f, 26, 40)} />
          </svg>
          <Sun size={190} style={{left: 540 - 95, top: 120, transform: `scale(${pop(f, 0)})`}} />
          <Hive size={130} style={{left: hive.x - 65, top: hive.y - 70, transform: `scale(${pop(f, 3)})`}} />
          <Flower size={110} style={{left: flower.x - 55, top: flower.y - 55, transform: `scale(${pop(f, 10)})`}} />

          {/* inside: the same angle on the vertical comb, "up" stands for the sun */}
          <div
            style={{
              position: 'absolute',
              left: 140,
              top: 800,
              width: 800,
              height: 440,
              transform: `scale(${combPanel}) rotate(-1deg)`,
              boxShadow: '0 18px 24px rgba(40,26,12,0.3)',
              border: '12px solid #fff',
              overflow: 'hidden',
            }}
          >
            <Comb w={800} h={440} r={34} seed="s3comb" honey={0.12} />
          </div>
          <svg width={1080} height={1920} style={{position: 'absolute', opacity: combPanel}}>
            <Line x1={comb.x} y1={comb.y} x2={comb.x} y2={860} p={prog(f, 46, 60)} color={C.ink} w={9} dash />
            <polyline
              points={zz
                .slice(0, beeIdx + 1)
                .map(([x, y]) => `${x},${y}`)
                .join(' ')}
              stroke={C.ink}
              strokeWidth={9}
              fill="none"
              strokeLinejoin="round"
            />
            <Arc cx={comb.x} cy={comb.y} r={120} a={ANG} p={prog(f, 70, 86)} />
          </svg>
          <Sun size={80} style={{left: comb.x - 40, top: 818, transform: `scale(${pop(f, 58)})`}} />
          {beeP > 0 && (
            <div
              style={{
                position: 'absolute',
                left: zz[beeIdx][0] - 30,
                top: zz[beeIdx][1] - 50,
                transform: `rotate(${ANG + (beeIdx % 2 ? 12 : -12)}deg)`,
              }}
            >
              <BeeTop size={60} id="s3bee" />
            </div>
          )}
        </AbsoluteFill>
      )}
      {f >= SPLIT - 2 && (
        <AbsoluteFill>
          <Row y={330} s={b1} runLen={180} runP={shortRun} dist={250} label="קרוב" seed="r1" />
          <Row y={820} s={b2} runLen={700} runP={longRun} dist={760} label="רחוק" seed="r2" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
