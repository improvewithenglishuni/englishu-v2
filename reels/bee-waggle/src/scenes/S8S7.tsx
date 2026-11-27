import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
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
  const SPLIT = Math.round(dur * 0.52); // on "והדבורים האמיתיות"
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

/** A satellite as a paper cutout: gold body, blue-grey solar panels, white sticker border and soft shadow. */
const Satellite: React.FC<{size?: number; style?: React.CSSProperties}> = ({size = 200, style}) => (
  <svg
    width={size}
    height={size * 0.62}
    viewBox="0 0 260 160"
    style={{
      position: 'absolute',
      overflow: 'visible',
      filter:
        'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 10px 12px rgba(30,40,60,0.35))',
      ...style,
    }}
  >
    {[0, 1].map((side) => (
      <g key={side} transform={`translate(${side ? 165 : 5} 52)`}>
        <rect width="90" height="56" rx="3" fill="#3F5F82" />
        {[1, 2].map((k) => (
          <line key={`v${k}`} x1={k * 30} y1="0" x2={k * 30} y2="56" stroke="#24384F" strokeWidth="2.5" />
        ))}
        <line x1="0" y1="28" x2="90" y2="28" stroke="#24384F" strokeWidth="2.5" />
        <path d="M 0 0 L 90 0 L 90 18 Z" fill="#fff" opacity="0.18" />
      </g>
    ))}
    <line x1="95" y1="80" x2="165" y2="80" stroke="#8A9199" strokeWidth="5" />
    <rect x="100" y="40" width="60" height="80" rx="6" fill="#D9A441" />
    {[56, 72, 88, 104].map((y) => (
      <path key={y} d={`M 104 ${y} q 13 -5 26 0 t 26 0`} stroke="#B8862E" strokeWidth="2" fill="none" />
    ))}
    <rect x="100" y="40" width="60" height="80" rx="6" fill="url(#none)" stroke="#9C7A30" strokeWidth="3" />
    <path d="M 130 40 L 130 20" stroke="#8A9199" strokeWidth="4" />
    <path d="M 110 22 Q 130 0 150 22 Z" fill="#E7EAEE" stroke="#8A9199" strokeWidth="3" />
  </svg>
);

