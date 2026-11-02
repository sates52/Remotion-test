// P2: draw the FIXED calibration set (seeded, before any rating): 8 official Antidote runs, explains recorded,
// dated 2026-10-01 or later, one run per book, 4 recorded PASS + 4 recorded FAIL; split DEV (2 PASS + 2 FAIL: may be
// used to align a rubric) / TEST (2 PASS + 2 FAIL: rated once at the end, never used to change anything).
// Writes calib-set.json: per image { set, run, img, file, narration, ref: { correctness, contribution, explains } }.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const inv = JSON.parse(fs.readFileSync(path.join(__dirname, "calib-inventory.json"), "utf8"));
let seed = parseInt(crypto.createHash("sha256").update("c7-calibration").digest("hex").slice(0, 8), 16);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ok = inv.filter((x) => x.explains && x.date && x.date >= "2026-10-01");
const pickDistinct = (list, n, used) => { const out = []; for (const x of shuffle(list)) { const b = x.id.split("/")[0]; if (used.has(b)) continue; used.add(b); out.push(x); if (out.length === n) break; } return out; };
const used = new Set();
const pass = pickDistinct(ok.filter((x) => x.pass), 4, used), fail = pickDistinct(ok.filter((x) => !x.pass), 4, used);
const runs = [...pass.map((x, i) => ({ ...x, set: i < 2 ? "dev" : "test" })), ...fail.map((x, i) => ({ ...x, set: i < 2 ? "dev" : "test" }))];
const J = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const frameOf = (f) => { const m = String(f).match(/-f(\d+)\.png$/); return m ? +m[1] : null; };
const images = [];
for (const r of runs) {
  const key = J(path.join(r.dir, "key.json")), jk = J(path.join(r.dir, "judge-key.json")), ji = J(path.join(r.dir, "judge-input.json")), jr = J(path.join(r.dir, "judge-result.json"));
  const items = jr.items || jr;
  for (const [img, still] of Object.entries(key)) {
    const f = frameOf(still);
    const itemId = Object.keys(jk).find((k) => jk[k].frame === f);
    const inp = ji.find((x) => x.id === itemId), res = items.find((x) => x.id === itemId);
    if (!inp || !res) throw new Error(`${r.id} ${img}: no judge item for frame ${f}`);
    images.push({ set: r.set, run: r.id, recordedPass: r.pass, img, file: path.join(r.dir, "mute", img), narration: inp.narration, refDescription: { sees: inp.V.sees, message: inp.V.message }, ref: { correctness: res.V.correctness, contribution: res.V.contribution, explains: res.V.explains ?? null } });
  }
}
fs.writeFileSync(path.join(__dirname, "calib-set.json"), JSON.stringify({ drawn: "seeded sha256('c7-calibration')", runs: runs.map((r) => ({ id: r.id, set: r.set, pass: r.pass, judged: r.judged })), images }, null, 1));
for (const r of runs) console.log(r.set, r.pass ? "PASS" : "FAIL", r.id, JSON.stringify(r.judged));
console.log("images", images.length);
