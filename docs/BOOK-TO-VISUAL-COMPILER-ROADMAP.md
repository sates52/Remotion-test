# Book-to-Visual Compiler — Authoritative Roadmap

**Status:** AUTHORITATIVE · **Baseline:** `73f0fa4` (freeze confirmed; Gate P2.2 capture mode implemented) · **Last updated:** 2026-10-02
**Suite:** 309/309 green (locally executed; GitHub CI status not reported)

This document is the repo's single source of truth for the book-to-visual
compiler architecture and its quality program. Phase reports under `docs/`
remain the detailed evidence; this file records **what the pipeline is, which
invariants are locked, and what is still open**. Any change to architecture,
invariants, or gate status must update this document in the same commit.

## 1. The Prime Directive (architectural invariant #0)

> **Every book must be told in its own characters, its own world, its own
> relationships, its own motifs, and its own visual language.**

Corollaries, already enforced in code:

- A generic fallback is **not** the book's visual identity. The generic
  vocabulary (`data/shared-generic-motifs.json` and the measured-safe
  fallback levers) exists **only as a capability safeguard** — what the
  renderer can be *proven* to draw — never as a substitute for the book's
  authored identity. When the pipeline cannot prove a book-specific
  representation, the failure must stay visible (`STRATEGY_UNRESOLVED`,
  `STRATEGY_REQUIREMENT_UNMET`), never be papered over.
- Subject, relation, state, world, and metaphor are **authored facts**.
  Downstream passes may change *representation* (shot, expression, framing);
  they may never silently change an authored action, subject, relation,
  state, world, or metaphor (P1.4 PHASE B invariant).
- Authority about world content lives in code-owned registries and the
  story bible's provenance block — a bible is a *claimant*, never an
  *authority*, about where a motif comes from
  (`docs/PROVENANCE-PRINCIPLE.md`).

## 2. The pipeline (11 stages)

| # | Stage | Artifact / mechanism | Guard | Status |
|---|---|---|---|---|
| 1 | Book understanding | ingestion + word-timed narration | planner summary vs config | **operational** |
| 2 | Story Bible / Narrative Graph | `books/<slug>/story-bible.json` (world, provenance, allowed/forbidden motifs, characters, locations, props) | bible-integrity tests; provenance registries | **operational** |
| 3 | Narrative Atoms | `narrativeAtom` per scene (subject / relationship / state) | input to `decideStrategy()`; never mutated post-plan | **operational** |
| 4 | Book DNA | book-level visual-language signature | `scripts/test-book-dna.js` | **operational** |
| 5 | Visual Intent | `visualIntent` (+ `visualIntent.archetype` = the metaphor key) | semantic-signature key `metaphor` | **operational** |
| 6 | Visual Contract | `visualContract.visualEvidence` (+ `representation` requirement, P1.4 PHASE C) | firewall: contract ⊆ bible, evidence must prove the scene | **operational** |
| 7 | Capability-aware Director | `decideStrategy()` → `_visualStrategy` (record) → `requirementFor()` → `stageRequirement()`; measured capability map `data/visual-capability.json` (KNOWN_SAFE 0.85; cast-aware fallback; no invention) | strategy suite: visual-strategy, requirement-staging, strategy-enforcement | **operational** (13 capabilities unmeasured — see Gate G) |
| 8 | Continuity / Character & World Lock | authored-ART staging lock; `applyContractRepair` → `decideStrategy` → `resolveStrategy` → `record` → **STAGING LOCK** (P1.4 PHASE D ordering); the lock seals REPAIRED actions; `--restore` can never resurrect schema-external actions | action-lifecycle tests; D3/D4 hard codes | **operational** |
| 9 | Semantic Firewall | `scripts/lib/narrative-visual-firewall.js`; hard codes `STRATEGY_REQUIREMENT_UNMET`, `STRATEGY_EVIDENCE_MALFORMED`, `STRATEGY_UNRESOLVED`, `STRATEGY_ACTION_PROOF_REQUIRED`, `STRATEGY_ACTION_SCHEMA_EXTERNAL`; **never reads `_visualStrategy`** (grep-tested) — it judges `visualEvidence` + the real scene | failure-taxonomy tests; cross-book firewall tests | **operational** |
| 10 | Real Scene | final scene assembly after the post-plan enrichment pass | P1.4 PHASE E1 post-plan mutation ledger (`scripts/lib/post-plan-ledger.js`): every declared mutator write site announces its deltas on `_visualStrategy.postPlanDeltas`; coverage = unattributed 0 | **operational** (ledger is record-only; policy open — Gate E2) |
| 11 | Render + Blind QA | renderer (schema.ts enums are the action source of truth) → frames → blind rater reliability harness (`scripts/mute-reliability.js`) | D4 enum check; measurement always carries its model | **operational** (quota-bound; see known constraints) |

