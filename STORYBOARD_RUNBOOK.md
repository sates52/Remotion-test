# Storyboard Runbook — taking a book to a clean PREVIEW (Antidote & Vox)

This is the procedure a producing agent follows for a NEW book. It encodes what took We Were
Liars from "a phone on screen at 0:55" to a blind mute test of **0/30 wrong, image adds 70%**.
Do the steps in order. Do not skip the mute test: every gate can PASS on a film a muted viewer
misreads.

**How it is triggered:** the operator opens one session per book and says "dosyalar hazır, preview hazırla";
the `preview-hazirla` skill (`.claude/skills/preview-hazirla/SKILL.md`) runs this runbook for that book.

**Definition of PREVIEW-READY:** `node scripts/preview-ready.js --slug=<slug>` prints `READY`
(authored, every blocking gate PASS, latest FRESH blind mute test PASS: WRONG ≤ 1/30 and dead frames ≤ 5/30;
image ADDS ≥ 60% is the quality target — reported as "text-carried" when missed, not blocking. Operator decision 2026-09-28).
The bars live in `data/quality-policy.json` (operator decisions only). The judge also records **EXPLAINS**
(the picture shows the mechanism / relationship / cause→effect, not just the subject) — measured, never
blocking. make-book 1.8985 `gate-continuity.js`: every cast member keeps one look across the film.
`node scripts/quality-benchmark.js` = book × metric table from the mute-test records (no render).

---

## 0. Inputs (operator)
- Step 0 already done: `books/<slug>/book.json` (engine decided) + `prompt.notebooklm.md`.
- Operator drops `public/audio/<slug>.m4a` and `public/captions/<slug>.vtt`.
- Engine: `book.json.engine` (Step 0, often decided from the genre before the audio existed). `storyboard.js prep`
  re-checks it against the narration and STOPS on a strong contradiction — ask the operator, then
  `--confirm-engine` or change it with `make-prompt.js --engine=...`. No engine → back to Step 0.
- Read `AGENT_LOG.md` → Active WIP. Claim a row: `| <you> | books/<slug>/ preview | in progress | |`.
- Code = a commit: every production step starts with production-guard. A stop like "code file(s) on disk differ
  from HEAD" means this checkout is not running the committed engine — do not work around it; restore the old
  copies from HEAD (after checking AGENT_LOG) or commit. `preview-ready` shows which commit each step ran on
  (`books/<slug>/pipeline-record.json`), whether framecheck ran on the current config, and runs cause-ledger.

## 1. Fix the narration, author the story bible
```bash
node scripts/fix-vtt-names.js --slug=<slug>            # ASR name fixes on the RAW vtt
node scripts/plan-bible.js --slug=<slug> --vtt=public/captions/<slug>.vtt --emit=books/<slug>/bible.draft.json
```
Rewrite the draft (Claude) against its evidence, then
`node scripts/plan-bible.js --slug=<slug> --bible=books/<slug>/bible.draft.json`.
The bible must have:
- **cast** = every person the narration talks about, with a visual `look` (fiction: all named
  characters — WWL shipped without its three mothers; non-fiction: the author/host, named case
  subjects, and `everyman`);
