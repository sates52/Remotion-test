---
name: render-deliver
description: >
  The final render, its assembly and the delivery files — after the operator approved the production render of a
  book. GitHub workers → CLOUD assembly → cloud verification → download ONLY the final film → post-render checks →
  the YouTube pack. Use for "render et", "final render", "renderi başlat", "birleştir", "assemble", "videoyu indir",
  when a render was interrupted or another session's render must be picked up, and before any assembly step.
---

# Final render → cloud assembly → delivery (every harness: Claude Code, Antigravity, Cursor)

One standard, no variants. **Never download segments and never join them with ffmpeg on this PC.** The segments are
joined and verified on a GitHub runner; this PC downloads only the verified film. (2026-10-28: an agent on The Book
of Margery Kempe planned a local download + ffmpeg concat because its pinned checkout's old render.js still did that.)

## 0. Preconditions (operator gates, not yours)
- The operator approved the production render of THIS config. `node scripts/render-decision.js --slug=<slug>` says
  whether it is already decided (COVERED = do not ask again). A NOT READY preview needs the operator's recorded
  decision (`--accept-quality-debt="<why>"` — the operator's words, never yours). A BLOCK is never renderable.
- Run every command below from a checkout of the CURRENT `origin/god-mode` (the delivery code). A book pinned to an
  older engine SHA keeps its plan; its finished render state is assembled by current code with `--book-root=<that
  checkout>` (nothing re-rendered).

## 1. Render
```bash
node scripts/render.js --slug=<slug> --method=github
```
It checks (preflight) → pushes one audited bundle → dispatches the segments → waits → joins IN THE CLOUD
(`render-github-cloud-assemble.js --download`) → verifies → runs post-render. Do not babysit it. Never add
`--local-assemble` / `--local-fallback`: they are the operator's exception and require the operator's own reason.

## 2. Anything interrupted, or a render you did not start → ONE command decides
```bash
node scripts/render-status.js --slug=<slug> [--book-root=<checkout that dispatched it>]
```
It prints one verdict and the one next command. Run exactly that command, nothing else:
- `RENDERING` / `ASSEMBLING` → wait (a rerun of the cloud join ATTACHES to the running one; it never starts a second);
- `SEGMENT_FAILED` → `render-github-redispatch.js --slug --seg=<k>` (only those segments; done segments are kept);
- `CLOUD_ASSEMBLE` → `render-github-cloud-assemble.js --slug --download [--book-root]`;
- `FETCH` → `render-github-cloud-assemble.js --slug --fetch` (download only, no new run);
- `VERIFIED` → step 3;
- `UNKNOWN` (API unreadable) → run render-status again later; never act on a guess;
- `LEGACY_NO_BUNDLE` → stop and report: the operator decides.

**Cloud assembly failed?** No automatic local fallback. The segments stay on the workers. Report the run URL and the
render-status verdict; retry the cloud (the same command — it is idempotent). A local join exists only as the
operator's recorded exception: `render-github-assemble.js --slug --operator-approved="<the operator's reason>"`
(it refuses otherwise, refuses when the cloud already verified the film, and cannot run twice).

## 3. Verified film → delivery
The cloud verification checks every segment's frame count, a FULL decode and the audio stream, then the joined film's
frames against the book's config; the download is checked by sha256. On this PC `post-render.js` re-verifies the MP4
(frames = config, full decode, duration) and the delivery files. Then the YouTube pack:
```bash
node scripts/lint-titles.js --slug=<slug> --pack      # YouTube READY (titles, description, chapters, hook, clean.vtt)
node scripts/package-youtube.js --slug=<slug>          # refuses an unready pack (metadata never blocks the render)
```
Report with `.claude/skills/antidote-quality-handoff/SKILL.md` (Vox books: the same three facts).

## 4. Never on your own
Cleanup (`render-github-cleanup.js`, `purge-render-branches.js`, `render-purge.js`), deleting the film, uploading,
publishing, changing credentials — only on the operator's explicit order (CLAUDE.md "Post-upload order").
