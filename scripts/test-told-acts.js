#!/usr/bin/env node
/** test-told-acts.js — Film Flow 4 / told v3: people play the verb on a told stage. No render, no network. */
const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const C = require("./lib/told-compile");
const R = require("./lib/told-rules");
const T = require("../src/engines/antidote/told.ts");
const TA = require("../src/engines/antidote/toldActs.ts");
const V1 = require("./fixtures-told-v1");
const V2 = require("./fixtures-told-v2");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const { words, beat, ENT, PAL } = V2;
const compile = (beats, ent = ENT) => C.compileTold(beats, ent, { palette: PAL });
const item = (stage, id) => stage.items.find((x) => x.id === id);
const wordAt = (text, w) => words(text).find((x) => x.w === w).f;
/** whichever version of a person is on stage at that frame (a person who changes is a new item fading in over the old) */
const live = (s, id, f) => { const all = s.items.filter((x) => x.id === id || x.id.startsWith(`${id}~`)).map((x) => [x, T.itemState(x, f)]).filter(([, st]) => st && st.o > 0.5); return all.length ? all[all.length - 1] : null; };
const sha = (v) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");

t("told v1 and v2 are untouched: both golden passages compile to the stages their compilers gave", () => {
  const a = C.compileTold(V1.BEATS, V1.ENT);
  assert.strictEqual(sha(a.stages.map((s) => s && { items: s.items, cam: s.cam })), V1.GOLDEN, "a told-v1 beat is placed, timed or drawn differently");
  const b = compile(V2.BEATS);
  assert.deepStrictEqual(b.errors, []);
  assert.strictEqual(sha(b.stages.map((s) => s && { items: s.items, cam: s.cam, backdrops: s.backdrops, plate: s.plate })), V2.GOLDEN, "a told-v2 beat is placed, timed or drawn differently");
  for (const s of [...a.stages, ...b.stages].filter(Boolean)) assert.ok(!s.items.some((it) => "act" in it), "no figure plays a verb nobody wrote");
  assert.strictEqual(T.TOLD_VERSION, 3);
});

t("the engine reads `act` only on a v3 stage; the stage is still ONE svg; the verb module is pure", () => {
  const stage = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/components/ToldStage.tsx"), "utf8");
  assert.ok(/\(spec\.v \?\? 1\) >= 3 && it\.act/.test(stage), "a v1 / v2 stage must never be posed by `act`");
  assert.ok((stage.match(/<svg /g) || []).length === 1 && !/style=\{\{[^}]*transform/.test(stage));
  const acts = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/toldActs.ts"), "utf8");
  assert.ok(!/^\s*import\s/m.test(acts), "toldActs.ts has no import (plain Node loads it)");
  // the list of rig actions is the rig's: every action of schema.ts charAction, nothing else
  const schema = fs.readFileSync(path.join(__dirname, "../src/engines/antidote/schema.ts"), "utf8");
  const block = schema.slice(schema.indexOf("export const charAction = z.enum(["), schema.indexOf("export type CharAction"));
  const rig = [...block.split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, "")).join("\n").matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual([...TA.RIG_ACTIONS].sort(), [...new Set(rig)].sort());
});

