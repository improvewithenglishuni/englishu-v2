// Vox-Atlas-style maps from Natural Earth (world-atlas, public domain) with d3-geo:
// full-frame, flat pale land with thin white borders, light blue-grey sea, solid highlight
// colours with a soft shadow, bold outlined labels, yellow hand-drawn arrows.
import React from 'react';
import {geoMercator, geoPath, GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {FONT} from './kit';

const countries: any = feature(world as any, (world as any).objects.countries);
export const country = (id: string) => countries.features.find((f: any) => f.id === id);

export const MAP = {
  sea: '#BCCDD9',
  land: '#E7E5DF',
  border: '#FFFFFF',
  red: '#D2483F',
  blue: '#6E87B4',
  grey: '#B9BDC6',
  arrow: '#F4C53A',
  ink: '#2B2D36',
};

export const BaseMap: React.FC<{proj: GeoProjection; fills?: Record<string, string>}> = ({proj, fills = {}}) => {
  const path = geoPath(proj);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <rect width={1080} height={1920} fill={MAP.sea} />
      {countries.features.map((f: any, i: number) => (
        <path key={i} d={path(f) || ''} fill={MAP.land} stroke={MAP.border} strokeWidth={1.6} strokeLinejoin="round" />
      ))}
      {Object.entries(fills).map(([id, color]) => {
        const f = country(id);
        if (!f) return null;
        const d = path(f) || '';
        return (
          <g key={id}>
            <path d={d} fill="rgba(20,25,40,0.28)" transform="translate(5,8)" style={{filter: 'blur(5px)'}} />
            <path d={d} fill={color} stroke={MAP.border} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

// Bold map label: white letters with a dark outline (or dark on light).
export const MapLabel: React.FC<{x: number; y: number; text: string; size?: number; dark?: boolean; o?: number; ltr?: boolean}> = ({
  x,
  y,
  text,
  size = 84,
  dark,
  o = 1,
  ltr,
}) => (
  <div
    dir={ltr ? 'ltr' : 'rtl'}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * o})`,
      opacity: o,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      color: dark ? MAP.ink : '#fff',
      WebkitTextStroke: dark ? '0px' : `${Math.round(size / 9)}px ${MAP.ink}`,
      paintOrder: 'stroke fill',
      whiteSpace: 'nowrap',
      letterSpacing: 1,
    }}
  >
    {text}
  </div>
);

// Yellow curved arrow that draws on (quadratic), with an arrowhead.
export const MapArrow: React.FC<{from: number[]; ctrl: number[]; to: number[]; p: number; width?: number}> = ({from, ctrl, to, p, width = 14}) => {
  const d = `M ${from[0]} ${from[1]} Q ${ctrl[0]} ${ctrl[1]} ${to[0]} ${to[1]}`;
  const ang = (Math.atan2(to[1] - ctrl[1], to[0] - ctrl[0]) * 180) / Math.PI;
  const head = Math.max(0, (p - 0.9) / 0.1);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <path d={d} stroke={MAP.arrow} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{filter: 'drop-shadow(0 3px 2px rgba(0,0,0,0.25))'}} />
      <g transform={`translate(${to[0]} ${to[1]}) rotate(${ang}) scale(${head})`} opacity={head}>
        <path d={`M ${width * 0.4} 0 L ${-width * 2.4} ${-width * 2.1} L ${-width * 2.4} ${width * 2.1} Z`} fill={MAP.arrow} strokeLinejoin="round" stroke={MAP.arrow} strokeWidth={4} />
      </g>
    </svg>
  );
};

// East Asia, China centred in the upper two thirds.
export const chinaProj = (): GeoProjection =>
  geoMercator().fitExtent(
    [
      [90, 380],
      [990, 1150],
    ],
    country('156'),
  );

// Pacific: Japan (left) and the US west coast (right), centred near the date line.
export const pacificProj = (): GeoProjection => geoMercator().rotate([171, 0]).center([0, 38]).scale(420).translate([540, 760]);