/** A folded paper city map (three panels with fold shading): blocks, roads, a park, a river and the route. */
const FoldedMap: React.FC<{w: number; h: number; route: number; style?: React.CSSProperties}> = ({w, h, route, style}) => {
  const routeD = `M ${w * 0.12} ${h * 0.86} L ${w * 0.12} ${h * 0.58} L ${w * 0.45} ${h * 0.58} L ${w * 0.45} ${h * 0.3} L ${w * 0.72} ${h * 0.3}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', overflow: 'visible', ...style}}>
      <defs>
        <clipPath id="mapclip">
          <rect width={w} height={h} rx="6" />
        </clipPath>
      </defs>
      <g clipPath="url(#mapclip)">
        <rect width={w} height={h} fill="#F4EEE2" />
        {/* city blocks */}
        {Array.from({length: 6}).map((_, i) =>
          Array.from({length: 4}).map((__, j) => (
            <rect key={`${i}-${j}`} x={18 + i * (w / 6)} y={16 + j * (h / 4)} width={w / 6 - 26} height={h / 4 - 24} rx="5" fill="#E6DCC8" />
          )),
        )}
        {/* park and river */}
        <rect x={w * 0.52} y={h * 0.55} width={w * 0.3} height={h * 0.3} rx="18" fill="#B9D9A6" />
        <path d={`M -10 ${h * 0.2} C ${w * 0.25} ${h * 0.05}, ${w * 0.55} ${h * 0.45}, ${w + 10} ${h * 0.12}`} stroke="#9CC3E0" strokeWidth="22" fill="none" />
        {/* main roads */}
        {[0.3, 0.58].map((y) => (
          <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke="#fff" strokeWidth="12" />
        ))}
        {[0.12, 0.45, 0.72].map((x) => (
          <line key={x} x1={w * x} y1="0" x2={w * x} y2={h} stroke="#fff" strokeWidth="12" />
        ))}
        {/* the route, drawn on */}
        <path d={routeD} stroke={C.amber} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - route} />
        <circle cx={w * 0.12} cy={h * 0.86} r="11" fill="#fff" stroke={C.amber} strokeWidth="6" />
        {/* fold shading: three panels */}
        <rect x="0" y="0" width={w / 3} height={h} fill="#000" opacity="0.05" />
        <rect x={(w * 2) / 3} y="0" width={w / 3} height={h} fill="#000" opacity="0.05" />
        <line x1={w / 3} y1="0" x2={w / 3} y2={h} stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
        <line x1={(w * 2) / 3} y1="0" x2={(w * 2) / 3} y2={h} stroke="#000" strokeOpacity="0.12" strokeWidth="2" />
      </g>
    </svg>
  );
};

/**
 * Beat 7: "בקיצור, מה ש-Waze עושה עם לוויינים, הדבורים עושות עם ריקוד."
 * First half (how GPS finds you): three satellites on a dashed orbit each send a range ring; the rings meet
 * at one point and the pin drops there on a folded paper map. Second half: the magnifier opens on the hive's
 * real dancing bees (the callback to the opening).
 */
export const S7Waze: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur, 8);
  const HALF = Math.round(dur * 0.53); // on "הדבורים עושות עם ריקוד"
  const cam = 0.4 + 0.6 * prog(f, 0, dur, (t) => t);
  const away = prog(f, HALF - 6, HALF + 12); // the GPS half steps back
  const pin = {x: 560, y: 700};
  const sats = [
    {x: 150, y: 330, d: 0},
    {x: 540, y: 200, d: 4},
    {x: 930, y: 330, d: 8},
  ];
  const drift = Math.sin(f / 50) * 10;
  const mapIn = pop(f, 0, 14);
  const pinDrop = pop(f, 40, 9);
  const R = 320;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <ParkWorld cam={cam} hiveX={HIVE.x} hiveY={HIVE.y} hiveW={HIVE.w} />
      <AbsoluteFill style={{opacity: 1 - 0.6 * away, transform: `translate(${away * 60}px, ${-away * 260}px) scale(${1 - 0.4 * away})`, transformOrigin: '50% 0%'}}>
        {/* the folded paper map */}
        <div style={{position: 'absolute', left: pin.x - 330, top: pin.y - 230, transform: `rotate(-4deg) scale(${mapIn})`, filter: 'drop-shadow(0 0 0 #fff) drop-shadow(0 16px 20px rgba(30,30,40,0.32))', border: '10px solid #fff', borderRadius: 8}}>
          <div style={{position: 'relative', width: 600, height: 400}}>
            <FoldedMap w={600} h={400} route={prog(f, 8, 40)} />
          </div>
        </div>
        <svg width={1080} height={1920} style={{position: 'absolute', filter: PAPER_SHADOW}}>
          {/* the orbit */}
          <path d="M -60 420 Q 540 40 1140 420" fill="none" stroke={DASH.color} strokeWidth={DASH.width} strokeDasharray={DASH.array} strokeLinecap={DASH.cap} opacity={prog(f, 0, 10)} />
          {/* range rings: each satellite measures its distance; the three rings meet at the pin */}
          {sats.map((s, k) => {
            const r = Math.hypot(pin.x - s.x, pin.y - s.y);
            const p = prog(f, 10 + s.d, 38 + s.d);
            return (
              <circle
                key={k}
                cx={s.x}
                cy={s.y + drift}
                r={r}
                fill="none"
                stroke={DASH.color}
                strokeWidth={DASH.width}
                strokeDasharray={DASH.array}
                strokeLinecap={DASH.cap}
                opacity={p > 0 ? 0.9 : 0}
                style={{clipPath: `circle(${p * 100}% at ${pin.x}px ${pin.y}px)`}}
              />
            );
          })}
          {/* the fix: a pulse where the rings cross */}
          {f > 40 && <circle cx={pin.x} cy={pin.y} r={20 + ((f - 40) % 30) * 2.2} fill="none" stroke={C.stampRed} strokeWidth={4} opacity={1 - ((f - 40) % 30) / 30} />}
        </svg>
        {sats.map((s, k) => (
          <Satellite key={k} size={170} style={{left: s.x - 85, top: s.y - 53 + drift, transform: `scale(${pop(f, s.d, 12)}) rotate(${(k - 1) * 12}deg)`}} />
        ))}
        <div style={{position: 'absolute', left: pin.x - 55, top: pin.y - 140, transform: `translateY(${(1 - pinDrop) * -120}px) scale(${Math.max(0, pinDrop)})`, transformOrigin: '50% 100%'}}>
          <Pin size={110} />
        </div>
      </AbsoluteFill>
      {f >= HALF - 4 && (
        <Lens cx={400} cy={1000} r={R} s={pop(f, HALF - 4, 13)} px={HIVE.entrance.x - 20} py={HIVE.y + 200} handle reveal={prog(f, HALF, HALF + 30)}>
          <BeeLensContent f={f} r={R} dancing startDance={0} clipFrom={45} />
        </Lens>
      )}
    </AbsoluteFill>
  );
};
