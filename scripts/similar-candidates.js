#!/usr/bin/env node
/**
 * similar-candidates.js — from a blind finding (mute test or framecheck) to a list of beats that share
 * its staging, for REVIEW. Report-only: it never edits art.json/config and never says a candidate is
 * wrong. A shared icon + face + action is a hypothesis about the cause, not a verdict: the-art-of-saying-no
 * round 2 re-authored 130 "same class" beats and dead frames went 4 -> 9. Confirm candidates by looking at
 * them (framecheck.js --beats=...) before changing any.
 *
 *   node scripts/similar-candidates.js --slug=<slug> [--labels=run1,run3] [--include=WRONG,NONE]
 *        [--source=mute|framecheck|both] [--top=12] [--root=<tree with books/ and audit/>]
 *   -> audit/candidates/<slug>/<stamp>.json (+ a summary on stdout)
 *
 * Tiers, from the finding's scene (current config):
 *   A same staging      — same icons, same faces, same actions, same shot
 *   B same picture core — same icons (or both bare) and same faces, any action/shot
 *   C shares a part     — shares an icon, or the same face+action
 * Every candidate the blind tests already judged carries that verdict: a combo judged CORRECT elsewhere
 * is evidence AGAINST the hypothesis.
 */
const fs = require("fs");
const path = require("path");

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
const ROOT = path.resolve(args.root || process.env.CANDIDATES_ROOT || path.join(__dirname, ".."));
const SLUG = args.slug;
if (!SLUG) { console.error("Usage: node scripts/similar-candidates.js --slug=<slug> [--labels=a,b] [--include=WRONG,NONE] [--source=mute|framecheck|both] [--top=12] [--root=<dir>]"); process.exit(1); }
const INCLUDE = new Set(String(args.include || "WRONG").toUpperCase().split(",").map((x) => x.trim()));
const SOURCE = args.source || "both";
const TOP = parseInt(args.top || "12", 10);
const readJSON = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } };

const cfgPath = path.join(ROOT, "books", SLUG, "config.antidote.json");
const cfg = readJSON(cfgPath);
if (!cfg) { console.error(`❌ no Antidote config: ${cfgPath}`); process.exit(1); }
const scenes = cfg.scenes || [];
const sceneAt = (f) => scenes.find((s) => f >= s.fromFrame && f < s.fromFrame + s.durationFrames);
const readings = (readJSON(path.join(ROOT, "data", "icon-readings.json"), {}) || {}).icons || {};

// What a muted viewer can see in a scene, as comparable parts.
function signature(s) {
  const chars = (s.characters || []).filter((c) => !c.silhouette);
  const icons = new Set([s.concept, ...(s.props || []).map((p) => p.type), ...chars.map((c) => c.holds).flat()].filter((x) => typeof x === "string" && x));
  const faces = chars.map((c) => c.expression || "neutral").sort();
  const actions = chars.map((c) => c.action || "stand").sort();
  const pairs = chars.map((c) => `${c.expression || "neutral"}|${c.action || "stand"}`).sort();
  const textStyles = [...new Set((s.texts || []).map((t) => t.style || "plain"))].sort();
  const diagram = s.diagram ? s.diagram.type || "diagram" : null;
  const staged = !!s.relationshipStaging;
  return { shot: s.shot || null, icons: [...icons].sort(), faces, actions, pairs, textStyles, diagram, staged,
    cast: chars.map((c) => c.identity || c.rig).sort(), bare: chars.length > 0 && icons.size === 0 && !diagram && !staged };
}
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const shares = (a, b) => a.some((x) => b.includes(x));
function tier(f, c) {
  const iconsMatch = f.bare ? c.bare : (f.icons.length > 0 && same(f.icons, c.icons));
  if (f.diagram || f.staged) return null; // diagrams/staged relations are compared by content, not parts
  if (iconsMatch && same(f.faces, c.faces) && same(f.actions, c.actions) && f.shot === c.shot) return "A";
  if (iconsMatch && f.faces.length && same(f.faces, c.faces)) return "B";
  const faceAction = shares(f.pairs, c.pairs);
  if (shares(f.icons, c.icons) || faceAction) return "C";
  return null;
}
const describeSig = (g) => [g.shot, g.bare ? "bare (no icon)" : `icons ${g.icons.join("+") || "-"}`,
  `faces ${g.faces.join("+") || "-"}`, `actions ${g.actions.join("+") || "-"}`, g.textStyles.includes("strike") ? "strike text" : null,
  g.diagram ? `diagram ${g.diagram}` : null, g.staged ? "relationship staged" : null].filter(Boolean).join(" · ");

