---
description: preview hazırla — take a book from audio + VTT on disk to a verified PREVIEW (Antidote or Vox), autonomously
---

The procedure is the canonical skill **`.claude/skills/preview-hazirla/SKILL.md`** — read it fully and follow it
exactly. This file only says how Antigravity runs it; it never restates the procedure (where anything here seems to
differ, the canonical file wins). Read `AGENTS.md` and `docs/AGENT-OPERATING-CONTRACT.md` first.

Antigravity specifics:

1. Drive everything with the same commands as every other harness: `node scripts/preview-state.js status --slug=<slug>`
   and the command it prints. Report HAZIR only when that status prints `READY`.
2. **Fresh agents** (storyboard authors, own-icon namer, readcheck readers and judges, mute-test describer and judge):
   one NEW agent per prompt from the Agent Manager, in parallel where the skill says so. A blind agent opens ONLY the
   file its prompt names and never authored the storyboard.
3. Relationship staging while authoring: `.agents/workflows/relationship-staging.md`.