- **visualProvenance.allowedMotifs / allowedLocations** that fit THIS book (no leftovers from
  another world — WWL had Plato's `cave`/`agora`);
- **spine** (acts with `fromFrame`) — the mute test stratifies by it;
- **signatureObjects** (Antidote) = the book's OWN things the summary keeps naming that no shared icon
  literally depicts: `[{"key":"mechanicalHound","name":"The Mechanical Hound","why":"..."}]`. Check
  `book.json → engineProfile.mustSee` and the draft's objects — never map such a thing onto the nearest
  shared icon (F451 filed its Hound under `medical`; the Hound was never on screen and the blind
  viewer read "healthcare"). Usually 1-4 per novel, often 0 for non-fiction.

### 1b. Draw the signature objects (Antidote)
For each signature object write an entry in `books/<slug>/motifs.json`:
```json
{ "mechanicalHound": { "title": "Mechanical Hound", "reads": "the eight-legged robot hound",
    "viewBox": "0 0 520 520",
    "paths": [ { "d": "M...Z", "fill": "ink" }, { "d": "M...", "stroke": "accent", "strokeWidth": 8 } ] } }
```
A recurring abstract MECHANISM the book keeps explaining is a signature object too — drawn as the
concrete thing a stranger would name: intermittent reinforcement → a slot machine, a dopamine hook →
a fishing hook, gaslighting → a dimming lamp. Unhinged's psychology beats scored TEXT_ONLY because
the shared icons have no picture for them (image adds 37%).
Flat vector, bold silhouette first (3-10 paths, `ink` / `accent` / hex fills) — it must be recognisable
at icon size with no label. It becomes vocabulary for the authors (`concept: "mechanicalHound"`) and
renders through the engine's `customSvg` motif: data, no engine code. `storyboard.js prep` stops while
a signature object has no drawing (`--skip-own-icons="<why>"` only with a reason).
**Then SEE them:** `node scripts/own-icons-sheet.js --slug=<slug>` draws every own icon on a numbered
sheet in seconds (headless Chrome, no bundle) and writes `storyboard/OWN-ICONS-PROMPT.md`: a fresh
agent (sonnet) names each number in 1-3 words without knowing the intent. Redraw every icon it names
as something else, until the names match. Drawn blind, SBC's casserole read "toaster", and Unhinged's
dopamineHook read as a noose and its tattooNeedle as a syringe.

### 1c. Dress the cast (Antidote)
The `look` text never reaches the drawing — `cast[k].variant` does. Without one, every character
falls back to a role template tinted with the book palette (F451: Montag, Clarisse and Beatty in the
same rust colour, Mildred's bleached blonde drawn white → "an elderly person", "identical men").
Give every cast member (except `narrator`) a variant translated from its look:
```json
"variant": { "gender": "m|f", "age": "child|young|adult|old", "build": "slight|average|heavy",
  "outfit": "suit|casual|uniform|robe|coat|dress|apron|armor|overalls|vest|cloak|hoodie|rags",
  "suit": "#1F2328", "shirt": "#C0392B", "skin": "#E8B98F", "hair": "#E3B34A",
  "hairStyle": "short|buzz|bald|long|bun|afro|curly|ponytail|braids|pigtails|messy|receding",
  "headwear": "none|cap|fedora|beanie|hood|headscarf|bonnet|crown|helmet|topHat|beret|veil|cowboy",
  "beard": "none|stubble|full|mustache|goatee|muttonchops", "glasses": false,
  "accessory": "none|tie|bowtie|scarf|necklace|badge|satchel|suspenders|collar" }
```
Characters who share a scene must differ at a glance (colour + outfit or build/age). Colours come from
the look ("black charcoal uniform" → near-black), not the palette. `storyboard.js prep` stops while a
member has no variant or two members are drawn alike, and warns on near-white hair for a non-old
character.

## 2. Author the storyboard (one round, parallel)
```bash
node scripts/storyboard.js prep --slug=<slug>
```
This writes `books/<slug>/storyboard/` — `rules.md` (engine- and genre-specific rules and the
exact vocabulary that renders for this book), `chunk-K.json` and **`PROMPTS.md`**.
**Run this prep AFTER the story bible, own icons and cast variants are final** (§1–§1c). An earlier prep (e.g.
the one that only confirmed the engine) is stale: prep records the sha256 of `story-bible.json` + `motifs.json`
in `vocab.json`, and `merge --write` refuses with `STALE PREP` when either changed afterwards. Authors use only
the files of the last prep. **Chunk cuts (2026-10-20):** prep cuts the author chunks at a nearby meaning transition
(size 40 ± 8: never mid-sentence or before "But/And/So…"; prep prints each moved cut), so one idea stays with one
author. A `continue` may still open a chunk (it continues the previous chunk's last beat): merge is book-wide.
**Authored sequences:** a `continue` run is ONE sequence to the engine (plan-sequence-arcs `source: "authored"`): no
engine curiosity role inside it and no engine grow/shrink/shake (`visualArc`) on its kept stage.
**The authoring method (Antidote, default since 2026-10-17):** for every beat the author first answers
"Which EVENT, COMPARISON or RELATIONSHIP makes this sentence's meaning visible?" (`explainedBy`) and stages
that answer — an action with an object, two people in a visible relation, a diagram — not a face plus a
callout. No icon quota; `noVisual` records honest gaps (they are VOCABULARY for-review items). Blind A/B on 17
weak beats: new storyboard preferred 24 to 3 (`audit/authoring-ab-2026-10-17/`). Every person a staged EVENT needs
must be a story-bible cast key, even if the narration names them once (the one who asks, the one who refuses);
a lead with no key forces empty or wrong stages. Do not add people the storyboard will not show.
**Sequences (since 2026-10-19):** passages that develop ONE idea over several beats are authored as a sequence
(rules.md "Sequences"): one kept stage (same person/object/diagram, same set), start -> change -> result,
`relationToPrevious` = the one change, `"continue": true` on kept beats (no re-entry, no rebuild; the diagram adds
only its new label). The kept object must READ as the thing itself — never keep an abstract stand-in icon across
beats (it spreads one misread over the whole passage). Use `continue` only where keeping the stage keeps the
meaning; no quota. A diagram beat shows nobody: merge refuses a diagram with a cast — choose one.
Evidence: `audit/sequence-lab-2026-10-19/`.
Run every author prompt in `PROMPTS.md` **in parallel** (one fresh agent each). Then:
```bash
node scripts/gate-b-relationship.js --slug=<slug>       # Antidote, only if any beat sets stageRelationship (see rules.md)
node scripts/storyboard.js merge --slug=<slug>           # validate; fix every ✗ (edit authored-K.json)
node scripts/storyboard.js merge --slug=<slug> --write   # → art.json (Antidote) / designs.json (Vox)
```
Read the merged icon histogram and 20 random beats yourself. Hunt for: an icon that only
matches a word; a happy face over tragedy; `strike` used as emphasis; `door` on "no way out";
`trophy` on weakness; `heart` where romance is rejected. Fix in `authored-K.json`, re-merge.

**Cast semantics (2026-10-19):** `cast` left out = the engine may cast; `"cast": []` = nobody on screen,
final (merge carries it to art.json, the lock seals it, the authorship gate FAILs on any figure there);
a filled cast ships exactly. **Icon behaviour** (rules.md "Icon behaviour" lists what THIS book's icons draw):
`"conceptMotion"` + optional `"conceptMotionCue": "<phrase spoken in the beat>"` (else the callout's word) —
`compass: spin` when the narration says it spins / turns uselessly. **State change (2026-10-20):** `chains: break`
(intact -> snapped apart), `phone: light` (dark screen -> lit with a message): the start state before the cue, the
end state after it, on every frame (a still shows the same as the clip). Put the cue on the word where the change
happens; the label names the change, the icon shows it. A `continue` beat with the same icon after a state change
repeats the same `conceptMotion` (merge refuses otherwise: the icon would jump back). `shotOverride: "beforeAfter"`
is refused on authored beats (it drew ONE icon, no after-state — burn 218); use a state change or a diagram.
**Every authored beat is sealed (2026-10-20):** an icon + callout beat locks its icon and callout (its shot stays
the engine's); no chapter card is ever stamped over an authored beat or for an untitled chapter (make-book logs the
skipped cards; a card would replace the whole beat). Refine youtube-meta chapter titles before the render make-book.
**Actions that happen (2026-10-20):** `"action": "take", "holds": X` — the object rests in front of the first cast
member, the hand closes on it on the cue and brings it in, it stays in hand; `"action": "embrace", "cast": [a, b]` —
`a` closes the gap, contact on the cue, both hold each other (always a two-shot unless you set the shot). Optional
`"actionCue": "<phrase spoken in the beat>"` = the moment (else 40%). A `continue` after a take keeps `"action": "hold",
"holds": X` (merge refuses otherwise); a continued embrace is not replayed. Every person staged needs a cast key AND a
`visualProvenance.allowedCharacters` entry in the story bible (the firewall BLOCKs otherwise).

**Relationship staging (Antidote, on by default since 2026-10-16).** Where a beat's claim is "one side
controls another through a message" (a lie, demands, warnings; a rejected method; a negated reading;
taking control back), the author may stage it instead of a face + callout: `stageRelationship: true`
and a quote-backed `relationship` record (format in rules.md), groups in story-bible `groups` with
evidence. Gate B (`scripts/gate-b-relationship.js`, Gemini, needs `GOOGLE_API_KEY`) must say STAGE for
the exact record, or merge refuses it. Nothing else changes for books that do not use it.

### 2b. Readcheck — a blind reading of EVERY beat, before any render (Antidote)
The rendered mute test (§4) sees 30 frames; this pass reads all of them as text, cheaply.
```bash
node scripts/readcheck.js prep  --slug=<slug>    # what a muted viewer gets per beat, no narration
```
Run the blind readers in `storyboard/readcheck/PROMPTS.md` (fresh agents, `model: "sonnet"`, parallel), then
```bash
node scripts/readcheck.js judge --slug=<slug>    # then the Judges section (fresh, sonnet, parallel)
node scripts/readcheck.js tally --slug=<slug>    # every WRONG beat + the element to blame
```
Fix every WRONG by its cause class (§4), `merge --write`, then re-read only what changed:
`readcheck.js prep --slug=<slug> --beats=<changed ids>` → readers → judge → tally. Aim for WRONG ≤ 3%
before the first render. An icon blamed on 2+ beats gets a row in `data/icon-readings.json`, so every
later book's authors are warned about it.

## 3. Plan with every gate
```bash
node scripts/make-book.js --slug=<slug> --title="<title>" --author="<author>" --genre=<genre> --skip-pack
```
- Antidote: must end with `Authorship Gate … → PASS` (step 1.898).
- Vox: the Authorship Gate runs **before Flux** (step 1.9) — an unauthored beat never costs an image.
- A gate FAIL is information, not an obstacle: read its report in `books/<slug>/*.report.json`.
  Content problems → fix the storyboard (step 2). Engine problems → **stop and log** (see §7).

### 3b. Framecheck — a blind look at the REAL frame of every beat (Antidote; optional, report-only)
Readcheck reads text; the misreads that fail mute tests come from the drawing (a face, an icon, a twin).
Framecheck renders each beat at the mute-test moment and has blind agents describe and judge it. It is
NOT the verdict, changes nothing and blocks nothing; the mute test still samples the whole film.
```bash
node scripts/framecheck.js prep  --slug=<slug> --label=fc1   # all beats, one bundle (~1 h for 260 beats)
# run each describer in audit/framecheck/<slug>/fc1/PROMPTS.md (fresh, sonnet, parallel)
node scripts/framecheck.js judge --slug=<slug> --label=fc1   # then each judge (fresh, sonnet, parallel)
node scripts/framecheck.js tally --slug=<slug> --label=fc1   # findings by beat -> books/<slug>/framecheck.json
node scripts/similar-candidates.js --slug=<slug>             # beats sharing a finding's staging, for REVIEW
```
One blind pass is noisy (Burn of the Everflame: two independent passes agreed on 19/30 verdicts and on
1 of 6 WRONG). Fix only a finding you have looked at and understood, never a whole class blind; re-check
the changed beats with `--beats=<ids> --label=fc2`. A finding that is the ENGINE (twins, unreadable
faces) goes to AGENT_LOG as for-review, not into the storyboard. After every framecheck tally run
`node scripts/cause-ledger.js --slug=<slug>` and follow the fix-round protocol (§4).

## 4. Blind mute test
**Sealed holdout (new books, since 2026-10-19).** Development checks (framecheck, clips, readcheck re-checks)
must never see the verdict sample. Right after the FIRST `make-book`, seal it, before any framecheck:
```bash
node scripts/mute-test.js prep --slug=<slug> --label=final --seal   # draws the sample, seals its beat ids + sha256, renders NOTHING
```
Then every framecheck uses `--exclude-from=final`, clips are cut only from beats not in
`audit/mute/<slug>/final/seal.json`, and fixes are made by CLASS (§4 rules), never by looking at sealed beats.
When the book is ready, run the same prep WITHOUT `--seal`: it re-renders exactly the sealed beats from the
current config (fresh frames, stale stills/answers removed), refuses if `sample.json` no longer matches the seal or
a sealed beat is missing (never substitutes), then its describer, `judge`, judge, `tally`: that is the verdict.
A tallied sealed label cannot be re-sampled; if it FAILs, the next holdout is an ordinary fresh `--label=run2`.
```bash
node scripts/mute-test.js prep  --slug=<slug> --label=run1     # 30 stratified stills, cropped, shuffled
```
Give `audit/mute/<slug>/run1/PROMPTS.md` §1 to a **fresh** agent (blind describer). Then
```bash
node scripts/mute-test.js judge --slug=<slug> --label=run1
```
(`judge` first proves every description is filed under the right image: the words the describer
read must be on that frame. If it stops with "filed under the wrong images", the describer mixed
images up — SBC run4 lost six frames to it — so re-run §1 with a fresh describer. It is not an
engine bug and not a storyboard problem.)
Give §3 to another **fresh** agent (judge). Then
```bash
node scripts/mute-test.js tally --slug=<slug> --label=run1
```
**FAIL?** The tally lists every frame that is not CORRECT+ADDS with the judge's reason. The 30
frames are a SAMPLE of the whole film — a failing frame stands for every beat built the same way.

**Fix-round protocol (operator-approved 2026-10-17).** Measured over 30 books / 51 fix rounds: 23
rounds made the mute test WORSE, mass re-authoring did not help (the-art-of-saying-no 130 beats: dead
4→9; burn 187 beats: WRONG 4→3→6), ~46% of WRONG were ENGINE-owned and ~13% RATER errors. The bars
and how they are computed do not change; the verdict stays one fresh mute holdout.
1. **Owner first.** After every mute (or framecheck) tally run
   `node scripts/cause-ledger.js --slug=<slug>` (advisory, report-only; override a row in
   `books/<slug>/cause-overrides.json`). **ENGINE** and **VOCABULARY** findings go to `AGENT_LOG.md`
   as `for-review` — never "fixed" in the storyboard. **RATER** findings are noted, not fixed.
2. **Fix an AUTHORING class only when it is confirmed:** seen in ≥2 failures, OR found by 2 agreeing
   blind passes, OR you opened the still and saw it. Apply it to the beats of that class that
   `similar-candidates.js` / the ledger list as REVIEW candidates — look at each, change only those
   that really are the class — not only the sampled beat. Report the number of beats changed (soft
   cap ~25 per round; above that, write the reason).
3. `merge --write`, re-run step 3.
4. **Never draw a new holdout on a film that has not changed since the last holdout** — re-sampling
   an unchanged film is a lottery (a true 5% WRONG rate passes a 30-frame run only 55% of the time;
   21-days-of-fear flipped W7→W1 within minutes). The ledger warns when the film is unchanged.
5. At most **2 fix rounds**. Re-test on a **FRESH holdout sample** — a new label with NO `--frames-from`. prep draws new
   frames and excludes every unit an earlier run already showed:
```bash
node scripts/mute-test.js prep  --slug=<slug> --label=run2
node scripts/mute-test.js judge --slug=<slug> --label=run2
node scripts/mute-test.js tally --slug=<slug> --label=run2
```
**Holdout rule:** fixing the frames that failed and re-testing those same frames is teaching to the
test — the result says nothing about the other ~240 beats. A run on reused frames
(`--frames-from` + `judge --vs`) is an optional diagnostic ("did my fix change what the viewer
sees?", judges differ by about ±4 so compare only within one judge) and `preview-ready` never
accepts it as the verdict.

## 5. Preview
```bash
node scripts/preview-ready.js --slug=<slug>
node scripts/gen-books-registry.js
```
`READY` → the operator previews `http://localhost:3001/Antidote-<slug>` (or `Vox-<slug>`).

### 5b. Render: modes, the pre-dispatch check, and the three facts
Every `render.js` run starts with ONE pre-dispatch check (`scripts/lib/render-preflight.js`). It prints the mode,
commit, config version, quality, decision, worker compatibility, and GO or STOP. Nothing is dispatched and no
pixels are produced on STOP. The check never edits the storyboard, the config, or the mute test.

| Mode | Command | What it is | Gate |
|---|---|---|---|
| **PREVIEW-ONLY** | `render.js --slug=<s> --method=github --preview-only` | A **FULL-LENGTH review render**: every frame, every segment, not a short clip. | REVIEW findings allowed (recorded as quality debt); BLOCK stops. Not delivery-approved. |
| **PRODUCTION** | `render.js --slug=<s> --method=github` | Delivery render. | Firewall PASS, or REVIEW findings covered by an accepted decision for this config. |

**Three facts, recorded per book, never merged:**
1. **Technical** — the output file exists, its frame count is within 0.5% of the config, and it decodes. Run
   `node scripts/verify-render-output.js --slug=<s>` after assembly (it runs automatically after a single-job
   GitHub download). A render completing is NOT a quality PASS.
2. **Quality** — the firewall's PASS/FAIL with BLOCK and REVIEW counts, in `books/<s>/narrative-visual-firewall*.report.json`.
   A FAIL is kept in `books/<s>/render-facts.json`; it is never deleted or rewritten.
3. **Decision** — the operator's. Recorded in `books/<s>/render-decision.json`, bound to the config file's hash.

**Accepting known quality debt** (operator decision only, never automatic):
```bash
node scripts/render.js --slug=<s> --method=github --accept-quality-debt="<why this debt is acceptable>"
```
- It applies to the exact config version (sha256 of `books/<s>/config.antidote.json`). The same REVIEW findings on
  that config are not asked again.
- If the config changed, the check prints what the accepted debt still covers, what is new, and what is gone, and
  refuses until a new decision is recorded.
- BLOCK findings are never accepted. Fix them (storyboard, §2) and re-run `make-book`.
- Do not use `--skip-narrative-firewall` to get past REVIEW; it is an emergency escape hatch.

**Retries:** transient causes only (network error, HTTP 429, 5xx), at most 3 attempts. Any other HTTP code
(401/403/404/422 …) is one BLOCKER line: fix the cause and dispatch again. Never switch mode between attempts.

## 6. YouTube pack (after the operator likes the preview)
`make-book` without `--skip-pack`, then hand-refine the meta from the VTT (titles per the SEO
strategy, chapters, description; English only). Rendering is a separate, operator-approved step.

## 7. Rules for producing agents
- **Never** hand-edit `config.antidote.json` / `config.vox.json` — they are regenerated from
  the storyboard. Change `art.json`/`designs.json` via `authored-K.json` + merge.
- **Never** bypass a gate (`--skip-authorship-gate`, `--report-only`) or change a threshold —
  including how a bar is COMPUTED (all-the-light re-scored ADDS over image frames only; reverted).
  A bar that looks wrong is a `for-review`, not an edit.
- **The architecture invariant: an authored decision is final.** What `art.json` / `designs.json`
  says (shot, set, cast, face, body, object, icon, Vox type, image) reaches the screen unchanged.
  Engines may only add camera motion and timing. plan-antidote seals the staging
  (`_authorship.lock`), make-book step 1.8906 restores it after the post-plan engines, and
  gate-authorship FAILs on `STAGING_OVERRIDDEN`. Before this, 20% of Southern Book Club's authored
  beats were silently restaged (split duplicates, black cut-outs, flames over heads).
- **When fix rounds do not converge, compare the blind "sees" line with the rendered config**
  before rewriting beats. In all three first books most stubborn failures were the engine, not
  the storyboard — log them as `for-review`.
- **Never** edit engine code (`scripts/lib`, `src/engines`) to get one book through. If the
  engine is in the way (a shot forces a wrong location, an icon draws the wrong meaning, a gate
  is wrong), write an `AGENT_LOG.md` entry titled `for-review: <slug> — <problem>` with the
  scene id, the file and what you saw, and continue with the other beats. The reviewer fixes the
  SYSTEM so the next book does not hit it.
- Published books (`PUBLISHED_BOOKS.md`) are frozen — never re-plan them.

## 8. Hand-off for review
Clear your Active WIP row and add a short `AGENT_LOG.md` entry: slug, `preview-ready` output, mute
test totals, and the `for-review` items. The reviewer reads those, not your transcript.

---

### Engine notes (what the storyboard can express)
**Antidote** `art.json` beat: `concept` (icon), `diagram`, `callout`, `set`, `shotOverride`,
`cast` (who is on screen), `expression`, `action`, `holds`, `storyboard{claim, concreteVisual,
onScreenText, relationToPrevious, addedInformation}`. A staged lead on an illustration/diorama
shot is drawn as the person (not the silhouette). `chains` draw intact (use `arc: "break"` only
for breaking free); `inheritance` = a sealed will; `gift` = a present.

**Vox** `designs.json` entry (index-aligned with the beats): `type`, `kicker`, `emphasis`,
`items`, `image{subject, style}`, `compare`, `storyboard{…}`. Only entries with a `storyboard`
count as authored. `image.subject` must be a described photograph (who / doing what / where /
when, reusing the bible's `look` verbatim), never a keyword list. Flux drops gore / children in
danger / war violence — soften to aftermath or symbol.
