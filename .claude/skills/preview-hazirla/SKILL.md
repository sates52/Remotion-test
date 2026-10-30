---
name: preview-hazirla
description: >
  Takes a book from "audio + VTT on disk" to a clean, verified PREVIEW (Antidote or Vox) on its own — story bible,
  own icons, parallel storyboard authors, merge fixes, readcheck, make-book with every gate, the sealed blind mute
  test, at most two fix rounds, preview-ready, hand-off — and stops only for decisions that are the operator's. Use
  when the operator says anything like "preview hazırla", "dosyalar hazır", "önizlemeyi hazırla", "preview'a
  hazırla", "files are ready, prepare the preview", with or without a book slug.
---

## FIRST - book work starts in the book's own worktree on CURRENT code (every harness, 2026-10-28)

Before ANY work on a book (Step 0 / NotebookLM prompt, "dosyalar hazir" / preview, storyboard, render, assembly), from
whatever checkout you were opened in - it may be the shared main checkout, many commits behind:

```
git fetch origin god-mode
git show origin/god-mode:scripts/book-start.js | node - --slug=<slug> --check     # then again without --check
```

It reads the CURRENT production code from origin (it needs nothing from the checkout it runs in), creates or resumes
`../wt-book-<slug>` pinned to origin/god-mode (locked, node_modules linked, the book's inputs copied) and prints where to
continue. Do ALL of that book's work THERE and follow THAT worktree's CLAUDE.md / AGENTS.md / skills - the copies in an
old checkout are stale (an old checkout produced crazy-rich-asians and the-lightning-thief on 80-commit-old engine code).
A book already started elsewhere is refused, never migrated silently: its owner decides (keep it, or
`--adopt="<owner's reason>"` for a new pinned copy; the original stays untouched). Current tools for a book started in
the main checkout (render status, cloud assembly): `... | node - --launcher`, then run them in `../wt-production-base`
with `--book-root=<that checkout>`. Never fast-forward, reset, pull, stash or clean the shared main checkout.


# Preview hazırla — autonomous preview production

The operator says "preview hazırla" once. You run the whole preview without routine questions, interim approvals or
handing technical errors back. You stop only for the decisions listed in §3. Talk to the operator in **Turkish**;
everything in the video, the storyboard and the YouTube pack is **English**.

The procedure is `STORYBOARD_RUNBOOK.md` (read it fully once; it wins where this file is shorter). The state of the
book is `node scripts/preview-state.js status --slug=<slug>`: it reads the book's files and prints the stage list,
**the next action** and, when it applies, **why the operator must decide**. It writes nothing.

## 1. Which book

1. The slug the operator named, or the book this conversation / your open WIP row is about.
2. Otherwise `node scripts/preview-state.js candidates` (it scans the main checkout, where the operator drops the
   files, and judges a book already in production in its own worktree — from whichever folder you run it): if it
   prints `unique: <slug>`, take it (do not ask). A book with someone else's open WIP row is never yours.

Your first line to the operator: which book, which engine and why (`book.json` → `engine`, `engineRationale`,
`engineDecidedBy`) — information, not a question.
3. Only if there is still more than one possible book: ask ONE short question listing them.

Never invent an input. `status` stops with `MISSING_INPUT` / `STEP0_ENGINE` if audio, VTT, `book.json`, the engine or
its `engineProfile` is missing — tell the operator the exact path and stop.

## 2. The loop (this is the whole job)

```
repeat:
  node scripts/preview-state.js status --slug=<slug>
  CONTINUE    → do the NEXT action (below), then loop
  READY_CHECK → node scripts/preview-ready.js --slug=<slug> (it records its verdict), then loop
  READY       → preview-ready recorded a PASS for this exact config: §5 (HAZIR)
  OPERATOR    → stop and report (§3, §5)
```

**Never end your turn on CONTINUE (2026-10-30).** Trust Fall (after the bible draft, and again after merge) and The
Art of Strategy (after the bible PASS) received CONTINUE, the next command and "run it now, without asking" — and
ended the turn with a question anyway ("Devam edeyim mi?", "Storyboard'a devam etmemi ister misiniz?") through the
harness's wrap-up / ask tool. While status prints CONTINUE you do not: call a wrap-up / ask / end-turn tool, ask
"shall I continue?", or write an interim "preview HAZIR DEĞİL — next step is …" report. A long pipeline is not a
reason; you run it. Your turn ends only at READY (§5 HAZIR), at an OPERATOR stop (§3, §5), or while you wait for
background agents you started — and then you continue when they finish, without a question.

The order is the same for every harness: code (book start) → bible → own icons → prep → authors → merge → readcheck →
make-book → sealed mute test → preview-ready → hand-off. What you do without asking, by stage (runbook section in brackets):

| stage | you do it yourself |
|---|---|
| code | New book from the shared checkout: `preview-state.js worktree --slug=<s>` creates `../wt-book-<s>` (detached at `origin/god-mode`, inputs copied, engine commit pinned) — continue THERE, never produce in the shared checkout. The book start is enforced in code (`production-guard`): the first production step of a new book refuses (exit 2) on engine code that differs from `origin/god-mode`, when origin cannot be fetched, or in the shared main checkout — follow the printed command, never set `PRODUCTION_ALLOW_BEHIND` / `PRODUCTION_ALLOW_MAIN` yourself (operator-only, recorded). A book already under way in the main checkout keeps going there: `preview-state.js pin`. Minimum commit given by the operator: `--min=<sha>`. Add your WIP row (contract §2: role production, worktree, base) to the **main checkout's** `AGENT_LOG.md` — the shared one other agents read, not your worktree's copy; edit only your own lines. |
| bible (§1, §1c) | `fix-vtt-names`, `plan-bible --emit`, rewrite the draft against the evidence (cast with looks and distinct `variant`s, allowedMotifs/Locations, spine, signatureObjects), `plan-bible --bible`. Never re-run `--emit` over your rewrite. The draft's era, cast keys, ages and places are a heuristic and often wrong (one metaphor gave Trust Fall a sci-fi era): correcting them from the narration is routine, never a question. `--bible` prints a source-grounding review (a cast member the narration never names, a name it uses often that no cast member carries) — fix what is real and rerun; it never blocks. |
| ownIcons (§1b) | Draw `motifs.json` (an object the narration CHANGES gets one icon per state it shows, §1b), `own-icons-sheet.js`, a FRESH sonnet agent names each number, write its answers to `storyboard/own-icons.naming.json` as `{"names":{"<n>":{"said","intended","match":true|false}}}`; redraw every misread until all match. |
| prep (§2) | `storyboard.js prep` after the bible, icons and variants are final, and again at the start of every fix round. |
| authors (§2) | One fresh agent per `### Author K` in `PROMPTS.md`, all in ONE message, in the background (Claude: Agent tool; Antigravity: Agent Manager). Authors follow `antidote-visual-authoring`. |
| gateB | `gate-b-relationship.js` when a beat stages a relationship (needs `GOOGLE_API_KEY`, never print it). FALLBACK = author that beat normally. |
| merge (§2) | `merge` → read `problems (N)` (it exits 0 even with problems) → fix every ✗ yourself in `authored-K.json` → `merge --write`. Then read the icon histogram and ~20 random beats against the icon test. A refused merge is a work list: **Merge recovery** below. |
| readcheck (§2b) | prep → blind readers (fresh, sonnet, parallel) → judge → judges → tally; fix every WRONG by cause class; re-read changed beats with `--beats=` (also after every fix round's merge). A new `data/icon-readings.json` row is shared data: commit it by itself before the next step (contract §3) — `status` stops on any uncommitted code or data under the book. |
| makeBook (§3) | `make-book … --skip-pack` (`--preview-only` for Antidote). It finished only if it printed ✅ HAZIR and wrote `books/<s>/make-book.done.json` (`status` checks this — a gate without a report, like continuity, cannot pass silently). A gate FAIL is content: read the ❌ line and `books/<s>/*.report.json`, fix the storyboard, merge, re-run. |
| seal / mute (§4) | Seal right after the first make-book; then the verdict prep, a FRESH sonnet describer, `judge`, a FRESH sonnet judge, `tally`. Blind agents never authored the storyboard and are never told the book. The prep renders 30 stills in one bundle — tens of minutes on a busy PC: start it ONCE in the background and wait for its completion notification; do not poll, cancel or restart it (a restart pays the bundle again; a second prep of the same label is refused while one runs, exit 3). If it was killed anyway, run the same command again: stills already rendered from the same config are kept. |
| fixRound (§4) | cause-ledger + similar-candidates, then the fix-round protocol: fix only CONFIRMED authoring classes on their REVIEW beats (soft cap ~25), merge, readcheck the changed beats, make-book, a fresh holdout (`status` names the label). ENGINE / VOCABULARY → `AGENT_LOG.md` `for-review`; RATER → noted. |

Duration is never a reason to ask: a long step (prep, bundle, make-book, image generation on a configured free
provider) is started and waited for — never "this will take long, continue?".

**Merge recovery (2026-10-29) — no approval, whatever the count.** Merge FAIL → read the recovery block (and
`storyboard/merge-report.json`: every problem has a code, a class, its `authored-K.json` and the fix) → fix → `merge`
(validate) → `merge --write` → continue (make-book / readcheck / preview). 40, 60 or 105 problems are routine
(essentialism asked "Do you want me to continue?" at 38 — all 38 were authoring fixes, cleared in 90 s once told).
- `ROUTINE`: fix the named field. `REAUTHOR`: re-read the beat's narration and author it again. `AGENT_STEP`: run the
  step yourself (`prep`, a fresh author agent for a missing / invalid chunk, `gate-b-relationship.js`), then re-merge.
- Fix FROM the narration — never fill a field with a copy of another (the emphasis word, the claim, the callout) to
  pass. Merge then passes, but prints `REVIEW_REQUIRED` (FILLED_AFTER_REFUSAL, VISUAL_IS_CLAIM, ECHO_ONLY_CARRIER,
  EARLY_TEXT): not a failure and never an operator question — readcheck reads those beats blind; a WRONG there is a
  confirmed defect for the fix round, a CORRECT clears it. Vox has no readcheck: review its flags yourself against the
  narration before make-book (the mute test is its blind check).
- Stop only for a real stop: `OPERATOR` in the report (none of today's merge messages is one), a narration / recording
  that contradicts the book (an input problem), a fix that would need another agent's files, a new cost, or a fix
  beyond the storyboard (engine code, gates) — report it with the beat and the message; keep fixing the rest.

`status` already enforces the order: resume is automatic (a finished, current step is never redone; a step whose
inputs changed is shown stale), the sealed sample is never re-drawn, an unchanged film never gets a new holdout.

## 3. When you stop — and only then

| `status` code / situation | what it means |
|---|---|
| `MISSING_INPUT`, `STEP0_ENGINE` | a required input is not on disk, is a placeholder, or Step 0 was not done — never invent it |
| make-book step 0 (VTT pre-flight) FAILs | the VTT does not cover the audio, is another book's, or does not open with this book's cold open — an input problem, never bypassed |
| `ENGINE_CONTRADICTION` | prep found the narration strongly contradicts the Step 0 engine: keep (`--confirm-engine`) or switch (new prompt + audio + VTT) is the operator's. After "keep", every later prep carries `--confirm-engine` (`status` prints it) — never ask twice |
| `OWNERSHIP`, `CODE_MOVED`, `CODE_DIRTY` | the code under this book is not its pinned commit, or someone else's uncommitted code is in the way — never stash, reset or edit it |
| `FROZEN` | a published book — never re-planned |
| `BOOK_START_STALE`, or production-guard exit 2 at the book start | the checkout's engine code is not the current `origin/god-mode`: the book starts in its own worktree (`preview-state.js worktree --slug=<s>` from the main checkout — yours to run when your session may); if that fails (origin cannot be fetched) or the operator wants older code, only the operator can allow it (`PRODUCTION_ALLOW_BEHIND`, recorded) |
| `TECHNICAL_RETRY_LIMIT` | the same step failed transiently 3 times in a row (§4) |
| `FIX_ROUNDS_EXHAUSTED` | 2 fix rounds used and there is still no fresh PASS on the current film |
| `HOLDOUT_EXHAUSTED` | the last holdout had to reuse frames (a short book has no unseen beats left): no fresh verdict is possible — a PASS on reused frames is never READY |
| `ENGINE_LIMIT` (or your own finding) | a gate or mute failure that no storyboard change can clear: the cause-ledger attributes every failure to ENGINE / VOCABULARY / RATER, or you looked at the stills and found no authoring class — after `prep` refreshed the vocabulary (never report a limit that was already fixed). Log it as `for-review: <slug> — <problem>` (scene id, file, what you saw); work around it in the storyboard where you can |
| operator authority | a full render, accepting quality debt, the YouTube pack upload, publishing, any cleanup — never yours |

**Autonomy (canonical — what needs no approval vs the real gates).** Routine, proceed without asking: story bible,
own icons, prep, authoring, merge and its fixes, readcheck, make-book, Screen-Text / gate fixes in the storyboard,
missing images ONLY on providers already configured AND known free to the operator, the whole mute test (seal, prep,
blind, judge, tally, sealed verdict runs), fix rounds up to the allowed limit, preview-ready, the hand-off, and —
after READY — the YouTube pack text / meta / thumbnails (no upload). Duration is never a reason to ask: start it and
wait. Real gates, stop and ask: any new or uncertain cost (Flux/NVIDIA image generation is NOT assumed free — a new,
paid or unknown-cost provider, and re-generating filtered images, need operator approval); deleting or overwriting
data you do not own; input or commit mismatches the tools cannot resolve (the `status` OPERATOR codes above, VTT
pre-flight, `ENGINE_CONTRADICTION`, `PRODUCTION_ALLOW_*`); accepting quality debt or ending at the fix-round /
holdout limits; a full / final render, upload, publishing; any cleanup; any credential change. If unsure: if
`node scripts/preview-state.js status --slug=<slug>` prints CONTINUE, continue.
**Already decided = not asked again.** Before asking the operator about quality debt or the production render, run
`node scripts/render-decision.js --slug=<slug>` (read-only). COVERED / AUTHORIZED = the operator's records for THIS
exact render input already exist: the quality debt (if any) accepted with `--accept-quality-debt`, and the production
render go recorded with `--authorize-render` (2026-10-30: two separate records; a decision written before 2026-10-30
was the combined one and still counts). Run the production render without asking; render.js still runs the real
preflight and dispatches only on GO. Nothing else is covered: NEEDS_DECISION (a new config or a new finding — an older
decision never covers it), BLOCK (never acceptable), NO_DEBT / NEEDS_AUTHORIZATION (quality settled, the operator's go
not recorded — report it; record it only with the operator's own words). The preview verdict is
reported as it is — an accepted decision never turns NOT READY into READY or a firewall FAIL into PASS.
**Production needs preview READY or the operator's decision — Vox and Antidote alike (2026-10-28).** A NOT READY /
stale / missing preview stops a production render (no automatic production render) until the operator records a
decision for THIS render input (`render.js --accept-quality-debt="<why>"` — it covers the current REVIEW findings and
the NOT READY preview, nothing else). A changed config or a new finding is never covered; a BLOCK never is.

## 4. Errors: transient vs real

- **Transient** (retry the SAME command, at most 3 attempts in a row): still/Remotion bundle, Chrome launch or
  `Timeout` in a mute-test or framecheck prep (rendered stills are kept, same sample); `own-icons-sheet` Chrome crash;
  Gate B `fetch failed` / HTTP 429 / 503 after its own retries; `books.generated.ts` file lock; a blind or author agent
  that did not write its file or wrote invalid JSON (re-run with a NEW fresh agent). Record every attempt:
  `node scripts/preview-state.js note --slug=<s> --step=<stage> --result=transient|ok --msg="<error line>"` —
  `status` stops at the third consecutive transient failure and keeps the evidence.
- **Real results — never retried to flip them:** a merge ✗, a gate FAIL, a readcheck WRONG, a mute-test FAIL
  (`tally` exits 0 on FAIL — read `mute-test.json`), Gate B FALLBACK, a misread own icon. Fix the cause in the
  storyboard / bible / icons and continue.
- `judge` stopping with "filed under the wrong images" is a describer error: a NEW fresh describer, never the same
  `blind.json` (counts as a transient attempt of `mute`).
- Never edit engine code, gates, thresholds or how a bar is computed; never hand-edit `config.*.json`; never draw a new
  holdout from an open seal or on an unchanged film; never report a FAILED mute test as PASS.

## 5. Finish (READY, or an OPERATOR stop)

- `node scripts/gen-books-registry.js`; Antidote: collect the facts with `antidote-quality-handoff`.
- The book stays in its production worktree — Studio, the YouTube pack and any later render run there. Do not copy
  it into the shared checkout, and commit or push its files only if the operator asks — except the routine commits this
  procedure itself requires (e.g. a new `data/icon-readings.json` row, §2 readcheck), which you make without asking.
- The main checkout's `AGENT_LOG.md`: mark your WIP row done; one changelog entry (preview-ready output, every mute
  run's totals, for-review items, the worktree path).
- **HAZIR is a quote, not a judgement.** Write "preview HAZIR" only when `preview-state.js status` prints `READY` (it
  reads preview-ready's own recorded PASS for the current config, after the last mute tally) — paste preview-ready's
  `✅ READY` line into the report. Studio opening, gates passing or a finished render are not READY. Any other outcome
  (`READY_CHECK`, exit 1, not run, a mute run without `tally`) is "preview HAZIR DEĞİL" with that stage and the next command.
  (do-over 2026-10-24: preview-ready exited 1 with the verdict untallied and the report still said HAZIR.)
  That HAZIR DEĞİL report is written ONLY at an OPERATOR stop — never as an interim report while status prints
  CONTINUE (then you run the next command, §2 "Never end your turn on CONTINUE").
- Report in Turkish, exactly this shape:

```
<Kitap adı> (<slug>, <engine>) — preview HAZIR / HAZIR DEĞİL
Önizleme: http://localhost:3001/<Antidote|Vox>-<slug>   (çalışma alanı: <worktree yolu> — Studio orada açılır: npx remotion studio)
Sessiz izleme testi (30 sahne): <doğru>/<nötr>/<yanlış>, ölü kare <n>/30, görsel katkı <n>/30 (%<p>, hedef %60), açıklayan <n>/30 → PASS/FAIL
Gate'ler: authorship ✓ · firewall ✓ (<n> REVIEW) · screen-text ✓ · dead-air <en uzun boşluk>
Gözden geçirilecekler: <for-review maddeleri, yoksa "yok">
Durma nedeni: <yalnızca HAZIR DEĞİL ise: preview-state kodu + kanıt>
Sıradaki adım: <HAZIR ise YouTube paketi (metin/meta/thumbnail, yükleme yok) hazırlanıyor/hazır; render ve yükleme — operatör kararı>
```

## 6. Hard rules (runbook §7, contract §3)

- One book, one slug, one production worktree, one pinned engine commit for the whole book; never code that is not a
  commit; never another agent's books, worktree, WIP row or `AGENT_LOG.md` lines; published books are frozen.
- No cleanup, ever, without the operator's explicit command (`CLAUDE.md`). Never remove a production worktree (its
  `node_modules` is a junction into the main checkout: `worktree` LOCKS it so `git worktree remove --force` refuses;
  only after `preview-state.js unlink` — the operator's cleanup — may it be removed). Never `npm install` inside it.
- Never render the full video, never generate Flux images for an unauthored Vox book; a `minorHarm` book stays
  Antidote and never stages harm.
- Temporary helper scripts go to your scratchpad, never into `scripts/`.
