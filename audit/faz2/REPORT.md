# Faz 2 — staging + icon fixes: We Were Liars passes both mute-test bars

Same 30 stratified timestamps as `audit/faz1-full` (seed 20260924), same protocol: caption band
cropped, shuffled, blind describer (image only), judge with the narration and a per-item X/Y
coin flip. Each comparison below is ONE judge scoring BOTH versions — judges differ by about ±4 on
the same frames, so compare within a row pair, not across judges.

| comparison (one judge each) | version | CORRECT | NEUTRAL | WRONG | image ADDS |
|---|---|---|---|---|---|
| faz1-full judge | baseline (old heuristic) | 4 | 17 | 9 | 4/30 |
| | Faz 1 (authored icons + callouts) | 28 | 2 | 0 | 10/30 |
| faz2 judge | Faz 1 | 24 | 5 | 1 | 11/30 |
| | Faz 2 (staging, figures still silhouettes) | 26 | 4 | 0 | 19/30 |
| faz2b judge | Faz 2 | 27 | 3 | 0 | 17/30 |
| | **Faz 2b (staged figures drawn as people)** | **27** | 3 | **0** | **21/30 (70%)** |

Pre-registered bars: WRONG ≤ 1/30 ✅ (0) · image adds ≥ 60% ✅ (70%).

## What changed
1. **Icon drawings that contradicted their meaning** (`src/engines/antidote/motifs.tsx`):
   `chains` snapped at frame 18 in every book (read "breaking free") — now intact unless
   `arc: "break"`; `mirror` (oval + diagonal bar ≈ a prohibition sign) — redrawn as a framed
   mirror with a reflection; `magnifier` carried a "?" (read "mystery") — now magnified lines.
   New `inheritance` icon (sealed will) — the gift box read as a birthday present.
2. **Staging from the art file** (`plan-antidote.js`): `cast` (which book characters are on
   screen), `expression`, `action`, `holds` for the lead — validated against the renderer enums.
   A staged lead on an illustration/diorama beat is drawn as the person, not the black cut-out
   (the silhouette hid exactly the authored face, object and identity).
3. **The book's missing people:** WWL's cast had no Penny, Carrie or Bess — the three mothers
   whose inheritance war is half the narration. Added to the story bible with looks.
4. **Re-authoring pass:** 5 parallel authors staged all 195 beats (who / face / body / object),
   and re-checked icon-less beats: +28 honest icons (e.g. "desperate for the Boston house" → home).

## Still text-carried (6/30)
Diagrams (labels by nature), a chapter card, a struck-through phrase, and "power structure
unchanged" — abstract claims with no object. Three NEUTRALs: gestures at a house / at nothing.
Next ceiling: per-book objects (Clairmont, the lawn) and multi-figure action.
