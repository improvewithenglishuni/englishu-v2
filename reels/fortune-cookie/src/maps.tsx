// Paper-cutout maps drawn from Natural Earth (world-atlas, public domain) with d3-geo.
import React from 'react';
import {geoMercator, geoPath, GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {C} from './kit';

const countries: any = feature(world as any, (world as any).objects.countries);
export const country = (id: string) => countries.features.find((f: any) => f.id === id);

const PaperShape: React.FC<{d: string; fill: string; stroke?: number}> = ({d, fill, stroke = 7}) => (
  <g>
    <path d={d} fill="rgba(20,20,35,0.25)" transform="translate(6,10)" style={{filter: 'blur(6px)'}} />
    <path d={d} fill="#fbfbf8" stroke="#fbfbf8" strokeWidth={stroke * 2} strokeLinejoin="round" />
    <path d={d} fill={fill} />
  </g>
);

// China alone, fitted into a box.
export const ChinaMap: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const china = country('156');
  const proj = geoMercator().fitExtent(
    [
      [x, y],
      [x + w, y + h],
    ],
    china,
  );
  const path = geoPath(proj);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <PaperShape d={path(china) || ''} fill={C.peri} />
    </svg>
  );
};

// Pacific: Japan (left) and the US west coast (right), centred on the date line.
export const pacificProj = (): GeoProjection =>
  geoMercator().rotate([171, 0]).center([0, 40]).scale(420).translate([540, 600]);

export const PacificMap: React.FC = () => {
  const proj = pacificProj();
  const path = geoPath(proj);
  const ids = ['392', '840', '124', '484', '156', '408', '410', '643'];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {ids.map((id) => {
        const f = country(id);
        if (!f) return null;
        const hot = id === '392' || id === '840';
        return <PaperShape key={id} d={path(f) || ''} fill={hot ? '#8E99BA' : '#C9CFDF'} stroke={hot ? 7 : 4} />;
      })}
    </svg>
  );
};
