# Storyboard authoring — Stolen Focus: Why You Can't Pay Attention - and How to Think Deeply Again (Johann Hari) · Antidote engine

You art-direct an animated summary. The audio is a two-host analysis. For EVERY beat decide what a
viewer with the SOUND OFF must see to understand what is being said. A wrong picture is worse than
none. Everything you write is ENGLISH. Book context: `books/stolen-focus/story-bible.json`.
Reference (approved, We Were Liars): `books/we-were-liars/art.json` — read 10 beats of it first.

## Output — one object per beat in your chunk, same order, same `i`
```json
{ "i": 12,
  "concept": "<icon>" | null,
  "diagram": null | { "type": "flow|sorter|spectrum|matchWave", "labels": ["..",".."], "values": [..]? },
  "callout": { "text": "2-5 words", "style": "reveal|highlight|strike|box|stack" } | null,
  "set": "<set>",                    // optional
  "shotOverride": "<shot>",          // optional, rarely
  "cast": ["<castKey>", "<castKey>"],// who is on screen, most important first
  "expression": "<expression>",      // first cast member's face
  "action": "<action>",              // first cast member's body
  "holds": "<object>",               // optional object in their hand
  "storyboard": { "claim": "...", "concreteVisual": "...", "onScreenText": "...",
                  "relationToPrevious": "...", "addedInformation": "... (write 'weak: ...' if honest)" } }
```

## Vocabulary (nothing else renders)
- icons: crash, ledge, water, grave, medical, notes, phone, home, family, road, storm, star, heart, fire, tree, mask, mirror, key, law, photo, war, game, city, food, coin, door, lightbulb, puppeteer, chains, compass, boulder, crack, clock, balance, book, shield, trophy, hourglass, target, gift, inheritance, crystalRock, skinnerBox, slotMachine
- sets: office, street, bedroom, forest
- shots: wide, medium, closeUp, twoShot, overShoulder, insert, split, silhouette, lowAngle, crowd, illustration, diorama, beforeAfter
- expressions: neutral, happy, sad, surprised, worried
- actions: idle, talk, point, celebrate, slump, think, walk, sit, hold, reach
- holds: book, phone, key, notes, letter, coin, cup, lightbulb, mask, photo, mirror, flower, compass, briefcase, shield, trophy, hourglass, target, magnifier, wallet, gift
- cast (story-bible keys):
- `johann` — Johann Hari (protagonist): A British-Swiss journalist in his mid-40s, average build, short dark hair, black-framed glasses, navy casual blazer over an open-collar white shirt, present-day.
- `adam` — Adam (protagonist): A lanky teenage boy with messy brown hair and bright eager eyes, red graphic t-shirt, jeans and sneakers, present-day.
- `everyman` — Everyman (extra): An exhausted modern office worker in their 30s with slumped shoulders and dark-ringed eyes, wrinkled chambray shirt, clutching a glowing phone, present-day.
- `narrator` — Narrator (dialogue_host): The voice of the deep dive: a sharp analyst woman in her 30s, dark hair in a bun, rust-red blazer, dissecting the attention crisis.
- `gloria` — Gloria Mark (mentor): A focused professor in her 50s, East Asian, short black bob with grey streaks, forest-green cardigan over a cream blouse, holding a notebook, present-day.
- `earl` — Earl Miller (mentor): A distinguished Black neuroscientist in his 60s, short grey hair, trimmed grey beard, tweed jacket over a dark sweater, present-day.
- `mihaly` — Mihaly Csikszentmihalyi (mentor): A warm Hungarian psychologist in his 70s, balding with a white fringe, bushy eyebrows, navy knitted sweater vest over a checked shirt, present-day.
- `maryanne` — Maryanne Wolf (mentor): A silver-haired reading researcher in her 60s, shoulder-length grey hair, reading glasses on a chain, teal blouse with a long patterned scarf, present-day.
- `czeisler` — Charles Czeisler (mentor): A crisp sleep physician in his 60s, short silver hair, white lab coat over a shirt and tie, clipboard in hand, present-day.
- `nunn` — Charles Nunn (mentor): A rugged field anthropologist in his 50s, sun-weathered skin, short brown-grey hair, khaki field shirt with rolled sleeves, present-day.
- `tristan` — Tristan Harris (mentor): A lean tech ethicist in his 30s, short dark curls, earnest expression, plain black t-shirt under an open grey overshirt, present-day.
- `skinner` — B.F. Skinner (mentor): A mid-century behaviorist in his 50s, receding brown hair, horn-rimmed glasses, brown tweed suit with a bowtie, 1950s laboratory.
- `elvis` — Elvis Presley (extra): The King in his 30s, black pompadour with sideburns, white beaded jumpsuit with a high collar, 1970s Memphis.

