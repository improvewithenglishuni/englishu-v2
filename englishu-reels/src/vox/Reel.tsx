import { Audio } from "@remotion/media";
import type { CalculateMetadataFunction } from "remotion";
import { AbsoluteFill, Sequence, staticFile, Track, useVideoConfig } from "remotion";
import { CaptionChunk, SafeZones } from "./components/Captions";
import { SceneContext } from "./scene-context";
import { palettes, REEL } from "./theme";
import { resolveScenes, timeCaptions, voiceOffset, type ReelProps, type ResolvedScene } from "./timeline";

export type SceneComponents = Record<string, React.FC>;

/** Use as `calculateMetadata` on every reel <Composition>: fits length to the voiceover. */
export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const resolved = await resolveScenes(props.spec, REEL.fps);
  const last = resolved[resolved.length - 1];
  return {
    durationInFrames: last ? last.from + last.durationInFrames : 30,
    props: { ...props, resolved },
    defaultOutName: props.spec.id,
  };
};

const src = (file: string) => (file.startsWith("http") ? file : staticFile(file));

/**
 * Renders a ReelSpec: one scene component per scene id on the "Scenes" track,
 * voiceover on its own track (independent of visuals), captions and SFX on theirs.
 */
export const VoxReel: React.FC<ReelProps & { scenes: SceneComponents }> = ({
  spec,
  resolved,
  scenes,
  showSafeZones,
}) => {
  const { fps } = useVideoConfig();
  if (!resolved) return null;
  const palette = palettes[spec.style];

  return (
    <AbsoluteFill style={{ backgroundColor: palette.paper }}>
      <Track name="Scenes">
        {resolved.map((scene) => {
          const Scene = scenes[scene.id];
          return (
            <Sequence key={scene.id} name={scene.id} from={scene.from} durationInFrames={scene.durationInFrames}>
              <SceneContext.Provider value={{ scene, style: spec.style }}>
                {Scene ? <Scene /> : <MissingScene scene={scene} />}
              </SceneContext.Provider>
            </Sequence>
          );
        })}
      </Track>

      <Track name="Voiceover">
        {resolved
          .filter((s) => s.voiceover.file)
          .map((s) => (
            <Audio
              key={s.id}
              name={`VO ${s.id}`}
              src={src(s.voiceover.file!)}
              from={s.from + Math.round(voiceOffset(s) * fps)}
              volume={s.voiceover.volume ?? 1}
            />
          ))}
      </Track>

      <Track name="SFX">
        {resolved.flatMap((s) =>
          (s.sfx ?? []).map((fx, i) => (
            <Audio
              key={`${s.id}-${i}`}
              name={`SFX ${s.id} ${fx.file}`}
              src={src(fx.file)}
              from={s.from + Math.round(fx.at * fps)}
              volume={fx.volume ?? 0.5}
            />
          )),
        )}
      </Track>

      {spec.music ? (
        <Audio name="Music" src={src(spec.music.file)} volume={spec.music.volume ?? 0.12} loop />
      ) : null}

      {spec.showCaptions !== false ? (
        <Track name="Captions">
          {resolved.flatMap((s) =>
            timeCaptions(s, fps).map((c, i) => (
              <Sequence
                key={`${s.id}-${i}`}
                name={`CC ${s.id}`}
                from={s.from + Math.round(c.start * fps)}
                durationInFrames={Math.max(1, Math.round((c.end - c.start) * fps))}
              >
                <CaptionChunk text={c.text} accent={palette.accent2} />
              </Sequence>
            )),
          )}
        </Track>
      ) : null}

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

const MissingScene: React.FC<{ scene: ResolvedScene }> = ({ scene }) => (
  <AbsoluteFill style={{ background: "#222", color: "#eee", padding: 120, fontSize: 44, fontFamily: "sans-serif" }}>
    <div style={{ fontSize: 60, marginBottom: 30 }}>Scene “{scene.id}” not built yet</div>
    <div dir="rtl">{scene.voiceover.text}</div>
    <div style={{ marginTop: 40, opacity: 0.7 }}>{scene.visual}</div>
  </AbsoluteFill>
);
