import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { staticFile } from "remotion";
import type { VoxStyle } from "./theme";

/**
 * One scene = one idea. Voiceover and visuals are specified separately:
 * - `voiceover` is what is heard (file + where it starts inside the scene)
 * - `visual` is the brief for what is seen; the scene component implements it
 * - `cues` are named moments (seconds from scene start) both sides sync to
 */
export type SceneSpec = {
  id: string;
  voiceover: {
    /** Exact spoken text: Hebrew with English vocabulary inline */
    text: string;
    /** Path inside public/, e.g. "reels/jeans/vo/s01.wav". Omit while drafting. */
    file?: string;
    /** Seconds after scene start that the voice begins (default 0.25) */
    offset?: number;
    volume?: number;
  };
  /** Plain-language visual brief (the Remotion counterpart of a Higgsfield block prompt) */
  visual: string;
  /** Fixed length in seconds. Omit to fit the voiceover (+ tail) automatically. */
  duration?: number;
  /** Named beats in seconds from scene start, e.g. { vocab: 2.4, stamp: 4.1 } */
  cues?: Record<string, number>;
  /** Burned subtitle chunks. `at` = seconds from scene start; missing `at`s are spread across the voice. */
  captions?: { text: string; at?: number }[];
  /** Optional sound effects at cue times: file in public/ */
  sfx?: { file: string; at: number; volume?: number }[];
};

export type ReelSpec = {
  id: string;
  title: string;
  style: VoxStyle;
  scenes: SceneSpec[];
  music?: { file: string; volume?: number };
  /** Silence kept after each voice line before the next scene (default 0.35s) */
  tail?: number;
  showCaptions?: boolean;
};

export type ResolvedScene = SceneSpec & {
  from: number; // frame where the scene starts in the reel
  durationInFrames: number;
  voiceSeconds: number | null;
};

export type ReelProps = {
  spec: ReelSpec;
  resolved?: ResolvedScene[];
  showSafeZones?: boolean;
};

const DEFAULT_OFFSET = 0.25;
const DEFAULT_TAIL = 0.35;
// Draft estimate when no recording exists yet (Hebrew narration, measured pace)
const WORDS_PER_SECOND = 2.2;

export const voiceOffset = (scene: SceneSpec) => scene.voiceover.offset ?? DEFAULT_OFFSET;

export const getAudioDuration = async (file: string) => {
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(staticFile(file)) });
  try {
    return await input.computeDuration();
  } finally {
    input.dispose();
  }
};

export const estimateSpeechSeconds = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length / WORDS_PER_SECOND;

/** Lays scenes end-to-end. Scenes do not overlap, so audio timing stays exact. */
export const resolveScenes = async (spec: ReelSpec, fps: number): Promise<ResolvedScene[]> => {
  const tail = spec.tail ?? DEFAULT_TAIL;
  const voiceLengths = await Promise.all(
    spec.scenes.map((s) => (s.voiceover.file ? getAudioDuration(s.voiceover.file) : null)),
  );
  let from = 0;
  return spec.scenes.map((scene, i) => {
    const voiceSeconds = voiceLengths[i];
    const spoken = voiceSeconds ?? estimateSpeechSeconds(scene.voiceover.text);
    const seconds = scene.duration ?? voiceOffset(scene) + spoken + tail;
    const durationInFrames = Math.max(1, Math.round(seconds * fps));
    const resolved = { ...scene, from, durationInFrames, voiceSeconds };
    from += durationInFrames;
    return resolved;
  });
};

/** Caption chunks with absolute start/end in seconds from scene start. */
export const timeCaptions = (scene: ResolvedScene, fps: number) => {
  const chunks = scene.captions ?? [];
  if (chunks.length === 0) return [];
  const start = voiceOffset(scene);
  const spoken =
    scene.voiceSeconds ?? estimateSpeechSeconds(scene.voiceover.text);
  const totalChars = chunks.reduce((sum, c) => sum + c.text.length, 0);
  let cursor = start;
  const starts = chunks.map((c) => {
    const at = c.at ?? cursor;
    cursor = at + (c.text.length / totalChars) * spoken;
    return at;
  });
  const sceneEnd = scene.durationInFrames / fps;
  return chunks.map((c, i) => ({
    text: c.text,
    start: starts[i],
    end: i < chunks.length - 1 ? starts[i + 1] : Math.min(start + spoken + 0.2, sceneEnd),
  }));
};
