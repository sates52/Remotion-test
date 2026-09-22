# VISUAL RELEVANCE PLAN — making the picture mean what the narration says

> **Scope:** the semantic gap between the narration and what is on screen, in **both**
> engines (Vox + Antidote). Everything here happens at **plan time**, before render,
> on a laptop.
> **Explicitly out of scope:** SFX / audio / mastering (tracked in `ANTIDOTE_SFX_ROADMAP.md`),
> and render infrastructure.
> **Companion docs:** `SKILL.md` §9 (the pipeline), `ANTIDOTE_4_ROADMAP.md` (cinematography
> upgrades — complementary, not overlapping: that roadmap makes scenes look expensive,
> this one makes them *mean the right thing*).

---

## 0. The finding in one sentence

**Both engines choose pictures from the *grammatical form* of a 6.5-second text chunk —
regex first-match, index parity, seeded rotation — never from its *subject*; nothing in
the pipeline ever reads the whole book, and nothing anywhere ever scores whether the
picture matches the words.**

`scripts/audit-antidote.js` made dead air a number and then drove every fix that closed it.
There is no equivalent number for relevance, so a film in which every icon is wrong passes
every gate we have today.

---

## 1. The measurement (all numbers reproduced from shipped `books/<slug>/config.*.json`)

### 1.1 Vox — the image brief is a bag of words

`heuristicDesign()` sets the Flux subject to `keywords(text, 3).join(", ")`
([`plan-vox.js:321`](scripts/plan-vox.js:321)) and `imagePrompt()` wraps it
([`plan-vox.js:416`](scripts/plan-vox.js:416)).

| Narration | Prompt actually sent to Flux |
|---|---|
| "World War I is this lingering ghost" | `cinematic editorial still: lingering, period., ghost..` |
| "the cognitive ability to recognize that other people have beliefs" | `...: cognitive, recognize, ability.` |
| "Robbie is put into the back of a police car, taken to Wandsworth Prison" | `...: forever, moment., wsworth.` |
| Robbie **and Cecilia** in the dark library | `...: robbie, fiction story.` |

No subject, no place, no period, no composition — trailing punctuation included. **~93 % of
every prompt ever generated across 34 books is this three-token bag** (agent-measured over
the full corpus; spot-verified by hand on `atonement`).

Downstream consequences, measured:

| Metric | atonement | the-color-purple | the-handmaids-tale |
|---|---|---|---|
| beats with **no image at all** (`images: []`) | **60 %** | **55 %** | **60 %** |
| beats with an empty `kicker` | 309 / 310 | 335 / 337 | 244 / 245 |
| `meta.planner` | `heuristic` | `heuristic` | `heuristic` |

The Claude-first path (`--emit-beats` → author → `--designs`) exists and has been used on
**3 of 34 books**. Every book we have shipped ran the bag-of-words path.

### 1.2 Vox — the archetype is decided by index parity

[`plan-vox.js:318`](scripts/plan-vox.js:318): `type = i % 2 === 0 ? "imagefocus" : "statement"`.
Whether a beat gets a photograph at all is decided by whether its index is even. The detector
regexes above it are unanchored substrings, so they fire on morphology, not meaning:
`ratio` matches inside na**ratio**n / frust**ratio**n (185 of 202 `dataviz` hits),
`pact` inside im**pact** (15 of 66 `network` hits), `from .* to` on ordinary prose
(169 of 279 `map` hits).

### 1.3 Vox — timing alone breaks ~40 % of the film

Scenes are re-anchored to when their emphasis word is spoken
([`plan-vox.js:632`](scripts/plan-vox.js:632)), which pushes every scene *past* its own
narration. Share of a beat's airtime that actually sits over the words it was planned for:

| book | airtime over own narration | median lag |
|---|---|---|
| atonement | **57.7 %** | 2.87 s |
| the-handmaids-tale | **62.7 %** | 2.37 s |
| the-color-purple | 74.6 % | 0.93 s |

**Even a perfect image is the wrong image ~40 % of the time on `atonement`.** This is the
cheapest large win in the whole document and it is independent of art direction.

### 1.4 Antidote — the object on screen is picked by a seeded coin flip

