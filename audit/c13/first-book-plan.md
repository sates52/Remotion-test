# Single-relation capability — controlled use on the first real book (plan, cycle 13)

Status: **plan only.** Nothing here is enabled on any book. A full-book render needs its own operator authorization;
upload / publish / cleanup stay separate permissions. Published (frozen) and pinned books are never touched.

## What gets used
`scripts/lib/single-relation.js` + `scripts/apply-single-relation.js` (Level 1, default OFF). A book opts in only when
`apply-single-relation.js --write` succeeds; the renderer draws the field only behind `meta.singleRelation === true`.

## Which book
The next NEW Antidote book started with `book-start.js` (own worktree, current god-mode code), non-fiction or
idea-driven fiction, that is NOT in `PUBLISHED_BOOKS.md` and not pinned by another owner. Chosen by the book's owner,
recorded in that book's `pipeline-record.json`.

## Which beats (selective, small)
1. After the authored storyboard exists, list beats whose narration states a cause and its effect (the readcheck /
   answer-key style question: "what changes, and what changes it?" has a sentence-level answer).
2. Keep at most **10 % of the book's beats, max 20**, and only where the authored storyboard does NOT already show the
   change on screen (blind "sees" line or mute-test evidence says the change is missing). Never an action beat, a
   chapter card, a cast-dependent emotional beat, or a beat the mute test already reads CORRECT.
3. For each: author one `single-relation/1` contract (type B / A, or H when the claim is planned / hypothetical /
   negated / a question — the validator enforces it). Contracts live in `books/<slug>/single-relation/<sceneIndex>.json`.

## Gates (unchanged — the capability does not lower any)
- `node scripts/apply-single-relation.js --config=books/<slug>/config.antidote.json --contracts=books/<slug>/single-relation` (dry run), then `--write`.
- Then the normal preview path: `preview-hazirla` (authorship, readcheck, blind mute test on a FRESH holdout of beats,
  preview-ready). Production mute gates and thresholds stay exactly as they are; a changed beat that fails is reverted
  (delete its contract, re-apply).
- Stills / clips for the operator: `stills-cloud.js` on GitHub Actions (no local render).

## What is measured on that book (and what is not claimed)
- Per changed beat: blind sees-line + mute verdict before / after (agent raters) — reported as a book-level
  observation, NOT as Level-2 evidence (one book, chosen beats).
- The 10-passage human video package (`audit/c13/human-video/`) is the human direction check; it is NOT run until
  the operator finds 2–3 viewers.
- Level 2 (selective ship) needs the pre-registered holdout (`audit/c13/holdout-design.md`); one book does not replace it.

## Status fields (report every cycle)
| field | now |
|---|---|
| Capability implemented? | yes (dev/c13) |
| Capability merged? | see AGENT_LOG cycle-13 entry |
| Selectively enabled? | no |
| Used in an actual book? | no |
| Production render authorized? | no |
| Visual benefit measured? | agent pilot on dev data only; no holdout, no human result |
