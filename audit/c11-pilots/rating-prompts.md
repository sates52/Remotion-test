# Cycle 11 Director A/B — rater prompts (fixed before any rating; committed before the first describer runs)

## Clarification of the pre-registration (written before any rating, after the answer key was frozen)
The frozen answer key marks 17 of 40 beats `supportsCausality: false` (the narration states no cause → effect). On those
beats the cause and effect questions are **N/A** for both arms: the per-strip primary score is the message score alone
(MATCH 1 / PARTIAL 0.5 / MISS 0); a viewer who reads a cause → effect into them gets the WRONG-inference flag when it
contradicts the key. On the other 23 beats the score is mean(cause, effect, message) as pre-registered. Same rule for A
and B; nothing else changes.

## Describer (a FRESH sonnet agent per strip; image only; never the narration; never both arms of a beat)
You are a viewer of an animated explainer video about a book, watching with the SOUND OFF. Open ONLY this image: {IMG}
It shows three moments of the same short scene, left to right (frame 1, frame 2, frame 3). Do not open any other file.
Write ONLY this JSON to {OUT}:
{"img":"{NAME}","sees":["frame 1: …","frame 2: …","frame 3: …"],
 "changed":"what changed between frame 1 and frame 3 (or 'nothing')",
 "cause":"what caused that change, as you understand it (or 'unclear')",
 "effect":"what the result / consequence is (or 'unclear')",
 "message":"in one sentence, what you think the narrator is saying here",
 "wouldConfuse":"anything that could mislead a viewer, or 'none'"}
Describe only what is visible; if something is unclear, say so. Reply with one line: "written".

## Judge (FRESH sonnet agents; each judges 4 descriptions of 4 DIFFERENT beats; never an image; two independent passes)
You judge whether muted viewers understood short scenes of animated book-summary videos. Read ONLY this file: {IN}.
It holds 4 items; each has the narration spoken over the scene, the frozen answer key (what a muted viewer should
understand, its cause, its effect, key facts, plausible wrong inferences, and whether the narration states any
causality at all), and what a viewer with the sound off wrote (`description`). Judge each item on its own.
1. cause — CORRECT (the viewer's cause matches the key's cause in meaning), WRONG (contradicts it), NOT_SHOWN (unclear /
   missing / something else). effect — the same against the key's effect. If the key says `supportsCausality: false`,
   answer "NA" for both.
2. message — MATCH (the viewer's message states the key's understanding), PARTIAL (its subject or half of it), MISS.
3. wrongInference — YES if the viewer states something the key lists as a wrong inference, or a cause / claim that
   contradicts the narration; otherwise NO.
4. For each of the three frames (use the matching "sees" line + the message), the standard mute rubric:
{JUDGE_RULES}
Judge meaning, not wording; be strict and literal; do not reward a version for being prettier or busier.
Write ONLY this JSON to {OUT}: [{"img":"…","cause":"…","effect":"…","message":"…","wrongInference":"YES|NO","why":"…",
 "frames":[{"correctness":"…","contribution":"…","explains":"YES|NO","why":"…"}, x3]}, x4]
Reply with one line: "written".