`pickMotif()` ([`antidote-director.js:524`](scripts/lib/antidote-director.js:524)) indexes a
menu by the beat's *class* (`stat` / `question` / `neutral` …) and then picks inside it with
`rnd(seedBase + i*7)`. It receives the beat's `shot` and never reads it; it never reads the
subject. Whether a prop appears at all is `rnd(...) < 0.34`
([`antidote-director.js:748`](scripts/lib/antidote-director.js:748)).

| Metric | supercommunicators | all-the-bright-places | fruit-fly |
|---|---|---|---|
| scenes | 281 | 115 | 142 |
| **distinct motifs used** (of 63 registered) | 37 | **14** | **13** |
| scenes with **no motif at all** | 16 % | **64 %** | **60 %** |
| top motifs | spotlight 38 · orbit 34 · ripple 28 · maze 28 | book 10 · spotlight 6 · clock 5 | spotlight 15 · book 8 · maze 7 |
| scenes in `abstract`/`horizon` (= nowhere) | 17 % | **49 %** | **44 %** |
| scenes with no kinetic text | 56 % | 4 % | 42 % |

Corpus-wide (agent-measured): **81.8 % of all prop instances are abstract filler**, and
**49.3 % are six contentless motifs** (spotlight, ripple, orbit, maze, clock, shape).

### 1.5 Antidote — the only grounded path covers half the beats and is order-dependent

`CONCEPT_LEXICON` ([`antidote-director.js:79`](scripts/lib/antidote-director.js:79)) is
**56 ordered regexes, first match wins**, no confidence, no runner-up, no negation, shared by
every book and every genre. Measured: **44.8 % of beats produce no concept at all**, and
**62 % of the concepts it *does* find are then discarded** by content-blind cooldowns
(same icon within 8 scenes, no two illustrations in a row).

Collisions ship undetected — `iceberg` shadows `icebergDepth` (0 wins in 3 309 beats),
`funnelMetrics` shadows `funnelTrap`. Silicon-Valley icons fire inside literary fiction
because genre never gates concept selection.

Frequent narrative subjects with **no lexicon entry at all**: a conversation, an argument, a
meal, a child, an animal, a bed, a window, a mountain, a boat, religion, music, a lie, a
memory, a promise, an addiction, a season.

### 1.6 The repo already proved this, once, by hand

[`apply-antidote-overrides.js`](scripts/apply-antidote-overrides.js) header, on
`a-good-man-is-hard-to-find`:

> *"50 of 66 scenes with a concrete location got the wrong one — the roadside shooting played
> in a `kitchen` … the climax of the title story rendered as the narrator alone in a classroom."*

The fix shipped as a **per-book, hand-written override file** for one book, not wired into
`make-book.js`. Same for [`art-direct-fluke.js`](scripts/art-direct-fluke.js) — 95 hand-matched
beats, a single-book throwaway. This violates *automate, don't babysit*: the diagnosis is
right, the remedy does not scale, and it is erased by the next re-plan.

### 1.7 We ship fabricated evidence

Verified in the engines:

- [`scenes-journalism.tsx:111`](src/engines/vox/scenes-journalism.tsx:111) — `STANDARD BENCHMARK, value: 35` drawn next to `firstNumberInText % 100` as a percentage.
- [`scenes-journalism.tsx:144`](src/engines/vox/scenes-journalism.tsx:144) — a conspiracy board asserting `LINKED TO` / `INFLUENCED` / `DRIVES` between three emphasis words.
- [`antidote-director.js:551`](scripts/lib/antidote-director.js:551) — `spec.value = n > 0 && n < 1000000 ? n : 90` — a 188 px counter animating to **90** when the narration contains no number.
- `TrendlineScene` plots a hardcoded `24/58/42/89`; `ChartScene` plots `[1,2,4,8,16,32,65,120]`.
- Six Antidote motifs carry hardcoded English sentences (`COMPOUND EFFECT`, `90 % UNSEEN SACRIFICE`, `48H VALIDATION: 100 OUTREACH`, `$1,000`, `launch.ts`) that appear verbatim in any book that draws them — full-sentence on-screen copy nobody authored, breaking the emphasis-only rule.

Six typed payload fields exist for exactly this (`docType`, `trendPoints`, `flowNodes`,
`chartData`, `chartLabels`, `polaroidCaption`, `schema.ts:46-54`) and **the planner writes
none of them in any of the 34 books**. A quantity graphic must refuse to render rather than
invent a quantity.

