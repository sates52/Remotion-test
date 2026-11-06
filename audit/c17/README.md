# Cycle 17 — operator-approved selective production rollout (single-relation)

Level 2 stays **INCONCLUSIVE** (cycle 16, unchanged). The operator approved a separate, reversible rollout for eligible
books: `data/single-relation-rollout.json` (god-mode 6e43a1cc).

## Eligible books on 2026-11-06
| book | engine | pin | state | rollout |
|---|---|---|---|---|
| how-to-make-money-in-stocks | antidote | 0296a84d | Step 0 (prompt only) | eligible once audio + VTT arrive and the book is planned |
| the-choice-factory | antidote | 0296a84d | Step 0 | same |
| think-straight | antidote | 0296a84d | Step 0 | same — book-start already prints the ELIGIBLE notice |
| cujo, gardens-of-the-moon, how-to-talk-to-anyone, the-most-important-thing | antidote | 55748c9b / cb0d0311 / 88db7e09 | in progress | NOT eligible (pin without the renderer; never repin for this) |
| deep-work, the-maze-runner, yesteryear, never-lie | antidote | — | rendered | NOT eligible |

No eligible book has a config yet, so the FIRST REAL BOOK step waits on the operator's NotebookLM audio + VTT.

## What blocked activation on a real config, and the fix (found by probing real configs, in memory)
1. `compile` dropped `_authorship` → gate-authorship `UNSTAMPED_CONFIG`. Fixed: the stamp stays.
2. The beat's sealed lock still described the old staging → `STAGING_OVERRIDDEN`, and make-book's restore would have put
   the old staging back. Fixed: `sealAuthored` records the validated contract as the beat's authored decision (lock =
   its staging, `previousLock` kept).
3. `compile` dropped narrativeAtom / visualIntent / visualContract → firewall "required"; the planner's visual contract
   then demanded the old staging's characters and fallback shot. Fixed: kept; the staging side (characterIntent,
   representation) is rebound to what is on screen, the narration side unchanged, the old representation kept.
Gate code unchanged. Real configs (under-the-dome 195, great-at-work 163, unhinged 148): authorship PASS → PASS; no
new firewall finding at the applied scene; restore keeps the sealed scene.

## Dress rehearsal (scratch copy of a real full config — never a book)
`rehearsal/run.js`: select (holdout A/B 8.3 → 100) → plan → gates → status ACTIVE; the applied scene, cut from the full
sealed config with its neighbours, rendered on Actions (run 42216842032): `window-B-s195.{png,mp4}` — the book's own HUD
("INSIGHT 07 / 08"), cause lit, tree breaks. `active.json` = the provenance record (diff, A/B, previous scene).
