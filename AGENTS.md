# AGENTS.md — start here (any agent, any harness)

This repo builds YouTube book-summary videos (Vox + Antidote engines; pipeline, gates,
multi-worker GitHub-Actions renders). If you maintain an agent that does not read
`CLAUDE.md` automatically, read this file first.

## Read in this order

1. **`CLAUDE.md`** — STRICT invariants: US market / everything in English publishing kit,
   published books are frozen, coordinate via `AGENT_LOG.md`, never commit credentials,
   render assets stay out of git, the render pool map, **git topology**.
2. **`AGENT_LOG.md`** — the shared cross-agent memory. Check the **Active WIP** table before
   any systemic task; append a **Changelog** entry after it.
3. **`SKILL.md`** — the full system reference (engines, pipeline, render constraints, YPP)
   before generating a video or refactoring.
4. **`docs/`** — `ROOT-CAUSE.md` + `PROVENANCE-PRINCIPLE.md` (why visuals must stay grounded
   in the narrative), `NARRATIVE_VISUAL_FIREWALL.md`, `THUMBNAIL_SYSTEM.md`.

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
- History of the 2026-09-22 sync and everything above: `AGENT_LOG.md`.
