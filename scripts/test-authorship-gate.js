#!/usr/bin/env node
/**
 * test-authorship-gate.js — Faz 0 fail-closed tests.
 *
 * Every case that let We Were Liars reach Studio unauthored must FAIL here:
 * unstamped config, unauthored beat, engine-invented prop / diagram, template
 * intent, one intent on >10% of beats, another book's vocabulary, laundered
 * brief provenance, and the director's lexical fallback.
 *
 *   node scripts/test-authorship-gate.js
 */
const { evaluateAuthorship, isAuthoredBrief } = require("./lib/authorship");

let passed = 0, failed = 0;
function assert(name, cond, detail = "") {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? `  — ${detail}` : ""}`); }
}
const codes = (res) => new Set(res.violations.map((v) => v.code));

// A clean, authored 12-beat film: distinct intents, props only from the author.
function cleanConfig() {
  const scenes = [{ id: "intro", shot: "lowAngle", props: [], _narration: "Welcome." }];
  for (let i = 1; i <= 12; i++) {
    scenes.push({
      id: `scene-${String(i).padStart(2, "0")}`,
      shot: i % 3 ? "medium" : "illustration",
      _narration: `Beat ${i}: Cadence walks the Beechwood shore and remembers summer fifteen.`,
      props: i % 3 ? [] : [{ type: "fire" }],
      _authorship: { src: i % 2 ? "art" : "brief", propTypes: i % 3 ? [] : ["fire"], diagramAuthored: false, intent: `Show beat ${i} as its own image` },
      visualProposition: { thesis: `Beat ${i}`, visualQuestion: "q", visualAnswer: "a" },
    });
  }
  return { scenes };
}
const ctx = { engine: "antidote", slug: "__test-book__", worldId: "e-lockhart-we-were-liars" };

console.log("═══ Faz 0: the gate passes an authored film ═══");
{
  const res = evaluateAuthorship(cleanConfig(), ctx);
  assert("clean authored config -> PASS", res.status === "PASS", JSON.stringify(res.violations.slice(0, 3)));
}

console.log("\n═══ Faz 0: fail-closed cases ═══");
{
  const c = cleanConfig();
  for (const s of c.scenes) delete s._authorship;
  const res = evaluateAuthorship(c, ctx);
  assert("config planned before the gate (no stamps) -> FAIL UNSTAMPED_CONFIG", res.status === "FAIL" && codes(res).has("UNSTAMPED_CONFIG"));
}
{
  const c = cleanConfig();
  c.scenes[4]._authorship.src = "none";
  const res = evaluateAuthorship(c, ctx);
  assert("one unauthored beat -> FAIL UNAUTHORED_BEAT", res.status === "FAIL" && codes(res).has("UNAUTHORED_BEAT") && res.counts.unauthored === 1);
}
{
  const c = cleanConfig();
  c.scenes[2].props = [{ type: "phone" }]; // a later engine decorated it
  const res = evaluateAuthorship(c, ctx);
  assert("prop the author never chose (the phone) -> FAIL ENGINE_INVENTED_PROP", res.status === "FAIL" && codes(res).has("ENGINE_INVENTED_PROP"));
}
{
  const c = cleanConfig();
  c.scenes[3].props = [{ type: "fire" }, { type: "lightbulb" }]; // authored fire + chapter-payoff bulb
  const res = evaluateAuthorship(c, ctx);
  const hit = res.violations.find((v) => v.code === "ENGINE_INVENTED_PROP");
  assert("authored prop kept, added payoff lightbulb caught", !!hit && hit.prop === "lightbulb");
}
{
  const c = cleanConfig();
  c.scenes[5].diagram = { title: "THE LOOP", nodes: ["a", "b"] };
  const res = evaluateAuthorship(c, ctx);
  assert("engine-detected diagram -> FAIL ENGINE_INVENTED_DIAGRAM", codes(res).has("ENGINE_INVENTED_DIAGRAM"));
  c.scenes[5].diagram.authored = true;
  assert("authored diagram -> no diagram violation", !codes(evaluateAuthorship(c, ctx)).has("ENGINE_INVENTED_DIAGRAM"));
}
{
  const c = cleanConfig();
  c.scenes[6]._authorship.intent = "Dramatize the thematic conflict of argument";
  const res = evaluateAuthorship(c, ctx);
  assert("heuristic template intent -> FAIL TEMPLATE_INTENT", codes(res).has("TEMPLATE_INTENT"));
}
{
  const c = cleanConfig();
  for (const i of [1, 2]) c.scenes[i]._authorship.intent = "Show the family's denial";
  const res = evaluateAuthorship(c, ctx);
  assert("one intent on 2/12 beats (16.7% > 10%) -> FAIL REPEATED_INTENT", codes(res).has("REPEATED_INTENT"));
}
{
  const c = cleanConfig();
  c.scenes[7].visualProposition.thesis = "Philosophical inquiry into virtue and justice";
  c.scenes[8].director = { visualSubject: "Socrates" };
  const res = evaluateAuthorship(c, ctx);
  const leaks = res.violations.filter((v) => v.code === "FOREIGN_WORLD_LEAK");
  assert("The Republic's defaults in another book -> FAIL FOREIGN_WORLD_LEAK (2 scenes)", leaks.length === 2, JSON.stringify(leaks));
}
{
  const c = cleanConfig();
  c.scenes[7].narrativeAtom = { forbiddenMotifs: ["caveAllegory", "kallipolis"] };
  c.scenes[7].visualContract = { mustNotShow: ["socrates"] };
  assert("a forbid list naming another world's motifs is not a leak", !codes(evaluateAuthorship(c, ctx)).has("FOREIGN_WORLD_LEAK"));
}
{
  const c = cleanConfig();
  c.scenes[7]._narration = "Socrates would have hated the Sinclairs.";
  c.scenes[7].director = { visualSubject: "Socrates" };
  assert("a term the narration itself says is not a leak", !codes(evaluateAuthorship(c, ctx)).has("FOREIGN_WORLD_LEAK"));
  c.scenes[8].director = { visualSubject: "Socrates" };
  assert("...but The Republic may use its own vocabulary", !codes(evaluateAuthorship(c, { ...ctx, slug: "the-republic", worldId: "plato-the-republic" })).has("FOREIGN_WORLD_LEAK"));
}
{
  // Vox shape: beats + props.text + images
  const cfg = { beats: [
    { id: "beat-000", type: "title", props: { text: "We Were Liars" } },
    { id: "beat-001", type: "imagefocus", props: { text: "huddled in the dark" }, images: [{ prompt: "cave, -375" }], _authorship: { src: "none", propTypes: [], intent: null } },
  ] };
  const res = evaluateAuthorship(cfg, { engine: "vox", slug: "dust" });
  assert("Vox: unauthored image beat -> FAIL UNAUTHORED_BEAT", res.status === "FAIL" && codes(res).has("UNAUTHORED_BEAT"));
  cfg.beats[1]._authorship.src = "design";
  assert("Vox: designed beat -> PASS", evaluateAuthorship(cfg, { engine: "vox", slug: "dust" }).status === "PASS");
}

console.log("\n═══ Faz 0: brief provenance cannot be laundered ═══");
{
  assert("heuristic brief is not authored", !isAuthoredBrief({ fp: "a", src: "heuristic" }, { authored: true }));
  assert("claude brief is authored", isAuthoredBrief({ fp: "a", src: "claude" }, { authored: false }));
  assert("legacy authored file (no src) is trusted", isAuthoredBrief({ fp: "a" }, { authored: true }));
  assert("unauthored file (no src) is not", !isAuthoredBrief({ fp: "a" }, { authored: false }));
}

console.log("\n═══ Faz 0: the director has no lexical fallback ═══");
{
  const { createDirector } = require("./lib/antidote-director");
  const PAL = { paper: "#FAF9F5", ink: "#18181B", red: "#E11D48", gold: "#F59E0B" };
  const mk = () => createDirector({ palette: PAL, genre: "young adult", slug: "__test__", bible: null });
  const base = { isTitle: false, total: 40, durationFrames: 360 };
  // The exact 0:55 sentence from We Were Liars.
  const said = "Yeah, we are discarding that framing entirely. Instead, we are treating this text as what it actually is, which is a brutal, unflinching autopsy of American aristocracy.";
  let phones = 0, anyProp = 0;
  const d = mk();
  for (let i = 1; i <= 30; i++) {
    const r = d.direct({ ...base, index: i, text: said, calloutAt: i % 2 ? null : 40, concept: undefined });
    if ((r.props || []).some((p) => p.type === "phone") || r.concept === "phone") phones++;
    if ((r.props || []).length) anyProp++;
  }
  assert("30 unauthored beats of the 0:55 sentence -> 0 phones", phones === 0, `${phones}`);
  assert("30 unauthored beats -> 0 engine-chosen props of any kind", anyProp === 0, `${anyProp}`);
  const money = mk().direct({ ...base, index: 3, text: "Dynastic wealth, money and dollars everywhere.", calloutAt: null, concept: undefined });
  assert("money words no longer summon the coin menu", (money.props || []).length === 0, JSON.stringify((money.props || []).map((p) => p.type)));
  const authored = mk().direct({ ...base, index: 3, text: said, calloutAt: null, concept: "fire" });
  assert("an authored concept still reaches the screen", authored.concept === "fire" || (authored.props || []).some((p) => p.type === "fire"), `${authored.concept}`);
  const pref = mk().direct({ ...base, index: 3, text: said, calloutAt: null, concept: undefined,
    brief: { antidote: { motifPreference: ["mask"] } } });
  assert("an authored motifPreference still reaches the screen", (pref.props || []).some((p) => p.type === "mask"), JSON.stringify((pref.props || []).map((p) => p.type)));
}

console.log("\n═══ Faz 0: chapter arcs never override an authored beat ═══");
{
  const { planChapterArcs } = require("./lib/antidote-chapter-arcs");
  const mk = () => Array.from({ length: 10 }, (_, i) => ({
    id: `scene-${i}`, fromFrame: i * 270, durationFrames: 270, shot: "medium", props: [],
    texts: [{ text: "X", src: "art" }], _authorship: { src: "art", propTypes: [] },
  }));
  const inv = planChapterArcs(mk(), [], 30).scenes;
  assert("no authored chapters -> no invented 'PART 02' chapter card", !inv.some((s) => s.shot === "chapterCard"), inv.map((s) => s.shot).join(","));
  assert("authored beats keep their framing (no forced split on the turn beat)", inv.every((s) => s.shot === "medium"), inv.map((s) => s.shot).join(","));
  const far = planChapterArcs(mk(), [{ t: 0, label: "Intro" }, { t: 900, label: "Later" }], 30).scenes;
  assert("a chapter starting after the film ends does not snap onto the last scene", far[9].shot !== "chapterCard");
  const real = planChapterArcs(mk(), [{ t: 0, label: "Intro" }, { t: 45, label: "The Sinclairs" }], 30).scenes;
  assert("an authored in-range chapter still gets its card", real.some((s) => s.shot === "chapterCard" && s.chapterCard.title === "THE SINCLAIRS"));
}

console.log(`\n═══ RESULTS: ${passed} passed, ${failed} failed ═══`);
if (failed) process.exit(1);