// Blind verdicts per scene id, from every run of every source.
function runsOf(kind) {
  const base = path.join(ROOT, "audit", kind, SLUG);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).filter((l) => fs.existsSync(path.join(base, l, "judge-result.json")) && fs.existsSync(path.join(base, l, "judge-key.json")))
    .map((label) => ({ kind, label, dir: path.join(base, label), mtime: fs.statSync(path.join(base, label, "judge-result.json")).mtimeMs }))
    .sort((a, b) => a.mtime - b.mtime);
}
const sources = SOURCE === "both" ? ["mute", "framecheck"] : [SOURCE];
const runs = sources.flatMap(runsOf);
if (!runs.length) { console.error(`❌ no judged runs under audit/{${sources.join(",")}}/${SLUG}/`); process.exit(1); }
const latestLabel = runs[runs.length - 1].label;
const verdicts = {}; // sceneId -> [{run, correctness, contribution}]
// Face readability over EVERY judged frame (not only failures): the configured expression of a one-face
// scene vs the face words in the blind description. Only meaningful for the latest run (config = judged).
const FACE_WORDS = { positive: /\b(smil\w*|grin\w*|happy|cheerful|joyful|beaming|laugh\w*|pleased)\b/i,
  negative: /\b(frown\w*|worried|anxious|sad|upset|angry|scowl\w*|afraid|scared|distress\w*|concerned|stern|glum|crying)\b/i,
  neutral: /\b(calm|neutral|blank|flat|expressionless|impassive|composed)\b/i };
const FACE_CLASS = { happy: "positive", smirk: "positive", sad: "negative", worried: "negative", angry: "negative", afraid: "negative", neutral: "neutral", blank: "neutral" };
const faceObs = [];
const findings = [];
const wantLabels = args.labels ? new Set(String(args.labels).split(",")) : null;
for (const r of runs) {
  const res = readJSON(path.join(r.dir, "judge-result.json"));
  const key = readJSON(path.join(r.dir, "judge-key.json"));
  const input = Object.fromEntries((readJSON(path.join(r.dir, "judge-input.json"), []) || []).map((x) => [x.id, x]));
  for (const it of res.items || []) {
    const k = key[it.id]; if (!k) continue;
    const v = it.V || (k.thisIsX ? it.X : it.Y); if (!v) continue;
    const s = sceneAt(k.frame); if (!s) continue;
    (verdicts[s.id] = verdicts[s.id] || []).push({ run: `${r.kind}/${r.label}`, correctness: v.correctness, contribution: v.contribution });
    const seesTxt = String((input[it.id] && (input[it.id].V || input[it.id].X) || {}).sees || "");
    const faces1 = [...new Set((s.characters || []).filter((c) => !c.silhouette).map((c) => c.expression || "neutral"))];
    if (r.label === latestLabel && faces1.length === 1 && FACE_CLASS[faces1[0]]) {
      const readAs = Object.keys(FACE_WORDS).filter((k) => FACE_WORDS[k].test(seesTxt));
      if (readAs.length === 1) faceObs.push({ run: r.label, scene: s.id, configured: faces1[0], intended: FACE_CLASS[faces1[0]], readAs: readAs[0], correctness: v.correctness });
    }
    const hit = INCLUDE.has(v.correctness) || (INCLUDE.has("NONE") && v.contribution === "NONE") || (INCLUDE.has("DEAD") && v.contribution === "NONE");
    if (!hit || (wantLabels && !wantLabels.has(r.label))) continue;
    const view = input[it.id] && (input[it.id].V || input[it.id].X) || {};
    findings.push({ run: `${r.kind}/${r.label}`, latestRun: r.label === latestLabel, scene: s.id, frame: k.frame,
      verdict: `${v.correctness}/${v.contribution}`, why: v.why, whyC: v.whyC, sees: view.sees || null,
      narration: s._narration || (input[it.id] && input[it.id].narration) || null });
  }
}

