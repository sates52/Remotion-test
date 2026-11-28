import React from "react";
import { AbsoluteFill, Freeze, Img, staticFile } from "remotion";
import { z } from "zod";
import { ArtDirectionProvider, resolveArtFonts, resolveArtPalette, type ArtDirectionConfig } from "./components/artDirection";
import { Everyman } from "./characters/Everyman";
import { pose } from "./movements";
import {
  variantSchema,
  charAction,
  expression as expressionEnum,
  thumbMotif,
  type AntidoteThumbnailBrief,
  type SceneSpec,
  type CastBible,
} from "./schema";
import { Scene } from "./components/Scene";
import { heroFreezeFrame, focalPointOf, tenxDeviceOf } from "./thumbHero";
import {
  thumbLayoutSchema,
  thumbGrammarSchema,
  resolveGrammar,
  emphasisColor,
  shade,
  type ThumbGrammar,
  pickTextColor,
  thumbGround,
  isDark,
  emphasisIndex,
  CHANNEL_MONOGRAM,
  SPINE_HEIGHT,
  SPINE_FONT,
  HEADLINE as HEADLINE_SHARED,
  SERIF as SERIF_SHARED,
} from "../thumbnail-shared";
import { CinematicBleed } from "../vox/thumbnail";
import { GrammarHook, HookRule, hookFontSize, alignFor, BookAnchor } from "../thumbnail-overlay";

/**
 * AntidoteThumbnail — 6-layout system (flat-vector engine) + High-CTR Cinematic fallback.
 *
 * When a cinematic Flux hero image is present or layout is cinematic-bleed,
 * it renders the high-converting full-bleed cover to ensure high CTR on YouTube.
 */

export const antidoteThumbPropsSchema = z.object({
  title: z.string(),
  author: z.string().default(""),
  hook: z.string(),
  paper: z.string().default("#EAF0E8"),
  ink: z.string().default("#1E2A24"),
  accent: z.string().default("#F0A63C"),
  gold: z.string().default("#3E8E7A"),
  variant: variantSchema,
  action: charAction.default("celebrate"),
  expression: expressionEnum.default("happy"),
  motif: thumbMotif.default("risingBars"),
  slug: z.string().optional(),
  heroImg: z.string().optional(),
  layout: thumbLayoutSchema.optional(),
  grammar: thumbGrammarSchema.optional(),
  /** scene-still: the book's own scene to freeze (picked in Root via pickHeroScene) */
  heroScene: z.any().optional(),
  /** top distinct hero scenes (Root: pickHeroScenes); grammar.sceneRank indexes it */
  heroScenes: z.any().optional(),
  cast: z.any().optional(),
  artDirection: z.any().optional(),
  cutoutImg: z.string().optional(),
  kicker: z.string().optional(),
});
export type AntidoteThumbProps = z.infer<typeof antidoteThumbPropsSchema>;

const HEADLINE = HEADLINE_SHARED;
const SERIF = SERIF_SHARED;

// ── SHARED PIECES ───────────────────────────────────────────────────────────

const Grain: React.FC<{ ink: string }> = ({ ink }) => (
  <AbsoluteFill
    style={{
      zIndex: 90,
      pointerEvents: "none",
      opacity: 0.06,
      backgroundImage: `radial-gradient(${ink} 1px, transparent 1.6px)`,
      backgroundSize: "22px 22px",
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 89,
      pointerEvents: "none",
      boxShadow: "inset 0 0 260px rgba(20,20,20,0.28)",
    }}
  />
);

const Spine: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      bottom: 18,
      zIndex: 80,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <div style={{ width: 4, height: SPINE_HEIGHT, background: color, borderRadius: 2 }} />
    <span
      style={{
        fontFamily: SPINE_FONT,
        fontSize: 16,
        fontWeight: 900,
        color,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity: 0.7,
      }}
    >
      {CHANNEL_MONOGRAM}
    </span>
  </div>
);

/** Smart emphasis hook text (same logic as Vox). */
const HookText: React.FC<{
  hook: string;
  fontSize: number;
  baseColor: string;
  accentColor: string;
  align?: "left" | "center";
}> = ({ hook, fontSize, baseColor, accentColor, align = "left" }) => {
  const words = hook.split(" ");
  const ei = emphasisIndex(hook);
  return (
    <div
      style={{
        fontFamily: HEADLINE,
        fontWeight: 900,
        fontSize,
        lineHeight: 0.9,
        color: baseColor,
        textTransform: "uppercase",
        textAlign: align,
      }}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            color: i === ei ? accentColor : baseColor,
            marginRight: 14,
            display: "inline-block",
          }}
        >
          {w}
        </span>
      ))}
    </div>
  );
};

/** The Everyman subject at a still pose. */
const Character: React.FC<{
  variant: AntidoteThumbProps["variant"];
  expression: AntidoteThumbProps["expression"];
  action: AntidoteThumbProps["action"];
  width?: number;
}> = ({ variant, expression, action, width = 430 }) => {
  const p = pose(action, 45, 30);
  const v = { ...variant, expression };
  return (
    <div style={{ filter: "drop-shadow(0 20px 24px rgba(20,20,20,0.28))" }}>
      <Everyman variant={v} pose={p} width={width} />
    </div>
  );
};

