/**
 * thumbHero.ts — choose which of a book's own scenes becomes its thumbnail.
 *
 * Deterministic, no LLM: 3-tier scoring for "reads as a bold visual hero at
 * 168px AND is about what the hook promises":
 *   - Explicit override: `sceneId` (thumbnail.grammar.sceneId) or `scene.thumbnailHero: true`
 *   - Tier A (+10): Visual Hero devices (hookPoster, annotatedScene, cutoutStage,
 *     editorialSpread, upClose, image/svg-backed beforeAfterWipe / evidenceBoard / comicStrip)
 *   - Tier B (+7..+9): Dramatic Story / Character / Drawn moments (twoShot + loud
 *     expression, customSvg props, drawn told stages, illustration shots) and
 *     secondary visual 10x devices (+3)
 *   - Tier C (-12): Micro-text slides that blur into unreadable noise at 168px
 *     (timelineScrub, stackReveal, liveInterface, kineticManifesto, dataMatrix,
 *     decisionTree, cohortGrid, statSlam, quoteDialogue, bookBlueprint,
 *     mechanismChain, imageless comparisonGrid / beforeAfterWipe / spatialJourney)
 */
import type { SceneSpec } from "./schema";

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "you", "your",
  "why", "who", "what", "how", "this", "that", "was", "his", "her", "their",
  "its", "it", "be", "not", "no", "vs",
  "look", "see", "make", "making", "get", "getting", "take", "taking", "come", "coming",
  "go", "going", "know", "think", "say", "want", "give", "giving",
  "never", "always", "nobody", "everyone",
]);
const WIDE_SHOTS = new Set(["medium", "twoShot", "lowAngle", "overShoulder", "diorama", "silhouette"]);
const LOUD_FACES = new Set(["worried", "shocked", "angry", "sad", "scared", "surprised", "determined", "focused"]);

/** Tier A: always visual-hero full-stage 10x devices. */
const TIER_A_VISUAL_DEVICES = new Set([
  "hookPoster",
  "annotatedScene",
  "cutoutStage",
  "editorialSpread",
  "upClose",
]);

/** Hybrid devices that promote to Tier A when backed by an image or customSvg, else Tier C. */
const IMAGE_PROMOTABLE_DEVICES = new Set([
  "beforeAfterWipe",
  "evidenceBoard",
  "comicStrip",
]);

/** Secondary visual 10x devices (clean geometric / physical metaphors, +3). */
const SECONDARY_VISUAL_DEVICES = new Set([
  "balanceScale",
  "vennMerge",
  "explodedView",
  "barRace",
  "analyticsFunnel",
  "gravityPile",
  "crumpleToss",
  "realAnchor",
  "visualEquation",
]);

/** Tier C: micro-text / dense-label slides that fail at 168px browse size (-12). */
const TIER_C_MICRO_TEXT_DEVICES = new Set([
  "timelineScrub",
  "stackReveal",
  "liveInterface",
  "kineticManifesto",
  "dataMatrix",
  "decisionTree",
  "cohortGrid",
  "statSlam",
  "quoteDialogue",
  "bookBlueprint",
  "mechanismChain",
  "comparisonGrid",
  "spatialJourney",
]);

const ALL_TENX_DEVICES = [
  ...TIER_A_VISUAL_DEVICES,
  ...IMAGE_PROMOTABLE_DEVICES,
  ...SECONDARY_VISUAL_DEVICES,
  ...TIER_C_MICRO_TEXT_DEVICES,
];

export function tenxDeviceOf(scene: SceneSpec): string | null {
  const s = scene as Record<string, unknown>;
  for (const k of ALL_TENX_DEVICES) if (s[k] != null) return k;
  return null;
}

const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");
const stem = (w: string) => cleanWord(w).replace(/(ing|ed|es|s)$/, "");

function isStopWord(raw: string): boolean {
  const c = cleanWord(raw);
  const st = stem(raw);
  return !c || c.length <= 2 || STOP.has(c) || STOP.has(st);
}

