#!/usr/bin/env node
// Cycle 11 tally, by the pre-registration (preregistration-c11-director.json + the rating-prompts.md clarification).
//   node audit/c11-pilots/tally-c11.js --out=<rating dir>   → prints and writes <out>/tally.json
// Per strip and judge pass: primary = mean(cause CORRECT, effect CORRECT, message MATCH 1 / PARTIAL .5 / MISS 0); on a
// beat the frozen key marks supportsCausality:false the primary is the message score alone. Per strip the two passes are
// averaged. Frame measures (WRONG, DEAD = contribution NONE, ADDS, EXPLAINS YES) are counted per pass and averaged.
// Uncertainty: paired bootstrap over beats (10 000, seeded). Agreement: Cohen's kappa pass 1 vs pass 2 per measure.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
const bench = JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c11-pilots/benchmark.json"), "utf8")).items;
const ak = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c11-pilots/answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
const contracts = Object.fromEntries(bench.map((b) => { const p = path.join(ROOT, "audit/c11-pilots/contracts", `${b.id}.json`); return [b.id, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null]; }));
const FICTION = new Set(["fiction", "literary", "literary fiction", "mystery", "fantasy", "science fiction", "young adult"]);
const up = (s) => String(s || "").toUpperCase().trim();

const judged = { 1: {}, 2: {} };
for (const pass of [1, 2]) {
  const dir = path.join(OUT, `judge-out-p${pass}`);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const r of arr) { if (judged[pass][r.img]) throw new Error(`duplicate judgement ${r.img} pass ${pass}`); judged[pass][r.img] = r; }
  }
}
const score = (r, causal) => {
  const m = up(r.message) === "MATCH" ? 1 : up(r.message) === "PARTIAL" ? 0.5 : 0;
  if (!causal) return m;
  return ((up(r.cause) === "CORRECT" ? 1 : 0) + (up(r.effect) === "CORRECT" ? 1 : 0) + m) / 3;
};
const frameCounts = (r) => {
  const fr = r.frames || [];
  return { wrong: fr.filter((x) => up(x.correctness) === "WRONG").length, dead: fr.filter((x) => up(x.contribution) === "NONE").length,
    adds: fr.filter((x) => up(x.contribution) === "ADDS").length, explains: fr.filter((x) => up(x.explains) === "YES").length,
    wrongInf: up(r.wrongInference) === "YES" ? 1 : 0 };
};
const byName = {};
const missing = [];
for (const [name, { id, arm }] of Object.entries(key)) {
  const causal = ak[id].supportsCausality !== false;
  const ps = [1, 2].filter((p) => judged[p][name]);
  if (!ps.length) { missing.push(name); continue; }
  const sc = ps.map((p) => score(judged[p][name], causal));
  const fc = ps.map((p) => frameCounts(judged[p][name]));
  const avg = (k) => fc.reduce((s, x) => s + x[k], 0) / fc.length;
  byName[name] = { id, arm, passes: ps.length, primary: sc.reduce((a, b) => a + b, 0) / sc.length, wrong: avg("wrong"), dead: avg("dead"), adds: avg("adds"), explains: avg("explains"), wrongInf: avg("wrongInf") };
}
const cell = (id, arm) => Object.values(byName).find((x) => x.id === id && x.arm === arm) || null;
// a B strip that does not exist (not compiled / not rendered) is B's failure: primary 0, 3 dead frames
const val = (id, arm) => cell(id, arm) || (arm === "B" ? { primary: 0, wrong: 0, dead: 3, adds: 0, explains: 0, wrongInf: 0, failed: true } : null);

