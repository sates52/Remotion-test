#!/usr/bin/env node
// Semantic Film Director 2.0 (cycle 12, dev/c12): claim logic, shot reads, visual-proof verbs. The C11 failures are the
// regression cases (dev set: audit/c11-pilots/benchmark.json — never the C12 holdout).   node scripts/test-semantic-director-v2.js
"use strict";
const assert = require("assert");
const path = require("path");
const D = require("./lib/semantic-director-v2");
const dev = Object.fromEntries(require(path.join(__dirname, "..", "audit", "c11-pilots", "benchmark.json")).items.map((x) => [x.id, x]));
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log("  ok", name); };
const ctxOf = (id, cast = []) => ({ narration: dev[id].narration, cast, castNames: cast, durationFrames: dev[id].durationFrames });
const errs = (c, ctx) => D.validate(c, ctx);
const base = { schema: "semantic-director/2", camera: { framing: "wide-locked", purpose: "hold" }, required: ["x"], omitted: [] };

// ── B05: a rejected premise may not be the quote card ─────────────────────────
const b05 = (text, na) => ({ ...base, type: "H", representation: "quote", fallbackReason: "the-sentence-is-the-point",
  understanding: "The speaker pushes back: her brain did help.", evidence: "But I have to interject here because her brain", text,
  claim: { asserted: "Her brain did help her.", polarity: "asserted", notAsserted: na, speaker: "narrator" },
  reads: [{ at: [0.1, 1], focus: "text", what: "the pushback" }] });
ok("B05: the rejected premise as the quote card is refused", () => {
  const e = errs(b05("I hear your point about her intellect being useless against his psychopathy.",
    [{ text: "I hear your point about her intellect being useless against his psychopathy", kind: "rejected-premise" }]), ctxOf("B05"));
  assert(e.some((x) => /quote card shows a not-asserted part/.test(x)), e.join("\n"));
});
ok("B05: an unresolved 'I hear your point' cue is refused", () => {
  const c = b05("But I have to interject here because her brain", []);
  c.evidence = "I hear your point about her intellect being useless";
  const e = errs(c, ctxOf("B05"));
  assert(e.some((x) => /rejected-premise cue/.test(x)), e.join("\n"));
});
ok("B05: the asserted pushback compiles", () => {
  const e = errs(b05("But I have to interject here because her brain", [{ text: "I hear your point about her intellect being useless against his psychopathy", kind: "rejected-premise" }]), ctxOf("B05"));
  assert.deepStrictEqual(e, []);
});
// ── B09: a counterfactual expectation cannot be shown as the claim ────────────
ok("B09: evidence taken from the counterfactual is refused", () => {
  const c = { ...base, type: "H", representation: "quote", fallbackReason: "no-visual-mechanism", understanding: "Trained to freeze, the dogs were expected to stay put.",
    evidence: "They should just fuse to the floor.", text: "They should just fuse to the floor.",
    claim: { asserted: "The behaviorists expected the dogs to freeze.", polarity: "asserted", notAsserted: [{ text: "They should just fuse to the floor", kind: "counterfactual" }] },
    reads: [{ at: [0.1, 1], focus: "text", what: "the expectation" }] };
  const e = errs(c, ctxOf("B09"));
  assert(e.some((x) => /does not assert/.test(x)) && e.some((x) => /quote card shows a not-asserted part/.test(x)), e.join("\n"));
});
// ── B17: 'widen the map' is a SIZE change, now expressible ───────────────────
const b17 = { ...base, type: "B", representation: "cause-pause-effect", understanding: "A conflict of values forces you to widen the map before choosing.",
  evidence: "Let the conflict of values force you to widen the map", before: "a small map beside two clashing values", transformation: "the conflict widens the map", after: "the map is wider",
  claim: { asserted: "The conflict of values should make you widen the map before you choose.", polarity: "contrast",
    notAsserted: [{ text: "don't force a binary choice that crushes one of them", kind: "setup-half-of-contrast" }] },
  entities: [{ id: "v", kind: "object", glyph: "balance", label: "conflict" }, { id: "m", kind: "stock", label: "map", value: 0.5 }, { id: "x", kind: "object", glyph: "sword", label: "binary choice", negated: true }],
  events: [{ at: 0.3, cause: "v", effects: [{ entity: "m", size: 1.8 }] }],
  reads: [{ at: [0.05, 0.3], focus: "x", what: "the binary choice is rejected" }, { at: [0.3, 0.6], focus: "v", what: "the conflict" }, { at: [0.6, 1], focus: "m", what: "the map widens" }] };
