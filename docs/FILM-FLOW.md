# Film Flow — versions

How a film MOVES and what it SHOWS, behind `config.meta.flow` (src/engines/antidote/flow.ts). A config without the
field renders exactly as it always did; a level is only ever set by the planner / a pipeline step for a NEW book.
Published books are frozen.

| Version | `meta.flow` | What it adds | Status |
|---|---|---|---|
| Film Flow 1.0 — living characters | ≥ 1 | The narration's word timings drive mouth, head, brows and hand strokes (`speech.ts`); glances and weight shifts instead of sine loops; gestures with anticipation and overshoot (`movements.ts` `livePose`). | Built, dev. Measured effect small (SSIM 0.97–0.98 against today's film). Not switched on by any pipeline step. |
| **Film Flow 2.0 — told stages (told v1)** | ≥ 2 | The picture shows what the narration names: emblems, people and the book's own drawings on one kept stage, with what happens to them landing on the narrator's words (`told.ts`, `components/ToldStage.tsx`; authored as `told` beats, compiled by `scripts/lib/told-compile.js`, applied by `scripts/told.js`, make-book step 1.886). | **Production for new Antidote books** (operator, 2026-11-14). |
| **Film Flow 3.0 — the book's own drawings (told v2)** | ≥ 2, stage `v: 2` | A named thing of any kind is shown as a drawing made for this book (emblem = fallback); a drawing has states (`change` + `state`, sticky); a person holds / gives / takes a drawing; the stage is AT a place (`stage.at`, backdrop). Drawings are linted, printed one per file and named blind before merge (`scripts/lib/own-drawings.js`, `own-icons-sheet.js --judge`). | **Production for new Antidote books** (operator, 2026-11-17, after two rounds of clips). |
| **Film Flow 4.0 — people play the verb (told v3)** | ≥ 2, stage `v: 3` | `{ do: "act", who, verb, target? }`: the person does what the narration says, on the word — 13 verbs, each one gesture with a preparation, a moment and a rest (`toldActs.ts`), the other's reaction, the desk and the thing for a seated typist; a person's signature (`look`, `holds`, `carries`) and the blind "who is this?" gate (`cast-sheet.js`); merge warning for a person on stage with nobody doing anything. | **Production for new Antidote books** (operator, 2026-11-17, after two rounds of clips). |
| **Film Flow 5.0 — the book's own cast (told v4)** | ≥ 2, stage `v: 4` | A person's `look.drawn`: a head and a garment drawn for THIS book on the rig (the rig keeps eyes, brows, mouth, limbs); lint + generated brief; the same head in the figure scenes between the stages; the blind "who is this?" gate unchanged. | **Production for new Antidote books** (operator, 2026-11-17, after the ESKI / YENI clips). |
| **Film Flow 6.0 — the book's own world, slice 1: places** | any (figure scenes: `bg.own`) | A beat that is not told names `place`: the book's own drawing of that place is drawn behind the cast instead of the shared set, where a told stage draws it. Merge warns when a book drew its places and most figure beats use none; `told.js status` reports the film time at a place the book drew. | **Production for new Antidote books** (operator, 2026-11-17, after the ESKI / YENI clips). |
| **Film Flow 6.0, slice 2: things — one vocabulary** | any (figure scenes: a `customSvg` prop) | A thing drawn in `entities.json` is also an own icon of the beats that are not told (`"concept": "<entity id>"`); the lead agent draws the book's recurring ideas as this book's thing. `told.js status` reports own against shared-library icons; merge warns when the library carries the figure beats. | **Production for new Antidote books** (operator, 2026-11-17, after the ESKI / YENI clips). |
| **Narrative form (Step 0) + form track** | book.json `form` → `meta.form` | The book is TOLD in one of 8 forms (`scripts/lib/narrative-form.js`); the film's top band draws the announced parts in that form's shape (`FormTrack.tsx`). | **Production for new books** (operator, 2026-11-18). Recording length of a formed prompt not yet proven — AGENT_LOG 2026-11-18. |
| **Form boards** | `meta.form` with ≥ 3 announced parts | When a part is announced its board comes up for ~3 s (`FormBoard.tsx`: 8 objects, one per form) carrying the book's own drawings where a part's title names one (`told-apply.js` `formArt`). | **Production for new books** (operator, 2026-11-18). |
| **Told for books of ideas** | told stages (layout `flow`) | `told.js entities` lists the book's own TERMS (said in many scenes, not by the other films) as candidates for drawn ideas with states; layout `flow` stages two to four of them as one mechanism with arrows. | **Production for new Antidote books** (operator, 2026-11-18). |
| **The book's home** | `entities.json` place with `"home": true` | One drawn place stands behind every told stage that names no place and every figure scene in a nowhere-set (none / abstract / office / room) that names none. | **Production for new Antidote books** (operator, 2026-11-18). |

