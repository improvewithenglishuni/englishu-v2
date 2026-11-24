// Shared paper-world building blocks for EnglishU Reels (Vox look, guideline 13).
import React from 'react';
import {AbsoluteFill, Img, getStaticFiles, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const C = {
  light: '#EDEEF3',
  dark: '#3A3C4A',
  peri: '#A1ACCA',
  charcoal: '#353336',
  paper: '#F4F3F9',
  cream: '#F3EAD3',
  accent: '#F4CF3A', // the topic's own colour: Post-it yellow
  accentDeep: '#DDB321',
  glow: '#FDF551',
};

export const FONT = 'Rubik, sans-serif';

/** Jagged polygon path for torn paper, deterministic per seed. */
export const tornPath = (w: number, h: number, seed: string, amp = 7, step = 16, edges = {t: true, r: true, b: true, l: true}) => {
  const pts: string[] = [];
  const j = (i: number, k: string) => (random(`${seed}-${k}-${i}`) - 0.5) * 2 * amp;
  for (let x = 0, i = 0; x <= w; x += step, i++) pts.push(`${x},${edges.t ? j(i, 't') + amp : 0}`);
  for (let y = 0, i = 0; y <= h; y += step, i++) pts.push(`${edges.r ? w - amp + j(i, 'r') : w},${y}`);
  for (let x = w, i = 0; x >= 0; x -= step, i++) pts.push(`${x},${edges.b ? h - amp + j(i, 'b') : h}`);
  for (let y = h, i = 0; y >= 0; y -= step, i++) pts.push(`${edges.l ? j(i, 'l') + amp : 0},${y}`);
  return `M${pts.join(' L')} Z`;
};

/** A torn sheet of paper as an absolutely positioned SVG. */
export const TornSheet: React.FC<{x: number; y: number; w: number; h: number; color: string; seed: string; rotate?: number; shadow?: boolean; amp?: number; edges?: {t: boolean; r: boolean; b: boolean; l: boolean}; style?: React.CSSProperties}> = ({x, y, w, h, color, seed, rotate = 0, shadow = true, amp = 7, edges, style}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: x, top: y, transform: `rotate(${rotate}deg)`, overflow: 'visible', filter: shadow ? 'drop-shadow(0 10px 14px rgba(20,20,30,0.28))' : undefined, ...style}}>
    <path d={tornPath(w, h, seed, amp, 16, edges)} fill={color} />
  </svg>
);

const halftone = (color: string, size = 14, dot = 2.2) => ({
  backgroundImage: `radial-gradient(${color} ${dot}px, transparent ${dot + 0.6}px)`,
  backgroundSize: `${size}px ${size}px`,
});

type PlateKind = 'light' | 'peri' | 'dark' | 'charcoal';

/** Layer 1: the locked plate. Same structure every scene, only the base colour changes. */
export const Plate: React.FC<{kind?: PlateKind; seed?: string; strip?: boolean}> = ({kind = 'light', seed = 'p', strip = true}) => {
  const base = {light: C.light, peri: C.peri, dark: C.dark, charcoal: C.charcoal}[kind];
  const isDark = kind === 'dark' || kind === 'charcoal';
  const stripColor = {light: '#DCDEE7', peri: '#B9C1D8', dark: '#2E3039', charcoal: '#29282B'}[kind];
  const sheetColor = {light: C.paper, peri: '#C3CADF', dark: '#45475A', charcoal: '#3E3C40'}[kind];
  return (
    <AbsoluteFill style={{backgroundColor: base, overflow: 'hidden'}}>
      <Img src={staticFile('postit/crumple.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: isDark ? 0.55 : 0.7}} />
      {/* a loose sheet top right and a torn strip across the lower third */}
      <TornSheet x={560} y={-60} w={620} h={420} color={sheetColor} seed={`${seed}-sheet`} rotate={-6} />
      {strip && <TornSheet x={-60} y={1080} w={1220} h={900} color={stripColor} seed={`${seed}-strip`} rotate={-1.5} amp={10} />}
      <AbsoluteFill style={{...halftone(isDark ? 'rgba(255,255,255,0.07)' : 'rgba(53,51,54,0.08)'), maskImage: 'linear-gradient(160deg, transparent 35%, black 75%)', WebkitMaskImage: 'linear-gradient(160deg, transparent 35%, black 75%)'}} />
    </AbsoluteFill>
  );
};

/** Paper grain + light vignette over everything (applied once in the Reel). */
export const GrainOverlay: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Img src={staticFile('postit/grain.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.22}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(20,20,30,0.28) 100%)'}} />
  </AbsoluteFill>
);

/** Die-cut sticker: white outline + soft shadow around any content. */
export const sticker = (border = 7, shadow = 0.3) =>
  [
    `drop-shadow(${border}px 0 0 #fff)`,
    `drop-shadow(-${border}px 0 0 #fff)`,
    `drop-shadow(0 ${border}px 0 #fff)`,
    `drop-shadow(0 -${border}px 0 #fff)`,
    `drop-shadow(6px 14px 12px rgba(20,20,30,${shadow}))`,
  ].join(' ');

/** Spring pop-in helper (slight rotation, guideline motion language). */
export const usePop = (delay: number, damping = 12) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, mass: 0.7}});
};

