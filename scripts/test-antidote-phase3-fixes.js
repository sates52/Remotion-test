#!/usr/bin/env node
"use strict";
/**
 * test-antidote-phase3-fixes.js — Deep unit & integration tests for the Antidote 10x
 * Phase 3 System Improvement Plan (P0.1, P0.2, P0.3, Decisions #1/#2/#3, P1.1-P1.4, P2).
 *
 * Covers positive, negative, and boundary edge cases across every changed subsystem.
 */
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const esbuild = require(path.join(ROOT, "node_modules", "esbuild"));

function loadTs(relPath, stubRemotion = false) {
  const res = esbuild.buildSync({
    entryPoints: [path.join(ROOT, relPath)],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    external: ["react", "react/jsx-runtime", "remotion"],
    jsx: "automatic",
  });
  const code = res.outputFiles[0].text;
  const mod = { exports: {} };
  const stub = {
    Easing: { out: (f) => f, poly: () => (t) => t },
    interpolate: () => 0,
    useCurrentFrame: () => 0,
    createContext: () => ({ Provider: () => null }),
    useContext: () => null,
    jsx: () => null,
    jsxs: () => null,
    Fragment: "div",
    default: { createContext: () => ({ Provider: () => null }), useContext: () => null },
  };
  const customReq = (id) => {
    if (stubRemotion && (id === "remotion" || id === "react" || id === "react/jsx-runtime")) return stub;
    return require(id);
  };
  new Function("require", "exports", "module", "__filename", "__dirname", code)(
    customReq,
    mod.exports,
    mod,
    path.join(ROOT, relPath),
    path.dirname(path.join(ROOT, relPath)),
  );
  return mod.exports;
}