## The icon test (most important)
Pick a `concept` only if a muted viewer seeing that icon WITHOUT the callout would guess the right
meaning. The icon's LITERAL reading must be the beat's claim — a metaphor the viewer has to decode
is read literally (Fahrenheit 451: chains for "numbness" read as "links", a medical cross for an
execution read as "healthcare", a coin for "the price we pay" read as "debt"). NEVER because a word
matches ("treating this TEXT as" is not a phone; "romance is the wrong reading" is not a heart).
What viewers actually read (measured in mute tests — data/icon-readings.json):
- medical: reads as healthcare, a hospital, being treated. NEVER for: an execution, a lethal injection, an injury while fleeing, an overdose handled coldly (read as benign care, F451 x3)
- phone: reads as a MODERN smartphone. NEVER for: any world before ~2000: 1950s TV walls, radios, telephones (read as smartphone anxiety, F451)
- family: reads as abstract geometric shapes (blind viewers do not see a family). NEVER for: caregiving, a household, relatives (Southern Book Club: read as a lamp and shadows)
- star: reads as a glowing decorative star. NEVER for: a character introduction or anything specific (read as nothing, F451)
- heart: reads as love, romance
- fire: reads as fire, burning. NEVER for: a job described as 'cleaning' unless the fire itself is the subject
- mask: reads as a false public face, pretending
- mirror: reads as self-image, reflection. NEVER for: appearance, looks or vanity, judging yourself against others (read as appearance-checking, the-courage-to-be-disliked readcheck #17 #109 #229)
- city: reads as a standing, intact city. NEVER for: a city being destroyed (it is drawn intact, F451)
- food: reads as a dinner plate with fork and knife, literal eating. NEVER for: a metaphor of consuming or enjoying anything else (read as dining, F451)
- coin: reads as literal cash on hand, plain endorsement of money. NEVER for: a vow about money, a doubt about money, or money-as-metaphor (die-with-zero readcheck: 2 misreads) — the attitude must come from the words and people, or the viewer reads endorsement
- door: reads as a way in or out, exclusion. NEVER for: 'no way out'
- puppeteer: reads as one person controlling others
- chains: reads as bound, imprisoned, controlled (drawn intact). NEVER for: numbness, stupefaction, silenced writers, surrender to technology, links or continuity (F451 holdout1+2: 4 misreads, read as 'links' / 'history')
- boulder: reads as a heavy burden sitting in the path. NEVER for: an internalized or reflective weight, or stress that comes from home/family (read as a burden others dumped on you, the-courage-to-be-disliked readcheck #283; also mutes a 'this weight is not yours' reveal, #1)
- crack: reads as an abstract orange branching line (blind viewers do NOT see a crack). NEVER for: cultural rot, conflict, a breakdown of society (F451 holdout2+3: described 3x as an abstract branching structure)
- clock: reads as time, a deadline. NEVER for: speed, environmental distortion, a lack of mental silence (read as literal schedule time, F451 x2)
- balance: reads as weighing two sides, fairness, justice. NEVER for: a critique, a reframing, a verdict on society (an empty tipped scale read as nothing, F451)
- shield: reads as protection
- trophy: reads as status, a prize. NEVER for: weakness
- hourglass: reads as time running out. NEVER for: an epidemic, a cost, a price paid (read as 'time passing', F451)
- target: reads as aiming at a goal, being targeted. NEVER for: where an idea came from, its origins (read as irrelevant, F451)
- gift: reads as a present, giving away
- inheritance: reads as a will, an estate, an heir
If nothing reads literally: `concept: null` and stage the PEOPLE doing the idea (face + body +
object) with a strong callout. A wrong icon is worse than none.
No single shared icon on more than 5% of the beats: an icon used for everything means nothing.

## This book's own icons (drawn for it — use them whenever the beat is ABOUT that thing)
- crystalRock: Shimmering Crystal Rock — a small rough stone with crystal points growing out of it, catching a glint of light
- skinnerBox: Skinner Box — the bare laboratory box with a lever and food pellets the pigeon pecks
- slotMachine: Slot Machine — the casino slot machine with spinning reels and a pull lever

## How staging reads (measured in mute tests)
- worried + talk: reads as SHOCKED (open mouth) — never for suppressed anger or quiet worry; use worried + slump or think (SBC #166)
- neutral face in closeUp: carries nothing — a close-up needs a face that IS the claim (SBC #88/#179/#220)
- neutral + idle, no icon: an empty frame: only the callout speaks — stage the person DOING the idea or give an icon (SBC: 24 beats)
- cast order: the FIRST cast member is drawn as the lead — put the person the sentence is ABOUT first (SBC #59 showed Carter on "the women do not feel safe")

## Negation, irony, fakery
When the narration says NOT / never / fake / scripted / pretend / hollow X, never stage X plainly
(F451: a warm embrace for "fake scripted validation" read as genuine warmth; a thoughtful face for
"he is NOT thinking about the ideas" read as valuing them). Stage the contrast instead: the empty
face beside the smiling screen, the forced smile (say so), the turned back.
Two people side by side must look clearly different (build, age, costume); two men in the same
uniform read as "identical men" — stage one of them.

## Staging the people (the picture must carry meaning, not only the text)
This is non-fiction: the 'cast' is usually `everyman` (the reader living the idea) or the author/host. Stage the idea as a person doing it: exhausted -> slump + worried, focused -> think, spending -> holds wallet/coin, time -> holds hourglass, choosing -> point. Use `narrator` only for pure show commentary. Named people (researchers, the author, case-study subjects) go on screen when the story bible has them.
Never happy over death or tragedy unless it is a fake smile.

## Callouts
2-5 words, the narrator's own concrete words from THIS beat; correct ASR spellings of names.
Every callout of 4+ words needs a function word (the/of/to/her/...), no keyword soup, max 7 words /
48 chars. `strike` = the narrator REJECTS the phrase; never for emphasis. No invented labels.
Every beat needs a callout OR a diagram OR an icon; pure banter ("Right.") may carry only staging.

## Diagrams (about 1 per 25 beats, only on structural beats)
flow = cause -> effect (2-3 labels, 1-2 words each, from the narration); sorter = 2-4 buckets;
spectrum = [left, right] + values[0..1]; matchWave = two rhythms syncing. A diagram beat has
concept null and callout null. Avoid bare template words as labels (DENIAL, CHANGE, GROWTH) — use
the narrator's phrase ("Family denial").

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every `i`.