/** Plain white straight-edged paper tag (names, dates). */
export const Tag: React.FC<{x: number; y: number; text: string; delay?: number; rotate?: number; size?: number; dark?: boolean; anchor?: 'left' | 'center' | 'right'}> = ({x, y, text, delay = 0, rotate = -2, size = 46, dark = false, anchor = 'center'}) => {
  const p = usePop(delay);
  const tx = anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, 0) rotate(${rotate}deg) scale(${p})`, transformOrigin: 'center', background: dark ? C.charcoal : '#FFFFFF', color: dark ? '#fff' : C.charcoal, fontFamily: FONT, fontWeight: 800, fontSize: size, padding: `${size * 0.22}px ${size * 0.45}px`, whiteSpace: 'nowrap', direction: 'rtl', boxShadow: '5px 10px 14px rgba(20,20,30,0.3)', opacity: p > 0.01 ? 1 : 0}}>
      {text}
    </div>
  );
};

/** Yellow glow ring around a detail (options bank). */
export const GlowRing: React.FC<{x: number; y: number; r: number; delay: number}> = ({x, y, r, delay}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 14);
  const pulse = 1 + Math.sin((f - delay) / 6) * 0.03;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `10px solid ${C.glow}`, boxShadow: `0 0 40px 14px ${C.glow}AA, inset 0 0 30px 6px ${C.glow}88`, transform: `scale(${p * pulse})`, opacity: interpolate(p, [0, 1], [0, 0.95])}} />
  );
};

/** If a real photo exists in public/, show it full-bleed with a slow ~6% zoom; otherwise the drawn fallback. */
export const hasFile = (path: string) => getStaticFiles().some((f) => f.name === path);

export const PhotoOr: React.FC<{path: string; duration: number; children: React.ReactNode}> = ({path, duration, children}) => {
  const f = useCurrentFrame();
  if (!hasFile(path)) return <>{children}</>;
  const s = interpolate(f, [0, duration], [1, 1.06], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img src={staticFile(path)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
    </AbsoluteFill>
  );
};

/** Big English target word: letters build left to right (English reading order), then stay fixed. */
export const TargetWord: React.FC<{word: string; gloss: string; delay?: number; y?: number; size?: number}> = ({word, gloss, delay = 0, y = 230, size = 150}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const glossP = usePop(delay + word.length * 2 + 4);
  return (
    <div style={{position: 'absolute', left: 40, right: 130, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', direction: 'ltr', filter: sticker(8, 0.25)}}>
        {word.split('').map((ch, i) => {
          const p = spring({frame: f - delay - i * 2, fps, config: {damping: 11, mass: 0.6}});
          return (
            <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: C.charcoal, lineHeight: 1, display: 'inline-block', transform: `translateY(${(1 - p) * 60}px) scale(${p}) rotate(${(1 - p) * (i % 2 ? 12 : -12)}deg)`, opacity: p > 0.02 ? 1 : 0}}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 34, transform: `scale(${glossP}) rotate(-2deg)`, opacity: glossP > 0.02 ? 1 : 0}}>
        <div style={{position: 'relative', padding: '14px 40px', fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.charcoal, direction: 'rtl'}}>
          <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(20,20,30,0.25))'}}>
            <path d={tornPath(400, 100, `gloss-${word}`, 4, 14)} fill={C.accent} />
          </svg>
          <span style={{position: 'relative'}}>{gloss}</span>
        </div>
      </div>
    </div>
  );
};

/** Subtitles: low, size ~60, Hebrew right-to-left, **word** = highlighted target word. */
export const Subtitle: React.FC<{text: string}> = ({text}) => {
  const isHebrew = /[֐-׿]/.test(text);
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <div style={{position: 'absolute', left: 60, right: 130, bottom: 1920 - 1665, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, lineHeight: 1.22, color: '#FFFFFF', textAlign: 'center', direction: isHebrew ? 'rtl' : 'ltr', WebkitTextStroke: '8px rgba(28,28,36,0.92)', paintOrder: 'stroke fill', textShadow: '0 4px 12px rgba(0,0,0,0.35)'}}>
        {parts.map((p, i) =>
          p.startsWith('**') ? (
            <span key={i} style={{color: C.accent}}>{p.slice(2, -2)}</span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </div>
    </div>
  );
};