## 3. Locked invariants (index)

1. **Prime Directive** (§1) — book-specific identity; generic fallback = capability safeguard only.
2. `_visualStrategy` is **declarative metadata, never a trusted flag**; the firewall judges `visualEvidence` + the real scene only.
3. Post-plan mutators may change representation, never the semantic signature (action/subject/relation/state/world/metaphor) — measured, not asserted (P1.4 B + E1).
4. **No invention**: missing book content is never synthesized (no text/prop/subject invention; absence stays honestly unmet). Open question: the Stage Occupancy narrator (Gate E2, ch.3).
5. Capability declarations are not evidence — only **measured** capabilities (holdout protocol) open firewall rows (P1.4 A; `UNKNOWN_CAPABILITY` stays hard).
6. A capability **below KNOWN_SAFE 0.85 may never be used as a safe lever** — including by heuristic engines (E2 finding: stagnation wrote `sit` 0.688 / `hold` 0.846).
7. Shared contract objects are **copy-on-write** (P1.4 C; planner `:983` passthrough).
8. Ordering: repair → strategy → record → **STAGING LOCK**; the lock is final (P1.4 D).
9. Every declared post-plan write site must announce its deltas; **unattributed > 0 is a regression** (P1.4 E1).
10. Quality gates fail hard on unknown/unsafe; `report-only` is over (P1.4 D3).
11. Measurement discipline: suites are reported as *locally executed; GitHub CI status not reported*; every reliability number carries its rater model.

## 4. Phase ledger (completed)

| Phase | Commit | Outcome (measured) |
|---|---|---|
| P1.1 firewall | earlier | scene-contract ⊆ bible enforced pre-render (`docs/NARRATIVE_VISUAL_FIREWALL.md`) |
| P2.1 semantic hard constraints (2026-09-16, predates P1.4) | `e3f12b6` | HC6–HC10 deterministic hard constraints in `evaluateSceneVisualContract()`; 6/6 P1.5 false-accept leaks → REJECT; 30/30 semantic benchmark; 20/20 canonical bad scenes REJECT; zero LLM calls, zero production config changes |
| P1.4 A — measured capability map | `67cfd2f` (+ `86d8893`, `aeebcdf` fixes) | measured-safe replaces declared-safe; enum repairs only `push→point`, `grab→reach`; mixed-action rule |
| P1.4 B — strategy engine | in A/B chain | `decideStrategy()` + semantic signature (6 keys); cast-aware requirements (solo SAFE→diorama 0.938, two-person SAFE→closeUp 0.917) |
| P1.4 C — contract integration | `48cde3f`, `2fa69f8` | requirement → `visualEvidence.representation` → firewall; copy-on-write for the shared passthrough |
| P1.4 D — action lifecycle + ordering | `5c7dc3d`, `f966ef1` | D1–D4; repair-before-lock ordering; schema-external actions unresurrectable |
| P1.4 E — mutation audit | `49f323a` | the Antidote-6.0 pass identified as the post-plan overwrite site |
| P1.4 E1 — post-plan mutation ledger | `f5eb19d` | 584/584 attributed, unattributed 0; zero behavior change |
| P1.5 — capability-aware staging | `9f045f3`, `0747243` | UNMET 145 → 55; cast-aware fallback levers; staging `{staged[],skipped}` on `_visualStrategy` |
| P1.4 E2 — classification audit (READ-ONLY) | `b002b3c` | 39 semantic deltas decomposed (37 inert skeleton + 6 narrator inventions + 2 below-bar action swaps; **metaphor never written**); 23 staged overrides decomposed (semantic_relevance 14, stagnation 5, chapter_arcs 4); 55 UNMET causally closed (20 mutator damage + 33 copy-less + 1 title + 1 concrete); exact firewall cross-check 55=55 (`docs/P1.4-PHASE-E2-CLASSIFICATION-AUDIT.md`) |
| Roadmap established + FREEZE | `1d96c9d` | this document becomes the authoritative source; operator confirms the freeze checkpoint |

