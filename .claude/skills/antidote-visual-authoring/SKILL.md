---
name: antidote-visual-authoring
description: >
  For a storyboard author writing or revising an Antidote book's beats (books/<slug>/storyboard/authored-N.json):
  how to stage what the narration says — the deed, the relationship between two people, the object that carries
  the meaning, the face of the moment, kept stages (continue), take / embrace / actionCue — so a muted viewer reads
  it. Use when authoring a chunk from PROMPTS.md, revising beats after a blind check, or reviewing staging before
  merge. It points to the generated rules.md; it never replaces it.
---

# Antidote visual authoring

The rules live in ONE generated file: **`books/<slug>/storyboard/rules.md`** (written by
`node scripts/storyboard.js prep --slug=<slug>`, together with `PROMPTS.md`). Read it in full before writing; re-run
`prep` after the story bible or the book's own icons change (merge refuses a stale prep). This skill is a checklist
of what to look for in rules.md — when this text and rules.md differ, rules.md wins. Procedure and order:
`STORYBOARD_RUNBOOK.md` §2 (authoring) and §2b (readcheck).

## First, the idea map of your chunk

rules.md "Sequences", step 0: before any single beat, list each passage as "beats a-b: <the one idea> — kept stage:
<what carries it>" or "single beats". Do not force a sequence: separate points stay single beats, a feeling stays a
face; a chunk with no sequence is normal. A growing diagram only where the narration itself builds a cause → effect
chain or a change of state step by step. Check the context entries before your chunk — a stage the idea still uses may be continued across the boundary.
What the kept stage must be (P1 blind sequence strips, 2026-10-23, `framecheck.js sequence`):
- burn-of-the-everflame 100-104, worked: a sorter, then a flow that gains one label per beat ("Thrones burned →
  20 houses alienated" → "+ Campaign unfunded"; rules.md "Diagrams" — flow ≤ 3, sorter ≤ 4 labels are drawn).
  The cause chain read on the diagram rows (EXPLAINS 1 → 2, nothing invented). The two closing faces stayed text-carried.
- philosophy-for-life 172-177, did not: the boy and the instructor kept across the story with faces changing — the
  viewer followed the people but not the fox, which is never drawn (EXPLAINS 1 → 0). Keep the thing the story turns
  on (a `motifs.json` icon) on the stage, not only the people reacting to it.
- the-confidence-gap 161-164, partly: the closet → stadium spectrum carried for two beats (marker moves; the change
  read PARTLY instead of NO), then dropped for a walking figure that read WRONG. The bird was never drawn.
- the-island-of-missing-trees 23-26 / 223-224 (P2-A, 2026-10-24): an object that CHANGES state. One static fig-tree
  icon → the change read NO / PARTLY. Two own icons of the same object (start state, then the after-state on the
  beat that says "shoving it into the trench" / "reach back up toward the light", `continue`) → PARTLY / YES,
  EXPLAINS 0 → 1, WRONG 1 → 0. The state icons are drawn at the bible step (runbook §1b); use them when the book has them.

## For every beat, in this order

1. **The question** — rules.md "The question for every beat": what event, comparison or relationship would let a
   muted viewer understand this sentence? Write it in `explainedBy` first, then stage that answer **on this beat**
   (rules.md "Stage the answer ON THE BEAT THAT SAYS IT"). A face plus a callout is the fallback, not the plan —
   and still the right choice when the sentence is only a feeling, a reaction or commentary.
   Real misses from sealed mute tests (published books, evidence only — never edit them):
   - the-confidence-gap 162 → 163: the "claustrophobic closet → open air stadium" spectrum sat on 162; 163 ("the
     bird is still there … a small object in a vast space") showed a pointing figure with a callout (blind WRONG).
     The explanation continues, so keep the spectrum on 163 (`continue`) instead of cutting to a person.
   - the-knave-and-the-moon 156 → 157: one idea over two beats (the crowd wants the spectacle, not the suffering);
     156 was a bare figure (`think`), the "civil suffering | magical spectacle" sorter only came on 157. Open the
     sorter on 156 and keep it with `continue` on 157.
   - philosophy-for-life 116 → 119: the A-B-C flow ("Activating Event → Belief System → Emotional Consequence")
     was drawn on 116; 119 ("That is A. Now C is the consequence") showed Ellis pointing with a callout. Keep the
     flow on screen (`continue`) through the beats that walk through it.
   Checks for your own chunk: if `explainedBy` starts with an event, a comparison or a mechanism, does the staged
   beat show it? Is the diagram on the beat the narration explains, not its neighbour? Does every two-person beat
   show one person doing something to the other?
2. **The deed** — if the narration says someone does something, stage the deed, not a mood: the action vocabulary in
   rules.md "Vocabulary" and "Staging the people"; `take` + `holds` and `embrace` (two cast members) with an
   `actionCue` on the word where it happens — rules.md "Actions that HAPPEN" (inside "The icon test"). The doer is `cast[0]`.
3. **Two people** — the person the sentence is ABOUT goes first in `cast`. Stage the second person's reaction on
   purpose: `partnerExpression` (face) and `partnerAction` (body) — rules.md "Staging the people". What you leave
   out stays neutral / idle; only the paired verbs (fighting, grabbing ↔ struggling, embrace) move the partner, and
   merge refuses a `partnerAction` that contradicts them. No gesture quota — but when the narration has the other
   side react (refuses, listens, is accused, gives in), two people standing side by side do not show it. A
   relationship that IS the claim (one side controls another through a message) may use rules.md "Relationship staging".
4. **The object** — `concept` / `holds` must READ as the thing the narration names (rules.md "The icon test"). A
   stand-in icon that means something else is worse than none. An icon behaviour (`conceptMotion`, rules.md "Icon
   behaviour": `compass: spin`; state changes `chains: break`, `phone: light`) only where the narration says it happens — a metaphor ("break the cycle") is not
   a breaking object.
5. **The face** — the face of the moment from rules.md "Staging the people" and "How staging reads (measured in mute
   tests)", which list the measured readings from `data/icon-readings.json`. Follow those lines, not memory: they
   change when a mute test shows a new misread.
6. **Kept stages** — rules.md "Sequences": keep the stage (`"continue": true`) only where keeping it keeps the
   meaning — never on the first beat, only with the same `set` as the previous beat — and change something visible
   on every kept beat (an action, a face, a held object, a state change, one more diagram label). After a `take`, the
   kept beat is `"action": "hold"` with the same `holds`. If
   only the callout would change, end the sequence or write `noVisual`.
7. **Nobody on screen** — `cast: []` is a decision (an object, a diagram, the callout); leaving `cast` out lets the
   engine choose (rules.md "The question for every beat").

## Never

- Bring back retired templates: a pose standing for an idea, an abstract stand-in icon, an authored `beforeAfter`,
  a strike over a claim the narration affirms, a bare figure with only a callout as the plan.
- Invent events, numbers or objects the narration does not have (`docs/PROVENANCE-PRINCIPLE.md`).
- Edit a published book (`PUBLISHED_BOOKS.md` Summary Table) — authoring changes apply to new books only.

## Check before merge

- `node scripts/storyboard.js merge --slug=<slug>` (without `--write` first): fix every problem; read every warning.
- readcheck (`node scripts/readcheck.js prep|judge|tally --slug=<slug>`, runbook §2b) reads each beat as text; it
  does not see whether the staging fits — look at the staging yourself.
- After make-book: `node scripts/feature-usage.js --slug=<slug>` shows which of these features the book used.
- The verdict is the book's sealed blind mute test, never this checklist.
