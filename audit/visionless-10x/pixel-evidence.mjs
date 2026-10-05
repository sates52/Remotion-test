/**
 * pixel-evidence.mjs — Visionless-10x P6 scratch: pairwise aHash similarity
 * across the 20 suspect stills to test the "wallpaper template" hypothesis
 * (same composition shell, different wallpaper). Zero new deps: uses
 * scripts/lib/render-truth.js. Output: pixel-evidence.json + stdout table.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const rt = require(path.join(process.cwd(), "scripts", "lib", "render-truth.js"));

const dir = path.join(process.cwd(), "audit", "visionless-10x");
const gate = JSON.parse(fs.readFileSync(path.join(dir, "p3-gate.json"), "utf8"));
const suspects = gate.suspects.slice(0, 20);

const stills = [];
for (let i = 0; i < suspects.length; i++) {
  const s = suspects[i];
  const nn = String(i + 1).padStart(2, "0");
  const file = path.join(dir, "stills", `${nn}-${s.book}-${s.sceneId}.png`);
  if (!fs.existsSync(file)) { console.error("missing", file); process.exit(1); }
  const buf = fs.readFileSync(file);
  const decoded = rt.decodePng(buf);
  const metrics = rt.analyzeDecoded(decoded);
  stills.push({ nn, book: s.book, sceneId: s.sceneId, hash: { bits: metrics.hashBits }, metrics });
}

const ham = (a, b) => rt.hamming(a, b);

// pairwise
const pairs = [];
for (let i = 0; i < stills.length; i++) {
  for (let j = i + 1; j < stills.length; j++) {
    const d = ham(stills[i].hash, stills[j].hash);
    pairs.push({ a: stills[i].nn, b: stills[j].nn, sameBook: stills[i].book === stills[j].book, d });
  }
}
pairs.sort((x, y) => x.d - y.d);
const hist = { le10: 0, "11-18": 0, "19-26": 0, "27-34": 0, ge35: 0 };
for (const p of pairs) {
  if (p.d <= 10) hist.le10++;
  else if (p.d <= 18) hist["11-18"]++;
  else if (p.d <= 26) hist["19-26"]++;
  else if (p.d <= 34) hist["27-34"]++;
  else hist.ge35++;
}
const sameBook = pairs.filter((p) => p.sameBook);
const crossBook = pairs.filter((p) => !p.sameBook);
const avg = (arr) => Math.round(arr.reduce((s, p) => s + p.d, 0) / arr.length * 10) / 10;

const out = {
  n: stills.length,
  pairs: pairs.length,
  histogram: hist,
  avgHammingSameBook: avg(sameBook),
  avgHammingCrossBook: avg(crossBook),
  top20NearDuplicates: pairs.slice(0, 20),
  perStill: stills.map((s) => ({
    nn: s.nn, book: s.book, sceneId: s.sceneId,
    coverage: s.metrics.coverage,
    edgeDensity: s.metrics.edgeDensity,
    colorfulness: s.metrics.colorfulness,
    meanLuma: s.metrics.meanLuma,
    hashHex: s.metrics.hashHex,
  })),
};
fs.writeFileSync(path.join(dir, "pixel-evidence.json"), JSON.stringify(out, null, 2));
console.log("pairs:", pairs.length, "hist:", JSON.stringify(hist));
console.log("avgHamming sameBook:", out.avgHammingSameBook, " crossBook:", out.avgHammingCrossBook);
console.log("top-10 pairs:", JSON.stringify(pairs.slice(0, 10)));
console.log("→ audit/visionless-10x/pixel-evidence.json");
process.exit(0);
