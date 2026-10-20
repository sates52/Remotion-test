# Action lab — 2026-10-20: actions that happen on screen (`take`, `embrace`)

Sandbox worktree `.claude/worktrees/state-lab`; no production / published book file was written (Burn's files were
copied read-only at ~09:04; 15-secrets is published and frozen — sandbox copy only). Two real passages, one action each.

## What was missing (existing mechanisms reviewed first)
- `holds` drew the object in the hand from frame 0; `reach` extended the arm toward the motif; `contactDx` stepped a
  figure in only for `grabbing` / `fighting`; `REACTS` already derived the partner's body from the authored verb.
- Missing: an object that rests and is TAKEN on a word and then kept; two people closing a gap and holding each other;
  an authored moment for either; the second person's face (only the first cast member's face was authorable).

## What was added (smallest fields)
- actions `take` (with `holds`) and `embrace` (exactly two cast); `actionCue` (the moment, word-timed; else 40% of the
  beat, never before frame 24); `partnerExpression` (the second person's face — the engine never invents one).
- Renderer: pose(action, frame, fps, cue) pure in (frame, cue). take: reach -> on the cue the hand closes on the object,
  which RESTS at the settled reach point on a small level stand (shared constants TAKE_REST_*) -> ease-in-out bring-in
  over 24 frames to the hold pose; embrace: open arms, the lead closes the gap over 18 frames (contact ON the cue,
  EMBRACE_GAP 340 rig px between centres, tuned so both faces stay visible), arms wrap. continuity.ts carries the cue
  of the same action on the pose clock, so a continued action is the starting state (not replayed).
- Planner: partner embraces back (REACTS); an authored embrace is a two-shot unless the author sets a shot; an authored
  `continue` keeps the previous scene's shot (15-secrets 75 had become a closeUp with the phone out of frame).
- Lock / gate / restore: actionAt, partnerAction, partnerExpression sealed; drift "action moment", "partner …",
  "partner face …".
- Merge: take needs holds; embrace needs two cast; actionCue only on take/embrace and spoken in the beat;
  partnerExpression needs two cast and a known face; a continued beat after a take must hold the same object.

## Real chain (authored-K.json -> merge --write -> make-book with every gate -> config -> render)
- burn 219 ("Ignos … launches herself into the arms of a tall, copper-skinned man with dark braids, her long lost
  mortal mate"): cast `ignas` + `ignasMate` added to the SANDBOX story bible (cast rule; the mate's look from the
  narration, Ignas's look is not in the narration -> neutral, recorded) and to `visualProvenance.allowedCharacters`
  (the firewall BLOCKed CHARACTER_MISMATCH until then — correct behaviour). Config: twoShot, both `embrace`, actionAt 80,
  faces happy/happy; burn authorship gate PASS, firewall 0 BLOCK, screen-text/composition/continuity PASS.
- 15-secrets 74–75 ("They reach over to the nightstand and grab their phone … 52 unread emails"): 74 `take` phone,
  actionAt on "grab"; 75 `continue`, `hold` phone. Merge first REFUSED: "the engine gained action take, embrace since
  this storyboard was prepped" — prep was re-run (designed behaviour); the new chunk cut moved 75->76 so 74/75 are one
  author's. A post-plan engine restaged 75 to closeUp (frozen book: make-book only reports); the standard
  restoreAuthoredStaging put the sealed medium back (a non-frozen book gets this inside make-book).
- `inputs/new-authored.json`, `inputs/*.OLD.json`, `inputs/add-cast.js`; window configs `configs/*-{OLD,NEW}-window.json`.

## Jump / multi-worker
Clips rendered with 4 workers (`--concurrency=4`); standalone frames (render-sequence-stills, each its own seek)
compared with the clip frame: 35.5–39.6 dB at the same frame; on moving frames the same frame peaks (burn f59994:
39.0 dB vs 22.5–24.3 for ±1/±2; 15-secrets f20298: 35.7 vs 22.4–26.4). Full-res in the archive `jump-fullres/`.

## Blind evaluation ("who did what to whom/what?", picture only)
Fixed frames (same for OLD and NEW, `inputs/strips-plan.json`), subtitle box masked grey (a first crop of the bottom
24% hid the phone held at the chest — discarded before judging). 8 strip readers + 2 single-still readers + 4 judges,
fresh sonnet agents, X/Y balanced, tie allowed. Round 1 (`round1/`) had the mate's face neutral; round 2 (this folder's
`reads/`, `judging/`) after adding `partnerExpression: happy`.

| | deed read from the PICTURE | who | action | target | result | judge prefers | wrong readings |
|---|---|---|---|---|---|---|---|
| 15-secrets OLD (r1+r2) | 3/4 | 4/4 | 0/4 | 1/4 | 1/4 | 0 | 5 (phone already in hand; chat bubble) |
| 15-secrets NEW (r1+r2) | 4/4 | 4/4 | 4/4 | 3/4 yes, 1 partly | 3/4 yes, 1 partly | 4/4 | 0 |
| burn OLD (r1+r2) | 0/4 ("nobody acts") | 0 | 0 | 0 | 0 | 0 | 7 |
| burn NEW (r1+r2) | 4/4 (an embrace) | 0/4 | 2/4 yes, 2 partly | 0/4 | 1/4 | 4/4 | 8 — the mate read as a woman in 3/4 (the 4th left gender open); r1 "comforting", r2 "smiling reunion" |

- take: who / did what / to what / result answered from the picture ("reaches out, picks up the phone from its stand
  and holds it, then reacts with a shocked face"); single still: "holds a phone … alarmed".
- embrace: the embrace itself is read every time (OLD: never); the IDENTITIES are not: a man with long braids and no
  beard reads as a woman (rig gender cue), and the reader credits the person whose wrapping arm is in front (the mate)
  as the actor, not the one who closed the gap. partnerExpression fixed the mood (r1 "uneasy/comforting" -> r2
  "smiling reunion").

## Limits / open
- 2 passages, 4 judgments per book, sonnet readers/judges; strips are 8 stills, not watched video.
- burn 219 is NOT fully readable as "she runs into HIS arms": (1) rig gender cue for long-haired men (the narration
  gives no beard; not invented) — VOCABULARY for review; (2) who-acts follows draw order (the front person's arm reads
  as the actor). Not fixed in this delivery.
- A held object at chest height can sit behind the burned-in caption box when the figure stands centre-frame (75):
  general `hold` layout limit, recorded.
- Not a book-level PASS; no bar used or changed.
