# Single-relation cause → visible effect — authoring reference (Antidote, Level 1)

For storyboard authors / the preview agent. **Blind readers, describers and judges never see this file**, never hear
the capability's name, which beat is "new", or what result is expected.

## What it is
One locked wide frame: the cause is marked, a token travels, a short pause, and the effect visibly changes ANOTHER
entity (a level falls, a face changes, something appears / leaves / moves / breaks) — or, when that cannot be drawn
honestly, a quote card in the narration's own words. Code: `scripts/lib/single-relation.js` (contract
`single-relation/1`), drawn by `components/SemanticStage.tsx` only when the book's `meta.singleRelation === true`.
It is Director 1.0's proven part, not a new style.

## What you may do today
- **Eligible book (operator-approved selective rollout, cycle 17 — `data/single-relation-rollout.json`):** Antidote,
  unpublished, no production render, pin containing 8cd04fc0 (the rollout in make-book / preview-state). You SCAN, AUTHOR, VALIDATE, run the per-beat A/B, and
  `single-relation-rollout.js select / apply --write` puts B into the production config ONLY for beats whose own A/B
  shows B better (≤ 15 scenes; runbook §2d). Write contracts for the operator's taste (creative-direction.md): several
  objects that interact and visibly change; never decorate a beat that is already good — A stays there.
- **Any other book:** Level 1 — scan / author / validate / isolated preview only; `apply-single-relation.js --write`
  needs an explicit operator decision for that book.
- **Level 2** (global, pre-registered holdout) was INCONCLUSIVE in cycle 16 (+41 pp, n 14 < 15) — never default-on.

## When to use it (all must hold — the scan proposes, you decide)
- The narration STATES a cause and its effect (because / leads to / makes / drains / forces …), as the narrator's
  claim — not a plan, hypothesis, question, negation, quoted opinion or a premise the hosts reject.
- Both ends are things the narration names (in the evidence sentence or the one next to it).
- The authored scene does NOT already show the effect (people + words only; no object / diagram that changes).
- One relation is enough to carry the beat's point.

## When NOT to use it
- The authored storyboard already shows the change (an icon that changes state, a diagram, an action) — keep it.
- Action / chapter-card / emotional cast beats; beats the readcheck or mute test already read CORRECT on the change.
- Two or more relations in the beat (pick none — never stack events).
- Planned / hypothetical / negated / question / "people think" claims → leave the beat as authored (or a quote card,
  type H, if the sentence itself is the point).
- To raise a count. Zero selected beats is a valid, normal result.

