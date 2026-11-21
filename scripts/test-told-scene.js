#!/usr/bin/env node
/**
 * test-told-scene.js — told v5: the place is drawn as a SCENE (Film Flow 7, 2026-11-21). A place's backdrop may carry
 * `sky` + `ground`; it is linted as a scene, carried through the compiler, and drawn at full presence only on a v5
 * stage; a backdrop without `sky` stays the pale wash; old beats compile byte-identical. No render, no network.
 */
const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const C = require("./lib/told-compile");
const OD = require("./lib/own-drawings");
const T = require("../src/engines/antidote/told.ts");
const V1 = require("./fixtures-told-v1");
const V2 = require("./fixtures-told-v2");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const sha = (v) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
const PAL = { ink: "#1A1412", accent: "#C2410C", paper: "#FAF7F2", sky: "#D9D2C5", earth: "#3A2E28" };
const words = (s, step = 10) => s.split(" ").map((w, i) => ({ w, f: i * step }));
const beat = (id, text, told, frames = 300) => ({ id, frames, words: words(text), told });

/** a scene backdrop that passes: plain sky above 25 %, a coloured middle ground, a ground strip on the bottom edge */
const SCENE = {
  viewBox: "0 0 1920 760", reads: ["castle", "mountains"], sky: "sky", ground: "earth",
  paths: [
    { d: "M0 520 L300 300 L650 500 L950 260 L1350 480 L1650 320 L1920 500 V760 H0 Z", fill: "#6E6058" },
    { d: "M400 460 L480 300 L560 460 L620 240 L680 460 L740 340 L800 460 V760 H400 Z", fill: "#6A6075" },
    { d: "M630 300 H670 V360 H630 Z", fill: "accent" },
    { d: "M500 560 L650 420 L800 560 V760 H500 Z", fill: "#7A6E68" },
    { d: "M0 640 Q600 600 1200 650 T1920 630 V760 H0 Z", fill: "earth" },
    { d: "M900 600 H1100 V760 H900 Z", fill: "#2A2220" },
  ],
};
const ENT = {
  transylvania: { label: "CASTLE DRACULA", kind: "place", backdrop: SCENE },
  whitby: { label: "WHITBY", kind: "place", backdrop: { ...SCENE, sky: undefined, ground: undefined, reads: ["harbour"] } },
  jonathan: { label: "JONATHAN", kind: "person" },
};

