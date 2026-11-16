import { evolvePath } from "@remotion/paths";
import { Fragment } from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tornPolygon } from "../../vox/components/Collage";
import { PaperGrain } from "../../vox/components/Paper";
import { tokenize } from "../../vox/components/RtlText";
import { fonts } from "../../vox/theme";

// EnglishU brand palette (englishu-reel skill): no yellow
export const CREAM = "#F5F0E5";
export const NAVY = "#0A2370";
export const RED = "#B01F25";
export const INK = "#161412";
export const ART = "reels/smallpox/archival";
export const FPS = 30;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RUBIK = "'Rubik', 'Heebo', sans-serif";

/** Seconds (absolute Reel time) → frame inside a shot that starts at t0. */
export const at = (t0: number, abs: number) => Math.round((abs - t0) * FPS);

/** Full-bleed base paper for the "medical archive" world. */
export const Paper: React.FC<{ color?: string; dots?: string; grain?: number }> = ({ color = CREAM, dots = "rgba(10,35,112,0.10)", grain = 0.3 }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>
    <AbsoluteFill style={{ background: `radial-gradient(${dots} 30%, transparent 33%)`, backgroundSize: "16px 16px", opacity: 0.8,
      maskImage: "linear-gradient(160deg, black 0%, transparent 45%, transparent 60%, black 100%)", WebkitMaskImage: "linear-gradient(160deg, black 0%, transparent 45%, transparent 60%, black 100%)" }} />
    <PaperGrain opacity={grain} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(40,25,10,0.18) 100%)" }} />
  </AbsoluteFill>
);

/** A torn paper band that runs past the frame edges (keeps every shot full-bleed). */
export const Band: React.FC<{ y: number; height: number; color: string; rotate?: number; seed: string; enterAt?: number; children?: React.ReactNode }> = ({
  y, height, color, rotate = 0, seed, enterAt = -100, children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - enterAt, fps, config: { damping: 15, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", left: -80, top: y, width: 1240, height, rotate: `${rotate}deg`, translate: `${(1 - p) * 1300}px 0px`, filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.3))" }}>
      <div style={{ position: "absolute", inset: 0, background: color, clipPath: tornPolygon(seed, 2.4, 30) }} />
      {children}
    </div>
  );
};

/** Archival image as a torn print (white border, shadow) with a slow push. */
export const Print: React.FC<{
  src: string; x: number; y: number; width: number; height: number; rotate?: number; enterAt?: number;
  zoom?: [number, number]; origin?: string; focus?: string; border?: number; seed: string; mono?: boolean; children?: React.ReactNode;
}> = ({ src, x, y, width, height, rotate = 0, enterAt = -100, zoom = [1.02, 1.1], origin = "50% 50%", focus = "50% 50%", border = 16, seed, mono, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = spring({ frame: frame - enterAt, fps, config: { damping: 13, stiffness: 150 } });
  const k = interpolate(frame, [0, durationInFrames], zoom);
  return (
    <div style={{ position: "absolute", left: x, top: y, width, height, rotate: `${rotate}deg`, scale: String(interpolate(p, [0, 1], [1.35, 1])),
      opacity: frame < enterAt ? 0 : Math.min(1, p * 3), filter: "drop-shadow(10px 16px 10px rgba(0,0,0,0.35))" }}>
      <div style={{ position: "absolute", inset: 0, background: "#fbf8f0", clipPath: tornPolygon(seed, 1.2) }} />
      <div style={{ position: "absolute", inset: border, overflow: "hidden", clipPath: tornPolygon(seed + "i", 0.6) }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, scale: String(k), transformOrigin: origin, filter: mono ? "grayscale(1) contrast(1.1) sepia(0.15)" : "sepia(0.08)" }} />
        {children}
      </div>
    </div>
  );
};

