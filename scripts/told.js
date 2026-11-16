#!/usr/bin/env node
/**
 * told.js — FILM FLOW 2: the picture shows what the narration names (2026-11-14).
 *
 *   node scripts/told.js entities --slug=<slug>            what the narration names → storyboard/entities.candidates.json
 *                                                          (the lead agent writes storyboard/entities.json from it,
 *                                                           BEFORE the storyboard authors start; rules.md then lists them)
 *   node scripts/told.js check    --slug=<slug>            compile every told beat of art.json against the planned config
 *                                                          (word timings): errors, warnings, name coverage. Writes nothing.
 *   node scripts/told.js apply    --slug=<slug> [--write] [--pipeline]
 *                                                          the told stages into config.antidote.json, sealed as the
 *                                                          authored decision; make-book runs it (step 1.886) after every
 *                                                          plan, before the gates. Without --write: the report only.
 *   node scripts/told.js revert   --slug=<slug> --write    the figure-and-text picture back on every told scene
 *   node scripts/told.js status   --slug=<slug>            how many scenes are told, coverage before / after
 *   all: [--book-root=<checkout>]  (a book in its own worktree; this script runs from current code)
 *
 * Authoring: .claude/skills/antidote-visual-authoring/told.md (every harness) · the book's storyboard/rules.md.
 * A beat i of art.json is scene i of the config (the planner keeps one scene per beat; the narration is compared).
 * A told beat that does not compile is an ERROR: nothing is written and the pipeline stops — a film is never half-told
 * by accident. No model call, no render.
 */
const fs = require("fs");
const path = require("path");
const { applyTold, revertTold } = require("./lib/told-apply");
const { entitiesOf, mentionCoverage } = require("./lib/told-entities");
const { validateEntities, KINDS, GLYPHS } = require("./lib/told-compile");

const cmd = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const ROOT = path.resolve(typeof args["book-root"] === "string" ? args["book-root"] : path.join(__dirname, ".."));
const SLUG = args.slug;
const usage = () => { console.log("usage: node scripts/told.js entities | check | apply [--write] [--pipeline] | revert --write | status   --slug=<slug> [--book-root=<checkout>]"); process.exit(2); };
if (!cmd || typeof SLUG !== "string") usage();
const BOOK = path.join(ROOT, "books", SLUG), SB = path.join(BOOK, "storyboard");
const F = { config: path.join(BOOK, "config.antidote.json"), art: path.join(BOOK, "art.json"), entities: path.join(SB, "entities.json"), candidates: path.join(SB, "entities.candidates.json"), beats: path.join(SB, "beats.json"), report: path.join(BOOK, "told-report.json") };
const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)} %`);

/** art.json beat i → the scene it became. The planner keeps one scene per beat; a narration that does not match is refused. */
function toldByScene(config, art) {
  const out = {}, problems = [];
  for (const b of (art && art.beats) || []) {
    if (!b.told) continue;
    const s = (config.scenes || [])[b.i];
    if (!s) { problems.push(`beat ${b.i}: the config has no scene ${b.i}`); continue; }
    const a = norm(b.narration).slice(0, 40), c = norm(s._narration).slice(0, 40);
    if (a && c && !c.startsWith(a.slice(0, 24)) && !a.startsWith(c.slice(0, 24))) { problems.push(`beat ${b.i}: art.json narration "${a}…" is not scene ${s.id}'s "${c}…" — re-run storyboard prep / merge on this plan`); continue; }
    out[s.id] = b.told;
  }
  return { map: out, problems };
}

function load({ needArt = true } = {}) {
  const config = readJSON(F.config);
  if (!config) { console.error(`told: no ${path.relative(ROOT, F.config)} (plan the book first; told is an Antidote stage)`); process.exit(1); }
  const art = readJSON(F.art);
  if (needArt && !art) { console.error(`told: no ${path.relative(ROOT, F.art)} (storyboard merge --write first)`); process.exit(1); }
  return { config, art, entities: readJSON(F.entities) || {} };
}

