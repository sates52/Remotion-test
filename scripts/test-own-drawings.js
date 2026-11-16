#!/usr/bin/env node
/** test-own-drawings.js — Film Flow 3 / told v2: the book's own drawings on a told stage. No render, no network. */
const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const C = require("./lib/told-compile");
const OD = require("./lib/own-drawings");
const R = require("./lib/told-rules");
const A = require("./lib/told-apply");
const T = require("../src/engines/antidote/told.ts");
const V1 = require("./fixtures-told-v1");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const { words, beat } = V1;
const item = (stage, id) => stage.items.find((x) => x.id === id);
const rect = (x, y, w, h, fill) => ({ d: `M${x} ${y} H${x + w} V${y + h} H${x} Z`, fill });
/** a drawing that passes the lint: five parts, two colours, most of its box */
const good = (accent = "accent") => [rect(40, 300, 440, 120, "ink"), rect(80, 120, 60, 180, "ink"), rect(220, 60, 60, 240, "ink"), rect(360, 140, 60, 160, "ink"), rect(150, 330, 220, 40, accent)];
const other = () => [rect(40, 360, 440, 100, "ink"), rect(60, 250, 120, 110, "ink"), rect(300, 200, 150, 160, "ink"), rect(100, 100, 40, 150, "ink"), rect(340, 380, 80, 30, "accent")];
const wide = () => [rect(0, 560, 1920, 200, "ink"), rect(200, 300, 160, 260, "ink"), rect(700, 120, 220, 440, "ink"), rect(1300, 260, 180, 300, "ink"), rect(760, 200, 60, 60, "accent")];
const PAL = { ink: "#101820", accent: "#B5121B", paper: "#F4EFE6", fog: "#8A9099" };

const ENT = {
  demeter: { label: "DEMETER", kind: "product", glyph: "globe", reads: ["ship", "sailing ship"], paths: good(), w: 380,
    states: { wrecked: { reads: ["shipwreck", "wrecked ship"], paths: other() } } },
  box: { label: "EARTH BOX", kind: "object", reads: ["box", "crate"], paths: good("#7A4A21") },
  london: { label: "LONDON", kind: "place", glyph: "building", reads: ["city", "clock tower"], paths: good(), backdrop: { reads: ["city skyline", "skyline"], paths: wide() } },
  whitby: { label: "WHITBY", kind: "place", glyph: "globe" },
  varna: { label: "VARNA", kind: "place", reads: ["harbour", "port"], paths: other() },
  mina: { label: "MINA", kind: "person", look: { outfit: "dress", gender: "f" } },
  jonathan: { label: "JONATHAN", kind: "person", look: { outfit: "coat" } },
};
const compile = (beats, ent = ENT, opts = { palette: PAL }) => C.compileTold(beats, ent, opts);

t("told v1 is untouched: a passage in the v1 vocabulary compiles to the stages told 1.2 gave (golden), only `v` moves", () => {
  const r = C.compileTold(V1.BEATS, V1.ENT);
  assert.deepStrictEqual(r.errors, []);
  const hash = crypto.createHash("sha256").update(JSON.stringify(r.stages.map((s) => s && { items: s.items, cam: s.cam }))).digest("hex");
  assert.strictEqual(hash, V1.GOLDEN, "an existing told beat is placed, timed or drawn differently");
  for (const s of r.stages.filter(Boolean)) { assert.strictEqual(s.v, 2); assert.ok(!("backdrops" in s) && !s.items.some((it) => "state" in it)); }
  assert.strictEqual(T.TOLD_VERSION, 2);
});

