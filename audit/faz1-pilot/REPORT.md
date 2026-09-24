# Faz 1 pilot — We Were Liars, first 90 seconds, authored storyboard

**Question:** if every beat is authored as a storyboard (claim / concrete visual / on-screen
text / relation to previous shot / added information) and run through the EXISTING Antidote
engine, does a muted viewer understand the narration — and does the picture add anything?

## Setup
- Pilot book: `books/we-were-liars-pilot/` (own slug so the real WWL config is untouched).
  `art.json` holds the 10 authored beats, each with a `storyboard` block. Story bible is a
  copy of WWL's with `+magnifier` and the Plato leftovers `cave`/`agora` removed.
- Gates on the pilot: authorship PASS · narrative firewall PASS (0 violations) · screen-text
  PASS · dead-air PASS (worst gap 3.67s) · hard-gate GREEN.
- Mute test: one still per scene at 70% of its duration, caption band cropped, order shuffled.
  Two separate blind agents (image only) described the pilot frames and the SAME timestamps
  from the current WWL config. A third agent judged both against the narration with the sets
  labelled X/Y (key in `judge-key.json`: pilot = X).

## Result (N = 10 frames per arm)

| | CORRECT | NEUTRAL | WRONG | image ADDS information |
|---|---|---|---|---|
| **Pilot (authored)** | 8 | 1 | 1 | 9 / 10 |
| Current WWL (heuristic) | 1 | 6 | 3 | 1 / 10 |

- Baseline WRONGs: cheerful face over the deaths, a heart where the narration rejects the
  romance reading, the 0:55 smartphone. Its NEUTRALs are empty navy circles/ovals and bullseyes.
- Pilot WRONG: 7.6s — a smiling suited presenter next to the fire (title expression was
  hard-coded `happy`). **Fixed** (expression follows the beat). The presenter rig still reads
  as a generic businessman — a cast problem, see gaps.
- Pilot NEUTRAL: 27s "architecture ... built on aesthetics" -> a generic suburban house. The
  library has no estate/aesthetic object.

## Defects the pilot found (fixed in this commit)
1. `plan-antidote`: the art file's `set` was never applied; emit-file `shot` was
   informational yet looked editable. Now `set` is honoured, framing via `shotOverride`.
2. `antidote-chapter-arcs`: with no authored chapters it invented "PART 02" cards every ~160s
   and stamped them over an authored beat; its turn-beat rule forced `split` on authored
   beats; chapters after the film's end snapped onto the last scene. All three fixed.
3. `KineticText` strike: a phrase that wraps got ONE bar between the lines -> read as an
   underline (emphasis), the opposite of a strike. Now one bar per word.
4. Title cast expression hard-coded `happy`.

## Caveats
- 10 frames per arm is an approval sample, not a measurement. The pre-registered bar for the
  full book: >= 30 stratified scenes, WRONG <= 1/30, image-adds >= 60%.
- The judge was generous on two ADDS (magnifier conveys "examination" but not "aristocracy";
  the coin says "money" but not "old"/"Boston"). The authored storyboard itself flagged these
  as weak.

## What the pilot says about the next phase
- Authoring, not engine cleverness, moved the score (1 -> 8 correct) with zero new art.
- The remaining ceiling is the **vocabulary**: 3 of 10 beats were limited by the generic icon
  library (house for "estate", coin for "old money", magnifier for "autopsy") and the presenter
  rig. That is Faz 2 — a per-book asset kit (Beechwood Island, Clairmont, the Sinclair crest,
  Cadence as the on-screen narrator).
