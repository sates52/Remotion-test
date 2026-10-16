# AGENTS.md — start here (any agent, any harness)

This repo builds YouTube book-summary videos (Vox + Antidote engines; pipeline, gates,
multi-worker GitHub-Actions renders). If you maintain an agent that does not read
`CLAUDE.md` automatically, read this file first.

## Read in this order

1. **`CLAUDE.md`** — STRICT invariants: US market / everything in English publishing kit,
   published books are frozen, coordinate via `AGENT_LOG.md`, never commit credentials,
   render assets stay out of git, **never run cleanup without explicit operator command**,
   the render pool map, **git topology**.
2. **`AGENT_LOG.md`** — the shared cross-agent memory. Check the **Active WIP** table before
   any systemic task; append a **Changelog** entry after it.
3. **`SKILL.md`** — the full system reference (engines, pipeline, render constraints, YPP)
   before generating a video or refactoring.
4. **`docs/`** — `ROOT-CAUSE.md` + `PROVENANCE-PRINCIPLE.md` (why visuals must stay grounded
   in the narrative), `NARRATIVE_VISUAL_FIREWALL.md`, `THUMBNAIL_SYSTEM.md`.

## Producing a NEW Antidote book (2026-10-16)

- Follow `STORYBOARD_RUNBOOK.md` (Antigravity: `.agents/workflows/relationship-staging.md`).
- **Relationship staging is ON for new books.** When a beat's claim is a relationship (one side
  controls another through a message: a story, a promise, demands, threats; a rejected method; a
  negated reading; taking control back), the storyboard author may stage it instead of a face +
  callout. Format: `rules.md` → "Relationship staging". Every field quote-backed; groups in
  `story-bible.json` `groups` with evidence.
- **Gate B is automatic:** `node scripts/gate-b-relationship.js --slug=<slug>` (Gemini, reads
  `GOOGLE_API_KEY` from the environment; never print it). `storyboard.js merge` refuses a staged beat
  without a current STAGE verdict. On FALLBACK, author the beat normally. Do not hand-edit verdicts.
- Hard-gate Gate 11 (VIG) is temporarily non-blocking by operator decision (`data/quality-policy.json`);
  it prints `FAIL (non-blocking)`. Every other gate still blocks. Do not edit scores to pass a gate.
- Published books stay frozen. Do not re-plan them to use this.

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
