import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Stamp, useImpactShake, VocabCard } from "../../vox/components/Editorial";
import { MarkerStroke } from "../../vox/components/Marker";
import { PaperBackground } from "../../vox/components/Paper";
import { RtlText } from "../../vox/components/RtlText";
import { SceneShell } from "../../vox/components/SceneShell";
import type { SceneComponents } from "../../vox/Reel";
import { useCue, usePalette } from "../../vox/scene-context";
import { fonts, SAFE } from "../../vox/theme";
import { Globe, PaperProp, Person, Syringe, Virus } from "./props";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PERSON = "#e8d9bf";
const INFECTED = "#e0483f";

/** English word that slams in letter by letter (LTR), with a hard offset shadow. */
const KineticWord: React.FC<{ text: string; at: number; y: number; fontSize: number; color: string; shadow: string }> = ({
  text, at, y, fontSize, color, shadow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div dir="ltr" lang="en" style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontSize, lineHeight: 1, color }}>
      {[...text].map((ch, i) => {
        const p = spring({ frame: frame - at - i * 2, fps, config: { damping: 12, stiffness: 220 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: frame < at + i * 2 ? 0 : 1,
              scale: String(interpolate(p, [0, 1], [2.6, 1])),
              translate: `0 ${interpolate(p, [0, 1], [-90, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [i % 2 ? 12 : -12, 0])}deg`,
              textShadow: `8px 10px 0 ${shadow}`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Red pox dots that burst out around a center point. */
const PoxBurst: React.FC<{ cx: number; cy: number; radius: number; at: number; count?: number }> = ({ cx, cy, radius, at, count = 9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + 0.3;
        const p = spring({ frame: frame - at - i * 2, fps, config: { damping: 10 } });
        const r = radius * (0.85 + 0.15 * p) + interpolate(frame, [at, at + 90], [0, 30], clamp);
        const size = 26 + (i % 3) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: cx + Math.cos(angle) * r - size / 2, top: cy + Math.sin(angle) * r - size / 2,
              width: size, height: size, borderRadius: "50%", background: INFECTED, border: "5px solid #141414",
              scale: String(p), opacity: frame < at + i * 2 ? 0 : 1,
            }}
          />
        );
      })}
    </>
  );
};

const Hook: React.FC = () => {
  const p = usePalette();
  const lettersAt = useCue("letters");
  const shake = useImpactShake(lettersAt + 16, 14);
  return (
    <SceneShell enter="zoom" exit="up" push={0.07} backdrop={p.fields[0]}>
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={p.fields[0]} />
        <AbsoluteFill style={{ padding: `${SAFE.top + 20}px ${SAFE.right}px 0 ${SAFE.left + 30}px` }}>
          <RtlText text="המחלה האנושית היחידה שנמחקה מהעולם" fontSize={84} color={p.ink} startAt={useCue("hook")} stagger={2} />
        </AbsoluteFill>
        <PoxBurst cx={540} cy={800} radius={250} at={useCue("virus") + 6} />
        <PaperProp x={540} y={800} size={400} enterAt={useCue("virus")} rotate={-8} spin={30}>
          <Virus />
        </PaperProp>
        <KineticWord text="SMALLPOX" at={lettersAt} y={1070} fontSize={210} color={p.ink} shadow={p.accent} />
        <MarkerStroke shape="underline" x={200} y={1300} width={680} drawAt={useCue("underline")} color={p.accent} thickness={16} arc={6} seed="hook-u" />
      </AbsoluteFill>
    </SceneShell>
  );
};

