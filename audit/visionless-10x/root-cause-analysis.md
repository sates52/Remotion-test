# P6 Failure-Pattern Analysis — 20 Suspects as a Discovery Dataset

**Plan:** Vision-free 10x · **Scope:** analysis only — no code, no implementation, no manual verdict round.
**Inputs:** [p3-gate.json](p3-gate.json) (100 real scenes), 20 rendered stills + [pixel-evidence.json](pixel-evidence.json), `src/semantic/visualIntent.ts`, `src/semantic/visualContract.ts`, `scripts/lib/director-adapter.js`, `scripts/plan-antidote.js`, 4 book configs. Zero LLM/Vision calls.

---

## Answer first: the operator's hypothesis is confirmed, with one correction

> **`IDLE_WALLPAPER`, `INTENT_NOT_STAGED`, `IDLE_ACTOR_WALLPAPER`, and `MISSING_STRUCTURAL_EQUIVALENCE` are four thermometers on one patient.**

They are not independent failures. They all measure the same root condition:

**Root failure:** the production pipeline converts narration → *a topic to show* (VisualIntent) but never converts it → *an event to stage* (who acts, on what, in which relation, through which transformation). The renderer is left with a **protagonist-shaped hole** that it fills with its own default: **1 idle/talking actor + 0–1 screen label on an ambient backdrop**. An actor-shaped placeholder is not a staged event, so every relational requirement fails *independently of which checker looks*:

| Flag | Where it is emitted | What it is actually measuring |
|---|---|---|
| `IDLE_WALLPAPER` (P3 gate, audit-local) | `p3-visionless-gate.mjs` → `idleWallpaper` | Same shape: actor present but no event |
| `INTENT_NOT_STAGED` (P3 gate, audit-local) | `coverageFor()` | Derived intent's grammar has no counterpart in the scene |
| `IDLE_ACTOR_WALLPAPER` (HC4, hard) | `visualContract.ts` HC4 | Same shape, checked via forbiddenTropes |
| `MISSING_STRUCTURAL_EQUIVALENCE` (HC3, hard) | `visualContract.ts` HC3 | Same shape, checked via "2 subjects OR comparison prop" |

Evidence that they are one patient: in the 100-scene sample, **every scene with a relational archetype (contrast, allegory_equivalence, cause_effect, character_psychology) scores 0/53 staged** (P3 `coverageFor`), and the same scenes are exactly the ones eating HC3/HC4. **Only static_reflection (39/39) and literary_critique (6/6) pass** — the archetypes that *do not demand an event*.

### The corollary the raw percentages hide (higher-leverage finding)

The suspicion percentages are inflated by **contract blindness**, and the wiring number is **artifactually perfect**:

1. **The contract evaluator cannot see existing staging.** 10/100 sampled scenes carry a `customSvg` prop with an *authored, narrated visual read* ("Thoughts-per-minute gauge", "The Two Arrows"). HC3/HC4's allow-list regex (`/diagram|card|split|contrast|sequence|analogy|mirror|scale|equivalence|flow|metamorphosis|tear/`) does not know `customSvg`, so those scenes are scored **as if unstaged**: 3/20 suspects (including #18) carry genuine staging but still got `IDLE_ACTOR_WALLPAPER`. That is a **false-positive manufacturing defect in the evaluator**, not (only) a production defect.
2. **`visualIntent: {}` is persisted 100/100.** The KPI `wiring.allThree = 100%` is unsound: an empty object is truthy. The chain reaches production **only as a code-level transient inside plan-antidote** (derivation → adapter floor → discarded). What lands in `config.antidote.json` is the director's output plus, in 10%, a custom SVG. **The compiler is not connected end-to-end; only its floor rules are.**
3. **The floor itself is mostly inert on these beats:** 19/20 suspects got `no_payload_no_floor` from the shadow adapter; the 1 exception (#20) had its floor **discarded by authoredComposition precedence**. 11/20 narrations carry a clause marker (`but / leads to / because / versus`) the adapter could have used. The floor's ultra-conservative label extraction silently returns null — but nobody can see that, because **its decision telemetry (the `no_floor_reason`) never survives anywhere.**

**Net:** the visible 55%/43% are the *correct alarm, measuring the wrong denominator* — but even after correcting for evaluator blindness, the structural void is real: ~90% of the sample has zero relational staging (no grammar, no diagram, 1 idle/talk actor), and the archetype cross-tab proves the pipeline never converts relational language into relational staging.

### Pixel corroboration (what the renderer actually draws)

[pixel-evidence.json](pixel-evidence.json) over the 20 suspect stills:

- **#1 ↔ #14 (same book, different scenes) hamming = 7/64 — structural twins** (cf. blank-detect threshold 10, near-dup threshold 12 in `scripts/lib/render-truth.js`).
- A 4-member cross-book family at 19–28 (03/06/09/16): same bg-set family + 1 idle actor + single label — the "wallpaper template" made visible.
- Every still sits in the mid-structure band (coverage 0.36–0.67, edgeDensity 9–20.5): technically non-blank, compositionally interchangeable. Exactly the render signature of "placeholder actor on ambient backdrop".

---

## Cluster table (root failure, not per-scene)

20 suspects → **4 clusters, 1 shared root**:

| # | Cluster | Members | Evidence | Root failure |
|---|---|---|---|---|
| K1 | **Staged but invisible to the contract** (evaluator false-positive) | #18 (speedometer gauge w/ red-zone needle), #2 (Two Arrows SVG), #4 | 3 suspects carry `customSvg` with narration-derived `reads`; HC3/HC4 regexes don't recognize `customSvg`; no structural grammar checker consults it | **Evaluator cannot represent the staging medium that exists** — a *measurement* defect, not a production defect |
| K2 | **Intent produced, floor inert, intent discarded** | #1, #3, #5–#13, #15–#17, #19, #20 (16 scenes) | `shadow=null(no_payload_no_floor)` 19/20; stored `visualIntent:{}` 100/100; 11/20 narrations contain usable markers (incl. #20 — but its marker spans a sentence boundary, see below); production staging = 1 idle/talk actor + ≤1 label | **Missing production staging contract** — the relational spec dies between intent and direction |
| K3 | **Floor produced but discarded by precedence** | #14 (miracle scene-240, "become the monsters") | `shadow=APPLIED(added_comparative_floor)` with `comparison_labels`, yet `authoredComposition` precedence drops it; scene renders label-only | **Same missing contract + an override-precedence policy that cannot merge semantic floor with authored decisions** |
| K4 | **Relational demand, no comparative cast** | #14 (dual membership: also K3) — the sample's only `VISUAL_SALIENCE_FAILURE` | HC3 demands ≥2 subjects or comparison prop; production cast model = 1 protagonist; crowd-invoking narration ("He doesn't look at the crowd") staged on 1 idle actor | **Same root: no staging spec of the *cast shape* (protagonist vs foil vs crowd) that narration implies** |

The clusters are **stages of the same pipeline break**, not different bugs: intent is produced (K2/K3), cannot be expressed as an event (K2), is discarded when it conflicts with authored precedence (K3), and the cast model cannot host relations anyway (K4) — while the evaluator that should catch all of this is blind to the one medium that does stage events (K1).

---

## What the architecture is missing (semantic-staging surface audit)

Current chain: `NarrativeAtom → deriveVisualIntent → createVisualContractFromAtom → evaluateSceneVisualContract (HC1–HC10) → [plan-antidote: extractNarrativeAtomSync → deriveVisualIntent → buildDirectorOverrides/applyDirectorOverrides] → config.antidote.json → render`.

What survives into production per scene: `shot`, `bg.set`, `characters[] (role/action/expression)`, `props[]`, `texts[] (≤1 typical)`, `diagram` (rare), `customSvg` (10%). What is **not expressible anywhere in this chain**:

1. **No event structure.** `VisualIntent.requiredActions` is prose (`"show_two_opposing_states_or_polarities"`), consumed by *nothing*. No machine-readable `actors × roles × actions × relation` spec exists between intent and direction.
2. **No relation primitives.** The vocabulary of staged relations (`comparison | equivalence | cause_effect | transformation | internal_tension | part_whole …`) lives implicitly in archetype names and in the adapter's grammar strings — and nowhere in the scene schema. Hence "relational staging" cannot be *required*, *present*, or *checked* in one vocabulary.
3. **No staging vocabulary in the contract.** `VisualContract = { mustShow[], shouldShow[], mustNotShow[], narrationClaim, semanticCore }` — string lists of *things*, no *event*. The contract literally cannot state "needle reaches red zone" vs "show a gauge"; HC3/HC4 are therefore forced to guess structural presence from prop-name regexes — which is exactly how `customSvg` staging became invisible (K1).
4. **No medium-aware staged-artifact recognition.** The pipeline *does* stage events sometimes — as authored SVG compositions ("reads": …) — but the contract language has no type for a staged artifact with declared content, so the checker cannot credit it.
5. **No persistence of the semantic chain** (`visualIntent: {}` 100/100) and **no floor decision telemetry** (`no_floor_reason` lost) → two of the five KPIs measure artifacts, and repair cannot be targeted because the rejection reasons never reach the audit.

### The operator's examples, verified against telemetry

- **#18 (`scene-99`, RPM/redline):** intent `cause_effect`; production staged an authored gauge SVG *with the needle in the red zone* — object presence **and** state (needle position) are actually there; the evaluator just can't see `customSvg`. *In this case "object presence" is present — it is structural equivalence between the gauge's state and the narration's claim that must be checkable, and today it is neither credited nor checked.*
- **#20 (`scene-36`, radioactive ↔ inert):** narration contains the sample's strongest explicit contrast — "the circumstances are radioactive … But the person next to you proves the environment is inert" — yet `shadow=null(no_payload_no_floor)`: the adapter's `markerPair` requires both clause sides to live in **one sentence**, and here the `But` sits exactly on a sentence boundary ("…or Exactly. But the person…"). A textbook conservative-guard false-negative: the guard that prevents meaningless labels also silently killed the one narration where a comparison was *the entire point*. This is why the staging contract must be **declared even when null** — so "contrast detected but not extractable" becomes visible telemetry instead of a silent null.
- **#14 (`scene-240`, become-the-monsters):** the adapter *did* extract `comparison_labels` and applied a comparative floor — and `authoredComposition` precedence discarded it; the rendered scene is a label on an idle actor. The one case where the whole chain worked end-to-end, killed at the last merge step.

---

## Proposed schema change (smallest addition, no code yet)

**Add a Staging Contract: one machine-readable event spec per relational beat**, placed between VisualContract and the director, persisted and checked in the same vocabulary:

```ts
interface StagingContract {
  relation: "comparison" | "equivalence" | "cause_effect" | "transformation"
          | "internal_tension" | "part_whole" | "sequence";   // the staged relation
  actors:  { role: "protagonist" | "foil" | "crowd" | "object";
             state: string }[];                                  // cast SHAPE, incl. "none"
  medium:  "split_view" | "diagram" | "authored_svg" | "single_actor_event"
          | "silent_frame";                                     // how the event is shown
  states:  [string, string][];        // the poles/stages to make visible (A↔B)
  labels?: { pole: "A" | "B"; text: string }[];                 // existing clause discipline
  satisfiedBy: "grammar" | "diagram" | "authored_svg" | "composition";  // credit channel
}
```

Design constraints taken directly from the evidence:

1. **Deterministic derivation** from the same markers the adapter already uses (contrast/cause/because markers, `markerPair`) — no LLM. The clause discipline that makes `no_payload_no_floor` safe is preserved; StagingContract is *declared even when null* so the gate can distinguish "none required" from "required but failed".
2. **Derived once, persisted, consumed by three:** plan-antidote writes it next to the scene (fixing the `visualIntent:{}` persistence gap); the director/adapter uses it as its floor spec; the contract evaluator uses `satisfiedBy` to credit staging through any medium — **including `authored_svg`, which makes K1's false positives disappear without weakening HC3/HC4**.
3. **Relation → medium mapping is static:** comparison→split_view/diagram; equivalence→diagram/authored_svg; cause_effect→flow/authored_svg; transformation→beforeAfter/flow; internal_tension→spectrum/two-shot. This is what "object presence ≠ visual equivalence" becomes operationally: the *relation* must be materialized in a medium that can express poles/states, and the gate checks medium capability, not prop-name vibes.
4. **Precedence fix (K3) falls out naturally:** authored decisions no longer *override* the floor; they *satisfy* the StagingContract or they don't — merge, not replace.
5. **KPI hygiene rides along:** wiring KPI reads non-empty persisted stages (no more `{}` truthiness); adapter shadow emits `no_floor_reason`; firewall and gate read the same contract (today: gate says 74 hard violations, firewall 0 rejects — two disconnected evaluators).

**Why smallest:** no new renderer, no LLM, no new book format — one optional object, one derivation function (deterministic, marker-based), one credit channel in the evaluator, one persistence line. Everything else in the existing pipeline stays.

---

## Expected downstream impact (quantified)

| Fix | Mechanism | Expected effect |
|---|---|---|
| `satisfiedBy: authored_svg` credit | K1: evaluator recognizes existing staging | IDLE_ACTOR_WALLPAPER/MISSING_STRUCTURAL_EQUIVALENCE false-positives drop on ≥10% of scenes immediately (3/20 suspects are currently mis-flagged); contact sheet verdicts become meaningful |
| Persist + consume StagingContract | K2: 34/100 "THE SHAPE" scenes get a relational floor spec | Relational archetype staging 0/53 → target ≥60% in one pass (the 11/20 marker availability bounds the first wave; remainder falls back to declared-null + explicit silent_frame, which is an *honest* staging, not wallpaper) |
| Precedence merge | K3: authored beats satisfy contracts instead of discarding floors | Recovers the applied-but-dropped case (#14; the policy bug class is general) |
| Cast-shape spec | K4: crowd/foil requirements become stageable | Kills VISUAL_SALIENCE_FAILURE class (crowd narration on 1 actor) |
| Telemetry + non-empty wiring KPI | unblocks iteration | Repair can be targeted ("no_floor_reason" distribution) and measured; contract PASS 0% becomes a meaningful gradient |

The measurable acceptance criterion stays the plan's original one: **SemanticContract → Director decision → Rendered Scene consistency, 0 LLM/Vision calls** — with relational staging (coverage on contrast/ae/ce/psych) as the headline number to re-run P3 against after any repair lands.

---

## Recommended sequence (when we leave analysis mode)

1. **Evaluator credit fix first** (K1) — smallest, zero production risk, immediately de-noises P5 verdicts and the 55%/43% numbers.
2. **Persistence + telemetry** (fix `visualIntent:{}`; log `no_floor_reason`) — makes the next measurement trustworthy.
3. **StagingContract derivation + consumption** (K2/K4) — the actual 10× abstraction.
4. **Precedence merge** (K3) — after the contract exists to merge against.

## Explicit non-goals (per operator instruction)

- No code written, no production file touched, no P7 repair executed.
- No manual GOOD/WRONG round: telemetry resolved the ambiguities; the contact sheet remains delivered for reference ([contact-sheet.html](contact-sheet.html) / [contact-sheet.png](contact-sheet.png)).
- No claims about visual quality beyond what pixel metrics + config staging can support — the next P3 re-run is the judge.

---

## Appendix A — Evidence commands (deterministic, reproducible)

- 100-scene shape counts: staging grammar 0/100; diagram 1/100; `cast==1 & all idle/talk` 34/100; "THE SHAPE" (all three) 34/100; THE SHAPE with ≤1 label 30/100.
- Archetype cross-tab (n/covered/idle-wallpaper): static_reflection 39/39/16 · contrast 35/0/14 · allegory_equivalence 8/0/3 · cause_effect 8/0/2 · literary_critique 6/6/3 · historical_grounding 2/2/0 · character_psychology 2/0/0.
- Hard violations on the sample: IDLE_ACTOR_WALLPAPER 55 · MISSING_STRUCTURAL_EQUIVALENCE 43 · VISUAL_SALIENCE_FAILURE 1; firewall hard rejects 0.
- customSvg: 10/100 scenes; 3/20 suspects (K1 false-positive set); stored `visualIntent:{}`: 100/100; suspects with adoptable clause marker: 11/20; adapter shadow on suspects: 19× `no_payload_no_floor`, 1× applied-then-discarded.
- Pixel: 01↔14 hamming 7/64 (same book); 03/06/09/16 cross-book 19–28; coverage 0.36–0.67; edgeDensity 9–20.5; [pixel-evidence.json](pixel-evidence.json).
- Flag definitions (audit-local): `p3-visionless-gate.mjs` L200-207, L303; HC3/HC4: `visualContract.ts` L183-201; adapter null-floor path: `director-adapter.js` `semanticPayload()`; persistence gap: `plan-antidote.js` L615-640 (transient), L991 (`brief?.visualIntent` only).
- Null result (honesty): customSvg adoption shows no archetype asymmetry in this sample (idle-shape rate 40% with-SVG vs 33% without, n=10 — underpowered). The SVG medium is added wherever a beat needs a concrete visual, not concentrated in one archetype; this does not change K1 (the evaluator cannot credit it regardless).
