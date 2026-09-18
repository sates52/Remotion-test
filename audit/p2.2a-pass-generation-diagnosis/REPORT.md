# P2.2a — PASS-generation diagnosis

**Scope:** diagnosis only. No VisualContract exception, no production-generation
patch, no render, and no new Gate rule was added.

## Finding

The P2.2 firewall is **not on the Antidote production path**. `plan-antidote.js`
does not import or call `extractNarrativeAtom`, `deriveVisualIntent`,
`createVisualContractFromAtom`, or `evaluateSceneVisualContract`. Those modules
are currently used by benchmark/audit scripts only. Therefore the production
generator cannot use an extracted action, comparison, or contract requirement to
choose its scene grammar.

This is observed, not inferred: the only non-semantic call sites are the audit
tools (`scripts/evaluate-gate-p15.mjs`, `scripts/p22-select-blind-sample.mjs`,
and benchmark/repair tooling). Search of `scripts/` and `src/` found no production
call site in `plan-antidote.js` or the Antidote renderer.

## Important measurement caveat

P2.2 itself evaluates a **synthetic** NarrativeAtom, not the project's
extractor output:

```js
{ text: narration, subject: scene._subject || null, action: null,
  object: null, relationship: null, concepts: [], abstraction: 'conceptual' }
```

This is `scripts/p22-select-blind-sample.mjs:29-40`. It forces every scene into
the conceptual branch and discards action/object/relationship data. It is a
valid stress test of the generated scene against textual intent, but it cannot
establish whether the real NarrativeAtom extractor would have produced the
correct action. Thus a B-vs-C conclusion is not currently measurable.

## Evidence by chain stage

| Stage | Observed behaviour | Consequence | Diagnosis |
|---|---|---|---|
| Narration → NarrativeAtom | P2.2 creates a partial atom with `action:null`, `relationship:null`, `abstraction:'conceptual'`; production does not call the extractor. | Neither path carries a production action contract. | Integration gap before generation. |
| Atom → VisualIntent | `deriveVisualIntent()` can infer contrast/equivalence/cause-effect from narration and emits required actions (e.g. structural parallel). | Useful requirements exist, but only inside audit. | Not the first proven failure. |
| Intent → VisualContract | Contract faithfully turns intent into forbidden tropes/requirements. | Gate can reject unsupported scene grammar. | Audit is behaving as designed. |
| Contract → scene props/motif | No production call site transfers `requiredActions`, archetype, or semantic requirements to `director.direct()` or to `SceneSpec`. | The scene has no obligation to materialise the contract. | **First confirmed break.** |
| Antidote generation | The planner derives acting from a sentiment fallback: question → `think`; negative → `slump`/`point`; positive → `celebrate`/`point`; otherwise → `talk`. | It creates a presenter reaction, not narration-specific action or explanatory structure. | **A: generator ignores unavailable semantic action.** |
| Gate | It rejects a passive/single-actor composition without a structural prop and equivalence without dual/compare structure. | It reports the existing mismatch, rather than creating it. | Not C on current evidence. |

Relevant code: `scripts/plan-antidote.js:435-445` (sentiment action fallback),
`scripts/plan-antidote.js:553-565` (optional diagram),
`scripts/plan-antidote.js:597-617` (cast action assignment),
`src/semantic/visualContract.ts:186-202` (the two hard checks), and
`src/semantic/visualIntent.ts:82-150` (archetype/required-action extraction).

## Why the two dominant rejections occur

### `IDLE_ACTOR_WALLPAPER` — 747 scene flags

The Gate triggers when a scene has a single passive actor (`talk`, `idle`,
`walk`, or `point`) or any idle actor, without a structural prop
(`diagram|card|split|contrast|sequence|…`). The planner's default action is
`talk`; negative and positive language merely substitute `slump`, `point`, or
`celebrate`. Those are affective poses, not proposition-specific visual action.