/** Full-bleed archival image (fills the frame) with a push toward `origin`. */
export const Bleed: React.FC<{ src: string; zoom?: [number, number]; origin?: string; focus?: string; pan?: [number, number]; opacity?: number; filter?: string }> = ({
  src, zoom = [1.0, 1.08], origin = "50% 50%", focus = "50% 50%", pan = [0, 0], opacity = 1, filter = "sepia(0.1) contrast(1.05)",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const k = interpolate(frame, [0, durationInFrames], zoom);
  const dx = interpolate(frame, [0, durationInFrames], pan);
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, scale: String(k), transformOrigin: origin, translate: `${dx}px 0px`, filter }} />
    </AbsoluteFill>
  );
};

/** EnglishU paper label (skill spec): Rubik 900, hard shadow, slight tilt, pops in from above. */
export const Label: React.FC<{ text: string; x: number; y: number; at: number; variant?: "cream" | "navy" | "red"; size?: number; rotate?: number; anchor?: "left" | "right" | "center" }> = ({
  text, x, y, at: a, variant = "cream", size = 58, rotate = -2, anchor = "center",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [a, a + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const colors = { cream: [CREAM, NAVY], navy: [NAVY, CREAM], red: [RED, CREAM] }[variant];
  const isRtl = /[֐-׿]/.test(text);
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        position: "absolute", top: y, left: x, translate: `${anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0"} ${(1 - p) * -70}px`,
        opacity: frame < a ? 0 : Math.min(1, p * 2), rotate: `${rotate}deg`,
        background: colors[0], color: colors[1], fontFamily: RUBIK, fontWeight: 900, fontSize: size, lineHeight: 1.1,
        padding: "16px 38px 14px", boxShadow: "6px 8px 0 rgba(0,0,0,.35)", whiteSpace: "nowrap",
      }}
    >
      {tokenize(text).map((t, i, all) => (
        <Fragment key={i}>
          {i > 0 && !all[i - 1].glued ? " " : null}
          <span dir={t.english ? "ltr" : undefined}>{t.text}</span>
        </Fragment>
      ))}
    </div>
  );
};

/** Big English key word (Anton, cream with navy stroke, or red accent). Slam: 1.9 → 0.95 → 1.05 → 1 with a 3-frame flash. */
export const BigWord: React.FC<{ text: string; at: number; y: number; size?: number; accent?: boolean; slam?: boolean }> = ({ text, at: a, y, size = 170, accent, slam = true }) => {
  const frame = useCurrentFrame();
  const t = frame - a;
  const s = slam ? interpolate(t, [0, 4, 7, 10], [1.9, 0.95, 1.05, 1], { ...clamp, easing: Easing.out(Easing.quad) }) : 1;
  const flash = slam ? interpolate(t, [0, 3], [0.85, 0], clamp) : 0;
  return (
    <>
      <div dir="ltr" style={{
        position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontSize: size, lineHeight: 1,
        color: accent ? RED : CREAM, WebkitTextStroke: `6px ${accent ? CREAM : NAVY}`, paintOrder: "stroke",
        textShadow: "8px 10px 0 rgba(0,0,0,0.35)", scale: String(s), rotate: `${interpolate(t, [0, 7], [-4, 0], clamp)}deg`, opacity: t < 0 ? 0 : 1,
      }}>
        {text}
      </div>
      {flash > 0 && t >= 0 ? <AbsoluteFill style={{ background: "white", opacity: flash }} /> : null}
    </>
  );
};

