// Faz 2 vs Faz 2b (silhouette fix) on the same 30 timestamps, per-item X/Y coin flip.
const fs = require("fs");
const path = require("path");
const A = __dirname;
const ROOT = path.join(A, "..", "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "books/we-were-liars/config.antidote.json"), "utf8"));
const read = (p) => JSON.parse(fs.readFileSync(path.join(A, p), "utf8"));
const frameOf = (f) => +f.match(/-f(\d+)\.png/)[1];
const byFrame = (desc, key) => Object.fromEntries(desc.map((d) => [frameOf(key[d.img]), d]));
const F1 = byFrame(read("../faz2/blind.json"), read("../faz2/mute-key.json"));
const F2 = byFrame(read("blind.json"), read("mute-key.json"));
const narr = (f) => cfg.captions.filter((k) => k.endFrame >= f - 150 && k.startFrame <= f + 150).map((k) => k.text).join(" ");
const pick = (d) => ({ sees: d.sees, message: d.message, wouldConfuse: d.wouldConfuse });
let seed = 991177;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const key = {};
const items = Object.keys(F2).map(Number).sort((a, b) => a - b).map((f, n) => {
  const f2IsX = rnd() < 0.5;
  const id = `item-${String(n + 1).padStart(2, "0")}`;
  key[id] = { frame: f, f2IsX };
  return { id, t: `${(f / 30).toFixed(1)}s`, narration: narr(f), X: pick(f2IsX ? F2[f] : F1[f]), Y: pick(f2IsX ? F1[f] : F2[f]) };
});
fs.writeFileSync(path.join(A, "judge-input.json"), JSON.stringify(items, null, 2));
fs.writeFileSync(path.join(A, "judge-key.json"), JSON.stringify(key, null, 2));
console.log(`${items.length} items`);
