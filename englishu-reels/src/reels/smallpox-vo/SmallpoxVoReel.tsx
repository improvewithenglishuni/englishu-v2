import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, Track, useCurrentFrame } from "remotion";
import { MapDot, NewsClipping } from "../../vox/components/Collage";
import { Stamp } from "../../vox/components/Editorial";
import { fonts } from "../../vox/theme";
import {
  ART, at, Band, Bleed, BigWord, CREAM, Counter, Crowd, EndCard, FPS, Label, Medal, NAVY, Paper, Print, RED,
  RingAroundFire, Spotlight, Subtitle, TearingPrint, Timeline,
} from "./parts";

// All times are seconds on the final voiceover (public/reels/smallpox/vo.wav, cut from her recording).
export const VO_END = 72.72;
export const TOTAL = 75.42; // + 2.7 s end card
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

// Scar mark on scar-arm.jpg shown full-bleed (cover): upper mark lands here
const SCAR = { x: 781, y: 768 };
// world-land.png placement shared by the map shots
const MAP = { scale: 0.8, left: -700, top: 560 };
const onMap = (mx: number, my: number) => [MAP.left + mx * MAP.scale, MAP.top + my * MAP.scale] as const;
const CASES: [number, number][] = [[940, 660], [1280, 500], [1480, 640], [1600, 520], [1920, 520], [2020, 460], [2160, 640]];
const SOMALIA = onMap(1660, 580);

const MapLayer: React.FC<{ dim?: number }> = ({ dim = 0.9 }) => (
  <Img src={staticFile(`${ART}/world-land.png`)} style={{ position: "absolute", left: MAP.left, top: MAP.top, width: 2400 * MAP.scale, opacity: dim, filter: "sepia(0.3) hue-rotate(190deg) saturate(1.4) brightness(0.9)" }} />
);

/* --------------------------------------------------------------- shots (t0 = shot start, seconds) */

const S01Hook: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Bleed src={`${ART}/scar-arm.jpg`} zoom={[1.0, 1.12]} origin={`${SCAR.x}px ${SCAR.y}px`} />
    <Band y={-60} height={240} color={NAVY} rotate={-2} seed="h-top" />
    <Spotlight cx={SCAR.x} cy={SCAR.y} at={at(t0, 2.98)} out={at(t0, 4.1)} />
  </AbsoluteFill>
);

const S02Toll: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Bleed src={`${ART}/virus.jpg`} zoom={[1.05, 1.25]} origin="40% 60%" />
    <Band y={880} height={430} color={NAVY} rotate={-3} seed="toll-band">
      <Counter from={0} to={300000000} start={at(t0, 6.6)} end={at(t0, 8.1)} y={60} size={150} />
    </Band>
    <Label text="המאה ה-20" x={540} y={1200} at={at(t0, 9.06)} variant="red" rotate={3} />
  </AbsoluteFill>
);

const S03Zero: React.FC<{ t0: number }> = ({ t0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper />
      <MapLayer dim={interpolate(frame, [0, 20], [0.5, 0.9], { extrapolateRight: "clamp" })} />
      <Band y={180} height={300} color={NAVY} rotate={2} seed="zero-band" />
      <BigWord text="0" at={at(t0, 12.28)} y={160} size={300} accent />
      <Label text="חולים בעולם היום" x={540} y={520} at={at(t0, 12.5)} variant="navy" rotate={-2} />
    </AbsoluteFill>
  );
};

const S04Name: React.FC<{ t0: number }> = ({ t0 }) => {
  const frame = useCurrentFrame();
  const heIn = interpolate(frame, [at(t0, 14.2), at(t0, 14.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Paper color={NAVY} dots="rgba(245,240,229,0.10)" grain={0.25} />
      <Print src={`${ART}/virus.jpg`} x={560} y={240} width={420} height={360} rotate={6} seed="name-virus" mono />
      <Band y={700} height={420} color={CREAM} rotate={-2} seed="name-band">
        <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.heSerif,
          fontWeight: 900, fontSize: 150, color: NAVY, opacity: heIn, translate: `0 ${(1 - heIn) * 30}px` }}>
          אבעבועות שחורות
        </div>
      </Band>
      <BigWord text="SMALLPOX" at={at(t0, 16.32)} y={1150} size={180} accent />
    </AbsoluteFill>
  );
};

