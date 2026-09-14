---
name: remotion-book-video
description: >
  Expert knowledge for the Remotion book-summary video project at
  c:\Users\savas\Cursor\Remotion\test. Covers project architecture,
  component library, scene/transition/animation systems, caption pipeline,
  theming, rendering, and common workflows. Use this skill whenever the
  user asks to add features, debug, or generate new videos in this project.
---

# Remotion Book-Video Project – Skill Reference

## Project Root

```
c:\Users\savas\Cursor\Remotion\test\
```

**Tech stack:** Remotion 4.0.414 · React 19 · TypeScript 5 · Tailwind v4 · Zod · 24 fps · 1920 × 1080

---

## Architecture Overview

```
src/
  Root.tsx                        ← Remotion entry: registers <Composition>
  index.ts                        ← exports
  index.css
  compositions/
    IntroMainVideo.tsx            ← Top-level: intro clip + main video
    SceneBasedBook.tsx            ← Main composition (audio + scenes + captions + YPP)
    BookSummary.tsx               ← Older composition (kept for reference)
    SeeingOtherPeople.tsx         ← Older composition
    DebugTests.tsx
  components/
    CinematicSceneManager.tsx     ← Renders active scenes + transitions
    CinematicSceneRenderer.tsx    ← Renders a single scene (assets + color grade + grain)
    AnimatedCaption.tsx           ← Karaoke-style word-by-word captions
    ParticleBackground.tsx        ← SVG animated backgrounds (20+ variants)
    YPPEnhancementLayer.tsx       ← Global overlay (letterbox, vignette, etc.)
    BookCover3D.tsx               ← 3D rotating book cover
    SceneManager.tsx              ← (legacy)
    SceneRenderer.tsx             ← (legacy)
    effects/                      ← Reusable visual effect components
      AnimatedText.tsx
      BubblePopText.tsx
      CircularProgress.tsx
      FloatingChip.tsx
      GlitchText.tsx
      LiquidWave.tsx
      ParallaxPan.tsx
      ParticleExplosion.tsx
      PixelTransition.tsx
      PoppingText.tsx
      PulsingText.tsx
      TypewriterQuote.tsx         ← Char-by-char typewriter quote overlay
      index.ts                    ← barrel export for effects
    overlays/                     ← Overlay components (9 files)
      ChapterCard.tsx             ← Animated quote/chapter/insight cards
      EmotionalArc.tsx            ← SVG emotional intensity line chart
      SceneTitleBurnIn.tsx        ← Scene chapter title burn-in
      IntermissionCard.tsx        ← Between-scene mini cards
      BookProgressIndicator.tsx   ← Book reading progress (bar/pages/dots)
    audio/                        ← Audio-related components (4 files)
  utils/
    sceneGenerator.ts             ← getActiveScenesAtTime, calculateSceneOpacity
    srtParser.ts                  ← parseSRT → Caption[]
    transitionSelector.ts         ← selectBalancedTransition, selectBalancedAnimation
  types/
    scene.ts                      ← All TypeScript types (see below)
  themes/
    index.ts                      ← Genre → Theme mapping
  data/
    new-srt.ts                    ← Current SRT content as a TS string export
    seeing-other-people-srt.ts
```

**External scripts (project root):**
- `generate-video.js` – Node script that reads `production-*.json` and triggers the render
- `generate-prompts-from-srt.js` – Converts SRT → scene image prompts
  - **Rule**: Each video must have between **60 and 100 random scenes** to ensure high visual variety and YPP compliance.
- `convert-srt.js` – SRT format conversion helper
- **Scene Image Standards**:
  - **Location**: `public/scenes/[video-slug]/`
  - **Naming**: `scene-00.png`, `scene-01.png`, etc. (sequential padding to 2 digits)
  - **Reference**: `"scenes/[video-slug]/scene-XX.png"` in production JSON.

---

## Book Orchestration Pipeline (per book, end-to-end)

The full flow to turn a book title into a preview-ready Vox video. All content is authored in **English (US market)**.

> **CRITICAL LANGUAGE INVARIANT (STRICT):**
> This channel exclusively targets the **US / English-speaking market**.
> Every asset in the YouTube Publishing Kit (`youtube.md`, `youtube-meta.json`), video title, description, chapter timestamp, tag, pinned comment, and chat summary of the publishing pack **MUST BE 100% IN ENGLISH**. Never generate or translate YouTube publishing metadata to Turkish.

```
Step 0    make-prompt.js   → books/<slug>/prompt.notebooklm.md   (bespoke NotebookLM "Audio Overview" prompt)
           └─ [manual] paste into NotebookLM → generate audio → save public/audio/<slug>.m4a
           └─ [manual] upload to YouTube (unlisted) → download word-level VTT → public/captions/<slug>.vtt
Step 0.8  preproduce.js    → books/<slug>/creative-bible.json    (AI Art Director: worldbuilding, palette, engine recommendation, asset gap analysis, dynamic SVG synthesis)
Step 1    make-book.js     → plan-vox/plan-antidote → gen-vox-images → cutout → plan-meta → clean-vtt → gen-thumbnail
                               → verify-assets → gen-books-registry → thumbnail-still
                               (consumes creative-bible.json, produces config, full YouTube publish pack, + registers composition)
Step 2    [user] preview in Remotion Studio; render is user-driven (never auto-render)
Step 3    render (local chunk OR Amazon Lambda-segmented) → out/<slug>.mp4  (see "Lambda Scaling")
```

