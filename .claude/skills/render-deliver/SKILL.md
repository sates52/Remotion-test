---
name: render-deliver
description: >
  The final render, its assembly and the delivery files — after the operator approved the production render of a
  book. GitHub workers → CLOUD assembly → cloud verification → download ONLY the final film → post-render checks →
  the YouTube pack. Use for "render et", "final render", "renderi başlat", "birleştir", "assemble", "videoyu indir",
  when a render was interrupted or another session's render must be picked up, and before any assembly step.
---

# Final render → cloud assembly → delivery (every harness: Claude Code, Antigravity, Cursor)

**ONE GO → ONE COMMAND (cycle 9, 2026-11-03).** Once the operator's production GO is recorded for this render input
(`render-decision.js` says AUTHORIZED / COVERED), the whole chain is ONE command — run it in the background and do not
stop to ask again:
```bash
node scripts/render-deliver.js --slug=<slug> [--book-root=<pinned book worktree>]     # dispatch → … → verified MP4
node scripts/render-deliver.js --slug=<slug> [--book-root=…] --check                   # read-only: state + next step
```
It dispatches (only if nothing was dispatched), tracks the runs, re-sends ONLY failed/missing segments (≤ 2 each),
assembles in the cloud, downloads the verified film (sha256), measures it (frames, full decode, A/V sync, join
dropouts, loudness — report only), writes the technical record and runs post-render. Re-dispatch, assembly, download,
hash and verification are inside the GO: **never ask the operator for them.** Rerun the same command after any
interruption (agent restart, terminal closed): it re-reads the book root + GitHub and continues; nothing runs twice.
Report while it runs; reporting is not a reason to stop. Return to the operator only on its exit:
`0` DONE (VERIFIED / DELIVERED / PUBLISHED) · `1` FAILED (budget spent — report the reason and the run URLs) ·
`4` BLOCKED (no GO for this render input, or GitHub unreadable) · `5` legacy state · `6` time limit (rerun it).
It never uploads, publishes, cleans up, records a quality-debt decision or an authorization, joins locally, or starts a
new render of the same input — those stay the operator's (§0, §4).

