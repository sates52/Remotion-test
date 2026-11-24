import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Beat, Caption, VoxArtDirection } from "./schema";
import { SKIN_FONT } from "../antidote/components/skin";

/**
 * CINEMA MODES (2026-11-24 pilot, opt-in by meta.artDirection + beat.type "cinemaPanel" | "cinemaSplit" | "cinemaStatement").
 * The book's own art-locked Flux scenes fill the frame (no shared paper, no desk, no rail): a slow camera move per beat
 * (one direction, eased, never a loop), an isolated object on its own plane (parallax), a split that compares two
 * times or places, and a sentence set over the scene instead of on a blank card. Every image is multiplied onto the
 * book's paper colour, so the white margins Flux leaves become the same warm paper in every scene (one hand, one sheet).
 */
type Cam = "pushIn" | "pullOut" | "panLeft" | "panRight";
type Cut = { path: string; x?: number; y?: number; w?: number; at?: number; from?: "below" | "right" | "left" | "fade" };
type Side = { path?: string; cut?: Cut; bg?: string; label?: string };
export type CinemaProps = { camera?: Cam; focus?: [number, number]; cut?: Cut; card?: string; by?: string; side?: "left" | "right"; right?: Side; leftLabel?: string; at?: number; cardTop?: number; cardWidth?: number; cardInset?: number };

export const ArtContext = React.createContext<VoxArtDirection>({ paper: "#EDE6D8", ink: "#1C1814", accent: "#B5653F" });
const ease = Easing.bezier(0.33, 0, 0.67, 1);

function camera(cam: Cam | undefined, t: number) {
  const k = ease(Math.min(1, Math.max(0, t)));
  switch (cam) {
    case "pullOut": return { s: interpolate(k, [0, 1], [1.2, 1.09]), x: 0 };
    case "panLeft": return { s: 1.14, x: interpolate(k, [0, 1], [3, -3]) };
    case "panRight": return { s: 1.14, x: interpolate(k, [0, 1], [-3, 3]) };
    default: return { s: interpolate(k, [0, 1], [1.09, 1.2]), x: 0 };
  }
}

