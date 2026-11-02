// P1 primary tally against the PRE-REGISTERED rule (audit/c7-pilots/preregistration-c7-causal-director.json)
const fs = require("fs"), path = require("path");
const S = __dirname, P = path.join(S, "p1-primary");
const key = JSON.parse(fs.readFileSync(path.join(S, "p1-judge-key.json"), "utf8"));
const GENRE = { RR1: "fiction", RR2: "fiction", BL1: "fiction", BL2: "fiction", HT1: "ideas", HT2: "ideas", MI1: "ideas", MI2: "ideas" };
const up = (x) => String(x || "").toUpperCase().trim();
const rows = [];
for (const [job, k] of Object.entries(key)) {
  const [p, rep] = job.split("-");
  const jr = JSON.parse(fs.readFileSync(path.join(P, `judge-${job}`, "judge-result.json"), "utf8"));
  for (const it of jr.items || jr) for (const side of ["X", "Y"]) {
    const v = it[side]; if (!v) continue;
    rows.push({ passage: p, genre: GENRE[p], rep: +rep, frame: k[it.id].frame, arm: k[it.id][side], c: up(v.correctness), k: up(v.contribution), e: up(v.explains) === "YES" && up(v.contribution) === "ADDS" });
  }
}
const agg = (f) => { const a = rows.filter(f); return { n: a.length, CORRECT: a.filter((r) => r.c === "CORRECT").length, NEUTRAL: a.filter((r) => r.c === "NEUTRAL").length, WRONG: a.filter((r) => r.c === "WRONG").length, ADDS: a.filter((r) => r.k === "ADDS").length, TEXT_ONLY: a.filter((r) => r.k === "TEXT_ONLY").length, DEAD: a.filter((r) => r.k === "NONE").length, EXPLAINS: a.filter((r) => r.e).length }; };
const T = {};
for (const arm of ["A", "B"]) {
  T[arm] = agg((r) => r.arm === arm);
  for (const g of ["fiction", "ideas"]) T[`${arm}:${g}`] = agg((r) => r.arm === arm && r.genre === g);
  for (const p of Object.keys(GENRE)) T[`${arm}:${p}`] = agg((r) => r.arm === arm && r.passage === p);
}
const need = Math.ceil(0.10 * T.A.n);
const rule = {
  wrongPerGenre: ["fiction", "ideas"].every((g) => T[`B:${g}`].WRONG <= T[`A:${g}`].WRONG),
  deadPooled: T.B.DEAD <= T.A.DEAD,
  addsPooled: T.B.ADDS >= T.A.ADDS + need,
  addsPerGenre: ["fiction", "ideas"].every((g) => T[`B:${g}`].ADDS >= T[`A:${g}`].ADDS),
  explainsPooled: T.B.EXPLAINS >= T.A.EXPLAINS,
  correctPooled: T.B.CORRECT >= T.A.CORRECT,
};
const bars = (t) => ({ wrongPer30: +(t.WRONG / t.n * 30).toFixed(2), deadPer30: +(t.DEAD / t.n * 30).toFixed(2), addsPct: Math.round(t.ADDS / t.n * 100) });
const res = { totals: T, addsNeeded: need, rule, decision: Object.values(rule).every(Boolean) ? "SHIP" : "NO SHIP", officialBars: { A: bars(T.A), B: bars(T.B) } };
fs.writeFileSync(path.join(S, "p1-primary-result.json"), JSON.stringify(res, null, 1));
for (const k of ["A", "B", "A:fiction", "B:fiction", "A:ideas", "B:ideas"]) console.log(k.padEnd(10), JSON.stringify(T[k]));
console.log("per passage (ADDS A->B, EXPLAINS A->B, WRONG A->B):", Object.keys(GENRE).map((p) => `${p} ${T["A:" + p].ADDS}->${T["B:" + p].ADDS} ${T["A:" + p].EXPLAINS}->${T["B:" + p].EXPLAINS} ${T["A:" + p].WRONG}->${T["B:" + p].WRONG}`).join(" | "));
console.log("rule", JSON.stringify(rule), "ADDS needed +" + need, "->", res.decision);
console.log("official bars", JSON.stringify(res.officialBars));
