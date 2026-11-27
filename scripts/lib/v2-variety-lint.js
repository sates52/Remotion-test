/**
 * v2-variety-lint.js — YPP anti-template, genre-aware quota & Single-World validator for Antidote 10x.
 *
 * Ensures:
 *  1. Genre & minorHarm-aware visual quotas:
 *     - Non-fiction (minorHarm: false): live-story <= 65%, textHeavy10x <= 25%, boxed-card <= 20%, other modes <= 35%.
 *     - Fiction (kind === "fiction") / minorHarm: true: live-story <= 80%, textHeavy10x <= 20%, boxed-card <= 20%,
 *       other modes <= 35%. Consecutive pacing distinguishes live-story sub-modes (`CAST:twoShot`, `TOLD`,
 *       `CAST:illustration`, `CAST:medium`, etc.) while still forbidding > 2 identical shot+place beats.
 *  2. No mode runs > 2 consecutive scenes without `continueFromPrev: true`.
 *  3. Minimal captions are populated when `artDirection.captions === "minimal"`.
 *  4. Single-World rule: flat-vector `characters` NEVER collide with full-stage 10x devices, `bg.image` lacking
 *     `emptyStage: true`, or `castMode === "illustrated"`. On `minorHarm: true` books, `cutoutStage` is forbidden.
 */

const { ALWAYS_FULL_STAGE_10X_KEYS } = require("./antidote-10x-keys");

const PURE_TEXT_HEAVY_10X = [
  "kineticManifesto",
  "quoteDialogue",
  "stackReveal",
  "liveInterface",
  "bookBlueprint",
  "timelineScrub",
  "decisionTree",
  "mechanismChain",
];

function hasVisualSlot(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.image === "string" && obj.image.trim()) return true;
  if (typeof obj.icon === "string" && obj.icon.trim()) return true;
  if (obj.customSvg && (typeof obj.customSvg === "string" ? obj.customSvg.trim() : Array.isArray(obj.customSvg.paths) && obj.customSvg.paths.length > 0)) return true;
  return false;
}

/** True when a 10x scene is primarily a text slide without pictorial / SVG drawing content. */
function isTextHeavy10x(scene) {
  if (!scene || typeof scene !== "object") return false;
  if (PURE_TEXT_HEAVY_10X.some((k) => {
    if (!scene[k]) return false;
    if (k === "timelineScrub") {
      const ts = scene.timelineScrub;
      if (hasVisualSlot(ts) || (Array.isArray(ts.events) && ts.events.some(hasVisualSlot))) return false;
    }
    return true;
  })) {
    return true;
  }
  if (scene.comparisonGrid) {
    const cols = Array.isArray(scene.comparisonGrid.columns) ? scene.comparisonGrid.columns : [];
    if (!cols.some(hasVisualSlot)) return true;
  }
  if (scene.beforeAfterWipe) {
    if (!hasVisualSlot(scene.beforeAfterWipe.before) && !hasVisualSlot(scene.beforeAfterWipe.after)) return true;
  }
  if (scene.evidenceBoard) {
    if (!hasVisualSlot(scene.evidenceBoard)) return true;
  }
  if (scene.comicStrip) {
    const panels = Array.isArray(scene.comicStrip.panels) ? scene.comicStrip.panels : [];
    if (!panels.some((p) => hasVisualSlot(p))) return true;
  }
  return false;
}

