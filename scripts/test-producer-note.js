#!/usr/bin/env node
/** test-producer-note.js — the producer's note reaches the film and the description only as the operator's. No render. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const read = (...p) => fs.readFileSync(path.join(__dirname, "..", ...p), "utf8");

t("the card: one fade in and out near the start, nothing without a note, both engines mount it", () => {
  const c = read("src", "components", "ProducerNote.tsx");
  assert.ok(c.includes("if (!text) return null;"), "no note → nothing is drawn");
  assert.ok(c.includes("START_S = 14") && c.includes("HOLD_S = 6.5"));
  assert.ok(!/Math\.sin|Math\.cos|spring\(/.test(c), "no motion of its own");
  assert.ok(c.includes("PRODUCER'S NOTE"));
  assert.ok(read("src", "engines", "antidote", "index.tsx").includes("<ProducerNote note="));
  assert.ok(read("src", "engines", "vox", "index.tsx").includes("<ProducerNote note={config.meta.take?.note}"));
  assert.ok(read("src", "engines", "antidote", "schema.ts").includes("take: z.object({ note: z.string() }).optional()"));
});

t("only the operator's approved sentence travels: the planners and the pack check by === operator", () => {
  for (const f of ["plan-antidote.js", "plan-vox.js", "plan-antidote-meta.js", "plan-meta.js"]) assert.ok(/take\.by === "operator"/.test(read("scripts", f)), f);
  const mp = read("scripts", "make-prompt.js");
  assert.ok(mp.includes('if (tr.length < 15)') && mp.includes('by: "operator"'), "make-prompt records it only with his words");
  assert.ok(read("scripts", "plan-meta.js").includes("abs.manifest(slug)"), "plan-meta reads the book by its own slug variable");
});

t("the skill tells every agent the same exchange: three alternatives in Turkish, his choice, then English", () => {
  const s = read(".claude", "skills", "notebooklm-prompt", "SKILL.md");
  assert.ok(s.includes("Yapımcının notu") && s.includes("THREE alternatives IN TURKISH") && s.includes("--take-tr"));
  assert.ok(s.includes("an agent never records one of its own"));
});

console.log(`\nall producer-note checks passed (${n})`);