const Disease: React.FC = () => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleAt = useCue("title");
  const sick = useCue("sick");
  const arrow1 = useCue("arrow1");
  const arrow2 = useCue("arrow2");
  const spots = (from: number) => Math.floor(interpolate(frame, [from, from + 18], [0, 9], clamp));
  const label = spring({ frame: frame - titleAt, fps, config: { damping: 12 } });
  return (
    <SceneShell enter="up" exit="left" backdrop={p.fields[2]}>
      <PaperBackground color={p.fields[2]} dotColor="rgba(255,255,255,0.10)" />
      <div
        dir="ltr"
        style={{
          position: "absolute", top: SAFE.top + 20, left: 0, right: 0, textAlign: "center",
          fontFamily: fonts.en, fontSize: 96, color: p.accent2, letterSpacing: "0.04em",
          scale: String(label), opacity: label,
        }}
      >
        SMALLPOX =
      </div>
      <div style={{ position: "absolute", top: SAFE.top + 140, left: SAFE.left, right: SAFE.right - 40 }}>
        <RtlText text="אבעבועות שחורות" fontSize={140} color={p.paper} align="center" startAt={titleAt + 6} stagger={4} />
      </div>
      {/* Infection travels right → left (Hebrew reading direction) */}
      <PaperProp x={830} y={980} size={260} enterAt={sick - 10}>
        <Person fill={frame >= sick ? INFECTED : PERSON} spots={frame >= sick ? spots(sick) : 0} spotColor="#7a1f1a" seed={1} />
      </PaperProp>
      <PaperProp x={540} y={980} size={260} enterAt={sick - 6}>
        <Person fill={frame >= arrow1 + 8 ? INFECTED : PERSON} spots={spots(arrow1 + 8)} spotColor="#7a1f1a" seed={2} />
      </PaperProp>
      <PaperProp x={250} y={980} size={260} enterAt={sick - 2}>
        <Person fill={frame >= arrow2 + 8 ? INFECTED : PERSON} spots={spots(arrow2 + 8)} spotColor="#7a1f1a" seed={3} />
      </PaperProp>
      <PaperProp x={930} y={800} size={120} enterAt={sick - 4} spin={60}>
        <Virus />
      </PaperProp>
      <MarkerStroke shape="arrow" x={800} y={800} to={{ x: 580, y: 800 }} arc={80} drawAt={arrow1} drawFrames={10} color={p.accent2} thickness={11} seed="d-a1" />
      <MarkerStroke shape="arrow" x={510} y={800} to={{ x: 290, y: 800 }} arc={80} drawAt={arrow2} drawFrames={10} color={p.accent2} thickness={11} seed="d-a2" />
      <div style={{ position: "absolute", top: 1190, left: SAFE.left, right: SAFE.right - 80 }}>
        <RtlText text="נגיף מדבק שעבר מאדם לאדם" fontSize={68} color={p.paper} align="center" startAt={useCue("line")} stagger={2} />
      </div>
    </SceneShell>
  );
};

const COLS = [170, 340, 510, 680, 850];
const ROWS = [640, 800, 960, 1120];
const SOURCE = { c: 2, r: 1 };

