import { AbsoluteFill, useCurrentFrame } from "remotion";

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

/** Animated paper/film grain. Re-seeds every 2 frames for a subtle print flicker. */
export const PaperGrain: React.FC<{ opacity?: number; animated?: boolean }> = ({
  opacity = 0.3,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const seed = animated ? Math.floor(frame / 2) % 50 : 1;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
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
