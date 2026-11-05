/**
 * semantic-director-v2.js — SEMANTIC FILM DIRECTOR 2.0 (cycle 12, experiment branch dev/c12). Builds on v1
 * (semantic-director.js, frozen for arm B) with three capacities, each changing what is drawn — not metadata:
 *
 * 1. CLAIM LOGIC (own, from the C11 failure analysis). The contract says what the narration ASSERTS and what it only
 *    mentions without asserting (claim.notAsserted: a rejected premise, a counterfactual, a hypothesis, a question,
 *    quoted speech, an uncertain claim, the setup half of a contrast). The compiler refuses a contract whose evidence,
 *    quote card or labels come from a not-asserted part; a sentence carrying a strong cue (I hear your point / should /
 *    maybe / even though / not because / ? / quotes …) must be resolved (what is not asserted, or why the cue does not
 *    apply). A rejected idea can be SHOWN only as rejected: an entity marked negated:true is drawn crossed out.
 * 2. SHOT READS (CineCode shots.json reads[{t,read}], validate_shots.py, craft.md — technique adaptation). Every
 *    contract lists, in order, what the viewer must read and when (fractions of the beat). New information gets
 *    >= 1.5 s, on-screen text >= 0.6 s + 0.25 s per word, and the RESULT read starts by 70 % and holds to the end. The
 *    compiler times every event from the reads (the change completes as its result read begins) — the author no
 *    longer places events by hand.
 * 3. VISUAL PROOF (CineCode styles/visual-proof.md + iso-infographic.md, technique adaptation). The stage is built
 *    piece by piece (an entity enters at its first read), only the read in focus is at full strength (the rest
 *    desaturated, never ghosted), and the change verb must match the claim: level (value), mood, presence, move,
 *    break, and three new verbs — size (widen / narrow), cover (one thing laid over another that stays underneath),
 *    reveal (something found that was already there: no causal token, a sight-line instead).
 * Camera purpose changes the camera: hold / compare = locked; consequence = a slow push toward the result while it
 * is read; reveal = start close on the cause and open to the whole incident. Quote cards stand on a neutral ground,
 * never on the source scene's set, with the speaker when it is not the narrator.
 */
"use strict";
const V1 = require("./semantic-director");

