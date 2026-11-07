// C19 A/B episodes (isolated copies — the books are never written): A = the production config's window as it is;
// B = the same window with ONLY the shot-planned beats replaced (lib/shot-plan.js). Silent, no captions.
const fs = require("fs"), path = require("path");
const WT = "C:/Users/savas/Cursor/Remotion/wt-cloud-stills", ROOT = "C:/Users/savas/Cursor/Remotion/test";
const { applyPlan } = require(WT + "/scripts/lib/shot-plan");
const OUT = __dirname;
const LOG_DX = Number(process.env.LOG_DX || 0), LOG_DY = Number(process.env.LOG_DY || 0);

// ── book-own icons (written into each isolated book copy's motifs.json too) ──
const LOG = { title: "", viewBox: "0 0 520 520", reads: "a log standing on a chopping block", paths: [
  { d: "M140 420 L380 420 L392 500 L128 500 Z", fill: "#7A5230", stroke: "ink", strokeWidth: 8, fixed: true },
  { d: "M150 412 Q260 392 370 412 Q260 432 150 412 Z", fill: "#C79A62", stroke: "ink", strokeWidth: 6, fixed: true },
  { d: "M205 200 L315 200 L315 405 L205 405 Z", fill: "#9C6B3C", stroke: "ink", strokeWidth: 8 },
  { d: "M205 200 Q260 176 315 200 Q260 224 205 200 Z", fill: "#E2B985", stroke: "ink", strokeWidth: 6 },
  { d: "M240 200 Q260 192 280 200 Q260 208 240 200 Z", fill: "none", stroke: "#8A5A2B", strokeWidth: 4 }] };
const SHOE = { title: "", viewBox: "0 0 520 520", reads: "a running shoe lying on the ground", paths: [
  { d: "M120 400 L120 330 Q150 300 200 310 L270 340 Q340 352 380 372 Q420 392 414 420 L120 420 Z", fill: "#E07A2E", stroke: "ink", strokeWidth: 10 },
  { d: "M112 412 L420 412 L420 440 L112 440 Z", fill: "#F4F1EA", stroke: "ink", strokeWidth: 8 }] };
const CERBERUS = { title: "", viewBox: "0 0 520 520", reads: "a giant three-headed dog", paths: [
  { d: "M120 300 Q120 230 200 225 L340 225 Q420 230 420 300 L420 380 L380 380 L380 460 L350 460 L350 390 L190 390 L190 460 L160 460 L160 380 L120 380 Z", fill: "#3B2F2A", stroke: "ink", strokeWidth: 8 },
  { d: "M150 230 Q120 150 175 120 Q215 105 230 150 Q236 190 205 235 Z", fill: "#3B2F2A", stroke: "ink", strokeWidth: 8 },
  { d: "M235 215 Q220 120 265 95 Q305 80 315 130 Q318 175 290 220 Z", fill: "#3B2F2A", stroke: "ink", strokeWidth: 8 },
  { d: "M310 230 Q315 150 365 130 Q410 120 410 170 Q405 210 365 240 Z", fill: "#3B2F2A", stroke: "ink", strokeWidth: 8 },
  { d: "M180 150 l10 0 M262 120 l10 0 M370 160 l10 0", stroke: "#F2C14E", strokeWidth: 10 },
  { d: "M420 300 Q470 260 470 210", fill: "none", stroke: "ink", strokeWidth: 14 }] };
const BALL = { title: "", viewBox: "0 0 520 520", reads: "a red rubber ball", paths: [{ d: "M260 300 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0", fill: "#D7263D", stroke: "ink", strokeWidth: 8 }] };

const prop = (svg, x, y, scale, extra = {}) => ({ type: "customSvg", customSvg: svg, x, y, scale, enter: "none", at: 0, ...extra });
const cam = { zoom: [1, 1], panX: [0, 0], panY: [0, 0] };
const person = (identity, o = {}) => ({ id: `${identity}-c`, rig: "everyman", identity, role: identity, enter: "none", lookAt: "viewer", silhouette: false, body: "full", expression: "neutral", action: "idle", ...o });