## Film Flow 6 — the book's own world, slice 2: THINGS (2026-11-17)

- **Why (dracula, measured):** 53 of the 130 scenes that are not told show a concept icon, and all 53 came from the
  shared library (law ×6, shield ×5, balance ×5, medical ×5 …) — while the book's own drawings (the ship, the earth
  box, the typewriter) could only be used on a told stage. Two vocabularies; the generic one did the figure scenes.
- **What — one vocabulary:** a thing with `paths` in `storyboard/entities.json` is also an own icon under its entity id
  (`own-drawings.js` `iconsOfEntities` / `ownIcons` = those + `motifs.json`, the per-book file wins). The storyboard
  vocabulary (`storyboard.js` `ownMotifs`) and the director (`antidote-director.js`) read that one list, so an author
  writes `"concept": "<entity id>"` and the same drawing stands beside the cast (a `customSvg` prop: data, no engine
  code). Nothing is converted on its own: the authored concept decides.
- **For the lead agent:** the drawing brief now says to draw the book's recurring IDEAS as THIS book's thing (not
  "law" but the deed; not "medical" but the transfusion flask). **Reported, never refused:** `told.js status / apply`
  print own against shared-library icons; merge warns once when the library carries the figure beats.
- **Measured (dracula, scratch copy):** seven things drawn (deed, manifest, transfusion flask, crucifix, pocket watch,
  kukri knife, telegraph pole), 7 of 7 named blind as intended on the first drawing; 20 of the 53 beats were about
  one of them → shared-library icons 53 → 33. The other 33 are metaphors (balance, war, mask) nobody drew a book's
  version of. In that copy the config prop was rewritten to what the director emits for an own icon; no re-plan.

## Film Flow 6 — the book's own world, slice 1: PLACES (2026-11-17)

- **Why (dracula, measured):** 46 % of the film's time were figure scenes in 11 shared sets (Dracula stood in "office"
  33 times); the told stages had a drawn place behind them for 2 % of the film's time (4 of 147 beats wrote `at`).
- **What:** a beat that is NOT told may name `"place": "<place id>"` — a place of `entities.json` with a drawing. `told.js
  apply` writes that drawing (the place's `backdrop`, or its own paths; the book's colours) to the scene's `bg.own`
  (`told-apply.js` `applyPlaces`), and `Backdrop.tsx` draws it INSTEAD of the shared set — at the same spot and size as
  behind a told stage (`backdropFit`), so the place holds across the cut; one layer, no ambient drift. The authored
  `set` stays in the config and in the lock. Told stages are unchanged (their place is the stage's `at`).
- **Not a told version:** no told stage is drawn differently; `bg.own` is optional and absent in every earlier config.
- **Reported:** `told.js apply / status` print "film time at a place the book drew". Report only — no threshold.
- **Measured (dracula, scratch copy):** four more places drawn (harbour, asylum, bedroom, ruined chapel), all six named
  blind as intended (the asylum needed one redraw: "large manor" → "hospital building"); film time at a place the book
  drew 2 % → 61 %. In that copy the place of each beat was assigned from the narration's own words by a script standing
  in for the storyboard author.
- **Next slices:** the 53 library props of the figure scenes as the book's own drawings; an own-share report over
  everything on screen; a cross-book similarity guard; the book's recurring events.

## Told v5 — the place is a SCENE (Film Flow 7, slice 1: scene backdrops, 2026-11-21)

- **Why (measured, dracula, the first real book):** the picture adds to the narration in 19 of 24 mute-test frames but
  explains the event by itself in 1 — a told stage was a labelled diagram: the cast in a row with name plates, the
  place a pale one-tone wash (`BACKDROP_OPACITY` 0.26). The first trial (opacity 0.62, a ground line at the lowest feet,
  shadows under every figure; stills `Downloads/film-flow-told/sahne-v5-ilk-deneme`) only made the stage dark: the ink
  silhouettes swallowed the title, the black name plates and the black-clad Count; the ground ran under a figure walking
  at mid-stage. A place cannot be made real by opacity — it has to be DRAWN as a scene.
- **What:** a place's `backdrop` in `storyboard/entities.json` may carry `"sky": "<hex | token>"` and
  `"ground": "<hex | token>"`. `own-drawings.js` lints it as a scene (`RULES.skyLuminance` 0.5, `groundContrast` 0.15,
  `skyBand` 0.25 — the upper band holds no path, `washShare` 0.85 — no path covers the box, `midLuminance` 0.1 — no big
  ink mass above the ground strip: the cast is drawn in ink and vanished against an ink castle); `resolveEntities` carries
  both to the stage as hex (ground defaults to the ink) and into the drawing's hash; `told-compile.js backdropOf`
  writes them on the stage's backdrop. A backdrop without `sky` is written and drawn exactly as before.
- **Renderer** (`ToldStage.tsx`, one SVG, nothing moves): on a `v >= 5` stage a backdrop with `sky` is drawn at FULL
  presence — the sky behind the whole stage, the ground band from the backdrop's bottom edge (`told.ts backdropScene`:
  870 for the wide box) to the bottom of the frame, a contact shadow under a figure whose feet are on that ground
  (`standsOn`, 60 px reach — a figure at mid-stage is in the middle ground and throws none). `TOLD_VERSION` 5; a v ≤ 4
  stage never carries `sky` and is drawn as it was; both golden fixtures and dracula's 179 stages compile byte-identical.
