import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * ProducerNote — the producer's own view of the book, on screen once near the start (2026-11-20).
 *
 * The operator reads the alternatives the Step 0 agent writes for him in Turkish, approves or rewrites one, and that
 * sentence - his decision - is recorded in book.json (`take`: his Turkish words + the English the film uses). It goes
 * three ways: into the NotebookLM prompt (the hosts argue with it), into the description, and here: a card for a few
 * seconds in the first half-minute, so the film says in its opening that a person stands behind this reading.
 * A film without a note draws nothing. One fade in, one fade out; nothing moves. Engine-agnostic (Antidote and Vox).
 */
const START_S = 14, HOLD_S = 6.5, FADE = 10;

export const ProducerNote: React.FC<{ note?: string | null; accent?: string; font?: string }> = ({ note, accent = "#E04329", font = "'Arial Black', Arial, sans-serif" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = String(note || "").trim();
  if (!text) return null;
  const start = Math.round(START_S * fps), hold = Math.round(HOLD_S * fps), local = frame - start;
  if (local < 0 || local >= hold) return null;
  const op = Math.min(
    interpolate(local, [0, FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(local, [hold - FADE, hold], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <AbsoluteFill style={{ zIndex: 80, pointerEvents: "none" }}>
      {/* wide and low: two lines at most (the note is ≤ 180 characters), so it ends above the name plates of a told
          stage and the tag of a Vox card (first stills, 2026-11-20: three lines at 860 px sat on both) */}
      <div style={{ position: "absolute", left: 56, top: 122, maxWidth: 1300, opacity: op, background: "rgba(17,19,24,0.92)", borderLeft: `10px solid ${accent}`, padding: "11px 26px 13px 22px", boxShadow: "0 12px 28px rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: '"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace', fontWeight: 800, fontSize: 17, letterSpacing: 3, color: accent, marginBottom: 5 }}>PRODUCER'S NOTE</div>
        <div style={{ fontFamily: font, fontWeight: 700, fontSize: 26, lineHeight: 1.2, color: "#F4F1EA" }}>{`“${text.slice(0, 180)}”`}</div>
      </div>
    </AbsoluteFill>
  );
};