**Publish pack produced automatically by Step 1** (render-independent — ready before the video even renders):
- `books/<slug>/youtube.md` + `books/<slug>/youtube-meta.json` — max-conversion titles (≤100 chars, hook front-loaded), a description whose **hook is the actual cold-open narration** (our prompt opens on the most provocative line, so it's a built-in scroll-stopper), keyword-rich body, 18 tags, 5 hashtags, and chapters. Chapter labels are deterministic (coherent narration phrases) when no LLM key; the LLM path overlays punchier `chapterTitles`.
  - **⚠ MANDATORY STEP — Claude hand-refines the pack (no-LLM runs).** The deterministic fallback **cannot** find real topic boundaries — it cuts a chapter ~every 150s and labels it with a narration snippet (that's how a 17-min video got "Robbins / Isn'T / Humans / Don'T" at mechanical even-spaced times). So whenever `plan-meta.js` runs without a key it now stamps `"metaSource":"fallback","needsClaudeRefine":true` and `make-book.js` prints a loud **META ELDE GEÇİRME (ZORUNLU)** block. When you see it (or `needsClaudeRefine:true` in the json), **read `public/captions/<slug>.clean.vtt` and rewrite** `books/<slug>/youtube.md` + `books/<slug>/youtube-meta.json`: (1) **chapters** at the REAL topic transitions found in the VTT with content-based labels + timestamps that match the narration (verify each against the cue text — don't trust 150s spacing); (2) **titles** — optimize for MAX search traffic (YouTube + Google), not just CTR: front-load the exact book title (and/or author) in the first ~40 chars (primaryKeyword `<Book> summary` must appear verbatim in the primary), give each of the 5 a distinct query intent (exact `<Book> Summary` · `<Author> + <Book>` · a specific searched concept · a curiosity hook · a benefit/number angle) with a search modifier (Summary/Explained/Key Ideas/Book Summary/Review), keep the searchable part inside ~60 visible chars, and still keep one strong hook — see memory `seo-title-strategy`; (3) **description hook = the video's actual cold-open sentence**; (4) **`thumbnail.hook`** must be **book-specific AND original** — ≤4 words, NOT the title, NOT misleading, and NEVER a generic phrase reused across books (a "THE TWIST"/"THE ONE THING" on every video reads as inauthentic/duplicate → YPP risk). Then set `"refinedBy":"claude-hand-refined"`. **If you changed `thumbnail.hook`, the baked PNG is now stale — RE-RENDER it** (the still reads the hook from the json at bundle time): `npx remotion still Thumb-<slug> out/thumbnail-<slug>.png --frame=0` (never `--gl=angle`). This is the same standing pattern as authoring the NotebookLM prompt directly — never ship fallback copy. Gold example: `books/sway/youtube.md` ("583 people died…" title, "One Man's Fear, 583 Dead" chapters); refined example: `books/let-them-theory/youtube.md` (prom-night 1:34, airplane 8:01, jealousy 12:36 — all VTT-verified).
- `public/captions/<slug>.clean.vtt` — **upload THIS as YouTube CC ("With timing"), not the raw `<slug>.vtt`.** The raw VTT keeps inline `<c>` word-timing (needed for the burned-in karaoke) and YouTube's uploader rejects it "line 7 error". `clean-vtt.js` strips tags + rolling-duplicate lines into sequential non-overlapping cues.
- `out/thumbnail-<slug>.png` (1280×720) — composited via `npx remotion still Thumb-<slug> ... --frame=0`. **Never pass `--gl=angle`** on this GPU-less machine — it times out the Chrome launch ("Timed out after 25000 ms"); the default GL works. Add the `thumbnailHook` overlay text (from the md) in an editor; don't repeat the title.

### Thumbnail identity & variation (YPP originality — don't ship look-alike thumbnails)
Near-identical thumbnails across the channel read as templated/mass-produced (a secondary YPP "reused content" signal) and cannibalize CTR in the browse feed. Two mechanisms keep every book visually distinct **without** losing a coherent channel identity:

1. **Per-book palette (`books/<slug>/book.json` → `palette{paper,ink,red,gold}`).** `paper`=light bg, `ink`=near-black text, **`red`=the saturated ACCENT (the main hue lever)**, `gold`=secondary. Claude authors a genre/mood-specific palette per book (same Claude-first lane as the meta). `gen-books-registry.js` reads every book.json and emits `BOOK_PALETTES` into `src/books.generated.ts`; both `resolvePalette()` in `src/engines/vox/index.tsx` (Vox video **and** thumbnail) and the Antidote thumbnail read it. **Legibility rule:** keep `paper` light + `ink` near-black + `red` saturated/mid-dark (white text on the accent box must stay readable) — vary the HUE, not the value structure. Missing palette → `DEFAULT_PALETTE` fallback. (One-time backfill of all existing books lives in the scratchpad `inject-palettes.js`; new books get theirs at art-direction.)
2. **Two engine thumbnail styles = built-in bimodal channel look.** `Thumb-<slug>` is registered **once per book, by `book.json.engine`** (registry emits `engine` per entry; Root picks the component — no id collision even when a slug has both configs):
   - **Vox** → `VoxThumbnail` — photoreal Flux hero cut-out (right) + red marker-stroke + kinetic hook (left). `gen-thumbnail.py` makes the hero from the meta `thumbnail.subject`.
   - **Antidote** → `AntidoteThumbnail` (`src/engines/antidote/Thumbnail.tsx`) — **flat-vector**: palette ground + growth **motif** (`risingBars|arrowUp|summit|spark|ring`) + the **Everyman rig** in a confident pose + kinetic hook. Brief lives in `config.antidote.json` → `meta.thumbnail{hook,variant,action,expression,motif}` (scaffolded by `plan-antidote.js` with `_needsClaudeRefine`; Claude writes the ≤4-word original `hook`). Palette comes from `book.json`, not the brief. Preview the style standalone at composition `Antidote-thumb-sample`. Everyman viewBox is 400×600 so rendered **height = width×1.5** — keep `width ≤ ~450` or the waist-up figure clips the 720 frame.

### Folder layout — every book is self-contained in `books/<slug>/`
Each book owns ONE folder holding all of its files (both machine-read JSON and human-facing docs):

| File | What | Written by |
|---|---|---|
| `books/<slug>/book.json` | manifest `{slug, title, author, genre, engine}` | migrate / make-book |
| `books/<slug>/config.vox.json` | Vox render config (`meta`, `captions[]`, `beats[]`) | `plan-vox.js` |
| `books/<slug>/youtube-meta.json` | YouTube SEO/meta + thumbnail brief | `plan-meta.js` |
| `books/<slug>/cache.json` | plan-vox LLM art-direction cache (resume-safe) | `plan-vox.js` |
| `books/<slug>/prompt.notebooklm.md` | NotebookLM "Audio Overview" prompt | `make-prompt.js` |
| `books/<slug>/youtube.md` | copy-paste upload pack | `plan-meta.js` |
| `books/<slug>/README.md` | per-book hub index | `gen-book-readme.js` |

- **`scripts/lib/paths.js` is the single source of truth for every path** — `rel.*(slug)` / `abs.*(slug)` builders plus `listVoxSlugs()`, `findAudio()`, `ensureBookDir()`. Never hardcode a book path in a script; import from `paths.js`. `gen-books-registry.js` scans `books/*/config.vox.json` → `src/books.generated.ts` (imports `../books/<slug>/…`).
- **One-off migration:** `node scripts/migrate-to-books.js` (dry-run) / `--apply` moved the old scattered root files here; superseded files are archived under `books/<slug>/_legacy/` (kept, not deleted).
- Rendered assets stay under `public/` and `out/` (unchanged): audio `public/audio/<slug>.*`, captions `public/captions/<slug>.vtt`, scenes `public/scenes/<slug>/`, video `out/<slug>.mp4`, thumbnail `out/thumbnail-<slug>.png`.
- **Legacy cinematic engine** (`production-*.json` + `IntroMainVideo`/scene-config) is separate and not part of the Vox `books/<slug>/` flow.

### Engines — Vox & Antidote (pick one per book)
The channel runs **two** render engines; each book chooses one (mixing them across the channel is deliberate — a single-style channel is weaker for YPP originality).

| Engine | Look | Assets | Best for |
|---|---|---|---|
| **Vox** | Johnny-Harris motion-graphics: Flux cinematic stills + kinetic text | per-beat Flux images (raster) | abstract/data ideas; fast to produce |
| **Antidote** | Flat-vector **rigged characters** + a 10-shot grammar, transitions, parallax sets and drawn motifs; CPU-cheap **SVG (no WebGL)** | none — everything is vector, generated from the VTT | character/story-driven books |

- **Source of truth:** `books/<slug>/book.json` → `"engine": "vox" | "antidote"`. `gen-books-registry.js` auto-registers `Vox-<slug>` for every `config.vox.json` and `Antidote-<slug>` for every `config.antidote.json`; **never hand-edit Root.tsx** for a new book.

### Autonomous Art Director & Pre-Production Engine (Step 0.8)
Before running `plan-vox.js` or `plan-antidote.js` (or automatically executed as Step 0.8 by `make-book.js`), run:
```bash
node scripts/preproduce.js --slug=<slug> --genre=<genre> [--title="..."] [--author="..."]
```
This produces `books/<slug>/creative-bible.json`:
1. **World & Era Detection:** Classifies the universe (Classical Antiquity, Modern Silicon Valley, Behavioral Psychology, Cold War Investigation, Wealth/Finance) and generates a bespoke palette.
2. **Engine Recommendation:** Evaluates content suitability for Antidote vs. Vox with a confidence score and rationale.
3. **Asset Gap Analysis & Dynamic Synthesis:**
   - **Antidote:** Audits required backdrops and motifs. If custom metaphors are needed, synthesizes parametric vector SVGs (`customSvg: { paths, title }`) that Remotion renders without code edits.
   - **Vox:** Assigns appropriate historical document templates (`parchment`, `telegram`, `lab`, `financial`, `newspaper`, `declassified`), map coordinates, and photo prompt styles.

- **Antidote pipeline:** `node scripts/plan-antidote.js --slug=<slug> --title="…" --genre=…` → scaffolds `books/<slug>/config.antidote.json` (timing + word-timed captions + a fully directed shot list) and sets `book.json` engine. It automatically loads `creative-bible.json` when present. **Then Claude ART-DIRECTS** on top — the `_narration` + `_beat` hints on each scene are the guide. Then `node scripts/gen-books-registry.js` and preview `Antidote-<slug>` in Studio. Engine code: `src/engines/antidote/` (all data-driven — new book = new JSON). Re-planning a book **preserves a hand-refined `meta.thumbnail`** brief (only a scaffold carrying `_needsClaudeRefine` gets overwritten).
- **Subtitles (Antidote):** `CaptionLayer` renders word-timed captions in a reserved bottom safe-zone (spoken word lightly highlighted); kinetic callouts stay upper/mid so the two never collide.

#### Antidote shot grammar — why a 45-min video doesn't read as one long slide
The original planner staged every beat identically (one waist-up figure, left/right by index parity, one punch word, one slow zoom): **163 of 181 scenes in `clear-thinking` were the same composition.** That is both unwatchable and a "templated content" signal for YPP. Four systems fix it, all deterministic (same VTT in → same film out):

1. **Shots** (`src/engines/antidote/shots.ts`) — 10 framings: `wide · medium · closeUp · twoShot · overShoulder · insert · split · silhouette · lowAngle · crowd`. A shot preset supplies cast placement/scale/flip/silhouette, the copy zone and the motif slot, so **scenes omit `x`/`y`/`scale`/`size` entirely** — re-directing a scene means changing one word, not retyping coordinates. Explicit values still win, so every pre-shot-grammar config renders unchanged. `insert` drops the cast (the motif carries the beat); `crowd` replicates the rig into three depth rows with the hero in front; `split` paints two color fields.
2. **Transitions** (`components/Transition.tsx`) — `dissolve · wipeL/R/Up · whipL/R · irisIn · flash · slideUp`. Each scene is mounted `transition.frames` **early** (`index.tsx`) so the outgoing scene is still on screen while the incoming one reveals; the scene compensates via `transIn` so callouts stay locked to the narration.
3. **Motifs** (`motifs.tsx`) — 19 drawn metaphors (`barChart · lineGrowth · balance · ladder · door · clock · maze · spotlight · counter · orbit · stack · crack · ripple · summit · coin · book · shape · arrow · moneyRain`). The old `coin`/`book`/`shape` prop types returned `null`; every type now draws.
4. **Backdrops** (`components/Backdrop.tsx`) — 3-layer **parallax sets** (`horizon · office · street · room · stage · sky · abstract`) drifting against the camera at 0.22 / 0.55 / 0.88, plus a static CSS texture (`grain · dots · grid · rays`) and a vignette. Pure CSS/SVG — no images, no WebGL.

The **director** (`scripts/lib/antidote-director.js`) makes the per-beat calls: it classifies the narration (`stat · crowd · contrast · question · negative · positive · story · time · neutral`), then picks the shot with **anti-repeat + per-shot cooldowns + a forced pattern interrupt every ~6 beats**, the transition (never one used in the last two cuts), the location (a set holds for 5–7 beats, then changes with a louder transition), the motif, the cast count, and a camera **punch** synced to the callout frame. Result on `clear-thinking`: 10 shots in play, largest composition bucket **9.9%** (was ~90%), no shot or transition ever repeating back-to-back.

**Tuning note:** a bare "but"/"or" is spoken filler, not a contrast beat — classifying on it pushed a third of the film into split shots. It only decides the beat when nothing stronger matches.

#### Antidote callouts — phrases, not nouns (`scripts/lib/antidote-copy.js`)
The old `punchWord()` scored candidates by LENGTH with a bonus for `-ion/-ment/-ness`, i.e. it *chased* abstract nouns: **71% of clear-thinking's 182 callouts were ≥10-char abstractions** (ORGANIZATION / MANAGEMENT / INFORMATION / SCREAMING). The copywriter mines 1–4 word **phrases** and scores them on punch — concrete/loaded words, negations, second person, imperatives — penalising exactly those abstractions. Three rules do most of the work:
- **The tail is the payload.** For a multi-word callout the last word must be a concrete loaded word and never a bare verb, or the phrase dangles ("LIFE A FLAT", "YOU CANNOT BEAT"). A phrase must not open on an auxiliary either ("AREN'T ANALYZING").
- **A stat must mean something.** A bare two-digit number is usually a time or a list index ("8.15 a.m.", "the next 10 moves") — a stat needs a currency, a unit, or 3+ digits.
- **Scarcity.** A beat with no strong phrase gets **no callout**, and two in a row must clear a higher bar. Result: 49% of scenes carry one (was 100%), 0% abstract nouns, avg 2.6 words — SLAMS THE PHONE / FIVE ALARM FIRE / NEVER WORKS / OUTCOME OVER EGO.

Styles follow the phrase shape: `reveal` (3–4 words, word by word) · `highlight` (2 words, accent bar wipes in behind the operative word) · `strike` (a negation, crossed out) · `outline` (a real stat) · `stack` · `box`. Implemented in `components/KineticText.tsx`, which also auto-fits and wraps multi-word copy.

**Best copy comes from Claude, not the heuristic** — same handoff as plan-vox:
```
node scripts/plan-antidote.js --emit-beats=<file> …args…   # dump beats, exit (config untouched)
# Claude rewrites each beat's `callout` (or sets it to null to keep the frame silent)
node scripts/plan-antidote.js --callouts=<file> …args…     # consume them
```

#### Antidote word-level sync — the graphics belong to the same video as the voice
Callouts used to be stamped at a fixed `at: 22` (0.73s into the scene) while the phrase they quote was actually spoken a **median 3.3 seconds later** (p90 13.6s, worst 17.5s); only **16%** landed within half a second of the word. That gap is what makes motion graphics feel bolted on. The VTT already carries per-word frame timings (`captions[].words[].s` are **absolute frames**, not seconds), so `anchorAt()` in plan-antidote.js finds where the phrase is really spoken — full-phrase match, falling back to its first word — and places the type there, `LEAD` frames early, clamped so it still holds `MIN_HOLD` frames before the cut. Result: **median drift 4 frames (0.13s), 98% within half a second.** The camera punch follows the anchored frame automatically.

Motifs get the same treatment via `propSchema.at`: the renderer wraps each one in `<Sequence from={at} layout="none">` so the motif's **whole internal clock** shifts (a plain opacity delay would still have the counter finish before the number is spoken). On an `insert` the motif is the shot, so it arrives at 0; elsewhere it leads the callout by 8 frames.

#### Antidote color script — the film travels somewhere
Rotating five backdrop palettes in a fixed order is decoration: the frame's color said nothing about where you were in the book. `colorScript()` in the director makes the field a function of narrative **position** and beat **valence** — four acts (`setup · tension · turn · resolution`), each drifting continuously within itself so neighbouring scenes match while the film as a whole moves. On clear-thinking: 139 distinct backdrop fields (was 5), the tension act visibly dimmer (max luminance 219 vs 244–245 elsewhere), and `_act` is written to each scene as an art-direction hint.

> **Color-helper trap (cost a render):** `hx()`/`shade()` parsed **hex only**, but the color script *composes* helpers (`darken(lighten(x))`) and they return `rgb(r,g,b)` strings — so the nested call produced `NaN` and rendered **74 scenes (41% of the film) on pure black**. Both parsers now accept `rgb()` as well as hex and return a safe fallback instead of NaN. Any new color math in this engine must be composable.
#### Antidote cast bible — one recurring cast, not 224 strangers
The planner used to do `CAST[(i + c) % CAST.length]`: **224 character instances in clear-thinking, 224 distinct identities.** No face ever came back, so 45 minutes read as stock clip-art. Scenes now carry a **role** (`narrator · protagonist · foil · mentor · extra`) and the look is resolved at render time from `meta.cast` (`resolveVariant()` in `components/Scene.tsx`): 224 bodies → **4 identities**. The narrator frames ideas, the protagonist is the "you" of the book and carries lived beats, the foil is who they're up against, the mentor lands advice beats — assigned per beat class by `castRoles()` in the director. Per-scene `expression` layers on top; `variant` remains a one-off override, so pre-bible configs (full `variant`, no `role`) are unaffected. Lead gender presentation is seeded from the slug so books don't all look like one series. Editing `meta.cast` restyles the entire film in one place.

#### Antidote Character Emotions & Micro-Reactions (Kurzgesagt Emotion FX)
To boost audience retention and emotional connection in long-form explainer animations, characters in Antidote support head-anchored micro-reaction overlays (`src/engines/antidote/characters/Emotions.tsx`).

Properties on `CharacterSpec` (`src/engines/antidote/schema.ts`):
- `emotion`: `"none" | "lightbulb" | "sweat" | "question" | "shock" | "fire"`
- `emotionAt`: Frame within the scene when the reaction pops (defaults to ~8-10 frames after scene entrance).

**The 5 Reaction Archetypes:**
1. **`lightbulb` (💡 Aha! / Epiphany):** Golden glowing bulb `#FBBF24` with spring pop, radiating spark rays, and floating bob. Best for conceptual breakthroughs, discoveries, and eureka moments.
2. **`sweat` (💧 Cognitive Bias / Anxiety / Dilemma):** Sky-blue droplet `#38BDF8` appearing at the character's temple with realistic gravity drip and fade, coupled with an automatic subtle shivering body jitter (`jitterX`).
3. **`question` (❓ Confusion / Paradigm Questioning):** 3 staggered cartoon question marks floating up in an arc above the head. Ideal for skeptical beats, inquiry, and challenging assumptions.
4. **`shock` (⚡ Sudden Realization / Paradigm Shift):** Dramatic comic shock burst lines radiating outward from the head.
5. **`fire` (🔥 Intense Drive / Burning Discipline):** Vector flame crown with organic wave flicker above the head for beats on unstoppable motivation, grit, and discipline.

These overlays are mounted inside the Everyman `<g transform="translate(pose.headX, pose.headY)...">` group so they naturally inherit head turns, tilt, yaw, and scaling.

#### Vox Superpowers & Editorial Archetypes (Powered by Remocn)
Vox video scenes are powered by high-conversion editorial motion components in `src/components/remocn/` and unified under `src/engines/vox/scenes.tsx`.

The automated planner (`scripts/plan-vox.js`) and LLM director assign these archetypes automatically based on narration cues:

1. **`stat` (`StatScene`):**
   - Automatically parses metrics, numbers, percentages, or multipliers (`85%`, `37x`, `$100K`, `300`).
   - Renders animated **`RollingNumber`** (odometer tick) framed inside an organic stop-motion **`ScribbleCircle`**.
   - If no numeric stat is parsed, smoothly falls back to kinetic emphasis words.

2. **`quote` (`QuoteScene`):**
   - Renders pull quotes with book attribution.
   - Highlights the quote/author with an organic hand-drawn **`InkUnderline`**.

3. **`compare` (`CompareScene`):**
   - For paradigm shifts ("From X to Y", "Forget goals, focus on systems"), automatically falls back to **`StrikethroughReplace`** when side-by-side images are omitted.
   - Crosses out the old trap/misconception in blood-red ink and stamps the new rule.

4. **`statement` (`StatementScene`):**
   - Bold kinetic statement text.
   - Variant 2 applies **`MarkerHighlight`** behind the operative words for editorial magazine feel.

5. **`checklist` (`ChecklistScene`):**
   - Triggered by narration mentioning "rules", "steps", "laws", "framework", "habits", or "checklist".
   - Renders a tactile card with animated handwritten (`Handwrite` using Google Caveat font) checklist items that get progressively checked off with stop-motion ticks.
   - Props on `VoxBeat`: `checklistItems: Array<{ text: string; checked?: boolean }>`

6. **`polaroid` (`PolaroidScene`):**
   - Triggered by biographical stories, psychological experiments, or case studies ("Daniel Kahneman", "Stanley Milgram", "In 1974...", "The experiment...").
   - Renders an instant physical photo frame with masking tape (`PaperSticker`), realistic drop shadow, subtle rotation, and handwritten archival caption.
   - Props on `VoxBeat`: `polaroidCaption?: string`, `image?: string`

7. **`chart` (`ChartScene`):**
   - Triggered by narration about growth curves, exponential trends, compounding, financial returns, or decline ("compounding", "exponential", "over time", "curve", "plateau").
   - Pure SVG animated line chart with grid, axis labels, and glowing leading pulse dot (100% GPU-safe, zero WebGL overhead).
   - Props on `VoxBeat`: `chartData?: number[]`, `chartLabels?: string[]`, `chartTitle?: string`, `chartSubtitle?: string`

8. **`ChapterOverlay` Upgrades (`src/engines/vox/overlays.tsx`):**
   - Chapter titles now render with tactile editorial styling: a taped paper badge (`PaperSticker`) for the chapter number and an organic **`InkUnderline`** for the title.

### Who authors the creative work — **Claude-first (default); NVIDIA/llama is dormant**
The three creative stages are, by default, authored by **Claude directly** — sharper and more book-specific than llama-3.3-70b. The NVIDIA path (`scripts/lib/llm.js`) is kept but **only wakes on explicit opt-in** (`USE_NVIDIA=1`, or `--use-llm` on plan-vox) so a stray `NVIDIA_API_KEY` in `.env` never silently takes over.

| Stage | Script | Default (Claude) | Wake the model |
|---|---|---|---|
| NotebookLM angle | `make-prompt.js` | writes a scaffold + prints an **AUTHOR** banner → Claude writes the angle | `USE_NVIDIA=1` |
| YouTube meta | `plan-meta.js` | emits fallback + `needsClaudeRefine:true` → Claude hand-refines from the VTT | `USE_NVIDIA=1` |
| Scene art-direction | `plan-vox.js` | heuristic auto-draft; **hand-direct** via `--emit-beats=<f>` → author designs → `--designs=<f>` | `USE_NVIDIA=1` / `--use-llm` |

- **Hand-directing scenes (Claude):** `node scripts/plan-vox.js --emit-beats=out/<slug>-beats.json --vtt=… --slug=… --title="…"` dumps every beat's text with a heuristic draft `design`; Claude rewrites each `design` (book-specific archetype/kicker/emphasis/image subject), then `node scripts/plan-vox.js --designs=out/<slug>-beats.json …` builds the config from Claude's designs. To combine with `make-book`: pre-run the two plan-vox passes, then `make-book … --skip-plan` (keeps the hand-directed `config.vox.json`).
- **Model id / switching:** `scripts/lib/llm.js` holds the single `MODEL` (env `NVIDIA_MODEL` overrides). Discover real slugs with `node scripts/list-nim-models.js` (key loaded). Pick an **instruct** model, never a reasoning/"thinking" one — `stripThink()` guards JSON extraction but a thinking model still burns the token budget.

### Step 0 — NotebookLM prompt (`scripts/make-prompt.js`)
```
node scripts/make-prompt.js --title="Book" --author="Author" --genre=psychology --minutes=40 --slug=<slug>
```
Writes `books/<slug>/prompt.notebooklm.md`: a **unique analytical thesis + strict structure** so every audio is genuinely transformative (YPP-safe) and hooks in the first seconds. The fixed SPINE (cold open → thesis → setup → **8 argued beats** → honest counterpoint → reframing payoff) is baked into the script, now including:
- **⏱ LENGTH FLOOR — audio must never run under 30 min (target 35–45).** A bare "~40 minutes" line does NOT work — NotebookLM ignores a stated target and defaults short (a Let-Them-Theory draft with 6 beats + only "go deep" came out **17 min**). Length is bought with *mandated depth*, so the SPINE now forces it three ways: (1) **8 beats** (not 5–8), (2) a **DEPTH ENGINE** run on every beat — scene → point → a SECOND example/number → an honest "wait—but then…" disagreement → tie back to the phrase-that-pays, and (3) a **non-negotiable LENGTH block**: "3–5 min per beat, MINIMUM 30 min, never signal an ending before the payoff; if short, ADD an example — never skip a beat." Also tell the user to set NotebookLM's Customize length to **"Longer"**, and **regenerate if the audio comes back < 30 min**.
- **COMPACT vs. depth trade-off** — NotebookLM's *Customize* box has a character limit and silently **cuts long prompts off mid-sentence** (the first Sway draft truncated). The depth machinery costs chars, so keep the whole block **~2.5–3.5k chars**: beats are ONE terse sentence each (NotebookLM expands them), drop the generic numbered STRUCTURE list once the ANGLE already spells out the cold-open/thesis/beats/counterpoint/payoff (redundant), and put the LENGTH + no-fabrication rules where they survive. (Verified: a 2.5k and a 3.4k block both generated without truncation.)
- **Storytelling style (user loves the master-keynote / "Story Theater" approach):** every case told in present tense, drop the listener into the scene with one sensory detail, voice the people, THEN land the point; one recurring *phrase-that-pays*; one honest "wait — but then…" turn per beat. Do NOT name any storytelling guru in the prompt (avoids the model hallucinating about them).
- **No fabrication:** use ONLY facts from the book and real, documented cases; never invent quotes/numbers/studies; if unsure, stay general.
- **No AI signature:** never mention "sources/notebook/documents" or being AI; never break character — two people who read the book. English/US only.

**DEFAULT — Claude authors the angle directly (highest quality).** `make-prompt.js` now writes a scaffold and prints an **AÇI YAZILMADI (AUTHOR)** banner instead of calling a model (the NVIDIA/llama path only runs with `USE_NVIDIA=1`). Claude then authors the bespoke angle — sharper and more book-specific than llama. How Claude does it:
- Pick a **non-obvious lens** (avoid the generic "here are N cool cognitive biases / here's a plot recap" take). Find the one hidden machine that unifies the book.
- Write a **single arguable thesis** (a claim, not a summary), a **mid-thought cold-open line** (no greeting), **8 argued beats** each tied to a concrete named example / number from the book, one **honest counterpoint**, and a **reframing closer**. Keep the DEPTH ENGINE + LENGTH block so the audio clears the 30-min floor.
- Keep beats **visually concrete** (nameable scenes) so the downstream Vox scene generator has imagery to work with.
- Target **35–45 min** (never under 30), fully **English**.
- Overwrite `books/<slug>/prompt.notebooklm.md` keeping the same file layout (English prompt block inside a fenced ``` block + "Next steps" listing audio path, VTT path, and the `make-book.js` command).

> Reference example authored this way: `books/sway/prompt.notebooklm.md` ("Sway", Brafman & Brafman) — lens = *irrationality-as-self-defense*, thesis = "irrational behavior is the mind rationally defending a commitment it already made; loss aversion is the engine," beats grounded in Tenerife/van Zanten, Joshua Bell in the Metro, Bazerman's $20 auction, the Swiss nuclear-waste study, Knutson's fMRI.

### Step 1 — build the video (`scripts/make-book.js`)
```
node scripts/make-book.js --slug=<slug> --title="Book" --author="Author" --genre=psychology
```
Audio auto-detected at `public/audio/<slug>.(m4a|mp3)`, VTT at `public/captions/<slug>.vtt`. Runs the chain above (steps are numbered incl. 4.1 clean-vtt and 8 thumbnail-still; the publish-pack steps are `optional:true` so a thumbnail/still hiccup never fails the build). Useful flags: `--skip-images`, `--skip-plan` (keep a hand-directed `config.vox.json`), `--use-llm` (wake NVIDIA for this run), `--no-llm`, `--until=<sec>`, `--audio=`, `--vtt=`.

Helper scripts added for the publish pack: `scripts/clean-vtt.js <in.vtt> <out.vtt>` (YouTube-safe CC), `scripts/dl-render.js <renderId> <out-name> <localPath>` (download a finished Lambda render from S3).

---

## Composition Pipeline

```
Root.tsx
  └─ <Composition id="A-Fate-So-Cold-Amanda-Foody" component={IntroMainVideo}>
       ├─ <Sequence from={0} durationInFrames={introDurationInFrames}>
       │    └─ <Video src={staticFile(introVideo)} />          ← MP4 intro clip
       └─ <Sequence from={introDurationInFrames}>
            └─ <SceneBasedBook config={mainConfig}>
                 ├─ <CinematicSceneManager config={sceneConfig}>

---

## Long-Form Rendering & Stability (v4 / React 19)

Rendering videos longer than 15 minutes (or with high asset density) requires special guardrails to prevent React tree corruption.

### 1. The React 19 Passive Effect Crash
- **Symptom**: `recursivelyTraversePassiveMountEffects` error (React-internal crash).
- **Root Cause**: Asynchronous `fetch` in `useEffect` (e.g., Lottie JSON loading) that completes after a component has already been unmounted by the Remotion frame ticker.
- **Permanent Fix**: Replace dynamic Lottie JSON fetching with purely procedural SVG animations (procedural Lottie variants) or pre-bundled assets.

### 2. Local Micro-Chunking Strategy
- **Workflow**: Never render a long video in a single 2-hour Chromium session. Instead, use a batch script (`local_chunk_renderer.js`).
- **Optimal Chunk Size**: **400 frames per chunk**. This is the safety limit found for this project's asset complexity.
- **Automation**:
  ```bash
  # Renders chunks sequentially (0-399, 400-799, etc.) 
  # Automatically generates parts.txt for FFmpeg merging.
  node local_chunk_renderer.js
  ```
- **Final Merge**: Use FFmpeg concat (copy mode) to assemble the fragments instantly.

---

                 │    ├─ <CinematicSceneRenderer> per active scene
                 │    └─ <TransitionOverlay> during transitions
                 ├─ <Audio src={staticFile(audioFile)} />
                 ├─ <AnimatedCaption captions={...} style="karaoke" />
                 └─ <YPPEnhancementLayer />
```

**Duration is calculated dynamically** in `calculateMetadata`:
```ts
durationInFrames = introFrames + audioFrames   // both at 24 fps
```

---

## Types (`src/types/scene.ts`)

### AnimationType (50+ options)
Cinematic camera movements used in CinematicSceneRenderer:

| Category | Examples |
|---|---|
| Classic | `kenburns`, `parallax`, `dolly`, `orbit`, `whipPan`, `rackFocus`, `fade`, `slide`, `zoom`, `rotate`, `spotlight` |
| Zoom variants | `zoomBounce`, `zoomPulse`, `zoomElastic`, `zoomPop`, `zoomBreath` |
| Pan variants | `panDrift`, `panBounce`, `panSway`, `panFloat`, `panCircle`, `panWave`, `panGlide` |
| Rotate variants | `rotateSwing`, `rotateSpin`, `rotateWobble`, `tiltShift`, `rotateCarousel` |
| Combo | `zoomPan`, `spiralZoom`, `tiltZoom`, `bouncePan`, `swayZoom`, `driftRotate` |
| Dynamic | `pushInTilt`, `revealSlide`, `breathingFocus`, `heartbeat`, `wobbleZ`, `flyIn`, `quake`, `floatUp`, `sinkDown`, `cinematicPan` |
| CapCut style | `glideIn`, `pullBack`, `gentleRock`, `zoomSnap`, `softBounce`, `tiltDrift`, `horizonShift`, `verticalReveal`, `slowSpin`, `breatheAndPan` |

### TransitionType (19 options)
`crossfade` · `wipe` · `zoom` · `blur` · `glitch` · `filmBurn` · `whiteFlash` · `rotate` · `circleWipe` · `pixelate` · `colorShift` · `slide` · `morph` · `spiral` · `pushSlide` · `diagonalWipe` · `blinds` · `pageTurn` · `gridReveal` · `none`

### Key Interfaces

```ts
interface Scene {
  id: string;
  startTime: number;   // seconds
  endTime: number;     // seconds
  assets: SceneAsset[];
  animations: SceneAnimation[];
  transition?: TransitionEffect;
  colorGrade?: { brightness, contrast, saturation, temperature };
  filmGrain?: { enabled, amount };
  vignette?: { enabled, intensity };
}

interface SceneAsset {
  type: 'svg' | 'image' | 'video';
  path: string;        // relative to public/
  position: { x, y }; // 0–100 (%)
  scale: number;
  opacity: number;
  zIndex: number;
  rotation?: number;
  depth?: number;      // for parallax layers
}

interface SceneConfig {
  scenes: Scene[];
  defaultTransition?: TransitionEffect;
  fps?: number;
  globalFilmGrain?: boolean;
  globalVignette?: boolean;
  cinematicBars?: boolean;  // 2.39:1 letterboxing
}
```

---

## Themes (`src/themes/index.ts`)

Genre string → Theme object. Genre is normalised to lowercase, punctuation stripped.

| Theme Key | Genres Mapped | Notable Colors |
|---|---|---|
| `mystery` | mystery, thriller, crime | purple accent `#9f7aea` |
| `horror` | horror, gothic, dark | red accent `#e53e3e`, deep black bg |
| `romance` | romance, drama, love | pink accent `#ec4899` |
| `scifi` | scifi, fantasy, science fiction | cyan accent `#64ffda` |
| `selfhelp` | selfhelp, business, motivational, psychology | gold accent `#ecc94b` |
| `history` | history, biography, historical | warm tan accent `#c9a66b` |

Theme shape:
```ts
interface Theme {
  background: { gradient: [string, string]; particleColor: string };
  text: { primary, secondary, accent };
  caption: { backgroundColor, textColor, highlightColor };
  effects: { glowColor, shadowIntensity };
}
```

---

## ParticleBackground (`src/components/ParticleBackground.tsx`)

### BackgroundVariant options (22 total)
`snow` · `rain` · `stars` · `bubbles` · `dust` · `fireflies` · `confetti` · `bokeh` · `shootingStars` · `lightRays` · `waves` · `pulseRings` · `glitter` · `leaves` · `gridDots` · `speedLines` · `floatingOrbs` · `geometric` · `binary` · `hearts` · `floatingShapes` · `motionLines` · `none`

### Props
```tsx
<ParticleBackground
  theme={theme}
  particleCount={50}     // overridden by variant
  seed="unique-string"   // for deterministic randomness
  variant="stars"
/>
```

**Particle counts by variant:** `stars/dust/glitter` → 150, `rain/speedLines` → 100, `bokeh/floatingOrbs/pulseRings` → 25, other → particleCount prop.

---

## AnimatedCaption (`src/components/AnimatedCaption.tsx`)

```tsx
<AnimatedCaption
  captions={captions}        // Caption[] from parseSRT()
  theme={theme}
  style="karaoke"            // 'karaoke' | 'subtitle' | 'word-by-word'
  position="bottom"          // 'top' | 'center' | 'bottom'
  fontSize={48}
  offset={-1.8}              // seconds – fine-tune sync with audio
/>
```

Captions are parsed from SRT via `parseSRT(srtContent)` in `src/utils/srtParser.ts`.

---

## Effect Components (`src/components/effects/`)

All exported from `effects/index.ts`. Import:
```ts
import { AnimatedText, GlitchText, ParticleExplosion } from '../components/effects';
```

| Component | Description |
|---|---|
| `AnimatedText` | Letter-by-letter spring entrance |
| `BubblePopText` | Text with emoji bubble pop effect |
| `PoppingText` | Scale-pop word animation |
| `FloatingChip` | Pill/badge UI element floating in |
| `ParticleExplosion` | Burst of particles from a point |
| `PulsingText` | Breathing scale pulse on text |
| `GlitchText` | RGB-shift glitch on text |
| `CircularProgress` | Animated circular progress ring |
| `PixelTransition` | Pixel dissolve entrance |
| `ParallaxPan` | Multi-layer parallax scroll |
| `LiquidWave` | SVG wave fill animation |
| `TypewriterQuote` | Char-by-char quote with blinking cursor |

---

## Transition Selector (`src/utils/transitionSelector.ts`)

```ts
import { selectBalancedTransition, selectBalancedAnimation, getRandomDuration } from '../utils/transitionSelector';

// Auto-picks transitions without repeating, balancing smooth/dramatic/creative pools
const transition = selectBalancedTransition(usedTransitions, sceneIndex);
const animation  = selectBalancedAnimation(usedAnimations, sceneIndex);
const duration   = getRandomDuration(4, 8); // seconds
```

**Transition pools:**
- Smooth: `crossfade`, `blur`, `zoom`
- Dramatic: `whiteFlash`, `glitch`, `filmBurn`
- Creative: `rotate`, `circleWipe`, `pixelate`, `colorShift`, `slide`, `wipe`

**Animation pools:**
- Slow: `kenburns`, `dolly`, `orbit`
- Fast: `zoom`, `whipPan`, `rotate`
- Subtle: `rackFocus`, `parallax`, `spotlight`, `fade`, `slide`

---

## Production JSON Structure (`production-*.json`)

This is the `SceneConfig` JSON passed to `SceneBasedBook` as `sceneConfig`:

```json
{
  "scenes": [
    {
      "id": "scene-1",
      "startTime": 0,
      "endTime": 8.5,
      "assets": [
        {
          "type": "image",
          "path": "images/scene-1.jpg",
          "position": { "x": 50, "y": 50 },
          "scale": 1.0,
          "opacity": 1,
          "zIndex": 1
        }
      ],
      "animations": [
        { "type": "kenburns", "easing": "ease-in-out" }
      ],
      "transition": { "type": "crossfade", "duration": 1.5 },
      "colorGrade": { "brightness": 1.05, "contrast": 1.1, "saturation": 1.2 },
      "filmGrain": { "enabled": true, "amount": 0.12 },
      "vignette": { "enabled": true, "intensity": 0.4 }
    }
  ],
  "globalFilmGrain": false,
  "globalVignette": false,
  "cinematicBars": false
}
```

Assets must be placed in `public/` (served via `staticFile()`). Typical path: `public/images/scene-1.jpg` → referenced as `"images/scene-1.jpg"`.

---

## Common Dev Commands

```powershell
# Start Remotion Studio (hot-reload preview)
cd "c:\Users\savas\Cursor\Remotion\test"
npm run dev          # runs: remotion studio

# Render a composition
npx remotion render A-Fate-So-Cold-Amanda-Foody out/video.mp4 `
  --codec=h264 `
  --hw-accel=auto `
  --concurrency=1

# Bundle (optional, for production)
npm run build        # runs: remotion bundle
```

---

## Multi-Worker GitHub Actions Render Pool & Sequential Queue Protocol

The project operates a dedicated **Multi-Worker GitHub Actions render pool** (10 independent worker accounts, 20,000 free minutes/month total) to offload all video rendering workloads. The primary codebase repo (`sates52/Remotion-test`) **never** runs render jobs.

### 👥 Active Worker Pool (Round-Robin Rotated)
- **Worker 1**: `@sates52ko` ➔ `sates52ko/Remotion-render` (2,000 min/mo)
- **Worker 2**: `@goodbooksummary-a11y` ➔ `goodbooksummary-a11y/Remotion-render` (2,000 min/mo)
- **Worker 3**: `@ahmetbahadir79-wq` ➔ `ahmetbahadir79-wq/Remotion-render` (2,000 min/mo)
- **Worker 4**: `@berilasal099-byte` ➔ `berilasal099-byte/Remotion-render` (2,000 min/mo)
- **Worker 5**: `@canek65` ➔ `canek65/Remotion-render` (2,000 min/mo)
- **Worker 6**: `@cansukilic134-cyber` ➔ `cansukilic134-cyber/Remotion-render` (2,000 min/mo)
- **Worker 7**: `@konusarakogrenduru-web` ➔ `konusarakogrenduru-web/Remotion-render` (2,000 min/mo)
- **Worker 8**: `@konusarakogrensiniflar-ctrl` ➔ `konusarakogrensiniflar-ctrl/Remotion-render` (2,000 min/mo)
- **Worker 9**: `@labsnarrative-coder` ➔ `labsnarrative-coder/Remotion-render` (2,000 min/mo)
- **Worker 10**: `@gulbendeniz0102-ai` ➔ `gulbendeniz0102-ai/Remotion-render` (2,000 min/mo)
- **Registry & Rotation**: Stored in `render-accounts.json`. Dispatches automatically rotate across workers (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 ➔ 8 ➔ 9 ➔ 10 ➔ 1).
- **Onboarding Guide for New Workers**: Whenever the user asks for new account creation steps, reference and present [NEW_RENDER_ACCOUNT_GUIDE.md](file:///c:/Users/savas/Cursor/Remotion/test/NEW_RENDER_ACCOUNT_GUIDE.md).

### 🚦 Sequential Render Queue (Kuyruk Yöneticisi)
When producing multiple books or running batch renders, **always use the sequential queue** so jobs run one-by-one, wait for completion, auto-download the resulting `out/<slug>.mp4`, and proceed cleanly to the next video:

```bash
# Add one or more videos to the queue:
node scripts/render-queue.js --add=single-dad-dilemma,the-wedding-people --method=github

# Run the queue sequentially (dispatches, monitors, downloads, rotates workers):
node scripts/render-queue.js --run

# View live queue status and completion history:
node scripts/render-queue.js --status

# Add a single video and immediately run until completion:
node scripts/render-queue.js --slug=single-dad-dilemma --run-now --method=github
```

### 🎬 Single-Video Direct Render Commands
```bash
# GitHub Actions with auto worker rotation and wait + auto-download:
node scripts/render.js --slug=<slug> --method=github --wait

# GitHub Actions background dispatch only:
node scripts/render.js --slug=<slug> --method=github

# Specify a specific worker:
node scripts/render.js --slug=<slug> --method=github --worker=worker2

# Default local micro-chunk render (400-frame chunks):
node scripts/render.js --slug=<slug> --method=local

# AWS Lambda render:
node scripts/render.js --slug=<slug> --method=lambda
```

---

## Local Rendering & Chunking (Long Form Videos)

For videos >15 minutes (typically 20,000+ frames), Chrome headless will leak memory locally and eventually crash with `Exit Code 1` / `Maximum call stack size exceeded`.

**The Solution: Micro-Chunking**
1. Use the `local_chunk_renderer.js` script to process the video in chunks of **400 frames** (or `node scripts/render.js --method=local`).
2. **CRITICAL Remotion v4 CLI change**: Do not use `--from` and `--to`. These flags are ignored and will cause OOM crashes! ALWAYS use `--frames=start-end`.
   - Correct: `npx remotion render MyComp out.mp4 --frames=0-399 --concurrency=1`
   - Incorrect: `npx remotion render MyComp out.mp4 --from 0 --to 399`
3. Concatenate the segments using standard `ffmpeg`.

---

## Lambda Scaling & Infrastructure

For long (~30 min) or complex videos, the following escalated specifications are required to prevent stalls:

### Recommended Specs
- **Memory**: `2048 MB` (2GB) – Use for complex visual effects/particles.
- **Timeout**: `900 sec` (15 min) – AWS max; required for large chunk merges.
- **Disk**: `10240 MB` (10GB, AWS max) – **MANDATORY for full-length (~30-40 min) book renders.** The default/2048MB disk fills during the final combine step and throws `ENOSPC: no space left on device` at ~89% — after all frames already rendered (≈$2.6 wasted per failed attempt). The chunk `.ts`/`.mp4` fragments + final MP4 must all fit on ONE lambda's ephemeral disk during combine.

### Deployment (CLI Flags)
Due to potential configuration file TypeErrors, use CLI flags to force specs:
```powershell
npx remotion lambda functions deploy --memory=2048 --disk=10240 --timeout=900 --region=us-east-1
# → creates remotion-render-<ver>-mem2048mb-disk10240mb-900sec
```

### Full Lambda render flow (verified working for Vox books)
```powershell
# 1. token (12h, MFA): node get_mfa_token.js "<MFA_ARN>" <6-digit>
# 2. deploy 10GB-disk function (once): see above
# 3. deploy site with current code (regen books.generated.ts first via make-book):
npx remotion lambda sites create src/index.ts --site-name=<slug>-vox-v1 --region=us-east-1
# 4. render (props are baked into the composition's defaultProps — no --props needed):
npx remotion lambda render <serveUrl> Vox-<slug> `
  --function-name=remotion-render-4-0-438-mem2048mb-disk10240mb-900sec `
  --region=us-east-1 --codec=h264
```
Composition id is `Vox-<slug>` (registered by `gen-books-registry.js` into `src/books.generated.ts`). A 35.9-min render ≈ 51.7k frames, ~150 concurrent λ, ≈ $2.6-3 and ~10 min wall-clock. Note: the `.env` STS creds must be fresh (12h) — an expired session token throws `ExpiredToken` on every lambda call.

### Cleanup
Avoid conflicts by removing older specs of the same version:
```powershell
npx remotion lambda functions rm <old-function-name> --region=us-east-1 -y
```

### ⚠️ The 900s main-function ceiling → SEGMENT long renders (VERIFIED)
A full-length Vox book (~36 min, **30fps**, ≈64.5k frames) **cannot** finish in a single `lambda render`: the **main orchestrator function** is itself capped at AWS Lambda's **900s absolute max** (can't be raised). It timed out at ~90% with "The main function timed out after 899999ms / chunks missing" even with the 10GB-disk function (~$3.6 wasted). Frames were still rendering when the coordinator died.

**The working recipe: render in FRAME-RANGE SEGMENTS, then ffmpeg-concat.** Each segment is its own `lambda render` with its own fresh 900s window.
```powershell
# ~64.5k frames → 3 segments of ~21.5k each (each finished in ~425-500s, ~$0.90 each):
npx remotion lambda render <serveUrl> Vox-<slug> --function-name=<disk10240 fn> --region=us-east-1 `
  --codec=h264 --frames=0-21521      --out-name=<slug>-seg1.mp4
npx remotion lambda render <serveUrl> Vox-<slug> --function-name=<disk10240 fn> --region=us-east-1 `
  --codec=h264 --frames=21522-43043  --out-name=<slug>-seg2.mp4
npx remotion lambda render <serveUrl> Vox-<slug> --function-name=<disk10240 fn> --region=us-east-1 `
  --codec=h264 --frames=43044-64565  --out-name=<slug>-seg3.mp4
```
- Run segments **sequentially** (each uses ~150 λ; 3× at once can exceed the account concurrency limit).
- `lambda render` does **NOT** auto-download — output stays in S3 at `renders/<renderId>/<out-name>`. Download with the helper: `node scripts/dl-render.js <renderId> <out-name> out/<slug>-segments/segN.mp4` (uses `@aws-sdk/client-s3` from the pnpm store + `.env` creds).
- Concat (identical codec params → stream copy, no re-encode):
```powershell
# out/<slug>-segments/parts.txt: file 'seg1.mp4' / file 'seg2.mp4' / file 'seg3.mp4'
ffmpeg -y -f concat -safe 0 -i out/<slug>-segments/parts.txt -c copy out/<slug>.mp4
```
Result for Sway: 1920×1080 h264 30fps + AAC, 35:52, 7.27GB. Segment renders ≈ **$2.76 total** (vs. two whole-render failures that burned ~$6.3 first).

### Troubleshooting
- **`ENOSPC: no space left on device`** at ~89% (after frames rendered): main-lambda disk too small during combine → deploy function with `--disk=10240`.
- **`The main function timed out after 899999ms` / "chunks missing"**: render exceeds the 900s main-function ceiling → **segment by `--frames` and concat** (see above). Raising memory alone rarely saves a ~36-min render.
- **`ExpiredToken`** on every lambda call: `.env` STS creds stale → refresh with `node get_mfa_token.js "<MFA_ARN>" <code>` (12h).
- **Stall at X%**: renderer OOM (Increase RAM).
- **Zod Errors**: pinning `zod` to `4.3.6` is mandatory for Lambda compatibility.

---

## Adding a New Composition

1. Create `src/compositions/MyVideo.tsx` – define component + Zod schema.
2. Import and add `<Composition>` in `src/Root.tsx`.
3. For dynamic duration, use `calculateMetadata` to read audio/video durations.

**Template:**
```tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

export const myVideoSchema = z.object({ title: z.string() });
export type MyVideoProps = z.infer<typeof myVideoSchema>;

export const MyVideo: React.FC<MyVideoProps> = ({ title }) => (
  <AbsoluteFill style={{ backgroundColor: '#000', color: '#fff' }}>
    {title}
  </AbsoluteFill>
);
```

---

## Adding a New Scene / Updating SceneConfig

To add a scene to an existing video:
1. Place image in `public/images/`.
2. Add an entry to the `scenes[]` array in the corresponding `production-*.json`.
3. Set `startTime` / `endTime` to match the audio timestamps (seconds).
4. Choose an `AnimationType` from the list above.
5. Choose a `TransitionType` for the scene boundary.

---

## Adding a New Background Variant

1. Open `src/components/ParticleBackground.tsx`.
2. Add the new variant name to `BackgroundVariant` union type.
3. Add a `case 'myVariant':` inside the `switch` in `renderVariantLayers()`.
4. Return an SVG element (circle, line, path, etc.) using `frame`, `p.x`, `p.y`, `p.speed`, etc.

---

## Adding a New Animation Type

1. Add name to `AnimationType` in `src/types/scene.ts`.
2. Add `case 'myAnim':` inside the `switch` in `CinematicSceneRenderer.tsx` → `CinematicAnimatedAsset`.
3. Set `transform` and/or `filter` strings using `interpolate`, `spring`, `sceneProgress`, `frame`.
4. Optionally add to the relevant pool in `transitionSelector.ts`.

---

## Key Remotion APIs Used

```ts
import {
  AbsoluteFill, Sequence, Audio, Video, Img,
  useCurrentFrame, useVideoConfig, staticFile,
  interpolate, spring, random,
  getAudioDurationInSeconds, getVideoMetadata,
} from 'remotion';
```

- `useCurrentFrame()` → current frame (0-indexed)
- `useVideoConfig()` → `{ fps, width, height, durationInFrames }`
- `interpolate(value, inputRange, outputRange, options)` → linear mapping with clamping
- `spring({ frame, fps, from, to, config })` → physics spring animation
- `random(seed: string)` → deterministic 0–1 random (for consistent particle positions across renders)
- `staticFile(path)` → resolves `public/path` to correct URL for both Studio and render

---

## File Locations Quick Reference

| Task | File |
|---|---|
| Register new composition | `src/Root.tsx` |
| Scene data (JSON) | `production-*.json` (project root) |
| SRT captions | `src/data/new-srt.ts` |
| Particle backgrounds | `src/components/ParticleBackground.tsx` |
| Animation logic | `src/components/CinematicSceneRenderer.tsx` |
| Transition overlays | `src/components/CinematicSceneManager.tsx` |
| Transition auto-select | `src/utils/transitionSelector.ts` |
| Caption parsing | `src/utils/srtParser.ts` |
| Theme definitions | `src/themes/index.ts` |
| Type definitions | `src/types/scene.ts` |
| Reusable effects | `src/components/effects/` |
| Shorts components | `src/components/shorts/` |
| Shorts types | `src/types/shorts.ts` |
| Shorts composition | `src/compositions/BookRecommendationShort.tsx` |

---

## Shorts / Reels Sub-Project

Vertical short-form videos (1080×1920, 30 fps) for book recommendations. Lives inside the same project but uses its own components under `src/components/shorts/`.

### Architecture

```
src/
  types/shorts.ts                       ← BookInfo, Segment, ShortsConfig types
  components/shorts/
    ShortsLayout.tsx                     ← Vertical full-screen container + gradients
    FaceVideoSegment.tsx                 ← Face-cam video: vertical default, horizontal→blur bg
    BookInfoOverlay.tsx                  ← Animated book title/author/description overlay
    ShortsTransition.tsx                 ← Quick transitions (whiteFlash, glitch, zoom, etc.)
    index.ts                            ← barrel export
  compositions/
    BookRecommendationShort.tsx          ← Main composition: Sequence per segment + transitions
```

### Segment Types
- `hook` — intro/energy segment with overlay text
- `book` — book recommendation with `BookInfo` overlay (title, author, description, optional cover)
- `outro` — closing CTA segment

### Video Orientation
- **Vertical** (default): `object-fit: cover` fills the frame
- **Horizontal** (`isHorizontal: true`): blurred + scaled background + centred foreground

### Asset Paths
- Videos: `public/shorts/videos/segment-N.mp4`
- Covers: `public/shorts/covers/` (optional)
- Music: `public/shorts/music/bg-music.mp3`

### Adding a New Shorts Video
1. Place segment videos in `public/shorts/videos/`.
2. Edit `defaultProps` in `Root.tsx` for the new composition (or create a new `<Composition>`).
3. Set segment `type`, `videoFile`, and `book` data.
4. Duration is auto-calculated from video metadata via `calculateMetadata`.

---

## Render Orchestration & Multi-Worker GitHub Pool

To prevent burning personal GitHub Actions quotas and maintain a dedicated codebase, rendering is decoupled into a dedicated 7-worker cluster:

### Cluster Architecture (14,000 min/mo)
- **Codebase Repository**: `sates52/Remotion-test` (`god-mode` branch) — Pure code, zero Actions render workload.
- **Worker 1**: `@sates52ko` ➔ `sates52ko/Remotion-render` (2,000 min/mo)
- **Worker 2**: `@goodbooksummary-a11y` ➔ `goodbooksummary-a11y/Remotion-render` (2,000 min/mo)
- **Worker 3**: `@ahmetbahadir79-wq` ➔ `ahmetbahadir79-wq/Remotion-render` (2,000 min/mo)
- **Worker 4**: `@berilasal099-byte` ➔ `berilasal099-byte/Remotion-render` (2,000 min/mo)
- **Worker 5**: `@canek65` ➔ `canek65/Remotion-render` (2,000 min/mo)
- **Worker 6**: `@cansukilic134-cyber` ➔ `cansukilic134-cyber/Remotion-render` (2,000 min/mo)
- **Worker 7**: `@konusarakogrenduru-web` ➔ `konusarakogrenduru-web/Remotion-render` (2,000 min/mo)

### Workflow & Rotation
- Configuration: `render-accounts.json`
- Dispatch & Monitor: `node scripts/render.js --slug=<slug> --method=github [--wait]`
- Sequential Multi-Video Queue: `node scripts/render-queue.js --add=<slug1>,<slug2> --run --method=github`
- Automatic Round-Robin worker selection rotates `worker1` ➔ `worker2` ➔ `worker3` ➔ `worker4` ➔ `worker5` ➔ `worker6` ➔ `worker7`.

---

## Antidote Animation Engine (`src/engines/antidote/`)

Pure vector 2D flat-minimal character and scene animation engine for high-retention book summary videos:
- **Zero WebGL overhead:** 100% SVG and CSS transforms rendered deterministically at 1080p @ 24fps.
- **Strict Safe-Zones:**
  - **Top:** Safe zone / HUD (timeline, progress).
  - **Center:** Character, handprops, kinetic typography, metaphors.
  - **Bottom:** Subtitle / captions overlay.

### Character Micro-Reactions & Emotions
Characters support dynamic head-anchored micro-reactions configured in `SceneSpec.characters[n]`:
```ts
emotion?: "none" | "lightbulb" | "sweat" | "question" | "shock" | "fire";
emotionAt?: number; // frame relative to character entrance (defaults to 8)
```
- `"lightbulb"`: Eureka / Aha! insight moment with glowing bulb and radiating amber light rays.
- `"sweat"`: Cognitive bias / anxiety / stress trigger with droplet pop and subtle shiver jitter (`jitterX`).
- `"question"`: Mystery / paradox with staggered floating bouncy question marks.
- `"shock"`: Sudden realization / paradigm shift with sharp comic shock spikes radiating from head.
- `"fire"`: Extreme passion / unstoppable discipline with dynamic licking flame on head crown.

### Living Gaze & Focus Tracking
Characters dynamically track scene objects, breaking the 4th wall or looking at each other:
```ts
lookAt?: "partner" | "motif" | "callout" | "camera" | "ahead" | "viewer" | "text" | "prop" | "heldProp" | "hand" | "wander" | { x: number; y: number };
```
- `"viewer"` / `"camera"`: Looks straight into the viewer's eyes (breaking 4th wall).
- `"text"` / `"callout"`: Head and 2D pupils lock onto the active kinetic headline / callout box.
- `"heldProp"` / `"hand"`: Pupils shift downward and inward to inspect what's held in hands (e.g. `holds: "book"`).
- `"wander"`: Contemplative drifting gaze with organic micro-saccades.
- `"partner"`: Two characters orient gaze and head tilt directly toward each other's eye line.
- **Biomechanical Life:** Every character features 2D pupil translation (`gazeX`, `gazeY`), catchlight reflection highlights, and rhythmic sinusoidal chest breathing (`Torso` respiratory scale).

### Retention HUD & Chapter Tracker (`RetentionHUD.tsx`)
Top safe-zone minimal progress timeline and insight trackers designed to slash viewer drop-off:
- **Timeline:** 4px top progress bar filled with accent color, glowing tip dot, and vertical scene milestone divider ticks.
- **Insight Pill:** Glassmorphism badge (`INSIGHT 01 / 07 • TOPIC`) with pulsing status dot on top-left.
- **Watermark:** Minimal mono tracking title on top-right.
- **Auto-Hide:** Automatically fades to 0% opacity during monumental `chapterCard` shots to preserve cinematic focus.
- **Config:**
  ```ts
  // Book-level meta:
  hud?: { enabled?: boolean; accent?: string; title?: string; showProgress?: boolean; showBadge?: boolean; }
  // Scene-level override:
  hud?: { badge?: string; topic?: string; hidden?: boolean; }
### Vector Handprop Collection (`handprops.tsx`)
Characters can hold 13 pure vector props with automatic arm counter-rotation (`rotate(-(armRot + elbowRot))`) keeping items naturally oriented during gestures:
- `holds?: "none" | "coffee" | "phone" | "book" | "shield" | "trophy" | "hourglass" | "sword" | "target" | "magnifier" | "wallet" | "gift" | "zap"`
  - `"shield"`: Defensive risk management, protecting the downside (*Skin in the Game*, *Antifragile*).
  - `"hourglass"`: Time arbitrage, urgency, patience (*Psychology of Money*, *Deep Work*).
  - `"target"`: Concentric target with bullseye arrow, ruthless focus (*The ONE Thing*, *Essentialism*).
  - `"sword"`: Steel blade with purple hilt, courage, decisive action (*War of Art*, *Can't Hurt Me*).
  - `"trophy"`: Gold cup with star emblem, mastery, winning the long game (*Grit*, *Atomic Habits*).
  - `"magnifier"`: Detailed magnifying glass, micro-habits, rigorous analysis.
  - `"wallet"`: Stitched leather wallet with gold coin, personal finance discipline.
  - `"gift"`: Wrapped gift package with bow, delivering value (*Give and Take*).
  - `"zap"`: Dual-step lightning bolt, instant momentum, habit trigger.
- **Natural Look-At Coupling:** Pair `holds: "<prop>"` with `lookAt: "heldProp"` to make the character naturally glance down at the object in their hand.

### Hypnotic Vector Metaphors (`motifs.tsx`)
Rich, dynamic philosophical and strategic visual metaphors for high audience retention:
- `props: [{ type: "dominoCascade" | "icebergDepth" | "funnelTrap", ... }]`
  - `"dominoCascade"`: 6-tier geometric domino cascade with spring-eased collisions, shock rings, arching compound growth curve, and final explosive starburst. Use for compound effect, small habits, exponential breakthroughs (*Atomic Habits*, *Compound Effect*).
  - `"icebergDepth"`: Dynamic bobbing waterline, 10% visible mountain peak, scanning sonar beam, and deep 90% submerged crystalline iceberg revealing hidden foundation layers ("HABITS", "FAILURES", "90% SACRIFICE"). Use for mastery, iceberg of success, resilience (*Grit*, *Outliers*).
  - `"funnelTrap"`: Wide conical funnel receiving 100+ chaotic bouncing distraction particles, an animated laser sorting throat, and a single pure concentrated golden diamond dropping onto the bullseye target. Use for ruthless prioritization, noise filtering, finding the one thing (*The ONE Thing*, *Essentialism*).
- **Presenter Coupling:** Pair metaphor props with characters using `action: "point"`, `lookAt: "motif"`, and fitting emotions (`emotion: "lightbulb" | "shock" | "fire"`).

---

## Git & Deployment Protocol (Strict Rule)
- **DO NOT push to render worker remotes (`render-worker-*`) during regular/core work.**
  - Workers receive code automatically during render dispatch.
  - Intermediate pushing to worker repos is redundant and slows down development.
- **Push ONLY to the main GitHub repository (`origin`)** when updating core files, schemas, scripts, or book configs.
