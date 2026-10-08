#!/usr/bin/env node
/**
 * test-p10-visual-brief.js — P10.1 beat #029 contract tests (isolated fixture).
 *
 * Verifies, WITHOUT touching any production system:
 *   1. the fixture's authored proposition normalizes under the FROZEN contract
 *      (scripts/lib/proposition.js) and seals as author-grade;
 *   2. the driver's compiled scene carries BOTH pictorial pole anchors
 *      (storm prop + water prop) with the composition bound (beforeAfter) —
 *      stagedPoles() must report twoSided with zero copy on the frame;
 *   3. the forbidden list is honored: no flow diagram (two circles + labels),
 *      no cast, no text on the scene;
 *   4. the BASELINE (what the live pipeline does with this beat — an authored
 *      flow diagram) provably draws ZERO pictorial anchors for the same poles:
 *      circles + labels only. This is the P10 root cause, asserted as a test.
 *
 * Usage: node audit/visionless-10x/p10/test-p10-visual-brief.js
 */
const fs = require("fs");
const path = require("path");

let passed = 0, failed = 0;
function assert(name, cond, detail) {
  if (cond) { passed++; console.log(`  \u2713 ${name}`); }
  else { failed++; console.log(`  \u2717 ${name}${detail ? `  — ${detail}` : ""}`); }
}

const ROOT = path.join(__dirname, "..", "..", "..");
const P = require(path.join(ROOT, "scripts", "lib", "proposition.js"));
const { SCENE_ICONS } = require(path.join(ROOT, "scripts", "lib", "antidote-director.js"));
const { expression: expressionEnum, charAction, handProp } = require(path.join(ROOT, "src", "engines", "antidote", "schema.ts"));
const CTX = {
  expressionEnum: new Set(expressionEnum.options),
  actionEnum: new Set(charAction.options),
  holdsEnum: new Set(handProp.options),
  sceneIcons: SCENE_ICONS,
};

const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, "p10.1-fixture.json"), "utf8"));
const driver = require(path.join(__dirname, "p10.1-driver.cjs"));

// The driver must expose its build step without side effects for tests.
// If it does not, run the build through the CLI instead.
function buildOrLoad() {
  if (typeof driver.buildScene === "function") return driver.buildScene();
  const report = JSON.parse(fs.readFileSync(path.join(__dirname, "p10.1-report.json"), "utf8"));
  return report.build;
}

const REPORT_PATH = path.join(__dirname, "p10.1-report.json");
const HAS_BUILT = fs.existsSync(REPORT_PATH);

console.log("\n1. authored proposition — frozen contract shape");
{
  const norm = P.normalizeProposition({
    relation: FIXTURE.proposition.relation,
    poles: FIXTURE.proposition.poles,
    evidence: FIXTURE.proposition.evidence,
    src: "author",
    visual: { representation: FIXTURE.contract.representation, icon: FIXTURE.contract.visualIcon, perCast: FIXTURE.contract.perCast },
  });
  assert("normalizes ok", norm.ok, norm.errors && norm.errors.join("; "));
  assert("relation is cause_effect", norm.prop && norm.prop.relation === "cause_effect");
  assert("two asserted poles", norm.prop && norm.prop.poles.length === 2 && norm.prop.poles.every((p) => p.status === "asserted"));
  assert("author-grade (sealable)", norm.ok && !!P.sealFor(norm.prop));
}

let scene = null, stage = null, verdict = null, evidence = null;
console.log("\n2. compiled scene — pictorial anchors");
{
  const built = buildOrLoad();
  if (built && built.scene) { scene = built.scene; stage = built.stage; verdict = built.verdict; evidence = built.evidence; }
  else {
    // fall back to re-deriving from the CLI-run report
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
    verdict = report.contract;
  }
  assert("scene built", !!scene);
  assert("driver ran (--build report exists)", HAS_BUILT);
  assert("shot is beforeAfter (author's composition)", scene && scene.shot === "beforeAfter");
  const types = scene ? scene.props.map((p) => p.type) : [];
  assert("storm pole has a pictorial anchor", types.includes("storm"), `props: ${types.join(", ")}`);
  assert("flood pole has a pictorial anchor", types.includes("water"), `props: ${types.join(", ")}`);
  assert("storm icon is renderer vocabulary", SCENE_ICONS.includes("storm"));
  assert("water icon is renderer vocabulary", SCENE_ICONS.includes("water"));
  assert("descent arrow present (cause→effect stroke)", types.includes("arrow"));
}

console.log("\n3. frozen contract — stagedPoles verdict");
{
  assert("twoSided (both poles anchored)", verdict && verdict.twoSided === true);
  assert("no unstaged", verdict && verdict.unstaged === false);
  assert("no poleViolation", verdict && verdict.poleViolation === false);
  const v = (verdict && verdict.verdicts) || [];
  assert("storm pole staged", v.some((x) => x.pole === "an intense summer storm" && x.state === "staged"));
  assert("flood pole staged", v.some((x) => x.pole === "a flash flood in the washes" && x.state === "staged"));
}

console.log("\n4. forbidden list honored");
{
  assert("no flow diagram (two circles + labels)", scene && !scene.diagram);
  assert("no cast on frame (author: weather needs nobody)", scene && scene.characters.length === 0);
  assert("no copy on frame (muted semantic view)", scene && scene.texts.length === 0);
  assert("no TSM palette leak (ITW ink)", scene && scene.bg.accent === "#1C1712");
}

console.log("\n5. baseline proof — the live pipeline's answer for this beat");
{
  // Exactly what plan-antidote + stageProposition do with an authored flow
  // proposition on an empty beat scene: circles + labels, no pictures.
  const empty = { id: "baseline-029", type: "illustration", fromFrame: 0, durationFrames: 240, shot: "medium", characters: [], props: [], texts: [] };
  const norm = P.normalizeProposition({
    relation: "cause_effect",
    poles: FIXTURE.proposition.poles,
    evidence: FIXTURE.proposition.evidence,
    src: "author",
    visual: { representation: "flow", icon: null, perCast: [] },
  });
  const seal = P.sealFor(norm.prop);
  const stageFlow = P.stageProposition(seal, empty, CTX);
  const d = empty.diagram;
  assert("baseline stages an authored flow diagram", !!(d && d.type === "flow" && d.authored));
  assert("baseline labels = pole TEXT (not pictures)", d && d.labels[0] === "an intense summer storm" && d.labels[1] === "a flash flood in the washes");
  assert("baseline draws ZERO pictorial anchors", empty.props.length === 0);
  assert("baseline is exactly 'two circles + labels' (the operator's P10 root cause)", d && empty.props.length === 0 && empty.characters.length === 0);
  void stageFlow;
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