function hasCustomSvgValue(val: unknown): boolean {
  if (!val) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (typeof val === "object") {
    const paths = (val as { paths?: unknown }).paths;
    return Array.isArray(paths) && paths.length > 0;
  }
  return false;
}

function hasVisualArt(spec: unknown): boolean {
  if (!spec || typeof spec !== "object") return false;
  const o = spec as Record<string, unknown>;
  if (typeof o.image === "string" && o.image.trim()) return true;
  if (typeof o.bgImage === "string" && o.bgImage.trim()) return true;
  if (typeof o.beforeImage === "string" && o.beforeImage.trim()) return true;
  if (typeof o.afterImage === "string" && o.afterImage.trim()) return true;
  if (hasCustomSvgValue(o.customSvg) || hasCustomSvgValue(o.beforeCustomSvg) || hasCustomSvgValue(o.afterCustomSvg)) return true;
  if (o.before && typeof o.before === "object" && hasVisualArt(o.before)) return true;
  if (o.after && typeof o.after === "object" && hasVisualArt(o.after)) return true;
  for (const arrKey of ["panels", "cards", "columns", "stops", "items", "events", "nodes"]) {
    const arr = o[arrKey];
    if (Array.isArray(arr) && arr.some((item) => item && typeof item === "object" && (
      (typeof (item as Record<string, unknown>).image === "string" && String((item as Record<string, unknown>).image).trim()) ||
      hasCustomSvgValue((item as Record<string, unknown>).customSvg)
    ))) {
      return true;
    }
  }
  return false;
}

function hasCustomSvgProp(scene: SceneSpec): boolean {
  return (scene.props ?? []).some((p) => hasCustomSvgValue((p as Record<string, unknown>).customSvg));
}

function hasDrawnTold(scene: SceneSpec): boolean {
  const s = scene as Record<string, unknown>;
  if (!s.told || typeof s.told !== "object") return false;
  const t = s.told as Record<string, unknown>;
  return Boolean(
    t.frame || t.subject || t.visual || t.customSvg ||
    (Array.isArray(t.actors) && t.actors.length > 0) ||
    (Array.isArray(t.items) && t.items.length > 0) ||
    (Array.isArray(t.events) && t.events.length > 0) ||
    Object.keys(t).length > 0,
  );
}

export function heroSceneScore(scene: SceneSpec, index: number, total: number, hookStems: string[], _prefer10x = false): number {
  const s = scene as SceneSpec & { _narration?: string; concept?: string; thumbnailHero?: boolean; told?: unknown };
  if (s.shot === "chapterCard" || s.chapterCard || s.chapterInterstitial) return -Infinity;
  const bodies = (s.characters ?? []).filter((c) => !(c.crowd && c.crowd > 1));
  const hasLoudFace = bodies.some((c) => LOUD_FACES.has(String(c.expression)));
  const dev = tenxDeviceOf(scene);
  const devSpec = dev ? (s as Record<string, unknown>)[dev] : null;
  let score = 0;

  if (s.thumbnailHero === true) score += 100;

  if (dev) {
    if (TIER_A_VISUAL_DEVICES.has(dev)) {
      score += 10;
    } else if (IMAGE_PROMOTABLE_DEVICES.has(dev)) {
      score += hasVisualArt(devSpec) ? 10 : -12;
    } else if (dev === "comparisonGrid" || dev === "spatialJourney") {
      score += hasVisualArt(devSpec) ? 3 : -12;
    } else if (SECONDARY_VISUAL_DEVICES.has(dev)) {
      score += 3;
    } else if (TIER_C_MICRO_TEXT_DEVICES.has(dev)) {
      score -= 12;
    }
  } else {
    // Tier B: Story / Character / Custom Drawing / Drawn Told (no penalty on bodies even in 10x books).
    if (s.shot === "twoShot" && hasLoudFace) {
      score += 9;
    } else if (hasCustomSvgProp(scene)) {
      score += 8;
    } else if (hasDrawnTold(scene)) {
      score += 8;
    } else if (s.shot === "illustration") {
      score += 7;
    } else {
      if (bodies.length >= 1) score += 3;
      if (bodies.length === 2) score += 1.5;
      if (bodies.length >= 3) score -= 1;
    }
    if (hasLoudFace) score += 1;
  }

  // A real location reads as "a place in this story"; abstract/none is wallpaper.
  if (s.bg?.set && s.bg.set !== "none" && s.bg.set !== "abstract") score += 2;
  if ((s.props ?? []).length) score += 1;
  if (s.diagram) score -= 3;
  if (WIDE_SHOTS.has(s.shot as string)) score += 1.5;
  else if (s.shot === "illustration") score += 0.5;
  const at = index / Math.max(1, total);
  if (at >= 0.1 && at <= 0.65) score += 1; // skip the cold open and the ending (spoilers)
  if (s.durationFrames >= 90) score += 0.5;
  if (hookStems.length) {
    const said = new Set(`${s._narration ?? ""} ${s.concept ?? ""}`.split(/\s+/).map(stem).filter(Boolean));
    score += 2 * hookStems.filter((h) => said.has(h)).length;
  }
  return score;
}

