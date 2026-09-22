# Antigravity + Remotion Skills Integration

This document outlines the best practices and predefined prompt structures for using Antigravity (with `@remotion` skills) to automatically generate highly dynamic, YPP-compliant scenes for narrative and book summary videos.

## Purpose
By generating custom React components dynamically per video chapter, we introduce high variability to the codebase, ensuring that each video possesses a truly unique underlying structure. This "hybrid" approach (AI Code Gen + Human Verification) maximizes YouTube Partner Program (YPP) originality scores and pushes retention past 85%.

## Prerequisite
Ensure the Antigravity environment has the Remotion skill loaded.

## Core Prompt Construction
When invoking the `antigravity` CLI via the pipeline script (`scripts/generate-with-antigravity.js`), use the following structure to ensure the Agent outputs Hollywood Cinematic Code:

```text
Using Remotion Skills: Create a cinematic scene for book summary "[BOOK_TITLE]". 
Include:
1. 3D book overlay with realistic lighting
2. Emotional arc graph 
3. Kinetic typography words 
4. Particle explosion triggered on emotional peaks
5. Wrap the scene in <CameraMotionBlur shutterAngle={180} samples={20}>

Output ONLY as valid Remotion component code saving it to src/components/magic/AIAutoScene.tsx.
```

## Pipeline Flow
1. Audio and VTT files drop into the processing folder.
2. `generate-video-from-vtt.js` segments the chapters.
3. For key emotional climaxes, the script triggers `node scripts/generate-with-antigravity.js [BOOK_TITLE]`.
4. Antigravity dynamically writes a unique React composition to the file tree.
5. The developer verifies the scene layout directly in Remotion Studio `npm run dev`.
6. Final render executes with zero duplicates across the channel catalog.
