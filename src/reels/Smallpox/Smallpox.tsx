import React from 'react';
import {loadFont} from '@remotion/fonts';
import {Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  ActionWord,
  Crowd,
  Germs,
  END_CARD_SECONDS,
  EndCard,
  Jagged,
  LineChart,
  NameLabel,
  Person,
  Place,
  ringPositions,
  Ring,
  ScarSticker,
  Scene,
  SansHeading,
  SerifTitle,
  Stamp,
  Sticker,
  Subtitles,
  Syringe,
  Tally,
  themes,
  useUi,
  World,
  WorldMap,
} from '../../kit';
import {Globe} from '../../kit/Globe';
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import caseDots from './caseDots.json';

const s = (sec: number) => Math.round(sec * 30);
const arm = staticFile('assets/vox/arm_hand.png');
const patient = staticFile('assets/vox/patient_full.png');
const jennerSticker = staticFile('assets/vox/jenner_hires_sticker.png');
const milkmaid = staticFile('assets/vox/milkmaid_hq.png');

const cover: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'};

/** 1. HOOK: a black-and-white photo of a real smallpox-vaccine scar appears whole; then the camera zooms all the way into the scar, and only then a red marker circles it. */
const Hook = () => (
  <ScarSticker
    src={staticFile('assets/vox/hook_scar2_bw.png')}
    x={540}
    y={760}
    width={1000}
    aspect={1372 / 1672}
    rotate={-3}
    at={2}
    scarAt={s(0.25)}
    zoomFrom={1}
    zoomTo={3.15}
    zoomDur={s(1.2)}
    scar={{x: 0.5837, y: 0.4869}}
    scarTarget={{x: 540, y: 830}}
    scars={[]}
    marker={{cx: 0.589, cy: 0.4869, scaleX: 2.07, scaleY: 1.78, rot: 8, at: s(1.28), dur: s(0.9)}}
  />
);

/** Pustules that pop up one after another on the SMALLPOX banner (positions relative to the banner centre). */
const BOILS: Array<[number, number, number]> = [
  [-292, -38, 40], [-205, 52, 30], [-118, -62, 34], [-36, 58, 44], [48, -50, 30],
  [128, 62, 36], [214, -30, 46], [296, 44, 32], [-250, 8, 22], [262, -86, 24], [-12, -88, 22],
];
const BannerBoils: React.FC<{x: number; y: number; rotate: number; at: number}> = ({x, y, rotate, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, transform: `rotate(${rotate}deg)`}}>
      {BOILS.map(([bx, by, d], i) => {
        const k = spring({frame: frame - at - i * 2.5, fps, config: {damping: 9, stiffness: 220, mass: 0.6}});
        if (k <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: bx - d / 2, top: by - d / 2, width: d, height: d, borderRadius: '50%',
              transform: `scale(${k})`,
              background: 'radial-gradient(circle at 35% 30%, #FFF6D6 0%, #F0DC9A 38%, #D98B5A 72%, #A8452F 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.45), inset 0 -3px 5px rgba(120,30,20,0.35)',
              border: '2px solid #8E3424',
            }}
          />
        );
      })}
    </div>
  );
};

/** 2. What smallpox looked like: a real historical photo, FULL FRAME. */
const Patient = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 132], [1.0, 1.06], {extrapolateRight: 'clamp'}); // full-frame image: slow zoom
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Img src={patient} style={{...cover, objectPosition: '43% 50%', transform: `scale(${z})`, transformOrigin: '43% 40%'}} />
      <NameLabel x={540} y={1320} line1="SMALLPOX" dir="ltr" fontSize={120} rotate={-2} at={s(2.8)} />
    </div>
  );
};

/** 3. 300,000,000 counts up while narrated, then down to 0 while the crowd disappears. */
const Tally300 = () => (
  <>
    <Crowd x0={40} y0={70} cols={15} rows={28} dx={72} dy={68} size={66} at={2} vanishFrom={s(3.44)} vanishTo={s(5.04)} />
    <Tally peak={300000000} x={540} y={830} fontSize={170} at={2} upAt={s(0.1)} upDur={s(1.4)} downAt={s(3.44)} downDur={s(1.6)} />
    <Globe x={540} y={1200} r={270} at={s(2.9)} />
  </>
);

