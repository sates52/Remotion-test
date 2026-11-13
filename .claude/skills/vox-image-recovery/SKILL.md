---
name: vox-image-recovery
description: >
  A Vox book lost authored images — Flux refused them (CONTENT_FILTERED), the call failed (HTTP 422 too long, 5xx),
  or they were never generated — and the config's `images` is empty for those beats. Diagnose with one command,
  re-author the refused beats in the storyboard, re-generate them under the operator's standing cap (no approval
  needed), and convert what still fails to text beats — then continue the preview. Use when make-book step 6.1,
  `preview-state.js status` (stage `images`) or preview-ready ("authored images present") names lost images, or for
  anything like "görseller eksik", "images boş", "CONTENT_FILTERED", "Flux reddetti", "missing images".
---

# Vox image recovery — every agent, every Vox book

## 0. What is already known (do not re-diagnose)

- `gen-vox-images.py` generates only the images the config asks for. An image Flux refuses 3/3 (or a call that fails)
  is recorded `failed` in `books/<slug>/images.report.json` and its ref is **dropped from `config.vox.json`** (exit 0).
- An UNCHANGED failed prompt is **never retried** (cycle 8: Hamnet paid for 58 refusals on every run). So re-running
  make-book changes nothing — the beat stays empty until its subject changes or it is named with `--image-beats`.
- `plan-vox.js` is not the cause: an `imagefocus` beat always gets its image request. Do not open engine code, do not
  edit the config by hand, do not log it as an engine bug. Measured on hamnet (58), the-witch (5), north-woods (10),
  the-crucible, all-the-light-we-cannot-see: the filter also refuses harmless subjects (a mansion, a typewriter).

## 1. The operator's standing decision (2026-11-13) — no question

`data/vox-image-recovery-policy.json`: recovering these images is **routine**. At most **2 recovery rounds per beat**
and **60 Flux calls per book**, no approval asked. Past the cap the beat becomes a **text beat** and is reported in the
hand-off. The tool enforces the caps and keeps the ledger (`books/<slug>/image-recovery.json`). Change the numbers
only on the operator's word. Everything else in preview-hazirla §3 (other costs, renders, cleanup) is unchanged.

## 2. The loop

```
node scripts/vox-image-recovery.js status --slug=<slug>     # lost beats, class, file to edit, budget left
#   re-author the beats it marks REWRITE / TO_TEXT in the authored-K.json it names (§3)
node scripts/storyboard.js merge --slug=<slug> --write
node scripts/vox-image-recovery.js run --slug=<slug>        # make-book + --image-beats + call cap; records the round
node scripts/preview-state.js status --slug=<slug>          # continue the preview from where it says
```

Repeat while `status` exits 1. `run` refuses (exit 2, no call spent) while a refused subject is unchanged, a beat
waits for its text conversion, or the storyboard is not merged. Exit codes: 0 nothing lost · 1 work · 3 only text
conversions left · 4 OPERATOR. `run` takes as long as make-book: start it in the background and wait for it.

**Pinned book worktree without the tool** (pinned before it existed): run the current tool against your worktree —
`git fetch origin god-mode && git show origin/god-mode:scripts/book-start.js | node - --launcher`, then
`node ../wt-production-base/scripts/vox-image-recovery.js status|run --slug=<slug> --root=<your worktree>`
(`run` still executes YOUR worktree's make-book, so the pin is untouched).

## 3. How to re-author, by class

The rewrite is authored from the narration (rules.md applies): the SAME moment, a new subject a muted viewer reads
the same way. Edit the beat's entry `{"i": N, "design": {…}}` in the named `authored-K.json`; never designs.json.

| class | what happened | rewrite |
|---|---|---|
| `REWRITE_TRIGGERS` | refused 3/3, subject holds filter words (listed) | show the aftermath, a symbol, the place or the object instead of the act; no weapon in use, no wound, no body; a minor only as "young woman / young man" if the narration allows — else drop the person |
| `REWRITE_COMPOSITION` | refused 3/3, subject looks harmless | change the composition, not one word: no face (hands, back view, a figure far away) or the place / object alone; shorten a reused `look` |
| `SHORTEN` | HTTP 422 / subject over ~470 chars | one look, no repeated description, keep the identifying details |
| `RETRY` / `GENERATE` | transient error / never generated | nothing to author — `run` names it |
| `CUTOUT` | image exists, cut-out empty | delete the `-cut.png`, `python scripts/cutout.py books/<slug>/config.vox.json` (no Flux call) |
| `TO_TEXT` | 2 rounds used, or the book's 60 calls | type → `statement` / `quote` / `question` / `stat` / `list` (what the narration is), `image: null`, kicker / emphasis from the narration, `storyboard.concreteVisual` = the text it shows |

Example (north-woods beat-123, a mansion refused 3/3) → "a weathered front door of an old colonial house, peeling
paint, ivy, a long handwritten list pinned to it" (same meaning: the house and its burden, no person).

## 4. Stops (the only ones)

- `status` / preview-state `FLUX_ACCOUNT` (exit 4): HTTP 401/402/403, quota or credits — the key is the operator's.
  Report the recorded error line; never print the key.
- After a batch that failed everywhere with no filter verdict, `run` sends ONE probe call. If the probe fails too,
  that is a technical stop (Flux down): report it with the `last error` line; retry later, never convert beats for it.

## 5. After recovery

- The config changed: a sealed mute holdout no longer covers it — `preview-state.js status` names the fresh label.
  Never re-test the frames you fixed (invariant 3).
- Hand-off (antidote-quality-handoff / preview-hazirla §5) lists: beats recovered, beats converted to text (with
  why), Flux calls spent / 60.
