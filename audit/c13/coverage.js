#!/usr/bin/env node
// Which cycle-11 / cycle-12 Director 1.0 contracts would the single-relation capability draw as authored (claim added
// from the frozen key, notAsserted only where verbatim)? Out of scope (types C–G) vs refused (with the rule) vs drawn.
"use strict";
const fs = require("fs");
const path = require("path");
const R = require("../../scripts/lib/single-relation");
const ROOT = path.join(__dirname, "..", "..");
const W = path.join(ROOT, "..", "wt-c12", "audit");
const norm = (s) => String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const out = { drawn: [], refused: {}, outOfScope: [] };
for (const [dir, cdir] of [["c11-pilots", "contracts"], ["c12-pilots", "contractsB"]]) {
  const bench = JSON.parse(fs.readFileSync(path.join(W, dir, "benchmark.json"), "utf8")).items;
  const key = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(W, dir, "answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
  for (const it of bench) {
    const p = path.join(W, dir, cdir, `${it.id}.json`);
    if (!fs.existsSync(p)) continue;
    const c0 = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!R.TYPES.includes(c0.type)) { out.outOfScope.push(`${it.id}:${c0.type}`); continue; }
    const src = JSON.parse(fs.readFileSync(path.join(ROOT, "books", it.slug, "config.antidote.json"), "utf8"));
    const cast = (src.meta && src.meta.cast) || {};
    const k = key[it.id];
    const c = { ...c0, schema: R.SCHEMA, claim: { asserted: k.asserted || k.understanding, polarity: "asserted", speaker: k.speaker || "narrator", notAsserted: (k.notAsserted || []).filter((n) => norm(it.narration).includes(norm(n.text))) } };
    const e = R.validate(c, { narration: it.narration, cast: Object.keys(cast), castNames: Object.entries(cast).flatMap(([a, v]) => [a, (v && v.name) || ""]).filter(Boolean), castLabels: Object.fromEntries(Object.entries(cast).map(([a, v]) => [a, (v && v.name) || a])) });
    if (!e.length) { out.drawn.push(`${it.id}:${c0.type}`); continue; }
    for (const m of e) { const rule = m.replace(/"[^"]*"/g, "…").replace(/\(.*?\)/g, "").slice(0, 70); (out.refused[rule] = out.refused[rule] || []).push(it.id); }
  }
}
const refusedIds = new Set(Object.values(out.refused).flat());
console.log(`drawn ${out.drawn.length}, refused ${refusedIds.size}, out of scope ${out.outOfScope.length}`);
for (const [r, ids] of Object.entries(out.refused).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${ids.length}  ${r}  [${ids.join(" ")}]`);
fs.writeFileSync(path.join(__dirname, "coverage.json"), JSON.stringify(out, null, 1));
