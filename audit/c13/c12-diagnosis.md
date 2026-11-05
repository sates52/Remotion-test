# c12 failure diagnosis (10 beats) - DEVELOPMENT / REGRESSION DATA ONLY

Source: `wt-c12/audit/c12-pilots` (contracts B/C, compile-log, B+C strips viewed, viewer descriptions, judge-p1/p2, tally.perBeat).
No re-render, no new rating. These beats are **not** a holdout: never use them to claim a c13 gain.
Arms: B = Director 1.0, C = Director 2.0. Overall comprehension A 30.6 / B 47.2 / C 38.9.
One strip per arm, two judge passes: a one-point gap is noise (C38). B and C had different authors, so authoring choices confound the design comparison.

| Beat | A/B/C | B type, entities | C type, entities | Primary | Secondary | Short evidence |
|---|---|---|---|---|---|---|
| C01 | 0/100/33.3 | H, 0 | B, 3 | quote-card-vs-forced-illustration | single-relation-vs-progressive-build | B quote 'invisible…excuse' = MATCH x2; C mask->reader read as 'hidden/fooled', effect NOT_SHOWN |
| C05 | 16.7/83.3/16.7 | B, 2 | A, 3 | authoring-choice | single-relation-vs-progressive-build, other:inside-relation-drawn-as-side-by-side | C author omitted 'empathy'; consciousness drawn as 2nd person beside a dimmed reader = 'replacement' |
| C16 | 16.7/83.3/16.7 | D, 4 | B, 3 | authoring-choice | single-relation-vs-progressive-build | B two lanes (every-time vs random) MATCH; C author dropped the random half |
| C24 | 50/50/0 | H, 0 | A, 3 | hypothetical-drawn-as-real | literal-verb, authoring-choice | 'literally proposed' -> C moveTo: car glyph crashes into WALL house; MISS + wrongInference x2 |
| C26 | 33.3/100/50 | A, 3 | A, 3 | authoring-choice | single-relation-vs-progressive-build | C: gavel RULES instead of TRUST, no name labels, cause dimmed; 'who is who' unclear |
| C30 | 33.3/83.3/16.7 | A, 3 | G, 3 | single-relation-vs-progressive-build | authoring-choice | C type G, events:[] - three items listed, no arrow; B chain message->Force->Death Star |
| C38 | 0/50/16.7 | B, 2 | B, 2 | authoring-choice | single-relation-vs-progressive-build | both read 'gravity feeds force'; C gravity as identical tank + dimmed FORCE; weak gap |
| C15 | 50/16.7/58.3 | H, 0 | A, 3 | quote-card-vs-forced-illustration | - | C reveal DOG beside analyst = 'noticed detail', effect CORRECT x2; B text only |
| C19 | 50/50/100 | H, 0 | A, 3 | claim-polarity | authoring-choice | C crossed VALIDATION heart -> briefcase, MATCH x2; B quote truncated to first sentence |
| C32 | 16.7/50/83.3 | F, 2 | D, 2 | claim-polarity | authoring-choice | B stock 'MINUTE' drains -> 'eats a minute' (wrongInference); C crossed 'a minute' vs 45 = CORRECT x2 |

## Question checklist (all 10 beats; details in c12-diagnosis.json)

- **Relation in one frame vs progressive build:** B held the relation lit in one frame in C05, C16, C26, C30, C38. C's reads dimmed the cause as the effect appeared (C01, C05, C16, C26, C38) or had no event at all (C30).
- **Quote card vs illustration:** quote card won in C01 and C24; illustration won in C15 (reveal of a noticed detail) and C19 (negated contrast). The card loses when the key's point is a change or a contrast the text card leaves out.
- **Polarity:** no arm showed a notAsserted part as true and got a polarityError. Borderline: C30 B drew the conditional climax (Death Star destroyed) as fact, not flagged. In C32 B's 'MINUTE' stock produced the key's wrong reading 'takes one minute'.
- **Hypothetical drawn as real:** C24 C, a proposed stink-bomb throw drawn as a done event (moveTo). The B quote kept 'proposed'.
- **Literal verb:** moveTo in C24 (a car crash). broken on a gavel in C26 read as 'rules broken', so no wrong event. present on a person in C05 read as someone arriving. reveal in C15 worked. size and cover were not used in these beats.
- **Authoring:** 4 primary + 4 secondary. Examples: C dropped the effect (C05, C16), used a substitute glyph (C26 gavel, C24 crash car), left out name labels (C26), chose type G (C30). B truncated the quote (C19) and picked the 'MINUTE' label (C32).

## Counts (primary)

- quote-card-vs-forced-illustration: 2
- authoring-choice: 4
- hypothetical-drawn-as-real: 1
- single-relation-vs-progressive-build: 1
- claim-polarity: 2
- literal-verb: 0

Secondary: single-relation-vs-progressive-build 5; other:inside-relation-drawn-as-side-by-side 1; literal-verb 1; authoring-choice 4

## KEEP from B

- Cause and effect both visible AND lit in the same frame for the last 2/3 of the beat: B rings the cause but keeps it in colour while the effect changes (C05, C16, C26, C30, C38). Never dim the cause when the effect appears.
- One explicit relation per frame (event + arrow); a contrast goes side by side in ONE frame (C16: two lanes, 4 entities, MATCH). Entity count was not the driver (2-4 entities in winning B frames); a missing or split relation was.
- Quote card (type H) when the key word is not drawable or the event did not happen ('invisible', 'excuse', 'proposed'): C01 B 100 vs C 33, C24 B 50 vs C 0.
- Draw the asserted EFFECT, not only the mechanism: B kept 'empathy rises' (C05) and 'random reward keeps pecking high' (C16); the C authors moved those into omitted.
- Name the cast on screen (STANTON / BUFFETT in C26 B); unlabelled look-alike people read as 'unclear who is who'.
- Use the narration's own noun for the stock (TRUST for 'breach of trust', C26 B) instead of a substitute glyph (gavel RULES).

## HURT in C

- Focus dimming in reads: the cause is greyed exactly when the effect appears, so no sampled frame shows the relation lit (C05 read as replacement, C26 cause NOT_SHOWN, C38 FORCE ambiguous, C01 subject dimmed, C16 pellet dimmed).
- Reads without an event (type G 'environment', events:[]): a list of items with dimming, no arrow, no relation (C30: B 83 -> C 17).
- moveTo realizing a proposed act as a completed physical event (C24: proposed stink bombs -> a car crashing into a house; MISS + wrongInference in both passes).
- Claim-first authoring that keeps the mechanism sentence and omits the key effect or the second half (C05 omitted empathy; C16 omitted random intervals).
- present:true on a person for an abstract inner thing: 'consciousness inside your mind' became a second person arriving beside the reader (C05).

## SAFE to carry from C (only what prevented an actual error)

- negated entities drawn crossed + claim.notAsserted for the rejected/setup half of a contrast: prevented an actual error in C32 (B's 'eats a minute' wrongInference) and carried the rejected premise in C19 (both MATCH, no endorsement).
- reveal for a discovered detail (C15: effect CORRECT in both passes, no wrong event) - one beat of evidence; optional, not default.
- NOT proven safe: claim.polarity/cueCheck text - in C24 and C30 the cueCheck reasoned past a proposal/conditional, so it did not by itself prevent errors.
