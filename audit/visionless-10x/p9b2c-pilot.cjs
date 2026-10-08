#!/usr/bin/env node
/**
 * p9b2c-pilot.cjs — P9-B.2c: 20-BEAT ITW PILOT (contract vs semantic).
 *
 * The operator's P9-B.2c acceptance review left one honest gap: a composition
 * BOUND to the authored proposition (split seal + rendered split) still proves
 * the author's CHOICE reached the renderer — not that the two drawn areas
 * carry the two poles. This pilot measures exactly that, on 20 real ITW beats
 * (the gold two-pole corpus), rendered in the ANTIDOTE rig (vox has no
 * proposition levers — operator decision 2026-10-08):
 *
 *   Contract PASS  — stagedPoles() from the config alone (the gate's judge),
 *                    plus a per-pole EVIDENCE TYPE: entity / icon / strike /
 *                    plain-text / diagram-label / composition-bound (weak).
 *   Semantic PASS  — a muted viewer reads the still and names the two poles;
 *                    filled by the blind review (Part A of the report), never
 *                    by code.
 *
 * Half the beats stage in "copy" mode (poles as on-screen copy: rejected
 * struck, asserted boxed) — the full author staging. The other half stage in
 * "levers" mode (representation only, NO pole copy) — the residual-risk probe:
 * if Contract PASSes there but the blind viewer cannot name the poles, the
 * operator's predicted hole is proven with pixels, not argument.
 *
 * PNGs are scratch (gitignored); the authored decisions, the report and the
 * review form are committed.
 *
 * Usage:
 *   node audit/visionless-10x/p9b2c-pilot.cjs --build          # scenes + contract + props + report skeleton
 *   node audit/visionless-10x/p9b2c-pilot.cjs --render         # one bundle, 20 stills (after --build)
 *   node audit/visionless-10x/p9b2c-pilot.cjs                  # both
 */
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "p9b2c-pilot");
const PROPS_DIR = path.join(OUT, "props");
const STILL_DIR = path.join(OUT, "stills");
const P = require(path.join(ROOT, "scripts", "lib", "proposition.js"));
const screenText = require(path.join(ROOT, "scripts", "lib", "screen-text.js"));

// The renderer's own enums — the same sets plan-antidote hands the stager.
const EXPRESSIONS = new Set(["neutral", "happy", "sad", "surprised", "worried", "angry", "smirk", "blank", "afraid"]);
const ACTIONS = new Set(["idle", "talk", "point", "celebrate", "slump", "think", "walk", "sit", "hold", "reach", "lying", "collapsed", "falling", "fighting", "struggling", "grabbing"]);
const HAND_PROPS = new Set(["book", "phone", "key", "notes", "letter", "coin", "cup", "lightbulb", "mask", "photo", "mirror", "flower", "compass", "briefcase", "shield", "trophy", "hourglass", "sword", "target", "magnifier", "wallet", "gift", "zap", "laptop", "creditCard", "smartphone"]);
const { SCENE_ICONS } = require(path.join(ROOT, "scripts", "lib", "antidote-director.js"));
const CTX = { expressionEnum: EXPRESSIONS, actionEnum: ACTIONS, holdsEnum: HAND_PROPS, sceneIcons: SCENE_ICONS };

const AUTHORED = JSON.parse(fs.readFileSync(path.join(__dirname, "p9b2c-pilot-authored.json"), "utf8"));
const GOLD = JSON.parse(fs.readFileSync(path.join(__dirname, "p9b-goldset.json"), "utf8"));
const BRIEFS = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "into-the-wild", "beat-briefs.json"), "utf8"));
const BOOK = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "the-second-mountain", "config.antidote.json"), "utf8"));

const byGold = Object.fromEntries(GOLD.sample.map((b) => [b.i, b]));
const DUR = 240;
const SPLIT_COLORS = ["#7FA8C9", "#E8B55A"];

