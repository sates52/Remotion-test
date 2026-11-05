# Cycle 12 — 30-item human reference (prepared; NOT run)

Status: **materials prepared, no human ratings collected.** Every result reported for cycle 12 is agent-rated
(sonnet describers + sonnet judges). Nothing in the result file may be read as a human result.

## What a human rater gets
- `human-sheet.html` (built by `human-sheet-c12.js` from the blinded strips): the 30 main beats, each shown as THREE
  3-frame strips labelled **X**, **Y**, **Z**. Which is the current storyboard (A), Director 1.0 (B) or Director 2.0 (C)
  is decided per beat by a seeded permutation (`human-order.json`, kept from raters), so neither position nor label leaks the arm.
- No sound, no narration, no book title beyond the small header the film itself shows.
- Per strip, four questions (the same as the agent describer, so human and agent results are comparable):
  1. **Open description** — what do you see happen across the three frames?
  2. **Causal question** — did something change? what caused it? what was the result?
  3. **Message** — in one sentence, what is the narrator saying here?
  4. **Wrong-inference check** — is there anything here that could mislead you? (free text)
- Then, per beat, one forced choice: **which strip (X, Y or Z) made the point clearest?** and a 1–5 confidence.

## Scoring (separate person, with the answer key)
- `answer-key.json` (frozen before authoring) gives per beat the intended understanding, cause, effect, key facts and up
  to 3 wrong inferences, and whether the narration states any causality.
- A scorer who has NOT seen the sheet's X / Y mapping applies the same rubric as the agent judge (cause / effect
  CORRECT / WRONG / NOT_SHOWN, message MATCH / PARTIAL / MISS, wrong inference YES / NO, polarity error YES / NO; `rating-prompts.md`).
- Two scorers on the same answers → Cohen's kappa; disagreements resolved by discussion and logged.

## Cost and process (estimate)
- Rater time: 30 beats × 3 strips × ~1.5 min ≈ 135 min per rater; 5 raters ≈ 11 h of rater time.
- Scorer time: 450 answers × ~20 s ≈ 2.5 h per scorer; 2 scorers ≈ 5 h.
- Raters must not see both arms of a beat in the forced-choice-free part if order effects matter: a stricter design
  gives each rater only ONE arm per beat (three rater pools, 10 + 10 + 10 split) — triples the raters, removes carry-over.
- Recruiting: English-reading viewers who have not read the books (the channel's audience); paid per session.

## Why it matters
Cycles 10, 11 and 12 use agent raters. Agent describers read flat-vector SVG frames well and read text exceptionally well;
a human may weigh pictures and on-screen text differently. Until the human reference exists, the agent result is a
pilot signal, not a measure of what the audience understands.
