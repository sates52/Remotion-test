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
staged contemporary cast), and the operator records the audio from it. Switching engine later means
a new prompt, a new recording and a new VTT — so decide carefully, the same way every time.
Talk to the operator in **Turkish**; the prompt itself is **English (US)**.

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
If you do not know the book well enough to fill it honestly, say so to the operator — do not guess.

## 2. Run make-prompt with the profile
```bash
node scripts/make-prompt.js --title="<title>" --author="<author>" --genre=<genre> --profile='<json>'
```
It refuses to run without a profile (or an explicit `--engine=… --engine-why="…"`). It records
`engine`, `engineRationale`, `engineDecidedBy`, `engineProfile` in `books/<slug>/book.json`.
Tell the operator in one line: **"Motor: <VOX|ANTIDOTE> — <gerekçe>; risk: <varsa>"**. If the
result surprises you (it contradicts your reading of the book), stop and discuss before writing
the prompt — do not override silently.

## 3. Author the prompt (Claude-first)
Rewrite the block in `books/<slug>/prompt.notebooklm.md` exactly as make-prompt instructs:
non-obvious lens + one arguable thesis + mid-thought cold open, 8 argued beats with concrete
examples from the book, an honest counterpoint, a reframing closer; keep the DEPTH ENGINE and
LENGTH blocks (45-60 min, no padding); English only; ~2.5-3.5k characters. Shape the beats for the
engine:
- **Vox** — build beats on named people, real/period places and scenes a camera could photograph.
- **Antidote** — build beats on the characters' situations and the ideas; everyman moments.
- `violence: central` or `minorHarm` — ask the hosts to analyse critically, never to glamorise or
  dwell on graphic detail.

## 4. Hand-off
Tell the operator (Turkish): the prompt file path, the engine line from step 2, and the next step —
record the Audio Overview, drop `public/audio/<slug>.m4a` + `public/captions/<slug>.vtt`, then say
"dosyalar hazır, preview hazırla" in this session (skill `preview-hazirla`).