t("the engine reads what v2 adds only on a v2 stage, and told.ts stays loadable by plain Node (no runtime import)", () => {
  const stage = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/components/ToldStage.tsx"), "utf8");
  assert.ok(/\(spec\.v \?\? 1\) >= 2 \? \(spec\.backdrops/.test(stage), "a v1 stage must never draw a backdrop");
  assert.ok(!/style=\{\{[^}]*transform/.test(stage) && (stage.match(/<svg /g) || []).length === 1, "ToldStage stays ONE svg, no CSS transform");
  assert.ok(!/Math\.(sin|cos)\([^)]*frame/.test(stage), "nothing on a told stage swings with the frame (a glyph's geometry may use sin)");
  const told = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/told.ts"), "utf8");
  assert.ok(!/^\s*import\s[^;]*from\s/m.test(told.replace(/import type[^;]*;/g, "")), "told.ts has no runtime import");
});

t("a path's box and commands are measured (absolute, relative, curves, arcs)", () => {
  assert.deepStrictEqual(OD.pathBox("M10 20 H110 V70 H10 Z"), { x0: 10, y0: 20, x1: 110, y1: 70, commands: 5 });
  const rel = OD.pathBox("m10 20 l100 0 l0 50 l-100 0 z");
  assert.deepStrictEqual([rel.x0, rel.y0, rel.x1, rel.y1, rel.commands], [10, 20, 110, 70, 5]);
  const curve = OD.pathBox("M0 0 C50 -40 100 140 200 100 a20 20 0 0 1 40 40");
  assert.deepStrictEqual([curve.x0, curve.y0, curve.x1, curve.y1], [0, -40, 240, 140]);
  assert.ok(OD.pathBox("M0 0 X5").bad && OD.pathBox("M0 0 L5").bad);
});

t("a drawing must be a drawing: three polygons, one colour, a corner of its box or an unknown colour are refused", () => {
  assert.deepStrictEqual(OD.lintDrawing({ paths: good() }, { palette: PAL }), []);
  const three = OD.lintDrawing({ paths: [{ d: "M40 150 H480 V200 H40 Z", fill: "#3A322B" }, { d: "M60 200 L60 400 L460 400 Z", fill: "#3A322B" }, { d: "M90 90 L130 150 L50 150 Z", fill: "#3A322B" }] }, { palette: PAL });
  assert.ok(three.some((m) => /at least 5/.test(m)));
  assert.ok(OD.lintDrawing({ paths: good("ink") }, { palette: PAL }).some((m) => /one colour/.test(m)));
  assert.ok(OD.lintDrawing({ paths: good().map((p) => ({ ...p, d: p.d.replace(/\d+/g, (x) => String(Math.round(Number(x) / 4))) })) }, { palette: PAL }).some((m) => /fills \d+ %/.test(m)));
  assert.ok(OD.lintDrawing({ paths: [...good().slice(0, 4), rect(400, 380, 300, 40, "accent")] }, { palette: PAL }).some((m) => /leaves its box/.test(m)));
  assert.ok(OD.lintDrawing({ paths: [...good().slice(0, 4), rect(150, 330, 220, 40, "burgundy")] }, { palette: PAL }).some((m) => /hex colour or a palette token/.test(m)));
  assert.deepStrictEqual(OD.lintDrawing({ paths: wide() }, { palette: PAL, kind: "backdrop" }), []);
});

t("one source for a drawing: an entity draws itself or points at an own icon — never both, never the same thing twice", () => {
  const motifs = { earthBox: { title: "Earth box", reads: "a crate of earth", paths: good() } };
  const r = OD.resolveEntities({ box: { label: "EARTH BOX", kind: "object", motif: "earthBox", reads: ["crate", "box"] } }, { motifs, palette: PAL });
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.entities.box.paths[0].fill, "#101820", "tokens become the book's colours");
  assert.strictEqual(r.entities.box.paths[4].fill, "#B5121B");
  assert.strictEqual(r.drawings[0].src, "motif:earthBox");
  assert.ok(OD.resolveEntities({ box: { kind: "object", motif: "earthBox", paths: good() } }, { motifs }).errors.some((m) => /one drawing, one place/.test(m)));
  assert.ok(OD.resolveEntities({ "earth-box": { kind: "object", paths: good() } }, { motifs }).errors.some((m) => /already draws "earthBox"/.test(m)));
  assert.ok(OD.resolveEntities({ box: { kind: "object", motif: "nope" } }, { motifs }).errors.some((m) => /not an own icon/.test(m)));
  assert.deepStrictEqual(C.validateEntities({ box: { label: "", kind: "object", motif: "earthBox" } }), [], "an object may point at its own icon instead of carrying paths");
});

t("every picture a viewer is shown is listed once: the thing, each state, a place's backdrop — each with its own reading and hash", () => {
  const r = OD.resolveEntities(ENT, { palette: PAL });
  assert.deepStrictEqual(r.errors, []);
  assert.deepStrictEqual(r.drawings.map((d) => d.key), ["demeter", "demeter#wrecked", "box", "london", "london@backdrop", "varna"]);
  assert.deepStrictEqual(OD.drawingProblems(r.drawings), []);
  assert.notStrictEqual(r.drawings[0].hash, r.drawings[1].hash);
  assert.ok(!r.entities.mina.paths && !r.entities.whitby.paths, "a person is the rig; a thing nobody drew stays an emblem");
  const noReads = OD.resolveEntities({ x: { label: "X", kind: "idea", paths: good() } }, { palette: PAL });
  assert.ok(OD.drawingProblems(noReads.drawings).some((m) => /no "reads"/.test(m)));
  assert.ok(OD.resolveEntities({ x: { label: "X", kind: "idea", reads: ["x"], paths: good(), states: { big: { reads: ["x"], viewBox: "0 0 100 100", paths: good() } } } }).errors.some((m) => /another viewBox/.test(m)));
  assert.ok(OD.resolveEntities({ x: { label: "X", kind: "idea", backdrop: { paths: wide() } } }).errors.some((m) => /only a place/.test(m)));
});

t("the blind name is judged against the readings accepted before the test; the verdict is bound to the drawing", () => {
  assert.ok(OD.readsAs("an old sailing ship", ["ship"]) && OD.readsAs("Ships", ["ship"]) && OD.readsAs("a wooden crate", ["box", "crate"]));
  assert.ok(!OD.readsAs("toaster", ["casserole", "dish"]) && !OD.readsAs("shipping label", ["ship"]) && !OD.readsAs("", ["ship"]));
  const { drawings } = OD.resolveEntities(ENT, { palette: PAL });
  const v = OD.judge(drawings, { 1: "sailing ship", 2: "a broken ship on rocks", 3: "toaster", 4: "clock tower", 5: "city skyline", 6: "harbour" });
  assert.strictEqual(v.named, 4); assert.strictEqual(v.total, 6);
  const g = OD.gate(drawings, v);
  assert.strictEqual(g.length, 2);
  assert.ok(g.some((m) => /"box" was read as "toaster"/.test(m)) && g.some((m) => /"demeter#wrecked" was read as/.test(m)));
  assert.deepStrictEqual(OD.gate(drawings, v, new Set(["london", "varna", "mina"])), [], "only the drawings a told beat uses are asked");
  assert.ok(OD.gate(drawings, null)[0].includes("has not been named blind"));
  // the drawing was changed after it was named — or the misreading was added to its readings afterwards
  const redrawn = OD.resolveEntities({ ...ENT, varna: { ...ENT.varna, paths: good() } }, { palette: PAL }).drawings;
  assert.ok(OD.gate(redrawn, v, new Set(["varna"]))[0].includes("changed after it was named blind"));
  const cheated = OD.resolveEntities({ ...ENT, box: { ...ENT.box, reads: ["box", "crate", "toaster"] } }, { palette: PAL }).drawings;
  assert.ok(OD.gate(cheated, v, new Set(["box"]))[0].includes("changed after it was named blind"));
});

t("a thing of ANY kind with a drawing is drawn as that drawing, with its name; without one the emblem is the fallback", () => {
  const r = compile([beat("b1", "the Demeter sailed from Varna past Whitby to London", { stage: { layout: "row", who: ["demeter", "varna", "whitby", "london"] } })]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0];
  for (const id of ["demeter", "varna", "london"]) { assert.strictEqual(item(s, id).kind, "icon", id); assert.ok(item(s, id).paths.length >= 5 && item(s, id).label); }
  assert.strictEqual(item(s, "demeter").paths[0].fill, "#101820");
  assert.strictEqual(item(s, "demeter").w, 380);
  assert.strictEqual(item(s, "whitby").kind, "emblem");
  assert.strictEqual(item(s, "whitby").glyph, "globe");
  assert.strictEqual(s.v, 2);
  assert.deepStrictEqual(OD.drawnShare({ scenes: [{ told: s }] }), { drawn: 3, emblem: 1, share: 0.75 });
});

t("a drawing changes state on the word, in place — and stays changed for the rest of the film", () => {
  const r = compile([
    beat("b1", "the Demeter ran before the storm and was wrecked on the sand", { stage: { layout: "solo", who: ["demeter"] }, events: [{ on: "wrecked", do: "change", who: "demeter", state: "wrecked" }] }),
    beat("b2", "nothing is named here", null),
    beat("b3", "the Demeter lay there for weeks", { stage: { layout: "versus", who: ["demeter", "mina"] } }),
    beat("b4", "years before the Demeter had been whole", { events: [{ on: "whole", do: "change", who: "demeter", state: "base" }] }),
  ]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0], at = words("the Demeter ran before the storm and was wrecked on the sand").find((w) => w.w === "wrecked").f;
  const now = item(s, "demeter"), was = s.items.find((x) => x.id.startsWith("demeter~"));
  assert.strictEqual(now.state, "wrecked");
  assert.strictEqual(now.paths[1].d, other()[1].d);
  assert.strictEqual(was.paths[1].d, good()[1].d);
  assert.ok(T.itemState(now, at - 9) === null && T.itemState(now, at).o === 1, "the new state is there on the word");
  assert.ok(T.itemState(was, at - 9).o === 1 && T.itemState(was, at + 3) === null, "the old one is gone just after");
  assert.deepStrictEqual([T.itemState(now, at).x, T.itemState(now, at).y], [T.itemState(was, at - 9).x, T.itemState(was, at - 9).y]);
  assert.strictEqual(item(r.stages[2], "demeter").state, "wrecked", "a new stage shows it as the film left it");
  assert.ok(!("state" in item(r.stages[3], "demeter")), "back to the base state when the author says so");
  const bad = compile([beat("b1", "the Demeter burned and Whitby too", { stage: { layout: "versus", who: ["demeter", "whitby"] }, events: [{ on: "burned", do: "change", who: "demeter", state: "burnt" }, { on: "Whitby", do: "change", who: "whitby", state: "burnt" }] })]);
  assert.ok(bad.errors.some((e) => /no state "burnt" — one of base, wrecked/.test(e.message)) && bad.errors.some((e) => /is an emblem/.test(e.message)));
});

t("what told v1 accepted still compiles: a person's change written on a thing is a warning, not an error", () => {
  // dracula (the first told book) has three: { do: "change", who: "demeter", action: "read" }
  const r = compile([beat("b1", "the Demeter carried its cargo to Whitby", { stage: { layout: "versus", who: ["demeter", "whitby"] }, events: [{ on: "cargo", do: "change", who: "demeter", action: "read" }, { on: "Whitby", do: "change", who: "whitby", action: "read" }] })]);
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.warnings.filter((w) => /is a thing — action \/ look \/ holds are a person's/.test(w.message)).length, 2);
  assert.ok(!("state" in item(r.stages[0], "demeter")) && item(r.stages[0], "demeter").paths.length === 5);
});

t("a drawing that grows keeps its name plate above the subtitle band (it rises as it grows)", () => {
  const r = compile([beat("b1", "the Demeter was a massive creaking ship", { stage: { layout: "solo", who: ["demeter"] }, events: [{ on: "massive", do: "grow", who: "demeter", to: 1.3 }] })]);
  assert.deepStrictEqual(r.errors, []); assert.deepStrictEqual(r.warnings, []);
  const d = item(r.stages[0], "demeter"), end = T.itemState(d, 299);
  assert.strictEqual(end.s, 1.3);
  assert.ok(end.y + (d.w / 2 + 66) * end.s <= 860.5 && end.y < 600, `the plate ends at ${end.y + (d.w / 2 + 66) * end.s}`);
  assert.ok(end.y - (d.w / 2) * end.s > 130, "and the drawing stays under the title band");
});

t("a person holds a drawing: it sits at the hand that faces the middle, belongs to them, and leaves with them", () => {
  const r = compile([
    beat("b1", "Mina kept the box by her side while Jonathan watched and then she left", { stage: { layout: "versus", who: ["mina", "jonathan"] }, events: [
      { on: "box", do: "change", who: "mina", holds: "box" }, { on: "left", do: "exit", who: "mina" }] }),
  ]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0], held = item(s, "mina.held"), mina = item(s, "mina");
  assert.ok(held && held.kind === "icon" && held.paths.length === 5 && !held.label, "the drawing, without a name plate");
  assert.strictEqual(mina.action, "hold"); assert.ok(!mina.holds, "the rig's own hand prop is not used for a book's drawing");
  const pm = T.itemState(mina, 100), ph = T.itemState(held, 100);
  assert.ok(ph.x > pm.x && ph.x - pm.x < 200, "at the hand towards the middle (she stands on the left)");
  assert.ok(ph.y < pm.y - 200 && ph.y > pm.y - C.figH(mina) * pm.s, "at hand height, between feet and head");
  assert.ok(held.w < 200, "in the hand it is small");
  assert.ok(held.exit && mina.exit, "it leaves with the person");
  assert.ok(s.items.indexOf(held) > s.items.indexOf(mina), "drawn in front of the person");
  const bad = compile([beat("b1", "Mina held Whitby", { stage: { layout: "solo", who: ["mina"] }, events: [{ on: "Whitby", do: "change", who: "mina", holds: "whitby" }] })]);
  assert.ok(bad.errors.some((e) => /no drawing to hold/.test(e.message)));
  // an engine hand prop still works as in told v1
  const prop = compile([beat("b1", "Mina read the letter", { stage: { layout: "solo", who: ["mina"] }, events: [{ on: "letter", do: "change", who: "mina", holds: "letter", action: "hold" }] })]);
  assert.strictEqual(item(prop.stages[0], "mina").holds, "letter"); assert.ok(!item(prop.stages[0], "mina.held"));
});

t("hand to hand: the thing lands in the other's hand ON THE WORD; the giver reaches out, the receiver holds it", () => {
  const text = "Jonathan had kept the box for years and at last gave it to Mina";
  const r = compile([
    beat("b1", text, { stage: { layout: "versus", who: ["jonathan", "mina"] }, events: [{ on: "box", do: "change", who: "jonathan", holds: "box" }, { on: "gave", do: "give", who: ["jonathan", "mina"], what: "box" }] }),
    beat("b2", "and Mina kept it", { events: [{ on: "kept", do: "label", who: "mina", text: "Her own now" }] }),
  ]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0], at = words(text).find((w) => w.w === "gave").f;
  const held = s.items.filter((x) => /\.held/.test(x.id));
  assert.strictEqual(held.length, 1, "one drawing travels — it is not drawn twice");
  const h = held[0], jon = item(s, "jonathan"), mina = item(s, "mina");
  const before = T.itemState(h, at - 20), after = T.itemState(h, at);
  // (a person who changes is a new item fading in over the old one: ask whichever is on stage at that frame)
  const where = (id, f) => s.items.filter((x) => x.id === id || x.id.startsWith(`${id}~`)).map((x) => T.itemState(x, f)).find(Boolean);
  assert.ok(Math.abs(before.x - where("jonathan", at - 20).x) < 150, "it starts at the giver");
  assert.ok(Math.abs(after.x - T.itemState(mina, at).x) < 150 && after.x - before.x > 400, "it has crossed to the receiver on the word");
  assert.strictEqual(jon.action, "offer"); assert.strictEqual(mina.action, "hold");
  const next = r.stages[1].items.filter((x) => /\.held/.test(x.id));
  assert.ok(next.length === 1 && Math.abs(T.itemState(next[0], 50).x - T.itemState(item(r.stages[1], "mina"), 50).x) < 150, "the next beat finds it in her hand");
  // a thing that stands on stage is taken: the standing thing goes, the drawing travels to the hand
  const take = compile([beat("b1", "the box stood there until Mina took it", { stage: { layout: "versus", who: ["box", "mina"] }, events: [{ on: "took", do: "take", who: "mina", what: "box" }] })]);
  assert.deepStrictEqual(take.errors, []);
  const t0 = take.stages[0], atT = words("the box stood there until Mina took it").find((w) => w.w === "took").f;
  assert.ok(item(t0, "box").exit, "the standing thing leaves");
  const th = t0.items.find((x) => /\.held/.test(x.id));
  assert.ok(Math.abs(T.itemState(th, atT).x - T.itemState(item(t0, "mina"), atT).x) < 150 && T.itemState(th, atT - 15).x < 800, "from where it stood into her hand");
  const bad = compile([beat("b1", "Mina gave Whitby to the box", { stage: { layout: "versus", who: ["mina", "box"] }, events: [{ on: "gave", do: "give", who: ["mina", "box"], what: "whitby" }] })]);
  assert.ok(bad.errors.some((e) => /the person who gives/.test(e.message)));
});

t("the stage is AT a place: its drawing behind everything, carried over the cut, replaced or cleared by the next stage", () => {
  const r = compile([
    beat("b1", "in London Mina waited", { stage: { layout: "solo", who: ["mina"], at: "london" } }),
    beat("b2", "she waited for weeks", { events: [{ on: "weeks", do: "label", who: "mina", text: "Six weeks" }] }),
    beat("b3", "then the story moves to Varna", { events: [{ on: "Varna", do: "at", who: "varna" }] }),
    beat("b4", "and Jonathan is alone", { stage: { layout: "solo", who: ["jonathan"] } }),
    beat("b5", "he waits", { events: [{ on: "waits", do: "label", who: "jonathan", text: "Still waiting" }] }),
  ]);
  assert.deepStrictEqual(r.errors, []);
  const [a, b, c, d, e] = r.stages;
  assert.deepStrictEqual(a.backdrops.map((x) => [x.id, !!x.wide, !!x.enter, !!x.exit]), [["london", true, false, false]], "a film that opens there is there from frame 0");
  assert.strictEqual(a.backdrops[0].paths.length, 5); assert.strictEqual(a.backdrops[0].paths[0].fill, "#101820");
  assert.deepStrictEqual(b.backdrops.map((x) => [x.id, !!x.enter, !!x.exit]), [["london", false, false]], "kept over the cut: no second entrance");
  assert.deepStrictEqual(c.backdrops.map((x) => [x.id, !!x.wide, !!x.enter, !!x.exit]), [["london", true, false, true], ["varna", false, true, false]], "one fades out as the other fades in, on the word");
  assert.strictEqual(c.backdrops[0].exit.at, c.backdrops[1].enter.at);
  assert.deepStrictEqual(d.backdrops.map((x) => [x.id, !!x.exit]), [["varna", true]], "a new stage without `at` is nowhere in particular");
  assert.ok(!("backdrops" in e));
  const bad = compile([beat("b1", "in Whitby with Mina", { stage: { layout: "solo", who: ["mina"], at: "whitby" } }), beat("b2", "the box", { events: [{ on: "box", do: "at", who: "box" }] })]);
  assert.strictEqual(bad.errors.filter((x) => /not a place with a drawing/.test(x.message)).length, 2);
});

t("a backdrop only fades, and is fitted between the title band and the subtitle band", () => {
  assert.strictEqual(T.backdropOpacity({}, 0), 1);
  assert.deepStrictEqual([0, 6, 12, 40].map((f) => T.backdropOpacity({ enter: { at: 12, dur: 12 } }, f)), [0, 0.5, 1, 1]);
  assert.deepStrictEqual([0, 18, 24, 40].map((f) => T.backdropOpacity({ exit: { at: 24, dur: 12 } }, f)), [1, 0.5, 0, 0]);
  for (const b of [{ wide: true }, {}, { wide: true, viewBox: "0 0 1000 1000" }, { viewBox: "10 10 300 600" }]) {
    const f = T.backdropFit(b), [vx, vy, vw, vh] = (b.viewBox || (b.wide ? "0 0 1920 760" : "0 0 520 520")).split(" ").map(Number);
    const x0 = f.x + vx * f.k, y0 = f.y + vy * f.k, x1 = x0 + vw * f.k, y1 = y0 + vh * f.k;
    assert.ok(x0 >= -0.5 && x1 <= 1920.5 && y0 >= 109.5 && Math.abs(y1 - 870) < 0.5, `${JSON.stringify(b)} → ${[x0, y0, x1, y1]}`);
    assert.ok(Math.abs((x0 + x1) / 2 - 960) < 0.5, "centred");
  }
});

t("the rules an author reads are generated from what THIS book drew; merge checks states, hands and places", () => {
  const sec = R.toldSection(ENT);
  assert.ok(/`demeter` — DEMETER · product · the book's own drawing — states: `wrecked`/.test(sec));
  assert.ok(/`whitby` — WHITBY · place · emblem \(globe\)/.test(sec) && /`london`.*can be the stage's place/.test(sec));
  assert.ok(/A thing the narration changes, changes on screen/.test(sec) && /People handle the things/.test(sec) && /Where it happens/.test(sec));
  assert.ok(/\| `give` \|/.test(sec) && /\| `take` \|/.test(sec) && /\| `at` \|/.test(sec));
  const plain = R.toldSection(V1.ENT);
  assert.ok(!/A thing the narration changes/.test(plain) && !/Where it happens/.test(plain), "a book without states or drawn places is not told about them");
  const chk = (told, text) => R.checkToldBeat(told, text, ENT);
  assert.deepStrictEqual(chk({ stage: { layout: "versus", who: ["mina", "demeter"], at: "london" }, events: [{ on: "wrecked", do: "change", who: "demeter", state: "wrecked" }, { on: "gave", do: "give", who: ["mina", "jonathan"], what: "box" }, { on: "Varna", do: "at", who: "varna" }] }, "it was wrecked and she gave it away in Varna"), []);
  const bad = chk({ stage: { layout: "solo", who: ["mina"], at: "whitby" }, events: [{ on: "burned", do: "change", who: "demeter", state: "burnt" }, { on: "gave", do: "give", who: ["mina", "box"], what: "whitby" }, { on: "took", do: "take", who: "mina", what: "mina" }, { on: "moved", do: "at", who: "mina" }, { on: "changed", do: "change", who: "box", action: "talk" }] }, "it burned and she gave and took and moved and changed");
  for (const re of [/stage\.at "whitby"/, /no state "burnt" — one of base, wrecked/, /\(give\): who is \[the person who gives/, /\(give\): "what" is a drawn thing/, /\(take\): "what" is a drawn thing/, /\(at\): "mina" is not a place/, /it changes by "state"/]) assert.ok(bad.some((m) => re.test(m)), `${re} in\n  ${bad.join("\n  ")}`);
  assert.deepStrictEqual([...OD.usedBy({ stage: { who: ["mina"], at: "london" }, events: [{ do: "give", who: ["mina", "jonathan"], what: "box" }, { do: "change", who: "mina", holds: "demeter" }] })].sort(), ["box", "demeter", "jonathan", "london", "mina"]);
});

t("the brief for the lead agent is generated from the lint's own numbers and the book's palette", () => {
  const g = OD.drawingGuide(PAL).join("\n");
  assert.ok(g.includes(`${OD.RULES.minPaths}–${OD.RULES.maxPaths} paths`) && g.includes(`at least ${OD.RULES.minCommands} path commands`) && g.includes(`"fog" (#8A9099)`));
  assert.ok(/Never a real logo/.test(g) && /ONE SOURCE/.test(g) && /--judge/.test(g));
  assert.deepStrictEqual(OD.paletteOf({ palette: { ink: "#111111", red: "#AA0000" } }, { world: { palette: { paper: "#EEEEEE" } } }), { ink: "#111111", accent: "#AA0000", paper: "#EEEEEE", red: "#AA0000" });
});

t("applied to a film: the drawings reach the scene, the stage is sealed, and reverting gives the old picture back", () => {
  const scene = (id, from, text) => ({ id, fromFrame: from, durationFrames: 300, _narration: text, shot: "single", characters: [{ id: "x" }], props: [], texts: [{ text: "T" }] });
  const cap = (from, text) => ({ startFrame: from, endFrame: from + 300, words: text.split(" ").map((w, i) => ({ w, s: from + i * 10, e: from + i * 10 + 8 })) });
  const texts = ["the Demeter sailed for London", "and it was wrecked there"];
  const config = { meta: {}, scenes: texts.map((x, i) => scene(`scene-${i}`, i * 300, x)), captions: texts.map((x, i) => cap(i * 300, x)) };
  const told = { "scene-0": { stage: { layout: "solo", who: ["demeter"], at: "london" } }, "scene-1": { events: [{ on: "wrecked", do: "change", who: "demeter", state: "wrecked" }] } };
  const r = A.applyTold(config, told, ENT, { palette: PAL });
  assert.deepStrictEqual(r.report.errors, []);
  assert.strictEqual(r.config.meta.flow, 2);
  assert.strictEqual(r.config.scenes[1].told.items.find((x) => x.id === "demeter").state, "wrecked");
  assert.strictEqual(r.config.scenes[1].told.backdrops[0].id, "london");
  assert.deepStrictEqual(A.revertTold(r.config).config.scenes.map((s) => [!!s.told, s.characters.length]), [[false, 1], [false, 1]]);
});

console.log(`\n${n} checks passed`);
