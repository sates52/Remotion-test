---
name: notebooklm-prompt
description: >
  Step 0 of a new book: decide the engine (Vox / Antidote) from the book profile and write the NotebookLM prompt for
  that engine (make-prompt.js refuses without a profile).
---

**FIRST, for any book work (Step 0, preview, render), from any checkout:** `git fetch origin god-mode`, then
`git show origin/god-mode:scripts/book-start.js | node - --slug=<slug>` (add `--check` to look first) - it creates or resumes
the book's own `../wt-book-<slug>` on CURRENT code; work only there and read THAT worktree's files (full text: CLAUDE.md).

This is the Antigravity entry for the shared procedure. The text is `.claude/skills/notebooklm-prompt/SKILL.md`
(the same file every harness reads) — read it fully. Operating rules for every agent: `docs/AGENT-OPERATING-CONTRACT.md`.
