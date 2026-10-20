# Storyboard authoring — As Good As Dead (Holly Jackson) · Antidote engine

You art-direct an animated summary. The audio is a two-host analysis. For EVERY beat decide what a
viewer with the SOUND OFF must see to understand what is being said. A wrong picture is worse than
none. Everything you write is ENGLISH. Book context: `books/as-good-as-dead/story-bible.json`.
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
  "continue": true,                  // optional, rarely: this beat keeps the previous beat's stage
  "explainedBy": "one sentence: the event, comparison or relationship this picture shows",
  "noVisual": null | "why nothing in the vocabulary can show it",
  "storyboard": { "claim": "...", "concreteVisual": "...", "onScreenText": "...",
                  "relationToPrevious": "...", "addedInformation": "... (write 'weak: ...' if honest)" } }
```

## The question for every beat (answer it BEFORE choosing anything)
"Which EVENT, COMPARISON or RELATIONSHIP makes this sentence's meaning visible?" — who does what to
whom; before vs after; this vs that; cause → effect; one side pressuring or controlling another.
Write the answer in `explainedBy`, then stage THAT answer:
- the cast DOING a readable action, with an object (`holds`) or with each other;
- a two-person relation (the asker and the one saying no; the one reaching out and the one turned away);
- a diagram when the claim is a structure (flow = cause → effect, sorter = parts, spectrum = degrees);
- relationship staging only where the narration states control through a message (section below).
The callout is a LABEL for the picture, not the carrier of the meaning. A face or a mood alone is not
an answer. There is no icon quota and no minimum number of objects: a wrong icon is worse than none.
`cast: []` means no person on screen — use it deliberately (an object, a diagram, the callout). It is
final: no engine step adds a figure (expression/action/holds are then unused). Leaving `cast` OUT lets
the engine choose who stands there.
If nothing in the vocabulary can show the meaning, write the reason in `noVisual`, then use the
clearest text-led staging. Measured 2026-10-17 (audit/authoring-ab-2026-10-17): with this question,
blind judges preferred the new storyboard 24 to 3 on 17 weak beats; image ADDS 9 -> 20 of 34.

## Vocabulary (nothing else renders)
- icons: crash, ledge, water, grave, medical, notes, phone, home, family, road, storm, star, heart, fire, tree, mask, mirror, key, law, photo, war, game, city, food, coin, door, lightbulb, puppeteer, chains, compass, boulder, crack, clock, balance, book, shield, trophy, hourglass, target, gift, inheritance, ductTapeRoll, chalkFigure, clawHammer, deadPigeon
- sets: horizon, office, street, room, stage, abstract, bedroom, court, forest
- shots: wide, medium, closeUp, twoShot, overShoulder, insert, split, silhouette, lowAngle, crowd, illustration, diorama, beforeAfter
- expressions: neutral, happy, sad, surprised, worried, angry, smirk, blank, afraid
- actions: idle, talk, point, celebrate, slump, think, walk, sit, hold, reach, lying, collapsed, falling, fighting, struggling, grabbing
- holds: book, phone, key, notes, letter, coin, cup, lightbulb, mask, photo, mirror, flower, compass, briefcase, shield, trophy, hourglass, target, magnifier, wallet, gift
- cast (story-bible keys):
- `pip` — Pip Fitz-Amobi (traumatised amateur sleuth turned calculated forensic orchestrator): an exhausted eighteen-year-old girl with dark brown hair in a loose low ponytail, dark circles under guarded hazel eyes, oversized knitted olive jumper and dark jeans
- `ravi` — Ravi Singh (Pip's steadfast partner who compromises his own moral innocence to protect her): a warm-faced nineteen-year-old British-Indian young man, thick dark wavy hair, warm dark eyes, dark navy chore jacket over a grey crewneck t-shirt
- `jason` — Jason Bell (Andie Bell's father, respected local business owner unmasked as the serial duct-tape killer): a cold imposing middle-aged man in his late forties, neatly parted brown-grey hair, sharp jawline, high-end navy quilted jacket over a dark sweater
- `max` — Max Hastings (wealthy unpunished serial predator whom Pip frames for Jason Bell's murder): a smug entitled twenty-one-year-old young man with styled blond hair, sharp aristocratic features, tailored designer jacket and crisp collar
- `hawkins` — DI Hawkins (dismissive local police detective who refuses to investigate Pip's stalker): a weary cynical police detective in his early fifties, thinning grey hair, rumpled charcoal grey suit and loosened dark tie
- `luke` — Luke Eaton (local dealer from whom Pip illegally buys sleeping pills to blunt her trauma): a guarded young man in his mid-twenties, shaved head, heavily tattooed neck, black oversized hoodie
- `cara` — Cara Ward (Pip's loyal lifelong best friend whose home provides an unwitting alibi): an affectionate eighteen-year-old girl with shoulder-length warm brown hair, soft expressive features, colourful patterned cardigan
- `narrator` — Narrator (the host voice analyzing the psychological deconstruction): a neutral narrator figure, analytical presence

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
- game: reads as a chess knight: strategy, a calculated move (redrawn 2026-10-17; the old drawing was a trophy cup read as winning 3/3). NEVER for: winning, a prize, an award
- city: reads as a standing, intact city. NEVER for: a city being destroyed (it is drawn intact, F451)
- food: reads as a dinner plate with fork and knife, literal eating. NEVER for: a metaphor of consuming or enjoying anything else (read as dining, F451)
- coin: reads as literal cash on hand, plain endorsement of money. NEVER for: a vow about money, a doubt about money, or money-as-metaphor (die-with-zero readcheck: 2 misreads) — the attitude must come from the words and people, or the viewer reads endorsement
- door: reads as a CLOSED BOOK, a story (blind icon sheet: 3 of 3 named it a book, none a door). NEVER for: a door, a way in or out, exclusion, 'no way out' — viewers do not see a door until it is redrawn
- puppeteer: reads as one person controlling others
- chains: reads as bound, imprisoned, controlled (drawn intact). NEVER for: numbness, stupefaction, silenced writers, surrender to technology, links or continuity (F451 holdout1+2: 4 misreads, read as 'links' / 'history')
- boulder: reads as a heavy burden sitting in the path. NEVER for: an internalized or reflective weight, or stress that comes from home/family (read as a burden others dumped on you, the-courage-to-be-disliked readcheck #283; also mutes a 'this weight is not yours' reveal, #1)
- crack: reads as an abstract orange branching line (blind viewers do NOT see a crack). NEVER for: cultural rot, conflict, a breakdown of society (F451 holdout2+3: described 3x as an abstract branching structure)
- clock: reads as time, a deadline. NEVER for: speed, environmental distortion, a lack of mental silence (read as literal schedule time, F451 x2)
- balance: reads as weighing two sides, fairness, justice. NEVER for: a critique, a reframing, a verdict on society (an empty tipped scale read as nothing, F451)
- shield: reads as protection
- trophy: reads as status, a prize. NEVER for: weakness; sabotage, crisis, a rejected title or prize the narration refuses (burn-of-the-everflame framecheck 2026-10-16: read as winning 5x)
- hourglass: reads as time running out. NEVER for: an epidemic, a cost, a price paid (read as 'time passing', F451)
- target: reads as aiming at a goal, being targeted. NEVER for: where an idea came from, its origins (read as irrelevant, F451)
- gift: reads as a present, giving away
- inheritance: reads as a will, an estate, an heir
If nothing reads literally: `concept: null` and stage your `explainedBy` answer (an action with an
object, two people in a visible relation, or a diagram); a face with a callout is the last resort.
A wrong icon is worse than none.
Icon behaviour (optional): `"conceptMotion": "spin"` on a `compass` beat makes it spin fast and never settle, starting on the callout's word (or on `"conceptMotionCue": "<phrase spoken in this beat>"`). Use it only when the narration says the thing spins / turns uselessly / keeps changing direction; leave it out otherwise (the compass then just sways).
Continuing a stage (optional): `"continue": true` means "this beat continues the previous beat's stage": no transition, and whoever/whatever was already on screen stays — the same cast member does not walk in again, the same icon does not pop in again, the same diagram is not rebuilt (only its NEW labels/values draw in). Use it inside a sequence when the next beat keeps the same set and the same person/object/diagram and only something changes (a face, an action, a held object, one more label). Never as a default, never on the first beat, and only with the same `set` as the previous beat; a new person in a continued beat still enters normally.
No single shared icon on more than 5% of the beats: an icon used for everything means nothing.

## This book's own icons (drawn for it — use them whenever the beat is ABOUT that thing)
- ductTapeRoll: Duct Tape Roll — a heavy roll of duct tape with an unspooling strip
- chalkFigure: Chalk Stick Figure — a crude chalk stick figure drawn on asphalt
- clawHammer: Claw Hammer — a heavy steel claw hammer with a wooden handle
- deadPigeon: Dead Pigeon — a headless dead bird lying on the ground

## How staging reads (measured in mute tests)
- worried + talk: reads as SHOCKED (open mouth) — never for suppressed anger or quiet worry; use worried + slump or think (SBC #166)
- neutral face in closeUp: carries nothing — a close-up needs a face that IS the claim (SBC #88/#179/#220)
- neutral + idle, no icon: an empty frame: only the callout speaks — stage the person DOING the idea or give an icon (SBC: 24 beats)
- cast order: the FIRST cast member is drawn as the lead — put the person the sentence is ABOUT first (SBC #59 showed Carter on "the women do not feel safe")
- happy on the antagonist: reads as a FRIENDLY man — the muted viewer does not know he is the villain. Use smirk (charm with an edge) or angry for the threat; happy only for genuine warmth (SBC run6 #2/#78/#108)
- physical states the rig cannot draw: biting and a death scene with blood are still not drawn. Lying, collapsed, falling, fighting, struggling and grabbing ARE actions now (2026-09-28, rows below): never again stage "lies paralyzed on the floor" with standing people (SBC #189 read as nothing happening)
- action lying: reads as LYING DOWN on a bed (blind: "lying", "lying down" in wide and bust framing) — for in bed / ill / resting / lying awake. The rig's low bed is sometimes read as a bench or treadmill: put it in a room set
- action collapsed: reads as FALLEN / FAINTED — a body sprawled on the floor, eyes shut (blind: "fallen", "fainting") — for collapses, knocked out, found on the floor, dead
- action falling: reads as FALLING — tipped, airborne, flailing, motion streaks (blind: "falling") — for falls, trips, being pushed; afraid/surprised face
- action fighting: WITH a second cast member reads as FIGHTING (blind: "fighting", a scuffle with impact bursts); ALONE it reads as "fuming" — an angry man thrusting a fist. merge refuses it alone
- action grabbing: WITH a second cast member reads as GRABBING (blind: "grabs the startled boy by the arm"); the partner is drawn struggling. ALONE it reads as "walking". merge refuses it alone
- action struggling: WITH a second cast member (drawn grabbing) reads as BEING GRABBED and pulling away (blind: "grabbing", "flinches back"); ALONE it reads as "recoiling / startled". merge refuses it alone
- action reach: alone with no motif it reads as "waving" — reach needs its subject on screen (an icon or held object)
- crowd / multiple figures: the crowd shot repeats ONE person many times — viewers see ghost duplicates, never "a community"
- new faces (2026-09-26): angry = threat, rage, confrontation · smirk = sinister charm, manipulation, the predator smiling · blank = apathy, numbness, indifference ("pure apathy") · afraid = fear, terror (surprised is NOT fear: it reads as "wow")

## Negation, irony, fakery
When the narration says NOT / never / fake / scripted / pretend / hollow X, never stage X plainly
(F451: a warm embrace for "fake scripted validation" read as genuine warmth; a thoughtful face for
"he is NOT thinking about the ideas" read as valuing them). Stage the contrast instead: the empty
face beside the smiling screen, the forced smile (say so), the turned back.
Two people side by side must look clearly different (build, age, costume); two men in the same
uniform read as "identical men" — stage one of them.

## Staging the people (the picture must carry meaning, not only the text)
Put on screen the characters the sentence is ABOUT (not the host). Give them the face and body of the moment: grief -> sad + slump, fear -> worried, revelation -> surprised, a forced polite smile over pain -> happy (say so), accusing -> point, grasping -> reach, arriving/leaving -> walk. Give them the object they handle (letter, photo, key, cup).

Physical situations are real poses — use them instead of standing people when the sentence is about the body. fighting / grabbing / struggling need TWO cast members (alone they read as fuming / walking / recoiling):
- `lying`: lying in bed / resting / ill / lying awake (the rig brings its own bed)
- `collapsed`: fainted / knocked out / dead / lies on the floor (eyes shut, bare floor)
- `falling`: falls / trips / is pushed / plunges
- `fighting`: a fight or an attack — the lead punches toward the second cast member, who fights back
- `struggling`: straining to break free / resisting / being held — the second cast member holds them (grabbing)
- `grabbing`: grabs / seizes / snatches someone or something — the second cast member struggles
Never happy over death or tragedy unless it is a fake smile.

## Callouts
2-5 words, the narrator's own concrete words from THIS beat; correct ASR spellings of names.
Every callout of 4+ words needs a function word (the/of/to/her/...), no keyword soup, max 7 words /
48 chars. `strike` = the narrator REJECTS the phrase; never for emphasis. No invented labels.
Every beat needs a callout OR a diagram OR an icon; pure banter ("Right.") may carry only staging.

## Relationship staging (optional; only where the relationship IS the claim)
Use it when the narration states that one side controls, steers or pressures another THROUGH A
MESSAGE (a story, a promise, demands, threats, warnings), and at least one of: the narration calls
the message a lie, rejects a method ("not with guns"), negates a reading ("this isn't about X"), or
the controlled side takes control back. Not for a mood, a hinted analogy, or anything not stated.
Set `"stageRelationship": true`, `"cast": []`, `"callout": null`, `"concept": null`, no diagram, no holds, and write
`"relationship"`. Every value needs an exact quote from THIS beat or its two neighbours as
`{ "beat": N, "quote": "..." }`; leave out any field no quote supports:
- `source` / `target`: `{ value, group, evidence }`; `group` is a key of story-bible `groups` (below).
- `relation`: `{ value, evidence }` ("keep them down" also lowers the controlled side; other relations draw no effect).
- `means`: `{ value, label: {beat, quote}, evidence }`; `label.quote` is the panel text and must be spoken in this beat.
  Add `falseMarker: {beat, quote}` ONLY if the narration says the message is a lie.
- `rejectedMethod`: `{ value, icon: "gun", scope: "<spoken phrase>", evidence }`.
- `negation`: `{ value: "<negated word>", icon: "text", scope: "<spoken phrase>", evidence }`.
- `counterAction`: `{ value, icon: "wheel", label: [{beat, quote}], cue: {beat, quote, keyword} }`.
- `modality`: `{ value: "asserted" | "advice" | "analogy" | "hypothetical", evidence }`; `speaker`: null unless quoted.
Each group must exist in `books/<slug>/story-bible.json` → `groups`: `{ role: "ruling"|"controlling"|"ruled"|"controlled",
label, body: "#RRGGBB", accent: "#RRGGBB", count?, evidence: { source, quote } }`. A group can be one person (count 1).
Then run `node scripts/gate-b-relationship.js --slug=<slug>` (a different model family checks every field).
merge refuses a staged beat without a current STAGE verdict; on FALLBACK, author the beat normally.
Use it on a handful of beats per book, not as a template.

## Diagrams (about 1 per 25 beats, only on structural beats)
flow = cause -> effect (2-3 labels, 1-2 words each, from the narration); sorter = 2-4 buckets;
spectrum = [left, right] + values[0..1]; matchWave = two rhythms syncing. A diagram beat has
concept null, callout null and `cast: []`: the diagram fills the frame and shows nobody (merge refuses a
diagram beat with a cast). Avoid bare template words as labels (DENIAL, CHANGE, GROWTH) — use
the narrator's phrase ("Family denial").

## Sequences — explain ONE idea across several beats (plan them before the single beats)
Many passages develop one idea over 4-12 beats: a story the hosts tell (someone wakes up, gives in, pays the
price) or an argument with steps (it feels good -> but look at the cost -> so it backfires). A muted viewer
follows such a passage only if the picture DEVELOPS with it. Before authoring those beats one by one:
1. Name the passage's single idea in one sentence; each beat's `explainedBy` = that idea + what this beat adds.
2. Choose ONE stage that carries it and KEEP it while the idea lasts: the same person(s) (same cast keys), the
   same object (same `concept`/`holds`) or the same diagram (same type, one more label per beat), in the same
   `set`. Do not swap in a new icon, set or person each beat. Mark kept beats `"continue": true`.
3. Show start -> meaningful change -> result: from beat to beat change ONLY what the narration changes (the
   action, the face, what is held, one diagram label, the callout); `storyboard.relationToPrevious` states
   exactly that change.
4. The callout LABELS the change ("52 UNREAD", "NOT A SINGLE VECTOR LINE"); if only text can carry it, say so in
   `noVisual` (a vocabulary gap, reported, not hidden). Never invent events, numbers or objects.
5. The kept object must READ as the thing itself (the icon test): never keep an abstract stand-in across a
   sequence (a target icon for "the important task" was read as "the inbox-zero goal" in every beat it stayed —
   keeping a misread symbol spreads the misread). If no icon reads as the thing, keep the PERSON and change what
   they hold, do and feel; the change must be visible in the face, the action or the object, not only the text.
Measured 2026-10-19 (audit/sequence-lab-2026-10-19), blind pairwise, 2 judges each: fiction (burn 96-104, the old
version swapped people every beat) — new preferred 2/2, idea YES vs PARTLY, wrong beats 3 -> 1; non-fiction
(15-secrets 73-81, the old version already kept one person with rich faces) — OLD preferred 2/2 because the new one
kept an abstract target icon (rule 5). Use sequences to stop re-casting and rebuilding, not to replace faces.
An abstract idea mapped to a POSE alone (slump = failure, think = strategy) is mood, not explanation: give the
pose the object or the second person the narration names.

## Output
Return ONLY a JSON array for your chunk. Validate it parses and matches every `i`.
