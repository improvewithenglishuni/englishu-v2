import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Wraps a code-drawn SVG prop in the collage cutout treatment:
 * white paper outline, pasted-on drop shadow, overshoot pop-in, slow drift.
 */
export const PaperProp: React.FC<{
  children: React.ReactNode;
  x: number; // center
  y: number; // center
  size: number;
  enterAt?: number;
  rotate?: number;
  spin?: number; // degrees across the scene
  border?: number;
  /** Extra scale multiplied with the pop-in (e.g. an emphasis bump) */
  bump?: number;
  style?: React.CSSProperties;
}> = ({ children, x, y, size, enterAt = 0, rotate = 0, spin = 0, border = 9, bump = 1, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = spring({ frame: frame - enterAt, fps, config: { damping: 11, stiffness: 170 } });
  const b = border;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        scale: String(p * bump),
        rotate: `${rotate + interpolate(frame, [0, durationInFrames], [0, spin])}deg`,
        opacity: frame < enterAt ? 0 : 1,
        filter: [
          `drop-shadow(${b}px 0 0 #fff)`,
          `drop-shadow(-${b}px 0 0 #fff)`,
          `drop-shadow(0 ${b}px 0 #fff)`,
          `drop-shadow(0 -${b}px 0 #fff)`,
          "drop-shadow(10px 16px 0 rgba(0,0,0,0.35))",
        ].join(" "),
        ...style,
      }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: "visible" }}>
        {children}
      </svg>
    </div>
  );
};

/** Variola virus, stylized: brick-shaped particle with a dumbbell core and surface ridges. */
export const Virus: React.FC<{ color?: string; core?: string }> = ({ color = "#d6453d", core = "#7a1f1a" }) => (
  <g>
    <rect x={30} y={45} width={140} height={110} rx={34} fill={color} stroke="#141414" strokeWidth={7} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M ${48 + i * 26} 58 q 6 42 0 84`} stroke="rgba(0,0,0,0.25)" strokeWidth={5} fill="none" strokeLinecap="round" />
    ))}
    <path
      d="M 62 82 q 18 -10 38 6 q 20 -16 38 -6 q 12 18 0 36 q -18 10 -38 -6 q -20 16 -38 6 q -12 -18 0 -36 z"
      fill={core}
      stroke="#141414"
      strokeWidth={5}
    />
  </g>
);

/** Paper-cut person: head + shoulders. `spots` adds pox marks. */
export const Person: React.FC<{ fill: string; spots?: number; spotColor?: string; seed?: number }> = ({
  fill,
  spots = 0,
  spotColor = "#d6453d",
  seed = 1,
}) => {
  const marks = [
    [86, 52], [112, 66], [94, 78], [70, 140], [128, 150], [100, 168], [148, 132], [58, 168], [118, 40], [80, 66],
  ].slice(0, spots);
  return (
    <g>
      <circle cx={100} cy={62} r={40} fill={fill} stroke="#141414" strokeWidth={6} />
      <path d="M 28 196 q 4 -78 72 -82 q 68 4 72 82 z" fill={fill} stroke="#141414" strokeWidth={6} />
      {marks.map(([cx, cy], i) => (
        <circle key={i} cx={cx + ((seed * 7 + i * 3) % 5)} cy={cy} r={7} fill={spotColor} stroke="#141414" strokeWidth={2.5} />
      ))}
    </g>
  );
};

/** Syringe pointing left. */
export const Syringe: React.FC = () => (
  <g stroke="#141414" strokeWidth={6} strokeLinejoin="round">
    <rect x={60} y={80} width={100} height={40} rx={6} fill="#e9f3f7" />
    <rect x={64} y={86} width={58} height={28} fill="#5aa9c9" stroke="none" />
    <rect x={160} y={92} width={22} height={16} fill="#cfd8dc" />
    <rect x={182} y={74} width={10} height={52} fill="#cfd8dc" />
    <rect x={44} y={92} width={16} height={16} fill="#cfd8dc" />
    <line x1={44} y1={100} x2={4} y2={100} strokeWidth={4} />
    {[78, 96, 114].map((x) => (
      <line key={x} x1={x} y1={80} x2={x} y2={94} strokeWidth={3} />
    ))}
  </g>
);

/** Flat globe: ocean disc, simplified continents, meridians. */
export const Globe: React.FC<{ ocean: string; land: string }> = ({ ocean, land }) => (
  <g>
    <circle cx={100} cy={100} r={92} fill={ocean} stroke="#141414" strokeWidth={6} />
    <path d="M 38 62 q 22 -20 44 -8 q 10 14 -6 26 q -4 18 10 34 q -6 22 -24 28 q -16 -16 -18 -40 q -16 -14 -6 -40 z" fill={land} stroke="#141414" strokeWidth={4} />
    <path d="M 104 40 q 30 -8 52 12 q 12 20 -4 30 q -22 -2 -26 14 q 12 22 0 44 q -14 18 -26 6 q -6 -26 -4 -44 q -16 -10 -10 -34 q 6 -20 18 -28 z" fill={land} stroke="#141414" strokeWidth={4} />
    <ellipse cx={100} cy={100} rx={46} ry={92} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
    <line x1={8} y1={100} x2={192} y2={100} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
  </g>
);
