// P2 analysis: every rater vs R0 (the recorded official verdicts). Reference = procedure conformance, not human truth.
//   node calib-analysis.js [--set=dev|test|all] [--cloud=<dir with ratings-current.jsonl / ratings-official.jsonl>]...
const fs = require("fs"), path = require("path");
const S = __dirname;
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a, true]; }));
const WHICH = args.set || "all";
const set = JSON.parse(fs.readFileSync(path.join(S, "calib-set-ids.json"), "utf8"));
const runsIdx = [...new Set(set.images.map((i) => i.run))];
const up = (x) => String(x || "").toUpperCase().trim();
const norm = (v) => v ? { c: up(v.correctness), k: up(v.contribution), e: up(v.explains) === "YES" ? "YES" : "NO" } : null;

// R0 and R3 labels per image id (cal-rK-img-NN)
const R0 = {}, R3 = {};
for (const im of set.images) R0[im.id] = norm(im.ref);
for (let k = 1; k <= runsIdx.length; k++) {
  const dir = path.join(S, "calib-r3", `r${k}`);
  if (!fs.existsSync(path.join(dir, "judge-result.json"))) continue;
  const jr = JSON.parse(fs.readFileSync(path.join(dir, "judge-result.json"), "utf8"));
  const jk = JSON.parse(fs.readFileSync(path.join(S, "calib-r3", `judge-key-r${k}.json`), "utf8"));
  for (const it of jr.items || jr) { const img = jk[it.id].img; R3[`cal-r${k}-${img.replace(".png", "")}`] = norm(it.V); }
}
const raters = { R3 };
for (const d of [].concat(args.cloud || [])) {
  for (const f of fs.readdirSync(d).filter((x) => /^ratings(-[a-z]+)?\.jsonl$/.test(x))) {
    const name = f === "ratings.jsonl" ? "R1-current" : f.replace("ratings-", "R").replace(".jsonl", "").replace("Rofficial", "R2-official").replace("Rcurrent", "R1-current");
    raters[name] = raters[name] || {};
    for (const l of fs.readFileSync(path.join(d, f), "utf8").split("\n").filter(Boolean)) { const r = JSON.parse(l); raters[name][r.img.replace(/\.(webp|png)$/, "")] = norm(r.judge); }
  }
}
const inSet = (id) => { const im = set.images.find((i) => i.id === id); return im && (WHICH === "all" || im.set === WHICH); };
const kappa = (pairs, cats) => {
  const n = pairs.length; if (!n) return null;
  const po = pairs.filter(([a, b]) => a === b).length / n;
  const pe = cats.reduce((s, c) => s + (pairs.filter(([a]) => a === c).length / n) * (pairs.filter(([, b]) => b === c).length / n), 0);
  return pe === 1 ? 1 : +((po - pe) / (1 - pe)).toFixed(3);
};
const report = {};
for (const [name, R] of Object.entries(raters)) {
  const ids = Object.keys(R0).filter((id) => inSet(id) && R[id]);
  const P = (f) => ids.map((id) => [f(R0[id]), f(R[id])]);
  const agree = (f) => +(P(f).filter(([a, b]) => a === b).length / ids.length * 100).toFixed(1);
  const conf = (f, pos) => { const p = P(f); return { tp: p.filter(([a, b]) => a === pos && b === pos).length, fp: p.filter(([a, b]) => a !== pos && b === pos).length, fn: p.filter(([a, b]) => a === pos && b !== pos).length }; };
  const runs = {};
  for (const id of ids) { const run = set.images.find((i) => i.id === id).run; const r = (runs[run] = runs[run] || { ref: { W: 0, D: 0 }, rater: { W: 0, D: 0 }, n: 0 }); r.n++; if (R0[id].c === "WRONG") r.ref.W++; if (R0[id].k === "NONE") r.ref.D++; if (R[id].c === "WRONG") r.rater.W++; if (R[id].k === "NONE") r.rater.D++; }
  const verdict = (x) => (x.W <= 1 && x.D <= 5 ? "PASS" : "FAIL");
  const runRows = Object.entries(runs).map(([run, r]) => ({ run, ref: verdict(r.ref), rater: verdict(r.rater), refWD: `${r.ref.W}/${r.ref.D}`, raterWD: `${r.rater.W}/${r.rater.D}` }));
  report[name] = {
    items: ids.length,
    agreement: { correctness: agree((v) => v.c), contribution: agree((v) => v.k), explains: agree((v) => v.e), wrongFlag: agree((v) => v.c === "WRONG"), deadFlag: agree((v) => v.k === "NONE") },
    kappa: { correctness: kappa(P((v) => v.c), ["CORRECT", "NEUTRAL", "WRONG"]), contribution: kappa(P((v) => v.k), ["ADDS", "TEXT_ONLY", "NONE"]) },
    WRONG: conf((v) => v.c, "WRONG"), DEAD: conf((v) => v.k, "NONE"),
    totals: { refCORRECT: ids.filter((id) => R0[id].c === "CORRECT").length, raterCORRECT: ids.filter((id) => R[id].c === "CORRECT").length, refADDS: ids.filter((id) => R0[id].k === "ADDS").length, raterADDS: ids.filter((id) => R[id].k === "ADDS").length },
    runs: runRows,
    runVerdictMatches: `${runRows.filter((r) => r.ref === r.rater).length}/${runRows.length}`,
    falsePASS: runRows.filter((r) => r.ref === "FAIL" && r.rater === "PASS").map((r) => r.run),
    falseFAIL: runRows.filter((r) => r.ref === "PASS" && r.rater === "FAIL").map((r) => r.run),
  };
}
console.log(JSON.stringify({ set: WHICH, report }, null, 1));
if (args.out) fs.writeFileSync(args.out, JSON.stringify({ set: WHICH, report }, null, 1));
