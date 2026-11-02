// P1 primary: build the official --vs judge input per passage x replicate: items in FRAME order, each with the narration
// and the A and B descriptions as X/Y (random per item, seeded), the key kept OUTSIDE the judge's folder.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const S = __dirname, P = path.join(S, "p1-primary");
const meta = JSON.parse(fs.readFileSync(path.join(S, "p1-primary-key.json"), "utf8"));
const passages = ["RR1", "RR2", "BL1", "BL2", "HT1", "HT2", "MI1", "MI2"];
const keyOut = {};
for (const p of passages) for (const rep of [1, 2]) {
  const blind = {};
  for (const arm of ["A", "B"]) {
    const b = JSON.parse(fs.readFileSync(path.join(P, `${p}-${arm}`, `blind-${rep}.json`), "utf8"));
    const m = meta[`${p}-${arm}`];
    if (b.length !== m.length || new Set(b.map((x) => x.img)).size !== m.length) throw new Error(`${p}-${arm} rep ${rep}: blind does not cover the images one-to-one`);
    blind[arm] = Object.fromEntries(m.map((x) => { const d = b.find((y) => y.img === x.img); return [x.frame, { sees: d.sees, message: d.message, wouldConfuse: d.wouldConfuse }]; }));
  }
  const frames = meta[`${p}-A`].map((x) => x.frame).sort((a, b) => a - b);
  const items = [], key = {};
  frames.forEach((f, n) => {
    const id = `item-${String(n + 1).padStart(2, "0")}`;
    const xIsA = parseInt(crypto.createHash("sha256").update(`c7p1|${p}|${rep}|${f}`).digest("hex").slice(0, 8), 16) % 2 === 0;
    const narration = meta[`${p}-A`].find((x) => x.frame === f).narration;
    items.push({ id, t: `${(f / 30).toFixed(1)}s`, narration, X: xIsA ? blind.A[f] : blind.B[f], Y: xIsA ? blind.B[f] : blind.A[f] });
    key[id] = { frame: f, X: xIsA ? "A" : "B", Y: xIsA ? "B" : "A" };
  });
  const jd = path.join(P, `judge-${p}-${rep}`);
  fs.mkdirSync(jd, { recursive: true });
  fs.writeFileSync(path.join(jd, "judge-input.json"), JSON.stringify(items, null, 2));
  keyOut[`${p}-${rep}`] = key;
}
fs.writeFileSync(path.join(S, "p1-judge-key.json"), JSON.stringify(keyOut, null, 1));
console.log("judge inputs:", Object.keys(keyOut).length);