/** A date typed onto the image with a typewriter: letters strike one by one, uneven ink, speckled. */
loadFont({family: 'Special Elite', url: staticFile('fonts/special-elite-latin-400-normal.woff2'), weight: '400'});
const TypedDate: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, '');
  const rn = (n: number) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <div dir="ltr" style={{position: 'absolute', left: 74, bottom: 70, transform: 'rotate(-1deg)'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id={`ink${id}`} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.35" result="spk" />
          <feComposite in="SourceGraphic" in2="spk" operator="in" result="t" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="w" />
          <feDisplacementMap in="t" in2="w" scale="1.6" />
        </filter>
      </svg>
      <div style={{display: 'flex', filter: `url(#ink${id}) drop-shadow(0 1px 1px rgba(0,0,0,0.6))`, fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 34, color: '#E8E2D0', letterSpacing: 2}}>
        {text.split('').map((ch, i) => {
          const k = Math.min(1, Math.max(0, (frame - (at + i * 4)) / 2));
          const strike = frame >= at + i * 4 && frame < at + i * 4 + 3 ? 1 : 0;
          return (
            <span key={i} style={{display: 'inline-block', opacity: k * (0.78 + 0.22 * rn(i + 1)), transform: `translate(${(rn(i + 5) - 0.5) * 2}px, ${(rn(i + 9) - 0.5) * 5 + strike * 2}px) rotate(${(rn(i + 3) - 0.5) * 5}deg)`}}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 4. Jenner (named on screen) as a die-cut portrait on a newspaper clipping. */
const JennerPortrait = () => (
  <>
    <Sticker src={jennerSticker} x={495} y={745} width={915} aspect={1355 / 1120} rotate={3} at={2}>
      <TypedDate text="1796" at={s(0.9)} />
    </Sticker>
    <NameLabel x={585} y={1335} line1="ד״ר אדוארד ג׳נר" fontSize={88} rotate={-5.5} paper at={s(0.5)} />
  </>
);

/** 5. Milkmaids: cowpox came from the cows. Old photo, FULL FRAME. */
const Milkmaids = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 141], [1.0, 1.07], {extrapolateRight: 'clamp'}); // full-frame image: slow zoom
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Img src={milkmaid} style={{...cover, objectPosition: '64% 50%', transform: `scale(${z})`, transformOrigin: '50% 55%'}} />
    </div>
  );
};

/** 6. TARGET WORD 2: VACCINATION (vacca = cow). The figure is jabbed, a protective outline radiates from its body, and germs bounce off. */
const Vaccination = () => {
  const frame = useCurrentFrame();
  const PX = 540;
  const PY = 1090;
  const SZ = 360;
  const off = {x: 0.411 * SZ, y: 0.2375 * SZ};
  const jab = interpolate(frame, [s(1.3), s(1.6), s(2.15), s(2.55)], [0, 1, 1, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tip = {x: PX - 175 + jab * 100, y: PY - 80 + jab * 62};
  const plungeV = interpolate(frame, [s(1.6), s(2.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <ActionWord text="VACCINATION" mode="pop" color="slate" x={540} y={520} fontSize={146} heavy at={2} actAt={s(1.6)} hiFrom={0} hiTo={4} gloss="vacca = פרה (לטינית)" glossScale={0.5} glossGap={0.95} />
      <NameLabel x={540} y={552} line1="חיסון" fontSize={73} dir="rtl" rotate={-2} at={s(1.6)} />
      <Person x={PX} y={PY} size={560} tone="ink" glow={frame >= s(2.2) ? '#FDF551' : undefined} at={4} />
      <Syringe x={tip.x - off.x} y={tip.y - off.y} size={SZ} rotate={30} color="#9A9DAA" liquid="#FDF551" plunge={plungeV} at={s(0.6)} />
      <Germs cx={PX} cy={PY + 10} rx={200} ry={330} n={12} at={s(2.5)} stagger={2} />
    </>
  );
};

/** WHO emblem + name (white version of the official logo) that pops in. */
const WhoLogo: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 160, mass: 0.7}});
  return (
    <Img
      src={staticFile('assets/vox/who_logo_white.svg')}
      style={{position: 'absolute', left: 540 - 450, top: 290 - 138, width: 900, opacity: 0.5 * Math.min(1, k * 1.4), transform: `scale(${0.88 + 0.12 * Math.min(1, k)})`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))'}}
    />
  );
};

/** 7. WHO 1967 + TARGET WORD 1: ERADICATE (yellow), then the whole word vanishes. */
// tip of the needle rests on the top-left corner of the D in ERADICATE (word centred at 540,820, 150 px)
const DTIP = {x: 418, y: 783};
const Eradicate = () => {
  const frame = useCurrentFrame();
  const SZ = 340;
  const off = {x: 0.411 * SZ, y: 0.2375 * SZ};
  const k = interpolate(frame, [s(1.4), s(1.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ease = 1 - Math.pow(1 - k, 3);
  const tip = {x: DTIP.x - 260 * (1 - ease), y: DTIP.y - 165 * (1 - ease)};
  const plunge = interpolate(frame, [s(1.9), s(2.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <WhoLogo at={2} />
      <SansHeading text="1967" x={540} y={500} fontSize={84} color="white" dir="ltr" at={s(0.3)} />
      <ActionWord text="ERADICATE" mode="vanish" color="yellow" hollow x={540} y={820} fontSize={150} at={s(0.5)} fillAt={s(1.9)} fillFromX={DTIP.x + 40} actAt={s(3.85)} />
      <Syringe x={tip.x - off.x} y={tip.y - off.y} size={SZ} rotate={30} color="#C9CBD6" liquid="#FDF551" plunge={plunge} at={s(1.35)} exitAt={s(3.75)} />
      <SansHeading text="למגר = לעקור מהשורש" x={540} y={1150} fontSize={84} color="white" dir="rtl" at={s(1.3)} />
    </>
  );
};

/** 8. Ring vaccination: the needle moves from person to person; each one lights up when vaccinated. */
const Outbreak = () => {
  const frame = useCurrentFrame();
  const ui = useUi();
  const CX = 540;
  const CY = 800;
  const inner = ringPositions(CX, CY, 220, 5, 0.3);
  const outer = ringPositions(CX, CY, 400, 9, 0.1);
  const stops = [...inner, ...outer];
  const t0 = s(3.87);
  const hop = 5;
  const SIZE = 230;
  const tipOf = (p: {x: number; y: number}) => ({x: p.x - 38, y: p.y - 6});
  const k = Math.max(0, (frame - t0) / hop);
  const i = Math.min(stops.length - 1, Math.floor(k));
  const f = Math.min(1, k - i);
  const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  const a = tipOf(stops[i]);
  const b = tipOf(stops[Math.min(stops.length - 1, i + 1)]);
  const tx = a.x + (b.x - a.x) * e;
  const ty = a.y + (b.y - a.y) * e;
  const off = {x: 0.411 * SIZE, y: 0.2375 * SIZE};
  const visited = (n: number) => frame >= t0 + n * hop + 2;
  return (
    <>
      <Ring points={outer} color={ui.yellow} at={t0 + 66} duration={22} />
      <Ring points={inner} color={ui.yellow} at={t0 + 26} duration={22} />
      {outer.map((p, n) => (
        <Person key={`o${n}`} x={p.x} y={p.y} size={150} tone="white" glow={visited(inner.length + n) ? ui.yellow : undefined} at={4 + n} />
      ))}
      {inner.map((p, n) => (
        <Person key={`i${n}`} x={p.x} y={p.y} size={170} tone="white" glow={visited(n) ? ui.yellow : undefined} at={2 + n} />
      ))}
      <Person x={CX} y={CY} size={230} tone="red" halo={ui.halo} at={6} />
    </>
  );
};

const CASES: [number, number][] = [
  [1967, 132000], [1968, 80020], [1969, 45291], [1970, 33219], [1971, 51993], [1972, 65153],
  [1973, 135853], [1974, 218326], [1975, 19278], [1976, 954], [1977, 3234], [1978, 2], [1979, 0], [1980, 0],
];

/** 9. Reported smallpox cases worldwide fall to zero in 1980 (WHO via Our World in Data). */
const Chart = () => (
  <>
    <SerifTitle text="Reported Smallpox Cases Worldwide" dir="ltr" x={540} y={390} width={980} fontSize={72} color="slate" source="Source: WHO via Our World in Data" fixed />
    <LineChart
      box={{x: 190, y: 520, w: 740, h: 720}}
      points={CASES}
      xDomain={[1967, 1980]}
      yDomain={[0, 230000]}
      xTicks={[{v: 1967, label: '1967'}, {v: 1970, label: '1970'}, {v: 1975, label: '1975'}, {v: 1980, label: '1980'}]}
      yTicks={[{v: 0, label: '0'}, {v: 100000, label: '100K'}, {v: 200000, label: '200K'}]}
      draw={[s(0.3), s(2.4)]}
      end="x"
      at={2}
    />
  </>
);

/** 10. Last natural cases light up, the whole map goes grey, a red classified-style stamp slams on, then only the year. */
const Victory = () => {
  const frame = useCurrentFrame();
  const K = 1.08;
  const S = {x: caseDots.somalia[0] * K, y: 520 + caseDots.somalia[1] * K};
  const C = {x: 540, y: 830};
  const ez = (v: number) => (v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2);
  // dots thin out s(0.5)..s(1.9) until a couple are left near the Horn of Africa; then the camera dives into Somalia
  const zin = ez(Math.min(1, Math.max(0, (frame - s(5.14)) / s(0.7))));
  const zout = ez(Math.min(1, Math.max(0, (frame - s(6.24)) / s(0.7))));
  const m = zin * (1 - zout);
  const z = 1 + 2.5 * m;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${S.x + (C.x - S.x) * m}px, ${S.y + (C.y - S.y) * m}px) scale(${z}) translate(${-S.x}px, ${-S.y}px)`}}>
        <WorldMap
          box={{x: 0, y: 520, w: 1080}}
          highlight={{Somalia: {at: s(5.04), off: s(6.74)}}}
          dots={caseDots.dots}
          dotsAt={s(0.15)}
          dotsFade={[s(3.15), s(4.28)]}
          // (three kept dots removed)
          lastCase={{x: caseDots.somalia[0], y: caseDots.somalia[1], at: s(5.04), off: s(6.74)}}
          greyAt={s(6.24)}
          at={4}
        />
      </div>
      <Stamp text="ERADICATED" x={540} y={800} fontSize={124} rotate={-8} heavy color="#C4302A" at={s(7.23)} />
      <SansHeading text="1980" x={540} y={1290} fontSize={190} color="white" dir="ltr" at={s(6.47)} />
    </>
  );
};


/** 11. Callback to the hook: the black-and-white arm with two vaccine scars (white die-cut outline) bends at the elbow into a strong pose = victory. */
const FlexArm = () => {
  const frame = useCurrentFrame();
  const pop = (a: number, b: number) => Math.min(1, Math.max(0, (frame - a) / (b - a)));
  const back = (v: number) => {
    const c1 = 1.7;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
  };
  const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
  const SC = 0.9; // display scale of the 1348x1184 art
  const W = 1348 * SC;
  const H = 1184 * SC;
  const PIV = {x: 1080 * SC, y: 987 * SC}; // elbow pivot inside the art
  const L = -245;
  const T = 331;
  const tx = -400 * (1 - easeOut(pop(0, s(0.9)))); // arm pushes in from the left
  const angle = 80 * (1 - back(pop(s(0.15), s(0.95)))); // forearm swings from pointing right to upright
  const img: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: W, height: H, display: 'block'};
  return (
    <>
    {/* the crowd from the 300-million scene, saved: a wave of yellow spreads outward from the arm */}
    <Crowd x0={40} y0={70} cols={15} rows={28} dx={72} dy={68} size={66} color="#B9BDD0" at={2} wave={{at: s(0.15), lit: '#EBA800', cx: 540, cy: 950, speed: 1100 / 30}} />
    <div style={{position: 'absolute', left: L + tx, top: T, width: W, height: H, filter: 'drop-shadow(0 18px 20px rgba(0,0,0,0.38))'}}>
      <Img src={staticFile('assets/vox/flex2_up.png')} style={img} />
      <Img src={staticFile('assets/vox/flex2_fore.png')} style={{...img, transformOrigin: `${PIV.x}px ${PIV.y}px`, transform: `rotate(${angle}deg)`}} />
    </div>
    </>
  );
};

/** Smallpox Reel v3: Vox look, hard-cut scenes, 34.9 s incl. end card. */
export const Smallpox: React.FC<SmallpoxProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} push={[1, 1]} hud={<Subtitles lines={props.subtitles} variant="box" fontSize={60} bottom={1665} />}>
        <Scene from={T.hook} to={T.patient} variant="light" push={[1, 1]}><Hook /></Scene>
        <Scene from={T.patient} to={T.zero} variant="clip" push={[1, 1]}><Patient /></Scene>
        <Scene from={T.zero} to={T.jenner} variant="charcoal" push={[1, 1]}><Tally300 /></Scene>
        <Scene from={T.jenner} to={T.quote} variant="clip" push={[1, 1]}><JennerPortrait /></Scene>
        <Scene from={T.quote} to={T.vaccination} variant="clip" push={[1, 1]}><Milkmaids /></Scene>
        <Scene from={T.vaccination} to={T.era} variant="light" push={[1, 1]}><Vaccination /></Scene>
        <Scene from={T.era} to={T.outbreak} variant="dark" push={[1, 1]}><Eradicate /></Scene>
        <Scene from={T.outbreak} to={T.chart} variant="charcoal" push={[1, 1.08]}><Outbreak /></Scene>
        <Scene from={T.chart} to={T.victory} variant="light" push={[1, 1]}><Chart /></Scene>
        <Scene from={T.victory} to={T.flex} variant="dark" push={[1, 1]}><Victory /></Scene>
        <Scene from={T.flex} to={durationInFrames} variant="light" push={[1, 1]}><FlexArm /></Scene>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
