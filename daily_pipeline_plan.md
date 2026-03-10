# Daily Automated Video Generation Pipeline

This document explains the workflow for producing a unique, YPP-compliant video every single day, using distinct creative elements and assets.

## Objective
To consistently produce 1 high-quality, fully animated, engaging "Book Summary / Deep Dive" video per day, leveraging Remotion and a customizable Node pipeline. The videos must be distinct enough (in coloring, transitions, effects) to satisfy YouTube's YPP originality requirements.

## Folder Structure
All raw assets should be placed in `public/` before running the pipeline:
- `public/captions/captions.vtt`: The subtitle file with timing.
- `public/audio/daily-audio.m4a`: The main voiceover.
- `public/intros/daily-intro.mp4`: The hook introductory clip.
- `public/scenes/scene-00.png` to `scene-29.png`: The 30 AI-generated images.

## Step 1: Generate Raw Prompts (Optional but Recommended)
Run the AI generation script to produce 30 unique, genre-specific image prompts based entirely on the VTT data.
\`\`\`bash
node generate-prompts-from-srt.js --input=public/captions/captions.vtt --genre=fantasy
\`\`\`
*(Replace 'fantasy' with the exact genre (e.g. selfhelp, horror, romance) to influence color grading and mood).*

## Step 2: Run the Pipeline Engine
A customizable JavaScript script will parse the `.vtt` file, calculate durations, generate the TS VTT export, and build the 30-scene production JSON. To guarantee uniqueness every day, the script will employ deterministic randomization to pick unused variants, chapter points, and quotes.

**Features of the Daily Script (`generate-daily-video.js`):**
1. **Dynamic Lengths**: Automatically splits scenes based on the precise audio metadata.
2. **Deterministic Shuffling**: Shuffles 50+ animations and 20+ transitions so they are never identical across videos.
3. **Smart Overlays**: Scans the VTT to intelligently place Typewriter Quotes at intense dialogue moments, and Chapter Cards at narrative breaks.
4. **Theme Assignment**: Extracts genre/theme from a parameter to determine the Particle Background (`bokeh`, `fireflies`, `rain` etc.) and waveform colors.

## Step 3: Registration and Rendering
The daily script will output:
1. `src/data/daily-vtt.ts` (VTT parsing)
2. `production-daily.json` (The configuration)

Update `src/Root.tsx` by replacing the `mainConfig` object in the active `Composition` block to require the newly generated files.
Then simply run:
\`\`\`bash
npx remotion render Daily-Video-Composition output.mp4 --codec=h264 --hw-accel=auto --concurrency=1
\`\`\`

## Routine Checklist
- [ ] Drop `captions.vtt`, `daily-audio.m4a`, `daily-intro.mp4` into `public/` folders.
- [ ] Generate & save 30 images into `public/scenes/`.
- [ ] Run `node generate-daily-video.js --title="Book Name" --author="Author" --genre="SciFi"`
- [ ] Update `src/Root.tsx` to point to the new files.
- [ ] Run the `remotion render` command.

This standardizes the workflow to an under-5-minute manual setup process each day, while maintaining incredibly high visual variance.
