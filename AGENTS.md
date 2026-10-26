# AGENTS.md — start here (any agent, any harness)

This repo builds YouTube book-summary videos (Vox + Antidote engines; pipeline, gates,
multi-worker GitHub-Actions renders). If you maintain an agent that does not read
`CLAUDE.md` automatically, read this file first. It is a ROUTER: every procedure lives in ONE canonical file named
below; this file and the per-harness entries only say where it is and how your harness runs it.

**Every agent, every harness (Claude, Cursor, Antigravity, …): `docs/AGENT-OPERATING-CONTRACT.md`** — the shared
operating rules (start reading, your WIP row with role / worktree / base SHA, production vs development, git and
`AGENT_LOG.md`, frozen books, the sealed mute test, the three facts, no automatic cleanup).

## Read in this order

1. **`CLAUDE.md`** — STRICT invariants: US market / everything in English publishing kit,
   published books are frozen, coordinate via `AGENT_LOG.md`, never commit credentials,
   render assets stay out of git, **never run cleanup without explicit operator command**,
   the render pool map, **git topology**, YouTube titles.
2. **`docs/AGENT-OPERATING-CONTRACT.md`** — how agents share the repo.
3. **`AGENT_LOG.md`** — the shared cross-agent memory. Check the **Active WIP** table before
   any systemic task; append a **Changelog** entry after it.
4. **`SKILL.md`** — the full system reference (engines, pipeline, render constraints, YPP)
   before generating a video or refactoring.
5. **`docs/`** — `ROOT-CAUSE.md` + `PROVENANCE-PRINCIPLE.md` (why visuals must stay grounded
   in the narrative), `NARRATIVE_VISUAL_FIREWALL.md`, `THUMBNAIL_SYSTEM.md`.

## The canonical procedures — one file each, every harness

| When | Canonical procedure (the only full text) | Claude Code | Antigravity | Cursor / any other agent |
|---|---|---|---|---|
| Step 0 of a new book: engine + NotebookLM prompt | `.claude/skills/notebooklm-prompt/SKILL.md` | skill `notebooklm-prompt` | `.agents/skills/notebooklm-prompt/SKILL.md` (pointer) | read the canonical file |
| "preview hazırla", "dosyalar hazır", "önizlemeyi hazırla", "prepare the preview" | `.claude/skills/preview-hazirla/SKILL.md` (procedure: `STORYBOARD_RUNBOOK.md`) | skill `preview-hazirla` | `.agents/workflows/preview-hazirla.md` (pointer) | read the canonical file |
| writing / revising an Antidote storyboard chunk | `.claude/skills/antidote-visual-authoring/SKILL.md` + the book's generated `storyboard/rules.md` (wins) | skill | `.agents/skills/antidote-visual-authoring/SKILL.md` (pointer) | read the canonical file |
| a preview or render is finished: the report | `.claude/skills/antidote-quality-handoff/SKILL.md` | skill | `.agents/skills/antidote-quality-handoff/SKILL.md` (pointer) | read the canonical file |

`.cursor/rules/antidote-agents.mdc` makes Cursor load this file. A per-harness entry never restates a procedure; if it
seems to differ from the canonical file, the canonical file wins (`scripts/test-agent-entrypoints.js` checks this).

## Decided by code, the same for every harness

Do not re-derive these from prose — run the command and follow what it prints.

- **Where a book is, what is next, when to stop:** `node scripts/preview-state.js status --slug=<slug>` (CONTINUE /
  READY_CHECK / READY / OPERATOR). Slug: from the operator / conversation, else `preview-state.js candidates`.
- **Book start:** a new book starts only on the current `origin/god-mode` engine code, in its own worktree
  (`node scripts/preview-state.js worktree --slug=<slug>`), pinned in `books/<slug>/production-base.json`. Its first
  production step (`storyboard prep`, `make-book`, …) refuses otherwise — `scripts/lib/production-guard.js`, exit 2.
  Operator-only, recorded exceptions: `PRODUCTION_ALLOW_BEHIND="<reason>"`, `PRODUCTION_ALLOW_MAIN="<reason>"`. A book
  already under way keeps its pinned SHA when origin moves.
- **READY / HAZIR:** only when `preview-state.js status` prints `READY` — `preview-ready.js` recorded a PASS for the
  current config after the last mute tally. Studio opening is not READY.
- **One long job at a time:** a second `mute-test.js prep` of the same label, or a second `render.js` of the same book,
  refuses while the first runs (exit 3); a split render still in flight is not dispatched again (rescue:
  `render-github-redispatch.js`). Never cancel and restart a running prep or render.
