/**
 * single-relation.js — SINGLE-RELATION CAUSE → VISIBLE EFFECT (capability, cycle 13, default OFF).
 *
 * NOT a new visual invention: this productises the part of SEMANTIC FILM DIRECTOR 1.0 (cycle 11, dev/c11 —
 * lib/semantic-director.js + components/SemanticStage.tsx, both reused unchanged in behaviour) that worked in the
 * cycle 11 / 12 blind tests: ONE locked wide frame in which the cause is marked, a token travels, a pause, and the effect
 * visibly changes ANOTHER entity — or, when that cannot be shown honestly, a quote card in the narration's own words.
 * Director 2.0's progressive build, reads, new verbs and camera moves are deliberately NOT carried (cycle 12: they
 * lowered comprehension). From Director 2.0 only the claim-safety checks are kept, and made stricter.
 *
 * Contract (schema "single-relation/1"): the v1 contract restricted to type A (action → consequence), B (cause →
 * effect) or H (quote card), plus `claim`:
 *   { asserted, polarity: asserted | contrast | negated | hypothetical, speaker?, notAsserted: [{ text, kind }], cueCheck? }
 * Extra rules on top of v1 (every one a compiler error):
 *   - one relation: exactly one event, at most 4 entities, no duplicated entity (same label / cast / object glyph);
 *   - source-grounded causality: the evidence quote must name BOTH the cause and every affected entity (and a moveTo
 *     target), so a consequence the narration does not state cannot be drawn;
 *   - hypothesis ≠ fact: a staged scene needs polarity asserted / contrast, and its evidence may carry no plan /
 *     proposal / conditional-mood, negation or question cue — such a beat becomes a quote card (no override);
 *   - claim polarity: evidence, quote text and labels may not come from a part the narration does not assert; a
 *     rejected-premise cue around the evidence must be resolved in claim.notAsserted (no cueCheck override);
 *   - speaker: a quote card of someone other than the narrator carries the speaker on screen.
 * compile(contract, scene) → the scene with `singleRelation` (drawn by SemanticStage when meta.singleRelation is true).
 * Deterministic: pure functions of (contract, scene); no clock, no randomness.
 */
"use strict";
const V1 = require("./semantic-director");

