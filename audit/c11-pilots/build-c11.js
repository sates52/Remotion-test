#!/usr/bin/env node
// Cycle 11 A/B build (experiment tooling). Per item x arm a mini Antidote config: the source book's PREVIOUS scene + the
// beat's scene, re-timed from 0 (so continuity into the beat is the film's own), caption layer off. Arm A = the committed
// production scene unchanged. Arm B = the same, with the beat's scene replaced by the director contract compiled onto it
// (scripts/lib/semantic-director.js) — a contract that does not validate is NOT drawn: B counts as a failure (blank).
//   node audit/c11-pilots/build-c11.js --items=<benchmark.json or list> --contracts=<dir of <ID>.json> --out=<dir>
// Output: <out>/configs/<ID>-<arm>.json, <out>/frames.json (30 / 60 / 90 % of the beat), <out>/compile-log.json
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const D = require(path.join(ROOT, "scripts", "lib", "semantic-director.js"));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const items = (() => { const j = JSON.parse(fs.readFileSync(path.resolve(args.items), "utf8")); return j.items || j; })();
const OUT = path.resolve(args.out);
fs.mkdirSync(path.join(OUT, "configs"), { recursive: true });
const frames = {}, log = {};
for (const it of items) {
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, "books", it.slug, "config.antidote.json"), "utf8"));
  const i = it.beat, prev = i > 0 ? src.scenes[i - 1] : null, cur = src.scenes[i];
  const off = prev ? prev.fromFrame : cur.fromFrame;
  const shift = (s) => ({ ...s, fromFrame: s.fromFrame - off });
  const A = [prev, cur].filter(Boolean).map(shift);
  const total = A[A.length - 1].fromFrame + A[A.length - 1].durationFrames;
  const cfgOf = (scenes) => ({ ...src, scenes, captions: [], totalFrames: total, meta: { ...(src.meta || {}), durationInFrames: total } });
  const curA = A[A.length - 1];
  frames[it.id] = [0.3, 0.6, 0.9].map((p) => Math.round(curA.fromFrame + p * curA.durationFrames));
  fs.writeFileSync(path.join(OUT, "configs", `${it.id}-A.json`), JSON.stringify(cfgOf(A)));
  const cp = args.contracts && path.join(path.resolve(args.contracts), `${it.id}.json`);
  if (!cp || !fs.existsSync(cp)) { log[it.id] = { status: "no-contract" }; continue; }
  let c;
  try { c = JSON.parse(fs.readFileSync(cp, "utf8")); } catch (e) { log[it.id] = { status: "invalid-json", error: String(e.message) }; continue; }
  const cast = Object.keys((src.meta && src.meta.cast) || {});
  const castNames = Object.entries((src.meta && src.meta.cast) || {}).flatMap(([k, v]) => [k, (v && v.name) || ""]).filter(Boolean);
  const errors = D.validate(c, { narration: it.narration, cast, castNames });
  if (errors.length) { log[it.id] = { status: "invalid", errors }; continue; }
  const B = A.slice(0, -1).concat([D.compile(c, curA)]);
  fs.writeFileSync(path.join(OUT, "configs", `${it.id}-B.json`), JSON.stringify(cfgOf(B)));
  log[it.id] = { status: "compiled", type: c.type, representation: c.representation, entities: (c.entities || []).length, events: (c.events || []).length };
}
fs.writeFileSync(path.join(OUT, "frames.json"), JSON.stringify(frames, null, 1));
fs.writeFileSync(path.join(OUT, "compile-log.json"), JSON.stringify(log, null, 1));
const tally = Object.values(log).reduce((m, x) => ((m[x.status] = (m[x.status] || 0) + 1), m), {});
console.log(`built ${items.length} items → ${OUT}`, tally);
