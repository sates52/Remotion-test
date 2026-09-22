---
name: remocn
description: >
  Build Remotion videos and enrich scenes with remocn — copy-paste animation components,
  kinetic typography, stop-motion/paper effects, transitions, and timeline-driven UI primitives
  from the remocn shadcn registry. Use when composing scenes, adding motion graphics, kinetic text,
  callouts, or data animations in this Remotion project.
---

# remocn – Remotion Component & Motion Skill

Copy-paste components and design standards for Remotion videos.
Components install via `npx shadcn add @remocn/<name>` or direct registry endpoint `https://remocn.dev/r/<name>.json` into `src/components/remocn/`.

---

## 1. The Catalog & Live Docs

This skill does not bundle 300+ components statically. Read the live index when selecting components:

* **Component Router & Index:**
  ```
  https://remocn.dev/llms-components.txt
  ```
  Provides a table of all installable components with `Use for` / `Avoid for`, natural length, vibe, tier, dependencies, and doc links.

* **Component Full Reference (Raw Markdown):**
  Append `.md` to any docs URL:
  ```
  https://remocn.dev/docs/typography/marker-highlight.md
  https://remocn.dev/docs/typography/strikethrough-replace.md
  https://remocn.dev/docs/transitions/focus-pull.md
  https://remocn.dev/docs/ui-blocks/animated-bar-chart.md
  ```

* **Direct JSON Registry Source:**
  ```
  https://remocn.dev/r/<component-name>.json
  ```
  Contains the self-contained TypeScript component code, dependencies, and configuration.

---

## 2. Project Calibration & Constraints (Crucial)

### A. Resolution & FPS Calibration
* Remocn components default to `1280x720 @ 30fps`.
* **Our Project Standard:** **`1920x1080 @ 24fps`**.
* **Scaling Font/Element Sizes:** Multiply default font sizes by `~1.5x` (e.g. 48px -> 72px; 64px -> 96px) for crisp 1080p rendering.
* **Timing Conversion:** At 24fps, frames run slower in time than 30fps. A 90-frame component at 30fps (3s) corresponds to `~72 frames` at 24fps. Always align hold times with VTT narration beats.

### B. GPU-Less Machine Constraint (No WebGL Shaders)
* This machine runs without a dedicated GPU for headless Chrome instances (`--gl=angle` causes timeouts).
* **RULE:** Prioritize **Typography, Stop-Motion/Paper effects, UI Blocks, Transitions, and SVG/Canvas animations**.
* **AVOID:** Heavy WebGL shader backdrops (`@remocn/shader-*`) like `shader-mesh-gradient`, `shader-warp`, etc. Use SVG gradients or CSS/Canvas backdrops instead.

---

## 3. Two Component Tiers

* **Animation Tier (`remocn`):**
  - Text animations, transitions, backgrounds, stop-motion props, UI blocks.
  - Frame-driven via `useCurrentFrame()`.
  - Props usually include `speed?: number` (multiplier), `fontSize`, `color`, `fontWeight`.
* **UI Primitives (`remocn-ui`):**
  - Stateful timeline-driven primitives (`button`, `dialog`, `stepper`, `switch`...).
  - Driven by `state` (e.g., `"open"` / `"closed"`, `"loading"`).
  - **No `speed` prop.**

---

## 4. Key Craft & Motion Rules (Anti-Patterns to Avoid)

1. **Under-budgeting `<Sequence>`:**
   Every animated component has a natural duration (`Length`). Never clip it with a shorter sequence. Allow entrance + hold duration + exit.
2. **Transition Mounting:**
   Transitions are presentations for `@remotion/transitions` / `TransitionSeries.Transition`. Never mount a transition presentation (e.g. `<WhipPan />`) directly as a JSX child.
3. **Layout Property Animation:**
   Always animate `transform: translate(...)` / `scale(...)` / `rotate(...)`. Never animate `top`, `left`, `width`, or `height` (which causes continuous reflows).
4. **Subpixel Text Jitter Prevention:**
   Under slow zoom or camera motion (`drift`), text can jitter. Apply `willChange: "transform"` to the containing block, not to individual per-letter spans.
5. **Stagger Entrances:**
   Stagger sibling entrances by 3–6 frames. Entering everything on frame 0 looks robotic.
6. **Deterministic Renders:**
   Never use `Math.random()`, `Date.now()`, or `setTimeout`. Use Remotion's `random(seed)` or remocn's `hash01(seed)`.