/** tokens minus filler — mirrors the lib's textSays content filter closely enough for EVIDENCE labeling. */
const FILLER = new Set(["the", "a", "an", "of", "it", "is", "was", "in", "on", "to", "and", "or", "for", "with", "his", "her", "their", "its", "that", "this", "not"]);
const content = (t) => screenText.tokens(String(t || "")).filter((w) => !FILLER.has(w) && w.length > 1);
const says = (poleText, textTokens) => { const p = content(poleText); return p.length > 0 && p.every((w) => textTokens.includes(w)); };

/** which anchor path carried this pole — the honest evidence label. */
function evidenceOf(pole, scene, prop) {
  const identities = new Set((scene.characters || []).map((c) => c && c.identity).filter(Boolean));
  const struck = (scene.texts || []).filter((t) => t && t.style === "strike").map((t) => screenText.tokens(t.text));
  const plain = (scene.texts || []).filter((t) => t && t.style !== "strike").map((t) => screenText.tokens(t.text));
  const icon = prop.visual && prop.visual.icon;
  if (pole.entity && identities.has(pole.entity)) return "entity";
  if (icon && (pole.text === icon || pole.entity === icon) && (scene.concept === icon || (scene.props || []).some((p) => p && p.type === icon) || (scene.characters || []).some((c) => c && c.holds === icon))) return "icon";
  if (pole.text && struck.some((tk) => says(pole.text, tk))) return "strike";
  if (pole.text && plain.some((tk) => says(pole.text, tk))) return "plain-text";
  if (scene.diagram && Array.isArray(scene.diagram.labels) && pole.text && scene.diagram.labels.some((l) => says(pole.text, screenText.tokens(l)))) return "diagram-label";
  const rep = prop.visual && prop.visual.representation;
  if ((rep === "split" || rep === "beforeAfter" || rep === "twoShot") && scene.shot === rep) return "composition-bound";
  if (rep === "flow" && scene.diagram && scene.diagram.type === "flow" && scene.diagram.authored) return "composition-bound";
  return "none";
}