t("every verb is one gesture: it is still before it starts, it comes to rest, and nothing loops", () => {
  for (const verb of TA.ACT_POSES) {
    const at = 200, p = (f) => JSON.stringify(TA.actPose({ verb, at }, f));
    assert.strictEqual(p(at + TA.ACT_REST[verb] + 1), p(at + TA.ACT_REST[verb] + 400), `${verb} is at rest after ${TA.ACT_REST[verb]} frames`);
    assert.strictEqual(p(at - TA.ACT_LEAD[verb] - 3), p(at - 500), `${verb} has not started before its lead`);
    // (a reaction — struck, bitten — starts ON the word; every verb has visibly happened six frames after it)
    assert.notStrictEqual(p(at + 6), p(at - TA.ACT_LEAD[verb] - 3), `${verb}: something has happened by the word`);
    assert.strictEqual(p(at + 100000), JSON.stringify(TA.actPose({ verb, at: -9999 }, 0)), "a figure carried over a cut is simply at rest");
  }
  // the strike lands ON the word: the burst at the fist starts there and is gone ten frames later
  assert.strictEqual(TA.actPose({ verb: "hit", at: 100 }, 99).impact, 0);
  assert.strictEqual(TA.actPose({ verb: "hit", at: 100 }, 100).impact, 1);
  assert.strictEqual(TA.actPose({ verb: "hit", at: 100 }, 111).impact, 0);
  assert.ok(TA.actPose({ verb: "hit", at: 100 }, 100).armR < -100, "the arm is out on the word");
  // counted strokes: typing is TYPE_TAPS key strokes with alternating hands, then the hands rest
  let taps = 0, was = 0; for (let f = 0; f < 200; f++) { const p = TA.actPose({ verb: "type", at: 0 }, f); const k = Math.abs(p.elbowR - 66) + Math.abs(p.elbowL + 66); if (k > 6 && was <= 6) taps++; was = k; }
  assert.strictEqual(taps, TA.TYPE_TAPS);
  assert.strictEqual(TA.actPose({ verb: "type", at: 0 }, 300).sit, 1, "the typist stays seated");
});

t("hit: the person walks up, turns to the other, the fist lands on the word; the other is struck on the same word", () => {
  const text = "Jonathan was patient for years and then one night he struck Dracula";
  const r = compile([beat("b1", text, { stage: { layout: "versus", who: ["jonathan", "dracula"] }, events: [{ on: "struck", do: "act", who: "jonathan", verb: "hit", target: "dracula" }] })]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0], at = wordAt(text, "struck");
  const [jon, pj] = live(s, "jonathan", at), [dra, pd] = live(s, "dracula", at + 2);
  assert.deepStrictEqual(jon.act, { verb: "hit", at });
  assert.deepStrictEqual(dra.act, { verb: "struck", at });
  assert.ok(Math.abs(pd.x - pj.x) < 290 && Math.abs(pd.x - pj.x) > 180, `within reach on the word (${Math.abs(pd.x - pj.x)})`);
  assert.ok(!jon.flip && dra.flip, "they face each other (he stands left: no flip; the other is flipped to face him)");
  assert.ok(live(s, "jonathan", 20)[1].x < pj.x - 100, "he had to walk up to him");
  assert.ok(dra.shake && dra.shake.at === at);
  // the next beat finds them at rest in it — the blow is not struck again
  const two = compile([beat("b1", text, { stage: { layout: "versus", who: ["jonathan", "dracula"] }, events: [{ on: "struck", do: "act", who: "jonathan", verb: "hit", target: "dracula" }] }), beat("b2", "and it changed nothing", { events: [{ on: "nothing", do: "title", text: "It changed nothing" }] })]);
  assert.deepStrictEqual(item(two.stages[1], "jonathan").act, { verb: "hit", at: -9999 });
  assert.ok(!item(two.stages[1], "dracula").shake);
});