// ── SVG MOTIFS (expanded) ───────────────────────────────────────────────────

const mix = (hex: string, to: number, amt: number) => {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (to - c) * amt),
  );
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
};

const Motif: React.FC<{
  kind: AntidoteThumbnailBrief["motif"];
  accent: string;
  gold: string;
}> = ({ kind, accent, gold }) => {
  const soft = 0.55;
  if (kind === "arrowUp")
    return (
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
        <path d="M200 40 L330 220 L250 220 L250 360 L150 360 L150 220 L70 220 Z" fill={accent} opacity={soft} />
      </svg>
    );
  if (kind === "summit")
    return (
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
        <path d="M40 340 L170 120 L240 240 L300 160 L360 340 Z" fill={accent} opacity={soft} />
        <path d="M170 120 L205 180 L135 180 Z" fill={gold} opacity={0.7} />
      </svg>
    );
  if (kind === "spark")
    return (
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={196} y={40} width={8} height={110} rx={4} fill={accent} opacity={soft} transform={`rotate(${i * 30} 200 200)`} />
        ))}
        <circle cx={200} cy={200} r={40} fill={gold} opacity={0.8} />
      </svg>
    );
  if (kind === "ring")
    return (
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
        <circle cx={200} cy={200} r={170} fill="none" stroke={accent} strokeWidth={40} opacity={soft} />
        <circle cx={200} cy={200} r={110} fill="none" stroke={gold} strokeWidth={16} opacity={0.5} />
      </svg>
    );
  // risingBars (default)
  const bars = [110, 170, 230, 300, 360];
  return (
    <svg viewBox="0 0 400 400" style={{ width: "100%", height: "100%" }}>
      {bars.map((h, i) => (
        <rect key={i} x={30 + i * 74} y={400 - h} width={54} height={h} rx={10} fill={i === bars.length - 1 ? gold : accent} opacity={i === bars.length - 1 ? 0.85 : soft} />
      ))}
    </svg>
  );
};

// ── 6 LAYOUT RENDERERS ──────────────────────────────────────────────────────

const PortraitRight: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  paper,
  ink,
  accent,
  gold,
  variant,
  action,
  expression,
  motif,
}) => {
  const hookSize = hook.length > 16 || hook.split(" ").some((w) => w.length >= 11) ? 88 : 118;
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(135deg, ${mix(paper, 255, 0.35)} 0%, ${paper} 55%, ${mix(paper, 0, 0.06)} 100%)` }} />
      {/* Character bottom-right */}
      <div style={{ position: "absolute", right: 44, bottom: -12 }}>
        <Character variant={variant} expression={expression} action={action} width={430} />
      </div>
      {/* Motif behind character */}
      <div style={{ position: "absolute", left: 604, bottom: 18, width: 360, height: 320, opacity: 0.96 }}>
        <Motif kind={motif} accent={accent} gold={gold} />
      </div>
      {/* Text left */}
      <div style={{ position: "absolute", left: 70, top: 0, bottom: 0, width: 690, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, zIndex: 5 }}>
        <HookText hook={hook} fontSize={hookSize} baseColor={ink} accentColor={accent} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: ink, opacity: 0.8 }}>{author}</div>}
      </div>
    </>
  );
};

const SplitFace: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  paper,
  ink,
  accent,
  gold,
  variant,
  action,
  expression,
}) => {
  const hookSize = hook.length > 14 ? 88 : 108;
  const ground = thumbGround(paper, ink, accent);
  return (
    <>
      {/* Left: character on paper */}
      <div style={{ position: "absolute", left: 0, top: 0, width: "48%", height: "100%", background: paper, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", bottom: -20, transform: "translateX(-50%)" }}>
          <Character variant={variant} expression={expression} action={action} width={480} />
        </div>
      </div>
      {/* Right: solid ground + hook */}
      <div style={{ position: "absolute", right: 0, top: 0, width: "55%", height: "100%", background: ground.bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", gap: 18, zIndex: 3 }}>
        <HookText hook={hook} fontSize={hookSize} baseColor={ground.text} accentColor={accent} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: ground.text, opacity: 0.7 }}>{author}</div>}
      </div>
      {/* Accent stripe */}
      <div style={{ position: "absolute", left: "47%", top: 0, width: 8, height: "100%", background: accent, zIndex: 4 }} />
    </>
  );
};

const FullBleed: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  ink,
  accent,
  gold,
  variant,
  action,
  expression,
  motif,
}) => {
  const hookSize = hook.length > 12 ? 96 : 130;
  return (
    <>
      <AbsoluteFill style={{ background: ink }} />
      {/* Large motif as background element */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 600, height: 600 }}>
          <Motif kind={motif} accent={accent} gold={gold} />
        </div>
      </div>
      {/* Small character in corner */}
      <div style={{ position: "absolute", right: 40, bottom: -10, opacity: 0.4 }}>
        <Character variant={variant} expression={expression} action={action} width={220} />
      </div>
      {/* Center hook */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 80px", zIndex: 5 }}>
        <HookText hook={hook} fontSize={hookSize} baseColor="#FFFFFF" accentColor={accent} align="center" />
        <div style={{ width: 200, height: 6, background: accent, borderRadius: 3, marginTop: 8 }} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: "#FFFFFF", opacity: 0.8, marginTop: 4 }}>{author}</div>}
      </div>
    </>
  );
};

const ObjectHero: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  paper,
  ink,
  accent,
  gold,
  motif,
}) => {
  // No character — pure motif + text on saturated ground
  const hookSize = hook.length > 14 ? 88 : 110;
  const textColor = pickTextColor(accent, ink, paper);
  return (
    <>
      <AbsoluteFill style={{ background: accent }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 65% 50%, rgba(255,255,255,0.15), transparent 60%)` }} />
      {/* Large motif as the "object" */}
      <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)", width: 440, height: 440 }}>
        <Motif kind={motif} accent={gold} gold={paper} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 0, bottom: 0, width: 660, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, zIndex: 5 }}>
        <HookText hook={hook} fontSize={hookSize} baseColor={textColor} accentColor={gold} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: textColor, opacity: 0.8 }}>{author}</div>}
      </div>
    </>
  );
};

