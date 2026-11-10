# C19 sequence — an action and its result across consecutive shots (authoring)

For the rollout author (runbook §2d). **Never shown to blind readers, describers or judges.**
A C19 sequence shows what the narration says HAPPENS — someone acts on an object and the result stays — in 2–4 shots
cut on the narrator's own words, inside one beat or over consecutive beats (`scene.shots`; the beat keeps its id, start,
length and transition). Validator: `scripts/lib/c19-sequence.js`; tool: `scripts/c19.js`.

## When (all must hold — `c19.js scan` proposes, you decide)
- The narration STATES a physical action on a nameable object and its result ("Swing, strike, split"; "You take off your
  shoe … remove it … resume running"; "pulls a ball out of her bag and tosses it"). Not a metaphor, not a hypothetical,
  not a rejected option, not quoted opinion.
- Every object you draw is NAMED in the narration (hand objects: axe, shoe, pebble, ball, sword, cup, …; anything else a
  book-own icon in motifs.json with `words` naming it).
- **Opening first:** candidates marked `opening` (the first 90 s) are decided first — a stated action there sets the film's
  tone; the bar is the same (stated, every object named, the rig can do it, its own A/B).
- Not when the beat is already good, when the action needs a body the rig cannot do, or when only a feeling changes.

## The beat's main idea first (operator 2026-11-09 — Free to Focus #5 lost B 0 vs A 16.7 on a side detail)
For EVERY candidate write, one sentence each, in the contract and in `author-decisions-c19.json`:
- `mainIdea` — what the beat is ABOUT (the narrator's point, not every detail it mentions);
- `howShown` — how the chosen action makes THAT idea visible;
- `actionIsCentral` — `true` only if the action IS the idea (or directly shows it). A side detail ("the colleague drops
  cash on the table" while the beat is about the heart-attack panic) → `false` → no contract; A stays, reason recorded.
The narration review checks the same thing on the rendered frames (main idea shown? the needed object readable?) and
vetoes B if either fails.

## Words and objects
- The beat's own words stay on screen through the inner cuts with their original in / out timing (automatic). Drop them
  only with a one-sentence reason (`beats[i].dropTexts`) — never because the sequence "speaks for itself".
- The object the action needs must be told apart at real output size. Small hand objects are drawn 1.8× in full-body
  shots and every C19 hand object gets a light outline (automatic); if it is still small, cut the shot closer (medium)
  or choose the clearer asset (`cash` banknotes for cash / money, not `coin`). Still unclear in the A/B → B is vetoed.

## Contract (`books/<slug>/single-relation/c19/contracts/<firstBeat>.json`)
```json
{ "schema": "c19-sequence/1", "mechanism": "character-action → split", "_author": "<you>",
  "mainIdea": "Luther finally finishes the job he started.", "howShown": "The axe strikes and the log splits on the word.", "actionIsCentral": true,
  "evidence": "Swing, strike, split.",
  "beats": [ { "sceneIndex": 21, "shots": [
      { "at": null, "stage": { "shot": "wide", "bg": { "set": "shore" },
          "characters": [ { "identity": "luther", "action": "hold", "holds": "axe" } ], "props": [ { "motif": "log", "x": 1010, "y": 770, "scale": 0.8 } ] } },
      { "at": "Swing,", "cues": { "0": "strike," }, "motionCues": { "0": "split." },
        "stage": { "…": "chop + the log with motion split, splitAt, splitBase" } } ] },
    { "sceneIndex": 22, "shots": [ { "at": null, "stage": { "…": "the log with startState split (pieces stay on the ground)" } } ] } ] }
```
- `at`: the narrator's words the shot is CUT on (first shot: null). `stage: "keep"` = the beat's own authored staging.
- Every action with a moment (chop, throw, take, place, stop, …) has a `cues` word; every split has a `motionCues` word —
  the word that SAYS the result. The change never starts before it (the timing rule).
- Actions: run, stop, chop (holds axe), throw (holds the object; `throwTo` or out of frame), take (`takeFrom: "body"` for
  a shoe off a foot / a ball out of a bag), place, hold, walk, … Props: `{motif, x, y, scale, motion: "split", splitAt,
  splitBase}`; a LATER shot / beat shows the result with `startState: "split"` — only in the SAME set (a set change
  cannot carry a result: keep it in its own beat, or skip).
- Same character = same look in every shot (one `variant`). No new on-screen text. Labels are not drawn.
- Several beats in one contract are validated, A/B'd, applied and reverted TOGETHER.

## Then
`node scripts/c19.js validate --slug=<s>` → `preview --out=<dir> --clips` → Actions → `single-relation-ab.js
blind/judge/tally` (the narration review is the veto) → `single-relation-rollout.js select --contracts=<book>/single-relation/c19
--ab=<dir>/ab/ab-result.json --out=<book>/single-relation/c19/selection.json` → `c19.js apply --write`. Record every
candidate (skipped or contract) with its reason in `single-relation/author-decisions-c19.json`
(`[{sceneIndex, kind: "c19", decision: "skipped"|"contract", why}]`) — `decide --none` is refused without it.
