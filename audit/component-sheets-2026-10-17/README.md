# Component sheets — Tier 1 engine changes, 2026-10-17

Blind validation of the Tier 1 renderer changes (commit `121d444` on `god-mode`). Each sheet was rendered
from the same fixture with the old code and with the new code; fresh blind readers (sonnet, no context,
one image at a time) described each image; the key was kept in a separate file they never opened.

| folder | what |
|---|---|
| `face/before/`, `face/after/` | 30 faces each: 9 expressions × beard {none, stubble, full} (male), neutral + blank (female), one blink peak. Shuffled ids; `face/face-key.json` maps them. |
| `face/after2/` | 8 faces after the stubble-opacity fix (`e7cd27e`); key `face/after2-key.json`. |
| `icon/` | 10 icons: game (before), game (after), trophy, star, target, shield, balance, door, chains, fire; key `icon-key.json`. |
| `reads/` | raw blind answers: `face-{before,after}-{1,2,3}.json`, `face-after2-{1,2,3}.json`, `icon-blind-{1,2,3}.json`; `face-scored.json` = merged per cell. |
| `method/` | cell lists, frame list, crop/compose scripts, the scoring (`score-faces.js`) and alignment (`align-faces.js`) checks. |
| `fixtures/` | the scratch fixture book config used for the face sheet (never committed as a book). |
| `fidelity-10x-analysis-2026-10-16.json` | the read-only analysis + plan these changes came from (6 analyses, 3 plans, 2 judges, synthesis). |

## Results (3 readers per image)

| measure | before | after |
|---|---|---|
| neutral face read "smiling" (yes or slightly) | 3/12 | 0/12 (after2: 0/9) |
| blink / closed eyes | "eyes missing" 3/3 | "closed" 3/3 |
| happy, sad, worried, angry, afraid, smirk, blank | read as intended | unchanged |
| stubble seen | 27/27 | 5/27 at opacity 0.12; 5/15 after restoring 0.24 (smaller band) |
| `game` icon | "trophy / victory" 3/3 | "chess knight / strategy" 3/3 |
| `door` icon (unchanged) | "closed book" 3/3 | — (row in `data/icon-readings.json` updated) |
| `surprised` | reads "blank" | reads "blank / startled" (pre-existing, not addressed) |

Alignment: every before-reader's facialHair matched the key 30/30. After-reader mismatches were the
invisible stubble (consistent across all three readers), not misfiled answers. Reader `face-after-1`
opened images in batches of 10 (reported by the reader); its answers agree with the other two.

Limits: sheets show isolated faces and icons, not scenes in context; three readers per image of one model
family. Whole-film effect is measured separately (burn-of-the-everflame framecheck fc1 vs fc2/fc3).
