#!/usr/bin/env node
// MOTIVE 1.0 — the INNER REASON as a thought bubble (2026-10-29). Class a of the 234-item blind corpus (a person's
// inner reason behind an outward act): 80 beats, 49 TEXT_ONLY, ADDS 2 — the reason lived only in the callout.
// art.json `thought: { expression | concept, cue? }` -> merge validates -> plan-antidote puts it on the lead
// (`characters[0].thought`, word-timed `at`) -> the lock seals it (drift + restore) -> Scene draws ThoughtBubble.
// Geometry stays inside the frame. Pre-registration: audit/motive-1/preregistration.json.
// Run: node scripts/test-thought.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && info ? `  (${String(info).slice(0, 500)})` : ""}`); if (!ok) failed++; };
const REPO = path.join(__dirname, "..");

// ── (G) geometry: the bubble stays inside the frame, beside the head, dots lead from head to bubble ──
{
  const { thoughtLayout, cloudBox, CLOUD } = require("../src/engines/antidote/thoughtLayout.ts");
  for (const [hx, hy, sc] of [[300, 300, 0.7], [1600, 260, 0.9], [960, 120, 1.2], [80, 500, 0.5]]) {
    const L = thoughtLayout({ x: hx, y: hy }, sc, hx < 960);
    const headR = 125 * sc, c = cloudBox(L.cx, L.cy, L.r), clear = c.bottom <= hy - headR || Math.abs(L.cx - hx) >= CLOUD.side * L.r + headR - 1;
    t(`geometry (${hx},${hy}) x${sc}: the whole cloud inside the frame, never over the face`, c.left >= 0 && c.right <= 1920 && c.top >= 0 && c.bottom <= 1080 && clear, JSON.stringify(c));
    t(`geometry (${hx},${hy}): the dots grow from the head toward the bubble`, L.dots.length === 3 && L.dots[0].r < L.dots[2].r && Math.abs(L.dots[2].x - L.cx) < Math.abs(L.dots[0].x - L.cx) + 1);
  }
  {
    // DEV hate-u-give 20: the callout line covered the bubble — it now drops below the box (and steps beside the head)
    const { textBox } = require("../src/engines/antidote/thoughtLayout.ts");
    const box = textBox({ x: 960, y: 150, size: 96, text: "THE ANGRY BLACK GIRL TROPE" });
    const L = thoughtLayout({ x: 620, y: 470 }, 0.9, true, [box]);
    const c = cloudBox(L.cx, L.cy, L.r), over = c.right > box.left && c.left < box.right && c.top < box.bottom && c.bottom > box.top;
    const headR = 125 * 0.9, clear = c.bottom <= 470 - headR || Math.abs(L.cx - 620) >= CLOUD.side * L.r + headR - 1;
    t("geometry: never under a callout, still clear of the face", !over && clear && L.cy + L.r <= 1080, JSON.stringify({ box, cx: L.cx, cy: L.cy, r: L.r }));
  }
  const l = thoughtLayout({ x: 500, y: 400 }, 0.8, true), r = thoughtLayout({ x: 1420, y: 400 }, 0.8, false);
  t("geometry: the bubble floats toward the frame (right of a left figure, left of a right figure)", l.cx > 500 && r.cx < 1420);
}
// ── (S) schema keeps it ──
{
  const { characterSchema } = require("../src/engines/antidote/schema.ts");
  const c = characterSchema.parse({ id: "a", thought: { expression: "afraid", at: 12 } });
  t("schema: characters[].thought survives parse", c.thought && c.thought.expression === "afraid" && c.thought.at === 12);
}

