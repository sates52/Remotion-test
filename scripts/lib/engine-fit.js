/**
 * engine-fit.js — which engine SHOWS this book best, with the reasons.
 *
 * The question is not "does the text contain names or numbers" (the old
 * analyzeEngineFromVtt scored proper nouns and statistics as Vox, so a novel's
 * invented cast and a self-help book's studies both pushed toward photoreal —
 * We Were Liars scored "strong Vox" although its central scenes are teenagers
 * burning to death, which Flux refuses to draw). It is: what must the viewer SEE,
 * and which engine can draw it?
 *
 *   Vox (photoreal Flux stills) — the REAL or PERIOD world: dated real events,
 *     history/biography/documentary, a story set before ~1950 whose look matters.
 *   Antidote (vector icons, diagrams, staged cast) — IDEAS and the reader: advice,
 *     mechanisms, "you"-address; contemporary fiction with a staged cast (WWL: 0/30
 *     wrong, image adds 70%).
 *   Risk, not taste: violence / death density. Flux returns CONTENT_FILTERED on
 *     gore, children in danger and war violence — on a violent book Vox loses the
 *     very scenes the narration is about.
 *
 * Signals are per 1,000 narration words. Weights are explicit and explained in
 * `reasons`; the decision is a recommendation for the Step 0 author + operator,
 * and every book's result is logged next to its mute-test outcome
 * (data/engine-outcomes.json) so the weights can be re-fit on real results.
 */
const RE = {
  year: /\b(1[5-9]\d\d|20[0-2]\d)\b/g,
  history: /\b(century|centuries|war|wars|president|king|queen|empire|revolution|colon(?:y|ial|ies)|slavery|slaves?|civil rights|nazis?|soviet|army|battle|treaty|historians?|historical|archives?|true story|real life|biography|dynasty|government|senator|soldiers?|troops|regime)\b/gi,
  second: /\b(you|your|yourself)\b/gi,
  abstract: /\b(habits?|mindset|principles?|strateg(?:y|ies)|framework|concepts?|theory|theories|brains?|psycholog\w*|attention|focus|productiv\w*|techniques?|lessons?|models?|systems?|behaviou?r|emotions?|motivation|goals?|decisions?|values?|happiness|wealth|money|time|energy)\b/gi,
  sensitive: /\b(kill(?:ed|s|ing)?|murder\w*|dead|deaths?|died|dying|corpses?|blood(?:y)?|guns?|shot|shoot\w*|rape\w*|abus\w*|suicid\w*|overdos\w*|tortur\w*|massacre|genocide|burn(?:ed|t|ing)|drown\w*|violen\w*|assault\w*|stab\w*|execut\w*)\b/gi,
};
const SENSITIVE_OK = 6;   // per 1k — above this Flux starts dropping images
const PERIOD_YEAR = 1950; // before this, period realism is worth photoreal

/**
 * @param {string} text  the narration
 * @param {{era?: number}} ctx  era = story-bible world.approxYear when known
 */
function analyzeEngineFit(text, ctx = {}) {
  const n = Math.max(1, String(text).split(/\s+/).filter(Boolean).length);
  const per1k = (re) => +((((String(text).match(re) || []).length) / n) * 1000).toFixed(1);
  const s = {
    year: per1k(RE.year), history: per1k(RE.history), second: per1k(RE.second),
    abstract: per1k(RE.abstract), sensitive: per1k(RE.sensitive),
  };
  const era = Number.isFinite(ctx.era) ? ctx.era : null;

  const realWorld = s.year * 2 + s.history * 1.2;
  // Period realism matters for a STORY, not for an advice book whose bible year is
  // just the oldest anecdote (Slow Productivity: 1913).
  const narrative = s.second < 20;
  const periodBonus = narrative && era != null && era < PERIOD_YEAR ? 6 : 0;
  const vox = realWorld * 2 + periodBonus;
  const ideas = s.second * 0.35 + s.abstract * 0.8;
  const violenceRisk = Math.max(0, s.sensitive - SENSITIVE_OK) * 1.5;
  const antidote = ideas + violenceRisk;

  const pick = vox > antidote ? "vox" : "antidote";
  const rel = Math.abs(vox - antidote) / Math.max(vox, antidote, 1);
  // Both scores small = no real signal, however lopsided the ratio (WWL: 5.1 vs 11.6).
  const top = Math.max(vox, antidote);
  const confidence = rel > 0.5 && top >= 15 ? "strong" : rel > 0.25 && top >= 8 ? "moderate" : "weak";

  const reasons = [];
  if (s.year >= 1.5 || s.history >= 2.5) reasons.push(`real-world / dated references (${s.year} years, ${s.history} history terms per 1k words) → photoreal shows the actual world (Vox)`);
  if (periodBonus) reasons.push(`set around ${era} → period realism favours Vox`);
  if (s.second >= 20) reasons.push(`the narration addresses the viewer ("you" ${s.second}/1k) → an idea/advice film, drawn as icons, diagrams and an everyman (Antidote)`);
  if (s.abstract >= 10) reasons.push(`idea vocabulary ${s.abstract}/1k (habits, decisions, attention, money…) → concepts need icons/diagrams, not photographs (Antidote)`);
  if (!reasons.length) reasons.push("no dominant signal — the story itself decides; contemporary fiction with a cast works in Antidote (WWL), period or documentary worlds in Vox");
  const risks = [];
  if (s.sensitive > SENSITIVE_OK) risks.push(`violence/death ${s.sensitive}/1k (> ${SENSITIVE_OK}) → Flux will refuse many Vox images of the key scenes (CONTENT_FILTERED); Antidote draws them symbolically`);

  return {
    pick, confidence,
    voxScore: +vox.toFixed(1), antidoteScore: +antidote.toFixed(1),
    signals: { ...s, era, words: n },
    reasons, risks,
  };
}

module.exports = { analyzeEngineFit, SENSITIVE_OK, PERIOD_YEAR };
