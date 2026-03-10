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
- `convert-srt.js` – SRT format conversion helper

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

