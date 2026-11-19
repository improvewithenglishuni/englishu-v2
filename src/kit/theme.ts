/**
 * The palette. One JSON per world lives in ./themes and is read by BOTH the Remotion kit and
 * the Python asset tools (tools/make_plate.py --palette <name>), so a new topic gets its own
 * world by adding one file and re-running the tools.
 */
import React, {createContext, useContext} from 'react';
import {staticFile} from 'remotion';
import plane from './themes/plane.json';
import smallpox from './themes/smallpox.json';
import newsprint from './themes/newsprint.json';
import vox from './themes/vox.json';

export type Theme = {
  name: string;
  /** light world paper (sky) */
  lightBase: string;
  lightDots: string;
  /** dark world card stock */
  darkBase: string;
  darkSecondary: string;
  /** pale torn layer used on the dark world */
  paleLayer: string;
  /** white paper (clouds, strips) */
  paper: string;
  /** label + key word fill */
  cream: string;
  /** text, outlines, arrows on light paper */
  ink: string;
  crystalFace: string;
  crystalLine: string;
  /** the ONE accent: key-word half, one swoosh, arrows */
  accent: string;
  /** second paper colour: torn colour blocks and offset strokes behind photo cutouts */
  spot: string;
  /** Vox-style UI colours (charts, maps, people, cards). Measured from real Vox stills. */
  ui?: Ui;
  /** the ONE typeface of the whole video: 'modern' (Rubik) or 'historic' (David Libre). Default modern. */
  typeface?: 'modern' | 'historic';
  /** folder name under assets/worlds/ when different from `name` (shares plates between themes) */
  plates?: string;
};

export type Ui = {
  slate: string; charcoal: string; periwinkle: string; blue: string; cobalt: string; steel: string;
  chartLine: string; heading: string; pink: string; land: string; yellow: string; dim: string;
  white: string; black: string; halo: string; purple: string; teal: string;
};

const voxTheme = {...(vox as Theme), typeface: 'historic'} as Theme;
export const themes: Record<string, Theme> = {
  plane,
  smallpox,
  newsprint,
  /** Vox world, historic typeface (David Libre): history topics */
  vox: voxTheme,
  /** same Vox world and plates, modern typeface (Rubik): modern / science / tech topics */
  'vox-modern': {...voxTheme, name: 'vox-modern', typeface: 'modern', plates: 'vox'},
};
export const themeNames = Object.keys(themes) as [string, ...string[]];
export const defaultTheme: Theme = plane;

/** Brand colours: logo and end card ONLY. Never use these in the body of a Reel. */
export const BRAND = {navy: '#0A2370', red: '#B01F25'} as const;

const ThemeContext = createContext<Theme>(defaultTheme);
export const ThemeProvider: React.FC<{theme: Theme; children: React.ReactNode}> = ({theme, children}) =>
  React.createElement(ThemeContext.Provider, {value: theme}, children);
export const useTheme = () => useContext(ThemeContext);
/** Vox UI palette of the current theme (falls back to the vox theme). */
export const useUi = (): Ui => useContext(ThemeContext).ui ?? (vox as Theme).ui!;

/** Asset made by the Python tools for this theme: public/assets/worlds/<theme>/<file>. */
export const worldAsset = (theme: Theme, file: string) => staticFile(`assets/worlds/${theme.plates ?? theme.name}/${file}`);
export const asset = (file: string) => staticFile(`assets/${file}`);
