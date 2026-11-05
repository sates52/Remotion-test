# Scoring the muted video study (scorer only — never sent to raters)

Inputs: the raters' answers-*.json, `answer-key.json` (frozen cycle-12 key per passage), `order.json` (X / Y → arm).
Score BLIND: score every answer against the key without opening order.json; unblind only to tally.

Per video (each rater, each passage, X and Y):
- **message** — MATCH (states the key's understanding) / PARTIAL (its subject or half of it) / MISS.
- **cause**, **effect** (only when the key's supportsCausality is not false) — CORRECT / WRONG / NOT_SHOWN, from answers 1–3.
- **whatChanged** — CORRECT / WRONG / NOT_SHOWN / NA (who or what changed matches the key's effect).
- **finalConsequence** — YES / NO / NA (the rater states the key's final consequence).
- **wrongInference** — YES if the rater states something the key lists as wrong, a not-asserted part as true, or a cause the narration does not state.
- Primary = mean(cause, effect, message) with MATCH 1 / PARTIAL 0.5; message only when the key states no causality (same as the agent tally).
Per passage: the forced choice (X / Y / same) and confidence, unblinded to A / B after scoring.

Two scorers score independently; report kappa; settle disagreements by discussion and log them.
If an AGENT scores the human answers, label every number "human descriptions / agent scoring" — never "human result".
Report human results separately from the agent dense-frame results; with 2–3 raters this is a direction check, not a SHIP measure.
