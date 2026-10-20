# Action clarity — 2026-10-20: who does the embrace; the held object stays visible above the captions

Follows `audit/action-lab-2026-10-20/` (its blind check: the reader credited whoever's arm was in front as the actor,
and the phone held at the chest sat behind the burned-in caption box). Renderer-only change: the configs are the
action lab's (sandbox copies; burn and 15-secrets are published — not reopened). OLD = the action lab's NEW clip,
NEW = this delivery, same frames.

## What changed (no new action, no new field)
- **Embrace actor / target** (`movements.ts` pose role, `Scene.tsx`): the LEAD (cast[0], who does it) reaches out
  early and wraps HIGH over the partner's shoulders and is drawn in FRONT; the PARTNER (to whom) stands, opens its
  arms only as the lead arrives and wraps LOW at the waist, behind the lead. No physical feature added to tell who is
  who (no beard, nothing unsourced) — only movement, arms and draw order.
- **Held object vs captions** (`groundFit.ts` holdLift / liftHold — the module that already keeps a lying body above
  the caption band): the held object's box is computed with Everyman's own hand chain; when it falls inside the
  caption band (x 220–1700, below y 866 = FIGURE_SAFE_BUST.y1) with a 30 px margin, the hold is blended toward
  RAISED_HOLD (forearm folded up, the object held up in front) by the smallest amount that clears it. One value per
  scene (no drift); a `take` lifts with its bring-in, so the take's end and a continued `hold` meet in the same pose.
  Holds already clear (wide, illustration, …) are untouched.

## Verification
- Final video layout (real burned-in captions, no mask) — 15-secrets 74 end + 75: blind readers, 2 per version:
  phone fully visible OLD 3/10 frames (the caption box clips it in the rest), NEW 10/10. Judges NEW 2/2.
- Embrace (subtitle area masked — it gives away the narration): who starts it — OLD 0/2 (both: "the braided person"),
  NEW 2/2 ("the grey-haired person … to the braided person"). Judges NEW 2/2. `blind-eval.json`.
- Jump / multi-worker: 4-worker clips vs standalone frames: burn f59994 (moving) 39.0 dB same frame vs 25.8/26.6 for
  ±1; 15-secrets 74/75 35.8/35.6 dB (static hold: neighbours equal).
- Tests: `scripts/test-action-clarity.js` (lift on real shot stagings, untouched when clear, take end = continued hold,
  embrace roles + draw order wiring); regressions pass (authorship-gate 59/3 known).

## Limits
- `closeUp`: the face fills the frame (scale 3.1); a chest-height object is below the frame and even the full lift
  brings it only partly into view — rules.md now says never frame an object beat as closeUp.
- The mate (long braids, no beard) can still read as a woman — no unsourced feature was added; who-starts-it is now
  carried by movement and draw order. 2 passages, 2 readers + 2 judges per question, sonnet; strips are stills.
- Clips: `C:\Users\savas\Cursor\Remotion\archive\action-clarity-2026-10-20\clips\`.
