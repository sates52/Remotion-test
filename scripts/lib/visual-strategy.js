/**
 * visual-strategy.js — P1.4 PHASE B (2026-10-01): the Semantic Visual Strategy
 * schema + deterministic risk→strategy mapping + capability evidence.
 *
 * Operator-approved frame (PHASE A review):
 *   1. A strategy may change visual REPRESENTATION, never authored MEANING:
 *      action, subject, relation, state, world, metaphor stay byte-identical.
 *      This module only DECIDES and RECORDS — it never mutates a scene (that is
 *      PHASE C/D work, separately reviewed).
 *   2. UNKNOWN capability ≠ safe: LOW_CAPABILITY (<0.85) maps to
 *      SAFE_REPRESENTATION, but UNKNOWN maps to SAFE_REPRESENTATION only when
 *      the authored action is itself known-safe (measured confidence ≥ 0.85)
 *      AND the fallback representation has explicit renderer-lever evidence;
 *      otherwise UNRESOLVED.
 *   3. RELATION_LOCK requires relation EVIDENCE: an atom relation-bearing
 *      subject/object pair with a cast mapping. cast ≥ 2 alone never qualifies
 *      ("two people exist" ≠ "a relationship is shown").
 *   4. `_visualStrategy` is DECLARATIVE METADATA — the record of a decision.
 *      It is never a trusted flag: the firewall judges the SCENE and the
 *      contract evidence, not the strategy's self-description. Trust flow:
 *      atom → risk signals → strategy → representation → contract evidence →
 *      firewall.
 *
 * PHASE B review fixes (2026-10-01, conditional-approval items):
 *   a. levers ≠ measured evidence: SAFE_REPRESENTATION's lever DECLARATION is
 *      not evidence. UNKNOWN → SAFE additionally requires a fallback lever that
 *      is itself MEASURED ≥ 0.85 in the capability map (with the real map,
 *      illustration 0.800 / medium 0.845 do NOT qualify; diorama 0.938 /
 *      closeUp 0.917 do). No measured-safe fallback → UNRESOLVED.
 *   b. `cast:N` is a STRUCTURAL property, not a representation lever: it is
 *      excluded from the capability minimum and can never drag a scene into
 *      SAFE_REPRESENTATION by itself (it also stays out of relation evidence).
 *   c. mixed actions (PHASE B review 2): EVERY authored action must itself be
 *      known AND measured ≥ 0.85 — one unknown/unproven action poisons the
 *      set, so "walk known-safe + grabbing unknown" can never reach SAFE.
 *
 * Inputs come only from the measured P1.1–P1.3 systems: failure-taxonomy
 * classes, risk-selector features, and data/visual-capability.json. The
 * mapping is ONE table, deterministic, no LLM anywhere. Measured-only:
 * nothing here feeds a gate in this phase and nothing here mutates a scene.
 */

// Renderer levers verified on 2026-10-01 against src/engines/antidote/schema.ts:
//   charAction(16) · expression(9) · charEmotion(6) · lookAt · shot(15) ·
//   prop arc grow|shrink|rise|fall|closein|tilt|break · text style strike|contrast-able.
// Each strategy's `levers` name the renderer features its representation relies on;
// PHASE C must satisfy the lever list when it writes the representation.
const STRATEGY_LEVERS = {
  DIRECT_SCENE: [],
  CONTRAST_ABSENCE: ["shot:insert|split", "text:strike", "prop-arc:shrink|closein", "expression:neutral|sad|worried"],
  ABSTRACT_CONCRETE: ["shot:illustration|diorama|insert", "prop-arc:*", "text:box|stack|marker"],
  EXPLICIT_STATE: ["expression:sad|afraid|worried|angry|surprised", "emotion:sweat|shock|fire|lightbulb", "prop-arc:fall|shrink"],
  RELATION_LOCK: ["lookAt:partner|motif", "shot:twoShot|overShoulder|split", "characterIntent:identity+gaze+state"],
  SAFE_REPRESENTATION: ["shot:illustration|diorama|medium|closeUp", "characterIntent:identity+gaze+state"],
  UNRESOLVED: [],
};

// The SAFE_REPRESENTATION fallback levers that are individually CHECKABLE
// against the capability map (declaration ≠ evidence; see fix (a) above).
const SAFE_FALLBACK_LEVERS = ["shot:illustration", "shot:diorama", "shot:medium", "shot:closeUp"];

