/**
 * liftLayout.ts — where a LIFT happens (10x pilot B, 2026-10-26). Pure, so node can test it.
 *
 * cast[0] `lift` lifts cast[1] `lifted` on the author's cue, carries her to the beat's icon (the destination: a
 * bathtub, a bed, a chair…) and sets her down IN it. The lifter first steps up to her (approach), both then move by
 * `carry` (her slot → the destination); the destination stands on the floor beyond her, in the lifter's facing
 * direction (the carry reads as forward, never a backwards shuffle). Full-body rig: 400×900 box centred on the slot,
 * feet at rig y 876.
 */
export const LIFT_GAP = 230;   // rig px between the two centres when the lifter's arms are under her
export const LIFT_DEST = 520;  // rig px from her slot to the destination's centre
export const RIG_FLOOR = 876, RIG_MID = 450, ICON_BOX = 520;

type Stage = { x: number; y: number; scale: number; flip?: boolean };

export function liftLayout(lead: Stage, partner: Stage) {
  const dir = Math.sign(partner.x - lead.x) || 1;
  const approach = partner.x - dir * LIFT_GAP * partner.scale - lead.x;
  const destX = partner.x + dir * LIFT_DEST * partner.scale;
  const floorY = partner.y + (RIG_FLOOR - RIG_MID) * partner.scale;
  const destScale = 1.15 * partner.scale; // big enough to hold a seated adult (v1 at 0.95 read as a toy tub)
  // the icon's own drawing sits low in its 520 box; its base on the floor line
  const destY = floorY - 0.36 * ICON_BOX * destScale;
  return { dir, approach, carry: destX - partner.x, dest: { x: destX, y: destY, scale: destScale }, floorY };
}

/** cast[0] lifts cast[1] (the planner pairs `lift` with `lifted`) */
export const isLift = (bodies: { action?: string }[]): boolean => bodies.length === 2 && bodies[0].action === "lift" && bodies[1].action === "lifted";
