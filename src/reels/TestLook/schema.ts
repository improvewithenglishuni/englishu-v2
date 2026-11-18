import {z} from 'zod';
import {placement, themeNames} from '../../kit';

export const testLookSchema = z.object({
  theme: z.enum(themeNames),
  /** final resting place of the plane; it flies in along `flightAngle` */
  plane: placement.extend({flightAngle: z.number().min(-90).max(0)}),
  /** offsets applied to the contrail strip (anchored at the plane's tail) */
  contrail: placement,
  clouds: z.array(placement.extend({variant: z.number().int().min(0).max(5)})),
  label: placement.extend({text: z.string()}),
  keyword: placement.extend({text: z.string(), splitAt: z.number().int()}),
  swoosh: placement,
  crystals: placement,
  arrows: placement,
  disperse: placement.extend({text: z.string()}),
  subtitle: z.string(),
});

export type TestLookProps = z.infer<typeof testLookSchema>;
