import React from 'react';
import {Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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
import type {SmallpoxProps} from './schema';
import {T} from './timing';
import caseDots from './caseDots.json';

const s = (sec: number) => Math.round(sec * 30);
const arm = staticFile('assets/vox/arm_hand.png');
const patient = staticFile('assets/vox/patient_full.jpg');
const jennerSticker = staticFile('assets/vox/jenner_sticker.png');
const milkmaid = staticFile('assets/vox/milkmaid_new.jpg');

const cover: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'};

/** 1. HOOK: the REAL scar photo enlarged ~300% so the scars sit in the centre, circled with a red marker. */
const Hook = () => (
  <ScarSticker
    src={arm}
    x={540}
    y={760}
    width={960}
    aspect={1153 / 1364}
    rotate={-4}
    at={2}
    scarAt={0}
    zoomFrom={2.9}
    zoomTo={3.3}
    scar={{x: 0.336, y: 0.5}}
    scarTarget={{x: 540, y: 720}}
    scars={[]}
    marker={{cx: 0.336, cy: 0.5, rx: 66, ry: 104, rot: -19, at: s(0.45)}}
  />
);

/** 2. What smallpox looked like: a real historical photo, FULL FRAME. */
const Patient = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 45], [1.0, 1.06], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Img src={patient} style={{...cover, objectPosition: '38% 50%', transform: `scale(${z})`, transformOrigin: '38% 40%'}} />
    </div>
  );
};

/** 3. 300,000,000 counts up while narrated, then down to 0 while the crowd disappears. */
const Tally300 = () => (
  <>
    <Crowd x0={40} y0={70} cols={15} rows={28} dx={72} dy={68} size={66} at={2} vanishFrom={s(1.7)} vanishTo={s(3.3)} />
    <Tally peak={300000000} x={540} y={830} fontSize={170} at={2} upAt={s(0.1)} upDur={s(1.4)} downAt={s(1.7)} downDur={s(1.6)} />
  </>
);

/** 4. Jenner (named on screen) as a die-cut portrait on a newspaper clipping. */
const JennerPortrait = () => (
  <>
    <Sticker src={jennerSticker} x={540} y={780} width={780} aspect={1444 / 1120} rotate={-3} at={2} />
    <NameLabel x={540} y={1265} line1="אדוארד ג׳נר" line2="רופא · 1796" fontSize={92} paper at={s(0.5)} />
  </>
);

/** 5. Milkmaids: cowpox came from the cows. Old photo, FULL FRAME. */
const Milkmaids = () => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, 66], [1.0, 1.07], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <Img src={milkmaid} style={{...cover, objectPosition: '52% 50%', transform: `scale(${z})`, transformOrigin: '52% 55%'}} />
    </div>
  );
};

