# 🎬 Video Generation System Architecture

Welcome to the comprehensive documentation of the video generation infrastructure for **Goodbooksummary (GBS)**, **Shorts**, and **Narrative Labs (NL)**.

---

## 🌟 1. Overview of Systems

| System | Goal | Primary Composition | Target Format | Key Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Goodbooksummary (GBS)** | Cinematic book summaries | `IntroMainVideo` | 1920x1080 (16:9) | Storytelling & Emotional Resonance |
| **Shorts** | Rapid engagement | `BookRecommendationShort` | 1080x1920 (9:16) | Viral Hooks & Mobile Accessibility |
| **Narrative Labs (NL)** | Educational Science | `SceneBasedBook` | 1920x1080 (16:9) | Information Density & Clarity |

---

## 🏗️ 2. Detailed Video Types

### 📹 **Goodbooksummary (GBS)**
The flagship cinematic experience for summarizing complex narratives.
- **Scene Density**: Typically **50-100 scenes** per video (~24-48s per scene). 100 scenes are recommended for longer videos (~40min) to ensure YPP compliance.
- **Workflow**: Uses `IntroMainVideo` for a seamless transition from a high-impact intro to deep narrative analysis.
- **Key Features**: 3D Book models, Emotional Arcs, and Glassmorphic Quote Highlights.

### 📱 **Shorts**
Optimized for social media growth and quick recommendations.
- **Segment-Based Architecture**: Each book or author is a distinct segment.
- **Dynamic Pacing**: Background video lengths automatically determine clip timing.
- **Thematic Engines**: Supports `dark-thriller`, `epic-bestseller`, and `historical-fiction` themes with custom color palettes and typography.

### 🧪 **Narrative Labs (NL)**
A specialized documentary-style system for science and educational content.
- **Instructional Flow**: Focuses on the relationship between narration and visual evidence.
- **Data-First Overlays**: Heavy use of animated data visualizations, scientific chapter cards, and technical terminology highlights.

---

## 💎 3. Premium Narrative Features
We have implemented a suite of "Legendary" features designed to maximize viewer retention and bypass YPP "inauthentic content" filters:

1.  **3D Book Overlay**: A dynamic 3D book model that appears at chapter transitions or key moments to ground the summary in the physical text.
2.  **Emotional Arc Graph**: A live, sentiment-driven graph that visualizes the story's mood intensity (Joy, Fear, Tension) in real-time.
3.  **Kinetic Words**: High-impact animated text that emphasizes powerful verbs and nouns, synced directly to the audio.
4.  **Glassmorphic Quote Highlights**: Elegant, blurred-background cards for critical book quotes, increasing readability and visual sophistication.
5.  **Data Viz Items**: Animated rings and bars that track story progress, character stats, or conceptual intensity.
6.  **Typewriter Quotes**: Character-by-character text reveals for a classic, intellectual feel.

---

## 🚀 4. Automation Pipeline

### 🛠️ **Step 1: Configuration Generation**
Run the unified generator to create the `production.json` file.
```bash
node generate-video-from-vtt.js --vtt=captions.vtt --concept=gbs --title="Title" --scene-count=100
```

### 🖼️ **Step 2: Image Prompt Generation**
Generate contextual AI prompts for all scenes.
```bash
node generate-prompts-from-srt.js --srt=captions.vtt --scenes=100 --genre=drama
```

---

## 📂 5. Key Directories
- `src/compositions/`: Logic for video layout and sequences.
- `src/components/magic/`: Core library for premium features (EmotionalArc, ThreeDBook, etc.).
- `src/data/`: Production-ready JSON configurations.
- `public/scenes/`: High-resolution B-roll image assets.
- `public/audio/`: Voiceover files.
