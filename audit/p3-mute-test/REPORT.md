# Phase 3 — Blind Vision Mute Test (show-your-work)

**Date:** 2026-09-23 · **Book:** `show-your-work` (all make-book gates green @ `ddf6a8c`/`97d524e`)
**Question:** when every deterministic gate says PASS, how often is the frame visually wrong?

## Protocol

- **Population:** all 240 scenes of the only book that passes every new gate (hard-gate 1–11,
  firewall, screen-text, composition integrity).
- **Sample:** 30 scenes, stratified random (seed `20260923`) across composition kinds:
  diagram 5 · icon+text 8 · icon 4 · text 8 · silent 3 · chapter card 2; shuffled order.
  (`sample.json`)
- **Frame:** the moment the scene's copy/diagram is fully on screen (≥60% of the scene, or the
  last callout/diagram `at` + 45/100 frames).
- **Blind:** stills copied to `blind/S01..S30.png` with the **caption band cropped** (captions are
  the narration — they would give the answer away). A separate evaluator agent saw only those
  images + the book title, and wrote what idea each frame conveys to a muted viewer
  (`blind-descriptions.json`).
- **Judgment:** each blind description vs. the scene's narration →
  - **GOOD** — a muted viewer gets the narrated idea (at least its direction).
  - **WRONG** — the frame shows something unrelated/contradictory, or nothing at all on a beat
    whose narration has a visualizable claim.
  - **UNCERTAIN** — on-topic but too weak/abstract to carry the claim, or a connective line
    with a neutral frame.
- 1 sample excluded (S26: the chosen frame fell inside the outgoing transition — a sampling
  artifact, not a video defect). **N = 29.** (`results.json`)

## Result

| | count | % |
|---|---:|---:|
| GOOD | 16 | 55% |
| UNCERTAIN | 7 | 24% |
| **WRONG** | **6** | **21%** |

**Gate PASS → Vision WRONG: 20.7%** (6/29). Baseline for comparison: P1.5 measured **6/6 = 100%**
on the old gate; P2.2 could not measure at all (0/933 scenes passed).

### By composition kind

| kind | GOOD | UNCERTAIN | WRONG |
|---|---:|---:|---:|
| diagram (authored) | 5 | 0 | 0 |
| text-only callout | 6 | 2 | 0 |
| chapter card | 1 | 0 | 0 |
| icon + text | 3 | 4 | 1 |
| icon only | 1 | 0 | **3** |
| silent (talking head) | 0 | 1 | **2** |

The authored words work. **Every WRONG comes from icons chosen by the engine, or from silent
beats.**

### WRONG / UNCERTAIN taxonomy

| class | n | samples |
|---|---:|---|
| subject mismatch | 2 | S07 phone on "Eno **calls** it…", S25 archery target on "process over product" |
| salience problem | 3 | S05, S08, S28 — talking head on a visualizable claim |
| outcome polarity | 1 | S11 "SAVE AS DRAFT" + notes → **fire** reads "burn your drafts" |
| metaphor too generic | 4 | S04, S22, S23, S24 — abstract phrase, nothing drawn |
| metaphor too literal | 1 | S03 clean coffee mug for the coffee-stain anecdote |
| action mismatch | 1 | S18 confused figure pointing at sky under "THE STUDIO INSIDE OUT" |
| no visualizable claim | 1 | S13 connective line |

## Root causes (traced in code)

1. **`concept: null` does not mean "no icon".** The director only treats `""`/`"none"` as off
   (`scripts/lib/antidote-director.js` ~909); `null` falls through to the lexicon, contradicting
   the `--emit-beats` contract ("set null to force talking heads"). Hence S07 (lexicon: "calls" →
   phone), S25 (target), S28 (book), and the stray icons in S15/S18/S22.
   → **3 of 6 WRONG + 3 noisy GOODs/UNCERTAINs.**
2. **Engine opposite on an authored concept.** An authored `notes` on a "contrast" beat
   auto-expands to a before/after with `OPPOSITE.notes = "fire"` → polarity inversion (S11).
3. **Authored silence on visualizable beats** (S05 cabinet-of-curiosities objects, S08) — my
   authoring misses. No deterministic gate can catch these; only this test did.
4. **Abstract text-only metaphors** ("A SWAMP OF IDEAS", "A LOGIC FILTER", "GROUNDED IN
   REALITY") pass every gate but do not carry the claim when muted.
5. Layout nits the evaluator flagged (not counted as WRONG): spectrum/flow drawn on the
   chalkboard's bottom edge with labels hanging below; diagram titles that promise a shape the
   diagram type can't draw ("LOOP", "PYRAMID" on a straight flow); strike line crossing
   letters; text and icons overlapping the HUD or chalkboard.

## Recommended fixes (next step — would move 4 of 6 WRONG)

- Director: authored `concept: null` = no icon (align code with the documented contract).
- Director: no automatic before/after opposite for an **authored** concept.
- Authoring rule + audit: a beat whose narration names concrete objects/people (a list, an
  anecdote) may not be silent; abstract metaphor callouts need a drawn metaphor or a
  plainer phrase.
- Diagram: labels inside the board; titles must not name a shape the type can't draw.
- Then re-render the same 30 scene IDs (fixed seed) and re-measure: target WRONG ≤ 10%.

## Files

`sample.json` (sample + narration + on-screen spec) · `blind/` (evaluated images) ·
`stills/` (full frames) · `blind-descriptions.json` · `results.json` (verdicts + metrics).
