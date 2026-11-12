import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Highlight, LabelBox, MapDot, NewsClipping, PhotoPrint, TextStrip, TornPaper } from "../../vox/components/Collage";
import { Stamp, useImpactShake, VocabCard } from "../../vox/components/Editorial";
import { MarkerStroke } from "../../vox/components/Marker";
import { PaperBackground } from "../../vox/components/Paper";
import { SceneShell } from "../../vox/components/SceneShell";
import type { SceneComponents } from "../../vox/Reel";
import { useCue, usePalette } from "../../vox/scene-context";
import { fonts } from "../../vox/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "#d93a2b";
const ART = "reels/smallpox/archival";
// Warm Vox cream; the kit's default paper reads grey under grain + vignette
const CREAM = "#efe4cb";

/* ------------------------------------------------------------------ 1. Hook */

const Hook: React.FC = () => {
  const p = usePalette();
  return (
    <SceneShell enter="zoom" exit="up" push={0.06} backdrop={CREAM}>
      <PaperBackground color={CREAM} halftone="corner" vignette={0.12} />
      <TornPaper x={90} y={560} width={860} height={640} color={p.fields[0]} rotate={-4} seed="hook-y" enterAt={0} drift={20} />
      <PhotoPrint
        src={`${ART}/virus.jpg`}
        x={150} y={600} width={760} height={560} rotate={2} enterAt={useCue("photo")} zoom={[1.08, 1.32]}
        caption="VARIOLA VIRUS · ELECTRON MICROSCOPE · CDC" seed="hook-print"
      />
      <MarkerStroke shape="circle" x={420} y={760} width={300} height={260} drawAt={useCue("circle")} color={RED} thickness={12} seed="hook-c" />
      <NewsClipping
        x={150} y={230} width={780} rotate={-2.5} enterAt={useCue("clip")} from="top" seed="hook-news" bodyLines={2} headlineSize={168}
        headline={<Highlight at={useCue("highlight")} rtl={false}>SMALLPOX</Highlight>}
      />
      <TextStrip
        text="המחלה האנושית היחידה שנמחקה מהעולם" x={100} y={1230} width={830} fontSize={62}
        enterAt={useCue("strip")} from="right" highlight={["היחידה"]} highlightAt={useCue("strip") + 10} seed="hook-strip"
      />
    </SceneShell>
  );
};

/* ------------------------------------------------------------------ 2. Disease: map of spread */

// Pixel positions on world-land.png (2400 × 999)
const SPREAD: [string, number, number][] = [
  ["w-africa", 1280, 500], ["congo", 1480, 640], ["ethiopia", 1600, 520], ["somalia", 1660, 580],
  ["india", 1920, 520], ["bangladesh", 2020, 460], ["indonesia", 2160, 640],
];
const MAP_SCALE = 0.8;
const MAP_LEFT = -700;
const MAP_TOP = 560;
const toScreen = (mx: number, my: number) => [MAP_LEFT + mx * MAP_SCALE, MAP_TOP + my * MAP_SCALE] as const;

const Disease: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dotsAt = useCue("dots");
  const pan = interpolate(frame, [0, durationInFrames], [0, -50]);
  const pts = SPREAD.map(([, x, y]) => toScreen(x, y));
  const route = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const lineP = interpolate(frame, [dotsAt, dotsAt + SPREAD.length * 6], [0, 1], clamp);
  const route2 = evolvePath(lineP, route);
  return (
    <SceneShell enter="up" exit="left" push={0.05} backdrop={CREAM}>
      <PaperBackground color={CREAM} halftone="corner" vignette={0.12} />
      <AbsoluteFill style={{ translate: `${pan}px 0px` }}>
        <Img src={staticFile(`${ART}/world-land.png`)} style={{ position: "absolute", left: MAP_LEFT, top: MAP_TOP, width: 2400 * MAP_SCALE, opacity: 0.88 }} />
        <svg style={{ position: "absolute", inset: 0 }} width={1080 + 200} height={1920}>
          <path d={route} fill="none" stroke={RED} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={0.9} mask="url(#reveal)" />
          <defs>
            <mask id="reveal">
              <path d={route} fill="none" stroke="white" strokeWidth={14} strokeDasharray={route2.strokeDasharray} strokeDashoffset={route2.strokeDashoffset} />
            </mask>
          </defs>
        </svg>
        {pts.map(([x, y], i) => (
          <MapDot key={i} x={x} y={y} at={dotsAt + i * 6} size={34} color={RED} />
        ))}
      </AbsoluteFill>
      <LabelBox text="SMALLPOX =" x={150} y={250} at={useCue("label")} fontSize={58} />
      <TextStrip
        text="אבעבועות שחורות" x={110} y={350} width={820} fontSize={118}
        enterAt={useCue("title")} from="slap" rotate={-2} highlight={["שחורות"]} highlightAt={useCue("title") + 12} seed="dis-title"
      />
      <TextStrip
        text="נגיף מדבק שעבר מאדם לאדם" x={140} y={1330} width={760} fontSize={58}
        enterAt={useCue("line")} from="left" rotate={1.5} highlight={["מאדם", "לאדם"]} highlightAt={useCue("line") + 8} seed="dis-line"
      />
    </SceneShell>
  );
};

