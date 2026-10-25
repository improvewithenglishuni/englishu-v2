import { AbsoluteFill } from "remotion";
import { Cutout } from "../../vox/components/Cutout";
import { BarChart, Stamp, useImpactShake, VocabCard } from "../../vox/components/Editorial";
import { MarkerStroke } from "../../vox/components/Marker";
import { PaperBackground } from "../../vox/components/Paper";
import { RtlText } from "../../vox/components/RtlText";
import { SceneShell } from "../../vox/components/SceneShell";
import type { SceneComponents } from "../../vox/Reel";
import { useCue, usePalette } from "../../vox/scene-context";
import { SAFE } from "../../vox/theme";

const Hook: React.FC = () => {
  const p = usePalette();
  return (
    <SceneShell enter="zoom" exit="up">
      <PaperBackground color={p.fields[0]} />
      <AbsoluteFill style={{ padding: `${SAFE.top + 40}px ${SAFE.right}px 0 ${SAFE.left}px` }}>
        <RtlText text="למה אומרים deadline?" fontSize={120} color={p.ink} englishColor={p.accent} startAt={useCue("headline")} />
      </AbsoluteFill>
      <Cutout src="vox-demo/clock.svg" x={540} y={720} width={520} rotate={-6} enterAt={useCue("cutout")} />
      <MarkerStroke shape="circle" x={230} y={700} width={620} height={640} drawAt={useCue("circle")} color={p.accent} seed="hook" />
    </SceneShell>
  );
};

const Vocab: React.FC = () => {
  const p = usePalette();
  const stampAt = useCue("stamp");
  const shake = useImpactShake(stampAt);
  return (
    <SceneShell enter="up" exit="left">
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={p.fields[2]} dotColor="rgba(255,255,255,0.12)" />
        <VocabCard word="deadline" meaning="מועד אחרון" note="DEAD-line" at={useCue("vocab")} x={540} y={520} />
        <Stamp text="1864" at={stampAt} x={560} y={1150} fontSize={150} color={p.accent2} blend="normal" />
      </AbsoluteFill>
    </SceneShell>
  );
};

const Chart: React.FC = () => {
  const p = usePalette();
  return (
    <SceneShell enter="left" exit="zoom">
      <PaperBackground color={p.fields[1]} halftone="full" />
      <AbsoluteFill style={{ padding: `${SAFE.top + 40}px ${SAFE.right}px 0 ${SAFE.left}px` }}>
        <RtlText text="כמה זמן נשאר?" fontSize={110} color={p.ink} startAt={6} />
      </AbsoluteFill>
      <BarChart
        values={[14, 7, 1]}
        valueLabels={["14", "7", "1"]}
        labels={["שבועיים", "שבוע", "יום"]}
        highlight={2}
        at={useCue("chart")}
        x={SAFE.left + 40}
        y={1180}
        width={1080 - SAFE.left - SAFE.right - 80}
        maxHeight={560}
      />
      <MarkerStroke shape="arrow" x={560} y={760} to={{ x: 250, y: 1070 }} arc={30} drawAt={useCue("arrow")} color={p.accent} seed="arrow" />
    </SceneShell>
  );
};

export const demoScenes: SceneComponents = {
  "s01-hook": Hook,
  "s02-vocab": Vocab,
  "s03-chart": Chart,
};
