import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Everyman } from "../characters/Everyman";
import { Motif } from "../motifs";
import { pose } from "../movements";
import type { CharacterSpec, PropSpec, VariantSpec } from "../schema";
import { thoughtLayout, type Box } from "../thoughtLayout";

/**
 * ThoughtBubble — Motive 1.0 (2026-10-29): the INNER reason of a person, drawn over their head while the body and face
 * show the outward act. One relation only (inside -> outside), no words, no strike-through, no relabel: Mechanism 4.0's
 * holdout showed that a struck or renamed tag reads as "the first name was wrong" and that every extra causal element
 * blurs the relation.
 *   thought.expression -> a small copy of the SAME person wearing the inner face (the inside differs from the outside)
 *   thought.concept    -> the icon of the reason (a scene icon or the book's own motif)
 * Geometry is pure (thoughtLayout) so tests can check it stays inside the frame.
 */

export const ThoughtBubble: React.FC<{ spec: CharacterSpec; head: { x: number; y: number }; scale: number; faceRight: boolean; mirror: boolean; variant: VariantSpec; accent: string; ink: string; avoid?: Box[] }> = ({ spec, head, scale, faceRight, mirror, variant, accent, ink, avoid = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const th = spec.thought;
  if (!th || (!th.expression && !th.concept)) return null;
  const at = th.at ?? 12;
  const rel = frame - at;
  if (rel < 0) return null;
  const L = thoughtLayout(head, scale, faceRight, avoid);
  const pop = (d: number) => spring({ frame: rel - d, fps, config: { damping: 13, stiffness: 160, mass: 0.7 } });
  const s = pop(8);
  const inner = L.r * 0.86;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        {L.dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r * pop(i * 3)} fill="#FFFFFF" stroke={ink} strokeWidth={4} />
        ))}
        <g transform={`translate(${L.cx} ${L.cy}) scale(${s})`}>
          {/* a cloud: an ellipse with soft lobes, the universal "thinks / feels inside" shape */}
          {[[-0.78, -0.18, 0.46], [-0.38, -0.62, 0.5], [0.22, -0.66, 0.52], [0.72, -0.26, 0.48], [0.62, 0.38, 0.46], [0, 0.6, 0.5], [-0.62, 0.42, 0.44]].map(([x, y, r], i) => (
            <circle key={i} cx={x * L.r} cy={y * L.r} r={r * L.r} fill="#FFFFFF" stroke={ink} strokeWidth={5} />
          ))}
          <ellipse cx={0} cy={0} rx={L.r * 1.12} ry={L.r * 0.92} fill="#FFFFFF" />
        </g>
      </svg>
      {th.expression ? (
        // the same person, inner face: head and shoulders inside a round window
        <div style={{ position: "absolute", left: L.cx - inner, top: L.cy - inner, width: inner * 2, height: inner * 2, borderRadius: "50%", overflow: "hidden", transform: `scale(${s})`, transformOrigin: "center" }}>
          {(() => {
            const w = inner * 2 * 1.5; // rig px 400 -> w; the head (r ~120 rig px) fills about 60% of the window
            const u = w / 400;
            return (
              <div style={{ position: "absolute", left: inner - 200 * u, top: inner - 175 * u, transform: mirror ? "scaleX(-1)" : undefined, transformOrigin: `${200 * u}px ${175 * u}px` }}>
                <Everyman variant={{ ...variant, expression: th.expression }} pose={pose("idle", 100000, fps)} width={w} body="bust" accent={accent} />
              </div>
            );
          })()}
        </div>
      ) : (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${L.cx}px, ${L.cy}px) scale(${s}) translate(${-L.cx}px, ${-L.cy}px)` }}>
          <Motif spec={{ type: th.concept as PropSpec["type"], x: L.cx, y: L.cy, scale: (inner * 1.7) / 520, at: 0, enter: "none" } as PropSpec} accent={accent} ink={ink} />
        </div>
      )}
    </>
  );
};
