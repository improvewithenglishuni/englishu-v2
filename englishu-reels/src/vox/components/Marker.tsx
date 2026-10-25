import { noise2D } from "@remotion/noise";
import { evolvePath } from "@remotion/paths";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { usePalette } from "../scene-context";

/** Hand-drawn ellipse: slightly more than one lap, wobbly radius, open ends. */
const wobblyEllipse = (w: number, h: number, seed: string) => {
  const steps = 64;
  const laps = 1.12;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * laps * Math.PI * 2 - Math.PI * 0.6;
    const wobble = 1 + noise2D(seed, i / 12, 0) * 0.06 + (i / steps) * 0.05;
    const px = w / 2 + Math.cos(t) * (w / 2) * wobble;
    const py = h / 2 + Math.sin(t) * (h / 2) * wobble;
    points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return points.join(" ");
};

/** Hand-drawn stroke from (0,0) to (length,0) with a slight arc and wobble. */
const wobblyLine = (length: number, seed: string, arc: number) => {
  const steps = 24;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = t * length;
    const py = Math.sin(t * Math.PI) * arc + noise2D(seed, t * 2, 1) * 3;
    points.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return points.join(" ");
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Marker annotation that draws itself in one confident stroke.
 * - "circle": wraps the box (x, y, width, height)
 * - "underline": from (x, y) across `width`
 * - "arrow": from (x, y) to `to`, head drawn last
 * For annotating TEXT, prefer @remotion/rough-notation (see remotion-markup/text-highlights.md).
 */
export const MarkerStroke: React.FC<{
  shape: "circle" | "underline" | "arrow";
  x: number;
  y: number;
  width?: number;
  height?: number;
  to?: { x: number; y: number };
  drawAt?: number; // frame
  drawFrames?: number;
  color?: string;
  thickness?: number;
  arc?: number; // bow of underline/arrow in px (negative bows the other way)
  seed?: string;
}> = ({
  shape,
  x,
  y,
  width = 300,
  height = 120,
  to,
  drawAt = 0,
  drawFrames = 14,
  color,
  thickness = 12,
  arc = -18,
  seed = "marker",
}) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const progress = interpolate(frame, [drawAt, drawAt + drawFrames], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const stroke = {
    fill: "none",
    stroke: color ?? palette.ink,
    strokeWidth: thickness,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const svgStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "visible",
    width: 1,
    height: 1,
  };

  if (shape === "circle") {
    const d = wobblyEllipse(width, height, seed);
    const evolved = evolvePath(progress, d);
    return (
      <svg style={svgStyle}>
        <path d={d} transform={`translate(${x} ${y})`} {...stroke} {...evolved} />
      </svg>
    );
  }

  const end = shape === "arrow" && to ? to : { x: x + width, y };
  const length = Math.hypot(end.x - x, end.y - y);
  const angle = (Math.atan2(end.y - y, end.x - x) * 180) / Math.PI;
  const d = wobblyLine(length, seed, arc);
  const lineProgress = shape === "arrow" ? interpolate(progress, [0, 0.8], [0, 1], clamp) : progress;
  const headProgress = interpolate(progress, [0.8, 1], [0, 1], clamp);
  const head = `M ${length - 46} -30 L ${length} 0 L ${length - 46} 30`;

  return (
    <svg style={svgStyle}>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        <path d={d} {...stroke} {...evolvePath(lineProgress, d)} />
        {shape === "arrow" ? <path d={head} {...stroke} {...evolvePath(headProgress, head)} /> : null}
      </g>
    </svg>
  );
};
