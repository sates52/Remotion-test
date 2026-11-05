#!/usr/bin/env node
// Cycle 12 tally, by the pre-registration (preregistration-c12.json): three arms A / B / C, primary = C11 metric.
//   node audit/c12-pilots/tally-c12.js --out=<rating dir>   → prints and writes <out>/tally.json
// A missing strip (contract did not compile) is that arm's failure: primary 0, 3 dead frames.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
const bench = JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c12-pilots/benchmark.json"), "utf8")).items;
const ak = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c12-pilots/answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
const typeOf = (arm, id) => { const p = path.join(ROOT, "audit/c12-pilots", `contracts${arm}`, `${id}.json`); try { return JSON.parse(fs.readFileSync(p, "utf8")).type; } catch { return null; } };
const FICTION = new Set(["fiction", "literary", "literary fiction", "mystery", "fantasy", "science fiction", "young adult"]);
const up = (s) => String(s || "").toUpperCase().trim();
const judged = { 1: {}, 2: {} };
for (const pass of [1, 2]) {
  const dir = path.join(OUT, `judge-out-p${pass}`);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) for (const r of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) {
    if (judged[pass][r.img]) throw new Error(`duplicate judgement ${r.img} pass ${pass}`);
    judged[pass][r.img] = r;
  }
}
const score = (r, causal) => { const m = up(r.message) === "MATCH" ? 1 : up(r.message) === "PARTIAL" ? 0.5 : 0; return causal ? ((up(r.cause) === "CORRECT" ? 1 : 0) + (up(r.effect) === "CORRECT" ? 1 : 0) + m) / 3 : m; };
const counts = (r) => { const fr = r.frames || []; return { wrong: fr.filter((x) => up(x.correctness) === "WRONG").length, dead: fr.filter((x) => up(x.contribution) === "NONE").length,
  adds: fr.filter((x) => up(x.contribution) === "ADDS").length, explains: fr.filter((x) => up(x.explains) === "YES").length,
  wrongInf: up(r.wrongInference) === "YES" ? 1 : 0, polarity: up(r.polarityError) === "YES" ? 1 : 0, effectOk: up(r.effect) === "CORRECT" ? 1 : 0 }; };