const Plate: React.FC<{ path: string; cam?: Cam; focus?: [number, number]; dur: number; start?: number }> = ({ path, cam, focus = [50, 45], dur, start = 0 }) => {
  const frame = useCurrentFrame();
  const art = React.useContext(ArtContext);
  const c = camera(cam, (frame - start) / Math.max(1, dur - start));
  return (
    <AbsoluteFill style={{ background: art.paper, overflow: "hidden" }}>
      <Img src={staticFile(path)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        transformOrigin: `${focus[0]}% ${focus[1]}%`, transform: `translateX(${c.x}%) scale(${c.s})`, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

const CutLayer: React.FC<{ cut: Cut; dur: number; cam?: Cam }> = ({ cut, dur, cam }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.round((cut.at ?? 0.25) * dur);
  const s = spring({ frame: frame - at, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
  const c = camera(cam, frame / dur);
  // its own plane: it moves 60 % more than the scene behind it, so the depth reads without a 3D engine
  const px = c.x * 1.6, ps = 1 + (c.s - 1) * 1.6;
  const from = cut.from || "below";
  const dx = from === "right" ? (1 - s) * 30 : from === "left" ? -(1 - s) * 30 : 0, dy = from === "below" ? (1 - s) * 22 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile(cut.path)} alt="" style={{ position: "absolute", left: `${cut.x ?? 66}%`, top: `${cut.y ?? 52}%`, width: cut.w ?? 520,
        transform: `translate(-50%,-50%) translate(${px + dx}%, ${dy}%) scale(${ps})`, opacity: from === "fade" ? s : Math.min(1, s * 1.4),
        filter: "drop-shadow(0 26px 30px rgba(0,0,0,0.45))" }} />
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const art = React.useContext(ArtContext);
  return (
    <AbsoluteFill style={{ background: art.ink }}>
      <AbsoluteFill style={{ opacity: interpolate(frame, [0, 9], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const cin = (beat: Beat) => ((beat.props as { cinema?: CinemaProps }).cinema || {}) as CinemaProps;
const img = (beat: Beat, i = 0) => beat.images[i]?.path;

export const CinemaPanel: React.FC<{ beat: Beat }> = ({ beat }) => {
  const c = cin(beat), p = img(beat);
  if (!p) return null;
  return (
    <FadeIn>
      <Plate path={p} cam={c.camera} focus={c.focus} dur={beat.durationFrames} />
      {c.cut ? <CutLayer cut={c.cut} dur={beat.durationFrames} cam={c.camera} /> : null}
    </FadeIn>
  );
};

const Label: React.FC<{ text?: string; side: "left" | "right" }> = ({ text, side }) => {
  const art = React.useContext(ArtContext);
  if (!text) return null;
  return <div style={{ position: "absolute", top: 70, [side]: 70, fontFamily: SKIN_FONT.serif, fontSize: 32, letterSpacing: 6, color: art.paper,
    textTransform: "uppercase", background: `${art.ink}D9`, padding: "10px 20px 8px", borderBottom: `3px solid ${art.accent}` }}>{text}</div>;
};

export const CinemaSplit: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const art = React.useContext(ArtContext);
  const c = cin(beat), p = img(beat), r = c.right || {};
  const dur = beat.durationFrames, at = Math.round((c.at ?? 0.3) * dur);
  const wipe = interpolate(frame, [at, at + 18], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  if (!p) return null;
  return (
    <FadeIn>
      <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
        <Plate path={p} cam="panRight" focus={c.focus} dur={dur} />
        <Label text={c.leftLabel} side="left" />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${50 + wipe / 2}%)` }}>
        {r.path ? <Plate path={r.path} cam="panLeft" dur={dur} start={at} /> : <AbsoluteFill style={{ background: r.bg || art.ink }} />}
        {r.cut ? <CutLayer cut={{ x: 75, y: 54, w: 560, ...r.cut, at: (at + 8) / dur }} dur={dur} cam="pushIn" /> : null}
        <Label text={r.label} side="right" />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${50 + wipe / 2}% - 4px)`, width: 8, background: art.ink, boxShadow: `0 0 0 2px ${art.accent}`, opacity: wipe < 100 ? 1 : 0 }} />
    </FadeIn>
  );
};

export const CinemaStatement: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const art = React.useContext(ArtContext);
  const c = cin(beat), p = img(beat), side = c.side || "left";
  const words = (c.card || beat.props.onScreenText || beat.props.text || "").split(/\s+/).filter(Boolean);
  const dur = beat.durationFrames, start = Math.round(0.12 * dur), span = Math.max(12, Math.round(0.35 * dur));
  const rule = spring({ frame: frame - start + 6, fps, config: { damping: 24 } });
  return (
    <FadeIn>
      {p ? <Plate path={p} cam={c.camera || "pushIn"} focus={c.focus || [side === "left" ? 70 : 30, 45]} dur={dur} /> : null}
      <AbsoluteFill style={{ background: `linear-gradient(${side === "left" ? 90 : 270}deg, ${art.ink}F2 0%, ${art.ink}CC 34%, ${art.ink}00 62%)` }} />
      <div style={{ position: "absolute", top: `${c.cardTop ?? 50}%`, [side]: c.cardInset ?? 130, width: c.cardWidth ?? 760, transform: "translateY(-50%)" }}>
        <div style={{ width: 120 * rule, height: 5, background: art.accent, marginBottom: 34 }} />
        <div style={{ fontFamily: SKIN_FONT.serif, fontSize: 76, lineHeight: 1.14, color: art.paper, fontStyle: "italic" }}>
          {words.map((w, i) => {
            const t = start + (i / Math.max(1, words.length)) * span;
            return <span key={i} style={{ opacity: interpolate(frame, [t, t + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{w} </span>;
          })}
        </div>
        {c.by ? <div style={{ marginTop: 30, fontFamily: SKIN_FONT.serif, fontSize: 32, letterSpacing: 4, color: art.accent, textTransform: "uppercase",
          opacity: interpolate(frame, [start + span, start + span + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>— {c.by}</div> : null}
      </div>
    </FadeIn>
  );
};

/** subtitles for a cinema film: no box over the picture — a soft band of the book's ink at the foot, the book's serif */
export const CinemaCaptions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const frame = useCurrentFrame();
  const art = React.useContext(ArtContext);
  const active = captions.find((c) => frame >= c.startFrame && frame < c.endFrame);
  return (
    <AbsoluteFill style={{ zIndex: 55, pointerEvents: "none", justifyContent: "flex-end", alignItems: "center" }}>
      <AbsoluteFill style={{ top: "auto", height: 330, background: `linear-gradient(180deg, ${art.ink}00 0%, ${art.ink}D0 42%, ${art.ink}F5 100%)` }} />
      {active ? (
        <div style={{ position: "relative", maxWidth: 1440, marginBottom: 56, textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px 13px" }}>
          {active.words.map((w, i) => {
            const cur = frame >= w.s && frame < w.e, said = frame >= w.s;
            return <span key={i} style={{ fontFamily: SKIN_FONT.serif, fontSize: 46, fontWeight: 600, color: cur ? art.accent : said ? "#FFFDF7" : `${art.paper}D9`,
              textShadow: "0 2px 3px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.6)" }}>{w.w}</span>;
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const CINEMA_SCENES: Record<string, React.FC<{ beat: Beat }>> = { cinemaPanel: CinemaPanel, cinemaSplit: CinemaSplit, cinemaStatement: CinemaStatement };
