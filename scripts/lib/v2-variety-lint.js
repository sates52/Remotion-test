/**
 * v2-variety-lint.js — YPP anti-template variety quota validator for Hybrid Antidote 2.1.
 *
 * Ensures no single visual mode dominates the film, boxed-card layouts stay <= 20%,
 * no mode runs > 2 consecutive scenes without `continueFromPrev: true`, and minimal
 * captions are populated when `artDirection.captions === "minimal"`.
 */

function classifySceneMode(scene) {
  if (!scene || typeof scene !== "object") return "unknown";
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

function analyzeVariety(config) {
  const scenes = Array.isArray(config?.scenes) ? config.scenes : [];
  const total = scenes.length;
  const counts = {};
  let maxConsecutive = 0;
  let curMode = null;
  let curRun = 0;
  let coStagedCount = 0;
  let continuityCount = 0;

  for (const s of scenes) {
    const mode = classifySceneMode(s);
    counts[mode] = (counts[mode] || 0) + 1;
    if (s.continueFromPrev) continuityCount++;
    if ((s.visualEquation || s.dataMatrix || s.realAnchor) && Array.isArray(s.characters) && s.characters.length > 0) {
      coStagedCount++;
    }
    if (mode === curMode && !s.continueFromPrev) {
      curRun++;
    } else {
      curMode = mode;
      curRun = 1;
    }
    if (curRun > maxConsecutive) maxConsecutive = curRun;
  }

  const shares = {};
  for (const [k, v] of Object.entries(counts)) {
    shares[k] = total ? v / total : 0;
  }

  const castCount = config?.meta?.cast ? Object.keys(config.meta.cast).length : 0;
  return { total, counts, shares, maxConsecutive, coStagedCount, continuityCount, castCount };
}

function assertVariety(config) {
  const stats = analyzeVariety(config);
  const errors = [];
  if (stats.total === 0) errors.push("config has 0 scenes");
  if ((stats.shares["boxed-card"] || 0) > 0.20) {
    errors.push(`boxed-card share ${(stats.shares["boxed-card"] * 100).toFixed(1)}% exceeds 20% YPP limit`);
  }
  for (const [mode, share] of Object.entries(stats.shares)) {
    const limit = mode === "live-story" ? 0.65 : 0.35;
    if (share > limit) {
      errors.push(`mode "${mode}" share ${(share * 100).toFixed(1)}% exceeds ${(limit * 100).toFixed(0)}% limit`);
    }
  }
  if (stats.maxConsecutive > 2) {
    errors.push(`maxConsecutive=${stats.maxConsecutive} exceeds 2 without continueFromPrev`);
  }
  if (config?.meta?.artDirection?.captions === "minimal" && (!Array.isArray(config.captions) || config.captions.length === 0)) {
    errors.push(`artDirection.captions === "minimal" but config.captions is empty`);
  }
  if (errors.length) {
    const err = new Error(`Variety quota failed:\n  - ${errors.join("\n  - ")}`);
    err.stats = stats;
    throw err;
  }
  return stats;
}

module.exports = { classifySceneMode, analyzeVariety, assertVariety };
