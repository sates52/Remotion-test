# Third-party notices

Code in this repository that is copied or substantially derived from another project keeps that project's notice here.

## AI-Video-Factory

- Source: https://github.com/ersinkoc/AI-Video-Factory
- Used in: `src/engines/antidote/speech.ts` (speech beats, pulse and hand-stroke timing, letter-weighted mouth shapes —
  from `packages/video/src/beats.ts` and `visemes.ts`), `src/engines/antidote/movements.ts` (`gestureRise`: gesture
  weight with anticipation and overshoot, forearm lag — from `packages/video/src/motion.ts`).
- Re-implemented from the algorithms and constants; adapted to this engine's rig and to English spelling.

```
MIT License

Copyright (c) 2026 Ersin KOÇ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Ideas taken as rules, not code

- `sarpstar/cinecode` (MIT) — directing and motion rules (one action per shot, a fresh framing at every cut, landing on
  the cue, uneven rhythm) and the watchability thresholds behind `scripts/lib/film-flow.js`.
- `lemomo-ai/lemo-opuscar` (MIT) — on-screen text hold times and the "one breath, one acceleration" pacing rule.