function classifySceneMode(scene) {
  if (!scene || typeof scene !== "object") return "unknown";
  if (scene.annotatedScene) return "annotated-scene";
  if (scene.cohortGrid) return "cohort-grid";
  if (scene.timelineScrub) return "timeline-scrub";
  if (scene.statSlam) return "stat-slam";
  if (scene.cutoutStage) return "cutout-stage";
  if (scene.editorialSpread) return "editorial-spread";
  if (scene.kineticManifesto) return "kinetic-manifesto";
  if (scene.decisionTree) return "decision-tree";
  if (scene.balanceScale) return "balance-scale";
  if (scene.stackReveal) return "stack-reveal";
  if (scene.liveInterface) return "live-interface";
  if (scene.comicStrip) return "comic-strip";
  if (scene.beforeAfterWipe) return "before-after-wipe";
  if (scene.spatialJourney) return "spatial-journey";
  if (scene.chapterInterstitial) return "chapter-interstitial";
  if (scene.vennMerge) return "venn-merge";
  if (scene.explodedView) return "exploded-view";
  if (scene.gravityPile) return "gravity-pile";
  if (scene.crumpleToss) return "crumple-toss";
  if (scene.analyticsFunnel) return "analytics-funnel";
  if (scene.barRace) return "bar-race";
  if (scene.upClose) return "up-close";
  if (scene.bookBlueprint) return "book-blueprint";
  if (scene.mechanismChain) return "mechanism-chain";
  if (scene.evidenceBoard) return "evidence-board";
  if (scene.quoteDialogue) return "quote-dialogue";
  if (scene.hookPoster) return "hook-poster";
  if (scene.comparisonGrid) {
    return scene.comparisonGrid.layout === "fullBleedSplit"
      ? "full-bleed-split"
      : scene.comparisonGrid.layout === "borderless"
        ? "borderless-comparison"
        : "boxed-card";
  }
  if (scene.visualEquation) {
    return scene.visualEquation.layout === "borderless" ? "borderless-equation" : "boxed-card";
  }
  if (scene.dataMatrix) return "data-matrix";
  if (scene.realAnchor) return "real-anchor";
  if (scene.told || (Array.isArray(scene.characters) && scene.characters.length > 0) || (Array.isArray(scene.props) && scene.props.length > 0)) {
    return "live-story";
  }
  if (scene.bg && scene.bg.image) return "full-bleed-hero";
  return "live-story";
}

/** Sub-mode key for fiction / minorHarm consecutive pacing (distinguishes twoShot, told, illustration, medium). */
function classifyPacingKey(scene, mode, storyMode) {
  if (!storyMode || mode !== "live-story") return mode;
  if (scene.told) return "TOLD";
  const shot = scene.shot || "medium";
  return `CAST:${shot}`;
}

function resolveGenreContext(config, opts = {}) {
  const book = opts.book || {};
  const kind = book.kind || book.profile?.kind || config?.meta?.kind || null;
  const minorHarm = Boolean(
    opts.minorHarm === true ||
    book.minorHarm === true ||
    book.profile?.minorHarm === true ||
    config?.meta?.artDirection?.castMode === "vectorRig",
  );
  const isFiction = kind === "fiction";
  const storyMode = isFiction || minorHarm;
  return { kind, minorHarm, isFiction, storyMode };
}

function analyzeVariety(config, opts = {}) {
  const scenes = Array.isArray(config?.scenes) ? config.scenes : [];
  const total = scenes.length;
  const ctx = resolveGenreContext(config, opts);
  const counts = {};
  let maxConsecutive = 0;
  let maxIdenticalShotPlace = 0;
  let curMode = null;
  let curRun = 0;
  let curShotPlace = null;
  let curShotPlaceRun = 0;
  let coStagedCount = 0;
  let continuityCount = 0;
  let intentCount = 0;
  let singleWorldViolations = 0;
  let textHeavy10xCount = 0;

  for (const s of scenes) {
    const mode = classifySceneMode(s);
    counts[mode] = (counts[mode] || 0) + 1;
    if (isTextHeavy10x(s)) textHeavy10xCount++;
    if (s.continueFromPrev) continuityCount++;
    if (s.shotIntent) intentCount++;
    const hasChars = Array.isArray(s.characters) && s.characters.length > 0;
    if ((s.visualEquation || s.dataMatrix || s.realAnchor) && hasChars) {
      coStagedCount++;
    }
    if (hasChars && s.bg?.image && s.bg.image.emptyStage !== true) {
      singleWorldViolations++;
    }
    if (hasChars && ALWAYS_FULL_STAGE_10X_KEYS.some((k) => s[k] != null)) {
      singleWorldViolations++;
    }
    if (ctx.minorHarm && s.cutoutStage) {
      singleWorldViolations++;
    }

    const pacingKey = classifyPacingKey(s, mode, ctx.storyMode);
    if (pacingKey === curMode && !s.continueFromPrev) {
      curRun++;
    } else {
      curMode = pacingKey;
      curRun = 1;
    }
    if (curRun > maxConsecutive) maxConsecutive = curRun;

    const shotPlace = mode === "live-story" && !s.told
      ? `${s.shot || "medium"}|${s.bg?.set || "none"}`
      : null;
    if (shotPlace && shotPlace === curShotPlace && !s.continueFromPrev) {
      curShotPlaceRun++;
    } else {
      curShotPlace = shotPlace;
      curShotPlaceRun = shotPlace ? 1 : 0;
    }
    if (curShotPlaceRun > maxIdenticalShotPlace) maxIdenticalShotPlace = curShotPlaceRun;
  }

  const shares = {};
  for (const [k, v] of Object.entries(counts)) {
    shares[k] = total ? v / total : 0;
  }
  const textHeavy10xShare = total ? textHeavy10xCount / total : 0;

  const castCount = config?.meta?.cast ? Object.keys(config.meta.cast).length : 0;
  return {
    total,
    counts,
    shares,
    textHeavy10xCount,
    textHeavy10xShare,
    maxConsecutive,
    maxIdenticalShotPlace,
    coStagedCount,
    continuityCount,
    intentCount,
    singleWorldClean: singleWorldViolations === 0,
    singleWorldViolations,
    castCount,
    genreContext: ctx,
  };
}

