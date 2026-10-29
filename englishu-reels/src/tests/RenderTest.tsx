import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { RtlText } from "../vox/components/RtlText";
import { fonts, palettes } from "../vox/theme";

const p = palettes["mixed-media"];

// 3-second render smoke test: Hebrew + English text, motion, a drawn underline,
// a caption, and sound effects at exact frames (pop at 0.5 s, stamp at 1.5 s).
export const RenderTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const pop = spring({ frame: frame - 15, fps, config: { damping: 11 } });
  const slam = interpolate(frame, [45, 50], [2.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const underline = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: p.fields[0], alignItems: "center" }}>
      <div style={{ marginTop: 360, width: width - 220 }}>
        <RtlText text="בדיקת רינדור deadline" fontSize={110} color={p.ink} englishColor={p.accent} startAt={2} />
      </div>
      <div
        style={{
          position: "absolute", top: 760, width: 360, height: 360, borderRadius: "50%",
          background: p.fields[2], scale: String(pop), boxShadow: "12px 16px 0 rgba(0,0,0,0.8)",
        }}
      />
      {frame >= 45 ? (
        <div
          style={{
            position: "absolute", top: 860, fontFamily: fonts.en, fontSize: 150, color: p.paper,
            scale: String(slam), rotate: "-6deg",
          }}
        >
          3s
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 1180, height: 14, width: 420 * underline, background: p.accent, borderRadius: 7 }} />
      <div dir="rtl" style={{ position: "absolute", top: 1300, fontFamily: fonts.heBody, fontWeight: 900, fontSize: 64, color: "white", WebkitTextStroke: "12px #111", paintOrder: "stroke" }}>
        כתובית לבדיקה עם <span style={{ fontFamily: fonts.en, fontWeight: 400, color: p.accent2 }}>English</span>
      </div>
      <Sequence from={15} layout="none">
        <Audio src={staticFile("sfx/pop.wav")} />
      </Sequence>
      <Sequence from={45} layout="none">
        <Audio src={staticFile("sfx/stamp.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
