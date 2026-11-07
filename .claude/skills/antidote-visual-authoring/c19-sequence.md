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
- Not when the beat is already good, when the action needs a body the rig cannot do, or when only a feeling changes.

## Contract (`books/<slug>/single-relation/c19/contracts/<firstBeat>.json`)
```json
{ "schema": "c19-sequence/1", "mechanism": "character-action → split", "_author": "<you>",
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
