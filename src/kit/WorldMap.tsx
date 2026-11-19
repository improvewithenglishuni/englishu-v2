import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import {clamp01, exitFactor, pop, SETTLE} from './motion';
import {SANS} from './SerifTitle';
import {useUi} from './theme';

type Props = {name: string};
const countries = (feature(world as never, (world as never as {objects: {countries: never}}).objects.countries) as unknown as FeatureCollection<Geometry, Props>).features.filter(
  (f) => f.properties.name !== 'Antarctica' && f.properties.name !== 'Fiji',
);

const WIDE = {w: 1000, h: 520};

/**
 * Vox world map: pale-grey land on a dark textured plate (or periwinkle land on light paper),
 * a few countries lit in coral (or any colours: choropleth). Geometry is Natural Earth from the
 * `world-atlas` package, so any country can be lit by its English name:
 *   highlight={{India: {at: 20}, Somalia: {at: 30, color: '#E59D9B'}}}
 * `markers` drops a pulsing ring at lon/lat. `box` is the frame-pixel rectangle the map fills.
 */
export const WorldMap: React.FC<{
  box: {x: number; y: number; w: number};
  highlight?: Record<string, {at?: number; color?: string}>;
  markers?: {lon: number; lat: number; at?: number; color?: string; r?: number}[];
  light?: boolean;
  /** all other countries (default: land grey on dark, steel-lavender on light) */
  land?: string;
  at?: number;
  exitAt?: number;
  /** frame when the WHOLE map fades to grey (e.g. after the last case) */
  greyAt?: number;
}> = ({box, highlight = {}, markers = [], light = false, land, at = 0, exitAt, greyAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ui = useUi();
  const {paths, project} = useMemo(() => {
    const proj = geoNaturalEarth1().fitSize([WIDE.w, WIDE.h], {type: 'FeatureCollection', features: countries} as FeatureCollection);
    const gp = geoPath(proj);
    return {paths: countries.map((c: Feature<Geometry, Props>) => ({name: c.properties.name, d: gp(c) ?? ''})), project: proj};
  }, []);
  const k = box.w / WIDE.w;
  const e = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  if (e <= 0.001) return null;
  const base = land ?? (light ? '#C6CCE0' : ui.land);
  const sea = light ? '#EDEEF3' : '#3A3C4A';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: e}}>
      <g transform={`translate(${box.x},${box.y}) scale(${k})`}>
        {paths.map((p) => {
          const h = highlight[p.name];
          const on = h ? clamp01(pop(frame, h.at ?? 0, fps, SETTLE)) : 0;
          let fill = h && on > 0.02 ? mix(base, h.color ?? '#E0615E', on) : base;
          if (greyAt !== undefined) fill = mix(fill, '#85878F', clamp01((frame - greyAt) / 12));
          return <path key={p.name} d={p.d} fill={fill} stroke={sea} strokeWidth={0.6} strokeLinejoin="round" />;
        })}
        {greyAt !== undefined && frame >= greyAt ? null : null}
        {markers.map((m, i) => {
          const pt = project([m.lon, m.lat]);
          if (!pt) return null;
          const s = clamp01(pop(frame, m.at ?? 0, fps, SETTLE));
          const pulse = ((frame - (m.at ?? 0)) % 40) / 40;
          return (
            <g key={i} transform={`translate(${pt[0]},${pt[1]})`} opacity={s}>
              <circle r={(m.r ?? 9) + pulse * 26} fill="none" stroke={m.color ?? '#E0615E'} strokeWidth={3} opacity={1 - pulse} />
              <circle r={(m.r ?? 9) * s} fill={m.color ?? '#E0615E'} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

/** Choropleth legend: square swatches + bold uppercase condensed labels. */
export const MapLegend: React.FC<{items: {color: string; label: string}[]; x: number; y: number; at?: number; fontSize?: number; dark?: boolean}> = ({items, x, y, at = 0, fontSize = 38, dark = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = clamp01(pop(frame, at, fps, SETTLE));
  if (s <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: s, transform: `translateY(${(1 - s) * 16}px)`}}>
      {items.map((it) => (
        <div key={it.label} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14}}>
          <div style={{width: fontSize * 1.15, height: fontSize * 1.15, background: it.color}} />
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize, letterSpacing: 1.5, textTransform: 'uppercase', color: it.color}}>{it.label}</div>
        </div>
      ))}
    </div>
  );
};