const POLARITY = ["asserted", "negated", "contrast"];
const NOT_KINDS = ["rejected-premise", "counterfactual", "hypothesis", "question", "quoted-speech", "uncertain", "setup-half-of-contrast"];
const FALLBACK = ["no-visual-mechanism", "the-sentence-is-the-point", "named-quote"];
const CAMERA = ["hold", "compare", "consequence", "reveal"];
const FPS = 30;
const TIMING = { token: 16, pause: 14, change: 20 };
// strong cues: a sentence carrying one of these may not be shown as a plain asserted fact without resolving it
const CUES = [
 { kind: "rejected-premise", re: /\b(i hear (your|you)|you might think|people (think|assume|believe|say)|it'?s (tempting|easy) to (think|assume)|the (myth|misconception)|contrary to|that'?s not)\b/i },
 { kind: "counterfactual", re: /\b(should(n'?t)? (just|have)|would have|supposed to|expected to|ought to)\b/i },
 { kind: "hypothesis", re: /\b(what if|imagine|suppose|let'?s say)\b/i },
 { kind: "uncertain", re: /\b(maybe|perhaps|arguably|you (could|might) argue|possibly)\b/i },
 { kind: "setup-half-of-contrast", re: /\b(not because|instead of|rather than|even though|although)\b/i },
 { kind: "question", re: /\?/ },
 { kind: "quoted-speech", re: /["“”]/ },
];

const norm = (s) => String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter(Boolean);
const sentences = (t) => String(t || "").split(/(?<=[.!?])\s+/).filter(Boolean);
function overlap(a, b) { // share of a's words found in b (order-free)
  const aw = words(a), bw = new Set(words(b));
  return aw.length ? aw.filter((w) => bw.has(w)).length / aw.length : 0;
}
/** the cues of the sentence(s) the evidence comes from */
function cuesAround(narration, evidence) {
  const ne = norm(evidence);
  const hit = sentences(narration).filter((s) => { const ns = norm(s); return ns && (ns.includes(ne) || ne.includes(ns) || overlap(evidence, s) > 0.6); });
  const span = hit.length ? hit.join(" ") : narration;
  return CUES.filter((c) => c.re.test(span)).map((c) => c.kind);
}

function validate(c, ctx) {
  const E = [];
  const err = (m) => E.push(m);
  if (!c || c.schema !== "semantic-director/2") return ['schema must be "semantic-director/2"'];
  // the v1 rules still hold (types, verbatim evidence, labels, glyphs, visible changes, same-scale comparison, …),
  // except the event timing (reads time events now) and the v1 verbs (v2 adds size / cover / reveal)
  const v1 = { ...c, schema: "semantic-director/1", events: (c.events || []).map((e) => ({ ...e, at: 0.3, effects: (e.effects || []).filter((f) => !("size" in f || "cover" in f || "reveal" in f)) })) };
  if (v1.events.some((e) => !e.effects.length)) v1.events = v1.events.filter((e) => e.effects.length);
  for (const m of V1.validate(v1, ctx)) {
    if (/needs at least one event/.test(m) && (c.events || []).length) continue; // its effects are v2 verbs
    if (/effect must land on something other than the cause/.test(m) && (c.events || []).some((e) => e.effects.some((f) => f.entity !== e.cause))) continue;
    err(m);
  }
  const narration = ctx.narration || "";
  // ── 1. CLAIM LOGIC ─────────────────────────────────────────────────────────
  const cl = c.claim;
  if (!cl || typeof cl.asserted !== "string" || !cl.asserted.trim()) err("claim.asserted: the claim the narration asserts here (one sentence)");
  else {
    if (!POLARITY.includes(cl.polarity)) err(`claim.polarity is ${POLARITY.join(" / ")}`);
    if (!Array.isArray(cl.notAsserted)) err("claim.notAsserted: [] or the parts the narration mentions without asserting");
    const na = Array.isArray(cl.notAsserted) ? cl.notAsserted : [];
    na.forEach((n, i) => {
      if (!NOT_KINDS.includes(n && n.kind)) err(`claim.notAsserted[${i}].kind is ${NOT_KINDS.join(" / ")}`);
      if (!n || !n.text || !norm(narration).includes(norm(n.text))) err(`claim.notAsserted[${i}].text must be a verbatim quote of the narration`);
    });
    for (const n of na) if (n && n.text && c.evidence && (norm(n.text).includes(norm(c.evidence)) || overlap(c.evidence, n.text) >= 0.7))
      err(`evidence comes from a part the narration does not assert (${n.kind}: "${n.text}") — quote the asserted claim`);
    const cues = cuesAround(narration, c.evidence || "");
    if (cues.length && !na.length && !(cl.cueCheck && String(cl.cueCheck).trim().length >= 12))
      err(`the sentence of your evidence carries a ${cues.join(" / ")} cue — list what is not asserted in claim.notAsserted, or say in claim.cueCheck why the cue does not change the claim`);
    if (cl.polarity === "contrast" && !(c.entities || []).some((e) => e.negated)) err("polarity contrast: show the rejected side as an entity with negated: true");
    if (cl.speaker && cl.speaker !== "narrator" && !(ctx.cast || []).includes(cl.speaker) && typeof cl.speaker !== "string") err("claim.speaker: narrator, a cast key or a short name");
    for (const e of c.entities || []) if (e.negated) {
      if (!na.some((n) => overlap(e.label || "", n.text) >= 0.5)) err(`entity "${e.id}": a negated entity shows a not-asserted part — its label must come from claim.notAsserted`);
    }
    if (c.type === "H") {
      if (!FALLBACK.includes(c.fallbackReason)) err(`type H needs fallbackReason: ${FALLBACK.join(" / ")}`);
      for (const n of na) if (overlap(c.text || "", n.text) >= 0.5) err(`the quote card shows a not-asserted part (${n.kind}: "${n.text}") — show the asserted claim`);
    }
  }
  // ── 2. SHOT READS ──────────────────────────────────────────────────────────
  const dur = ctx.durationFrames || 300;
  const reads = Array.isArray(c.reads) ? c.reads : [];
  if (!reads.length) err("reads: list, in order, what the viewer must read and when ({at:[from,to], focus, what})");
  if (reads.length > 4) err("reads: at most 4 — one thing at a time");
  const ids = new Set((c.entities || []).map((e) => e.id));
  let prev = -1;
  reads.forEach((r, i) => {
    const w = `reads[${i}]`;
    if (!Array.isArray(r.at) || r.at.length !== 2 || !(r.at[0] >= 0 && r.at[1] <= 1 && r.at[0] < r.at[1])) { err(`${w}.at: [from, to] fractions of the beat`); return; }
    if (r.at[0] < prev) err(`${w}: reads are in order`);
    prev = r.at[0];
    if (r.focus !== "text" && !ids.has(r.focus)) err(`${w}.focus: an entity id (or "text" for type H)`);
    const sec = ((r.at[1] - r.at[0]) * dur) / FPS;
    if (sec < 1.5) err(`${w}: ${sec.toFixed(1)} s is too short to read — new information needs >= 1.5 s`);
    if (r.focus === "text") { const need = 0.6 + 0.25 * words(c.text).length; if (sec < need) err(`${w}: the quote needs ${need.toFixed(1)} s on screen (0.6 s + 0.25 s per word)`); }
    if (!r.what || !String(r.what).trim()) err(`${w}.what: what the viewer reads here`);
  });
  if (reads.length) {
    const last = reads[reads.length - 1];
    if (Array.isArray(last.at) && (last.at[0] > 0.7 || last.at[1] < 0.95)) err("the last read is the result: it starts by 0.70 and holds to the end (>= 0.95)");
  }
  if (c.type !== "H" && c.type !== "G") for (const ev of c.events || []) {
    const targets = ev.effects.map((f) => f.entity);
    if (!reads.some((r) => targets.includes(r.focus) && r.focus !== ev.cause)) err(`event caused by "${ev.cause}": one read must focus the entity it changes (the change is timed to that read)`);
  }
  // ── 3. VISUAL PROOF verbs ──────────────────────────────────────────────────
  for (const [i, ev] of (c.events || []).entries()) for (const f of ev.effects || []) {
    const ent = (c.entities || []).find((e) => e.id === f.entity);
    if ("size" in f && !(typeof f.size === "number" && f.size >= 0.4 && f.size <= 2.5 && Math.abs(f.size - 1) >= 0.25)) err(`event ${i}: size is a scale 0.4..2.5 that changes by >= 0.25 (widen > 1, narrow < 1)`);
    if ("cover" in f && (!ids.has(f.cover) || f.cover === f.entity)) err(`event ${i}: cover names the other entity that stays underneath`);
    if ("reveal" in f && !(f.reveal === true && ent && ent.present === false)) err(`event ${i}: reveal shows an entity that starts present: false (something found that was there)`);
  }
  if (c.camera && !CAMERA.includes(c.camera.purpose)) err(`camera.purpose is ${CAMERA.join(" / ")}`);
  return E;
}

/** compile: reads time the events (the change completes when its result read begins) */
function compile(c, scene) {
  const dur = scene.durationFrames;
  const reads = (c.reads || []).map((r) => ({ from: Math.round(r.at[0] * dur), to: Math.round(r.at[1] * dur), focus: r.focus, what: r.what }));
  const occ = [];
  for (const ev of c.events || []) {
    const targets = ev.effects.map((f) => f.entity);
    const r = reads.find((x) => targets.includes(x.focus) && x.focus !== ev.cause) || reads[reads.length - 1];
    const cue = Math.max(Math.round(0.06 * dur), r.from - (TIMING.token + TIMING.pause + TIMING.change));
    occ.push({ cause: ev.cause, cue, effects: ev.effects.map((f) => ({ ...f })) });
  }
  occ.sort((a, b) => a.cue - b.cue);
  const enter = {}; // an entity enters at the first read that focuses it (visual proof: built piece by piece)
  for (const e of c.entities || []) { const r = reads.find((x) => x.focus === e.id); enter[e.id] = r ? Math.max(0, r.from - 8) : 0; }
  // the cause of the first event enters with the first read at the latest
  const spec = {
    v: 2, type: c.type, lanes: c.lanes === 2 ? 2 : 1, laneLabels: c.laneLabels, text: c.text,
    speaker: c.claim && c.claim.speaker && c.claim.speaker !== "narrator" ? c.claim.speaker : null,
    entities: (c.entities || []).map((e) => ({ id: e.id, kind: e.kind, label: e.label, glyph: e.glyph, cast: e.cast, value: e.value, mood: e.mood, present: e.present, lane: e.lane, negated: !!e.negated, enter: enter[e.id] })),
    occ, reads, camera: (c.camera && c.camera.purpose) || "hold", timing: TIMING,
  };
  const { id, fromFrame, durationFrames, bg, transition } = scene;
  return { id, fromFrame, durationFrames, bg, transition, shot: "wide", camera: { zoom: [1, 1], panX: [0, 0], panY: [0, 0] }, characters: [], props: [], texts: [], semantic: spec };
}

module.exports = { validate, compile, cuesAround, POLARITY, NOT_KINDS, FALLBACK, CAMERA, CUES, TIMING };