/* ------------------------------------------------------------------ 3. Vaccination */

const RingDiagram: React.FC<{ at: number; pulseAt: number; blockedAt: number }> = ({ at, pulseAt, blockedAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePalette();
  const cx = 240;
  const cy = 190;
  const R = 120;
  const pulse = interpolate(frame, [pulseAt, blockedAt], [20, R - 22], { ...clamp, easing: Easing.in(Easing.quad) });
  const pulseOpacity = frame < pulseAt ? 0 : interpolate(frame, [blockedAt + 2, blockedAt + 16], [1, 0.25], clamp);
  const flash = interpolate(frame, [blockedAt, blockedAt + 8], [1, 0], clamp);
  return (
    <svg width={480} height={380} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={pulse} fill="rgba(217,58,43,0.18)" stroke={RED} strokeWidth={6} opacity={pulseOpacity} />
      <circle cx={cx} cy={cy} r={R - 6} fill="none" stroke="#f7dc3c" strokeWidth={22} opacity={flash} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const s = spring({ frame: frame - at - i * 2, fps, config: { damping: 10 } });
        return (
          <g key={i} transform={`translate(${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}) scale(${s})`}>
            <circle r={24} fill={p.fields[2]} stroke="#161412" strokeWidth={4} />
            <path d="M -10 1 L -3 9 L 11 -8" fill="none" stroke="#fbf8f1" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={26} fill={RED} stroke="#161412" strokeWidth={4} />
    </svg>
  );
};

const Vaccine: React.FC = () => {
  const p = usePalette();
  const blockedAt = useCue("blocked");
  const shake = useImpactShake(blockedAt, 10);
  return (
    <SceneShell enter="left" exit="zoom" push={0.05} backdrop={CREAM}>
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={CREAM} halftone="corner" vignette={0.12} />
        <TornPaper x={60} y={470} width={900} height={620} color={p.fields[3]} rotate={3} seed="vax-c" />
        <PhotoPrint
          src={`${ART}/palestine.jpg`}
          x={110} y={490} width={840} height={560} rotate={-2} enterAt={useCue("photo")} from="slap" zoom={[1.05, 1.2]}
          caption="VACCINATION TEAM · PALESTINE, 1922 · WELLCOME" seed="vax-print"
        />
        <PhotoPrint
          src={`${ART}/poster.jpg`}
          x={600} y={960} width={330} height={470} rotate={7} enterAt={useCue("poster")} from="right" zoom={[1, 1.06]} focus="50% 20%" border={14} seed="vax-poster"
        />
        <TornPaper x={100} y={1060} width={480} height={380} color="#fbf8f1" rotate={-3} seed="vax-card" enterAt={useCue("diagram")} from="pop">
          <RingDiagram at={useCue("ring")} pulseAt={useCue("pulse")} blockedAt={blockedAt} />
        </TornPaper>
        <TextStrip
          text="החיסון עצר את ההדבקה" x={110} y={250} width={830} fontSize={92}
          enterAt={useCue("title")} from="slap" rotate={-1.5} highlight={["עצר"]} highlightAt={blockedAt} seed="vax-title"
        />
      </AbsoluteFill>
    </SceneShell>
  );
};

/* ------------------------------------------------------------------ 4. Eradication */

const Eradication: React.FC = () => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const counterAt = useCue("counter");
  const stampAt = useCue("stamp");
  const shake = useImpactShake(stampAt, 18);
  const year = Math.round(interpolate(frame, [counterAt, counterAt + 22], [1967, 1980], { ...clamp, easing: Easing.out(Easing.quad) }));
  return (
    <SceneShell enter="zoom" exit="up" push={0.05} backdrop={CREAM}>
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={CREAM} halftone="corner" vignette={0.12} />
        <TornPaper x={70} y={420} width={940} height={820} color={p.fields[2]} rotate={-3} seed="erad-navy" />
        <NewsClipping
          x={120} y={470} width={840} rotate={-1.5} enterAt={useCue("clip")} from="slap" seed="erad-news" bodyLines={6} headlineSize={104}
          dateline="GENEVA · MAY 8, 1980"
          headline={
            <>
              WORLD DECLARED <Highlight at={useCue("highlight")} rtl={false}>FREE</Highlight> OF SMALLPOX
            </>
          }
        />
        <div
          dir="ltr"
          style={{
            position: "absolute", left: 150, top: 235, background: "#161412", color: "#fbf8f1", fontFamily: fonts.en,
            fontSize: 130, lineHeight: 1, padding: "14px 28px 10px", rotate: "-3deg", boxShadow: "8px 10px 0 rgba(0,0,0,0.25)",
            scale: String(spring({ frame: frame - counterAt + 4, fps: 30, config: { damping: 12 } })),
          }}
        >
          {year}
        </div>
        <LabelBox text="WHO" x={560} y={290} at={counterAt + 10} fontSize={72} bg={RED} rotate={4} />
        <Stamp text="ERADICATED" at={stampAt} x={560} y={1120} rotate={-11} fontSize={118} color={RED} blend="normal" fill="#fbf8f1" />
        <TextStrip
          text="ה-WHO הכריז: המחלה הוכחדה." x={120} y={1320} width={800} fontSize={60}
          enterAt={useCue("strip")} from="right" rotate={1.5} highlight={["הוכחדה"]} highlightAt={useCue("strip") + 8} seed="erad-strip"
        />
      </AbsoluteFill>
    </SceneShell>
  );
};

/* ------------------------------------------------------------------ 5. Recap */

const MarkerX: React.FC<{ x: number; y: number; size: number; at: number }> = ({ x, y, size, at }) => {
  const frame = useCurrentFrame();
  const a = `M ${x} ${y} L ${x + size} ${y + size * 0.9}`;
  const b = `M ${x + size} ${y + size * 0.05} L ${x + size * 0.05} ${y + size * 0.95}`;
  const pa = interpolate(frame, [at, at + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pb = interpolate(frame, [at + 6, at + 13], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
      <g fill="none" stroke={RED} strokeWidth={24} strokeLinecap="round">
        <path d={a} {...evolvePath(pa, a)} />
        <path d={b} {...evolvePath(pb, b)} />
      </g>
    </svg>
  );
};

const Recap: React.FC = () => {
  const p = usePalette();
  return (
    <SceneShell enter="up" exit="none" push={0.04} backdrop={CREAM}>
      <PaperBackground color={CREAM} halftone="corner" vignette={0.12} />
      <TornPaper x={70} y={250} width={940} height={560} color={p.fields[0]} rotate={2} seed="recap-y" />
      <VocabCard word="SMALLPOX" meaning="אבעבועות שחורות" note="SMALL-pox" at={useCue("card")} x={540} y={330} rotate={-3} />
      <PhotoPrint
        src={`${ART}/virus.jpg`}
        x={300} y={840} width={480} height={360} rotate={-5} enterAt={useCue("photo")} from="pop" zoom={[1.3, 1.4]} border={14} tape={false} seed="recap-print"
      />
      <MarkerX x={330} y={860} size={420} at={useCue("cross")} />
      <LabelBox text="EnglishU" x={420} y={1290} at={useCue("brand")} fontSize={64} rotate={-2} />
    </SceneShell>
  );
};

export const smallpoxScenes: SceneComponents = {
  "s01-hook": Hook,
  "s02-disease": Disease,
  "s03-vaccine": Vaccine,
  "s04-eradication": Eradication,
  "s05-recap": Recap,
};
