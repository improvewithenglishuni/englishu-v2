import type { ReelSpec } from "../../vox/timeline";

// Kit demo only (not a real Reel): shows each building block with fixed timing and no voiceover.
export const demoSpec: ReelSpec = {
  id: "vox-kit-demo",
  title: "Vox kit demo",
  style: "mixed-media",
  scenes: [
    {
      id: "s01-hook",
      voiceover: { text: "למה אנחנו אומרים deadline על משהו שאין בו שום מוות?" },
      visual: "Yellow field. Clock cutout pops in, marker circle draws around it, headline types in word by word.",
      duration: 4,
      cues: { cutout: 0.3, headline: 0.6, circle: 2.0 },
      sfx: [{ file: "sfx/whoosh.wav", at: 0 }, { file: "sfx/pop.wav", at: 0.3 }, { file: "sfx/paper.wav", at: 2.0 }],
      captions: [{ text: "למה אנחנו אומרים deadline", at: 0.4 }, { text: "על משהו שאין בו שום מוות?", at: 2.0 }],
    },
    {
      id: "s02-vocab",
      voiceover: { text: "במלחמת האזרחים האמריקאית, deadline היה קו אמיתי בכלא." },
      visual: "Navy field. Vocab card slaps in on the word, letterpress stamp slams with a shake.",
      duration: 4,
      cues: { vocab: 0.5, stamp: 2.2 },
      sfx: [{ file: "sfx/whoosh.wav", at: 0 }, { file: "sfx/paper.wav", at: 0.5 }, { file: "sfx/stamp.wav", at: 2.2, volume: 0.8 }],
      captions: [{ text: "במלחמת האזרחים האמריקאית,", at: 0.3 }, { text: "deadline היה קו אמיתי בכלא.", at: 1.8 }],
    },
    {
      id: "s03-chart",
      voiceover: { text: "והיום? הזמן עד ה-deadline רק מתקצר." },
      visual: "Paper field. Bars shrink right-to-left; the last one in accent; arrow points at it.",
      duration: 4,
      cues: { chart: 0.3, arrow: 2.0 },
      sfx: [{ file: "sfx/whoosh.wav", at: 0 }, { file: "sfx/tick.wav", at: 0.3 }, { file: "sfx/tick.wav", at: 0.47 }, { file: "sfx/tick.wav", at: 0.63 }, { file: "sfx/paper.wav", at: 2.0 }],
      captions: [{ text: "והיום? הזמן עד ה-deadline", at: 0.3 }, { text: "רק מתקצר.", at: 2.0 }],
    },
  ],
};
