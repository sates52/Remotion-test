/**
 * RejectedMark.tsx — the red ✗ over a REJECTED claim (10x pilot C, 2026-10-26). Timing: ../rejected.ts.
 * Scene.tsx greys the claim's picture (rejectedFilter) and draws this mark on top, outside the grey filter.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { rejectedStrokes } from "../rejected";

export { rejectedFilter } from "../rejected";

const RED = "#D7263D";
const LEN = Math.hypot(760, 760); // each arm: (580,120) -> (1340,880)

export const RejectedMark: React.FC<{ local: number }> = ({ local }) => {
  if (local < 0) return null;
  const [a, b] = rejectedStrokes(local);
  // the ✗ spans the middle of the frame (where the claim's figure and icon stand), clear of the caption band
  const arm = (x1: number, y1: number, x2: number, y2: number, p: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={RED} strokeWidth={64} strokeLinecap="round" strokeDasharray={`${LEN} ${LEN}`} strokeDashoffset={LEN * (1 - p)} opacity={p > 0 ? 0.92 : 0} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {arm(580, 120, 1340, 880, a)}
        {arm(1340, 120, 580, 880, b)}
      </svg>
    </AbsoluteFill>
  );
};
