/**
 * told-apply.js — put compiled told stages into a film config (Film Flow 2, 2026-11-14).
 *
 *   applyTold(config, toldByScene, entities) → { config, report }
 *     toldByScene: { "<scene id>": { stage?, events? } }  (what the author wrote for that beat)
 *
 * For every scene that has a told beat: its narration words are taken from the film's own captions (frames relative
 * to the scene), the stage is compiled (lib/told-compile.js) and written to `scene.told`; the figure-and-text staging
 * of that scene is set aside under `scene._beforeTold` (nothing an author wrote is lost — the stage REPLACES the
 * picture only where the film's flow level draws it), consecutive told scenes are one stage (a 0-frame cut), and the
 * film's `meta.flow` is raised to 2. A compile error leaves that scene exactly as it was and is reported — a film is
 * never half-told by accident. Pure given its inputs; the caller writes the file.
 */
const { compileTold } = require("./told-compile");
const { resolveLook } = require("./own-drawings");

/**
 * ONE PERSON, ONE HEAD (Film Flow 5). A person the lead agent drew a head for (entities.json look.drawn) who is also
 * in the film's cast under the same id wears that look in EVERY scene — the told stages and the figure scenes between
 * them — or the film would show two different people under one name. The cast as planned is kept under
 * meta._castBeforeTold (revertTold puts it back). A book without a drawn head: nothing changes.
 */
function castHeads(meta, entities, palette) {
  const cast = (meta && meta.cast) || null, before = {}, next = { ...(cast || {}) };
  if (!cast) return { meta, heads: [] };
  for (const [id, e] of Object.entries(entities || {})) {
    if (!e || e.kind !== "person" || !e.look || !e.look.drawn || !cast[id]) continue;
    before[id] = cast[id];
    next[id] = { ...cast[id], variant: { ...(cast[id].variant || {}), ...resolveLook(e.look, palette) } };
  }
  const heads = Object.keys(before);
  return heads.length ? { meta: { ...meta, cast: next, _castBeforeTold: { ...(meta._castBeforeTold || {}), ...before } }, heads } : { meta, heads };
}

/** The words said during a scene, as frames from the scene's start. */
function sceneWords(config, scene) {
  const a = scene.fromFrame, b = a + scene.durationFrames, out = [];
  let last = null;
  for (const c of config.captions || []) {
    if (c.endFrame <= a || c.startFrame >= b) continue;
    for (const w of c.words || []) {
      if (w.s < a || w.s >= b) continue;
      if (last && w.s < last.e && w.w === last.w) continue; // a word repeated at a caption break
      out.push({ w: w.w, f: w.s - a }); last = w;
    }
  }
  return out;
}

const crypto = require("crypto");
const stageHash = (stage) => crypto.createHash("sha256").update(JSON.stringify(stage)).digest("hex").slice(0, 16);

/**
 * The told stage IS the beat's authored decision (as lib/single-relation.js sealAuthored does for its contracts):
 * the authorship lock is rewritten to what is on screen now — nobody from the cast, no icon prop, no callout — so
 * make-book's restoreAuthoredStaging keeps the stage instead of putting the old figures back, and gate-authorship
 * checks the scene against it. The planner's lock stays as `previousLock`. The VisualContract's staging side (which
 * figures must be on screen, which lever represents the idea) described the picture that was replaced: it is rebound;
 * its narration side is untouched.
 */
function sealTold(scene) {
  const a = scene._authorship;
  const provenance = { v: scene.told.v || 1, hash: stageHash(scene.told), items: scene.told.items.length };
  const out = { ...scene };
  if (a) {
    const old = a.src === "told" ? a.previousLock || null : a.lock || null;
    const lock = { planShot: scene.shot, shot: scene.shot, cast: [], concept: scene.concept ?? null, propTypes: [], artTexts: [], told: provenance };
    if (scene.bg && scene.bg.set) lock.set = scene.bg.set;
    out._authorship = { ...a, src: "told", lock, previousLock: old };
  }
  if (scene.visualContract) {
    const vc = JSON.parse(JSON.stringify(scene.visualContract));
    if (Array.isArray(vc.characterIntent)) { if (vc.characterIntent.length && !vc.previousCharacterIntent) vc.previousCharacterIntent = vc.characterIntent; vc.characterIntent = []; }
    if (vc.visualEvidence && vc.visualEvidence.representation != null) { vc.visualEvidence.previousRepresentation = vc.visualEvidence.representation; delete vc.visualEvidence.representation; }
    vc.told = provenance;
    out.visualContract = vc;
  }
  return out;
}