const SCHEMA = "single-relation/1";
const TYPES = ["A", "B", "H"];
const POLARITY = ["asserted", "contrast", "negated", "hypothetical"];
const STAGED_POLARITY = ["asserted", "contrast"];
const NOT_KINDS = ["rejected-premise", "counterfactual", "hypothesis", "planned", "question", "quoted-speech", "uncertain", "setup-half-of-contrast"];
const MAX_ENTITIES = 4;
// cues IN the evidence quote that forbid staging it as a real event (no override: the beat becomes a quote card)
const HARD = [
  // (a motive — "want to fit in", "hope to" — is a real state, not a plan: not a cue)
  { kind: "planned / hypothetical", re: /\b(propos(e|ed|es|al)|suggest(ed|s)?|plan(s|ned|ning)?|scheme[sd]?|brainstorm\w*|idea (of|to|was|is)|consider(ed|s)?|thought about|would|could|might|imagine[sd]?|what if|suppose|let'?s say|should have|supposed to|meant to|tr(y|ied|ies) to)\b/i },
  // negation: refused unless the claim is a contrast whose negated half is listed in notAsserted (see validate)
  { kind: "negation", re: /\b(not|no longer|never|don'?t|doesn'?t|didn'?t|isn'?t|wasn'?t|aren'?t|weren'?t|won'?t|can'?t|cannot|couldn'?t|wouldn'?t|shouldn'?t)\b/i },
  // the claim itself is a question (a rhetorical "How does that work? Because …" answers it: not a cue)
  { kind: "question", re: /\?\s*$/ },
];
// cues in the evidence's SENTENCE that must be resolved (v2 claim logic)
const SOFT = [
  { kind: "rejected-premise", strict: true, re: /\b(i hear (your|you)|you might think|people (think|assume|believe|say)|it'?s (tempting|easy) to (think|assume)|the (myth|misconception)|contrary to|that'?s not)\b/i },
  { kind: "setup-half-of-contrast", re: /\b(not because|instead of|rather than|even though|although)\b/i },
  { kind: "uncertain", re: /\b(maybe|perhaps|arguably|you (could|might) argue|possibly)\b/i },
  { kind: "quoted-speech", re: /["“”]/ },
];

const norm = (s) => String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'? ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).replace(/\?/g, " ").split(" ").filter(Boolean);
const stem = (w) => w.replace(/'s$/, "").slice(0, Math.max(4, Math.min(w.length, 5)));
const STOP = new Set(["the", "a", "an", "of", "no", "more", "less", "his", "her", "their", "its", "my", "your"]);
const sentences = (t) => String(t || "").split(/(?<=[.!?])\s+/).filter(Boolean);
const overlap = (a, b) => { const aw = words(a), bw = new Set(words(b)); return aw.length ? aw.filter((w) => bw.has(w)).length / aw.length : 0; };
const named = (label, text) => { const tw = new Set(words(text).map(stem)); const lw = words(label).filter((w) => !STOP.has(w)); return lw.length > 0 && lw.every((w) => tw.has(stem(w))); };

/** what the evidence names an entity by: its label, else (a person) its cast name */
function nameOf(e, ctx) {
  if (e.label) return e.label;
  if (e.kind === "person" && e.cast && ctx.castLabels && ctx.castLabels[e.cast]) return ctx.castLabels[e.cast];
  return "";
}

function sentenceSpan(narration, evidence) {
  const ne = norm(evidence);
  const hit = sentences(narration).filter((s) => { const ns = norm(s); return ns && (ns.includes(ne) || ne.includes(ns) || overlap(evidence, s) > 0.6); });
  return hit.length ? hit.join(" ") : narration;
}

/** validate a contract. ctx = { narration, cast: [key], castNames: [name], castLabels: { key: name } } */
function validate(c, ctx = {}) {
  const E = [];
  const err = (m) => E.push(m);
  if (!c || typeof c !== "object") return ["contract is not an object"];
  if (c.schema !== SCHEMA) return [`schema must be "${SCHEMA}"`];
  if (!TYPES.includes(c.type)) return [`type must be A (action → consequence), B (cause → effect) or H (quote card) — got ${JSON.stringify(c.type)}`];
  const narration = ctx.narration || "";
  const castNames = ctx.castNames || Object.values(ctx.castLabels || {});
  // every Director 1.0 rule still holds (verbatim evidence, grounded labels, glyph vocabulary, visible change, …)
  for (const m of V1.validate({ ...c, schema: "semantic-director/1", representation: V1.REPRESENTATION[c.type] }, { ...ctx, castNames })) err(m);

  // ── claim ─────────────────────────────────────────────────────────────────
  const cl = c.claim;
  const na = cl && Array.isArray(cl.notAsserted) ? cl.notAsserted : [];
  if (!cl || typeof cl.asserted !== "string" || !cl.asserted.trim()) err("claim.asserted: the claim the narration asserts here (one sentence)");
  else {
    if (!POLARITY.includes(cl.polarity)) err(`claim.polarity is ${POLARITY.join(" / ")}`);
    if (!Array.isArray(cl.notAsserted)) err("claim.notAsserted: [] or the parts the narration mentions without asserting");
    na.forEach((n, i) => {
      if (!n || !NOT_KINDS.includes(n.kind)) err(`claim.notAsserted[${i}].kind is ${NOT_KINDS.join(" / ")}`);
      if (!n || !n.text || !norm(narration).includes(norm(n.text))) err(`claim.notAsserted[${i}].text must be a verbatim quote of the narration`);
    });
  }
  // a planned / hypothetical / quoted part may be QUOTED WITH ITS FRAME ("someone proposed …", "she said …") — that is a
  // report, not the claim; a rejected premise, a counterfactual or a contrast half is never shown as the point
  const REPORTABLE = ["planned", "hypothesis", "quoted-speech"];
  const framed = (t, n) => REPORTABLE.includes(n.kind) && !norm(n.text).includes(norm(t)) && (HARD[0].re.test(t) || /["“”]|(said|says|told|tells|asked|asks|wrote|writes)/i.test(t));
  const fromNotAsserted = (t, k = 0.7) => na.find((n) => n && n.text && t && (norm(n.text).includes(norm(t)) || overlap(t, n.text) >= k) && !framed(t, n));
  if (c.evidence) {
    const hit = fromNotAsserted(c.evidence);
    if (hit) err(`evidence comes from a part the narration does not assert (${hit.kind}: "${hit.text}") — quote the asserted claim`);
    const span = sentenceSpan(narration, c.evidence);
    for (const q of SOFT) if (q.re.test(span)) {
      const resolved = na.length > 0 || (!q.strict && cl && typeof cl.cueCheck === "string" && cl.cueCheck.trim().length >= 12);
      if (!resolved) err(`the sentence of your evidence carries a ${q.kind} cue — list what is not asserted in claim.notAsserted${q.strict ? "" : " (or say in claim.cueCheck why the cue does not change the claim)"}`);
    }
  }

  if (c.type === "H") {
    if (c.text && fromNotAsserted(c.text, 0.6)) err("quote card: the text comes from a part the narration does not assert — quote the asserted claim");
    const quoted = /["“”]/.test(c.text || "") || (cl && cl.speaker && cl.speaker !== "narrator");
    if (quoted && !(cl && typeof cl.speaker === "string" && cl.speaker.trim() && cl.speaker !== "narrator")) err("quote card of quoted speech: claim.speaker must name who says it (it is shown on the card)");
    return E;
  }

  // ── staged (A / B): one relation, grounded in the evidence, asserted as fact ──
  if (cl && !STAGED_POLARITY.includes(cl.polarity)) err(`a ${cl.polarity} claim cannot be staged as an event that happened — use a quote card (type H)`);
  const contrastResolved = !!cl && cl.polarity === "contrast" && na.length > 0;
  for (const h of HARD) if (c.evidence && h.re.test(c.evidence) && !(h.kind === "negation" && contrastResolved)) err(`the evidence carries a ${h.kind} cue ("${(c.evidence.match(h.re) || [""])[0]}") — a staged scene would show it as a real event; use a quote card (type H)`);
  const ents = Array.isArray(c.entities) ? c.entities : [];
  const evs = Array.isArray(c.events) ? c.events : [];
  if (ents.length > MAX_ENTITIES) err(`one relation: at most ${MAX_ENTITIES} entities`);
  if (evs.length !== 1) err("one relation: exactly one event (one cause, its effect)");
  if ((c.lanes || 1) !== 1) err("one relation: one lane");
  const seen = new Map();
  for (const e of ents) {
    const keys = [e.label && `label:${norm(e.label)}`, e.kind === "person" && e.cast && `cast:${e.cast}`, e.kind === "object" && e.glyph && `glyph:${e.glyph}`].filter(Boolean);
    for (const k of keys) { if (seen.has(k)) err(`entity "${e.id}" duplicates "${seen.get(k)}" (${k}) — one thing is drawn once`); else seen.set(k, e.id); }
    const lab = nameOf(e, ctx);
    if (lab && na.some((n) => n && n.text && named(lab, n.text)) && !named(lab, c.evidence || "")) err(`entity "${e.id}": "${lab}" comes from a part the narration does not assert`);
  }
  const byId = Object.fromEntries(ents.map((e) => [e.id, e]));
  // the relation must be stated where the evidence is: its sentence(s) and the sentence on either side; a person may be
  // referred to there by a pronoun ("you", "he", …)
  const sents = sentences(narration);
  const at = sents.map((x, i) => (norm(x).includes(norm(c.evidence)) || norm(c.evidence).includes(norm(x)) || overlap(c.evidence || "", x) > 0.5 ? i : -1)).filter((i) => i >= 0);
  const span = at.length ? sents.slice(Math.max(0, Math.min(...at) - 1), Math.max(...at) + 2).join(" ") : (c.evidence || "");
  const PRONOUN = /\b(you|your|he|she|they|him|her|them|we|his|their|someone|people)\b/i;
  const mustName = (id, role) => {
    const e = byId[id]; if (!e) return;
    const lab = nameOf(e, ctx);
    if (e.kind === "person" && ((lab && named(lab, span)) || PRONOUN.test(span))) return;
    if (!lab) err(`${role} "${id}" needs a label (or a cast name) so the evidence can name it`);
    else if (!named(lab, span)) err(`${role} "${id}" ("${lab}") is not named where the evidence is (its sentence or the one before / after) — the narration must state this end of the relation`);
  };
  for (const ev of evs) {
    mustName(ev.cause, "cause");
    for (const f of ev.effects || []) { if (f.entity !== ev.cause) mustName(f.entity, "effect"); if (f.moveTo) mustName(f.moveTo, "moveTo target"); }
  }
  return E;
}

/** compile a valid contract onto its source scene (same id, timing, set, transition) */
function compile(c, scene) {
  const out = V1.compile({ ...c, schema: "semantic-director/1" }, scene);
  const spec = { ...out.semantic, capability: SCHEMA };
  if (c.type === "H" && c.claim && c.claim.speaker && c.claim.speaker !== "narrator") spec.speaker = c.claim.speaker;
  delete out.semantic;
  return { ...out, singleRelation: spec };
}

/** a book opts in by meta.singleRelation; without it the renderer ignores every singleRelation field */
function enable(config) { return { ...config, meta: { ...config.meta, singleRelation: true } }; }

module.exports = { SCHEMA, TYPES, POLARITY, NOT_KINDS, MAX_ENTITIES, HARD, SOFT, validate, compile, enable };
