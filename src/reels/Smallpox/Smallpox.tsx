import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import {
  ActionWord,
  CountUp,
  END_CARD_SECONDS,
  EndCard,
  gridPositions,
  Person,
  PictureBand,
  QuoteCutout,
  ringPositions,
  Ring,
  ScarArm,
  Scene,
  SansHeading,
  SerifTitle,
  Stamp,
  Subtitles,
  Syringe,
  themes,
  useUi,
  World,
  WorldMap,
} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

const s = (sec: number) => Math.round(sec * 30);
const painting = staticFile('assets/vox/hille_wide.jpg');
const jenner = staticFile('assets/vox/jenner_cut.png');

/** 1. HOOK: an animated magazine-cutout arm with the vaccination scar + the 300,000,000 count-up. */
const Hook = () => (
  <>
    <SerifTitle text="הצלקת של סבא וסבתא" dir="rtl" x={540} y={200} width={1000} fontSize={88} color="slate" at={3} />
    <CountUp to={300000000} x={540} y={350} fontSize={150} color="red" at={s(0.7)} duration={s(2.6)} />
    <ScarArm x={600} y={1130} height={940} rotate={-6} at={2} scarAt={s(0.5)} />
  </>
);

/** 2. "And today? Zero." people grid, nobody left infected. */
const Zero = () => {
  const pts = gridPositions(190, 300, 5, 3, 175, 240);
  return (
    <>
      {pts.map((p, i) => (
        <Person key={i} x={p.x} y={p.y} size={190} tone="ink" at={4 + i * 2} />
      ))}
      <SansHeading text="0" x={540} y={1050} fontSize={560} color="white" dir="ltr" at={s(0.8)} />
    </>
  );
};

/** 3a. 1796: the real painting across the full width (full-frame real picture). */
const JennerPainting = () => (
  <>
    <SerifTitle text="1796" x={540} y={300} fontSize={150} color="white" at={2} />
    <PictureBand src={painting} y={1010} aspect={850 / 1080} zoom={[1.0, 1.12]} focus={[52, 55]} at={0} />
  </>
);

/** 3b. Jenner as a duotone cutout on the plain plate, quote with dim last words. */
const JennerQuote = () => (
  <QuoteCutout src={jenner} x={420} y={1560} width={840} quote="מי שנדבק מפרות — לא חלה" dir="rtl" dimFrom={3} textBox={{x: 90, y: 230, w: 900}} fontSize={86} at={2} />
);

/** 3c. TARGET WORD 2: VACCINATION. vacca = cow (Latin). */
const Vaccination = () => (
  <>
    <ActionWord text="VACCINATION" mode="pop" color="slate" x={540} y={760} fontSize={118} at={2} actAt={s(0.9)} hiFrom={0} hiTo={5} gloss="vacca = פרה (לטינית)" />
    <Person x={540} y={1180} size={300} tone="ink" glow="#FDF551" at={s(1.4)} />
    <Syringe x={760} y={1230} size={260} at={s(1.7)} />
  </>
);

/** 4. 1967: the decision. TARGET WORD 1: ERADICATE, e-radix = "out of the root": the letters are uprooted. */
const Eradicate = () => (
  <>
    <SansHeading text="1967" x={540} y={330} fontSize={260} color="white" dir="ltr" at={2} />
    <ActionWord text="ERADICATE" mode="uproot" x={540} y={820} fontSize={150} at={s(0.5)} actAt={s(2.7)} />
    <SansHeading text="למגר = לעקור מהשורש" x={540} y={1250} fontSize={84} color="white" dir="rtl" at={s(1.3)} />
  </>
);

/** 5. OUTBREAK: ring vaccination, patient in the middle, rings closing around. */
const Outbreak = () => {
  const ui = useUi();
  const CX = 540;
  const CY = 800;
  const inner = ringPositions(CX, CY, 220, 6, 0.3);
  const outer = ringPositions(CX, CY, 400, 11, 0.1);
  return (
    <>
      <SerifTitle text="OUTBREAK" x={540} y={170} fontSize={120} color="white" at={2} />
      <Ring points={outer} color={ui.yellow} at={s(3.4)} duration={22} />
      <Ring points={inner} color={ui.yellow} at={s(2.0)} duration={22} />
      {outer.map((p, i) => (
        <Person key={`o${i}`} x={p.x} y={p.y} size={150} tone="white" glow={ui.yellow} at={s(3.2) + i * 2} />
      ))}
      {inner.map((p, i) => (
        <Person key={`i${i}`} x={p.x} y={p.y} size={170} tone="white" glow={ui.yellow} at={s(1.8) + i * 2} />
      ))}
      <Person x={CX} y={CY} size={230} tone="red" halo={ui.halo} dashed at={6} />
      <Syringe x={880} y={1290} size={240} at={s(4.8)} />
    </>
  );
};

/** 6. 1980: last natural cases on the map, the date, and the ERADICATED stamp. */
const Victory = () => (
  <>
    <SerifTitle text="Last natural cases" x={540} y={215} fontSize={92} color="white" source="Source: WHO" at={2} />
    <WorldMap
      box={{x: 40, y: 500, w: 1000}}
      highlight={{Brazil: {at: s(0.7)}, Bangladesh: {at: s(1.3)}, Somalia: {at: s(1.9)}}}
      at={4}
    />
    <SansHeading text="8.5.1980" x={540} y={1050} fontSize={150} color="white" dir="ltr" at={s(2.4)} />
    <Stamp text="ERADICATED" x={540} y={1290} fontSize={104} rotate={-7} at={s(3.6)} />
  </>
);

/** Smallpox Reel v3: Vox look, hard-cut scenes, 34.9 s incl. end card. */
export const Smallpox: React.FC<SmallpoxProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} push={[1, 1]} hud={<Subtitles lines={props.subtitles} variant="box" />}>
        <Scene from={T.hook} to={T.zero} variant="light"><Hook /></Scene>
        <Scene from={T.zero} to={T.jenner} variant="charcoal"><Zero /></Scene>
        <Scene from={T.jenner} to={T.quote} variant="charcoal"><JennerPainting /></Scene>
        <Scene from={T.quote} to={T.vaccination} variant="dark"><JennerQuote /></Scene>
        <Scene from={T.vaccination} to={T.era} variant="light"><Vaccination /></Scene>
        <Scene from={T.era} to={T.outbreak} variant="peri"><Eradicate /></Scene>
        <Scene from={T.outbreak} to={T.victory} variant="charcoal"><Outbreak /></Scene>
        <Scene from={T.victory} to={T.end} variant="dark"><Victory /></Scene>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
