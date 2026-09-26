#!/usr/bin/env node
/**
 * storyboard.js — the authored-storyboard workflow as commands, so any agent can
 * run it the same way (Faz 1/2; proven on We Were Liars: mute test 0/30 wrong,
 * image adds 70%). Full procedure: STORYBOARD_RUNBOOK.md.
 *
 *   node scripts/storyboard.js prep  --slug=<slug> [--chunk=40]
 *       -> books/<slug>/storyboard/{beats.json, rules.md, chunk-K.json, PROMPTS.md}
 *   (parallel author agents write books/<slug>/storyboard/authored-K.json)
 *   node scripts/storyboard.js merge --slug=<slug> [--write]
 *       -> validates; with --write: Antidote -> books/<slug>/art.json,
 *                                   Vox      -> books/<slug>/designs.json
 *
 * Both planners pick those files up automatically (plan-antidote: art.json,
 * plan-vox: designs.json), so the next make-book run is authored.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(3).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
const CMD = process.argv[2];
const SLUG = args.slug;
if (!["prep", "merge"].includes(CMD) || !SLUG) {
  console.error("Usage: node scripts/storyboard.js prep|merge --slug=<slug> [--chunk=40] [--write]");
  process.exit(1);
}
const BOOK = path.join(ROOT, "books", SLUG);
const SB = path.join(BOOK, "storyboard");
const readJSON = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } };
const book = readJSON(path.join(BOOK, "book.json"));
if (!book) { console.error(`❌ books/${SLUG}/book.json missing`); process.exit(1); }
// The engine is Step 0's decision (make-prompt → book.json). No default: an
// undecided book must not be authored for a guessed engine.
if (book.engine !== "vox" && book.engine !== "antidote") {
  console.error(`❌ books/${SLUG}/book.json has no engine ("${book.engine || ""}"). Decide it at Step 0 (make-prompt --engine=vox|antidote).`);
  process.exit(1);
}
const ENGINE = book.engine;
const bible = readJSON(path.join(BOOK, "story-bible.json"), {});
const vp = bible.visualProvenance || {};
const FICTION = !/non-?fiction|self.?help|business|finance|psycholog|productiv|science|history|philosoph|memoir|biograph/i.test(String(book.genre || ""));

// books/<slug>/motifs.json — per-book icons drawn as data (customSvg), read by lib/antidote-director.js
function ownMotifs() {
  const m = readJSON(path.join(BOOK, "motifs.json"), {}) || {};
  return m.motifs || m;
}
// signature objects: the book's own things no shared icon depicts (the Mechanical Hound)
const signatureObjects = () => (Array.isArray(bible.signatureObjects) ? bible.signatureObjects : []);

// Every person the storyboard can stage is drawn from story-bible cast[k].variant.
// Without one, plan-antidote falls back to a role template tinted with the book
// palette: in F451 Montag, Clarisse and Beatty all wore the same rust colour and
// Mildred's "bleached blonde" became white hair — the blind viewer saw "an elderly
// person" and "identical men". The look text never reaches the rig; the variant does.
function checkCastVariants() {
  const stop = [], warn = [];
  const cast = Object.entries(bible.cast || {}).filter(([k]) => k !== "narrator");
  const need = ["gender", "age", "outfit", "suit", "hair", "hairStyle"];
  for (const [k, c] of cast) {
    const v = c.variant || {};
    const miss = need.filter((f) => v[f] == null || v[f] === "");
    if (miss.length) stop.push(`cast "${k}" has no variant ${miss.join("/")} — its look ("${String(c.look || "").slice(0, 60)}") never reaches the drawing`);
    const hex = String(v.hair || "").match(/^#?([0-9a-f]{6})$/i);
    if (hex && v.age !== "old") {
      const n = parseInt(hex[1], 16), light = (((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255)) / 765;
      if (light > 0.82) warn.push(`cast "${k}": hair ${v.hair} is near-white on a non-old character — reads as elderly (use a saturated blonde like #E3B34A)`);
    }
  }
  const sig = (v) => [v.gender, v.outfit, String(v.suit || "").toLowerCase(), v.age].join("|");
  for (let a = 0; a < cast.length; a++) for (let b = a + 1; b < cast.length; b++) {
    const va = cast[a][1].variant, vb = cast[b][1].variant;
    if (va && vb && va.suit && sig(va) === sig(vb)) stop.push(`cast "${cast[a][0]}" and "${cast[b][0]}" are drawn alike (same gender, age, outfit and colour) — viewers read "identical people"`);
  }
  return { stop, warn };
}

// ── vocabulary this book may use ────────────────────────────────────────────
function vocabulary() {
  if (ENGINE === "vox") return {};
  const { SCENE_ICONS } = require("./lib/antidote-director.js");
  const { shotName, setName, expression, charAction, handProp } = require("../src/engines/antidote/schema.ts");
  const shared = (readJSON(path.join(ROOT, "data/shared-generic-motifs.json"), {}).motifs) || [];
  const allowed = new Set([...(vp.allowedMotifs || []), ...(vp.allowedProps || []), ...shared]);
  // the book's OWN icons (books/<slug>/motifs.json — its signature objects) are vocabulary too
  const ownIcons = Object.keys(ownMotifs());
  const icons = [...SCENE_ICONS.filter((c) => allowed.has(c)), ...ownIcons];
  const sets = vp.allowedLocations && vp.allowedLocations.length
    ? setName.options.filter((s) => vp.allowedLocations.includes(s)) : setName.options.filter((s) => s !== "none");
  const MODERN = new Set(["laptop", "creditCard", "smartphone", "zap", "sword"]);
  const holds = handProp.options.filter((h) => !MODERN.has(h) || /tech|business|startup/i.test(String(book.genre)));
  return {
    icons, ownIcons, sets,
    shots: shotName.options.filter((s) => s !== "chapterCard"),
    expressions: expression.options, actions: charAction.options, holds,
    cast: Object.entries(bible.cast || {}).map(([k, c]) => ({ key: k, name: c.name, role: c.role, look: c.look })),
  };
}

// A book whose profile marks harm to a minor as central (Lolita) gets a hard rule at
// the top of every author sheet: the child is never depicted in that context.
const MINOR_RULE = book.engineProfile && book.engineProfile.minorHarm ? `## ⛔ Safety rule — this book centres on harm to a minor
- NEVER depict the child in the abuse context: no child figure next to the abuser, no bed/motel/
  intimacy staging, no romance icons (heart, gift, flower), nothing that sexualises or romanticises.
- Show the NARRATOR's manipulation instead: the unreliable voice (strike his euphemisms), the
  adult world (roads, motels as empty places), consequences, and the critical analysis itself.
- When in doubt: concept null + a callout that names the harm plainly ("a child, not a romance").
` : "";
// ── rules sheet (the one authoring round) ───────────────────────────────────
function iconReadingLines(v) {
  const R = (readJSON(path.join(ROOT, "data/icon-readings.json"), {}) || {}).icons || {};
  return v.icons.filter((k) => R[k]).map((k) => `- ${k}: reads as ${R[k].reads}${R[k].neverFor ? `. NEVER for: ${R[k].neverFor}` : ""}`).join("\n");
}
function ownIconSection(v) {
  const own = ownMotifs();
  if (!Object.keys(own).length) return "";
  return `
## This book's own icons (drawn for it — use them whenever the beat is ABOUT that thing)
${Object.entries(own).map(([k, m]) => `- ${k}: ${m.title || k}${m.reads ? ` — ${m.reads}` : ""}`).join("\n")}
`;
}

function rulesAntidote(v) {
  const castLines = v.cast.map((c) => `- \`${c.key}\` — ${c.name}${c.role ? ` (${c.role})` : ""}: ${c.look || ""}`).join("\n");
  return `# Storyboard authoring — ${book.title} (${book.author}) · Antidote engine

You art-direct an animated summary. The audio is a two-host analysis. For EVERY beat decide what a
viewer with the SOUND OFF must see to understand what is being said. A wrong picture is worse than
none. Everything you write is ENGLISH. Book context: \`books/${SLUG}/story-bible.json\`.
Reference (approved, We Were Liars): \`books/we-were-liars/art.json\` — read 10 beats of it first.

## Output — one object per beat in your chunk, same order, same \`i\`
\`\`\`json
{ "i": 12,
  "concept": "<icon>" | null,
  "diagram": null | { "type": "flow|sorter|spectrum|matchWave", "labels": ["..",".."], "values": [..]? },
  "callout": { "text": "2-5 words", "style": "reveal|highlight|strike|box|stack" } | null,
  "set": "<set>",                    // optional
  "shotOverride": "<shot>",          // optional, rarely
  "cast": ["<castKey>", "<castKey>"],// who is on screen, most important first
  "expression": "<expression>",      // first cast member's face
  "action": "<action>",              // first cast member's body
  "holds": "<object>",               // optional object in their hand
  "storyboard": { "claim": "...", "concreteVisual": "...", "onScreenText": "...",
                  "relationToPrevious": "...", "addedInformation": "... (write 'weak: ...' if honest)" } }
\`\`\`

## Vocabulary (nothing else renders)
- icons: ${v.icons.join(", ")}
- sets: ${v.sets.join(", ")}
- shots: ${v.shots.join(", ")}
- expressions: ${v.expressions.join(", ")}
- actions: ${v.actions.join(", ")}
- holds: ${v.holds.join(", ")}
- cast (story-bible keys):
${castLines || "- (no cast in the story bible — add one before authoring)"}

${MINOR_RULE}## The icon test (most important)
Pick a \`concept\` only if a muted viewer seeing that icon WITHOUT the callout would guess the right
meaning. The icon's LITERAL reading must be the beat's claim — a metaphor the viewer has to decode
is read literally (Fahrenheit 451: chains for "numbness" read as "links", a medical cross for an
execution read as "healthcare", a coin for "the price we pay" read as "debt"). NEVER because a word
matches ("treating this TEXT as" is not a phone; "romance is the wrong reading" is not a heart).
What viewers actually read (measured in mute tests — data/icon-readings.json):
${iconReadingLines(v)}
If nothing reads literally: \`concept: null\` and stage the PEOPLE doing the idea (face + body +
object) with a strong callout. A wrong icon is worse than none.
No single shared icon on more than 5% of the beats: an icon used for everything means nothing.
${ownIconSection(v)}
## Negation, irony, fakery
When the narration says NOT / never / fake / scripted / pretend / hollow X, never stage X plainly
(F451: a warm embrace for "fake scripted validation" read as genuine warmth; a thoughtful face for
"he is NOT thinking about the ideas" read as valuing them). Stage the contrast instead: the empty
face beside the smiling screen, the forced smile (say so), the turned back.
Two people side by side must look clearly different (build, age, costume); two men in the same
uniform read as "identical men" — stage one of them.

## Staging the people (the picture must carry meaning, not only the text)
${FICTION
    ? "Put on screen the characters the sentence is ABOUT (not the host). Give them the face and body of the moment: grief -> sad + slump, fear -> worried, revelation -> surprised, a forced polite smile over pain -> happy (say so), accusing -> point, grasping -> reach, arriving/leaving -> walk. Give them the object they handle (letter, photo, key, cup)."
    : "This is non-fiction: the 'cast' is usually `everyman` (the reader living the idea) or the author/host. Stage the idea as a person doing it: exhausted -> slump + worried, focused -> think, spending -> holds wallet/coin, time -> holds hourglass, choosing -> point. Use `narrator` only for pure show commentary. Named people (researchers, the author, case-study subjects) go on screen when the story bible has them."}
Never happy over death or tragedy unless it is a fake smile.

## Callouts
2-5 words, the narrator's own concrete words from THIS beat; correct ASR spellings of names.
Every callout of 4+ words needs a function word (the/of/to/her/...), no keyword soup, max 7 words /
48 chars. \`strike\` = the narrator REJECTS the phrase; never for emphasis. No invented labels.
Every beat needs a callout OR a diagram OR an icon; pure banter ("Right.") may carry only staging.

## Diagrams (about 1 per 25 beats, only on structural beats)
flow = cause -> effect (2-3 labels, 1-2 words each, from the narration); sorter = 2-4 buckets;
spectrum = [left, right] + values[0..1]; matchWave = two rhythms syncing. A diagram beat has
concept null and callout null. Avoid bare template words as labels (DENIAL, CHANGE, GROWTH) — use
the narrator's phrase ("Family denial").

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every \`i\`.
`;
}

function rulesVox() {
  const cast = Object.entries(bible.cast || {}).map(([k, c]) => `- ${c.name}: ${c.look || ""}`).join("\n");
  const era = (bible.world && (bible.world.era || bible.world.approxYear)) || "see story bible";
  return `# Storyboard authoring — ${book.title} (${book.author}) · Vox engine

Vox = photoreal Flux stills + kinetic type. For EVERY beat decide what a viewer with the SOUND OFF
must see. Each image costs money and a wrong one is worse than none. ENGLISH only.
Book context: \`books/${SLUG}/story-bible.json\` — world/era: ${era}.

## Output — one object per beat in your chunk, same order, same \`i\`
\`\`\`json
{ "i": 12,
  "design": {
    "type": "statement|imagefocus|list|quote|stat|compare|checklist|polaroid|chart|timeline|question|punchline|place|document|map|flow",
    "kicker": "2-4 word ALL-CAPS tag or ''",
    "emphasis": ["1-3 SHORT ALL-CAPS specific words from THIS beat: names, places, numbers"],
    "items": [],                                     // list/checklist only: 2-4 SHORT ALL-CAPS items
    "image": null | { "subject": "a described photograph", "style": "cutout|card" },
    "compare": null | { "left": {"label","subject"}, "right": {"label","subject"} },
    "storyboard": { "claim": "...", "concreteVisual": "...", "onScreenText": "...",
                    "relationToPrevious": "...", "addedInformation": "..." } } }
\`\`\`

${MINOR_RULE}## The image test (most important)
\`image.subject\` is a DESCRIBED PHOTOGRAPH — who, doing what, where, when — never a keyword list
("heart, manuscript, 1985" is forbidden). A muted viewer must guess the sentence from it. Reuse a
character's look VERBATIM so the same person recurs:
${cast || "- (no cast in the story bible)"}
Keep the era right (no anachronisms). Flux drops gore, children in danger and war violence
(CONTENT_FILTERED) — soften to aftermath, symbol or place. No text inside images.
## Coverage — a muted viewer needs a picture most of the time
Give 70-85% of beats an image. The mute-test bar (image ADDS on >= 60% of ALL frames) cannot
be met otherwise: All the Light had images on 44% of its screen time and failed on text-only frames
while its images scored 14/15. An idea with no photograph still has a place, a person or an object
that carries it (the reader at a desk, the ruined street, the radio). \`statement\` with image null
only for pure banter or when every picture would mislead.
ONLY \`imagefocus\`, \`polaroid\`, \`compare\` and \`duo\` put a picture on screen. An image on any other
type (list, question, place, quote, stat, punchline, timeline…) is never shown — the planner turns such
a beat into imagefocus. Keep 15-30% of beats as those text archetypes WITHOUT an image where the shape
is the point (a real question, a real list, a real quotation): 40 minutes of one layout loses viewers.

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every \`i\`.
`;
}

function prep() {
  fs.mkdirSync(SB, { recursive: true });
  const vtt = path.join(ROOT, "public/captions", `${SLUG}.vtt`);
  if (!fs.existsSync(vtt)) { console.error(`❌ public/captions/${SLUG}.vtt missing — the storyboard is authored against the real narration`); process.exit(1); }
  // Engine cross-check BEFORE any authoring: make-book warns when the narration
  // contradicts book.json's engine, but only after the storyboard is written for
  // it. A strong contradiction stops here until the operator confirms.
  const { analyzeEngineFromVtt } = require("./lib/vtt");
  const era = bible.world && Number.isFinite(bible.world.approxYear) ? bible.world.approxYear : undefined;
  const sig = analyzeEngineFromVtt(fs.readFileSync(vtt, "utf8"), { era });
  console.log(`engine: ${ENGINE.toUpperCase()} (book.json)${book.engineRationale ? ` — ${book.engineRationale}` : ""}`);
  console.log(`  narration fit: ${sig.pick.toUpperCase()} (${sig.confidence}; vox ${sig.voxScore} vs antidote ${sig.antidoteScore})`);
  sig.reasons.forEach((r) => console.log(`   · ${r}`));
  sig.risks.forEach((r) => console.log(`   ⚠ ${r}`));
  // the check travels with the book, so a reviewer (and the outcomes ledger) can see why
  book.engineCheck = { at: new Date().toISOString().slice(0, 10), fit: sig.pick, confidence: sig.confidence, voxScore: sig.voxScore, antidoteScore: sig.antidoteScore, signals: sig.signals, reasons: sig.reasons, risks: sig.risks, confirmed: !!args["confirm-engine"] };
  fs.writeFileSync(path.join(BOOK, "book.json"), JSON.stringify(book, null, 2) + "\n");
  // This is a CONFIRMATION of the Step 0 decision, not a second decision: the
  // NotebookLM prompt was written for ${ENGINE}, so the audio already follows it.
  // Switching now = a new prompt, a new recording and a new VTT. Default: keep.
  if (sig.confidence === "strong" && sig.pick !== ENGINE && !args["confirm-engine"]) {
    console.error(`❌ The narration points strongly to ${sig.pick.toUpperCase()}; the book was set up (and recorded) for ${ENGINE.toUpperCase()} (${book.engineDecidedBy || "step 0"}).`);
    console.error(`   Ask the operator. Usually KEEP it (the audio was written for ${ENGINE}): re-run with --confirm-engine.`);
    console.error(`   Switching to ${sig.pick} means: make-prompt --engine=${sig.pick} → new NotebookLM audio → new VTT → start again.`);
    process.exit(1);
  }
  if (ENGINE === "vox" && sig.risks.length && !args["confirm-engine"]) {
    console.error(`❌ Vox + violence/death risk: Flux will refuse many of the key images. Ask the operator: keep Vox (--confirm-engine) or switch to Antidote.`);
    process.exit(1);
  }
  if (!bible.cast || !Object.keys(bible.cast).length) {
    console.warn(`⚠ story bible has no cast — author it first (plan-bible --emit -> Claude -> --bible). WWL shipped a cast without its three mothers.`);
  }
  if (ENGINE === "antidote") {
    const own = ownMotifs();
    const missing = signatureObjects().filter((o) => !own[o.key]);
    if (!signatureObjects().length) {
      console.warn(`⚠ story bible has no signatureObjects — list the book's own things no shared icon depicts (runbook §1b). F451 never drew its Mechanical Hound.`);
    }
    if (missing.length && !args["skip-own-icons"]) {
      console.error(`❌ ${missing.length} signature object(s) have no icon in books/${SLUG}/motifs.json: ${missing.map((o) => o.key).join(", ")}`);
      console.error(`   Draw each as data (STORYBOARD_RUNBOOK.md §1b), or pass --skip-own-icons="<why>" to author without them.`);
      process.exit(1);
    }
  }
  if (ENGINE === "antidote") {
    const castIssues = checkCastVariants();
    castIssues.warn.forEach((w) => console.warn(`⚠ ${w}`));
    if (castIssues.stop.length && !args["skip-cast-check"]) {
      castIssues.stop.forEach((e) => console.error(`❌ ${e}`));
      console.error(`   Give each cast member a \`variant\` in story-bible.json from its look (STORYBOARD_RUNBOOK.md §1c).`);
      process.exit(1);
    }
  }
  const beatsFile = path.join(SB, "beats.json");
  const common = [`--vtt=public/captions/${SLUG}.vtt`, `--slug=${SLUG}`, `--title=${book.title}`, `--author=${book.author}`, `--genre=${book.genre || "nonfiction"}`, `--emit-beats=${beatsFile}`];
  const script = ENGINE === "vox" ? "scripts/plan-vox.js" : "scripts/plan-antidote.js";
  const extra = ENGINE === "vox" ? ["--no-llm", ...(fs.existsSync(path.join(ROOT, "public/audio", `${SLUG}.m4a`)) ? [`--audio=public/audio/${SLUG}.m4a`] : [])] : [];
  execFileSync(process.execPath, [script, ...common, ...extra], { cwd: ROOT, stdio: "pipe" });
  const emitted = readJSON(beatsFile);
  const beats = emitted.beats.map((b) => ({ i: b.i, narration: b.narration || b.text }));
  const v = vocabulary();
  fs.writeFileSync(path.join(SB, "vocab.json"), JSON.stringify(v, null, 2));
  fs.writeFileSync(path.join(SB, "rules.md"), ENGINE === "vox" ? rulesVox() : rulesAntidote(v));
  const size = parseInt(args.chunk || "40", 10);
  const chunks = [];
  for (let s = 0; s < beats.length; s += size) chunks.push([s, Math.min(beats.length, s + size) - 1]);
  chunks.forEach(([a, z], k) => {
    fs.writeFileSync(path.join(SB, `chunk-${k + 1}.json`), JSON.stringify({
      chunk: k + 1, range: [a, z],
      contextBefore: beats.slice(Math.max(0, a - 3), a),
      beats: beats.slice(a, z + 1),
      contextAfter: beats.slice(z + 1, z + 3),
    }, null, 1));
  });
  const abs = (f) => path.join(SB, f);
  const prompts = chunks.map(([a, z], k) => `### Author ${k + 1} (beats ${a}-${z})
Follow ${abs("rules.md")} exactly (read it, the story bible and the reference it names first).
Your beats: ${abs(`chunk-${k + 1}.json`)} (author every entry in \`beats\`; context entries are for continuity only).
Consider every beat individually. Write the JSON array to ${abs(`authored-${k + 1}.json`)}.
Validate it parses and has one entry per beat with matching \`i\`. Do not modify any other file.
Reply with one line: count written.`).join("\n\n");
  fs.writeFileSync(path.join(SB, "PROMPTS.md"), `# Author prompts — ${SLUG} (${ENGINE}, ${beats.length} beats, ${chunks.length} authors)\n\nRun all authors in parallel, then:\n\n    node scripts/storyboard.js merge --slug=${SLUG}\n    node scripts/storyboard.js merge --slug=${SLUG} --write\n\n${prompts}\n`);
  console.log(`✓ books/${SLUG}/storyboard/ — ${beats.length} beats, ${chunks.length} chunks, ${ENGINE}${ENGINE === "antidote" ? `, ${v.icons.length} icons` : ""}`);
  console.log(`  Next: run the ${chunks.length} author prompts in books/${SLUG}/storyboard/PROMPTS.md in parallel.`);
}

// ── merge + validate ────────────────────────────────────────────────────────
function merge() {
  const emitted = readJSON(path.join(SB, "beats.json"));
  if (!emitted) { console.error("❌ run prep first"); process.exit(1); }
  const authored = new Map();
  const files = fs.readdirSync(SB).filter((f) => /^authored-\d+\.json$/.test(f));
  for (const f of files) {
    const arr = readJSON(path.join(SB, f));
    if (!Array.isArray(arr)) { console.error(`❌ ${f} is not a JSON array`); process.exit(1); }
    arr.forEach((b) => authored.set(b.i, b));
  }
  const problems = [], warnings = [];
  const P = (i, m) => problems.push(`${i}: ${m}`);
  const sbFields = ["claim", "concreteVisual", "onScreenText", "relationToPrevious", "addedInformation"];
  const out = [];
  if (ENGINE === "antidote") {
    const st = require("./lib/screen-text.js");
    const v = readJSON(path.join(SB, "vocab.json")) || vocabulary();
    const ICONS = new Set(v.icons), SETS = new Set(v.sets), SHOTS = new Set(v.shots), EXP = new Set(v.expressions),
      ACT = new Set(v.actions), HOLD = new Set(v.holds), CAST = new Set(v.cast.map((c) => c.key));
    const DIAG = new Set(["flow", "sorter", "spectrum", "matchWave"]), STY = new Set(["reveal", "highlight", "strike", "box", "stack", "outline", "marker"]);
    for (const e of emitted.beats) {
      const i = e.i, a = authored.get(i), narration = e.narration;
      if (!a) { P(i, "NOT AUTHORED"); continue; }
      if (a.concept != null && !ICONS.has(a.concept)) P(i, `icon "${a.concept}" not in this book's vocabulary`);
      if (a.set && !SETS.has(a.set)) P(i, `set "${a.set}"`);
      if (a.shotOverride && !SHOTS.has(a.shotOverride)) P(i, `shotOverride "${a.shotOverride}"`);
      if (a.expression && !EXP.has(a.expression)) P(i, `expression "${a.expression}"`);
      if (a.action && !ACT.has(a.action)) P(i, `action "${a.action}"`);
      if (a.holds && !HOLD.has(a.holds)) P(i, `holds "${a.holds}"`);
      if (Array.isArray(a.cast)) a.cast.forEach((c) => { if (!CAST.has(c)) P(i, `cast "${c}" not in story bible`); });
      if (a.diagram) {
        if (!DIAG.has(a.diagram.type)) P(i, `diagram type "${a.diagram.type}"`);
        if (!Array.isArray(a.diagram.labels) || !a.diagram.labels.length) P(i, "diagram without labels");
        if (a.concept || a.callout) P(i, "diagram beat also has icon/callout");
        (a.diagram.labels || []).forEach((l) => { const vv = st.checkString(l, { kind: "label", narration, authored: true }); if (vv.length) P(i, `diagram label "${l}": ${vv.map((x) => x.code).join(",")}`); });
      }
      if (a.callout) {
        if (!STY.has(a.callout.style)) P(i, `callout style "${a.callout.style}"`);
        const vv = st.checkString(a.callout.text, { kind: "text", narration, authored: true });
        if (vv.length) P(i, `callout "${a.callout.text}": ${vv.map((x) => x.code).join(",")}`);
      }
      const sb = a.storyboard || {};
      sbFields.forEach((k) => { if (!sb[k]) P(i, `storyboard.${k} missing`); });
      if (!a.callout && !a.diagram && !a.concept && !a.cast) warnings.push(`${i}: no callout/diagram/icon/staging`);
      out.push({
        i, narration,
        concept: a.concept ?? null, diagram: a.diagram ?? null, callout: a.callout ?? null,
        ...(a.set ? { set: a.set } : {}), ...(a.shotOverride ? { shotOverride: a.shotOverride } : {}),
        ...(Array.isArray(a.cast) && a.cast.length ? { cast: a.cast.slice(0, 2) } : {}),
        ...(a.expression ? { expression: a.expression } : {}), ...(a.action ? { action: a.action } : {}),
        ...(a.holds ? { holds: a.holds } : {}),
        storyboard: sb,
      });
    }
    const hist = {}; out.forEach((b) => b.concept && (hist[b.concept] = (hist[b.concept] || 0) + 1));
    const top = Object.entries(hist).sort((x, y) => y[1] - x[1]);
    const ownSet = new Set(v.ownIcons || []);
    top.filter(([k, n]) => !ownSet.has(k) && n > out.length * 0.05).forEach(([k, n]) => warnings.push(`icon "${k}" on ${n}/${out.length} beats (>5%) — an icon used for everything means nothing; re-check each against data/icon-readings.json`));
    signatureObjects().filter((o) => ownSet.has(o.key) && !hist[o.key]).forEach((o) => warnings.push(`signature object "${o.key}" is drawn but never used`));
    console.log(`beats ${out.length} | icon ${out.filter((b) => b.concept).length} | diagram ${out.filter((b) => b.diagram).length} | callout ${out.filter((b) => b.callout).length} | staged ${out.filter((b) => b.cast).length}`);
    console.log("icons:", JSON.stringify(top));
  } else {
    const TYPES = new Set(["title", "statement", "imagefocus", "list", "quote", "stat", "compare", "checklist", "polaroid", "chart", "timeline", "question", "punchline", "place", "document", "map", "flow", "trendline", "dataviz", "network", "duo", "reveal"]);
    let withImage = 0;
    const VOX_IMAGE_TYPES = new Set(["imagefocus", "polaroid", "compare", "duo"]);
    for (const e of emitted.beats) {
      const i = e.i, a = authored.get(i);
      if (!a || !a.design) { P(i, "NOT AUTHORED"); continue; }
      if ((a.design.image && a.design.image.subject) || a.design.compare) withImage++;
      if (a.design.image && a.design.image.subject && !VOX_IMAGE_TYPES.has(a.design.type) && a.design.type !== "statement")
        warnings.push(`${i}: image on "${a.design.type}" is never drawn — the planner makes it imagefocus; drop the image to keep the ${a.design.type}`);
      const d = a.design;
      if (!TYPES.has(d.type)) P(i, `type "${d.type}"`);
      const sb = d.storyboard || a.storyboard || {};
      sbFields.forEach((k) => { if (!sb[k]) P(i, `storyboard.${k} missing`); });
      if (d.image) {
        const s = String(d.image.subject || "");
        const words = s.split(/\s+/).filter(Boolean).length;
        if (words < 6 || /^([\w'-]+,\s*){2,}[\w'-]+$/.test(s.trim())) P(i, `image.subject is a keyword bag, not a described photograph: "${s}"`);
      }
      out.push({ ...d, storyboard: sb });
    }
    console.log(`beats ${out.length} | with image ${out.filter((d) => d.image).length}`);
    if (out.length && withImage > out.length * 0.9) warnings.push(`${withImage}/${out.length} beats have an image — almost every beat will be imagefocus; keep 15-30% as real questions/lists/quotes (rules.md → Coverage)`);
    if (out.length && withImage < out.length * 0.7) warnings.push(`only ${withImage}/${out.length} beats have an image (${Math.round((withImage / out.length) * 100)}%) — aim for 70%+: the mute test scores ADDS over ALL frames (rules.md → Coverage)`);
  }
  console.log(`problems (${problems.length})`); problems.slice(0, 60).forEach((x) => console.log("  ✗ " + x));
  if (problems.length > 60) console.log(`  … ${problems.length - 60} more`);
  if (warnings.length) { console.log(`warnings (${warnings.length})`); warnings.slice(0, 20).forEach((x) => console.log("  ⚠ " + x)); }
  if (!args.write) return;
  if (problems.length) { console.error("\n❌ not written — fix the problems (ask the chunk's author, or edit authored-K.json) and re-run."); process.exit(1); }
  if (ENGINE === "antidote") {
    fs.writeFileSync(path.join(BOOK, "art.json"), JSON.stringify({
      book: { slug: SLUG, title: book.title, author: book.author, genre: book.genre },
      storyboard: { method: "authored storyboard (STORYBOARD_RUNBOOK.md)", authoredBy: "claude", date: new Date().toISOString().slice(0, 10) },
      beats: out,
    }, null, 2) + "\n");
    console.log(`\n✓ books/${SLUG}/art.json — next: node scripts/make-book.js --slug=${SLUG} ... --skip-pack`);
  } else {
    fs.writeFileSync(path.join(BOOK, "designs.json"), JSON.stringify(out, null, 2) + "\n");
    console.log(`\n✓ books/${SLUG}/designs.json — next: node scripts/make-book.js --slug=${SLUG} ... (gate runs before Flux)`);
  }
}

if (CMD === "prep") prep(); else merge();
