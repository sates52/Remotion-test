/**
 * proposition.js — P9-B: the Proposition Authoring Contract.
 *
 * P9-A made the engine unable to LOSE authored meaning (DROPPED = HARD).
 * P9-B lets the author STATE meaning as a two-pole proposition the machine can
 * verify: relation + poles[] + asserted/rejected + evidence + visual. The
 * architectural rule (operator, 2026-10-06):
 *
 *   P9-A: the author's meaning must not be lost.
 *   P9-B: the author must be able to EXPRESS meaning, two-poled.
 *
 * THE COMPILER IS THE CONTRACT (detect → brief requirement → verify):
 *   1. DETECT   — `detectProposition()` derives a detector-grade proposition
 *                 from the beat's own words (src:"detector"; never trusted as
 *                 the author's claim).
 *   2. REQUIRE  — the brief carries it (`brief.proposition`); the author may
 *                 overwrite it via the emit/merge pass (src:"author"). This
 *                 file never writes a scene.
 *   3. VERIFY   — `stagedPoles()` judges a PLANNED SCENE against the authored
 *                 proposition from the config alone (render-bundle safe), the
 *                 same way authorship.js judges a dropped icon.
 *
 * Shape (NO `concept2` — poles are a plural list; entities are plural):
 *   {
 *     relation: "contrast"|"cause_effect"|"said_vs_real"|"before_after"|"equivalence"|"none",
 *     poles: [ { text, entity, status: "asserted"|"rejected" } ],   // 1..3
 *     evidence: "<narration span the proposition is grounded in>",
 *     visual: {
 *       representation: "split"|"beforeAfter"|"flow"|"equivalence"|"twoShot"|"icon"|null,
 *       icon: "<CONCEPT_LEXICON name>"|null,          // single-pole staging
 *       perCast: [ { entity, face, action, holds } ],  // per-cast semantic roles
 *     },
 *     src: "author"|"detector",
 *   }
 *
 * The renderer already draws every lever the contract names: shot split /
 * beforeAfter / flow / twoShot (schema.ts), per-cast face (expression) /
 * action / holds, texts style "strike" for a rejected pole, props arcs. The
 * contract only names them; the planner stages them.
 */

const { detectRelation, negationScopes, tokenizeWords } = require("./vox-semantic.cjs");

// ── Closed enums ─────────────────────────────────────────────────────────────

const RELATIONS = ["contrast", "cause_effect", "said_vs_real", "before_after", "equivalence", "none"];
const POLE_STATUSES = ["asserted", "rejected"];
const REPRESENTATIONS = ["split", "beforeAfter", "flow", "equivalence", "twoShot", "icon", "none"];

/** The shots that can carry BOTH poles of a relation on one frame. */
const TWO_SIDED_SHOTS = new Set(["twoShot", "split", "beforeAfter", "overShoulder"]);

// ── Normalize / validate ─────────────────────────────────────────────────────

const isStr = (v) => typeof v === "string";
const cleanStr = (v) => (isStr(v) ? v.trim() : "");

/**
 * Validate + normalize one raw proposition (from a brief, an art file, or the
 * detector). Returns { ok, prop, errors }. Structural nonsense is an ERROR,
 * never a silent fallback — the contract is closed like CODES is.
 */
