#!/usr/bin/env node
// Cycle 13 four-strip calibration verdict, exactly as pre-registered (preregistration-c13.json → fourStripCalibration).
//   node audit/c13/calib-compare.js --calib=<dir> --c12=<cycle-12 rating dir>
"use strict";
const fs = require("fs");
const path = require("path");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const CAL = path.resolve(args.calib), C12 = path.resolve(args.c12);
const KEY = path.join(__dirname, "..", "..", "..", "wt-c12", "audit", "c12-pilots", "answer-key.json");
const ak = Object.fromEntries(JSON.parse(fs.readFileSync(KEY, "utf8")).items.map((x) => [x.id, x]));
const up = (s) => String(s || "").toUpperCase().trim();
const score = (r, causal) => { const m = up(r.message) === "MATCH" ? 1 : up(r.message) === "PARTIAL" ? 0.5 : 0; return causal ? ((up(r.cause) === "CORRECT") + (up(r.effect) === "CORRECT") + m) / 3 : m; };
const load = (dir, sub) => { const o = { 1: {}, 2: {} }; for (const p of [1, 2]) { const d = path.join(dir, `${sub}${p}`); for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".json"))) for (const r of JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))) o[p][r.img] = r; } return o; };
const neu = load(CAL, "judge-out-p"), old = load(C12, "judge-out-p");
const { key } = JSON.parse(fs.readFileSync(path.join(CAL, "blind-key.json"), "utf8"));
const rows = [];
for (const [name, k] of Object.entries(key)) {
  const causal = ak[k.id].supportsCausality !== false;
  const m = (o, n) => { const s = [1, 2].filter((p) => o[p][n]).map((p) => score(o[p][n], causal)); return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null; };
  rows.push({ strip: `${k.id}-${k.arm}`, four: m(neu, name), single: m(old, k.c12name), msgFour: up((neu[1][name] || {}).message), msgSingle: up((old[1][k.c12name] || {}).message) });
}
const d = rows.filter((r) => r.four != null && r.single != null).map((r) => r.four - r.single);
let seed = 13; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const boots = []; for (let i = 0; i < 10000; i++) { let s = 0; for (let j = 0; j < d.length; j++) s += d[Math.floor(rnd() * d.length)]; boots.push(s / d.length); }
boots.sort((a, b) => a - b);
const pp = (x) => Math.round(x * 1000) / 10;
const meanD = pp(d.reduce((a, b) => a + b, 0) / d.length), ci90 = [pp(boots[499]), pp(boots[9499])];
const agree = rows.filter((r) => r.msgFour && r.msgFour === r.msgSingle).length / rows.length;
const invalid = Number(args.invalid || 0);
const crit = { zeroInvalid: invalid === 0, meanWithin10: Math.abs(meanD) <= 10, ci90Within20: ci90[0] >= -20 && ci90[1] <= 20, messageAgree60: agree >= 0.6 };
const res = { n: d.length, meanFour: pp(rows.reduce((s, r) => s + (r.four || 0), 0) / rows.length), meanSingle: pp(rows.reduce((s, r) => s + (r.single || 0), 0) / rows.length),
  meanDeltaPP: meanD, ci90PP: ci90, messageAgreement: Math.round(agree * 100) / 100, invalid, criteria: crit, verdict: Object.values(crit).every(Boolean) ? "EQUIVALENT" : "NOT EQUIVALENT", rows };
fs.writeFileSync(path.join(CAL, "calibration.json"), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ ...res, rows: undefined }, null, 1));
