---
name: notebooklm-prompt
description: >
  Step 0 for a new book: decide the engine (Vox / Antidote) from a book profile and write the
  bespoke NotebookLM Audio Overview prompt for it. Use when the operator gives a new book
  (title + author) or says "prompt hazırla", "notebooklm promptu", "yeni kitap", "Step 0".
  The engine chosen here is binding: the audio is recorded from a prompt written FOR it.
---

# Step 0 — engine + NotebookLM prompt

There is **no audio and no VTT yet**. The prompt you write is shaped by the engine (Vox: beats on
real, nameable figures, places and documentary/period scenes; Antidote: everyman states, ideas, a
staged cast, invented worlds), and the operator records the audio from it. Switching engine later
means a new prompt, a new recording and a new VTT — so decide carefully, the same way every time.
Talk to the operator in **Turkish**; the prompt itself is **English (US)**.

**The flow, end to end, with no operator question:** title → profile → engine decided and recorded
(steps 1-2) → the finished, book-specific English prompt (step 3) → `make-prompt.js --check` READY →
hand-off (step 4). **The engine is your decision: never ask the operator to choose the engine** — tell
them which one and why. A scaffold is not Step 0 done.

## 1. Fill the book profile — from what you know about the book
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
  "mustSee": ["3-5 concrete things the viewer must see"] }
```
Judgement calls that flip the result — apply the rubric literally:
- `realPeople: true` only when real people/events ARE the subject. A novel with a real backdrop →
  `false` + `world: "period"`.
- `violence: "central"` only when the climax or most of `mustSee` is death/gore/violence.
- `minorHarm: true` when harm/abuse of a child is central → Antidote by policy, symbolic only.
- `era` is the year of the book's world. A **speculative** world (fantasy / sci-fi) gets no period weight
  from it: a fantasy whose frame story is set in 1900 is `world: "speculative"`, not period.
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
non-obvious lens + one arguable thesis + mid-thought cold open, 8 argued beats with concrete
examples from the book, an honest counterpoint, a reframing closer; keep the DEPTH ENGINE and
LENGTH blocks (45-60 min, no padding); English only; ~3.5-5k characters (the fixed spine alone is ~2.6k; `--check` warns above 5000). Shape the beats for the
engine:
- **Vox** — build beats on named people, real/period places and scenes a camera could photograph.
- **Antidote** — build beats on the characters' situations and the ideas; everyman moments.
- `violence: central` or `minorHarm` — ask the hosts to analyse critically, never to glamorise or
  dwell on graphic detail.

**Step 0 is done only when `node scripts/make-prompt.js --check --slug=<slug>` prints STEP 0 READY**
(book-specific thesis / opening / setup / beats, the fixed spine intact, English, written for the engine in
book.json). NOT READY lists what is missing — fix it and re-check; never hand over a scaffold.

## 4. Hand-off
After `--check` READY, tell the operator (Turkish): the prompt file path, the engine line from step 2, and the next step —
record the Audio Overview, upload it to YouTube (unlisted) for the word-timed auto-caption VTT, drop `public/audio/<slug>.mp3` (download the **MP3** — a .m4a of a 50-min book can pass GitHub's 100 MB file limit and every render worker refuses it) + `public/captions/<slug>.vtt`, then say
"dosyalar hazır, preview hazırla" in this session (skill `preview-hazirla`).
