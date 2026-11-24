# Antidote Channel Forensic Benchmark & YPP-Safe Antidote 2.0 Blueprint (2026-11-24)

> **Evidence base:** Three downloaded long-form videos from the Antidote YouTube channel analyzed with `rea-video` (`decompose`), `reelmimic` (`analyze.py` / `motion-doctrine`), and `reverse-engineer-channel` methodology (local/visual/structural layers; TubeLab MCP audience/RPM lookups noted as unconfigured):
> 1. *How to Get Whatever You Want From Someone (Never Split the Difference)* — **52.6 min** (3,158.5 s · 854×480 · 29.97 fps · 196 kbps)
> 2. *The Deep Work Method in 35 Minutes* — **35.0 min** (2,099.6 s · 854×480 · 29.97 fps · 212 kbps)
> 3. *The Art of War by Sun Tzu — Complete Animated Book Summary* — **103.9 min** (6,233.6 s · 1280×720 · 29.97 fps · 238 kbps)

---

## 1. Measured Forensic Summary (`rea-video` on 0:00–1:30 Hooks + 27 Full-Film Sample Frames)

| Metric | Never Split the Difference (52.6m) | The Deep Work Method (35.0m) | The Art of War (103.9m) | **Antidote Channel Target** |
|---|---:|---:|---:|---|
| Shots in first 90 s | **10 shots** | **9 shots** | **10 shots** | **9–10 shots / 90 s (9–10 s avg)** |
| Hook burst cadence (0:00–0:48) | 6.4 s / shot | 5.2 s / shot | 6.6 s / shot | **5–7 s / shot** in opening 45 s |
| First Act / Part card lands at | **0:36.8** | **0:32.0** | **0:40.5** (Roadmap → Phase 1) | **0:32 – 0:42** |
| First deep teaching canvas | **32.0 s** (`0:58–1:30`) | **52.2 s** (`0:36–1:28`) | **24.2 s** (`1:06–1:30`) | **25–50 s progressive multi-layer build** |
| Code / 2D motion-graphics share | **77%** | **73%** | **78%** | **~75% 2D/code + ~25% custom art** (0% live action) |
| Voice active share (in 90 s) | **68%** | **76%** | **62%** | **65–75%** (25–35% deliberate pauses) |
| Music bed in opening 90 s | 51% (fades out at 55.5 s) | 42% (fades out at 83.5 s) | 57% (fades out at 72.5 s) | **Drops out after hook** (night-listener friendly!) |
| Burned-in karaoke subtitle bar | **0%** | **0%** | **0%** | **0%** (YouTube CC; on-screen text = teaching!) |
| Persistent top HUD / title bar | **0%** | **0%** | **0%** | **0%** (tiny corner watermark only) |

**Additional `reelmimic/analyze.py` measurements (`Never Split the Difference`, 0:00–1:30):**
- Mean frame brightness: **`0.333`** (moody dark canvas — NOT bright washed-out grey/white slides)
- Effective animation density: **`23.8 drawings/s` (on ones)** — continuous micro-motion/reveal progression inside each shot
- Measured narrative tension peaks (`build → hit`): **`42.24 s`** (`ACT 1` transition), **`55.43 s`** (first case study entry), **`79.67 s`** (hostage escalation)

---

## 2. The Exact 4-Beat Hook Formula (3/3 Videos Identical Structure)

Across all three reference videos — regardless of whether the film runs 35 min, 52 min, or 104 min — the opening 90 seconds follow one exact high-retention architecture:

1. **`0:00 – 0:14` — Real-World Book Anchor (`RealAnchorCard`):**
   The actual book cover centered on a moody dark textured canvas (obsidian, deep navy, or dark crimson). Instant authority and topic clarity with zero generic intro logo.
2. **`0:10 – 0:36` — Credibility & Stakes Layered Over the Dimmed Anchor (`depthCarry: true`):**
   The book cover stays dimmed in the background while real-world authority anchors (Cal Newport + MIT arrows + 10-year timeline; Steve Jobs / Michael Jordan / Churchill / Napoleon; FBI bank hostage split-screen) layer on top.
3. **`0:32 – 0:49` — Clean Structural Roadmap (`ChapterCard` / Phase Track):**
   A crisp counter-intuitive thesis or chapter roadmap (`ACT 1: You're Negotiating Backwards`, `Part 1: Why You Need Deep Work`, `13 chapters → Phase 1: Before you ever act`).
