---
description: render & deliver — final render, CLOUD assembly, verified film, YouTube pack (after the operator's approval)
---

The procedure is the canonical skill **`.claude/skills/render-deliver/SKILL.md`** — read it fully and follow it
exactly. This file only says how Antigravity runs it; it never restates the procedure (where anything here seems to
differ, the canonical file wins). Read `AGENTS.md` and `docs/AGENT-OPERATING-CONTRACT.md` first.

Antigravity specifics:

1. Use the same commands as every other harness. After the operator's GO: `node scripts/render-deliver.js --slug=<slug>
   [--book-root=<book worktree>]` — it runs the whole chain to a verified MP4; do not ask again between its steps.
   Read-only state: `node scripts/render-status.js --slug=<slug>` (or `render-deliver.js --check`).
2. Never download segments, never write an ffmpeg concat, never run `render-github-assemble.js` without the operator's
   explicit reason. A failed cloud assembly is retried with the same cloud command or reported — no local fallback.
