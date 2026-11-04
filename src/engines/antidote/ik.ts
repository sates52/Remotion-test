/**
 * ik.ts — two-bone INVERSE KINEMATICS for the Everyman right arm (cycle 10 spike B, experiment branch dev/c10).
 *
 * Today every action is a hand-tuned angle table (movements.ts): the hand goes where the table says, so an object
 * the narration puts on a high shelf, on the floor or in someone else's hand is drawn where the RIG can reach, not
 * where it is (the take stand, the place table, the hand-over that slides whole bodies by a constant). This solves
 * the shoulder + elbow angles that put the hand-object anchor ON a target point (rig units), so the scene decides
 * where the object is and the arm goes there. Pure: same chain as Everyman.tsx (shoulder 304,322 → elbow 304,410 →
 * object anchor 304,462 at rest; SVG rotate() is clockwise-positive).
 */
export const SHOULDER = { x: 304, y: 322 };
export const UPPER = 88; // shoulder → elbow
export const FORE = 52; // elbow → the hand-object anchor (where HeldProp sits)

const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** where the anchor lands for given (shoulder, elbow) angles in degrees — the forward model the renderer draws */
export function anchorOf(armR: number, elbowR: number): { x: number; y: number } {
  const a = rad(armR), e = rad(armR + elbowR);
  return { x: SHOULDER.x - UPPER * Math.sin(a) - FORE * Math.sin(e), y: SHOULDER.y + UPPER * Math.cos(a) + FORE * Math.cos(e) };
}

/**
 * The (armR, elbowR) that put the anchor on `target`; an unreachable target is clamped to full reach along its
 * direction (and reported). `bend` +1 = elbow down/out (natural for a reach in front), −1 = the other solution.
 */
export function solveArm(target: { x: number; y: number }, bend: 1 | -1 = 1): { armR: number; elbowR: number; reached: boolean; error: number } {
  const dx = target.x - SHOULDER.x, dy = target.y - SHOULDER.y;
  const d0 = Math.hypot(dx, dy);
  const d = Math.min(Math.max(d0, Math.abs(UPPER - FORE) + 1e-6), UPPER + FORE - 1e-6);
  const phi = Math.atan2(-dx, dy); // direction of the target in the rig's rotation convention
  // law of cosines: angle at the shoulder between the upper arm and the target line, and the elbow's bend
  const cosA = (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const cosE = (UPPER * UPPER + FORE * FORE - d * d) / (2 * UPPER * FORE);
  const E = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosE)));
  const armR = deg(phi + bend * A), elbowR = deg(-bend * E);
  const p = anchorOf(armR, elbowR);
  return { armR, elbowR, reached: d0 <= UPPER + FORE, error: Math.hypot(p.x - target.x, p.y - target.y) };
}

/**
 * WHOLE-BODY reach (measured need: the arm reaches only UPPER + FORE = 140 rig px, so a shelf, the knees or a partner's
 * hand are out of reach for the arm alone): the body STEPS horizontally (root motion, rig px) until the target is at
 * 92 % of the arm's reach, then the arm solves. Returns the step and the angles; the error is measured after the step.
 */
export function reachPlan(target: { x: number; y: number }): { stepX: number; armR: number; elbowR: number; error: number } {
  const R = (UPPER + FORE) * 0.92;
  const dy = target.y - SHOULDER.y;
  let stepX = 0;
  const dx0 = target.x - SHOULDER.x;
  if (Math.hypot(dx0, dy) > R) {
    // a vertical gap beyond reach cannot be stepped away (a crouch / a stretch would be next): step to the best x
    const need = Math.sqrt(Math.max(0, R * R - dy * dy));
    stepX = dx0 > 0 ? dx0 - need : dx0 + need;
  }
  const s = solveArm({ x: target.x - stepX, y: target.y });
  return { stepX, armR: s.armR, elbowR: s.elbowR, error: s.error };
}

/** anticipation → action → follow-through toward a target: a small pull-back, the reach with a slight overshoot,
 *  the settle on contact (frames relative to the contact frame `cue`) → angles at `frame`. */
export function reachAt(target: { x: number; y: number }, frame: number, cue: number, rest = { armR: -8, elbowR: 0 }): { armR: number; elbowR: number; contact: boolean } {
  const goal = solveArm(target);
  const pre = { armR: rest.armR + 10, elbowR: rest.elbowR + 30 }; // anticipation: the arm draws back a little
  const ease = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  if (frame < cue - 30) { const k = ease((frame - (cue - 42)) / 12); return { armR: lerp(rest.armR, pre.armR, k), elbowR: lerp(rest.elbowR, pre.elbowR, k), contact: false }; }
  if (frame < cue) { const k = ease((frame - (cue - 30)) / 30); return { armR: lerp(pre.armR, goal.armR, k), elbowR: lerp(pre.elbowR, goal.elbowR, k), contact: false }; }
  // follow-through: 4° past the goal and back over 10 frames, in contact from the cue
  const o = Math.sin(Math.min(1, (frame - cue) / 10) * Math.PI) * 4;
  return { armR: goal.armR - o, elbowR: goal.elbowR, contact: true };
}
