/**
 * scene-router.js — SPIKE C (cycle 10, experiment branch dev/c10): a scene-level director that decides, for each
 * narration beat, WHAT a muted viewer must see and which renderer can show it best. Today the engine is chosen once
 * per BOOK (lib/engine-fit.js); a book about a real 1850s inventor that explains a mechanism gets one engine for both.
 *
 * Scene types (first rule that fires; deterministic, no model):
 *   concrete-action    a person physically does something to an object (pick up, hand over, drop, put down …)
 *   interaction        two people do something to / with each other (argue, hug, hand, confront, fire, hire …)
 *   causal-mechanism   one thing produces another (because, leads to, causes, so that, feedback, loop, triggers …)
 *   data-comparison    numbers / percentages / more-than / versus
 *   environmental      a place, an era, a landscape, a crowd scene (period look matters more than a deed)
 *   abstract-concept   everything else (an idea, a claim, a feeling)
 * Engine per type (the spike's proposal, not a measured routing):
 *   concrete-action / interaction → antidote+world (character, deed, world state)
 *   causal-mechanism / data-comparison → antidote diagram (causal / mechanism / scorecard / sorter)
 *   environmental → vox (a generated period image) when the book has images, else antidote set
 *   abstract-concept → antidote icon / kinetic text (the weakest; most dead frames live here)
 * Pure.
 */
const RULES = [
  ["concrete-action", /\b(pick(s|ed)? up|hand(s|ed)? (him|her|them|it|over)|gave|gives|took|takes|grab(s|bed)?|drop(s|ped)?|put(s)? (it|the|down|away)|set(s)? (it|the) down|carr(y|ies|ied)|throw(s|n)?|threw|hang(s)?|hung|open(s|ed)? the|close(s|d)? the|sign(s|ed)? the|writes?|wrote|rules? a line|pours?|lights? (a|the))\b/i],
  ["interaction", /\b(argu(e|es|ed|ing)|hug(s|ged)?|embrac(e|es|ed)|confront(s|ed)?|fire(s|d)? (him|her)|hire(s|d)?|shake(s|) hands|punch(es|ed)?|kiss(es|ed)?|yell(s|ed)? at|meets?|met with|negotiat(e|es|ed)|interview(s|ed)?)\b/i],
  ["causal-mechanism", /\b(because|leads? to|led to|causes?|caused|so that|as a result|feedback|loop|triggers?|feeds? (back|into)|compound(s|ing)?|which means|in turn|the more .{1,30} the more|drives?|results? in)\b/i],
  ["data-comparison", /(\d+\s?%|\bpercent\b|\b\d{2,}\b(?! (a\.?m|p\.?m))|\btimes (more|less|faster)\b|\bversus\b|\bcompared (to|with)\b|\bmore than\b|\bless than\b)/i],
  ["environmental", /\b(in (the )?\d{4}s?|century|era|village|city|town|street|forest|desert|ocean|farm|factory|kitchen|room|house|landscape|war(time)?|battlefield|crowd|market|church|courtroom|prison)\b/i],
];
const ENGINE = {
  "concrete-action": "antidote+world", interaction: "antidote+world", "causal-mechanism": "antidote-diagram",
  "data-comparison": "antidote-diagram", environmental: "vox|antidote-set", "abstract-concept": "antidote-icon",
};
/** what the muted viewer must take away, by type — the director's question for the scene */
const MUST_SEE = {
  "concrete-action": "who did what to which object, and where the object is now",
  interaction: "who does what to whom, and how the other one reacts",
  "causal-mechanism": "what produces what (cause → effect), visibly in one frame",
  "data-comparison": "which is bigger / changed, by how much",
  environmental: "where and when we are",
  "abstract-concept": "the claim — if it cannot be shown, say it (text) rather than decorate",
};

function routeBeat(narration, { castCount = 1, bookHasImages = false } = {}) {
  const t = String(narration || "");
  let type = "abstract-concept";
  for (const [k, re] of RULES) if (re.test(t)) { type = k; break; }
  if (type === "concrete-action" && castCount >= 2 && /\bhand(s|ed)?\b|\bgave|gives\b/i.test(t)) type = "interaction";
  let engine = ENGINE[type];
  if (type === "environmental") engine = bookHasImages ? "vox" : "antidote-set";
  return { type, engine, mustSee: MUST_SEE[type] };
}

module.exports = { routeBeat, RULES, ENGINE, MUST_SEE };
