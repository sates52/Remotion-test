# Film Flow — versions

How a film MOVES and what it SHOWS, behind `config.meta.flow` (src/engines/antidote/flow.ts). A config without the
field renders exactly as it always did; a level is only ever set by the planner / a pipeline step for a NEW book.
Published books are frozen.

| Version | `meta.flow` | What it adds | Status |
|---|---|---|---|
| Film Flow 1.0 — living characters | ≥ 1 | The narration's word timings drive mouth, head, brows and hand strokes (`speech.ts`); glances and weight shifts instead of sine loops; gestures with anticipation and overshoot (`movements.ts` `livePose`). | Built, dev. Measured effect small (SSIM 0.97–0.98 against today's film). Not switched on by any pipeline step. |
| **Film Flow 2.0 — told stages (told v1)** | ≥ 2 | The picture shows what the narration names: emblems, people and the book's own drawings on one kept stage, with what happens to them landing on the narrator's words (`told.ts`, `components/ToldStage.tsx`; authored as `told` beats, compiled by `scripts/lib/told-compile.js`, applied by `scripts/told.js`, make-book step 1.886). | **Production for new Antidote books** (operator, 2026-11-14). |

## Told v1 — the contract

- **Authored:** `books/<slug>/storyboard/entities.json` (the named things, once) and `told` on beats of
  `authored-N.json` → `art.json`. Guide: `.claude/skills/antidote-visual-authoring/told.md`; vocabulary: the book's `rules.md`.
- **Compiled:** `scripts/lib/told-compile.js` (`TOLD_VERSION` in `told.ts`; a stage carries `v`). Layouts: solo, versus,
  row, court, pairs. 28 events. The stage is carried from beat to beat; what belongs to a thing moves with it.
- **Applied:** `scripts/told.js apply` writes `scene.told`, keeps the replaced picture in `scene._beforeTold`, reseals
  the authorship lock (`_authorship.src = "told"`, `previousLock` kept) and raises `meta.flow` to 2. Reversible:
  `told.js revert --write`.
- **Judged:** name coverage (`told.js status`, `film-flow.js`), before / after clips drawn like the film
  (`flow-passage.js`, manifest `gl: "default"`), `flicker-check.js`. Gates that know a told scene: stagnation,
  novelty, composition integrity, dead-air audit, screen text, readcheck, mute test, framecheck.

## Changing it

- A new event, layout or item kind: `told-compile.js` (+ `told.ts` / `ToldStage.tsx` when it must be drawn), the row in
  `told-rules.js` `EVENT_HELP`, a test in `test-told-compile.js`. The rules text is generated — never hand-edit a book's `rules.md`.
- A change that alters how an existing told stage is DRAWN is a new told version: bump `TOLD_VERSION`, keep drawing
  `v: 1` stages as they were, record it in the table above and in `AGENT_LOG.md`.
- Evidence before shipping a change to how films look: the same passages before / after as clips, `flicker-check`,
  the flow table — and the operator's eye.

## History

- 2026-11-12 — slice 0 (yardstick) and slice 1 built; operator: the motion polish is beside the point, the picture
  must show what the VTT says.
- 2026-11-13 — pilots by hand (zero-to-one, the-creative-curve); operator approved. The trembling he saw was the
  preview pipeline's `gl: "swangle"` (stale picture tiles), not the stage: clips now render like the film.
- 2026-11-14 — authoring language, compiler, pipeline step, gates, skill for every harness: production for new books.
