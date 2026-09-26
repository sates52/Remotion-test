/**
 * authorship.js — Faz 0 (2026-09-24): nobody but an author may decide what a
 * beat shows.
 *
 * THE FAILURE. We Were Liars reached Studio with `beat-briefs.json →
 * authored: false`. Every brief was the heuristic's guess; 136/195 carried the
 * same intent ("Dramatize the thematic conflict of argument"); the lexicon
 * turned every spoken "text" into a phone (20 scenes) and every "romance" into
 * a heart. The narrative firewall SAW it — 90 "visual subject not grounded"
 * findings — and passed, because they were diagnostics. Nothing in the chain
 * said "this film was never authored".
 *
 * THE RULE. Each planned scene carries `_authorship` (stamped at plan time by
 * plan-antidote / plan-vox). gate-authorship.js reads the CONFIG only, so the
 * same check runs locally, in make-book and inside a render bundle:
 *   1. every non-title beat has an authored decision (art file / designs file /
 *      Claude brief) — a heuristic brief is not one;
 *   2. every prop on screen is one the authored decision produced — anything a
 *      later engine added (chapter payoff, novelty hero, stagnation remedy,
 *      adapter floor) is an engine-invented subject;
 *   3. an engine-detected diagram is the same thing;
 *   4. no single intent string covers more than 10% of beats, and no known
 *      heuristic template intent ships at all (safety rail, NOT a quality
 *      metric — 0% templates can still be a bad storyboard);
 *   5. no vocabulary from another book's world appears in generated fields
 *      unless this beat's own narration says it.
 * A config planned before this gate has no stamps and fails closed.
 */

// Brief provenance. `src` is per brief ("claude" | "heuristic"); the file flag
// alone was launderable — `--merge` of five briefs used to mark the whole file
// `authored: true`. Legacy authored files predate `src`: only a file whose
// flag is true AND whose briefs carry no `src` at all is trusted wholesale.
function isAuthoredBrief(b, file) {
  if (!b) return false;
  if (b.src) return b.src === "claude";
  return !!(file && file.authored === true);
}

const TEMPLATE_INTENT_RES = [
  /^Dramatize the thematic conflict of\b/i,
  /^Visual metaphor dramatizing the underlying\b/i,
];
const TEMPLATE_SHARE_MAX = 0.10;

// Vocabulary that belongs to one book's world (The Republic, which the semantic
// layer was first built on) and has leaked into others as defaults.
const FOREIGN_WORLD_TERMS = {
  "plato-republic": [
    "virtue and justice", "dialectical", "socrates", "socratic", "form of the good",
    "kallipolis", "fiveRegimes", "caveAllegory", "ringOfGyges", "shipOfState",
    "tripartiteSoul", "thirtyTyrants", "philosophical_exposition", "philosophical exchange",
    "elenctic", "thrasymachus", "philosopher-king", "oligarchic junta",
  ],
};

function authorshipStamp({ art = null, brief = null, propTypes = [], diagramAuthored = false, src: forced = null } = {}) {
  const src = forced || (art ? "art" : brief ? "brief" : "none");
  return {
    src,
    propTypes: [...new Set(propTypes)],
    diagramAuthored: !!diagramAuthored,
    intent: (brief && (brief.narrative_intent || brief.visual_intent)) || null,
  };
}

const isExemptScene = (s) => !s || s.id === "intro" || s.shot === "chapterCard" || s.type === "title" || s.type === "chapter";

function narrationOf(s) {
  return String(s._narration || s.narration || (s.props && !Array.isArray(s.props) && s.props.text) || "");
}

// Generated fields only: the narration itself (and fields copied verbatim from
// it) may legitimately name anything.
function generatedText(s) {
  // (Vox keeps the narration in props.text.)
  // A forbid list NAMING another world's motifs is the guard, not a leak.
  const skip = new Set(["_narration", "narration", "narrativeRelation", "claim", "_raw", "texts", "text", "captions", "_subject",
    "mustNotShow", "forbiddenSets", "forbiddenShots"]);
  return JSON.stringify(s, (k, v) => (skip.has(k) || /^forbidden/i.test(k) ? undefined : v)) || "";
}

function worldOf(bookWorldId, slug) {
  const w = String(bookWorldId || slug || "").toLowerCase();
  return /republic|plato/.test(w) ? "plato-republic" : null;
}

/**
 * @param {object} config  config.antidote.json or config.vox.json
 * @param {{engine?:string, slug?:string, worldId?:string}} ctx
 * @returns {{status:"PASS"|"FAIL", violations:object[], counts:object}}
 */
