#!/usr/bin/env node
// SPIKE B (cycle 10): two-bone IK on the Everyman arm vs today's fixed angle tables. Measures, in rig units, how far
// the hand-object anchor lands from where a scene needs the object (contact error) for the targets narration asks
// for: a high shelf / wall hook, chest height in front, a table beside, low (a bag at the knees), a partner's hand.
// Today's rig can only reach its own fixed points (take stand, place table, hold at the chest). Run:
//   node scripts/test-ik-spike.js            (prints the table, checks the solver)
const IK = require("../src/engines/antidote/ik.ts");
const M = require("../src/engines/antidote/movements.ts");
let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "✓" : "✗"} ${name}${!ok && info !== undefined ? `  (${JSON.stringify(info)})` : ""}`); if (!ok) failed++; };

// the fixed points today's actions put the object at (rig units, forward model of the same chain)
const fixed = {
  "take (stand at arm's length)": IK.anchorOf(M.TAKE_REST_ARM, require("../src/engines/antidote/movements.ts").TAKE_REST_ELBOW ?? 0),
  "place (table beside)": IK.anchorOf(M.PLACE_ARM, 0),
  "hold (at the chest)": IK.anchorOf(-6, 82),
};
// where narration puts things (rig units: shoulder 304,322; bust ground 600)
const targets = {
  "wall hook / high shelf": { x: 430, y: 250 },
  "chest height, in front": { x: 420, y: 380 },
  "table beside": { x: 397, y: 427 },
  "low, at the knees": { x: 380, y: 452 },
  "partner's hand (twoShot)": { x: 445, y: 400 },
};
console.log("\ncontact error (rig px) — the nearest point today's actions can put the hand vs IK:");
const rows = [];
for (const [name, T] of Object.entries(targets)) {
  const best = Object.entries(fixed).map(([k, p]) => [k, Math.hypot(p.x - T.x, p.y - T.y)]).sort((a, b) => a[1] - b[1])[0];
  const ik = IK.solveArm(T), wb = IK.reachPlan(T);
  rows.push({ target: name, todayBest: `${best[0]}: ${best[1].toFixed(0)} px`, armOnlyIK: `${ik.error.toFixed(1)} px${ik.reached ? "" : " (beyond reach)"}`, stepPlusIK: `${wb.error.toFixed(2)} px (step ${wb.stepX.toFixed(0)})` });
}
console.table(rows);

// the solver is exact on reachable targets, never NaN, and its forward model is the renderer's chain
for (const [name, T] of Object.entries(targets)) {
  const s = IK.reachPlan(T);
  t(`step + IK reaches "${name}" within 0.5 px`, s.error < 0.5, s);
}
const arm = Object.values(targets).filter((T) => IK.solveArm(T).reached).length;
t(`measured: the arm alone reaches ${arm}/${Object.keys(targets).length} narration targets (UPPER+FORE = ${IK.UPPER + IK.FORE} px) — contact needs the body to move`, arm < Object.keys(targets).length);
t("forward model = the place table point today (PLACE_REST from PLACE_ARM, straight arm)", Math.hypot(IK.anchorOf(M.PLACE_ARM, 0).x - M.PLACE_REST.x, IK.anchorOf(M.PLACE_ARM, 0).y - M.PLACE_REST.y) < 2, IK.anchorOf(M.PLACE_ARM, 0));
const far = IK.solveArm({ x: 900, y: 322 });
t("an unreachable target is clamped (reported, not NaN)", !far.reached && Number.isFinite(far.armR) && Number.isFinite(far.elbowR));
let maxJump = 0, prev = null;
for (let f = 0; f < 80; f++) { const a = IK.reachAt(targets["wall hook / high shelf"], f, 50); if (prev) maxJump = Math.max(maxJump, Math.abs(a.armR - prev.armR), Math.abs(a.elbowR - prev.elbowR)); prev = a; }
t("anticipation → reach → follow-through is continuous (no frame jumps over 12°)", maxJump < 12, maxJump);
t("contact from the cue, not before", !IK.reachAt(targets["table beside"], 49, 50).contact && IK.reachAt(targets["table beside"], 50, 50).contact);
console.log(failed ? `\n${failed} FAILED` : "\nall IK spike checks passed");
process.exit(failed ? 1 : 0);
