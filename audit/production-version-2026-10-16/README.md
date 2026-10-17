# Production version record — 2026-10-16

Which code produced the three Antidote books of 2026-10-16, and whether they used relationship staging.
Recorded before any new engine work (step 1–2 of the reviewer-approved fidelity-tools task).

## Code

- Main checkout (`C:\Users\savas\Cursor\Remotion\test`): HEAD `7d53ece`, merge-base with origin `55e1891`,
  5 local-only commits, 28 behind `origin/god-mode` (`eabfb8d`), 559 uncommitted paths.
- Every book's `storyboard/policy.json` records `codeSha: 25224ba`. That is the checkout HEAD only; it does
  NOT describe the code that ran, because the working tree differs from HEAD.
- Working tree vs `origin/god-mode`, tracked code under `scripts/ src/ data/`:
  - identical to origin (11): `data/quality-policy.json`, `scripts/hard-gate.js`, `scripts/lib/visual-intent.js`,
    `scripts/plan-antidote.js`, `scripts/preview-ready.js`, `scripts/readcheck.js`, `scripts/storyboard.js`,
    `src/engines/antidote/{characters/Everyman.tsx, components/Scene.tsx, index.tsx, schema.ts}`;
    untracked but identical to origin: `scripts/gate-b-relationship.js`, `scripts/lib/relationship-staging.js`,
    `src/engines/antidote/components/RelationshipStage.tsx`, visual-lab, production-archive, four tests.
  - different from origin (10), saved in `main-checkout-vs-origin.patch`: `scripts/make-book.js` (firewall gets
    `--preview-only`, `inject-provenance --force`), `scripts/render.js` (no shared split file, async catch),
    `scripts/render-github-assemble.js` (reuses verified downloaded segments), `scripts/mute-reliability.js`,
    `data/visual-capability.json`, `src/books.generated.ts`, Vox-only files (`plan-vox.js`, `gen-vox-images.py`,
    `src/engines/vox/{scenes-narrative,shared}.tsx`). None of them changes an Antidote frame.
  - 12 untracked local-only scripts dated 2026-09-29..10-09 (`temp-*.js`, `judge-gemini.js`, `blind-describe.js`,
    assemble helpers). Not part of these books' pipeline; left untouched (not ours).
- Conclusion: the Antidote engine and authoring code of these books = `origin/god-mode` as of `b3794e5`+, plus the
  make-book flow tweaks above. Gap: `policy.json` should record a working-tree code fingerprint, not HEAD.

## Relationship staging usage

| Book | beats | authored staged | Gate B verdicts | STAGE | in config | bible groups | rules.md had the section |
|---|---|---|---|---|---|---|---|
| the-art-of-saying-no | 223 | 0 | 0 | 0 | 0 | 0 | yes |
| burn-of-the-everflame | 263 | 0 | 0 | 0 | 0 | 0 | yes |
| learned-optimism-… | 313 | 0 | 0 | 0 | 0 | 0 | yes |

The feature was available (prep after rollout `b3794e5`, 2026-10-16 09:47 +0300) and no author selected it.
These books' mute-test results therefore say nothing about relationship staging, positive or negative.

## Mute-test record at this version

| Book | runs | WRONG | dead | ADDS | outcome |
|---|---|---|---|---|---|
| the-art-of-saying-no | run1/run2/run3 | 2 / 4 / 2 | 3 / 4 / 9 | 57% ×3 | FAIL, operator override, published |
| burn-of-the-everflame | run1/run3/run5 | 4 / 3 / 6 | 7 / 9 / 7 | — / — / 60% | FAIL, parked as engine test book |
| learned-optimism-… | run1/run2 | 2 / 1 | — / 0 | — / 60% | PASS after 1 round |

Readcheck (text-only blind reading) reported 0 WRONG before every failing run of the-art-of-saying-no.
