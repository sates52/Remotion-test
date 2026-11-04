#!/usr/bin/env node
// Tally of the cycle-10 world-state A/B against the PRE-REGISTERED rule (preregistration-c10-world-state.json).
//   node audit/c10-pilots/tally-world-ab.js --dir=<rating dir> [--integrity=<json: {teleportB, dupB}>]
// <dir>/key.json: { "<blind name>": { passage, arm } }; <dir>/judge-<name>-r<k>.json from the judge prompt.
const fs = require("fs");
const path = require("path");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const DIR = path.resolve(args.dir);
const key = JSON.parse(fs.readFileSync(path.join(DIR, "key.json"), "utf8"));
const Q = ["actor", "object", "before", "after", "change", "consequence"];
const rows = [];
for (const f of fs.readdirSync(DIR).filter((x) => /^judge-.*-r\d+\.json$/.test(x))) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const name = f.replace(/^judge-/, "").replace(/-r\d+\.json$/, "");
  const k = key[name];
  if (!k) throw new Error(`no key for ${name}`);
  const st = j.state || {};
  const correct = Q.filter((q) => String(st[q]).toUpperCase() === "CORRECT").length;
  const fr = j.frames || [];
  rows.push({ passage: k.passage, arm: k.arm, rep: f.match(/-r(\d+)\.json$/)[1], state: correct / Q.length,
    perQ: Object.fromEntries(Q.map((q) => [q, String(st[q]).toUpperCase()])),
    wrong: fr.filter((x) => x.correctness === "WRONG").length, dead: fr.filter((x) => x.contribution === "NONE").length,
    adds: fr.filter((x) => x.contribution === "ADDS").length, explains: fr.filter((x) => x.contribution === "ADDS" && String(x.explains).toUpperCase() === "YES").length, frames: fr.length });
}
const arms = { A: rows.filter((r) => r.arm === "A"), B: rows.filter((r) => r.arm === "B") };
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
const sum = (a, k) => a.reduce((s, r) => s + r[k], 0);
const per = (arm) => Object.fromEntries([...new Set(rows.map((r) => r.passage))].sort().map((p) => [p, mean(arms[arm].filter((r) => r.passage === p).map((r) => r.state))]));
const pA = per("A"), pB = per("B");
const passages = Object.keys(pA).filter((p) => !Number.isNaN(pA[p]) && !Number.isNaN(pB[p]));
const diffs = passages.map((p) => pB[p] - pA[p]);
// paired bootstrap over passages (seeded, deterministic)
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const boots = [];
for (let b = 0; b < 10000; b++) { let s = 0; for (let i = 0; i < diffs.length; i++) s += diffs[Math.floor(rnd() * diffs.length)]; boots.push(s / diffs.length); }
boots.sort((a, b) => a - b);
const ci = [boots[Math.floor(0.025 * boots.length)], boots[Math.floor(0.975 * boots.length)]];
const integ = args.integrity ? JSON.parse(args.integrity) : { teleportB: null, dupB: null };
const tot = (arm) => ({ ratings: arms[arm].length, state: mean(arms[arm].map((r) => r.state)), wrong: sum(arms[arm], "wrong"), dead: sum(arms[arm], "dead"), adds: sum(arms[arm], "adds"), explains: sum(arms[arm], "explains"), frames: sum(arms[arm], "frames") });
const A = tot("A"), B = tot("B");
const perQ = (arm) => Object.fromEntries(Q.map((q) => [q, arms[arm].filter((r) => r.perQ[q] === "CORRECT").length / Math.max(1, arms[arm].length)]));
const rule = {
  comprehensionPlus20: (B.state - A.state) * 100 >= 20,
  wrongNotWorse: B.wrong <= A.wrong,
  noTeleportNoDup: integ.teleportB === 0 && integ.dupB === 0,
  addsExplainsNoLoss: B.adds >= A.adds && B.explains >= A.explains,
};
const out = { A, B, diffPP: +((B.state - A.state) * 100).toFixed(1), ci95PP: ci.map((x) => +(x * 100).toFixed(1)), perPassage: Object.fromEntries(passages.map((p) => [p, { A: +pA[p].toFixed(2), B: +pB[p].toFixed(2) }])), perQuestion: { A: perQ("A"), B: perQ("B") }, rule, ship: Object.values(rule).every(Boolean), integrity: integ };
fs.writeFileSync(path.join(DIR, "result.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
