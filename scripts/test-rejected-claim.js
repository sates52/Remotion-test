#!/usr/bin/env node
// Authored REJECTED claim (10x pilot C, 2026-10-26): "the book makes it sound like the guilt just neatly evaporates
// like magic, right? But guilt does not vanish on command." The claim is pictured on its own beat, marked
// `"rejected": true` (+ `rejectedCue`); on the cue the picture drains to grey and a red ✗ is drawn over it
// (components/RejectedMark.tsx). merge -> planner (scene.rejected.at on the cue word) -> lock -> gate / restore.
// Run: node scripts/test-rejected-claim.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && info ? `  (${info})` : ""}`); if (!ok) failed++; };
const REPO = path.join(__dirname, "..");

// ── (A) schema + the mark ───────────────────────────────────────────────────
const { sceneSchema } = require("../src/engines/antidote/schema.ts");
const RJ = sceneSchema.shape.rejected;
t("schema: a scene may carry rejected.at", !!RJ && RJ.safeParse({ at: 40 }).success && !RJ.safeParse({ at: -1 }).success);
const RM = require("../src/engines/antidote/rejected.ts");
t("mark: full colour before the cue, grey after it", RM.rejectedFilter(-5).startsWith("grayscale(0.000)") && RM.rejectedFilter(RM.REJECT_DRAIN + 1).startsWith("grayscale(1.000)"));
{
  const [a0, b0] = RM.rejectedStrokes(0), [a1, b1] = RM.rejectedStrokes(2 + RM.REJECT_STROKE), [a2, b2] = RM.rejectedStrokes(60);
  t("mark: the two arms of the ✗ draw one after the other and stay", a0 === 0 && b0 === 0 && a1 === 1 && b1 === 0 && a2 === 1 && b2 === 1, JSON.stringify([a0, b0, a1, b1, a2, b2]));
}
const sceneSrc = fs.readFileSync(path.join(REPO, "src/engines/antidote/components/Scene.tsx"), "utf8");
t("wiring: Scene greys the whole picture and draws the ✗ OUTSIDE the grey filter", /filter: rejectedFilter\(local - rejectAt\)/.test(sceneSrc) && /<RejectedMark local=\{local - rejectAt\} \/>/.test(sceneSrc));
const rules = fs.readFileSync(path.join(REPO, "scripts/storyboard.js"), "utf8");
t("rules: authors are told when to reject a claim and never to strike an asserted one", /A CLAIM THE NARRATOR THROWS OUT/.test(rules) && /Never use\s+"strike" to emphasise something the narrator ASSERTS/.test(rules));

