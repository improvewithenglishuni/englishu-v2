import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DASH, PAPER_SHADOW} from '../theme';
import {Bee, BeeTop} from '../components/bee';
import {DanceFigure} from '../components/dance';
import {Flower, Pin} from '../components/props';
import {ParkWorld} from '../components/park';
import {HiveFrame, Lens} from '../components/explain';
import {exitOut, pop, prog} from '../components/anim';
import {BeeLensContent, HIVE} from './S1Hook';

const bez2 = (t: number, p0: number, p1: number, p2: number) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;

/**
 * Beat 6: "והפענוח עבד: דבורה רובוטית רקדה את הקוד, והדבורים האמיתיות כיוונו את הטיסה לפיו."
 * Part A: the robot bee (on its rod) dances the figure-eight on the comb; real bees gather to read it.
 * Part B: out in the park, real bees fly from the hive along the danced route to the flowers.
 */
export const S8Robot: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const SPLIT = Math.round(dur * 0.5); // on "והדבורים האמיתיות"
  const frameS = pop(f, 0, 14);
  const beeAt = (f / 64) % 1;
  const draw = prog(f, 2, 50, (t) => t);
  const followers = [
    {x: 250, y: 470, r: 135},
    {x: 830, y: 480, r: -135},
    {x: 230, y: 960, r: 45},
    {x: 850, y: 950, r: -45},
    {x: 540, y: 1010, r: 0},
  ];
  // Part B: circle-wipe into the park
  const wipe = prog(f, SPLIT - 2, SPLIT + 12, (t) => 1 - (1 - t) ** 3);
  const route = {x0: HIVE.entrance.x - 20, y0: HIVE.entrance.y - 30, cx: 560, cy: 760, x1: 230, y1: 880};
  const routeDraw = prog(f, SPLIT + 6, SPLIT + 40);
  const routeD = `M ${route.x0} ${route.y0} Q ${route.cx} ${route.cy} ${route.x1} ${route.y1}`;
  return (
    <AbsoluteFill style={{opacity: out}}>
      {f < SPLIT + 14 && (
        <AbsoluteFill>
          <HiveFrame x={90} y={330} w={900} h={780} seed="s8frame" scale={frameS} r={34}>
            <DanceFigure size={760} draw={draw} beeAt={beeAt} robot dashed color="#fff" stroke={DASH.width} beeSize={110} id="s8" style={{left: 436 - 380, top: 358 - 380, transform: 'scale(1.15)'}} />
          </HiveFrame>
          {followers.map((b, k) => {
            const lean = pop(f, 14 + k * 4, 12);
            const dx = (540 - b.x) * 0.12 * lean, dy = (720 - b.y) * 0.12 * lean;
            return (
              <div key={k} style={{position: 'absolute', left: b.x - 45 + dx, top: b.y - 75 + dy, transform: `rotate(${b.r + Math.sin(f / 6 + k) * 5}deg) scale(${frameS})`}}>
                <BeeTop size={90} id={`s8f${k}`} />
              </div>
            );
          })}
        </AbsoluteFill>
      )}
      {f >= SPLIT - 2 && (
        <AbsoluteFill style={{clipPath: `circle(${wipe * 120}% at 50% 55%)`}}>
          <ParkWorld cam={0.3 + 0.4 * prog(f, SPLIT, dur, (t) => t)} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
          {/* the flower patch the dance pointed to */}
          {[[180, 860, 110], [270, 920, 90], [150, 960, 80], [300, 830, 70]].map(([x, y, sz], k) => (
            <Flower key={k} size={sz} style={{left: x - sz / 2, top: y - sz / 2, transform: `scale(${pop(f, SPLIT + 4 + k * 3, 12)})`}} />
          ))}
          {/* the danced route, drawn on from the hive in the white dash style */}
          <svg width={1080} height={1920} style={{position: 'absolute', filter: PAPER_SHADOW}}>
            <defs>
              <mask id="s8routeMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
                <path d={routeD} fill="none" stroke="#fff" strokeWidth={40} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - routeDraw} />
              </mask>
            </defs>
            <path d={routeD} mask="url(#s8routeMask)" fill="none" stroke={DASH.color} strokeWidth={DASH.width} strokeDasharray={DASH.array} strokeLinecap={DASH.cap} />
          </svg>
          {/* three real bees fly the route, one after another */}
          {[0, 1, 2].map((k) => {
            const t = prog(f, SPLIT + 10 + k * 9, SPLIT + 52 + k * 9, (x) => x);
            if (t <= 0 || t >= 1) return null;
            const x = bez2(t, route.x0, route.cx, route.x1), y = bez2(t, route.y0, route.cy, route.y1) - Math.sin(t * Math.PI * 3 + k) * 10;
            const s = interpolate(t, [0, 0.2, 1], [0.2, 0.7, 0.55]);
            return (
              <div key={k} style={{position: 'absolute', left: x - 100, top: y - 70, transform: `scale(${s}) scaleX(-1) rotate(-8deg)`}}>
                <Bee size={200} flap id={`s8fly${k}`} />
              </div>
            );
          })}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** A satellite, drawn flat in the collage style (gold body, blue-grey solar panels). */
const Satellite: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 260, style}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 260 160" style={{position: 'absolute', overflow: 'visible', ...style}}>
    {[0, 1].map((side) => (
      <g key={side} transform={`translate(${side ? 165 : 5} 52)`}>
        <rect width="90" height="56" rx="4" fill="#4D6A8A" stroke="#2B3E55" strokeWidth="3" />
        {[1, 2].map((k) => (
          <line key={`v${k}`} x1={k * 30} y1="0" x2={k * 30} y2="56" stroke="#2B3E55" strokeWidth="2" />
        ))}
        <line x1="0" y1="28" x2="90" y2="28" stroke="#2B3E55" strokeWidth="2" />
        <rect width="90" height="56" rx="4" fill="#fff" opacity="0.12" />
      </g>
    ))}
    <line x1="95" y1="80" x2="165" y2="80" stroke="#7C838A" strokeWidth="5" />
    <rect x="100" y="42" width="60" height="76" rx="6" fill="#D9A441" stroke="#9C7A30" strokeWidth="3" />
    {[58, 74, 90, 106].map((y) => (
      <line key={y} x1="104" y1={y} x2="156" y2={y} stroke="#B8862E" strokeWidth="2" />
    ))}
    <path d="M 130 42 L 130 22" stroke="#7C838A" strokeWidth="4" />
    <path d="M 112 22 Q 130 2 148 22 Z" fill="#E4E8EC" stroke="#7C838A" strokeWidth="3" />
  </svg>
);

