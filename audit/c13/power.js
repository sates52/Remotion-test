#!/usr/bin/env node
// Cycle 13 holdout design: effect size, paired-difference spread, book clustering, power and cost — from cycle-11 and
// cycle-12 per-beat results (Director 1.0 = arm B there, production = arm A). Planning only; no rating.
//   node audit/c13/power.js
"use strict";
const fs = require("fs");
const path = require("path");
const W = path.join(__dirname, "..", "..", "..", "wt-c12", "audit");
const sets = [];
for (const [cyc, dir, bArm] of [["c12", "c12-pilots", "B"]]) { // the cycle-11 tally keeps no per-beat table
  const bench = JSON.parse(fs.readFileSync(path.join(W, dir, "benchmark.json"), "utf8")).items;
  const key = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(W, dir, "answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
  const t = JSON.parse(fs.readFileSync(path.join(W, dir, "ratings", "tally.json"), "utf8"));
  for (const b of t.perBeat) {
    const it = bench.find((x) => x.id === b.id);
    if (!it || key[b.id].supportsCausality === false) continue; // the holdout targets cause-present beats
    const A = b.A, B = b[bArm];
    if (typeof A !== "number" || typeof B !== "number") continue;
    sets.push({ cyc, id: b.id, slug: it.slug, d: (B - A) / 100 });
  }
}
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const d = sets.map((s) => s.d);
// book clustering: one-way ANOVA ICC of the paired difference by book
const books = {}; for (const s of sets) (books[s.slug] = books[s.slug] || []).push(s.d);
const groups = Object.values(books), k = groups.length, N = d.length, gm = mean(d);
const msb = groups.reduce((s, g) => s + g.length * (mean(g) - gm) ** 2, 0) / (k - 1);
const msw = groups.reduce((s, g) => s + g.reduce((t, x) => t + (x - mean(g)) ** 2, 0), 0) / (N - k);
const n0 = (N - groups.reduce((s, g) => s + g.length ** 2, 0) / N) / (k - 1);
const icc = Math.max(0, (msb - msw) / (msb + (n0 - 1) * msw));
// power by simulation: draw books, then beats within the book (cluster resampling from the observed differences),
// shifted to the assumed true effect; test = cluster-bootstrap 95 % CI lower bound > 0
let seed = 1313; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pool = Object.values(books).map((g) => g.map((x) => x - gm)); // centred: the effect is added back
function power(effect, nBooks, perBook, sims = 600) {
  let hit = 0;
  for (let s = 0; s < sims; s++) {
    const sample = []; for (let b = 0; b < nBooks; b++) { const g = pool[Math.floor(rnd() * pool.length)]; const row = []; for (let j = 0; j < perBook; j++) row.push(g[Math.floor(rnd() * g.length)] + effect); sample.push(row); }
    const means = []; for (let r = 0; r < 300; r++) { let t = 0, c = 0; for (let b = 0; b < nBooks; b++) { const row = sample[Math.floor(rnd() * nBooks)]; for (const x of row) { t += x; c++; } } means.push(t / c); }
    means.sort((a, b) => a - b); if (means[Math.floor(0.025 * means.length)] > 0) hit++;
  }
  return Math.round((hit / sims) * 100);
}
const designs = [[10, 4], [14, 3], [20, 2], [20, 3], [27, 3], [40, 1]];
const effects = [0.1, 0.15, 0.2];
const table = designs.map(([b, p]) => ({ books: b, perBook: p, n: b * p, power: Object.fromEntries(effects.map((e) => [`+${e * 100}pp`, power(e, b, p)])) }));
// cost per arm-item from cycle 12 / 13 measurements: describer ≈ 52 k tokens (one strip) or ≈ 56 k per FOUR strips;
// judge ≈ 57 k per 4 items; 2 judge passes
const cost = (n, four) => { const items = 2 * n; const desc = four ? Math.ceil(items / 4) * 56e3 : items * 52e3; const judges = 2 * Math.ceil(items / 4) * 57e3; return Math.round((desc + judges) / 1e5) / 10; };
const res = {
 source: "cycle-12 cause-present beats (main + regression), Director 1.0 (B) − production (A), primary score per beat",
 n: N, books: k, observedMeanPP: Math.round(gm * 1000) / 10, sdPairedPP: Math.round(sd(d) * 1000) / 10,
 byCycle: Object.fromEntries(["c12"].map((c) => { const x = sets.filter((s) => s.cyc === c).map((s) => s.d); return [c, { n: x.length, meanPP: Math.round(mean(x) * 1000) / 10 }]; })),
 iccByBook: Math.round(icc * 100) / 100,
 assumption: "planning effect +15 pp (below the pooled observation, which is inflated by selection: Director 1.0 was chosen BECAUSE it scored well on these sets — winner's curse)",
 powerTable: table,
 costMillionTokens: Object.fromEntries([27, 40, 60].map((n) => [`n${n}`, { oneStripDescribers: cost(n, false), fourStripDescribers: cost(n, true) }])),
};
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(path.join(__dirname, "power.json"), JSON.stringify(res, null, 1));