/** Normalized [0..1, 0..1] visual focal point of a scene for zero-letterbox cover framing. */
export function focalPointOf(scene?: SceneSpec | null): { x: number; y: number } {
  if (!scene) return { x: 0.5, y: 0.48 };
  const s = scene as Record<string, unknown>;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const normCoord = (v: number, span: number) => (v > 1 ? v / span : v);

  if (s.annotatedScene && typeof s.annotatedScene === "object") {
    const ann = s.annotatedScene as {
      spotlights?: Array<{ cx?: number; cy?: number }>;
      callouts?: Array<{ x?: number; y?: number }>;
    };
    if (Array.isArray(ann.spotlights) && ann.spotlights.length > 0) {
      const xs = ann.spotlights.map((c) => (typeof c.cx === "number" ? normCoord(c.cx, 1920) : 0.5));
      const ys = ann.spotlights.map((c) => (typeof c.cy === "number" ? normCoord(c.cy, 1080) : 0.46));
      return {
        x: clamp(xs.reduce((a, b) => a + b, 0) / xs.length, 0.25, 0.75),
        y: clamp(ys.reduce((a, b) => a + b, 0) / ys.length, 0.25, 0.7),
      };
    }
    if (Array.isArray(ann.callouts) && ann.callouts.length > 0) {
      const xs = ann.callouts.map((c) => (typeof c.x === "number" ? normCoord(c.x, 1920) : 0.5));
      const ys = ann.callouts.map((c) => (typeof c.y === "number" ? normCoord(c.y, 1080) : 0.46));
      return {
        x: clamp(xs.reduce((a, b) => a + b, 0) / xs.length, 0.25, 0.75),
        y: clamp(ys.reduce((a, b) => a + b, 0) / ys.length, 0.25, 0.7),
      };
    }
    return { x: 0.5, y: 0.45 };
  }

  if (s.cutoutStage && typeof s.cutoutStage === "object") {
    const cs = s.cutoutStage as { actors?: Array<{ x?: number; y?: number }>; side?: string };
    if (Array.isArray(cs.actors) && cs.actors.length > 0) {
      const xs = cs.actors.map((a) => (typeof a.x === "number" ? normCoord(a.x, 1920) : 0.5));
      const ys = cs.actors.map((a) => (typeof a.y === "number" ? normCoord(a.y, 1080) : 0.54));
      return {
        x: clamp(xs.reduce((a, b) => a + b, 0) / xs.length, 0.24, 0.76),
        y: clamp(ys.reduce((a, b) => a + b, 0) / ys.length - 0.08, 0.28, 0.64),
      };
    }
    return { x: cs.side === "left" ? 0.34 : cs.side === "right" ? 0.66 : 0.5, y: 0.44 };
  }

  if (s.upClose && typeof s.upClose === "object") {
    const zt = (s.upClose as { zoomTarget?: { x?: number; y?: number } }).zoomTarget;
    if (zt && typeof zt.x === "number" && typeof zt.y === "number") {
      return {
        x: clamp(normCoord(zt.x, 1920), 0.22, 0.78),
        y: clamp(normCoord(zt.y, 1080), 0.22, 0.76),
      };
    }
    return { x: 0.5, y: 0.46 };
  }

  if (s.hookPoster || s.editorialSpread) {
    return { x: 0.5, y: 0.46 };
  }

  const bodies = (scene.characters ?? []).filter((c) => !(c.crowd && c.crowd > 1));
  if (bodies.length > 0) {
    const xs = bodies.map((c) => (typeof c.x === "number" ? normCoord(c.x, 1920) : 0.5));
    const ys = bodies.map((c) => (typeof c.y === "number" ? normCoord(c.y, 1080) : 0.64));
    const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
    // Characters' anchor y is near feet/lower-torso; shift upward onto faces & upper shoulders.
    return { x: clamp(avgX, 0.24, 0.76), y: clamp(avgY - 0.1, 0.32, 0.62) };
  }

  if (s.told) return { x: 0.5, y: 0.48 };
  return { x: 0.5, y: 0.48 };
}