const TwoSubjectVs: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  paper,
  ink,
  accent,
  gold,
  variant,
  action,
  expression,
}) => {
  const hookSize = hook.length > 14 ? 76 : 96;
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(135deg, ${mix(paper, 255, 0.3)}, ${paper})` }} />
      {/* Left character (flipped = facing right) */}
      <div style={{ position: "absolute", left: -20, bottom: -12, transform: "scaleX(-1)" }}>
        <Character variant={variant} expression={expression} action="point" width={380} />
      </div>
      {/* Right character (different action for variety) */}
      <div style={{ position: "absolute", right: -20, bottom: -12 }}>
        <Character variant={{ ...variant, suit: gold }} expression="worried" action="slump" width={380} />
      </div>
      {/* Center content */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 0, bottom: 0, width: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, zIndex: 6 }}>
        <div style={{ width: 6, height: 80, background: accent, borderRadius: 3 }} />
        <HookText hook={hook} fontSize={hookSize} baseColor={ink} accentColor={accent} align="center" />
        <div style={{ width: 6, height: 80, background: accent, borderRadius: 3 }} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: ink, opacity: 0.7 }}>{author}</div>}
      </div>
    </>
  );
};

const TextPoster: React.FC<AntidoteThumbProps> = ({
  author,
  hook,
  paper,
  ink,
  accent,
}) => {
  const ground = thumbGround(paper, ink, accent);
  const hookSize = hook.length > 12 ? 130 : 170;
  return (
    <>
      <AbsoluteFill style={{ background: ground.bg }} />
      <AbsoluteFill style={{ opacity: 0.04, backgroundImage: `radial-gradient(${ground.text} 1px, transparent 1.6px)`, backgroundSize: "22px 22px" }} />
      {/* Diagonal accent strip */}
      <div style={{ position: "absolute", right: -60, top: -60, width: 300, height: 840, background: accent, transform: "rotate(12deg)", opacity: 0.15, zIndex: 2 }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "0 80px", zIndex: 5 }}>
        <HookText hook={hook} fontSize={hookSize} baseColor={ground.text} accentColor={accent} align="center" />
        <div style={{ width: 240, height: 8, background: accent, borderRadius: 4 }} />
        {author && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: ground.text, opacity: 0.7, marginTop: 8 }}>{author}</div>}
      </div>
    </>
  );
};

/**
 * SceneStill — a frozen frame of the book's own Antidote scene (its real set,
 * cast and icon) beside a solid palette panel carrying the hook. The thumbnail
 * is literally a frame of the film, so it cannot promise a different video.
 * textPos picks the panel side (left / right / bottom); the stage slides away
 * from the panel so the cast is never under the text.
 */
const heroOf = (p: AntidoteThumbProps, g: ThumbGrammar): SceneSpec | undefined => {
  const list = (p.heroScenes as SceneSpec[] | undefined) ?? [];
  return list[Math.min(g.sceneRank ?? 0, list.length - 1)] ?? (p.heroScene as SceneSpec | undefined);
};

const SceneStill: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { hook, title, author, paper, ink, accent, gold, cast, g } = props;
  const scene = heroOf(props, g);
  // Panel colour is a grammar axis too: ink panel + accent emphasis, or a
  // saturated accent panel + gold emphasis.
  const panel = g.accent === "gold" ? accent : isDark(ink) ? ink : "#101216";
  const base = pickTextColor(panel, ink, "#FFFFFF");
  // Emphasis must stand out from BOTH the panel and the body text (a gold
  // emphasis that fails contrast used to fall back to paper = same as the body).
  const emph = emphasisColor(g.accent === "gold" ? [gold, accent, ink, paper] : [accent, gold, paper, ink], panel, base);
  const align = alignFor(g.textPos);
  const bottom = g.textPos === "bottom";
  // Bottom band holds ONE line: shrink to fit ~1040px (a wrapped second line
  // used to climb out of the band onto the light scene).
  const fitOneLine = Math.floor(1040 / (hook.length * (g.type === "label" ? 0.78 : 0.7)));
  const fontSize = bottom
    ? Math.min(Math.round(hookFontSize(hook, g.type, true) * 0.9), fitOneLine)
    : Math.min(
        Math.round(hookFontSize(hook, g.type) * 0.8),
        // side panel text column is 440px: the longest word must fit on its own line
        Math.floor(440 / (Math.max(...hook.split(/\s+/).map((w) => w.length)) * (g.type === "label" ? 0.86 : 0.74))),
      );
  // 1920×1080 stage → 1280×720 frame, zoomed a little so the slide never shows an edge.
  const S = (1280 / 1920) * 1.12;
  const dx = bottom ? 0 : (g.textPos === "left" ? 1 : -1) * 250;
  const dy = bottom ? -120 : 0;
  const panelClip =
    g.textPos === "left" ? "polygon(0 0, 100% 0, 86% 100%, 0 100%)"
    : g.textPos === "right" ? "polygon(14% 0, 100% 0, 100% 100%, 0 100%)"
    : "polygon(0 18%, 100% 0, 100% 100%, 0 100%)";
  const panelBox: React.CSSProperties =
    bottom ? { left: 0, right: 0, bottom: 0, height: 300 }
    : g.textPos === "left" ? { left: 0, top: 0, bottom: 0, width: 560 }
    : { right: 0, top: 0, bottom: 0, width: 560 };
  const textBox: React.CSSProperties =
    bottom ? { left: 64, right: 150, bottom: 52, height: 220, justifyContent: "flex-end" }
    : g.textPos === "left" ? { left: 56, top: 0, bottom: 0, width: 440, justifyContent: "center" }
    : { right: 56, top: 0, bottom: 0, width: 440, justifyContent: "center", alignItems: "flex-end" };
  return (
    <>
      <AbsoluteFill style={{ background: paper }} />
      {scene ? (
        <div style={{ position: "absolute", left: 640 + dx, top: 360 + dy, width: 1920, height: 1080, transform: `translate(-50%, -50%) scale(${S})`, transformOrigin: "center" }}>
          <ArtDirectionProvider value={(props.artDirection ?? null) as ArtDirectionConfig | null}>
            <Freeze frame={heroFreezeFrame(scene)}>
              <Scene scene={{ ...scene, texts: [], diagram: undefined, transition: { type: "cut", frames: 0 } } as SceneSpec} cast={cast as CastBible | undefined} />
            </Freeze>
          </ArtDirectionProvider>
        </div>
      ) : null}
      <div style={{ position: "absolute", ...panelBox, background: panel, clipPath: panelClip, zIndex: 4, boxShadow: "0 0 60px rgba(0,0,0,0.3)" }} />
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: 16, zIndex: 6, ...textBox }}>
        <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={ink} align={align} />
        <HookRule type={g.type} accent={emph} align={align} />
      </div>
      {/* Book anchor: on the dark side panel it sits bare; over the light scene it gets a pill. */}
      <BookAnchor title={title} author={author} side={g.textPos === "right" ? "right" : "left"} accent={emph} ground={bottom ? "pill" : "bare"} top={bottom ? 26 : 40} inset={bottom ? 30 : 56} />
    </>
  );
};

/**
 * Zero-letterbox, subject-focused media viewport for Antidote 10x thumbnails.
 * Uses CSS-cover math (`Math.max(boxW / 1920, boxH / 1080) * 1.04`) and clamps
 * focal-point pan so no margin band ever appears inside any split or card box.
 */
const TenxHeroMedia: React.FC<{
  heroImg?: string;
  scene?: SceneSpec;
  cast?: unknown;
  artDirection?: ArtDirectionConfig | null;
  boxW: number;
  boxH: number;
  focalPoint?: { x: number; y: number };
}> = ({ heroImg, scene, cast, artDirection, boxW, boxH, focalPoint }) => {
  const pal = resolveArtPalette(artDirection ?? null);
  const fp = focalPoint ?? focalPointOf(scene);
  if (heroImg && heroImg.trim()) {
    return (
      <Img
        src={staticFile(heroImg)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${Math.round(fp.x * 100)}% ${Math.round(fp.y * 100)}%`,
        }}
      />
    );
  }
  if (scene) {
    const coverScale = Math.max(boxW / 1920, boxH / 1080) * 1.04;
    const scaledW = 1920 * coverScale;
    const scaledH = 1080 * coverScale;
    const maxDx = Math.max(0, (scaledW - boxW) / 2);
    const maxDy = Math.max(0, (scaledH - boxH) / 2);
    const dx = Math.max(-maxDx, Math.min(maxDx, (0.5 - fp.x) * scaledW));
    const dy = Math.max(-maxDy, Math.min(maxDy, (0.5 - fp.y) * scaledH));
    // For CAST / non-10x scenes, strip floating callout text labels so only the
    // characters + drawn location carry the thumbnail visual (the hook owns typography).
    const isCastOnly = tenxDeviceOf(scene) === null;
    const cleanedScene: SceneSpec = isCastOnly
      ? ({ ...scene, texts: [], diagram: undefined, transition: { type: "cut", frames: 0 } } as SceneSpec)
      : ({ ...scene, transition: { type: "cut", frames: 0 } } as SceneSpec);
    return (
      <ArtDirectionProvider value={artDirection ?? null}>
        <Freeze frame={heroFreezeFrame(scene)}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 1920,
              height: 1080,
              transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${coverScale.toFixed(4)})`,
              transformOrigin: "center",
            }}
          >
            <Scene scene={cleanedScene} cast={cast as CastBible | undefined} />
          </div>
        </Freeze>
      </ArtDirectionProvider>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, background: pal.bgAlt }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${pal.accent}22 2px, transparent 2px)`, backgroundSize: "28px 28px" }} />
    </div>
  );
};

