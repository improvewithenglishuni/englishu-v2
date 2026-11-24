import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {geoGraticule10, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type {FeatureCollection, Geometry} from 'geojson';
import {clamp01, exitFactor, pop, SETTLE} from './motion';

const land = feature(world as never, (world as never as {objects: {land: never}}).objects.land) as unknown as FeatureCollection<Geometry>;
const grat = geoGraticule10();

/** Vox-style spinning globe: pale-grey land on a dark disc, faint graticule, soft shade on the edge. */
export const Globe: React.FC<{x: number; y: number; r: number; at?: number; exitAt?: number; degPerFrame?: number; startLon?: number; tilt?: number}> = ({x, y, r, at = 0, exitAt, degPerFrame = 1.8, startLon = -20, tilt = -18}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = clamp01(pop(frame, at, fps, SETTLE)) * exitFactor(frame, exitAt, fps);
  const id = React.useId().replace(/:/g, '');
  const d = useMemo(() => {
    const rot = startLon - Math.max(0, frame - at) * degPerFrame;
    const proj = geoOrthographic().translate([r, r]).scale(r - 4).rotate([rot, tilt, 0]).clipAngle(90);
    const gp = geoPath(proj);
    return {land: gp(land as never) ?? '', grat: gp(grat as never) ?? ''};
  }, [frame, at, degPerFrame, startLon, tilt, r]);
  if (k <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, opacity: k, transform: `scale(${0.82 + 0.18 * k})`, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.4))'}}>
      <svg width={2 * r} height={2 * r}>
        <defs>
          <radialGradient id={`sh${id}`} cx="40%" cy="36%" r="70%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
          </radialGradient>
        </defs>
        <circle cx={r} cy={r} r={r - 4} fill="#2F3140" />
        <path d={d.grat} fill="none" stroke="#5A5D70" strokeWidth={1.4} opacity={0.55} />
        <path d={d.land} fill="#D4D5DE" stroke="#2F3140" strokeWidth={1.2} />
        <circle cx={r} cy={r} r={r - 4} fill={`url(#sh${id})`} />
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke="#B9BDD0" strokeWidth={3} opacity={0.7} />
      </svg>
    </div>
  );
};