if (cmd === "entities") {
  const raw = readJSON(F.beats);
  const beats = Array.isArray(raw) ? raw : raw && Array.isArray(raw.beats) ? raw.beats : ((readJSON(F.config) || {}).scenes || []).map((s, i) => ({ i, narration: s._narration }));
  if (!beats.length) { console.error("told entities: no storyboard/beats.json and no planned config — run storyboard prep first"); process.exit(1); }
  const ents = entitiesOf(beats.map((b) => ({ _narration: b.narration })), { min: 2 });
  const out = { note: "CANDIDATES from the narration (proper names said in 2+ beats, and years). Write storyboard/entities.json from them: keep what a viewer should SEE, fix ASR spellings, add what is missing, give each a kind.",
    kinds: Object.keys(KINDS), glyphs: GLYPHS,
    example: { microsoft: { label: "MICROSOFT", kind: "company", glyph: "monitor" }, mozart: { label: "MOZART", kind: "person", look: { age: "child", height: 0.72, headScale: 1.18, outfit: "coat", hairStyle: "curly" } }, piano: { label: "", kind: "object", paths: [{ d: "M40 150 H480 V200 H40 Z", fill: "#3A322B" }], w: 330 } },
    candidates: ents.map((e) => ({ name: e.name, kind: e.kind, saidInBeats: e.count, beats: e.scenes.slice(0, 12) })) };
  fs.mkdirSync(SB, { recursive: true });
  fs.writeFileSync(F.candidates, JSON.stringify(out, null, 2));
  console.log(`told entities: ${ents.length} candidates → ${path.relative(ROOT, F.candidates)}`);
  for (const e of ents.slice(0, 20)) console.log(`  ${String(e.count).padStart(3)}×  ${e.name}${e.kind === "year" ? "  (year)" : ""}`);
  console.log(fs.existsSync(F.entities) ? `entities.json exists (${Object.keys(readJSON(F.entities) || {}).length} named things)` : `→ write ${path.relative(ROOT, F.entities)} before the authors start, then re-run storyboard prep (rules.md lists them)`);
  process.exit(0);
}

if (cmd === "status") {
  const { config } = load({ needArt: false });
  const told = config.scenes.filter((s) => s.told).length, cov = mentionCoverage(config), before = mentionCoverage(revertTold(config).config);
  console.log(`${SLUG}: ${told} of ${config.scenes.length} scenes told · flow level ${config.meta.flow || 0}`);
  console.log(`what the narration names is on screen: ${pct(cov.share)} (${cov.shown} of ${cov.mentions} scenes)${told ? ` — without told ${pct(before.share)}` : ""}`);
  process.exit(0);
}

if (cmd === "revert") {
  const { config } = load({ needArt: false });
  const r = revertTold(config);
  if (args.write && r.reverted) fs.writeFileSync(F.config, JSON.stringify(r.config));
  console.log(`told revert: ${r.reverted} scene(s)${args.write ? " written" : " (add --write)"}`);
  process.exit(0);
}

if (cmd === "check" || cmd === "apply") {
  const { config, art, entities } = load();
  const { map, problems } = toldByScene(config, art);
  const n = Object.keys(map).length;
  if (!n && !problems.length) { console.log(`told ${cmd}: ${SLUG} has no told beat in art.json — nothing to do`); process.exit(0); }
  const entErrors = validateEntities(entities);
  // a re-apply starts from the picture the planner made: apply is idempotent on a config that is already told
  const base = revertTold(config).config;
  const r = applyTold(base, map, entities);
  const errors = [...problems.map((m) => ({ beat: null, message: m })), ...r.report.errors];
  const before = mentionCoverage(base), after = mentionCoverage(r.config);
  console.log(`told ${cmd}: ${SLUG} — ${n} told beat(s), ${Object.keys(entities).length} named thing(s)`);
  for (const e of errors) console.log(`  ✗ ${e.beat ? `${e.beat}: ` : ""}${e.message}`);
  for (const w of r.report.warnings) console.log(`  ⚠ ${w.beat}: ${w.message}`);
  if (!errors.length) console.log(`  ✓ ${r.report.applied} stage(s) compiled · what the narration names is on screen: ${pct(before.share)} → ${pct(after.share)} (${after.shown} of ${after.mentions} scenes)`);
  const report = { slug: SLUG, at: new Date().toISOString(), told: n, applied: errors.length ? 0 : r.report.applied, errors, warnings: r.report.warnings, coverage: { before: before.share, after: after.share, shown: after.shown, mentions: after.mentions }, missing: after.missing.slice(0, 60), entityErrors: entErrors };
  if (errors.length) {
    if (cmd === "apply" && args.write) fs.writeFileSync(F.report, JSON.stringify(report, null, 2));
    console.log(`TOLD NOT APPLIED — ${errors.length} error(s). Nothing was written. Fix the beats in storyboard/authored-N.json (the messages name them), merge --write, and run again.`);
    process.exit(1);
  }
  if (cmd === "apply" && args.write) {
    fs.writeFileSync(F.config, JSON.stringify(r.config));
    fs.writeFileSync(F.report, JSON.stringify(report, null, 2));
    console.log(`  written: ${path.relative(ROOT, F.config)} (meta.flow ${r.config.meta.flow}), ${path.relative(ROOT, F.report)}`);
  } else if (cmd === "apply") console.log("  (report only — add --write)");
  process.exit(0);
}
usage();