function buildScene(entry, idx) {
  const gold = byGold[entry.i];
  if (!gold) throw new Error(`beat #${entry.i} not in the frozen gold sample`);
  const brief = BRIEFS.briefs[gold.i] || {};
  const sid = `pilot-${String(entry.i).padStart(3, "0")}`;
  const scene = {
    id: sid, type: "illustration", fromFrame: idx * DUR, durationFrames: DUR,
    shot: "medium", characters: [], props: [], texts: [],
  };
  // cast skeleton (the author's casting decision; the stager applies faces/actions/holds)
  if (entry.representation === "twoShot") {
    for (const pc of entry.perCast) {
      scene.characters.push({ id: `${sid}-c${scene.characters.length}`, rig: "everyman", role: "everyman", identity: pc.entity, enter: "fade", action: "idle", expression: "neutral" });
    }
  } else {
    scene.characters.push({ id: `${sid}-c0`, rig: "everyman", role: "everyman", identity: "chris", enter: "fade", action: "idle", expression: "neutral" });
  }
  // copy mode: the poles go on screen as copy — rejected struck, asserted boxed
  if (entry.mode === "copy") {
    let y = 860;
    for (const pole of entry.poles) {
      scene.texts.push({ text: pole.text, style: pole.status === "rejected" ? "strike" : "box", at: 0, x: 960, y, size: 64, enter: "pop", color: "#FFFFFF", boxColor: "#E23B57" });
      y += 110;
    }
  }
  // author seal via the real contract path, then the real stager
  const prop = P.normalizeProposition({
    relation: entry.relation, poles: entry.poles, evidence: `p9b2c pilot #${entry.i} (${entry.decision})`, src: "author",
    visual: { representation: entry.representation, icon: entry.icon || null, perCast: entry.perCast || [] },
  }).prop;
  const seal = P.sealFor(prop);
  const stage = P.stageProposition(seal, scene, CTX);
  if (entry.representation === "split") scene.bg = { ...(scene.bg || {}), split: SPLIT_COLORS };
  const propForGate = { relation: seal.relation, poles: seal.poles, evidence: null, visual: { representation: seal.representation, icon: seal.icon, perCast: seal.perCast }, src: "author" };
  const verdict = P.stagedPoles(scene, propForGate);
  // grounding: how much of each pole's content words the beat's own narration carries
  const narr = content(gold.narration);
  const briefEnts = new Set((brief.entities || []).map((e) => String(e)));
  const grounding = entry.poles.map((pole) => {
    if (pole.entity) return { pole: pole.entity, overlap: briefEnts.has(pole.entity) ? 1 : 0, via: "brief-entity" };
    const p = content(pole.text);
    const hit = p.filter((w) => narr.includes(w)).length;
    return { pole: pole.text, overlap: p.length ? +(hit / p.length).toFixed(2) : 0, via: "narration" };
  });
  const evidence = verdict.verdicts.map((v) => {
    const pole = entry.poles.find((p) => (p.text || p.entity) === v.pole) || {};
    return { pole: v.pole, state: v.state, type: evidenceOf(pole, scene, { visual: { representation: seal.representation, icon: seal.icon } }) };
  });
  return {
    i: entry.i, id: sid, decision: entry.decision, mode: entry.mode, relation: entry.relation,
    poles: entry.poles, note: entry.note || null,
    gold: { cls: "two-pole", narration: gold.narration },
    stage: { staged: stage.staged, skipped: stage.skipped },
    contract: { twoSided: verdict.twoSided, unstaged: verdict.unstaged, poleViolation: verdict.poleViolation, verdicts: verdict.verdicts, evidence },
    grounding,
    frame: scene.fromFrame + Math.round(DUR / 2),
    scene,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const DO_BUILD = argv.includes("--build") || argv.length === 0;
  const DO_RENDER = argv.includes("--render") || argv.length === 0;
  fs.mkdirSync(PROPS_DIR, { recursive: true });
  fs.mkdirSync(STILL_DIR, { recursive: true });

  if (!DO_BUILD && !DO_RENDER) { console.error("usage: --build | --render"); process.exit(1); }

  let entries = AUTHORED.beats;
  const reportPath = path.join(OUT, "p9b2c-pilot-report.json");
  let report;
  if (DO_BUILD) {
    const results = entries.map((e, idx) => buildScene(e, idx));
    // one pilot config: the book shell + the 20 sequential pilot scenes
    const config = JSON.parse(JSON.stringify(BOOK));
    config.scenes = results.map((r) => r.scene);
    if (Array.isArray(config.chapters)) config.chapters = [];
    fs.writeFileSync(path.join(PROPS_DIR, "pilot-config.json"), JSON.stringify({ config }));
    const beats = results.map(({ scene, ...rest }) => rest);
    report = { what: "P9-B.2c 20-beat ITW pilot — contract vs semantic", beats, summary: summarize(results) };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`[p9b2c-pilot] built ${results.length} scenes; contract twoSided ${results.filter((r) => r.contract.twoSided).length}/${results.length} -> ${path.relative(ROOT, reportPath)}`);
  } else {
    report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  }

  if (DO_RENDER) {
    await renderAll(report, reportPath);
  }
}

function summarize(results) {
  const n = results.length;
  const twoSided = results.filter((r) => r.contract.twoSided).length;
  const byMode = {};
  for (const m of ["copy", "levers"]) {
    const rs = results.filter((r) => r.mode === m);
    byMode[m] = { n: rs.length, contractTwoSided: rs.filter((r) => r.contract.twoSided).length, compositionBoundOnly: rs.filter((r) => r.contract.evidence.every((e) => e.type === "composition-bound")).length, semantic: "PENDING (blind review)" };
  }
  return { beats: n, contractTwoSided: twoSided, byMode, semantic: "PENDING — fill Part A of p9b2c-pilot-report.md after a MUTED viewing of stills/" };
}

