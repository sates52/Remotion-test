/**
 * build-10x-prompts.js — Auto-builds `books/<slug>/prompts.10x.json` from
 * merged `assetRequests` across storyboard chunks.
 *
 * Budgets (Operator Decisions #1 & #2, 2026-11-27):
 *  - Standard (`minorHarm: false`): default 80, duration-scaled (~2/min) up to cap 90.
 *  - `minorHarm: true` (Seçenek 2A): strictly 0% human/child/harm/violence/captivity/photoreal
 *    Flux; up to max 25 symbolic, human-free, child-free atmospheric place/object editorial
 *    illustrations matching the book's non-photoreal `artLock`, ONLY on full-stage 10x devices
 *    (`hookPoster`, `annotatedScene`, `editorialSpread`, `evidenceBoard`, `upClose`) or the
 *    book's thumbnail hero — NEVER over Everyman characters (Single-World Law).
 */
const fs = require("fs");
const path = require("path");

const DEFAULT_FLUX_BUDGET = 80;
const MAX_FLUX_BUDGET = 90;
const MINOR_HARM_MAX_FLUX = 25;

const MINOR_HARM_ALLOWED_DEVICES = new Set([
  "hookPoster",
  "annotatedScene",
  "editorialSpread",
  "evidenceBoard",
  "upClose",
]);

const FORBIDDEN_HUMAN_RE = /\b(child|children|kid|kids|teen|teenager|girl|girls|boy|boys|minor|minors|infant|baby|babies|toddler|youth|daughter|son|student|schoolgirl|schoolboy|human|humans|person|persons|people|man|men|woman|women|figure|figures|character|characters|actor|actors|portrait|portraits|face|faces|eye|eyes|hand|hands|body|bodies|silhouette|silhouettes|crowd|mother|father|parent|parents|stranger|predator|abductor|victim|detective|officer|suspect|couple|family|pedestrian|bystander|protagonist|narrator|hero|villain|someone|somebody)\b/i;

const FORBIDDEN_HARM_RE = /\b(abuse|abused|abduct|abducted|abduction|kidnap|kidnapped|kidnapping|captive|captivity|cage|chains?|shackles?|blood|bleed|bleeding|gore|wound|bruise|injury|dead|corpse|murder|kill|killing|assault|violence|violent|weapon|gun|knife|rope|tied\s+up|bound|bedroom|bed|mattress|nude|naked|undress|intimate|sexual|trauma|torture|suicide|hanging|scream|screaming|crying|terrified|hostage|prisoner)\b/i;

const FORBIDDEN_PHOTOREAL_RE = /\b(photoreal|photorealistic|photograph|photographic|hyperrealistic|ultra-?realistic|dslr|85mm|50mm|35mm\s+lens|raw\s+photo|bokeh\s+portrait|candid\s+photo|live-?action)\b/i;

function computeFluxBudget({ durationMin = 40, minorHarm = false, maxCalls = null } = {}) {
  if (minorHarm) {
    const req = maxCalls != null && Number.isFinite(Number(maxCalls)) ? Number(maxCalls) : MINOR_HARM_MAX_FLUX;
    return Math.max(1, Math.min(MINOR_HARM_MAX_FLUX, Math.round(req)));
  }
  const scaled = Math.max(DEFAULT_FLUX_BUDGET, Math.min(MAX_FLUX_BUDGET, Math.round(Number(durationMin || 40) * 2)));
  if (maxCalls != null && Number.isFinite(Number(maxCalls))) {
    return Math.max(1, Math.min(MAX_FLUX_BUDGET, Math.round(Number(maxCalls))));
  }
  return scaled;
}

/**
 * Deterministic fail-closed prompt guard for `minorHarm: true` books.
 * Rejects ANY human/child/person/face/harm/violence/captivity/photoreal token
 * and any cutout/poses2x2 mode. Runs on the raw prompt before any negative suffix.
 */
function validateMinorHarmSafePrompt(prompt, req = {}) {
  const reasons = [];
  const raw = String(prompt || "").trim();
  if (!raw) reasons.push("empty prompt");
  if (req && (req.mode === "cutout" || req.mode === "poses2x2" || req.cutout === true || req.grid)) {
    reasons.push(`forbidden mode "${req.mode || (req.cutout ? "cutout" : "grid")}" on minorHarm book`);
  }
  const humanHit = raw.match(FORBIDDEN_HUMAN_RE);
  if (humanHit) reasons.push(`forbidden human/child token "${humanHit[0]}"`);
  const harmHit = raw.match(FORBIDDEN_HARM_RE);
  if (harmHit) reasons.push(`forbidden harm/captivity/bed token "${harmHit[0]}"`);
  const photoHit = raw.match(FORBIDDEN_PHOTOREAL_RE);
  if (photoHit) reasons.push(`forbidden photoreal token "${photoHit[0]}"`);
  return { ok: reasons.length === 0, reasons };
}

function conciseArtLock(artLock, { minorHarm = false } = {}) {
  const raw = String(artLock || "").trim();
  const base = raw
    ? (raw.split(",")[0].trim().length <= 140 ? raw.split(",")[0].trim() : raw.slice(0, 140).trim())
    : "editorial gouache and fine-line ink architectural illustration";
  if (minorHarm) {
    return `${base}, non-photoreal editorial gouache and ink, symbolic empty place or object only`;
  }
  return base;
}

