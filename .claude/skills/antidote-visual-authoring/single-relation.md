# Single-relation cause → visible effect — authoring reference (Antidote, Level 1)

For storyboard authors / the preview agent. **Blind readers, describers and judges never see this file**, never hear
the capability's name, which beat is "new", or what result is expected.

## What it is
One locked wide frame: the cause is marked, a token travels, a short pause, and the effect visibly changes ANOTHER
entity (a level falls, a face changes, something appears / leaves / moves / breaks) — or, when that cannot be drawn
honestly, a quote card in the narration's own words. Code: `scripts/lib/single-relation.js` (contract
`single-relation/1`), drawn by `components/SemanticStage.tsx` only when the book's `meta.singleRelation === true`.
It is Director 1.0's proven part, not a new style.

## Level 1 vs Level 2 (what you may do today)
- **Level 1 (now):** the capability exists, default OFF. You SCAN, AUTHOR, VALIDATE and PREVIEW A/B in an isolated
  config — you do **not** apply it to the production config. `apply-single-relation.js --write` is for after Level 2
  or an explicit operator decision for that book.
- **Level 2 (selective ship, pending):** a pre-registered holdout must show the benefit on cause-present beats. Until
  then nothing reaches a production film through this path.

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

## Reporting (books/<slug>/single-relation/ in the book's own worktree, or the experiment folder)
`candidates.json` (each candidate: scene, evidence, cause, effect, current limitation, proposed representation, expected
understanding, risk / fallback; every REJECTED beat with its reason) → `contracts.json` (author, input hash, validation,
scene index, previous scene) → the A/B result per beat: what was not understood before, what changed, what the viewer
should now understand, any new wrong inference. A beat whose new version is read WRONG, only via text, too small or
badly framed is NOT an improvement and is not proposed.