function normalizeProposition(raw) {
  const errors = [];
  if (!raw || typeof raw !== "object") return { ok: false, prop: null, errors: ["proposition must be an object"] };

  const relation = RELATIONS.includes(raw.relation) ? raw.relation : null;
  if (!relation) errors.push(`relation must be one of ${RELATIONS.join("|")}`);

  const poles = [];
  if (!Array.isArray(raw.poles) || !raw.poles.length) {
    errors.push("poles must be a non-empty array (plural by design — there is no concept2)");
  } else {
    if (raw.poles.length > 3) errors.push("at most 3 poles");
    for (const [k, p] of raw.poles.slice(0, 3).entries()) {
      const text = cleanStr(p && p.text);
      const entity = cleanStr(p && p.entity) || null;
      const status = p && POLE_STATUSES.includes(p.status) ? p.status : null;
      if (!text && !entity) errors.push(`pole[${k}]: text or entity required`);
      if (!status) errors.push(`pole[${k}]: status must be asserted|rejected`);
      else poles.push({ text, entity, status });
    }
  }

  const visual = raw.visual && typeof raw.visual === "object" ? raw.visual : {};
  const representation = visual.representation == null || visual.representation === ""
    ? null
    : (REPRESENTATIONS.includes(visual.representation) ? visual.representation : (errors.push(`visual.representation must be one of ${REPRESENTATIONS.join("|")}`), null));
  const icon = cleanStr(visual.icon) || null;
  const perCast = Array.isArray(visual.perCast)
    ? visual.perCast.slice(0, 3).map((c) => ({
        entity: cleanStr(c && c.entity),
        face: cleanStr(c && c.face) || null,
        action: cleanStr(c && c.action) || null,
        holds: cleanStr(c && c.holds) || null,
      })).filter((c) => c.entity)
    : [];

  const src = raw.src === "author" ? "author" : "detector";
  const evidence = cleanStr(raw.evidence) || null;
  if (!evidence && src === "author") errors.push("evidence required for an authored proposition (which narration span says this)");

  if (errors.length) return { ok: false, prop: null, errors };
  return {
    ok: true,
    prop: { relation, poles, evidence, visual: { representation, icon, perCast }, src },
    errors,
  };
}

// ── DETECT (brief-writer input; never trusted as the author's claim) ─────────

/** Content words carry a pole; markers/articles/verbs-of-being/pronouns do not. */
const STOPWORDS = new Set(["a", "an", "the", "of", "to", "in", "on", "at", "is", "was", "are", "were", "it", "its", "that", "this", "and", "or", "for", "with", "as", "be", "been", "about", "not", "no", "never", "but", "however", "yet", "though", "although", "instead", "rather", "than", "actually", "just", "only", "so", "he", "she", "they", "we", "you", "his", "her", "their", "our", "my", "your"]);

/** Clause-split markers — the FIRST one (searched in this order, so compound
 *  markers like "in reality" beat their inner words) cuts the beat in two. */
const SPLIT_MARKERS = [
  [/\bin reality\b/i, "said_vs_real"], [/\bthe truth is\b/i, "said_vs_real"], [/\bsupposedly\b/i, "said_vs_real"],
  [/\bactually\b/i, "said_vs_real"], [/\bpretends?\b/i, "said_vs_real"], [/\bclaims?\b/i, "said_vs_real"],
  [/\bcalls? (?:it|this)\b/i, "said_vs_real"], [/\bseems?\b/i, "said_vs_real"], [/\bappears?\b/i, "said_vs_real"],
  [/\breally\b/i, "said_vs_real"],
  [/\binstead of\b/i, "contrast"], [/\brather than\b/i, "contrast"], [/\bas opposed to\b/i, "contrast"],
  [/\bon the other hand\b/i, "contrast"], [/\bin contrast\b/i, "contrast"], [/\bnot just\b/i, "contrast"],
  [/\bhowever\b/i, "contrast"], [/\bwhereas\b/i, "contrast"], [/\balthough\b/i, "contrast"], [/\bthough\b/i, "contrast"],
  [/\bbut\b/i, "contrast"], [/\byet\b/i, "contrast"], [/\bwhile\b/i, "contrast"],
  [/\bbecause\b/i, "cause_effect"], [/\bsince\b/i, "cause_effect"], [/\btherefore\b/i, "cause_effect"],
  [/\bthus\b/i, "cause_effect"], [/\bhence\b/i, "cause_effect"], [/\bso that\b/i, "cause_effect"],
  [/\bleads? to\b/i, "cause_effect"], [/\bled to\b/i, "cause_effect"], [/\bresults? in\b/i, "cause_effect"],
  [/\bcauses?\b/i, "cause_effect"], [/\bas a result\b/i, "cause_effect"],
];

/** The head content words of a clause — the pole's text (≤3 content words). */
function poleTextOfClause(clause) {
  const words = tokenizeWords(clause).filter((w) => !STOPWORDS.has(w));
  return words.length ? words.slice(0, 3).join(" ") : null;
}

