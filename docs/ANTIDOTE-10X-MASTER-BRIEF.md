# Antidote 10x — Master Handoff Brief, YPP Guardrails & Remotion Library Catalog

> **Branch / Worktree:** `dev/antidote-v2` @ `C:\Users\savas\Cursor\Remotion\wt-antidote-v2` (HEAD `df565aea`, 7 commits ahead of `origin/god-mode` — not yet merged to `origin/god-mode`).
> **Purpose:** Single durable memory file for any fresh development session continuing Antidote 10x, YPP-proofing, and Remotion visual-library upgrades.

---

## 1. North Star & Mission

1. **Unquestionable YPP Approval & Demonetization Immunity:** Beat Google's S-CTS detectors and human reviewers across all five axes: visual uniqueness, macro layout variety, transcript originality, metadata/pack uniqueness, and upload pacing.
2. **10x Storytelling Clarity:** A muted viewer must immediately read the book's concepts, stakes, and mechanics (`WRONG 0`, `DEAD 0`, `ADDS & EXPLAINS >= 85%`) with zero visual-world clashing (**Single-World Law**).
3. **Zero Template Fatigue:** Every book feels like its own bespoke visual universe — never a reused slideshow, never repetitive red circles over Flux images, and never boxed-card overload.

---

## 2. Non-Negotiable YPP & Repo Invariants

*(Sources: `YPP_HISTORY.md`, `CLAUDE.md`, `data/quality-policy.json`, `docs/AGENT-OPERATING-CONTRACT.md`)*

- **YPP History & Appeal Freeze:** Approved `2026-08-11` on v1; rejected `2026-11-17` on re-review for *"generic or repetitive content"* (*inauthentic content*). Appeal opened `2026-11-23`. **While the appeal runs, NOTHING on the live YouTube channel is deleted or edited.**
- **Upload Pace (`data/quality-policy.json`):** `maxPerDay: 1`, `maxPerWeek: 7` (enforced by `scripts/upload-pace.js` + `package-youtube.js`).
- **AI Disclosure:** `Altered content = Yes` on every video, recorded in `youtube-meta.json` (`NO_ALTERED_CONTENT_RECORD` lint).
- **Producer's Note:** Mandatory on every upload (`NO_PRODUCER_NOTE`). Recorded via `scripts/producer-note.js`, rendered on screen via polarity-aware `ProducerNote.tsx` + YouTube description — **NEVER written into the NotebookLM audio prompt.**
- **Pack Sameness (`lintPackSameness`):** `sharedRunWords: 8` (no >= 8-word shared description run across packs), `stapleMinPacks: 3`, `maxStapleTags: 2`, `maxStapleHashtags: 1`.
- **Transcript Sameness (`transcript-sameness.js`):** `< 0.6` channel-common 5-word runs per 1000 words (`minWords: 1500`). Every book uses one of 8 `narrative-form`s at Step 0; **a remake MUST be a NEW NotebookLM recording, never old audio under new visuals.**
- **Visual Sameness (`visual-sameness.js`):** Blocking/review bar `< 65%` (`reviewAlike: 0.65`). Antidote 10x target: **`< 48%` cross-book** and **`layout < 55%`**.
- **Blind Mute Test (`data/quality-policy.json`):** Blocking `wrongPer30: 1`, `deadPer30: 5`, target `adds: 0.60` (Antidote 10x target: `WRONG 0`, `DEAD 0`, `ADDS & EXPLAINS >= 85%`). Fresh holdout only; never loosen thresholds or game scores.
- **Audio Rule (2026-11-23):** `meta.sfx` stays OFF by default (pure narration for night listeners).
- **US Market English Invariant:** 100% English videos, captions, thumbnails, titles, descriptions, chapters, and tags (`lint-titles.js --pack` = `YouTube READY`).
- **Child Safety (`CLAUDE.md` Rule 8):** `minorHarm: true` books are Antidote-only, NEVER stage harm/captivity/violence, and force `storybookVector` (zero photoreal Flux).
- **Operational Safety:**
  - Published books in `PUBLISHED_BOOKS.md` are **FROZEN** — never retrofit or re-plan them.
  - Never edit, pull, reset, stash, or clean `C:\Users\savas\Cursor\Remotion\test`.
  - Never run bare `git push` (always `git push origin god-mode` when approved).
  - Never commit `render-accounts.json` or tokens.
  - **NEVER run cleanup** (`render-github-cleanup.js`, `purge-render-branches.js`, `render-purge.js`) without explicit operator command.
  - Heavy renders & stills run **ONLY on GitHub Actions cloud workers** (never heavy local renders; GPU-less headless Chrome -> **NO WebGL shaders**).

