#!/usr/bin/env node
// Cycle 13 dense-frame pilot + human video build (diagnostic, development data from cycle 12 — never ship evidence).
//   node audit/c13/build-pilot.js --out=<dir>
// Passages: cycle-12 MAIN beats whose frozen key states causality and whose cycle-12 Director 1.0 contract is type A, B
// or H (the capability's scope), first 10 by id that the capability validates. Arm A = the production scene unchanged;
// arm B = that Director 1.0 contract as a single-relation/1 contract (content unchanged; claim added from the frozen
// key: asserted + only those notAsserted texts that are verbatim in the narration — an "ideal claim author" bound,
// logged), drawn by the capability with meta.singleRelation on.
// Per passage x arm: <id>-<arm>-s (3 frames at 30/60/90 %, strip), <id>-<arm>-d (every 15th frame of the beat = 2 fps,
// grid, + a silent clip of the beat, at most 12 s, ending at the beat's end). Determinism: two jobs rendered twice (-r2).
"use strict";
const fs = require("fs");
const path = require("path");
const R = require("../../scripts/lib/single-relation");
const ROOT = path.join(__dirname, "..", "..");
const C12 = path.join(ROOT, "..", "wt-c12", "audit", "c12-pilots");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
const N = 10, FPS = 30, MAX_CLIP = 12 * FPS;
const bench = JSON.parse(fs.readFileSync(path.join(C12, "benchmark.json"), "utf8")).items;
const key = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(C12, "answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
const norm = (s) => String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
fs.mkdirSync(path.join(OUT, "configs"), { recursive: true });
const picked = [], log = {}, jobs = [];
for (const it of bench.filter((b) => b.set === "main")) {
  if (picked.length >= N) break;
  const k = key[it.id];
  if (k.supportsCausality === false) { log[it.id] = { skipped: "key states no causality" }; continue; }
  const cB = JSON.parse(fs.readFileSync(path.join(C12, "contractsB", `${it.id}.json`), "utf8"));
  if (!R.TYPES.includes(cB.type)) { log[it.id] = { skipped: `Director 1.0 type ${cB.type} is outside the capability (A / B / H)` }; continue; }
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, "books", it.slug, "config.antidote.json"), "utf8"));
  const castObj = (src.meta && src.meta.cast) || {};
  const ctx = { narration: it.narration, cast: Object.keys(castObj), castNames: Object.entries(castObj).flatMap(([kk, v]) => [kk, (v && v.name) || ""]).filter(Boolean),
    castLabels: Object.fromEntries(Object.entries(castObj).map(([kk, v]) => [kk, (v && v.name) || kk])) };
  const naAll = k.notAsserted || [];
  const na = naAll.filter((n) => norm(it.narration).includes(norm(n.text)));
  const c = { ...cB, schema: R.SCHEMA, claim: { asserted: k.asserted || k.understanding, polarity: "asserted", speaker: k.speaker || "narrator", notAsserted: na } };
  delete c.representation;
  const errors = R.validate(c, ctx);
  log[it.id] = { type: c.type, notAssertedFromKey: naAll.length, notAssertedVerbatim: na.length, errors };
  if (errors.length) continue;
  const prev = src.scenes[it.beat - 1], cur = src.scenes[it.beat];
  const off = prev ? prev.fromFrame : cur.fromFrame;
  const A = [prev, cur].filter(Boolean).map((s) => ({ ...s, fromFrame: s.fromFrame - off }));
  const curA = A[A.length - 1];
  const total = curA.fromFrame + curA.durationFrames;
  const cfgOf = (scenes, on) => { const cfg = { ...src, scenes, captions: [], totalFrames: total, meta: { ...(src.meta || {}), durationInFrames: total } }; return on ? R.enable(cfg) : cfg; };
  const cfg = { A: cfgOf(A, false), B: cfgOf(A.slice(0, -1).concat([R.compile(c, curA)]), true) };
  const s3 = [0.3, 0.6, 0.9].map((p) => Math.round(curA.fromFrame + p * curA.durationFrames));
  const dense = []; for (let f = curA.fromFrame; f < total; f += FPS / 2) dense.push(f);
  const clip = { from: Math.max(curA.fromFrame, total - MAX_CLIP), to: total - 1 };
  for (const arm of ["A", "B"]) {
    fs.writeFileSync(path.join(OUT, "configs", `${it.id}-${arm}.json`), JSON.stringify(cfg[arm]));
    jobs.push({ id: `${it.id}-${arm}-s`, config: `configs/${it.id}-${arm}.json`, frames: s3, strip: true });
    jobs.push({ id: `${it.id}-${arm}-d`, config: `configs/${it.id}-${arm}.json`, frames: dense, grid: { cols: 6, width: 480 }, clip });
  }
  picked.push({ id: it.id, slug: it.slug, beat: it.beat, type: c.type, durationFrames: curA.durationFrames, strip: s3, dense: dense.length, clip });
}
// determinism: the same job twice (capability arm and production arm), compared by sha256 after the fetch
for (const id of picked.slice(0, 2).map((p) => p.id)) for (const arm of ["A", "B"]) {
  const j = jobs.find((x) => x.id === `${id}-${arm}-s`);
  jobs.push({ ...j, id: `${id}-${arm}-s-r2` });
}
fs.writeFileSync(path.join(OUT, "pilot.json"), JSON.stringify({ schema: "c13-pilot/1", passages: picked, log }, null, 1));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ schema: "stills/1", name: "c13 dense-frame pilot + human clips", composition: "Antidote-lab", entry: "src/index.ts", silent: true, shards: 10, jobs }, null, 1));
console.log(`passages ${picked.length}: ${picked.map((p) => `${p.id}(${p.type})`).join(" ")}`);
for (const [id, l] of Object.entries(log)) if (l.skipped || (l.errors && l.errors.length)) console.log(`  ${id}: ${l.skipped || l.errors.join(" | ")}`);
console.log(`jobs ${jobs.length}, stills ${jobs.reduce((s, j) => s + j.frames.length, 0)}, clip frames ${jobs.reduce((s, j) => s + (j.clip ? j.clip.to - j.clip.from + 1 : 0), 0)}`);
