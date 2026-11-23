# Told stages — the picture shows what the narration names (Film Flow 2, told v1)

Every harness reads this file (Claude Code, Antigravity, Cursor, Codex). It is the procedure for the lead agent of a
book and the craft guide for its storyboard authors. The book's generated `storyboard/rules.md` carries the exact
vocabulary (this book's named things, layouts, events) and wins where the two differ.

## Why

Measured on our films (2026-11-13): a scene whose narration names a company, a product, a person or a place put that
thing on screen in **13–31 %** of cases. The rest showed a figure and a text — "Microsoft … Google … Windows versus
Chrome OS" over a street and two unrelated people; "A TINY FOUR-YEAR-OLD" over two adults. The operator compared the
two forms on the same passages and chose this one: what the narration names is SEEN, and what the narration says
happens to it HAPPENS on screen, on the word.

A told stage is one drawing: the named things as **emblems** (the name in its own colour with a plain glyph for what
it is — never a copied logo), **people** (the engine's rig: any age, any dress, a name plate over the head) and the
book's **own drawings** (an animal, an object), plus what happens to them. The stage is kept from beat to beat.

## Lead agent — before the authors start (once per book)

1. `node scripts/told.js entities --slug=<slug>` → `storyboard/entities.candidates.json`: the proper names the
   narration says in two or more beats, and its years.
2. Write `books/<slug>/storyboard/entities.json` — the things a viewer should SEE. Keep the candidates that matter,
   fix ASR spellings (the label is what is printed), add what the list missed, drop noise.

   ```json
   { "microsoft": { "label": "MICROSOFT", "kind": "company", "glyph": "monitor" },
     "chrome":    { "label": "CHROME", "kind": "product", "glyph": "browser" },
     "mozart":    { "label": "MOZART", "kind": "person",
                    "look": { "age": "child", "height": 0.72, "headScale": 1.18, "outfit": "coat", "hairStyle": "curly", "suit": "#B5372F" } },
     "piano":     { "label": "", "kind": "object", "w": 330, "paths": [ { "d": "M40 150 H480 V200 H40 Z", "fill": "#3A322B" } ] } }
   ```
   - `kind`: `company` · `product` · `place` · `idea` (emblems) · `person` (a figure) · `object` · `animal` (the
     book's own drawing: `paths` in a 520 × 520 box, the same data as `motifs.json` — reuse a blind-named own icon's
     paths when there is one).
   - `glyph`: one the engine draws (the candidates file lists them). No fitting glyph → leave it out: the first letter
     of the name is shown. Never draw or describe a real logo.
   - `look` (a person): the wardrobe fields of the story bible's cast (`age`, `outfit`, `headwear`, `hairStyle`,
     `beard`, `glasses`, `gender`, colours). A child is `age: "child"` with `height` ≈ 0.72 and `headScale` ≈ 1.18.
     Two people must differ at a glance, exactly as in the cast.
   - `color`: only when a thing has a colour the book gives it; otherwise each emblem gets its own from the palette.
   - Aim for the things that carry the book: usually 8–25. A name said once is rarely worth an entity.
3. **Draw the things that carry the book (told v2, 2026-11-16)** — the ship, the chest, the machine, the animal, the
   city: `paths` on the entity, for ANY kind (a product, a place, an idea too). A thing nobody drew is shown as a
   coloured tile with a stock glyph — the fallback, and what the first told book's mute test called TEXT_ONLY (19/30).
   The exact brief (box, layers, path and colour counts, this book's palette tokens) is generated into
   `storyboard/entities.candidates.json` → `"drawing"`; in short:

   ```json
   { "demeter": { "label": "DEMETER", "kind": "product", "w": 400, "reads": ["ship", "sailing ship"],
                  "paths": [ { "d": "M48 352 H438 L496 330 L452 424 Q270 452 104 424 Z", "fill": "ink" }, … ],
                  "states": { "wrecked": { "reads": ["shipwreck", "sinking ship"], "paths": [ … ] } } },
     "london":  { "label": "LONDON", "kind": "place", "glyph": "building", "reads": ["clock tower", "city"], "paths": [ … ],
                  "backdrop": { "reads": ["city skyline"], "paths": [ … ] } },
     "earthbox": { "label": "EARTH BOX", "kind": "object", "motif": "earthBox" } }
   ```
   - Silhouette first, then the parts that make it THIS kind of thing, then one or two accent details; colours by
     palette token (`ink`, `accent`, …) or hex. Original flat vector — never a logo, a brand mark or a known character.
   - `reads`: the 1-3 word names a stranger may give it, written BEFORE the blind test. Never add a misreading later
     (the verdict is bound to the drawing and its readings).
   - `states`: what the narration CHANGES gets a drawing per state it shows (2-3 at most), same box, same base
     silhouette. `backdrop` (a place): a wide, simple skyline / landscape in `0 0 1920 760`, standing on the bottom edge.
   - **Draw the place as a SCENE (told v5):** give the backdrop `"sky"` and `"ground"` (see "The places of the book")
     and the cast stands IN it; without `"sky"` it is only a pale wash behind the stage.
   - **One source:** an object that is already an own icon in `motifs.json` is not drawn twice — `"motif": "<key>"`.
   - **See them, blind:** `node scripts/own-icons-sheet.js --slug=<slug>` prints every drawing, state and backdrop as
     one picture per file; a FRESH agent (sonnet) is given ONE picture and says what it is in 1-3 words; then
     `node scripts/own-icons-sheet.js --slug=<slug> --judge=<answers.json>` writes `own-drawings.verdict.json`.
     Redraw what was read as something else (dracula's open earth box took three drawings: "wooden crate",
     "treasure chest", then "crate of soil"). **Merge refuses a told beat that uses a drawing without a passing
     verdict**; prep refuses a drawing that is not one (three polygons, one colour, a corner of its box).
     **Two rounds, then the fallback (2026-11-23):** a miss writes `storyboard/own-drawings.redraw.md` (what it was
     read as, what it must read as, how a drawing of its kind is read) — redraw from that, print, name, judge. On the
     SECOND miss `--judge` records the fallback in entities.json itself (`paths` → `pathsFallback` with the record:
     the emblem / the thing unchanged / the shared set stands in), prep and merge say it once, and you go on — never a
     third round on your own, never a question to the operator about it. A refused sheet removes the earlier pictures:
     nothing old is ever named.
4. **Give every person a signature and have them told apart blind (told v3, 2026-11-17).** A person is the engine's
   rig dressed by `look`; eight people in dark suits are told apart only by their name plates. In `entities.json`:

   ```json
   { "dracula":  { "label": "COUNT DRACULA", "kind": "person", "reads": ["cape", "top hat", "vampire"],
                   "look": { "outfit": "cloak", "headwear": "topHat", "beard": "mustache", "height": 1.08 } },
     "jonathan": { "label": "JONATHAN HARKER", "kind": "person", "reads": ["suit", "notebook"],
                   "look": { "outfit": "suit", "accessory": "tie" }, "carries": "journal" } }
   ```
   - `look`: one thing a stranger SEES per person — headwear is the cheapest (`topHat`, `fedora`, `cowboy`, `bonnet`,
     `veil`, …), then beard / glasses / hair, outfit, height, build, an `accessory`. `holds` = a hand prop of the
     engine; `carries` = one of the book's own DRAWN things, in their hand whenever they are on stage.
   - `reads`: what a stranger may call them from the picture ("man in a top hat", "old man", "glasses") — written
     BEFORE the test, never the name, never a misreading added afterwards.
   - `node scripts/cast-sheet.js --slug=<slug> --cloud` → one picture per person, alone, WITHOUT the name (stills on
     GitHub Actions, 5–15 min). ONE picture to ONE fresh sonnet agent: "who is this, in 2-6 words?". Then
     `node scripts/cast-sheet.js --slug=<slug> --judge=<answers.json>` → `own-people.verdict.json`.
   - Measured on dracula: as authored 5 of 8 people were seen as intended; signatures alone did not help at first
     (the cloak reads "robe", a cowboy hat "fedora", a veil made Lucy "a nun", messy hair "devil horns") — after one
     round of changes 8 of 8. **Merge refuses a told beat that puts on stage a person nobody could tell.**
5. Re-run `node scripts/storyboard.js prep --slug=<slug>`: `rules.md` now opens with the told section and lists
   these ids, each drawn thing with its states, each place that can stand behind the stage. (A book without
   `entities.json` gets no told section and merge refuses a told beat.)

### A head of their own (told v4)

The people who carry the book get `"look": { …, "drawn": { "back", "face", "hair", "top", "cape", "body" } }` — paths
in the rig's units; the rig keeps eyes, brows, mouth and limbs. The exact numbers and tokens are generated into
`entities.candidates.json` → `"cast"`; follow that, not memory. One silhouette per person — two people differ in
OUTLINE, not in colour. Then the same blind test as before (`cast-sheet.js --cloud`, one agent per picture, `--judge`).
A person gets the same two rounds: a miss writes `own-people.redraw.md`; the second miss moves the head to
`look.drawnFallback` (the rig's own head stands in, the signature stays) and the step is finished.
`told.js apply` puts the same head on that person in the figure scenes too.

### The book's home (2026-11-18)

Lead agent: mark ONE drawn place `"home": true`. It stands behind every stage that names no `at` and behind every beat
that is not told, names no `place` and sits in a generic set (none / abstract / office / room) — so no scene of the
book stands on blank paper or in the shared office. A story's home is where it mostly happens; a book of ideas draws
the room its ideas live in. Keep the middle third of the drawing quiet: the things and the people stand there.

### A book of IDEAS (2026-11-18)

A book of ideas names few people and no companies — its content is its TERMS. `told.js entities` lists them
(`entities.candidates.json` → `terms`: "reinforcing loop", "stock", "delay" …). Lead agent: keep the ones that are the
book's ideas, give each ONE drawing a stranger could name — the book's own picture when it gives one (a stock is a
bathtub, the inflow its tap) — with `states` for what the narration changes. Authors: stage two to four of them as a
mechanism with `"layout": "flow"` (an arrow from each to the next) and change their state on the word that says it.

### The things of the book are ONE vocabulary (Film Flow 6)

A thing you drew in `entities.json` is also an own icon of the beats that are NOT told: `"concept": "<entity id>"`
puts the same drawing beside the cast (rules.md lists them under "This book's own icons"). Lead agent: draw the
book's recurring IDEAS as this book's thing — the deed, the transfusion flask, the pocket watch — not the shared
scales, shield and clock. `told.js status` prints own against shared-library icons; merge warns when the library
carries the film.

### The places of the book (Film Flow 6)

Lead agent: draw EVERY place the story stands in as a `backdrop` (the castle, the harbour, the asylum, her bedroom) —
interiors too. Authors: a told stage is there with `"stage": { …, "at": "<place>" }`; a beat that is not told is there
with `"place": "<place>"` next to its `set` — the book's drawing replaces the generic set. `told.js status` prints how much
of the film stands at a place the book drew; a film that stands in "office" and "room" could be any book.

### The place is a SCENE, not a silhouette (told v5, 2026-11-21)

Measured on the first real book (Dracula): the picture ADDED to the narration in 19 of 24 mute-test frames but EXPLAINED
the event by itself in 1 — a told stage read as a labelled diagram: the cast in a row with name plates, the place a
pale one-tone wash behind them. Raising the wash only made the stage dark (the ink silhouettes swallowed the title,
the name plates and the black-clad Count). A place cannot be made real by opacity; it has to be DRAWN as a scene.

Lead agent — a backdrop drawn as a scene carries two colours next to its paths:
```json
"backdrop": { "viewBox": "0 0 1920 760", "reads": ["castle", "mountains"], "sky": "#D6CFC3", "ground": "#2B2326", "paths": [ … ] }
```
- **`"sky"`** — a colour, not a path: a PALE tone of the book's palette (luminance ≥ 0.5 — the dark titles and the name
  plates are read over it). The **upper 25 % of the box holds no path at all**: that is where the titles and the
  plates stand. Night is a pale grey-violet with a moon lower down, not a black box.
- **The middle ground** — the place itself in two or three MID tones of the palette (the castle on its crag, the
  harbour wall, the room's far wall and its window): never one ink silhouette, never a wash over the whole box, and
  **no big ink mass** (luminance ≥ 0.1 for anything larger than a detail) — the cast is drawn in ink, and in the first
  scene stills the black-clad Count vanished against an ink abbey wall. Small details (a lit window) may be dark.
- **`"ground"`** — a flat ground strip along the bottom edge of the box in this colour (clearly another tone than the
  sky); the engine continues it to the bottom of the frame and the cast stands on it, with a contact shadow under a
  figure whose feet are on it.
- Still nothing that is an entity of its own, nobody of the cast. Lint: `own-drawings.js` (prep refuses a dark sky, a
  ground in the sky's tone, a path in the upper band, a wash). Blind-named like every drawing (the sheet shows the sky
  and the ground as the engine does); the verdict is bound to the picture WITH its sky.
- A backdrop without `"sky"` is drawn as before — the pale wash — on every stage. Authors change nothing: `at` / `place`.

**The cast IN the place (slice 2).** A scene backdrop may name **`"spots"`**: `[{ "x": 1320, "y": 500, "s": 0.55 }, …]`
(1-6, the drawing's units, on the drawn ground — the castle gate, the abbey door, the front of the pier; `s` is depth:
0.45 far … 1.1 near). On a stage AT that place the PEOPLE of an arrangement stand at the spots in the order the author
lists them (`who`), turned towards each other; a person beyond the spots, or in a place without spots, stands on the
ground line — never in the air at mid-stage. Things keep their generic slots. The place itself, when an author lists
it in `who` while the stage is at it, is its name on a SIGN on the ground (not an emblem tile beside its own drawing).
A person who stays over a cut is `known`: their name plate recedes (smaller, lighter) from the next beat; the full
plate stands where they first appear. All of this only in a book that draws at least one place as a scene.

**Things on the ground, the camera at the event (slice 3).** On a scene stage an emblem tile stands on the ground
(its name plate's lower edge at the feet line) instead of floating at mid-height. When a person plays a verb (`act`)
or throws / drops a thing, the camera pushes in a little (×1.15) on the people and things it happens between, landing
with the word, and opens wide again at the next arrangement (a cut lands wide, a change within a beat eases). Authors
write nothing for it; `focus` / `wide` still do what they did.

**The same place behind the figure scenes (slice 4).** A beat that is not told and stands at a place (`"place"`, or the
book's home) now shows a scene backdrop as itself too — sky, drawn place, ground band — instead of the pale wash, so
the whole film stays in the book's places across told and figure scenes alike. Nothing to write: `place` as before.

## Storyboard authors — when a beat names something

Write `told` instead of concept / cast / callout / diagram (schema, layouts and the event table: `rules.md`).

```json
{ "i": 41,
  "told": { "stage": { "layout": "versus", "who": ["microsoft", "google"] },
            "events": [ { "on": "universes", "do": "apart", "who": ["microsoft", "google"] } ] },
  "explainedBy": "Microsoft and Google start in separate worlds", "noVisual": null }
```

What made the approved passages work — follow it:

- **Stage the sentence's verb, on its word.** "they became obsessed with each other" → `together`; "a massive street
  fight" → `burst`; "that letter was a forgery" → `stamp`. `on` is the word that carries it.
- **A run of beats is one stage.** Put the things on stage once; each next beat makes ONE or TWO things happen to
  them. Do not rebuild the stage every beat, and do not let a beat pass where nothing changes.
- **`stage` lists EXACTLY who is on stage** (told 1.1): whoever is left out walks off with their labels. Restating
  the same `stage` every beat is noise; writing a new one is how the film turns to other things.
- **Show the verb, do not caption it.** A beat whose only events are `title` / `label` is a slide, not a stage
  (dracula's first pass: 34 such beats, 123 labels in 147 beats). A label is the exception — one short noun phrase
  for a fact the narration states about that thing; a thing carries two at most and they leave by themselves after
  the next beat. Effects (burst, cross, coins) last their own beat. You never tidy up.
- **Every printed word passes the screen-text rules at merge**: no keyword soup ("FOUR MEN POOL BLOOD" → "Four men
  give their blood"), no fragment, a pair's two sides are two ideas, nothing printed on more than three beats.
- **Name what is named.** If the narration says four product pairs, the viewer sees four rows (`pair`), each landing
  as it is said. If it gives two dates, they stand on a timeline (`date`).
- **Titles are the narration's claim in 2–5 words**, never a caption for the picture. One at a time.
- **Use the book's drawings, and let people handle them (told v2).** A drawn thing is seen as itself; what the
  narration changes, changes on screen — `{ "do": "change", "who": "demeter", "state": "wrecked" }` (it then stays
  wrecked for the rest of the film); what the narration hands over travels from hand to hand on the word —
  `{ "do": "give", "who": ["jonathan", "mina"], "what": "journal" }`; `change` + `holds: "<thing>"` puts it in a hand,
  `take` picks up a thing that stands on stage. What the narration THROWS or DROPS is thrown or dropped on the word:
  `{ "do": "throw", "who": "dracula", "what": "mirror", "to": "ground", "state": "shattered" }` (`to`: off the stage
  by default, someone / something on stage, or the ground where it lies as what it has become),
  `{ "do": "drop", "who": "jonathan", "what": "knife" }`. Draw the broken `state` when the book breaks the thing.
  Where the narration IS somewhere, the stage is there:
  `"stage": { …, "at": "transylvania" }` draws the place, pale, behind everything (a new `stage` without `at` is
  nowhere in particular). Only what `rules.md` lists as drawn / with states / as a place exists.
- **PEOPLE PLAY THE VERB (told v3).** When the narration says a person does something — to someone, with something
  — write `{ "on": "<the verb's word>", "do": "act", "who": "<person>", "verb": "<verb>", "target": "<id>" }`. They
  turn to the other, close the distance, the gesture lands on the word, the other reacts; a typist SITS at a desk
  with the typewriter under her hands, a reader has the book in both hands, one who hides shows only head and
  shoulders over the thing, one who comes WALKS in. Verbs: `hit`, `bite`, `chase`, `hide`, `dig`, `type`, `write`,
  `read`, `come`, `fall`, `point` — the table in `rules.md` says what each needs, what the viewer sees, and HOW OFTEN
  A MUTED VIEWER READ IT (measured blind). **One verb per person per beat** (merge refuses a second). **`come` is a
  physical arrival** at a person or a thing — not "Dracula comes to London" (that is `stage.at` / `enter`; merge warns).
  **There is no verb for a glance**: `look` and eye contact were tried and read by nobody. A title that names the action over standing people is not the action. `change` + `action`
  takes ONLY the rig's own actions (listed in `rules.md`); "typing", "read", "write" are not among them — the
  person would stand still (dracula's authors wrote 16 of those). Do not invent an action the narration does not
  say: an analytical passage with nobody doing anything stays a stage of things and a claim. Merge WARNS about a
  beat with a person on stage and nobody doing anything.
- **People stand for the people the narration names** — at their age, in their dress. They stand still unless given
  something to do (`change` with an `action`). Never a host or a stand-in figure "to have someone there".
- **The camera goes where the sentence goes** (`focus`), and comes back (`wide`) before the stage is used whole again.
- Use the usual authoring (below in `rules.md`) for a beat about an unnamed person's inner state or a general idea
  with nothing named. Mixed films are normal: a told run, then staged beats, then a told run.
- `raw` is for one bespoke drawn thing nothing else can show; if you need it often, tell the lead agent what is missing.

## After merge — check, then the pipeline applies it

- `node scripts/storyboard.js merge --slug=<slug>` checks every told beat against its narration and the entities
  (an unknown id, a word the beat does not say, an unknown event are problems to fix, like any merge problem).
- `make-book` step **1.886** runs `node scripts/told.js apply --slug=<slug> --write --pipeline` after every plan: the
  stages are compiled against the planned word timings, put on their scenes and sealed as the authored decision
  (so no gate restores the old figures). A told beat that does not compile STOPS the build; fix the beat and merge again.
- `node scripts/told.js check --slug=<slug>` — the same compile without writing (after the first make-book).
- `node scripts/told.js status --slug=<slug>` — how many scenes are told and the share of naming scenes that show
  the name. Put that line in the hand-off.
- Readcheck reads a told beat as its stage and events; the mute test and framecheck know the words on a told stage.

## Looking at it

**One command, and no other way:**

```
node scripts/told-clip.js --slug=<slug>                      # first 90 s + 90 s from the middle
node scripts/told-clip.js --slug=<slug> --windows=600-690    # any passage, in seconds
```

It cuts the passages out of the planned config, renders them on GitHub Actions in FULL HD with the film's own
browser settings, waits, downloads, runs the flicker check and prints the clip paths (10–25 min; nothing renders on
the PC). Run it from the book's worktree, after make-book.

- **Never `npx remotion render` / `remotion still` / a local ffmpeg batch.** Besides loading the PC
  (LOCAL_RENDER_RULES.md), a hand-made `--props` call draws the lab reel instead of the book (dracula, 2026-11-15:
  the clips shown were not the book's film).
- Do not edit `src/` or `scripts/` while it pushes (the bundle is the working tree).
- `node scripts/film-flow.js --slug=<slug>` for the flow table (name coverage, figure-and-text share).

## Limits (told v2)

- The engine's library icons are not available on a told stage — a thing is the book's own drawing or an emblem.
- A held drawing sits in the hand of the rig's hold pose (the fingers do not close on it); a person holds one thing;
  a state change is a knock and a cross-fade, not an animation of the change.
- The rig faces the viewer: a verb is read from the arms, the lean, the head and where the two stand — there is no
  side view. `dig` brings its own earth and spade; other verbs have no tool of their own. `hit` / `bite` put the two
  bodies in contact (the one who acts carries their name plate one plate higher); `come` stands the newcomer in the
  next place of the layout and reads only WHILE they walk; a seated person who is given another place gets up first.
- A backdrop is one flat drawing: it fades, it does not move.
- Up to four `pair` rows on one stage; a thing that would rest under the subtitle band is reported by the compiler.
- A film without `meta.flow ≥ 2` draws no told stage; `told.js revert --write` gives a book its figure-and-text
  picture back. Published books are never changed.
