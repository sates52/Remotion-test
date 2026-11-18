---
name: notebooklm-prompt
description: >
  Step 0 for a new book: decide the engine (Vox / Antidote) from a book profile and write the
  bespoke NotebookLM Audio Overview prompt for it. Use when the operator gives a new book
  (title + author) or says "prompt hazırla", "notebooklm promptu", "yeni kitap", "Step 0".
  The engine chosen here is binding: the audio is recorded from a prompt written FOR it.
---

## FIRST - book work starts in the book's own worktree on CURRENT code (every harness, 2026-10-28)

Before ANY work on a book (Step 0 / NotebookLM prompt, "dosyalar hazir" / preview, storyboard, render, assembly), from
whatever checkout you were opened in - it may be the shared main checkout, many commits behind:

```
git fetch origin god-mode
git show origin/god-mode:scripts/book-start.js | node - --slug=<slug> --check     # then again without --check
```

It reads the CURRENT production code from origin (it needs nothing from the checkout it runs in), creates or resumes
`../wt-book-<slug>` pinned to origin/god-mode (locked, node_modules linked, the book's inputs copied) and prints where to
continue. Do ALL of that book's work THERE and follow THAT worktree's CLAUDE.md / AGENTS.md / skills - the copies in an
old checkout are stale (an old checkout produced crazy-rich-asians and the-lightning-thief on 80-commit-old engine code).
A book already started elsewhere is refused, never migrated silently: its owner decides (keep it, or
`--adopt="<owner's reason>"` for a new pinned copy; the original stays untouched). Current tools for a book started in
the main checkout (render status, cloud assembly): `... | node - --launcher`, then run them in `../wt-production-base`
with `--book-root=<that checkout>`. Never fast-forward, reset, pull, stash or clean the shared main checkout.


# Step 0 — engine + NotebookLM prompt

There is **no audio and no VTT yet**. The prompt you write is shaped by the engine (Vox: beats on
real, nameable figures, places and documentary/period scenes; Antidote: everyman states, ideas, a
staged cast, invented worlds), and the operator records the audio from it. Switching engine later
means a new prompt, a new recording and a new VTT — so decide carefully, the same way every time.
Talk to the operator in **Turkish**; the prompt itself is **English (US)**.

**The flow, end to end, with no operator question** (the one round trip is the source brief, §0 — a paste, not a
decision): title → source brief → profile → engine decided and recorded
(steps 1-2) → the finished, book-specific English prompt (step 3) → `make-prompt.js --check` READY →
hand-off (step 4). **The engine is your decision: never ask the operator to choose the engine** — tell
them which one and why. A scaffold is not Step 0 done.

## 0. Ask the book — the source brief (the operator never hands over the PDF)
The book is uploaded to NotebookLM and stays there: **never ask the operator for the PDF or the book's text.**
What you need from it you ask THERE, in one round trip:
```bash
node scripts/make-prompt.js --brief --title="<title>" --author="<author>" [--slug=<slug>]
```
It writes `books/<slug>/notebooklm-brief.md`: one question block (facts and page count, structure, opening and
ending, people and their looks, 12 scenes to see, numbers, objects, the misreading, the hardest moments, three short
lines). Give the operator that block (Turkish hand-off: "bunu NotebookLM'in sohbet kutusuna yapıştır, cevabı bana
getir"). When the answer comes back, save it verbatim as `books/<slug>/source-brief.md` and use it for the profile
(§1), `--pages`, the beats, their pictures and the opening (§3); later the story bible and cast looks read it too.
If the operator says to skip it ("brief'siz devam"), go on from what you know — `--check` then says the prompt
rests on memory. A missing fact later (a scene, a look, a number) is asked the same way: write the question, the
operator pastes it into NotebookLM, the answer is appended to `source-brief.md`.

## 1. Fill the book profile — from the source brief, or from what you know about the book
Read `data/engine-profile-examples.json`: the **rubric** defines every field and the **examples**
are the reference books to compare against (We Were Liars, The Frozen River, All the Light We
Cannot See, Just Mercy, Stolen Focus, Southern Book Club…, Lolita, Unhinged). Pick field values by
asking "which reference book is this closest to, and where does it differ?"

```json
{ "kind": "fiction|nonfiction",
  "world": "real-historical|period|contemporary|speculative|ideas",
  "era": 1944,
  "realPeople": false,
  "format": "story|argument|mixed",
  "violence": "none|some|central",
  "minorHarm": false,
  "mustSee": ["3-5 concrete things the viewer must see"],
  "periodLook": "essential|backdrop|none",        // required for a past world (period / real-historical / set before 1976)
  "ideaDensity": "events|balanced|ideas",         // required with periodLook
  "violenceOf": "people|animals|both",            // optional, default people
  "animalHarm": {"role": "main-conflict|subplot|backdrop", "mustShow": true, "weight": "high|low"} }  // when violenceOf has animals
```
Judgement calls that flip the result — apply the rubric literally:
- `realPeople: true` only when real people/events ARE the subject. A novel with a real backdrop →
  `false` + `world: "period"`.
- `violence: "central"` only when the climax or most of `mustSee` is death/gore/violence.
- `minorHarm: true` when harm/abuse of a child is central → Antidote by policy, symbolic only.
- `era` is the year of the book's world. A **speculative** world (fantasy / sci-fi) gets no period weight
  from it: a fantasy whose frame story is set in 1900 is `world: "speculative"`, not period.
- **The year never decides "period" alone (operator, 2026-10-29).** `periodLook` says how much the past world must
  be SEEN: `essential` = 2+ of `mustSee` are period places, dress, vehicles, technology or public events (segregated
  Jackson 1962, Paris 1944); `backdrop` = exactly 1; `none` = the story could be told today. `ideaDensity`: half or
  more of `mustSee` are physical events / places = `events`; inner states or ideas = `ideas` (an interior book
  needs period photoreal less: half weight). A 1953 interior novel (backdrop + ideas) is not Vox for its year.
- **Harm to animals is not "central" by itself (operator, 2026-10-29).** Set `violenceOf: "animals"` and
  `animalHarm`: it counts as central only when it is the main conflict AND must be shown AND carries heavy narration
  weight (a hunting memoir whose kills are the book); a dog's death that ends a boyhood story is `some`.
  Harm to people is unchanged; `both` keeps the people rule.
If you cannot fill a field honestly (a book you do not know), look the book up (summary, reviews) and
fill it from what the book shows — never guess, and never hand the field or the engine to the operator.

## 2. Run make-prompt with the profile
```bash
node scripts/make-prompt.js --title="<title>" --author="<author>" --genre=<genre> --profile='<json>'
```
It refuses to run without a profile (or an explicit `--engine=… --engine-why="…"`). It records
`engine`, `engineRationale`, `engineDecidedBy`, `engineProfile` and what the rubric said
(`engineRubric`) in `books/<slug>/book.json`.
**If the pick contradicts your reading of the book, decide it yourself — in this order:**
1. Re-check every profile field against the rubric and the reference books; a wrong field is FIXED
   and make-prompt re-run (that is re-evaluation, not an override).
2. If the fields are right and the rubric still misses a capability argument, decide against it:
   re-run with `--engine=<vox|antidote> --engine-why="<which mustSee items this engine can show and the
   other cannot>"` (≥ 40 chars). make-prompt records it as `engineOverride {from, to, why}` next to the
   rubric's pick — visible and explainable later. An override without an argument is refused.
Then the engine is final. Tell the operator in one line (a statement, not a question):
**"Motor: <VOX|ANTIDOTE> — <gerekçe>; risk: <varsa>"** (+ "rubrik <X> dedi, şu yüzden <Y>" when you overrode).

## 3. Author the prompt (Claude-first)
Rewrite the block in `books/<slug>/prompt.notebooklm.md` exactly as make-prompt instructs:
non-obvious lens + one arguable thesis, then the numbered PARTS of this book in the form make-prompt
printed (exhibits / rounds / stations / portraits …), each with the book's own scene, evidence or
number, the honest criticism and the ending this form asks for; keep THE FORM, HOW EACH … IS
DEVELOPED, SPEECH and LENGTH blocks (45-60 min, no padding); English only; ~4.5-5k characters
(the fixed blocks alone are ~3.9k; `--check` warns above 5000, so keep each part to one tight sentence).

**The body is this book's own NARRATIVE FORM (2026-11-18, YPP "generic or repetitive content").** Until then every
book was told on one spine (cold open → thesis → setup → 8 beats → counterpoint → payoff) with one recipe per beat,
and it was heard: 46 prompts shared a median 40 % of their words, every film answered itself with "Right" / "Exactly"
/ "Absolutely", 28 of 32 printed "INSIGHT n / N". `scripts/lib/narrative-form.js` now holds the forms — case file,
trial, journey, duel, practice run, gallery of portraits, one question, anatomy — each with its own roles for the two
hosts, its own five steps for a part, its own ending and its own on-screen part label.
- **YOU choose the form from the book**: `--form=<key> --form-why="<what in THIS book makes it that>"` (≥ 30 chars;
  make-prompt prints the forms that fit the book's kind with what each is for). A crime nobody can explain is a
  case file; a claim a reader could reject is a trial; a life is a journey. Without `--form` make-prompt takes the
  fitting form farthest from the last 8 books — a fallback, not a decision. Never the form of the previous book.
- Under "THE <PART>S OF THIS BOOK" write the numbered parts; name the two hosts' roles in THIS book's terms (who
  prosecutes what, whose side each takes); write the ending as this form asks (a verdict, a standoff, a last image —
  not always a question to the listener).
- The hosts are asked to SAY each part's number ("Exhibit three: …"): the film's corner label follows what they
  say (`partBadges`), so do not renumber or rename the parts in the prompt.
- **The producer's own view** (optional, the operator's words): `--take="<2-5 sentences: where they disagree with
  the book, what they found too much>"` is written into the prompt as a real reader's view the hosts argue with.
  Ask the operator for it once per book in one line; never write it for them, and go on without it if they pass.

**Two blocks come from the channel's own analytics (2026-11-11, skill `channel-analytics`) — keep them and make them
book-specific; `--check` refuses a prompt without them:**
- **FIRST MINUTE — this book's own opening, never a stock intro (YPP: repetitive content).** Half the viewers leave
  before 0:50, so the first minute has rules; a fixed formula would make every film open the same way. make-prompt
  therefore picks the opening per book on three axes (`scripts/lib/opening-grammar.js`: how it hooks / when the book
  is named / what is promised), farthest from the last 8 books, records it in `book.json` → `opening`, and writes
  its `OPEN` / `NAME IT` / `PROMISE` lines. Under each line write THIS book's content: the actual scene, object,
  number or belief; the sentence that names the book; the promise in the book's own terms (never "key ideas" or
  "main themes"). If the chosen hook truly cannot be honest for this book, choose another yourself:
  `--opening=<hook>/<naming>/<promise>` (recorded as the agent's) — never the same as the previous book's.
- **PICTURE FIRST.** The narration is drawn afterwards, and a sentence with nothing to draw becomes a dead or
  text-carried scene. For each part add its picture in a few words, taken from the book itself (Antidote:
  a physical demonstration — two sizes, a threshold that flips, one thing changed, a before and after; Vox: a named
  person in a named place doing one thing). Write it into the beat line: `claim — picture: <what is seen>`.
- **Write from the source brief** (§0) when there is one: every beat's example, picture, number and the opening
  come from the answer NotebookLM gave, not from memory. Never quote more than a sentence of the book.
- **A recording over 30 minutes is long enough (operator, 2026-11-18) — do not re-record or rework a prompt to get a
  longer one.** Under 30: record again; twice under: tell the operator. The prompt still states the higher targets
  below — they are what kept the measured recording at 33 minutes, not a bar to meet.
- **The length follows the book — never shorten (operator, 2026-11-11).** Pass `--pages=<n>` (from the brief):
  up to 300 pages → 45-60 min, 10 parts; 301-500 → 60-75 min, 12 parts; over 500 → 75-90 min, 14 parts (measured 2026-11-18: a part runs about 3.3 minutes, so 10 parts is the floor for a 30-minute film). NotebookLM
  decides the real length; the floor in the prompt and the beat count are what move it.
- Never write "audiobook" in the prompt, titles or tags: people who search for the audiobook leave within seconds.

Shape the beats for the engine:
- **Vox** — build beats on named people, real/period places and scenes a camera could photograph.
- **Antidote** — build beats on the characters' situations and the ideas; everyman moments.
- `violence: central` or `minorHarm` — ask the hosts to analyse critically, never to glamorise or
  dwell on graphic detail.

**Step 0 is done only when `node scripts/make-prompt.js --check --slug=<slug>` prints STEP 0 READY**
(book-specific thesis / opening / the numbered parts in the book's form, the form blocks intact, English, written for the engine in
book.json). NOT READY lists what is missing — fix it and re-check; never hand over a scaffold.

## 4. Hand-off
After `--check` READY, tell the operator (Turkish): the prompt file path, the engine line from step 2, and the next step —
record the Audio Overview, upload it to YouTube (unlisted) for the word-timed auto-caption VTT, drop `public/audio/<slug>.mp3` (download the **MP3** — a .m4a of a 50-min book can pass GitHub's 100 MB file limit and every render worker refuses it) + `public/captions/<slug>.vtt`, then say
"dosyalar hazır, preview hazırla" in this session (skill `preview-hazirla`).
