# P3 — Visual Capability & Reliability (plan, 2026-09-30)

Owner: the next implementation agent. Operator checkpoints after P0 and after P1.
Read first: `CLAUDE.md` (storyboard invariants), `AGENT_LOG.md` entries "2026-09-28 — rig-actions" and
"2026-09-28 — storyboard-review — measurement cleanup".

## Why this plan (and what it deliberately does NOT do)

Three reviews were compared. The agreed position:
- The bottleneck is **drawability + measurement**, not architecture. Lolita/SBC dead frames were fixed by
  giving the rig poses it lacked (lying/falling/fighting…), not by a new semantic layer.
- The blind judge is noisy (identical frames scored 4 / 3 / 8 dead). No quality claim, including the rig-action
  work, is trustworthy until that noise is measured.
- **Not in this plan:** a new "Evidence Contract", "Visual Program" or "Visual Compiler" layer. A symbolic
  mustShow/mustNotShow validator was already built and rejected (2026-09-28): symbolic gates did not predict
  visual truth. That idea is reopened only if P1 data shows RELATION failures dominate while the rig can draw
  the verbs (see P3 at the end).
- **Correction to one review:** the "capability map" must never make the engine swap an authored action for a
  "stronger primitive". The engine may improve HOW an action is drawn; it never changes WHICH action was
  authored (invariant 1). The map informs authors (rules.md) and rig work only.
- Current measured verb readings (2026-09-28, blind sonnet, one image each): lying ✓, collapsed ✓, falling ✓,
  fighting/grabbing/struggling ✓ **with a second cast member**, ✗ alone ("fuming"/"walking"/"recoiling");
  `reach` alone with no motif ✗ ("waving").

## Invariants (every phase)

1. Authored decisions are final; no engine step may restage/replace an authored beat.
2. Never change a bar or how it is computed (`data/quality-policy.json` = operator only). New numbers in this
   plan are **measured and reported**, never gating, unless the operator says so.
3. Verdicts use fresh holdouts. Blind agents: fresh, sonnet, one image at a time.
4. Published books (`PUBLISHED_BOOKS.md`) are frozen — read their data, never rewrite it.
5. minorHarm books never stage harm. Temp scripts go to the scratchpad, never `scripts/`.
6. One phase per commit, explicit paths only, read the full `git diff --cached` first (shared index).
   AGENT_LOG changelog entry per phase. Push only with:
   `git -c credential.helper= -c credential.helper='!gh auth git-credential' push origin god-mode`

---

## P0 — correctness of what we already have (do in this order)

### P0.1 Mute-test reliability (measurement only)
The mute test has two stochastic stages: the **describer** (image → blind "sees" text, PROMPTS.md §1) and the
**judge** (narration vs description → correctness/contribution, `scripts/mute-test.js judge`). Measure both.
- New `scripts/mute-reliability.js --slug=<slug> --label=<existing run> [--k=3]`:
  - reuses the frames of an existing run (no new prep; this is a diagnostic, never a verdict);
  - writes K independent describer prompts and K independent judge prompts into the run's PROMPTS.md
    (same one-image-at-a-time rule; each judge gets its own copy of judge-input);
  - `tally` computes per frame: each judge's correctness + contribution, majority, agreement (k/K), and
    splits disagreement into *describer-caused* (descriptions differ materially) vs *judge-caused*
    (same description, different verdict).
  - output `books/<slug>/mute-test/<label>/reliability.json` + a printed table:
    frame · j1 · j2 · j3 · majority · agreement · source.
- Run it on 3 books that have stills on disk (prefer unpublished ones; published books may be read, not
  rewritten). Report: mean agreement, % frames with agreement < 2/3, and whether any book's PASS/FAIL would
  flip under majority vote. **Do not change preview-ready or the bars.**
- Done: reliability.json for 3 books + AGENT_LOG entry with the numbers.

### P0.2 Close the authored-icon restage hole
Facts: `scripts/lib/visual-contract.js` `repairSceneContract` (≈line 88) replaces a forbidden motif with the
brief's concept or `"spotlight"` (SAFE_FALLBACK_MOTIFS = spotlight/shape/orbit/ripple). It runs in
`scripts/plan-antidote.js:992` and `scripts/hard-gate.js:102`. The authorship lock (plan-antidote, the
`_authorship.lock` block right after) seals shot/set/cast/expression/action/holds — **not the icon**.
- Add `concept` (and the authored prop types) to `_authorship.lock`; teach `scripts/lib/authorship.js`
  `restoreAuthoredStaging` and `scripts/gate-authorship.js` (STAGING_OVERRIDDEN) to compare/restore it.
