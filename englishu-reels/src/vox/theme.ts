import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import fontFiles from "./fonts.json";

// Fonts are stored in public/fonts (see scripts/fetch-fonts.mjs), so renders work offline.
for (const f of fontFiles) {
  loadFont({ family: f.family, url: staticFile(f.file), weight: f.weight, unicodeRange: f.unicodeRange, display: "block" });
}

// Instagram Reels format
export const REEL = { width: 1080, height: 1920, fps: 30 } as const;

// Areas covered by Instagram's UI. Keep headlines, captions and key visuals out of them.
// Right column holds like/comment/share buttons — matters for right-aligned Hebrew.
export const SAFE = { top: 220, bottom: 440, left: 70, right: 150 } as const;

export const fonts = {
  // Hebrew headlines / kinetic type (bold, editorial)
  heDisplay: "'Secular One', 'Heebo', sans-serif",
  // Hebrew captions and body
  heBody: "'Heebo', sans-serif",
  // English vocabulary: the original skill's subtitle font
  en: "'Anton', 'Heebo', sans-serif",
  // Diorama style: newsprint serif + distressed letterpress labels
  heSerif: "'Frank Ruhl Libre', serif",
  heStamp: "'Rubik Dirt', 'Secular One', sans-serif",
  enType: "'Special Elite', monospace",
};

export type VoxStyle = "mixed-media" | "diorama";

export type Palette = {
  paper: string;
  fields: string[]; // flat background fields, one dominant per scene
  ink: string;
  accent: string; // marker / highlight / vocab color
  accent2: string;
  cutoutBorder: string;
};

export const palettes: Record<VoxStyle, Palette> = {
  // Vox Mixed Media: warm yellow, off-white paper, deep navy, coral red
  "mixed-media": {
    paper: "#f4efe6",
    fields: ["#ffd23f", "#f4efe6", "#1d2b4f", "#f2545b"],
    ink: "#141414",
    accent: "#f2545b",
    accent2: "#ffd23f",
    cutoutBorder: "#ffffff",
  },
  // Paper diorama: aged sepia newsprint, one burnt-orange accent
  diorama: {
    paper: "#d9c9a8",
    fields: ["#cbb995", "#b8a47f", "#2a2219", "#e3d5b8"],
    ink: "#1f1a14",
    accent: "#c4501b",
    accent2: "#c4501b",
    cutoutBorder: "#efe6d2",
  },
};