---

## 3. Completed Antidote 10x Architecture & Proven Metrics (`dev/antidote-v2` @ `df565aea`)

7 commits ahead of `origin/god-mode`: `ec2c0a9f`, `92d54dea`, `14a843b8`, `ea2da0cd`, `64a6c5f8`, `f1e3b324`, `df565aea`.

- **Single-World Law** (enforced by `scripts/lib/v2-variety-lint.js`): Zero cartoon vector-rig puppets over painted/Flux scenes; `boxed-card <= 20%`; `maxConsecutive <= 2`.
- **19 Visual Storytelling Devices** in `src/engines/antidote/components/`:
  1. `AnnotatedScene` (`bracket` / `underline` / `spotlightMask` / `pin` / `circle`)
  2. `CutoutStage` v2 (`poses`, `connectors`, face-safe tailed speech bubbles)
  3. `EditorialSpread`
  4. `KineticManifesto`
  5. `DecisionTree`
  6. `BalanceScale` (`panDrop = 170`)
  7. `StackReveal`
  8. `CohortGrid`
  9. `TimelineScrub`
  10. `StatSlam`
  11. `DataMatrix`
  12. `VisualEquation` (`arch` / `hex` / `tornPaper` / `filmStrip` / `circle`)
  13. `ComparisonGrid`
  14. `RealAnchorCard`
  15. `LiveInterface` (`calendarTetris` / `notificationFlood` / `chatThread` / `metricBoard`)
  16. `ComicStrip` (`triptych` / `quad2x2` / `asymmetric3`)
  17. `BeforeAfterWipe` (`horizontal` / `diagonal`)
  18. `SpatialJourney`
  19. `ChapterInterstitial`
- **11 Moods** (8 dark + 3 light: `ivoryBroadsheet`, `sageBotanical`, `terracottaStudio`) & **10 Style Packs** in `scripts/lib/style-packs.js` (5 dark / 5 light with strict dark<->light polarity alternation + `storybookVector` for `minorHarm: true`).
- **Macro Layout Grammars:** `layoutGrammar` (`centered`, `editorialLeft`, `cinemaWide`, `splitSpine`), `captionAlign` (`center`, `left`), `artDirection.captions: "minimal"`, `hud: "off"`.
- **YPP Channel Showcase & Tooling:**
  - Book-Native 10x Thumbnails (`Thumbnail.tsx` + `thumbnail-shared.ts` + `Root.tsx` `Thumb-lab`: `editorial-cover-10x`, `split-poster-10x`, `cutout-hero-10x`, `diagram-hook-10x`)
  - Polarity-aware `ProducerNote.tsx`
  - `scripts/lib/v2-narrative-lint.js` (4 deterministic checks: caption duplicate, Phase/Step contradiction, >240f motion drought, face-bubble collision)
  - `scripts/antidote-10x-assets.js` (`--max-calls=45`) + `scripts/antidote-v2-pilot/cutout.py` (`rembg` RGBA + `--grid=2x2`)
  - Step 0 `make-prompt.js` `stylePack` auto-pick + `preview-ready.js` advisory 10x lint row
- **Verified Results:**
  - All 6 unit/regression test suites PASS (`test-antidote-v2.js` 11/11, `test-sfx-optin.js`, `test-producer-note.js`, `test-book-skin.js`, `test-place-continuity.js`, `test-told-scene.js`); scoped strict `tsc` = 0 new errors.
  - Book 3 v2 (*Essentialism*, cloud run `45624912420`, `antidote-10x-essentialism-v2.mp4`): Blind Mute = **`WRONG 0/9`, `DEAD 0/9`, `ADDS & EXPLAINS 9/9`**; `visual-sameness` = **`44.4%`** vs Book 1 & Book 2 (`42.9%` vs Real Antidote, `52.5%` vs Vox, `56.0%–57.2%` vs Old Antidote — down from `77.6%`).
  - 3 Book-Native 10x Thumbnails cloud-rendered (`run 45624992074`) and visually verified.
- **Explicitly Deferred by Operator:** `meta.humanHook` (10–25s optional personal intro clip — deferred *"şimdi değil ilerde"*).

---

## 4. Hard-Won Technical Pitfalls & Engineering Notes

