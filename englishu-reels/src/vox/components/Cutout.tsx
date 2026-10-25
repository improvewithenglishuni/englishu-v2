import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { usePalette } from "../scene-context";

/**
 * Archival photo cutout with a white paper border and a pasted-on drop shadow.
 * - `kind: "silhouette"` expects a transparent PNG (background already removed);
 *   the border follows the subject's outline.
 * - `kind: "print"` frames any photo as a rectangular paper print.
 * Snaps in at `enterAt` (frames) with overshoot, then drifts slowly (parallax).
 */
export const Cutout: React.FC<{
  src: string; // path in public/ or a full URL
  kind?: "silhouette" | "print";
  x: number; // center, px
  y: number;
  width: number;
  rotate?: number; // degrees
  enterAt?: number;
  from?: "pop" | "left" | "right" | "top" | "bottom";
  drift?: number; // px of slow drift across the scene
  border?: number;
  tone?: "color" | "mono" | "sepia";
  style?: React.CSSProperties;
}> = ({
  src,
  kind = "silhouette",
  x,
  y,
  width,
  rotate = 0,
  enterAt = 0,
  from = "pop",
  drift = 24,
  border = 10,
  tone = "color",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const palette = usePalette();
  const enter = spring({ frame: frame - enterAt, fps, config: { damping: 11, stiffness: 160 } });
  const offscreen = 1400;
  const dx = from === "left" ? -offscreen : from === "right" ? offscreen : 0;
  const dy = from === "top" ? -offscreen : from === "bottom" ? offscreen : 0;
  const driftY = interpolate(frame, [0, durationInFrames], [0, -drift]);
  const scale = from === "pop" ? enter : 1;
  const resolvedSrc = src.startsWith("http") ? src : staticFile(src);
  const toneFilter =
    tone === "mono" ? "grayscale(1) contrast(1.15)" : tone === "sepia" ? "sepia(0.75) contrast(1.1)" : "";
  const b = border;
  const outline =
    kind === "silhouette"
      ? [
          `drop-shadow(${b}px 0 0 ${palette.cutoutBorder})`,
          `drop-shadow(-${b}px 0 0 ${palette.cutoutBorder})`,
          `drop-shadow(0 ${b}px 0 ${palette.cutoutBorder})`,
          `drop-shadow(0 -${b}px 0 ${palette.cutoutBorder})`,
        ].join(" ")
      : "";

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y,
        width,
        translate: `${dx * (1 - enter)}px ${dy * (1 - enter) + driftY}px`,
        scale: String(scale),
        rotate: `${rotate * enter}deg`,
        transformOrigin: "50% 50%",
        filter: `${outline} drop-shadow(8px 14px 10px rgba(0,0,0,0.35))`,
        opacity: frame < enterAt ? 0 : 1,
        ...style,
      }}
    >
      <Img
        src={resolvedSrc}
        style={{
          width: "100%",
          display: "block",
          filter: toneFilter || undefined,
          ...(kind === "print"
            ? { border: `${b * 1.6}px solid ${palette.cutoutBorder}`, boxSizing: "border-box" }
            : {}),
        }}
      />
    </div>
  );
};