/**
 * Beat 7: "בקיצור, מה ש-Waze עושה עם לוויינים, הדבורים עושות עם ריקוד."
 * First half: a satellite beams position to a map pin over the park. Second half: the magnifier
 * opens on the hive and the real dancing bees take over (the callback to the opening).
 */
export const S7Waze: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur, 8);
  const HALF = Math.round(dur * 0.48); // on "הדבורים עושות עם ריקוד"
  const cam = 0.4 + 0.6 * prog(f, 0, dur, (t) => t);
  const sat = pop(f, 0, 14);
  const card = pop(f, 8, 13);
  const away = prog(f, HALF - 6, HALF + 10); // the satellite half steps back
  const satX = 120 + Math.sin(f / 40) * 12;
  const satY = 190;
  const pin = {x: 640, y: 560};
  const R = 320;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
      <AbsoluteFill style={{opacity: 1 - 0.55 * away, transform: `translate(${away * 120}px, ${-away * 90}px) scale(${1 - 0.35 * away})`, transformOrigin: '80% 10%'}}>
        <Satellite size={280} style={{left: satX, top: satY, transform: `scale(${sat}) rotate(-14deg)`}} />
        {/* signal: dashed rings travelling from the satellite to the pin */}
        <svg width={1080} height={1920} style={{position: 'absolute', filter: PAPER_SHADOW}}>
          {[0, 1, 2].map((k) => {
            const t = ((f + k * 12) % 36) / 36;
            const x = interpolate(t, [0, 1], [satX + 140, pin.x]);
            const y = interpolate(t, [0, 1], [satY + 110, pin.y - 40]);
            return (
              <circle key={k} cx={x} cy={y} r={18 + t * 34} fill="none" stroke={DASH.color} strokeWidth={DASH.width} strokeDasharray="14 12" strokeLinecap="round" opacity={(1 - t) * sat * (f > 6 ? 1 : 0)} />
            );
          })}
        </svg>
        {/* a little paper map with the route, the pin on top */}
        <div style={{position: 'absolute', left: pin.x - 170, top: pin.y - 60, width: 340, height: 220, transform: `rotate(6deg) scale(${card})`, boxShadow: '0 14px 22px rgba(30,20,10,0.3)', border: '9px solid #fff', overflow: 'hidden'}}>
          <Img src={staticFile('squiggle.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <svg width={340} height={220} style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M 30 180 C 90 150 110 90 170 100 S 260 60 300 40" fill="none" stroke={C.amber} strokeWidth={9} strokeLinecap="round" />
          </svg>
        </div>
        <div style={{position: 'absolute', left: pin.x + 92, top: pin.y - 150, transform: `scale(${pop(f, 16, 9)})`}}>
          <Pin size={110} />
        </div>
      </AbsoluteFill>
      {f >= HALF - 4 && (
        <Lens cx={400} cy={1000} r={R} s={pop(f, HALF - 4, 13)} px={HIVE.entrance.x - 20} py={HIVE.y + 200} handle>
          <BeeLensContent f={f} r={R} dancing startDance={0} clipFrom={45} />
        </Lens>
      )}
    </AbsoluteFill>
  );
};