/** Spotlight vignette (skill highlight device): hole shrinks ~950 → 240 px over 14 frames, pulses, fades out at `out`. */
export const Spotlight: React.FC<{ cx: number; cy: number; at: number; out: number; minR?: number }> = ({ cx, cy, at: a, out, minR = 240 }) => {
  const frame = useCurrentFrame();
  if (frame < a || frame > out + 6) return null;
  const r = interpolate(frame, [a, a + 14], [950, minR], { ...clamp, easing: Easing.out(Easing.cubic) }) * (1 + 0.03 * Math.sin((frame - a) / 4));
  const alpha = 0.66 * interpolate(frame, [out, out + 5], [1, 0], clamp) * interpolate(frame, [a, a + 6], [0, 1], clamp);
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r}px, rgba(8,14,34,${alpha}) ${r + 150}px)` }} />;
};

/** Number that counts up to its target, formatted with thousands separators. */
export const Counter: React.FC<{ from: number; to: number; start: number; end: number; y: number; size?: number }> = ({ from, to, start, end, y, size = 150 }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [start, end], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = spring({ frame: frame - end, fps: FPS, config: { damping: 9 } });
  return (
    <div dir="ltr" style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontSize: size, color: CREAM,
      WebkitTextStroke: `6px ${NAVY}`, paintOrder: "stroke", textShadow: "8px 10px 0 rgba(0,0,0,0.35)", opacity: frame < start ? 0 : 1,
      scale: String(1 + 0.08 * (frame > end ? 1 - land : 0)) }}>
      {v.toLocaleString("en-US")}
    </div>
  );
};

/** Paper flame (the outbreak) with a ring of vaccinated people that closes around it. */
export const RingAroundFire: React.FC<{ cx: number; cy: number; R: number; peopleAt: number; closeAt: number; dimAt?: number }> = ({ cx, cy, R, peopleAt, closeAt, dimAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flicker = 1 + 0.06 * Math.sin(frame / 2.2) + 0.04 * Math.sin(frame / 1.3);
  const flame = dimAt === undefined ? 1 : interpolate(frame, [dimAt, dimAt + 18], [1, 0.45], clamp);
  const ring = `M ${cx} ${cy - R} A ${R} ${R} 0 1 0 ${cx + 0.01} ${cy - R}`;
  const rp = interpolate(frame, [closeAt, closeAt + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${cx} ${cy}) scale(${flicker * flame}) translate(${-cx} ${-cy})`}>
        <path d={`M ${cx} ${cy - 150} C ${cx + 90} ${cy - 60}, ${cx + 110} ${cy + 40}, ${cx + 70} ${cy + 100} C ${cx + 40} ${cy + 140}, ${cx - 40} ${cy + 140}, ${cx - 70} ${cy + 100} C ${cx - 110} ${cy + 40}, ${cx - 60} ${cy - 30}, ${cx} ${cy - 150} Z`}
          fill={RED} stroke={CREAM} strokeWidth={10} />
        <path d={`M ${cx} ${cy - 40} C ${cx + 40} ${cy + 10}, ${cx + 45} ${cy + 60}, ${cx + 25} ${cy + 95} C ${cx + 10} ${cy + 115}, ${cx - 10} ${cy + 115}, ${cx - 25} ${cy + 95} C ${cx - 45} ${cy + 60}, ${cx - 30} ${cy + 10}, ${cx} ${cy - 40} Z`}
          fill="#E8A04C" />
      </g>
      <path d={ring} fill="none" stroke={NAVY} strokeWidth={16} strokeLinecap="round" {...evolvePath(rp, ring)} />
      {Array.from({ length: 10 }).map((_, i) => {
        const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const s = spring({ frame: frame - peopleAt - i * 2, fps, config: { damping: 10 } });
        const x = cx + Math.cos(ang) * R;
        const y = cy + Math.sin(ang) * R;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={44} fill={NAVY} stroke={CREAM} strokeWidth={8} />
            <circle cy={-12} r={13} fill={CREAM} />
            <path d="M -22 22 Q 0 -4 22 22" fill={CREAM} />
          </g>
        );
      })}
    </svg>
  );
};

/** The round mark becomes a medal: navy ring draws around it, red ribbon tails drop below. */
export const Medal: React.FC<{ cx: number; cy: number; r: number; at: number }> = ({ cx, cy, r, at: a }) => {
  const frame = useCurrentFrame();
  const ring = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`;
  const rp = interpolate(frame, [a, a + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const tails = interpolate(frame, [a + 8, a + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${cx} ${cy + r - 10}) scale(1 ${tails})`} opacity={tails > 0 ? 1 : 0}>
        <path d="M -70 0 L -120 230 L -78 205 L -45 245 L 5 20 Z" fill={RED} stroke={CREAM} strokeWidth={6} />
        <path d="M 70 0 L 120 230 L 78 205 L 45 245 L -5 20 Z" fill={NAVY} stroke={CREAM} strokeWidth={6} />
      </g>
      <path d={ring} fill="none" stroke={CREAM} strokeWidth={30} {...evolvePath(rp, ring)} />
      <path d={ring} fill="none" stroke={NAVY} strokeWidth={16} {...evolvePath(rp, ring)} />
    </svg>
  );
};

