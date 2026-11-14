#!/usr/bin/env node
/** test-told-compile.js — Film Flow 2: an author's told beat becomes a stage; no render, no network. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const C = require("./lib/told-compile");
const A = require("./lib/told-apply");
const T = require("../src/engines/antidote/told.ts");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const words = (s, step = 10) => s.split(" ").map((w, i) => ({ w, f: i * step }));
const ENT = {
  microsoft: { label: "MICROSOFT", kind: "company", glyph: "monitor" },
  google: { label: "GOOGLE", kind: "company", glyph: "search" },
  mozart: { label: "MOZART", kind: "person", look: { age: "child", height: 0.72 }, w: 230 },
  piano: { label: "", kind: "object", paths: [{ d: "M0 0 H10 V10 Z", fill: "#000" }] },
};
const beat = (id, text, told, frames = 300) => ({ id, frames, words: words(text), told });
const item = (stage, id) => stage.items.find((x) => x.id === id);

t("a word anchors an event: the first match from where the last event was; a phrase; a looser start-of-word match", () => {
  const w = words("it was Windows versus Chrome OS and then Chrome again");
  assert.deepStrictEqual(C.wordFrame(w, "Chrome"), { frame: 40, index: 4 });
  assert.deepStrictEqual(C.wordFrame(w, "Chrome", 5), { frame: 80, index: 8 });
  assert.deepStrictEqual(C.wordFrame(w, "chrome os"), { frame: 40, index: 4 });
  assert.deepStrictEqual(C.wordFrame(w, "versu"), { frame: 30, index: 3 });
  assert.strictEqual(C.wordFrame(w, "Linux"), null);
});

t("entities are checked: kind, label, an own drawing's paths, a glyph that can be drawn", () => {
  assert.deepStrictEqual(C.validateEntities(ENT), []);
  const bad = C.validateEntities({ Bad: { kind: "company" }, cat: { kind: "animal", label: "CAT" }, x: { kind: "wizard", label: "X" }, y: { kind: "company", label: "Y", glyph: "swoosh" } });
  assert.strictEqual(bad.length, 5);
  assert.ok(bad.some((e) => /own drawing/.test(e)) && bad.some((e) => /cannot be drawn/.test(e)));
});

t("stage: two things face each other; they enter from their own side, on the word", () => {
  const r = C.compileTold([beat("b1", "the fight between Microsoft and Google began", { events: [{ on: "Microsoft", do: "arrange", layout: "versus", who: ["microsoft", "google"] }] })], ENT);
  assert.deepStrictEqual(r.errors, []);
  const ms = item(r.stages[0], "microsoft"), g = item(r.stages[0], "google");
  assert.deepStrictEqual([ms.kind, ms.x, ms.y, ms.enter.from, ms.enter.at], ["emblem", 560, 470, "left", 30]);
  assert.deepStrictEqual([g.x, g.enter.from], [1360, "right"]);
  assert.ok(ms.color && g.color && ms.color !== g.color, "each thing has its own colour");
  assert.strictEqual(r.stages[0].v, T.TOLD_VERSION);
});

t("what is on stage stays for the next beat, where the last beat left it — nothing re-enters at the cut", () => {
  const r = C.compileTold([
    beat("b1", "Microsoft and Google lived in different universes", { stage: { layout: "versus", who: ["microsoft", "google"] }, events: [{ on: "universes", do: "apart", who: ["microsoft", "google"] }] }),
    beat("b2", "and Microsoft was the king", { events: [{ on: "king", do: "crown", who: "microsoft" }] }),
  ], ENT);
  assert.deepStrictEqual(r.errors, []);
  const ms2 = item(r.stages[1], "microsoft");
  assert.strictEqual(ms2.enter, undefined);
  assert.strictEqual(ms2.x, 440, "carried at the position the first beat ended on");
  const crown = item(r.stages[1], "microsoft.crown");
  assert.deepStrictEqual([crown.kind, crown.x, crown.enter.at], ["crown", 440, 40]);
});

t("what belongs to a thing moves with it: the crown follows its owner", () => {
  const r = C.compileTold([beat("b1", "the king then walked far away from here", { stage: { layout: "versus", who: ["microsoft", "google"] }, events: [{ on: "king", do: "crown", who: "microsoft" }, { on: "away", do: "apart", who: ["microsoft", "google"] }] })], ENT);
  const ms = item(r.stages[0], "microsoft"), crown = item(r.stages[0], "microsoft.crown");
  const a = T.itemState(ms, 299), c = T.itemState(crown, 299);
  assert.ok(Math.abs(a.x - 440) < 1e-6 && Math.abs(c.x - 440) < 1e-6, `owner ${a.x}, crown ${c.x}`);
});

t("a title is on the screen (not in the camera), one at a time, cleared at the start of the next beat", () => {
  const r = C.compileTold([
    beat("b1", "competition is for losers and winners alike", { stage: { layout: "versus", who: ["microsoft", "google"] }, events: [{ on: "competition", do: "title", text: "Competition is for losers", box: "accent" }, { on: "winners", do: "title", text: "Winners" }] }),
    beat("b2", "next", {}),
  ], ENT);
  const titles = r.stages[0].items.filter((x) => x.kind === "word");
  assert.strictEqual(titles.length, 2);
  assert.ok(titles.every((x) => x.screen === true && x.x === 960 && x.y === 160));
  assert.strictEqual(titles[0].label, "COMPETITION IS FOR LOSERS");
  assert.ok(titles[0].exit && titles[0].exit.at <= titles[1].enter.at, "the first leaves as the second lands");
  const carriedTitle = r.stages[1].items.find((x) => x.kind === "word");
  assert.ok(carriedTitle && carriedTitle.exit.at === 24, "the next beat starts by clearing the band");
});

t("product pairs line up in rows under the two things; a fifth row is refused with a warning", () => {
  const ev = (l, r2, on) => ({ on, do: "pair", left: l, right: r2 });
  const r = C.compileTold([beat("b1", "Windows a b Bing c d Explorer e f Office g h Extra", { stage: { layout: "versus", who: ["microsoft", "google"] }, events: [ev("Windows", "Chrome OS", "Windows"), ev("Bing", "Search", "Bing"), ev("Explorer", "Chrome", "Explorer"), ev("Office", "Docs", "Office"), ev("X", "Y", "Extra")] }, 600)], ENT);
  assert.deepStrictEqual(r.errors, []);
  const tiles = r.stages[0].items.filter((x) => x.kind === "tile");
  assert.strictEqual(tiles.length, 8);
  assert.deepStrictEqual([...new Set(tiles.map((x) => x.y))], [440, 552, 664, 776]);
  assert.deepStrictEqual([T.itemState(item(r.stages[0], "microsoft"), 599).y, T.itemState(item(r.stages[0], "microsoft"), 599).s], [230, 0.5]);
  assert.ok(r.warnings.some((w) => /fifth row/.test(w.message)));
});

t("a person is a figure, an object the book's own drawing; `change` swaps the person's look on a word", () => {
  const r = C.compileTold([beat("b1", "the tiny kid Mozart was blindfolded at the piano", { stage: { layout: "court", who: ["mozart"] }, events: [{ on: "blindfolded", do: "change", who: "mozart", look: { overlay: [{ d: "M0 0", fill: "#000" }] } }, { on: "piano", do: "enter", who: "piano", x: 1215, y: 650 }] })], ENT);
  assert.deepStrictEqual(r.errors, []);
  const figs = r.stages[0].items.filter((x) => x.kind === "figure");
  assert.strictEqual(figs.length, 2);
  assert.ok(figs[0].exit && figs[1].enter.at === 50 && figs[1].variant.overlay && figs[1].variant.age === "child");
  assert.deepStrictEqual([figs[1].id, figs[1].y], ["mozart", 790]);
  const piano = item(r.stages[0], "piano");
  assert.deepStrictEqual([piano.kind, piano.x, piano.y, piano.paths.length], ["icon", 1215, 650, 1]);
});

t("refused, never guessed: a name not in entities, a word the narrator does not say, an unknown action, a thing not on stage", () => {
  const r = C.compileTold([beat("b1", "hello there", { stage: { layout: "versus", who: ["microsoft", "apple"] }, events: [{ on: "goodbye", do: "crown", who: "microsoft" }, { do: "explode" }, { on: "there", do: "crown", who: "google" }] })], ENT);
  const msgs = r.errors.map((e) => e.message).join(" | ");
  assert.ok(/"apple" is not in entities/.test(msgs) && /does not say it/.test(msgs) && /"explode"/.test(msgs) && /not on stage/.test(msgs), msgs);
  assert.ok(r.errors.every((e) => e.beat === "b1"));
});

t("the camera: focus pushes in on a thing and is carried; wide returns; a beat without told ends the stage", () => {
  const r = C.compileTold([
    beat("b1", "look at Microsoft now", { stage: { layout: "versus", who: ["microsoft", "google"] }, events: [{ on: "Microsoft", do: "focus", who: "microsoft" }] }),
    beat("b2", "and back we go", { events: [{ on: "back", do: "wide" }] }),
    beat("b3", "something else", undefined),
    beat("b4", "a new stage", { stage: { layout: "solo", who: ["google"] } }),
  ], ENT);
  assert.ok(r.stages[0].cam[0].s === 1.3 && r.stages[0].cam[0].x === 760);
  assert.deepStrictEqual(r.stages[1].cam.map((k) => [k.at, k.s]), [[0, 1.3], [24, 1]]);
  assert.strictEqual(r.stages[2], null);
  assert.ok(!item(r.stages[3], "microsoft") && item(r.stages[3], "google").x === 960 && !r.stages[3].cam);
});

t("applied to a film: words come from its captions, the stage replaces the figure-and-text picture, the level is raised", () => {
  const cfg = { meta: { fps: 30 }, captions: [{ startFrame: 0, endFrame: 120, words: [{ w: "Microsoft", s: 100, e: 110 }, { w: "and", s: 110, e: 114 }, { w: "Google", s: 114, e: 120 }] }],
    scenes: [{ id: "s0", fromFrame: 0, durationFrames: 90, shot: "medium", characters: [{ action: "talk" }], props: [], texts: [{ text: "X" }], transition: { type: "wipeLeft", frames: 10 } },
      { id: "s1", fromFrame: 90, durationFrames: 90, shot: "twoShot", characters: [{ action: "talk" }], props: [], texts: [{ text: "Y" }], transition: { type: "wipeLeft", frames: 10 } },
      { id: "s2", fromFrame: 180, durationFrames: 90, shot: "twoShot", characters: [{ action: "idle" }], props: [], texts: [], transition: { type: "iris", frames: 12 } }] };
  assert.deepStrictEqual(A.sceneWords(cfg, cfg.scenes[1]), [{ w: "Microsoft", f: 10 }, { w: "and", f: 20 }, { w: "Google", f: 24 }]);
  const told = { s1: { events: [{ on: "Microsoft", do: "arrange", layout: "versus", who: ["microsoft", "google"] }] }, s2: { events: [{ at: 30, do: "crown", who: "microsoft" }] }, nope: {} };
  const r = A.applyTold(cfg, told, ENT);
  assert.deepStrictEqual([r.report.applied, r.report.errors.length, r.report.unknownScenes], [2, 0, ["nope"]]);
  const [s0, s1, s2] = r.config.scenes;
  assert.ok(!s0.told && s0.characters.length === 1, "an untold scene is untouched");
  assert.ok(s1.told && s1.characters.length === 0 && s1.texts.length === 0 && s1._beforeTold.texts[0].text === "Y");
  assert.strictEqual(s1.transition.type, "wipeLeft", "the first told beat keeps its transition");
  assert.deepStrictEqual([s2.transition.type, s2.transition.frames], ["cut", 0]);
  assert.strictEqual(r.config.meta.flow, 2);
  const bad = A.applyTold(cfg, { s1: { events: [{ on: "nothing", do: "title", text: "x" }] } }, ENT);
  assert.ok(bad.report.applied === 0 && !bad.config.scenes[1].told && bad.config.meta.flow === undefined, "a beat with an error is left exactly as it was");
});

t("the approved pilot compiles from its authored form with no error (audit/film-flow/zero-to-one)", () => {
  const dir = path.join(__dirname, "..", "audit", "film-flow", "zero-to-one");
  const told = JSON.parse(fs.readFileSync(path.join(dir, "told.json"), "utf8")), ent = JSON.parse(fs.readFileSync(path.join(dir, "entities.json"), "utf8"));
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, "passage.json"), "utf8"));
  const r = A.applyTold(cfg, told, ent);
  assert.deepStrictEqual(r.report.errors, []);
  assert.strictEqual(r.report.applied, 10);
  for (const s of r.config.scenes) for (const it of s.told.items) for (const f of [0, Math.floor(s.durationFrames / 2), s.durationFrames - 1]) {
    const st = T.itemState(it, f); if (st) assert.ok([st.x, st.y, st.s, st.o, st.r].every(Number.isFinite), `${s.id} ${it.id} @${f}`);
  }
});

console.log(`\n${n} checks passed`);
