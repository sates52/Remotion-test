/**
 * thumbHero.ts — choose which of a book's own scenes becomes its thumbnail.
 *
 * Deterministic, no LLM: score every scene for "reads as a picture at 168px
 * AND is about what the hook promises", pick the best. The hook-word match is
 * the relevance guard — the frame shown is one where the narration actually
 * talks about the thing the thumbnail sells, so the click lands on its promise.
 * `sceneId` (thumbnail.grammar.sceneId) overrides.
 */
import type { SceneSpec } from "./schema";

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "you", "your", "why", "who", "what", "how", "this", "that", "was", "his", "her", "their", "its", "it", "be", "not", "no", "vs"]);
const WIDE_SHOTS = new Set(["medium", "twoShot", "lowAngle", "overShoulder", "diorama", "silhouette"]);
const LOUD_FACES = new Set(["worried", "shocked", "angry", "sad", "scared", "surprised", "determined", "focused"]);

const stem = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "").replace(/(ing|ed|es|s)$/, "");

export function heroSceneScore(scene: SceneSpec, index: number, total: number, hookStems: string[]): number {
  const s = scene as SceneSpec & { _narration?: string; concept?: string };
  if (s.shot === "chapterCard" || s.chapterCard) return -Infinity;
  const bodies = (s.characters ?? []).filter((c) => !(c.crowd && c.crowd > 1));
  let score = 0;
  if (bodies.length >= 1) score += 3;
  if (bodies.length === 2) score += 1.5;
  if (bodies.length >= 3) score -= 1;
  // A real location reads as "a place in this story"; abstract/none is wallpaper.
  if (s.bg?.set && s.bg.set !== "none" && s.bg.set !== "abstract") score += 2;
  if ((s.props ?? []).length) score += 1;
  if (s.diagram) score -= 3;
  if (WIDE_SHOTS.has(s.shot as string)) score += 1.5;
  else if (s.shot === "illustration") score += 0.5;
  if (bodies.some((c) => LOUD_FACES.has(String(c.expression)))) score += 1;
  const at = index / Math.max(1, total);
  if (at >= 0.1 && at <= 0.65) score += 1; // skip the cold open and the ending (spoilers)
  if (s.durationFrames >= 90) score += 0.5;
  if (hookStems.length) {
    const said = new Set(`${s._narration ?? ""} ${s.concept ?? ""}`.split(/\s+/).map(stem));
    score += 2 * hookStems.filter((h) => said.has(h)).length;
  }
  return score;
}

export function pickHeroScene(scenes: SceneSpec[] | undefined, hook: string, sceneId?: string): SceneSpec | undefined {
  if (!scenes?.length) return undefined;
  if (sceneId) {
    const hit = scenes.find((s) => s.id === sceneId);
    if (hit) return hit;
  }
  const hookStems = hook.split(/\s+/).map(stem).filter((w) => w.length > 2 && !STOP.has(w));
  let best: SceneSpec | undefined;
  let bestScore = -Infinity;
  scenes.forEach((s, i) => {
    const sc = heroSceneScore(s, i, scenes.length, hookStems);
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    }
  });
  return best;
}

/** Thumb-<slug> composition length — must exceed any freeze frame (Remotion clamps the frame to it). */
export const THUMB_FREEZE_SPAN = 300;

/** The frame to freeze: late enough that every draw-in and entrance has landed. */
export const heroFreezeFrame = (scene: SceneSpec): number =>
  Math.max(0, Math.min(scene.durationFrames - 1, THUMB_FREEZE_SPAN - 1, Math.max(45, Math.round(scene.durationFrames * 0.6))));
