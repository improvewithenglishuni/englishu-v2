import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {
  Arrows,
  asset,
  BigNumber,
  ColorBlock,
  Cutout,
  END_CARD_SECONDS,
  EndCard,
  KeyWord,
  PaperLabel,
  Subtitles,
  Swoosh,
  themes,
  TornWipe,
  World,
  WorldLayer,
} from '../../kit';
import type {SmallpoxProps} from './schema';
import {T} from './timing';

const ph = (n: string) => asset(`cutouts/smallpox/${n}.png`);
const s = (sec: number) => Math.round(sec * 30);

/** 1. The hook: grandma's scar = a disease that killed 300M (virus photo on a mustard card). */
const Hook = () => (
  <>
    <ColorBlock cx={540} cy={930} w={1500} h={1050} rotate={-6} tone="spot" at={0} exitAt={s(4.2)} seed={3} />
    <Cutout src={ph('tem')} x={520} y={960} width={760} rotate={-3} at={s(0.15)} exitAt={s(4.2)} />
    <PaperLabel text="הצלקת של סבא וסבתא" x={540} y={400} fontSize={84} rotate={-3} at={s(0.3)} exitAt={s(4.2)} seed={2} />
    <BigNumber text="300,000,000" x={540} y={1300} fontSize={150} fill="ink" rotate={-2} at={s(1.9)} exitAt={s(4.2)} />
  </>
);

/** 2. "And today? Zero." */
const Zero = () => (
  <>
    <ColorBlock cx={540} cy={980} w={1400} h={1120} rotate={4} tone="accent" at={s(4.4)} exitAt={s(7.3)} seed={7} />
    <PaperLabel text="והיום?" x={540} y={380} fontSize={130} rotate={2} at={s(4.5)} exitAt={s(7.3)} seed={5} />
    <BigNumber text="0" x={540} y={1000} fontSize={880} fill="cream" at={s(5.2)} exitAt={s(7.3)} />
    <Cutout src={ph('tem')} x={900} y={1290} width={300} rotate={12} at={s(4.4)} exitAt={s(5.3)} />
  </>
);

/** 3. 1796: Jenner and the cow-pox cartoon on an ink card. */
const Jenner = () => (
  <>
    <ColorBlock cx={540} cy={1010} w={1400} h={980} rotate={-3} tone="ink" at={s(7.4)} exitAt={s(12.8)} seed={9} />
    <BigNumber text="1796" x={540} y={470} fontSize={310} fill="ink" rotate={-2} at={s(7.5)} exitAt={s(12.8)} />
    <Cutout src={ph('jenner')} x={330} y={1010} width={520} rotate={-5} at={s(7.9)} exitAt={s(12.8)} />
    <Cutout src={ph('gillray')} x={705} y={1250} width={640} rotate={3} at={s(9.2)} exitAt={s(12.8)} />
    <PaperLabel text="החיסון הראשון" x={780} y={720} fontSize={78} tone="accent" rotate={4} at={s(10.8)} exitAt={s(12.8)} seed={4} />
  </>
);

/** 4. 1967: the world decides to ERADICATE (dark world). */
const Eradicate = () => (
  <>
    <ColorBlock cx={540} cy={900} w={1300} h={1060} rotate={5} tone="spot" at={s(13.2)} exitAt={s(18.8)} seed={5} />
    <BigNumber text="1967" x={540} y={330} fontSize={270} fill="cream" at={s(13.3)} exitAt={s(18.8)} />
    <Cutout src={ph('ota')} x={540} y={850} width={460} rotate={-3} at={s(13.7)} exitAt={s(18.8)} />
    <KeyWord text="ERADICATE" splitAt={1} x={540} y={1250} fontSize={175} at={s(15.0)} splitFrame={s(15.6)} gap={36} exitAt={s(18.8)} />
    <Sequence from={s(16.0)} durationInFrames={s(2.8)} layout="none">
      <Swoosh x={540} y={1350} width={760} at={0} color="#F7F2E4" />
    </Sequence>
    <PaperLabel text="למגר / לשרש" x={640} y={560} fontSize={84} rotate={-2} at={s(16.4)} exitAt={s(18.8)} seed={6} />
  </>
);

