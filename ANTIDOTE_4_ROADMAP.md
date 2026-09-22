# Antidote 4.0 — Visual Roadmap (closing the gap with the reference channel)

> **Scope:** purely *visual* upgrades to the Antidote engine (`src/engines/antidote/`).
> Sound/SFX and audio mastering are explicitly **out of scope** here (tracked separately
> in `ANTIDOTE_SFX_ROADMAP.md`).
>
> **Goal:** the thing that separates us from the reference flat-vector explainer channels
> (Vox / Johnny Harris / Kurzgesagt-style) is **not** drawing quality or cut speed — it is
> *cinematography, character intent, and explanatory graphics*. Every scene should have
> **depth**, every character should be **looking at what matters**, and conceptual beats
> should **show the idea**, not decorate it.

---

## Invariants (every 4.0 change MUST honor these)

1. **GPU-less render.** 2D DOM/CSS/SVG transforms only. No WebGL, no R3F, no fetched
   Lottie. (See `SKILL.md` §4, `LOCAL_RENDER_RULES.md`.)
2. **Backward compatible.** Old `config.antidote.json` files must render byte-for-byte the
   same. Every new field is **optional** with a rest default — mirror how `ambient()`/
   `arcOf()` default to no-op so pre-3.x configs are untouched (`movements.ts:84`).
3. **Deterministic / seeded.** No `Math.random()` / `Date.now()`. Motion is a pure function
   of the local frame + a seed derived from `beat.id`/index, so **chunked renders stay
   frame-identical at the seams** (see the seeding note in `motifs.tsx` / `annotations`).
4. **Caption band is sacred.** The bottom safe-zone karaoke layer stays clear; on-screen
   kinetic text remains **emphasis-only** (`CaptionLayer.tsx`, the subtitle rule).
5. **Director owns staging.** New capabilities are exposed to the planner/director
   (`scripts/plan-antidote.js`, `scripts/lib/antidote-director.js`), not hand-typed per
   scene — the config stays a scaffold Claude art-directs, not raw coordinates.

## Current strengths (do NOT rebuild)

- Parametric rigged **Everyman** — jointed arms/legs, expressions, blink, gaze, sit/walk
  (`characters/Everyman.tsx`).
- Motion vocabulary — `enter`, `ambient` (endless desynced float), `arcOf` (metaphor's
  one-shot movement), `gait`, `pose` set, `camera` (zoom/pan/punch) (`movements.ts`).
- **Shot grammar** (13 shots) + `stageChar`/`stageText` presets (`shots.ts`).
- **3-layer parallax backdrop** with rack-focus DOF + desynced breathing (`Backdrop.tsx`).
- Chapter cards, kinetic text, transitions, crowd multiplane (`components/`).

---

## The nine upgrades (ranked by impact × feasibility)

Effort key: **S** ≈ half-day · **M** ≈ 1–2 days · **L** ≈ 3+ days.

### TIER 1 — the "this looks expensive" jump

#### 1. True multiplane 2.5D camera  · effort **M** · risk low
**Gap.** The backdrop parallaxes (`Backdrop.tsx:619` `Layer`), but **cast + motifs live on a
single flat plane** — they all share one `cam` transform (`Scene.tsx:197`). So the set has
depth and the actors are pasted flat in front of it.
**Mechanism.** Give every stage element a `depth` (z ∈ ~0.3 far … 1.4 near). Apply the
camera's pan/zoom **proportionally to z** (parallax factor), exactly like the backdrop's
`Layer` already does. Near elements move more on a pan, far less; zoom scales around a
focal depth. Motif/character `depth` comes from the shot preset (foreground silhouette =
near, hero = mid, ambient prop = far) with an optional per-element override.
**Files.** `Scene.tsx` (split the single transformed `AbsoluteFill` into per-depth layers),
`movements.ts` (`camera` → return a `parallax(z)` helper), `shots.ts` (preset depths),
`schema.ts` (`depth?` on character/prop, optional).
**Done when.** A pan on a two-shot visibly separates foreground/subject/background; every
pre-4.0 config renders identically (default depth = current single plane).

