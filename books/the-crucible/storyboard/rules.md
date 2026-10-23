# Storyboard authoring — The Crucible (Arthur Miller) · Vox engine

Vox = photoreal Flux stills + kinetic type. For EVERY beat decide what a viewer with the SOUND OFF
must see. Each image costs money and a wrong one is worse than none. ENGLISH only.
Book context: `books/the-crucible/story-bible.json` — world/era: 1692 (Salem Village, Massachusetts Bay Colony); 1953-56 for Miller's McCarthy-era frame.

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
- Reverend Samuel Parris: a gaunt middle-aged Puritan minister in a plain black coat and white preaching bands, thinning dark hair, anxious pinched face, Salem Village 1692
- Abigail Williams: a striking young Puritan woman with long dark hair escaping a white linen cap, plain grey wool dress with a white collar and apron, intense dark eyes, Salem 1692
- Betty Parris: a pale ten-year-old Puritan girl with fair hair under a white nightcap, white linen nightgown, lying still in a wooden bed, Salem 1692
- Tituba: a Black woman in her forties from Barbados, dark skin, a faded red headscarf, a coarse brown wool dress and shawl, Salem 1692
- John Proctor: a broad-shouldered Puritan farmer in his thirties, dark unruly hair and short beard, rough brown linen shirt with rolled sleeves and a leather work vest, Salem 1692
- Elizabeth Proctor: a composed Puritan wife in her thirties, brown hair hidden under a white linen coif, dark blue wool dress with a plain white collar and apron, restrained grave expression, Salem 1692
- Thomas Putnam: a heavy-set wealthy Puritan landowner in his forties, florid face, grey-streaked hair, a fine dark green wool coat with pewter buttons and a wide-brimmed black hat, Salem 1692
- Ann Putnam: a hollow-eyed Puritan woman in her late thirties in a black mourning dress and black hood, pale grief-worn face, Salem 1692
- Rebecca Nurse: a gentle white-haired Puritan grandmother in her seventies, lined kind face, grey wool dress, white shawl and white linen cap, Salem 1692
- Giles Corey: a wiry, weathered farmer in his eighties, white stubble beard and bald crown, patched brown farm coat and breeches, Salem 1692
- Reverend John Hale: a scholarly Puritan clergyman in his late thirties, clean-shaven earnest face, black clerical coat and white bands, carrying a stack of heavy leather books, Massachusetts 1692
- Deputy Governor Danforth: a stern grey-haired colonial judge in his sixties in a black judicial robe with white bands and a long powdered periwig, cold heavy-lidded eyes, Massachusetts 1692
- Mary Warren: a timid, mousy eighteen-year-old servant girl with light brown hair under a white cap, a plain brown wool dress and patched apron, Salem 1692
- Ezekiel Cheever: a thin, officious court clerk in his forties in a dark brown coat, a black hat and a leather satchel of papers, Salem 1692
- the Salem girls: a group of four Puritan teenage girls in grey and brown wool dresses with white caps and aprons, wide frightened eyes, Salem 1692
- Sarah Good: a ragged, homeless middle-aged woman in a torn dark shawl and soiled skirts, tangled grey hair, Salem 1692
- Arthur Miller: a tall lean American playwright in his late thirties with dark wavy hair and black horn-rimmed glasses, a 1950s grey suit and narrow tie, 1950s America
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