## How to author a contract (`<out>/contracts/<sceneIndex>.json`)
```json
{ "schema": "single-relation/1", "type": "B",
  "understanding": "What a muted viewer must understand, ≤ 30 words.",
  "evidence": "a VERBATIM quote of the scene's narration that states the relation",
  "claim": { "asserted": "the claim in one sentence", "polarity": "asserted", "speaker": "narrator", "notAsserted": [] },
  "before": "…", "transformation": "…", "after": "…",
  "camera": { "framing": "wide-locked", "purpose": "cause and effect in one frame" },
  "entities": [ { "id": "c", "kind": "object", "glyph": "smartphone", "label": "notification" },
                { "id": "e", "kind": "stock", "label": "focus", "value": 1 } ],
  "events": [ { "at": 0.3, "cause": "c", "effects": [ { "entity": "e", "value": 0.1 } ], "repeat": 3 } ],
  "required": ["the phone", "the focus level falling"], "omitted": ["…"], "_author": "<who wrote it>" }
```
- type **B** cause → effect (evidence must contain the causal word), **A** action → consequence, **H** quote card
  (`text` = the narration's own words; `claim.speaker` when someone other than the narrator says it).
- kinds: person (a cast key, `mood`), stock (a level 0..1), group (a count 0..1), object (`glyph` from the vocabulary in
  `lib/semantic-director.js`). Labels ≤ 2 words, the narration's own. Effects: value (Δ ≥ 0.2), mood, present, moveTo
  (objects), broken. ONE event, ≤ 4 entities, no entity twice.
- **Relational motion (optional, recommended):** `"mechanism"` = what the ONE event shows — `cause-effect`, `transfer`
  (an object moves to another owner; moveTo), `accumulation` (level up in steps), `depletion` / `recovery` (level down / up),
  `removal` (an obstacle disappears AND another entity changes), `transformation` (mood / broken), `character-action` (a
  person acts). The validator refuses a motion that does not match it (wrong entity, wrong direction). The scan proposes one.
- **Relational motion 2.0 (cycle 18, experimental — dev until shipped):** events the renderer DRAWS, use only when the
  narration states them:
  - `overload` — a stock fills in steps (`repeat` ≥ 2, value up to ≥ 0.95) and its last effect has `"overflow": true`:
    the content heaps over the rim, runs down the sides and the wall cracks ("the to-do list piles up until he snaps").
  - `passage` — an obstacle object is removed (`present: false`) and, in the same or a later event, a mover object goes
    `moveTo` its goal `"via": "<the obstacle>"`: it travels through the place the obstacle held ("once the barrier is
    gone, the letter reaches her"). The obstacle must be gone first.
  - `merge` — an object `"mergeInto": "<other entity>"`: it travels into the receiver and is gone as itself; the receiver
    swells and stays a little bigger.
  - `split` — an object that starts `present: false` appears with `"from": "<source>"`: it comes out of the source and
    slides to its own place (a dotted trace stays).
- **Multi-phase single-frame storytelling (cycle 18 pilot):** `"phases": true` allows 2–3 events (setup → action →
  result) in the same locked frame. Every event then has `"anchors": {"cause": "<words>", "effect": "<words>"}` (one or
  both; 1–6 VERBATIM narration words): the cause lights up when the narrator says its words, the change never starts
  before the effect's words are said. Any anchor the word timings cannot find → the whole contract falls back to its
  `at` fractions (recorded as `timingSource`). One-event contracts may carry anchors too; without anchors nothing changes.
- Anything the narration mentions but does not assert goes in `claim.notAsserted` ({text verbatim, kind}); it may not be
  your evidence, card text or a label. Polarity `contrast` when the beat says "not X but Y" (stage Y only).

Visual direction (what the operator's preferred scenes share; the invisible-cause pattern): `creative-direction.md`.

## Scan → author → validate → preview (commands)
```
node scripts/single-relation-scan.js scan     --slug=<s> [--book-root=<wt>]   # candidates.json (+ rejected, with reasons)
# author ≤ 8 contracts for the strongest candidates (one fresh agent; this file + candidates.json + the narration)
node scripts/single-relation-scan.js validate --slug=<s> [--book-root=<wt>]   # contracts.json: each contract on its own
node scripts/single-relation-preview.js build --slug=<s> [--book-root=<wt>] --out=<dir>  # isolated A/B configs + stills manifest
node scripts/stills-cloud.js push --manifest=<dir>/manifest.json --tag=<t>  &&  … fetch --tag=<t> --out=<dir>/stills
```
A/B rating (when asked): the blind describer / judge procedure of the mute test — fresh agents, sonnet, strips under
random names, the two versions of a beat never to the same describer, judges given a narration-only answer key written
BEFORE the renders. No describer or judge is told which version is which or that anything changed.

## Decision 2 — is the new scene really better? (`validate` writes `review` per contract)
`review.verdict` = `TRY_CONCRETE` when every end of the relation is carried by its label alone (a level tank, a glyph that is
a metaphor for its label) and nothing moves, appears, leaves or changes face: a muted viewer reads the words, not the
relation. Author a concrete version first (a literal object, a person with a face, the thing that leaves); keep the
authored scene if none is honest. Never replace a scene the readcheck / mute test already reads CORRECT.

## Reporting (books/<slug>/single-relation/ in the book's own worktree, or the experiment folder)
`candidates.json` (each candidate: scene, evidence, cause, effect, current limitation, proposed representation, expected
understanding, risk / fallback; every REJECTED beat with its reason) → `contracts.json` (author, input hash, validation,
scene index, previous scene) → the A/B result per beat: what was not understood before, what changed, what the viewer
should now understand, any new wrong inference. A beat whose new version is read WRONG, only via text, too small or
badly framed is NOT an improvement and is not proposed.
