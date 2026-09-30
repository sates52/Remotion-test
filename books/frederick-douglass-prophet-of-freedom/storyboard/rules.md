# Storyboard authoring — Frederick Douglass: Prophet of Freedom (David W. Blight) · Vox engine

Vox = photoreal Flux stills + kinetic type. For EVERY beat decide what a viewer with the SOUND OFF
must see. Each image costs money and a wrong one is worse than none. ENGLISH only.
Book context: `books/frederick-douglass-prophet-of-freedom/story-bible.json` — world/era: 1818–1895.

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
- Frederick Douglass: A tall, commanding African American man in his 40s with intense dark eyes, thick halo of swept-back gray-streaked hair, sharp jawline, and solemn dignified expression, wearing a tailored 19th-century black wool frock coat, crisp white wing-collar shirt, and silk cravat.
- Abraham Lincoln: A gaunt, weathered 55-year-old man with deep facial creases, melancholy gray eyes, dark untidy hair, and a chiseled chin-curtain beard, wearing an unbuttoned black broadcloth frock coat, rumpled white linen shirt, black bow tie, and holding a tall silk stovepipe hat.
- John Brown: A fierce, sun-leathered 59-year-old man with intense piercing blue eyes, high forehead, and a massive untamed white-gray beard flowing down his chest, wearing a coarse wool frontier coat and heavy boots.
- William Lloyd Garrison: A clean-shaven, bespectacled 45-year-old intellectual with a balding dome, wire-rimmed spectacles perched on a sharp nose, and pursed puritanical lips, wearing a severe black high-collared Quaker suit and pristine white stock.
- Edward Covey: A wiry, sun-hardened 35-year-old man with a squinting predatory gaze, thin cruel mouth, and rough sandy-brown stubble, wearing a dusty sweat-stained homespun linen work shirt, broad leather suspenders, and mud-encrusted trousers.
- Sophia Auld: A 30-year-old woman with a compassionate but conflicted countenance, dark brown hair gathered in neat side-braids beneath a simple white lace cap, wearing a mid-19th-century calico day dress and linen apron.
- Hugh Auld: A burly, authoritative 40-year-old man with heavy muttonchop sideburns, furrowed brow, and gruff expression, wearing an iron-gray wool waistcoat over a work shirt and dark wool trousers.
- David W. Blight: A thoughtful 65-year-old historian with short silver-gray hair, kind observant eyes behind horn-rimmed glasses, wearing a tailored brown tweed blazer over an ivory oxford shirt in an archival library.
- Enslaved Worker / Union Soldier: A resilient 19th-century African American laborer in ragged coarse osnaburg cotton tunic, weathered trousers, and worn leather work boots standing against an antebellum landscape.
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