ok("B17: widen = size compiles (contrast with the rejected binary choice crossed out)", () => assert.deepStrictEqual(errs(b17, ctxOf("B17")), []));
ok("polarity contrast without a negated entity is refused", () => {
  const c = JSON.parse(JSON.stringify(b17)); c.entities = c.entities.filter((e) => !e.negated); c.reads.shift(); c.reads[0].at = [0.05, 0.6];
  assert(errs(c, ctxOf("B17")).some((x) => /negated: true/.test(x)));
});
ok("a negated entity's label must come from a not-asserted part", () => {
  const c = JSON.parse(JSON.stringify(b17)); c.entities[2].label = "map";
  assert(errs(c, ctxOf("B17")).some((x) => /label must come from claim.notAsserted/.test(x)));
});
// ── B26: a discovery is a REVEAL (no causal token) ───────────────────────────
ok("B26: 'realized … held a portfolio' compiles as reveal; reveal needs present:false", () => {
  const c = { ...base, type: "A", representation: "cause-pause-effect", understanding: "Graham found that the pipeline company held a bond portfolio.",
    evidence: "Graham had dug through the Interstate Commerce Commission records", before: "records", transformation: "Graham finds the portfolio", after: "the portfolio in view",
    claim: { asserted: "Graham discovered the hidden portfolio.", polarity: "asserted", notAsserted: [], cueCheck: "no cue in the sentence" },
    entities: [{ id: "g", kind: "person", label: "Graham" }, { id: "p", kind: "object", glyph: "briefcase", label: "portfolio", present: false }],
    events: [{ at: 0.3, cause: "g", effects: [{ entity: "p", reveal: true, present: true }] }],
    reads: [{ at: [0.05, 0.4], focus: "g", what: "Graham digs" }, { at: [0.45, 1], focus: "p", what: "the portfolio is found" }] };
  assert.deepStrictEqual(errs(c, ctxOf("B26", ["graham"])), []);
  c.entities[1].present = true; assert(errs(c, ctxOf("B26")).some((x) => /reveal shows an entity that starts present: false/.test(x)));
});
// ── B27: 'pave over a crater' is a COVER (the hole stays) ────────────────────
ok("B27: cover compiles, the covered entity must be another entity", () => {
  const c = { ...base, type: "C", representation: "before-after", understanding: "Money is laid over an emotional hole that stays underneath.",
    evidence: "They're using capital to pave over a gaping emotional crater", before: "a hole", transformation: "capital laid over it", after: "covered, still there",
    claim: { asserted: "They use money to cover an emotional hole.", polarity: "asserted", notAsserted: [], cueCheck: "no cue: a plain assertion" },
    entities: [{ id: "c", kind: "object", glyph: "coin", label: "capital" }, { id: "k", kind: "object", glyph: "grave", label: "crater" }],
    events: [{ at: 0.3, cause: "c", effects: [{ entity: "c", cover: "k" }] }],
    reads: [{ at: [0.05, 0.4], focus: "k", what: "the hole" }, { at: [0.45, 1], focus: "c", what: "capital laid over it" }] };
  const e = errs(c, ctxOf("B27")); assert(!e.some((x) => /cover/.test(x)), e.join("\n"));
  c.events[0].effects[0].cover = "c"; assert(errs(c, ctxOf("B27")).some((x) => /cover names the other entity/.test(x)));
});
// ── shot reads ────────────────────────────────────────────────────────────────
ok("reads: too short, out of order, result too late or not held are refused", () => {
  const c = JSON.parse(JSON.stringify(b17)); c.reads[1].at = [0.3, 0.33];
  assert(errs(c, ctxOf("B17")).some((x) => /too short to read/.test(x)));
  const d = JSON.parse(JSON.stringify(b17)); d.reads[2].at = [0.8, 1];
  assert(errs(d, ctxOf("B17")).some((x) => /starts by 0.70/.test(x)));
  const e = JSON.parse(JSON.stringify(b17)); e.reads[2].at = [0.6, 0.9];
  assert(errs(e, ctxOf("B17")).some((x) => /holds to the end/.test(x)));
});
ok("a quote card needs 0.6 s + 0.25 s per word on screen", () => {
  const c = b05("But I have to interject here because her brain", [{ text: "I hear your point about her intellect being useless against his psychopathy", kind: "rejected-premise" }]);
  c.reads[0].at = [0.9, 1]; // ~0.8 s of a 9-word card
  assert(errs(c, ctxOf("B05")).some((x) => /needs .* s on screen|too short/.test(x)));
});
ok("H needs a recorded fallback reason", () => {
  const c = b05("But I have to interject here because her brain", [{ text: "I hear your point about her intellect being useless against his psychopathy", kind: "rejected-premise" }]);
  delete c.fallbackReason; assert(errs(c, ctxOf("B05")).some((x) => /fallbackReason/.test(x)));
});
ok("compile: the change completes as its result read begins; entities enter at their first read", () => {
  const sc = D.compile(b17, { id: "s", fromFrame: 0, durationFrames: 300, bg: {}, transition: {} });
  const o = sc.semantic.occ[0], T = sc.semantic.timing, r = sc.semantic.reads.find((x) => x.focus === "m");
  assert.strictEqual(o.cue + T.token + T.pause + T.change, r.from);
  assert.strictEqual(sc.semantic.v, 2);
  assert.strictEqual(sc.semantic.entities.find((e) => e.id === "x").enter, Math.max(0, Math.round(0.05 * 300) - 8));
  assert(sc.semantic.entities.find((e) => e.id === "x").negated);
});
console.log(`semantic-director v2: ${n} passed`);
