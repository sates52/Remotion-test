#!/usr/bin/env node
// Cycle 13 human video package: 10 passages x 2 silent clips (production A / single-relation capability B), blind.
//   node audit/c13/human-video.js --pilot=<pilot build dir> --clips=<fetched dir with clips/> --out=<dir>
// Writes <out>/send/ (index.html + clips/Pnn-X.mp4, Pnn-Y.mp4 — the ONLY folder that goes to raters) and
// <out>/private/ (order.json = X / Y → arm per passage, scoring.md + answer key extract — NEVER sent to raters).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const PIL = path.resolve(args.pilot), CL = path.resolve(args.clips), OUT = path.resolve(args.out);
const KEY = path.join(__dirname, "..", "..", "..", "wt-c12", "audit", "c12-pilots", "answer-key.json");
const ak = Object.fromEntries(JSON.parse(fs.readFileSync(KEY, "utf8")).items.map((x) => [x.id, x]));
const { passages } = JSON.parse(fs.readFileSync(path.join(PIL, "pilot.json"), "utf8"));
const h = (s) => crypto.createHash("sha256").update(s).digest();
const SEND = path.join(OUT, "send"), PRIV = path.join(OUT, "private");
fs.mkdirSync(path.join(SEND, "clips"), { recursive: true }); fs.mkdirSync(PRIV, { recursive: true });
// passage order: seeded shuffle (not the benchmark order); X / Y: seeded coin per passage
const ordered = passages.slice().sort((a, b) => h(`hv-order|${a.id}`).compare(h(`hv-order|${b.id}`)));
const order = {}, key = {};
ordered.forEach((p, i) => {
  const n = `P${String(i + 1).padStart(2, "0")}`;
  const flip = h(`hv-xy|${p.id}`)[0] & 1;
  const X = flip ? "B" : "A", Y = flip ? "A" : "B";
  order[n] = { id: p.id, X, Y };
  for (const [lab, arm] of [["X", X], ["Y", Y]]) {
    const src = path.join(CL, "clips", `${p.id}-${arm}-d.mp4`);
    if (!fs.existsSync(src)) throw new Error(`missing clip ${src}`);
    fs.copyFileSync(src, path.join(SEND, "clips", `${n}-${lab}.mp4`));
  }
  const k = ak[p.id];
  key[n] = { understanding: k.understanding, cause: k.cause, effect: k.effect, supportsCausality: k.supportsCausality, wrong: k.wrong || k.wrongInferences || [], notAsserted: k.notAsserted || [] };
});
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const Q = [["seen", "1. What happened on screen? (describe what you saw)"], ["changed", "2. What changed, and who or what made it change?"],
  ["message", "3. In one sentence: what point is the video making?"], ["unclear", "4. Was anything confusing, ambiguous or possibly misleading? What?"]];
