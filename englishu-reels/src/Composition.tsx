import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Instagram Reels format: vertical 9:16
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const REEL_FPS = 30;

export const MyComposition = () => {
  return (
    <Composition
      id="Reel"
      component={SetupCheck}
      durationInFrames={REEL_FPS * 5}
      fps={REEL_FPS}
      width={REEL_WIDTH}
      height={REEL_HEIGHT}
    />
  );
};

// Placeholder test card: confirms the preview works. Replace with real scenes later.
export const SetupCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f4efe6",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          transform: `scale(${pop})`,
          backgroundColor: "#ffd400",
          padding: "40px 60px",
          fontSize: 110,
          fontWeight: 800,
          color: "#111",
        }}
      >
        EnglishU
      </div>
      <div
        style={{
          marginTop: 50,
          fontSize: 56,
          color: "#333",
          opacity: subtitleOpacity,
        }}
      >
        1080 × 1920 · ready
      </div>
    </AbsoluteFill>
  );
};