/** Resolve book-palette contrast tokens for any 10x thumbnail panel (book palette only, no fixed yellow). */
function tenxPanelColors(
  props: AntidoteThumbProps,
  pal: ReturnType<typeof resolveArtPalette>,
  g: ThumbGrammar,
  panelBg: string,
) {
  const base = pickTextColor(panelBg, pal.ink, "#FFFFFF");
  const primary = g.accent === "gold" ? (props.gold || pal.accent2 || pal.accent) : (props.accent || pal.accent);
  const secondary = g.accent === "gold" ? (props.accent || pal.accent) : (props.gold || pal.accent2 || pal.accent);
  const emph = emphasisColor([primary, secondary, pal.accent, pal.accent2], panelBg, base, 3.2, 1.7);
  const labelInk = isDark(panelBg) ? "#0B0D11" : pal.ink;
  return { base, emph, labelInk };
}

/** Fit hook font size to the active column width while keeping strong 168px browse legibility. */
function tenxHookSize(hook: string, type: ThumbGrammar["type"], colWidth: number, wide = false): number {
  const words = hook.trim().split(/\s+/).filter(Boolean);
  const longest = Math.max(4, ...words.map((w) => w.length));
  const charFactor = type === "label" ? 0.84 : type === "editorial" ? 0.7 : 0.72;
  const maxByLongestWord = Math.floor(colWidth / (longest * charFactor));
  const raw = hookFontSize(hook, type, wide);
  const target = wide ? Math.round(raw * 0.84) : Math.round(raw * 0.76);
  const oneLineCap = wide ? Math.floor((colWidth * 1.04) / Math.max(8, hook.trim().length * (type === "label" ? 0.76 : 0.64))) : target;
  return Math.max(44, Math.min(target, maxByLongestWord, wide ? Math.max(58, oneLineCap) : target));
}

