#!/usr/bin/env node
// Human Video Study v2 — browser test (runs on GitHub Actions: .github/workflows/human-study-test.yml; never locally).
//   NODE_PATH=<dir with playwright> node audit/c15/test-human-study.js --pkg=<send dir>
// Chromium + Firefox, offline (file://): one video at a time, answers lock, the second video appears only after the
// first is locked, preference + reason required, JSON export with every required field, an unfinished form exports as
// "incomplete", and presentation order is balanced across participants.
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { chromium, firefox } = require("playwright");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const PKG = path.resolve(args.pkg);
const URL = "file://" + path.join(PKG, "index.html");
const results = {};

async function fillVisible(page, text) { for (const ta of await page.$$("textarea:not([disabled])")) await ta.fill(text); }

async function run(name, launcher) {
  const browser = await launcher.launch();
  const r = { checks: [] };
  const ok = (c, m) => { assert(c, `${name}: ${m}`); r.checks.push(m); };
  // 1. a complete run of the first two scenes, then an early export (incomplete), then the full run
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.click("#start");
  const st0 = await page.evaluate(() => window.__study.state());
  ok(/^P-[0-9a-f]{10}$/.test(st0.participantId) && st0.randomizationSeed === st0.participantId, "anonymous participant id = randomization seed");
  ok(st0.sceneOrder.length === st0.scenes.length && new Set(st0.sceneOrder).size === st0.sceneOrder.length, "scene order is a permutation");
  for (let k = 0; k < st0.scenes.length; k++) {
    ok((await page.$$("video")).length === 1, `scene ${k + 1}: exactly one video on screen (video 1)`);
    const f1 = await page.getAttribute("video", "data-file");
    ok(await page.isDisabled("#lock"), `scene ${k + 1}: lock disabled while answers are empty`);
    await fillVisible(page, "seen something"); await page.click("#lock");
    ok((await page.$$("video")).length === 1, `scene ${k + 1}: exactly one video on screen (video 2)`);
    const f2 = await page.getAttribute("video", "data-file");
    ok(f1 !== f2 && f1.slice(0, 3) === f2.slice(0, 3), `scene ${k + 1}: video 2 is the other version of the same scene`);
    const s = await page.evaluate(() => window.__study.state());
    ok(s.scenes[k].videos[0].locked === true, `scene ${k + 1}: video-1 answers locked`);
    await fillVisible(page, "another thing"); await page.click("#lock");
    ok(await page.isDisabled("#next"), `scene ${k + 1}: next disabled until preference + reason`);
    await page.check('input[name="pref"][value="2"]'); await page.fill('textarea[data-q="preferenceReason"]', "clearer objects");
    if (k === 1) { // export mid-way: must be incomplete
      const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => window.__study.exportJSON())]);
      const j = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
      ok(j.completionStatus === "incomplete" && j.missingRequired.length > 0, "an unfinished form exports as incomplete with the missing list");
    }
    await page.click("#next");
  }
  ok(await page.isVisible("#dl"), "finish screen shown");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#dl")]);
  const j = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  for (const k of ["studyVersion", "anonymousParticipantId", "randomizationSeed", "completionStatus", "scenes"]) ok(j[k] !== undefined, `JSON has ${k}`);
  ok(j.studyVersion === 2 && j.completionStatus === "complete" && j.missingRequired.length === 0, "a finished form exports as complete");
  const sc = j.scenes[0];
  for (const k of ["sceneId", "videoPresentationOrder", "comprehension", "visualPreference", "preferenceReason"]) ok(sc[k] !== undefined, `scene JSON has ${k}`);
  ok(sc.comprehension.length === 2 && sc.comprehension.every((c) => c.seen && c.changed && c.message && c.wrongInferenceOrUncertainty && c.locked), "two separate locked comprehension records per scene");
  ok(!/answer.?key|order\.json|version [AB]\b/i.test(fs.readFileSync(path.join(PKG, "index.html"), "utf8")), "no answer key / version identity in the page");
  r.h264Playable = j.h264Playable;
  // 2. balance: 40 fresh participants → how often each scene shows X first
  const xFirst = {};
  for (let i = 0; i < 40; i++) {
    const c2 = await browser.newContext(); const p2 = await c2.newPage(); await p2.goto(URL); await p2.click("#start");
    const s = await p2.evaluate(() => window.__study.state());
    for (const scn of s.scenes) xFirst[scn.sceneId] = (xFirst[scn.sceneId] || 0) + (scn.presentation[0] === "X" ? 1 : 0);
    await c2.close();
  }
  const vals = Object.values(xFirst);
  ok(vals.every((v) => v >= 8 && v <= 32), `presentation balanced across 40 participants (X first per scene: ${vals.join(",")})`);
  r.xFirstOf40 = xFirst;
  await browser.close();
  results[name] = r;
  console.log(`${name}: ${r.checks.length} checks passed; h264 playable: ${r.h264Playable}`);
}

(async () => {
  await run("chromium", chromium);
  await run("firefox", firefox);
  fs.writeFileSync(path.join(PKG, "..", "browser-test.json"), JSON.stringify(results, null, 1));
  console.log("human study v2 browser test: PASS");
})().catch((e) => { console.error(e); process.exit(1); });