- `repairSceneContract` on an authored beat never substitutes: a forbidden authored icon becomes an
  `UNRESOLVED` problem → plan/gate exits non-zero with the scene id and reason ("re-author this beat").
- On non-authored (heuristic) beats remove the silent `spotlight`/generic fallback: drop the prop and log it
  (no generic wallpaper). Keep SAFE_FALLBACK_MOTIFS only if something else still needs it; otherwise delete.
- Tests: extend `scripts/test-authorship-gate.js` — (a) authored forbidden icon → UNRESOLVED, not replaced;
  (b) an icon changed after planning → STAGING_OVERRIDDEN; (c) restore puts the authored icon back.
- Done: tests pass; a re-plan of one unpublished Antidote book shows 0 icon substitutions on authored beats.

### P0.3 Book DNA fails closed
Fact: `scripts/lib/book-dna-schema.js:168` warns and continues with defaults when DNA fails to load.
- DNA file **present but unreadable/invalid** → throw (planning stops, clear message).
- DNA file **absent** → defaults stay allowed (older/published configs must still plan/render — code contract),
  but log it once.
- Done: a malformed DNA fixture fails; a book with no DNA still plans.

**→ Operator checkpoint: report P0 numbers (esp. P0.1 agreement) before starting P1.**

---

## P1 — learn where it fails and what the renderer can draw

### P1.1 Failure taxonomy in the judge (measured only)
- `scripts/mute-test.js` judge prompt + result shape: for every WRONG or NONE frame add
  `class` ∈ SUBJECT | ACTION | RELATION | STATE | WORLD | IDENTITY | COMPOSITION | METAPHOR | TEXT and a short
  free-text `subclass`. ADDS/CORRECT frames get no class.
- `tally` aggregates class counts into mute-test.json; `scripts/quality-benchmark.js` adds a class-distribution
  column. No effect on PASS. Old runs without classes stay valid.
- Done: one fresh run on an unpublished book shows the distribution; AGENT_LOG entry.

### P1.2 Layer audit — measure before deleting
Layers to audit (at least): `scripts/lib/antidote-auto-repair.js`, `antidote-novelty-budget.js`,
`antidote-promise-engine.js`, `antidote-semantic-director.js`, `antidote-stagnation-engine.js`,
`narrative-visual-firewall.js`, `visual-contract.js` repair/filter, `visual-intent.js`, VIG, Book DNA.
- For each: input, output, where it runs (make-book step), and — measured on 2 unpublished Antidote books by
  diffing the final config with the layer disabled (temporary env flag or scratch patch, never committed as a
  behaviour change) — how many scenes it changes, how many of those are authored beats (should be 0), and
  whether it ever blocked a real failure (gate history in AGENT_LOG / reports).
- Output `audit/layer-audit.md`: table + KEEP / MERGE / DELETE / OBSERVE per layer with the evidence.
- **No deletions in this phase.** Deleting is a separate, operator-approved commit.

### P1.3 Visual Verb Benchmark → capability map
- New `scripts/verb-benchmark.js`: builds a THROWAWAY Antidote book (never a published slug; delete it after)
  with one scene per `charAction` × framing (wide, medium, and twoShot for two-person verbs) × 2 cast looks,
  no on-screen text, renders stills in one bundle via `scripts/render-sequence-stills.js` (repo-relative --out),
  copies them to neutral shuffled names in the scratchpad, and writes one blind prompt per image.
- `tally` → `data/verb-capability.json`: per action × framing: blind label, correct yes/no, notes; later runs
  append so rates accumulate.
- `scripts/storyboard.js` writes the map's weak rows into rules.md (like icon-readings), so authors avoid
  staging that measurably fails. The engine never reads it to change an authored action.
- Done: map covers every current action; weak rows appear in a freshly prepped rules.md.

**→ Operator checkpoint: failure-class distribution + capability map + layer audit.**

---

## P2 — invest where the data points
- Rig/pose/interaction expansion: take the top failure classes (P1.1) and the missing verbs they name
  (e.g. embrace, kneel, cry, run, hide, push, carry) and add them with the 2026-09-28 recipe:
  schema enum → `movements.ts` pose → Everyman drawing if needed → storyboard SITUATIONS (+ pair rule if a
  two-person verb) → verb benchmark → `data/icon-readings.json` staging row.
- Unseen production: 2–3 unpublished books through `preview-hazirla` with fresh holdouts, reporting the P0.1
  majority/agreement next to the official verdict.

## P3 — only then reconsider
Evidence Contract / Visual Program / Visual Compiler, **only if** P1–P2 data shows RELATION (or STATE) failures
dominating while the verb benchmark says the rig can draw the verbs involved. Otherwise it stays closed.