- **NVIDIA Flux (`flux.2-klein-4b`):** Appending `NO_TEXT = ", no text, no letters, no signature, no watermark"` or verbose `artLock` triggers false-positive `CONTENT_FILTERED`. Keep `NO_TEXT = ""` and concise `artLock` (e.g. `"editorial watercolor illustration"`).
- **`test-producer-note.js:59`:** Asserts literal single-line `<ProducerNote note=` inside `src/engines/antidote/index.tsx` — keep single-line JSX invocation.
- **`stills-cloud.js`:** `manifest.extra` requires explicit individual `.png` paths (never a directory); clip jobs require `"frames": []`; CLI is `push --manifest=... --tag=...` and `fetch --tag=... --out=...`.
- **PowerShell 5.1:** Treats `ffmpeg` stderr as an error under `$ErrorActionPreference = "Stop"` — wrap with `cmd /c "ffmpeg ... >nul 2>&1"`.
- **`2x2` Flux Pose Sheets:** Can place multiple figures inside a single quadrant — ALWAYS visually inspect `poses-check.png` before accepting sliced poses.
- **GPU-less GitHub Actions Chrome Runners:** NEVER adopt WebGL shader components (`@remocn/shader-*`, heavy Three.js shaders) without proving SwiftShader render speed; prefer SVG/CSS/Canvas 2D.
- **Resolution/FPS Calibration:** Remocn defaults to `1280x720 @ 30fps`; Antidote production compositions run **`1920x1080 @ 30fps`** — scale default 720p font/element sizes ~1.5x for 1080p.

---

## 5. Master Inspiration & Remotion Component Library Catalog (All 6 Sources)

1. **Local `C:\Users\savas\Cursor\Remotion\blog-to-video_1\blog-to-video`:**
   - *Adopted:* Tactile paper-collage stickers, `EditorialSpread`, edition-based styling.
   - *Still to mine:* `scripts/check.py` claim-to-visual verification (`claims.csv`) & `references/editions.md` recipe structure.
2. **`https://github.com/sarpstar/cinecode`:**
   - *Adopted:* Motion-doctrine / camera-drift rules.
   - *Still to mine:* Camera choreography macros (dolly/pan/orbit) & reference-driven shot pacing templates.
3. **`https://github.com/lemomo-ai/lemo-opuscar`:**
   - *Adopted:* 10 `style-packs.js` worlds.
   - *Still to mine:* Expand to 16–20+ book-native `STYLE.md` visual universes & distinct texture/lighting grammars.
4. **`https://github.com/ersinkoc/AI-Video-Factory`:**
   - *Adopted:* Single-World hybrid routing.
   - *Still to mine:* Factual visual-grounding gate for historical/non-fiction books + structured multi-agent shot-planner automation.
5. **`https://remocn.dev/docs/guides/remotion-component-libraries` (+ `https://remocn.dev/llms-components.txt`, 935 MIT components):**
   - *Already installed in `src/components/remocn/` (12):* `animated-line-chart`, `brush`, `check-list`, `handwrite`, `ink-arrow`, `ink-underline`, `marker-highlight`, `paper-sticker`, `polaroid`, `rolling-number`, `scribble-circle`, `strikethrough-replace`.
   - *Top MIT candidates to evaluate & wire (CPU-safe, NO shaders!):*
     - **Book-Skin Transitions (`Transition.tsx`):** `page-turn`, `paper-tear`, `push-through`, `focus-pull`, `lens-zoom`, `whip-pan`, `halftone-cut`, `iris-wipe`.
     - **Camera & Tactile Storytelling Beats:** `dolly-zoom`, `exploded-view`, `gravity-pile`, `layered-cutout`, `parallax-depth`, `crumple-toss`, `paper-wobble`.
     - **Motion-Graphics & Data Devices:** `venn-merge`, `fourier-sum`, `path-search`, `chord-ring`, `isometric-build`, `analytics-funnel`, `bracket-win`, `duet-split`, `animated-bar-chart`, `bauhaus-build`, `mondrian-split`, `topo-lines`, `flow-field`.
     - **Graphic Looks & Media Collage:** `riso-print`, `blueprint`, `x-ray-scan`, `line-boil`, `fluted-glass`, `frosted-clear`, `screenshot-tour`, `shards-to-grid`, `panel-split`, `up-close`, `shot-answers`.
     - **Agent Tooling:** Free hosted MCP `https://remocn.dev/mcp` (no key), raw `.md` docs, direct JSON registry `https://remocn.dev/r/<name>.json`.
   - *Companion Libraries (copy source without conflict):* **RemotionUI** (`https://remotionui.com`, ~250 MIT, `npx remotion-ui-mcp`), **Remotion Elements** (`https://www.remotion.dev/elements`, 45 official blocks), **snapcn** (`https://snapcn.dev`, 62 free MIT product/terminal/UI frames), **React Video Editor free templates** (`https://www.reactvideoeditor.com/remotion-templates`).
