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
   Resume from the first unfinished step if work already exists.
2. **Story bible** (runbook §1, §1b, §1c): author it yourself from the `--emit` draft; own icons in
   `motifs.json`, blind-named; every cast member dressed with a distinct `variant`.
3. **Storyboard** (runbook §2): `node scripts/storyboard.js prep --slug=<slug>`. Run every prompt in
   `books/<slug>/storyboard/PROMPTS.md` as a SEPARATE, fresh agent (Agent Manager), in parallel if you
   can. Each author reads only what its prompt names. Relationship staging: see
   `.agents/workflows/relationship-staging.md`; run `node scripts/gate-b-relationship.js --slug=<slug>`
   before merge if any beat sets `stageRelationship`. Then `merge`, fix every ✗ in `authored-K.json`,
   `merge --write`.
4. **Readcheck** (runbook §2b, Antidote): blind readers and judges are fresh agents that open ONLY the
   file their prompt names (never the narration, art.json or the key). Reject a judge file that repeats
   one default reason. Re-checks: `prep --beats=<ids>` writes `readcheck/recheck-N/`, then
   `judge --slug=<slug> --recheck=N`; `tally` must report every beat (n = total).
5. **make-book** (runbook §3) with `--skip-pack` (add `--preview-only` if the firewall has 0 BLOCK but
   REVIEW findings). Every blocking gate must PASS. Gate 11 prints `FAIL (non-blocking)`: expected.
6. **Blind mute test** (runbook §4): describer and judge are fresh agents that never authored the
   storyboard or saw the narration. At most 2 fix rounds, each verified on a FRESH holdout.
7. **Ready:** `node scripts/preview-ready.js --slug=<slug>` (firewall: 0 BLOCK suffices; REVIEW is
   reported as quality debt). Then `node scripts/gen-books-registry.js`.
8. **Finish:** clear your WIP row, add an `AGENT_LOG.md` entry (preview-ready output, mute-test totals,
   staged relationship beats with Gate B verdicts, for-review items), and report in Turkish using the
   template at the end of the Claude skill file.

Hard rules: never hand-edit `config.*.json`, never bypass a gate or change a threshold, never edit engine
code to get a book through (engine problems → `for-review` in AGENT_LOG). Commit only this book's files
with explicit paths (other agents share this checkout); push with `git push origin god-mode`. Gate B needs
`GOOGLE_API_KEY` in the environment; never print it. Temporary scripts go outside `scripts/`.
