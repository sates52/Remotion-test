# Screen-Text Gate — implementation audit & plan (B + C + E)

Status: **Phase 1 (B + C + E) IMPLEMENTED 2026-09-23 — uncommitted; see AGENT_LOG.** Deferred: hard-gate Gate 9 fail-closed, audit-coherence reuse of screen-text.
Scope: engine/pipeline changes for books that come NEXT. Published books are frozen
(PUBLISHED_BOOKS.md); their configs must still *render* (code contract) but are not re-planned.

## 0. Findings that change the brief

1. **`wordSlices` is not the main source of bad on-screen text.** In `show-your-work`
   (239 scenes, 148 texts, only 42 distinct values) most copy is written *after* planning:
   - `scripts/apply-semantic-arcs.js:106` replaces every `texts[]` via
     `lib/antidote-semantic-director.js` `deriveComplementaryPunch` (:61-99) → canned
     fallbacks: "WHAT ACTUALLY CHANGES" ×53, "NOT WHAT IT SEEMS" ×18, "THE COMMON PATH" ×11.
   - `lib/antidote-novelty-budget.js:223` injects `["TRIGGER","HABIT LOOP","REWARD"]`;
     `lib/antidote-stagnation-engine.js:287` injects `["DEFAULT TRAP","REAL LEVERAGE"]` /
     `["STEP 01","STEP 02","RESULT"]`; `lib/antidote-chapter-arcs.js:92` subtitles every
     chapter card "A NEW MENTAL MODEL".
   - `repair-coherence.js:68` `DIAGRAM_FLOOR`; renderer fallbacks in `Diagram.tsx`
     (CAUSE/EFFECT :154, LESS/MORE :222, matrix/tree/funnel literals).
   → A validator placed only after the planner is bypassed. It must sit at the **last write
   before render**.
2. **Label generation** (`scripts/lib/director-adapter.js`): `label()` :27 = last 4
   non-stopwords; `wordSlices()` :52 = first 3 / last 3; floors :192-204 fire on regex
   archetypes from `src/semantic/visualIntent.ts:83-117` (the contrast regex matches any
   "not/but/yet/while"). When payload is null the causal/tension floors STILL ship with
   constant labels (TRIGGER/CONSEQUENCE, DENIAL/REALIZATION); the title is never derived.
   `audit/p2.2a-pass-generation-diagnosis/P0.2_SEMANTIC_PAYLOAD_REGRESSION.md` already
   recorded `BLOCK_P0.3_PAYLOAD_SANITY_FAILED` (10/22) — the defect was known.
3. **The firewall itself forced the deletion.** `narrative-visual-firewall.js:136` requires a
   prop to be in `allowedMotifs` **AND** `allowedProps`. In `show-your-work`'s bible the two
   lists are disjoint (motif ids vs. plain-English props), so *every* prop fails — deleting
   all props was the only way to PASS. In verity/republic/sisyphus the lists are identical,
   which hid the bug. "Don't touch the firewall" cannot hold for this line.
4. **Contamination is not "another book's file".** No code reads another book's bible:
   - `hard-gate.js --auto-fix` → `lib/visual-intent.js` `enforceSemanticRelevance` (:1142)
     runs Republic regexes on EVERY book ("city/community/society/laws" → `civicPolis`,
     fallback `socratic_inquiry`) and writes props + `visualProposition`.
   - `lib/narrative-compiler.js:40-117` has Stargirl-specific patterns/cast; default beat
     type `"philosophy"` (:166) → 141/239 briefs.
   - `preproduce.js:57` always overwrites `creative-bible.json` (hand-authored
     `creator_economy_craft` → `silicon_valley_startup` by substring scoring).
   - `plan-antidote.js:899-916` never writes `genre` to `config.meta`; downstream genre
     checks see nothing.