const block = (n, lab) => `<div class="clip"><h3>Video ${lab}</h3><video src="clips/${n}-${lab}.mp4" controls muted playsinline preload="metadata"></video>
${Q.map(([k, q]) => `<label>${esc(q)}<textarea data-k="${n}.${lab}.${k}"></textarea></label>`).join("\n")}</div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Muted Video Study</title>
<style>:root{--bg:#fff;--fg:#1d1d1f;--mut:#6b6b70;--line:#d9d9de;--acc:#2f5bd3}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141416;--fg:#f2f2f4;--mut:#a0a0a8;--line:#34343a;--acc:#7d9bff}}
body{background:var(--bg);color:var(--fg);font:16px/1.45 system-ui,sans-serif;max-width:1100px;margin:0 auto;padding:16px}
video{width:100%;border:1px solid var(--line);border-radius:8px;background:#000}textarea{display:block;width:100%;min-height:3.2em;margin:4px 0 12px;background:transparent;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:6px;box-sizing:border-box}
section{border-top:2px solid var(--line);padding:16px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media (max-width:760px){.pair{grid-template-columns:1fr}}
label{color:var(--fg)}.mut{color:var(--mut)}button{background:var(--acc);color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:16px;cursor:pointer}input[type=text]{padding:6px;border:1px solid var(--line);border-radius:6px;background:transparent;color:var(--fg)}</style></head>
<body><h1>Muted video study</h1>
<p>Each scene comes from an animated video that explains a book. You will see each scene twice, made in two different ways (Video X and Video Y). <b>There is no sound on purpose.</b> Watch each video (you may replay it), then answer from what you saw. There are no right or wrong answers about taste — we want to know what you understood. Do not look anything up.</p>
<p class="mut">About ${ordered.length * 2 * 2} minutes. Your answers stay in this page until you press “Download my answers” at the bottom, then send that file back.</p>
<p>Your name or initials: <input type="text" id="rater"></p>
${ordered.map((p, i) => { const n = `P${String(i + 1).padStart(2, "0")}`; return `<section><h2>Scene ${i + 1} of ${ordered.length}</h2><div class="pair">${block(n, "X")}${block(n, "Y")}</div>
<p>Which video made the point clearer? <label><input type="radio" name="${n}.choice" value="X"> X</label> <label><input type="radio" name="${n}.choice" value="Y"> Y</label> <label><input type="radio" name="${n}.choice" value="same"> about the same</label>
&nbsp; How sure are you (1–5)? <input type="number" min="1" max="5" data-k="${n}.confidence" style="width:4em"></p></section>`; }).join("\n")}
<p><button id="dl">Download my answers</button> <span class="mut" id="msg"></span></p>
<script>
const save=()=>{try{const o={};document.querySelectorAll("[data-k]").forEach(e=>o[e.dataset.k]=e.value);document.querySelectorAll("input[type=radio]:checked").forEach(e=>o[e.name]=e.value);o.rater=document.getElementById("rater").value;localStorage.setItem("mvs-draft",JSON.stringify(o))}catch(e){}};
try{const o=JSON.parse(localStorage.getItem("mvs-draft")||"{}");document.querySelectorAll("[data-k]").forEach(e=>{if(o[e.dataset.k]!=null)e.value=o[e.dataset.k]});document.querySelectorAll("input[type=radio]").forEach(e=>{if(o[e.name]===e.value)e.checked=true});if(o.rater)document.getElementById("rater").value=o.rater}catch(e){}
document.addEventListener("input",save);document.addEventListener("change",save);
document.getElementById("dl").onclick=()=>{const o={study:"c13-muted-video",version:1,rater:document.getElementById("rater").value,finishedAt:new Date().toISOString(),answers:{}};
document.querySelectorAll("[data-k]").forEach(e=>o.answers[e.dataset.k]=e.value);document.querySelectorAll("input[type=radio]:checked").forEach(e=>o.answers[e.name]=e.value);
const empty=Object.entries(o.answers).filter(([k,v])=>/\\.(seen|message)$/.test(k)&&!String(v).trim()).length;
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:"application/json"}));a.download="answers-"+(o.rater||"rater").replace(/[^a-z0-9]+/gi,"-")+".json";a.click();
document.getElementById("msg").textContent=empty?empty+" required answers are still empty — you can fill them and download again.":"Saved. Please send the downloaded file back.";};
</script></body></html>`;
fs.writeFileSync(path.join(SEND, "index.html"), html);
fs.writeFileSync(path.join(SEND, "README.txt"), `Muted video study — instructions for the rater\n\n1. Unzip this folder anywhere.\n2. Open index.html in Chrome, Edge or Firefox (double-click). The videos are in the clips folder next to it.\n3. Watch each pair of silent videos and answer the questions (about ${ordered.length * 4} minutes).\n4. Press "Download my answers" at the end and send the downloaded answers-<name>.json back.\nPlease do not discuss the videos with other raters until everyone has finished.\n`);
fs.writeFileSync(path.join(PRIV, "order.json"), JSON.stringify(order, null, 1));
fs.writeFileSync(path.join(PRIV, "answer-key.json"), JSON.stringify(key, null, 1));
fs.writeFileSync(path.join(PRIV, "scoring.md"), `# Scoring the muted video study (scorer only — never sent to raters)

Inputs: the raters' answers-*.json, \`answer-key.json\` (frozen cycle-12 key per passage), \`order.json\` (X / Y → arm).
Score BLIND: score every answer against the key without opening order.json; unblind only to tally.

Per video (each rater, each passage, X and Y):
- **message** — MATCH (states the key's understanding) / PARTIAL (its subject or half of it) / MISS.
- **cause**, **effect** (only when the key's supportsCausality is not false) — CORRECT / WRONG / NOT_SHOWN, from answers 1–3.
- **whatChanged** — CORRECT / WRONG / NOT_SHOWN / NA (who or what changed matches the key's effect).
- **finalConsequence** — YES / NO / NA (the rater states the key's final consequence).
- **wrongInference** — YES if the rater states something the key lists as wrong, a not-asserted part as true, or a cause the narration does not state.
- Primary = mean(cause, effect, message) with MATCH 1 / PARTIAL 0.5; message only when the key states no causality (same as the agent tally).
Per passage: the forced choice (X / Y / same) and confidence, unblinded to A / B after scoring.

Two scorers score independently; report kappa; settle disagreements by discussion and log them.
If an AGENT scores the human answers, label every number "human descriptions / agent scoring" — never "human result".
Report human results separately from the agent dense-frame results; with 2–3 raters this is a direction check, not a SHIP measure.
`);
console.log(`human video package: ${ordered.length} passages → ${SEND} (send) + ${PRIV} (private)`);
