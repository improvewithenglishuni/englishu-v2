import { Fragment } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, SAFE } from "../theme";
import { tokenize } from "./RtlText";

/**
 * Burned-in subtitle for one caption chunk (Hebrew RTL, English vocab highlighted).
 * The Reel places one per chunk on the "Captions" track with exact timing.
 */
export const CaptionChunk: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 220 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: SAFE.bottom + 10,
        paddingLeft: SAFE.left,
        paddingRight: SAFE.right,
      }}
    >
      <div
        dir="rtl"
        lang="he"
        style={{
          fontFamily: fonts.heBody,
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.2,
          color: "white",
          textAlign: "center",
          translate: `0 ${interpolate(p, [0, 1], [24, 0])}px`,
          opacity: p,
          paintOrder: "stroke",
          WebkitTextStroke: "14px #111",
          textShadow: "0 6px 0 #111",
        }}
      >
        {tokenize(text).map((t, i, all) => (
          <Fragment key={i}>
            {i > 0 && !all[i - 1].glued ? " " : null}
            <span
              dir={t.english ? "ltr" : undefined}
              style={t.english ? { fontFamily: fonts.en, fontWeight: 400, color: accent, fontSize: "1.08em" } : undefined}
            >
              {t.text}
            </span>
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Preview-only overlay showing where Instagram's UI covers the frame. */
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {[
      { top: 0, left: 0, right: 0, height: SAFE.top },
      { bottom: 0, left: 0, right: 0, height: SAFE.bottom },
      { top: SAFE.top, bottom: SAFE.bottom, right: 0, width: SAFE.right },
    ].map((s, i) => (
      <div key={i} style={{ position: "absolute", background: "rgba(255,0,80,0.25)", outline: "2px dashed rgba(255,0,80,0.8)", ...s }} />
    ))}
  </AbsoluteFill>
);
