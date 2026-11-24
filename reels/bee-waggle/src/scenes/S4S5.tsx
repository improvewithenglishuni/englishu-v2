import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, DASH, FONT_KEY, MEDIA, PAPER_SHADOW} from '../theme';
import {BeeTop} from '../components/bee';
import {DanceFigure} from '../components/dance';
import {Comb, Label, keyWordStyle} from '../components/props';
import {Hand, Lens} from '../components/explain';
import {exitOut, pop, prog} from '../components/anim';
import DANCER_TRACK from '../data/dancer-track.json';

const bez = (t: number, p0: number, p1: number, p2: number, p3: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

/**
 * Beat 4: CONVEY. Each letter is a message: it flies from the dancer to one of the three followers,
 * the follower "receives" it (a ripple), and only then the letter rises to spell the word up top.
 */
export const S4Convey: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = exitOut(f, dur);
  const word = 'CONVEY';
  const size = 200;
  const letterW = 114;
  const x0 = 540 - (letterW * word.length) / 2;
  const WORD_Y = 430;
  const dancer = {x: 230, y: 1060};
  const dW = Math.sin(f * 1.3) * 12;
  const followers = [
    {x: 780, y: 930, r: -115},
    {x: 920, y: 1080, r: -95},
    {x: 790, y: 1210, r: -70},
  ];
  const T = (i: number) => {
    const leave = LEAD + 4 + i * 5;
    const arrive = leave + 15;
    const rise = arrive + 6;
    return {leave, arrive, rise, land: rise + 15};
  };
  const lastLand = T(word.length - 1).land;
  const gloss = pop(f, lastLand + 3, 12);
  return (
    <AbsoluteFill style={{opacity: out}}>
      {/* faint message routes from the dancer to each follower */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {followers.map((b, k) => (
          <path
            key={k}
            d={`M ${dancer.x + 40} ${dancer.y - 40} Q ${(dancer.x + b.x) / 2} ${Math.min(dancer.y, b.y) - 220} ${b.x - 40} ${b.y - 30}`}
            stroke={DASH.color}
            strokeWidth={DASH.width}
            strokeDasharray={DASH.array}
            strokeLinecap={DASH.cap}
            fill="none"
            opacity={prog(f, 0, 12)}
            style={{filter: PAPER_SHADOW}}
          />
        ))}
      </svg>
      <div style={{position: 'absolute', left: dancer.x - 55, top: dancer.y - 90, transform: `rotate(${20 + dW}deg) scale(${pop(f, 0)})`}}>
        <BeeTop size={110} id="s4d" buzz />
      </div>
      {followers.map((b, k) => {
        // ripple each time this follower receives a letter
        const hits = word.split('').map((_, i) => i).filter((i) => i % 3 === k).map((i) => T(i).arrive);
        const ripples = hits.map((h) => {
          const t = (f - h) / 14;
          if (t < 0 || t > 1) return null;
          return <circle key={h} cx={b.x} cy={b.y} r={40 + t * 70} fill="none" stroke={C.ink} strokeWidth={5 * (1 - t)} opacity={1 - t} />;
        });
        const nod = hits.some((h) => f >= h && f < h + 6) ? 1.12 : 1;
        return (
          <React.Fragment key={k}>
            <svg width={1080} height={1920} style={{position: 'absolute'}}>
              {ripples}
            </svg>
            <div style={{position: 'absolute', left: b.x - 45, top: b.y - 75, transform: `rotate(${b.r + Math.sin(f / 5 + k) * 4}deg) scale(${pop(f, 3 + k * 3) * nod})`}}>
              <BeeTop size={90} id={`s4f${k}`} />
            </div>
          </React.Fragment>
        );
      })}
      {word.split('').map((ch, i) => {
        const {leave, arrive, rise, land} = T(i);
        if (f < leave) return null;
        const fol = followers[i % 3];
        const tx = x0 + i * letterW + letterW / 2;
        let x: number, y: number, sc: number, rot = 0;
        if (f < arrive) {
          // dancer -> follower along an arc (the message being sent)
          const t = prog(f, leave, arrive);
          const cx = (dancer.x + fol.x) / 2, cy = Math.min(dancer.y, fol.y) - 220;
          x = bez2(t, dancer.x + 40, cx, fol.x - 40);
          y = bez2(t, dancer.y - 40, cy, fol.y - 30);
          sc = interpolate(t, [0, 1], [0.18, 0.34]);
          rot = (1 - t) * (i % 2 ? 25 : -25);
        } else if (f < rise) {
          // received: sits on the follower for a beat
          x = fol.x - 40;
          y = fol.y - 30 - (f - arrive) * 1.5;
          sc = 0.34;
        } else {
          // follower -> its place in the word
          const t = prog(f, rise, land);
          x = interpolate(t, [0, 1], [fol.x - 40, tx]);
          y = interpolate(t, [0, 1], [fol.y - 39, WORD_Y]);
          sc = interpolate(t, [0, 1], [0.34, 1]);
        }
        const settle = f >= land ? 0.94 + 0.06 * pop(f, land, 8) : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${sc * settle}) rotate(${rot}deg)`,
              ...keyWordStyle(size),
            }}
          >
            {ch}
          </div>
        );
      })}
      <Label size={50} rot={-2} dir="rtl" style={{left: 540, top: 590, transform: `translateX(-50%) rotate(-2deg) scale(${gloss})`}}>
        <span dir="ltr" style={{fontFamily: FONT_KEY, fontWeight: 400, letterSpacing: 1, color: C.key}}>convey</span> = להעביר מסר
      </Label>
    </AbsoluteFill>
  );
};

/** CONVEY waits for "כלומר," to finish: the first letter leaves the dancer on "Bees". */
const LEAD = 30;

const bez2 = (t: number, p0: number, p1: number, p2: number) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;

/** Drawn stand-in for the real hive footage: dark comb, a dancer and followers. */
const HiveStandIn: React.FC<{f: number}> = ({f}) => {
  const followers = Array.from({length: 9}).map((_, k) => {
    const a = (k / 9) * Math.PI * 2;
    return {x: 540 + Math.cos(a) * (300 + 60 * random(`hv${k}`)), y: 820 + Math.sin(a) * (330 + 60 * random(`hy${k}`)), r: (a * 180) / Math.PI - 90 + 180};
  });
  const beeAt = (f / 120) % 1;
  return (
    <AbsoluteFill style={{background: C.hive}}>
      <Comb w={1080} h={1920} r={58} variant="dark" honey={0.25} seed="hvcomb" />
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
      <Comb w={720} h={720} r={44} variant="dark" honey={0.25} seed="antcomb" />
      {/* dancer abdomen (left), waggling */}
      <svg width={720} height={720} viewBox="40 0 720 720" style={{position: 'absolute'}}>
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
  const LENS = 111; // the magnifier opens just before "הן קוראות את הריקוד"
  const stick = pop(f, LENS + 4, 12);
  const into = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${push})`, clipPath: `circle(${into * 150}% at 50% 50%)`}}>
        <OffthreadVideo
          src={staticFile(MEDIA.hive)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.06)'}}
        />
        <AbsoluteFill
          style={{background: `radial-gradient(ellipse at 50% 42%, rgba(20,12,5,${dark * 0.55}) 20%, rgba(20,12,5,${Math.min(0.95, dark * 1.4)}) 75%)`}}
        />
      </AbsoluteFill>
      {f >= LENS && (
        <>
          <Lens cx={540} cy={720} r={360} s={stick}>
            <OffthreadVideo
              src={staticFile(MEDIA.dancer)}
              muted
              style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)'}}
            />
            {/* the red-dot dancer, tracked frame by frame (src/data/dancer-track.json, from scripts/track_dancer.py) */}
            {(() => {
              const [tx, ty] = DANCER_TRACK[Math.min(DANCER_TRACK.length - 1, f)];
              const x = 360 + (tx - 360) * 1.06, y = 360 + (ty - 360) * 1.06;
              return (
                <svg width={720} height={720} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))'}}>
                  <circle
                    cx={x}
                    cy={y}
                    r={105 * pop(f, LENS + 12, 12)}
                    fill="none"
                    stroke={DASH.color}
                    strokeWidth={DASH.width}
                    strokeDasharray={DASH.array}
                    strokeLinecap={DASH.cap}
                    transform={`rotate(${f * 2} ${x} ${y})`}
                  />
                </svg>
              );
            })()}
          </Lens>
        </>
      )}
    </AbsoluteFill>
  );
};