6. **`https://github.com/jacksonwuu/awesome-remotion`:**
   - *Official `@remotion/*` packages:* `@remotion/rough-notation`, `@remotion/layout-utils` (deterministic text measurement & auto-fit to stop clipping/overflow), `@remotion/paths`, `@remotion/shapes`, `@remotion/noise`, `@remotion/motion-blur`, `@remotion/light-leaks`, `@remotion/gsap`.
   - *Community Kits:* `Remotion Bits` (`https://remotion-bits.dev`), `Onda` (`https://onda.video` — Zod-validated motion primitives), `RenderComp Free` (50 MIT templates), `SwiftClip`, `Clippkit`, `cliphou.se` (MIT-0).
   - *High-Value QA, Data, Maps & Agentic Director Repos:* `GroMarketing/remotion-qa` (safe-zone, dead-air, caption readability checks -> upgrade `v2-narrative-lint.js`), `hylarucoder/remotion-bar-race-chart`, `remotion-dev/d3-example`, `hylarucoder/remotion-physics`, `remotion-dev/maplibre-example` (animated maps), `remotion-dev/morph-text`, `remotion-dev/text-warping`, `Vincentwei1021/video-shotcraft`, `Leonxlnx/cinetic`, `calesthio/OpenMontage`.

---

## 6. Prioritized Phase 2 Development Backlog (P0 -> P3)

- **P0 — Production Pipeline Integration & Full-Book Proof:**
  - Merge `dev/antidote-v2` into `origin/god-mode` (only with operator approval).
  - Upgrade `storyboard.js` (`prep`/`merge`/`rules.md`), `plan-antidote.js`, and `make-book.js` so full 30–60 min books automatically author & compile all 19+ Antidote 10x devices, `stylePack` polarity alternation, `layoutGrammar`, and `prompts.10x.json` without manual JSON hand-assembly.
  - Run full-book end-to-end production proof.
- **P1 — Remocn & Awesome-Remotion Visual Leap (`layout < 50%`, Storytelling 10x -> 20x):**
  - Book-skin-bound transitions (`page-turn`, `paper-tear`, `push-through`, `focus-pull`, `halftone-cut`, `whip-pan`) in `Transition.tsx`.
  - Select & adapt 5–8 highest-leverage CPU-safe storytelling primitives (`VennMerge`, `ExplodedView`, `GravityPile`, `CrumpleToss`, `DollyZoom`, `AnalyticsFunnel`/`BarRace`, `UpClose`, animated `MapLibre`/enhanced `SpatialJourney`).
  - Expand `style-packs.js` from 10 -> 16–20 worlds (`lemo-opuscar` + Remocn Graphic Looks) and wire `@remotion/layout-utils` text measurement to guarantee zero overflow.
- **P2 — Automated Visual QA & Character Consistency:**
  - Upgrade `v2-narrative-lint.js` with `remotion-qa`-inspired safe-zone/contrast/text-clipping checks + automated multimodal critique pass on cloud contact sheets.
  - Character identity reference-lock (e.g. Gemini reference-image conditioning once API/plugin is enabled).
- **P3 — Deferred by Operator:**
  - Optional `meta.humanHook` (10–25s creator intro slot — build only when operator approves).
  - Automated YouTube `Altered content = Yes` metadata & Shorts face-presence workflow.

---

## 7. Verification & Definition of Done for Every New Feature

1. All 6 regression suites PASS + scoped `npx tsc --noEmit --strict` = 0 new errors.
2. `v2-variety-lint.js` + `v2-narrative-lint.js` PASS.
3. Cloud-render via `scripts/stills-cloud.js` on GitHub Actions + visual inspection of contact sheets.
4. `visual-sameness.js` `< 65%` bar (`< 48%` target, `layout < 55%`).
5. Fresh Blind Mute Viewer subagent (`WRONG 0`, `DEAD 0`, `ADDS & EXPLAINS >= 85%`).
