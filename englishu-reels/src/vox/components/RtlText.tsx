import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../theme";

const LATIN = /[A-Za-z]/;
const HEBREW = /[\u0590-\u05FF\uFB1D-\uFB4F]/;

// Hebrew prefix letters glued to an English word: "ה-deadline", "ב־jeans"
const PREFIXED = /^([\u0590-\u05FF]+[-\u05BE])([A-Za-z].*)$/;

/** `glued`: no space after this token (a Hebrew prefix attached to the next word). */
export type Token = { text: string; english: boolean; glued?: boolean };

/**
 * Splits mixed Hebrew/English text into animation units.
 * Consecutive English words ("skinny jeans") stay one LTR unit so the
 * phrase never reverses inside the RTL line. Punctuation stays attached.
 */
export const tokenize = (text: string): Token[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const tokens: Token[] = [];
  for (const word of words) {
    const prefixed = PREFIXED.exec(word);
    if (prefixed) {
      tokens.push({ text: prefixed[1], english: false, glued: true });
      tokens.push({ text: prefixed[2], english: true });
      continue;
    }
    const english = LATIN.test(word) && !HEBREW.test(word);
    const prev = tokens[tokens.length - 1];
    if (english && prev?.english) prev.text += ` ${word}`;
    else tokens.push({ text: word, english });
  }
  return tokens;
};

/**
 * Right-to-left text with English vocabulary rendered as LTR islands
 * in the English font and accent color.
 * `animate`: words pop in one by one starting at `startAt`, `stagger` frames apart.
 */
export const RtlText: React.FC<{
  text: string;
  fontSize: number;
  color: string;
  englishColor?: string;
  fontFamily?: string;
  englishFont?: string;
  animate?: boolean;
  startAt?: number;
  stagger?: number;
  align?: "right" | "center";
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  fontSize,
  color,
  englishColor,
  fontFamily = fonts.heDisplay,
  englishFont = fonts.en,
  animate = true,
  startAt = 0,
  stagger = 3,
  align = "right",
  lineHeight = 1.15,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenize(text);
  return (
    <div
      dir="rtl"
      lang="he"
      style={{ fontFamily, fontSize, color, lineHeight, textAlign: align, ...style }}
    >
      {tokens.map((t, i) => {
        const p = animate
          ? spring({ frame: frame - startAt - i * stagger, fps, config: { damping: 13, stiffness: 180 } })
          : 1;
        return (
          <span
            key={i}
            dir={t.english ? "ltr" : undefined}
            lang={t.english ? "en" : undefined}
            style={{
              display: "inline-block",
              // Physical left = end side of the RTL line (an LTR token would flip "inline-end")
              marginLeft: t.glued ? 0 : "0.25em",
              opacity: Math.min(1, p * 1.5),
              translate: `0 ${(1 - p) * 0.5}em`,
              scale: String(0.85 + 0.15 * p),
              ...(t.english
                ? { fontFamily: englishFont, color: englishColor ?? color, fontSize: "1.05em", letterSpacing: "0.01em" }
                : {}),
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
