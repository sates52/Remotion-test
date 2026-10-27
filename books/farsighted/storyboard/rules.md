# Storyboard authoring — Farsighted (Steven Johnson) · Antidote engine

You art-direct an animated summary. The audio is a two-host analysis. For EVERY beat decide what a
viewer with the SOUND OFF must see to understand what is being said. A wrong picture is worse than
none. Everything you write is ENGLISH. Book context: `books/farsighted/story-bible.json`.
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
  "partnerExpression": "<expression>", // optional, two-person cast: the SECOND person's face (else neutral)
  "partnerAction": "<action>",       // optional, two-person cast: the SECOND person's body (else idle)
  "continue": true,                  // optional: only where this beat keeps the previous beat's stage (Sequences)
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
Stage the answer ON THE BEAT THAT SAYS IT — read your `explainedBy` back and show what it names:
- an EVENT (someone does something): stage the deed — an action from the vocabulary, `take` / `embrace` with an
  `actionCue` on the word where it happens, the object in hand ("Actions that HAPPEN", below);
- a MECHANISM (how X works, how X leads to Y): the diagram, or the person working the object, on THIS beat — the
  one where the narration explains it, not the beat before or after;
- a CAUSE and its EFFECT: cause -> change -> result; when that takes more than one beat, keep the stage with
  `continue` and change only what the narration changes ("Sequences", below);
- a RELATIONSHIP: the two people do something TO each other (one asks and one refuses, one reaches out and one
  turns away, one holds on and one pulls back) with different faces; two people standing side by side only
  shows that two people exist.
Measured (sealed blind mute tests, 150 frames, 2026-10-22): a lone figure with a callout explained 0 of 43 beats,
a person with an icon 3 of 44, a diagram 4 of 8. The usual miss: the diagram sits on the neighbouring beat and
the beat that explains the mechanism shows a talking head. A face, a callout or a single figure stays right when
the sentence IS about a feeling, a reaction or plain commentary — show the mechanism when the narration has one;
never add a diagram, an action or a second person the narration does not have.
`cast: []` means no person on screen — use it deliberately (an object, a diagram, the callout). It is
final: no engine step adds a figure (expression/action/holds are then unused). Leaving `cast` OUT lets
the engine choose who stands there.
If nothing in the vocabulary can show the meaning, write the reason in `noVisual`, then use the
clearest text-led staging. Measured 2026-10-17 (audit/authoring-ab-2026-10-17): with this question,
blind judges preferred the new storyboard 24 to 3 on 17 weak beats; image ADDS 9 -> 20 of 34.