t("lint: a scene backdrop names a light sky and a ground of another tone, keeps its upper band plain, has no wash", () => {
  assert.deepStrictEqual(OD.lintDrawing(SCENE, { palette: PAL, kind: "backdrop" }), []);
  const dark = OD.lintDrawing({ ...SCENE, sky: "ink" }, { palette: PAL, kind: "backdrop" });
  assert.ok(dark.some((m) => /"sky" .* is dark/.test(m)), `a dark sky is refused: ${dark}`);
  const same = OD.lintDrawing({ ...SCENE, ground: "#D0C9BC" }, { palette: PAL, kind: "backdrop" });
  assert.ok(same.some((m) => /is the sky's tone/.test(m)), `a ground in the sky's tone is refused: ${same}`);
  const high = OD.lintDrawing({ ...SCENE, paths: [...SCENE.paths, { d: "M100 120 L300 60 L500 120 Z", fill: "ink" }] }, { palette: PAL, kind: "backdrop" });
  assert.ok(high.some((m) => /upper 25 % of the box/.test(m)), `a path in the upper band is refused: ${high}`);
  const wash = OD.lintDrawing({ ...SCENE, paths: [{ d: "M0 0 H1920 V760 H0 Z", fill: "ink" }, ...SCENE.paths] }, { palette: PAL, kind: "backdrop" });
  assert.ok(wash.some((m) => /covers the whole box/.test(m)) && wash.some((m) => /upper 25 %/.test(m)), `a wash is refused: ${wash}`);
  const mass = OD.lintDrawing({ ...SCENE, paths: SCENE.paths.map((p, i) => (i === 1 ? { ...p, fill: "ink" } : p)) }, { palette: PAL, kind: "backdrop" });
  assert.ok(mass.some((m) => /big ink mass in the middle ground/.test(m)), `an ink castle in the middle ground is refused (the Count vanished against it): ${mass}`);
  assert.deepStrictEqual(OD.lintDrawing({ ...SCENE, paths: [...SCENE.paths, { d: "M700 300 H740 V360 H700 Z", fill: "earth" }] }, { palette: PAL, kind: "backdrop" }), [], "a small dark detail is fine; the ground strip is dark by nature");
  const half = OD.lintDrawing({ ...SCENE, sky: undefined }, { palette: PAL, kind: "backdrop" });
  assert.ok(half.some((m) => /"ground" without "sky"/.test(m)), `a ground without a sky is refused: ${half}`);
  assert.ok(OD.lintDrawing({ ...SCENE, sky: "nope" }, { palette: PAL, kind: "backdrop" }).some((m) => /"sky" "nope"/.test(m)));
  // a backdrop without sky / ground is linted exactly as before: nothing of the scene rules applies
  assert.deepStrictEqual(OD.lintDrawing({ ...SCENE, sky: undefined, ground: undefined, paths: [{ d: "M0 0 H1920 V760 H0 Z", fill: "#6A6075" }, ...SCENE.paths] }, { palette: PAL, kind: "backdrop" }), []);
  assert.ok(OD.luminance("#FFFFFF") > 0.99 && OD.luminance("#000000") < 0.01 && Math.abs(OD.luminance("#808080") - 0.216) < 0.01);
});

t("resolve: sky and ground reach the stage as hex; they are in the drawing's hash; a backdrop without them is as before", () => {
  const r = OD.resolveEntities(ENT, { palette: PAL });
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.entities.transylvania.backdrop.sky, "#D9D2C5");
  assert.strictEqual(r.entities.transylvania.backdrop.ground, "#3A2E28");
  assert.ok(!("sky" in r.entities.whitby.backdrop) && !("ground" in r.entities.whitby.backdrop));
  const scene = r.drawings.find((d) => d.key === "transylvania@backdrop"), wash = r.drawings.find((d) => d.key === "whitby@backdrop");
  assert.strictEqual(scene.sky, "#D9D2C5"); assert.deepStrictEqual(scene.lint, []);
  assert.ok(!("sky" in wash), "the wash carries no sky");
  assert.notStrictEqual(scene.hash, wash.hash, "the same paths with a sky are another picture (the verdict is bound to the picture)");
  assert.strictEqual(wash.hash, OD.sha({ viewBox: wash.viewBox, paths: wash.paths }), "a backdrop without a sky hashes as it always did");
  // the ground defaults to the ink when only a sky is given
  const only = OD.resolveEntities({ p: { label: "P", kind: "place", backdrop: { ...SCENE, ground: undefined } } }, { palette: PAL });
  assert.strictEqual(only.entities.p.backdrop.ground, PAL.ink);
});

t("compile: a stage AT a scene place carries sky + ground on its backdrop; at a wash place it carries neither", () => {
  const r = C.compileTold([
    beat("b1", "Jonathan arrived at the castle", { stage: { layout: "solo", who: ["jonathan"], at: "transylvania" } }),
    beat("b2", "and then he sailed to Whitby", { events: [{ on: "Whitby", do: "at", who: "whitby" }] }),
  ], ENT, { palette: PAL });
  assert.deepStrictEqual(r.errors, []);
  const [s1, s2] = r.stages;
  assert.strictEqual(s1.v, T.TOLD_VERSION);
  assert.deepStrictEqual([s1.backdrops[0].id, s1.backdrops[0].sky, s1.backdrops[0].ground, s1.backdrops[0].wide], ["transylvania", "#D9D2C5", "#3A2E28", true]);
  const whitby = s2.backdrops.find((b) => b.id === "whitby");
  assert.ok(whitby && !("sky" in whitby) && !("ground" in whitby), "a backdrop without a sky is written exactly as before");
  assert.deepStrictEqual(Object.keys(whitby).sort(), ["enter", "id", "paths", "viewBox", "wide"]);
});

t("the maths: a scene's ground begins at the backdrop's bottom edge; a figure stands on it only with its feet there", () => {
  const sc = T.backdropScene({ wide: true, viewBox: "0 0 1920 760", sky: "#D9D2C5", ground: "#3A2E28" });
  assert.deepStrictEqual(sc, { sky: "#D9D2C5", ground: "#3A2E28", groundTop: 870 }, "the wide backdrop stands on the subtitle band's top edge (backdropFit bottom)");
  assert.strictEqual(T.backdropScene({ wide: true, sky: "#D9D2C5" }).ground, "#1E1E22", "ground without a colour: the stage ink");
  assert.strictEqual(T.backdropScene({ wide: true, paths: [] }), null, "no sky: the wash, no ground");
  assert.ok(T.standsOn(850, 870) && T.standsOn(870, 870) && T.standsOn(900, 870), "feet at or just above the edge stand on it");
  assert.ok(!T.standsOn(700, 870) && !T.standsOn(600, 870), "a figure at mid-stage is in the middle ground: no contact shadow");
  assert.strictEqual(T.GROUND_REACH, 60);
});

t("the engine: ONE svg; the sky, the full presence and the shadow are read only on a v5 stage with a scene backdrop", () => {
  const stage = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/components/ToldStage.tsx"), "utf8");
  assert.ok((stage.match(/<svg /g) || []).length === 1 && !/style=\{\{[^}]*transform/.test(stage), "one svg, no HTML layer");
  assert.ok(/\(spec\.v \?\? 1\) >= 5 \? places\.map\(\(p\) => \(\{ \.\.\.p, sc: backdropScene\(p\.b\) \}\)\)\.filter\(\(p\) => p\.sc\) : \[\]/.test(stage), "scenes exist only on v >= 5 and only for a backdrop with a sky");
  assert.ok(/const BACKDROP_OPACITY = 0\.26;/.test(stage), "the pale wash is unchanged for every other backdrop");
  assert.ok(/opacity=\{\(asScene \? 1 : BACKDROP_OPACITY\) \* o\}/.test(stage), "a scene backdrop is drawn as itself; a wash as the wash");
  assert.ok(/standsOn\(st\.y, p\.sc!\.groundTop\)/.test(stage), "a contact shadow only under a figure standing on the ground");
  assert.ok(!/BACKDROP_OPACITY_V5|groundY/.test(stage), "the first trial's opacity and feet-line ground are gone");
  assert.ok(!/Math\.sin\(|Math\.cos\(/.test(stage.split("export const ToldStage")[1]), "nothing on the stage moves on its own");
  const told = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/told.ts"), "utf8");
  assert.ok(!/^\s*import\s/m.test(told), "told.ts has no import (plain Node loads it)");
  assert.strictEqual(T.TOLD_VERSION, 5);
});

t("told v1 – v4 beats are untouched: both golden passages compile to the stages their compilers gave", () => {
  const a = C.compileTold(V1.BEATS, V1.ENT);
  assert.strictEqual(sha(a.stages.map((s) => s && { items: s.items, cam: s.cam })), V1.GOLDEN);
  const b = C.compileTold(V2.BEATS, V2.ENT, { palette: V2.PAL });
  assert.deepStrictEqual(b.errors, []);
  assert.strictEqual(sha(b.stages.map((s) => s && { items: s.items, cam: s.cam, backdrops: s.backdrops, plate: s.plate })), V2.GOLDEN);
  for (const s of b.stages.filter(Boolean)) for (const bd of s.backdrops || []) assert.ok(!("sky" in bd), "no backdrop of an old book grows a sky");
});

t("the authors' brief says how a place is drawn as a scene, with the lint's own numbers", () => {
  const g = OD.drawingGuide(PAL).join("\n");
  assert.ok(/DRAW THE PLACE AS A SCENE/.test(g) && /"sky"/.test(g) && /"ground"/.test(g));
  assert.ok(g.includes(`luminance ≥ ${OD.RULES.skyLuminance}`) && g.includes(`upper ${OD.RULES.skyBand * 100} % of the box holds NO path`));
  const md = fs.readFileSync(path.join(__dirname, "../.claude/skills/antidote-visual-authoring/told.md"), "utf8");
  assert.ok(/told v5/.test(md) && /"sky"/.test(md) && /"ground"/.test(md), "told.md tells the lead agent");
});

console.log(`\n${n} checks passed`);