function assertVariety(config, opts = {}) {
  const scenes = Array.isArray(config?.scenes) ? config.scenes : [];
  const stats = analyzeVariety(config, opts);
  const ctx = stats.genreContext;
  const errors = [];
  if (stats.total === 0) errors.push("config has 0 scenes");
  for (const s of scenes) {
    const hasChars = Array.isArray(s.characters) && s.characters.length > 0;
    if (hasChars && s.bg?.image && s.bg.image.emptyStage !== true) {
      errors.push(`Single-World violation in ${s.id}: characters cannot be placed over bg.image without emptyStage: true`);
    }
    if (hasChars && ALWAYS_FULL_STAGE_10X_KEYS.some((k) => s[k] != null)) {
      errors.push(`Single-World violation in ${s.id}: full-stage 10x device cannot mix flat-vector characters`);
    }
    if (hasChars && config?.meta?.artDirection?.castMode === "illustrated") {
      errors.push(`Single-World violation in ${s.id}: castMode "illustrated" cannot mix flat-vector Everyman characters`);
    }
    if (ctx.minorHarm && s.cutoutStage) {
      errors.push(`Single-World violation in ${s.id}: cutoutStage is forbidden on minorHarm books`);
    }
  }
  if ((stats.shares["boxed-card"] || 0) > 0.20) {
    errors.push(`boxed-card share ${(stats.shares["boxed-card"] * 100).toFixed(1)}% exceeds 20% YPP limit`);
  }
  const liveStoryLimit = ctx.storyMode ? 0.80 : 0.65;
  const textHeavyLimit = ctx.storyMode ? 0.20 : 0.25;
  for (const [mode, share] of Object.entries(stats.shares)) {
    const limit = mode === "live-story" ? liveStoryLimit : 0.35;
    if (share > limit) {
      errors.push(`mode "${mode}" share ${(share * 100).toFixed(1)}% exceeds ${(limit * 100).toFixed(0)}% limit`);
    }
  }
  if (stats.textHeavy10xShare > textHeavyLimit) {
    errors.push(`textHeavy10x share ${(stats.textHeavy10xShare * 100).toFixed(1)}% exceeds ${(textHeavyLimit * 100).toFixed(0)}% anti-text-slide limit`);
  }
  if (stats.maxConsecutive > 2) {
    errors.push(`maxConsecutive=${stats.maxConsecutive} exceeds 2 without continueFromPrev`);
  }
  if (stats.maxIdenticalShotPlace > 2) {
    errors.push(`maxIdenticalShotPlace=${stats.maxIdenticalShotPlace} exceeds 2 identical shot+place scenes without continueFromPrev`);
  }
  if (config?.meta?.artDirection?.captions === "minimal" && (!Array.isArray(config.captions) || config.captions.length === 0)) {
    errors.push(`artDirection.captions === "minimal" but config.captions is empty`);
  }
  if (errors.length) {
    const err = new Error(`Variety/Single-World check failed:\n  - ${errors.join("\n  - ")}`);
    err.stats = stats;
    throw err;
  }
  return stats;
}

module.exports = { classifySceneMode, isTextHeavy10x, analyzeVariety, assertVariety };