### 1.8 Known blockers found while measuring

- [`plan-vox.js:513`](scripts/plan-vox.js:513) writes `props.checklistItems` **56 lines before
  `const props` is declared** (`:569`) — any beat entering the `checklist` branch throws a TDZ
  `ReferenceError` at plan time. This is in an **uncommitted, unlogged 945-line Vox WIP**
  (`scripts/plan-vox.js` + 11 files under `src/engines/vox/`) that another agent is editing
  right now. Coordinate before touching those files.
- `coldopen` has no renderer entry in `SCENES`, so [`apply-coldopen.js`](scripts/apply-coldopen.js)
  produces 20 beats across 6 books that silently fall through to `StatementScene`, and
  11 already-generated Flux images are never drawn.
- `CONCEPT_HOLD.food = "coffee"` is not a valid `handProp` (`schema.ts:117`) → the character
  holds an invisible object. `SELF_ANIMATING` names a non-existent `lineChart`.
- Claude's authored Antidote concepts are lowercased before the membership test
  ([`antidote-director.js:580`](scripts/lib/antidote-director.js:580)), so every camelCase icon
  the `--emit-beats` instructions advertise (`codeWindow`, `shadowSelf`, `dominoCascade`, …)
  is **silently dropped**, with no error.

---

## 2. The five root causes

| # | Root cause | Where it lives |
|---|---|---|
| **R1** | **No book-level comprehension.** Every decision is a regex over one isolated 6.5 s chunk. The pipeline never learns the book's cast, era, places, objects or argument. | both planners |
| **R2** | **No subject field.** Nothing in either schema says *who / what this beat is about*. The renderers consume `emphasis` (top values: `IT'S`, `BECAUSE`, `YEAH`, `RIGHT`) and `keywords` (top values: `completely`, `incredibly`, `literally`). No component can draw the thing being discussed **even in principle**. | `vox/schema.ts`, `antidote/schema.ts` |
| **R3** | **Selection is form-based and seeded.** Index parity, class menus, `rnd(seed+i*7)`, `hash(beat.id)` for layout / annotation / docType / map region / flip. Variety is bought by discarding meaning. | `plan-vox.js:318`, `antidote-director.js:524/748` |
| **R4** | **No relevance score, therefore no gate and no repair.** `audit-antidote.js` counts *whether something changed*, never *whether it was right*. Nothing can fail a plan for being wrong, and there is no way to regenerate one beat. | missing |
| **R5** | **Vocabulary is thin, global, duplicated and partly unreachable.** 63 motifs behind 56 shared regexes; a new icon needs 4 files edited in sync; the `customSvg` per-book escape hatch has fired **0 times in 15 books**. | `motifs.tsx` / `schema.ts` / `antidote-director.js` |

---

## 3. Target architecture — the relevance loop

```
VTT ─┬─► [1] STORY BIBLE          books/<slug>/story-bible.json      (once per book)
     │      cast · era · places · objects · argument spine
     │
     └─► [2] BEAT BRIEFS          books/<slug>/beat-briefs.json      (once per beat, grounded in [1])
            subject · entities · place · time · action · mood · confidence
                    │
                    ▼
            [3] DIRECTORS  (plan-vox / plan-antidote read briefs FIRST, regex only as fallback)
                    │
                    ├─► [4] VOCABULARY COVERAGE  →  books/<slug>/motifs.json (customSvg) + shot briefs
                    │
                    ▼
            [5] audit-relevance.js  ──►  score + FAIL + books/<slug>/relevance-report.json
                    │                                     │
                    │◄──────── [6] REPAIR (re-brief + regenerate ONLY failing beats) ◄┘
                    ▼
                  render
```

Everything new is **data in `books/<slug>/`**, so it travels in the render bundle
(`scripts/lib/render-bundle.js`) and costs no engine code per book.

### [1] `books/<slug>/story-bible.json` — the comprehension pass

One Claude pass over the **whole** narration (the VTT we already have before planning),
producing the thing R1 says is missing:

```jsonc
{
  "world":   { "era": "1935-1940 England", "register": "literary", "forbid": ["phone","laptop","car"] },
  "cast":    { "briony": { "role":"protagonist", "age":13,
                           "look":"thin girl, dark bobbed hair, white summer dress",   // Flux continuity
                           "variant": { "height":0.78, "headScale":1.15, "garment":"dress" } } },  // Antidote costume
  "places":  { "tallis-house": { "set":"room",  "look":"1930s country-house library, tall windows" } },
  "objects": [ { "name":"the vase", "icon":"customSvg:vase", "recurs":[12,48,201] } ],
  "spine":   [ { "act":"setup", "from":0, "to":420, "claim":"a child misreads adult desire" } ]
}
```

Why this artifact and not more prompting: it is the **only** place where the same character
can look the same in beat 12 and beat 204, where "1935" can forbid a phone icon, and where
the book's own recurring symbol can be drawn once and reused. It also supersedes three
existing half-artifacts — `creative-bible.json` (read by nothing in the Vox path),
`antidote-costume.js`'s auto-cast, and `buildPersonSet()` (which today only uses the cast as a
*negative* filter).

### [2] `books/<slug>/beat-briefs.json` — the subject field (R2)

One record per beat, authored by Claude in batches against the bible, **keyed by a narration
fingerprint, not by index**:

```jsonc
{ "fp":"a3f9c1", "i":204, "subject":"Robbie arrested and driven away",
  "entities":["robbie","police"], "place":"tallis-house-drive", "time":"1935 night",
  "action":"taken away", "mood":"irreversible", "isQuote":false, "number":null,
  "vox":  { "shot":"a young man in a 1930s suit being put into the back of a black police car, rain, night, from behind the crowd" },
  "antidote": { "concept":"law", "set":"street", "cast":["robbie","family"], "handProp":null },
  "confidence": 0.9 }
```

`fp` is the fix for the silent index-shift bug in both `--designs` and `--callouts`
(`plan-vox.js:464`, `plan-antidote.js:412`): a re-plan re-matches by fingerprint and reports
what it could not match, instead of attaching the right art direction to the wrong words.

**`confidence` is what makes it safe:** below threshold the director must fall back to a
*neutral* visual rather than a confident wrong one. Today a weak regex hit and a certain one
are indistinguishable.

### [3] Directors consume briefs first

Regexes stay, demoted to fallback for beats with no brief. Concretely:

- `pickMotif()` gains a **CONCEPT→MOTIF metaphor table** — today a beat can *know* its subject
  is `grave` and still draw an `orbit`, because that mapping simply does not exist.
- `rnd(...) < 0.34` prop gating and `i % 2` archetype parity are replaced by
  "does this beat have a subject worth showing?".
- Genre / era gates concept selection (`world.forbid`).
- Cooldowns become **importance-aware**: a book's central object is allowed to recur; the
  current 8-beat cooldown forbids exactly the continuity we want.

### [4] Vocabulary coverage (R5)

- A coverage pass reports, per book: *what share of beat subjects can be shown at all with
  the vocabulary on hand.* This is the number that decides whether to draw new assets.
- Gaps are filled **as per-book data**, not engine code: `books/<slug>/motifs.json` consumed
  through the existing `customSvg` hook (`antidote-director.js:530`) — which has never fired
  and needs its regex-escaping / empty-title landmine fixed first.
- One source of truth for the vocabulary, replacing the 4-file seam (`motifs.tsx` REGISTRY,
  `schema.ts` enum, `CONCEPT_LEXICON`, `CONCEPT_SET`/`CONCEPT_HOLD`/`DIORAMA_ICONS`), plus a
  lint that fails on drift (this is what would have caught `food → coffee`, `lineChart`,
  and the camelCase drop).
- Vox: the brief's `shot` string replaces the keyword bag, and `cast[].look` is appended so a
  character is the same person across the film. Content-address image files by
  `hash(subject+style)` instead of `beat-NNN.png`, so re-planning stops being destructive.

### [5] `scripts/audit-relevance.js` — the number (R4)

Modelled on `audit-antidote.js`: runs offline on `books/<slug>/config.*.json` (which already
contains both the narration and every visual decision), exits 1 over budget, writes
`books/<slug>/relevance-report.json`, and is wired into `make-book.js` right after planning
(Antidote step 1.5 is the precedent; **Vox has no audit at all today**).

Per scene it scores, and it must be *explainable per scene* and *not gameable by decoration*:

