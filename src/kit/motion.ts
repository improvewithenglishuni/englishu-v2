/** The motion language: springy pop-ins, eased pushes, staggered entrances. */
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const POP = {damping: 12, stiffness: 170, mass: 0.7} as const; // a little overshoot
export const SETTLE = {damping: 20, stiffness: 120, mass: 0.8} as const; // no overshoot
export const STAGGER = 5; // frames between entrances (4-6)

export const pop = (frame: number, at: number, fps = FPS, config: {damping: number; stiffness: number; mass: number} = POP) =>
  spring({frame: frame - at, fps, config});

export const ease = (frame: number, [f0, f1]: [number, number], [v0, v1]: [number, number], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [f0, f1], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 1 while visible, springs to 0 after exitAt. */
export const exitFactor = (frame: number, exitAt: number | undefined, fps = FPS) =>
  exitAt === undefined ? 1 : 1 - spring({frame: frame - exitAt, fps, config: SETTLE, durationInFrames: 10});
