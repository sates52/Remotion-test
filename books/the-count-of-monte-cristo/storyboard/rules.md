# Storyboard authoring — The Count of Monte Cristo (Alexandre Dumas) · Vox engine

Vox = photoreal Flux stills + kinetic type. For EVERY beat decide what a viewer with the SOUND OFF
must see. Each image costs money and a wrong one is worse than none. ENGLISH only.
Book context: `books/the-count-of-monte-cristo/story-bible.json` — world/era: 1815–1838.

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
- Edmond Dantès: a lean dark-haired young sailor in his late teens to twenties, sunburnt face, plain sailor's linen shirt and dark trousers, tall and wiry, 1815 Marseille seaman
- Abbé Faria: an elderly white-haired Italian priest, thin and stooped, ragged black cassock, 1815 prisoner, long untrimmed white beard
- Danglars: a stout middle-aged clerk in a dark suit and high white collar, neat side-parted hair, sallow cautious face, 1815 Marseille ship's accountant turned Paris banker
- Fernand Mondego: a handsome dark-haired young Catalan fisherman in a faded blue jacket, later a Parisian general in a dark military coat with epaulettes
- Maximilian Morrel: a grave young officer in a dark blue naval coat with brass buttons, fair short hair, pale worried face, Marseille shipowner's son, 1815
- Gérard de Villefort: a sharp-faced middle-aged royal prosecutor in a black judicial coat with a white cravat, grey-streaked dark hair swept back, cold precise expression, Restoration France 1815
- Caderousse: a stooped middle-aged innkeeper in a stained brown waistcoat and loose shirt, unshaven, shifty eyes, rough 1815 Marseille tavern owner
- Mercédès: a dark-haired young Catalan woman in a simple pale 1815 dress with a shawl, dark eyes, the fiancée of Dantès
- The Count of Monte Cristo: a tall pale aristocrat in his thirties in a black frock coat and white silk cravat, dark hair swept back, cold piercing gaze, 1830s Paris gentleman
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