| check | fails when |
|---|---|
| **subject coverage** | the on-screen icon / image subject does not correspond to the brief's subject |
| **filler rate** | the scene's only visual is one of the six contentless motifs |
| **void rate** | no subject-bearing visual at all (`props: []`, `images: []`) |
| **airtime alignment** | < X % of the scene's frames sit over its own narration (§1.3) |
| **contradiction** | set vs stated place; quote marks with no quotation; a number on screen that is absent from the narration; an era-forbidden object |
| **continuity** | the same named character rendered with different appearance |

### [6] Repair loop

`--repair` consumes the report's worklist: re-brief only the failing beats, regenerate only
their assets, re-audit, bounded to N iterations. This requires the missing surgical tools:
`gen-vox-images.py --beat=<id> --force` (today the script takes *only* a config path and
skips any existing file, so fixing one image means deleting a PNG by hand), a
non-destructive `CONTENT_FILTERED` path that keeps the prompt and queues a softened retry
instead of silently deleting the image entry, and an emptiness check in `cutout.py`
(a 199-byte fully-transparent PNG currently counts as success).

---

## 4. The three governing metrics

Baselines below are measured today; thresholds are the gate `audit-relevance.js` enforces.

Measured, not estimated: see [`RELEVANCE_BASELINE.md`](RELEVANCE_BASELINE.md) — 49 planned
books, 12 935 scenes, every one scored. **Current standing after the 2026-09-12 retrofit:
subject-bearing 29.1 %, wrong 5.5 %, filler 21.1 %, 48/49 books still over budget** (the baseline
column below is the before). (The estimates in an earlier draft of this table were
too generous; the real figures are below.)

| metric | baseline (2026-09-12) | ship gate | why |
|---|---|---|---|
| **Subject-bearing share** — scenes whose picture is tied to the beat's subject | **6.6 %** catalogue-wide; **29 of 49 books at 0 %**; best book 36.4 % | **≥ 70 %** | this is the operator's complaint, stated as a number |
| **Wrong-visual rate** — contradicts (false quote, fabricated number, wrong place) + unrelated | **6.0 %**, but two legacy books at 37.1 % / 28.7 % | **≤ 5 %**, zero fabricated numbers | a wrong picture costs more retention than a neutral one |
| **Airtime alignment** — share of frames sitting over their own narration | **68.8 %** (Vox 51–79 %, recent Antidote 80–85 %) | **≥ 90 %** | fixed at the planner in `cfa52b8`; any book re-planned since should clear it |

Two diagnostics that explain the headline rather than gate it: **filler share** (39.6 % — a
picture that cannot be about anything) and **thin share** (47.7 % — nothing on screen but type).
Together they are 87 %: the catalogue's problem is overwhelmingly *absence of a grounded
picture*, not a wrong one.

The metric validates itself: the three highest-scoring Vox books are exactly the three whose
art direction was hand-authored through `--designs`. The audit was not told that.

---

## 5. Phases

Each phase ends on a number, not a vibe. Phase 0 and 1 are worth doing **even if nothing
else is ever built**.

### Phase 0 — stop the bleeding · ~1 day · no new architecture — ✅ **LANDED 2026-09-12**

