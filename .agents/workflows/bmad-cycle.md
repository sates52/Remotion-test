---
description: The Standard BMAD (Product Manager, Analyst, Developer) Workflow Cycle
---

# BMAD Orchestration Workflow

Follow these steps for every new video production:

## Phase 1: Briefing (Product Manager)
1. **Define Genre & Style**: Select a genre from the `scenes-prompts-generator` or define a new one.
2. **Key Moments**: List the kinetic typography words and key quotes.
3. **Emotional Hook**: Define the labels for the `EmotionalArc`.

## Phase 2: Analysis (Analyst)
1. **Asset Audit**: Verify audio files and subtitle files in `public/`.
2. **Prompt Generation**: Run the prompt generator and verify the output.
3. **Data Mapping**: Create or update the `production-[name].json` with timing and asset paths.

## Phase 3: Coding (Developer)
1. **Root Integration**: Register the composition in `Root.tsx`.
2. **Visual Polish**: Apply the audio-reactive visualizers and particle overlays.
3. **Debug**: Run `npm run dev` and verify locally.

## Phase 4: Review & Render (Joint)
1. **Preview**: PM and Analyst review the preview.
2. **Final Fixes**: Developer addresses feedback.
3. **Render**: Initiate the final production render.
