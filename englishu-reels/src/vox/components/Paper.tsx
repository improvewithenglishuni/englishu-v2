import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/** Flat editorial color field with halftone dots and paper grain. */
export const PaperBackground: React.FC<{
  color: string;
  halftone?: "none" | "corner" | "full";
  dotColor?: string;
  vignette?: number; // 0..1
}> = ({ color, halftone = "corner", dotColor = "rgba(0,0,0,0.13)", vignette = 0.25 }) => {
  const mask =
    halftone === "corner"
      ? "radial-gradient(circle at 100% 100%, black 0%, transparent 55%)"
      : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      {halftone !== "none" ? (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${dotColor} 32%, transparent 34%)`,
            backgroundSize: "18px 18px",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      ) : null}
      <PaperGrain opacity={0.35} />
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const GRAIN_TILE = 768;

/**
 * Animated paper/film grain: a pre-made noise tile (public/textures/grain.png)
 * laid out as <Img> tiles (so rendering waits for it) and jumped to a new
 * offset every 2 frames for a subtle print flicker. Much cheaper to render
 * than full-frame SVG turbulence.
 */
export const PaperGrain: React.FC<{ opacity?: number; animated?: boolean }> = ({
  opacity = 0.3,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const step = animated ? Math.floor(frame / 2) : 0;
  const ox = -Math.round(random(`gx${step}`) * GRAIN_TILE);
  const oy = -Math.round(random(`gy${step}`) * GRAIN_TILE);
  const cols = Math.ceil(width / GRAIN_TILE) + 1;
  const rows = Math.ceil(height / GRAIN_TILE) + 1;
  const src = staticFile("textures/grain.png");
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <Img
          key={i}
          src={src}
          style={{
            position: "absolute",
            width: GRAIN_TILE,
            height: GRAIN_TILE,
            left: ox + (i % cols) * GRAIN_TILE,
            top: oy + Math.floor(i / cols) * GRAIN_TILE,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** A strip of semi-transparent masking tape. */
export const Tape: React.FC<{ style?: React.CSSProperties; width?: number }> = ({
  style,
  width = 170,
}) => (
  <div
    style={{
      position: "absolute",
      width,
      height: 48,
      background: "rgba(240, 232, 205, 0.82)",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      clipPath:
        "polygon(2% 8%, 98% 0%, 100% 50%, 97% 100%, 3% 94%, 0% 50%)",
      ...style,
    }}
  />
);
