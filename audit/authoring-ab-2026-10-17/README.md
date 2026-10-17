# Authoring A/B — "which event, comparison or relationship shows this sentence?" (2026-10-17)

Development experiment on KNOWN weak scenes (not a generalisation test; that is the next new book's fresh
mute holdout). Selection frozen first (`selection.json`, commit 6c55171): 18 scenes = burn-of-the-everflame
framecheck fc2 AUTHORING/VOCABULARY-owned failures (10) + the-art-of-saying-no mute run3 ones (8).
scene-159 (ASN) dropped after the freeze: the current planner makes it a chapter card in both versions.

- Same narration, same planner, same renderer: sandbox worktree; burn re-planned from its art.json reproduced
  263/263 scenes byte-identical; ASN VTT rebuilt from the config's word timings (770/770 captions identical).
- A = current storyboard. B = new authors (fresh agents) with one method: answer "which EVENT, COMPARISON or
  RELATIONSHIP makes this sentence's meaning visible?" and stage that; no icon quota; text is a label; a face
  or mood alone is not an answer. Authors saw narration + neighbours, not the blind findings or the old beats.
- B changed exactly the 17 scenes (0 outside), timings identical.
- Blind: separate describers for A and for B (fresh, sonnet, one image at a time); two independent judges on
  17 pairs with X/Y randomised (seeded), versions hidden, TIE allowed (`judging/`).

## Result (2 judges × 17 pairs)

| | A (old) | B (new) |
|---|---|---|
| preferred | 3 | **24** (TIE 7) |
| consensus (both judges) | 1 | **11** (TIE 2, split 3) |
| WRONG (34 judgments) | 4 | 1 |
| image ADDS | 9 | **20** |
| EXPLAINS (mechanism shown) | 0 | 4 |

Judges agreed on 14/17. Per scene: `judging/pair-scored.json`; images: `beforeafter/<book>__<scene>.png`
(left = A, right = B).

## Read with care
- B lost at ASN scene-127 (the old smirk read as a confident declaration; the new neutral reader with a book did
  not) and got 1 new WRONG at ASN scene-207: the author asked for a STRIKE on "the guilt just evaporates" but
  the engine rendered it plain, so it read as the claim. Engine defect, not the method.
- Two B wins were not the author's picture: burn scene-162 and 176 were authored with `cast: []` (Diem, the
  lead, has no cast key) but the engine filled them (narrator; and Luther twice in an overShoulder). Engine defect
  (an authored empty cast is not honoured) + story-bible gap (lead missing from the cast).
- Regression to the mean: scenes were picked because a noisy pass judged them bad; the paired, same-judge design
  controls for that only partly. Raters are one model family and judge descriptions, not pixels.
