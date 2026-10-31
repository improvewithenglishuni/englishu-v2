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
        "Yellow field. Variola particle (paper cutout) pops in center and slowly spins. SMALLPOX slams in letter by letter below it; coral marker underline sweeps; Hebrew hook line types in at the top.",
      duration: 3,
      cues: { virus: 0.07, letters: 0.27, underline: 1.2, hook: 1.0 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/pop.wav", at: 0.07, volume: 0.35 },
        { file: "sfx/stamp.wav", at: 0.75, volume: 0.55 },
        { file: "sfx/paper.wav", at: 1.2, volume: 0.4 },
      ],
    },
    {
      id: "s02-disease",
      voiceover: { text: "בעברית: אבעבועות שחורות. נגיף מדבק שעבר מאדם לאדם." },
      visual:
        "Navy field. 'SMALLPOX' label over the big Hebrew name. Three paper people: right one breaks out in red pox, dotted marker arrows carry it right→left to the next two.",
      duration: 3,
      cues: { title: 0.07, sick: 0.5, arrow1: 1.5, arrow2: 1.97, line: 1.2 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/pop.wav", at: 0.5, volume: 0.3 },
        { file: "sfx/paper.wav", at: 1.5, volume: 0.35 },
        { file: "sfx/paper.wav", at: 1.97, volume: 0.35 },
      ],
    },
    {
      id: "s03-vaccine",
      voiceover: { text: "החיסון יצר חומה: מחסנים את כל מי שמסביב, וההדבקה נעצרת." },
      visual:
        "Paper field. Grid of paper people with one infected in the middle. Syringe slides in; the ring around the case turns navy with yellow shields; a red shockwave expands and is stopped flat at the ring.",
      duration: 3,
      cues: { syringe: 0.2, ring: 0.5, pulse: 1.4, blocked: 1.75, contained: 2.2 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/tick.wav", at: 0.5, volume: 0.3 },
        { file: "sfx/tick.wav", at: 0.6, volume: 0.3 },
        { file: "sfx/tick.wav", at: 0.7, volume: 0.3 },
        { file: "sfx/tick.wav", at: 0.8, volume: 0.3 },
        { file: "sfx/stamp.wav", at: 1.75, volume: 0.55 },
      ],
    },
    {
      id: "s04-eradication",
      voiceover: { text: "וב־1980, ארגון הבריאות העולמי הכריז: המחלה הוכחדה." },
      visual:
        "Coral field. Year counter rolls 1967→1980. Globe with red case dots blinking out one by one; the last one (Somalia, 1977) gets a marker circle; ERADICATED stamp slams across the globe.",
      duration: 3,
      cues: { counter: 0.2, dots: 0.6, last: 1.4, stamp: 1.87, done: 2.1 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/tick.wav", at: 0.2, volume: 0.25 },
        { file: "sfx/tick.wav", at: 0.4, volume: 0.25 },
        { file: "sfx/tick.wav", at: 0.6, volume: 0.25 },
        { file: "sfx/tick.wav", at: 0.8, volume: 0.25 },
        { file: "sfx/tick.wav", at: 1.0, volume: 0.25 },
        { file: "sfx/paper.wav", at: 1.4, volume: 0.35 },
        { file: "sfx/stamp.wav", at: 1.87, volume: 0.6 },
      ],
    },
    {
      id: "s05-recap",
      voiceover: { text: "אז זוכרים: SMALLPOX זה אבעבועות שחורות." },
      visual:
        "Yellow field (loops to scene 1). Vocabulary card SMALLPOX = אבעבועות שחורות slaps in; the variola particle returns small and is crossed out with a coral marker X; EnglishU sign-off.",
      duration: 3,
      cues: { card: 0.17, virus: 0.8, cross: 1.25, brand: 1.8 },
      sfx: [
        { file: "sfx/whoosh.wav", at: 0, volume: 0.45 },
        { file: "sfx/stamp.wav", at: 0.17, volume: 0.5 },
        { file: "sfx/pop.wav", at: 0.8, volume: 0.3 },
        { file: "sfx/paper.wav", at: 1.25, volume: 0.4 },
      ],
    },
  ],
};