function windowOf(cfg, a, b) {
  const off = cfg.scenes.findIndex((s) => s._shotPlan ? false : true) >= 0 ? null : null;
  const first = cfg.scenes.find((s) => s.id === `scene-${a}` || s.id === `scene-${a}-shot1`);
  const lastIdx = cfg.scenes.map((s) => s.id).lastIndexOf(cfg.scenes.filter((s) => s.id === `scene-${b}` || s.id.startsWith(`scene-${b}-shot`)).slice(-1)[0].id);
  const from = first.fromFrame, firstIdx = cfg.scenes.indexOf(first);
  const scenes = cfg.scenes.slice(firstIdx, lastIdx + 1).map((s) => ({ ...s, fromFrame: s.fromFrame - from }));
  const last = scenes[scenes.length - 1], total = last.fromFrame + last.durationFrames;
  return { ...cfg, scenes, captions: [], audioEvents: [], totalFrames: total, meta: { ...cfg.meta, durationInFrames: total }, _window: { from, beats: [a, b] } };
}
const load = (slug) => JSON.parse(fs.readFileSync(`${ROOT}/books/${slug}/config.antidote.json`, "utf8"));

// ── 1. BURN #20–#22 (window #17–#25) ──
function burn() {
  const c = load("burn-of-the-everflame"), shore = (s) => ({ ...c.scenes[s].bg, set: "shore" });
  // "rough, untamed, dark beard from weeks on the road" (#22): the same full beard in every shot of B
  const L = (o = {}) => person("luther", { expression: "angry", variant: { beard: "full" }, ...o });
  const logAt = (extra) => prop(LOG, 1010 + LOG_DX, 770 + LOG_DY, 0.8, extra);
  const base = (i, o) => ({ shot: "wide", bg: shore(i), camera: cam, texts: [], props: [], ...o });
  const plan = [
    { sceneIndex: 20, shots: [
      { scene: { ...c.scenes[20], id: undefined } },
      { at: "Luther", scene: base(20, { characters: [L({ action: "hold", holds: "axe", expression: "neutral" })], props: [logAt()] }) } ] },
    { sceneIndex: 21, shots: [
      { scene: base(21, { characters: [L({ action: "hold", holds: "axe" })], props: [logAt()] }) },
      { at: "Swing,", cues: { 0: "strike," }, scene: base(21, { characters: [L({ action: "chop", holds: "axe" })], props: [logAt({ motion: "split", motionAt: null, splitAt: 0.5, splitBase: 0.78 })] }) },
      { at: "He", scene: base(21, { characters: [L({ action: "hold", holds: "axe", lookAt: "viewer" })], props: [logAt({ motion: "split", motionAt: -30, splitAt: 0.5, splitBase: 0.78 })] }) } ] },
    { sceneIndex: 22, shots: [
      { scene: base(22, { characters: [L({ action: "hold", holds: "axe", expression: "sad" })], props: [logAt({ motion: "split", motionAt: -30, splitAt: 0.5, splitBase: 0.78 })] }) } ] },
  ];
  const B = applyPlan(c, plan);
  // the split lands on the narrator's "split." (the axe struck on "strike," and rests on the log until then)
  const sh = B.scenes.find((s) => s.id === "scene-21-shot2");
  const W = require(WT + "/scripts/lib/shot-plan").wordsOf(c, c.scenes[21]);
  const splitAt = W.find((w) => /^split/.test(w.w)).s - (sh.fromFrame - c.scenes[21].fromFrame);
  sh.props[0].motionAt = splitAt;
  return { slug: "burn-of-the-everflame", A: windowOf(c, 17, 25), B: windowOf(B, 17, 25), icons: { log: LOG } };
}

// ── 2. FEEL-GOOD #221, #224, #225 (window #219–#227) ──
function feelGood() {
  const c = load("feel-good-productivity"), road = (i) => ({ ...c.scenes[i].bg, set: "street" });
  const R = (o = {}) => person("protagonist", o);
  const base = (i, o) => ({ shot: "wide", bg: road(i), camera: cam, texts: [], props: [], ...o });
  const RUN = [-260, 260];
  const plan = [
    { sceneIndex: 221, shots: [
      { scene: base(221, { characters: [R({ action: "run", travel: RUN })] }) },
      { at: "ache.", scene: base(221, { characters: [R({ action: "run", travel: RUN, expression: "worried" })] }) } ] },
    { sceneIndex: 224, shots: [
      { scene: base(224, { characters: [R({ action: "run", travel: RUN, expression: "worried" })] }) },
      { at: "You", cues: { 0: "stop" }, scene: base(224, { characters: [R({ action: "stop", expression: "worried" })] }) } ] },
    { sceneIndex: 225, shots: [
      { scene: base(225, { characters: [R({ action: "take", takeFrom: "body", holds: "shoe", expression: "worried" })] }), cues: { 0: "shoe." } },
      { at: "You", cues: { 0: "pebble" }, scene: base(225, { characters: [R({ action: "take", takeFrom: "body", holds: "pebble", expression: "surprised" })], props: [prop(SHOE, 1180, 800, 0.55)] }) },
      { at: "You", cues: { 0: "remove" }, scene: base(225, { characters: [R({ action: "throw", holds: "pebble", expression: "neutral" })], props: [prop(SHOE, 1180, 800, 0.55)] }) },
      // the run resumes ON "resume" (v1 cut at "And then" showed it 14 frames before the word)
      { at: "resume", scene: base(225, { characters: [R({ action: "run", travel: RUN, expression: "happy" })] }) } ] },
  ];
  // shot 1 of 225 has its cue in its own shot list entry (applyPlan reads `cues` on the shot)
  plan[2].shots[0] = { scene: plan[2].shots[0].scene, cues: { 0: "shoe." } };
  const B = applyPlan(c, plan);
  return { slug: "feel-good-productivity", A: windowOf(c, 219, 227), B: windowOf(B, 219, 227), icons: { runningShoe: SHOE } };
}