- **Authors' guide:** told.md "The place is a SCENE"; `drawingGuide` (entities.candidates.json "drawing"); the sheet
  (`own-icons-sheet.js`) prints a scene backdrop on its sky with its ground continued, as the engine does.
- **Slice 2 — the cast IN the place (2026-11-21):** a scene backdrop may carry `spots` (1-6 standing places in the
  drawing's units with a depth scale; lint: on the drawn ground, inside the box). On a stage at that place the compiler
  (`told-compile.js arrange`) puts the people of an arrangement at the spots in `who` order (`told.ts spotsOf` → frame
  coordinates; `fitS` still keeps the plate under the title band), turns them towards the middle of their group, stands
  a person beyond the spots — or in a scene without spots — on the ground line (never at the flow line), and draws the
  place itself, when listed in `who`, as its name on a SIGN (`word` + box at y 830) instead of an emblem tile. Carried
  people are `known` (`V5S` books only): `ToldStage` draws their plate at 0.8 / 0.72 around its centre. The renderer
  also shadows a figure whose feet are on a spot. `setPlace` now runs before `arrange` in a `stage` (output-neutral).
  Old books: no scene backdrop → no spots, no `known`, no sign — byte-identical (goldens, dracula 179).
- **Slice 3 — things on the ground, the camera at the event (2026-11-21):** on a scene stage an emblem stands at
  `SCENE_EMBLEM_Y` 670 (plate bottom on the feet line) instead of 470; `camTo` pushes the camera ×1.15 (`SCENE_PUSH`) on
  the people and things of an `act` or a `throw` / `drop`, landing near the word with the feet kept above the subtitle
  band; `arrange` on a scene stage opens wide again (snap at frame 1 for a cut, a 20-frame ease within a beat). Scene
  stages only; old books byte-identical.
- **Not yet:** the sky / ground on a figure scene's `bg.own` (`Backdrop.tsx` still draws the wash); a stage that changes
  place mid-beat re-seats nobody (the next arrangement does); icons (own drawings) keep their generic height — only
  emblems moved. Test: `test-told-scene.js`.

## Told v4 — the book's own cast (Film Flow 5, 2026-11-17)

- **Why:** the foundry dresses one rig from one wardrobe, so every book's people were the same face in another coat
  (dracula, blind "who is this?": 5 of 8 as authored; the cloak read "robe", the cowboy hat "fedora").
- **What:** a person's `look.drawn` in `storyboard/entities.json` — `{ back, face, hair, top, cape, body }`, each a
  list of paths in the rig's own units (`schema.ts` → `drawnCast`). The rig (`characters/Everyman.tsx`) keeps the
  eyes, brows, mouth, neck and limbs and animates them; any head layer replaces the wardrobe's hair, beard and
  headwear. Colours by token (`skin hair suit shirt` = the person's own, plus the book's palette) or hex.
- **Version:** `TOLD_VERSION` 4. `ToldStage` reads `variant.drawn` only when `v >= 4`; a v1 – v3 stage is drawn as
  it was (both golden fixtures unchanged — `test-own-cast.js`).
- **Lint** (`own-drawings.js` `lintCast`, run at prep through `peopleProblems`): layers known, paths inside the head /
  body box, a filled `top` shape never on the eyes or the mouth, a drawn `face` holds them, ≥ 3 paths / 14 commands.
  The brief the lead agent draws from is generated from the same numbers (`castGuide` → entities.candidates.json "cast").
- **One person, one head:** `told.js apply` gives a cast member with the same id the same look in the figure scenes
  between the stages (`told-apply.js` `castHeads`; the planned cast is kept in `meta._castBeforeTold`, `revert` restores it).
- **Seen blind:** unchanged gate — `cast-sheet.js`, one fresh agent per picture, `--judge`; the verdict is bound to the drawing.
- **Measured (dracula, scratch copy):** 7 of 8 read as intended ("pale vampire in high-collared red-lined cape",
  "mustached man in cowboy hat"); Renfield's straitjacket read "tattered tunic" — a garment over the `rags` outfit is not enough.
- **Not yet:** side / three-quarter stance; a drawn body silhouette (the torso is still the wardrobe's).

## Told v3 — people play the verb (2026-11-17)

- **Version:** `TOLD_VERSION` 3. A figure carries `act: { verb, at }` (`at` = the stage frame of the narrator's word)
  and `ToldStage` reads it only on `v >= 3`. Only an `act` event (or a person's `carries`) produces anything new: the
  v1 and v2 golden passages (`fixtures-told-v1.js`, `fixtures-told-v2.js`) and dracula's 147 v2 stages compile to
  identical items.
- **Verbs (11):** `VERBS` in `told-compile.js` (what each needs), `toldActs.ts` (the poses: `hit` / `struck`, `bite` /
  `bitten`, `hide`, `dig`, `type`, `write`, `read`; `chase`, `come`, `fall`, `point` use the rig's own run, walk,
  falling / collapsed, point). `look` / `meet` were verbs in the first cut and were taken out: read by nobody.
- **Round 2 (operator's list):** the name plates of two people in contact are stacked (`labelDy`, read on `v >= 3`);
  the seated person is drawn as large as the stage allows, desk at lap height, plate and crown down with the head; a
  seated person who is re-arranged gets up first (the desk slid with them); one verb per person per beat (merge);
  `come` to a place is a merge warning; the verb table in `rules.md` carries the measured readability
  (`VERB_MEASURED` in `told-rules.js` — update it with every blind test).
- **Measured (dracula, scratch copy, blind):** "what is this person doing?" on 14 seeded-random act moments: 3 → 8 of
  14 on the frame where the verb is played (3 → 4 on the frame after it has ended: a walk that is over is a person
  standing); random 30 frames ADDS 15 → 19, WRONG 0; a person on stage and nobody doing anything: 102 → 52 of 147
  told beats after the authors' pass (→ 67 once the glance verbs were taken out); people seen as intended 5 → 8 of 8. Nothing loops: typing is ten key strokes, digging three thrusts, then rest.
  Over a cut a person is at rest in their verb; a new `stage` stands them up.
- **Why:** dracula's told authors wrote `action: "typing" | "read" | "write"` — not actions of the rig, so people
  stood (16 such events; a person on stage and nobody doing anything in 102 of 147 told beats).
- **People:** `reads` + `look` / `holds` / `carries` on a person; `cast-sheet.js` (cloud stills, one picture per
  person, no name) → blind "who is this?" → `own-people.verdict.json`; prep refuses twins, merge refuses a told
  beat with a person nobody could tell (only for a book that has taken up the test: some person has `reads`).

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

## The book's graphic hand (book skin, 2026-11-18)

How the subtitles are set, how a name plate is cut and which typeface speaks are chosen once per book at Step 0
(`scripts/lib/book-skin.js`, farthest from the last eight books) and carried in `config.meta.skin`;
`src/engines/antidote/components/skin.tsx` draws them. A config without a skin has the channel's old look. The skin
never moves or resizes a word, and an author never sets it per scene.
