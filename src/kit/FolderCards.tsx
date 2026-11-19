import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp01, exitFactor, pop, POP, STAGGER} from './motion';
import {SANS} from './SerifTitle';
import {useUi} from './theme';

export type FolderSpec = {
  n: number;
  label: string;
  tone: 'dark' | 'steel' | 'blue' | 'peri';
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** drawn icon (white, chalky): <Syringe/>, <Person/>, any node, positioned inside the card */
  icon?: React.ReactNode;
  dir?: 'rtl' | 'ltr';
};

/**
 * Numbered folder cards (Vox's "four conditions" shot): rounded card with a numbered tab, a
 * chalky white icon and an uppercase letter-spaced label. They overlap and slide up in sequence.
 * x,y = card centre. Tones go dark -> light so the stack reads as a sequence.
 */
export const FolderCards: React.FC<{cards: FolderSpec[]; at?: number; exitAt?: number; labelSize?: number}> = ({cards, at = 0, exitAt, labelSize = 40}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const tones = {
    dark: {bg: '#444953', fg: '#A1ACCA', tab: '#444953'},
    steel: {bg: '#647390', fg: '#C9D0E6', tab: '#647390'},
    blue: {bg: '#7894C3', fg: '#2F3C5E', tab: '#7894C3'},
    peri: {bg: '#A1ACCA', fg: '#3E414C', tab: '#A1ACCA'},
  };
  const e = exitFactor(frame, exitAt, fps);
  return (
    <>
      {cards.map((c, i) => {
        const s = pop(frame, at + i * STAGGER * 2, fps, POP);
        const k = clamp01(s) * e;
        if (k <= 0.001) return null;
        const w = c.w ?? 500;
        const h = c.h ?? 560;
        const t = tones[c.tone];
        return (
          <div key={i} style={{position: 'absolute', left: c.x - w / 2, top: c.y - h / 2 + (1 - s) * 120, width: w, height: h, opacity: k, transform: `scale(${0.9 + 0.1 * Math.min(1, s)})`}}>
            <div style={{position: 'absolute', left: w * 0.5 - 60, top: -44, width: 130, height: 70, background: t.tab, borderRadius: '22px 22px 0 0', color: '#FCFCFC', fontFamily: SANS, fontWeight: 800, fontSize: 46, textAlign: 'center', paddingTop: 6}}>{c.n}</div>
            <div style={{position: 'absolute', inset: 0, background: t.bg, borderRadius: 30, boxShadow: '0 14px 34px rgba(40,44,60,0.22)', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, opacity: 0.9}}>{c.icon}</div>
              <div dir={c.dir ?? 'ltr'} style={{position: 'absolute', left: 20, right: 20, bottom: 34, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: labelSize, letterSpacing: 3, textTransform: 'uppercase', color: t.fg, lineHeight: 1.15}}>{c.label}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};
