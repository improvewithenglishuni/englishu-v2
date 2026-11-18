import {z} from 'zod';
import {themeNames} from '../../kit';

export const smallpoxSchema = z.object({
  theme: z.enum(themeNames),
  /** file name in /public, e.g. "smallpox-voiceover.mp3" ('' = silent) */
  voiceover: z.string(),
  subtitles: z.array(z.object({text: z.string(), from: z.number().int(), to: z.number().int()})),
  endCard: z.boolean(),
});
export type SmallpoxProps = z.infer<typeof smallpoxSchema>;