const S05Milkmaid: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <Bleed src={`${ART}/scar-chart.jpg`} opacity={0.22} zoom={[1.1, 1.15]} />
    <Band y={1120} height={360} color={NAVY} rotate={2} seed="mm-band" />
    <Print src={`${ART}/milkmaid.jpg`} x={30} y={420} width={1020} height={810} rotate={-2} seed="mm-print" zoom={[1.0, 1.12]} origin="50% 35%" />
    <Label text="1796" x={760} y={300} at={at(t0, 18.24)} variant="red" size={80} rotate={4} />
  </AbsoluteFill>
);

const S06Jenner: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <Bleed src={`${ART}/scar-chart.jpg`} opacity={0.22} zoom={[1.15, 1.2]} />
    <Band y={260} height={300} color={NAVY} rotate={-2} seed="jb-band" />
    <Print src={`${ART}/jenner-book.jpg`} x={-40} y={480} width={1160} height={900} rotate={2} seed="jb-print" zoom={[1.05, 1.45]} origin="78% 42%" />
    <Label text="החיסון הראשון" x={540} y={1240} at={at(t0, 25.78)} variant="navy" rotate={-3} />
  </AbsoluteFill>
);

const S07Years: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <Bleed src={`${ART}/scar-chart.jpg`} opacity={0.16} zoom={[1.2, 1.25]} />
    <Print src={`${ART}/palestine.jpg`} x={250} y={330} width={600} height={400} rotate={-3} enterAt={at(t0, 27.9)} seed="yr-pal" mono />
    <Timeline y={900} start={at(t0, 27.1)} draw={at(t0, 29.0) - at(t0, 27.1)} ticks={[
      { label: "1796", x: 900, at: at(t0, 27.1) },
      { label: "1922", x: 540, at: at(t0, 27.9) },
      { label: "1967", x: 170, at: at(t0, 29.0), red: true },
    ]} />
    <Label text="כמעט 200 שנה" x={540} y={1130} at={at(t0, 28.98)} variant="navy" rotate={2} />
  </AbsoluteFill>
);

const S08Who: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper color={NAVY} dots="rgba(245,240,229,0.10)" grain={0.25} />
    <Band y={1040} height={330} color={CREAM} rotate={-3} seed="who-band" />
    <Print src={`${ART}/poster.jpg`} x={70} y={260} width={560} height={860} rotate={-4} seed="who-poster" zoom={[1, 1.06]} />
    <Label text="1967" x={830} y={420} at={at(t0, 30.56)} variant="red" size={96} rotate={5} />
    <Label text="ארגון הבריאות העולמי" x={540} y={1150} at={at(t0, 31.5)} variant="navy" size={60} rotate={-2} />
  </AbsoluteFill>
);

const S09Eradicate: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper color={NAVY} dots="rgba(245,240,229,0.12)" grain={0.25} />
    <Band y={-80} height={260} color={CREAM} rotate={2} seed="er-top" />
    <Band y={1560} height={420} color={CREAM} rotate={-2} seed="er-bottom" />
    <BigWord text="ERADICATE" at={at(t0, 34.68)} y={620} size={190} accent />
    <Label text="eradicate = למגר / להכחיד" x={540} y={900} at={at(t0, 35.9)} variant="cream" size={58} rotate={-2} />
  </AbsoluteFill>
);

const S10How: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper color={NAVY} dots="rgba(245,240,229,0.08)" grain={0.25} />
    <Crowd redAt={at(t0, 39.26)} />
    <Label text="?" x={540} y={260} at={at(t0, 37.54)} variant="red" size={150} rotate={-6} />
  </AbsoluteFill>
);

const S11Team: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Bleed src={`${ART}/palestine.jpg`} zoom={[1.0, 1.08]} focus="70% 50%" pan={[60, -60]} filter="sepia(0.2) contrast(1.05)" />
    <Band y={-70} height={260} color={NAVY} rotate={-2} seed="team-top" />
    <Label text="outbreak = התפרצות" x={540} y={260} at={at(t0, 43.0)} variant="navy" size={56} rotate={2} />
  </AbsoluteFill>
);

