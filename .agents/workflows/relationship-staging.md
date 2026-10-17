---
description: Antidote book — use relationship staging + automatic Gate B while authoring the storyboard
---

1. Read `AGENTS.md`, `CLAUDE.md` and `STORYBOARD_RUNBOOK.md` (section 2) first. Coordinate in `AGENT_LOG.md`.
2. Run `node scripts/storyboard.js prep --slug=<slug>`. Read `books/<slug>/storyboard/rules.md`, section
   "Relationship staging", before authoring.
3. While authoring each chunk, stage a beat ONLY when its claim is "one side controls another through a
   message" and the narration also states a lie, a rejected method, a negated reading or a counter-action.
   Set `stageRelationship: true`, cast [], callout null, concept null, and write the quote-backed
   `relationship` record exactly as rules.md shows. Never invent a field; leave it out.
4. Add both sides to `books/<slug>/story-bible.json` → `groups` with role, label, body and accent colours
   and an evidence quote. A side can be one person (count 1). Never use a named character for a class.
5. Run `node scripts/gate-b-relationship.js --slug=<slug>` (Gemini; `GOOGLE_API_KEY` must be set; never
   print it). Beats with FALLBACK: remove `stageRelationship` and author them normally.
6. Run `node scripts/storyboard.js merge --slug=<slug>` until 0 problems, then `--write`, then continue the
   runbook (readcheck, make-book with every gate, blind mute test). Gate 11 prints FAIL (non-blocking): expected.
7. In the AGENT_LOG entry for the book, list the staged beats and their Gate B verdicts.
