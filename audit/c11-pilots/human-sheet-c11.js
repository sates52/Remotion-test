#!/usr/bin/env node
// Builds the 30-item human reference sheet (not run in cycle 11 — see human-reference.md).
//   node audit/c11-pilots/human-sheet-c11.js --out=<rating dir>
// Reads <out>/blind-key.json + <out>/blind/*.png; writes <out>/human/human-sheet.html (images next to it as X / Y per
// beat, order by a seeded coin) and <out>/human/human-order.json (the X / Y → arm mapping; NEVER given to raters).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
const main = JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c11-pilots/benchmark.json"), "utf8")).items.filter((x) => x.set === "main");
const H = path.join(OUT, "human");
fs.mkdirSync(H, { recursive: true });
const order = {};
const rows = main.map((it, k) => {
  const nameOf = (arm) => Object.keys(key).find((n) => key[n].id === it.id && key[n].arm === arm);
  const flip = crypto.createHash("sha256").update(`human|${it.id}`).digest()[0] & 1;
  const X = flip ? "B" : "A", Y = flip ? "A" : "B";
  order[`S${k + 1}`] = { id: it.id, X, Y };
  for (const [lab, arm] of [["X", X], ["Y", Y]]) { const n = nameOf(arm); if (n) fs.copyFileSync(path.join(OUT, "blind", `${n}.png`), path.join(H, `S${k + 1}-${lab}.png`)); }
  const q = (lab) => `<div class="strip"><h3>${lab}</h3><img src="S${k + 1}-${lab}.png" alt="strip ${lab}">
    <label>1. What do you see happen across the three frames?<textarea></textarea></label>
    <label>2. Did something change? What caused it? What was the result?<textarea></textarea></label>
    <label>3. In one sentence, what is the narrator saying here?<textarea></textarea></label>
    <label>4. Could anything here mislead you?<textarea></textarea></label></div>`;
  return `<section><h2>Scene ${k + 1}</h2>${q("X")}${q("Y")}
    <p>Which strip made the point clearer? <label><input type="radio" name="c${k}"> X</label> <label><input type="radio" name="c${k}"> Y</label>
    &nbsp; Confidence (1–5): <input type="number" min="1" max="5"></p></section>`;
});
fs.writeFileSync(path.join(H, "human-order.json"), JSON.stringify(order, null, 1));
fs.writeFileSync(path.join(H, "human-sheet.html"), `<!doctype html><meta charset="utf-8"><title>Muted Scenes Study</title>
<style>body{font:16px/1.4 system-ui,sans-serif;max-width:1000px;margin:0 auto;padding:16px}img{width:100%;border:1px solid #ccc}
textarea{display:block;width:100%;min-height:3em;margin:4px 0 10px}section{border-top:2px solid #333;padding:12px 0}</style>
<h1>Muted scenes</h1><p>Each scene comes from an animated explainer video about a book, watched with the sound OFF. Each strip shows three
moments of the same scene, left to right. Answer from what you see; there is no audio. Do not look anything up.</p>
${rows.join("\n")}`);
console.log(`human sheet: ${main.length} scenes → ${H}`);
