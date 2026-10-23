# Agent operating contract (every harness: Claude, Cursor, Antigravity, Codex, …)

This is the one set of operating rules every agent in this repo follows, whatever tool runs it. It does not
replace anything: the strict invariants stay in `CLAUDE.md`, the book procedure in `STORYBOARD_RUNBOOK.md`, the
system reference in `SKILL.md`, the development roadmap in `docs/ANTIDOTE-REFERENCE-PLAN-2026-10-17.md`. This file
says how agents share the repo and points to those sources; where it repeats a rule, the source wins.

## 1. Read first (every agent, every session)

1. `AGENTS.md` — the entry point.
2. This file.
3. `CLAUDE.md` — the strict invariants. They bind every agent, not only Claude.
4. `AGENT_LOG.md` — the **Active WIP** table (who owns what right now) and the newest changelog entries.
5. For your task:
   - producing a book → `STORYBOARD_RUNBOOK.md` (and `SKILL.md` for the system);
   - developing the pipeline or engines → `docs/ANTIDOTE-REFERENCE-PLAN-2026-10-17.md` (the single roadmap — no
     parallel plan) and `SKILL.md`.

How each harness reaches the same files (no harness's own commands are required of the others):

| Harness | Loads automatically | Procedures |
|---|---|---|
| Claude Code | `CLAUDE.md` | skills in `.claude/skills/<name>/SKILL.md` |
| Antigravity | `.agents/` | workflows in `.agents/workflows/*.md`, skills in `.agents/skills/<name>/SKILL.md` |
| Cursor and others | `AGENTS.md` (if configured) | read the files named here directly |

Shared procedures (canonical text in `.claude/skills/`; the two `antidote-*` entries in `.agents/skills/` point to it, and
`.agents/workflows/preview-hazirla.md` is the condensed Antigravity version of the preview-hazirla skill):

| Procedure | Use it when | File |
|---|---|---|
| `notebooklm-prompt` | Step 0 of a new book: engine decision + NotebookLM prompt | `.claude/skills/notebooklm-prompt/SKILL.md` |
| `preview-hazirla` | "preview hazırla": audio + VTT on disk → verified preview, autonomously (state: `scripts/preview-state.js`) | `.claude/skills/preview-hazirla/SKILL.md` (Antigravity: `.agents/workflows/preview-hazirla.md`, a pointer to it) |
| `antidote-visual-authoring` | writing or revising an Antidote storyboard chunk | `.claude/skills/antidote-visual-authoring/SKILL.md` |
| `antidote-quality-handoff` | a preview is finished: the standard report + production decision | `.claude/skills/antidote-quality-handoff/SKILL.md` |

## 2. Declare yourself before you work

Add your row to the **Active WIP** table in `AGENT_LOG.md` (columns `agent | area / files | status | notes`) before any
work that changes files:

- **agent** — a short, stable handle (`preview-<slug>`, `render-<slug>`, `engine/<topic>`, …);
- **area / files** — the slug for production; the exact files for development;
- **notes** — `role: production|development · worktree: <main checkout or ../wt-<name>> · base: <god-mode sha>`.

Update the row as you go; mark it `_(done)_` when you finish (runbook §8 "clear your row" means the same). Edit only your own rows. If a row looks stale, add
a note with evidence to your own row — the owner closes theirs.

## 3. Production and development never touch each other's work

**Production agents** (one book, one slug):
- A new book gets its own linked worktree `../wt-book-<slug>`, detached at `origin/god-mode`, with its inputs copied in
  and its engine commit pinned in `books/<slug>/production-base.json` (`node scripts/preview-state.js worktree
  --slug=<slug>`); the shared main checkout is not used for production. `preview-state.js status` checks the pin and
  that no uncommitted code is under the book. Never remove a production worktree yourself: its `node_modules` is a
  junction into the main checkout and `git worktree remove --force` deletes THROUGH it (measured 2026-10-23), so
  `worktree` locks it (git then refuses). The operator's cleanup is `preview-state.js unlink --slug=<slug>` (removes
  only the junction, unlocks) and then the removal.
- Pin the code: record the base SHA in your WIP row and keep it for the whole book. Do not pull new engine code
  mid-book unless the operator asks; if you do, say so in `AGENT_LOG.md` and re-run the affected steps.
- Never run a production step on code that is not a commit, unless the operator approved a reason and you pass it
  as `PRODUCTION_ALLOW_DIRTY="<reason>"` (recorded). `scripts/lib/production-guard.js` stops this in the main
  checkout; in a linked worktree it only warns, so check yourself:
  `git status --porcelain --untracked-files=all -- scripts src data/quality-policy.json data/icon-readings.json` must
  list nothing except `src/books.generated.ts` (regenerated per book; the guard ignores it), and `git rev-parse HEAD`
  must be your base SHA.
- Write only what your book's steps write: `books/<slug>/`, its `public/` assets, its `audit/` runs, `out/` for its
  render, the files the pipeline itself regenerates (`src/books.generated.ts`, `data/engine-outcomes.json`,
  `.render-github-split.<slug>.json`), and `AGENT_LOG.md` / `PUBLISHED_BOOKS.md` rows for your book. A new
  `data/icon-readings.json` row (runbook §2b) is shared and counts as code for production-guard: commit it by
  itself before your next production step.
