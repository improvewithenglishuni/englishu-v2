import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_KEY, MEDIA} from '../theme';
import {BeeTop} from '../components/bee';
import {DanceFigure} from '../components/dance';
import {Comb, Label, Sticker, keyWordStyle} from '../components/props';
import {exitOut, pop, prog} from '../components/anim';
import {SlotTag} from './S1Hook';

const bez = (t: number, p0: number, p1: number, p2: number, p3: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

/** Beat 4: CONVEY. Letters travel along the dance path from the dancer to the followers. */
export const S4Convey: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const word = 'CONVEY';
  const size = 210;
  const letterW = 118;
  const x0 = 540 - (letterW * word.length) / 2;
  const dancer = {x: 230, y: 1060};
  const gloss = pop(f, 62, 12);
  const dW = Math.sin(f * 1.3) * 12;
  const followers = [
    {x: 760, y: 980, r: -120},
    {x: 900, y: 1110, r: -100},
    {x: 780, y: 1200, r: -70},
  ];
  // the travelling path (drawn faintly first)
  const P1 = {x: 120, y: 520}, P2 = {x: 980, y: 1260};
  const trail = prog(f, 0, 18);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path
          d={`M ${dancer.x} ${dancer.y} C ${P1.x} ${P1.y}, ${P2.x} ${P2.y - 500}, ${540} ${560}`}
          stroke={C.amber}
          strokeWidth={10}
          strokeDasharray="2 26"
          strokeLinecap="round"
          fill="none"
          opacity={0.9 * trail}
        />
      </svg>
      <div style={{position: 'absolute', left: dancer.x - 55, top: dancer.y - 90, transform: `rotate(${20 + dW}deg) scale(${pop(f, 0)})`}}>
        <BeeTop size={110} id="s4d" />
      </div>
      {followers.map((b, k) => (
        <div key={k} style={{position: 'absolute', left: b.x - 45, top: b.y - 75, transform: `rotate(${b.r + Math.sin(f / 5 + k) * 4}deg) scale(${pop(f, 3 + k * 3)})`}}>
          <BeeTop size={90} id={`s4f${k}`} />
        </div>
      ))}
      {word.split('').map((ch, i) => {
        const t = prog(f, 6 + i * 5, 34 + i * 5);
        const tx = x0 + i * letterW + letterW / 2;
        const ty = 640;
        const x = bez(t, dancer.x, P1.x, P2.x, tx);
        const y = bez(t, dancer.y, P1.y, P2.y - 500, ty);
        const sc = interpolate(t, [0, 0.6, 1], [0.25, 0.7, 1]);
        const land = pop(f, 34 + i * 5, 8);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${sc * (t >= 1 ? 0.92 + 0.08 * land : 1)}) rotate(${(1 - t) * (i % 2 ? 30 : -30)}deg)`,
              opacity: t > 0 ? 1 : 0,
              ...keyWordStyle(size),
              color: C.amber,
            }}
          >
            {ch}
          </div>
        );
      })}
      <Label size={50} rot={-2} dir="rtl" style={{left: 540, top: 800, transform: `translateX(-50%) rotate(-2deg) scale(${gloss})`}}>
        <span dir="ltr" style={{fontFamily: FONT_KEY, fontWeight: 400, letterSpacing: 1}}>convey</span> = להעביר מסר
      </Label>
    </AbsoluteFill>
  );
};

/** Drawn stand-in for the real hive footage: dark comb, a dancer and followers. */
const HiveStandIn: React.FC<{f: number}> = ({f}) => {
  const followers = Array.from({length: 9}).map((_, k) => {
    const a = (k / 9) * Math.PI * 2;
    return {x: 540 + Math.cos(a) * (300 + 60 * random(`hv${k}`)), y: 820 + Math.sin(a) * (330 + 60 * random(`hy${k}`)), r: (a * 180) / Math.PI - 90 + 180};
  });
  const beeAt = (f / 120) % 1;
  return (
    <AbsoluteFill style={{background: C.hive}}>
      <Comb w={1080} h={1920} r={60} fill="#6B4519" stroke="#3D250F" honey={0.3} seed="hvcomb" />
      {followers.map((b, k) => (
        <div key={k} style={{position: 'absolute', left: b.x - 45, top: b.y - 75, transform: `rotate(${b.r + Math.sin(f / 6 + k) * 6}deg)`}}>
          <BeeTop size={90} id={`hvf${k}`} dim />
        </div>
      ))}
      <DanceFigure size={760} draw={0} beeAt={beeAt} style={{left: 160, top: 440, transform: 'scale(1.3)'}} id="hvd" />
    </AbsoluteFill>
  );
};

/** Antennae close-up stand-in: follower's head with long antennae on the dancer's waggling abdomen. */
const AntennaeStandIn: React.FC<{f: number}> = ({f}) => {
  const w = Math.sin(f * 1.3) * 10;
  const tw = Math.sin(f * 0.9) * 4;
  return (
    <AbsoluteFill style={{background: '#3A2410'}}>
      <Comb w={780} h={720} r={44} fill="#7A5020" stroke="#3D250F" honey={0.25} seed="antcomb" />
      {/* dancer abdomen (left), waggling */}
      <svg width={780} height={720} style={{position: 'absolute'}}>
        <g transform={`translate(${170 + w} 380) rotate(${-10 + w / 2})`}>
          <ellipse rx="190" ry="130" fill={C.amber} />
          {[-90, -20, 50].map((x) => (
            <rect key={x} x={x} y="-140" width="36" height="280" fill={C.ink} />
          ))}
        </g>
        {/* vibration arcs */}
        {[0, 1, 2].map((k) => {
          const ph = ((f / 10 + k / 3) % 1);
          return (
            <path
              key={k}
              d={`M ${400 + ph * 40} ${260 - ph * 50} q ${30 + ph * 30} ${120 + ph * 30} 0 ${240 + ph * 100}`}
              stroke={C.amber}
              strokeWidth={8}
              fill="none"
              opacity={1 - ph}
              strokeLinecap="round"
            />
          );
        })}
        {/* follower head (right) with antennae reaching to the dancer */}
        <g transform="translate(640 400)">
          <path d={`M -60 -40 Q -170 ${-150 + tw} ${-260 + w} ${-60 + tw}`} stroke={C.ink} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d={`M -50 10 Q -170 ${60 - tw} ${-250 + w} ${70 - tw}`} stroke={C.ink} strokeWidth="12" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="0" rx="130" ry="150" fill="#C97F22" />
          <ellipse cx="10" cy="-30" rx="58" ry="84" fill="#27261F" />
          <ellipse cx="-6" cy="-70" rx="14" ry="22" fill="#fff" opacity="0.5" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Beat 5: total darkness; full-frame hive (real footage), then a die-cut antennae close-up. */
export const S5Dark: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const push = 1.04 + 0.08 * prog(f, 0, dur);
  const dark = interpolate(f, [0, 20, 56], [0, 0.15, 0.62], {extrapolateRight: 'clamp'});
  const stick = pop(f, 112, 12);
  const into = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${push})`, clipPath: `circle(${into * 150}% at 50% 50%)`}}>
        {MEDIA.waggleVideo ? (
          <OffthreadVideo
            src={staticFile(MEDIA.waggleVideo)}
            startFrom={Math.round(MEDIA.waggleVideoStart * 30)}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.05)'}}
          />
        ) : (
          <HiveStandIn f={f} />
        )}
        <AbsoluteFill
          style={{background: `radial-gradient(ellipse at 50% 42%, rgba(20,12,5,${dark * 0.55}) 20%, rgba(20,12,5,${Math.min(0.95, dark * 1.4)}) 75%)`}}
        />
      </AbsoluteFill>
      {!MEDIA.waggleVideo && <SlotTag text="real footage: waggle dance" style={{left: 60, top: 230}} />}
      {f >= 108 && (
        <div style={{position: 'absolute', left: 150, top: 340, transform: `scale(${stick}) rotate(${-3 + (1 - stick) * 8}deg)`}}>
          <Sticker src={MEDIA.antennae} cutout={MEDIA.antennaeIsCutout} w={780} h={720} seed="ant">
            <AntennaeStandIn f={f} />
          </Sticker>
          {!MEDIA.antennae && <SlotTag text="real photo: antennae close-up" style={{left: 220, top: 700}} />}
        </div>
      )}
    </AbsoluteFill>
  );
};