t("type: the person SITS at the thing — a desk in front of them, the typewriter on it under their hands", () => {
  const text = "night after night Mina sat down and typed every page in manifold";
  const r = compile([beat("b1", text, { stage: { layout: "versus", who: ["mina", "typewriter"] }, events: [{ on: "typed", do: "act", who: "mina", verb: "type", target: "typewriter" }] })]);
  assert.deepStrictEqual(r.errors, []);
  const s = r.stages[0], at = wordAt(text, "typed");
  const [mina, pm] = live(s, "mina", 299), tw = item(s, "typewriter"), pt = T.itemState(tw, 299), desk = item(s, "mina.desk");
  assert.deepStrictEqual(mina.act, { verb: "type", at });
  assert.ok(Math.abs(pt.x - pm.x) < 2, "the typewriter is in front of her, not beside her");
  assert.ok(pt.y < pm.y - 100 && pt.y > pm.y - C.figH(mina) * pm.s * 0.7, "at the height of her hands");
  assert.ok(tw.w * pt.s < mina.w * pm.s * 0.9, "at a size a person types on");
  assert.ok(desk && desk.kind === "bar" && T.itemState(desk, 299).y > pt.y, "it stands on a desk");
  const order = ["mina", "mina.desk", "typewriter"].map((id) => s.items.indexOf(item(s, id)));
  assert.ok(order[0] < order[1] && order[1] < order[2], "drawn: the person, the desk, the thing on it");
  // she gets up when the stage turns to something else, and the desk goes
  const two = compile([beat("b1", text, { stage: { layout: "versus", who: ["mina", "typewriter"] }, events: [{ on: "typed", do: "act", who: "mina", verb: "type", target: "typewriter" }] }), beat("b2", "then she went to Jonathan", { stage: { layout: "versus", who: ["mina", "jonathan"] } })]);
  assert.deepStrictEqual(two.errors, []);
  assert.ok(!live(two.stages[1], "mina", 299)[0].act && item(two.stages[1], "mina.desk").exit, "standing again, no desk");
});