/** `drawings` (told v2): { motifs, palette } — the book's own icons and colours (lib/own-drawings.js readBook) */
function applyTold(config, toldByScene, entities = {}, drawings = {}) {
  const scenes = config.scenes || [];
  const beats = scenes.map((s) => ({ id: s.id, frames: s.durationFrames, words: sceneWords(config, s), told: toldByScene[s.id] }));
  const unknown = Object.keys(toldByScene).filter((id) => !scenes.some((s) => s.id === id));
  const { stages, errors, warnings } = compileTold(beats, entities, drawings);
  const bad = new Set(errors.filter((e) => e.beat).map((e) => e.beat));
  const global = errors.filter((e) => !e.beat);
  let applied = 0;
  const next = scenes.map((s, i) => {
    const stage = stages[i];
    if (!stage || bad.has(s.id) || global.length) return s;
    applied++;
    const prevTold = i > 0 && stages[i - 1] && !bad.has(scenes[i - 1].id);
    const before = s._beforeTold || { shot: s.shot, characters: s.characters, props: s.props, texts: s.texts, diagram: s.diagram, transition: s.transition, camera: s.camera, shots: s.shots };
    const out = { ...s, told: stage, _beforeTold: before, characters: [], props: [], texts: [], camera: { zoom: [1, 1], panX: [0, 0], panY: [0, 0] } };
    delete out.diagram; delete out.shots;
    // the same stage carried over the cut: no wipe between two beats of it
    if (prevTold) out.transition = { ...(s.transition || {}), type: "cut", frames: 0 };
    return sealTold(out);
  });
  const flowMeta = applied ? { ...(config.meta || {}), flow: Math.max(2, Number((config.meta || {}).flow) || 0) } : config.meta;
  const { meta, heads } = applied ? castHeads(flowMeta, entities, drawings.palette) : { meta: flowMeta, heads: [] };
  return {
    config: { ...config, meta, scenes: next },
    report: { told: Object.keys(toldByScene).length, applied, castHeads: heads, errors: [...global, ...errors.filter((e) => e.beat)], warnings, unknownScenes: unknown },
  };
}

/** Undo: every told scene gets its figure-and-text picture and its planner lock back. */
function revertTold(config) {
  let n = 0;
  const scenes = (config.scenes || []).map((s) => {
    if (!s.told) return s;
    n++;
    const b = s._beforeTold || {}, out = { ...s, ...Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)) };
    delete out.told; delete out._beforeTold;
    if (out._authorship && out._authorship.src === "told") { const a = { ...out._authorship, lock: out._authorship.previousLock, src: "art" }; delete a.previousLock; out._authorship = a; }
    if (out.visualContract && out.visualContract.told) {
      const vc = JSON.parse(JSON.stringify(out.visualContract));
      if (vc.previousCharacterIntent) { vc.characterIntent = vc.previousCharacterIntent; delete vc.previousCharacterIntent; }
      if (vc.visualEvidence && vc.visualEvidence.previousRepresentation != null) { vc.visualEvidence.representation = vc.visualEvidence.previousRepresentation; delete vc.visualEvidence.previousRepresentation; }
      delete vc.told; out.visualContract = vc;
    }
    return out;
  });
  let meta = config.meta;
  if (meta && meta._castBeforeTold) { meta = { ...meta, cast: { ...(meta.cast || {}), ...meta._castBeforeTold } }; delete meta._castBeforeTold; }
  return { config: { ...config, meta, scenes }, reverted: n };
}

module.exports = { castHeads, applyTold, revertTold, sealTold, sceneWords, stageHash };