const cell = {};
const missing = [];
for (const [name, { id, arm }] of Object.entries(key)) {
  const causal = ak[id].supportsCausality !== false;
  const ps = [1, 2].filter((p) => judged[p][name]);
  if (!ps.length) { missing.push(name); continue; }
  const c = ps.map((p) => counts(judged[p][name])), avg = (k) => c.reduce((s, x) => s + x[k], 0) / c.length;
  cell[`${id}|${arm}`] = { primary: ps.map((p) => score(judged[p][name], causal)).reduce((a, b) => a + b, 0) / ps.length,
    wrong: avg("wrong"), dead: avg("dead"), adds: avg("adds"), explains: avg("explains"), wrongInf: avg("wrongInf"), polarity: avg("polarity"), effectOk: avg("effectOk") };
}
const FAIL = { primary: 0, wrong: 0, dead: 3, adds: 0, explains: 0, wrongInf: 0, polarity: 0, effectOk: 0, failed: true };
const val = (id, arm) => cell[`${id}|${arm}`] || FAIL;
let seed = 12;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const r1 = (x) => Math.round(x * 1000) / 10;
function compare(ids, X, Y) {
  const d = ids.map((id) => val(id, X).primary - val(id, Y).primary);
  const boots = [];
  for (let i = 0; i < 10000; i++) { let s = 0; for (let j = 0; j < d.length; j++) s += d[Math.floor(rnd() * d.length)]; boots.push(s / Math.max(1, d.length)); }
  boots.sort((a, b) => a - b);
  return { diffPP: r1(d.reduce((a, b) => a + b, 0) / Math.max(1, d.length)), ci95PP: [r1(boots[249]), r1(boots[9749])] };
}
function arms(ids) {
  const o = { n: ids.length };
  for (const a of ["A", "B", "C"]) {
    const s = (k) => ids.reduce((t, id) => t + val(id, a)[k], 0);
    o[a] = { comprehension: r1(s("primary") / Math.max(1, ids.length)), WRONG: s("wrong"), DEAD: s("dead"), ADDS: s("adds"), EXPLAINS: s("explains"), wrongInference: s("wrongInf"), polarityErrors: s("polarity"), effectCorrect: s("effectOk"), failedStrips: ids.filter((id) => val(id, a).failed).length };
  }
  o.CminusA = compare(ids, "C", "A"); o.CminusB = compare(ids, "C", "B"); o.BminusA = compare(ids, "B", "A");
  return o;
}
const main = bench.filter((b) => b.set === "main").map((b) => b.id), reg = bench.filter((b) => b.set === "regression").map((b) => b.id);
const isFic = (id) => FICTION.has(String(bench.find((b) => b.id === id).genre).toLowerCase());
const res = {
  main: arms(main), regression: arms(reg),
  genre: { fiction: arms(main.filter(isFic)), nonfiction: arms(main.filter((id) => !isFic(id))) },
  stratum: { causal: arms(main.filter((id) => bench.find((b) => b.id === id).stratum === "causal")), abstract: arms(main.filter((id) => bench.find((b) => b.id === id).stratum === "abstract")) },
  preregisteredSecondary_keyStatesCausality: arms(main.filter((id) => ak[id].supportsCausality !== false)),
  exploratory: { keyHasNotAsserted: arms(main.filter((id) => (ak[id].notAsserted || []).length)), cTextOnly: arms(main.filter((id) => typeOf("C", id) === "H")), bTextOnly: arms(main.filter((id) => typeOf("B", id) === "H")) },
  perBeat: [...main, ...reg].map((id) => ({ id, A: r1(val(id, "A").primary), B: r1(val(id, "B").primary), C: r1(val(id, "C").primary), bType: typeOf("B", id), cType: typeOf("C", id) })),
};
function kappa(pairs) {
  if (!pairs.length) return null;
  const cats = [...new Set(pairs.flat())], n = pairs.length;
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = cats.reduce((s, c) => s + (pairs.filter(([a]) => a === c).length / n) * (pairs.filter(([, b]) => b === c).length / n), 0);
  return pe === 1 ? 1 : Math.round(((po - pe) / (1 - pe)) * 100) / 100;
}
const both = Object.keys(key).filter((n) => judged[1][n] && judged[2][n]);
const pairsOf = (f) => both.flatMap((n) => f(judged[1][n], judged[2][n]));
res.agreement = { strips: both.length };
for (const k of ["cause", "effect", "message", "wrongInference", "polarityError"]) res.agreement[k] = kappa(pairsOf((a, b) => [[up(a[k]), up(b[k])]]));
for (const k of ["correctness", "contribution", "explains"]) res.agreement[k] = kappa(pairsOf((a, b) => (a.frames || []).map((x, i) => [up(x[k]), up(((b.frames || [])[i] || {})[k])])));
const m = res.main, g = res.genre, rg = res.regression;
res.shipRule = {
  plus20: m.CminusA.diffPP >= 20, wrongNotUp: m.C.WRONG <= m.A.WRONG, addsUp: m.C.ADDS > m.A.ADDS, explainsUp: m.C.EXPLAINS > m.A.EXPLAINS,
  bothGenreGroups: g.fiction.CminusA.diffPP > 0 && g.nonfiction.CminusA.diffPP > 0,
  regressionWithin10: rg.CminusA.diffPP >= -10, regressionWrongNotUp: rg.C.WRONG <= rg.A.WRONG,
};
res.verdict = Object.values(res.shipRule).every(Boolean) ? "SHIP" : "NO SHIP";
res.componentsAddValue = m.CminusB.diffPP > 0 && m.CminusB.ci95PP[0] > -5;
res.ablationsTriggered = res.verdict === "SHIP" && m.CminusB.diffPP >= 10;
res.missingJudgements = missing;
fs.writeFileSync(path.join(OUT, "tally.json"), JSON.stringify(res, null, 1));
const line = (k, s) => console.log(`${k.padEnd(24)} n=${String(s.n).padStart(2)} A ${s.A.comprehension}% B ${s.B.comprehension}% C ${s.C.comprehension}% | C-A ${s.CminusA.diffPP} [${s.CminusA.ci95PP}] C-B ${s.CminusB.diffPP} [${s.CminusB.ci95PP}] | WRONG ${s.A.WRONG}/${s.B.WRONG}/${s.C.WRONG} DEAD ${s.A.DEAD}/${s.B.DEAD}/${s.C.DEAD} ADDS ${s.A.ADDS}/${s.B.ADDS}/${s.C.ADDS} EXPL ${s.A.EXPLAINS}/${s.B.EXPLAINS}/${s.C.EXPLAINS} POL ${s.A.polarityErrors}/${s.B.polarityErrors}/${s.C.polarityErrors}`);
line("main", m); line("regression", rg); line("fiction", g.fiction); line("nonfiction", g.nonfiction);
line("causal stratum", res.stratum.causal); line("abstract stratum", res.stratum.abstract); line("key: causality (prereg)", res.preregisteredSecondary_keyStatesCausality);
line("key has notAsserted", res.exploratory.keyHasNotAsserted);
console.log("kappa", res.agreement); console.log("ship", res.shipRule, "->", res.verdict, "| components add value:", res.componentsAddValue, "| ablations:", res.ablationsTriggered, missing.length ? `MISSING ${missing.length}` : "");