/** Longest contiguous run of one negation scope, trimmed to content words. */
function poleTextFromRun(words, scopes, statuses) {
  let best = null;
  let i = 0;
  while (i < words.length) {
    if (!statuses.has(scopes[i])) { i++; continue; }
    let j = i;
    while (j < words.length && statuses.has(scopes[j])) j++;
    const run = words.slice(i, j).filter((w) => !STOPWORDS.has(w));
    if (run.length && (!best || run.length > best.length)) best = run;
    i = j;
  }
  return best ? best.slice(0, 3).join(" ") : null;
}

const BEFORE_AFTER_RE = /\b(used to|no longer|before[,.] |after[,.] |once .{2,40} now)\b/i;
const EQUIVALENCE_RE = /\b(is (?:just|really|simply)|the same as|amounts to|nothing more than|is another (?:form|name) of)\b/i;

/**
 * The deterministic detector: one proposition per beat's own words, or null.
 *
 * Clause-splitting: the FIRST relation marker cuts the beat into a pre-clause
 * and a post-clause, and the relation decides what the two sides MEAN —
 *   said_vs_real → the pre-clause is the REFUTED claim (rejected), the
 *                  post-clause is what is really true (asserted);
 *   cause_effect → cause (pre) → effect (post), both asserted;
 *   contrast     → with an explicit negation scope the rejected pole comes
 *                  from the negated run ("not X, but Y"); without one, both
 *                  sides are asserted poles in tension ("A, but B");
 *   before_after / equivalence → both sides asserted (or negation-scoped).
 * `castIndex` (array of {key, tokens:Set}) marks entity poles.
 */