// ── (B) merge -> planner -> lock -> gate on a word-timed fixture ────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rejected-claim-"));
const SLUG = `zz-rejected-claim-${process.pid}`;
const BOOK = path.join(tmp, "books", SLUG);
const env = { ...process.env, USE_NVIDIA: "0", PRODUCTION_GUARD: "off" };
const SENTENCES = [
  "Welcome to this deep dive into saying no.",
  "The book makes it sound like the guilt just evaporates like magic.",
  "But guilt does not vanish on command and it lingers.",
  "Some refusals cost you real relationships.",
];
const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`; };
let vtt = "WEBVTT\nKind: captions\nLanguage: en\n\n", clock = 0;
for (const sent of SENTENCES) {
  const words = sent.split(" "); const start = clock; let line = words[0];
  for (let k = 1; k < words.length; k++) line += `<${ts(start + k * 0.3)}><c> ${words[k]}</c>`;
  const end = start + words.length * 0.3;
  vtt += `${ts(start)} --> ${ts(end)} align:start position:0%\n \n${line}\n\n${ts(end)} --> ${ts(end + 0.01)} align:start position:0%\n${sent}\n\n`;
  clock = end + 1.0;
}
fs.mkdirSync(path.join(BOOK, "storyboard"), { recursive: true });
fs.mkdirSync(path.join(tmp, "data"), { recursive: true });
for (const f of ["shared-generic-motifs.json", "motif-world.json"]) fs.copyFileSync(path.join(REPO, "data", f), path.join(tmp, "data", f));
fs.writeFileSync(path.join(tmp, "fx.vtt"), vtt);
const CAST = { everyman: { name: "Reader", role: "the reader", look: "man, short brown hair" }, narrator: { name: "Narrator", role: "host", look: "host" } };
fs.writeFileSync(path.join(tmp, "cast.json"), JSON.stringify({ cast: CAST }));
fs.writeFileSync(path.join(BOOK, "book.json"), JSON.stringify({ slug: SLUG, title: "No Test", author: "A. Writer", genre: "nonfiction", engine: "antidote" }));
fs.writeFileSync(path.join(BOOK, "story-bible.json"), JSON.stringify({ cast: CAST, visualProvenance: { allowedMotifs: [] } }));
const PLAN = path.join(__dirname, "plan-antidote.js");
const base = [PLAN, `--slug=${SLUG}`, "--title=No Test", "--author=A. Writer", "--genre=nonfiction", `--vtt=${path.join(tmp, "fx.vtt")}`, `--cast=${path.join(tmp, "cast.json")}`, "--scene-secs=2"];
const run = (argv) => spawnSync(process.execPath, argv, { encoding: "utf8", cwd: REPO, env });
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const SB = { claim: "c", concreteVisual: "v", onScreenText: "none", relationToPrevious: "r", addedInformation: "a" };
const merge = () => run([path.join(__dirname, "storyboard.js"), "merge", `--slug=${SLUG}`, "--write", `--root=${tmp}`]);
try {
  run([...base, `--emit-beats=${path.join(tmp, "beats.json")}`]);
  const emitted = read(path.join(tmp, "beats.json"));
  const beats = emitted ? (emitted.beats || emitted) : [];
  const iClaim = (beats.find((b) => /evaporates like magic/.test(b.narration || "")) || {}).i;
  const iTruth = (beats.find((b) => /vanish on command/.test(b.narration || "")) || {}).i;
  t("fixture: claim and truth are their own beats", iClaim > 0 && iTruth === iClaim + 1, JSON.stringify(beats.map((b) => b.narration)));
  fs.writeFileSync(path.join(BOOK, "storyboard", "beats.json"), JSON.stringify({ beats: beats.map((b) => ({ i: b.i, narration: b.narration })) }));
  const write = (mut) => fs.writeFileSync(path.join(BOOK, "storyboard", "authored-1.json"), JSON.stringify(beats.map((b) => {
    const x = { i: b.i, concept: null, diagram: null, callout: null, storyboard: SB, set: "room", cast: ["everyman"] };
    if (b.i === iClaim) Object.assign(x, { expression: "happy", action: "celebrate", rejected: true, rejectedCue: "like magic", callout: { text: "Guilt evaporates like magic", style: "reveal" } });
    if (b.i === iTruth) Object.assign(x, { expression: "worried", action: "think", callout: { text: "It lingers", style: "reveal" } });
    if (mut) mut(x, b.i);
    return x;
  })));
  write((x, i) => { if (i === iClaim) x.callout.style = "strike"; });
  let r = merge();
  t("merge: a struck callout on a rejected beat is refused (double negative)", r.status !== 0 && /not "strike"/.test(r.stdout), (r.stdout || "").slice(-300));
  write((x, i) => { if (i === iClaim) x.rejectedCue = "never said"; });
  r = merge();
  t("merge: an unspoken rejectedCue is refused", r.status !== 0 && /rejectedCue "never said" is not spoken/.test(r.stdout));
  write((x, i) => { if (i === iTruth) x.rejectedCue = "lingers"; });
  r = merge();
  t("merge: rejectedCue without rejected is refused", r.status !== 0 && /rejectedCue without/.test(r.stdout));
  write((x, i) => { if (i === iTruth) x.continue = true; });
  r = merge();
  t("merge: the truth may not continue the rejected picture", r.status !== 0 && /continues the rejected claim/.test(r.stdout));
  write(null);
  r = merge();
  const art = read(path.join(BOOK, "art.json"));
  const ac = ((art && art.beats) || []).find((b) => b.i === iClaim) || {};
  t("merge --write keeps rejected + rejectedCue", ac.rejected === true && ac.rejectedCue === "like magic", (r.stdout || "").slice(-600));
  r = run([...base, `--callouts=${path.join(BOOK, "art.json")}`, `--out=${path.join(tmp, "config.json")}`]);
  const cfg = read(path.join(tmp, "config.json"));
  t("plan: config written", !!cfg, (r.stderr || r.stdout || "").slice(-500));
  if (cfg) {
    const sc = cfg.scenes[iClaim] || {}, tr = cfg.scenes[iTruth] || {};
    // the cue "like magic" starts at word 11 of "The book makes it sound like the guilt just evaporates like magic." (3.0 s)
    t("plan: the claim is rejected on the cue word; the truth is not", !!sc.rejected && Math.abs(sc.rejected.at - (Math.round(10 * 0.3 * 30) - 4)) <= 4 && !tr.rejected, JSON.stringify([sc.rejected, tr.rejected]));
    t("plan: the claim keeps its plain callout and the author's face", (sc.texts || []).some((x) => /GUILT EVAPORATES/i.test(x.text) && x.style !== "strike") && ((sc.characters || [])[0] || {}).expression === "happy", JSON.stringify(sc.texts));
    const L = sc._authorship && sc._authorship.lock;
    t("lock: seals the rejection", !!L && !!L.rejected && L.rejected.at === sc.rejected.at, JSON.stringify(L && L.rejected));
    const { stagingDrift, restoreAuthoredStaging } = require("./lib/authorship");
    t("gate: the planned beats have no drift", stagingDrift(sc).length === 0 && stagingDrift(tr).length === 0, JSON.stringify([stagingDrift(sc), stagingDrift(tr)]));
    const later = JSON.parse(JSON.stringify(cfg));
    delete later.scenes[iClaim].rejected;
    t("gate: an engine that drops the rejection is drift", stagingDrift(later.scenes[iClaim]).includes("rejected claim→plain"));
    restoreAuthoredStaging(later);
    t("restore: the rejection is put back on its cue", !!later.scenes[iClaim].rejected && later.scenes[iClaim].rejected.at === sc.rejected.at);
  }
} finally {
  if (!process.env.KEEP_FIXTURE) fs.rmSync(tmp, { recursive: true, force: true }); else console.log("fixture kept: " + tmp);
  if (fs.existsSync(path.join(REPO, "books", SLUG))) fs.rmSync(path.join(REPO, "books", SLUG), { recursive: true, force: true });
}
console.log(failed ? `\n${failed} FAILED` : "\nall rejected-claim checks passed");
process.exit(failed ? 1 : 0);