/** Use book-artLock Flux hero image on variant A (or when no scene exists); let B/C showcase distinct scenes. */
function tenxActiveHeroImg(heroImg: string | undefined, scene: SceneSpec | undefined, g: ThumbGrammar): string | undefined {
  if (!heroImg || !heroImg.trim()) return undefined;
  if (!scene || (g.sceneRank ?? 0) === 0) return heroImg;
  return undefined;
}

const PosterDrama10x: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { title, author, hook, heroImg, artDirection, g } = props;
  const ad = (artDirection ?? null) as ArtDirectionConfig | null;
  const pal = resolveArtPalette(ad);
  const scene = heroOf(props, g);
  const activeImg = tenxActiveHeroImg(heroImg, scene, g);
  const hasHook = Boolean(hook && hook.trim());
  const bottom = g.textPos === "bottom";
  const right = g.textPos === "right";
  const align = alignFor(g.textPos);
  // Polarity-inverted high-contrast scrim grounded in the book's deepest tone.
  const deepGround = isDark(pal.bg) ? shade(pal.bg, -0.35) : shade(pal.ink, -0.25);
  const { base, emph, labelInk } = tenxPanelColors(props, pal, g, deepGround);
  const fontSize = tenxHookSize(hook || "CORE", g.type, bottom ? 1040 : 540, bottom);
  // Shift subject focal point away from the text scrim side so face/hero stays in the clear half:
  // TenxHeroMedia pans by `(0.5 - fp) * scaled`, so larger fp.y moves the scene UP (clear of bottom scrim).
  const baseFp = focalPointOf(scene);
  const fp = bottom
    ? { x: baseFp.x, y: Math.min(0.76, baseFp.y + 0.1) }
    : { x: right ? Math.min(0.72, baseFp.x + 0.1) : Math.max(0.28, baseFp.x - 0.1), y: baseFp.y };

  const scrimBg = bottom
    ? `linear-gradient(0deg, ${deepGround}F5 0%, ${deepGround}D8 34%, ${deepGround}55 60%, ${deepGround}00 84%)`
    : `linear-gradient(${right ? 270 : 90}deg, ${deepGround}F6 0%, ${deepGround}E0 40%, ${deepGround}66 64%, ${deepGround}05 92%)`;

  const hookBox: React.CSSProperties = bottom
    ? { left: 64, right: 170, bottom: 48, justifyContent: "flex-end", alignItems: "flex-start" }
    : right
      ? { right: 56, top: 86, bottom: 48, width: 570, justifyContent: "center", alignItems: "flex-end" }
      : { left: 56, top: 86, bottom: 48, width: 570, justifyContent: "center", alignItems: "flex-start" };

  return (
    <AbsoluteFill style={{ background: deepGround, overflow: "hidden" }}>
      <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={1280} boxH={720} focalPoint={fp} />
      <div style={{ position: "absolute", inset: 0, background: scrimBg, zIndex: 3 }} />
      {/* Subtle accent rail along the text edge */}
      <div
        style={{
          position: "absolute",
          ...(bottom ? { left: 0, right: 0, bottom: 0, height: 8 } : right ? { right: 0, top: 0, bottom: 0, width: 10 } : { left: 0, top: 0, bottom: 0, width: 10 }),
          background: emph,
          zIndex: 5,
        }}
      />
      <BookAnchor title={title} author={author} side={right ? "right" : "left"} accent={emph} ground="pill" top={28} inset={bottom ? 42 : 56} />
      {hasHook && (
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: 16, zIndex: 6, ...hookBox }}>
          <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align={align} overPhoto />
          <HookRule type={g.type} accent={emph} align={align} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const EditorialCover10x: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { title, author, hook, heroImg, kicker, artDirection, g } = props;
  const ad = (artDirection ?? null) as ArtDirectionConfig | null;
  const pal = resolveArtPalette(ad);
  const fonts = resolveArtFonts(ad);
  const scene = heroOf(props, g);
  const activeImg = tenxActiveHeroImg(heroImg, scene, g);
  const bottom = g.textPos === "bottom";
  const right = g.textPos === "right";
  const align = alignFor(g.textPos);
  const hasHook = Boolean(hook && hook.trim());
  // Use a strong contrasting masthead band (dark band on light books, deep tint on dark books)
  // so 168px browse contrast pops instead of pale-on-pale cream.
  const bandBg = isDark(pal.bg) ? shade(pal.bg, -0.25) : pal.ink;
  const { base, emph, labelInk } = tenxPanelColors(props, pal, g, bandBg);
  const mediaH = 442;
  const bandH = 720 - mediaH;
  const fontSize = tenxHookSize(hook || "CORE", g.type, 1080, true);

  return (
    <AbsoluteFill style={{ background: bandBg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, ...(bottom ? { top: 0, height: mediaH } : { bottom: 0, height: mediaH }), overflow: "hidden" }}>
        <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={1280} boxH={mediaH} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: bottom
              ? `linear-gradient(0deg, ${bandBg} 0%, ${bandBg}00 32%)`
              : `linear-gradient(180deg, ${bandBg} 0%, ${bandBg}00 32%)`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          ...(bottom ? { bottom: 0, height: bandH, borderTop: `5px solid ${emph}` } : { top: 0, height: bandH, borderBottom: `5px solid ${emph}` }),
          background: bandBg,
          padding: "22px 64px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: right ? "flex-end" : "flex-start",
          gap: 10,
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: "0.14em",
            color: emph,
            textTransform: "uppercase",
            textAlign: align,
          }}
        >
          {kicker || `${title.toUpperCase()}${author ? ` · ${author.toUpperCase()}` : ""}`}
        </div>
        {hasHook && (
          <>
            <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align={align} />
            <HookRule type={g.type} accent={emph} align={align} />
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

const SplitPoster10x: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { title, author, hook, heroImg, kicker, artDirection, g } = props;
  const ad = (artDirection ?? null) as ArtDirectionConfig | null;
  const pal = resolveArtPalette(ad);
  const fonts = resolveArtFonts(ad);
  const scene = heroOf(props, g);
  const activeImg = tenxActiveHeroImg(heroImg, scene, g);
  const bottom = g.textPos === "bottom";
  const textRight = g.textPos === "right";
  const align = alignFor(g.textPos);
  const hasHook = Boolean(hook && hook.trim());
  const panelBg = isDark(pal.bg) ? shade(pal.bg, -0.22) : pal.ink;
  const { base, emph, labelInk } = tenxPanelColors(props, pal, g, panelBg);

  if (bottom) {
    const mediaH = 426;
    const textH = 720 - mediaH;
    const fontSize = tenxHookSize(hook || "CORE", g.type, 1080, true);
    return (
      <AbsoluteFill style={{ background: panelBg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ width: 1280, height: mediaH, position: "relative", overflow: "hidden", background: pal.bgAlt }}>
          <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={1280} boxH={mediaH} />
        </div>
        <div
          style={{
            width: 1280,
            height: textH,
            padding: "24px 64px",
            boxSizing: "border-box",
            borderTop: `6px solid ${emph}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19, letterSpacing: "0.14em", color: emph, textTransform: "uppercase" }}>
            {kicker || `${title.toUpperCase()}${author ? ` · ${author.toUpperCase()}` : ""}`}
          </div>
          {hasHook && (
            <>
              <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align="left" />
              <HookRule type={g.type} accent={emph} align="left" />
            </>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  const textW = 600;
  const mediaW = 1280 - textW;
  const fontSize = tenxHookSize(hook || "CORE", g.type, textW - 96, false);
  const textCol = (
    <div
      style={{
        width: textW,
        height: 720,
        padding: "46px 48px",
        boxSizing: "border-box",
        background: panelBg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: textRight ? "flex-end" : "flex-start",
        gap: 16,
        ...(textRight ? { borderLeft: `6px solid ${emph}` } : { borderRight: `6px solid ${emph}` }),
      }}
    >
      <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 19, letterSpacing: "0.14em", color: emph, textTransform: "uppercase", textAlign: align }}>
        {kicker || `${title.toUpperCase()}${author ? ` · ${author.toUpperCase()}` : ""}`}
      </div>
      {hasHook && (
        <>
          <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align={align} />
          <HookRule type={g.type} accent={emph} align={align} />
        </>
      )}
    </div>
  );
  const mediaCol = (
    <div style={{ width: mediaW, height: 720, position: "relative", overflow: "hidden", background: pal.bgAlt }}>
      <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={mediaW} boxH={720} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: panelBg, display: "flex", flexDirection: "row", overflow: "hidden" }}>
      {textRight ? <>{mediaCol}{textCol}</> : <>{textCol}{mediaCol}</>}
    </AbsoluteFill>
  );
};

const DiagramHook10x: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { title, author, hook, heroImg, kicker, artDirection, g } = props;
  const ad = (artDirection ?? null) as ArtDirectionConfig | null;
  const pal = resolveArtPalette(ad);
  const fonts = resolveArtFonts(ad);
  const scene = heroOf(props, g);
  const activeImg = tenxActiveHeroImg(heroImg, scene, g);
  const hasHook = Boolean(hook && hook.trim());
  const textRight = g.textPos === "right";
  const bottom = g.textPos === "bottom";
  const align = alignFor(g.textPos);
  const ground = isDark(pal.bg) ? pal.bg : shade(pal.bg, -0.04);
  const { base, emph, labelInk } = tenxPanelColors(props, pal, g, ground);
  const cardW = bottom ? 1192 : 736;
  const cardH = bottom ? 396 : 636;
  const stageH = bottom ? 396 : 476;
  const textColW = bottom ? 1160 : 440;
  const fontSize = tenxHookSize(hook || "CORE", g.type, textColW, bottom);
  const chromeBg = isDark(pal.bg) ? shade(pal.bg, -0.24) : pal.ink;
  const chromeInk = pickTextColor(chromeBg, pal.ink, "#FFFFFF");
  const chromeAccent = emphasisColor(
    [g.accent === "gold" ? (props.gold || pal.accent2) : (props.accent || pal.accent), props.accent || pal.accent, props.gold || pal.accent2, "#F59E0B"],
    chromeBg,
    chromeInk,
    3.5,
    1.5,
  );

  const textBlock = (
    <div
      style={{
        width: bottom ? "100%" : 464,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: textRight ? "flex-end" : "flex-start",
        gap: 14,
      }}
    >
      <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 18, letterSpacing: "0.14em", color: emph, textTransform: "uppercase", textAlign: align }}>
        {kicker || `${title.toUpperCase()}${author ? ` · ${author.toUpperCase()}` : ""}`}
      </div>
      {hasHook && (
        <>
          <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align={align} />
          <HookRule type={g.type} accent={emph} align={align} />
        </>
      )}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: ground,
        overflow: "hidden",
        padding: bottom ? "28px 44px" : "38px 44px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: bottom ? "column" : "row",
        gap: bottom ? 20 : 34,
        alignItems: "center",
      }}
    >
      {!bottom && !textRight && textBlock}
      <div
        style={{
          width: cardW,
          height: cardH,
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
          border: `3px solid ${emph}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
          background: pal.bgAlt,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!bottom && (
          <div
            style={{
              height: 76,
              padding: "0 24px",
              boxSizing: "border-box",
              background: chromeBg,
              borderBottom: `3px solid ${chromeAccent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: chromeAccent }} />
              <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 18, letterSpacing: "0.14em", color: chromeInk, textTransform: "uppercase" }}>
                {title.toUpperCase()}
              </div>
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", "Consolas", monospace', fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: chromeAccent, textTransform: "uppercase" }}>
              CORE MODEL
            </div>
          </div>
        )}
        <div style={{ width: cardW, height: stageH, position: "relative", overflow: "hidden", background: pal.bgAlt, flexShrink: 0 }}>
          <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={cardW} boxH={stageH} />
        </div>
        {!bottom && (
          <div
            style={{
              flex: 1,
              padding: "0 24px",
              boxSizing: "border-box",
              background: chromeBg,
              borderTop: `2px solid ${chromeAccent}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 18, color: chromeInk, opacity: 0.92 }}>
              {author ? `Visual Breakdown · ${author}` : "Visual Breakdown"}
            </div>
            <div style={{ width: 72, height: 5, borderRadius: 3, background: chromeAccent }} />
          </div>
        )}
      </div>
      {(bottom || textRight) && textBlock}
    </AbsoluteFill>
  );
};

const CutoutHero10x: React.FC<AntidoteThumbProps & { g: ThumbGrammar }> = (props) => {
  const { title, author, hook, heroImg, cutoutImg, kicker, artDirection, g } = props;
  const ad = (artDirection ?? null) as ArtDirectionConfig | null;
  const pal = resolveArtPalette(ad);
  const fonts = resolveArtFonts(ad);
  const scene = heroOf(props, g);
  const activeImg = tenxActiveHeroImg(heroImg, scene, g);
  const hasHook = Boolean(hook && hook.trim());
  const right = g.textPos === "right";
  const bottom = g.textPos === "bottom";
  const align = alignFor(g.textPos);
  const ground = isDark(pal.bg) ? shade(pal.bg, -0.22) : pal.ink;
  const { base, emph, labelInk } = tenxPanelColors(props, pal, g, ground);
  const fontSize = tenxHookSize(hook || "CORE", g.type, bottom ? 1040 : 620, bottom);

  return (
    <AbsoluteFill style={{ background: ground, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.82 }}>
        <TenxHeroMedia heroImg={activeImg} scene={scene} cast={props.cast} artDirection={ad} boxW={1280} boxH={720} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bottom
            ? `linear-gradient(0deg, ${ground}F2 0%, ${ground}96 42%, ${ground}14 78%, ${ground}00 100%)`
            : `linear-gradient(${right ? 270 : 90}deg, ${ground}EE 0%, ${ground}A4 46%, ${ground}18 76%, ${ground}00 100%)`,
          zIndex: 2,
        }}
      />
      {cutoutImg && (
        <Img
          src={staticFile(cutoutImg)}
          style={{
            position: "absolute",
            ...(bottom ? { left: "50%", top: 18, transform: "translateX(-50%)", height: 470 } : right ? { left: 48, bottom: -10, height: 670 } : { right: 48, bottom: -10, height: 670 }),
            width: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 20px 34px rgba(0,0,0,0.42))",
            zIndex: 3,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          ...(bottom
            ? { left: 64, right: 160, bottom: 42, justifyContent: "flex-end", alignItems: "flex-start" }
            : right
              ? { right: 64, top: 0, bottom: 0, width: 640, justifyContent: "center", alignItems: "flex-end" }
              : { left: 64, top: 0, bottom: 0, width: 640, justifyContent: "center", alignItems: "flex-start" }),
          display: "flex",
          flexDirection: "column",
          gap: 14,
          zIndex: 5,
        }}
      >
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 21, letterSpacing: "0.14em", color: emph, textTransform: "uppercase", textAlign: align }}>
          {kicker || `${title.toUpperCase()}${author ? ` · ${author.toUpperCase()}` : ""}`}
        </div>
        {hasHook && (
          <>
            <GrammarHook hook={hook} type={g.type} fontSize={fontSize} base={base} accent={emph} ink={labelInk} align={align} overPhoto />
            <HookRule type={g.type} accent={emph} align={align} />
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export const AntidoteThumbnail: React.FC<AntidoteThumbProps> = (props) => {
  const { paper, ink, slug, layout: layoutOverride, heroImg } = props;
  const g = resolveGrammar(slug ?? "default", "antidote", props.grammar, layoutOverride);
  if (g.layout === "poster-drama-10x") return <PosterDrama10x {...props} g={g} />;
  if (g.layout === "editorial-cover-10x") return <EditorialCover10x {...props} g={g} />;
  if (g.layout === "split-poster-10x") return <SplitPoster10x {...props} g={g} />;
  if (g.layout === "cutout-hero-10x") return <CutoutHero10x {...props} g={g} />;
  if (g.layout === "diagram-hook-10x") return <DiagramHook10x {...props} g={g} />;
  // scene-still needs a scene; a config-less preview falls back to the poster.
  const layout = g.layout === "scene-still" && !heroOf(props, g) ? "text-poster" : g.layout;

  // Photoreal Flux bleed is opt-in only (grammar.layout = "cinematic-bleed").
  // It used to fire whenever a heroImg existed — and Root always passes one —
  // so every Antidote thumbnail was a photo that looked nothing like the film.
  if (layout === "cinematic-bleed") {
    const resolvedHero = heroImg || (slug ? `scenes/${slug}/thumbnail-hero.png` : undefined);
    return (
      <AbsoluteFill style={{ backgroundColor: "#0B0D11", overflow: "hidden" }}>
        <CinematicBleed
          title={props.title}
          author={props.author}
          hook={props.hook}
          heroCut=""
          heroImg={resolvedHero}
          slug={slug}
          layout="cinematic-bleed"
          pal={{ paper, ink, red: props.accent, gold: props.gold }}
          grammar={g}
        />
        <Vignette />
        <Grain ink={ink} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: paper, overflow: "hidden" }}>
      {layout === "portrait-right" && <PortraitRight {...props} />}
      {layout === "split-face" && <SplitFace {...props} />}
      {layout === "full-bleed" && <FullBleed {...props} />}
      {layout === "object-hero" && <ObjectHero {...props} />}
      {layout === "two-subject-vs" && <TwoSubjectVs {...props} />}
      {layout === "text-poster" && <TextPoster {...props} />}
      {layout === "scene-still" && <SceneStill {...props} g={g} />}

      {/* Brand lock */}
      {layout !== "scene-still" && <Spine color={isDark(paper) ? paper : ink} />}
      <Vignette />
      <Grain ink={ink} />
    </AbsoluteFill>
  );
};

export const AntidoteThumbLab: React.FC<{ config?: AntidoteThumbProps }> = ({ config }) => {
  const fallback: AntidoteThumbProps = {
    title: "Book Summary",
    author: "",
    hook: "CORE IDEA",
    paper: "#FAF7F0",
    ink: "#18181B",
    accent: "#C2410C",
    gold: "#166534",
    variant: { skin: "#F2C79B", hair: "#3A2A22", suit: "#4E6E8E", shirt: "#FFFFFF", expression: "neutral", hairStyle: "short", glasses: false, beard: "none", gender: "m", age: "adult", outfit: "suit", headwear: "none", accessory: "none", build: "average", height: 1, headScale: 1, overlay: [] },
    action: "celebrate",
    expression: "happy",
    motif: "risingBars",
  };
  return <AntidoteThumbnail {...(config ?? fallback)} />;
};
