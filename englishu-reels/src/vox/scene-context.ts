import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import type { ResolvedScene } from "./timeline";
import { palettes, type Palette, type VoxStyle } from "./theme";

type SceneContextValue = { scene: ResolvedScene; style: VoxStyle };

export const SceneContext = createContext<SceneContextValue | null>(null);

export const useScene = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene() must be used inside a Vox scene");
  return ctx;
};

/** Palette of the current scene; outside a VoxReel scene, the default style's palette. */
export const usePalette = (): Palette => palettes[useContext(SceneContext)?.style ?? "mixed-media"];

/** Frame (relative to scene start) of a named cue. Falls back to `fallbackSeconds`. */
export const useCue = (name: string, fallbackSeconds = 0) => {
  const { scene } = useScene();
  const { fps } = useVideoConfig();
  return Math.round((scene.cues?.[name] ?? fallbackSeconds) * fps);
};
