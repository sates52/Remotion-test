// Build the X/Y-blinded judge input for the 30-scene mute test.
// Set A = new (authored) config, set B = baseline (old heuristic config).
const fs = require("fs");
const path = require("path");
const A = __dirname;
const ROOT = path.join(A, "..", "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "books/we-were-liars/config.antidote.json"), "utf8"));
const read = (f) => JSON.parse(fs.readFileSync(path.join(A, f), "utf8"));
const frameOf = (f) => +f.match(/-f(\d+)\.png/)[1];
const byFrame = (desc, key) => Object.fromEntries(desc.map((d) => [frameOf(key[d.img]), d]));
const NEW = byFrame(read("blind-A.json"), read("mute-new-key.json"));
const BASE = byFrame(read("blind-B.json"), read("mute-base-key.json"));
// narration: every caption line within +-5s of the frame (the audio is identical in both versions)
const narr = (f) => cfg.captions.filter((k) => k.endFrame >= f - 150 && k.startFrame <= f + 150).map((k) => k.text).join(" ");
const pick = (d) => ({ sees: d.sees, message: d.message, wouldConfuse: d.wouldConfuse });
// a coin flip per item, so a judge cannot learn "X is always the good one"
let seed = 424242;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const key = {};
const items = Object.keys(NEW).map(Number).sort((a, b) => a - b).map((f, n) => {
  const newIsX = rnd() < 0.5;
  const id = `item-${String(n + 1).padStart(2, "0")}`;
  key[id] = { frame: f, newIsX };
  return { id, t: `${(f / 30).toFixed(1)}s`, narration: narr(f), X: pick(newIsX ? NEW[f] : BASE[f]), Y: pick(newIsX ? BASE[f] : NEW[f]) };
});
fs.writeFileSync(path.join(A, "judge-input.json"), JSON.stringify(items, null, 2));
fs.writeFileSync(path.join(A, "judge-key.json"), JSON.stringify(key, null, 2));
console.log(`${items.length} items (per-item X/Y coin flip; key in judge-key.json)`);
