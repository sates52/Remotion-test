# Storyboard Runbook — taking a book to a clean PREVIEW (Antidote & Vox)

This is the procedure a producing agent follows for a NEW book. It encodes what took We Were
Liars from "a phone on screen at 0:55" to a blind mute test of **0/30 wrong, image adds 70%**.
Do the steps in order. Do not skip the mute test: every gate can PASS on a film a muted viewer
misreads.

**How it is triggered:** the operator opens one session per book and says "dosyalar hazır, preview hazırla";
the `preview-hazirla` skill (`.claude/skills/preview-hazirla/SKILL.md`) runs this runbook for that book.

**Definition of PREVIEW-READY:** `node scripts/preview-ready.js --slug=<slug>` prints `READY`
(authored, every blocking gate PASS, latest blind mute test PASS: WRONG ≤ 1/30, image adds ≥ 60%).

---

## 0. Inputs (operator)
- Step 0 already done: `books/<slug>/book.json` (engine decided) + `prompt.notebooklm.md`.
- Operator drops `public/audio/<slug>.m4a` and `public/captions/<slug>.vtt`.
- Engine: `book.json.engine` (Step 0, often decided from the genre before the audio existed). `storyboard.js prep`
  re-checks it against the narration and STOPS on a strong contradiction — ask the operator, then
  `--confirm-engine` or change it with `make-prompt.js --engine=...`. No engine → back to Step 0.
- Read `AGENT_LOG.md` → Active WIP. Claim a row: `| <you> | books/<slug>/ preview | in progress | |`.

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
Flat vector, bold silhouette first (3-10 paths, `ink` / `accent` / hex fills) — it must be recognisable
at icon size with no label. It becomes vocabulary for the authors (`concept: "mechanicalHound"`) and
renders through the engine's `customSvg` motif: data, no engine code. `storyboard.js prep` stops while
a signature object has no drawing (`--skip-own-icons="<why>"` only with a reason).

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
Run every author prompt in `PROMPTS.md` **in parallel** (one fresh agent each). Then:
```bash
node scripts/storyboard.js merge --slug=<slug>           # validate; fix every ✗ (edit authored-K.json)
node scripts/storyboard.js merge --slug=<slug> --write   # → art.json (Antidote) / designs.json (Vox)
```
Read the merged icon histogram and 20 random beats yourself. Hunt for: an icon that only
matches a word; a happy face over tragedy; `strike` used as emphasis; `door` on "no way out";
`trophy` on weakness; `heart` where romance is rejected. Fix in `authored-K.json`, re-merge.

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

## 4. Blind mute test
```bash
node scripts/mute-test.js prep  --slug=<slug> --label=run1     # 30 stratified stills, cropped, shuffled
```
Give `audit/mute/<slug>/run1/PROMPTS.md` §1 to a **fresh** agent (blind describer). Then
```bash
node scripts/mute-test.js judge --slug=<slug> --label=run1
```
Give §3 to another **fresh** agent (judge). Then
```bash
node scripts/mute-test.js tally --slug=<slug> --label=run1
```
**FAIL?** The tally lists every frame that is not CORRECT+ADDS with the judge's reason. The 30
frames are a SAMPLE of the whole film — a failing frame stands for every beat built the same way.
1. Name the CAUSE CLASS of each failure (e.g. "abstract noun shown as a generic icon", "wrong
   character staged", "kinetic word contradicts the narration") and fix EVERY beat of that class in
   the storyboard (search the `authored-K.json` files), not only the sampled beat.
2. `merge --write`, re-run step 3.
3. Re-test on a **FRESH holdout sample** — a new label with NO `--frames-from`. prep draws new
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

## 6. YouTube pack (after the operator likes the preview)
`make-book` without `--skip-pack`, then hand-refine the meta from the VTT (titles per the SEO
strategy, chapters, description; English only). Rendering is a separate, operator-approved step.

## 7. Rules for producing agents
- **Never** hand-edit `config.antidote.json` / `config.vox.json` — they are regenerated from
  the storyboard. Change `art.json`/`designs.json` via `authored-K.json` + merge.
- **Never** bypass a gate (`--skip-authorship-gate`, `--report-only`) or change a threshold.
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
