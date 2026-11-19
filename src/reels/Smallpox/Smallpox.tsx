import React from 'react';
import {Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  ActionWord,
  Crowd,
  END_CARD_SECONDS,
  EndCard,
  Jagged,
  LineChart,
  NameLabel,
  Person,
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

const s = (sec: number) => Math.round(sec * 30);
const arm = staticFile('assets/vox/arm_sticker.png');
const patient = staticFile('assets/vox/smallpox_patient.jpg');
const jennerSticker = staticFile('assets/vox/jenner_sticker.png');
const milkmaid = staticFile('assets/vox/milkmaid.jpg');

const cover: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'};

/** 1. HOOK: the REAL scar photo as a die-cut sticker entering from the frame edges (no visible cut-off), with a glow/zoom effect. */
const Hook = () => <ScarSticker src={arm} x={650} y={500} width={1000} rotate={0} at={2} scarAt={s(0.6)} scar={{x: 0.5, y: 0.49}} />;

/** 2. What smallpox looked like: real historical photo as a jagged magazine cutout on the clipping plate. */
const Patient = () => (
  <Jagged x={540} y={760} width={1000} height={567} rotate={-2} at={2}>
    <Img src={patient} style={cover} />
  </Jagged>
);

/** 3. 300,000,000 counts up while narrated, then down to 0 while the crowd disappears. */
const Tally300 = () => (
  <>
    <Crowd x0={70} y0={190} cols={8} rows={13} dx={135} dy={112} size={150} at={2} vanishFrom={s(1.7)} vanishTo={s(3.3)} />
    <Tally peak={300000000} x={540} y={830} fontSize={170} at={2} upAt={s(0.1)} upDur={s(1.4)} downAt={s(1.7)} downDur={s(1.6)} />
  </>
);

/** 4. Jenner (named on screen) as a die-cut portrait on a newspaper clipping. */
const JennerPortrait = () => (
  <>
    <Sticker src={jennerSticker} x={540} y={780} width={780} aspect={1444 / 1120} rotate={-3} at={2} />
    <NameLabel x={540} y={1260} line1="אדוארד ג׳נר" line2="רופא · 1796" fontSize={92} at={s(0.5)} />
  </>
);

/** 5. Milkmaids: cowpox came from the cows. Old photo as a jagged magazine cutout. */
const Milkmaids = () => (
  <Jagged x={540} y={820} width={940} height={846} rotate={2} at={2}>
    <Img src={milkmaid} style={cover} />
  </Jagged>
);

const VaccCard = () => {
  const frame = useCurrentFrame();
  const jab = interpolate(frame, [s(1.7), s(1.95), s(2.3)], [0, 1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const done = frame >= s(1.95);
  return (
    <>
      <Person x={560} y={400} size={470} tone="ink" glow={done ? '#FDF551' : undefined} at={4} />
      <Syringe x={250 + jab * 60} y={250 + jab * 34} size={560} rotate={30} at={s(0.6)} />
    </>
  );
};

/** 6. TARGET WORD 2: VACCINATION (vacca = cow), 3.2 s, with a jagged magazine-cut card showing the needle. */
const Vaccination = () => (
  <>
    <ActionWord text="VACCINATION" mode="pop" color="slate" x={540} y={300} fontSize={118} at={2} actAt={s(1.0)} hiFrom={0} hiTo={5} gloss="vacca = פרה (לטינית)" />
    <Jagged x={540} y={1010} width={800} height={720} rotate={-2} fill="#A1ACCA" at={s(0.7)}>
      <VaccCard />
    </Jagged>
  </>
);

/** 7. WHO 1967 + TARGET WORD 1: ERADICATE (yellow), then the whole word vanishes. */
const Eradicate = () => (
  <>
    <NameLabel x={540} y={330} line1="ארגון הבריאות העולמי" line2="1967" fontSize={80} at={2} />
    <ActionWord text="ERADICATE" mode="vanish" color="yellow" x={540} y={820} fontSize={150} at={s(0.5)} actAt={s(3.0)} />
    <SansHeading text="למגר = לעקור מהשורש" x={540} y={1150} fontSize={84} color="white" dir="rtl" at={s(1.3)} />
  </>
);

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
    <SerifTitle text="מקרי אבעבועות שחורות בעולם" dir="rtl" x={540} y={250} width={980} fontSize={74} color="slate" source="Source: WHO via Our World in Data" at={2} />
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
const Victory = () => (
  <>
    <SerifTitle text="Last natural cases" x={540} y={215} fontSize={92} color="white" source="Source: WHO" at={2} />
    <WorldMap
      box={{x: 40, y: 560, w: 1000}}
      highlight={{Brazil: {at: s(0.3)}, Bangladesh: {at: s(0.7)}, Somalia: {at: s(1.1)}}}
      greyAt={s(1.6)}
      at={4}
    />
    <Stamp text="ERADICATED" x={540} y={800} fontSize={118} rotate={-8} at={s(2.0)} />
    <SansHeading text="1980" x={540} y={1290} fontSize={190} color="white" dir="ltr" at={s(2.7)} />
  </>
);

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