/** 6. TARGET WORD 2: VACCINATION (vacca = cow). The figure is jabbed, a protective outline radiates from its body, and germs bounce off. */
const Vaccination = () => {
  const frame = useCurrentFrame();
  const PX = 540;
  const PY = 1090;
  const SZ = 430;
  const off = {x: 0.411 * SZ, y: 0.2375 * SZ};
  const jab = interpolate(frame, [s(0.7), s(1.0), s(1.4)], [0, 1, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tip = {x: PX - 175 + jab * 100, y: PY - 80 + jab * 62};
  return (
    <>
      <ActionWord text="VACCINATION" mode="pop" color="slate" x={540} y={470} fontSize={118} at={2} actAt={s(1.0)} hiFrom={0} hiTo={5} gloss="vacca = פרה (לטינית)" />
      <Person x={PX} y={PY} size={560} tone="ink" shield="#8F93A3" shieldAt={s(1.05)} at={4} />
      <Syringe x={tip.x - off.x} y={tip.y - off.y} size={SZ} rotate={30} color="#9A9DAA" at={s(0.2)} />
      <Germs cx={PX} cy={PY + 10} rx={200} ry={330} n={12} at={s(1.35)} stagger={2} />
    </>
  );
};

/** 7. WHO 1967 + TARGET WORD 1: ERADICATE (yellow), then the whole word vanishes. */
const Eradicate = () => {
  const frame = useCurrentFrame();
  const SZ = 340;
  const off = {x: 0.411 * SZ, y: 0.2375 * SZ};
  const k = interpolate(frame, [s(1.4), s(1.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ease = 1 - Math.pow(1 - k, 3);
  const tip = {x: 470 - 260 * (1 - ease), y: 800 - 165 * (1 - ease)};
  const plunge = interpolate(frame, [s(1.9), s(2.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <NameLabel x={540} y={330} line1="ארגון הבריאות העולמי" line2="1967" fontSize={80} at={2} />
      <ActionWord text="ERADICATE" mode="vanish" color="yellow" hollow x={540} y={820} fontSize={150} at={s(0.5)} fillAt={s(1.9)} fillFromX={470} actAt={s(2.7)} />
      <Syringe x={tip.x - off.x} y={tip.y - off.y} size={SZ} rotate={30} color="#C9CBD6" liquid="#FDF551" plunge={plunge} at={s(1.35)} exitAt={s(3.3)} />
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
  const t0 = s(0.35);
  const hop = 6;
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
      <Ring points={outer} color={ui.yellow} at={s(2.9)} duration={22} />
      <Ring points={inner} color={ui.yellow} at={s(1.5)} duration={22} />
      {outer.map((p, n) => (
        <Person key={`o${n}`} x={p.x} y={p.y} size={150} tone="white" glow={visited(inner.length + n) ? ui.yellow : undefined} at={4 + n} />
      ))}
      {inner.map((p, n) => (
        <Person key={`i${n}`} x={p.x} y={p.y} size={170} tone="white" glow={visited(n) ? ui.yellow : undefined} at={2 + n} />
      ))}
      <Person x={CX} y={CY} size={230} tone="red" halo={ui.halo} at={6} />
      <Syringe x={tx - off.x} y={ty - off.y} size={SIZE} rotate={30} at={s(0.2)} />
    </>
  );
};

const CASES: [number, number][] = [
  [1967, 122098], [1968, 80020], [1969, 45291], [1970, 33219], [1971, 51993], [1972, 65153],
  [1973, 135853], [1974, 218326], [1975, 19278], [1976, 954], [1977, 3234], [1978, 0], [1979, 0], [1980, 0],
];

/** 9. Reported smallpox cases worldwide fall to zero in 1980 (WHO via Our World in Data). */
const Chart = () => (
  <>
    <SerifTitle text="Reported smallpox cases worldwide" dir="ltr" x={540} y={250} width={980} fontSize={80} color="slate" source="Source: WHO via Our World in Data" at={2} />
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
  const zin = ez(Math.min(1, Math.max(0, (frame - s(1.7)) / s(0.75))));
  const zout = ez(Math.min(1, Math.max(0, (frame - s(2.9)) / s(0.75))));
  const m = zin * (1 - zout);
  const z = 1 + 2.5 * m;
  return (
    <>
      <Place x={540} y={470} opacity={Math.min(1, Math.max(0, (frame - 2) / 10))}>
        <div dir="ltr" style={{fontFamily: 'var(--kit-font)', fontWeight: 700, fontSize: 40, color: '#B9BCCB', letterSpacing: 0.5}}>Source: WHO</div>
      </Place>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${S.x + (C.x - S.x) * m}px, ${S.y + (C.y - S.y) * m}px) scale(${z}) translate(${-S.x}px, ${-S.y}px)`}}>
        <WorldMap
          box={{x: 0, y: 520, w: 1080}}
          highlight={{Somalia: {at: s(1.3), off: s(2.8)}}}
          dots={caseDots.dots}
          dotsAt={s(0.15)}
          dotsFade={[s(0.6), s(1.7)]}
          lastCase={{x: caseDots.somalia[0], y: caseDots.somalia[1], at: s(1.3), off: s(2.8)}}
          greyAt={s(2.9)}
          at={4}
        />
      </div>
      <Stamp text="ERADICATED" x={540} y={800} fontSize={124} rotate={-8} heavy at={s(3.8)} />
      <SansHeading text="1980" x={540} y={1290} fontSize={190} color="white" dir="ltr" at={s(4.3)} />
    </>
  );
};

/** Smallpox Reel v3: Vox look, hard-cut scenes, 34.9 s incl. end card. */
export const Smallpox: React.FC<SmallpoxProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} push={[1, 1]} hud={<Subtitles lines={props.subtitles} variant="box" />}>
        <Scene from={T.hook} to={T.patient} variant="light"><Hook /></Scene>
        <Scene from={T.patient} to={T.zero} variant="clip"><Patient /></Scene>
        <Scene from={T.zero} to={T.jenner} variant="charcoal"><Tally300 /></Scene>
        <Scene from={T.jenner} to={T.quote} variant="clip"><JennerPortrait /></Scene>
        <Scene from={T.quote} to={T.vaccination} variant="clip"><Milkmaids /></Scene>
        <Scene from={T.vaccination} to={T.era} variant="light"><Vaccination /></Scene>
        <Scene from={T.era} to={T.outbreak} variant="dark"><Eradicate /></Scene>
        <Scene from={T.outbreak} to={T.chart} variant="charcoal"><Outbreak /></Scene>
        <Scene from={T.chart} to={T.victory} variant="light"><Chart /></Scene>
        <Scene from={T.victory} to={T.end} variant="dark"><Victory /></Scene>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
