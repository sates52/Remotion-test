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
3. Re-run `node scripts/storyboard.js prep --slug=<slug>`: `rules.md` now opens with the told section and lists
   these ids. (A book without `entities.json` gets no told section and merge refuses a told beat.)

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
- **Name what is named.** If the narration says four product pairs, the viewer sees four rows (`pair`), each landing
  as it is said. If it gives two dates, they stand on a timeline (`date`).
- **Titles are the narration's claim in 2–5 words**, never a caption for the picture. One at a time.
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

- `node scripts/flow-passage.js --slug=<slug> --out=<dir>` + `stills-cloud.js push / fetch`: passages as clips, drawn
  with the film's own browser settings. For the operator render them full size (`clip.scale: 1`).
- `node scripts/flicker-check.js <clip.mp4>` before showing a clip; `node scripts/film-flow.js --slug=<slug>` for the
  flow table (name coverage, figure-and-text share).

## Limits (told v1)

- The engine's library icons are not available on a told stage — an animal or an object is the book's own drawing.
- Up to four `pair` rows on one stage; a thing that would rest under the subtitle band is reported by the compiler.
- A film without `meta.flow ≥ 2` draws no told stage; `told.js revert --write` gives a book its figure-and-text
  picture back. Published books are never changed.
