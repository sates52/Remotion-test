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
- **spine** (acts with `fromFrame`) — the mute test stratifies by it.

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
**FAIL?** The tally lists every frame that is not CORRECT+ADDS with the judge's reason. Fix those
beats (and beats like them) in the storyboard, `merge --write`, re-run step 3, then re-test on the
SAME frames against the previous run:
```bash
node scripts/mute-test.js prep  --slug=<slug> --label=run2 --frames-from=run1
node scripts/mute-test.js judge --slug=<slug> --label=run2 --vs=run1
node scripts/mute-test.js tally --slug=<slug> --label=run2
```
(Compare only within one judge: judges differ by about ±4 on identical frames.)

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
