#!/usr/bin/env node
/**
 * test-requirement-staging.js — P1.5 tests (operator implementation sign-off scope).
 *   node scripts/test-requirement-staging.js
 *
 * Scope locked by the operator: solo SAFE → diorama · two-character SAFE → closeUp
 * (a fallback acceptance ONLY, never "better staging" in general) · copy-bearing
 * absence → strategy-aware strike · copy-less absence → shrink/closein arc on an
 * EXISTING motif · concrete → the existing icon-shot path · state → expression
 * lever · authored staging → LOCK (UNMET stays visible) · firewall untouched ·
 * `_visualStrategy.staging` plan tag mandatory · NO invented capability.
 */
const fs = require("fs");
const path = require("path");
const { decideStrategy, requirementFor, stageRequirement, measuredSafeFallback } = require("./lib/visual-strategy");
const { validateScene } = require("./lib/narrative-visual-firewall");

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) pass++; else { fail++; console.error("  ✗ " + name); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), `${name} (got ${JSON.stringify(a).slice(0, 130)})`);

// the REAL capability map — P1.5 accepts only measured levers (no pretending)
const REAL = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "visual-capability.json"), "utf8"));

// ── cast-aware fallback levers, on the real map ──
eq(measuredSafeFallback(REAL, 1), { lever: "shot:diorama", confidence: 0.938 }, "solo → measured diorama 0.938");
eq(measuredSafeFallback(REAL, 2), { lever: "shot:closeUp", confidence: 0.917 }, "two-person → measured closeUp 0.917 (diorama draws ONE char slot)");
ok(measuredSafeFallback(REAL, 2).lever !== "shot:diorama", "two-person never demands the one-slot diorama preset");

// ── fixtures ──
const MAP = REAL;
const soloScene = (over = {}) => ({ id: "scene-01", shot: "split", bg: { set: "room" }, characters: [{ identity: "x", action: "talk", expression: "neutral" }], props: [], texts: [], ...over });
const twoScene = (over = {}) => ({ id: "scene-02", shot: "twoShot", bg: { set: "room" }, characters: [{ identity: "x", action: "talk", expression: "neutral" }, { identity: "y", action: "idle", expression: "neutral" }], props: [], texts: [], ...over });
const safeRec = (scene) => decideStrategy({ atom: { text: "plain claim" }, scene: JSON.parse(JSON.stringify(scene)), narration: "plain claim", capabilityMap: MAP });

// ── A. fallback staging ──
{
  const s = soloScene();
  const rec = safeRec(s);
  const req = requirementFor(rec, MAP, s);
  eq(req.lever, "diorama", "A: solo SAFE requirement demands diorama");
  const st = stageRequirement(req, { scene: s });
  eq(s.shot, "diorama", "A: solo SAFE staged to diorama");
  eq(st.staged.map((x) => `${x.field}:${x.from}->${x.to}`), ["shot:split->diorama"], "A: staging is plan-tagged (field, from→to)");
  const s2 = twoScene();
  const rec2 = safeRec(s2);
  const req2 = requirementFor(rec2, MAP, s2);
  eq(req2.lever, "closeUp", "A: two-person SAFE requirement demands closeUp (cast-aware)");
  stageRequirement(req2, { scene: s2 });
  eq(s2.shot, "closeUp", "A: two-person SAFE staged to closeUp");
  ok(s2.characters.length === 2, "A: both characters preserved (closeUp draws two — verified on the preset)");
  // already-satisfied scene → no restage
  const s3 = soloScene({ shot: "diorama" });
  const st3 = stageRequirement(requirementFor(safeRec(s3), MAP, s3), { scene: s3 });
  eq(st3.staged, [], "A: already-satisfying scene is not restaged");
}

// ── B. absence ──
{
  const absRec = decideStrategy({ atom: { text: "Robots cannot knowingly lie." }, scene: { shot: "medium", characters: [{ action: "talk" }] }, narration: "Robots cannot knowingly lie.", capabilityMap: MAP });
  const req = requirementFor(absRec, MAP);
  // copy exists → strike the EXISTING operative line
  const s1 = soloScene({ texts: [{ text: "TOO LATE", style: "reveal" }] });
  const before = JSON.stringify(s1);
  stageRequirement(req, { scene: s1 });
  eq(s1.texts[0].style, "strike", "B: copy-bearing absence → strategy-aware strike on the existing line");
  ok(s1.texts.length === 1 && s1.props.length === 0, "B: nothing added (no invented copy/prop)");
  // no copy + motif → arc on the EXISTING motif
  const s2 = soloScene({ props: [{ type: "coin", arc: "none", at: 4 }] });
  stageRequirement(req, { scene: s2 });
  eq(s2.props[0].arc, "shrink", "B: copy-less absence → shrink/closein arc on the existing motif");
  ok(s2.texts.length === 0 && s2.props.length === 1, "B: no text invented, no prop added");
  // no copy, no motif → stays unmet, honestly
  const s3 = soloScene();
  const st3 = stageRequirement(req, { scene: s3 });
  ok(st3.staged.some((x) => x.field === "none") && /stays unmet/.test(st3.staged[0].reason || ""), "B: no copy + no motif → stays unmet (invention forbidden), reason recorded");
  // arc-only is NOT claimed when copy exists
  const s4 = soloScene({ texts: [{ text: "X", style: "box" }], props: [{ type: "coin", arc: "rise" }] });
  stageRequirement(req, { scene: s4 });
  eq(s4.props[0].arc, "rise", "B: with copy present the motif arc is untouched (copy lever wins)");
}

