## 🇺🇸 US Market & Language Invariant (STRICT)

- **Target Audience:** This YouTube channel strictly targets the **US market / English-speaking audience**.
- **All Content in English:** Every YouTube Publishing Kit (`youtube.md`, `youtube-meta.json`), video title, description, chapter timestamp, tag list, pinned comment, and thumbnail hook **MUST BE 100% IN ENGLISH**.
- **Never translate YouTube assets to Turkish:** Even when interacting with the operator in Turkish, **always provide and format the YouTube Publishing Kit in English**. Never output Turkish titles, descriptions, or chapter names.

## ⚠️ Multiple agents work on this repo at once — coordinate

- **Read [`AGENT_LOG.md`](AGENT_LOG.md) at the start of any systemic task** (pipeline,
  engines, render infra, workflows, shared config). Check the **Active WIP** table so you
  don't collide with another agent editing the same files.
- **Append an `AGENT_LOG.md` Changelog entry after any systemic change**, and add/clear
  your row in Active WIP. Per-book content edits under `books/<slug>/` don't need an entry.
- `god-mode` is the **shared working branch** — several agents commit there. Prefer small,
  scoped commits (explicit paths, not `git add -A`). Never force-push a shared history
  rewrite without checking `AGENT_LOG.md` and coordinating (other agents have unpushed work).

## 🔐 Never commit credentials

- `render-accounts.json` holds live GitHub PATs for the render-worker pool. It is
  gitignored — **keep it that way**; a `git add .` that commits it leaks every token to
  the worker repos on the next `render.js --method=github` force-push.
- Do not print tokens back to the user or into logs.

## 🎬 Render assets stay out of git

- `*.mastered.m4a`, `out/`, `out_*_chunks/`, logs are gitignored. A GitHub-Actions render
  needs only the raw `public/audio/<slug>.m4a` + `books/<slug>/{config,book}.json`; the
  runner re-masters audio itself. See [`AGENT_LOG.md`](AGENT_LOG.md) and
  [`github-actions-render`](.github/workflows/render-video.yml).

## Where the real docs are

- **[`SKILL.md`](SKILL.md)** — the single source of truth for the book-summary video system
  (Vox + Antidote engines, pipeline, GPU-less render constraints, YPP). Read before
  generating a video or refactoring.
- **[`.agents/skills/remotion/SKILL.md`](.agents/skills/remotion/SKILL.md)** — component/API catalog.
- **`SYSTEM_ARCHITECTURE.md`** — system overview. **`LOCAL_RENDER_RULES.md`** — render safety.

## The multi-worker GitHub render pool (quick map)

- `node scripts/render.js --slug=<slug> --method=github` → round-robins workers from
  `render-accounts.json` and dispatches `render-video.yml` on each.
- **A render pushes an ISOLATED PER-BOOK BUNDLE, never the shared branch.**
  `scripts/lib/render-bundle.js` builds a **parentless commit from the working tree**
  holding only that book + engine code, and pushes it to a per-render ref. So:
  - **You do NOT need to commit to `god-mode` to render** — assets on disk are enough.
  - No history and no other book travels with it, so one agent's commits (or a secret
    anywhere in history) can never block another agent's render.
  - Preview a bundle: `node scripts/lib/render-bundle.js --slug=<slug> --dry`.
  - Don't go back to pushing a shared branch (`--legacy-push` exists only as a fallback);
    see the 2026-09-04 entry in [`AGENT_LOG.md`](AGENT_LOG.md) for what it broke.
- **Rendering is unattended.** The `--wait` loop (on by default) heals a segment whose
  workflow never started — it re-pushes the ref and re-dispatches — then assembles,
  verifies and runs the post-render check. Don't babysit it.
- Manual rescue, if you ever need it:
  `node scripts/render-github-redispatch.js --slug=<slug>` (pushes missing refs too).
- **End to end in one command** once `public/audio/<slug>.m4a` + `public/captions/<slug>.vtt`
  are on disk: `node scripts/make-book.js --slug=<slug> --title="..." --author="..." --genre=<g> --render`
- `node scripts/render-github-download.js --slug=<slug>` → pull + ffprobe-verify the mp4.
- `node scripts/render-github-cleanup.js --slug=<slug>` → after you approve the download,
  delete that repo's artifacts + run logs to free Actions storage for the next render.
