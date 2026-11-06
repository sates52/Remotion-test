# Cycle 16 — relational motion, human feedback, Level-2 holdout v2

## Human feedback (operator, recorded as given — visual preference only)
- **C13 muted study v2 (10 scenes, JSON `answers-P-22d45a79ee`):** only `visualPreference` is valid (the other fields
  were filled at random). Preferred version: **B 6 / 10** (C04, C06, C12, C09, C10, C01), **A 4 / 10** (C05, C15, C08, C07).
  This is dimension C (preference), one viewer — not comprehension.
- **C15 fresh study (4 scenes, no JSON):** comparison 1 → video 1, comparison 2 → video 2, comparison 3 → **neither
  understood (no preference)**, comparison 4 → video 2. Presentation order is randomised per participant and the
  operator's seed is unknown, so "video 1 / 2" can NOT be mapped to A / B or to a book. No mapping is guessed.

## The "not understood" scene
Which fresh scene was comparison 3 cannot be known. What can be checked: `review()` marks two of the four fresh
single-relation versions `TRY_CONCRETE` — philosophy-for-life 343 (a mask "laughed at" → a "terror" tank) and
essentialism 205 (a door "rejecting" → a "pain" tank): both ends are carried only by their labels and nothing leaves,
moves or breaks. Those are the likeliest "not understood" scenes; the production versions of the same beats were also
abstract (agent comprehension A 0 / 16.7).

**Development alternative (dev only, never in the holdout):** `dev-concrete/` — 343: strangers (group) → the
"terror" chains disappear (dashed outline stays) and the person's face goes from afraid to calm (`removal`);
205: the person "rejecting" next to the "friend" → the "pain" heart breaks (`character-action`, no invented effect on
the friend). Both validate, review OK. Seen weaknesses: nothing shows the strangers *laughing*; the heart is grey and
whose pain it is stays open. Strips + clips rendered on Actions (run 42192149249). Not rated, not shipped.

## Level-2 holdout v2 (pre-registered before authoring: `preregistration-level2-v2.json`)
| | |
|---|---|
| books / candidates walked | 35 / 118 (seeded order, stop at first accept) |
| author decisions | 102 skipped (inner-state 29, no-asserted-relation 20, quoted / opinion 16, not drawable 15, hypothetical 9, other 7, end not nameable 4, already shown 2), 16 accepted, 2 of them failed validation |
| rated beats (n) | 14 (one per book) |
| primary A → B | 19.1 → 60.1, **Δ +41.1 pp, 95 % CI [+23.2, +59.5]** |
| beats gaining ≥ 1 correct element / worse | 11 / 1 (poison-daughter 97: −16.7) |
| wrong inference A / B · polarity · wrong cause | 2 / 2 · 0 / 0 · 0 / 0 |
| validation failures | 2 / 16 = 12.5 % (cap 10 %) |
| **decision** | **INCONCLUSIVE** — n < 15 and validation failures > 10 %. Stays Level 1. Never re-decided on these beats. |

Secondary (descriptive): review OK n 11 Δ +34.8, TRY_CONCRETE n 3 Δ +63.9 — the review does not predict agent
comprehension (it was built from the operator's preference); keep it advisory. By mechanism: depletion +56.2 (4),
transformation +41.7 (3), cause-effect +20.8 (4), removal +75 (1), transfer +33.3 (1), character-action +33.3 (1).
All raters are agents (fresh sonnet describers, 4 strips each, two judge passes); nothing here is a human result.

Files: `holdout/author/` (decisions + contracts), `holdout/answer-key.json` (narration only, before render),
`holdout/strips/` (A = production, B = compiled; isolated configs), `holdout/rating/`, `holdout/result.json`,
scripts `build / blind / judge / tally.js` (seeded).

## Pipeline friction — `friction-audit.md`
Fixed on god-mode: short verbatim operator words; engineKeep survives an approved repin; `.bin` self-heal. Already
solved (regression evidence in the audit): book-start resume, single-run locks, one-attempt approvals.

## Vox — `vox-providers.md` (research only, no API call)