function detectProposition(narration, { castIndex = [] } = {}) {
  const text = String(narration || "").trim();
  if (!text) return null;
  const { relation: base, marker } = detectRelation(text);
  const ba = BEFORE_AFTER_RE.test(text), eq = EQUIVALENCE_RE.test(text);

  const words = tokenizeWords(text);
  const scopes = negationScopes(text);
  const negRun = poleTextFromRun(words, scopes, new Set(["negated"]));
  // a negation scope alone (illusion / myth / lie clauses) is relation evidence too
  if (base === "none" && !ba && !eq && !negRun) return null;
  // negRun-only (illusion/myth/lie clause, no clause marker) = a rejected
  // claim against what stands — the neutral two-pole tension is contrast
  let relation = base !== "none" ? base : negRun && !ba && !eq ? "contrast" : (ba ? "before_after" : "equivalence");

  // cut at the first clause marker (searched in marker order so compound
  // markers like "in reality" beat their inner words); the post-clause starts
  // right after the marker itself, and the MARKER's relation governs what the
  // two sides mean
  let cut = -1, cutLen = 0, cutRel = null, cutMarker = null;
  for (const [re, rel] of SPLIT_MARKERS) {
    const m = text.match(re);
    if (m && m.index != null) { cut = m.index; cutLen = m[0].length; cutRel = rel; cutMarker = m[0]; break; }
  }
  if (cutRel) relation = cutRel;
  const pre = cut > 0 ? text.slice(0, cut) : null;
  const post = cut >= 0 ? text.slice(cut + cutLen) : null;

  const unpack = (c) => Array.isArray(c)
    ? { key: String(c[0] || ""), toks: [...(c[1] || [])] }
    : { key: String((c && c.key) || ""), toks: [...((c && c.tokens) || [])] };
  const entityFor = (t) => {
    const toks = new Set(String(t || "").toLowerCase().split(/[^a-z0-9']+/).filter(Boolean));
    const hit = castIndex.find((c) => { const { key, toks: ks } = unpack(c); return key && ks.some((k) => toks.has(k)); });
    return hit ? unpack(hit).key : null;
  };

  const poles = [];
  const add = (t, status) => {
    if (!t) return;
    if (poles.some((p) => p.text === t)) return;
    poles.push({ text: t, entity: entityFor(t), status });
  };

  if (relation === "said_vs_real" && pre && post) {
    add(poleTextOfClause(pre), "rejected");
    add(poleTextOfClause(post), "asserted");
  } else if (relation === "cause_effect" && pre && post) {
    add(poleTextOfClause(pre), "asserted");
    add(poleTextOfClause(post), "asserted");
  } else if (negRun) {
    // negation scope outranks the clause split: the negated run is the
    // rejected pole, the longest asserted run is the other side
    add(negRun, "rejected");
    add(poleTextFromRun(words, scopes, new Set(["asserted"])), "asserted");
  } else if (pre && post && (relation === "contrast" || relation === "before_after" || relation === "equivalence")) {
    add(poleTextOfClause(pre), "asserted");
    add(poleTextOfClause(post), "asserted");
  }
  if (!poles.length) return null;
  // One pole and no rejected side is a topic, not a proposition — the brief
  // already carries topics (subject/concept). Keep the contract two-poled.
  if (poles.length === 1 && poles[0].status === "asserted") return null;

  return normalizeProposition({
    relation,
    poles,
    evidence: cutMarker ? `marker "${cutMarker}"` : (marker ? `marker "${marker}"` : relation),
    visual: { representation: null, icon: null, perCast: [] },
    src: "detector",
  }).prop;
}

// ── VERIFY (config-only; the gate's judge) ───────────────────────────────────

const screenText = require("./screen-text");
const tokensOf = (t) => screenText.tokens(String(t || ""));
/** Do all of the pole's content tokens appear in the text's tokens? */
function textSays(poleText, textTokens) {
  const p = tokensOf(poleText).filter((w) => !STOPWORDS.has(w));
  if (!p.length) return false;
  return p.every((w) => textTokens.includes(w));
}

const iconOnScene = (s, icon) =>
  !!icon && !!(s.concept === icon
    || (s.props || []).some((p) => p && p.type === icon)
    || (s.characters || []).some((ch) => ch && ch.holds === icon));

/**
 * The AUTHOR'S pole→icon mapping, verbatim: an icon belongs to the pole whose
 * text (or entity) names it. Strict equality on purpose — the mapping is an
 * authored decision, never fuzzy-matched by the machine.
 */
function poleIconOwners(pole, prop) {
  const icon = prop && prop.visual && prop.visual.icon;
  if (!icon) return [];
  return (pole.text && pole.text === icon) || (pole.entity && pole.entity === icon) ? [icon] : [];
}

/** The renderer's strike lever: a REJECTED pole may appear only struck. */
const struckTexts = (s) => (Array.isArray(s.texts) ? s.texts.filter((t) => t && t.style === "strike") : []);
const plainTexts = (s) => (Array.isArray(s.texts) ? s.texts.filter((t) => t && t.style !== "strike") : []);
/**
 * A frame that structurally presents BOTH poles: split / beforeAfter / twoShot
 * always draw two sides; two motifs or a diagram state a relation; an
 * overShoulder only with both parties on stage; an authored two-pole
 * representation with at least one motif on the frame.
 */
const ALWAYS_TWO_SIDED = new Set(["split", "beforeAfter", "twoShot"]);
const compositionCoversBoth = (s, prop = null) => {
  if (ALWAYS_TWO_SIDED.has(s.shot)) return true;
  if ((s.props || []).length >= 2 || !!s.diagram) return true;
  if (s.shot === "overShoulder" && (s.characters || []).length >= 2) return true;
  const rep = prop && prop.visual && prop.visual.representation;
  if (rep && rep !== "icon" && rep !== "none" && (s.props || []).some((p) => p && p.type)) return true;
  return false;
};

/**
 * The wallpaper default (operator, P9-B brief): one actor whose whole
 * performance is idle/talk, no icon, no prop, no diagram, no strike — a
 * text-only frame with a statue. Independent of any proposition: this is the
 * shape the renderer fills an unstaged beat with (P7 root cause).
 */
function idleWallpaperOf(scene) {
  const chars = (scene && Array.isArray(scene.characters) && scene.characters) || [];
  const idleAction = (c) => !c.action || c.action === "idle" || c.action === "talk";
  return chars.length === 1
    && idleAction(chars[0])
    && !scene.concept
    && !(scene.props || []).some((p) => p && p.type)
    && !scene.diagram
    && !struckTexts(scene).length;
}

/**
 * Judge a planned scene against one proposition. Pure: reads the config scene,
 * writes nothing. Verdicts per pole:
 *   staged          — the pole's content is on screen
 *   struck          — a rejected pole shown struck (the honest rejection)
 *   missing         — nothing on screen carries it
 *   asserted-wrong  — a REJECTED pole shown unstruck as the scene's subject
 * Top-level:
 *   twoSided        — every pole anchored (the proposition reached the screen)
 *   unstaged        — 2+ poles, fewer than 2 anchored (one pole carried it)
 *   poleViolation   — a rejected pole asserted as the subject
 *   idleWallpaper   — single actor, idle/talk, nothing else on the frame
 */
function stagedPoles(scene, prop) {
  const out = { verdicts: [], twoSided: false, unstaged: false, poleViolation: false, idleWallpaper: false };
  out.idleWallpaper = idleWallpaperOf(scene);
  if (!scene || !prop || !Array.isArray(prop.poles) || !prop.poles.length) return out;

  const chars = Array.isArray(scene.characters) ? scene.characters : [];
  const identities = new Set(chars.map((c) => c && c.identity).filter(Boolean));
  const struck = struckTexts(scene).map((t) => tokensOf(t.text));
  const plain = plainTexts(scene).map((t) => tokensOf(t.text));
  const composition = compositionCoversBoth(scene, prop);

  for (const pole of prop.poles) {
    const owned = poleIconOwners(pole, prop);
    let v = "missing";
    if (pole.entity && identities.has(pole.entity)) {
      v = "staged";
    } else if (pole.entity) {
      const pc = (prop.visual && prop.visual.perCast || []).find((c) => c.entity === pole.entity);
      if (pc && identities.has(pc.entity)) v = "staged";
    }
    if (v === "missing" && owned.length && owned.some((ic) => iconOnScene(scene, ic))) v = "staged";
    if (v === "missing" && pole.text) {
      if (iconOnScene(scene, pole.text)) v = "staged";
      else if (struck.some((tk) => textSays(pole.text, tk))) v = "struck";
      else if (plain.some((tk) => textSays(pole.text, tk))) v = pole.status === "rejected" ? "asserted-wrong" : "staged";
      else if (composition) v = "staged"; // the two-pole composition carries the tension
    }
    if (v === "staged" && pole.status === "rejected" && plain.length && !composition && !owned.length && !iconOnScene(scene, pole.text)) {
      // a rejected pole carried ONLY by plain copy on a one-pole frame is the
      // frame's own assertion (a strike would have been the honest rejection)
      v = "asserted-wrong";
    }
    out.verdicts.push({ pole: pole.text || pole.entity, status: pole.status, state: v });
  }

  const anchored = out.verdicts.filter((v) => v.state === "staged" || v.state === "struck").length;
  out.poleViolation = out.verdicts.some((v) => v.state === "asserted-wrong");
  out.twoSided = prop.poles.length >= 2 && anchored >= prop.poles.length && !out.poleViolation;
  out.unstaged = prop.poles.length >= 2 && !out.twoSided && !out.poleViolation;
  return out;
}

/**
 * The compact seal for `_authorship.propositionAuthored` — the authored
 * proposition as the config-only gate must see it (no brief file needed).
 * Detector propositions are NOT sealed: the gate judges author-given meaning.
 */
function sealFor(prop) {
  if (!prop || prop.src !== "author" || !Array.isArray(prop.poles) || !prop.poles.length) return null;
  return {
    relation: prop.relation,
    poles: prop.poles.map((p) => ({ text: p.text || null, entity: p.entity || null, status: p.status })),
    representation: (prop.visual && prop.visual.representation) || null,
    icon: (prop.visual && prop.visual.icon) || null,
    perCast: ((prop.visual && prop.visual.perCast) || []).map((c) => ({ entity: c.entity, face: c.face || null, action: c.action || null, holds: c.holds || null })),
  };
}

/**
 * P9-B stager: put the AUTHOR-SEALED proposition's poles on the scene with
 * levers the renderer draws today (verified against schema.ts/shots.ts):
 *   split / beforeAfter / twoShot → scene.shot (the both-poles frames)
 *   flow                          → an AUTHORED flow diagram (cause → effect)
 *   perCast[]                     → per-cast face/action/holds (enum-checked)
 *   visual.icon                   → scene.concept (no cast) or a held hand-prop
 * Only author-sealed propositions stage (detector-grade never does); every
 * skip is recorded, nothing is invented (the P9-A A4 rule). Mutates ONLY the
 * representational levers named by the seal — never the narration or the copy.
 */
function stageProposition(seal, scene, { expressionEnum = null, actionEnum = null, holdsEnum = null, sceneIcons = null } = {}) {
  const out = { staged: [], skipped: [] };
  if (!seal || !Array.isArray(seal.poles) || !scene) {
    if (seal) out.skipped.push({ lever: "all", reason: "proposition needs two poles and a scene" });
    return out;
  }
  const note = (lever, detail) => out.staged.push({ lever, detail });
  const skip = (lever, reason) => out.skipped.push({ lever, reason });
  const rep = seal.representation;

  if (rep === "split" || rep === "beforeAfter" || rep === "twoShot") {
    if (scene.shot !== rep) { note("shot", `${scene.shot}→${rep} (authored ${seal.relation})`); scene.shot = rep; }
    else skip("shot", `already ${rep}`);
  } else if (rep === "flow" && !scene.diagram) {
    scene.diagram = { type: "flow", labels: seal.poles.map((p) => p.text || p.entity || "").filter(Boolean).slice(0, 2), at: 0, authored: true };
    if (scene._authorship) scene._authorship.diagramAuthored = true;
    note("diagram", "authored flow diagram carries the cause→effect poles");
  } else if (rep === "equivalence") {
    skip("representation", "equivalence has no dedicated shot — stage it via perCast faces/holds (the renderer has no equivalence shot)");
  } else if (rep) {
    skip("representation", `unknown representation "${rep}"`);
  }

  (seal.perCast || []).forEach((pc, k) => {
    const ch = (scene.characters || []).find((c) => c && c.identity === pc.entity);
    if (!ch) { skip(`perCast[${k}]`, `no staged cast member "${pc.entity}"`); return; }
    if (pc.face) {
      if (expressionEnum && expressionEnum.has(pc.face)) { if (ch.expression !== pc.face) { note(`perCast[${k}].face`, `${ch.expression}→${pc.face}`); ch.expression = pc.face; } }
      else skip(`perCast[${k}].face`, `"${pc.face}" is not a renderer expression`);
    }
    if (pc.action) {
      if (actionEnum && actionEnum.has(pc.action)) { if (ch.action !== pc.action) { note(`perCast[${k}].action`, `${ch.action}→${pc.action}`); ch.action = pc.action; } }
      else skip(`perCast[${k}].action`, `"${pc.action}" is not a renderer action`);
    }
    if (pc.holds) {
      if (holdsEnum && holdsEnum.has(pc.holds)) { if (ch.holds !== pc.holds) { note(`perCast[${k}].holds`, `${ch.holds || "none"}→${pc.holds}`); ch.holds = pc.holds; } }
      else skip(`perCast[${k}].holds`, `"${pc.holds}" is not a renderer hand prop`);
    }
  });

  if (seal.icon && (!sceneIcons || sceneIcons.includes(seal.icon)) && !iconOnScene(scene, seal.icon)) {
    const chars = scene.characters || [];
    if (!chars.length) {
      // PIXEL-PROOF FIX (P9-B.2a smoke): scene.concept alone is telemetry — the
      // renderer never reads it, so a concept-only staging drew NOTHING. The
      // icon now stages twice: concept (the beat's subject, config-level) AND a
      // drawn prop motif the renderer paints (every SCENE_ICON is a propType).
      note("concept", `authored pole icon "${seal.icon}" on the empty frame (concept + drawn prop)`);
      scene.concept = seal.icon;
      if (!Array.isArray(scene.props)) scene.props = [];
      if (!scene.props.some((p) => p && p.type === seal.icon)) scene.props.push({ type: seal.icon, at: 0 });
    }
    else if (holdsEnum && holdsEnum.has(seal.icon)) { note("holds", `authored pole object "${seal.icon}" into the staged hand`); chars[0].holds = seal.icon; }
    else skip("icon", `cast present and "${seal.icon}" is not a hand prop — the composition stays the author's`);
  } else if (seal.icon && sceneIcons && !sceneIcons.includes(seal.icon)) {
    skip("icon", `"${seal.icon}" is not a scene icon (world vocabulary)`);
  }
  return out;
}

module.exports = {
  RELATIONS, POLE_STATUSES, REPRESENTATIONS, TWO_SIDED_SHOTS,
  normalizeProposition, detectProposition, stagedPoles, sealFor, stageProposition, idleWallpaperOf,
};
