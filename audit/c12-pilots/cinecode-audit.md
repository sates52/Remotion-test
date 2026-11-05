# CineCode → Antidote technique-transfer audit (cycle 12 input)

- External repo: `ext/cinecode` @ `67f9807` (MIT, Sarp Yıldız). Read only; nothing executed or installed.
- Our side: `wt-c11` @ `a04c997f` ("c11: Director 1.0 A/B result — NO SHIP").
- Line numbers: `file:line` for the cited file. The baseline for every "benefit" claim is the c11 result
  (`audit/c11-pilots/result-c11-director.json`): B vs A **+5.3 pp (CI −7.8..+16.4)**, WRONG 2 → 4, DEAD 14 → 2.5,
  EXPLAINS 0.5 → 14, ADDS 35 → 34.5. Staged B beats gained about +15 pp. H quote cards lost about 4 pp and caused 6 of
  the 8 WRONG judgements. One arrow was read as the wrong direction of influence (B17).

Context that limits every estimate: our verdict instruments are **stills**. `mute-test.js:123-129 sampleFrame()` takes
one still per beat at max(70 %, last text + 30 f). The c11 raters saw 3 stills per beat (30/60/90 %), and
`framecheck.js:300` uses `SEQ_FRACTIONS`. No technique that acts only on motion can move these numbers directly. Several
CineCode checks are motion and pixel checks, so for us they are diagnostics, not comprehension levers.

---

## 1. Shot Reads: a timed information hierarchy

**Source**
- `templates/shots.example.json:18-33`: every shot has `"reads": [{"t": [0.0, 1.5], "read": "<what the viewer reads first>"}, {"t": [1.5, 3.0], "read": "<the question it opens>"}]`. Windows are in **shot-local seconds**.
- `scripts/validate_shots.py:182-190`, `main()`:
  - no reads → **error**: "no reads (what must the viewer understand here?)"
  - a window outside 0..dur, or with `t[1] <= t[0]` → **error**
  - `t[1]-t[0] < 0.5` → **warning**: "gets only X s"
- `references/craft.md:21-22`: "Each shot has one job (a read) and one action … **One important read at a time.** Give each read time: ≥ 0.5 s for a simple shape, 1.5–3 s for something new."
- On-screen text dwell (same family), `validate_shots.py:197-209`:
  - `TEXT_MAX_WORDS = 6` (line 29) → **error**
  - shown time must be `≥ 0.6 + 0.25 × words` s (line 203) → **error**
- `scripts/animatic.py:137` prints the reads onto the grey card. The reads are the review script.

**Our current equivalent**
- `scripts/lib/semantic-director.js:60-70`, `validate()`: one untimed `understanding` (≤ 30 words), an unordered `required[]` and a free-text `camera.purpose`.
- `src/engines/antidote/schema.ts:737-746`, `directorSchema.revealOrder`: an untimed string array. Its values are template defaults from `scripts/lib/visual-intent.js:884/894` (e.g. `["speaker","environment"]`), and nothing renders or checks it.
- Element-level timing does exist, but only inside the diagram modules. `causal.ts:63-68` (`startOf`) and `mechanism.ts` give a word-anchored `at` frame per element. These are "when is X drawn", not "what must the viewer have understood by when".
- `validate-screen-text.js` / `lib/screen-text.js:179` check length and grounding. They do **not** check dwell time.

**Missing capacity**
- An ordered, timed statement of what a muted viewer must read, with a minimum window per read.
- A check that the picture state inside each window carries that read.
- A dwell rule for printed words. An H quote is up to 14 words (`semantic-director.js:76`), so it needs ≥ 4.1 s by CineCode's rule.

**Transfer type:** technique adaptation. The validator logic is about 30 lines and trivial to rewrite in JS, so no code needs to be copied.

**Narrowest integration point**
1. Add `reads: [{t:[a,b], read, entity?}]` to the `semantic-director/1` contract. Use **beat fractions**, not seconds, because our beats are word-timed.
   - Validate it in `validate()` (`semantic-director.js:53`):
     - 1–3 reads
     - non-overlapping, ordered
     - a read that names an effect entity must start no earlier than that event's `cue + token + pause` from `timeline()` (`:164-197`)
     - each window ≥ 0.5 s, and ≥ 1.5 s for the read that carries the effect (craft.md:22)
     - the last read ends at or after `sampleFrame`'s 70 % point
