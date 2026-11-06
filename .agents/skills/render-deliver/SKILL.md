---
name: render-deliver
description: >
  Final render → CLOUD assembly → verified film → delivery files, after the operator approved the production render.
  Use for "render et", "final render", "birleştir", "assemble", "videoyu indir", an interrupted render or one
  another session started. Never download segments or join them with ffmpeg locally.
---

This is the Antigravity entry for the shared procedure. The text is `.claude/skills/render-deliver/SKILL.md`
(the same file every harness reads) — read it fully. Operating rules for every agent: `docs/AGENT-OPERATING-CONTRACT.md`.
After the operator's production GO (recorded for this render input), run ONE command and do not ask again: `node scripts/render-deliver.js --slug=<slug> [--book-root=<book worktree>]` (dispatch → segment recovery → cloud assembly → verified download → final media check; thumbnails A/B/C come with the film — a film already delivered or a changed hook: `node scripts/render-thumbnails.js --slug=<slug> --cloud [--book-root=…]`, thumbnail-only). Read-only state: `node scripts/render-status.js --slug=<slug>` or `render-deliver.js --check`.
Production render contract (enforced in code): `docs/AGENT-OPERATING-CONTRACT.md` §7b — `--method=github` is required, never
run the book worktree's own `scripts/render.js`, never fall back to a local render, never copy `render-accounts.json`.