async function renderAll(report, reportPath) {
  const serveUrl = path.join(OUT, "serve");
  const runNpx = (args) => new Promise((resolve) => {
    execFile("npx", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", timeout: 15 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => resolve({ err, log: `${stdout || ""}\n${stderr || ""}`.slice(-4000) }));
  });
  console.log("[p9b2c-pilot] bundling via npx remotion bundle (one public/ copy) ...");
  fs.rmSync(serveUrl, { recursive: true, force: true });
  const res = await runNpx(["remotion", "bundle", path.join(ROOT, "src", "index.ts"), "--out-dir", serveUrl, "--public-dir", path.join(ROOT, "public")]);
  if (!res || res.err) {
    console.error("[p9b2c-pilot] bundle FAILED");
    if (res && res.log) fs.writeFileSync(path.join(OUT, "bundle.err.log"), res.log);
    process.exit(1);
  }
  console.log(`[p9b2c-pilot] bundled in one serve dir -> ${path.relative(ROOT, serveUrl)}`);

  const { selectComposition, renderStill } = require("@remotion/renderer");
  // P9-B.2a protocol: inputProps are honored ONLY at selectComposition.
  const inputProps = JSON.parse(fs.readFileSync(path.join(PROPS_DIR, "pilot-config.json"), "utf8"));
  const composition = await selectComposition({ serveUrl, id: "Antidote-the-second-mountain", inputProps, timeoutInMilliseconds: 240000 });
  for (const b of report.beats) {
    const out = path.join(STILL_DIR, `${b.id}.png`);
    const t = Date.now();
    try {
      await renderStill({ composition, serveUrl, output: out, frame: b.frame, imageFormat: "png", timeoutInMilliseconds: 180000 });
      b.render = { status: "rendered", png: path.relative(OUT, out), ms: Date.now() - t };
      console.log(`[p9b2c-pilot] ${b.id}: still @f${b.frame} (${Math.round((Date.now() - t) / 1000)}s)`);
    } catch (err) {
      b.render = { status: "failed", error: String(err && err.message || err).slice(-300) };
      console.error(`[p9b2c-pilot] ${b.id}: FAILED ${b.render.error}`);
    }
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  writeReviewMd(report);
  console.log(`[p9b2c-pilot] report + review form -> ${path.relative(OUT, reportPath)} / p9b2c-pilot-report.md`);
}

/** The blind review form: Part A (what the muted viewer saw, per still) is filled FIRST; the key stays in the JSON. */
function writeReviewMd(report) {
  const lines = [];
  lines.push(`# P9-B.2c — 20-beat ITW pilot: blind semantic review (Part A)`);
  lines.push("");
  lines.push(`**Fill this BEFORE opening the key.** Watch \`stills/pilot-NNN.png\` muted, in order,`);
  lines.push(`then answer per beat: (1) the TWO ideas this frame states, in your own words;`);
  lines.push(`(2) does the frame oppose/balance them (contrast), or lead one to the other (cause→effect)?`);
  lines.push(`**Do NOT open \`p9b2c-pilot-report.json\` (the key) until Part A is complete.**`);
  lines.push("");
  lines.push(`| still | two ideas I see | relation I read |`);
  lines.push(`|---|---|---|`);
  for (const b of report.beats) lines.push(`| ![${b.id}](stills/${b.id}.png) | | |`);
  lines.push("");
  lines.push(`Semantic PASS = both authored poles identifiable AND the relation read correctly (checked against the key after Part A).`);
  fs.writeFileSync(path.join(OUT, "p9b2c-pilot-report.md"), lines.join("\n"));
}

main().catch((e) => { console.error(e && e.stack || e); process.exit(1); });
