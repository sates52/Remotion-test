---
name: preview-hazirla
description: >
  Takes a book from "audio + VTT on disk" to a clean, verified PREVIEW (Antidote or Vox) by
  running STORYBOARD_RUNBOOK.md end to end — story bible, parallel storyboard authors, make-book
  with every gate, blind mute test, preview-ready. Use when the operator says anything like
  "dosyalar hazır", "preview hazırla", "preview'a hazırla", "önizlemeyi hazırla",
  "files are ready, prepare the preview", with or without a book slug.
---

# Preview hazırla

The operator dropped `public/audio/<slug>.m4a` + `public/captions/<slug>.vtt` and wants a preview
they can watch in Studio. Your job ends when `node scripts/preview-ready.js --slug=<slug>` prints
READY (or you have hit a documented limit). Talk to the operator in **Turkish**; everything that
goes into the video, the storyboard and the YouTube pack is **English**.

## 1. The book
- The operator opens one session per book: the book is the one THIS session is about (from the
  conversation — e.g. Step 0 was done here). Do not search for other books. Only if the
  conversation genuinely does not say which book, ask one short question.
- Check the two files exist: `public/audio/<slug>.m4a`, `public/captions/<slug>.vtt`. If one is
  missing, tell the operator the exact path and stop.
- **Engine (Vox / Antidote) — confirm before any authoring.** It was decided at Step 0 (when the
  NotebookLM prompt was written — there was no VTT yet) and the audio was recorded FOR it. Tell the
  operator in one line which engine, why, and how it was decided (`book.json` → `engine`,
  `engineRationale`, `engineDecidedBy`). `storyboard.js prep` then checks the real narration against
  it. If it stops, **ask the operator** and state the cost: keep the engine (usual —
  `--confirm-engine`) or switch, which means a new prompt + new NotebookLM audio + new VTT. Never
  pick silently. No engine in book.json → Step 0 is missing; say so and stop.
- Add your row to `AGENT_LOG.md` → Active WIP: `| preview-<slug> | books/<slug>/ | in progress | |`.
- If work already exists (`books/<slug>/storyboard/`, `art.json`/`designs.json`,
  `mute-test.json`), resume from the first unfinished step — never redo a finished one.

## 2. Run the runbook — `STORYBOARD_RUNBOOK.md`, in order
Read it fully once. The steps, with how YOU execute the agent parts:

1. **Narration + story bible** (§1). You author the bible yourself from the `--emit` draft:
   complete cast with `look`s (every person the narration discusses; non-fiction → author/host,
   named subjects, `everyman`), allowedMotifs/Locations that fit THIS book, a `spine`.
2. **Storyboard** (§2): `node scripts/storyboard.js prep --slug=<slug>`, then launch one **Agent**
   per prompt in `books/<slug>/storyboard/PROMPTS.md` — all in ONE message so they run in
   parallel, `run_in_background: true`. When all `authored-K.json` exist:
   `merge` → fix every ✗ yourself in `authored-K.json` → `merge --write`. Then personally review
   the icon histogram and ~20 random beats against the icon test before continuing.
3. **make-book** (§3) with `--skip-pack`. Every blocking gate must PASS. A content failure → fix the
   storyboard and repeat. An engine failure → §4 below.
4. **Mute test** (§4): `mute-test.js prep` (run in background — it renders stills), then a **fresh
   Agent** for PROMPTS.md §1 (blind describer), `judge`, a **fresh Agent** for §3 (judge), `tally`.
   Blind agents must never be the storyboard authors or know the book.
   - FAIL → name each failure's cause class and fix EVERY beat of that class (runbook §4), `merge
     --write`, make-book, then a **fresh holdout** run: `prep --label=run2` (NO `--frames-from`),
     `judge`, `tally`. Never re-test the fixed frames as the verdict — preview-ready rejects a PASS
     on reused frames. Skip the `--vs` diagnostic unless you genuinely need it (it costs two agents).
     **At most 2 fix rounds**; if still FAIL, stop and report the remaining failures to the operator.
   - **Cost:** launch the blind describer and the judge with `model: "sonnet"` — describing 30
     stills and judging against narration needs no top model. Storyboard authors keep the default.
5. **Ready check** (§5): `node scripts/preview-ready.js --slug=<slug>` and
   `node scripts/gen-books-registry.js`.

## 3. Hard rules (same as the runbook §7)
- Never hand-edit `config.*.json`, never bypass a gate or change a threshold, never edit engine
  code (`scripts/lib`, `src/engines`, gate scripts) to get this book through.
- Never render the full video and never generate Flux images for an unauthored Vox book —
  make-book's authorship gate enforces this; do not work around it.
- Published books are frozen.
- Temporary helper scripts go to your scratchpad directory, never into `scripts/`.

## 4. When the engine is in the way
Write an `AGENT_LOG.md` entry `for-review: <slug> — <problem>` (scene id, file, what you saw,
the report line), work around it in the STORYBOARD if possible (different icon/shot/beat), and
continue. The reviewer fixes the system; you do not.

## 5. Finish
- Clear your Active WIP row; add an `AGENT_LOG.md` entry with the `preview-ready` output, the mute
  test totals and any `for-review` items.
- Report to the operator in Turkish, exactly this shape:

```
<Kitap adı> (<slug>, <engine>) — preview HAZIR / HAZIR DEĞİL
Önizleme: http://localhost:3001/<Antidote|Vox>-<slug>
Sessiz izleme testi (30 sahne): <doğru>/<nötr>/<yanlış>, görsel katkı <n>/30 (%<p>) → PASS/FAIL
Gate'ler: authorship ✓ · firewall ✓ · screen-text ✓ · dead-air <en uzun boşluk>
Gözden geçirilecekler: <for-review maddeleri, yoksa "yok">
Sıradaki adım: <önizlemeyi izle → onaylarsan YouTube paketi / render>
```
