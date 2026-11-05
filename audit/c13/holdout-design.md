# Level-2 holdout — design (cycle 13; to be pre-registered and run as its own step)

Question: on cause-present beats of NEW books, does production + the single-relation capability (B) make a muted viewer
understand more than production alone (A), without more wrong inferences?

## Why it may start
Pilot progression condition (preregistration-c13.json) MET on cycle-12 development data: B − A = +25 pp (3-frame strip,
95 % CI +1.7 … +48.3), +18.3 pp (dense frames, CI +10 … +26.7); wrong inferences A 0 / 0.5, B 0 / 0.5. These beats were
used to build the capability, so this only permits the holdout; it is not ship evidence.

## Sample and power (audit/c13/power.json — cycle-12 cause-present beats, n 27, 15 books)
- Paired difference B − A: mean +18.8 pp, SD 33.9 pp; book ICC 0.05.
- Planning effect **+15 pp** (below the observed +18.8: the observation is inflated by selection — winner's curse).
- Power (cluster bootstrap simulation, 95 % CI lower bound > 0): 40 books x 1 beat → **78 %** at +15 pp (99 % at +20,
  40 % at +10); 20 books x 2 → 53 %; 10 x 4 → 35 %. **Design: 40 different books, ONE cause-present beat each** —
  no within-book dependence to model; books not used in cycles 10–12 first, then ±5-beat exclusion where reused.
- A true +10 pp effect is below what this budget can detect: a non-significant result is reported INCONCLUSIVE, never
  as "no effect".

## Procedure (same as cycle 12 unless stated)
1. Seeded beat selection (cause-present by a fresh key author BEFORE any contract), frozen answer key with notAsserted.
2. Fresh contract authors (single-relation/1, one pass + one compile-fix pass); a contract that does not validate is
   arm B's failure (scored 0), no experimenter edits.
3. Renders on GitHub Actions (stills-cloud.js), 3-frame strip at 30 / 60 / 90 %.
4. Describers: 4 strips of 4 different beats each (calibrated EQUIVALENT in cycle 13), the two arms of a beat always to
   different describers. Judges: 8 items of 8 different beats, 2 passes (cycle-13 pilot judge instructions, kappa
   reported).

## Decision rule (one primary comparison — no multiplicity correction needed; secondaries are descriptive)
- **Primary:** mean paired B − A on the 40 beats, 95 % bootstrap CI.
- **Level-2 SELECTIVE SHIP** (scope: cause-present beats where a single relation is stated) only if ALL: CI lower bound > 0
  and point estimate ≥ +10 pp; wrong inferences B ≤ A; polarity errors B ≤ A; no invented cause/effect (judge
  wrongInference on a cause the narration does not state) in B; arm-B compile failures ≤ 10 %.
- CI lower bound ≤ 0 → **INCONCLUSIVE** (not NO SHIP of the capability, which stays Level 1, default OFF).
- Point estimate < 0 or wrong inferences up → **NO SHIP** for Level 2.
- The holdout is used once: no fixes on it, no re-decision on the same beats.

## Budget (tokens, measured unit costs: describer ≈ 58 k / 4 strips, judge ≈ 62 k / 8 items)
- Rating: 20 describers ≈ 1.2 M + 2 x 10 judges ≈ 1.2 M = **≈ 2.4 M**; key + contract authoring ≈ 0.5 M → ≈ 2.9 M (cap 3 M).
- Pre-registered fallback if the cap would be crossed before rating starts: ONE judge pass (10 judges) plus a second
  pass on a seeded 25 % subset for kappa (≈ 1.5 M rating) — decided before any rating, never after seeing results.
- Cloud: one stills run (~80 strips, ≈ 3 min on 10 runners).
