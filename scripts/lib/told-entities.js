/**
 * told-entities.js — WHAT DOES THE NARRATION NAME, and is it on screen? (Film Flow level 2, 2026-11-13.)
 *
 * The operator's finding: the narration says "Microsoft … Google … Windows versus Chrome OS" and the screen shows a
 * street and two unrelated people. This is the deterministic half of the fix: read the narration, list the THINGS IT
 * NAMES (people, companies, products, places — proper names said more than once — and the years it gives), and for a
 * planned film say on how many of the scenes that name one, that name is on screen. The other half is the author's:
 * give each name a picture (an emblem, a dressed person, an icon) and stage what happens to it (ToldStage).
 *
 * A proper name is found from capital letters inside a sentence (never the first word of one), so it works on
 * auto-captions without a model. It is a CANDIDATE list: the author removes a false name and adds a missed one in
 * books/<slug>/storyboard/entities.json; nothing here decides what a film shows. Pure; tested by test-told-entities.js.
 */
const STOP = new Set(`I I'm I've I'll I'd The A An And But So It Its It's He She They We You This That These Those There What When Where Why How If In On At Of For To Is Was Yeah Yes No Oh Right Exactly Well Okay OK Because Like Just Now Then Or As By His Her Their Our My Your One Two Three Not Wait Which Who Think Let Here Be Do Did Does Have Has Had Are Were Can Could Would Should Really Absolutely Literally Completely Totally Sure Also Even Every All Some Most Many Much More From With Without About Into Over After Before Wow Huh Hmm Mhm God Thanks Imagine Look See Say Take Maybe Actually Basically Honestly Obviously Still Never Always Again Both Each Either Neither Nobody Everyone Someone Something Nothing Everything Mr Mrs Ms Dr Chapter Part Book English American`.split(/\s+/));

const clean = (w) => String(w || "").replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9']+$/g, "");
// "We've", "It'll", "Don't" are not names: an apostrophe inside a word is a contraction (a possessive 's is stripped before)
const isName = (w) => /^[A-Z][A-Za-z-]{1,}$/.test(w) && !STOP.has(w);
const endsSentence = (w) => /[.!?]["')\]]?$/.test(String(w || ""));

/**
 * namesIn(text) → the proper names in one stretch of narration, in order: runs of capitalised words that do not start
 * a sentence ("Google Docs", "Johann Rochlitz"), plus four-digit years.
 */
function namesIn(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const out = [];
  let run = [];
  const flush = () => { if (run.length) out.push(run.join(" ")); run = []; };
  words.forEach((raw, i) => {
    const w = clean(raw).replace(/['’]s$/, "");
    const first = i === 0 || endsSentence(words[i - 1]);
    if (/^(1[5-9]|20)\d\d$/.test(w)) { flush(); out.push(w); return; }
    // a capitalised first word is a name only when it continues one ("…Google. Microsoft Office" — the run decides)
    if (isName(w) && (!first || (isName(clean(words[i + 1] || "")) && !endsSentence(raw)))) run.push(w);
    else flush();
    if (endsSentence(raw)) flush();
  });
  flush();
  return out;
}

/**
 * entitiesOf(scenes) → [{name, count, scenes:[index], kind}] for names said in `min`+ scenes (a name inside a longer
 * one — "Mozart" in "Wolfgang Mozart" — counts with it). kind: "year" or "name" (the author says person / company / place).
 */
function entitiesOf(scenes, { min = 2 } = {}) {
  const per = scenes.map((s) => [...new Set(namesIn(typeof s === "string" ? s : s._narration || s.text || ""))]);
  const count = new Map();
  per.forEach((names, i) => { for (const n of names) count.set(n, [...(count.get(n) || []), i]); });
  // a full name and the surname people keep saying are one person: "Wolfgang Mozart" counts with "Mozart",
  // "Johann Rochlitz" with "Rochlitz". Only the LAST word folds: "Google Docs" is not "Google", it is its product.
  for (const long of [...count.keys()]) {
    const words = long.split(" ");
    const last = words[words.length - 1];
    if (words.length < 2 || !count.has(last)) continue;
    count.set(last, [...new Set([...count.get(last), ...count.get(long)])].sort((a, b) => a - b));
    count.delete(long);
  }
  return [...count].filter(([, at]) => at.length >= min).map(([name, at]) => ({ name, count: at.length, scenes: at, kind: /^\d{4}$/.test(name) ? "year" : "name" }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Everything a scene puts on screen as words: texts, diagram labels, name tags, and every label of a told stage. */
function shownText(scene) {
  const parts = [];
  for (const t of scene.texts || []) parts.push(t.text);
  if (scene.diagram) parts.push(JSON.stringify(scene.diagram.labels || ""), JSON.stringify(scene.diagram.nodes || ""), JSON.stringify(scene.diagram.items || ""));
  for (const c of scene.characters || []) parts.push(c.label, c.name, c.says);
  for (const p of scene.props || []) parts.push(p.label, p.text);
  for (const it of (scene.told && scene.told.items) || []) parts.push(it.label, it.sub);
  for (const sh of scene.shots || []) parts.push(shownText(sh));
  return parts.filter(Boolean).join(" · ").toLowerCase();
}

/** Is this name on screen in this scene? Any word of it longer than two letters counts ("Mozart" for "Wolfgang Mozart"). */
function showsName(scene, name) {
  const txt = shownText(scene);
  return String(name).toLowerCase().split(/\s+/).some((w) => w.length > 2 && new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(txt));
}

/**
 * mentionCoverage(config) → of the scenes whose narration names something the film names repeatedly, how many show it.
 * {entities, mentions, shown, share, missing:[{scene, name}]}
 */
function mentionCoverage(config, opts = {}) {
  const scenes = config.scenes || [];
  const ents = entitiesOf(scenes, opts).filter((e) => e.kind === "name");
  let mentions = 0, shown = 0;
  const missing = [];
  scenes.forEach((s, i) => {
    const here = ents.filter((e) => e.scenes.includes(i));
    if (!here.length) return;
    mentions++;
    if (here.some((e) => showsName(s, e.name))) shown++;
    else missing.push({ scene: s.id, names: here.map((e) => e.name) });
  });
  return { entities: ents.length, mentions, shown, share: mentions ? shown / mentions : null, missing };
}

module.exports = { STOP, namesIn, entitiesOf, shownText, showsName, mentionCoverage };