/** A print that tears into two halves which drift apart from `at`. */
export const TearingPrint: React.FC<{ src: string; x: number; y: number; width: number; height: number; at: number }> = ({ src, x, y, width, height, at: a }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [a, a + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pts = Array.from({ length: 13 }).map((_, i) => `${50 + (random(`tear${i}`) - 0.5) * 9}% ${(i / 12) * 100}%`);
  const left = `polygon(0% 0%, ${pts.join(", ")}, 0% 100%)`;
  const right = `polygon(100% 0%, ${pts.join(", ")}, 100% 100%)`;
  const half = (clip: string, dir: number) => (
    <div style={{ position: "absolute", inset: 0, clipPath: clip, translate: `${dir * p * 130}px ${p * 40}px`, rotate: `${dir * p * 9}deg`,
      filter: "drop-shadow(10px 16px 10px rgba(0,0,0,0.35))" }}>
      <div style={{ position: "absolute", inset: 0, background: "#fbf8f0" }} />
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 16, width: width - 32, height: height - 32, objectFit: "cover", filter: "sepia(0.1)" }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width, height }}>
      {half(left, -1)}
      {half(right, 1)}
    </div>
  );
};

/** Right-to-left timeline (1796 on the right) that draws itself, with year tags. */
export const Timeline: React.FC<{ y: number; start: number; draw: number; ticks: { label: string; x: number; at: number; red?: boolean }[] }> = ({ y, start, draw, ticks }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + draw], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <>
      <div style={{ position: "absolute", top: y, right: 120, width: 840 * p, height: 14, background: NAVY, borderRadius: 7, boxShadow: "4px 6px 0 rgba(0,0,0,0.25)" }} />
      {ticks.map((t) => (
        <Fragment key={t.label}>
          <div style={{ position: "absolute", left: t.x - 12, top: y - 12, width: 38, height: 38, borderRadius: "50%", background: t.red ? RED : CREAM,
            border: `7px solid ${NAVY}`, scale: String(frame < t.at ? 0 : spring({ frame: frame - t.at, fps: FPS, config: { damping: 10 } })) }} />
          <Label text={t.label} x={t.x + 7} y={y + 60} at={t.at} variant={t.red ? "red" : "cream"} size={60} rotate={0} />
        </Fragment>
      ))}
    </>
  );
};

/** Many people (cream dots) filling the frame; one red case pulses. */
export const Crowd: React.FC<{ redAt: number }> = ({ redAt }) => {
  const frame = useCurrentFrame();
  const cols = 9;
  const rows = 15;
  return (
    <>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = 60 + c * 120 + (r % 2) * 60 + (random(`cx${i}`) - 0.5) * 30;
        const y = 120 + r * 120 + (random(`cy${i}`) - 0.5) * 30;
        const isCase = c === 4 && r === 7;
        const appear = interpolate(frame, [(c + r) * 0.6, (c + r) * 0.6 + 6], [0, 1], clamp);
        const pulse = isCase && frame >= redAt ? 1 + 0.15 * Math.sin((frame - redAt) / 3) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%",
            background: isCase && frame >= redAt ? RED : CREAM, border: `5px solid ${NAVY}`, scale: String(appear * pulse), boxShadow: "3px 5px 0 rgba(0,0,0,0.25)" }} />
        );
      })}
    </>
  );
};