4. **`0:49 – 1:30` — First Visual-Thinking Teaching Model (`VisualEquation` / `ComparisonGrid`):**
   Transitions onto a high-contrast dark grid canvas (`obsidianGrid`) and builds a concrete 3-part mental model (`Mistake 1/2/3`, `3 pillars → Deep Work`, `Body→Brain vs Brain→Body`).

---

## 3. The 6 Visual-Thinking Primitives (and How Antidote 2.0 Surpasses Them)

Inspecting 27 full-film frames across all 3 videos exposed BOTH why Real Antidote passes YPP effortlessly at 35–104 minutes AND where Real Antidote is visually weak so we can beat them 10x:

| # | Real Antidote Primitive | Observed Examples | Real Antidote's Weakness | **Our Antidote 2.0 Upgrade (`src/engines/antidote/`)** |
|---|---|---|---|---|
| 1 | **Real-World Anchor** | *Deep Work* cover + Cal Newport + MIT arrows; *Art of War* + historical figures | Occasional cluttered hand-drawn overlaps | **`RealAnchorCard.tsx`** — clean editorial plate + animated curved pointer arrows & quotes |
| 2 | **Visual Equation** | `Objective Reality → [Scissors/Brain] → Lightbulb`; `Body→Brain` vs `Brain→Body` | Generic stock clipart icons | **`VisualEquation.tsx`** — bespoke **Flux editorial cutouts** (or clean symbolic badges for `minorHarm`) + self-drawing arrows |
| 3 | **Side-by-Side Comparison** | *Anchoring* (`$10k` vs `$3k` → `$7k` offer); *Coffee Shop vs Starbucks* | Cheap corporate stock vectors | **`ComparisonGrid.tsx`** — crisp framed contrast cards + Flux editorial art + staggered waterfall bullets |
| 4 | **Analytical Charts & Matrices** | `intensity vs TIME` (*anger vs damage*); `Known/Unknowns` Black Swan 2×2; `Mon/Tue/Wed` schedule | Flat unstyled boxes | **`DataMatrix.tsx`** — animated Bezier `dualCurve`, glowing `quadrant2x2`, and `schedule` grids |
| 5 | **Rich Stage Moods & Spatial Memory** | Obsidian grid, deep violet gradient, warm parchment; dimmed previous scene behind active diagram | Manual After Effects inconsistency | **`Backdrop.tsx` (`stageMood` + `bg.image`) + `Scene.tsx` (`depthCarry`)** — 5 curated moods + Flux scenic/isometric backdrops with Ken Burns + dimmed previous-scene memory |
| 6 | **Directional Motion Continuity** | Smooth wipes/zooms pushing the eye forward | Some abrupt static cuts | **`Transition.tsx`** — `reelmimic` `motion-doctrine` / `cut-the-curve` partial-travel seams (`slideCarryLeft`, `slideCarryUp`, `zoomPush`, `zoomPull`, `blurCut`) |

---

## 4. YPP (`genericrepetitivecontent` / S-CTS) Compliance Matrix

| YPP Risk Vector (from Google S-CTS / Fingerprinting / Policy) | Old Antidote (Rejected Risk) | **Antidote 2.0 Solution** |
|---|---|---|
| **S-CTS Channel Visual Clustering (`ΨC`)** | Same grey SVG rooms + same Everyman face across 40+ books | Per-book `meta.artDirection` (bespoke mood, palette, typography, Flux style lock) — target `visual-sameness.js < 65%` against old Antidote, old Vox, AND reference Antidote videos |
| **Template Chrome / Fingerprinting** | Persistent top HUD + uniform karaoke subtitle box on every frame | `artDirection.hud: "off"` + `artDirection.captions: "off" \| "minimal"` (zero repetitive chrome; `ProducerNote` + `clean.vtt` kept intact) |
| **Low Information Gain (`EXPLAINS 1/30`)** | Flat puppet standing beside 1-word callout | Abstract/strategic beats route to `VisualEquation`, `ComparisonGrid`, `DataMatrix`, `RealAnchorCard` — target blind mute `EXPLAINS ≥ 50%`, `ADDS ≥ 70%`, `WRONG ≤ 1` |
| **Night-Listener Audio Rule (2026-11-23)** | Beep/ding SFX broke listener focus | `meta.sfx` remains OFF by default; pure narration + Producer's Note (optional human intro/outro voice recommended as non-engine YPP accelerator) |
| **Child Safety (`CLAUDE.md` Rule 8)** | `minorHarm: true` books cannot use photoreal Flux | All 4 new visual-thinking components work 100% symbolically without Flux child imagery |
