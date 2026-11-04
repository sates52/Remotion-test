# Visual Storytelling Benchmark (VSB-1) — design, cycle 10 (2026-11-04)

Purpose: one fixed instrument that says whether a change to GoodBookSummary's visual storytelling is a real gain,
across the three kinds of narration we make — not one prop-transfer test, and not one LLM judge.

## 1. What the narration actually is (measured, scene router, rule-based)
Over 2 022 beats of 7 committed Antidote books (fiction 872 / ideas 937 / philosophy 213):
abstract-concept ~70 %, causal-mechanism ~14 %, concrete-action ~5 %, data ~4 %, environmental ~4 %, interaction ~2 %.
(The rules are crude — precision not validated; the order of magnitude is the point: even fiction is narrated as a
two-host discussion.) A benchmark that samples beats at random is ~70 % abstract; a benchmark built only from deeds
measures 5 % of the film. VSB-1 therefore STRATIFIES and reports each stratum on its own.

## 2. Strata (real narration only, drawn by script, frozen as a holdout)
| stratum | source | per round |
|---|---|---|
| A. fiction / character action | concrete-action + interaction beats of fiction books, 3-beat sequences | 10 sequences |
| B. business / psychology / cause→effect | causal-mechanism beats of ideas books | 10 beats |
| C. abstract philosophy / concepts | abstract-concept beats of philosophy + ideas books | 10 beats |
Drawn by a seeded script (book order fixed, ±5 beats from any earlier test excluded), sealed before authoring;
the same frozen set is reused across cycles for comparability, and a fresh set is drawn when a cycle wants a
verdict (cycle 3/7 rule: a verdict is a FRESH holdout).

## 3. The three questions, measured separately (never one score)
1. **Correct** — does what the picture shows match the narration? (CORRECT / NEUTRAL / WRONG)
2. **Explains vs reminds** — does the picture show the event / mechanism (who does what, what leads to what) or
   only the subject (a phone because the beat mentions a phone)? (EXPLAINS / REMINDS / NOTHING)
3. **Muted inference** — with the sound off, could a viewer state the beat's message? Scored on the describer's own
   one-sentence `message` against the narration (MATCH / PARTIAL / MISS), not on the judge's view of the picture.
"Aesthetic but empty" never passes: a frame counts as a success only when Q1 = CORRECT and Q3 ≥ PARTIAL; a pretty
frame whose describer cannot say what it means scores as a miss whatever its contribution label.

## 4. Raters (cycle 8: describer variance is high, judge labels unstable, some samples swing the result)
- describers: k = 3 fresh sonnet agents per image/strip (one image each, no narration), majority + spread reported;
- judges: 2 fresh agents per description, disagreement reported (not resolved silently);
- **human reference**: a 30-item subset (10 per stratum) rated blind by the operator (or two people) with the same
  three questions, on a printed sheet — the LLM pipeline's agreement with it (Cohen's kappa per question) is reported
  every round; a question whose kappa < 0.4 is reported as "not measurable by the agent pipeline" instead of a score;
- isolation: every rater writes to its own run-bound file (cycle 9 P0b judge-run token); no shared temp files.

## 5. Reporting
Per stratum and question: the share, a paired bootstrap 95 % interval over items (A vs B on the same items), the
rater spread. A change "ships" only on a pre-registered rule over the stratum it targets, with no loss on the others.
Cost: per round ~30 items × 2 arms × (3 describers + 2 judges) ≈ 300 agent calls, ~1 h; renders ~15 min (one bundle).

## 6. Cinematic directing — what the engine does today and what the benchmark must check (item 5)
The capability audit (cycle 10) says: one zoom/pan per scene from→to, plus punches; the camera never follows an object
or a deed, never cuts inside a scene; a held object is redrawn per beat; the place table exists only during a place.
For each scene the director must first answer **"what must a muted viewer understand from this scene?"**
(scene-router.js `mustSee`: deed → who did what to which object and where it is now; causal → what produces what in
one frame; abstract → the claim, said in text if it cannot be shown). The benchmark adds per item:
- **shot purpose**: is the information (the object, the hand, the effect) inside the frame and large enough?
  (Lemo-Opuscar DIRECTOR.md §8: "at key moments the subject fills at least a third of the frame height")
- **reveal / anticipation → action → reaction → consequence**: does the 3-frame strip show the before, the deed and
  the after (sequence strips at 25/55/85 % or at the deed cue ±)?
- **camera follows information**: does the framing at the deed frame contain the deed? (cycle 10 P01: the world
  state was correct but the bust shot cut the table at the bottom edge — a correct world, an unreadable frame).
