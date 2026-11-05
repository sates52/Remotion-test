#!/usr/bin/env node
// Cycle 13 dense-frame pilot rating (preregistration-c13.json → denseFramePilot). Development data, diagnostic only.
//   node audit/c13/pilot-rate.js blind  --pilot=<build dir> --fetched=<fetched dir> --out=<rating dir>
//   node audit/c13/pilot-rate.js judges --out=<rating dir> --pass=1|2
//   node audit/c13/pilot-rate.js tally  --out=<rating dir>
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const cmd = process.argv[2];
const OUT = path.resolve(args.out || ".");
const C12 = path.join(__dirname, "..", "..", "..", "wt-c12", "audit", "c12-pilots");
const ak = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(C12, "answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
const bench = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(C12, "benchmark.json"), "utf8")).items.map((x) => [x.id, x]));
const h = (s) => crypto.createHash("sha256").update(s).digest("hex");
const VARIANTS = [["A", "S"], ["A", "D"], ["B", "S"], ["B", "D"]];

if (cmd === "blind") {
  const { passages } = JSON.parse(fs.readFileSync(path.join(path.resolve(args.pilot), "pilot.json"), "utf8"));
  const F = path.resolve(args.fetched);
  fs.mkdirSync(path.join(OUT, "blind"), { recursive: true });
  const key = {}, describers = Array.from({ length: passages.length }, () => []);
  passages.forEach((p, pi) => VARIANTS.forEach(([arm, cond], v) => {
    const src = cond === "S" ? path.join(F, "strips", `${p.id}-${arm}-s.png`) : path.join(F, "grids", `${p.id}-${arm}-d.png`);
    if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
    const name = h(`c13-pilot|${p.id}|${arm}|${cond}`).slice(0, 10);
    fs.copyFileSync(src, path.join(OUT, "blind", `${name}.png`));
    key[name] = { id: p.id, arm, cond, frames: cond === "S" ? 3 : p.dense };
    describers[(pi + 3 * v) % passages.length].push(name); // the 4 items of a passage → 4 different describers
  }));
  for (const d of describers) { d.sort((a, b) => h(`ord|${a}`).localeCompare(h(`ord|${b}`))); if (new Set(d.map((n) => key[n].id)).size !== d.length) throw new Error("a describer got one passage twice"); }
  fs.writeFileSync(path.join(OUT, "blind-key.json"), JSON.stringify({ key }, null, 1));
  fs.writeFileSync(path.join(OUT, "describers.json"), JSON.stringify(describers.map((d) => d.map((n) => ({ img: n, kind: key[n].cond, frames: key[n].frames }))), null, 1));
  console.log(`${Object.keys(key).length} items, ${describers.length} describers x 4`);
} else if (cmd === "judges") {
  const pass = Number(args.pass);
  const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
  const names = Object.keys(key).sort((a, b) => h(`p${pass}|${a}`).localeCompare(h(`p${pass}|${b}`)));
  const per = 8, nJ = Math.ceil(names.length / per), J = Array.from({ length: nJ }, () => []);
  for (const n of names) { // the judge with the fewest items that has not seen this passage
    const j = J.map((x, i) => ({ i, l: x.length, seen: x.some((m) => key[m].id === key[n].id) })).filter((x) => !x.seen && x.l < per).sort((a, b) => a.l - b.l || a.i - b.i)[0];
    if (!j) throw new Error("no judge slot");
    J[j.i].push(n);
  }
  const dir = path.join(OUT, `judge-in-p${pass}`); fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(path.join(OUT, `judge-out-p${pass}`), { recursive: true });
  const INSTR = fs.readFileSync(path.join(__dirname, "pilot-judge-instructions.txt"), "utf8");
  J.forEach((js, i) => {
    const items = js.map((n) => { const k = ak[key[n].id], b = bench[key[n].id]; const d = JSON.parse(fs.readFileSync(path.join(OUT, "desc", `${n}.json`), "utf8"));
      return { img: n, narration: b.narration, answerKey: { understanding: k.understanding, cause: k.cause, effect: k.effect, keyFacts: k.keyFacts, wrongInferences: k.wrong, supportsCausality: k.supportsCausality, asserted: k.asserted, notAsserted: k.notAsserted }, description: d }; });
    fs.writeFileSync(path.join(dir, `J${String(i + 1).padStart(2, "0")}.task.json`), JSON.stringify({ instructions: INSTR, items }, null, 1));
  });
  console.log(`pass ${pass}: ${J.length} judges x ≤ ${per}`);
} else if (cmd === "tally") {
  const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
  const up = (s) => String(s || "").toUpperCase().trim();
  const j = { 1: {}, 2: {} };
  for (const p of [1, 2]) { const d = path.join(OUT, `judge-out-p${p}`); for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".json"))) for (const r of JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))) { if (j[p][r.img]) throw new Error(`duplicate ${r.img}`); j[p][r.img] = r; } }
  const score = (r, causal) => { const m = up(r.message) === "MATCH" ? 1 : up(r.message) === "PARTIAL" ? 0.5 : 0; return causal ? ((up(r.cause) === "CORRECT") + (up(r.effect) === "CORRECT") + m) / 3 : m; };
  const cell = {}, missing = [];
  for (const [n, k] of Object.entries(key)) {
    const causal = ak[k.id].supportsCausality !== false, ps = [1, 2].filter((p) => j[p][n]);
    if (!ps.length) { missing.push(n); continue; }
    const av = (f) => ps.reduce((s, p) => s + f(j[p][n]), 0) / ps.length;
    cell[`${k.id}|${k.arm}|${k.cond}`] = { primary: av((r) => score(r, causal)), wrongInf: av((r) => +(up(r.wrongInference) === "YES")), polarity: av((r) => +(up(r.polarityError) === "YES")),
      changed: av((r) => +(up(r.whatChanged) === "CORRECT")), changedApplicable: av((r) => +(up(r.whatChanged) !== "NA")), finalYes: av((r) => +(up(r.finalConsequence) === "YES")), finalApplicable: av((r) => +(up(r.finalConsequence) !== "NA")) };
  }
  const ids = [...new Set(Object.values(key).map((k) => k.id))];
  let seed = 13; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const r1 = (x) => Math.round(x * 1000) / 10;
  const cmp = (f) => { const d = ids.map(f).filter((x) => x != null); const b = []; for (let i = 0; i < 10000; i++) { let s = 0; for (let q = 0; q < d.length; q++) s += d[Math.floor(rnd() * d.length)]; b.push(s / d.length); } b.sort((a, c) => a - c); return { n: d.length, diffPP: r1(d.reduce((a, c) => a + c, 0) / d.length), ci95PP: [r1(b[249]), r1(b[9749])] }; };
  const v = (id, a, c, f = "primary") => (cell[`${id}|${a}|${c}`] || {})[f];
  const sum = (a, c, f) => Math.round(ids.reduce((s, id) => s + (v(id, a, c, f) || 0), 0) * 10) / 10;
  const out = { n: ids.length, missing,
    comprehension: Object.fromEntries(["A", "B"].flatMap((a) => ["S", "D"].map((c) => [`${a}-${c}`, r1(ids.reduce((s, id) => s + (v(id, a, c) || 0), 0) / ids.length)]))),
    wrongInference: Object.fromEntries(["A", "B"].flatMap((a) => ["S", "D"].map((c) => [`${a}-${c}`, sum(a, c, "wrongInf")]))),
    polarityErrors: Object.fromEntries(["A", "B"].flatMap((a) => ["S", "D"].map((c) => [`${a}-${c}`, sum(a, c, "polarity")]))),
    whatChangedCorrect: Object.fromEntries(["A", "B"].flatMap((a) => ["S", "D"].map((c) => [`${a}-${c}`, `${sum(a, c, "changed")} / ${sum(a, c, "changedApplicable")}`]))),
    finalConsequenceYes: Object.fromEntries(["A", "B"].flatMap((a) => ["S", "D"].map((c) => [`${a}-${c}`, `${sum(a, c, "finalYes")} / ${sum(a, c, "finalApplicable")}`]))),
    DminusS: { A: cmp((id) => (v(id, "A", "D") != null && v(id, "A", "S") != null ? v(id, "A", "D") - v(id, "A", "S") : null)), B: cmp((id) => (v(id, "B", "D") != null && v(id, "B", "S") != null ? v(id, "B", "D") - v(id, "B", "S") : null)) },
    BminusA: { S: cmp((id) => (v(id, "B", "S") != null && v(id, "A", "S") != null ? v(id, "B", "S") - v(id, "A", "S") : null)), D: cmp((id) => (v(id, "B", "D") != null && v(id, "A", "D") != null ? v(id, "B", "D") - v(id, "A", "D") : null)) },
    perPassage: ids.map((id) => ({ id, "A-S": r1(v(id, "A", "S") || 0), "A-D": r1(v(id, "A", "D") || 0), "B-S": r1(v(id, "B", "S") || 0), "B-D": r1(v(id, "B", "D") || 0) })) };
  const kap = (k) => { const both = Object.keys(key).filter((n) => j[1][n] && j[2][n]); const pr = both.map((n) => [up(j[1][n][k]), up(j[2][n][k])]); if (!pr.length) return null; const cats = [...new Set(pr.flat())], N = pr.length; const po = pr.filter(([a, b]) => a === b).length / N; const pe = cats.reduce((s, c) => s + (pr.filter(([a]) => a === c).length / N) * (pr.filter(([, b]) => b === c).length / N), 0); return pe === 1 ? 1 : Math.round(((po - pe) / (1 - pe)) * 100) / 100; };
  out.kappa = Object.fromEntries(["cause", "effect", "message", "wrongInference", "whatChanged", "finalConsequence"].map((k) => [k, kap(k)]));
  const wiB = ["S", "D"].every((c) => sum("B", c, "wrongInf") <= sum("A", c, "wrongInf"));
  out.progressionToHoldout = { BminusA_S_atLeast10: out.BminusA.S.diffPP >= 10, wrongInferenceNotUp: wiB };
  out.progressionToHoldout.met = out.progressionToHoldout.BminusA_S_atLeast10 && wiB;
  fs.writeFileSync(path.join(OUT, "tally.json"), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ ...out, perPassage: undefined }, null, 1));
} else { console.error("usage: blind | judges | tally"); process.exit(2); }