t("bite, look, meet, point, read, hide, dig, fall, come, chase: each puts the people where the verb needs them", () => {
  const one = (text, events, who = ["dracula", "mina"]) => { const r = compile([beat("b1", text, { stage: { layout: who.length > 2 ? "row" : "versus", who }, events })]); assert.deepStrictEqual(r.errors, [], text); return r.stages[0]; };
  let s = one("he came to her at night and bit her as she slept", [{ on: "bit", do: "act", who: "dracula", verb: "bite", target: "mina" }]);
  let at = wordAt("he came to her at night and bit her as she slept", "bit");
  assert.ok(Math.abs(live(s, "dracula", at)[1].x - live(s, "mina", at + 2)[1].x) < 240, "close enough to bite");
  assert.strictEqual(live(s, "mina", at + 2)[0].act.verb, "bitten");

  s = one("across the room their eyes met", [{ on: "met", do: "act", who: "dracula", verb: "meet", target: "mina" }]);
  assert.ok(live(s, "dracula", 299)[0].act.verb === "look" && live(s, "mina", 299)[0].act.verb === "look" && !live(s, "dracula", 299)[0].flip && live(s, "mina", 299)[0].flip, "both turn to each other");
  s = one("he only watched her", [{ on: "watched", do: "act", who: "dracula", verb: "look", target: "mina" }]);
  assert.ok(live(s, "dracula", 299)[0].act && !live(s, "mina", 299)[0].act, "one looks, the other does not look back");
  s = one("she pointed straight at him", [{ on: "pointed", do: "act", who: "mina", verb: "point", target: "dracula" }]);
  assert.ok(live(s, "mina", 299)[0].action === "point" && live(s, "mina", 299)[0].flip, "the rig's own point, turned to him");

  s = one("Mina opened the journal and read it through the night", [{ on: "read", do: "act", who: "mina", verb: "read", target: "journal" }], ["mina", "jonathan"]);
  const held = s.items.find((x) => /mina\.held/.test(x.id));
  assert.ok(held && held.paths.length === 5 && live(s, "mina", 299)[0].act.verb === "read", "the book is in her hands and she reads");

  s = one("he hid behind the box until they had gone", [{ on: "hid", do: "act", who: "jonathan", verb: "hide", target: "box" }], ["jonathan", "box"]);
  const [jon, pj] = live(s, "jonathan", 299), box = item(s, "box"), pb = T.itemState(box, 299);
  assert.ok(jon.act.verb === "hide" && Math.abs(pj.x - pb.x) < box.w * 0.5 && s.items.indexOf(jon) < s.items.indexOf(box), "behind it: overlapping, drawn first");
  assert.ok(pj.y < 850 && pj.y > pb.y, "down on the thing's ground, not on the stage floor below it");

  s = one("they dug beside the box for an hour", [{ on: "dug", do: "act", who: "jonathan", verb: "dig", target: "box" }], ["jonathan", "box"]);
  assert.ok(live(s, "jonathan", 299)[0].act.verb === "dig" && Math.abs(live(s, "jonathan", 299)[1].x - T.itemState(item(s, "box"), 299).x) > 200, "beside it, not on it");
  const mound = item(s, "jonathan.dig");
  assert.ok(mound && mound.kind === "icon" && mound.paths.length >= 4 && !mound.label, "the earth and the spade are there: a bent figure alone read as someone falling");

  const fallText = "and Jonathan fell where he stood and that was all there was to it now";
  s = one(fallText, [{ on: "fell", do: "act", who: "jonathan", verb: "fall" }], ["jonathan", "mina"]);
  assert.strictEqual(live(s, "jonathan", wordAt(fallText, "fell"))[0].action, "falling");
  assert.strictEqual(live(s, "jonathan", 299)[0].action, "collapsed");

  const comeText = "she waited a long time until at last Jonathan came to her";
  const r = compile([beat("b1", comeText, { stage: { layout: "solo", who: ["mina"] }, events: [{ on: "came", do: "act", who: "jonathan", verb: "come", target: "mina" }] })]);
  assert.deepStrictEqual(r.errors, []);
  at = wordAt(comeText, "came");
  const walk = r.stages[0].items.find((x) => x.id.startsWith("jonathan") && x.action === "walk"), pm = T.itemState(item(r.stages[0], "mina"), 299);
  assert.ok(walk && (T.itemState(walk, at - 40).x < 0 || T.itemState(walk, at - 40).x > 1920 || Math.abs(T.itemState(walk, at - 40).x - pm.x) > 600), "he starts far off");
  const end = live(r.stages[0], "jonathan", 299);
  assert.ok(end[0].action === "idle" && Math.abs(end[1].x - pm.x) < 400 && Math.abs(end[1].x - pm.x) > 220, "he stands beside her");

  const chaseText = "then Jonathan chased Dracula across the yard and out of sight of the house at last";
  s = one(chaseText, [{ on: "chased", do: "act", who: "jonathan", verb: "chase", target: "dracula" }], ["jonathan", "dracula"]);
  at = wordAt(chaseText, "chased");
  assert.strictEqual(live(s, "dracula", at + 20)[0].action, "run"); assert.strictEqual(live(s, "jonathan", at + 20)[0].action, "run");
  assert.ok(live(s, "dracula", at + 30)[1].x > live(s, "dracula", at)[1].x + 300, "he runs for the edge");
  assert.strictEqual(live(s, "dracula", 299), null, "the one who flees runs off the stage and is gone");
  const chaser = live(s, "jonathan", 299);
  assert.ok(chaser[1].x > 1100 && chaser[0].action === "idle" && chaser[0].act.verb === "look", "the chaser stops and looks after him: no running on the spot");
});

t("a verb the stage cannot honour is refused with the reason", () => {
  const bad = (events, who = ["mina", "typewriter", "varna"]) => compile([beat("b1", "she typed and hit and read and hid and came", { stage: { layout: "row", who }, events })]).errors.map((e) => e.message).join(" | ");
  assert.ok(/verb "sing" — one of hit/.test(bad([{ on: "typed", do: "act", who: "mina", verb: "sing" }])));
  assert.ok(/"who" is the PERSON/.test(bad([{ on: "typed", do: "act", who: "typewriter", verb: "type", target: "typewriter" }])));
  assert.ok(/needs "target" — the person it is done to/.test(bad([{ on: "hit", do: "act", who: "mina", verb: "hit" }])));
  assert.ok(/target "typewriter" is not a person/.test(bad([{ on: "hit", do: "act", who: "mina", verb: "hit", target: "typewriter" }])));
  assert.ok(/target "varna" is not a drawn thing/.test(bad([{ on: "typed", do: "act", who: "mina", verb: "type", target: "varna" }])));
  assert.ok(/dracula is not on stage/.test(bad([{ on: "hit", do: "act", who: "mina", verb: "hit", target: "dracula" }])));
  assert.ok(/jonathan is not on stage \(stage \/ enter first — or the verb "come"\)/.test(bad([{ on: "read", do: "act", who: "jonathan", verb: "read", target: "journal" }])));
});