let seed = 11;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
function summarize(ids) {
  const rows = ids.map((id) => ({ id, A: val(id, "A"), B: val(id, "B") })).filter((r) => r.A && r.B);
  const sum = (arm, k) => rows.reduce((s, r) => s + r[arm][k], 0);
  const mean = (arm) => sum(arm, "primary") / Math.max(1, rows.length);
  const d = rows.map((r) => r.B.primary - r.A.primary);
  const boots = [];
  for (let i = 0; i < 10000; i++) { let s = 0; for (let j = 0; j < d.length; j++) s += d[Math.floor(rnd() * d.length)]; boots.push(s / Math.max(1, d.length)); }
  boots.sort((a, b) => a - b);
  const r1 = (x) => Math.round(x * 1000) / 10;
  return { n: rows.length, comprehensionA: r1(mean("A")), comprehensionB: r1(mean("B")), diffPP: r1(mean("B") - mean("A")),
    ci95PP: [r1(boots[249]), r1(boots[9749])],
    framesPerArm: rows.length * 3,
    WRONG: { A: sum("A", "wrong"), B: sum("B", "wrong") }, DEAD: { A: sum("A", "dead"), B: sum("B", "dead") },
    ADDS: { A: sum("A", "adds"), B: sum("B", "adds") }, EXPLAINS: { A: sum("A", "explains"), B: sum("B", "explains") },
    wrongInference: { A: sum("A", "wrongInf"), B: sum("B", "wrongInf") },
    perBeat: rows.map((r) => ({ id: r.id, A: r1(r.A.primary), B: r1(r.B.primary), bType: contracts[r.id] && contracts[r.id].type })) };
}
const main = bench.filter((b) => b.set === "main").map((b) => b.id);
const reg = bench.filter((b) => b.set === "regression").map((b) => b.id);
const isFic = (id) => FICTION.has(String(bench.find((b) => b.id === id).genre).toLowerCase());
const T = (ids, pred) => ids.filter(pred);
const typeOf = (id) => contracts[id] && contracts[id].type;
const res = {
  main: summarize(main), regression: summarize(reg),
  genre: { fiction: summarize(T(main, isFic)), nonfiction: summarize(T(main, (id) => !isFic(id))) },
  stratum: { causal: summarize(T(main, (id) => bench.find((b) => b.id === id).stratum === "causal")), abstract: summarize(T(main, (id) => bench.find((b) => b.id === id).stratum === "abstract")) },
  keyCausality: { supportsCausality: summarize(T(main, (id) => ak[id].supportsCausality !== false)), noCausality: summarize(T(main, (id) => ak[id].supportsCausality === false)) },
  lemo: { causePauseEffect: summarize(T(main, (id) => ["A", "B"].includes(typeOf(id)))), otherStaged: summarize(T(main, (id) => !["A", "B", "H"].includes(typeOf(id)))), textOnly: summarize(T(main, (id) => typeOf(id) === "H")) },
};
// Cohen's kappa between the two judge passes
function kappa(pairs) {
  if (!pairs.length) return null;
  const cats = [...new Set(pairs.flat())];
  const po = pairs.filter(([a, b]) => a === b).length / pairs.length;
  const pe = cats.reduce((s, c) => s + (pairs.filter(([a]) => a === c).length / pairs.length) * (pairs.filter(([, b]) => b === c).length / pairs.length), 0);
  return pe === 1 ? 1 : Math.round(((po - pe) / (1 - pe)) * 100) / 100;
}
const both = Object.keys(key).filter((n) => judged[1][n] && judged[2][n]);
const pairsOf = (f) => both.flatMap((n) => f(judged[1][n], judged[2][n]));
res.agreement = {
  strips: both.length,
  cause: kappa(pairsOf((a, b) => [[up(a.cause), up(b.cause)]])), effect: kappa(pairsOf((a, b) => [[up(a.effect), up(b.effect)]])),
  message: kappa(pairsOf((a, b) => [[up(a.message), up(b.message)]])), wrongInference: kappa(pairsOf((a, b) => [[up(a.wrongInference), up(b.wrongInference)]])),
  frameCorrectness: kappa(pairsOf((a, b) => (a.frames || []).map((x, i) => [up(x.correctness), up(((b.frames || [])[i] || {}).correctness)]))),
  contribution: kappa(pairsOf((a, b) => (a.frames || []).map((x, i) => [up(x.contribution), up(((b.frames || [])[i] || {}).contribution)]))),
  explains: kappa(pairsOf((a, b) => (a.frames || []).map((x, i) => [up(x.explains), up(((b.frames || [])[i] || {}).explains)]))),
};
const m = res.main, g = res.genre, rg = res.regression;
res.shipRule = {
  plus20: m.diffPP >= 20, wrongNotUp: m.WRONG.B <= m.WRONG.A, deadNotUp: m.DEAD.B <= m.DEAD.A,
  addsUp: m.ADDS.B > m.ADDS.A, explainsUp: m.EXPLAINS.B > m.EXPLAINS.A,
  bothGenreGroups: g.fiction.diffPP > 0 && g.nonfiction.diffPP > 0,
  regressionWithin10: rg.diffPP >= -10, regressionWrongNotUp: rg.WRONG.B <= rg.WRONG.A,
};
res.verdict = Object.values(res.shipRule).every(Boolean) ? "SHIP" : "NO SHIP";
res.missingJudgements = missing;
fs.writeFileSync(path.join(OUT, "tally.json"), JSON.stringify(res, null, 1));
const line = (k, s) => console.log(`${k.padEnd(22)} n=${String(s.n).padStart(2)}  A ${s.comprehensionA}%  B ${s.comprehensionB}%  Δ ${s.diffPP} pp  CI [${s.ci95PP}]  WRONG ${s.WRONG.A}/${s.WRONG.B}  DEAD ${s.DEAD.A}/${s.DEAD.B}  ADDS ${s.ADDS.A}/${s.ADDS.B}  EXPL ${s.EXPLAINS.A}/${s.EXPLAINS.B}`);
line("main", m); line("regression", rg); line("fiction", g.fiction); line("nonfiction", g.nonfiction);
line("causal stratum", res.stratum.causal); line("abstract stratum", res.stratum.abstract);
line("key: causality", res.keyCausality.supportsCausality); line("key: none", res.keyCausality.noCausality);
line("B cause-pause-effect", res.lemo.causePauseEffect); line("B other staged", res.lemo.otherStaged); line("B text-only", res.lemo.textOnly);
console.log("kappa", res.agreement); console.log("ship rule", res.shipRule, "→", res.verdict, missing.length ? `MISSING ${missing.length}` : "");
