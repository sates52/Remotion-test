---
description: preview hazırla — take a book from audio + VTT on disk to a verified PREVIEW (Antidote or Vox)
---

This is the Antigravity version of the Claude skill `.claude/skills/preview-hazirla/SKILL.md`.
The steps and hard rules are in that file and in `STORYBOARD_RUNBOOK.md`; read both fully first,
together with `AGENTS.md`, `CLAUDE.md` and the Active WIP table in `AGENT_LOG.md`. Talk to the operator
in Turkish; everything in the video, storyboard and YouTube pack is English.

1. **The book.** Use the slug the operator gave. Check `public/audio/<slug>.m4a` and
   `public/captions/<slug>.vtt` exist; if not, give the exact path and stop. Confirm the engine from
   `books/<slug>/book.json` (decided at Step 0) in one line. Add your Active WIP row to `AGENT_LOG.md`.
   Resume from the first unfinished step if work already exists. Check the checkout CONTAINS the required
   commit: `git merge-base --is-ancestor <commit> HEAD` (exit 0); the last log line alone is not enough.
2. **Story bible** (runbook §1, §1b, §1c): author it yourself from the `--emit` draft; own icons in
   `motifs.json`, blind-named; every cast member dressed with a distinct `variant`. Every person a staged
   event needs is a cast key even if the narration names them once; do not add people the storyboard will not
   show. When reviewing sequences: a kept object must READ as the thing itself (rules.md "Sequences" rule 5) —
   never keep an abstract stand-in icon across beats.
3. **Storyboard** (runbook §2): `node scripts/storyboard.js prep --slug=<slug>`, run (again) AFTER the bible,
   own icons and variants are final (merge refuses `STALE PREP` otherwise). Run every prompt in
   `books/<slug>/storyboard/PROMPTS.md` as a SEPARATE, fresh agent (Agent Manager), in parallel if you
   can. Each author reads only what its prompt names and answers rules.md "The question for every beat"
   (`explainedBy`: the event, comparison or relationship that shows the sentence; stage that, not a face +
   callout); passages that develop one idea are authored as a SEQUENCE (rules.md "Sequences": one kept stage,
   start -> change -> result, `continue` on kept beats). An object that CHANGES in the narration (chains break, a
   screen lights up) is staged as the icon's state change (rules.md "Icon behaviour"), not only in the label. Reject mood-only beats and sequences that rebuild the
   stage each beat. Relationship staging: see
   `.agents/workflows/relationship-staging.md`; run `node scripts/gate-b-relationship.js --slug=<slug>`
   before merge if any beat sets `stageRelationship`. Then `merge`, fix every ✗ in `authored-K.json`,
   `merge --write`.
4. **Readcheck** (runbook §2b, Antidote): blind readers and judges are fresh agents that open ONLY the
   file their prompt names (never the narration, art.json or the key). Reject a judge file that repeats
   one default reason. Re-checks: `prep --beats=<ids>` writes `readcheck/recheck-N/`, then
   `judge --slug=<slug> --recheck=N`; `tally` must report every beat (n = total).
5. **make-book** (runbook §3) with `--skip-pack` (add `--preview-only` if the firewall has 0 BLOCK but
   REVIEW findings). Every blocking gate must PASS. Gate 11 prints `FAIL (non-blocking)`: expected.
   Right after the first make-book seal the verdict sample: `node scripts/mute-test.js prep --slug=<slug>
   --label=final --seal` (renders nothing); every framecheck uses `--exclude-from=final`.
6. **Blind mute test** (runbook §4): the verdict is `mute-test.js prep --label=final` (no `--seal`; it re-renders
   the sealed beats from the current config). Describer and judge are fresh agents that never authored the
   storyboard or saw the narration. At most 2 fix rounds, each verified on a FRESH holdout. Fix-round
   protocol (runbook §4): after every mute/framecheck tally run `node scripts/cause-ledger.js
   --slug=<slug>`; ENGINE/VOCABULARY → AGENT_LOG `for-review` (never fixed in the storyboard), RATER →
   noted only. Fix an AUTHORING class only when confirmed (≥2 failures, 2 agreeing blind passes, or you
   saw the still), on its `similar-candidates.js` REVIEW beats (look at each); report beats changed
   (soft cap ~25/round, else write why). Never draw a new holdout on an unchanged film.
7. **Ready:** `node scripts/preview-ready.js --slug=<slug>` (firewall: 0 BLOCK suffices; REVIEW is
   reported as quality debt). Then `node scripts/gen-books-registry.js`.
8. **Finish:** clear your WIP row, add an `AGENT_LOG.md` entry (preview-ready output, mute-test totals,
   staged relationship beats with Gate B verdicts, for-review items), and report in Turkish using the
   template at the end of the Claude skill file.

Code must be a commit: every production step starts with production-guard. If it stops ("code file(s) on disk
differ from HEAD"), report the listed files to the operator and wait; never bypass it, never `git stash` or
`git reset` the shared checkout. `preview-ready` reports which commit each step used (`pipeline-record.json`).

Hard rules: never hand-edit `config.*.json`, never bypass a gate or change a threshold, never edit engine
code to get a book through (engine problems → `for-review` in AGENT_LOG). Commit only this book's files
with explicit paths (other agents share this checkout); push with `git push origin god-mode`. Gate B needs
`GOOGLE_API_KEY` in the environment; never print it. Temporary scripts go outside `scripts/`.