const Vaccine: React.FC = () => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const syringeAt = useCue("syringe");
  const ringAt = useCue("ring");
  const pulseAt = useCue("pulse");
  const blockedAt = useCue("blocked");
  const containedAt = useCue("contained");
  const shake = useImpactShake(blockedAt, 12);
  const slide = spring({ frame: frame - syringeAt, fps, config: { damping: 14 } });
  const poke = interpolate(frame, [ringAt - 2, ringAt + 2, ringAt + 8], [0, -40, 0], clamp);
  const cx = COLS[SOURCE.c];
  const cy = ROWS[SOURCE.r];
  const radius = interpolate(frame, [pulseAt, blockedAt], [40, 205], { ...clamp, easing: Easing.in(Easing.quad) });
  const pulseOpacity = frame < pulseAt ? 0 : interpolate(frame, [blockedAt, containedAt + 10], [1, 0], clamp);
  const flash = interpolate(frame, [blockedAt, blockedAt + 8], [1, 0], clamp);

  let ringIndex = 0;
  return (
    <SceneShell enter="left" exit="zoom" backdrop={p.fields[1]}>
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={p.fields[1]} halftone="full" />
        <AbsoluteFill style={{ padding: `${SAFE.top + 20}px ${SAFE.right}px 0 ${SAFE.left + 20}px` }}>
          <RtlText text="החיסון עצר את ההדבקה" fontSize={100} color={p.ink} align="center" startAt={4} stagger={3} />
        </AbsoluteFill>
        <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
          <circle cx={cx} cy={cy} r={radius} fill="rgba(224,72,63,0.16)" stroke={INFECTED} strokeWidth={14} opacity={pulseOpacity} />
          <circle cx={cx} cy={cy} r={radius + 18} fill="none" stroke={p.accent2} strokeWidth={30} opacity={flash * pulseOpacity} />
        </svg>
        {ROWS.map((y, r) =>
          COLS.map((x, c) => {
            const isSource = r === SOURCE.r && c === SOURCE.c;
            const inRing = !isSource && Math.max(Math.abs(r - SOURCE.r), Math.abs(c - SOURCE.c)) === 1;
            const vaxAt = inRing ? ringAt + ringIndex++ * 2 : 0;
            const vaccinated = inRing && frame >= vaxAt;
            const bump = inRing ? 1 + 0.18 * Math.max(0, 1 - Math.abs(frame - vaxAt - 3) / 5) : 1;
            return (
              <PaperProp key={`${r}-${c}`} x={x} y={y} size={124} border={6} enterAt={(r + c) * 1} bump={bump}>
                <Person
                  fill={isSource ? INFECTED : vaccinated ? p.fields[2] : PERSON}
                  spots={isSource ? 6 : 0}
                  spotColor="#7a1f1a"
                  seed={r * 5 + c}
                />
                {vaccinated ? <circle cx={100} cy={62} r={52} fill="none" stroke={p.accent2} strokeWidth={10} /> : null}
              </PaperProp>
            );
          }),
        )}
        <MarkerStroke shape="circle" x={265} y={565} width={490} height={470} drawAt={ringAt + 14} drawFrames={16} color={p.fields[2]} thickness={10} seed="ring" />
        <PaperProp x={590 + (1 - slide) * 700 + poke} y={1290} size={300} enterAt={syringeAt} rotate={-4}>
          <Syringe />
        </PaperProp>
        <div
          dir="ltr"
          style={{
            position: "absolute", top: 1360, left: 0, right: 60, textAlign: "center", fontFamily: fonts.en, fontSize: 70,
            color: p.fields[2], opacity: interpolate(frame, [syringeAt + 8, syringeAt + 14], [0, 1], clamp), letterSpacing: "0.06em",
          }}
        >
          VACCINE
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

// Case dots on the globe (viewBox units); the last one is East Africa (Somalia, 1977).
const CASES: [number, number][] = [[60, 80], [72, 118], [120, 58], [146, 74], [112, 104], [134, 126]];

const Eradication: React.FC = () => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const counterAt = useCue("counter");
  const dotsAt = useCue("dots");
  const lastAt = useCue("last");
  const stampAt = useCue("stamp");
  const shake = useImpactShake(stampAt, 20);
  const year = Math.round(interpolate(frame, [counterAt, counterAt + 26], [1967, 1980], { ...clamp, easing: Easing.out(Easing.quad) }));
  const landed = spring({ frame: frame - counterAt - 26, fps, config: { damping: 9 } });
  const globeDim = interpolate(frame, [stampAt, stampAt + 6], [1, 0.75], clamp);
  return (
    <SceneShell enter="zoom" exit="up" backdrop={p.fields[3]}>
      <AbsoluteFill style={{ translate: shake }}>
        <PaperBackground color={p.fields[3]} dotColor="rgba(0,0,0,0.12)" />
        <AbsoluteFill style={{ padding: `${SAFE.top + 10}px ${SAFE.right}px 0 ${SAFE.left + 20}px` }}>
          <RtlText text="ה-WHO הכריז:" fontSize={80} color={p.ink} englishColor={p.paper} align="center" startAt={2} stagger={3} />
        </AbsoluteFill>
        <div
          dir="ltr"
          style={{
            position: "absolute", top: SAFE.top + 105, left: 0, right: 40, textAlign: "center", fontFamily: fonts.en,
            fontSize: 250, lineHeight: 1, color: p.ink, textShadow: `10px 12px 0 ${p.paper}`,
            scale: String(1 + 0.12 * (1 - landed) * (frame > counterAt + 26 ? 1 : 0)),
          }}
        >
          {year}
        </div>
        <PaperProp x={540} y={960} size={480} enterAt={4} spin={10} style={{ opacity: globeDim }}>
          <Globe ocean={p.fields[2]} land={p.fields[0]} />
          {CASES.map(([x, y], i) => {
            const offAt = i === CASES.length - 1 ? stampAt : dotsAt + i * 5;
            const s = interpolate(frame, [offAt - 1, offAt + 4], [1, 0], clamp);
            const pulse = 1 + 0.25 * Math.sin(frame / 3 + i);
            return <circle key={i} cx={x} cy={y} r={9 * s * pulse} fill={INFECTED} stroke="#141414" strokeWidth={2.5 * s} />;
          })}
        </PaperProp>
        <MarkerStroke shape="circle" x={552} y={968} width={130} height={120} drawAt={lastAt} drawFrames={12} color={p.ink} thickness={9} seed="last" />
        <Stamp text="ERADICATED" at={stampAt} x={540} y={980} rotate={-12} fontSize={128} color={p.ink} blend="normal" fill={p.paper} />
        <div style={{ position: "absolute", top: 1255, left: SAFE.left, right: SAFE.right - 80 }}>
          <RtlText text="המחלה הוכחדה." fontSize={110} color={p.ink} align="center" startAt={useCue("done")} stagger={4} />
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};

/** Hand-drawn coral X that strikes through a prop. */
const MarkerX: React.FC<{ x: number; y: number; size: number; at: number; color: string }> = ({ x, y, size, at, color }) => {
  const frame = useCurrentFrame();
  const a = `M ${x} ${y} L ${x + size} ${y + size}`;
  const b = `M ${x + size} ${y} L ${x} ${y + size}`;
  const pa = interpolate(frame, [at, at + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pb = interpolate(frame, [at + 6, at + 13], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
      <g fill="none" stroke={color} strokeWidth={22} strokeLinecap="round">
        <path d={a} {...evolvePath(pa, a)} />
        <path d={b} {...evolvePath(pb, b)} />
      </g>
    </svg>
  );
};

const Recap: React.FC = () => {
  const p = usePalette();
  const frame = useCurrentFrame();
  const brandAt = useCue("brand");
  return (
    <SceneShell enter="up" exit="none" push={0.04} backdrop={p.fields[0]}>
      <PaperBackground color={p.fields[0]} />
      <VocabCard word="SMALLPOX" meaning="אבעבועות שחורות" note="SMALL-pox" at={useCue("card")} x={540} y={SAFE.top + 90} rotate={-3} />
      <PaperProp x={540} y={1010} size={250} enterAt={useCue("virus")} rotate={10} spin={15}>
        <Virus />
      </PaperProp>
      <MarkerX x={400} y={870} size={280} at={useCue("cross")} color={p.accent} />
      <div
        dir="ltr"
        style={{
          position: "absolute", top: 1290, left: 0, right: 40, textAlign: "center", fontFamily: fonts.en, fontSize: 72,
          color: p.ink, opacity: interpolate(frame, [brandAt, brandAt + 8], [0, 1], clamp),
          translate: `0 ${interpolate(frame, [brandAt, brandAt + 8], [20, 0], clamp)}px`,
        }}
      >
        English<span style={{ color: p.accent }}>U</span>
      </div>
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
