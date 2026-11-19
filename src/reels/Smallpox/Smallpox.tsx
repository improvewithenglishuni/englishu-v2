import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';
import {
  ActionWord,
  Disc,
  END_CARD_SECONDS,
  EndCard,
  gridPositions,
  NameLabel,
  Person,
  ScarSticker,
  Sticker,
  Tally,
  QuoteCutout,
  ringPositions,
  Ring,
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

const arm = staticFile('assets/vox/arm_sticker.png');
const jennerSticker = staticFile('assets/vox/jenner_sticker.png');
const paintingFile = staticFile('assets/vox/hille_wide.jpg');

/** 1. HOOK: the REAL scar photo as a die-cut sticker on a plain plate, with a glow/zoom effect. No text. */
const Hook = () => <ScarSticker src={arm} x={560} y={800} width={780} rotate={-5} at={2} scarAt={s(0.6)} scar={{x: 0.5, y: 0.49}} />;

/** 2. 300,000,000 counts up while narrated, then runs down to 0 on "zero". */
const Tally300 = () => <Tally peak={300000000} x={540} y={760} fontSize={140} at={2} upAt={s(0.2)} upDur={s(1.9)} downAt={s(2.3)} downDur={s(1.5)} />;

/** 3a. Jenner (named, on screen) as a die-cut portrait on a newspaper clipping + yellow disc. */
const JennerPortrait = () => (
  <>
    <Disc x={540} y={800} r={420} at={2} />
    <Sticker src={jennerSticker} x={540} y={780} width={760} aspect={1444 / 1120} rotate={-3} at={4} />
    <NameLabel x={540} y={1250} line1="אדוארד ג׳נר" line2="רופא · 1796" fontSize={92} at={s(0.5)} />
  </>
);

/** 3b. The painting of the first vaccination, as a die-cut sticker on the clipping plate (no text). */
const PaintingSticker = () => (
  <>
    <Disc x={540} y={800} r={400} at={2} color="#CBD2E6" />
    <div style={{position: 'absolute', inset: 0}}>
      <Sticker src={paintingFile} x={540} y={800} width={900} aspect={850 / 1080} rotate={3} at={4}>
        <div style={{position: 'absolute', inset: -16, border: '16px solid #FAFAFA', borderRadius: 6, pointerEvents: 'none'}} />
      </Sticker>
    </div>
  </>
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
    <ActionWord text="ERADICATE" mode="vanish" x={540} y={820} fontSize={150} at={s(0.5)} actAt={s(2.7)} />
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

/** 6. Last natural cases light up, the whole map goes grey, a red classified-style stamp slams on, then only the year. */
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
        <Scene from={T.hook} to={T.zero} variant="light"><Hook /></Scene>
        <Scene from={T.zero} to={T.jenner} variant="charcoal"><Tally300 /></Scene>
        <Scene from={T.jenner} to={T.quote} variant="clip"><JennerPortrait /></Scene>
        <Scene from={T.quote} to={T.vaccination} variant="clip"><PaintingSticker /></Scene>
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
