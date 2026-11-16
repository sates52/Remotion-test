# Film Flow — versions

How a film MOVES and what it SHOWS, behind `config.meta.flow` (src/engines/antidote/flow.ts). A config without the
field renders exactly as it always did; a level is only ever set by the planner / a pipeline step for a NEW book.
Published books are frozen.

| Version | `meta.flow` | What it adds | Status |
|---|---|---|---|
| Film Flow 1.0 — living characters | ≥ 1 | The narration's word timings drive mouth, head, brows and hand strokes (`speech.ts`); glances and weight shifts instead of sine loops; gestures with anticipation and overshoot (`movements.ts` `livePose`). | Built, dev. Measured effect small (SSIM 0.97–0.98 against today's film). Not switched on by any pipeline step. |
| **Film Flow 2.0 — told stages (told v1)** | ≥ 2 | The picture shows what the narration names: emblems, people and the book's own drawings on one kept stage, with what happens to them landing on the narrator's words (`told.ts`, `components/ToldStage.tsx`; authored as `told` beats, compiled by `scripts/lib/told-compile.js`, applied by `scripts/told.js`, make-book step 1.886). | **Production for new Antidote books** (operator, 2026-11-14). |
| **Film Flow 3.0 — the book's own drawings (told v2)** | ≥ 2, stage `v: 2` | A named thing of any kind is shown as a drawing made for this book (emblem = fallback); a drawing has states (`change` + `state`, sticky); a person holds / gives / takes a drawing; the stage is AT a place (`stage.at`, backdrop). Drawings are linted, printed one per file and named blind before merge (`scripts/lib/own-drawings.js`, `own-icons-sheet.js --judge`). | Built on `dev/own-drawings` (2026-11-16); waits for the operator's eye on the clips. |

## Told v2 — the book's own drawings (2026-11-16)

- **Version:** `TOLD_VERSION` 2. What v2 adds is carried by fields a v1 stage does not have (`backdrops`, an icon's
  `state`, `*.held` items) and `ToldStage` reads `backdrops` only on `v >= 2`: a stored `v: 1` stage is drawn as it was.
  **A told-v1 book compiles to exactly the told 1.2 stages**: the v2 layout rules below apply only to a book whose
  entities carry a v2 drawing (`reads` / `states` / `backdrop` / `motif`). Measured: the golden fixture
  (`test-own-drawings.js`), dracula as authored 147 of 147 stages, zero-to-one 10 of 10 — identical.
- **v2 layout (round 2, 2026-11-17, from the operator's list on the first clips):** a label under a drawn thing never
  lies on its name plate (the thing rises; the label follows a `grow`; a drawing grows only as far as the stage lets
  it); a name plate is as wide as its name (`plateW`, stage `plate: "fit"`) and stays in the frame; a timeline keeps
  the things in the middle at reading size with the line under them; a change of stage is one thing at a time (who
  leaves is gone, then the others move, who stays comes back from a `dim`); a stamp / cover leaves before its thing
  moves; a held drawing sits in the hand of the rig's `hold` pose; a state change is a knock and a 12-frame change
  landing on the word; a person who changes while walking arrives.
- **Entities:** `paths` (or `motif`: an own icon of `motifs.json` — one source) on any kind; `reads`; `states`;
  `backdrop` on a place. Colour tokens are the book's palette. Lint numbers: `RULES` in `own-drawings.js`.
- **Gate:** prep refuses a drawing that is not one; merge refuses a told beat that uses a drawing without a passing
  blind-naming verdict for the drawing as it is now (`storyboard/own-drawings.verdict.json`, bound to hash + readings).
- **Events:** `change` + `state`; `change` + `holds: <drawn thing>`; `give` (who: [from, to], what); `take`; `at`.
- **Measured (dracula, scratch copy, authored beats unchanged except 9 re-authored in the clip passages):** things on
  told stages shown as the book's own drawing 41 % → 79 %; drawings named blind as intended 12 of 12 (10 of 12 on the
  first pass); stages with a thing on a thing / under the subtitle line 15 → 4.
