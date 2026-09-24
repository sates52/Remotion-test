#!/usr/bin/env node
/**
 * mute-test.js — the quality metric, as commands. A muted viewer must understand
 * the narration from the picture. Gate PASS is not evidence of that (the old WWL
 * config passed every gate and a blind judge found 9/30 frames WRONG).
 *
 *   node scripts/mute-test.js prep  --slug=<slug> [--label=run1] [--n=30] [--frames-from=<label>]
 *       stratified sample -> stills -> caption band cropped -> shuffled
 *       -> audit/mute/<slug>/<label>/{mute/img-NN.png, key.json, sample.json, PROMPTS.md}
 *   (a blind agent writes .../<label>/blind.json — prompt in PROMPTS.md)
 *   node scripts/mute-test.js judge --slug=<slug> --label=run1 [--vs=<label>]
 *       -> judge-input.json (+ judge-key.json); prompt appended to PROMPTS.md
 *   (a judge agent writes .../<label>/judge-result.json)
 *   node scripts/mute-test.js tally --slug=<slug> --label=run1
 *       -> totals, PASS/FAIL vs the bars, appended to books/<slug>/mute-test.json
 *
 * Bars (pre-registered): WRONG <= 1 per 30, image ADDS >= 60%.
 * --vs compares two runs on the SAME frames with one judge (judges differ by ~±4
 * on identical frames; only within-judge comparisons are meaningful).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CMD = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
const SLUG = args.slug;
const LABEL = args.label || "run1";
if (!["prep", "judge", "tally"].includes(CMD) || !SLUG) {
  console.error("Usage: node scripts/mute-test.js prep|judge|tally --slug=<slug> [--label=run1] [--n=30] [--frames-from=<label>] [--vs=<label>]");
  process.exit(1);
}
const BARS = { wrongPer30: 1, addsMin: 0.6 };
const BOOK = path.join(ROOT, "books", SLUG);
const DIR = (label) => path.join(ROOT, "audit", "mute", SLUG, label);
const OUT = DIR(LABEL);
const readJSON = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } };
const cfgPath = fs.existsSync(path.join(BOOK, "config.antidote.json")) ? path.join(BOOK, "config.antidote.json") : path.join(BOOK, "config.vox.json");
const cfg = readJSON(cfgPath);
if (!cfg) { console.error(`❌ no config for ${SLUG}`); process.exit(1); }
const units = (cfg.scenes || cfg.beats || []).filter((s) => s.id !== "intro" && s.type !== "title");
const frameOfFile = (f) => +f.match(/-f(\d+)\.png/)[1];

// seeded PRNG — the sample is reproducible
function rng(seed) { let x = seed >>> 0; return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); }

function narrationAt(f) {
  return (cfg.captions || []).filter((k) => k.endFrame >= f - 150 && k.startFrame <= f + 150).map((k) => k.text).join(" ");
}

function prep() {
  fs.mkdirSync(path.join(OUT, "mute"), { recursive: true });
  let sample;
  if (args["frames-from"]) {
    sample = readJSON(path.join(DIR(args["frames-from"]), "sample.json"));
    if (!sample) { console.error(`❌ no sample.json in label ${args["frames-from"]}`); process.exit(1); }
  } else {
    const n = parseInt(args.n || "30", 10);
    const bible = readJSON(path.join(BOOK, "story-bible.json"), {});
    const end = units.length ? units[units.length - 1].fromFrame + units[units.length - 1].durationFrames : 0;
    // strata: the story bible's acts, or five equal time bins
    const spine = Array.isArray(bible.spine) && bible.spine.length ? bible.spine.map((a) => a.fromFrame) : [0, 1, 2, 3, 4].map((k) => Math.round((end * k) / 5));
    const strata = spine.map((from, k) => [from, spine[k + 1] ?? Infinity]);
    const per = Math.ceil(n / strata.length);
    const rnd = rng(parseInt(args.seed || "20260924", 10));
    sample = [];
    for (const [a, z] of strata) {
      const pool = units.filter((u) => u.fromFrame >= a && u.fromFrame < z);
      const chosen = new Set();
      while (chosen.size < Math.min(per, pool.length)) chosen.add(pool[Math.floor(rnd() * pool.length)]);
      chosen.forEach((u) => sample.push({ id: u.id, frame: Math.round(u.fromFrame + u.durationFrames * 0.7) }));
    }
    sample = sample.sort((p, q) => p.frame - q.frame).slice(0, n);
  }
  fs.writeFileSync(path.join(OUT, "sample.json"), JSON.stringify(sample, null, 1));
  // stills: render-sequence-stills takes <unitId>:<frame>; the id only names the file
  const frames = sample.map((s) => `${(cfg.scenes || cfg.beats).find((u) => s.frame >= u.fromFrame && s.frame < u.fromFrame + u.durationFrames)?.id || s.id}:${s.frame}`).join(",");
  const stillsRoot = path.join("audit", "mute", SLUG, LABEL, "stills");
  console.log(`rendering ${sample.length} stills (one bundle, several minutes) ...`);
  execFileSync(process.execPath, ["scripts/render-sequence-stills.js", `--slug=${SLUG}`, `--frames=${frames}`, `--out=${stillsRoot}`], { cwd: ROOT, stdio: "inherit" });
  const D = path.join(ROOT, stillsRoot, SLUG);
  const files = fs.readdirSync(D).filter((f) => f.endsWith(".png"));
  const rnd = rng(parseInt(args.seed || "20260924", 10) ^ 0x5bd1e995);
  const order = files.map((f) => [f, rnd()]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const key = {};
  order.forEach((f, k) => {
    const id = `img-${String(k + 1).padStart(2, "0")}.png`;
    key[id] = f;
    // the caption band would give the narration away
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(D, f), "-vf", "crop=iw:ih*0.76:0:0", path.join(OUT, "mute", id)]);
  });
  fs.writeFileSync(path.join(OUT, "key.json"), JSON.stringify(key, null, 2));
  const imgDir = path.join(OUT, "mute");
  fs.writeFileSync(path.join(OUT, "PROMPTS.md"), `# Mute test — ${SLUG} / ${LABEL}

## 1. Blind describer (a fresh agent; it must not know the book)
You are a blind rater in a mute test. You will look at ${order.length} still frames from an animated explainer video with NO audio and NO other context. Do not read any other files in the repository — only the images listed below. Do not search the repo, do not open JSON/config files, do not look at sibling folders.

Images (read each with the Read tool): ${path.join(imgDir, "img-01.png")} through img-${String(order.length).padStart(2, "0")}.png in the same folder.

For EACH image, write: "sees" (literal description: people, what they do, their faces, objects, text, diagram, setting; 1-3 sentences), "message" (what the narrator is saying at this moment, one sentence, from the image only), "confidence" (low/medium/high), "wouldConfuse" (anything that could mislead, or "none").

Write ONLY a JSON array [{"img":"img-01.png","sees":"...","message":"...","confidence":"...","wouldConfuse":"..."}, ...] to ${path.join(OUT, "blind.json")}. Verify it parses and has ${order.length} entries. Reply with one line: "written ${order.length}".

## 2. Then
    node scripts/mute-test.js judge --slug=${SLUG} --label=${LABEL}
`);
  console.log(`\n✓ ${path.relative(ROOT, OUT)} — ${order.length} frames. Give PROMPTS.md §1 to a fresh agent.`);
}

function describe(label) {
  const blind = readJSON(path.join(DIR(label), "blind.json"));
  const key = readJSON(path.join(DIR(label), "key.json"));
  if (!blind || !key) { console.error(`❌ ${label}: blind.json or key.json missing`); process.exit(1); }
  return Object.fromEntries(blind.map((d) => [frameOfFile(key[d.img]), { sees: d.sees, message: d.message, wouldConfuse: d.wouldConfuse }]));
}

const JUDGE_RULES = `For each item give:
A. correctness — CORRECT (the viewer's understood message matches the narration), NEUTRAL (neither matches nor contradicts: just a person, abstract/empty), WRONG (suggests a different or opposite meaning: unrelated object, wrong emotion over tragedy, emphasis where the narration rejects, etc.).
B. contribution — ADDS (the image itself — people's actions/expressions, objects, icons, not only copied text — conveys something the narration means), TEXT_ONLY (only on-screen text carries meaning), NONE.
One short reason each. Be strict and literal; do not reward a version for being prettier or busier.`;

function judge() {
  const A = describe(LABEL);
  const vs = args.vs ? describe(args.vs) : null;
  const rnd = rng(0xC0FFEE);
  const key = {};
  const items = Object.keys(A).map(Number).sort((a, b) => a - b).map((f, n) => {
    const id = `item-${String(n + 1).padStart(2, "0")}`;
    const base = { id, t: `${(f / 30).toFixed(1)}s`, narration: narrationAt(f) };
    if (!vs) { key[id] = { frame: f }; return { ...base, V: A[f] }; }
    if (!vs[f]) { console.error(`❌ frame ${f} missing in ${args.vs} — use --frames-from=${args.vs} when preparing ${LABEL}`); process.exit(1); }
    const thisIsX = rnd() < 0.5;
    key[id] = { frame: f, thisIsX, vs: args.vs };
    return { ...base, X: thisIsX ? A[f] : vs[f], Y: thisIsX ? vs[f] : A[f] };
  });
  fs.writeFileSync(path.join(OUT, "judge-input.json"), JSON.stringify(items, null, 2));
  fs.writeFileSync(path.join(OUT, "judge-key.json"), JSON.stringify(key, null, 2));
  const shape = vs ? `{"items":[{"id":"item-01","X":{"correctness":"...","why":"...","contribution":"...","whyC":"..."},"Y":{...}}, ...]}` : `{"items":[{"id":"item-01","V":{"correctness":"...","why":"...","contribution":"...","whyC":"..."}}, ...]}`;
  fs.appendFileSync(path.join(OUT, "PROMPTS.md"), `
## 3. Judge (a fresh agent)
You are an impartial judge in a mute test of an animated book-summary video. Read ONLY this file: ${path.join(OUT, "judge-input.json")}. Do NOT open any other file (never judge-key.json, key.json, books/, scripts/, or image folders).
Each item has the narration spoken around a moment and ${vs ? "two blind descriptions (X and Y, assigned randomly per item) of two versions" : "a blind description (V)"} of what a viewer with the sound OFF saw.
${JUDGE_RULES}
Write ONLY JSON to ${path.join(OUT, "judge-result.json")}: ${shape} (${items.length} items). Verify it parses. Reply with one line: "written ${items.length}".

## 4. Then
    node scripts/mute-test.js tally --slug=${SLUG} --label=${LABEL}
`);
  console.log(`✓ judge-input.json (${items.length} items${vs ? `, vs ${args.vs}` : ""}). Give PROMPTS.md §3 to a fresh agent.`);
}

function tally() {
  const r = readJSON(path.join(OUT, "judge-result.json"));
  const key = readJSON(path.join(OUT, "judge-key.json"));
  if (!r || !key) { console.error("❌ judge-result.json / judge-key.json missing"); process.exit(1); }
  const tOf = Object.fromEntries((readJSON(path.join(OUT, "judge-input.json"), []) || []).map((x) => [x.id, x.t]));
  const T = {}, V = {};
  const bump = (t, x) => { t[x.correctness] = (t[x.correctness] || 0) + 1; t[x.contribution] = (t[x.contribution] || 0) + 1; };
  const weak = [];
  for (const it of r.items) {
    const k = key[it.id];
    const mine = it.V || (k.thisIsX ? it.X : it.Y);
    bump(T, mine);
    if (k.vs) bump(V, k.thisIsX ? it.Y : it.X);
    if (mine.correctness !== "CORRECT" || mine.contribution !== "ADDS") weak.push(`${tOf[it.id] || it.id} ${mine.correctness}/${mine.contribution} — ${mine.why} | ${mine.whyC}`);
  }
  const n = r.items.length;
  const wrong = T.WRONG || 0, adds = (T.ADDS || 0) / n;
  const pass = wrong <= Math.floor((BARS.wrongPer30 * n) / 30) && adds >= BARS.addsMin;
  const summary = { label: LABEL, date: new Date().toISOString(), n, totals: T, ...(args.vs || Object.values(key)[0]?.vs ? { vs: Object.values(key)[0].vs, vsTotals: V } : {}), bars: BARS, pass };
  fs.writeFileSync(path.join(OUT, "totals.json"), JSON.stringify(summary, null, 2));
  const hist = readJSON(path.join(BOOK, "mute-test.json"), { runs: [] });
  hist.runs = hist.runs.filter((x) => x.label !== LABEL).concat([summary]);
  fs.writeFileSync(path.join(BOOK, "mute-test.json"), JSON.stringify(hist, null, 2) + "\n");
  console.log(`${SLUG}/${LABEL}: CORRECT ${T.CORRECT || 0} · NEUTRAL ${T.NEUTRAL || 0} · WRONG ${wrong} · ADDS ${T.ADDS || 0}/${n} (${Math.round(adds * 100)}%) → ${pass ? "PASS" : "FAIL"}`);
  if (summary.vsTotals) console.log(`   vs ${summary.vs}: CORRECT ${V.CORRECT || 0} · WRONG ${V.WRONG || 0} · ADDS ${V.ADDS || 0}/${n}`);
  if (weak.length) { console.log("   not CORRECT+ADDS:"); weak.forEach((w) => console.log("   - " + w)); }
}

({ prep, judge, tally })[CMD]();