5. **The regression baseline is not green and not "proven".**
   - P1.5: Gate PASS 6 → Vision WRONG 6 = **100 % leak**, 0 true accepts (not an achievement).
   - P2.2: **0 / 933** production scenes pass the gate → it has never been shown to accept a
     good production scene.
   - `test-bible-integrity.js` currently **14 pass / 8 fail** (Test A reads live verity data,
     which commit 0719298 cleaned). Fixtures must be frozen copies.

## 1. Target architecture

```
plan-antidote → apply-semantic-arcs → (repairs) ─┐
                                                 ▼
Narrative/World Firewall   "does this visual belong to this book?"   (existing)
Screen-Text Validator      "does every on-screen string mean something the audio says?" (NEW)
Composition Integrity      "was content removed/laundered after planning?"  (NEW)
gate-p15                   (existing)
render
```

Captions are excluded from the Screen-Text Validator (they are the transcript; ASR is
handled by `normalize-entities.js`).

## 2. Phase 1 — B: stop fabricating labels at the source

| Change | File:line | Behaviour after |
|---|---|---|
| Remove `wordSlices` + last-4-words `label()` fallback | director-adapter.js :27, :52, :81, :99 | payload only from explicit split markers (because / leads to / rather than / but …) **and** only if both halves pass `screenText.isLabel()`; else `null` |
| Floors need a payload | director-adapter.js :192-204 | causal/tension/comparison floors apply only with a valid payload; `null` → **no diagram** (scene keeps its non-diagram shot). Title derived from payload (`A → B`) or omitted — never "TRIGGER → CONSEQUENCE" |
| Canned punch fallbacks | antidote-semantic-director.js :45-99 | return `null` (no text) instead of anchors/fallback constants; pair halves never share one anchor |
| Constant-label injectors | novelty-budget.js :223, stagnation-engine.js :287, chapter-arcs.js :92 | inject only when labels come from the beat (validated); otherwise skip. Chapter subtitle omitted, not "A NEW MENTAL MODEL" |
| Repair floor copy | repair-coherence.js :68-71, :189 | drop `DIAGRAM_FLOOR`; a degenerate diagram is removed, not re-labelled |
| Renderer fallbacks | Diagram.tsx :80,145,154,222,253-259,333-344,436 | keep for old configs (code contract) but emit nothing new; new configs never rely on them (validator rejects missing labels) |
| Authored art wins | plan-antidote.js :585 | unchanged; `ART[i]` gains a narration-fingerprint check (today index-only, :492) |

Test impact: `verify-director-adapter.mjs:90` asserts a 2-item payload for all 22 cases —
change to "payload is null **or** passes screenText". Expect several of the 22 to become null;
that is the intended fix (P0.2 already failed 10/22 on sanity).

## 3. Phase 1 — C: one Screen-Text Validator

New `scripts/lib/screen-text.js` (CommonJS; a tiny TS twin only if the renderer needs it):

- `collectScreenStrings(scene)` → texts[].text, diagram.title/labels, chapterCard.*,
  hud.topic, prop.label. One list, one owner.
- Checks (hard unless noted):
  - `FILLER_TOKEN` — discourse/filler lexicon (okay, let's, unpack, frankly, actually, yes,
    well, hey, stop, like, gonna…). **Consolidates the ~10 separate stopword lists**
    (director-adapter :6, plan-antidote :125, antidote-copy :20-91, beat-text, …) into one.
  - `FRAGMENT` — starts/ends with a function word, auxiliary or bare negation ("DONT",
    "…YOU KILL", "GOES TEACH DONT"); fewer than 1 content word.
  - `LENGTH` — 1–5 words per label, fits `labelFit.ts` geometry.
  - `PAIR_DUPLICATE` / `PAIR_OVERLAP` — halves of a flow/contrast equal or share >50 % tokens.
  - `CONSTANT_TEMPLATE` — string in the code-owned template list (TRIGGER, CONSEQUENCE,
    WHAT ACTUALLY CHANGES, …; supersedes the 14-item `FORBIDDEN_GENERIC_TEXTS`).
  - `BOOK_REPETITION` — same string on > N scenes (default 3) unless authored as a motif line.
  - `UNGROUNDED` — every content word must appear (lemma) in the scene's narration window
    **or** the string is authored (art file / brief with provenance). Uses the full segment,
    not the 160-char `_narration`.
  - `ASR_TOKEN` (report→hard) — non-dictionary token not in the book's entity list.
