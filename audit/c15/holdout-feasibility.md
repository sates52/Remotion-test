# Level-2 holdout — feasibility check (cycle 15; no rating run, the pre-registration is unchanged)

Pre-registration: `dev/c14:audit/c14/preregistration-level2-holdout.json` (40 books x 1 cause-present beat; an author
SKIP is scored A = B; criteria frozen).

## Pool (cheap scan, read-only)
- Antidote configs on disk: 61. Excluded as development books (cycles 11–14 benchmarks / pilots): 16 → **45 eligible**.
  (Cycle 10 used synthetic passages, not book beats.) Cycle 15's creative-direction pilot then used 5 of them
  (the-knave-and-the-moon, essentialism, philosophy-for-life, the-5-elements-of-effective-thinking, the-paradox-of-choice)
  → **40 untouched books**.
- `single-relation-scan.js scan --experiment` (read-only, output outside the books): **40 of 45 books have ≥ 1 scan
  candidate, 250 candidates** (per book 1–17, median 5).

## The bottleneck is authoring, not the pool
Observed author acceptance: cycle 14 2 / 18 candidates (11 %); cycle 15 5 / 20 (25 %, with the creative-direction
guide and the author choosing ≤ 1 per book). Expected books with ≥ 1 valid contract among the 40 scanned:

| acceptance per candidate | 3 % | 11 % | 20 % | 25 % | 35 % |
|---|---|---|---|---|---|
| expected books | 6.7 | 19.1 | 27.2 | ≈ 30 | 34.0 |

## Consequence under the FROZEN pre-registration
The pre-registration samples one beat per book BEFORE authoring and scores an author skip as A = B. With 11–25 %
acceptance, 75–89 % of the 40 beats would be A = B: a true +15 pp effect on authored beats becomes ≈ +2–4 pp on the
primary — **almost certainly INCONCLUSIVE** after ≈ 3 M tokens. Running it as frozen would not produce a decision.

## Options (operator decision — the pre-registration is NOT changed silently)
1. **Keep as frozen, do not run** until acceptance is higher (better scan precision / authoring guide) — no cost.
2. **New pre-registration v2** (a new file, v1 kept): sample per book the FIRST beat a fresh author accepts (scan →
   author → validate, seeded order), then rate A vs B on those authored beats only; estimand = "effect where the
   capability is applied", which is what an opt-in production use would do. Expected n ≈ 25–30 books at 20–25 %
   acceptance → power ≈ 60–70 % at +15 pp (cycle-13 SD 33.9); ≈ 2.4 M tokens.
3. Option 2 plus the cycle-15 human study v2 on a subset, for the preference side.
Recommendation: 2, after the operator's decision.
