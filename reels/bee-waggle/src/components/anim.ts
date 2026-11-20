import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme';

/** Spring pop-in (0 -> 1, with a little overshoot). */
export const pop = (f: number, start: number, damping = 11) =>
  spring({frame: f - start, fps: FPS, config: {damping, stiffness: 170, mass: 0.7}});

/** Linear-ish eased progress between two frames. */
export const prog = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Quick exit at the end of a scene (1 -> 0 over the last n frames). */
export const exitOut = (f: number, dur: number, n = 6) =>
  interpolate(f, [dur - n, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Damped wiggle in degrees. */
export const wiggle = (f: number, start: number, amp = 6, hz = 9, len = 18) => {
  const t = f - start;
  if (t < 0 || t > len) return 0;
  return amp * Math.sin((t / FPS) * hz * Math.PI * 2) * (1 - t / len);
};

/** Zigzag "waggle run" points between two points. */
export const zigzag = (x1: number, y1: number, x2: number, y2: number, n: number, amp: number) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const pts: [number, number][] = [[x1, y1]];
  for (let k = 1; k < n; k++) {
    const t = k / n;
    const s = (k % 2 ? 1 : -1) * amp;
    pts.push([x1 + dx * t + nx * s, y1 + dy * t + ny * s]);
  }
  pts.push([x2, y2]);
  return pts;
};

/** Figure-eight waggle-dance path centred at (0,0): run up the middle, loop right, run, loop left. */
export const dancePathD = (run = 170, loop = 300, zig = 10, amp = 16) => {
  const z = zigzag(0, run, 0, -run, zig, amp)
    .slice(1)
    .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  return (
    `M 0 ${run} ${z} C ${loop} ${-run - 80} ${loop} ${run + 80} 0 ${run} ` +
    `${z} C ${-loop} ${-run - 80} ${-loop} ${run + 80} 0 ${run}`
  );
};