const STRATEGIES = Object.keys(STRATEGY_LEVERS);

// Mapping thresholds (operator-locked).
const LOW_CONFIDENCE = 0.85; // below this a measured capability is LOW_CAPABILITY
const KNOWN_SAFE = 0.85;     // a fallback lever / authored action must measure at least this to count as safe

// ── risk extraction (deterministic; mirrors risk-selector + taxonomy evidence) ──
const NEGATION_RE = /\b(not|never|cannot|can't|cannot|don'?t|doesn'?t|isn'?t|aren'?t|without|no longer|stop)\b/i;
const METAPHOR_RE = /\b(like an?|as if|as though|metaphor|symbolizes?|became a|becomes a|turned into a)\b/i;
const EMOTION_INVERSION_RE = /\b(devastated|grief|lament\w*|mourn\w*|iron\w*|instead of|rather than|paradox\w*|failed to)\b/i;

/**
 * Capability lookups. capabilityMap = parsed data/visual-capability.json
 * (may be null → everything is UNKNOWN, which is the fail-closed direction).
 */
function makeCapabilityReader(capabilityMap) {
  const caps = (capabilityMap && capabilityMap.capabilities) || {};
  return {
    confidenceOf(key) {
      const c = caps[key];
      return c && c.confidence != null ? { confidence: c.confidence, known: true } : { confidence: null, known: false };
    },
  };
}

/**
 * The semantic signature of the MEANING a scene carries — the fields a
 * strategy must never change. Pure: reads the atom/contract pieces the caller
 * passes; writes nothing.
 */
function semanticSignature({ atom, scene }) {
  return {
    action: (scene.characters || []).map((c) => String(c.action || "")).join("+"),
    subject: String((atom && atom.subject) || "") || String((scene.visualProposition && scene.visualProposition.subject) || ""),
    relation: String((atom && atom.relationship) || "") || String((scene.visualProposition && scene.visualProposition.narrativeRelation) || ""),
    state: String((scene.visualProposition && scene.visualProposition.narrativeState) || ""),
    world: String((scene.visualProposition && scene.visualProposition.worldId) || ""),
    metaphor: String((scene.visualIntent && scene.visualIntent.archetype) || ""),
  };
}

/**
 * The RENDERER LEVERS a scene uses for its representation: the character
 * actions, the shot, the expressions. `cast:N` is deliberately NOT here — it
 * is a structural property of the beat, not a lever the strategy chooses
 * (operator, PHASE B review), and it must never drag a scene into
 * SAFE_REPRESENTATION through the confidence minimum.
 */
function usedCapabilityKeys(scene) {
  const keys = [];
  for (const c of (scene && scene.characters) || []) keys.push(`action:${String(c.action || "none")}`);
  if (scene && scene.shot) keys.push(`shot:${scene.shot}`);
  for (const c of (scene && scene.characters) || []) keys.push(`expression:${String(c.expression || "none")}`);
  return [...new Set(keys)];
}

/**
 * The best MEASURED-SAFE fallback lever for SAFE_REPRESENTATION, or null.
 * A candidate lever qualifies only when the capability map MEASURES it at
 * ≥ KNOWN_SAFE — the declaration in STRATEGY_LEVERS is not evidence.
 */
function measuredSafeFallback(capabilityMap) {
  const caps = makeCapabilityReader(capabilityMap);
  let best = null;
  for (const lever of SAFE_FALLBACK_LEVERS) {
    const { confidence, known } = caps.confidenceOf(lever);
    if (known && confidence >= KNOWN_SAFE && (!best || confidence > best.confidence)) {
      best = { lever, confidence };
    }
  }
  return best;
}

/**
 * P1.4 PHASE C — the ENFORCEABLE representation requirement a strategy record
 * implies. Pure: reads the record + the capability map; writes nothing.
 *
 * Lever names are parsed from the record's own STRATEGY_LEVERS declaration
 * (single source of truth) and bind to renderer-verified scene fields:
 *   absence  → texts[].style / props[].arc        (schema.ts:422 / :386)
 *   concrete → scene.shot / scene.diagram
 *   state    → characters[].expression / .emotion
 *   relation → parties on screen + relation-capable shot + a RELATION PARTY
 *              carrying lookAt (operator, PHASE C review: a third character's
 *              lookAt:"partner" never satisfies the binding)
 *   fallback → scene.shot === the MEASURED-safe lever's shot — regardless of
 *              which SAFE branch fired (the LOW_CAPABILITY branch must bind to
 *              a measured lever too, or SAFE would be a declaration, not a
 *              checkable scene fact)
 * DIRECT_SCENE and UNRESOLVED imply no requirement (UNRESOLVED is report-only
 * in C; its fail-closed lifecycle is a PHASE D acceptance criterion — operator,
 * PHASE C review).
 */
function requirementFor(record, capabilityMap) {
  const levers = (record && record.levers) || [];
  const pull = (prefix) => {
    const l = levers.find((s) => typeof s === "string" && s.startsWith(prefix + ":"));
    return l ? l.slice(prefix.length + 1).split("|") : [];
  };
  switch (record && record.strategy) {
    case "CONTRAST_ABSENCE":
      return { kind: "absence", textStyles: pull("text"), propArcs: pull("prop-arc") };
    case "ABSTRACT_CONCRETE":
      return { kind: "concrete", shots: pull("shot"), diagramAllowed: true };
    case "EXPLICIT_STATE":
      return { kind: "state", expressions: pull("expression"), emotions: pull("emotion") };
    case "RELATION_LOCK": {
      const ev = (record && record.evidence) || {};
      if (!ev.subject || !ev.object) return null;
      return { kind: "relation", parties: [ev.subject, ev.object], shots: pull("shot"), lookAt: "partner" };
    }
    case "SAFE_REPRESENTATION": {
      const fb = measuredSafeFallback(capabilityMap);
      return fb ? { kind: "fallback", lever: fb.lever.replace(/^shot:/, ""), confidence: fb.confidence } : null;
    }
    default:
      return null; // DIRECT_SCENE / UNRESOLVED — no enforceable requirement in C
  }
}

/**
 * The decision. Pure: returns the strategy record; never mutates inputs.
 *
 * inputs:
 *   atom          — NarrativeAtom-ish {text, subject, object, relationship} (may be null)
 *   scene         — the planned scene (characters/shot; read-only here)
 *   narration     — the caption text around the beat (string)
 *   capabilityMap — parsed data/visual-capability.json or null
 *   enumActions   — Set of valid renderer actions (charAction options); null skips the enum check (until PHASE D wires it)
 *
 * Returns { strategy, risks, capabilityConfidence, semanticSignature, evidence }.
 * Precedence (operator-locked): enum-invalid → negation → metaphor →
 * emotion-inversion → relation(evidence) → low-capability / unknown → DIRECT.
 */
function decideStrategy({ atom, scene, narration, capabilityMap, enumActions = null }) {
  const risks = [];
  const caps = makeCapabilityReader(capabilityMap);
  const text = String(narration || (atom && atom.text) || "");
  const chars = (scene && scene.characters) || [];
  const sig = semanticSignature({ atom, scene });

  // capability risk over the representation levers the scene uses (cast excluded)
  const keys = usedCapabilityKeys(scene);
  let minKnown = 1;
  let unknownKeys = [];
  for (const k of keys) {
    const { confidence, known } = caps.confidenceOf(k);
    if (!known) unknownKeys.push(k);
    else if (confidence < minKnown) minKnown = confidence;
  }
  const capabilityConfidence = unknownKeys.length ? null : +minKnown.toFixed(3);

  // the authored actions' own measured safety (for the UNKNOWN rule):
  // EVERY authored action must be known AND measured ≥ 0.85 — a single
  // unknown or unproven action poisons the set (mixed-action gap, PHASE B
  // review 2: "walk known-safe + grabbing unknown" must NOT reach SAFE).
  const actionReadings = chars.map((c) => caps.confidenceOf(`action:${String(c.action || "none")}`));
  const actionsKnownSafe = actionReadings.length > 0 && actionReadings.every((r) => r.known && r.confidence >= KNOWN_SAFE);

  // 0. enum-invalid action — fail-closed, always (the one non-negotiable)
  if (enumActions) {
    const invalid = chars.map((c) => String(c.action || "")).filter((a) => a && !enumActions.has(a));
    if (invalid.length) {
      risks.push(`ENUM_INVALID_ACTION:${invalid.join("|")}`);
      return record("UNRESOLVED", risks, capabilityConfidence, sig, { invalidActions: invalid });
    }
  }

  // 1. negation → CONTRAST_ABSENCE
  if (NEGATION_RE.test(text)) {
    risks.push("NEGATION");
    return record("CONTRAST_ABSENCE", risks, capabilityConfidence, sig, { negatedClaim: text.slice(0, 160) });
  }

  // 2. metaphor → ABSTRACT_CONCRETE
  if (METAPHOR_RE.test(text) || (scene && scene.visualIntent && scene.visualIntent.archetype === "allegory_equivalence")) {
    risks.push("METAPHOR");
    return record("ABSTRACT_CONCRETE", risks, capabilityConfidence, sig, { figurativeClaim: text.slice(0, 160) });
  }

  // 3. emotion inversion → EXPLICIT_STATE
  if (EMOTION_INVERSION_RE.test(text)) {
    risks.push("EMOTION_INVERSION");
    return record("EXPLICIT_STATE", risks, capabilityConfidence, sig, { stateClaim: text.slice(0, 160) });
  }

  // 4. relation → RELATION_LOCK — evidence-based, not cast-count-based:
  //    an atom relationship naming TWO distinct parties (subject → object) maps
  //    to on-screen cast; "X talks about Y" (object == subject-side mention,
  //    no second party) has no relation evidence on screen.
  const rel = sig.relation || (atom && atom.relationship) || "";
  const relParties = relationParties(atom);
  if (relParties && relParties.count >= 2 && chars.length >= 2) {
    risks.push("RELATION");
    return record("RELATION_LOCK", risks, capabilityConfidence, sig, {
      relation: rel,
      subject: relParties.subject,
      object: relParties.object,
      binding: "lookAt+position (characterIntent identity/gaze/state must name both parties)",
    });
  }

  // 5. LOW_CAPABILITY (measured below threshold) → SAFE_REPRESENTATION
  if (capabilityConfidence != null && capabilityConfidence < LOW_CONFIDENCE) {
    risks.push("LOW_CAPABILITY");
    return record("SAFE_REPRESENTATION", risks, capabilityConfidence, sig, { lowestCapabilityConfidence: capabilityConfidence, unknownKeys });
  }

  // 6. UNKNOWN capability (unmeasured) → SAFE only if actions are known-safe
  //    AND a fallback lever is itself MEASURED ≥ 0.85; otherwise UNRESOLVED
  //    (unknown ≠ safe — levers are declarations, the map is the evidence).
  if (unknownKeys.length) {
    risks.push(`UNKNOWN_CAPABILITY:${unknownKeys.join("|")}`);
    const fallback = measuredSafeFallback(capabilityMap);
    if (actionsKnownSafe && fallback) {
      return record("SAFE_REPRESENTATION", risks, null, sig, { unknownKeys, fallback, note: "actions measured known-safe; fallback lever measured ≥0.85" });
    }
    return record("UNRESOLVED", risks, null, sig, {
      unknownKeys,
      note: !actionsKnownSafe
        ? "unknown capability with unproven action safety — measure first (PHASE G holdout closes this)"
        : "no measured-safe fallback lever (candidates unmeasured or <0.85) — unknown ≠ safe",
      fallbackCandidatesChecked: SAFE_FALLBACK_LEVERS,
    });
  }

  // 7. default
  return record("DIRECT_SCENE", risks, capabilityConfidence, sig, {});
}

/** Relation-bearing party extraction: subject vs object must be DISTINCT
 *  strings the atom actually carries (not derived from cast count). */
function relationParties(atom) {
  if (!atom) return null;
  const subject = String(atom.subject || "").trim();
  const object = String(atom.object || "").trim();
  if (!subject || !object || subject.toLowerCase() === object.toLowerCase()) return null;
  return { subject, object, count: 2 };
}

function record(strategy, risks, capabilityConfidence, sig, evidence) {
  return {
    strategy,
    risks,
    capabilityConfidence,
    semanticSignature: sig,
    evidence,
    levers: STRATEGY_LEVERS[strategy],
    note: "declarative metadata — the record of a decision, never a trusted flag; the firewall judges the scene and contract evidence",
  };
}

module.exports = { STRATEGIES, STRATEGY_LEVERS, SAFE_FALLBACK_LEVERS, LOW_CONFIDENCE, KNOWN_SAFE, decideStrategy, semanticSignature, makeCapabilityReader, relationParties, usedCapabilityKeys, measuredSafeFallback, requirementFor };
