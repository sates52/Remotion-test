import { interpolate } from "remotion";

/**
 * conceptMotion.ts — AUTHORED icon behaviours (art.json `conceptMotion`, 2026-10-19).
 *
 * Every function is a pure function of the motif's LOCAL frame (its Sequence clock)
 * and the spec: no Math.random, no wall time — the same frame always draws the same
 * picture, on every render worker.
 *
 * Default behaviour is untouched: without `motion` the compass needle sways ±14°
 * exactly as before. The spin exists only when the storyboard author asked for it
 * ("the compass spins uselessly") and starts on a word-synced cue.
 */

/** The compass needle's default sway (the pre-2026-10-19 drawing, unchanged). */
export const compassSway = (frame: number): number => interpolate(Math.sin(frame * 0.08), [-1, 1], [-14, 14]);

const SPIN_RAMP = 10; // frames from the cue to full speed
const SPIN_SPEED = 26; // degrees per frame at full speed (~2.2 turns/s at 30 fps)
const SPIN_JERK = 35; // degrees of back-and-forth on top: it hunts, never settles

/**
 * Needle angle in degrees.
 *   frame    — the motif's local frame (useCurrentFrame inside its Sequence)
 *   motion   — spec.motion ("spin" or undefined)
 *   cueFrame — local frame the spin starts (spec.motionAt - spec.at)
 * Before the cue (and always, without `motion`) it is the default sway. From the cue it
 * accelerates into a fast spin with a hunting jerk and never comes to rest. Continuous
 * at the cue (no jump).
 */
export function compassNeedleAngle(frame: number, motion?: string, cueFrame = 0): number {
  if (motion !== "spin" || frame < cueFrame) return compassSway(frame);
  const t = frame - cueFrame;
  const travel = t < SPIN_RAMP ? (t * t) / (2 * SPIN_RAMP) : t - SPIN_RAMP / 2;
  return compassSway(cueFrame) + SPIN_SPEED * travel + SPIN_JERK * Math.sin(t * 0.45) * Math.min(1, t / SPIN_RAMP);
}

/** The local cue frame of a motif spec: motionAt is scene-relative like `at`. */
export const motionCueLocal = (spec: { at?: number; motionAt?: number }): number =>
  Math.max(0, (spec.motionAt ?? spec.at ?? 0) - (spec.at ?? 0));
