/**
 * told-rules.js — what a storyboard author is told about TOLD beats, and how merge checks one (Film Flow 2, 2026-11-14).
 *
 * The section is generated from the book's own storyboard/entities.json and from the compiler's vocabulary
 * (lib/told-compile.js), so the rules can never offer an action or a glyph the engine cannot draw. A book without
 * entities.json gets no section and no told beat is accepted: the stage is drawn from named things, and they are
 * named once, before the authors start (preview-hazirla; `node scripts/told.js entities --slug=<slug>` lists the
 * candidates the narration gives).
 */
const { DOS, LAYOUTS, GLYPHS, KINDS, wordFrame } = require("./told-compile");

const EVENT_HELP = [
  ["arrange", "layout, who[]", "put these on stage in a layout (they enter from their side; those already there move)"],
  ["enter / exit", "who", "one thing comes on / leaves"],
  ["title", "text, box? (accent | ink | red)", "2-5 words at the top of the screen; one at a time"],
  ["label", "who, text", "a property / product / fact of that thing, beside it (they stack)"],
  ["crown / uncrown", "who", "the leader, the winner, the biggest"],
  ["world", "who[]", "each sits in its own world (a separate market, universe, camp)"],
  ["apart / together", "who[a, b]", "they move away from each other / come to meet"],
  ["collide", "who[a, b]", "they meet and clash (a burst, both shaken)"],
  ["burst", "who[a, b]?", "an impact between them (or in the middle)"],
  ["cross", "who[a, b] | who", "NO: no path between the two / this thing is ruled out"],
  ["stamp", "who, text", "a verdict stamped on it: FORGERY, BANNED, SOLD"],
  ["cover / uncover", "who[]", "it cannot see / is hidden (a bar across it)"],
  ["dim / restore", "who[]", "it loses (fades and tilts) / it is back"],
  ["grow", "who[], to?", "it gets bigger (to: 1.25 by default)"],
  ["shake", "who[]", "it is hit / shocked"],
  ["coins", "who?, n?", "money: paid, lost, at stake"],
  ["pair", "left, right, onRight?", "one comparison row under the two things on stage: LEFT vs RIGHT (up to four rows)"],
  ["date", "text, side? (left | right)", "a point on a timeline: \"1791 · MOZART DIES\""],
  ["focus / wide", "who / —", "the camera goes to one thing / comes back to the whole stage"],
  ["change", "who, look? action? holds? label?", "the same PERSON differently: another action, something in the hand, a changed look"],
  ["clear", "what? (titles | labels | rows)", "take the extras off the stage (default: all of them)"],
  ["raw", "item", "one bespoke drawn thing nothing else can show — rarely"],
];

function toldSection(entities) {
  const ids = Object.keys(entities || {});
  if (!ids.length) return "";
  const rows = ids.map((id) => { const e = entities[id]; return `- \`${id}\` — ${e.label || "(drawing)"} · ${e.kind}${KINDS[e.kind] === "emblem" ? ` · emblem${e.glyph ? ` (${e.glyph})` : ""}` : KINDS[e.kind] === "figure" ? " · person" : " · the book's own drawing"}${e.note ? ` — ${e.note}` : ""}`; }).join("\n");
  return `## The picture shows what is said — \`told\` beats (read this before anything else)
Measured on our films: when the narration names a company, a product, a person or a place, that thing was on screen
in 13–31 % of the scenes — the rest showed a figure and a text. So: **when the narration NAMES something, the viewer
SEES that thing, and what the narration says happens to it happens on screen, on the word.** For those beats you write
\`told\` INSTEAD of concept / cast / callout / diagram:

\`\`\`json
{ "i": 12,
  "told": { "stage": { "layout": "versus", "who": ["microsoft", "google"] },
            "events": [ { "on": "king", "do": "crown", "who": "microsoft" },
                        { "on": "operating", "do": "label", "who": "microsoft", "text": "Operating systems" } ] },
  "explainedBy": "Microsoft is crowned the king of operating systems", "noVisual": null }
\`\`\`

**This book's named things** (\`storyboard/entities.json\` — use these ids; you cannot add one: if the narration names
something that is missing, write the beat without it and say so in \`noVisual\`):
${rows}

**How it works**
- \`on\` is a word (or the first words of a phrase) of THIS beat's narration, spelled as in the chunk: the event LANDS
  on that word. Events are in the order the words are said. An event with no word uses \`"at": 0\` (the beat's start).
- **The stage is kept from beat to beat.** Write \`stage\` only when the things on stage change; in the next beat write
  only the new \`events\`. A beat without \`told\` ends the stage (the next told beat starts an empty one).
- A passage that talks about the same named things is a RUN of told beats — that is the normal case: the things stay,
  each beat makes one or two things HAPPEN to them. Never a beat where nothing changes.
- Layouts: ${LAYOUTS.map((l) => `\`${l}\``).join(", ")} — \`versus\` two things facing each other; \`row\` several side by side;
  \`court\` the first in the middle, the others around; \`solo\` one; \`pairs\` is set by \`pair\` itself.
- Titles are 2-5 words from the narration's own claim, never a label for the picture. At most 5 events in a beat.
- A person on a told stage does one thing at a time and stands still otherwise; say what they do with \`change\`.

**Events**
| do | fields | what the viewer sees |
|---|---|---|
${EVENT_HELP.map(([d, f, m]) => `| \`${d}\` | ${f} | ${m} |`).join("\n")}