## Vocabulary (nothing else renders)
- icons: crash, ledge, water, grave, medical, notes, phone, home, family, road, storm, star, heart, fire, tree, mask, mirror, key, law, photo, war, game, city, food, coin, door, lightbulb, puppeteer, chains, compass, boulder, crack, clock, balance, book, shield, trophy, hourglass, target, gift, inheritance, prosConsList, compoundModel, optionC, sinkingHouse, dog, helicopter, hedgehog, fox
- sets: horizon, office, street, room, sky, abstract, kitchen, library, court, forest, shore, highway, workstation
- shots: wide, medium, closeUp, twoShot, overShoulder, insert, split, silhouette, lowAngle, crowd, illustration, diorama, beforeAfter
- expressions: neutral, happy, sad, surprised, worried, angry, smirk, blank, afraid
- actions: idle, talk, point, celebrate, slump, think, walk, sit, hold, reach, lying, collapsed, falling, fighting, struggling, grabbing, take, embrace
- holds: book, phone, key, notes, letter, coin, cup, lightbulb, mask, photo, mirror, flower, compass, briefcase, shield, trophy, hourglass, target, magnifier, wallet, gift
- cast (story-bible keys):
- `everyman` — The Listener (the contemporary listener facing a big choice: a job offer, a house, a hire, a launch, a partnership): A 34-year-old American professional with short dark brown hair, wearing a teal casual button-up shirt and grey chinos.
- `darwin` — Charles Darwin (naturalist who weighs marriage on a two-column list in 1838, and later weighs publishing his theory against his wife's faith): A Victorian English gentleman of about 30 with a receding hairline, brown muttonchop sideburns, a black frock coat and white high collar.
- `emma` — Emma Darwin (Darwin's wife, whose faith after their daughter's death his theory would wound): A Victorian Englishwoman in her thirties with dark hair parted in the middle in a low bun, wearing a deep plum high-necked dress.
- `franklin` — Benjamin Franklin (invents 'moral algebra' in a 1772 letter to Priestley): An elderly 18th-century American statesman, balding with long grey hair at the sides, small round spectacles, brown wool coat.
- `priestley` — Joseph Priestley (scientist agonizing over a job offer from the Earl of Shelburne; Franklin's friend): An 18th-century English clergyman-scientist of about 40 with short brown hair, a plain black coat and a white clerical neckband.
- `lenfant` — Pierre L'Enfant (French architect who proposes cleaning Collect Pond and making it a public park): A French architect of about 50 in 1802, dark hair tied back, navy blue tailcoat with a rolled plan under his arm.
- `alderman` — The City Council (the 1802 New York council and developers who reduce Collect Pond to a binary and fill it in): A stout New York merchant-alderman of 1802 with grey sideburns, black top hat and a mustard waistcoat under a dark coat.
- `brennan` — John Brennan (counterterrorism adviser who demands the analysts disprove their own theory): A balding American official in his fifties with short grey hair at the sides, a charcoal suit, white shirt and dark red tie.
- `analyst` — The CIA Analyst (intelligence analyst mapping the Abbottabad compound and building the case): A 38-year-old woman analyst with a dark brown ponytail, glasses, a light blue blouse under a navy cardigan and an ID badge.
- `ceo` — The CEO (the boss at the head of the table whom everyone agrees with too quickly): A confident man of 55 with slicked silver hair in a navy three-piece suit and light blue tie.
- `colleague` — The Dissenting Colleague (the cognitively peripheral voice in the room: holds the unshared fact, a juror from a different background): A 30-year-old Black woman with natural curly hair, wearing a mustard yellow blazer over a black top.
- `johnson` — Steven Johnson (the author, weighing a move from Brooklyn to Marin County with his wife): An American writer around 45 with short sandy-brown hair, light stubble and glasses, wearing a green flannel shirt.
- `wife` — Johnson's Wife (weighs her Brooklyn friendships against California): A woman around 45 with shoulder-length auburn hair, wearing a burgundy sweater and dark jeans.
- `eliot` — George Eliot (Victorian novelist writing Middlemarch at her desk): A Victorian Englishwoman of about 50 with brown hair parted in the centre over the ears, wearing a dark grey dress with a white lace collar.
- `dorothea` — Dorothea Brooke (Middlemarch's idealistic heroine choosing whether to marry Casaubon): A young Victorian woman of 19 with dark chestnut hair in braids, wearing a plain pale lavender dress.
- `casaubon` — Mr. Casaubon (the dry, pedantic old scholar Dorothea is drawn to marry): A gaunt Victorian scholar of about 50 with thin white hair, a black scholar's coat and a book always in hand.

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
If nothing reads literally: `concept: null` and stage your `explainedBy` answer on this beat (an action with
an object, two people in a visible relation, or a diagram); when the sentence narrates an event or a mechanism,
a face with a callout is the last resort.
A wrong icon is worse than none.
Icon behaviour (optional, author-chosen; the engine never adds one):
  - `"concept": "compass", "conceptMotion": "spin"`: spins fast and never settles — only when the narration says it spins / turns uselessly / keeps changing direction
  - `"concept": "chains", "conceptMotion": "break"`: STATE CHANGE: intact chains snap apart at the cue and stay broken — only when the narration says the bond / curse / chain is broken
  - `"concept": "phone", "conceptMotion": "light"`: STATE CHANGE: a dark phone screen lights up with a message at the cue and stays lit — only when the narration says the screen lights up / a message or notification arrives
  It starts on the callout's word, or on `"conceptMotionCue": "<phrase spoken in this beat>"` — put the cue on the word where the change HAPPENS. A STATE CHANGE shows the start state before the cue and the end state after it, on every frame. The start state is this beat (or the beat before it, with `continue`); the end state is kept: a continued beat with the same icon after a state change repeats the same `conceptMotion` (merge refuses otherwise — the icon would jump back to its start state). Without the field the icon keeps its default drawing. The label names the change; the icon must SHOW it.
Continuing a stage (optional): `"continue": true` means "this beat continues the previous beat's stage": no transition, and whoever/whatever was already on screen stays — the same cast member does not walk in again, the same icon does not pop in again, the same diagram is not rebuilt (only its NEW labels/values draw in). Use it inside a sequence when the next beat keeps the same set and the same person/object/diagram and only something changes (a face, an action, a held object, one more label). Never as a default, never on the first beat, and only with the same `set` as the previous beat; a new person in a continued beat still enters normally.
Actions that HAPPEN (optional): when the narration says someone DOES it (picks up, grabs, hugs), stage the deed, not a face + caption — check every such sentence before you reach for a face.
  - `"action": "take", "holds": "<object>"` — the object rests in front of the first cast member, who reaches for it; on the cue the hand closes on it and brings it in; it stays in hand ("grabs their phone", "picks up the letter").
  - `"action": "embrace", "cast": ["<who moves>", "<who is embraced>"]` — exactly two people: the first closes the gap, they hold each other from the cue, the partner embraces back ("launches herself into his arms", "they hug"). `"partnerExpression": "<face>"` gives the SECOND person's face (else neutral — the engine never invents a feeling). The FIRST cast member is the one who DOES it (reaches first, wraps high, drawn in front); the second receives — put the doer first.
  - GIVING / HANDING something over ("she hands him the shield", "gives her the key"): the giver holds it first
    (`"cast": ["<giver>", "<receiver>"], "action": "hold", "holds": "<object>"`); the beat that says the hand-over is
    a `continue` beat with the RECEIVER first: `"cast": ["<receiver>", "<giver>"], "action": "take", "holds": "<the same object>",
    "actionCue": "<the giving word>", "partnerAction": "reach"` (the giver's arm still held out). Measured (skin-in-the-game
    228-231, blind sequence strip at the hand-over): who gave, to whom and which object all read YES; one person holding
    the object while the other just stands there did not. The engine stages the pair facing each other and the object
    in the GIVER's outstretched hand until the cue, then in the receiver's. Give the two beats NO `concept` icon of the
    same object: it floats between their hands and reads as a second one (inside-out 29-30, blind: "two keys swapping
    hands" — whose hand PARTLY; without it YES). Keep the receiver's later beats `continue` + `"action": "hold"`.
  A held object is lifted clear of the captions automatically; a `closeUp` shows no hands — never frame an object beat as closeUp.
  Put `"actionCue": "<phrase spoken in this beat>"` on the word where the deed happens (else 40% into the beat). Who does it, to whom/what and when are yours; the engine adds nothing. In a `continue` beat after a take the same person keeps holding it (`"action": "hold", "holds": "<the same object>"`; merge refuses otherwise); a continued embrace repeats `"action": "embrace"` with the same two and is not replayed.
No single shared icon on more than 5% of the beats: an icon used for everything means nothing.

## This book's own icons (drawn for it — use them whenever the beat is ABOUT that thing)
- prosConsList: Pros and cons list — a notebook page split down the middle into two columns: ticks on the left, crosses on the right
- compoundModel: Walled compound model — a scale model of a walled house compound with barbed wire on the walls, sitting on a table
- optionC: Fork in the road with a third path — a road splitting left and right, with a third dotted path straight ahead to a bright star
- sinkingHouse: House sinking into a swamp — a tilted house sinking into dark marsh water, with foul smell rising
- dog: Dog — a dog standing in profile with a collar
- helicopter: Military helicopter — a military helicopter with main rotor, tail rotor and landing skids
- hedgehog: Hedgehog — a hedgehog curled with sharp spines
- fox: Fox — the face of a red fox with pointed ears and white cheeks

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
- hair messy (cast look): its two tufts read as HORNS (blind: "horns", "devil horns") on 111/403 frames of messy-haired figures (28%, 23 books); every other hair style 4/1755. Never for a sympathetic or ordinary character — in the story bible give them short, curly, bun or long hair (mute data 2026-10-22)
- action think: reads as POINTING or a raised-finger gesture (blind: "points", "gestures": 80-162 of 315 single-figure frames, 28 books) and as thinking only 16/315 (5%). Never to show that someone thinks, wonders or decides: put what the thought is about on screen (the icon or the held object). The "worried + talk" row's alternative "worried + think" carries the same risk: prefer worried + slump (mute data 2026-10-22)
- worried face: reads as WORRY (307/471, 65%) and almost never as fear (12/471, 3%) — for fear use afraid (afraid = fear, row above); worried is for concern, anxiety, unease (mute data 2026-10-22)
- holds notes: the held note is missed in 1 of 3 frames (named as a note, paper or card in 49/73, 21 books) — when the note itself matters, name it in the callout or make it the icon (mute data 2026-10-22)

## Negation, irony, fakery
When the narration says NOT / never / fake / scripted / pretend / hollow X, never stage X plainly
(F451: a warm embrace for "fake scripted validation" read as genuine warmth; a thoughtful face for
"he is NOT thinking about the ideas" read as valuing them). Stage the contrast instead: the empty
face beside the smiling screen, the forced smile (say so), the turned back.
Two people side by side must look clearly different (build, age, costume); two men in the same
uniform read as "identical men" — stage one of them.

## Staging the people (the picture must carry meaning, not only the text)
This is non-fiction: the 'cast' is usually `everyman` (the reader living the idea) or the author/host. Stage the idea as a person DOING it with the thing the narration names — a pose alone is a mood, not the idea: drowning in email -> holds phone + slump (not slump alone), spending -> holds wallet/coin, a deadline -> the clock beside a worried face, saying no to someone -> two people, one refusing. Prefer a sequence (one person, one object, changing) over a new pose per beat. Use `narrator` only for pure show commentary. Named people (researchers, the author, case-study subjects) go on screen when the story bible has them.
Two people: stage the SECOND person's reaction on purpose — `partnerExpression` (their face) and `partnerAction`
(their body, from the actions) on a two-person cast. What you leave out stays neutral / idle: the engine never gives
the partner a feeling of its own. Only a verb that reads as a pair moves the partner with it (fighting <-> fighting,
grabbing <-> struggling, embrace <-> embrace); merge refuses a partnerAction that contradicts the pair. There is no
gesture quota: when the narration has the other side react (refuses, listens, is accused, gives in), show it.

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

## Diagrams (only where the narration states a structure — no quota either way)
Put the diagram on the beat that explains the structure (a mechanism, a cause -> effect, parts, degrees). A
diagram on a beat without a structure is noise; a structure left to a talking head is a missed explanation.
flow = cause -> effect (2-3 labels, 1-2 words each, from the narration); sorter = 2-4 buckets;
spectrum = [left, right] + values[0..1]; matchWave = two rhythms syncing, ONE label (what syncs).
What the screen draws: flow at most 3 labels, sorter at most 4, spectrum exactly 2 poles, matchWave exactly 1 —
merge refuses anything else (an extra label is not drawn; a spectrum without both poles shows LESS / MORE).
Spread more labels over the next beats (a new diagram picks up where this one ends). A diagram beat has
concept null, callout null and `cast: []`: the diagram fills the frame and shows nobody (merge refuses a
diagram beat with a cast). Avoid bare template words as labels (DENIAL, CHANGE, GROWTH) — use
the narrator's phrase ("Family denial").
A diagram can be BUILT across a passage — only when the narration itself builds a cause -> effect chain or a change
of state step by step (not for a list of separate points, a feeling or a story moment): put the first label(s) on
the beat where the structure starts, then keep
it with `"continue": true` and the same type on the next beats, adding ONE label per beat (flow up to 3, sorter
up to 4 — merge refuses more) or moving the marker (spectrum `values`) as the narration moves — earlier labels stay
where they are and only the new part draws in. Prefer this to a diagram on one beat followed by talking heads that
explain the same structure (burn 100-104: a sorter on 100, three faces, a flow on 104 — one growing diagram carries
the argument).

## Sequences — explain ONE idea across several beats (plan them before the single beats)
Many passages develop one idea over 4-12 beats: a story the hosts tell (someone wakes up, gives in, pays the
price) or an argument with steps (it feels good -> but look at the cost -> so it backfires). A muted viewer
follows such a passage only if the picture DEVELOPS with it. Before authoring those beats one by one:
0. Make an idea map of your chunk first (for yourself, not a field): each passage as "beats a-b: <the one idea> —
   kept stage: <the growing diagram / the object that changes>", or "single beats" when every sentence there is its
   own point. Most chunks are mostly single beats; a chunk with no sequence is normal. Do not force a sequence: a
   passage of separate points stays single beats, and a
   feeling or a reaction stays a face. If the context entries before your chunk show a stage the idea is still
   using, your first beat may `continue` it (continue works across chunks); an idea that runs past your last beat
   ends on a beat the next author can continue.
   Measured (P1, 2026-10-23, blind strips): a diagram that grows with the argument explained it (burn 100-104: a
   flow gaining one label per beat — the cause chain read with nothing invented); the same two people kept across a
   story did NOT explain it when the thing the story turns on was never drawn (philosophy 172-177: the fox, never
   on screen — the mechanism was text only); a spectrum carried for two beats and then dropped for faces read only
   PARTLY (confidence-gap 161-164: the bird in the room was never drawn). So the kept stage must hold the thing that
   changes — the diagram, or the signature object (`motifs.json` icon) — not only the people reacting to it.
   When the narration CHANGES that object (it is buried, breaks, collapses, sprouts) and this book has an icon for
   each state (e.g. `figTree` → `figTreeBuried` → `figTreeSprouting`): the start state on the beat before, the
   after-state on the beat that SAYS the change, `"continue": true` — the new state draws in at the cut. Measured
   (P2-A, island 23-26 + 223-224): one static icon read the change NO/PARTLY, two state icons PARTLY/YES.
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
