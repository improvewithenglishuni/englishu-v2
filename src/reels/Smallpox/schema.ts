import {z} from 'zod';
import {placement, themeNames} from '../../kit';

const text = placement.extend({text: z.string()});

export const smallpoxSchema = z.object({
  theme: z.enum(themeNames),
  /** file name in /public, e.g. "smallpox-voiceover.mp3" ('' = silent) */
  voiceover: z.string(),
  arm: placement,
  hook: text,
  toll: placement.extend({text: z.string()}),
  zero: placement.extend({text: z.string()}),
  cow: placement,
  year1796: text,
  year1967: text,
  eradicate: placement.extend({text: z.string(), splitAt: z.number().int()}),
  meaning: text,
  outbreakLabel: text,
  rings: placement,
  year1980: placement.extend({text: z.string()}),
  closeLabel: text,
  subtitles: z.array(z.object({text: z.string(), from: z.number().int(), to: z.number().int()})),
  endCard: z.boolean(),
});
export type SmallpoxProps = z.infer<typeof smallpoxSchema>;