- **Code that is not a commit:** production-guard stops (`PRODUCTION_ALLOW_DIRTY="<reason>"`, operator, recorded).
- **Published books:** `scripts/lib/frozen.js` (the Summary Table in `PUBLISHED_BOOKS.md`) — never re-planned.

## Producing a NEW Antidote book

- `STORYBOARD_RUNBOOK.md` end to end (via `preview-hazirla`). Authoring method: the book's generated
  `storyboard/rules.md` from `storyboard.js prep` (re-run prep every round; merge refuses a stale vocabulary).
- Relationship staging and Gate B: runbook (`gate-b-relationship.js`, reads `GOOGLE_API_KEY` — never print it).
- Hard-gate Gate 11 (VIG) is temporarily non-blocking by operator decision (`data/quality-policy.json`); it prints
  `FAIL (non-blocking)`. Every other gate still blocks. Do not edit scores to pass a gate.
- Sealed holdout and the blind mute test: runbook §4, contract §6. Render decisions: runbook §5b, contract §7.
- YouTube titles: `CLAUDE.md` (`lint-titles.js` must PASS before upload).

## Git topology (operator-confirmed 2026-09-22) — non-negotiable

- **One source of truth for code:** `origin` = `sates52/Remotion-test`, branch **`god-mode`**
  (the operator's main account, `sates52@gmail.com`). Push only with an explicit
  `git push origin god-mode`. **Never bare `git push`** — `god-mode`'s upstream points at
  `render-worker-1`, which is not a code remote.
- **`render-worker-1…N` (currently 10, will grow) are render-only accounts**, each with its
  own `Remotion-render` fork. Do not merge from them, do not push shared code to them, do not
  try to "fix" their divergence — their stale `god-mode` branches are expected (renders ship
  isolated per-book bundles to per-render refs, see `render-bundle.js`).
- **Never commit credentials.** `render-accounts.json` (live GitHub PATs for the pool),
  `AWS_SESSION_REGISTRY.md`, `test_aws_creds.js`, `nvidia_preview.html` are gitignored on
  purpose. GitHub push protection is enabled: if a push is blocked for a secret, remove the
  secret from the commit — never allowlist it. Do not print tokens into logs or replies.
- Backups of replaced branches keep the form `<branch>-backup-<date>` on the owning remote.
- **Never run `git stash` / `git stash -u` in the shared main checkout.** On 2026-10-16 one stash moved
  6,146 mute files, 557 framecheck files and 48 books' uncommitted files into a single stash entry
  (recovered from `C:\Users\savas\Cursor\Remotion\archive\stash-2026-10-16-1906` and branch
  `backup/stash-2026-10-16-1906`). Set work aside with a WIP commit on your own branch/worktree instead.
- **Never `git reset <ref>` (mixed) in the shared main checkout either**: on 2026-10-17 it moved HEAD to the new
  commit but left 20 old engine files on disk and 18 new files missing, so agents ran the old engine unseen.
- **production-guard** (`scripts/lib/production-guard.js`) runs first in `storyboard.js prep/merge`, `make-book.js`,
  `render.js`, `mute-test.js prep` and `preview-ready.js`. If a code file on disk differs from HEAD it STOPS and lists
  the files (and the older commit an old copy matches). It never resets or restores anything. Restore old copies
  from HEAD after checking AGENT_LOG, or commit your change; deliberate local code needs
  `PRODUCTION_ALLOW_DIRTY="<reason>"` (recorded). Every step's commit is logged in `books/<slug>/pipeline-record.json`.
- **Render decisions (2026-10-20, `STORYBOARD_RUNBOOK.md` §5b).** `render.js` runs ONE pre-dispatch check
  (`scripts/lib/render-preflight.js`) before any pixels. Keep three facts apart: technical (file, frames, decode:
  `verify-render-output.js`), quality (firewall PASS/FAIL, which stays FAIL), and the operator's decision. A render
  completing is never a quality PASS. `--preview-only` is a FULL-LENGTH review render, not a short clip. Only the
  operator may add `--accept-quality-debt="<why>"`, which binds to the config hash; a changed config needs a new
  decision. Never accept a BLOCK, never loosen a threshold, never switch mode after dispatch. A render request must
  not trigger storyboard edits or mute tests.
- History of the 2026-09-22 sync and everything above: `AGENT_LOG.md`.