// ── (M/P/L) merge -> planner -> lock on a word-timed fixture ──
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "thought-"));
const SLUG = `zz-thought-${process.pid}`;
const BOOK = path.join(tmp, "books", SLUG);
const env = { ...process.env, USE_NVIDIA: "0", PRODUCTION_GUARD: "off" };
const SENTENCES = [
  "Welcome to this deep dive into a school story.",
  "She keeps her face perfectly calm in class.",
  "She never looks angry because she is terrified of the label.",
  "The other students never notice a thing.",
];
const tsf = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`; };
let vtt = "WEBVTT\nKind: captions\nLanguage: en\n\n", clock = 0;
for (const sent of SENTENCES) {
  const words = sent.split(" "); const start = clock; let line = words[0];
  for (let k = 1; k < words.length; k++) line += `<${tsf(start + k * 0.3)}><c> ${words[k]}</c>`;
  const end = start + words.length * 0.3;
  vtt += `${tsf(start)} --> ${tsf(end)} align:start position:0%\n \n${line}\n\n${tsf(end)} --> ${tsf(end + 0.01)} align:start position:0%\n${sent}\n\n`;
  clock = end + 1.0;
}
fs.mkdirSync(path.join(BOOK, "storyboard"), { recursive: true });
fs.mkdirSync(path.join(tmp, "data"), { recursive: true });
for (const f of ["shared-generic-motifs.json", "motif-world.json"]) fs.copyFileSync(path.join(REPO, "data", f), path.join(tmp, "data", f));
fs.writeFileSync(path.join(tmp, "fx.vtt"), vtt);
const CAST = { starr: { name: "Starr", role: "the student", look: "teen girl, braids" }, narrator: { name: "Narrator", role: "host", look: "host" } };
fs.writeFileSync(path.join(tmp, "cast.json"), JSON.stringify({ cast: CAST }));
fs.writeFileSync(path.join(BOOK, "book.json"), JSON.stringify({ slug: SLUG, title: "Thought Test", author: "A. Writer", genre: "fiction", engine: "antidote" }));
fs.writeFileSync(path.join(BOOK, "story-bible.json"), JSON.stringify({ cast: CAST, visualProvenance: { allowedMotifs: [] } }));
const PLAN = path.join(__dirname, "plan-antidote.js");
const base = [PLAN, `--slug=${SLUG}`, "--title=Thought Test", "--author=A. Writer", "--genre=fiction", `--vtt=${path.join(tmp, "fx.vtt")}`, `--cast=${path.join(tmp, "cast.json")}`, "--scene-secs=2"];
const run = (argv) => spawnSync(process.execPath, argv, { encoding: "utf8", cwd: REPO, env });
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const SB = { claim: "c", concreteVisual: "v", onScreenText: "none", relationToPrevious: "r", addedInformation: "a" };
const merge = () => { const r = run([path.join(__dirname, "storyboard.js"), "merge", `--slug=${SLUG}`, "--write", `--root=${tmp}`]); r.out = (r.stdout || "") + (r.stderr || ""); return r; };
try {
  run([...base, `--emit-beats=${path.join(tmp, "beats.json")}`]);
  const emitted = read(path.join(tmp, "beats.json"));
  const beats = emitted ? (emitted.beats || emitted) : [];
  const iT = (beats.find((b) => /terrified/.test(b.narration || "")) || {}).i;
  t("fixture: the motive beat exists", iT > 0, JSON.stringify(beats.map((b) => b.narration)));
  fs.writeFileSync(path.join(BOOK, "storyboard", "beats.json"), JSON.stringify({ beats: beats.map((b) => ({ i: b.i, narration: b.narration })) }));
  const write = (th, extra = {}) => fs.writeFileSync(path.join(BOOK, "storyboard", "authored-1.json"), JSON.stringify(beats.map((b) => {
    const x = { i: b.i, concept: null, diagram: null, callout: null, storyboard: SB, set: "classroom" };
    if (b.i === iT) Object.assign(x, { cast: ["starr"], action: "idle", expression: "blank", ...(th === undefined ? {} : { thought: th }), ...extra });
    return x;
  })));
  write({ expression: "afraid", words: "LABEL" });
  let r = merge();
  t("merge: words in the bubble are refused (no relabel, no text)", r.status !== 0 && /thought: unsupported field "words"/.test(r.out), r.out.slice(-300));
  write({ expression: "afraid", concept: "mask" });
  t("merge: an inner face AND an icon in one bubble is refused (one relation)", /exactly one of "expression"/.test(merge().out));
  write({ expression: "furious" });
  t("merge: an inner face outside the vocabulary is refused", /thought expression "furious" not in this book's vocabulary/.test(merge().out));
  write({ expression: "afraid", cue: "panicking" });
  t("merge: a cue that is not spoken in the beat is refused", /thought cue "panicking" is not spoken/.test(merge().out));
  write({ expression: "blank" });
  r = merge();
  t("merge: the same face inside and outside is flagged (no contrast)", /REVIEW_REQUIRED thought expression "blank" is the outward face too/.test(r.out), r.out.slice(-300));
  write({ expression: "afraid" }, { cast: [] });
  t("merge: a bubble needs a person", /thought needs a person/.test(merge().out));
  write({ expression: "afraid", cue: "terrified" });
  r = merge();
  t("merge: a valid inner face with a spoken cue is accepted and kept in art.json", r.status === 0 && ((read(path.join(BOOK, "art.json")) || { beats: [] }).beats.find((b) => b.i === iT) || {}).thought?.cue === "terrified", r.out.slice(-400));
  r = run([...base, `--callouts=${path.join(BOOK, "art.json")}`, `--out=${path.join(tmp, "config.json")}`]);
  const cfg = read(path.join(tmp, "config.json"));
  t("plan: config written", !!cfg, (r.stderr || r.stdout || "").slice(-400));
  if (cfg) {
    const sc = cfg.scenes[iT] || {};
    const c0 = (sc.characters || [])[0] || {};
    t("plan: the lead carries the bubble (inner face), the outward face unchanged", c0.thought && c0.thought.expression === "afraid" && c0.expression === "blank", JSON.stringify(c0));
    t("plan: the bubble appears on the spoken cue (word-timed, inside the beat)", c0.thought && c0.thought.at > 12 && c0.thought.at < sc.durationFrames, JSON.stringify([c0.thought, sc.durationFrames]));
    const Lk = sc._authorship && sc._authorship.lock;
    t("lock: seals the thought", !!Lk && Lk.thought && Lk.thought.expression === "afraid", JSON.stringify(Lk));
    const { stagingDrift, restoreAuthoredStaging } = require("./lib/authorship");
    t("gate: the planned beat has no drift", stagingDrift(sc).length === 0, JSON.stringify(stagingDrift(sc)));
    const later = JSON.parse(JSON.stringify(cfg));
    delete later.scenes[iT].characters[0].thought;
    t("gate: an engine that drops the bubble is drift", stagingDrift(later.scenes[iT]).some((x) => /^thought afraid→none/.test(x)), JSON.stringify(stagingDrift(later.scenes[iT])));
    restoreAuthoredStaging(later);
    t("restore: the bubble is put back", later.scenes[iT].characters[0].thought && later.scenes[iT].characters[0].thought.expression === "afraid");
    const others = cfg.scenes.filter((s, k) => k !== iT).flatMap((s) => s.characters || []);
    t("plan: no bubble anywhere the author did not write one", others.every((c) => !c.thought));
  }
} finally {
  if (!process.env.KEEP_FIXTURE) fs.rmSync(tmp, { recursive: true, force: true }); else console.log("fixture kept: " + tmp);
  if (fs.existsSync(path.join(REPO, "books", SLUG))) fs.rmSync(path.join(REPO, "books", SLUG), { recursive: true, force: true });
}
console.log(failed ? `\n${failed} FAILED` : "\nall thought checks passed");
process.exit(failed ? 1 : 0);