const S12Ring: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <Bleed src={`${ART}/scar-chart.jpg`} opacity={0.14} />
    <RingAroundFire cx={540} cy={820} R={330} peopleAt={at(t0, 46.32)} closeAt={at(t0, 48.0)} dimAt={at(t0, 48.6)} />
  </AbsoluteFill>
);

const S13LastCase: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <MapLayer />
    {CASES.map(([mx, my], i) => {
      const [x, y] = onMap(mx, my);
      return <MapDot key={i} x={x} y={y} at={0} outAt={at(t0, 49.9 + i * 0.4)} size={36} color={RED} />;
    })}
    <MapDot x={SOMALIA[0]} y={SOMALIA[1]} at={0} outAt={at(t0, 55.0)} size={40} color={RED} />
    <Spotlight cx={SOMALIA[0]} cy={SOMALIA[1]} at={at(t0, 53.44)} out={at(t0, 55.0)} minR={180} />
    <Label text="סומליה, 1977" x={SOMALIA[0]} y={SOMALIA[1] + 90} at={at(t0, 54.22)} variant="red" size={56} rotate={-3} />
  </AbsoluteFill>
);

const S141980: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper color={NAVY} dots="rgba(245,240,229,0.10)" grain={0.25} />
    <Band y={330} height={980} color={CREAM} rotate={-2} seed="1980-band" />
    <NewsClipping x={130} y={420} width={820} rotate={-1.5} enterAt={4} from="slap" seed="1980-news" bodyLines={5} headlineSize={100}
      dateline="GENEVA · MAY 8, 1980" headline="WORLD DECLARED FREE OF SMALLPOX" />
    <Label text="1980" x={540} y={250} at={at(t0, 56.04)} variant="red" size={96} rotate={-3} />
    <Stamp text="נגמר" at={at(t0, 57.98)} x={700} y={1130} rotate={-12} fontSize={150} color={RED} blend="normal" fill={CREAM} />
  </AbsoluteFill>
);

const S15Eradicated: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper color={NAVY} dots="rgba(245,240,229,0.12)" grain={0.25} />
    <Band y={-80} height={260} color={CREAM} rotate={-2} seed="ed-top" />
    <BigWord text="SMALLPOX WAS" at={at(t0, 59.48)} y={560} size={120} slam={false} />
    <BigWord text="ERADICATED" at={at(t0, 60.24)} y={720} size={180} accent />
  </AbsoluteFill>
);

const S16Only: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Paper />
    <Band y={1180} height={330} color={NAVY} rotate={2} seed="only-band" />
    <TearingPrint src={`${ART}/virus.jpg`} x={190} y={430} width={700} height={640} at={at(t0, 64.2)} />
    <Label text="המחלה היחידה" x={540} y={250} at={at(t0, 62.66)} variant="red" size={70} rotate={-3} />
  </AbsoluteFill>
);