#### 2. Look-at / character orientation & interaction  · effort **M–L** · risk med
**Gap.** The rig is **always dead-front** (`Everyman.tsx`). Two characters stand side by
side and never turn to each other or gesture at the object being discussed — the single
biggest "two cardboard cut-outs" tell, and *directly the subject of Supercommunicators*.
**Mechanism.**
- **Gaze targeting (S, do first):** a scene/character `lookAt` target (`"partner"`,
  `"motif"`, `"callout"`, or an x/y). Drive existing `gazeX` + a new small head-yaw toward
  the target. Cheap, no new art — big readability win.
- **3/4 head variant (M):** a `facing: front|left|right` param that offsets the eyes/nose/
  hair anchors and narrows the far side of the head — a flat-vector ¾ turn. Extends
  `face()` and the head group in `Everyman.tsx`.
- **Interaction poses (M):** `turnToPartner`, `gestureAt`, `handOff` — torso yaw (scaleX on
  the body group) + arm reach toward a target x. Composes with existing `pose()`.
**Files.** `Everyman.tsx`, `movements.ts` (poses + `lookAt` resolver), `schema.ts`
(`lookAt?`, `facing?`), `Scene.tsx` (resolve targets to coords), director (assign `lookAt`
for `twoShot`/`duo`/`overShoulder`).
**Done when.** In a two-shot, both figures orient toward each other or the shared motif;
single-character beats look at their callout/motif.

#### 3. Explanatory diagram shot class  · effort **L** · risk low  · ✅ CORE SHIPPED 2026-09-08
**Status.** `components/Diagram.tsx` built with 4 archetypes (**sorter, matchWave, flow,
spectrum**), `scene.diagram` schema + Scene render path, demoed in `Antidote4-lab`, verified
by stills. **Director wired** (`plan-antidote.js` + `antidote-director.js`): diagrams are
Claude-authored via the emit-beats handoff (all 4 types) with a conservative matchWave
heuristic fallback; a diagram forces `insert`/drops cast and becomes the beat's hero. Future
books get it automatically. **Remaining:** more archetypes (venn, comparison bars) + a
per-book accent so diagrams pop in the palette red rather than set-ink.
**Gap.** Motifs are **icons** (`motifs.tsx`), not **explanations**. The reference channels'
signature is the *self-drawing diagram* that IS the beat: a comparison, a flow, a sorter, a
sync. Vox engine has data-viz; Antidote has none.
**Mechanism.** A small library of **parametric, self-drawing conceptual diagrams** driven by
`interpolate`/`spring` (same budget as motifs): e.g. `sorter` (items fall into N labelled
buckets — the three-conversations beat), `matchWave` (two waveforms drift then lock in phase
— matching principle / neural entrainment), `spectrum`, `flow` (A→B with a moving token),
`venn`, `beforeAfter` split. Director picks one when a beat is conceptual and names its
subject; it renders **instead of** talking heads (like `place` today).
**Files.** new `diagrams.tsx` + registry, `schema.ts` (`diagram?` spec), `Scene.tsx` (render
path), director concept→diagram lexicon.
**Done when.** At least 5 diagram archetypes exist and the director drops them on matching
beats; each draws itself on the spoken word (anchors) and animates over the beat.

### TIER 2 — cinematic polish

#### 4. Match-cut / motif-morph transitions  · effort **M** · risk med
**Gap.** `Transition.tsx` (84 lines) is mostly hard cuts + simple reveals; no continuity
across cuts. Reference channels *carry* a shape across the cut or morph one object into the
next.
**Mechanism.** (a) **Motif carry:** when consecutive beats share a motif, keep it mounted
and tween its position/scale across the cut instead of re-entering. (b) **Whip/push:** a
fast directional blur-pan transition tied to camera. (c) **Mask-wipe:** a shape wipe using
CSS `clip-path`. All deterministic.
**Files.** `Transition.tsx`, `Scene.tsx` (cross-scene motif continuity needs a hint from the
planner), director (mark shared-motif runs).

