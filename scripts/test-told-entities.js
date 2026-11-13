#!/usr/bin/env node
/** test-told-entities.js — what the narration names, and whether it is on screen. No render, no network. */
const assert = require("assert");
const E = require("./lib/told-entities");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };

t("a proper name is a capitalised run inside a sentence; the first word of a sentence is not one", () => {
  assert.deepStrictEqual(E.namesIn("It was Windows versus Chrome OS. It was Bing versus Google Search."), ["Windows", "Chrome OS", "Bing", "Google Search"]);
  assert.deepStrictEqual(E.namesIn("Exactly. I mean, Microsoft was the undisputed king."), ["Microsoft"]);
  assert.deepStrictEqual(E.namesIn("Because that letter was a forgery. Wait, what?"), []);
  assert.deepStrictEqual(E.namesIn("a man named Johann Rochlitz, was trying"), ["Johann Rochlitz"]);
});

t("a name that opens a sentence counts when it is a two-word name; years are kept", () => {
  assert.deepStrictEqual(E.namesIn("Yes. Microsoft Office versus Google Docs."), ["Microsoft Office", "Google Docs"]);
  assert.deepStrictEqual(E.namesIn("published in a German music magazine in 1815, decades after Mozart's death"), ["German", "1815", "Mozart"]);
  assert.deepStrictEqual(E.namesIn("in the 2010s between Microsoft and Google, you see"), ["Microsoft", "Google"]);
});

const SCENES = [
  "the tragedy in Silicon Valley between Microsoft and Google, you realize",
  "Exactly. I mean, Microsoft was the undisputed king",
  "And Google was this pure search engine",
  "It was Windows versus Chrome OS.",
  "this tiny kid, Wolfgang Mozart, just a toddler",
  "decades after Mozart had already died in 1791",
  "that letter from 1815 was forged in 1815 again",
  "and then 1815 came",
].map((x, i) => ({ id: `s${i}`, _narration: x, texts: [], characters: [], props: [] }));

t("entities: said in two or more scenes; a short name folds into its longer form; years are their own kind", () => {
  const ents = E.entitiesOf(SCENES);
  const by = Object.fromEntries(ents.map((e) => [e.name, e]));
  assert.deepStrictEqual(by.Microsoft.scenes, [0, 1]);
  assert.deepStrictEqual(by.Google.scenes, [0, 2]);
  assert.ok(!by.Windows && !by["Silicon Valley"], "said once: not an entity yet");
  assert.strictEqual(by["1815"].kind, "year");
  assert.ok(!by.Mozart || by.Mozart.scenes.length === 2, "Mozart is said in two scenes (once inside Wolfgang Mozart)");
});

t("coverage: a scene that names something shows it — in a text, a name tag, or a told stage", () => {
  const cfg = { scenes: SCENES.map((s) => ({ ...s })) };
  let c = E.mentionCoverage(cfg);
  assert.deepStrictEqual([c.mentions, c.shown], [5, 0]);          // Microsoft/Google ×3 scenes, Mozart ×2
  assert.deepStrictEqual(c.missing[0], { scene: "s0", names: ["Google", "Microsoft"] });
  cfg.scenes[0].texts = [{ text: "MICROSOFT VERSUS GOOGLE" }];
  cfg.scenes[1].told = { items: [{ kind: "emblem", label: "MICROSOFT" }] };
  cfg.scenes[2].characters = [{ label: "Googler" }];             // not the name: a longer word does not count
  cfg.scenes[4].told = { items: [{ kind: "figure", label: "MOZART" }] };
  c = E.mentionCoverage(cfg);
  assert.deepStrictEqual([c.mentions, c.shown], [5, 3]);
  assert.ok(Math.abs(c.share - 0.6) < 1e-9);
  assert.deepStrictEqual(c.missing.map((m) => m.scene), ["s2", "s5"]);
});

t("a film that names nothing has no coverage number (never a fake 100 %)", () => {
  const c = E.mentionCoverage({ scenes: [{ id: "a", _narration: "it is what it is" }] });
  assert.deepStrictEqual([c.mentions, c.share], [0, null]);
});

console.log(`\n${n} checks passed`);
