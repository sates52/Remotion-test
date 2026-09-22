"use strict";

/** Deterministic semantic-floor bridge; it emits overrides, never scenes. */
const COMPARATIVE_SHOTS = new Set(["split", "twoShot", "beforeAfter"]);
const DIAGRAM_TYPES = new Set(["sorter", "matchWave", "flow", "spectrum", "matrix", "tree", "funnel"]);
const LABEL_STOPWORDS = new Set("a an and are as at be because been but by can could did do does for from had has have he her hers him his how i if in into is it its just like me more most my no not of on or our out she so than that the their them then there these they this to us was we were what when where which who why will with you your yeah right really very almost exactly completely".split(" "));

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

function words(text) {
  return String(text || "")
    .replace(/[“”"'`]/g, "")
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word && !LABEL_STOPWORDS.has(word.toLowerCase()));
}

function label(text, fallback = "") {
  const selected = words(text);
  const backup = words(fallback);
  return (selected.length ? selected : backup).slice(-4).join(" ").toUpperCase();
}

function splitAt(text, pattern) {
  const match = String(text || "").match(pattern);
  if (!match || match.index == null) return null;
  return [text.slice(0, match.index), text.slice(match.index + match[0].length)];
}

// ── P3.2: two sides of a graphic MUST differ ────────────────────────────────
// A single-sentence atom has no split point, so left/right used to come out
// IDENTICAL ("WILDLY INCONVENIENT MORAL PERMISSION" stamped on both ends of
// the flow, "NOT WHAT IT SEEMS" on both comparison poles —9 diagram scenes
// and14 text scenes in verity). Last resort is slicing the atom's content
// words into an opening and a closing; when even that cannot produce two
// distinct labels, semanticPayload returns null and the planner keeps its
// generic floor pair (TRIGGER/CONSEQUENCE), which is at least two different
// words. Degenerate pairs never ship.
function distinctPair(left, right) {
  return left && right && left !== right ? { left, right } : null;
}

function wordSlices(text) {
  const w = words(text);
  if (w.length < 4) return null;
  const head = w.slice(0, Math.min(3, w.length - 1)).join(" ").toUpperCase();
  const tail = w.slice(-Math.min(3, w.length - 1)).join(" ").toUpperCase();
  return distinctPair(head, tail);
}

/** @returns {{leftLabel: string, rightLabel: string} | null} */
function opposingLabels(atom) {
  const text = atom.text || "";
  const split =
    splitAt(text, /\b(?:rather than|instead of|as opposed to|versus|vs\.?|whereas)\b/i) ||
    splitAt(text, /\bbut\b/i) ||
    splitAt(text, /\bwhile\b/i);
  if (split) {
    const direct = distinctPair(label(split[0], atom.subject || atom.text), label(split[1], atom.object || atom.relationship || atom.text));
    if (direct) return { leftLabel: direct.left, rightLabel: direct.right };
  }
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const substantial = sentences.filter((sentence) => words(sentence).length >= 2);
  if (substantial.length >= 2) {
    const direct = distinctPair(
      label(substantial[0], atom.subject || text),
      label(substantial[substantial.length - 1], atom.object || atom.relationship || text)
    );
    if (direct) return { leftLabel: direct.left, rightLabel: direct.right };
  }
  const sliced = wordSlices(text) || wordSlices(atom.subject || "") || wordSlices(atom.relationship || "");
  if (sliced) return { leftLabel: sliced.left, rightLabel: sliced.right };
  return null;
}

function semanticPayload(atom, archetype) {
  if (!atom || !atom.text) return null;
  const opposing = opposingLabels(atom);
  if (archetype === "contrast") {
    return opposing ? { kind: "comparison_labels", leftLabel: opposing.leftLabel, rightLabel: opposing.rightLabel } : null;
  }
  if (archetype === "allegory_equivalence") {
    return opposing ? { kind: "two_domain_labels", sourceLabel: opposing.leftLabel, targetLabel: opposing.rightLabel } : null;
  }
  if (archetype === "cause_effect" || archetype === "transformation") {
    const because = splitAt(atom.text, /\bbecause\b/i);
    const leadsTo = splitAt(atom.text, /\b(?:leads to|results in|causes|produces)\b/i);
    const raw = because ? [because[1], because[0]] : leadsTo || [atom.subject || atom.text, atom.object || atom.relationship || atom.text];
    const direct = distinctPair(label(raw[0], atom.text), label(raw[1], atom.text));
    const flow = direct || wordSlices(atom.text);
    return flow ? { kind: "flow_labels", triggerLabel: flow.left, consequenceLabel: flow.right } : null;
  }
  if (archetype === "character_psychology") {
    return opposing ? { kind: "internal_tension_labels", internalPoleA: opposing.leftLabel, internalPoleB: opposing.rightLabel } : null;
  }
  return null;
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
function buildDirectorOverrides({ intent, atom, direction, authoredDiagram = false, authoredComposition = false }) {
  const archetype = intent && intent.archetype;
  const requiredActions = (intent && intent.requiredActions) || [];
  const provenance = intent ? copyIntent(intent) : null;
  const payload = semanticPayload(atom, archetype);
  const base = { override: null, reason: "no_semantic_requirement", archetype, requiredActions, provenance, semanticPayload: payload };
  if (!archetype || archetype === "static_reflection") return base;
  // Human art may be semantically insufficient, but it is never silently
  // replaced here; the unchanged VisualContract remains the firewall.
  if (authoredDiagram || authoredComposition) return { ...base, reason: "preserved_authored_composition" };

  if (archetype === "contrast") {
    if (hasComposition(direction, "comparative")) return { ...base, reason: "preserved_existing_comparison" };
    return { ...base, reason: "added_comparative_floor", override: { ...comparisonOverride(direction, archetype), semanticPayload: payload } };
  }
  if (archetype === "allegory_equivalence") {
    if (hasComposition(direction, "two_domain")) return { ...base, reason: "preserved_existing_two_domain_comparison" };
    return { ...base, reason: "added_two_domain_floor", override: { ...twoDomainOverride(), semanticPayload: payload } };
  }
  if (archetype === "cause_effect" || archetype === "transformation") {
    if (hasComposition(direction, "flow")) return { ...base, reason: "preserved_existing_flow" };
    return { ...base, reason: "added_causal_flow_floor", override: { ...withGrammar(diagramOverride("flow", "TRIGGER → CONSEQUENCE", ["TRIGGER", "CONSEQUENCE"]), "cause_effect_flow"), semanticPayload: payload } };
  }
  if (archetype === "character_psychology") {
    if (hasComposition(direction, "tension")) return { ...base, reason: "preserved_existing_tension" };
    return { ...base, reason: "added_internal_tension_floor", override: { ...withGrammar(diagramOverride("spectrum", "INNER TENSION", ["DENIAL", "REALIZATION"]), "internal_tension"), semanticPayload: payload } };
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

module.exports = { buildDirectorOverrides, applyDirectorOverrides, sanitizeAction, isValidDiagram, semanticPayload };
