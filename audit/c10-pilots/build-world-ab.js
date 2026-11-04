#!/usr/bin/env node
// Builds the two arms of the cycle-10 world-state A/B from world-passages.json (experiment tooling, branch dev/c10).
//   node audit/c10-pilots/build-world-ab.js --out=<dir>
// Per passage x arm: a mini Antidote config (the source book's 3 scenes: timing, set, cast bible; texts, diagrams,
// icons, chapter cards and relationship staging removed in BOTH arms so only the authored object staging differs;
// captions off) → <out>/configs/<P>-<arm>.json, and <out>/frames.json (75 % of each beat). Arm B is compiled by
// scripts/lib/world-state.js; any compiler error stops the build (no teleport / duplication is ever rendered).
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const { compileWorld } = require(path.join(ROOT, "scripts", "lib", "world-state.js"));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out || path.join(__dirname, "build"));
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, "world-passages.json"), "utf8"));
fs.mkdirSync(path.join(OUT, "configs"), { recursive: true });

const who = (c) => c.identity || c.role;
const frames = {};
const report = [];
for (const P of spec.passages) {
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, "books", P.slug, "config.antidote.json"), "utf8"));
  const art = JSON.parse(fs.readFileSync(path.join(ROOT, "books", P.slug, "art.json"), "utf8"));
  const beats = art.beats || art;
  let t = 0;
  const base = P.beats.map((bi, k) => {
    const s0 = src.scenes[bi];
    const sh = P.shared[k];
    const chars = sh.cast.map((id, j) => {
      const from = (s0.characters || []).find((c) => who(c) === id) || {};
      // the look comes from the cast bible (role); staging, action and objects are authored per arm below
      const { x, y, scale, action, holds, says, actionAt, travel, emotion, emotionAt, poseAt, restsOn, ...look } = from;
      return { ...look, id: `${id}-${k}`, role: from.role || id, identity: id, enter: k === 0 ? (look.enter || "fade") : "none", action: "idle" };
    });
    const scene = {
      ...s0, id: `${P.id}-b${k}`, fromFrame: t, shot: sh.shot, characters: chars, props: [], texts: [],
      diagram: undefined, chapterCard: undefined, relationshipStaging: undefined, hud: undefined, attention: undefined, visualArc: undefined,
      transition: { type: "cut", frames: 0 }, continueFromPrev: k > 0 ? true : undefined, carryState: undefined, _narration: beats[bi] && beats[bi].narration,
    };
    t += s0.durationFrames;
    return scene;
  });
  const total = t;
  frames[P.id] = base.map((s) => Math.round(s.fromFrame + 0.75 * s.durationFrames));
  const apply = (scenes, perBeat) => scenes.map((s, k) => {
    const b = perBeat[k] || {};
    const sc = JSON.parse(JSON.stringify(s));
    for (const c of sc.characters) Object.assign(c, (b.chars || {})[who(c)] || {});
    if (b.props) sc.props = b.props.map((p) => ({ at: 0, enter: "none", ...p }));
    return sc;
  });
  const cfgOf = (scenes) => ({ ...src, scenes, captions: [], totalFrames: total, meta: { ...(src.meta || {}), durationInFrames: total } });
  // arm A: the current vocabulary as authored
  const A = apply(base, P.A);
  fs.writeFileSync(path.join(OUT, "configs", `${P.id}-A.json`), JSON.stringify(cfgOf(A)));
  // arm B: base actions, then the world compiled into holds / restsOn / deeds
  const B0 = apply(base, P.B.beats);
  const comp = compileWorld(B0, P.B.world, P.B.beats);
  if (comp.errors.length) { console.error(`❌ ${P.id}: world errors\n  ${comp.errors.join("\n  ")}`); process.exit(1); }
  fs.writeFileSync(path.join(OUT, "configs", `${P.id}-B.json`), JSON.stringify(cfgOf(comp.scenes)));
  report.push({ id: P.id, frames: frames[P.id], total, worldTrace: comp.trace });
}
fs.writeFileSync(path.join(OUT, "frames.json"), JSON.stringify(frames, null, 1));
fs.writeFileSync(path.join(OUT, "build-report.json"), JSON.stringify(report, null, 1));
console.log(`built ${spec.passages.length} passages x 2 arms → ${OUT}; world compiler: 0 errors (no teleport, no duplication)`);
for (const r of report) console.log(`  ${r.id}: ${r.worldTrace.map((x) => `[${x.deeds.join("; ") || "-"}] ${JSON.stringify(x.after)}`).join(" → ")}`);