The missing link is not evidence that an exception is needed. For conceptual,
psychological, contrast, causal, and literary-critique narration, the generator
is never given the `VisualIntent.requiredActions` that would request an insert,
diagram, split/comparison, sequence, or concrete business.

**Classification:** A is confirmed at the system boundary: even if a semantic
action is inferable, production cannot consume it. B is unmeasured because the
actual extractor is not called. C is not supported: the Gate's metadata test
matches the scene props/actions it receives. D exists for some reflective
narration but cannot explain a 747/933 dominant failure without sampled atom
outputs and a visualizability label.

### `MISSING_STRUCTURAL_EQUIVALENCE` — 200 scene flags

VisualIntent detects equivalence/contrast language from narration and requires
two distinct comparative elements. The Gate accepts either two non-idle
characters or a comparison prop. But planner output can still be a single
sentiment-driven presenter because `director.direct()` is not passed an intent
or contract. A diagram is available only when authored/heuristically selected;
it is not mandated by `allegory_equivalence`.

**Classification:** A is confirmed. The intent/contract requirement has no
generation adapter. B/C remain unmeasured for the same synthetic-atom reason.

## What is known vs. not known

**Known:** current P2.2 candidate population is 0/933 PASS; the leading scene
metadata violations are `IDLE_ACTOR_WALLPAPER` (747) and
`MISSING_STRUCTURAL_EQUIVALENCE` (200); the semantic modules are audit-only;
the planner has a sentiment-pose fallback.

**Not known:** whether the real NarrativeAtom heuristic/LLM would reliably
extract each spoken action; whether rendered pixels would validate a proposed
semantic adapter; the real Vision WRONG taxonomy. Those require a controlled
generation experiment followed by P2.2.

## Shadow-adapter experiment — completed

The recommended read-only experiment was run against the current production
configs discovered at execution time: `crime-and-punishment`,
`the-myth-of-sisyphus`, and `the-republic`. The sample contains exactly five
scenes from each narration stratum: action/kinetic, emotional, causal, contrast,
structural, and abstract/reflective. It selected from the two P2.2 target
violation populations: 14 `IDLE_ACTOR_WALLPAPER`, 16
`MISSING_STRUCTURAL_EQUIVALENCE`.

| Classification | Count | Meaning |
|---|---:|---|
| A — intent requirement absent from metadata | 22 | Dominant: real intent asks for flow, contrast, equivalence, or internal tension while existing scenes remain a presenter plus unrelated/single motif. |
| B — atom/intent materially empty for non-static narration | 3 | The real heuristic extractor reduced action/emotion narration to static reflection with no action, relationship, object, or concept. |
| C — metadata satisfies real intent but Gate rejects | 0 | No support for weakening/correcting the Gate in this sample. |
| D — deliberate static/reflection strategy required | 5 | Reflection is plausible, but it needs a separately authored visual strategy rather than the default presenter pose. |

The stratified result therefore confirms **A as the next implementation target**
and identifies a smaller B backlog. It does not authorize a Gate exception.
The complete evidence—narration, real atom, real intent, existing metadata, and
real-atom Gate verdict for all 30 rows—is in
[shadow-adapter.json](shadow-adapter.json), with a compact table in
[SHADOW_RESULTS.md](SHADOW_RESULTS.md). The reproducible audit command is:

```powershell
node scripts/p22a-shadow-adapter.mjs
```

## Next step — still not a production patch

Before implementation, define an adapter contract on paper/data only:

1. map each observed `requiredAction` to the smallest valid Antidote scene
   grammar (`shot`, cast cardinality/action, prop/diagram requirement);
2. keep a separate static-reflection grammar for the five D cases;
3. capture the three B examples as extractor regression fixtures;
4. review that mapping against the 22 A rows before wiring it into the planner.

Only after that mapping is reviewed should an `Intent → Director Adapter` be
implemented and evaluated against the same 30 rows plus the legacy benchmark.
