# Cycle 10 — three architectures, compared on evidence (2026-11-04)

Evidence base: the capability audit (wt-c10), the world-state prototype + 10-passage blind A/B (result-c10-world-state.json),
spike B (two-bone IK + body step, scripts/test-ik-spike.js, renders), spike C (scene router over 2 022 real beats +
a one-film three-renderer composite), the Lemo-Opuscar review (MIT code / CC BY 4.0 demos).

## The fact that decides the ranking
Rule-based scene routing over 2 022 beats of 7 books: **~70 % abstract claims, ~14 % causal, ~5 % concrete action,
~4 % data, ~4 % environment, ~2 % interaction** (fiction, ideas and philosophy alike — the narration is a two-host
discussion). Rules are crude; the order of magnitude is the point. A capability that only improves deeds touches
~7 % of a film. The 3x–10x jump has to come from the abstract and causal 84 %.

## A — Antidote + persistent world state
- Built: object id / one place / deeds (pickup, place, hang, drop, give) compiled into ordinary scene fields;
  teleport and duplication are compiler errors (0 in the 10 passages); opt-in, old configs draw byte-identical.
- Measured: the 10-passage blind A/B (see result file — the comprehension delta, WRONG/DEAD/ADDS/EXPLAINS).
- Seen in the renders: the state is right, but a bust shot cuts the table at the frame edge (P01) — world state is
  only as legible as the shot that shows it (Lemo DIRECTOR §8: the subject at least a third of the frame height).
- Cost: render ≈ 0 (a glyph + furniture in SVG); authoring: one `world` block + per-beat deeds per scene that moves an
  object; scale: compiler is O(beats); fallback: an inconsistent world stops the build (never a silent fix).
- Reach: the ~7 % deed beats.

## B — new character action engine (IK, contact, blocking)
- Built: two-bone IK on the existing Everyman arm + a horizontal body step; anticipation → reach → contact →
  follow-through.
- Measured: the arm alone reaches 1/5 targets narration asks for (UPPER+FORE = 140 rig px); step + IK reaches the
  reachable ones exactly (0.00 px); the floor fails — a crouch / bend (whole-body poses) is needed: the render shows
  the briefcase appear in the hand. Contact today is faked by sliding bodies a constant (Scene.tsx contactDx).
- Cost: render ≈ 0 (angles only); engineering: high (whole-body IK, crouch, two-hand holds, character-to-character
  contact, collision) — weeks; authoring: none if targets come from the world state; fallback: today's pose tables.
- Reach: the same ~7 % deed beats, better drawn. Not a 3x lever on its own.

## C — semantic film director + hybrid rendering
- Built: a scene router (type → what a muted viewer must see → engine) and a one-film composite of three renderers
  (Antidote causal diagram → Antidote world deed → Vox period image): technically no obstacle (each engine is a React
  component in a <Sequence>; one render, one audio).
- Not measured: routing accuracy (rules), and whether a routed film is better — no comprehension A/B this cycle.
- Cost: Vox scenes need generated images (Flux; Hamnet lost 58 of 221 to the content filter → text-only fallback);
  render cost per frame is similar; authoring: per-scene type decisions (automatable, reviewable).
- Reach: every beat — the only option that addresses the abstract 70 % by choosing the best representation per scene.

## Comparison
| criterion | A world state | B character engine | C director + hybrid |
|---|---|---|---|
| muted comprehension | measured (A/B) on deed beats | not measured; better contact on reachable targets | not measured |
| action / character accuracy | object state exact; contact as today | contact exact within reach; floor fails | per engine |
| prop / world continuity | yes (compiler-guaranteed) | needs A | needs A for deed scenes |
| render cost | ≈ 0 | ≈ 0 | images for Vox scenes (API, filter loss) |
| production time | small (authoring block) | large (weeks) | medium (router + review) |
| full-book scale | yes | yes | yes, if images are available |
| authoring complexity | low–medium | low (targets from A) | medium (one decision per scene) |
| backward compatibility | opt-in, byte-identical | opt-in | new composition; books untouched |
| failure / fallback | build error, never silent | old pose tables | per-scene fallback to Antidote |
| share of the film it improves | ~7 % | ~7 % | up to 100 % |

## Recommendation (for cycle 11)
1. **C is the architecture with the 3x–10x potential**, because it is the only one that changes the ~84 % abstract +
   causal beats. Build it as a *director that first writes, per scene, "what must a muted viewer understand?"* and
   picks the representation that can show it (causal diagram with a visible effect, a world-state deed, a data
   comparison, a period image) — and says the claim in text when nothing can show it, instead of decorating.
2. **A is its deed component** (ship to production only on its own A/B rule; see result).
3. **B is deferred**: whole-body IK is real work with a ~7 % reach; the cheap parts (arm IK + step for reachable
   targets) can be folded into A when a scene needs a shelf / partner hand.
4. Lemo-Opuscar: take technique 2 ("whole incident" locked wide: cause → hold → visible effect, accent only on the
   cause) as the first representation for causal beats in C; technique 1 (holder-tracked prop) = A.
5. First C experiment (pre-register before code): 30 causal + abstract beats (VSB-1 strata B and C), arm A = today's
   storyboard, arm B = director-chosen representation, the 3 VSB-1 questions + a 30-item human reference.
