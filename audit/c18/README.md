# Cycle 18 — Relational Motion 2.0 + multi-phase single-frame storytelling (dev, experimental)

Branch `dev/c18`. Not on god-mode yet: experimental until the operator sees it. Single-relation scenes only; a scene
without the new fields renders exactly as before (tested byte-identical compile).

## Renderer + validator (SemanticStage.tsx, semantic-director.js, single-relation.js)
| effect | mechanism | what happens on screen |
|---|---|---|
| `overflow` | overload | a stock fills in compact steps; on the step that reaches the rim the content heaps over, runs down both sides, pools, the wall cracks (break by ~70 % of the beat, held to be read) |
| `via` (+ `moveTo`) | passage | the obstacle disappears (dashed outline stays), then the mover — an object or, only here, a person — goes through its place to the goal (dotted route) |
| `mergeInto` | merge | an object travels into another and is gone as itself; the receiver swells and stays bigger |
| `from` (+ `present: true`) | split | a new object comes out of its source and slides to its own place (dotted trace) |
| `phases: true` + `anchors` | — | 2–3 events (setup → action → result) in one locked frame; the cause is marked when its words are said, the change never starts before the effect's words; a missing anchor → the whole contract keeps its `at` fractions (`timingSource`) |

## Real book scenes (isolated A/B on GitHub Actions; contracts by fresh authors, all valid)
| scene | mechanism | timing | agent review (narration given): A → B showsTheIdea 0-3, better |
|---|---|---|---|
| create-space #177 | overload | fraction | 1 → 2, **B** |
| the-myth-of-sisyphus #137 | passage, 2 phases | anchored ("prison doors open" → "walks out") | 0 → 2, **B** |
| as-good-as-dead #155 | transfer ×2, 2 phases | anchored | 1 → 2, B — but "contradicts": the clothes stand-in glyph reads as a mask → production selection would KEEP A |
| burn-of-the-everflame #21 | split | fraction | 1 → 1, same (the "pieces" stand-in glyph is unclear) |
| feel-good-productivity #225 | removal + recovery, 2 phases | anchored ("pebble" → "smoothly") | 0 → 3, **B** |
No honest real scene for **merge** in 50+ books (every "merge / combine" is figurative or habitual "would"); the renderer
path is tested, not shown on a book. Rater = one agent, never human.

## Found and fixed on the renders (my own look, then re-rendered)
overflow fired on the first fill step and was reset by the next; the spill came in the last 10 frames; a passing
person walked off the card / over the receiver's label; four long labels ran into each other (now staggered).

## Limits seen
Stand-in glyphs (clothes → mask, pieces → boulder) hurt: the vocabulary has no clothing / log / chunk icons — an
own-icon per book (motifs.json) is the honest route. Word anchors need the scene's words in config captions (they are).