#### 5. Contact shadows + act lighting wash  · effort **S–M** · risk low
**Gap.** Characters carry only a `drop-shadow` (`Scene.tsx:90`) → they float. No lighting;
color is one flat palette.
**Mechanism.** (a) **Contact shadow:** a squashed radial ellipse on the floor plane under
each figure, scaled by the figure's `height`/`sit`, so it's grounded. (b) **Act wash:** a
per-act gradient overlay (warm setup → cool crisis → resolve) + a subtle edge rim on the
hero via a duplicated, offset, blurred light silhouette. Vignette already exists.
**Files.** `Scene.tsx` (shadow + wash layers), reuse `bg.act` already on scenes.

#### 6. Secondary motion (follow-through)  · effort **S** · risk low
**Gap.** Hair, accessory, held prop are rigid; gestures stop dead (no overshoot).
**Mechanism.** Offset-sine lag on hair/accessory driven by head/torso angular velocity
(finite-difference of the pose), plus a small spring overshoot on gesture ends. ~0 CPU,
fully deterministic.
**Files.** `Everyman.tsx` (hair/accessory groups), `movements.ts` (velocity helper).

### TIER 3 — composition & typography

#### 7. Dynamic composition  · effort **M** · risk med
**Gap.** Staging is centered/symmetric preset x/y (`shots.ts`); no thirds, no scale
contrast (tiny person vs huge idea), no intentional negative space.
**Mechanism.** Add off-center / thirds framing variants to shot presets and a `scaleContrast`
staging mode (dwarf the figure against a dominant motif) chosen by the director on emphasis
beats. Composes with `arcOf("grow")`.

#### 8. Expressive kinetic typography  · effort **M** · risk low
**Gap.** `KineticText.tsx` (284 lines) is solid but one-note: pop/box callouts.
**Mechanism.** Per-letter/per-word stagger, `clip-path` line-mask reveals, count-up numbers
for stats, and type that **anchors to a gesture** (callout appears where the hand points).
**Files.** `KineticText.tsx`, `shots.ts` (anchor to character hand position).

#### 9. Argument-spine through-line motif  · effort **S** · risk low
**Gap.** No recurring visual anchor tracking the book's spine. Reference channels reprise a
motif so the film feels authored, not assembled.
**Mechanism.** A per-book "spine" glyph (for Supercommunicators: the *"what's this really
about?"* mark) that recurs at act boundaries and the payoff, evolving slightly each time.
Author it in `book.json`; director reprises it.

---

## Suggested phasing

- **Phase A — ✅ COMPLETE 2026-09-08:** #1 multiplane + #2 look-at landed as engine
  capabilities AND wired into the director — `plan-antidote.js` now emits
  `meta.multiplane:true` and auto-assigns `lookAt` per shot, so every future book / re-plan
  gets it with no per-config authoring. Dev reel `Antidote4-lab`; flat `Antidote-lab`
  verified unchanged. Existing book files are not re-planned, so they render flat as before.
- **Phase B:** #3 diagram class (biggest *content* lever) + #2 full orientation/interaction.
- **Phase C:** #4 transitions, #5 lighting/shadow, #6 secondary motion.
- **Phase D:** #7 composition, #8 typography, #9 spine motif.

Each phase ends with: `node scripts/audit-antidote.js --all` still passing its intent, a
side-by-side prototype render vs a current book, and a note in `AGENT_LOG.md`.

## How to measure "closer to the reference"

- **Depth:** does a camera move separate planes? (currently no for actors)
- **Intent:** in any 2-person frame, is at least one looking at the other/the subject?
- **Explanation:** what % of conceptual beats *show* the idea vs show a talking head?
- **Continuity:** do shapes carry across cuts, or does every cut reset to zero?
- **Grounding:** do figures touch the floor (contact shadow) or float?