function evaluateAuthorship(config, ctx = {}) {
  const scenes = (config && (config.scenes || config.beats)) || [];
  const engine = ctx.engine || "antidote";
  const violations = [];
  const push = (code, s, message, extra = {}) => violations.push({ code, sceneId: s && s.id, message, ...extra });

  const beats = scenes.filter((s) => !isExemptScene(s));
  const unstamped = beats.filter((s) => !s._authorship);
  if (beats.length && unstamped.length) {
    push("UNSTAMPED_CONFIG", null,
      `${unstamped.length}/${beats.length} beats have no _authorship stamp — planned before the authorship gate; re-plan with authored inputs`);
  }

  const intents = new Map();
  let unauthored = 0;
  for (const s of beats) {
    const a = s._authorship;
    if (!a) continue;
    if (a.src === "none") {
      unauthored++;
      push("UNAUTHORED_BEAT", s, "no authored decision (art file / designs / Claude brief) for this beat");
    }
    if (engine === "antidote") {
      const drift = stagingDrift(s);
      if (drift.length) push("STAGING_OVERRIDDEN", s, `an engine restaged this authored beat (${drift.join("; ")}) — run gate-authorship --restore`);
      const allowed = new Set(a.propTypes || []);
      for (const p of s.props || []) {
        if (p && p.type && !allowed.has(p.type)) {
          push("ENGINE_INVENTED_PROP", s, `prop "${p.type}" was not produced by this beat's authored decision`, { prop: p.type });
        }
      }
      if (s.diagram && !s.diagram.authored && !a.diagramAuthored) {
        push("ENGINE_INVENTED_DIAGRAM", s, "diagram was detected by the engine, not authored");
      }
    }
    if (a.intent) {
      if (TEMPLATE_INTENT_RES.some((re) => re.test(a.intent))) push("TEMPLATE_INTENT", s, `template intent: "${a.intent}"`);
      intents.set(a.intent, (intents.get(a.intent) || 0) + 1);
    }
  }
  for (const [intent, n] of intents) {
    if (beats.length && n / beats.length > TEMPLATE_SHARE_MAX) {
      push("REPEATED_INTENT", null, `${n}/${beats.length} beats share one intent (>${TEMPLATE_SHARE_MAX * 100}%): "${intent}"`, { share: n / beats.length });
    }
  }

  const bookWorld = worldOf(ctx.worldId, ctx.slug);
  for (const [world, terms] of Object.entries(FOREIGN_WORLD_TERMS)) {
    if (world === bookWorld) continue;
    for (const s of scenes) {
      const gen = generatedText(s).toLowerCase();
      const said = narrationOf(s).toLowerCase();
      const hits = terms.filter((t) => gen.includes(t.toLowerCase()) && !said.includes(t.toLowerCase()));
      if (hits.length) push("FOREIGN_WORLD_LEAK", s, `vocabulary from ${world} in generated fields: ${hits.join(", ")}`, { terms: hits });
    }
  }

  const counts = violations.reduce((m, v) => ((m[v.code] = (m[v.code] || 0) + 1), m), {});
  return {
    status: violations.length ? "FAIL" : "PASS",
    violations,
    counts: { beats: beats.length, unauthored, ...counts },
  };
}

/**
 * Put every sealed authored staging (scene._authorship.lock, written by
 * plan-antidote) back after the post-plan engines ran. Returns the number of
 * scenes it had to repair. Idempotent; scenes without a lock are untouched.
 */
function stagingDrift(s) {
  const L = s._authorship && s._authorship.lock;
  if (!L) return [];
  const d = [], ch = s.characters || [], c0 = ch[0] || {};
  if (L.shot && s.shot !== L.shot) d.push(`shot ${L.shot}→${s.shot}`);
  if (L.set && s.bg && s.bg.set !== L.set) d.push(`set ${L.set}→${s.bg.set}`);
  if (Array.isArray(L.cast) && ch.map((x) => x.identity).join(",") !== L.cast.join(",")) d.push(`cast ${L.cast.join("+")}→${ch.map((x) => x.identity).join("+")}`);
  for (const f of ["expression", "action"]) if (L[f] && c0[f] !== L[f]) d.push(`${f} ${L[f]}→${c0[f]}`);
  if ((L.holds || null) !== (c0.holds || null)) d.push(`holds ${L.holds}→${c0.holds}`);
  if (ch.some((x) => x.emotion)) d.push("emotion overlay added");
  return d;
}
function restoreAuthoredStaging(config) {
  let repaired = 0;
  for (const s of (config && config.scenes) || []) {
    const L = s._authorship && s._authorship.lock;
    if (!L || !stagingDrift(s).length) continue;
    if (L.shot) s.shot = L.shot;
    if (L.set && s.bg) { s.bg.set = L.set; if (L.shot !== "split") delete s.bg.split; }
    const ch = s.characters || (s.characters = []);
    if (Array.isArray(L.cast)) {
      if (ch.length > L.cast.length) ch.length = L.cast.length;
      L.cast.forEach((id, k) => { if (ch[k]) { ch[k].identity = id; ch[k].role = id; } });
    }
    ch.forEach((x) => { delete x.emotion; delete x.emotionAt; });
    if (ch[0]) {
      if (L.expression) ch[0].expression = L.expression;
      if (L.action) ch[0].action = L.action;
      if (L.holds) ch[0].holds = L.holds; else delete ch[0].holds;
    }
    repaired++;
  }
  return repaired;
}

module.exports = {
  stagingDrift, restoreAuthoredStaging,
  isAuthoredBrief, authorshipStamp, evaluateAuthorship,
  TEMPLATE_INTENT_RES, TEMPLATE_SHARE_MAX, FOREIGN_WORLD_TERMS,
};