const RINGS = [
  {r: 410, n: 12, at: s(21.0), rot: 0.1},
  {r: 275, n: 8, at: s(22.6), rot: 0.35},
  {r: 150, n: 5, at: s(24.1), rot: 0.6},
];
const CX = 540;
const CY = 930;

/** 5. OUTBREAK: rings of vaccinators close around it (dark world). */
const Outbreak = () => {
  const arrows = Array.from({length: 8}, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    return {x1: CX + Math.cos(a) * 500, y1: CY + Math.sin(a) * 500, x2: CX + Math.cos(a) * 455, y2: CY + Math.sin(a) * 455, bend: 0.05};
  });
  return (
    <>
      <PaperLabel text="OUTBREAK" font="anton" dir="ltr" fontSize={96} x={540} y={300} rotate={-2} at={s(19.0)} exitAt={s(26.8)} seed={8} />
      <PaperLabel text="התפרצות" x={540} y={450} fontSize={72} tone="accent" rotate={2} at={s(19.7)} exitAt={s(26.8)} seed={3} />
      <ColorBlock cx={CX} cy={CY} w={300} h={300} rotate={8} tone="accent" at={s(19.4)} exitAt={s(26.4)} seed={11} />
      {RINGS.map((g, k) =>
        Array.from({length: g.n}, (_, i) => {
          const a = (i / g.n) * Math.PI * 2 + g.rot;
          return (
            <Cutout
              key={`${k}-${i}`}
              src={ph('vial')}
              x={CX + Math.cos(a) * g.r}
              y={CY + Math.sin(a) * g.r}
              width={150}
              rotate={(a * 180) / Math.PI + 90}
              at={g.at + i * 2}
              exitAt={s(26.6) + k * 3 + (i % 4)}
            />
          );
        }),
      )}
      <Arrows arrows={arrows} at={s(20.2)} stagger={2} duration={9} strokeWidth={8} exitAt={s(24.3)} />
    </>
  );
};

/** 6. 1980: "finished"; the scar = victory (light world again). */
const Victory = () => (
  <>
    <ColorBlock cx={540} cy={860} w={1400} h={1000} rotate={-4} tone="spot" at={s(27.2)} seed={13} />
    <BigNumber text="1980" x={540} y={470} fontSize={330} fill="ink" rotate={-2} at={s(27.3)} />
    <PaperLabel text="הוכרז: נגמר." x={540} y={770} fontSize={104} rotate={2} at={s(28.2)} seed={5} />
    <PaperLabel text="SMALLPOX" font="anton" dir="ltr" fontSize={120} x={540} y={1020} rotate={-3} at={s(29.0)} strike={s(29.5)} seed={9} />
    <PaperLabel text="סימן לניצחון" x={540} y={1240} fontSize={128} tone="accent" rotate={-2} at={s(30.4)} seed={7} />
  </>
);

/** Smallpox Reel v2: photo-led, ERADICATE + OUTBREAK, newsprint world, 34.9 s incl. end card. */
export const Smallpox: React.FC<SmallpoxProps> = (props) => {
  const {fps, durationInFrames} = useVideoConfig();
  const endAt = durationInFrames - Math.round(END_CARD_SECONDS * fps);
  return (
    <>
      <World theme={themes[props.theme]} push={[1, 1.06]} hud={<Subtitles lines={props.subtitles} />}>
        <WorldLayer variant="light">
          <Hook />
          <Zero />
          <Jenner />
        </WorldLayer>
        <TornWipe at={T.wipe1} duration={24} angle={-35} seed={6}>
          <WorldLayer variant="dark">
            <Eradicate />
            <Outbreak />
          </WorldLayer>
        </TornWipe>
        <TornWipe at={T.wipe2} duration={24} angle={28} seed={8}>
          <WorldLayer variant="light">
            <Victory />
          </WorldLayer>
        </TornWipe>
      </World>
      {props.voiceover ? <Audio src={staticFile(props.voiceover)} /> : null}
      {props.endCard ? <EndCard at={endAt} /> : null}
    </>
  );
};
