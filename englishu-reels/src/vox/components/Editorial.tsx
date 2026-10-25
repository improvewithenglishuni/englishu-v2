import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePalette } from "../scene-context";
import { fonts } from "../theme";
import { PaperGrain, Tape } from "./Paper";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * EnglishU vocabulary card: the English word big, the Hebrew meaning under it.
 * Slaps onto the frame at `at` (sync it to the cue where the word is spoken).
 */
export const VocabCard: React.FC<{
  word: string;
  meaning: string; // Hebrew
  note?: string; // e.g. part of speech or stress "DEN-im"
  at: number;
  x: number; // center
  y: number; // top
  rotate?: number;
}> = ({ word, meaning, note, at, x, y, rotate = -3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = usePalette();
  const p = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% 0",
        scale: String(interpolate(p, [0, 1], [1.6, 1])),
        rotate: `${rotate}deg`,
        opacity: frame < at ? 0 : Math.min(1, p * 2),
        background: palette.paper,
        padding: "34px 56px 30px",
        boxShadow: "10px 16px 0 rgba(0,0,0,0.85)",
        textAlign: "center",
        minWidth: 520,
      }}
    >
      <Tape style={{ top: -22, left: "50%", translate: "-50% 0", rotate: "4deg" }} />
      <div dir="ltr" lang="en" style={{ fontFamily: fonts.en, fontSize: 150, lineHeight: 1, color: palette.ink }}>
        {word}
      </div>
      {note ? (
        <div dir="ltr" style={{ fontFamily: fonts.heBody, fontWeight: 500, fontSize: 40, color: palette.ink, opacity: 0.7, marginTop: 8 }}>
          {note}
        </div>
      ) : null}
      <div
        dir="rtl"
        lang="he"
        style={{
          fontFamily: fonts.heBody,
          fontWeight: 800,
          fontSize: 64,
          color: palette.ink,
          marginTop: 14,
          display: "inline-block",
          background: palette.accent2,
          padding: "2px 18px",
        }}
      >
        {meaning}
      </div>
      <PaperGrain opacity={0.2} animated={false} />
    </div>
  );
};

/**
 * Letterpress stamp that slams down at `at` with a little camera-shake recoil.
 * The diorama style's signature prop typography; also works as a Vox "stamp" beat.
 */
export const Stamp: React.FC<{
  text: string;
  at: number;
  x: number;
  y: number;
  rotate?: number;
  fontSize?: number;
  color?: string;
  /** "multiply" looks inked-in on light paper; use "normal" on dark fields */
  blend?: "multiply" | "normal";
}> = ({ text, at, x, y, rotate = -8, fontSize = 130, color, blend = "multiply" }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const c = color ?? palette.accent;
  const t = interpolate(frame, [at, at + 5], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const isHebrew = /[֐-׿]/.test(text);
  return (
    <div
      dir={isHebrew ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rotate}deg`,
        scale: String(interpolate(t, [0, 1], [2.4, 1])),
        opacity: frame < at ? 0 : interpolate(t, [0, 0.4], [0, 0.92], clamp),
        border: `10px solid ${c}`,
        color: c,
        padding: "6px 30px",
        fontFamily: isHebrew ? fonts.heStamp : fonts.en,
        fontSize,
        lineHeight: 1.1,
        mixBlendMode: blend,
        whiteSpace: "nowrap",
        maskImage: "radial-gradient(circle at 30% 40%, black 60%, rgba(0,0,0,0.75) 100%)",
      }}
    >
      {text}
    </div>
  );
};

/** Solid redaction / censor bar that slides across. */
export const CensorBar: React.FC<{
  at: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  from?: "left" | "right" | "slam";
  rotate?: number;
}> = ({ at, x, y, width, height, color, from = "right", rotate = -2 }) => {
  const frame = useCurrentFrame();
  const palette = usePalette();
  const p = interpolate(frame, [at, at + (from === "slam" ? 4 : 8)], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const reveal = from === "slam" ? 1 : p;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: from === "slam" ? y - (1 - p) * 300 : y,
        width,
        height,
        background: color ?? palette.ink,
        rotate: `${rotate}deg`,
        opacity: frame < at ? 0 : 1,
        clipPath:
          from === "left"
            ? `inset(0 ${(1 - reveal) * 100}% 0 0)`
            : `inset(0 0 0 ${(1 - reveal) * 100}%)`,
      }}
    />
  );
};

/** Bars grow in sequence. Values are real numbers now — label them (unlike AI clips). */
export const BarChart: React.FC<{
  values: number[];
  labels?: string[];
  valueLabels?: string[];
  at: number;
  x: number;
  y: number; // baseline
  width: number;
  maxHeight: number;
  highlight?: number; // index in accent color
  rtl?: boolean; // order bars right-to-left for Hebrew reading direction
}> = ({ values, labels, valueLabels, at, x, y, width, maxHeight, highlight, rtl = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palette = usePalette();
  const max = Math.max(...values);
  const gap = 28;
  const barW = (width - gap * (values.length - 1)) / values.length;
  return (
    <div style={{ position: "absolute", left: x, top: y - maxHeight - 90, width, height: maxHeight + 180 }}>
      <div
        style={{
          position: "absolute", bottom: 90, left: -20, right: -20, height: 8,
          background: palette.ink, borderRadius: 4,
        }}
      />
      {values.map((v, i) => {
        const p = spring({ frame: frame - at - i * 5, fps, config: { damping: 14 } });
        const h = (v / max) * maxHeight * p;
        const col = rtl ? values.length - 1 - i : i;
        const left = col * (barW + gap);
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute", left, bottom: 98, width: barW, height: h,
                background: i === highlight ? palette.accent : palette.ink,
                boxShadow: "6px 6px 0 rgba(0,0,0,0.18)",
              }}
            />
            {valueLabels?.[i] ? (
              <div
                style={{
                  position: "absolute", left, width: barW, bottom: 108 + h, textAlign: "center",
                  fontFamily: fonts.en, fontSize: 56, color: palette.ink, opacity: p,
                }}
              >
                {valueLabels[i]}
              </div>
            ) : null}
            {labels?.[i] ? (
              <div
                dir="auto"
                style={{
                  position: "absolute", left: left - 20, width: barW + 40, bottom: 20, textAlign: "center",
                  fontFamily: fonts.heBody, fontWeight: 800, fontSize: 38, color: palette.ink,
                }}
              >
                {labels[i]}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/** Small deterministic shake for impacts. Returns a CSS translate string. */
export const useImpactShake = (at: number, strength = 18, frames = 8) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > frames) return "0px 0px";
  const decay = 1 - t / frames;
  const dx = (random(`sx${at}-${t}`) - 0.5) * 2 * strength * decay;
  const dy = (random(`sy${at}-${t}`) - 0.5) * 2 * strength * decay;
  return `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
};