const S17Ending: React.FC<{ t0: number }> = ({ t0 }) => (
  <AbsoluteFill>
    <Bleed src={`${ART}/scar-arm.jpg`} zoom={[1.14, 1.0]} origin={`${SCAR.x}px ${SCAR.y}px`} />
    <Band y={-60} height={240} color={NAVY} rotate={-2} seed="h-top" />
    <Medal cx={SCAR.x} cy={SCAR.y} r={95} at={at(t0, 70.86)} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- timeline */

const SHOTS: [number, number, React.FC<{ t0: number }>, string][] = [
  [0, 4.18, S01Hook, "Hook: the scar"],
  [4.18, 10.2, S02Toll, "300 million"],
  [10.2, 13.36, S03Zero, "Today: zero"],
  [13.36, 17.6, S04Name, "Name: smallpox"],
  [17.6, 21.96, S05Milkmaid, "1796 milkmaids"],
  [21.96, 27.04, S06Jenner, "First vaccine"],
  [27.04, 30.0, S07Years, "200 more years"],
  [30.0, 33.4, S08Who, "1967 WHO"],
  [33.4, 37.02, S09Eradicate, "ERADICATE"],
  [37.02, 41.76, S10How, "How to win"],
  [41.76, 46.1, S11Team, "Teams"],
  [46.1, 49.66, S12Ring, "Ring around the fire"],
  [49.66, 55.18, S13LastCase, "Ring after ring, Somalia 1977"],
  [55.18, 59.48, S141980, "1980 declared"],
  [59.48, 61.16, S15Eradicated, "Smallpox was eradicated"],
  [61.16, 65.94, S16Only, "The only one"],
  [65.94, VO_END, S17Ending, "Ending: the mark of victory"],
];

// Subtitles follow what she actually said (ivrit-ai transcript of the cleaned voiceover)
const SUBS: [number, number, string, boolean?][] = [
  [0.48, 2.38, "תסתכלו על הזרוע של סבא או סבתא."],
  [2.38, 4.18, "רואים שם צלקת קטנה ועגולה?"],
  [4.18, 6.56, "זה הסימן של מחלה שהרגה"],
  [6.56, 8.56, "בערך 300 מיליון איש,"],
  [8.56, 10.2, "גם במאה ה-20."],
  [10.2, 12.28, "והיום? אין בה אפילו"],
  [12.28, 13.36, "חולה אחד בעולם."],
  [13.36, 15.44, "קוראים לה אבעבועות שחורות,"],
  [15.44, 17.6, "או באנגלית, smallpox."],
  [17.6, 20.1, "כבר ב-1796 רופא בריטי"],
  [20.1, 21.96, "שם לב שחולבות שנדבקו"],
  [21.96, 23.26, "מפרות בגרסה קלה,"],
  [23.26, 25.32, "לא חלו בה אחר כך."],
  [25.32, 27.04, "ככה נולד החיסון הראשון."],
  [27.04, 30.0, "אבל המחלה המשיכה עוד כמעט 200 שנה,"],
  [30.0, 31.5, "עד שב-1967"],
  [31.5, 33.4, "ארגון הבריאות העולמי החליט:"],
  [33.4, 37.02, "They set out to eradicate smallpox, for good.", true],
  [37.02, 39.26, "אז איך מנצחים מחלה בכל העולם?"],
  [39.26, 41.76, "לא מחסנים את כולם בבת אחת."],
  [41.76, 44.06, "כל פעם שהתפרץ outbreak,"],
  [44.06, 46.1, "צוות הגיע במהירות וחיסן"],
  [46.1, 47.66, "את כל מי שסביב החולים,"],
  [47.66, 49.66, "כמו לסגור מעגל סביב האש."],
  [49.66, 51.78, "מעגל אחר מעגל, המחלה נעלמה."],
  [51.78, 55.18, "המקרה הטבעי האחרון היה בסומליה ב-1977,"],
  [55.18, 59.48, "וב-1980 הוכרז רשמית: נגמר."],
  [59.48, 61.16, "Smallpox was eradicated.", true],
  [61.16, 63.22, "עד היום זו המחלה היחידה"],
  [63.22, 65.94, "בבני האדם שהעולם מחק לגמרי."],
  [65.94, 68.94, "אז בפעם הבאה שתראו צלקת עגולה על זרוע... תזכרו:"],
  [68.94, 70.18, "זה לא סתם סימן."],
  [70.18, 72.6, "זה הסימן לניצחון אחד גדול."],
];

const f = (s: number) => Math.round(s * FPS);

export const SmallpoxVoReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CREAM }}>
    <Track name="Shots">
      {SHOTS.map(([a, b, Shot, name]) => (
        <Sequence key={name} name={name} from={f(a)} durationInFrames={f(b) - f(a)}>
          <Shot t0={a} />
        </Sequence>
      ))}
      <Sequence name="End card" from={f(VO_END)} durationInFrames={TOTAL_FRAMES - f(VO_END)}>
        <EndCard />
      </Sequence>
    </Track>
    <Track name="Subtitles">
      {SUBS.map(([a, b, text, ltr]) => (
        <Sequence key={`${a}`} name={`Sub ${a}`} from={f(a)} durationInFrames={f(b) - f(a)} layout="none">
          <Subtitle text={text} ltr={ltr} />
        </Sequence>
      ))}
    </Track>
    {/* voice + music bed + sfx, mixed by scripts/smallpox-audio.py */}
    <Audio name="Mix" src={staticFile("reels/smallpox/mix.wav")} />
  </AbsoluteFill>
);
