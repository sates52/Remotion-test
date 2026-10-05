#!/usr/bin/env node
/**
 * test-relational-floor.js — Vision-free 10x P7 commit-4 tests (pure).
 *   node scripts/test-relational-floor.js
 *
 * Proves:
 *   1. Wider deterministic extraction: however/yet, from-X-to-Y, therefore, and
 *      the SENTENCE-BOUNDARY contrast (the P6 #20 false-negative: "… But" at a
 *      sentence edge) now yield floor payloads.
 *   2. Null-floor telemetry: every no-floor result carries a machine-readable
 *      nullFloorReason (NO_RELATION / RELATION_DETECTED_EXTRACTION_FAILED /
 *      LABEL_UNSAFE / AUTHORED_ALREADY_SATISFIES / UNSUPPORTED_RELATION) while
 *      the historical `reason` strings stay byte-identical.
 *   3. The floor derives from the CANONICAL relation table: contrast ⇒
 *      comparison medium, transformation ⇒ labeled_flow, etc.
 *   4. Legacy compat: `reason === "no_payload_no_floor"` still fires with the
 *      nullFloorReason beside it; `semanticPayload` stays byte-compatible.
 */
const adapter = require("./lib/director-adapter");
const { relationForArchetype, mediumForRelation } = require("../src/semantic/stagingEvidence.ts");

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) pass++; else { fail++; console.error("  ✗ " + name); } };

const direction = { shot: "medium", cast: { count: 1 }, props: [] };
const run = (text, archetype, extra = {}) => adapter.buildDirectorOverrides({
  intent: { archetype, requiredActions: [] },
  atom: { text },
  direction,
  ...extra,
});

// ── 1. wider deterministic extraction ───────────────────────────────────────
{
  // sentence-boundary contrast — the P6 #20 case shape ("… real. But …")
  const r = run("The pain is entirely real. But the suffering is optional.", "contrast");
  ok(r.override && r.override.semanticPayload && r.override.semanticPayload.leftLabel === "PAIN IS ENTIRELY REAL"
    && r.override.semanticPayload.rightLabel === "SUFFERING IS OPTIONAL",
    `sentence-boundary contrast stages both poles (got ${JSON.stringify(r.override && r.override.semanticPayload)})`);
  // however / yet
  ok(!!run("Focus is a spotlight. However, multitasking leaks attention.", "contrast").override, "however (clause-opening) yields a contrast floor");
  ok(!!run("Plans are cheap. Yet execution is everything.", "contrast").override, "yet yields a contrast floor");
  // therefore (labels must be telegraph-safe: content words both sides)
  ok(!!run("Attention collapses. Therefore shallow work multiplies.", "cause_effect").override, "therefore yields a causal flow floor");
  // from X to Y (transformation)
  const t = run("The product went from clunky to effortless.", "transformation");
  ok(t.override && t.override.semanticPayload && t.override.semanticPayload.triggerLabel === "CLUNKY"
    && t.override.semanticPayload.consequenceLabel === "EFFORTLESS",
    `from-X-to-Y stages the transformation (got ${JSON.stringify(t.override && t.override.semanticPayload)})`);
  // regression guards: the old conservative behaviors must survive
  ok(!run("We are tearing apart the romantic myth. Okay, lets unpack this.", "cause_effect").override, "no marker ⇒ still no floor");
  ok(!run("Roskolikov did not murder that old woman because he was hungry.", "cause_effect").override, "negation-flip because ⇒ still no floor (LABEL_UNSAFE telemetry)");
  ok(!run("I do not know what this is, but honestly it just feels so wrong to me right now.", "character_psychology").override, "unsafe clause ⇒ still no floor");
}

// ── 2. null-floor telemetry ────────────────────────────────────────────────
{
  const staticR = run("He sat by the sea and thought.", "static_reflection");
  ok(staticR.nullFloorReason === "NO_RELATION" && staticR.reason === "no_semantic_requirement", "static ⇒ NO_RELATION (+ legacy reason)");
  const detected = run("We are tearing apart the romantic myth. Okay, lets unpack this.", "contrast");
  ok(detected.nullFloorReason === "RELATION_DETECTED_EXTRACTION_FAILED" && detected.reason === "no_payload_no_floor",
    "marker-less relational ⇒ RELATION_DETECTED_EXTRACTION_FAILED (+ legacy no_payload_no_floor)");
  const unsafe = run("I do not have a castle in the sky because illusions fade.", "cause_effect");
  ok(unsafe.nullFloorReason === "LABEL_UNSAFE" && unsafe.reason === "no_payload_no_floor", "negation flip ⇒ LABEL_UNSAFE (+ legacy reason)");
  const authored = run("Fear becomes paralysis.", "cause_effect", { authoredComposition: true });
  ok(authored.nullFloorReason === "AUTHORED_ALREADY_SATISFIES" && authored.reason === "preserved_authored_composition" && authored.override === null,
    "authored ⇒ AUTHORED_ALREADY_SATISFIES (floor never silently applied)");
  ok(staticR.relation === "none" && detected.relation === "comparison" && detected.medium === "comparison",
    "result carries the canonical relation/medium");
  // UNSUPPORTED_RELATION: relation exists but the archetype branch has no floor implementation
  const seq = adapter.buildDirectorOverrides({
    intent: { archetype: "historical_grounding", requiredActions: [] },
    atom: { text: "In 404 BC the democracy fell to the thirty tyrants." },
    direction,
  });
  ok(seq.relation === "none" && seq.nullFloorReason === "NO_RELATION", "non-relational archetype maps to NO_RELATION (sequence unenforced until needed)");
}

// ── 3. canonical derivation (no second semantic interpretation) ─────────────
{
  ok(relationForArchetype("contrast") === "comparison" && mediumForRelation("comparison") === "comparison", "contrast ⇒ comparison medium");
  ok(relationForArchetype("transformation") === "transformation" && mediumForRelation("transformation") === "labeled_flow", "transformation ⇒ labeled_flow");
  ok(relationForArchetype("allegory_equivalence") === "equivalence" && mediumForRelation("equivalence") === "two_domain_comparison", "equivalence medium");
  ok(relationForArchetype("character_psychology") === "internal_tension", "psychology relation");
}

// ── 4. legacy compat ───────────────────────────────────────────────────────
{
  const p = adapter.semanticPayload({ text: "Scenius versus genius." }, "allegory_equivalence");
  ok(p && p.sourceLabel === "SCENIUS" && p.targetLabel === "GENIUS", "semanticPayload stays byte-compatible");
  const floor = run("Fear becomes paralysis.", "cause_effect");
  ok(floor.reason === "added_causal_flow_floor" && JSON.stringify(floor.override.diagram.labels) === '["FEAR","PARALYSIS"]', "floor labels + reason unchanged");
  ok(floor.nullFloorReason === null, "applied floor ⇒ nullFloorReason null");
}

console.log(`test-relational-floor: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
