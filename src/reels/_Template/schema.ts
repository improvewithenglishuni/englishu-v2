import {z} from 'zod';
import {placement, themeNames} from '../../kit';

export const templateSchema = z.object({
  theme: z.enum(themeNames),
  /** file name in /public, e.g. "voiceover.mp3" ('' = silent) */
  voiceover: z.string(),
  hook: placement.extend({text: z.string()}),
  keyword: placement.extend({text: z.string(), splitAt: z.number().int()}),
  subtitles: z.array(z.object({text: z.string(), from: z.number().int(), to: z.number().int()})),
  endCard: z.boolean(),
});
export type TemplateProps = z.infer<typeof templateSchema>;