> Measured A/B on `public/captions/siddhartha.vtt` (same args, `--no-llm`), HEAD vs now:
> fabricated-data scenes **34 → 0**, false quotations **5 → 0**, images **135 → 102** (every one
> on a beat that names something). See the `AGENT_LOG.md` entries for the file-by-file list.
>
> **Both halves are now done.** The planner declines to *select* an ungrounded data archetype,
> and the engine refuses to *draw* one: the invented constants are gone from
> `scenes-journalism.tsx` and `scenes.tsx`, and a data component with no data falls back to
> `UngroundedFallback` (the neutral treatment of the beat's own words). Blast radius on the
> shipped catalogue: 17 beats across 3 of 35 Vox books stop drawing invented figures, and
> 24 `map` beats lose the fabricated flight path. `tsc --noEmit` is clean repo-wide.


Pure defect work on what already exists.

1. Fix the TDZ at `plan-vox.js:513` (**coordinate — another agent owns that file right now**).
2. Word-boundary-anchor the detector regexes (`\bratio\b`, `\bpact\b`, drop bare `from .* to`).
   Agent-measured, this alone removes the majority of wrong `map` / `dataviz` / `network` /
   `document` scenes.
3. Delete the fabricated-evidence defaults: no `STANDARD BENCHMARK 35 %`, no `LINKED TO`,
   no `24/58/42/89`, no `counter = 90`. **A data graphic with no data must not render** —
   fall back to the beat's ordinary archetype.
4. Fix the silent drops: camelCase concept membership (`antidote-director.js:580`),
   `CONCEPT_HOLD.food`, `SELF_ANIMATING.lineChart`, `customSvg` empty-title/regex-escape.
5. Register `coldopen` in `SCENES` or stop emitting it.

**Gate:** zero fabricated numbers or invented relations in any newly planned config;
`node --check` clean on both planners.

### Phase 1 — measure before building · ~1–2 days — ✅ **LANDED 2026-09-12**

[`scripts/audit-relevance.js`](scripts/audit-relevance.js) scores every scene of a planned
config against the words **actually spoken during that scene's own frame window** — offline,
no render, no API — and emits a per-scene verdict (`contradicts` / `unrelated` / `filler` /
`thin` / `ok`), a per-book metric row, and a worklist. Wired advisory into `make-book.js`
step 1.6 for **both** engines (Vox had no pre-render art-direction audit at all).

**Gate met:** [`RELEVANCE_BASELINE.md`](RELEVANCE_BASELINE.md) — 49 books, 12 935 scenes,
ranked worst-first. It also reproduced the §1 airtime figures independently (57.4 % on
`atonement` vs the 57.7 % measured by hand), which is the cross-check that the tool measures
what it claims.

### Phase 1b — the airtime fix · ~half day — ✅ **LANDED 2026-09-12**

Re-anchoring pushed a scene a median 2.4–2.9 s past its own words. The anchor search is now
clamped to `min(beatEnd, beatStart + 1.0 s)` (`--anchor-window` tunes it, `--legacy-anchor`
reproduces an old plan); the cut-on-the-word feel survives because the sub-beat `props.anchors`
clock already reveals each word at the frame it is spoken.

**Gate met:** on `siddhartha`, airtime alignment **63.4 % → 95.8 %** with nothing else changed.
Every `plan-vox.js` run now prints the achieved percentage, so a regression is visible
immediately.

### Phase 2 — the story bible · ~2–3 days — ✅ **LANDED 2026-09-12**

[`scripts/plan-bible.js`](scripts/plan-bible.js) reads the **whole** narration once and writes
`books/<slug>/story-bible.json`: world (era + an anachronism `forbid` list), cast (each with a
Flux-ready `look` and Antidote `variant`), places (mapped to real Backdrop sets), the book's own
recurring objects, and the act spine. Claude-first with the repo's usual handoff —
`--emit=<file>` drafts it with the evidence attached, Claude rewrites, `--bible=<file>`
validates and installs. A heuristic-only run still produces a usable draft.

It supersedes `creative-bible.json`, whose universe heuristic is the problem in miniature: it
classified *Siddhartha* as "Investigative Journalism & Modern History" at 0.95 confidence and
handed the Vox planner `docType: declassified` for a Buddhist novel.

The narration is read from `--vtt=` when the raw file is still on disk, **or straight out of the
already-planned `config.*.json`** (`captions[]` is the full word-level transcript) — so it works
on all 49 planned books today with nothing to re-download.

**Gate met** — authored for `atonement` (Vox) and `all-the-bright-places` (Antidote).
`--coverage` reports how much of the film the bible can speak for:

| book | scenes | names a cast member | names a bible object | **either** |
|---|---|---|---|---|
| atonement | 310 | 36.1 % | 22.6 % | **48.7 %** |
| all-the-bright-places | 115 | 40.9 % | 49.6 % | **67.0 %** |

Against a 6.6 % subject-bearing baseline, that is the headroom Phase 3 converts. The heuristic
draft also earned its keep twice: it produced the correct `forbid` list for a 1935 book without
being told the period, and it surfaced `Bry` / `Brainy` as recurring "characters" in *Atonement*
— both ASR corruptions of **Briony** that the VTT name pre-pass missed. They now live in the
bible as `aliases`, so the same person resolves under every spelling.

### Phase 3 — beat briefs + directors consume them · ~3–5 days — ◑ **FIRST CUT LANDED 2026-09-12**

[`scripts/plan-briefs.js`](scripts/plan-briefs.js) gives every beat a **subject**, grounded in the
story bible and **keyed by a fingerprint of the beat's own words**. Both planners take
`--briefs=` and both report their match rate; on the pilot it was **365/365**.

- **Vox** — the brief's `vox.shot` replaces `keywords(text, 3).join(", ")` as the Flux subject,
  reusing the bible's `look` so a character is the same person in every frame, and a confident
  brief is now itself sufficient reason to give a beat a picture.
- **Antidote** — the brief's `concept` and `set` outrank the director's first-match regex (an
  explicit art file still wins over both), and a new **CONCEPT→MOTIF table** closes the gap where
  a beat could *know* its subject was `grave` and still draw an `orbit`, because no mapping from
  a concept to a motif existed at all.
- `confidence` is the safety rail: below `--brief-confidence` (0.6) the directors keep their
  neutral fallback rather than draw a confident wrong picture.

**Measured on `siddhartha`** — same VTT, same args, briefs the only difference:

| | subject-bearing | wrong | filler | thin |
|---|---|---|---|---|
| **Vox** without → with | 0.3 % → **24.4 %** | 0.0 % → 11.5 % | 27.4 % → **6.8 %** | 72.3 % → 57.3 % |
| **Antidote** without → with | 48.9 % → **55.9 %** | 7.7 % → **4.5 %** | 34.7 % → 35.7 % | 8.7 % → **3.9 %** |

Antidote also went from 35 prop-less scenes to 16, `contradicts` from 10 to 2, and its most-used
motif changed from `clock` to `water` while the `shore` set went 39 → 61 scenes — the river, which
*is* Siddhartha's argument. That is the bible reaching the screen.

The Vox `wrong` rise is honest, not a regression: those beats previously drew keyword-bag images,
which score as `filler` because they *cannot* be about anything. Now they make a claim, so the
audit judges it. The residue tracks the airtime gap — the subject is right for the beat's own
words, and the scene plays slightly over its neighbour's.

**Authored pass (same day).** `--emit-weak` emits only the beats below the confidence the
directors act on — 157 of 311 on this book — and `--merge` folds authored answers back in by
fingerprint, so an authoring pass is targeted instead of re-typing a whole film. 23 of those 157
were authored; the rest are argument, not scene, and were deliberately left as type on paper.

**Antidote, `siddhartha`, three-way:**

| | subject-bearing | wrong | filler | thin |
|---|---|---|---|---|
| no briefs | 48.9 % | 7.7 % | 34.7 % | 8.7 % |
| heuristic briefs | 66.9 % | 3.2 % | 25.1 % | 4.8 % |
| **+ 23 authored** | **69.8 %** | **3.2 %** | 22.8 % | 4.2 % |

Against this book's shipped config (24.1 % / 8.7 %). 23 authored beats — 7 % of the film — bought
**+2.9 points**, so authoring the remaining weak beats is the path to the 70 % gate rather than
more machinery.

Two honesty notes on the numbers above: part of the jump from 48.9 % to 66.9 % is the audit
learning to read `_subject` (a stated claim, verified against the audio) instead of re-deriving
grounding from the icon's regex — a config that states no subject cannot benefit, which is a
real difference in the artifact, not a scoring trick. And Antidote airtime now reports `n/a`
rather than 84.6 %, because `_narration` is truncated at 160 characters in the config and 43 %
of a book hits that limit; the old number was measuring the truncation.

**Gate: 2 of 3 met on the Antidote pilot** (wrong 3.2 % ✓, subject 69.8 % — 0.2 short, airtime
not measurable). What is left:
1. **Authored briefs.** Everything above is the *heuristic* derivation. `--emit`/`--briefs` is
   wired for Claude and unused so far; the bible pilot showed authoring is where the quality is.
2. **Bibles for the other 47 books** — each one is a `--emit` → author → `--bible` pass.
3. Importance-aware cooldowns (a book's central object is currently forbidden from recurring).
4. Vox still has no icon vocabulary at all, so its ceiling is images; Phase 4 is its lever.

### Phase 4 — vocabulary · ~2–4 days — ◑ **LANDED 2026-09-12** (per-book motifs still unused)

[`scripts/lint-vocabulary.js`](scripts/lint-vocabulary.js) cross-checks the four hand-maintained
lists that have to agree — the `propType` enum, the motif `REGISTRY`, `CONCEPT_LEXICON`, and
`CONCEPT_SET`/`CONCEPT_HOLD` — and probes the first-match-wins lexicon for shadowing. Every
failure in this class is silent at run time (an unknown motif renders as `null`, an unknown set
renders as `null`, Remotion does not zod-parse `defaultProps`), so a typo is a confident blank
frame in a 40-minute unattended render.

What it found and what was repaired:

- **18 motifs were drawable but unreachable by meaning.** Six that carry a real subject
  (`summit`, `ladder`, `crack`, `clock`, `balance`, `book`) now have narrow lexicon entries;
  `book` is deliberately tight because "the book" is said in every other sentence on this
  channel. The abstract six (`spotlight`, `ripple`, `orbit`, `shape`, `maze`, `arrow`) stay
  unreachable **on purpose** — they carry no subject, so a regex for them would only manufacture
  false relevance.
- **Shadowing in a first-match list.** `"the car crash on the highway"` selected `car`; `crash`
  now wins. `iceberg` matched the same words as the richer `icebergDepth` and sat above it, so
  the better drawing never won once in 3309 beats — removed. A bare `funnel` shadowed
  `funnelTrap` for every book.
- **Six dead keys** that nothing could ever select.
- `books/<slug>/motifs.json` now feeds the director's `customSvg` hook directly. That escape
  hatch — a book-specific icon carried as *data*, so it travels in the render bundle and costs no
  per-book engine code — had fired **zero times in 15 books**, because the only way in was a
  `creative-bible.json` field that two of six universes populate.

**Gate partly met:** zero drift-lint breaks, and grounded icons in use on the pilot went 36 → 40.
Still open: no book yet ships a per-book `motifs.json`, and Vox still has no icon vocabulary at
all.

### Phase 5 — repair loop + gate · ~2–3 days

`--repair`, surgical regeneration (`--beat`, `--force`), non-destructive `CONTENT_FILTERED`,
`cutout.py` emptiness check, and `audit-relevance.js` wired into `make-book.js` as a hard gate.

**Gate:** an intentionally sabotaged book is detected, repaired and re-passed with no manual step.

### Phase 6 — proof · ~1 day

Re-plan and re-render one already-shipped book; before/after contact sheet of ~20 beats plus
the three numbers. Log it in `AGENT_LOG.md` and update `SKILL.md` §9.

---

## 6. What we deliberately do NOT do

- **No SFX / audio work.** Out of scope by instruction.
- **No vision-model image verification** (CLIP / a captioner scoring the returned PNG). It is
  the obvious idea and it is the wrong one *first*: the prompts are bags of words, so we would
  be scoring how well Flux drew nonsense. Fix the brief, then consider scoring the output.
- **No per-book hand-written override files as the remedy.** They are how we got here
  (`apply-antidote-overrides.js`, `art-direct-fluke.js`): correct diagnosis, unscalable cure,
  erased by the next re-plan. Claude authoring *fingerprinted data* is fine; a bespoke script
  per book is not.
- **No re-cutting to more scenes.** Cut rate is bounded by the narration, and dead air is
  already solved. This document is about meaning, not tempo.
- **No new engine.** Both engines already render more than the planners can express — six
  typed payload fields and the `customSvg` hook have never been written to.

---

## 7. Coordination

- A **945-line uncommitted Vox WIP** exists right now (`scripts/plan-vox.js` +
  `src/engines/vox/{documents,scenes,thumbnail,annotations,palette,captions,…}.tsx`), with **no
  `Active WIP` row in `AGENT_LOG.md`**. Phase 0 item 1 and all of Phase 3's Vox work collide
  with it — claim a row and check with that agent before editing.
- Phases 0, 1, 1b are independent of it and can start immediately.
- `ANTIDOTE_4_ROADMAP.md` (multiplane camera, gaze, diagrams) is complementary; its item on
  **explanatory diagrams** overlaps Phase 3 — a diagram needs a subject and real labels,
  which is exactly what `beat-briefs.json` supplies. Build the brief first, then that roadmap
  item gets cheaper.
