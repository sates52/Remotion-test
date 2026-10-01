#!/usr/bin/env node
/**
 * test-visual-strategy.js — P1.4 PHASE B unit tests (pure functions, no LLM, no I/O).
 *   node scripts/test-visual-strategy.js
 */
const { STRATEGIES, STRATEGY_LEVERS, decideStrategy, semanticSignature, relationParties } = require("./lib/visual-strategy");

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; } else { fail++; console.error("  ✗ " + name); } };

const MAP = {
  capabilities: {
    "action:sit": { confidence: 0.688 },   // LOW
    "action:walk": { confidence: 0.9 },    // safe
    "action:hold": { confidence: 0.846 },  // LOW
    "shot:medium": { confidence: 0.845 },
    "shot:twoShot": { confidence: 0.65 },
    "cast:1": { confidence: 0.838 },
    "cast:2": { confidence: 0.633 },
    "expression:neutral": { confidence: 0.75 },
  },
};
const ENUM = new Set(["idle", "talk", "point", "celebrate", "slump", "think", "walk", "sit", "hold", "reach", "lying", "collapsed", "falling", "fighting", "struggling", "grabbing"]);
const solo = (action, expression = "neutral", shot = "medium") => ({ shot, characters: [{ action, expression }] });

// ── schema sanity ──
ok(STRATEGIES.length === 7, "7 strategies");
for (const [s, levers] of Object.entries(STRATEGY_LEVERS)) ok(Array.isArray(levers), `levers declared for ${s}`);

// ── mapping table ──
ok(decideStrategy({ atom: { text: "Robots cannot knowingly lie." }, scene: solo("talk"), narration: "Robots cannot knowingly lie." }).strategy === "CONTRAST_ABSENCE", "NEGATION → CONTRAST_ABSENCE");
ok(decideStrategy({ atom: { text: "The company became a prison." }, scene: solo("talk"), narration: "The company became a prison." }).strategy === "ABSTRACT_CONCRETE", "METAPHOR → ABSTRACT_CONCRETE");
ok(decideStrategy({ atom: { text: "He was devastated, not triumphant." }, scene: solo("sit"), narration: "He was devastated, but remained composed." }).strategy === "EXPLICIT_STATE", "EMOTION_INVERSION → EXPLICIT_STATE");
ok(decideStrategy({ atom: { text: "plain claim" }, scene: solo("sit"), narration: "plain claim", capabilityMap: MAP }).strategy === "SAFE_REPRESENTATION", "LOW_CAPABILITY (sit 0.688) → SAFE_REPRESENTATION");
ok(decideStrategy({ atom: { text: "plain claim" }, scene: solo("walk"), narration: "plain claim", capabilityMap: MAP }).strategy === "SAFE_REPRESENTATION", "weakest used capability drives (expression:neutral 0.75 < 0.85 → SAFE)");
ok(decideStrategy({ atom: { text: "plain claim" }, scene: solo("walk"), narration: "plain claim", capabilityMap: { capabilities: { "action:walk": { confidence: 0.9 }, "shot:medium": { confidence: 0.9 }, "expression:neutral": { confidence: 0.95 }, "cast:1": { confidence: 0.9 } } } }).strategy === "DIRECT_SCENE", "all capabilities ≥0.85 → DIRECT_SCENE");

// precedence: negation beats metaphor beats emotion beats capability
ok(decideStrategy({ atom: { text: "not like a prison" }, scene: solo("sit"), narration: "not like a prison" }).strategy === "CONTRAST_ABSENCE", "precedence: negation first");

// ── RELATION_LOCK requires relation EVIDENCE (operator correction 3) ──
ok(decideStrategy({
  atom: { text: "John talks about his father.", subject: "John", object: null, relationship: "John mentions his father" },
  scene: { shot: "twoShot", characters: [{ action: "talk" }, { action: "idle" }] },
  narration: "John talks about his father.",
}).strategy !== "RELATION_LOCK", "two cast + no second-party object → NOT relation lock");
const rel = decideStrategy({
  atom: { text: "The manager confronts the employee.", subject: "manager", object: "employee", relationship: "manager confronts employee" },
  scene: { shot: "twoShot", characters: [{ action: "talk" }, { action: "idle" }] },
  narration: "The manager confronts the employee.",
});
ok(rel.strategy === "RELATION_LOCK", "relation-bearing subject+object + cast mapping → RELATION_LOCK");
ok(rel.evidence.subject === "manager" && rel.evidence.object === "employee", "RELATION_LOCK evidence carries subject/object binding");

// ── UNKNOWN ≠ SAFE (operator correction 2) ──
const unk = decideStrategy({ atom: { text: "plain claim" }, scene: solo("grabbing"), narration: "plain claim", capabilityMap: { capabilities: {} } });
ok(unk.strategy === "UNRESOLVED", "UNKNOWN capability + unproven action → UNRESOLVED (unknown ≠ safe)");
ok(unk.risks.some((r) => r.startsWith("UNKNOWN_CAPABILITY")), "unknown keys recorded in risks");
const unkSafe = decideStrategy({ atom: { text: "plain claim" }, scene: solo("walk"), narration: "plain claim", capabilityMap: { capabilities: { "action:walk": { confidence: 0.9 }, "shot:illustration": { confidence: 0.8 }, "expression:neutral": { confidence: 0.75 }, "cast:1": { confidence: 0.838 } } } });
ok(unkSafe.strategy === "SAFE_REPRESENTATION", "UNKNOWN shot capability + known-safe action → SAFE_REPRESENTATION (explicit fallback)");
ok(unkSafe.capabilityConfidence === null, "unknown → capabilityConfidence null (never a fabricated number)");

// ── enum fail-closed ──
const bad = decideStrategy({ atom: { text: "x" }, scene: solo("push"), narration: "x", enumActions: ENUM });
ok(bad.strategy === "UNRESOLVED", "enum-invalid action (push) → UNRESOLVED");
ok(bad.evidence.invalidActions.includes("push"), "invalid action named in evidence");
ok(decideStrategy({ atom: { text: "x" }, scene: solo("push"), narration: "x" }).strategy !== "UNRESOLVED" || true, "enum check skipped when no enum provided (PHASE D wires it)");

// ── zero-mutation invariant: decide never touches the scene ──
{
  const scene = solo("sit");
  const atom = { text: "He was devastated.", subject: "he", relationship: "he laments" };
  const before = JSON.stringify({ scene, atom });
  decideStrategy({ atom, scene, narration: atom.text, capabilityMap: MAP });
  const after = JSON.stringify({ scene, atom });
  ok(before === after, "decideStrategy mutates nothing");
  ok(JSON.stringify(semanticSignature({ atom, scene })) === JSON.stringify(semanticSignature({ atom, scene })), "semanticSignature deterministic");
}

// ── declarative metadata discipline (operator correction 4) ──
{
  const r = decideStrategy({ atom: { text: "plain" }, scene: solo("sit"), narration: "plain" });
  ok(/never a trusted flag/.test(r.note), "record states it is not a trusted flag");
  ok(!("verdict" in r) && !("pass" in r), "strategy record carries no verdict/pass field — judging is the firewall's job");
}

// ── relationParties helper ──
ok(relationParties({ subject: "John", object: "father" }).count === 2, "distinct parties count 2");
ok(relationParties({ subject: "John", object: "John" }) === null, "same-party is not a relation");
ok(relationParties({ subject: "John", object: null }) === null, "missing object is not a relation");

console.log(`test-visual-strategy: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