const sigs = Object.fromEntries(scenes.map((s) => [s.id, signature(s)]));
const out = [];
for (const f of findings) {
  const fs0 = sigs[f.scene];
  const iconNotes = fs0.icons.map((i) => readings[i] && readings[i].neverFor ? `${i}: measured "${readings[i].reads}"; never for ${readings[i].neverFor}` : null).filter(Boolean);
  const byTier = { A: [], B: [], C: [] };
  for (const s of scenes) {
    if (s.id === f.scene) continue;
    const t = tier(fs0, sigs[s.id]);
    if (t) byTier[t].push({ scene: s.id, t: `${(s.fromFrame / 30).toFixed(0)}s`, narration: String(s._narration || "").slice(0, 140),
      staging: describeSig(sigs[s.id]), judged: verdicts[s.id] || [] });
  }
  // counter-evidence: same staging judged CORRECT somewhere
  const judgedA = byTier.A.concat(byTier.B).flatMap((c) => c.judged);
  out.push({ ...f, staging: describeSig(fs0), stagingCurrentAsJudged: f.latestRun ? "yes (latest run)" : "unknown: earlier run, the scene may have been re-authored since",
    iconReadings: iconNotes, counts: { A: byTier.A.length, B: byTier.B.length, C: byTier.C.length },
    sameStagingJudged: { correct: judgedA.filter((v) => v.correctness === "CORRECT").length, wrong: judgedA.filter((v) => v.correctness === "WRONG").length, dead: judgedA.filter((v) => v.contribution === "NONE").length },
    candidates: { A: byTier.A.slice(0, TOP), B: byTier.B.slice(0, TOP), C: byTier.C.slice(0, Math.min(TOP, 6)) },
    reviewBeats: byTier.A.concat(byTier.B).filter((c) => !c.judged.length).slice(0, 6).map((c) => c.scene) });
}

function faceSummary() {
  const rows = {};
  for (const o of faceObs) { const k = o.configured + " -> read " + o.readAs; const r = rows[k] = rows[k] || { n: 0, wrong: 0, scenes: [] }; r.n++; if (o.correctness === "WRONG") r.wrong++; r.scenes.push(o.scene); }
  const misread = faceObs.filter((o) => o.intended !== o.readAs);
  return { run: latestLabel, oneFaceFramesWithFaceWords: faceObs.length, misread: misread.length, rows,
    note: "configured expression vs the face words a blind viewer used; one-face frames of the latest run only. A misread here is a renderer/face-readability lead, not proof." };
}
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = path.join(ROOT, "audit", "candidates", SLUG);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${stamp}.json`);
fs.writeFileSync(file, JSON.stringify({ slug: SLUG, created: new Date().toISOString(), reportOnly: true,
  note: "Candidates share staging with a blind finding. They are NOT confirmed wrong. Confirm with framecheck.js --beats before changing any; never change a whole class blind.",
  include: [...INCLUDE], runs: runs.map((r) => `${r.kind}/${r.label}`), faceReadability: faceSummary(), findings: out }, null, 2) + "\n");

console.log(`── similar candidates · ${SLUG} · ${out.length} finding(s) (${[...INCLUDE].join(",")}) from ${runs.length} judged run(s)`);
for (const f of out) {
  console.log(`\n${f.run} ${f.scene} ${f.verdict}${f.latestRun ? "" : "  (earlier run: staging may have changed since)"}`);
  console.log(`   narration: ${String(f.narration || "").slice(0, 150)}`);
  console.log(`   viewer saw: ${String(f.sees || "").slice(0, 150)}`);
  console.log(`   judge: ${f.why}`);
  console.log(`   staging: ${f.staging}`);
  f.iconReadings.forEach((n) => console.log(`   icon-readings: ${n}`));
  console.log(`   same staging: A ${f.counts.A} · B ${f.counts.B} · C ${f.counts.C}  | already judged in A+B: ${f.sameStagingJudged.correct} correct, ${f.sameStagingJudged.wrong} wrong, ${f.sameStagingJudged.dead} dead`);
  if (f.reviewBeats.length) console.log(`   look at first (unjudged A/B): ${f.reviewBeats.join(",")}`);
}
const fsum = faceSummary();
if (fsum.oneFaceFramesWithFaceWords) {
  console.log(`\nface readability (${fsum.run}, one-face frames the viewer described a face on): ${fsum.misread}/${fsum.oneFaceFramesWithFaceWords} read as a different mood`);
  Object.entries(fsum.rows).filter(([k]) => { const [c, r] = k.split(" -> read "); return FACE_CLASS[c] !== r; })
    .forEach(([k, r]) => console.log(`   ${k}: ${r.n} (WRONG ${r.wrong}) ${r.scenes.join(",")}`));
}
console.log(`\n✓ ${path.relative(ROOT, file)} — review candidates; confirm with: node scripts/framecheck.js prep --slug=${SLUG} --beats=<ids>`);