/** Hebrew subtitles per skill spec: Rubik 800, 66 px, white with black stroke, bottom-aligned in a box at y 1300. */
export const Subtitle: React.FC<{ text: string; ltr?: boolean }> = ({ text, ltr }) => (
  <div style={{ position: "absolute", left: 90, width: 900, top: 1300, height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div dir={ltr ? "ltr" : "rtl"} lang={ltr ? "en" : "he"} style={{ fontFamily: RUBIK, fontWeight: 800, fontSize: 66, lineHeight: 1.2, color: "white", textAlign: "center",
      WebkitTextStroke: "12px #000", paintOrder: "stroke" }}>
      {ltr ? text : tokenize(text).map((t, i, all) => (
        <Fragment key={i}>
          {i > 0 && !all[i - 1].glued ? " " : null}
          <span dir={t.english ? "ltr" : undefined}>{t.text}</span>
        </Fragment>
      ))}
    </div>
  </div>
);

/** Animated EnglishU end card (~2.7 s). */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const page = spring({ frame, fps, config: { damping: 15 } });
  const logo = spring({ frame: frame - 8, fps, config: { damping: 9, stiffness: 160 } });
  const bar = interpolate(frame, [22, 32], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cta = spring({ frame: frame - 44, fps, config: { damping: 11 } });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  return (
    <AbsoluteFill style={{ background: "#14171f" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 60px)" }} />
      <AbsoluteFill style={{ scale: String(push) }}>
        <div style={{ position: "absolute", left: 60, top: 230, width: 960, height: 1240, translate: `0px ${(1 - page) * 1500}px`, filter: "drop-shadow(0 20px 18px rgba(0,0,0,0.5))" }}>
          <div style={{ position: "absolute", inset: 0, background: CREAM, clipPath: tornPolygon("endcard", 2.2, 30) }} />
          <PaperGrain opacity={0.25} animated={false} />
          <div style={{ position: "absolute", left: "50%", top: 70, width: 420, translate: "-50% 0", rotate: "-4deg",
            scale: String(interpolate(logo, [0, 1], [1.8, 1])), opacity: frame < 8 ? 0 : 1, filter: "drop-shadow(6px 10px 6px rgba(0,0,0,0.35))" }}>
            <div style={{ background: "white", padding: 18, clipPath: tornPolygon("logo", 2.5, 14) }}>
              <Img src={staticFile("brand/logo.png")} style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ position: "absolute", top: -22, left: "50%", translate: "-50% 0", width: 170, height: 46, background: "rgba(240,232,205,0.9)", rotate: "6deg" }} />
          </div>
          <div dir="rtl" style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", fontFamily: fonts.heSerif, fontWeight: 900, fontSize: 104,
            color: INK, opacity: interpolate(frame, [12, 18], [0, 1], clamp), translate: `0 ${interpolate(frame, [12, 18], [30, 0], clamp)}px` }}>
            עוד עובדה מעניינת.
          </div>
          <div style={{ position: "absolute", top: 690, left: 80, right: 80, height: 130, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: NAVY, clipPath: `inset(0 0 0 ${(1 - bar) * 100}%)` }} />
            <div dir="rtl" style={{ position: "relative", textAlign: "center", lineHeight: "130px", fontFamily: RUBIK, fontWeight: 900, fontSize: 80, color: CREAM, opacity: bar }}>
              עוד מילה באנגלית.
            </div>
          </div>
          <div style={{ position: "absolute", top: 900, left: "50%", width: 760, translate: "-50% 0", rotate: "2deg",
            scale: String(interpolate(cta, [0, 1], [1.4, 1])), opacity: frame < 44 ? 0 : 1, filter: "drop-shadow(6px 10px 6px rgba(0,0,0,0.3))" }}>
            <div style={{ position: "absolute", inset: 0, background: "#e9e1cd", clipPath: tornPolygon("cta", 2, 18) }} />
            <div style={{ position: "relative", padding: "26px 30px", textAlign: "center" }}>
              <div dir="rtl" style={{ fontFamily: RUBIK, fontWeight: 800, fontSize: 64, color: INK }}>לעוד כאלה ← עקבו</div>
              <div dir="ltr" style={{ fontFamily: RUBIK, fontWeight: 900, fontSize: 56, color: RED, marginTop: 6 }}>@improve.with.englishu</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