**When not to use it:** a beat about an unnamed person's inner state, or a general idea with nothing named — author
it the usual way below. Never put a host or a stand-in figure on a told stage to "have someone there".
`;
}

/** merge: is this authored told beat well-formed for this narration and these entities? → [messages] (empty = fine) */
function checkToldBeat(told, narration, entities) {
  const out = [];
  if (!told || typeof told !== "object" || Array.isArray(told)) return ["told must be an object { stage?, events? }"];
  const ids = new Set(Object.keys(entities || {}));
  if (!ids.size) return ["told: this book has no storyboard/entities.json — the named things are listed there before authoring"];
  const words = String(narration || "").split(/\s+/).filter(Boolean).map((w, i) => ({ w, f: i }));
  const names = (who) => (Array.isArray(who) ? who : who != null ? [who] : []);
  if (told.stage) {
    if (!LAYOUTS.includes(told.stage.layout)) out.push(`told.stage.layout "${told.stage.layout}" — one of ${LAYOUTS.join(", ")}`);
    if (!Array.isArray(told.stage.who) || !told.stage.who.length) out.push("told.stage.who: the ids on stage");
    for (const w of names(told.stage.who)) if (!ids.has(w)) out.push(`told.stage.who "${w}" is not in entities.json`);
  }
  if (told.events != null && !Array.isArray(told.events)) out.push("told.events must be an array");
  const events = Array.isArray(told.events) ? told.events : [];
  if (!told.stage && !events.length) out.push("told: nothing happens in this beat — a stage or at least one event");
  if (events.length > 6) out.push(`told: ${events.length} events in one beat — at most 5; split what happens over the beats that say it`);
  let cursor = 0;
  events.forEach((ev, k) => {
    const tag = `told.events[${k}]`;
    if (!ev || !DOS.includes(ev.do)) { out.push(`${tag}.do "${ev && ev.do}" — one of ${DOS.join(", ")}`); return; }
    for (const w of names(ev.who)) if (!ids.has(w)) out.push(`${tag}.who "${w}" is not in entities.json`);
    if (ev.on != null) {
      const hit = wordFrame(words, ev.on, cursor) || wordFrame(words, ev.on, 0);
      if (!hit) out.push(`${tag}.on "${ev.on}" — the narration of this beat does not say it`);
      else cursor = hit.index;
    } else if (!Number.isFinite(ev.at)) out.push(`${tag}: give "on" (a word of this beat) or "at": 0`);
    if (["title", "label", "stamp", "date"].includes(ev.do) && !String(ev.text || "").trim()) out.push(`${tag} (${ev.do}): needs text`);
    if (ev.do === "title" && String(ev.text || "").trim().split(/\s+/).length > 6) out.push(`${tag}: a title is 2-5 words ("${ev.text}")`);
    if (ev.do === "pair" && !(ev.left && ev.right)) out.push(`${tag} (pair): needs left and right`);
    if (ev.do === "raw" && !(ev.item && ev.item.kind)) out.push(`${tag} (raw): needs item { kind, x, y, … }`);
  });
  return out;
}

module.exports = { toldSection, checkToldBeat, EVENT_HELP, GLYPHS };
