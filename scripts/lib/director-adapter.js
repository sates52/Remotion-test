"use strict";

/** Deterministic semantic-floor bridge; it emits overrides, never scenes. */
const COMPARATIVE_SHOTS = new Set(["split", "twoShot", "beforeAfter"]);
const DIAGRAM_TYPES = new Set(["sorter", "matchWave", "flow", "spectrum", "matrix", "tree", "funnel"]);

function copyIntent(intent) {
  return {
    archetype: intent.archetype,
    domain: intent.domain,
    requiredActions: [...(intent.requiredActions || [])],
    requiredAttributes: { ...(intent.requiredAttributes || {}) },
    forbiddenTropes: [...(intent.forbiddenTropes || [])],
    semanticRequirements: [...(intent.semanticRequirements || [])],
  };
}

function isValidDiagram(diagram) {
  if (!diagram || !DIAGRAM_TYPES.has(diagram.type)) return false;
  const labels = Array.isArray(diagram.labels) ? diagram.labels : [];
  if (diagram.type === "matchWave") return labels.length >= 1;
  return labels.length >= 2;
}

function hasComposition(direction, kind) {
  const grammar = direction.semanticGrammar && direction.semanticGrammar.kind;
  const shot = direction.shot || "";
  const castCount = Number(direction.cast && direction.cast.count) || 0;
  if (kind === "comparative") return grammar === "comparison" || (COMPARATIVE_SHOTS.has(shot) && castCount >= 2) || isValidDiagram(direction.diagram);
  if (kind === "two_domain") return grammar === "two_domain_comparison" || (isValidDiagram(direction.diagram) && ["sorter", "spectrum", "matchWave"].includes(direction.diagram.type));
  if (kind === "flow") return grammar === "cause_effect_flow" || shot === "beforeAfter" || (isValidDiagram(direction.diagram) && direction.diagram.type === "flow");
  return grammar === "internal_tension" || (isValidDiagram(direction.diagram) && direction.diagram.type === "spectrum") || castCount >= 2;
}

function comparisonOverride(direction, archetype) {
  const roles = Array.isArray(direction.cast && direction.cast.roles) ? direction.cast.roles.slice(0, 2) : [];
  while (roles.length < 2) roles.push(roles.length === 0 ? "protagonist" : "foil");
  return {
    shot: "split",
    semanticGrammar: { kind: "comparison", poles: ["LEFT_POLE", "RIGHT_POLE"] },
    cast: {
      ...(direction.cast || {}), count: 2, crowd: 0, roles,
      // Planner applies this to character two: an active counterpart prevents
      // the comparison from degenerating into idle-actor wallpaper.
      secondaryAction: archetype === "allegory_equivalence" ? "point" : "talk",
    },
  };
}

function diagramOverride(type, title, labels) {
  return {
    shot: "insert", cast: { count: 0, crowd: 0, roles: [] }, props: [], concept: null,
    diagram: { type, title, labels, values: [], at: 4, scale: 1 },
  };
}

function twoDomainOverride() {
  return {
    // A split is already a real, renderer-supported two-domain composition.
    // Unlike a generic diagram marker, the unchanged Gate can observe both
    // active poles without requiring a new VisualContract rule.
    ...comparisonOverride({}, "allegory_equivalence"),
    semanticGrammar: { kind: "two_domain_comparison", domains: ["SOURCE_DOMAIN", "TARGET_DOMAIN"] },
  };
}

function withGrammar(override, kind) {
  return { ...override, semanticGrammar: { kind } };
}

function propIsForbidden(prop, forbiddenTropes) {
  const type = String(prop && prop.type || "").toLowerCase();
  if (forbiddenTropes.includes("comic_lightbulb") && /lightbulb|bulb/.test(type)) return true;
  if (forbiddenTropes.includes("heart_symbol") && /heart/.test(type)) return true;
  if (forbiddenTropes.includes("party_confetti") && /confetti|party/.test(type)) return true;
  if (forbiddenTropes.includes("burning_or_destructive_action") && /fire|flame|burn|destroy|crash/.test(type)) return true;
  if (forbiddenTropes.includes("unrelated_navigation_prop") && /compass|rudder|navigation/.test(type)) return true;
  return false;
}

function sanitizeAction(action, forbiddenTropes = []) {
  return forbiddenTropes.includes("celebrate_action") && action === "celebrate" ? "think" : action;
}

/**
 * Precedence: an authored or already-valid composition wins. Only a missing
 * semantic grammar gets an override. Static reflection gets no fallback.
 */
function buildDirectorOverrides({ intent, direction, authoredDiagram = false, authoredComposition = false }) {
  const archetype = intent && intent.archetype;
  const requiredActions = (intent && intent.requiredActions) || [];
  const provenance = intent ? copyIntent(intent) : null;
  const base = { override: null, reason: "no_semantic_requirement", archetype, requiredActions, provenance };
  if (!archetype || archetype === "static_reflection") return base;
  // Human art may be semantically insufficient, but it is never silently
  // replaced here; the unchanged VisualContract remains the firewall.
  if (authoredDiagram || authoredComposition) return { ...base, reason: "preserved_authored_composition" };

  if (archetype === "contrast") {
    if (hasComposition(direction, "comparative")) return { ...base, reason: "preserved_existing_comparison" };
    return { ...base, reason: "added_comparative_floor", override: comparisonOverride(direction, archetype) };
  }
  if (archetype === "allegory_equivalence") {
    if (hasComposition(direction, "two_domain")) return { ...base, reason: "preserved_existing_two_domain_comparison" };
    return { ...base, reason: "added_two_domain_floor", override: twoDomainOverride() };
  }
  if (archetype === "cause_effect" || archetype === "transformation") {
    if (hasComposition(direction, "flow")) return { ...base, reason: "preserved_existing_flow" };
    return { ...base, reason: "added_causal_flow_floor", override: withGrammar(diagramOverride("flow", "TRIGGER → CONSEQUENCE", ["TRIGGER", "CONSEQUENCE"]), "cause_effect_flow") };
  }
  if (archetype === "character_psychology") {
    if (hasComposition(direction, "tension")) return { ...base, reason: "preserved_existing_tension" };
    return { ...base, reason: "added_internal_tension_floor", override: withGrammar(diagramOverride("spectrum", "INNER TENSION", ["DENIAL", "REALIZATION"]), "internal_tension") };
  }
  return base;
}

function applyDirectorOverrides(direction, result) {
  if (!result) return direction;
  const override = result.override || {};
  const forbiddenTropes = result.provenance ? result.provenance.forbiddenTropes : [];
  const merged = {
    ...direction, ...override,
    cast: override.cast ? { ...(direction.cast || {}), ...override.cast } : direction.cast,
    props: Object.prototype.hasOwnProperty.call(override, "props") ? override.props : direction.props,
  };
  // Exclusions are applied before planner assembly. The original intent remains
  // attached as provenance; no Gate behavior is changed or bypassed.
  if (Array.isArray(merged.props)) merged.props = merged.props.filter((prop) => !propIsForbidden(prop, forbiddenTropes));
  merged.semanticConstraints = result.provenance;
  return merged;
}

module.exports = { buildDirectorOverrides, applyDirectorOverrides, sanitizeAction, isValidDiagram };
