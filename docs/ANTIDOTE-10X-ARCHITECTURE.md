# Antidote 10x Architecture — Single-World, Word-Synced, Per-Book Originality

## 1. Core Principle: Single-World Law
Never mix competing visual worlds in the same frame:
- **Realm A (`annotatedScene` / `fullBleedSplit`)**: Bespoke Flux illustration + word-synced spotlights, rising/routed trace beams, and tactile paper-collage stickers (`Caveat`-style italic notes). **Zero flat-vector puppets.**
- **Realm B (`live-story` / `told`)**: Pure vector/paper stage with recurring book cast (`meta.cast`), `continueFromPrev`, speech balloons (`says`), and drawn props. If `bg.image` is used, `emptyStage: true` is mandatory.
- **Realm C (Narrative-Job Diagrams)**: `cohortGrid` (50/50 human silhouette split), `timelineScrub` (chronological rail + loop), `statSlam` (monumental law/ratio bars), `dataMatrix` (`dualCurve` / `quadrant2x2`), `visualEquation` (`borderless`), `realAnchor` (`highlightPhrases` + `marginNote`).

Enforced at build/lint time by `scripts/lib/v2-variety-lint.js`:
- `boxed-card` share <= 20%
- Max consecutive same mode <= 2 (unless `continueFromPrev: true`)
- `castMode: "illustrated"` forbids flat-vector `characters`
- `characters.length > 0` with `bg.image` requires `emptyStage: true`

## 2. Per-Book Style Packs (`scripts/lib/style-packs.js`)
8 distinct visual worlds (`midCenturyEditorial`, `tacticalBlueprint`, `sumiWoodblock`, `editorialNoir`, `financialLedger`, `risographPop`, `slateDocumentary`, `storybookVector`) with 8-book anti-repeat distance scoring and mandatory `storybookVector` for `minorHarm: true` books (CLAUDE.md Rule 8).

Wired opt-in into:
- `scripts/plan-antidote.js` (`book.json` `stylePack` / `artDirection` + authored 10x payloads in `art.json`)
- `scripts/storyboard.js` (generated `rules.md` Single-World device guide)

## 3. Next-Level Roadmap
1. **Gemini Reference-Image Character Lock**: Once `gemini-api` plugin is enabled, lock recurring illustrated characters across scenes via reference-image conditioning.
2. **Automated Chunk-Level Visual Critique**: Run a multimodal critic pass on rendered contact sheets before final cloud assembly to catch any label/edge overlap automatically.
3. **Full-Book 10x Authoring**: Apply `stylePack` + `shotIntent` across full 30–60 min books via `storyboard.js prep/merge` + `plan-antidote.js`.