// ── C. concrete ──
{
  const conRec = decideStrategy({ atom: { text: "The company became a prison." }, scene: { shot: "medium", characters: [{ action: "talk" }] }, narration: "The company became a prison.", capabilityMap: MAP });
  const req = requirementFor(conRec, MAP);
  const s1 = soloScene({ shot: "overShoulder", characters: [{ identity: "x", action: "talk" }] });
  stageRequirement(req, { scene: s1 });
  ok(["illustration", "diorama"].includes(s1.shot), "C: concrete routed through the existing icon-shot path");
  const s2 = twoScene({ shot: "medium" });
  const st2 = stageRequirement(req, { scene: s2 });
  eq(s2.shot, "medium", "C: two-person concrete scene NOT forced into a one-slot icon shot");
  ok(st2.staged.length === 0, "C: nothing staged where the renderer cannot serve it");
}

// ── D. state ──
{
  const stRec = decideStrategy({ atom: { text: "He was devastated, but remained composed." }, scene: { shot: "medium", characters: [{ action: "sit", expression: "neutral" }] }, narration: "He was devastated, but remained composed.", capabilityMap: MAP });
  const req = requirementFor(stRec, MAP);
  const s = soloScene({ characters: [{ identity: "x", action: "sit", expression: "neutral" }] });
  stageRequirement(req, { scene: s });
  eq(s.characters[0].expression, "sad", "D: explicit-state lever staged (the strategy's own lever list — sad; no invention, schema enum)");
}

// ── E. authored + title are NEVER restaged (operator decision 3) ──
{
  const s = soloScene({ _authorship: { src: "art" } });
  const before = JSON.stringify(s);
  const st = stageRequirement({ kind: "fallback", lever: "diorama", confidence: 0.938 }, { scene: s });
  eq(JSON.stringify(s), before, "E: authored beat untouched — byte-identical");
  eq(st.skipped, "authored", "E: skip recorded as 'authored' (the UNMET stays visible for the operator)");
  const t = soloScene();
  const st2 = stageRequirement({ kind: "fallback", lever: "diorama", confidence: 0.938 }, { scene: t, isTitle: true });
  eq(st2.skipped, "title", "E: titles are never restaged");
  eq(stageRequirement(null, { scene: soloScene() }).skipped, "no_requirement", "E: no requirement → skip recorded");
}

// ── F. firewall integration: staged scenes satisfy the REAL firewall ──
{
  const PROV = { bookId: "s", worldId: "w", sourceChapter: "c", narrativeSubject: "x", narrativeRelation: "r", narrativeState: "s", allowedMotifs: ["m"], forbiddenMotifs: [], allowedCharacters: ["x", "y"], allowedLocations: ["room"], allowedProps: ["coin"] };
  const BIBLE = { world: { era: "now", worldId: "w" }, visualProvenance: { bookId: "s", worldId: "w", allowedMotifs: ["m"], forbiddenMotifs: [], allowedCharacters: ["x", "y"], allowedLocations: ["room"], allowedProps: ["coin"] }, cast: { x: { name: "X", look: "l", variant: { v: 1 } }, y: { name: "Y", look: "l", variant: { v: 2 } } }, places: { room: { set: "room", look: "l" } }, objects: [] };
  const fw = (scene) => {
    const s = JSON.parse(JSON.stringify(scene));
    s.narrativeAtom = { ...PROV }; s.visualIntent = { ...PROV };
    s.visualContract = { ...PROV, visualEvidence: { subjects: ["x"], relations: ["r"], states: ["s"], characterIntent: [], representation: requirementFor(safeRec(scene), MAP, scene) } };
    return validateScene(s, 0, BIBLE, "s").filter((e) => e.reasonCode.startsWith("STRATEGY_"));
  };
  const a = soloScene(); stageRequirement(requirementFor(safeRec(a), MAP, a), { scene: a });
  eq(fw(a), [], "F: staged solo SAFE scene → zero STRATEGY_* violations (evidence ⇄ scene holds)");
  const b = twoScene(); stageRequirement(requirementFor(safeRec(b), MAP, b), { scene: b });
  eq(fw(b), [], "F: staged two-person SAFE scene (closeUp) → zero STRATEGY_* violations");
  // an UNSAFE shot with the same evidence still fails — staging did the work, not the metadata
  const c = soloScene({ shot: "wide" });
  ok(fw(c).some((e) => e.reasonCode === "STRATEGY_REQUIREMENT_UNMET"), "F: unstaged scene with identical record → STRATEGY_REQUIREMENT_UNMET (the staging, not the metadata, satisfies the firewall)");
}

// ── G. planner wiring: stageRequirement runs BEFORE the lock ──
{
  const src = fs.readFileSync(path.join(__dirname, "plan-antidote.js"), "utf8");
  const iStage = src.indexOf("const staging = stageRequirement(");
  const iLock = src.indexOf("out._authorship.lock = {");
  ok(iStage > 0 && iLock > iStage, "SOURCE GUARD: stageRequirement runs before the staging lock (the lock seals the staged representation)");
  ok(src.includes("staging: { staged: staging.staged, skipped: staging.skipped || null }"), "SOURCE GUARD: the staging is plan-tagged on the record");
}

console.log(`test-requirement-staging: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
