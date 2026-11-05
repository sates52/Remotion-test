#!/usr/bin/env node
// Cycle 12 A/B/C build (experiment tooling). Per item x arm a mini Antidote config: the source book's PREVIOUS scene + the
// beat's scene, re-timed from 0, caption layer off (as build-c11.js). A = the committed production scene unchanged.
// B = a v1 contract compiled by scripts/lib/semantic-director.js (Director 1.0, frozen). C = a v2 contract compiled by
// scripts/lib/semantic-director-v2.js. A contract that does not validate is NOT drawn (that arm's failure).
//   node audit/c12-pilots/build-c12.js --items=audit/c12-pilots/benchmark.json --contractsB=<dir> --contractsC=<dir> --out=<dir>
// Output: <out>/configs/<ID>-<arm>.json, <out>/frames.json (30 / 60 / 90 %), <out>/compile-log.json, <out>/manifest.json
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const COMPILERS = { B: require(path.join(ROOT, "scripts", "lib", "semantic-director.js")), C: require(path.join(ROOT, "scripts", "lib", "semantic-director-v2.js")) };
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const items = (() => { const j = JSON.parse(fs.readFileSync(path.resolve(args.items), "utf8")); return j.items || j; })();
const OUT = path.resolve(args.out);
fs.mkdirSync(path.join(OUT, "configs"), { recursive: true });
const frames = {}, log = {}, jobs = [];
for (const it of items) {
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, "books", it.slug, "config.antidote.json"), "utf8"));
  const i = it.beat, prev = i > 0 ? src.scenes[i - 1] : null, cur = src.scenes[i];
  const off = prev ? prev.fromFrame : cur.fromFrame;
  const A = [prev, cur].filter(Boolean).map((s) => ({ ...s, fromFrame: s.fromFrame - off }));
  const curA = A[A.length - 1];
  const total = curA.fromFrame + curA.durationFrames;
  const cfgOf = (scenes) => ({ ...src, scenes, captions: [], totalFrames: total, meta: { ...(src.meta || {}), durationInFrames: total } });
  frames[it.id] = [0.3, 0.6, 0.9].map((p) => Math.round(curA.fromFrame + p * curA.durationFrames));
  fs.writeFileSync(path.join(OUT, "configs", `${it.id}-A.json`), JSON.stringify(cfgOf(A)));
  jobs.push({ id: `${it.id}-A`, config: `configs/${it.id}-A.json`, frames: frames[it.id], strip: true });
  const cast = Object.keys((src.meta && src.meta.cast) || {});
  const castNames = Object.entries((src.meta && src.meta.cast) || {}).flatMap(([k, v]) => [k, (v && v.name) || ""]).filter(Boolean);
  log[it.id] = {};
  for (const arm of ["B", "C"]) {
    const dir = args["contracts" + arm];
    const cp = dir && path.join(path.resolve(dir), `${it.id}.json`);
    if (!cp || !fs.existsSync(cp)) { log[it.id][arm] = { status: "no-contract" }; continue; }
    let c;
    try { c = JSON.parse(fs.readFileSync(cp, "utf8")); } catch (e) { log[it.id][arm] = { status: "invalid-json", error: String(e.message) }; continue; }
    const D = COMPILERS[arm];
    const errors = D.validate(c, { narration: it.narration, cast, castNames, durationFrames: curA.durationFrames });
    if (errors.length) { log[it.id][arm] = { status: "invalid", errors }; continue; }
    fs.writeFileSync(path.join(OUT, "configs", `${it.id}-${arm}.json`), JSON.stringify(cfgOf(A.slice(0, -1).concat([D.compile(c, curA)]))));
    jobs.push({ id: `${it.id}-${arm}`, config: `configs/${it.id}-${arm}.json`, frames: frames[it.id], strip: true });
    log[it.id][arm] = { status: "compiled", type: c.type, fallbackReason: c.fallbackReason, polarity: c.claim && c.claim.polarity, entities: (c.entities || []).length, events: (c.events || []).length };
  }
}
fs.writeFileSync(path.join(OUT, "frames.json"), JSON.stringify(frames, null, 1));
fs.writeFileSync(path.join(OUT, "compile-log.json"), JSON.stringify(log, null, 1));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ schema: "stills/1", name: "c12 director A/B/C", composition: "Antidote-lab", entry: "src/index.ts", silent: true, jobs }, null, 1));
const tally = {};
for (const x of Object.values(log)) for (const [arm, v] of Object.entries(x)) tally[`${arm}:${v.status}`] = (tally[`${arm}:${v.status}`] || 0) + 1;
console.log(`built ${items.length} items, ${jobs.length} jobs → ${OUT}`, tally);
