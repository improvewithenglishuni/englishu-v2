import { noise2D } from "@remotion/noise";
import { Fragment } from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../theme";
import { tokenize } from "./RtlText";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Polygon (percent coords) for a rectangle whose edges are torn paper. */
export const tornPolygon = (seed: string, roughness = 1.4, steps = 26) => {
  const pts: string[] = [];
  const edge = (i: number, side: number) => noise2D(seed, i / 3.2, side) * roughness;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 100}% ${1.2 + edge(i, 0)}%`);
  for (let i = 0; i <= steps; i++) pts.push(`${98.8 - edge(i, 1)}% ${(i / steps) * 100}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 100}% ${98.8 - edge(i, 2)}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${1.2 + edge(i, 3)}% ${(i / steps) * 100}%`);
  return `polygon(${pts.join(", ")})`;
};

type Enter = "pop" | "left" | "right" | "top" | "bottom" | "slap";

/** Shared entrance: pop / slide / slap (drops from above, scaled up, lands with overshoot). */
const useEnter = (enterAt: number, from: Enter) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - enterAt, fps, config: { damping: 13, stiffness: 150 } });
  const off = 1300 * (1 - p);
  const tx = from === "left" ? -off : from === "right" ? off : 0;
  const ty = from === "top" ? -off : from === "bottom" ? off : 0;
  const scale = from === "pop" ? p : from === "slap" ? interpolate(p, [0, 1], [1.5, 1]) : 1;
  const opacity = frame < enterAt ? 0 : from === "slap" ? Math.min(1, p * 3) : 1;
  return { tx, ty, translate: `${tx}px ${ty}px`, scale, opacity, p };
};

/** A torn scrap of colored paper (background collage layer). */
export const TornPaper: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotate?: number;
  seed?: string;
  enterAt?: number;
  from?: Enter;
  drift?: number;
  shadow?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, width, height, color, rotate = 0, seed = "scrap", enterAt = 0, from = "pop", drift = 0, shadow = true, children, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const e = useEnter(enterAt, from);
  const dy = interpolate(frame, [0, durationInFrames], [0, -drift]);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width, height,
        translate: `${e.tx}px ${e.ty + dy}px`,
        scale: String(e.scale), rotate: `${rotate}deg`, opacity: e.opacity,
        filter: shadow ? "drop-shadow(6px 10px 6px rgba(0,0,0,0.28))" : undefined,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: color, clipPath: tornPolygon(seed) }} />
      {children}
    </div>
  );
};

/**
 * Archival photo print: halftoned image on a torn white paper border, taped down,
 * with a slow Ken Burns push inside the frame.
 */
export const PhotoPrint: React.FC<{
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  enterAt?: number;
  from?: Enter;
  zoom?: [number, number]; // Ken Burns scale across the scene
  focus?: string; // object-position, e.g. "50% 30%"
  border?: number;
  tape?: boolean;
  seed?: string;
  caption?: string; // small archival caption under the photo
}> = ({ src, x, y, width, height, rotate = 0, enterAt = 0, from = "slap", zoom = [1.05, 1.18], focus = "50% 50%", border = 18, tape = true, seed = "print", caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const e = useEnter(enterAt, from);
  const k = interpolate(frame, [0, durationInFrames], zoom);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width, height,
        translate: e.translate, scale: String(e.scale), rotate: `${rotate}deg`, opacity: e.opacity,
        filter: "drop-shadow(8px 14px 8px rgba(0,0,0,0.35))",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#f6f1e6", clipPath: tornPolygon(seed, 1.1) }} />
      <div style={{ position: "absolute", inset: border, overflow: "hidden", bottom: caption ? border + 44 : border }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, scale: String(k) }} />
      </div>
      {caption ? (
        <div dir="auto" style={{ position: "absolute", left: border, right: border, bottom: border - 2, height: 40, fontFamily: fonts.enType, fontSize: 26, color: "#3b352c", lineHeight: "40px", overflow: "hidden", whiteSpace: "nowrap" }}>
          {caption}
        </div>
      ) : null}
      {tape ? (
        <>
          <div style={{ position: "absolute", top: -18, left: "12%", width: 150, height: 44, background: "rgba(240,232,205,0.85)", rotate: "-8deg" }} />
          <div style={{ position: "absolute", top: -18, right: "10%", width: 150, height: 44, background: "rgba(240,232,205,0.85)", rotate: "6deg" }} />
        </>
      ) : null}
    </div>
  );
};

/** Yellow highlighter swept behind inline content; RTL sweeps right→left. */
export const Highlight: React.FC<{ at: number; frames?: number; color?: string; rtl?: boolean; children: React.ReactNode }> = ({
  at, frames = 10, color = "#f7dc3c", rtl = true, children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute", left: "-0.12em", right: "-0.12em", top: "18%", bottom: "4%",
          background: color, scale: `${p} 1`, transformOrigin: rtl ? "right center" : "left center",
          rotate: "-1deg", borderRadius: "0.12em 0.3em 0.15em 0.35em", mixBlendMode: "multiply",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

/** Hebrew (or mixed) text on a torn white paper strip; listed words get a highlighter sweep. */
export const TextStrip: React.FC<{
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  enterAt?: number;
  from?: Enter;
  rotate?: number;
  highlight?: string[];
  highlightAt?: number;
  paper?: string;
  ink?: string;
  englishColor?: string;
  seed?: string;
}> = ({ text, x, y, width, fontSize, enterAt = 0, from = "slap", rotate = -1.5, highlight = [], highlightAt = enterAt + 10, paper = "#fbf8f1", ink = "#161412", englishColor, seed = "strip" }) => {
  const e = useEnter(enterAt, from);
  const tokens = tokenize(text);
  let hi = 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width, translate: e.translate, scale: String(e.scale), rotate: `${rotate}deg`, opacity: e.opacity, filter: "drop-shadow(5px 8px 5px rgba(0,0,0,0.3))" }}>
      <div style={{ position: "absolute", inset: 0, background: paper, clipPath: tornPolygon(seed, 2.2, 18) }} />
      <div dir="rtl" lang="he" style={{ position: "relative", padding: `${fontSize * 0.28}px ${fontSize * 0.45}px`, fontFamily: fonts.heDisplay, fontSize, lineHeight: 1.18, color: ink, textAlign: "center" }}>
        {tokens.map((t, i, all) => {
          const word = (
            <span dir={t.english ? "ltr" : undefined} style={t.english ? { fontFamily: fonts.en, color: englishColor ?? ink } : undefined}>
              {t.text}
            </span>
          );
          const marked = highlight.some((h) => t.text.replace(/[.,:?!]/g, "") === h);
          return (
            <Fragment key={i}>
              {i > 0 && !all[i - 1].glued ? " " : null}
              {marked ? <Highlight at={highlightAt + hi++ * 6} rtl={!t.english}>{word}</Highlight> : word}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** Black Vox label box with white type; pops in. */
export const LabelBox: React.FC<{ text: string; x: number; y: number; at: number; fontSize?: number; rotate?: number; bg?: string; color?: string; font?: string }> = ({
  text, x, y, at, fontSize = 44, rotate = 0, bg = "#161412", color = "#fbf8f1", font,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 200 } });
  const isHebrew = /[֐-׿]/.test(text);
  return (
    <div
      dir={isHebrew ? "rtl" : "ltr"}
      style={{
        position: "absolute", left: x, top: y, background: bg, color, padding: "10px 22px 8px",
        fontFamily: font ?? (isHebrew ? fonts.heBody : fonts.en), fontWeight: isHebrew ? 800 : 400, fontSize, lineHeight: 1.1,
        letterSpacing: isHebrew ? undefined : "0.04em", whiteSpace: "nowrap",
        scale: `${p} 1`, transformOrigin: "left center", rotate: `${rotate}deg`, opacity: frame < at ? 0 : 1,
        boxShadow: "5px 6px 0 rgba(0,0,0,0.25)",
      }}
    >
      {text}
    </div>
  );
};

/**
 * Newspaper clipping: masthead rule, dateline, serif headline (highlightable),
 * and greyed body columns, on torn newsprint.
 */
export const NewsClipping: React.FC<{
  x: number;
  y: number;
  width: number;
  headline: React.ReactNode;
  dateline?: string;
  masthead?: string;
  bodyLines?: number;
  enterAt?: number;
  from?: Enter;
  rotate?: number;
  seed?: string;
  headlineSize?: number;
}> = ({ x, y, width, headline, dateline, masthead, bodyLines = 7, enterAt = 0, from = "slap", rotate = 2, seed = "news", headlineSize = 92 }) => {
  const e = useEnter(enterAt, from);
  return (
    <div style={{ position: "absolute", left: x, top: y, width, translate: e.translate, scale: String(e.scale), rotate: `${rotate}deg`, opacity: e.opacity, filter: "drop-shadow(8px 12px 8px rgba(0,0,0,0.32))" }}>
      <div style={{ position: "absolute", inset: 0, background: "#e9e1cd", clipPath: tornPolygon(seed, 1.6) }} />
      <div dir="ltr" style={{ position: "relative", padding: "34px 40px 40px", color: "#1d1a16" }}>
        {masthead ? (
          <div style={{ fontFamily: fonts.heSerif, fontWeight: 900, fontSize: 38, textAlign: "center", borderBottom: "3px double #1d1a16", paddingBottom: 6, letterSpacing: "0.06em" }}>
            {masthead}
          </div>
        ) : null}
        {dateline ? (
          <div style={{ fontFamily: fonts.enType, fontSize: 24, textAlign: "center", borderBottom: "1.5px solid #1d1a16", padding: "6px 0", marginBottom: 14 }}>{dateline}</div>
        ) : null}
        <div style={{ fontFamily: fonts.heSerif, fontWeight: 900, fontSize: headlineSize, lineHeight: 1.0, textAlign: "center", letterSpacing: "-0.01em" }}>{headline}</div>
        <div style={{ display: "flex", gap: 22, marginTop: 22 }}>
          {[0, 1].map((col) => (
            <div key={col} style={{ flex: 1 }}>
              {Array.from({ length: bodyLines }).map((_, i) => (
                <div key={i} style={{ height: 9, margin: "10px 0", background: "rgba(29,26,22,0.38)", width: `${78 + noise2D(seed, col * 9 + i, 4) * 20}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Pulsing red location dot (map marker) that can pop in and wink out. */
export const MapDot: React.FC<{ x: number; y: number; at: number; outAt?: number; size?: number; color?: string }> = ({ x, y, at, outAt, size = 30, color = "#d93a2b" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame - at, fps, config: { damping: 9 } });
  const outP = outAt === undefined ? 1 : interpolate(frame, [outAt, outAt + 5], [1, 0], clamp);
  const ring = ((frame - at) % 24) / 24;
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, scale: String(inP * outP) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${color}`, scale: String(1 + ring * 1.6), opacity: 1 - ring }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, border: "3px solid #fbf8f1" }} />
    </div>
  );
};