## 5. Open gates (decision points — none may be implemented without the operator)

### Gate E2 — per-mutation-type policy (STOP: ACTIVE)

Six policy decisions are classified but **not implemented**:
`chapter_arcs` narrow preserve · Gate-11 VIG writes allow+record (respect staged later) ·
Stage Occupancy narrator ruling (invention question) · stagnation below-bar
action swaps revert+record candidate · inert skeleton allow+record ·
text rewrites no action. Any implementation must keep `unattributed = 0`,
`MALFORMED = 0`, and may move UNMET **only downward** (by repairing the 20
mutator-damaged scenes). **E1.1 candidate** rides along: the ledger's
`requirementBroken` is measured before `visualContract` exists (write order);
evaluate against the post-write scene or recompute at contract time.
**FROZEN by operator (2026-10-02):** no E2 policy implementation until the
P2.2 gate produces blind production evidence (see below).

### Gate P2.2 — blind production evidence (ACTIVE — the designated next work)

The question this gate must answer before any further policy or healing work:

> **When the firewall says PASS on production scenes it has never seen
> before, is the rendered visual actually right?**

Protocol shape: keep producing new production videos → sample scenes where
the gate says **PASS** → render the real PNG → run the Vision Mute Test →
classify **GOOD / WRONG / UNCERTAIN** with the rater model always recorded.
This extends the P2.1 evidence (deterministic constraints, zero LLM calls)
with ground-truth evidence about *unseen* production scenes. Plan to be
authored with the operator **before** any sampling tooling is built. Existing
anchors: the P2.1 checkpoint `e3f12b6` (6/6 false-accept REJECT, 30/30
benchmark, 20/20 canonical bad scenes) and the blind-rater discipline in
`scripts/mute-reliability.js` (every measurement carries its rater model).
**Implementation (operator-approved plan, this commit):** `P2_EVIDENCE_CAPTURE`
feature flag (default OFF) + `scripts/lib/p2-evidence-capture.js` — PASS-only
deterministic sampling, blind/ vs metadata/ split, thin verbatim copies of
existing artifacts, ffmpeg PNG frame from the final video, non-blocking,
cleanup untouched, zero Vision/LLM calls. Hooked into the render lifecycle
immediately after the post-render firewall reports PASS
(`scripts/render.js` runPostRender). Developer doc:
`docs/P2-EVIDENCE-CAPTURE.md`. Tests: `scripts/test-p2-evidence-capture.js`
(31 assertions: disabled / enabled / REJECT-exclusion / cleanup-survival /
failure-non-blocking / seed-determinism). What remains operator-run: enable
the flag on production renders, evaluate `blind/frame.png` packages
GOOD/WRONG/UNCERTAIN, reconcile against metadata — that evidence collection
is the P2.2 work itself.

### Gate G — capability holdout measurement (P1.7)

13 capabilities unmeasured (surprised, overShoulder, crowd, cast:2-diorama,
illustration, medium, …). UNKNOWN stays UNKNOWN until the holdout protocol
fills the map; filling a row auto-flips the corresponding firewall rows.

### Gate L — recorded debt

`plan-antidote.js` lock-comment overclaim (the `_authorship.lock` comment
claims more than the code guards); fix recorded in the PHASE E audit, deferred
by operator decision. Worktree hygiene: any uncommitted local diffs in
production files must be reconciled by their owners before gates that depend
on them are re-measured.

## 6. What comes next

**FREEZE (operator, 2026-10-02):** checkpoint `1d96c9d` is the freeze point.
No code changes and no E2 policy implementation until **P2.2 blind production
evidence** exists (Gate P2.2 above): the benchmark must first be hardened
against *unseen* production scenes — Gate PASS → real PNG → Vision Mute Test →
GOOD / WRONG / UNCERTAIN. Jumping to E2 policy or auto-healing before that
measurement exists is premature. This roadmap does not authorize any
implementation on its own; the P2.2 plan is authored with the operator first.
Other structural work candidates remain parked (not scheduled, not approved):
E1.1 ledger timing fix, Gate G holdout measurement, cheap deterministic
per-book runs. Changes to this document itself follow the amendment rule in
the header paragraph: update this file in the same commit as the change it
describes.
