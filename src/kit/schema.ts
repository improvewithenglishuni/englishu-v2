/** zod building blocks so every element's position can be edited (and saved) in Remotion Studio. */
import {z} from 'zod';

export const placement = z.object({
  x: z.number().step(1),
  y: z.number().step(1),
  scale: z.number().min(0).max(5).step(0.01),
  rotate: z.number().min(-180).max(180).step(0.5),
});
export type Placement = z.infer<typeof placement>;

export const timing = z.object({
  /** frame the element enters */
  at: z.number().int().min(0),
  /** optional frame it leaves (pops out) */
  exitAt: z.number().int().min(0).optional(),
});

export const placed = placement.merge(timing);
export type Placed = z.infer<typeof placed>;