t("merge: an act is checked like every told event; a person on stage with nobody doing anything is a WARNING", () => {
  const chk = (told, text) => R.checkToldBeat(told, text, ENT);
  assert.deepStrictEqual(chk({ stage: { layout: "versus", who: ["mina", "typewriter"] }, events: [{ on: "typed", do: "act", who: "mina", verb: "type", target: "typewriter" }] }, "she typed it"), []);
  const bad = chk({ events: [{ on: "typed", do: "act", who: "mina", verb: "sing" }, { on: "hit", do: "act", who: "typewriter", verb: "hit", target: "mina" }, { on: "bit", do: "act", who: "dracula", verb: "bite" }, { on: "read", do: "act", who: "mina", verb: "read", target: "varna" }, { on: "saw", do: "act", who: "mina", verb: "look", target: "mina" }] }, "she typed and hit and bit and read and saw");
  for (const re of [/verb "sing"/, /"who" is the one PERSON/, /\(act bite\): needs "target"/, /target "varna" is not a drawn thing/, /does not look themselves/]) assert.ok(bad.some((m) => re.test(m)), `${re} in\n  ${bad.join("\n  ")}`);
  const watch = R.toldWatch(ENT);
  assert.ok(watch({ stage: { layout: "versus", who: ["mina", "typewriter"] }, events: [{ on: "x", do: "title", text: "Typing in manifold" }] }).some((m) => /mina is on stage and nobody DOES anything/.test(m)));
  assert.ok(watch({ events: [{ on: "x", do: "label", who: "typewriter", text: "Carbon paper" }] }).some((m) => /nobody DOES/.test(m)), "the stage is carried: she is still there in the next beat");
  assert.deepStrictEqual(watch({ events: [{ on: "x", do: "act", who: "mina", verb: "type", target: "typewriter" }] }), []);
  assert.ok(watch({ events: [{ on: "x", do: "change", who: "mina", action: "typing" }] }).some((m) => /"typing" is not an action of the rig/.test(m)));
  assert.deepStrictEqual(watch({ events: [{ on: "x", do: "change", who: "mina", action: "sit" }] }), []);
  assert.deepStrictEqual(watch(null), []);
  assert.deepStrictEqual(watch({ stage: { layout: "row", who: ["demeter", "varna"] }, events: [{ on: "x", do: "grow", who: "demeter" }] }), [], "a stage of things alone is not asked for a verb");
});

t("the rules an author reads name every verb and say what the viewer will see; a book without people is not told about verbs", () => {
  const sec = R.toldSection(ENT);
  assert.ok(/PEOPLE PLAY THE VERB/.test(sec) && /\| `act` \|/.test(sec));
  for (const v of Object.keys(C.VERBS)) assert.ok(new RegExp(`\\| \`${v}\` \\|`).test(sec), `${v} is in the verb table`);
  assert.deepStrictEqual(Object.keys(C.VERBS).sort(), [...TA.TOLD_VERBS].sort());
  assert.deepStrictEqual(Object.keys(R.VERB_HELP).sort(), [...TA.TOLD_VERBS].sort());
  assert.ok(/`fighting`/.test(sec) && /is NOT an action/.test(sec));
  const things = R.toldSection({ microsoft: { label: "MICROSOFT", kind: "company" }, google: { label: "GOOGLE", kind: "company" } });
  assert.ok(!/PEOPLE PLAY THE VERB/.test(things) && !/\| verb \| target \|/.test(things));
});

console.log(`\n${n} checks passed`);