---

## 5. High-Value Components Installed in `src/components/remocn/`

All components are fully typed, React 19 compatible, calibrated for 1080p @ 24fps, and exported from `src/components/remocn/index.ts`.

| Category | Component | Primary Use Case in Book/Doc Pipeline | Key Props |
|---|---|---|---|
| **Typography** | `MarkerHighlight` | Highlighter stroke behind key phrases in Vox & Antidote beats. | `text`, `markerColor`, `textColor`, `delay`, `strokeWidth` |
| **Typography** | `StrikethroughReplace` | Crossing out misconceptions / old paradigms and revealing truths. | `initialText`, `replacementText`, `strikeColor`, `switchDelay` |
| **Typography** | `RollingNumber` | Rolling odometer for stats, percentages, research data. | `targetNumber`, `prefix`, `suffix`, `duration`, `delay` |
| **Typography** | `Handwrite` | Stop-motion letter-by-letter handwriting effect using Caveat font. | `text`, `color`, `fontSize`, `speed`, `delay` |
| **Stop-Motion** | `ScribbleCircle` | Hand-drawn organic wobble circle around stats, faces, or words. | `color`, `strokeWidth`, `delay`, `duration` |
| **Stop-Motion** | `InkUnderline` | Organic hand-drawn underline for titles, takeaways, and chapters. | `color`, `strokeWidth`, `delay`, `duration` |
| **Stop-Motion** | `PaperSticker` | Tactile physical taped paper sticker with deterministic tilt & shadow. | `children`, `tapeColor`, `tapePosition`, `rotation` |
| **Stop-Motion** | `InkArrow` | Hand-drawn ribbon arrow pointing at key concepts, charts, or figures. | `from`, `to`, `color`, `strokeWidth`, `delay` |
| **UI Blocks** | `CheckList` | Handwritten animated checklist for "Rules", "Steps", and "Laws". | `items`, `color`, `fontSize`, `checkDelay`, `strikeCompleted` |
| **UI Blocks** | `Polaroid` | Instant physical photo frame with media container & handwritten note. | `imageSrc`, `caption`, `rotation`, `tape`, `aspectRatio` |
| **UI Blocks** | `AnimatedLineChart` | Pure SVG animated trend/growth line chart with grid and pulse dot. | `data`, `labels`, `title`, `lineColor`, `showGrid`, `delay` |
| **Transition** | `FocusPull` / `LensZoom` | Rack-focus defocus or punchy optical zoom cut between scenes. | presentation components for `@remotion/transitions` |

---

## 6. Component Usage Quick Reference

```tsx
import {
  MarkerHighlight,
  StrikethroughReplace,
  RollingNumber,
  ScribbleCircle,
  InkUnderline,
  PaperSticker,
  Handwrite,
  CheckList,
  Polaroid,
  AnimatedLineChart,
  InkArrow,
} from '@/components/remocn';

// 1. Stat with Scribble Circle:
<div style={{ position: 'relative', display: 'inline-block' }}>
  <RollingNumber targetNumber={37} suffix="x" color="#1A1815" />
  <ScribbleCircle color="#C53B27" strokeWidth={5} delay={15} />
</div>

// 2. Paradigm Shift / Contrast:
<StrikethroughReplace
  initialText="Focus on Goals"
  replacementText="Focus on Systems"
  strikeColor="#C53B27"
  switchDelay={24}
/>

// 3. Handwritten Checklist:
<CheckList
  items={[
    { text: '1. Make it Obvious', checked: true },
    { text: '2. Make it Attractive', checked: true },
    { text: '3. Make it Easy', checked: true },
    { text: '4. Make it Satisfying', checked: true },
  ]}
  color="#1A1815"
  fontSize={44}
/>

// 4. Polaroid with Tape & Handwritten Note:
<Polaroid
  imageSrc={staticFile('scenes/my-book/author.png')}
  caption="Daniel Kahneman, 2011"
  rotation={-3}
  tape
  width={480}
/>

// 5. Animated Line Chart (Compound Growth):
<AnimatedLineChart
  data={[1, 2, 5, 12, 28, 65, 150]}
  labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7']}
  title="The Compound Effect Over Time"
  subtitle="Exponential growth curves"
  lineColor="#C53B27"
  width={800}
  height={460}
/>
```

