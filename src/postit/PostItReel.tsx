// Post-it Reel (Reel 6): ADHESIVE + DISMISS. Script: claude/postit-reel-script.md
// Timing follows mock-up v1; retime BEATS + SUBS to Sharon's recording once public/postit/vo.wav exists.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {EndCard, END_CARD_FRAMES} from '../lib/EndCard';
import {GrainOverlay, Subtitle, hasFile} from '../lib/paper';
import {SceneAdhesive, SceneBorn, SceneCallback, SceneChoir, SceneDismiss, SceneFalls, SceneHook, SceneLab, SceneNobody, SceneStays} from './scenes';

// [start, end) in frames at 30 fps; hard cuts between scenes
const BEATS = {
  hook: [0, 100],
  lab: [100, 208],
  adhesive: [208, 310],
  nobody: [310, 412],
  dismiss: [412, 540],
  choir: [540, 625],
  falls: [625, 715],
  stays: [715, 775],
  born: [775, 862],
  callback: [862, 969],
} as const;

const STORY_END = BEATS.callback[1];
export const POSTIT_DURATION = STORY_END + END_CARD_FRAMES; // 1050 = 35.0 s

const SUBS: [number, number, string][] = [
  [0, 100, 'איך דבק שנכשל הפך לפתק הצהוב שנמצא על כל שולחן עבודה?'],
  [100, 208, 'לפני יותר מחמישים שנה, מדען בחברת 3M ניסה להמציא דבק חזק במיוחד.'],
  [208, 310, 'He wanted a super-strong **adhesive**, but he created one that peeled off easily.'],
  [310, 412, 'והדבק החלש הזה? כמעט אף אחד לא רצה אותו.'],
  [412, 540, 'Most people **dismissed** it as useless.'],
  [540, 625, 'עד שכמה שנים אחר כך עמית שלו, ארט פריי, שר במקהלה,'],
  [625, 715, 'והסימנייה שלו כל הזמן נפלה מהספר.'],
  [715, 775, 'הוא נזכר בדבק החלש, והסימנייה נשארה במקום.'],
  [775, 862, 'כך נולד הפתק.'],
  [862, 922, 'שלחו את זה למי שחושב שהרעיון שלו לא מספיק טוב.'],
  [922, 969, 'אולי הוא פשוט עוד לא מצא לו בעיה.'],
];

// Sound: sparse, literal, J-cut 2 frames early. Linear volume: -10 dB 0.32, -15 dB 0.18, -20 dB 0.10.
// Two soft whooshes only (into the lab, into the end card). No file twice in a row.
const SFX: [number, string, number][] = [
  [36, 'tactile/paper_movement_01', 0.2], // hook corner peels
  [98, 'whooshes/soft_whoosh_01', 0.14], // whoosh 1 of 2
  [131, 'miscellaneous/stamp_thud_01', 0.2], // weight lands on the rig
  [246, 'miscellaneous/tape_press_01', 0.2], // note sticks
  [268, 'tactile/paper_movement_02', 0.18], // peels off easily
  [290, 'miscellaneous/tape_press_02', 0.16], // sticks back
  [332, 'miscellaneous/soft_thump_reveal_01', 0.18], // question mark
  [458, 'tactile/book_slide_on_desk_01', 0.18], // hand pushes the sample
  [484, 'miscellaneous/stamp_thud_02', 0.16], // into the bin
  [560, 'miscellaneous/sparkle_soft_01', 0.12], // glow on Art Fry
  [645, 'tactile/paper_movement_03', 0.2], // bookmark falls out
  [726, 'miscellaneous/tape_press_03', 0.22], // glued bookmark presses on
  [743, 'tactile/notebook_handling_01', 0.18], // book shakes, bookmark stays
  [781, 'miscellaneous/soft_thump_reveal_02', 0.2], // the note is born
  [795, 'miscellaneous/sparkle_soft_02', 0.12],
  [866, 'tactile/paper_movement_01', 0.18], // callback: top note peels off
  [898, 'tactile/marker_stroke_01', 0.18], // bulb drawn
  [930, 'miscellaneous/sparkle_soft_03', 0.12], // bulb lights
  [966, 'whooshes/soft_whoosh_02', 0.14], // whoosh 2 of 2: into the end card
  [975, 'miscellaneous/tape_press_01', 0.16], // logo sticker taped
  [1005, 'miscellaneous/sparkle_soft_01', 0.12], // CTA lands
];

const VO = 'postit/vo.wav';

export const PostItReel: React.FC = () => {
  const seq = (k: keyof typeof BEATS, el: React.ReactNode) => (
    <Sequence key={k} from={BEATS[k][0]} durationInFrames={BEATS[k][1] - BEATS[k][0]} name={k}>
      {el}
    </Sequence>
  );
  const d = (k: keyof typeof BEATS) => BEATS[k][1] - BEATS[k][0];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seq('hook', <SceneHook dur={d('hook')} />)}
      {seq('lab', <SceneLab />)}
      {seq('adhesive', <SceneAdhesive />)}
      {seq('nobody', <SceneNobody />)}
      {seq('dismiss', <SceneDismiss />)}
      {seq('choir', <SceneChoir dur={d('choir')} />)}
      {seq('falls', <SceneFalls />)}
      {seq('stays', <SceneStays />)}
      {seq('born', <SceneBorn />)}
      {seq('callback', <SceneCallback dur={d('callback')} />)}
      <Sequence from={STORY_END} durationInFrames={END_CARD_FRAMES} name="endcard">
        <EndCard />
      </Sequence>

      <Sequence from={0} durationInFrames={STORY_END} name="grain">
        <GrainOverlay />
      </Sequence>
      {SUBS.map(([a, b, t], i) => (
        <Sequence key={`sub${i}`} from={a} durationInFrames={b - a} name={`sub ${i + 1}`}>
          <Subtitle text={t} />
        </Sequence>
      ))}

      {/* audio */}
      <Audio src={staticFile('sfx/ambience/quiet_office_room_tone_01.wav')} volume={0.05} loop />
      {hasFile(VO) && <Audio src={staticFile(VO)} volume={0.5} />}
      {SFX.map(([at, file, vol], i) => (
        <Sequence key={`sfx${i}`} from={at} name={file.split('/')[1]}>
          <Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
