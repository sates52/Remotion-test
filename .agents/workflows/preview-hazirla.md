---
description: preview hazırla — take a book from audio + VTT on disk to a verified PREVIEW (Antidote or Vox), autonomously
---

The procedure is the canonical skill **`.claude/skills/preview-hazirla/SKILL.md`** — read it fully and follow it
exactly; this file only adds what is specific to Antigravity. Read `AGENTS.md` and
`docs/AGENT-OPERATING-CONTRACT.md` first. Talk to the operator in Turkish; everything in the video, storyboard and
YouTube pack is English.

Antigravity specifics:

1. **The loop is the same:** `node scripts/preview-state.js status --slug=<slug>` → do the NEXT action → repeat;
   `READY_CHECK` → `node scripts/preview-ready.js --slug=<slug>` — report HAZIR only when it printed `✅ READY` and
   exited 0 (paste that line); anything else is HAZIR DEĞİL. A mute-test prep runs ONCE in the background — never
   poll-cancel-restart it. `OPERATOR` → stop and report (skill §3, §5). Slug
   from the operator, the conversation, or `node scripts/preview-state.js candidates` (`unique: <slug>`).
2. **Fresh agents** (storyboard authors, own-icon namer, readcheck readers and judges, mute-test describer and
   judge): one new agent per prompt from the Agent Manager, in parallel where the skill says so. A blind agent opens
   ONLY the file its prompt names — never the narration, `art.json` or a key file — and never authored the storyboard.
   Reject a judge file that repeats one default reason.
3. **Relationship staging** while authoring: `.agents/workflows/relationship-staging.md`. Gate B needs
   `GOOGLE_API_KEY` in the environment; never print it.
4. **Report** with the template in the skill's §5.
