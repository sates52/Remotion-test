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
const ENGINE = book.engine === "vox" ? "vox" : "antidote";
const bible = readJSON(path.join(BOOK, "story-bible.json"), {});
const vp = bible.visualProvenance || {};
const FICTION = !/non-?fiction|self.?help|business|finance|psycholog|productiv|science|history|philosoph|memoir|biograph/i.test(String(book.genre || ""));

// ── vocabulary this book may use ────────────────────────────────────────────
function vocabulary() {
  if (ENGINE === "vox") return {};
  const { SCENE_ICONS } = require("./lib/antidote-director.js");
  const { shotName, setName, expression, charAction, handProp } = require("../src/engines/antidote/schema.ts");
  const shared = (readJSON(path.join(ROOT, "data/shared-generic-motifs.json"), {}).motifs) || [];
  const allowed = new Set([...(vp.allowedMotifs || []), ...(vp.allowedProps || []), ...shared]);
  const icons = SCENE_ICONS.filter((c) => allowed.has(c));
  const sets = vp.allowedLocations && vp.allowedLocations.length
    ? setName.options.filter((s) => vp.allowedLocations.includes(s)) : setName.options.filter((s) => s !== "none");
  const MODERN = new Set(["laptop", "creditCard", "smartphone", "zap", "sword"]);
  const holds = handProp.options.filter((h) => !MODERN.has(h) || /tech|business|startup/i.test(String(book.genre)));
  return {
    icons, sets,
    shots: shotName.options.filter((s) => s !== "chapterCard"),
    expressions: expression.options, actions: charAction.options, holds,
    cast: Object.entries(bible.cast || {}).map(([k, c]) => ({ key: k, name: c.name, role: c.role, look: c.look })),
  };
}

// ── rules sheet (the one authoring round) ───────────────────────────────────
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

## The icon test (most important)
Pick a \`concept\` only if a muted viewer seeing that icon next to the callout would guess the right
meaning. NEVER because a word matches ("treating this TEXT as" is not a phone; "romance is the
wrong reading" is not a heart). Metaphors must be obvious: mask = false public face; chains =
bound/controlled (drawn intact); puppeteer = controlling others; crack = breaking; balance =
weighing/fairness; door = a way in/out or exclusion (never on "no way out"); mirror = self-image;
hourglass/clock = time; shield = protection; trophy = status/prize (never weakness); gift = a present
/ giving away; inheritance = a will / estate / heir; magnifier = close examination.
If a beat has an honest concrete subject, give it the icon even if a neighbour used it. If nothing
honest fits: \`concept: null\` and a strong callout.

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

## The image test (most important)
\`image.subject\` is a DESCRIBED PHOTOGRAPH — who, doing what, where, when — never a keyword list
("heart, manuscript, 1985" is forbidden). A muted viewer must guess the sentence from it. Reuse a
character's look VERBATIM so the same person recurs:
${cast || "- (no cast in the story bible)"}
Keep the era right (no anachronisms). Flux drops gore, children in danger and war violence
(CONTENT_FILTERED) — soften to aftermath, symbol or place. An idea with no picture -> type
\`statement\` with image null (a strong emphasis carries it). No text inside images.

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every \`i\`.
`;
}

function prep() {
  fs.mkdirSync(SB, { recursive: true });
  const vtt = path.join(ROOT, "public/captions", `${SLUG}.vtt`);
  if (!fs.existsSync(vtt)) { console.error(`❌ public/captions/${SLUG}.vtt missing — the storyboard is authored against the real narration`); process.exit(1); }
  if (!bible.cast || !Object.keys(bible.cast).length) {
    console.warn(`⚠ story bible has no cast — author it first (plan-bible --emit -> Claude -> --bible). WWL shipped a cast without its three mothers.`);
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
    if (top.length && top[0][1] > out.length * 0.12) warnings.push(`icon "${top[0][0]}" on ${top[0][1]}/${out.length} beats — over-used?`);
    console.log(`beats ${out.length} | icon ${out.filter((b) => b.concept).length} | diagram ${out.filter((b) => b.diagram).length} | callout ${out.filter((b) => b.callout).length} | staged ${out.filter((b) => b.cast).length}`);
    console.log("icons:", JSON.stringify(top));
  } else {
    const TYPES = new Set(["title", "statement", "imagefocus", "list", "quote", "stat", "compare", "checklist", "polaroid", "chart", "timeline", "question", "punchline", "place", "document", "map", "flow", "trendline", "dataviz", "network", "duo", "reveal"]);
    for (const e of emitted.beats) {
      const i = e.i, a = authored.get(i);
      if (!a || !a.design) { P(i, "NOT AUTHORED"); continue; }
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
