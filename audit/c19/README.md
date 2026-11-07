# C19 — the narrated action and its result across consecutive shots (dev/c19; first delivery)

Isolated copies only (no book was written). A = the production config's window as it is; B = the same window with only
the shot-planned beats replaced. Silent, no captions, same length and style. Renders on GitHub Actions.
Evaluators: two fresh agents (never human), counterbalanced X/Y order — round 1 silent frames only, round 2 the
word-timed narration (`ab/vtt-*.txt`). Third example recorded before any part was written (`third-example.json`).

## Critical timecodes (window seconds · frame; B v2)
| episode (window) | moment | narration word | B shows it |
|---|---|---|---|
| Burn #17–#25 (77.7 s) | axe rises | "Swing," 44.97 s · f1349 | from f1355 |
| | edge lands on the log | "strike," 45.77 s · f1373 | 45.90 s · f1377 (impact flash) |
| | the same log halves | "split." 46.57 s · f1397 | 46.57–47.0 s · f1397–1410 |
| | halves stay on the ground | — | next shot 47.5 s · f1426 and #22 52.7–59.9 s |
| Feel-Good #219–#227 (69.7 s) | foot aches | "ache." 16.40 s · f492 | worried face from f492 |
| | stops | "stop" 44.27 s · f1328 | slows from f1328 (E: +7 f) |
| | shoe off, in hand | "shoe." 45.87 s · f1376 | f1376 |
| | pebble found | "pebble" 47.07 s · f1412 | f1412 |
| | pebble removed (thrown away) | "remove" 48.90 s · f1467 | released f1469, in flight to f1491 |
| | runs again, smoothly | "resume" 50.17 s · f1505 | f1505, smiling |
| Lightning Thief #149–#150 (20.9 s) | ball out of the bag | "pulls" 4.97 s · f149 | in hand from f149 |
| | tossed | "tosses" 8.17 s · f245 | leaves the hand f247 |
| | Cerberus with the ball | "Cerberus" 13.20 s · f396 | f396 |

## Evaluators (v1) — what they read
- **A (all three):** "no action is shown; the text alone carries the idea" — every narrated result *not shown* (both).
- **B (all three):** both retold the action AND its result in order: strike → split (+4 / +3 frames after the words),
  pebble thrown away (+3 / +8), run resumed, ball tossed (+3) and lying by the dog. Flow: "yes" for B, "no / partly" for A.
- **Misreads in B v1 → fixed in v2:** objects faded in again at every cut ("flicker"); split log read as a "V / hinge /
  boat"; held shoe / ball on the take stand ("trophy", "ball on a stick") and shown 34–45 frames before the word;
  held shoe vs ground shoe in different colours ("two shoes"); pebble too small (E1 saw it 53 frames late); run
  resumed 5 frames before "resume" (cut on "And then"); ball thrown left while the dog stood right; Luther clean-shaven
  where the narration says "rough, untamed, dark beard" (A has it too).
- **Still open (v2, own look):** in #150 Cerberus overlaps Annabeth and partly hides the ball; "the largest … pieces of
  wood he can find" (plural, a hunt) is shown as one log split once.

## Frame-addressed rendering (HyperFrames principle)
Every new motion is a pure function of the frame. Seek stills vs the same frame of the sequential clip: PSNR 37 dB
(Burn, Lightning) / 33 dB (Feel-Good) on every critical frame = the h264 floor; 2 frames off: 24–31 dB while moving
(`ab/seek-vs-sequential-psnr.txt`).

## Reuse (the third example)
Lightning Thief was built ONLY from the Burn / Feel-Good parts (take, throw, hold, shot plan, cue-on-word) plus two
book-own customSvg icons (Cerberus, the red ball) in the isolated copy's motifs.json. No book-specific renderer code.

## Cost
A+B, 3 episodes (6 silent clips ≈ 11.6 k frames + pages + seek stills): ≈ 197 runner-minutes; B v2 re-render ≈ 115;
smoke 3. In production a C19 beat costs the same to render as the A beat it replaces (same frames, vector rig).

## Motion 1 in production (separate record)
the-choice-factory (pin 1445f823): 6 candidates, **1 B applied** (scene 299, transfer: cash → chips, agent A/B 16.7 →
66.7), 5 kept A (A/B). Preview at 45:30.8; clip rendered with the book's own code: `motion1-the-choice-factory-*.mp4`.
Observed: "chips" is drawn with the `game` icon — a chess knight (the evaluators read the same icon as "a horse"): a
wrong-object case the cycle-18 narration veto would catch; that pin predates it. The book's last mute run: FAIL
(WRONG 3; the sample did not include scene 299). how-to-make-money-in-stocks: 4 candidates, 0 B (A/B kept A twice).
Motion 2.0 books (pin 8d228546): free-to-focus, the-correspondent, unwind, zero-to-one — no single-relation step yet.
