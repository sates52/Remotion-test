# Faz 1 — We Were Liars, full book authored as a storyboard: 30-scene mute test

## What was done
- All 195 beats authored in `books/we-were-liars/art.json` (beats 0-8 from the pilot, 9-194 by
  five parallel authors under one rule sheet, then merged, validated and reviewed by hand:
  10 callouts rewritten for the screen-text rules, 6 icons removed where they would mislead —
  e.g. a heart on "her heart rolls out of her rib cage", a trophy on "the only unforgivable
  weakness", a grave on "sterile modernism").
- Re-planned through `make-book --skip-pack`: every blocking gate PASS — authorship, narrative
  firewall (0 violations), screen-text (0/219), composition integrity, dead-air (worst 6.13s),
  hard-gate GREEN. 121 icons, 8 diagrams, 187 callouts.
- Engine defects the full book surfaced (fixed in the same commit):
  - `plan-antidote`: creative-bible palette mapped the icon accent to `primary`, which equals
    `ink` for this book → **every icon in the old WWL config was ink-on-ink (204/204 props = the
    "empty navy ovals" at 1:35)**. Accent now = bible `accent`, never equal to ink.
  - `hard-gate` Gate 9 "auto-repair" used HEURISTIC briefs' genre forbid list and swapped
    authored icons (coin → `spotlight`). Now only authored briefs are contracts.
  - Shot presets forced locations the book does not allow (silhouette → `sky`, diagram after a
    split → `none`); plan now falls back to an allowed placeless set.
  - Book-level: creative-bible set rotation was `office/room/stage` (an office in a novel about an
    island family) → `shore/room/horizon`; story bible lost the Plato leftovers `cave`/`agora`.

## Mute test (pre-registered bar: WRONG ≤ 1/30, image adds ≥ 60%)
30 scenes, stratified by the story bible's 5 acts (6 each, seed 20260924), one frame at 70% of
each scene, caption band cropped, shuffled. Two blind describers (image only), one judge with
the narration and a per-item X/Y coin flip (`judge-key.json`). Baseline = the previous WWL config
at the same timestamps.

| | CORRECT | NEUTRAL | WRONG | ADDS | TEXT_ONLY | NONE |
|---|---|---|---|---|---|---|
| **Authored (new)** | **28** | 2 | **0** | 10 | 18 | 2 |
| Baseline (heuristic) | 4 | 17 | 9 | 4 | 3 | 23 |

- **Correctness: PASS** — 0/30 wrong (baseline 9/30).
- **Contribution: FAIL** — the image itself adds meaning in 10/30 (33%); in 18/30 the callout
  carries it and the picture is a person standing there.

## Why contribution fails — the Faz 2 list, from the judge's own notes
1. **Talking heads.** Most TEXT_ONLY frames are two figures in a twoShot/overShoulder: the
   narration describes an ACTION (purging the house, the pristine lawn, the mothers parading the
   kids) and the rig can only stand. Needs staged action / book scenes, not more icons.
2. **Icon drawings that contradict their meaning:** `chains` is drawn broken (reads as
   liberation), `mirror` reads as a prohibition sign, `door` on "zero exit strategy" says exit,
   `gift` reads as a birthday present not an inheritance.
3. **No book-specific objects:** Clairmont, Beechwood, the lawn, the Boston house, the Sinclair
   crest do not exist in the library.

## Next
Faz 2 = per-book asset kit + action staging, measured with this same protocol (target: image adds
≥ 60% with WRONG staying ≤ 1/30). The four misleading icon drawings are a cheap first fix.
