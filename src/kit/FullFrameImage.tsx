import React, {useId} from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useUi} from './theme';

const rgb = (hex: string) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/**
 * A real historical picture (painting, engraving, photo) running FULL FRAME, edge to edge, with
 * a slow zoom and a slow drift along the picture (Vox's most-used shot). Title text goes on top
 * (use <SerifTitle>). `look`: 'none' keeps the colours, 'gray' = black and white,
 * 'duotone' = shadows -> slate, highlights -> pale periwinkle (matches the plates).
 */
export const FullFrameImage: React.FC<{
  src: string;
  /** zoom at first and last frame of the scene */
  zoom?: [number, number];
  /** objectPosition % at first and last frame, [x, y]: drift along a landscape picture */
  focus?: [[number, number], [number, number]];
  look?: 'none' | 'gray' | 'duotone';
  /** darken the picture so white text reads (0-0.6) */
  dim?: number;
  /** which edge gets the darker gradient: where the text sits */
  dimFrom?: 'top' | 'bottom' | 'all';
  duo?: [string, string];
  contrast?: number;
}> = ({src, zoom = [1.04, 1.14], focus = [[50, 50], [50, 50]], look = 'none', dim = 0, dimFrom = 'all', duo, contrast = 1}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const ui = useUi();
  const id = useId().replace(/:/g, '');
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  const fx = focus[0][0] + (focus[1][0] - focus[0][0]) * t;
  const fy = focus[0][1] + (focus[1][1] - focus[0][1]) * t;
  const [d0, d1] = (duo ?? [ui.charcoal, ui.periwinkle]).map(rgb);
  const grad =
    dimFrom === 'top'
      ? `linear-gradient(180deg, rgba(20,20,24,${dim}) 0%, rgba(20,20,24,0) 55%)`
      : dimFrom === 'bottom'
        ? `linear-gradient(0deg, rgba(20,20,24,${dim}) 0%, rgba(20,20,24,0) 55%)`
        : `rgba(20,20,24,${dim})`;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: ui.charcoal}}>
      {look === 'duotone' ? (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id={id} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={`${0.3 * contrast} ${0.59 * contrast} ${0.11 * contrast} 0 0 ${0.3 * contrast} ${0.59 * contrast} ${0.11 * contrast} 0 0 ${0.3 * contrast} ${0.59 * contrast} ${0.11 * contrast} 0 0 0 0 0 1 0`} />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={`${d0[0]} ${d1[0]}`} />
              <feFuncG type="table" tableValues={`${d0[1]} ${d1[1]}`} />
              <feFuncB type="table" tableValues={`${d0[2]} ${d1[2]}`} />
            </feComponentTransfer>
          </filter>
        </svg>
      ) : null}
      <Img
        src={src}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${fx}% ${fy}%`,
          transform: `scale(${z})`,
          transformOrigin: `${fx}% ${fy}%`,
          filter: look === 'duotone' ? `url(#${id})` : look === 'gray' ? `grayscale(1) contrast(${1.05 * contrast})` : undefined,
        }}
      />
      {dim > 0 ? <AbsoluteFill style={{background: grad}} /> : null}
    </AbsoluteFill>
  );
};