- **Not in v2:** the engine's library icons on a told stage; fingers closing on a held drawing; a state change drawn
  as its own animation (it is a knock and a cross-fade).

## Told v1 — the contract

- **Authored:** `books/<slug>/storyboard/entities.json` (the named things, once) and `told` on beats of
  `authored-N.json` → `art.json`. Guide: `.claude/skills/antidote-visual-authoring/told.md`; vocabulary: the book's `rules.md`.
- **Compiled:** `scripts/lib/told-compile.js` (`TOLD_VERSION` in `told.ts`; a stage carries `v`). Layouts: solo, versus,
  row, court, pairs. 28 events. The stage is carried from beat to beat; what belongs to a thing moves with it.
- **Applied:** `scripts/told.js apply` writes `scene.told`, keeps the replaced picture in `scene._beforeTold`, reseals
  the authorship lock (`_authorship.src = "told"`, `previousLock` kept) and raises `meta.flow` to 2. Reversible:
  `told.js revert --write`.
- **Judged:** name coverage (`told.js status`, `film-flow.js`), before / after clips drawn like the film
  (`told-clip.js` = `flow-passage.js --full --keep-flow` + cloud render + `flicker-check.js`). Gates that know a told scene: stagnation,
  novelty, composition integrity, dead-air audit, screen text, readcheck, mute test, framecheck.

## Told 1.1 — the first real book's lessons (2026-11-16, dracula)

Authoring-side only: the drawn format is unchanged (`TOLD_VERSION` stays 1).
- **The stage lists exactly who is on it.** A new `stage` sends off whoever it does not name, with their labels and
  the old stage's rows.
- **Extras expire, things stay** (`TTL` in `told-compile.js`): a label lives its beat + the next; an effect its own
  beat; a stamp / cover / set of rows two more. Two labels per thing (a third replaces the oldest). Crown and world
  are states.
- **The screen-text gate reads a word where it is printed**: a tile or title that ENTERS in the scene. Kept items and
  name plates are not counted (they made 103 false `BOOK_REPETITION` findings).
- **Merge holds told words to the screen-text rules** (`told-rules.js` `checkToldBeat` → `checkString`).
- **Clips: `scripts/told-clip.js`** — one command, cloud, full HD, flicker-checked.
Dracula's authored beats, unchanged, through 1.1: screen-text findings 159 → 12 (all real wording problems), at most
6 labels on a stage (was 16).

## Told 1.2 — stage layout (2026-11-16, dracula's first clips)

Seen in the clips of the first real told book, all authoring-side (`TOLD_VERSION` stays 1):
- **A person fits under the title band**: feet → body → name plate → crown is one column; a tall or grown person is
  drawn smaller, never cropped; the crown sits above the name plate.
- **A label never leaves the frame or lies across a neighbour**: beside its thing on the free side (a person: at
  shoulder height); in a row with no free side it goes UNDER its thing, one per thing, neighbours on alternate lines,
  and people step up to leave a band above the subtitles. A label does not follow a thing that walks elsewhere and
  does not grow with it.
- **`enter`: everyone makes room; `arrange` is exact** (what it does not name leaves).
- **A timeline (`date`) lifts the things into a row of heads**; a newcomer joins the heads.
- **Marks on a person** (stamp, cross, burst) sit on the chest, a cover on the eyes; a push-in (`focus`) keeps the
  thing's foot above the subtitle band.
- Measured on dracula's 147 told stages (rest frame of each): stages with any overlap or a label off the frame
  85 → 2; thing over thing 30 → 0; label over another thing 129 → 2; label off frame 13 → 0.
- Also: blind-test readers accept a JSON file with a BOM; `stills-cloud.js` retries a network blip.

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
- 2026-11-16 — told 1.1 after the first real book (dracula, run by an Antigravity agent): see above.