// ── 3. LIGHTNING THIEF #149–#150 (recorded before the parts; window #149–#150) ──
function lightning() {
  const c = load("the-lightning-thief"), bgOf = (i) => c.scenes[i].bg;
  const base = (i, o) => ({ shot: "wide", bg: bgOf(i), camera: cam, texts: [], props: [], ...o });
  const plan = [
    { sceneIndex: 149, shots: [
      { scene: { ...c.scenes[149] } },
      { at: "Percy", scene: base(149, { characters: [person("percy", { action: "hold", holds: "sword", expression: "angry" }), person("annabeth", { expression: "neutral" })] }) },
      { at: "Instead,", cues: { 1: "pulls" }, scene: base(149, { characters: [person("percy", { action: "hold", holds: "sword", expression: "surprised" }), person("annabeth", { action: "take", takeFrom: "body", holds: "ball", expression: "smirk" })] }) },
      { at: "and", cues: { 1: "tosses" }, scene: base(149, { characters: [person("percy", { action: "hold", holds: "sword", expression: "surprised" }), person("annabeth", { action: "throw", holds: "ball", expression: "smirk" })] }) } ] },
    // the dog appears ON "Cerberus" (v1 showed it 55 frames earlier), on the LEFT — the side the ball flew to
    { sceneIndex: 150, shots: [
      { scene: base(150, { characters: [person("percy", { action: "hold", holds: "sword", expression: "surprised" }), person("annabeth", { expression: "smirk" })] }) },
      { at: "Cberus", scene: base(150, { characters: [person("annabeth", { expression: "happy" })], props: [prop(CERBERUS, 560, 640, 1.0), prop(BALL, 660, 830, 0.55)] }) } ] },
  ];
  const B = applyPlan(c, plan);
  return { slug: "the-lightning-thief", A: windowOf(c, 149, 150), B: windowOf(B, 149, 150), icons: { cerberus: CERBERUS, redBall: BALL } };
}

const res = [burn(), feelGood(), lightning()];
fs.mkdirSync(path.join(OUT, "configs"), { recursive: true });
fs.mkdirSync(path.join(OUT, "books"), { recursive: true });
for (const r of res) {
  for (const arm of ["A", "B"]) fs.writeFileSync(path.join(OUT, "configs", `${r.slug}-${arm}.json`), JSON.stringify(r[arm]));
  // the isolated book copy's motifs.json gains the book-own icons (the book itself is untouched)
  let m = {}; try { m = JSON.parse(fs.readFileSync(`${ROOT}/books/${r.slug}/motifs.json`, "utf8")); } catch {}
  fs.mkdirSync(path.join(OUT, "books", r.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, "books", r.slug, "motifs.json"), JSON.stringify({ ...m, ...r.icons }, null, 1));
  console.log(r.slug, "A", r.A.totalFrames, "B", r.B.totalFrames, "B scenes", r.B.scenes.length, "vs A", r.A.scenes.length);
}
fs.writeFileSync(path.join(OUT, "windows.json"), JSON.stringify(res.map((r) => ({ slug: r.slug, from: r.A._window.from, beats: r.A._window.beats, frames: r.A.totalFrames, shots: r.B.scenes.filter((s) => s._shotPlan).map((s) => ({ id: s.id, from: s.fromFrame, to: s.fromFrame + s.durationFrames, cutAt: s._shotPlan.cutAt, actions: (s.characters || []).map((c) => [c.identity, c.action, c.actionAt ?? null]), props: (s.props || []).map((p) => [p.customSvg && p.customSvg.reads, p.motion || null, p.motionAt ?? null]) })) })), null, 1));
