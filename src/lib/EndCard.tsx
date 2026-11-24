// Fixed animated EnglishU end card (~2.7 s). Brand navy/red/cream appear ONLY here.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {TornSheet, sticker, usePop} from './paper';

export const END_CARD_FRAMES = 81;
const NAVY = '#0A2370';
const RED = '#B01F25';
const CREAM = '#F5F0E5';
const SERIF = '"Frank Ruhl Libre", serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const page = interpolate(f, [0, 10], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const logo = usePop(8, 10);
  const head = usePop(14);
  const bar = interpolate(f, [22, 32], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const clip = usePop(36, 11);
  const push = interpolate(f, [0, END_CARD_FRAMES], [1, 1.04]);
  return (
    <AbsoluteFill style={{background: '#22242C', overflow: 'hidden'}}>
      {/* dark newsprint with a faint grid */}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
      <Img src={staticFile('postit/crumple.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.5}} />
      <AbsoluteFill style={{transform: `translateY(${page * 1500}px) scale(${push})`}}>
        <TornSheet x={50} y={230} w={900} h={1230} color={CREAM} seed="endcard-page" rotate={-1.2} amp={12} />
        {/* logo sticker with tape */}
        <div style={{position: 'absolute', left: 475, top: 300, transform: `translateX(-50%) translateY(${(1 - logo) * -260}px) rotate(${-4 + (1 - logo) * 20}deg)`, opacity: logo > 0.01 ? 1 : 0}}>
          <div style={{background: '#FFFFFF', padding: 22, filter: sticker(4, 0.35)}}>
            <Img src={staticFile('brand/logo.png')} style={{width: 420, display: 'block'}} />
          </div>
          <div style={{position: 'absolute', left: '50%', top: -24, width: 170, height: 48, transform: 'translateX(-50%) rotate(3deg)', background: 'rgba(240,235,215,0.8)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)'}} />
        </div>
        <div style={{position: 'absolute', left: 80, right: 130, top: 790, textAlign: 'center', direction: 'rtl', fontFamily: SERIF, fontWeight: 900, fontSize: 104, color: NAVY, transform: `scale(${head})`, opacity: head > 0.01 ? 1 : 0}}>
          עוד עובדה מעניינת.
        </div>
        <div style={{position: 'absolute', left: 110, width: 730, top: 960, height: 140, background: NAVY, clipPath: `inset(0 0 0 ${(1 - bar) * 100}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '6px 12px 16px rgba(0,0,0,0.25)'}}>
          <span style={{fontFamily: SERIF, fontWeight: 900, fontSize: 82, color: CREAM, direction: 'rtl'}}>עוד מילה באנגלית.</span>
        </div>
        <div style={{position: 'absolute', left: 475, top: 1170, transform: `translateX(-50%) rotate(-2.5deg) scale(${clip})`, opacity: clip > 0.01 ? 1 : 0}}>
          <div style={{position: 'relative', padding: '26px 54px', textAlign: 'center'}}>
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(5px 10px 12px rgba(0,0,0,0.3))'}}>
              <path d="M6,10 L120,4 L250,12 L380,3 L520,9 L596,6 L590,70 L598,130 L592,194 L460,188 L330,196 L190,190 L60,197 L4,190 L10,120 L3,60 Z" fill="#FFFFFF" />
            </svg>
            <div style={{position: 'relative', fontFamily: SERIF, fontWeight: 700, fontSize: 60, color: NAVY, direction: 'rtl', whiteSpace: 'nowrap'}}>לעוד כאלה ← עקבו</div>
            <div style={{position: 'relative', fontFamily: 'Rubik', fontWeight: 800, fontSize: 50, color: RED, direction: 'ltr', whiteSpace: 'nowrap', marginTop: 6}}>@improve.with.englishu</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
