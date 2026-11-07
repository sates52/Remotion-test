#!/usr/bin/env node
// test-c19.js — C19 sequences (2026-11-07): an action and its result across shots inside a beat / over consecutive
// beats. Validation, atomic apply (all beats or none), the beat keeps id / start / length / transition, carried state
// and the set-change rule, status after a rebuild, revert of the whole sequence. In memory, < 1 s.
const assert = require("assert");
const C19 = require("./lib/c19-sequence");
const RO = require("./single-relation-rollout");

let fail = 0;
const ok = (name, fn) => { try { fn(); console.log(`✓ ${name}`); } catch (e) { fail++; console.log(`✗ ${name}\n    ${e.message}`); } };
const clone = (x) => JSON.parse(JSON.stringify(x));

// three beats on one shore: 0 sets up, 1 says the strike and the split, 2 is after it
const N = ["Luther walks to the log with his axe.", "Swing, strike, split. The wood falls apart.", "He stacks the pieces by the door."];
const timed = (text, from) => text.split(" ").map((w, k) => ({ w, s: from + 10 + k * 12 }));
const beat = (i) => ({ id: `s${i}`, fromFrame: i * 200, durationFrames: 200, shot: "medium", bg: { kind: "outdoor", set: "shore" },
  transition: { type: i ? "fade" : "cut", frames: i ? 12 : 0 }, characters: [{ identity: "luther", role: "luther", action: "idle" }], props: [], texts: [{ text: "WORK" }], _narration: N[i] });
const config = () => ({ meta: { cast: { luther: {} } }, scenes: [0, 1, 2].map(beat), captions: N.map((t, i) => ({ words: timed(t, i * 200) })) });
const motifs = { log: { viewBox: "0 0 100 40", paths: [{ d: "M0 0h100v40H0z" }], words: ["log", "wood"] } };
const ctx = { motifs };
const wordAt = (cfg, i, w) => cfg.captions[i].words.find((x) => x.w.replace(/[^a-z]/gi, "").toLowerCase() === w).s - cfg.scenes[i].fromFrame;

const luther = (extra = {}) => ({ identity: "luther", action: "hold", holds: "axe", ...extra });
const contract = () => ({ schema: C19.SCHEMA, _author: "test", evidence: "Swing, strike, split.",
  beats: [
    { sceneIndex: 1, shots: [
      { at: null, stage: "keep" },
      { at: "Swing,", cues: { 0: "strike," }, motionCues: { 0: "split." }, stage: { shot: "wide", bg: { set: "shore" }, characters: [luther({ action: "chop" })], props: [{ motif: "log", x: 900, y: 760, scale: 0.8 }] } },
      { at: "The wood", stage: { shot: "wide", bg: { set: "shore" }, characters: [luther()], props: [{ motif: "log", x: 900, y: 760, scale: 0.8, startState: "split" }] } }] },
    { sceneIndex: 2, shots: [{ at: null, stage: { shot: "wide", bg: { set: "shore" }, characters: [luther()], props: [{ motif: "log", x: 900, y: 760, scale: 0.8, startState: "split" }] } }] }] });
// the split motion is a prop motion; it needs its own prop field in the stage
const withSplit = (c) => { c.beats[0].shots[1].stage.props[0].motion = "split"; return c; };

ok("a valid two-beat contract has no errors", () => assert.deepStrictEqual(C19.validate(withSplit(contract()), config(), ctx), []));

ok("shots are beat-relative and cut on the narrator's words; cues sit exactly on the word", () => {
  const cfg = config(), shots = C19.compileBeat(cfg, withSplit(contract()).beats[0], motifs);
  assert.strictEqual(shots[0].from, 0); assert.strictEqual(shots[2].to, 200);
  assert.strictEqual(shots[1].from, wordAt(cfg, 1, "swing")); assert.strictEqual(shots[2].from, wordAt(cfg, 1, "the"));
  assert.strictEqual(shots[1].characters[0].actionAt, wordAt(cfg, 1, "strike") - shots[1].from);
  assert.strictEqual(shots[1].characters[0].cueExact, true);
  assert.strictEqual(shots[1].props[0].motionAt, wordAt(cfg, 1, "split") - shots[1].from);
  assert.ok(shots[2].props[0].motionAt < 0, "a carried result starts already split");
  assert.ok(shots[0].kept && shots[0].texts.length === 1, "keep = the beat's own staging");
});

ok("apply is atomic and the beat keeps id, start, length and transition", () => {
  const cfg = config(), r = C19.apply(cfg, withSplit(contract()), ctx);
  assert.ok(r.ok);
  for (const i of [1, 2]) {
    const a = cfg.scenes[i], b = r.config.scenes[i];
    for (const k of ["id", "fromFrame", "durationFrames", "transition", "_narration", "characters", "texts"]) assert.deepStrictEqual(b[k], a[k], `${i}.${k}`);
    assert.ok(b.shots.length && b._c19.contractHash === r.contractHash);
    assert.deepStrictEqual(b._c19.beats, [1, 2]);
  }
  assert.strictEqual(r.config.scenes[0], cfg.scenes[0]);
  assert.ok(!cfg.scenes[1].shots, "the input config is not mutated");
});

