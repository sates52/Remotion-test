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

- Follow `STORYBOARD_RUNBOOK.md`. Antigravity: run `.agents/workflows/preview-hazirla.md` (the whole preview) and `.agents/workflows/relationship-staging.md` (while authoring).
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
- **Authoring method (all Antidote books, all harnesses):** `rules.md` from `storyboard.js prep` is the single
  source — "The question for every beat" (`explainedBy`), "Sequences" (one kept stage over a multi-beat idea,
  `"continue": true` only where keeping the stage keeps the meaning; a kept object must READ as the thing — never
  an abstract stand-in icon), explicit `cast: []`, author-chosen icon state changes (`conceptMotion`: `chains: break`,
  `phone: light` — start state before the cue word, end state after it, kept by a continued beat; authored
  `beforeAfter` is refused), actions that HAPPEN (`take` + `holds`, `embrace` with two cast, optional `actionCue` — a deed
  in the narration is staged as the deed, not a face + caption; the doer is cast[0]; held objects are lifted clear of captions). Every person a staged event needs is a cast key even if named
  once; no padding. PROMPTS.md tells each author to read rules.md. Do not author from memory of
  an older rules.md: re-run `prep` every round and after the story bible / own icons are final (merge refuses a
  stale vocabulary and `STALE PREP` when story-bible.json or motifs.json changed after prep).
- **Sealed holdout:** right after the first make-book run `mute-test.js prep --label=final --seal` (seals the beat
  ids + sha256, renders nothing; `STORYBOARD_RUNBOOK.md` §4); all framecheck runs use `--exclude-from=final`; the
  verdict is the same prep without `--seal` (same beats, current config). An open seal is never drawn by another
  mute label (not even to top up a short stratum; prep stops instead) and framecheck excludes it even without the flag. Never claim an "untouched holdout" after
  every beat was inspected.

## YouTube titles — every new book, every harness (2026-10-22)

- 5 titles = search entity (book title in every title, author ≥ 2, Summary / Explained / Review ≥ 3 and in
  `titles[0]`) **+ ≥ 2 counter-narrative angles specific to THIS book** (the ending / character / symbol /
  popular advice readers get wrong — named concretely, from the narration). Write `youtube-meta.titleAngles`
  (`[{myth, book, quote}]`, quote verbatim from the narration) first, titles from it.
- Never a template ("The Ending Everyone Gets Wrong", "Why Smart People Get It So Wrong" — already on 10 / 7
  books). `node scripts/lint-titles.js --slug=<slug>` must PASS before upload. Details: `CLAUDE.md`, SKILL.md §9.6b.

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
