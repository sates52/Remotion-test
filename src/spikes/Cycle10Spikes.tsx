/**
 * Cycle 10 spikes (experiment branch dev/c10) — not used by any book.
 *   Spike-IK      SPIKE B: the existing Everyman rig driven by two-bone IK + a body step (ik.ts reachPlan / reachAt):
 *                 the scene decides where the object is (a high shelf, at the knees) and the hand goes THERE —
 *                 anticipation (draw back) → reach → contact on the cue → follow-through; the object attaches to the hand.
 *   Spike-Hybrid  SPIKE C: one film, three renderers chosen per scene (lib/scene-router.js): an Antidote causal diagram,
 *                 an Antidote world-state deed, a Vox period image — each engine draws its own scene in a <Sequence>.
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Everyman } from "../engines/antidote/characters/Everyman";
import { DEFAULT_VARIANT } from "../engines/antidote/schema";
import type { HandProp } from "../engines/antidote/schema";
import { pose } from "../engines/antidote/movements";
import { HeldProp } from "../engines/antidote/handprops";
import { reachAt, reachPlan } from "../engines/antidote/ik";
import { AntidoteBook } from "../engines/antidote";
import { VoxBook } from "../engines/vox";

const W = 540; // rendered rig width (px): rig units × W/400
const K = W / 400;

const Reach: React.FC<{ target: { x: number; y: number }; prop: HandProp; furniture: "shelf" | "floor"; cue: number; label: string }> = ({ target, prop, furniture, cue, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plan = reachPlan(target);
  // the body steps toward the object during the anticipation and the reach (root motion), then stands
  const stepK = Math.max(0, Math.min(1, (frame - (cue - 42)) / 42));
  const step = plan.stepX * (stepK < 0.5 ? 2 * stepK * stepK : 1 - Math.pow(-2 * stepK + 2, 2) / 2);
  const arm = reachAt({ x: target.x - plan.stepX, y: target.y }, frame, cue);
  const bring = Math.max(0, Math.min(1, (frame - cue - 12) / 24));
  const held = { armR: arm.armR + (-6 - arm.armR) * bring, elbowR: arm.elbowR + (82 - arm.elbowR) * bring };
  const base = pose("idle", frame, fps);
  const p = { ...base, armR: arm.contact ? held.armR : arm.armR, elbowR: arm.contact ? held.elbowR : arm.elbowR, take: arm.contact ? 1 : 0, gazeX: 0.7, gazeY: target.y < 322 ? -0.4 : 0.6 };
  const left = 960 - W / 2 - 160;
  return (
    <AbsoluteFill style={{ background: "#EFE6D2" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820 + 900 * K - 820, height: 4 }} />
      {/* the world: the object where the scene says it is (rig units of the figure's START position) */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={60 + 896 * K} width={1920} height={1080} fill="#D9CBAE" />
        <g transform={`translate(${left} 60) scale(${K})`}>
          {furniture === "shelf" ? <rect x={target.x - 80} y={target.y + 42} width={160} height={14} rx={4} fill="#7A4E26" stroke="#4A2E14" strokeWidth={4} /> : <ellipse cx={target.x} cy={896} rx={70} ry={12} fill="#000" opacity={0.16} />}
          {!arm.contact ? <g transform={`translate(${target.x} ${target.y}) scale(0.82)`}><HeldProp prop={prop} ink="#26241F" accent="#C0392B" /></g> : null}
        </g>
      </svg>
      <div style={{ position: "absolute", left: left + step * K, top: 60 }}>
        <Everyman variant={DEFAULT_VARIANT} pose={p} body="full" width={W} holds={arm.contact ? prop : undefined} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 40, font: "600 34px sans-serif", color: "#4A2E14" }}>{label}</div>
    </AbsoluteFill>
  );
};

export const SpikeIK: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={120}><Reach target={{ x: 430, y: 250 }} prop="book" furniture="shelf" cue={70} label="spike B: step + IK to a high shelf" /></Sequence>
    <Sequence from={120} durationInFrames={120}><Reach target={{ x: 470, y: 840 }} prop="briefcase" furniture="floor" cue={70} label="spike B: step + IK to the floor (out of the arm's reach: needs a crouch)" /></Sequence>
  </>
);

export const SpikeHybrid: React.FC<{ causal: any; deed: any; vox: any }> = ({ causal, deed, vox }) => {
  const d1 = causal?.meta?.durationInFrames ?? 300, d2 = deed?.meta?.durationInFrames ?? 300;
  return (
    <>
      <Sequence from={0} durationInFrames={d1}><AntidoteBook config={causal} /></Sequence>
      <Sequence from={d1} durationInFrames={d2}><AntidoteBook config={deed} /></Sequence>
      <Sequence from={d1 + d2} durationInFrames={vox?.meta?.durationInFrames ?? 260}><VoxBook config={vox} /></Sequence>
    </>
  );
};
