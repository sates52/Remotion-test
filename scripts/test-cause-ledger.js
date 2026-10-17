#!/usr/bin/env node
// Offline tests for cause-ledger.js on a temp-dir fixture (no render, no LLM).
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const S = __dirname;
let fail = 0;
const t = (name, ok) => { console.log(`${ok ? "✓" : "✗"} ${name}`); if (!ok) fail++; };

const root = fs.mkdtempSync(path.join(os.tmpdir(), "cause-ledger-"));
const slug = "fixture-book";
const BOOK = path.join(root, "books", slug);
fs.mkdirSync(BOOK, { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "icon-readings.json"), JSON.stringify({ icons: {} }));
fs.writeFileSync(path.join(root, "data", "shared-generic-motifs.json"), JSON.stringify({ motifs: ["shield", "phone"] }));

const scene = (k, extra) => ({ id: `scene-${String(k).padStart(2, "0")}`, fromFrame: k * 300, durationFrames: 300, _narration: `beat ${k} the guilt after saying no lingers for days`, ...extra });
const who = (identity, expression = "neutral", action = "talk") => ({ identity, rig: "everyman", expression, action });
const scenes = [
  scene(1, { shot: "twoShot", characters: [who("luther"), who("luther", "neutral", "idle")] }),            // twin cast
  scene(2, { shot: "medium", characters: [who("everyman", "worried", "think")] }),                         // bare figure (dead)
  scene(3, { shot: "medium", characters: [who("everyman", "worried", "think")] }),                         // same staging as 2 -> REVIEW
  scene(4, { shot: "medium", characters: [who("everyman", "sad", "slump")], props: [{ type: "phone" }] }), // rater: judge says smiling
  scene(5, { shot: "medium", characters: [who("everyman", "worried", "think")] }),                         // bare, but overridden
  scene(6, { shot: "medium", characters: [who("everyman", "worried", "think")] }),                         // same staging, judged CORRECT
];
const cfg = { meta: {}, scenes };
fs.writeFileSync(path.join(BOOK, "config.antidote.json"), JSON.stringify(cfg));
fs.writeFileSync(path.join(BOOK, "art.json"), JSON.stringify({ beats: scenes.map((s, i) => ({ i, narration: s._narration, concept: null, cast: ["everyman"] })) }));
const frameOf = (s) => s.fromFrame + 200;

const M = path.join(root, "audit", "mute", slug, "run1");
fs.mkdirSync(M, { recursive: true });
const items = [
  ["item-01", scenes[0], "Two identical horned men side by side, both calm.", "WRONG", "NONE", "Two copies of one man contradict the guilt."],
  ["item-02", scenes[1], "A worried man stands alone on a grey background.", "NEUTRAL", "NONE", "Worried man; nothing about guilt."],
  ["item-03", scenes[3], "A frowning, sad man holds a phone, shoulders slumped.", "WRONG", "NONE", "Smiling man contradicts the guilt."],
  ["item-04", scenes[4], "A worried man stands alone on a grey background.", "NEUTRAL", "NONE", "Worried man; nothing about guilt."],
  ["item-05", scenes[5], "A worried man stands alone.", "CORRECT", "ADDS", "Worry fits."],
];
fs.writeFileSync(path.join(M, "judge-key.json"), JSON.stringify(Object.fromEntries(items.map(([id, s]) => [id, { frame: frameOf(s) }]))));
fs.writeFileSync(path.join(M, "judge-input.json"), JSON.stringify(items.map(([id, s, sees]) => ({ id, narration: s._narration, V: { sees } }))));
fs.writeFileSync(path.join(M, "judge-result.json"), JSON.stringify({ items: items.map(([id, , , c, b, why]) => ({ id, V: { correctness: c, contribution: b, why, whyC: "c" } })) }));
fs.writeFileSync(path.join(M, "totals.json"), JSON.stringify({ label: "run1", date: new Date(Date.now() + 60000).toISOString() }));
fs.writeFileSync(path.join(BOOK, "cause-overrides.json"), JSON.stringify({ "mute/run1/scene-05": { owner: "ENGINE", why: "the author opened the still: the rig drew no hands" } }));

const before = fs.readFileSync(path.join(BOOK, "config.antidote.json"), "utf8");
const r = spawnSync(process.execPath, [path.join(S, "cause-ledger.js"), `--slug=${slug}`, `--root=${root}`], { encoding: "utf8" });
const dir = path.join(root, "audit", "cause-ledger", slug);
const led = fs.existsSync(dir) ? JSON.parse(fs.readFileSync(path.join(dir, fs.readdirSync(dir)[0]), "utf8")) : null;
const row = (scene) => led && led.rows.find((x) => x.scene === scene);
t("runs and writes a ledger", r.status === 0 && !!led);
t("4 failures (WRONG or dead), the CORRECT item is not a row", led && led.rows.length === 4);
t("twin-cast WRONG -> ENGINE", row("scene-01") && row("scene-01").owner === "ENGINE" && row("scene-01").cls === "twin-cast");
t("bare figure dead -> AUTHORING", row("scene-02") && row("scene-02").owner === "AUTHORING" && row("scene-02").cls === "bare-figure");
t("judge says smiling, description says frowning -> RATER", row("scene-03") === undefined && row("scene-04") && row("scene-04").owner === "RATER");
t("override file wins", row("scene-05") && row("scene-05").owner === "ENGINE" && row("scene-05").confidence === "override");
t("AUTHORING row lists same-staging beats as REVIEW candidates", row("scene-02") && row("scene-02").review.map((x) => x.scene).sort().join() === "scene-03,scene-05,scene-06");
t("a REVIEW candidate carries its blind verdicts", row("scene-02") && row("scene-02").review.find((x) => x.scene === "scene-06").judged.join() === "mute/run1:CORRECT/ADDS");
t("every row is advisory and has a confidence", led && led.advisory === true && led.rows.every((x) => x.advisory === true && x.confidence));
t("tally per owner", led && led.tally.ENGINE.WRONG === 1 && led.tally.ENGINE.DEAD === 1 && led.tally.AUTHORING.DEAD === 1 && led.tally.RATER.WRONG === 1);
t("a class seen once is not confirmed", led && /^no/.test(led.authoringClasses["bare-figure"].confirmed));
t("warns when the film has not changed since the last holdout", led && led.filmUnchangedSinceLastMute === "mute/run1" && /do NOT draw a new holdout/.test(r.stdout));
t("stdout says advisory and has the owner table", /ADVISORY/.test(r.stdout) && /ENGINE\s+1\s+1/.test(r.stdout));
t("never writes the config", fs.readFileSync(path.join(BOOK, "config.antidote.json"), "utf8") === before);

fs.rmSync(root, { recursive: true, force: true });
console.log(fail ? `\n${fail} FAILED` : "\nall passed");
process.exit(fail ? 1 : 0);