function collectReferencedImages(beats) {
  const refs = new Set();
  for (const b of beats || []) {
    if (!b || typeof b !== "object") continue;
    const add = (p) => { if (typeof p === "string" && p.trim()) refs.add(p.trim()); };
    add(b.bgImage?.path);
    add(b.annotatedScene?.image);
    add(b.editorialSpread?.image);
    add(b.upClose?.image);
    add(b.evidenceBoard?.image);
    add(b.realAnchor?.image);
    add(b.cohortGrid?.insetImage?.path);
    add(b.hookPoster?.beforeImage);
    add(b.hookPoster?.afterImage);
    add(b.cutoutStage?.backdrop?.image);
    for (const a of b.cutoutStage?.actors ?? []) add(a.image);
    for (const p of b.cutoutStage?.props ?? []) add(p.image);
    add(b.beforeAfterWipe?.before?.image);
    add(b.beforeAfterWipe?.after?.image);
    for (const c of b.comparisonGrid?.columns ?? []) add(c.image);
    for (const pn of b.comicStrip?.panels ?? []) add(pn.image);
    for (const nd of b.visualEquation?.nodes ?? []) add(nd.image);
  }
  return [...refs];
}

function beatAllowedForMinorHarmFlux(beat, req) {
  if (req && (req.target === "thumbnail" || req.id === "thumbnail-hero")) return true;
  if (!beat || typeof beat !== "object") return false;
  // Single-World Law: NEVER place Everyman characters over Flux.
  if (Array.isArray(beat.cast) && beat.cast.length > 0) return false;
  if (Array.isArray(beat.characters) && beat.characters.length > 0) return false;
  for (const dk of MINOR_HARM_ALLOWED_DEVICES) {
    if (beat[dk] != null) return true;
  }
  return false;
}

function buildPrompts10x({ slug, beats, pack, minorHarm = false, maxCalls = null, durationMin = 40, publicRoot = null } = {}) {
  const isMinorHarm = Boolean(minorHarm || (pack && pack.minorHarmSafe === true));
  const budget = computeFluxBudget({ durationMin, minorHarm: isMinorHarm, maxCalls });
  const byId = new Map();
  const warnings = [];
  const rejected = [];

  for (const b of beats || []) {
    for (const req of b?.assetRequests ?? []) {
      if (!req || !req.id || !req.prompt) continue;
      const id = String(req.id).trim();
      if (byId.has(id)) continue;

      if (isMinorHarm) {
        if (!beatAllowedForMinorHarmFlux(b, req)) {
          const msg = `minorHarm guard rejected "${id}" (beat ${b.i ?? b.id ?? "?"}): Flux only allowed on ${[...MINOR_HARM_ALLOWED_DEVICES].join("/")} or thumbnail-hero, never over Everyman cast`;
          rejected.push({ id, reason: msg });
          warnings.push(msg);
          continue;
        }
        const check = validateMinorHarmSafePrompt(req.prompt, req);
        if (!check.ok) {
          const msg = `minorHarm prompt guard rejected "${id}": ${check.reasons.join("; ")}`;
          rejected.push({ id, reason: msg });
          warnings.push(msg);
          continue;
        }
      }

      byId.set(id, {
        id,
        path: req.path ? String(req.path).trim() : `scenes/${slug}/${id}.png`,
        prompt: String(req.prompt).trim(),
        ...(req.mode ? { mode: req.mode } : {}),
        ...(req.cutout != null ? { cutout: !!req.cutout } : {}),
        ...(req.grid ? { grid: req.grid } : {}),
        ...(isMinorHarm ? { minorHarmSafe: true } : {}),
      });
    }
  }

  const scenes = [...byId.values()];
  if (isMinorHarm && scenes.length === 0 && rejected.length === 0) {
    return {
      skipped: true,
      reason: "minorHarm/vectorRig — no symbolic place/object assetRequests declared",
      scenes: [],
      warnings: [],
      rejected: [],
      missingRefs: [],
      maxCalls: budget,
    };
  }
  if (scenes.length > budget) {
    warnings.push(`prompts.10x.json declares ${scenes.length} assets, exceeding maxCalls=${budget} by ${scenes.length - budget}`);
  }
  const declaredPaths = new Set(scenes.map((s) => s.path));
  const missingRefs = [];
  for (const ref of collectReferencedImages(beats)) {
    if (!ref.startsWith(`scenes/${slug}/`)) continue;
    if (declaredPaths.has(ref)) continue;
    if (publicRoot && fs.existsSync(path.join(publicRoot, ref))) continue;
    missingRefs.push(ref);
  }
  return {
    skipped: false,
    generatedBy: "storyboard-merge",
    slug,
    stylePack: pack?.id || null,
    artLock: conciseArtLock(pack?.artLock, { minorHarm: isMinorHarm }),
    minorHarm: isMinorHarm,
    maxCalls: budget,
    scenes,
    warnings,
    rejected,
    missingRefs,
  };
}

module.exports = {
  buildPrompts10x,
  computeFluxBudget,
  validateMinorHarmSafePrompt,
  conciseArtLock,
  collectReferencedImages,
  DEFAULT_FLUX_BUDGET,
  MAX_FLUX_BUDGET,
  MINOR_HARM_MAX_FLUX,
  MINOR_HARM_ALLOWED_DEVICES,
};
