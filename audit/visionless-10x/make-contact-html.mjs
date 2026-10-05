/**
 * make-contact-html.mjs — Visionless-10x scratch: rebuild the P5 contact-sheet
 * HTML so it embeds the actual rendered stills.
 *
 * The stills on disk are `NN-<book>-<sceneId>.png` (suspect rank prefix);
 * scripts/p5-contact-sheet.mjs's findStill only tries `<book>-<sceneId>.png`,
 * so nothing matched. This scratch generator knows the NN- prefix and writes
 * audit/visionless-10x/contact-sheet.html with relative img srcs, the
 * GOOD / WRONG / UNCERTAIN radios and a copy-verdicts-JSON button.
 *
 * Usage: node audit/visionless-10x/make-contact-html.mjs
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const dir = path.join(root, "audit", "visionless-10x");
const gate = JSON.parse(fs.readFileSync(path.join(dir, "p3-gate.json"), "utf8"));
const suspects = (gate.suspects || []).slice(0, 20);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const chip = (flag) => {
  const cls = /IDLE_WALLPAPER|INTENT_NOT_STAGED|IDLE_ACTOR/.test(flag) ? "bad"
    : /GENERIC|DUPLICATE|TRUNCATED|EMPTY/.test(flag) ? "warn"
    : "info";
  return `<span class="chip ${cls}">${esc(flag)}</span>`;
};

let embedded = 0;
const rows = suspects.map((s, i) => {
  const nn = String(i + 1).padStart(2, "0");
  // Use the 640x360 thumbnails: 20 full-res 1920x1080 PNGs stall Chrome's
  // main thread on decode. Full-res files remain under stills/.
  const file = `stills-thumb/${nn}-${s.book}-${s.sceneId}.png`;
  const full = `stills/${nn}-${s.book}-${s.sceneId}.png`;
  const has = fs.existsSync(path.join(dir, file));
  if (has) embedded++;
  return { ...s, nn, img: has ? file : null, full };
});

const cards = rows.map((r, i) => `
<article class="card" id="c${i}">
  <header>
    <span class="idx">#${i + 1}</span>
    <strong>${esc(r.book)}</strong>
    <span class="scene">${esc(r.sceneId)} · frame ${r.captureFrame} · score ${r.score}</span>
  </header>
  <div class="imgbox">${r.img
    ? `<a href="${r.full}" target="_blank" title="open full-res 1920x1080"><img src="${r.img}" alt="#${i + 1} ${esc(r.sceneId)}"></a>`
    : `<div class="pending">still missing: ${esc(r.nn)}-${esc(r.book)}-${esc(r.sceneId)}.png</div>`}</div>
  <p class="narration">“${esc(r.narration)}”</p>
  <div class="meta">${esc(r.archetype)} · shot: ${esc(r.shot)} · ${r.flags.length ? r.flags.map(chip).join(" ") : '<span class="chip info">flagged by score</span>'}</div>
  <div class="verdict">
    <label><input type="radio" name="v${i}" value="GOOD">GOOD</label>
    <label><input type="radio" name="v${i}" value="WRONG">WRONG</label>
    <label><input type="radio" name="v${i}" value="UNCERTAIN">UNCERTAIN</label>
  </div>
</article>`).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>P5 Visionless Contact Sheet — ${rows.length} suspects (with stills)</title>
<style>
  :root { color-scheme: dark; }
  body { background:#101216; color:#e8eaed; font:14px/1.45 system-ui, sans-serif; margin:0; padding:24px; }
  h1 { font-size:18px; margin:0 0 4px; } .sub { color:#9aa0a6; margin-bottom:18px; max-width:110ch; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:14px; }
  .card { background:#181b20; border:1px solid #2a2f36; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px; }
  .card header { display:flex; flex-wrap:wrap; gap:6px; align-items:baseline; font-size:12px; }
  .idx { color:#fbbc04; font-weight:700; font-size:15px; }
  .scene { color:#9aa0a6; }
  .imgbox { background:#0b0d10; border-radius:6px; overflow:hidden; }
  .imgbox img { width:100%; height:auto; display:block; }
  .pending { color:#5f6368; font-size:10px; padding:10px; word-break:break-all; }
  .narration { margin:0; font-size:12px; color:#c8cbd0; font-style:italic; }
  .meta { font-size:11px; color:#9aa0a6; }
  .chip { display:inline-block; border-radius:999px; padding:1px 8px; font-size:10px; margin-right:4px; border:1px solid; }
  .chip.bad { color:#f28b82; border-color:#f28b82; }
  .chip.warn { color:#fdd663; border-color:#fdd663; }
  .chip.info { color:#8ab4f8; border-color:#8ab4f8; }
  .verdict { display:flex; gap:14px; font-size:12px; border-top:1px solid #2a2f36; padding-top:8px; margin-top:auto; }
  .toolbar { position:sticky; top:0; background:#101216ee; padding:10px 0; z-index:2; }
  button { background:#8ab4f8; color:#0b0d10; border:0; border-radius:6px; padding:7px 14px; font-weight:700; cursor:pointer; }
  code { background:#0b0d10; border-radius:4px; padding:1px 5px; }
</style>
</head>
<body>
<h1>P5 Visionless Contact Sheet — ${rows.length} most suspicious production scenes</h1>
<div class="sub">Stills embedded: ${embedded}/${rows.length}. Judge each frame blind: GOOD (render matches intent) / WRONG (render contradicts or ignores it) / UNCERTAIN. Then click <b>Copy verdicts as JSON</b> and paste the result back to the agent. Combined grid: <code>audit/visionless-10x/contact-sheet.png</code>.</div>
<div class="toolbar"><button onclick="copyVerdicts()">Copy verdicts as JSON</button> <span id="count">0/${rows.length} judged</span></div>
<div class="grid">
${cards}
</div>
<script>
  const meta = ${JSON.stringify(rows.map((r) => ({ nn: r.nn, book: r.book, sceneId: r.sceneId, captureFrame: r.captureFrame, flags: r.flags, score: r.score })))};
  document.addEventListener("change", updateCount);
  function updateCount() {
    const n = document.querySelectorAll("input[type=radio]:checked").length;
    document.getElementById("count").textContent = n + "/" + meta.length + " judged";
  }
  function copyVerdicts() {
    const verdicts = meta.map((m, i) => {
      const sel = document.querySelector('input[name="v' + i + '"]:checked');
      return { ...m, verdict: sel ? sel.value : "UNJUDGED" };
    });
    navigator.clipboard.writeText(JSON.stringify({ contactSheet: "P5 visionless", judgedAt: new Date().toISOString(), verdicts }, null, 2))
      .then(() => { document.getElementById("count").textContent = "copied ✓ — paste back to the agent"; })
      .catch(() => prompt("Copy manually:", JSON.stringify(verdicts.map(v => ({ nn: v.nn, sceneId: v.sceneId, verdict: v.verdict })))));
  }
  updateCount();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(dir, "contact-sheet.html"), html);
console.log(`contact-sheet.html: ${rows.length} cards, ${embedded}/${rows.length} stills embedded`);
process.exit(0);