const thumbHero = loadTs("src/engines/antidote/thumbHero.ts");
const staging = loadTs("src/semantic/stagingEvidence.ts");
const schema = loadTs("src/engines/antidote/schema.ts");
const { STYLE_PACKS, pickStylePack, toArtDirection } = require("./lib/style-packs");
const { compile10xCues, findCueFrame } = require("./lib/compile-10x-cues");
const { analyzeVariety, assertVariety, isTextHeavy10x } = require("./lib/v2-variety-lint");
const { analyzeNarrative } = require("./lib/v2-narrative-lint");
const { buildPrompts10x, computeFluxBudget, validateMinorHarmSafePrompt, collectReferencedImages } = require("./lib/build-10x-prompts");
const { applyNamesToText, applyNamesToRawVtt, levenshtein, suggestNameMismatches } = require("./lib/vtt-names");
const { planChapterArcs, auditChapterArcs } = require("./lib/antidote-chapter-arcs");
const { directAudioEvents, auditAudioDirector } = require("./lib/antidote-audio-director");
const { autoRepairAntidote } = require("./lib/antidote-auto-repair");
const { validateConfig } = require("./lib/narrative-visual-firewall");

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  PASS  ${name}`);
}

console.log("Running Antidote 10x Phase 3 System Improvement tests...");

// ── P0.1: ThumbHero 3-tier scoring, STOP words, thumbnailHero override, focalPointOf ──
test("P0.1: thumbHero 3-tier scoring ranks Tier A & Tier B above Tier C, supports thumbnailHero & STOP filter", () => {
  const scenes = [
    { id: "c-timeline", durationFrames: 180, timelineScrub: { title: "T", events: [{ time: "1", title: "A" }, { time: "2", title: "B" }] }, _narration: "nobody always everyone look" },
    { id: "c-wipe-txt", durationFrames: 180, beforeAfterWipe: { before: { label: "A", headline: "X" }, after: { label: "B", headline: "Y" } } },
    { id: "b-twoshot", durationFrames: 180, shot: "twoShot", bg: { set: "home" }, characters: [{ id: "1", role: "a", expression: "shocked", x: 0.3, y: 0.6 }, { id: "2", role: "b", expression: "worried", x: 0.7, y: 0.6 }] },
    { id: "b-told", durationFrames: 180, told: { items: [{ id: "k", kind: "icon" }] } },
    { id: "a-wipe-img", durationFrames: 180, beforeAfterWipe: { before: { label: "A", headline: "X", image: "scenes/x/a.png" }, after: { label: "B", headline: "Y" } } },
    { id: "a-hook", durationFrames: 180, hookPoster: { setup: "S", payoff: "P" } },
  ];
  const top3 = thumbHero.pickHeroScenes(scenes, "NOBODY ALWAYS LOOKS", undefined, 3);
  const ids = top3.map((s) => s.id);
  assert.ok(!ids.includes("c-timeline"), `Tier C timelineScrub should not enter top 3: ${ids}`);
  assert.ok(!ids.includes("c-wipe-txt"), `imageless beforeAfterWipe should not enter top 3: ${ids}`);
  assert.ok(ids.includes("b-twoshot"), `twoShot+shocked must beat Tier C slides: ${ids}`);

  // Explicit thumbnailHero override pins even a low-scored scene to rank 0
  const pinned = thumbHero.pickHeroScenes(
    scenes.map((s) => (s.id === "b-told" ? { ...s, thumbnailHero: true } : s)),
    "NOBODY LOOKS",
    undefined,
    3,
  );
  assert.strictEqual(pinned[0].id, "b-told");

  // focalPointOf handles real 1920x1080 pixel coords (characters, annotatedScene spotlights, cutoutStage actors), upClose zoomTarget, and normalized coords
  const fpChar = thumbHero.focalPointOf(scenes[2]);
  assert.ok(Math.abs(fpChar.x - 0.5) < 0.05 && fpChar.y < 0.55);
  const fpLeftPx = thumbHero.focalPointOf({ characters: [{ id: "1", x: 540, y: 700 }] });
  assert.ok(fpLeftPx.x >= 0.25 && fpLeftPx.x <= 0.32, `pixel char x=540 must normalize left (~0.28), got ${fpLeftPx.x}`);
  assert.ok(fpLeftPx.y >= 0.50 && fpLeftPx.y <= 0.58, `pixel char y=700 must normalize upward (~0.55), got ${fpLeftPx.y}`);
  const fpAnn = thumbHero.focalPointOf({ annotatedScene: { image: "a.png", spotlights: [{ cx: 480, cy: 360 }] } });
  assert.ok(Math.abs(fpAnn.x - 0.25) < 0.02 && Math.abs(fpAnn.y - 0.333) < 0.02, `annotatedScene spotlights px failed: ${JSON.stringify(fpAnn)}`);
  const fpCut = thumbHero.focalPointOf({ cutoutStage: { backdrop: { image: "b.png" }, actors: [{ id: "a", image: "c.png", x: 420, y: 620 }] } });
  assert.ok(fpCut.x >= 0.24 && fpCut.x <= 0.26, `cutoutStage actors px failed: ${JSON.stringify(fpCut)}`);
  const fpUp = thumbHero.focalPointOf({ upClose: { image: "u.png", zoomTarget: { x: 0.28, y: 0.38 } } });
  assert.ok(Math.abs(fpUp.x - 0.28) < 0.01 && Math.abs(fpUp.y - 0.38) < 0.01, `upClose zoomTarget failed: ${JSON.stringify(fpUp)}`);
  assert.strictEqual(thumbHero.focalPointOf({ cutoutStage: { side: "left" } }).x, 0.34);
  assert.strictEqual(thumbHero.focalPointOf(null).x, 0.5);
});

// ── P0.2: BeforeAfterWipe inverted curtain fix & 31-component spec.at double-offset audit ──
test("P0.2: BeforeAfterWipe starts at 100% before ([1, endSplit]) and all 31 10x components have 0 double-offsets", () => {
  const baw = fs.readFileSync(path.join(ROOT, "src/engines/antidote/components/BeforeAfterWipe.tsx"), "utf8");
  assert.ok(baw.includes("[1, endSplit]"), "BeforeAfterWipe must interpolate [1, endSplit] (not inverted [0, endSplit])");
  assert.ok(!baw.includes("[0, endSplit]"), "BeforeAfterWipe must not retain inverted [0, endSplit]");

  const compDir = path.join(ROOT, "src/engines/antidote/components");
  const bad = fs.readdirSync(compDir)
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) => fs.readFileSync(path.join(compDir, f), "utf8").includes("- (spec.at ?? 0)"));
  assert.deepStrictEqual(bad, [], `Found remaining spec.at double-offset in: ${bad.join(", ")}`);
});

// ── P0.2: compile10xCues clamps wipeAt<=52%, strikeAt<=58%, flexible cue matching, warns on miss ──
test("P0.2: compile10xCues clamps wipeAt/strikeAt, matches flexible cues, and warns on unmatched cues", () => {
  const words = [
    { w: "She", start: 0.2 },
    { w: "doesn't", start: 0.6 },
    { w: "just", start: 1.0 },
    { w: "vanished", start: 1.4 },
    { w: "forever", start: 2.0 },
    { w: "today", start: 2.5 },
  ];
  // Pass 2 / Pass 3 flexible matching: apostrophe stripped + inserted filler "just"
  const f1 = findCueFrame("doesnt vanish forever", { words, beatStartSec: 0, durationFrames: 200, fps: 30 });
  assert.ok(f1 != null && f1 >= 12 && f1 <= 30, `expected flexible cue match around frame 18, got ${f1}`);

  const warnings = [];
  const unmatchedCues = [];
  const sc = {
    id: "s-clamp",
    durationFrames: 200,
    beforeAfterWipe: { wipeAt: 170, before: { label: "A", headline: "Old" }, after: { label: "B", headline: "New" } },
    kineticManifesto: {
      lines: [
        { text: "LINE 1", at: 20, strikeAt: 185 },
        { text: "LINE 2", cue: "nonexistent spoken phrase" },
      ],
    },
  };
  compile10xCues(sc, { words, beatStartSec: 0, durationFrames: 200, fps: 30, warnings, unmatchedCues, quiet: true });
  assert.ok(sc.beforeAfterWipe.wipeAt <= Math.round(200 * 0.52), `wipeAt should be <= 104, got ${sc.beforeAfterWipe.wipeAt}`);
  assert.ok(sc.kineticManifesto.lines[0].strikeAt <= Math.round(200 * 0.58), `strikeAt should be <= 116, got ${sc.kineticManifesto.lines[0].strikeAt}`);
  assert.strictEqual(unmatchedCues.length, 1);
  assert.ok(warnings[0].includes("nonexistent spoken phrase"));
});

// ── P0.2: Genre & minorHarm-aware quotas + visual slots ──
test("P0.2: v2-variety-lint enforces fiction/minorHarm 80%/20% vs non-fiction 65%/25% and sub-mode pacing", () => {
  // Fiction / minorHarm config with 75% live-story alternating twoShot / told / illustration -> PASS
  const storyScenes = [
    { id: "s1", shot: "twoShot", bg: { set: "home" }, characters: [{ id: "a" }, { id: "b" }] },
    { id: "s2", told: { items: [{ id: "k" }] } },
    { id: "s3", shot: "illustration", bg: { set: "street" }, props: [{ type: "key" }] },
    { id: "s4", shot: "twoShot", bg: { set: "office" }, characters: [{ id: "a" }, { id: "b" }] },
    { id: "s5", told: { items: [{ id: "m" }] } },
    { id: "s6", shot: "medium", bg: { set: "park" }, characters: [{ id: "a" }] },
    { id: "s7", beforeAfterWipe: { before: { label: "A", headline: "1", icon: "key" }, after: { label: "B", headline: "2" } } },
    { id: "s8", balanceScale: { leftWeights: [], rightWeights: [] } },
  ];
  const cfgStory = { meta: { artDirection: toArtDirection("storybookNoir") }, scenes: storyScenes, captions: [{ text: "x", startFrame: 0, endFrame: 30 }] };
  const stats = assertVariety(cfgStory, { book: { engineProfile: { kind: "fiction", minorHarm: true } } });
  assert.strictEqual(stats.shares["live-story"], 0.75);
  assert.strictEqual(stats.genreContext.isFiction, true, "must detect book.engineProfile.kind === 'fiction'");
  assert.strictEqual(stats.genreContext.minorHarm, true, "must detect book.engineProfile.minorHarm === true");
  assert.strictEqual(isTextHeavy10x(storyScenes[6]), false, "beforeAfterWipe with icon slot should NOT count as textHeavy10x");

  // Fiction non-minorHarm book (via real book.json engineProfile.kind) also gets 80%/20% story quota
  const fictionNonMhStats = assertVariety(
    { meta: { artDirection: { captions: "off" } }, scenes: storyScenes, captions: [] },
    { book: { engineProfile: { kind: "fiction", minorHarm: false } } },
  );
  assert.strictEqual(fictionNonMhStats.genreContext.storyMode, true);
  assert.strictEqual(fictionNonMhStats.genreContext.minorHarm, false);

  // Same 75% live-story fails non-fiction (<= 65%)
  assert.throws(() => assertVariety(
    { meta: { artDirection: { captions: "off" } }, scenes: storyScenes, captions: [] },
    { book: { engineProfile: { kind: "nonfiction", minorHarm: false } } },
  ), /exceeds 65%/);

  // >2 identical shot+place fails even in fiction
  const samePlace = [
    { id: "p1", shot: "twoShot", bg: { set: "kitchen" }, characters: [{ id: "a" }, { id: "b" }] },
    { id: "p2", shot: "twoShot", bg: { set: "kitchen" }, characters: [{ id: "a" }, { id: "b" }] },
    { id: "p3", shot: "twoShot", bg: { set: "kitchen" }, characters: [{ id: "a" }, { id: "b" }] },
    { id: "p4", balanceScale: {} },
  ];
  assert.throws(() => assertVariety(
    { meta: { artDirection: toArtDirection("storybookNoir") }, scenes: samePlace, captions: [{ text: "x", startFrame: 0, endFrame: 30 }] },
    { book: { kind: "fiction", minorHarm: true } },
  ), /maxConsecutive|maxIdenticalShotPlace/);

  // textHeavy10x > 25% fails non-fiction
  const textFlood = [
    { id: "t1", kineticManifesto: { lines: [{ text: "A" }] } },
    { id: "t2", quoteDialogue: { lines: [] } },
    { id: "t3", stackReveal: { items: [] } },
    { id: "t4", balanceScale: {} },
    { id: "t5", vennMerge: {} },
  ];
  assert.throws(() => assertVariety(
    { meta: { artDirection: { captions: "off" } }, scenes: textFlood, captions: [] },
    { book: { kind: "nonfiction", minorHarm: false } },
  ), /textHeavy10x/);
});

// ── P0.3: 5 multi-polarity minorHarmSafe packs + Backdrop/ToldStage unity ──
test("P0.3: 5 minorHarmSafe packs span 5 distinct layoutGrammars & polarities and rotate cleanly", () => {
  const mhPacks = Object.values(STYLE_PACKS).filter((p) => p.minorHarmSafe);
  assert.strictEqual(mhPacks.length, 5);
  assert.strictEqual(new Set(mhPacks.map((p) => p.layoutGrammar)).size, 5);
  assert.ok(mhPacks.some((p) => p.polarity === "dark") && mhPacks.some((p) => p.polarity === "chromaticMid") && mhPacks.some((p) => p.polarity === "light"));

  const seen = [];
  for (let i = 0; i < 5; i++) {
    const p = pickStylePack({ slug: `mh-book-${i}`, genre: i % 2 === 0 ? "thriller" : "fiction", minorHarm: true, recent: seen });
    assert.strictEqual(p.minorHarmSafe, true);
    if (seen[0]) {
      assert.notStrictEqual(p.id, seen[0].id);
      assert.notStrictEqual(p.layoutGrammar, seen[0].layoutGrammar);
    }
    seen.unshift(p);
  }
});

// ── Operator Decisions #1 & #2: Flux budget 80..90 & minorHarm <= 25 symbolic guard ──
test("Decisions #1 & #2: Flux budgets (80..90 / minorHarm <=25) + deterministic minorHarm prompt guard + full image ref collector", () => {
  assert.strictEqual(computeFluxBudget({ durationMin: 35, minorHarm: false }), 80);
  assert.strictEqual(computeFluxBudget({ durationMin: 45, minorHarm: false }), 90);
  assert.strictEqual(computeFluxBudget({ durationMin: 60, minorHarm: false }), 90);
  assert.strictEqual(computeFluxBudget({ durationMin: 45, minorHarm: true }), 25);
  assert.strictEqual(computeFluxBudget({ durationMin: 45, minorHarm: true, maxCalls: 80 }), 25);

  // Safe symbolic empty places pass (including inanimate "bedside" without matching "bed")
  for (const okPrompt of [
    "Rain-slicked brick alleyway at twilight, warm amber streetlamp reflecting on wet cobblestones, autumn leaves",
    "Empty bedside table beside rain-streaked window, weathered brass lamp and closed leather notebook",
  ]) {
    assert.strictEqual(validateMinorHarmSafePrompt(okPrompt, { mode: "scene" }).ok, true, `must allow safe inanimate prompt: ${okPrompt}`);
  }
  // Every minorHarmSafe pack's artLock must itself pass validateMinorHarmSafePrompt (zero forbidden tokens)
  for (const pack of Object.values(STYLE_PACKS).filter((p) => p.minorHarmSafe)) {
    const chk = validateMinorHarmSafePrompt(pack.artLock, { mode: "scene" });
    assert.strictEqual(chk.ok, true, `minorHarmSafe pack "${pack.id}" artLock must pass guard: ${chk.reasons.join("; ")}`);
  }
  // Rejects child, human, portrait, silhouette, harm, bed, photoreal, oblique child/harm cues, cutout/poses2x2
  for (const bad of [
    "A lonely girl standing on a rainy street",
    "Silhouette of a man watching from a window",
    "Dark basement cage with heavy chains",
    "Unmade bedroom mattress in dim light",
    "Photorealistic 85mm lens empty park bench",
    "Abandoned schoolbag left by an empty swing set",
    "Small shoes resting outside a locked nursery door",
    "A moody photo of a dimly lit corridor",
    "Stalker waiting near the rusty handcuffs",
    "Portrait of a missing sister in winter light",
  ]) {
    assert.strictEqual(validateMinorHarmSafePrompt(bad, { mode: "scene" }).ok, false, `must reject: ${bad}`);
  }
  assert.strictEqual(validateMinorHarmSafePrompt("Empty stone archway at dusk", { mode: "cutout" }).ok, false);
  assert.strictEqual(validateMinorHarmSafePrompt("Empty stone archway at dusk", { mode: "poses2x2" }).ok, false);

  // buildPrompts10x enforces allowed devices + no Everyman cast on minorHarm
  const built = buildPrompts10x({
    slug: "test-mh",
    minorHarm: true,
    pack: STYLE_PACKS.storybookNoir,
    beats: [
      { i: 0, hookPoster: { setup: "A", payoff: "B", beforeImage: "scenes/test-mh/arch.png" }, assetRequests: [{ id: "arch", prompt: "Empty ivy-covered stone archway at twilight, fallen leaves on wet slate" }] },
      { i: 1, cast: ["laurel"], assetRequests: [{ id: "illegal-cast", prompt: "Empty sunlit kitchen table with folded newspaper" }] },
      { i: 2, evidenceBoard: { subject: "X", setup: "Y", finding: "Z", lessonHeadline: "L" }, assetRequests: [{ id: "bad-child", prompt: "A child walking down a foggy road" }] },
    ],
  });
  assert.strictEqual(built.skipped, false);
  assert.strictEqual(built.maxCalls, 25);
  assert.strictEqual(built.scenes.length, 1);
  assert.strictEqual(built.scenes[0].id, "arch");
  assert.strictEqual(built.rejected.length, 2);

  // P1.4 collectReferencedImages collects comicStrip, evidenceBoard, hookPoster before/after
  const refs = collectReferencedImages([
    { comicStrip: { panels: [{ image: "scenes/x/p1.png" }, { image: "scenes/x/p2.png" }] } },
    { evidenceBoard: { image: "scenes/x/ev.png" } },
    { hookPoster: { beforeImage: "scenes/x/hb.png", afterImage: "scenes/x/ha.png" } },
  ]);
  assert.deepStrictEqual(refs.sort(), ["scenes/x/ev.png", "scenes/x/ha.png", "scenes/x/hb.png", "scenes/x/p1.png", "scenes/x/p2.png"]);
});

// ── P1.1: Firewall blind spots (HC3 10x/told/chapterInterstitial, HC4 expressive twoShot, motifs synonyms) ──
test("P1.1: stagingEvidence clears structural 10x/chapterInterstitial/told & expressive twoShot, keeps manifesto & idle statues REVIEW", () => {
  const equivIntent = { archetype: "allegory_equivalence", semanticRequirements: ["two_distinct_comparative_elements"], requiredActions: ["render_structural_parallel_between_domains"], forbiddenTropes: [] };
  assert.strictEqual(staging.evaluateSemanticStaging({ scene: { beforeAfterWipe: {} }, intent: equivIntent }).hardViolations.length, 0);
  assert.strictEqual(staging.evaluateSemanticStaging({ scene: { chapterInterstitial: { title: "CH 1" } }, intent: equivIntent }).hardViolations.length, 0);
  assert.strictEqual(staging.evaluateSemanticStaging({ scene: { told: { items: [{ id: "a" }, { id: "b" }] } }, intent: equivIntent }).hardViolations.length, 0);
  // Single-pole kineticManifesto MUST remain REVIEW!
  assert.ok(staging.evaluateSemanticStaging({ scene: { kineticManifesto: { lines: [{ text: "X" }] } }, intent: equivIntent }).hardViolations.some((v) => v.includes("MISSING_STRUCTURAL_EQUIVALENCE")));

  const idleIntent = { archetype: "character_psychology", forbiddenTropes: ["static_idle_actor_wallpaper"], requiredActions: [] };
  // Active 2-person twoShot with non-neutral partner expression -> CLEARED
  assert.strictEqual(staging.evaluateSemanticStaging({
    scene: { shot: "twoShot", characters: [{ action: "talk", expression: "angry" }, { action: "idle", expression: "worried" }] },
    intent: idleIntent,
  }).hardViolations.length, 0);
  // Neutral partner twoShot -> STILL REVIEW
  assert.ok(staging.evaluateSemanticStaging({
    scene: { shot: "twoShot", characters: [{ action: "talk", expression: "angry" }, { action: "idle", expression: "neutral" }] },
    intent: idleIntent,
  }).hardViolations.some((v) => v.includes("IDLE_ACTOR_WALLPAPER")));
  // Solo idle/talk/point/walk & twoShot both idle -> STILL REVIEW
  for (const badScene of [
    { shot: "medium", characters: [{ action: "talk", expression: "worried" }] },
    { shot: "medium", characters: [{ action: "point", expression: "angry" }] },
    { shot: "twoShot", characters: [{ action: "idle", expression: "worried" }, { action: "idle", expression: "sad" }] },
  ]) {
    assert.ok(staging.evaluateSemanticStaging({ scene: badScene, intent: idleIntent }).hardViolations.some((v) => v.includes("IDLE_ACTOR_WALLPAPER")));
  }

  // Motifs title/reads synonyms clear VISUAL_NOT_GROUNDED_IN_SEGMENT while ungrounded stock icon still triggers
  const bible = {
    world: { worldId: "w1", era: "2020", forbid: [] },
    visualProvenance: { bookId: "b1", worldId: "w1", allowedMotifs: ["m1", "tree"], forbiddenMotifs: [], allowedCharacters: [], allowedLocations: ["home"], allowedProps: [] },
    cast: { c1: { name: "Alice", look: "woman", variant: { gender: "f" } } },
    places: { home: { set: "home", look: "house" } },
  };
  const prov = { bookId: "b1", worldId: "w1", sourceChapter: "ch1", narrativeSubject: "letter", narrativeRelation: "found", narrativeState: "open", allowedMotifs: ["m1", "tree"], forbiddenMotifs: [], allowedCharacters: [], allowedLocations: ["home"], allowedProps: [] };
  const cfg = {
    scenes: [
      { id: "s-own", concept: "blueEnvelope", _narration: "She found the torn letter on the stairs.", bg: { set: "home" }, narrativeAtom: prov, visualIntent: prov, visualContract: { ...prov, visualEvidence: { subjects: ["letter"], relations: ["found"], states: ["open"] } } },
      { id: "s-bad", concept: "tree", _narration: "He smashed the X-ray machine.", bg: { set: "home" }, narrativeAtom: prov, visualIntent: prov, visualContract: { ...prov, visualEvidence: { subjects: ["letter"], relations: ["found"], states: ["open"] } } },
    ],
  };
  const motifs = { blueEnvelope: { title: "Torn Letter", reads: "a torn letter in a blue envelope" } };
  const fw = validateConfig({ config: cfg, bible, slug: "b1", motifs });
  const segErrs = fw.violations.filter((e) => e.reasonCode === "VISUAL_NOT_GROUNDED_IN_SEGMENT");
  assert.strictEqual(segErrs.length, 1);
  assert.strictEqual(segErrs[0].sceneId, "s-bad");
});

// ── P1.2: Permanent clean.vtt name protection (vtt-names.js + clean-vtt.js) ──
test("P1.2: vtt-names preserves raw timestamps, fixes tag-sandwiched names, and suggests Levenshtein <= 2 mismatches", () => {
  const raw = [
    "WEBVTT",
    "",
    "00:00:01.000 --> 00:00:04.000",
    "Laural looked at Poppie and Flannry O' Conor.",
    "Laural<00:00:01.400><c> looked</c><00:00:01.800><c> at</c><00:00:02.100><c> Poppie</c><00:00:02.500><c> and</c><00:00:02.900><c> Flannry</c><00:00:03.200><c> O'</c><00:00:03.500><c> Conor.</c>",
    "",
  ].join("\n");
  const pairs = [["Flannry O' Conor", "Flannery O'Connor"], ["Laural", "Laurel"], ["Poppie", "Poppy"]];
  const res = applyNamesToRawVtt(raw, pairs);
  assert.ok(res.text.includes("00:00:01.000 --> 00:00:04.000"), "raw VTT timestamp must never be altered");
  assert.ok(res.text.includes("Laurel looked at Poppy and Flannery O'Connor."));
  assert.ok(res.text.includes("Flannery O'Connor."));
  assert.ok(!res.text.includes("Laural") && !res.text.includes("Poppie"));

  // clean-vtt.js --names preserves timestamps & applies replacements
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vtt-names-"));
  try {
    const inVtt = path.join(tmpDir, "in.vtt");
    const outVtt = path.join(tmpDir, "out.clean.vtt");
    const namesJson = path.join(tmpDir, "names.json");
    fs.writeFileSync(inVtt, raw);
    fs.writeFileSync(namesJson, JSON.stringify({ _comment: "test", Laural: "Laurel", Poppie: "Poppy", "Flannry O' Conor": "Flannery O'Connor" }));
    execFileSync(process.execPath, [path.join(ROOT, "scripts/clean-vtt.js"), inVtt, outVtt, `--names=${namesJson}`], { cwd: ROOT, stdio: "pipe" });
    const cleaned = fs.readFileSync(outVtt, "utf8");
    assert.ok(cleaned.includes("00:00:01.000 --> 00:00:04.000"));
    assert.ok(cleaned.includes("Laurel") && cleaned.includes("Poppy") && cleaned.includes("Flannery O'Connor"));
    assert.ok(!cleaned.includes("Laural") && !cleaned.includes("Poppie"));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  assert.strictEqual(levenshtein("Laural", "Laurel"), 1);
  const sugg = suggestNameMismatches("Laural called Poppie. Laural saw Poppie again.", ["Laurel", "Poppy"], { maxDistance: 2, minMentions: 2 });
  assert.strictEqual(sugg.length, 2);
  assert.ok(sugg.some((s) => s.asrToken === "Laural" && s.castName === "Laurel"));
  assert.ok(sugg.some((s) => s.asrToken === "Poppie" && s.castName === "Poppy"));
});

// ── P1.3: GATE 7 Chapter Arcs non-mutation + protection + chapterInterstitial audio + auto-repair ──
test("P1.3: auditChapterArcs does not mutate live scenes, protects told/10x/authored, audio recognizes chapterInterstitial", () => {
  const scenes = [
    { id: "s0", fromFrame: 0, durationFrames: 180, shot: "medium", _authorship: { src: "art" }, props: [] },
    { id: "s1", fromFrame: 180, durationFrames: 180, shot: "medium", chapterInterstitial: { title: "PART 1" }, props: [] },
    { id: "s2", fromFrame: 360, durationFrames: 180, shot: "medium", told: { items: [] }, props: [] },
    { id: "s3", fromFrame: 540, durationFrames: 180, shot: "medium", beforeAfterWipe: { before: { label: "A", headline: "1" }, after: { label: "B", headline: "2" } }, props: [] },
    { id: "s4", fromFrame: 720, durationFrames: 180, shot: "medium", _authorship: { src: "art" }, props: [] },
  ];
  const beforeSnap = JSON.stringify(scenes);
  auditChapterArcs(scenes, [{ t: 0, label: "Opening" }], 30);
  assert.strictEqual(JSON.stringify(scenes), beforeSnap, "auditChapterArcs MUST NOT mutate live scenes");

  // planChapterArcs must not inject lightbulb or shot="split" onto told / fullStage10x / authored
  const planned = JSON.parse(beforeSnap);
  planChapterArcs(planned, [{ t: 0, label: "Opening" }], 30);
  assert.strictEqual(planned[3].shot, "medium", "fullStage10x turnScene must not be forced to shot=split");
  assert.strictEqual(planned[4].props.length, 0, "authored payoffScene must not receive lightbulb prop");

  // Audio director recognizes chapterInterstitial
  const aRes = directAudioEvents(planned, 30);
  assert.ok(aRes.scenes[1].audioEvents.some((e) => e.type === "thud"), "chapterInterstitial must get chapter thud");
  const aAudit = auditAudioDirector(aRes.scenes, 30);
  assert.strictEqual(aAudit.passed, true);

  // autoRepair triggers AUDIO_DIRECTOR after CHAPTER_ARCS and protects authored/10x in HOTSPOT_BREAK
  const rep = autoRepairAntidote({ meta: { fps: 30 }, scenes: JSON.parse(beforeSnap) }, [{ t: 0, label: "Opening" }]);
  assert.ok(rep.config.scenes[1].audioEvents.some((e) => e.type === "thud"));
  assert.strictEqual(rep.config.scenes[4].props.length, 0);
});

// ── P1.4: v2-narrative-lint cold-open dur>150 drought + ComparisonGrid repeat + readcheck 10x keys ──
test("P1.4: v2-narrative-lint catches cold-open 180f drought, ignores real told/CAST actions, catches ComparisonGrid verbatim repeat", () => {
  const rShortDrought = analyzeNarrative({
    meta: { artDirection: toArtDirection("storybookNoir") },
    scenes: [
      { id: "co-180", fromFrame: 0, durationFrames: 180, statSlam: { value: "10 YEARS", label: "Missing" } },
      { id: "co-told", fromFrame: 180, durationFrames: 180, told: { items: [{ id: "a", enter: { at: 60 }, keys: [{ at: 120 }] }] } },
      { id: "cg-dup", fromFrame: 1800, durationFrames: 180, comparisonGrid: { columns: [{ heading: "Myth", bullets: ["Speed beats accuracy every time"], highlight: "Speed beats accuracy every time" }, { heading: "Truth", bullets: ["Clarity wins"] }] } },
    ],
    captions: [],
  });
  assert.ok(rShortDrought.warnings.some((w) => w.includes("co-180") && w.includes("local-action drought")), "dur=180 cold-open drought must trigger now that outer guard is dur>150");
  assert.ok(!rShortDrought.warnings.some((w) => w.includes("co-told") && w.includes("local-action drought")), "told scene with keys at 60/120 must NOT false-trigger drought");
  assert.ok(rShortDrought.warnings.some((w) => w.includes("cg-dup") && w.includes("repeats bullet verbatim")), "ComparisonGrid highlight repeating bullet must warn");

  // readcheck.js includes new visible text keys (thesis, finding, payoff, bullets, points, etc.)
  const rcSrc = fs.readFileSync(path.join(ROOT, "scripts/readcheck.js"), "utf8");
  for (const k of ["detail", "thesis", "synthesis", "finding", "lessonHeadline", "payoff", "beforeDetail", "afterDetail", "verdict", "bullets", "points"]) {
    assert.ok(rcSrc.includes(`"${k}"`), `readcheck.js TENX_TEXT_KEYS missing "${k}"`);
  }
});

// ── P2: make-prompt.js has exactly 1 recentStylePacks definition & layoutGrammar bottom margin calibrated ──
test("P2: make-prompt.js has single recentStylePacks and layoutGrammar capPad >= 196 for mute crop", () => {
  const mpSrc = fs.readFileSync(path.join(ROOT, "scripts/make-prompt.js"), "utf8");
  const defs = mpSrc.match(/function recentStylePacks\(/g) || [];
  assert.strictEqual(defs.length, 1, `expected 1 recentStylePacks definition, got ${defs.length}`);

  const lg = loadTs("src/engines/antidote/components/layoutGrammar.tsx", true);
  const layoutMin = lg.resolveStageLayout({ captions: "minimal", layoutGrammar: "filmFrame" });
  assert.ok(layoutMin.capPad >= 200, `expected filmFrame capPad >= 200 for v1 mute crop compatibility, got ${layoutMin.capPad}`);
});

// ── Review round-2 regressions: dark-mood contrast, real motifs hydration, engineProfile minorHarm, Thumbnail fixes ──
test("Review fixes: dark-mood contrast helpers, Thumbnail TS/scrim/chrome fixes, engineProfile minorHarm & ownIcons hydration", () => {
  const adMod = loadTs("src/engines/antidote/components/artDirection.tsx", true);
  assert.strictEqual(adMod.contrastInkOn("#FDF2F0"), "#111318", "light pill must get dark ink");
  assert.strictEqual(adMod.contrastInkOn("#170B0E"), "#FFFFFF", "dark pill must get white ink");

  const bawSrc = fs.readFileSync(path.join(ROOT, "src/engines/antidote/components/BeforeAfterWipe.tsx"), "utf8");
  assert.ok(bawSrc.includes("contrastInkOn(col)"), "BeforeAfterWipe badge must use contrastInkOn(col)");
  const toldSrc = fs.readFileSync(path.join(ROOT, "src/engines/antidote/components/ToldStage.tsx"), "utf8");
  assert.ok(toldSrc.includes("contrastInkOn(ink)") && toldSrc.includes("tileBg"), "ToldStage emblem & tile must stay legible on dark moods");
  const sceneSrc = fs.readFileSync(path.join(ROOT, "src/engines/antidote/components/Scene.tsx"), "utf8");
  assert.ok(sceneSrc.includes("darkStageMood") && sceneSrc.includes("diagramPaper"), "Scene.tsx must adapt Diagram/Motif ink on dark stageMood");

  const thumbSrc = fs.readFileSync(path.join(ROOT, "src/engines/antidote/Thumbnail.tsx"), "utf8");
  assert.ok(!thumbSrc.includes("fonts.mono"), "Thumbnail.tsx must not reference nonexistent fonts.mono");
  assert.ok(thumbSrc.includes("chromeAccent"), "DiagramHook10x must compute header accent against chromeBg");
  assert.ok(thumbSrc.includes("Math.min(0.76, baseFp.y + 0.1)"), "PosterDrama10x bottom scrim must pan scene UP (larger fp.y)");

  // plan-antidote.js ownIcons hydration uses direct hit.paths (real motifs.json / entities.json shape)
  const planSrc = fs.readFileSync(path.join(ROOT, "scripts/plan-antidote.js"), "utf8");
  assert.ok(planSrc.includes("Array.isArray(hit.paths) && hit.paths.length"), "plan-antidote hydrateSlot must read direct hit.paths from ownIcons()");

  // thumbnail-grammar isMinorHarmBook detects real book.json engineProfile.minorHarm
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mh-gram-"));
  try {
    fs.mkdirSync(path.join(tmpRoot, "books", "mh-demo"), { recursive: true });
    fs.writeFileSync(path.join(tmpRoot, "books", "mh-demo", "book.json"), JSON.stringify({ engine: "antidote", engineProfile: { kind: "fiction", minorHarm: true } }));
    const { isMinorHarmBook } = require("./lib/thumbnail-grammar");
    assert.strictEqual(isMinorHarmBook(tmpRoot, "mh-demo"), true, "isMinorHarmBook must detect book.engineProfile.minorHarm");
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  // cloud-thumbs heroAssets includes cutoutImg and heroFlux default
  const CT = require("./lib/cloud-thumbs");
  const ha = CT.heroAssets({ heroFlux: true, cutoutImg: "scenes/demo/cut.png" }, "demo");
  assert.ok(ha.includes("public/scenes/demo/thumbnail-hero.png") && ha.includes("public/scenes/demo/cut.png"), `unexpected heroAssets: ${ha}`);

  // End-to-end CLI safety test: thumbnail-art-director.js --dry-run on a hostile minorHarm:true book
  // (bedroom / missing girl / knife in bible) must STILL produce 5 fluxPrompts passing validateMinorHarmSafePrompt!
  const slugAd = "_tmp-p3-mh-ad";
  const tmpBookDir = path.join(ROOT, "books", slugAd);
  try {
    fs.mkdirSync(tmpBookDir, { recursive: true });
    fs.writeFileSync(path.join(tmpBookDir, "book.json"), JSON.stringify({
      slug: slugAd, title: "Test Mystery", author: "A. Author", genre: "thriller", engine: "antidote",
      stylePack: "storybookNoir", engineProfile: { kind: "fiction", minorHarm: true },
    }));
    fs.writeFileSync(path.join(tmpBookDir, "youtube-meta.json"), JSON.stringify({
      title: "Test Mystery", author: "A. Author", genre: "thriller",
      chapters: [{ t: 0, label: "The Locked Door" }], description: "A mystery unfolds.", thumbnail: { hook: "TEN YEARS GONE" },
    }));
    fs.writeFileSync(path.join(tmpBookDir, "story-bible.json"), JSON.stringify({
      world: { era: "2015" },
      cast: { c1: { name: "Ellie", look: "a teenage girl in a school uniform", mentions: 50 } },
      places: { p1: { set: "bedroom", look: "a missing girl's dim bedroom with an unmade bed", mentions: 40 } },
      objects: [{ concept: "schoolgirlKnife", mentions: 30 }],
    }));
    const rawOut = execFileSync(process.execPath, [path.join(ROOT, "scripts/thumbnail-art-director.js"), `--slug=${slugAd}`, "--dry-run"], { cwd: ROOT, encoding: "utf8" });
    const parsed = JSON.parse(rawOut.slice(rawOut.indexOf("{\n")));
    assert.strictEqual(parsed.concepts.length, 5);
    for (const c of parsed.concepts) {
      const chk = validateMinorHarmSafePrompt(c.fluxPrompt, { mode: "scene" });
      assert.strictEqual(chk.ok, true, `hostile minorHarm art-director concept ${c.conceptId} leaked forbidden token: ${chk.reasons.join("; ")} | prompt=${c.fluxPrompt}`);
    }

    // antidote-10x-assets.js --dry-run must block a poisoned artLock on minorHarm:true and pass clean storybookNoir
    fs.writeFileSync(path.join(tmpBookDir, "prompts.10x.json"), JSON.stringify({
      slug: slugAd, minorHarm: true, artLock: "editorial gouache, strictly zero people or figures", maxCalls: 25,
      scenes: [{ id: "arch", path: `scenes/${slugAd}/arch.png`, prompt: "Empty ivy-covered stone archway at twilight" }],
    }));
    let blockedDirtyLock = false;
    try {
      execFileSync(process.execPath, [path.join(ROOT, "scripts/antidote-10x-assets.js"), `--slug=${slugAd}`, "--dry-run"], { cwd: ROOT, stdio: "pipe" });
    } catch { blockedDirtyLock = true; }
    assert.strictEqual(blockedDirtyLock, true, "antidote-10x-assets.js must block poisoned minorHarm artLock");

    fs.writeFileSync(path.join(tmpBookDir, "prompts.10x.json"), JSON.stringify({
      slug: slugAd, minorHarm: true, artLock: STYLE_PACKS.storybookNoir.artLock, maxCalls: 25,
      scenes: [{ id: "arch", path: `scenes/${slugAd}/arch.png`, prompt: "Empty ivy-covered stone archway at twilight" }],
    }));
    execFileSync(process.execPath, [path.join(ROOT, "scripts/antidote-10x-assets.js"), `--slug=${slugAd}`, "--dry-run"], { cwd: ROOT, stdio: "pipe" });
  } finally {
    fs.rmSync(tmpBookDir, { recursive: true, force: true });
  }
});

console.log(`\nAll ${passed} Antidote 10x Phase 3 System Improvement tests passed.`);