- Honest limit: deterministic checks reject garbage; they cannot prove causal meaning.
  Causal/contrast *validity* comes from authored claims (Phase 2). In production mode an
  unauthored diagram with only heuristic labels is allowed only if it passes every check.
- Wiring (hard): `make-book.js` new step right before the firewall (1.895) **and**
  `render.js` next to `gate-p15` (:188). `--report-only` for audits of published books.
  `audit-coherence.mjs` reuses the module instead of its hand-mirrored `FLOOR_PAIRS` /
  `BOILERPLATE_LABELS`.
- Fixtures (`scripts/test-screen-text.js`): reject = the 29 show-your-work flow labels +
  the 15 sampled texts (frozen copy); accept = hand-authored good labels.

## 4. Phase 1 — E: no PASS by deletion or laundering (no quotas)

| Change | Where | Why |
|---|---|---|
| Fix AND→correct semantics | narrative-visual-firewall.js :136 | prop must be an allowed **motif** (motif ids); `allowedProps` checked for its own vocabulary. Plus bible check: `allowedMotifs` non-empty and consistent with props vocabulary |
| Plan manifest | plan-antidote.js :932 writes `books/<slug>/plan-manifest.json` (per-scene hash + counts of props/texts/diagram/concept, narration fp) | baseline that did not exist |
| `COMPOSITION_REMOVED` | new `scripts/lib/composition-integrity.js`, run with the firewall | fails when post-plan edits remove >X % of planned content (or empty a scene that had a composition) **without** an authored reason. **Relative to the planner's own output — not an absolute icon floor**, so no quota comes back |
| Provenance laundering | inject-provenance.js :134 | records the config hash it derived from; firewall fails if the config changed after provenance without re-plan. `--force` requires a logged reason |
| Unchecked fields | firewall | also inspect `visualProposition.subject` and `director.visualSubject` against the world (today ringOfGyges ×98, "Socrates" ×11 survive) |
| Stop Republic heuristics leaking | visual-intent.js :1142 | `enforceSemanticRelevance` Republic motifs only when the book's `worldId` owns them (`data/motif-world.json`) |
| Stop Stargirl heuristics leaking | narrative-compiler.js :40-117, :166 | book-specific patterns behind the book's own bible; default beat type = neutral (`"argument"`), not `"philosophy"` |
| Don't overwrite authored bibles | preproduce.js :57 | skip when `creative-bible.json` exists and is authored |
| Genre transport | plan-antidote.js :899 | write `meta.genre` |
| Fail-closed briefs | hard-gate.js Gate 9 :75-110 | missing briefs / fp mismatch / exception = FAIL, not pass |

## 5. Regression protocol

0. **Before any change:** freeze Test A fixtures (copy pre-0719298 verity data into
   `fixtures/`), get `test-bible-integrity` back to 22/22. Record a baseline run of:
   `test-bible-integrity`, `test-cross-book-firewall` (23/23), `p15-regression`,
   `test-forbidden-templates`, `semantic:benchmark` (to a temp dir), `verify-director-adapter`,
   `tsc` error set.
1. After each sub-step: same suite; allowed diffs only where the plan says so
   (verify-director-adapter null cases).
2. Published configs: run the new validator + composition check **report-only**; render one
   still per published Antidote book to prove the code contract (no crash).
3. New negative tests: "delete all props" and "remap motifs" on a frozen fixture must FAIL.

## 6. After Phase 1 (agreed order)

- **Phase 2 — A:** discard the current `show-your-work` config; authored story-bible/DNA,
  239 claims → visual intent → authored diagrams/copy (`art.json`), re-plan.
- **Phase 3 — D:** blind Vision Mute Test on gate-PASS scenes; metric = Gate PASS → Vision WRONG %.
- **Phase 4 — F:** word-level timing of labels.
