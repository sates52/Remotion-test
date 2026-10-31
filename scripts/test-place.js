#!/usr/bin/env node
// CHARACTER ACTION 3.0 — place (src/engines/antidote/movements.ts "place"), 2026-10-29. The reverse of `take`: the
// object is in the hand at the chest; on the cue word it goes out to the rest position and is let go (take -> 0: the rig
// draws it resting there), the empty hand comes back, the object STAYS. Blind (don-t-believe 77-81, 3 readers): doer /
// action / target YYY, change YYY, kept YPP vs the authored seated pose NNN.
// Run: node scripts/test-place.js
const fs = require("fs");
const path = require("path");
let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && info ? `  (${String(info).slice(0, 300)})` : ""}`); if (!ok) failed++; };
const REPO = path.join(__dirname, "..");
const M = require("../src/engines/antidote/movements.ts");
const { charAction, handProp } = require("../src/engines/antidote/schema.ts");
const CUE = 60;
const P = (f) => M.pose("place", f, 30, CUE);

t("schema: place is an action; wrench is a hand prop", charAction.safeParse("place").success && handProp.safeParse("wrench").success);
t("before the cue: the object is in hand at the chest (take = 1) — exactly take's end pose", P(0).take === 1 && P(CUE - 1).take === 1 && P(0).armR === M.pose("take", 1000, 30, CUE).armR && P(0).elbowR === M.pose("take", 1000, 30, CUE).elbowR);
let released = -1;
for (let f = CUE; f < CUE + 120; f++) if (P(f).take === 0) { released = f; break; }
t("released once the arm reaches the rest position (take -> 0 at full reach, not before)", released === CUE + M.PLACE_OUT && P(released).armR === M.pose("reach", CUE, 30).armR, String(released));
t("after the release the object stays down (take stays 0 for good)", Array.from({ length: 200 }, (_, k) => P(released + k).take).every((x) => x === 0));
t("the empty hand comes back to the side", P(CUE + M.PLACE_OUT + M.PLACE_HOLD + M.PLACE_BACK + 5).armR === -8);
const maxStep = (act) => { let m = 0; for (let f = 1; f < CUE + 150; f++) m = Math.max(m, Math.abs(M.pose(act, f, 30, CUE).armR - M.pose(act, f - 1, 30, CUE).armR)); return m; };
// a CONTINUED place keeps the cue it already passed (cycle 6: it replayed — the object came back into the hand and was
// set down a second time on the next beat)
{
  const Cn = require("../src/engines/antidote/continuity.ts");
  const { shotPreset } = require("../src/engines/antidote/shots.ts");
  const sc = (id, from, actionAt, cont) => ({ id, fromFrame: from, durationFrames: 200, shot: "medium", transition: { type: "cut", frames: 0 }, props: [], ...(cont ? { continueFromPrev: true } : {}),
    characters: [{ id: "a-" + id, identity: "ana", role: "ana", enter: "none", action: "place", holds: "cup", actionAt }, { id: "b-" + id, identity: "ben", role: "ben", enter: "none", action: "idle" }] });
  const plan = Cn.planContinuity([sc("p1", 0, 80, false), sc("p2", 200, 1, true)], (shot) => !shotPreset(shot).dropsCast);
  const c = plan[1].chars[0];
  // as Scene: without a carried cue the beat falls back to its own actionAt (1) on the carried clock — the replay
  const local = (fr) => M.pose("place", fr + c.poseClock, 30, c.cue != null ? c.cue : 1 + c.poseClock);
  t("continued place: the carried cue is the first beat's (80), not replayed", c.carried && c.cue === 80, JSON.stringify(c));
  t("continued place: the object stays down on every frame of the next beat", [0, 1, 20, 60, 199].every((fr) => local(fr).take === 0), JSON.stringify([0, 20].map((fr) => local(fr).take)));
}
t("the arm moves no faster than take's own reach (no snap)", maxStep("place") <= maxStep("take"), maxStep("place") + " vs " + maxStep("take"));
const SC = fs.readFileSync(path.join(REPO, "src/engines/antidote/components/Scene.tsx"), "utf8");
t("renderer: the held object clears the captions while in hand, like take", /\(spec\.action === "take" \|\| spec\.action === "place"\) && p\.take === 1/.test(SC));
const SB = fs.readFileSync(path.join(__dirname, "storyboard.js"), "utf8");
t("merge: place needs holds and reads actionCue", /action "place" needs "holds"/.test(SB) && /"take", "embrace", "lift", "drink", "leave", "flee", "place"/.test(SB));
const PL = fs.readFileSync(path.join(__dirname, "plan-antidote.js"), "utf8");
t("planner: the place moment is anchored on the actionCue word", /L\.action === "place"\) && a\.actionCue/.test(PL));
const RC = fs.readFileSync(path.join(__dirname, "readcheck.js"), "utf8");
t("readcheck: the blind text reader is told the object is set down and stays", /sets the \$\{b\.holds\} down in front of them/.test(RC));
console.log(failed ? `\n${failed} FAILED` : "\nall place checks passed");
process.exit(failed ? 1 : 0);