- Engine problems go to `AGENT_LOG.md` as `for-review` — do not edit engine code from a production session.

**Development agents** (pipeline, engines, docs):
- Work in your own linked worktree on a branch from `origin/god-mode`. Never leave uncommitted code in the shared
  main checkout (it stops every production run there).
- Never edit `books/<slug>/` of a book in production or of a published book. Replays and experiments read inputs
  and write to a scratch folder or a temporary copy inside your worktree that you delete afterwards.
- A change reaches production only as a commit on `origin/god-mode` after its tests pass. Production agents pick it
  up at their next book (or when the operator says so).
- Do not change how a quality bar is measured or set (`data/quality-policy.json` — operator decisions only).

## 4. Shared checkout, `AGENT_LOG.md` and git

- Code lives on `origin` = `sates52/Remotion-test`, branch `god-mode`. Push with the explicit
  `git push origin god-mode` (from a linked worktree: `git push origin <branch>:god-mode`) — never a bare `git push`. No force push of shared history.
- Before every push: `git fetch origin`, confirm a fast-forward (`git merge-base --is-ancestor origin/god-mode HEAD`).
  If origin moved, rebase your own unpublished commits or stop and report — never merge someone else's work blind.
- Stage explicit paths only (never `git add -A` / `git add .`). **Read the whole `git diff --cached` before every
  commit**: other agents edit the same files (`AGENT_LOG.md`, `PUBLISHED_BOOKS.md`) without committing, and their
  lines must not ride in your commit. Commit only your own hunks.
- In the shared main checkout never run `git stash`, `git reset <ref>`, `git clean`, or a checkout that overwrites
  files you do not own (see `AGENTS.md`, git topology). Untracked files and `out/`, `audit/`, `public/` belong to
  their owners.
- Never commit credentials (`render-accounts.json` and friends are gitignored on purpose).
- `AGENT_LOG.md`: a WIP row before systemic work, a short changelog entry after it, newest first.

## 5. Published books do not change

- The register is the **Summary Table** in `PUBLISHED_BOOKS.md`; `scripts/lib/frozen.js` reads only that table. A
  book with a prose record but no table row is NOT protected — add its row when it is published.
- Never re-plan, re-author, re-render or edit the files of a published book. A system change applies to the books
  that come next; it does not have to be backward-compatible with a published book's content (the engine must still
  render old configs without crashing).

## 6. The sealed mute test stays sealed

- Seal right after the first `make-book` run: `node scripts/mute-test.js prep --slug=<s> --label=final --seal`
  (`STORYBOARD_RUNBOOK.md` §4). Every framecheck uses `--exclude-from=final`; nobody draws another label from an open
  seal.
- The verdict is the fresh sealed sample, judged blind. Re-testing frames you already looked at or fixed is not a
  verdict.
- The bars live in `data/quality-policy.json` and are operator decisions: WRONG ≤ 1/30 and dead frames ≤ 5/30 block;
  image ADDS ≥ 60% is the target; EXPLAINS is reported. Nobody changes them or how they are computed.

## 7. Three facts, never merged

| fact | what it means | where it is recorded |
|---|---|---|
| **Technical** | the file exists, its frame count is within 0.5% of the config, it decodes — VERIFIED / FAIL / NOT_RUN | `books/<s>/render-facts.json` (`verify-render-output.js`) |
| **Quality** | the narrative firewall's PASS/FAIL with BLOCK and REVIEW counts (a FAIL stays recorded) | `narrative-visual-firewall*.report.json`, `books/<s>/render-facts.json` |
| **Decision** | the operator's: accepted quality debt for an exact config hash, upload, publication | `books/<s>/render-decision.json`, `PUBLISHED_BOOKS.md` |

The **preview verdict** is reported next to them, never merged into them: the sealed blind mute test (WRONG, dead,
ADDS, EXPLAINS) in `books/<s>/mute-test.json`, checked by `preview-ready.js` (runbook §4–§5b).
A render can be technically VERIFIED and quality FAIL, and a book can pass the firewall and fail the mute test. Report each fact separately and never write "PASS" for the
one you did not measure. Unknown = `NOT_VERIFIED`, not a guess.

## 8. No automatic cleanup

`render-github-cleanup.js`, `purge-render-branches.js` and `render-purge.js` delete the files the operator uploads.
Run them only on the operator's explicit command, after the upload (`CLAUDE.md`, post-upload order). When a render
finishes, report that the files are ready and stop.

## 9. How quality is measured

- What counts is what a viewer sees and understands in a real book: the next new book's fresh sealed mute test,
  blind readings of real frames, before/after frames of the same beat. More tests or a larger feature list are not
  quality; tests only guard against regressions.
- A feature counts when a real book used it and it reached the screen. `scripts/feature-usage.js` counts authored /
  merged / planned; its `rendered` column is always `NOT_VERIFIED` — only looking at the frame shows the feature on
  screen.
- Report what was not measured as not measured (`NOT_VERIFIED`, `doğrulanmadı`). Never present a hypothesis as a
  result.

## 10. Language

The operator is addressed in Turkish. Everything published — titles, descriptions, chapters, captions, thumbnails,
the storyboard and on-screen text — is English (`CLAUDE.md`).
