# Video Anatomy & Composition Strategy

How to turn video requirements into a coherent, high-converting Remotion video. Read this before composing.
The component catalog is at `https://remocn.dev/llms-components.txt`.

---

## 1. Strategy: Template vs Compose vs Build-New

1. **Compose from Catalog Components (Default Path):**
   * Assemble scenes out of existing Remocn blocks, Remotion sequences, and custom graphics.
   * Standard output is a series of sequences or `<TransitionSeries>` stitching scenes.
2. **Build a Lightweight Component when:**
   * A beat requires a visual representation that the catalog lacks, but will be reused across chapters or videos (e.g. a book quote card, chapter summary badge).
   * New components must stay transparent (avoid hardcoded backgrounds), seek-safe, and deterministic.

---

## 2. Anatomy of an Impactful Beat / Scene

In high-retention video pipelines (such as Vox / Johnny Harris style or educational video summaries), each beat adheres to clear staging:

| # | Beat Role | Function | Best Remocn Components |
|---|---|---|---|
| 1 | **Hook / Problem Statement** | Hook attention with tension or misconception | `strikethrough-replace`, `per-character-rise`, `soft-blur-in` |
| 2 | **Focal Evidence / Highlight** | Direct viewer's gaze to the core idea | `marker-highlight`, `scribble-circle`, `ink-underline` |
| 3 | **Proof / Data** | Quantify impact or historical fact | `rolling-number`, `animated-bar-chart`, `animated-line-chart` |
| 4 | **Resolution / Action Item** | Deliver the core takeaway | `check-list`, `paper-sticker`, `sheen-slide-in` |

---

## 3. Good vs Slop (Quality Guidelines)

* **Restraint over Gimmick:** Don't stack three different kinetic effects on the same 2-second screen. One dominant motion per beat.
* **Palette Consistency:** Keep the background and text palette cohesive. One punchy accent color (e.g., golden yellow or red for markers), neutral darks for text, warm paper or dark studio for backdrops.
* **Duration Discipline:** Leave enough hold time (typically 1.5s to 3s) after an entrance animation settles so the audience can read and absorb the message.