/** What a viewer would call "the same picture": same 10x device, distinct told stage, OR same set + same cast. */
const pictureKey = (s: SceneSpec) => {
  const dev = tenxDeviceOf(s);
  if (dev) return `10x|${dev}`;
  const rec = s as Record<string, unknown>;
  if (rec.told && typeof rec.told === "object") {
    return `told|${String(rec.concept ?? s.id ?? "stage")}`;
  }
  return `${s.bg?.set ?? "none"}|${(s.characters ?? []).map((c) => c.role ?? c.identity ?? "?").sort().join(",")}`;
};

/**
 * The top `n` hero scenes, each a DIFFERENT picture (10x device OR told OR set + cast), best first.
 * Index 0 is the thumbnail; 1..n-1 feed the Test & Compare variants so the
 * A/B test compares moments, not just typography. `sceneId` pins index 0.
 */
export function pickHeroScenes(scenes: SceneSpec[] | undefined, hook: string, sceneId?: string, n = 3): SceneSpec[] {
  if (!scenes?.length) return [];
  const prefer10x = scenes.some((s) => tenxDeviceOf(s) !== null);
  const hookStems = hook.split(/\s+/).filter((w) => !isStopWord(w)).map(stem).filter((w) => w.length > 2 && !STOP.has(w));
  const ranked = scenes
    .map((s, i) => ({ s, sc: heroSceneScore(s, i, scenes.length, hookStems, prefer10x), i }))
    .filter((x) => Number.isFinite(x.sc))
    .sort((a, b) => b.sc - a.sc || a.i - b.i)
    .map((x) => x.s);
  const pinned = sceneId ? scenes.find((s) => s.id === sceneId) : undefined;
  const out: SceneSpec[] = pinned ? [pinned] : [];
  const seen = new Set(out.map(pictureKey));
  for (const s of ranked) {
    if (out.length >= n) break;
    if (seen.has(pictureKey(s))) continue;
    seen.add(pictureKey(s));
    out.push(s);
  }
  return out;
}

export function pickHeroScene(scenes: SceneSpec[] | undefined, hook: string, sceneId?: string): SceneSpec | undefined {
  return pickHeroScenes(scenes, hook, sceneId, 1)[0];
}

/** Thumb-<slug> composition length — must exceed any freeze frame (Remotion clamps the frame to it). */
export const THUMB_FREEZE_SPAN = 300;

/** The frame to freeze: late enough that every draw-in and entrance has landed. */
export const heroFreezeFrame = (scene: SceneSpec): number => {
  const ratio = tenxDeviceOf(scene) ? 0.82 : 0.6;
  return Math.max(0, Math.min(scene.durationFrames - 1, THUMB_FREEZE_SPAN - 1, Math.max(45, Math.round(scene.durationFrames * ratio))));
};
