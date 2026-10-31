#!/usr/bin/env node
/**
 * visual-ab.js — a blind visual A/B on a GitHub runner (or locally), cycle 6 (2026-10-31). No new orchestration:
 * the same mini books, frames, blind describer / strict judge and tally as the local A/B, with the Claude API as the
 * rater so it can run in the cloud.
 *
 *   node scripts/visual-ab.js render --manifest=<ab.json> --out=<dir>
 *       one Remotion bundle; per arm book the listed frames (captions off) → <out>/stills/<img>.png, hash-shuffled
 *       to img-NN.png; the arm key stays in <out>/key.json (never shown to a model)
 *   node scripts/visual-ab.js rate --manifest=<ab.json> --out=<dir> [--model=claude-haiku-5-5] [--k=2] [--max-usd=5]
 *       per image k describers (the image only, no narration, one image per request) and one judge per description
 *       (the description + that scene's narration, no image). Stops BEFORE a call that would pass --max-usd (measured
 *       tokens × price). Writes <out>/ratings.jsonl and <out>/usage/agent_usage.json ({ai_credits}, read by ai-budget).
 *   node scripts/visual-ab.js tally --manifest=<ab.json> --out=<dir>
 *       WRONG / DEAD / ADDS / EXPLAINS / CORRECT per arm and passage + the manifest's pre-registered ship rule →
 *       <out>/result.json
 *
 * Manifest: { "name", "rule": {"addsPlusPct": 13, "explainsNoLoss": true}, "passages": [{"id": "P1",
 *   "arms": {"A": "<slug>", "B": "<slug>"}, "frames": [..]}] } — frames are taken from arm A's config when omitted
 *   (one per scene at 60%, scenes > 60 frames).
 * Needs ANTHROPIC_API_KEY for `rate` (a GitHub secret on the runner). Never prints it.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.slice(2), true]; }));
const cmd = process.argv[2];
const OUT = path.resolve(args.out || "visual-ab-out");
const man = JSON.parse(fs.readFileSync(path.resolve(args.manifest), "utf8"));
const cfgOf = (slug) => JSON.parse(fs.readFileSync(path.join(ROOT, "books", slug, "config.antidote.json"), "utf8"));
const framesOf = (p) => p.frames || cfgOf(p.arms.A).scenes.filter((s) => /^scene-/.test(s.id) && s.durationFrames > 60).map((s) => Math.round(s.fromFrame + 0.6 * s.durationFrames));
const PRICE = { "claude-haiku-5-5": [0.10, 0.50], "claude-sonnet-5-5": [2.0, 10.0], "claude-opus-5-5": [5.0, 25.0] };

const DESCRIBE = "You are a blind viewer of a SILENT frame from an animated book-summary video. Look only at this one image. Describe everything you see (people: look, face, pose, action; objects; any diagram's structure; the setting; printed words), then say in one or two sentences what this frame tells a viewer. Printed words are part of the picture: report them, but also say what the drawing itself shows. Do not guess beyond what is visible. Reply as JSON: {\"sees\": \"...\", \"message\": \"...\"}";
const judgePrompt = (narr, d) => `You are a strict judge in a mute test of an animated book-summary video. A blind viewer saw one silent frame and wrote the description below. The narration spoken around that frame is:
"${narr}"
Judge ONLY this item against ONLY this narration.
- correctness: CORRECT / NEUTRAL / WRONG (WRONG only when the viewer's message contradicts the narration or asserts something false about it; vague or unrelated = NEUTRAL)
- contribution: ADDS (the drawing itself — people, objects, a diagram's structure, the setting — carries part of the meaning) / TEXT_ONLY (only the printed words carry it) / NONE (nothing useful: dead)
- explains: YES / PARTLY / NO (does the picture show how or why the idea works — a mechanism, cause, comparison or structure — not only its topic?)
Reply as JSON: {"correctness": "...", "contribution": "...", "explains": "...", "why": "..."}

VIEWER DESCRIPTION:
${JSON.stringify(d)}`;

async function render() {
  const { bundle } = require("@remotion/bundler");
  const { renderStill, selectComposition, openBrowser } = require("@remotion/renderer");
  const t0 = Date.now();
  fs.mkdirSync(path.join(OUT, "raw"), { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), webpackOverride: (c) => c });
  const tBundle = (Date.now() - t0) / 1000;
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
  const items = [];
  for (const p of man.passages) {
    const frames = framesOf(p);
    for (const [arm, slug] of Object.entries(p.arms)) {
      const cfg = cfgOf(slug);
      const inputProps = { config: { ...cfg, captions: [] } };
      const composition = await selectComposition({ serveUrl, id: `Antidote-${slug}`, puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 });
      for (const fr of frames) {
        const sc = cfg.scenes.find((s) => fr >= s.fromFrame && fr < s.fromFrame + s.durationFrames);
        const raw = path.join(OUT, "raw", `${slug}-f${fr}.png`);
        await renderStill({ composition, serveUrl, output: raw, frame: fr, imageFormat: "png", puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 });
        items.push({ raw, passage: p.id, arm, slug, frame: fr, scene: sc && sc.id, narration: (sc && (sc._narration || sc.narration)) || "" });
      }
    }
  }
  await browser.close({ silent: true });
  items.sort((a, b) => crypto.createHash("sha256").update(man.name + a.raw).digest("hex").localeCompare(crypto.createHash("sha256").update(man.name + b.raw).digest("hex")));
  fs.mkdirSync(path.join(OUT, "stills"), { recursive: true });
  const key = {};
  items.forEach((it, k) => { const img = `img-${String(k + 1).padStart(2, "0")}.png`; fs.copyFileSync(it.raw, path.join(OUT, "stills", img)); key[img] = { passage: it.passage, arm: it.arm, slug: it.slug, frame: it.frame, scene: it.scene, narration: it.narration }; });
  fs.rmSync(path.join(OUT, "raw"), { recursive: true, force: true });
  fs.writeFileSync(path.join(OUT, "key.json"), JSON.stringify(key, null, 1));
  const timing = { bundleSec: tBundle, totalSec: (Date.now() - t0) / 1000, stills: items.length };
  fs.writeFileSync(path.join(OUT, "render-timing.json"), JSON.stringify(timing));
  console.log(`rendered ${items.length} stills in ${timing.totalSec.toFixed(0)} s (bundle ${tBundle.toFixed(0)} s)`);
}

async function call(model, content, maxTokens) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content }] }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return j;
    if (![429, 500, 529].includes(res.status)) throw new Error(`API ${res.status}: ${(j.error && j.error.type) || ""} ${(j.error && j.error.message) || ""}`.slice(0, 200));
    await new Promise((r) => setTimeout(r, attempt * 8000));
  }
  throw new Error("API failed after retries");
}
const jsonOf = (t) => { const s = String(t || ""); const a = s.indexOf("{"), b = s.lastIndexOf("}"); try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; } };

async function rate() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = args.model || "claude-haiku-5-5", K = +(args.k || 2), MAX = +(args["max-usd"] || 5);
  const [pin, pout] = PRICE[model] || PRICE["claude-sonnet-5-5"];
  const key = JSON.parse(fs.readFileSync(path.join(OUT, "key.json"), "utf8"));
  let usd = 0, inTok = 0, outTok = 0, calls = 0, stopped = null;
  const t0 = Date.now();
  const outFile = path.join(OUT, "ratings.jsonl"); fs.writeFileSync(outFile, "");
  const spend = (u) => { inTok += u.input_tokens || 0; outTok += u.output_tokens || 0; usd += ((u.input_tokens || 0) * pin + (u.output_tokens || 0) * pout) / 1e6; calls++; };
  const perCallMax = (4000 * pin + 1200 * pout) / 1e6;
  outer: for (const img of Object.keys(key).sort()) {
    const b64 = fs.readFileSync(path.join(OUT, "stills", img)).toString("base64");
    for (let k = 1; k <= K; k++) {
      if (usd + 2 * perCallMax > MAX) { stopped = `budget: $${usd.toFixed(3)} + the next pair would pass $${MAX}`; break outer; }
      const d = await call(model, [{ type: "image", source: { type: "base64", media_type: "image/png", data: b64 } }, { type: "text", text: DESCRIBE }], 900);
      spend(d.usage || {});
      const desc = jsonOf(d.content && d.content[0] && d.content[0].text) || { sees: String(d.content && d.content[0] && d.content[0].text || ""), message: "" };
      const j = await call(model, [{ type: "text", text: judgePrompt(key[img].narration, desc) }], 500);
      spend(j.usage || {});
      const verdict = jsonOf(j.content && j.content[0] && j.content[0].text) || {};
      fs.appendFileSync(outFile, JSON.stringify({ img, k, desc, judge: verdict }) + "\n");
    }
  }
  const usage = { model, calls, input_tokens: inTok, output_tokens: outTok, usd, ai_credits: usd / 0.01, seconds: (Date.now() - t0) / 1000, stopped, note: "measured from API usage × list price — an estimate of the bill" };
  fs.mkdirSync(path.join(OUT, "usage"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "usage", "agent_usage.json"), JSON.stringify(usage));
  console.log(`rated: ${calls} calls, $${usd.toFixed(4)}, ${usage.seconds.toFixed(0)} s${stopped ? " · STOPPED " + stopped : ""}`);
}

function tally() {
  const key = JSON.parse(fs.readFileSync(path.join(OUT, "key.json"), "utf8"));
  const rows = fs.readFileSync(path.join(OUT, "ratings.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).map((r) => ({ ...r, ...key[r.img] }));
  const up = (x) => String(x || "").toUpperCase();
  const agg = (f) => { const a = rows.filter(f); return { n: a.length, WRONG: a.filter((r) => up(r.judge.correctness) === "WRONG").length, CORRECT: a.filter((r) => up(r.judge.correctness) === "CORRECT").length, ADDS: a.filter((r) => up(r.judge.contribution) === "ADDS").length, DEAD: a.filter((r) => up(r.judge.contribution) === "NONE").length, EXPLAINS: a.filter((r) => /^(YES|PARTLY)$/.test(up(r.judge.explains))).length }; };
  const T = {};
  const ids = man.passages.map((p) => p.id);
  for (const arm of ["A", "B"]) { T[arm] = agg((r) => r.arm === arm); for (const p of ids) T[`${arm}:${p}`] = agg((r) => r.arm === arm && r.passage === p); }
  const rule = man.rule || {};
  const need = Math.ceil(((rule.addsPlusPct || 13) / 100) * T.A.n);
  const c = { wrongPerPassage: ids.every((p) => T[`B:${p}`].WRONG <= T[`A:${p}`].WRONG), deadPooled: T.B.DEAD <= T.A.DEAD, adds: T.B.ADDS >= T.A.ADDS + need, explainsNoLoss: rule.explainsNoLoss === false ? true : T.B.EXPLAINS >= T.A.EXPLAINS };
  const ship = Object.values(c).every(Boolean);
  const result = { name: man.name, totals: T, rule: { ...c, addsNeeded: need }, decision: ship ? "SHIP" : "NO SHIP", rows: rows.length };
  fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, null, 1));
}

(async () => {
  if (cmd === "render") await render();
  else if (cmd === "rate") await rate();
  else if (cmd === "tally") tally();
  else { console.error("usage: visual-ab.js render|rate|tally --manifest=<ab.json> --out=<dir>"); process.exit(2); }
})().catch((e) => { console.error(String(e.message || e).replace(/sk-ant-[A-Za-z0-9_-]+/g, "[key]")); process.exit(1); });