ok("one failing beat = no beat changes", () => {
  const c = withSplit(contract()); c.beats[1].shots[0].stage.characters[0].identity = "stranger";
  const r = C19.apply(config(), c, ctx);
  assert.ok(!r.ok && r.errors.some((e) => /not in the book's cast/.test(e)));
  assert.ok(!r.config);
});

ok("the timing rule: a cued action without its word, and a cut word the narrator never says, are refused", () => {
  const c = withSplit(contract()); delete c.beats[0].shots[1].cues;
  assert.ok(C19.validate(c, config(), ctx).some((e) => /"chop" must be cued/.test(e)));
  const d = withSplit(contract()); d.beats[0].shots[1].at = "Hammer,";
  assert.ok(C19.validate(d, config(), ctx).some((e) => /cut word "Hammer,"/.test(e)));
  const e = withSplit(contract()); e.beats[0].shots[1].cues = { 0: "falls" };
  assert.ok(C19.validate(e, config(), ctx).some((m) => /cue "falls" is not said inside the shot/.test(m)));
});

ok("grounding: an object the narration never names is refused; evidence must be verbatim; no hypothetical", () => {
  const c = withSplit(contract()); c.beats[0].shots[1].stage.characters[0].holds = "sword";
  assert.ok(C19.validate(c, config(), ctx).some((e) => /"sword" is drawn but the narration never names it/.test(e)));
  const d = withSplit(contract()); d.evidence = "He swings the axe.";
  assert.ok(C19.validate(d, config(), ctx).some((e) => /VERBATIM/.test(e)));
  const cfg = config(); cfg.scenes[1]._narration = "He could swing, strike, split. The wood falls apart."; const e = withSplit(contract()); e.evidence = "He could swing, strike, split.";
  assert.ok(C19.validate(e, cfg, ctx).some((m) => /hypothetical/.test(m)));
});

ok("one character, one look; no new on-screen words", () => {
  const c = withSplit(contract()); c.beats[1].shots[0].stage.characters[0].variant = { beard: "full" };
  assert.ok(C19.validate(c, config(), ctx).some((e) => /changes look/.test(e)));
  const d = withSplit(contract()); d.beats[1].shots[0].stage.texts = [{ text: "SPLIT" }];
  assert.ok(C19.validate(d, config(), ctx).some((e) => /no new on-screen words/.test(e)));
});

ok("carried state: a result needs its cause earlier in the sequence, in the SAME set", () => {
  const c = contract(); // no split motion anywhere → the carried pieces have no cause
  assert.ok(C19.validate(c, config(), ctx).some((e) => /starts split but no earlier shot/.test(e)));
  const d = withSplit(contract()); d.beats[1].shots[0].stage.bg.set = "kitchen";
  assert.ok(C19.validate(d, config(), ctx).some((e) => /the set changes \(shore → kitchen\)/.test(e)));
  const e = withSplit(contract()); e.beats[1].sceneIndex = 0;
  assert.ok(C19.validate(e, config(), ctx).some((m) => /consecutive/.test(m)));
});

ok("framing: full body only in a full-body shot (a waist-up shot keeps the head in frame); legs need a full shot", () => {
  const cfg = config(), b = { sceneIndex: 1, shots: [{ at: null, stage: { shot: "medium", characters: [{ identity: "luther", action: "hold", holds: "axe" }] } }] };
  assert.strictEqual(C19.compileBeat(cfg, b, motifs)[0].characters[0].body, undefined);
  b.shots[0].stage.shot = "wide";
  assert.strictEqual(C19.compileBeat(cfg, b, motifs)[0].characters[0].body, "full");
  const c = withSplit(contract()); c.beats[0].shots[1].stage.shot = "medium";
  assert.ok(C19.validate(c, config(), ctx).some((e) => /"chop" needs the legs/.test(e)));
});

ok("status after a rebuild and revert of the whole sequence", () => {
  const cfg = config(), r = C19.apply(cfg, withSplit(contract()), ctx);
  const record = { scenes: [{ kind: "c19", sceneIndex: 1, beats: [1, 2], contractHash: r.contractHash, previousBeats: r.previous }] };
  assert.strictEqual(RO.status(r.config, record).state, "ACTIVE");
  assert.deepStrictEqual(RO.status(cfg, record).missing, [1], "a rebuilt config without the shots is MISSING");
  const half = clone(r.config); delete half.scenes[2].shots;
  assert.strictEqual(RO.status(half, record).state, "MISSING", "one beat without its shots = the sequence is not live");
  const back = RO.revert(r.config, record);
  assert.deepStrictEqual(back.config.scenes, cfg.scenes, "both beats return to their previous versions together");
  assert.deepStrictEqual(back.done, [1]);
  assert.strictEqual(RO.status(back.config, back.record).state, "NONE");
});

if (fail) { console.log(`\n${fail} failed`); process.exit(1); }
console.log("\nall C19 sequence tests passed");