2. `compile()` (`:200-210`) passes the windows through as `semantic.reads`.
3. `framecheck.js:321-335` `framesFor()` already special-cases the action moment (the skin-in-the-game 230 lesson). Add one branch: when `scene.semantic.reads` exists, sample the midpoint of each read window, and give the judge the read text as the per-still key.
4. Dwell rule: add one check in `lib/screen-text.js` (`0.6 + 0.25 × words` s) as a **report** code first.

**Expected benefit for a muted viewer (skeptical)**
- The direct comprehension gain is small. Writing reads does not change a pixel.
- The real gains are structural:
  - It makes the author state the information hierarchy, which the c11 contracts lacked. `understanding` collapses cause, pause and effect into one sentence.
  - The validator can then catch a contract whose effect window is shorter than 1.5 s, or that lands after the 70 % still.
  - Framecheck can tell which read failed (cause vs effect vs direction, as in B17's arrow) instead of giving one verdict per beat.
- Risk: sampling stills at the read windows **raises measured comprehension by selecting better frames**. That would be measurement bias. Keep `mute-test.js sampleFrame()` unchanged; per CLAUDE.md invariant 2, changing it is the operator's decision. Use reads only in framecheck and readcheck diagnostics.

**How to measure**
- Per-read hit rate in framecheck: a judge marks each still YES/NO against its read.
- Count contracts the new validator rejects on the 40 frozen c11 contracts (dry: no authoring, no render).
- The pooled verdict stays the unchanged mute test on a fresh holdout.

**Cost**
- Code: about 80 lines JS (validator + compile pass-through + framecheck branch).
- Agent: about 2–3 extra short lines per contract.
- Render: none. Framecheck renders the same count of stills, at different frames.

---

## 2. Animatic-first film review

**Source**
- `scripts/animatic.py:2-14`, `main()` `:112-197`: builds a timed, low-resolution video from the same `shots.json`.
  - Per shot it uses, in order of preference: a rough clip (`--clips DIR/<id>.mp4`), a still (`--stills`), or a grey card showing `id`, timecode, duration, `description` and the `reads` (`:133-142`, card drawing `:65-78`).
  - Real cut points. Temp sound is a seeded brown-noise bed plus a 1.8 kHz tick on every cut (`temp_sound` `:90-109`); optional temp VO.
  - Width is 1/3 of the film (`--scale 0.333`).
  - Animatics are versioned: it refuses to overwrite (`:129-130`) and records a sha1 in `.animatics.json` (`:184-193`).
- `references/craft.md:86-94` (§6): "Ask the user one question: 'Is the pacing right? Any shot too long or too short?'"
- `references/context-protocol.md:49-58` (§3, "Diagnose before rebuild"): reproduce with 1–3 test frames, write the root cause, fix the smallest thing.

**Our current equivalent**
- `scripts/readcheck.js`: a text-only blind reading of every beat before any render. This is our "grey card" stage, and it is stronger, because it is blind and judged.
- `scripts/framecheck.js:312-369` `sequence()`: per-passage strips of 1–4 stills per beat, blind describer and judge. This is the "stills animatic" for an agent, who cannot watch video.
- `render-stills.js` / `stills-cloud.js`: cloud strips.
- The operator previews in Remotion Studio.

**Missing capacity**
- A **timed** artefact: real durations and cut rhythm at low resolution, with the narration, for the operator's pacing call before the full 10-way render.
- Agents get no timing signal. A strip shows content but not duration.

**Transfer type:** technique only. Remotion can render a frame range at `--scale=0.33` and low CRF. Nothing to port; animatic.py's ffmpeg/Chrome card machinery is redundant for us.

**Narrowest integration point**
- Add a `--animatic` mode to the cloud stills path: a manifest job type that renders a passage as a 0.33-scale mp4 on Actions, plus a contact-sheet still every N s. Put it in `scripts/render-stills.js`, after the job loop.
- Or do nothing: Studio already serves the operator.

**Expected benefit for a muted viewer:** low.
- Pacing is not what failed in c11. Our verdicts are still-based, and the ceiling there was "most narration-level claims are hard to show" (result findings).
- An animatic helps an operator catch long dead holds. `audit-antidote.js` (dead-air gap ≤ 8 s) already measures that from config.

**How to measure:** the operator's pacing notes per passage, and the change in dead-window count after a fix. Neither is a comprehension metric.

**Cost:** one Actions job per passage (about 1–3 min runner for 60 s at 0.33 scale). Agent: none. Operator: watching time. **Backlog.**

---

## 3. Camera-motion-subtracted subject movement (`scene_check.py action`)

**Source**
- `scripts/scene_check.py:15-20` (docstring), `Aligner` `:97-156`, `do_action()` `:159-184`.
- Algorithm:
  1. Sample at `--fps 4`: grey, 80 px wide (`SAMPLE_W = 80` `:43`), `gblur sigma=1.5` (`:92`).
  2. Use a centre crop of 0.8 × the short side (`CROP` `:44`) with radial weight `1 − 0.7·r²/R²` (`:107`).
  3. For each consecutive pair, search the best global similarity transform:
     - scales `(0.94, 0.97, 1.0, 1.03, 1.06)`
     - shifts ±6 px in steps of 2 on a coarse checkerboard subset (`:149-150`)
     - refine ±1 px and the adjacent scales on the full set (`:152-153`)
     - then a bilinear sub-pixel ±0.5 px / ±0.01 scale step (`:154-155`)
  4. `residual = min(raw, best)`. Per scene, drop the first and last 0.2 s (`EDGE_S` `:47`) and take medians.
  5. **Flag** when `res < --min 1.0` (grey levels) **or** `res < --share 0.3 × raw` (`:179`). Verdicts: "nothing moves" or "camera-led, the subject barely acts" (`:181`).
- Rule source: `references/craft.md:21`: "Camera motion alone is not a scene; the camera moves with the action."
- `validate_shots.py:157-158` makes `action` a required field ("the camera move is not it").
- `references/engine.md:78` restates the 30 % rule.

**Our current equivalent**
- `scripts/audit-antidote.js` (dead-air gate, `MAX_GAP = 8` s at `:34`). It is **config-based**, and it **counts camera motion as events**:
  - `:94` `punch` pushes an event
  - `:98-99` every `camera.pulses` frame pushes a `"pulse"` event and increments `own`
  - So a scene whose only changes are camera pulses is not a "silent scene" (`:106`).
- `src/engines/antidote/movements.ts:662-701` `camera()`: whole-beat drift (zoom/panX/panY) + punch + `PULSE_AMOUNT = 0.035` pulses. These are exactly the camera-only changes CineCode refuses to call action.
- The memory note on dead air records the audit going from 22.1 to 37.1 events/min after the pulses were added. Part of that gain is camera-only by construction.
- `scripts/audit-stagnation.js` + `lib/antidote-stagnation-engine.js:114,180`: a config fingerprint over 3 consecutive beats. No pixels.
- Mute and framecheck `DEAD` = contribution NONE on a still.

**Missing capacity**
- No measure separates "the picture changed because the camera moved" from "the subject or state changed".
- The c11 SemanticStage is locked (`semantic-director.js:209` `camera: {zoom:[1,1],…}`), so all of its residual is real state change. Legacy storyboard beats are the ones at risk.

**Transfer type**
- **Code transfer is feasible.** It is pure arithmetic, about 120 lines in Node: ffmpeg rawvideo grey frames + the same search.
- Two cheaper and more exact alternatives exist because our camera is analytic:
  - **(a) Config-level:** in `audit-antidote.js`, report a second gap list that excludes `punch`/`pulse` ("subject-event gaps"). About 10 lines, no render.
  - **(b) Analytic pixel version:** render each sampled still twice, once with the scene's `camera` forced to identity via inputProps on the cloud stills path. The diff between t and t+Δ under an identity camera is then the subject residual exactly, with no alignment search.
- If code is ported, keep the MIT notice (see Licence).

**Narrowest integration point:** (a) as a **report-only** second line in `audit-antidote.js` next to `:99`. The existing gate must stay as computed: "never change a bar — or how it is computed" (CLAUDE.md invariant 2). Changing whether pulses count as events is an operator decision.

**Expected benefit for a muted viewer (skeptical)**
- No direct effect on still-based comprehension. A still cannot show motion of either kind.
- What it buys is honesty in the dead-air metric: it reveals beats whose "events" are only camera pushes. Those are candidates for a real state change (a SemanticStage event, a `causal.ts` station), which is what raised EXPLAINS 0.5 → 14 in c11.
- So it is a **targeting tool for where to add mechanism**, not a fix.
- It can mislead on our art: parallax layers (`movements.ts` `parallax()`) and entry springs count as residual (`scene_check.py:19-20` admits "parallax between depth planes counts as residual").

**How to measure:**
- Share of beats flagged "camera-led".
- Correlation of that flag with `DEAD` in existing mute runs. No new rating is needed: join the flags to past `audit/mute/*/judge-result.json` by beat id.

**Cost**
- (a) none.
- Pixel port: decoding a preview mp4 at 4 fps × 30 min ≈ 7.2 k samples. The JS search is about 1e9 simple ops, tens of seconds. Run it on Actions if the local-load guard objects.
- Agent: none.

---

## 4. Visual Proof: progressive mechanism reveal

**Source** (`styles/visual-proof.md`; this recipe is CineCode's own, `styles/index.json`: `"source": "cinecode"`)
- `:11-12`: "**One idea per scene, built, never shown whole.** … the area is seen before it is named."
- `:13-14`: "**Colour is meaning:** each quantity has one colour for the whole film … the symbol, the shape and the label share it."
- `:15-16`: "The equation comes out of the picture: the term flies from the shape it measures into its place."
- `:17`: "**One thing moves at a time;** the rest waits, slightly dimmed."
- `:44-48`: 0.8–1.5 s per change, 0.1–0.2 s stagger; "Transforms keep identity: a term that rearranges moves as itself."
- `:73-76`: one idea per scene, old ones dimmed or gone; "a visual proof that is false is worse than none".

Related LemoLab recipes (MIT, vendored by CineCode):
- `styles/iso-infographic.md:30` and `:84` ("Focus + context: everything greys except the subject")
- `:44` "**Nothing moves without a line leading it**: a route line is drawn slightly ahead, a leader grows before an inset opens"
- `:57` camera "Follow along a route | process; cause → effect"
- `:99` "An object drawn with the wrong silhouette reads as something else"
- `styles/data-physical.md:11` "Growth is assembly … never scales or morphs"
- `:40` "a verdict … appears only after the readings it judges have been still for ≥ 2.5 s"
- `:89` "Counters that roll by time instead of by landed pieces lie"

**Our current equivalent**
- Most of this already exists in the **diagram path**:
  - `src/engines/antidote/causal.ts:1-24`: stations appear on their word in causal order; a "?" slot shows a missing WHY; the token keeps its identity; relabel instead of redraw.
  - `causalLedger.ts`: an append-only ledger, one shared scale.
  - `mechanism.ts`: factor blocks stack on their word; persisting blocks "slide across UNCHANGED".
  - `Diagram.tsx:185` dims losers.
- The **c11 SemanticStage does the opposite**:
  - `SemanticStage.tsx:146-228` draws every entity at full strength from frame 0 (only `present:false` starts hidden, `:44`).
  - The only focus device is the accent ring on the cause (`:126`); non-cause icons get a neutral grey (`:189`).
  - Nothing dims while the effect resolves, and the arc and arrowhead persist (`:138`).
- Contract labels are grounded per beat (`labelGrounded` `:46-50`), but there is **no film-level entity → glyph/colour identity table**. CineCode's "a quantity keeps its colour across every scene" has no equivalent. `motifs.json` covers own icons, not per-quantity identity.

**Missing capacity (in the c11 stage only)**
1. Build order: the cause entity first; the effect entity enters or brightens only when its event fires.
2. Focus + context: the entities not involved in the current occurrence are dimmed (≈ 0.45 opacity), restored at the end.
3. A "line leads motion" rule: the arc draws ahead of the token. Today the token and the arc appear together (`:138-139`).
4. Film-level identity: the same narration noun gets the same glyph and the same lane side across beats.

**Transfer type:** technique adaptation only. The source is prose, and our renderer is React SVG.

**Narrowest integration point**
- `SemanticStage.tsx`, in the `spec.entities.map` blocks (`:146`, `:187`): an opacity multiplier from a pure function `focus(spec, frame, id)`, computed from `spec.occ` beside `semanticState()` (`:41`).
- Arc-ahead-of-token: change `strokeOpacity` at `:138` to lead `tk` by about 6 frames.
- No contract change is needed for (1)–(3). For (4), add a book-level `entities.json` read by `validate()`.

**Expected benefit for a muted viewer (skeptical)**
- Plausible but unproven:
  - The B17 failure (arrow read as the wrong direction of influence) is the kind of misread that build order fixes: if the effect entity appears after the cause, the direction is in the sequence, not only in an arrowhead.
  - Dimming bystanders lowers the number of candidate causes in a still.
- Counter-risks:
  1. On a 30 % still the effect entity may not exist yet, so the still carries less information (ADDS could drop on early stills).
  2. Dimmed entities may read as "lost" or "dead", a new WRONG class. CineCode itself warns "Solids arrive by motion, never by alpha (semi-transparent blocks look like ghosts)" (`iso-infographic.md:47`). So dim with desaturation and a thinner stroke, not alpha.
  3. The mute verdict still at ≥ 70 % sees the settled frame, where focus has been restored. So the effect on the verdict metric may be about zero, and the benefit shows up mostly in 3-still strips.

**How to measure**
- Renderer-only A/B: re-render the 40 **frozen** c11 B contracts with the new stage (no new authoring). Compare the per-read hit rate and the arrow-direction misreads on 3-still strips with fresh sonnet describers.
- Because those beats have been seen, this is a **diagnostic only**. A verdict needs a fresh holdout (CLAUDE.md invariant 3).

**Cost:** about 40 lines TSX. 40 beats × 3 stills = 120 stills, about 4 cloud shards (`stills-cloud.js`, 30 stills/shard). 80 describer + 40 judge sonnet calls, as in c11.

---

## 5. Camera purpose and shot grammar

**Source**
- `references/camera-moves.md:3`: one **camera line** per shot, "**name, seconds, speed easing, target**".
- `:17-19`: speed words are quantified. Slow = subject size change ≤ 10 %/s, or ≥ 6 s to cross the frame. Medium = 10–25 %/s, or 3–6 s. Fast = > 25 %/s.
- `:21` easing semantics: ease-out for hooks; "inertia" (35 % linear + 65 % smoothstep).
- `:23`: "One primary move per shot, plus at most one secondary … Every move has a reason: follow, reveal, tense (push), release (pull)."
- `:88`: "push = tension or importance, pull = release or reveal, track = travel, crane = scale, orbit = scrutiny, handheld = presence, **locked off = let the subject or light move**."
- `:90`: "Spend the big ones once." `:91`: "Consecutive shots differ in move, size or direction."
- Enforcement in `validate_shots.py`:
  - `MOVE_NAMES` (`:30-32`)
  - a moving shot without a camera line → error; a line not starting with a move name or without seconds → warning; a line longer than the shot → warning (`:163-170`)
  - **framing repetition**: key `location|size|lens_mm` → error unless both shots set `"motif": true` (`:192-195`)
- `craft.md:65` gives cut reasons, a closed list: "the next step of a process · … · this caused that · later · back to an earlier image, changed (a callback). A cut with no reason is the one to remove."
- The style recipes carry move → meaning tables with a "Can serve" column (`iso-infographic.md:55-64`; `data-physical.md:55-62`), e.g. "Locked three-quarter frame on two subjects | comparison".

**Our current equivalent**
- `src/engines/antidote/shots.ts:46+` `SHOTS`: 15 framing presets (wide, medium, closeUp, …). These are **framings**, not moves.
- `movements.ts:662` `camera()` + `schema.ts:640-652` `cameraSchema` `{zoom, panX, panY, punch, pulses}`: numeric moves with **no name, no purpose, no target**.
- `schema.ts:737-746` `directorSchema.cameraIntent` / `motionIntent`: free text; the values are templates from `visual-intent.js:881-900`.
- c11 contract `camera.purpose`: required free text (`semantic-director.js:69`). `camera.framing` can only be `"wide-locked"` (`:70`). All 40 frozen contracts write a purpose, e.g. B01 "secret and society in one frame so the loss reads as caused by the secret", but nothing checks it against anything.

**Missing capacity**
- A closed purpose vocabulary tied to a measurable move (follow / reveal / tense / release / hold).
- A **target entity** that the move must end on.
- A framing-repetition rule across consecutive beats. The config fingerprint in `audit-stagnation.js` is the closest equivalent, but it hashes 10 fields over 3 beats and has no `motif` exemption.

**Transfer type:** technique and schema adaptation. The ideas are trivially expressible in our `cameraSchema`.

**Narrowest integration point**
- In the contract: `camera: {purpose: "hold"|"tense"|"release"|"follow", target?: <entity id>}`. Validate in `semantic-director.js:69-70`.
- `compile()` (`:209`) maps it to `zoom`/`pan`:
  - `tense` = push 1 → 1.08 toward `semanticLayout()` of the target, after the last change cue
  - `follow` = pan with the token
  - otherwise `hold` (today's behaviour)
- Hard rule: the final frame must keep **every** cause and effect entity in frame. CineCode states the same for comparisons, "comparisons keep both subjects completely in frame" (`data-physical.md:64`).

**Expected benefit for a muted viewer (skeptical):** low, possibly negative, for still-based metrics.
- c11 chose `wide-locked` on purpose so one still holds cause and effect.
- A push crops context, and on a still a move is invisible except as tighter framing.
- The only plausible gain is a `tense` push onto the effect entity after it changes, which points the eye at the result in the 90 % still. That is a small, testable claim.
- CineCode's own grammar agrees that for a mechanism the default is "locked off = let the subject … move" (`:88`).

**How to measure:** the same renderer-only strip A/B as §4, comparing `hold` vs `tense-on-effect`. Report the effect-read hit rate and WRONG.

**Cost:** about 30 lines JS. Render the same stills as §4. **Backlog.** Adopt the purpose enum as metadata now (free), and the move later.

---

## 6. Per-scene craft and repetition checks (`qc.py`, `scene_check.py`, `craft.md`)

**Source**

| Check | Location | Rule |
|---|---|---|
| repeats | `scene_check.py:309-342` (`do_repeats`) | one 32 px grey frame per second; any pair ≥ 6 s apart with mean abs diff < `--repeat-mad 5.0` (`:356`) is a repeat; runs folded into spans; exit 1 when repeated seconds > 10 % of the film (`:342`) — "each repeat is a new picture … unless the card names it a callback" |
| pops | `scene_check.py:264-278` | 48 px grey frames; frame n is a pop when both steps into and out of it are ≥ 4 grey levels and the skip a→c < 0.35 × the smaller step |
| hook | `qc.py:73-93` | mean luma diff over 0–2 s ≥ 0.5, and every pair of steps has one ≥ 0.02 |
| freeze / dup / black | `qc.py` | ffmpeg `freezedetect`, `framemd5`, `blackdetect` |
| rhythm | `validate_shots.py:46-71` | shot-length CV < 0.30 → warning (when ≥ 12 shots); ≥ 5 consecutive shots within 15 % of each other → warning; act or chapter averages within 25 % → warning |
| framing repetition | `validate_shots.py:192-195` | see §5 |
| text | `validate_shots.py:197-209` | ≤ 6 words; ≥ 0.6 + 0.25 s/word |
| cut reasons | `craft.md:65` | closed list (see §5) |
| device review | `motion-design.md:25` | "each device must answer 'what does this tell that the picture alone could not?' in one line; one that cannot is cut, not polished" |
| silent one-sentence test | `engine.md:80` | a fresh helper sees only the contact sheet and says what the film is about in one sentence |
| cold self-review | `engine.md:82` | 0–2 × 5 axes, "Always report the **3 weakest shots**" |

**Our current equivalent**
- `audit-stagnation.js`: config fingerprint, 3 consecutive identical beats → FAIL.
- `audit-novelty.js`: 45 s / 60 s novelty budget.
- `audit-antidote.js`: dead-air gap.
- `lib/screen-text.js`:
  - `:179` LENGTH
  - `:284` `BOOK_REPETITION` (the same string on more than `REPEAT_LIMIT` scenes)
  - `:200-202` PAIR_DUPLICATE / PAIR_OVERLAP
- `mute-test.js` / `framecheck.js` / `readcheck.js`: blind describer + judge. This is a stronger, per-beat form of the silent one-sentence test.
- Post-render decode checks in the render-deliver path.
- **None:** a pixel-level far-apart repeat check, a pop check, or a text dwell check.

**Missing capacity**
1. **Pixel repeats.** The config fingerprint misses beats with different configs that look the same (same set, same rig, different icon too small to matter). It also flags beats with the same config that look different. CineCode's `repeats` measures what the viewer actually sees.
2. **Text dwell** (see §1).
3. **Pops**: one-frame glitches at transitions or word-synced entries. These are a render-quality issue, not a comprehension one.

**Transfer type:** code transfer of small, self-contained algorithms (`do_repeats` is about 30 lines, `do_pops` about 15) to Node + ffmpeg rawvideo. MIT notice if ported literally; a reimplementation from the description needs none.

**Narrowest integration point**
- A new `scripts/lib/pixel-repeats.js`, run report-only on `out/<slug>.preview.mp4` or on the cloud strips.
- Its output joins `audit-stagnation.js`'s report as a second, measured line (pixel spans vs fingerprint violations).
- The dwell rule goes in `lib/screen-text.js` (§1).

**Expected benefit for a muted viewer (skeptical)**
- Repeats: modest and indirect. A muted viewer who gets the same picture for two different claims cannot tell them apart. That is a DEAD/WRONG precursor ("material running out"), but our blind tests already catch it on the beats they sample.
- The pixel check adds full-film coverage cheaply; the blind tests do not add coverage.
- Pops and hook: no comprehension value (the hook rule targets 9:16 social, `craft.md:29-31`).
- Text dwell: real for H quote cards and long callouts. c11's quote cards were the WRONG source, though their misreads were semantic (concession, classroom set), not timing.

**How to measure**
- Pixel-repeat spans per film vs `audit-stagnation` violations: agreement / disagreement table.
- Repeat-flagged beats' DEAD rate in existing mute runs (join by beat id, no new rating).

**Cost:** about 60 lines JS. One decode of the preview at 1 fps × 32 px (trivial). The O(n²) pair loop is 1,800² ≈ 3.2 M diffs of 32×18 px, a few seconds. Agent: none.

---

## Licence findings

- **CineCode: MIT**, "Copyright (c) 2026 Sarp Yıldız (@sarpstar)" (`LICENSE:1-3`).
  - Reimplementing **techniques** (rules, thresholds, schema field names, prose ideas) needs no attribution; ideas and numbers are not protected.
  - If any **code** is copied or closely ported (e.g. `Aligner`, `do_repeats`, `do_pops`), keep the MIT copyright line + permission notice in that file's header, e.g. `// Adapted from cinecode scripts/scene_check.py (MIT, (c) 2026 Sarp Yıldız)` plus the notice text. A courtesy credit in AGENT_LOG is good practice.
- **Style recipes**: `styles/data-physical.md` and `styles/iso-infographic.md` are **LemoLab's**: "Copyright (c) 2026 LemoLab", MIT (`styles/LICENSE-lemo-opuscar`; `styles/index.json` header `"licence": "MIT (styles/LICENSE-lemo-opuscar)"`; `README.md:343`). The same rule applies: copying their text verbatim into our docs needs the LemoLab MIT notice; adapting ideas does not.
- `styles/visual-proof.md` is CineCode's own (`"source": "cinecode"`).
- **Upstream credits inside CineCode** (all MIT, "rewritten in our own words; no code or text copied", `README.en.md:344-345`):
  - beat types and cut reasons ← cth9191/animate (`craft.md:48`)
  - cut seams, **pop and loop checks**, the **silent one-sentence test** ← howseen-ai/claude-motion-design
  - These bind nothing extra on us, because CineCode already re-expressed them.
- **Assets and dependencies that could bind us:** none, as long as we stay at technique level.
  - The kit's render deps (three.js MIT, postprocessing Zlib, MathJax Apache-2.0 only when formulas are used, `visual-proof.md:80`) are irrelevant: we would not use them.
  - Poly Haven HDRIs/textures are CC0.
  - Fontshare fonts (ITF Free Font License, no redistribution) appear only in the README.
  - The demo engines and posters of the LemoLab styles are **links**, not bundled (`data-physical.md:117`).
  - The data-physical recipe's dataset advice (OWID / World Bank CC BY 4.0, `:100-105`) only matters if we ever show real statistics.
- **Nothing copyleft, nothing non-commercial.** The monetised YouTube use is unaffected.

---

## Fields in `shots.example.json` worth copying (exact names)

Present in the template (`templates/shots.example.json`):

- `"reads": [{"t": [start, end], "read": "…"}]` (`:18-33`): **copy**, as beat-fraction windows (§1).
- `"action"` (`:17`) + `"action_from_frame_1"` (`:46`): copy `action` as a required one-line "what the subject does / what changes".
  - Our `transformation` is close but optional for G, and nothing checks it against camera-only motion.
  - `action_from_frame_1` is a social-hook rule. **Skip.**
- `"camera": {"size", "angle", "lens_mm", "move": {"line", "type", "speed", "moving_at_start"}}` (`:34-44`)
  - `move.type` (`"locked"`, `"push-in"`, `"tilt-up"`, `"crane-down"`) and `move.speed` (`slow|medium|fast`, quantified at `camera-moves.md:17-19`) are worth copying as an enum next to our numeric `zoom/panX/panY`.
  - `size` maps onto our `shot` name; `lens_mm`/`angle` have no meaning in flat SVG. **Skip those two.**
- `"description"` (`:16`), `"location"` (`:15`), `"transition"` (`:48`), `"text_on_screen": [{"text", "t"}]` (`:51`; dwell-checked at `validate_shots.py:197-209`), `"vo"` (`:50`), `"hook"` (`:45`), `"status"` (`:49`).
  - Worth copying: `text_on_screen` with its own `t` window, so dwell is checkable.
  - Already covered by our scene/texts/captions: the rest.

Read by the validator, but **not** in the template:

- `"motif": true` (`validate_shots.py:193`): the explicit exemption for a deliberate framing repeat. **Copy**; our stagnation audit has no way to say "this repeat is a callback".
- `"act"` / `"chapter"` / `"section"` (`:62`): the pace-per-act check. We have `bg.act` (`schema.ts:636`), so we could reuse it.

`"purpose"` is **not** a field in shots.json. CineCode keeps the camera's reason in prose (`camera-moves.md:23,88`) and in the camera line's "target". Our c11 contract already has a stronger `camera.purpose`; the gap is that it is free text. Make it the enum `follow|reveal|tense|release|hold` + `target`.

---

## Recommendation

**Implement first (in this order)**

1. **Shot Reads in the director contract (§1)**
   - Why: it costs no render, it attacks the c11 diagnosis directly (one-sentence `understanding` hides whether cause, effect and direction each got a readable window), and it turns framecheck into a per-read diagnostic.
   - Fold the **text-dwell rule** (`0.6 + 0.25 s/word`, §6) into the same validator pass. It is the one CineCode number that bears directly on H quote cards.
   - Keep `mute-test.js sampleFrame()` untouched; changing the sampled frame is an operator decision.
2. **Visual-Proof build order + focus/context in SemanticStage (§4)**
   - Why: the only one of the six that changes **pixels** in the direction c11 says pays (staged change gave +15 pp, EXPLAINS 0.5 → 14). It also directly targets the arrow-direction misread.
   - It is renderer-only, so it can be A/B'd on the 40 frozen contracts as a diagnostic without new authoring. The verdict still needs a fresh holdout.
   - Dim by desaturation and stroke, not alpha (CineCode's own ghost warning).
3. **Camera-subtracted subject activity as report-only (§3), config version first**
   - Why: about 10 lines in `audit-antidote.js`, giving a second "subject-event gap" list that excludes `punch`/`pulse`. It shows how much of the dead-air PASS is camera-only, and points authors at beats that need a real state change.
   - Add the pixel version (identity-camera stills on the cloud path, or a Node port of `Aligner`) only if the config version disagrees with DEAD in past mute runs.
   - The gate stays computed as it is unless the operator decides otherwise.

**Backlog**
- §6 pixel `repeats` (cheap, full-film coverage, indirect benefit).
- §5 camera purpose enum + `target` (adopt the enum as metadata now; a `tense`-on-effect push only after a strip A/B shows it does not crop the cause).
- §2 low-res animatic on Actions (operator pacing aid only; readcheck + framecheck `sequence` already cover the agent side).
- §6 pops / hook / loudness-per-scene (render QA, no comprehension value).

**Skeptical bottom line:** CineCode is a cinematography kit for wordless 9:16 shorts. Its strongest rules (the hook, camera grammar, motion residual) act on motion and pacing, and our verdicts are still-based. What transfers cleanly is its **planning discipline**: timed reads, one action per shot, a camera with a stated reason, and dwell rules. Also its "one thing at a time, built in order" proof grammar, which our `causal.ts` path already half-implements and the c11 stage does not. No single technique here should be expected to close the +20 pp gap that c11 missed. The c11 result's own ceiling note (43 % of key beats state no causality) bounds all of them.
