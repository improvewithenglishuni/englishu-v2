import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";

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

/**
 * Animated paper/film grain: a pre-made noise tile (public/textures/grain.png)
 * jumped to a new offset every 2 frames for a subtle print flicker.
 * Much cheaper to render than full-frame SVG turbulence (~30% faster Reel renders).
 */
export const PaperGrain: React.FC<{ opacity?: number; animated?: boolean }> = ({
  opacity = 0.3,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const step = animated ? Math.floor(frame / 2) : 0;
  const x = Math.round(random(`gx${step}`) * 768);
  const y = Math.round(random(`gy${step}`) * 768);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "multiply",
        pointerEvents: "none",
        backgroundImage: `url(${staticFile("textures/grain.png")})`,
        backgroundSize: "768px 768px",
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
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
