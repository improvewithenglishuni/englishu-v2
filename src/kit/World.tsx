import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {TYPEFACES} from './fonts';
import {asset, Theme, ThemeProvider, useTheme, worldAsset} from './theme';
import {tornBandPath, tornEdgePoints, tornHalfPlanePath} from './torn';

const PLATE_W = 1200;
const PLATE_H = 2300;

/**
 * The locked world. Everything inside `children` lives on the paper and is pushed by the
 * camera (one continuous shot). `hud` (subtitles) sits above the camera, under the grain.
 */
export const World: React.FC<{
  theme: Theme;
  /** camera scale at first and last frame */
  push?: [number, number];
  /** slow pan in px over the whole composition */
  pan?: [number, number];
  grain?: number;
  vignette?: number;
  hud?: React.ReactNode;
  children: React.ReactNode;
}> = ({theme, push = [1, 1.06], pan = [0, 0], grain = 0.08, vignette = 0.22, hud, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const s = push[0] + (push[1] - push[0]) * t;
  return (
    <ThemeProvider theme={theme}>
      <AbsoluteFill style={{backgroundColor: theme.lightBase, overflow: 'hidden', ['--kit-font' as string]: TYPEFACES[theme.typeface ?? 'modern']}}>
        <AbsoluteFill
          style={{
            transform: `translate(${pan[0] * t}px, ${pan[1] * t}px) scale(${s})`,
            transformOrigin: '50% 45%',
          }}
        >
          {children}
        </AbsoluteFill>
        {hud}
        <Grain opacity={grain} width={width} height={height} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
          }}
        />
      </AbsoluteFill>
    </ThemeProvider>
  );
};

/** One paper plate (light or dark) plus what is glued onto it. */
export type PlateVariant = 'light' | 'dark' | 'peri' | 'charcoal' | 'clip';

export const WorldLayer: React.FC<{variant: PlateVariant; children?: React.ReactNode}> = ({variant, children}) => {
  const theme = useTheme();
  const {width, height} = useVideoConfig();
  const bg = variant === 'clip' ? '#DAD9D6' : variant === 'light' ? theme.lightBase : variant === 'dark' ? theme.darkBase : variant === 'peri' ? theme.spot : (theme.ui?.charcoal ?? theme.darkBase);
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      <Img
        src={worldAsset(theme, `plate_${variant}.jpg`)}
        style={{
          position: 'absolute',
          width: PLATE_W,
          height: PLATE_H,
          left: (width - PLATE_W) / 2,
          top: (height - PLATE_H) / 2,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const Grain: React.FC<{opacity: number; width: number; height: number}> = ({opacity, width, height}) => {
  const tile = 512;
  const cols = Math.ceil(width / tile);
  const rows = Math.ceil(height / tile);
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity, pointerEvents: 'none'}}>
      {Array.from({length: rows * cols}, (_, i) => (
        <Img
          key={i}
          src={asset('grain.png')}
          style={{position: 'absolute', width: tile, height: tile, left: (i % cols) * tile, top: Math.floor(i / cols) * tile}}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Torn-paper wipe: the current world is ripped away along a torn edge that travels across the
 * frame, revealing `children` (usually <WorldLayer variant="dark">). Never a hard cut.
 */
export const TornWipe: React.FC<{
  at: number;
  duration?: number;
  /** direction of the torn edge line in degrees */
  angle?: number;
  seed?: number;
  /** width range of the white torn margin on the old sheet */
  band?: [number, number];
  children: React.ReactNode;
}> = ({at, duration = 24, angle = -35, seed = 5, band = [12, 34], children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const theme = useTheme();
  const reach = Math.hypot(width, height) / 2 + 120;
  const p = interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const a = (angle * Math.PI) / 180;
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const d = reach - 2 * reach * p;
  const cx = width / 2 + nx * d;
  const cy = height / 2 + ny * d;
  const pts = useMemo(() => tornEdgePoints(0, 0, angle, reach + 200, {seed, big: [160, 34], mid: [40, 10]}), [angle, reach, seed]);
  const moved = pts.map(([x, y]) => [x + cx, y + cy] as [number, number]);
  if (p <= 0) return null;
  const revealed = tornHalfPlanePath(moved, angle, 1);
  const margin = tornBandPath(moved, angle, -1, band, seed);
  const edge = 'M' + moved.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  const fid = `fibre-${seed}`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: p >= 1 ? undefined : `path("${revealed}")`}}>
        {children}
        {p < 1 ? (
          <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
            <defs>
              <filter id={`sh-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>
            {/* shadow the old sheet casts onto the new world */}
            <path d={edge} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={34} filter={`url(#sh-${seed})`} />
          </svg>
        ) : null}
      </AbsoluteFill>
      {p < 1 ? (
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
            </filter>
          </defs>
          <path d={margin} fill={theme.paper} filter={`url(#${fid})`} />
          <path d={margin} fill="rgba(255,255,255,0.35)" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
