// Pairwise judge input: per scene, narration + the blind description of A and of B, shuffled to X/Y with
// a seeded coin; versions hidden from the judge; the key is written separately.
const fs = require("fs"), path = require("path");
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/ab-sandbox";
const AB = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/ab";
const DROP = new Set(["the-art-of-saying-no/scene-159"]);
let x = 20261017; const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
const descOf = (slug, label) => {
  const dir = path.join(SB, "audit", "framecheck", slug, label);
  const key = JSON.parse(fs.readFileSync(path.join(dir, "key.json"), "utf8"));
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => /^blind-\d+\.json$/.test(f)))
    for (const d of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) { const still = key[d.img]; out[still.replace(/-f\d+\.png$/, "")] = { sees: d.sees, text: d.text, message: d.message }; }
  return out;
};
const items = [], keyOut = {};
for (const slug of ["burn-of-the-everflame", "the-art-of-saying-no"]) {
  const cfg = JSON.parse(fs.readFileSync(path.join(SB, "books", slug, "config.antidote.json"), "utf8"));
  const A = descOf(slug, "abA"), B = descOf(slug, "abB");
  for (const id of Object.keys(A).filter((id) => B[id] && !DROP.has(`${slug}/${id}`)).sort()) {
    const s = cfg.scenes.find((q) => q.id === id);
    const narration = (cfg.captions || []).filter((k) => k.endFrame >= s.fromFrame - 60 && k.startFrame <= s.fromFrame + s.durationFrames + 60).map((k) => k.text).join(" ");
    const aIsX = rnd() < 0.5;
    const pid = `pair-${String(items.length + 1).padStart(2, "0")}`;
    keyOut[pid] = { slug, scene: id, X: aIsX ? "A" : "B", Y: aIsX ? "B" : "A" };
    items.push({ id: pid, narration, X: aIsX ? A[id] : B[id], Y: aIsX ? B[id] : A[id] });
  }
}
// pairs in a shuffled order so book and scene order give nothing away
const order = items.map((it) => [it, rnd()]).sort((p, q) => p[1] - q[1]).map((p) => p[0]);
fs.writeFileSync(path.join(AB, "pair-input.json"), JSON.stringify(order, null, 2));
fs.writeFileSync(path.join(AB, "pair-key.json"), JSON.stringify(keyOut, null, 2));
console.log(`${order.length} pairs; A shown as X in ${Object.values(keyOut).filter((k) => k.X === "A").length}`);
