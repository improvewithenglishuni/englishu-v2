import type { ReelSpec } from "../../vox/timeline";

// 15 s EnglishU Reel: 5 scenes × 3 s = 450 frames at 30 fps.
// No narration recorded yet: on-screen kinetic type carries the story, so burned
// captions are off. `voiceover.text` is the planned narration for recording later;
// add `file` per scene and drop `duration` to let scenes fit the recorded voice.
export const smallpoxSpec: ReelSpec = {
  id: "smallpox-reel",
  title: "SMALLPOX — אבעבועות שחורות",
  style: "mixed-media",
  showCaptions: false,
  scenes: [
    {
      id: "s01-hook",
      voiceover: { text: "SMALLPOX: המחלה האנושית היחידה שנמחקה מהעולם." },
      visual:
        "Cream paper. Yellow torn scrap; archival electron micrograph of variola (CDC, halftone print, taped) slaps in with a slow Ken Burns push; a newspaper clipping drops in with SMALLPOX and a yellow highlighter sweeps it; red marker circles a virion; Hebrew hook on a torn white strip with 'היחידה' highlighted.",
      duration: 3,
      cues: { photo: 0.1, clip: 0.3, highlight: 0.9, circle: 1.3, strip: 1.4 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/stamp.wav", at: 0.17, volume: 0.4 },
        { file: "sfx/paper.wav", at: 0.35, volume: 0.4 },
        { file: "sfx/paper.wav", at: 0.9, volume: 0.3 },
        { file: "sfx/paper.wav", at: 1.4, volume: 0.35 },
      ],
    },
    {
      id: "s02-disease",
      voiceover: { text: "בעברית: אבעבועות שחורות. נגיף מדבק שעבר מאדם לאדם." },
      visual:
        "Cream paper. Charcoal world map pans slowly; red pulsing dots pop West Africa → Congo → Ethiopia → Somalia → India → Bangladesh → Indonesia with a dashed red route drawing between them. Black label 'SMALLPOX =' over a torn strip 'אבעבועות שחורות' (highlight 'שחורות'); bottom strip 'נגיף מדבק שעבר מאדם לאדם'.",
      duration: 3,
      cues: { label: 0.1, title: 0.2, dots: 0.8, line: 1.6 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/stamp.wav", at: 0.25, volume: 0.35 },
        { file: "sfx/pop.wav", at: 0.8, volume: 0.25 },
        { file: "sfx/pop.wav", at: 1.0, volume: 0.25 },
        { file: "sfx/pop.wav", at: 1.2, volume: 0.25 },
        { file: "sfx/pop.wav", at: 1.4, volume: 0.25 },
        { file: "sfx/paper.wav", at: 1.6, volume: 0.35 },
      ],
    },
    {
      id: "s03-vaccine",
      voiceover: { text: "החיסון יצר חומה: מחסנים את כל מי שמסביב, וההדבקה נעצרת." },
      visual:
        "Cream paper, coral scrap. Archival photo of a smallpox vaccination team in Palestine (Wellcome, CC BY) slaps in; 1930s 'Is your child vaccinated?' poster slides in; a torn card shows ring vaccination: a red case, eight navy vaccinated dots with checks, a red pulse stopped at the ring. Headline strip 'החיסון עצר את ההדבקה', 'עצר' highlighted on the block.",
      duration: 3,
      cues: { title: 0.07, photo: 0.2, poster: 0.6, diagram: 0.9, ring: 1.0, pulse: 1.5, blocked: 1.9 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/stamp.wav", at: 0.25, volume: 0.4 },
        { file: "sfx/paper.wav", at: 0.6, volume: 0.35 },
        { file: "sfx/tick.wav", at: 1.0, volume: 0.25 },
        { file: "sfx/tick.wav", at: 1.13, volume: 0.25 },
        { file: "sfx/tick.wav", at: 1.27, volume: 0.25 },
        { file: "sfx/stamp.wav", at: 1.9, volume: 0.55 },
      ],
    },
    {
      id: "s04-eradication",
      voiceover: { text: "וב־1980, ארגון הבריאות העולמי הכריז: המחלה הוכחדה." },
      visual:
        "Cream paper, navy scrap. Year counter 1967→1980 in a black box with a red WHO label; newspaper-style clipping 'WORLD DECLARED FREE OF SMALLPOX', Geneva, May 8 1980, 'FREE' highlighted; red ERADICATED stamp slams; Hebrew strip 'ה-WHO הכריז: המחלה הוכחדה.'",
      duration: 3,
      cues: { counter: 0.1, clip: 0.3, highlight: 1.0, stamp: 1.6, strip: 2.0 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/tick.wav", at: 0.1, volume: 0.25 },
        { file: "sfx/tick.wav", at: 0.3, volume: 0.25 },
        { file: "sfx/tick.wav", at: 0.5, volume: 0.25 },
        { file: "sfx/stamp.wav", at: 0.35, volume: 0.4 },
        { file: "sfx/paper.wav", at: 1.0, volume: 0.3 },
        { file: "sfx/stamp.wav", at: 1.6, volume: 0.65 },
        { file: "sfx/paper.wav", at: 2.0, volume: 0.35 },
      ],
    },
    {
      id: "s05-recap",
      voiceover: { text: "אז זוכרים: SMALLPOX זה אבעבועות שחורות." },
      visual:
        "Cream paper, yellow scrap. Vocabulary card SMALLPOX / אבעבועות שחורות slaps in; the variola print returns and gets a red marker X; black EnglishU label.",
      duration: 3,
      cues: { card: 0.17, photo: 0.7, cross: 1.2, brand: 1.8 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/stamp.wav", at: 0.17, volume: 0.5 },
        { file: "sfx/pop.wav", at: 0.7, volume: 0.3 },
        { file: "sfx/paper.wav", at: 1.2, volume: 0.4 },
        { file: "sfx/pop.wav", at: 1.8, volume: 0.25 },
      ],
    },
  ],
};
