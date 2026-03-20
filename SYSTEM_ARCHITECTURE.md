# 🎬 Video Generation System Architecture

Welcome to the comprehensive documentation of the video generation infrastructure for **Goodbooksummary (GBS)**, **Shorts**, and **Narrative Labs (NL)**. This document explains how the systems work, how they are structured, and how to operate the automation pipelines.

---

## 🌟 1. Overview of Systems

| System | Goal | Primary Composition | Target Format |
| :--- | :--- | :--- | :--- |
| **Goodbooksummary (GBS)** | High-quality cinematic book summaries with intros and emotional arcs. | `IntroMainVideo` | 1920x1080 (16:9) |
| **Shorts** | Mobile-first book recommendations and author highlights. | `BookRecommendationShort` | 1080x1920 (9:16) |
| **Narrative Labs (NL)** | Educational and narrative science videos. | `SceneBasedBook` | 1920x1080 (16:9) |

---

## 🏗️ 2. Remotion Architecture

### 📹 **Goodbooksummary (GBS)**
The GBS system uses the `IntroMainVideo` composition, which wraps an optional intro video and a main content sequence.
- **Entry Point**: [src/Root.tsx](file:///c:/Users/savas/Cursor/Remotion/test/src/Root.tsx#L355) (`id="The-Day-I-Lost-You"`)
- **Key Features**:
  - `IntroVideo`: Plays a standard intro (e.g., `intros/intro.mp4`) before the main content.
  - `MainContent`: Orchestrates scenes, transitions, and overlays.
  - `EmotionalArc`: A dynamic line chart overlay showing the's mood intensity throughout the video.

### 📱 **Shorts**
The Shorts system is designed for high engagement and rapid content delivery.
- **Entry Point**: [src/Root.tsx](file:///c:/Users/savas/Cursor/Remotion/test/src/Root.tsx#L22) (Multiple IDs: `Historical-Fantasy-Recommendations`, etc.)
- **Key Features**:
  - **Segment-Based**: Each book/author is a separate segment with its own video background.
  - **Dynamic Pacing**: Durations are calculated automatically based on the length of the background video files.
  - **Theming**: Supports multiple themes (e.g., `dark-thriller`, `epic-bestseller`) which change colors and glassmorphism styles.

### 🧪 **Narrative Labs (NL)**
The NL system is a variation of the scene-based architecture, optimized for science and documentary storytelling.
- **Entry Point**: [src/Root.tsx](file:///c:/Users/savas/Cursor/Remotion/test/src/Root.tsx#L324) (`id="Invisible-Heat-Shields-Narrative-Labs"`)
- **Key Features**:
  - `SceneBasedBook`: Focuses on deep integration between narration, scene text, and high-quality B-roll images.
  - **Science Overlays**: Custom data visualization items and chapter cards tailored for educational content.

---

## 🚀 3. Automation Pipeline

The system uses a set of Node.js scripts to automate the transition from a raw VTT/SRT file to a production-ready Remotion configuration.

### 🛠️ **Step 1: Configuration Generation**
Run the unified generator to create the `production.json` file. This script parses the captions, splits them into scenes, and auto-assigns cinematic effects.

```bash
node generate-video-from-vtt.js \
  --vtt=captions.vtt \
  --genre=drama \
  --title="Book Title" \
  --author="Author Name" \
  --audio-duration=1640 \
  --scene-count=50 \
  --output=production-my-book.json
```
- **Script**: [generate-video-from-vtt.js](file:///c:/Users/savas/Cursor/Remotion/test/generate-video-from-vtt.js)
- **Outputs**: A JSON file containing scenes, transitions, animations, and overlay data.

### 🖼️ **Step 2: Image Prompt Generation**
Generate AI image prompts based on the narrative context of each scene.

```bash
node generate-prompts-from-srt.js \
  --srt=captions.vtt \
  --scenes=50 \
  --genre=drama \
  --title="Book Title"
```
- **Script**: [generate-prompts-from-srt.js](file:///c:/Users/savas/Cursor/Remotion/test/generate-prompts-from-srt.js)
- **Outputs**: `scene-prompts.txt` (one prompt per line for AI generators) and `scene-prompts.json` (metadata).

### 📁 **Step 3: Asset Placement**
1.  Generate images using the prompts from Step 2.
2.  Save them as `scene-00.png`, `scene-01.png`, etc.
3.  Place them in the corresponding folder in `public/scenes/` (e.g., `public/scenes/nl/` for Narrative Labs).

---

## ⚙️ 4. Rendering Guide

For production renders, use the following command structure to ensure high quality and optimal performance.

```bash
npx remotion render <COMPOSITION_ID> out/<output_name>.mp4 \
  --codec=h264 \
  --hw-accel=auto \
  --concurrency=1
```

> [!TIP]
> **Concurrency**: Setting `--concurrency=1` is recommended for systems with limited RAM (e.g., 16GB or less) when rendering complex scenes with many overlays and high-resolution images. If you have 32GB+ RAM, you can increase this to `2` or `4`.

---

## 📂 5. Key Directories & Files

- `src/compositions/`: React components for each video type.
- `public/scenes/`: High-resolution B-roll images.
- `public/audio/`: Voiceover narrations.
- `production.json`: The "Source of Truth" for a specific video project.
- `remotion.config.ts`: Global Remotion configuration (codec, resolution, etc.).

---

## 🔄 6. Future Updates
When making changes to the system (e.g., adding a new transition type or a new overlay component), please:
1.  Update the corresponding script in the root directory.
2.  Add a note to the **Remotion Architecture** section of this document.
3.  Verify the changes in Remotion Studio (`npm run dev`).
