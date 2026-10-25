import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperGrain } from "./Paper";

export type Whip = "up" | "down" | "left" | "right" | "zoom" | "none";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Wraps every scene. Implements the original skill's "fake-oner": each scene
 * begins and ends in full motion blur (whip / zoom), so hard cuts between
 * scenes read as one continuous camera move. Also applies the slow camera
 * push-in and the film grain that ties all scenes together.
 */
export const SceneShell: React.FC<{
  children: React.ReactNode;
  enter?: Whip;
  exit?: Whip;
  whipFrames?: number;
  push?: number; // total scale gained across the scene (0.06 = slow push-in)
  grain?: number;
  style?: React.CSSProperties;
}> = ({ children, enter = "up", exit = "up", whipFrames = 7, push = 0.06, grain = 0.22, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const inP = enter === "none" ? 1 : interpolate(frame, [0, whipFrames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = exit === "none" ? 0 : interpolate(frame, [durationInFrames - whipFrames, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  // Entering comes FROM the opposite side of the travel direction
  const vector = (w: Whip, amount: number) => {
    switch (w) {
      case "up": return [0, height * amount];
      case "down": return [0, -height * amount];
      case "left": return [width * amount, 0];
      case "right": return [-width * amount, 0];
      default: return [0, 0];
    }
  };
  const [ix, iy] = vector(enter, 1 - inP);
  const [ox, oy] = vector(exit, -outP);
  const zoomIn = enter === "zoom" ? interpolate(inP, [0, 1], [1.8, 1]) : 1;
  const zoomOut = exit === "zoom" ? interpolate(outP, [0, 1], [1, 2.2]) : 1;
  const blur = Math.max(1 - inP, outP) * 38;
  const pushScale = 1 + interpolate(frame, [0, durationInFrames], [0, push]);

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill
        style={{
          translate: `${ix + ox}px ${iy + oy}px`,
          scale: String(pushScale * zoomIn * zoomOut),
          filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      <PaperGrain opacity={grain} />
    </AbsoluteFill>
  );
};
