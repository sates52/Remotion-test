# Storyboard authoring — The Adventures of Tom Sawyer (Mark Twain) · Vox engine

Vox = photoreal Flux stills + kinetic type. For EVERY beat decide what a viewer with the SOUND OFF
must see. Each image costs money and a wrong one is worse than none. ENGLISH only.
Book context: `books/the-adventures-of-tom-sawyer/story-bible.json` — world/era: 1840s.

## Output — one object per beat in your chunk, same order, same `i`
```json
{ "i": 12,
  "design": {
    "type": "statement|imagefocus|list|quote|stat|compare|checklist|polaroid|chart|timeline|question|punchline|place|document|map|flow",
    "kicker": "2-4 word ALL-CAPS tag or ''",
    "emphasis": ["1-3 SHORT ALL-CAPS specific words from THIS beat: names, places, numbers"],
    "items": [],                                     // list/checklist only: 2-4 SHORT ALL-CAPS items
    "image": null | { "subject": "a described photograph", "style": "cutout|card" },
    "compare": null | { "left": {"label","subject"}, "right": {"label","subject"} },
    "storyboard": { "claim": "...", "concreteVisual": "...", "onScreenText": "...",
                    "relationToPrevious": "...", "addedInformation": "..." } } }
```

## The image test (most important)
`image.subject` is a DESCRIBED PHOTOGRAPH — who, doing what, where, when — never a keyword list
("heart, manuscript, 1985" is forbidden). A muted viewer must guess the sentence from it. Reuse a
character's look VERBATIM so the same person recurs:
- Tom Sawyer: A freckled, sandy-haired 12-year-old boy in a faded blue cotton shirt with patched knee trousers and bare feet, a grin that is half mischief, a tin bucket or whitewash brush in hand.
- Huck Finn: A thin, barefoot 13-year-old boy in ragged homespun clothes, a battered straw hat with a torn brim, dirt on his face and a sly, watchful expression.
- Aunt Polly: A stout, grey-haired woman of about sixty in a dark calico dress with a white collar and apron, spectacles on a cord, a wooden spoon or a switch in her hand.
- Becky Thatcher: A fair-haired 11-year-old girl in a pale blue dress with a white pinafore and a ribbon in her hair, shy eyes and a careful posture.
- Injun Joe: A gaunt, dark-haired man in his thirties in a torn, dirty brown coat and slouch hat, a hard face with a scar, an unshaven jaw and a cold, unblinking stare.
- Muff Potter: A ragged, unkempt man in his forties with a grizzled beard and bloodshot eyes, wearing a torn grey shirt and stained trousers, chained at the wrist.
- Ben Rogers: A round-faced 12-year-old boy in a grey cotton shirt and frayed suspenders, eating an apple, a cheerful and gullible grin.
- Sid: A slight, neat 9-year-old boy in a clean white shirt and pressed short trousers, hair combed flat, a prim and self-satisfied face.
- Judge Thatcher: A dignified man in his fifties in a black frock coat and white high collar, grey side-whiskers, presiding from a raised bench in a timber courtroom.
- Narrator: A quiet middle-aged man with a dark moustache in a dark suit and waistcoat, leaning on a writing desk with an open book, a half-smile.
- Everyman: An ordinary adult in a plain grey coat with a neutral, thoughtful expression.
Keep the era right (no anachronisms). Flux drops gore, children in danger and war violence
(CONTENT_FILTERED) — soften to aftermath, symbol or place. No text inside images.
## Coverage — a muted viewer needs a picture most of the time
Give 70-85% of beats an image. The mute-test bar (image ADDS on >= 60% of ALL frames) cannot
be met otherwise: All the Light had images on 44% of its screen time and failed on text-only frames
while its images scored 14/15. An idea with no photograph still has a place, a person or an object
that carries it (the reader at a desk, the ruined street, the radio). `statement` with image null
only for pure banter or when every picture would mislead.
ONLY `imagefocus`, `polaroid`, `compare` and `duo` put a picture on screen. An image on any other
type (list, question, place, quote, stat, punchline, timeline…) is never shown — the planner turns such
a beat into imagefocus. Keep 15-30% of beats as those text archetypes WITHOUT an image where the shape
is the point (a real question, a real list, a real quotation): 40 minutes of one layout loses viewers.

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every `i`.