One standard, no variants. **Never download segments and never join them with ffmpeg on this PC.** The segments are
joined and verified on a GitHub runner; this PC downloads only the verified film. (2026-10-28: an agent on The Book
of Margery Kempe planned a local download + ffmpeg concat because its pinned checkout's old render.js still did that.)

## 0. Preconditions (operator gates, not yours)
- The operator approved the production render of THIS config. `node scripts/render-decision.js --slug=<slug>` says
  whether it is already decided (COVERED / AUTHORIZED = do not ask again). Two operator records, kept apart
  (2026-10-30):
  - **quality debt** (REVIEW findings / a NOT READY preview): `--accept-quality-debt="<the operator's words>"`;
  - **the production render go**: `--authorize-render="<the operator's words>"`. It is needed even when quality and
    preview are clean (NO_DEBT / NEEDS_AUTHORIZATION). It binds to this render input only, and is recorded only when
    quality and preview are settled.
  Both are the operator's words, never yours. A BLOCK is never renderable. YouTube READY is not a render permission.
- Run every command below from a checkout of the CURRENT `origin/god-mode` (the delivery code). A book pinned to an
  older engine SHA keeps its pin: deliver it from the launcher with `--book-root=<that worktree>`:
  `git show origin/god-mode:scripts/book-start.js | node - --launcher`, then in `../wt-production-base`:
  `node scripts/render-deliver.js --slug=<slug> --book-root=<book worktree>` (the GO itself is recorded first, once,
  with the operator's words: `node scripts/render.js --slug=<slug> --method=github --book-root=<…> --authorize-render="…"`,
  which also dispatches).
  - The bundle is built from the book worktree, so its pinned engine renders it; tracking, assembly and verification
    are the launcher's current code (pinned code ≠ production code: the pin is never moved for a delivery fix).
  - Credentials are read in place from the main checkout: never copy `render-accounts.json` and never symlink it.
  - `render.js --book-root` dispatches, records and stops; `render-deliver.js` (same `--book-root`) does the rest.
  - It refuses a book worktree whose HEAD is not its pin, or that has tracked engine changes. A regenerated
    `src/books.generated.ts` is fine.
- The code enforces the production render contract (`docs/AGENT-OPERATING-CONTRACT.md` §7b): `--method` is required
  (no default), unknown flags exit 2, a checkout behind origin cannot start a production render, a worktree copy of
  `render-accounts.json` is refused, and "dispatched" is printed only when every segment's run id is seen — a
  `NOT CONFIRMED` line means the render did NOT start yet: run `render-deliver.js` (it reconciles with GitHub).
- The same render input is never dispatched twice: a repeat after a complete dispatch is refused (exit 3). A
  deliberate new render is the operator's `--new-render="<reason>"`.

## 1. Render
```bash
node scripts/render-deliver.js --slug=<slug> [--book-root=<pinned book worktree>]
```
Preflight + one audited bundle + dispatch (render.js) → runs → cloud join (`render-github-cloud-assemble.js
--download`) → verified download → final media check → post-render. Do not babysit it. Never add `--local-assemble` /
`--local-fallback` to anything: they are the operator's exception and require the operator's own reason.
A push that fails for ONE segment no longer stops the others: the pushed ones are dispatched, the missing one is
re-sent by render-deliver (a push is a lease on what the worker's ref held, never a blind overwrite; an unreadable ref
or run list is never treated as "missing").

## 2. What render-deliver does per state (render-status.js prints the same verdicts, read-only)
```bash
node scripts/render-status.js --slug=<slug> [--book-root=<checkout that dispatched it>]
```
One verdict, one next command — render-deliver runs it for you; by hand, run exactly that command, nothing else:
- `RENDERING` / `ASSEMBLING` → wait (a rerun of the cloud join ATTACHES to the running one; it never starts a second);
- `SEGMENT_FAILED` → `render-github-redispatch.js --slug --seg=<k>` (only those segments; done segments are kept);
- `CLOUD_ASSEMBLE` → `render-github-cloud-assemble.js --slug --download [--book-root]`;
- `FETCH` → `render-github-cloud-assemble.js --slug --fetch` (download only, no new run);
- `VERIFIED` → step 3 (`render-deliver.js` runs it);
- `DELIVERED` / `PUBLISHED` → the end: the film was downloaded once (or the book is published) and later removed by the
  upload/cleanup — never fetched or re-rendered by itself;
- `UNKNOWN` (API unreadable) → run render-status again later; never act on a guess;
- `LEGACY_NO_BUNDLE` → stop and report: the operator decides.

**Cloud assembly failed?** No automatic local fallback. The segments stay on the workers. Report the run URL and the
render-status verdict; retry the cloud (the same command — it is idempotent). A local join exists only as the
operator's recorded exception: `render-github-assemble.js --slug --operator-approved="<the operator's reason>"`
(it refuses otherwise, refuses when the cloud already verified the film, and cannot run twice).

## 3. Verified film → delivery
The cloud verification checks every segment's frame count, a FULL decode and the audio stream, then the joined film's
frames against the book's config; the download is checked by sha256. On this PC render-deliver runs
`verify-render-output.js --media [--book-root]` (frames = config, full decode, and the A/V measurement: sync verdict —
start/end offsets, audio timeline, where the video holds; join dropouts vs the source narration; stretch; loudness,
REPORT ONLY) into `books/<slug>/render-facts.json`, then `post-render.js --no-cleanup [--book-root]` (delivery files;
it no longer deletes the render state). An A/V sync FAIL fails the delivery; dropouts and loudness are reported.
**Thumbnails A/B/C come with the film (2026-11-06, `scripts/lib/cloud-thumbs.js`).** A production assembly run also
renders them (job `thumbnails`, `needs: assemble`, once per film — never per segment), and before post-render the
delivery installs them: `out/thumbnail-<slug>{,-b,-c}.png` + `books/<slug>/thumbnail-check.json` + the youtube.md
Test & Compare block, sha256-checked and bound to the thumbnail inputs (stale = refused). Missing / failed / stale →
ONE thumbnail-only run. A thumbnail problem is reported and NEVER fails, re-renders or un-verifies the film. A film
that is already delivered, or a changed hook / grammar: `node scripts/render-thumbnails.js --slug=<slug> --cloud
[--book-root=<book worktree>]` (thumbnail-only: no film rendered, joined, uploaded or published). Preview renders get
none (production finalization only); thumbnail-only works for any unpublished book.
The cloud assembly also REPAIRS the chunk joins (2026-11-04, `scripts/repair-joins.js`): every 400-frame chunk carried its
AAC encoder delay as ~43 ms of inserted silence + a held frame. The film comes back on the composition clock (same
frames, every content sample, narration no longer 43 ms late); `report.joinRepair` says REPAIRED / NOT_REPAIRED (then
the film is delivered exactly as before). Never run it on a delivered film by hand.
Then the YouTube pack:
```bash
node scripts/lint-titles.js --slug=<slug> --pack      # YouTube READY (titles, description, chapters, hook, clean.vtt)
node scripts/package-youtube.js --slug=<slug>          # refuses an unready pack (metadata never blocks the render)
```
Report with `.claude/skills/antidote-quality-handoff/SKILL.md` (Vox books: the same three facts).

## 4. Never on your own
Cleanup (`render-github-cleanup.js`, `purge-render-branches.js`, `render-purge.js`), deleting the film, uploading,
publishing, changing credentials — only on the operator's explicit order (CLAUDE.md "Post-upload order").

## 5. Worker credentials (2026-10-29)
`render-accounts.json` is read IN PLACE — `$RENDER_ACCOUNTS_FILE`, else this checkout's, else the main checkout's (found
through the git common dir). A book worktree needs no copy: **never copy the token file into a worktree** and never
print it. The preflight prints `credentials: … usable · access … verified` before the first push and STOPs when no
worker is usable (missing file, unsafe source, missing fields, every token refused) — that STOP is the operator's
(a credential change), not a retry. Nothing rewrites the token file; the round-robin pointer and the access cache live
in `<git common dir>/render-pool-state.json`.
