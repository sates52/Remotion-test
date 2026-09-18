# P2.2 Blind Production Sample — Eligibility Report

**Status:** BLOCKED before rendering; no results fabricated.

## Objective and fixed sample protocol

P2.2 requires **20–30 genuinely new, production-rendered scenes that first pass the current VisualContract gate**, followed by a blind Vision Mute Test (`GOOD`, `WRONG`, or `UNCERTAIN`). The key metric is **Gate PASS → Vision WRONG %**.

The candidate universe was every scene in the three current Antidote production configurations. `crime-and-punishment` was the preferred sample source because it is not represented in `audit/p1.5-benchmark/gate-results.json`; it therefore satisfies the “not previously benchmarked” criterion. The selector uses existing scene data only, derives an existing `VisualContract` from its narration, and requires the existing evaluator's exact `PASS` verdict (score >= 60, no violations, no hard violations). It does not alter production rules or scene data.

Selection command:

```powershell
node scripts/p22-select-blind-sample.mjs --book=crime-and-punishment --count=25
```

Planned selection order (only after eligibility exists): first Gate PASS in each 20-scene source block, then remaining PASS scenes in source order. This gives deterministic, source-spanning sampling rather than choosing only easy opening scenes.

## Eligibility results

| Production configuration | Total scenes | Gate PASS | Gate REJECT | Eligible 20-scene sample? |
|---|---:|---:|---:|---|
| `books/the-republic/config.antidote.json` | 324 | 0 | 324 | No |
| `books/the-trial/config.antidote.json` | 315 | 0 | 315 | No |
| `books/crime-and-punishment/config.antidote.json` | 294 | 0 | 294 | No |
| **Total** | **933** | **0** | **933** | **No** |

The selector correctly aborts with `Only 0 Gate PASS scenes available; required 25.` No PNGs were rendered and no Vision labels were assigned, because either action would misrepresent a PASS-only blind production sample.

## Current gate rejection distribution

Counts are scenes containing each violation; a scene may appear in more than one row.

| Violation | The Republic | The Trial | Crime & Punishment | Total |
|---|---:|---:|---:|---:|
| `IDLE_ACTOR_WALLPAPER` | 243 | 263 | 241 | 747 |
| `MISSING_STRUCTURAL_EQUIVALENCE` | 52 | 73 | 75 | 200 |
| `GENERIC_TEMPLATE_TEXT` | 54 | 48 | 40 | 142 |
| `FORBIDDEN_GENERIC_TEXT` | 54 | 48 | 40 | 142 |
| `DOMAIN_LEAKAGE` | 7 | 3 | 3 | 13 |
| `VISUAL_SALIENCE_FAILURE` | 1 | 2 | 4 | 7 |
| `EMOTIONAL_CONTRADICTION` | 2 | 2 | 2 | 6 |
| `FORBIDDEN_PROP` | 0 | 1 | 0 | 1 |

## Required P2.2 confusion matrix

There is no denominator for Gate PASS, so **Gate PASS → Vision WRONG % is not measurable** (not `0%`).

| Gate verdict | Vision GOOD | Vision WRONG | Vision UNCERTAIN | Total |
|---|---:|---:|---:|---:|
| Gate PASS | N/A | N/A | N/A | 0 |
| Gate REJECT | Not sampled | Not sampled | Not sampled | 933 |

## Required Vision WRONG taxonomy

This taxonomy must be applied only after the blind review of actual rendered pixels. It has no observations yet, rather than zero observations:

| Vision WRONG class | Count | Status |
|---|---:|---|
| subject mismatch | N/A | No eligible render sample |
| action mismatch | N/A | No eligible render sample |
| setting mismatch | N/A | No eligible render sample |
| emotional mismatch | N/A | No eligible render sample |
| salience problem | N/A | No eligible render sample |
| metaphor too generic | N/A | No eligible render sample |
| narration has no visualizable claim | N/A | No eligible render sample |

The rejection distribution is only a **gate-level diagnostic**, not a substitution for Vision WRONG labels. Its strongest evidence is that the current production grammar is blocked primarily by `IDLE_ACTOR_WALLPAPER` (747 flagged scenes) and missing comparative structure (200); this report intentionally does not infer a new deterministic rule from that evidence.

## Safe resume condition

Run P2.2 only once at least 20 genuinely new production scenes have been created/updated by the normal production pipeline and the unchanged gate reports `PASS`. Then render the selected `captureFrame` values from the generated manifest with `npx remotion still Antidote-<book> ... --frame=<captureFrame>`, conduct the mute review without narration visible, and populate the matrix/taxonomy above.
