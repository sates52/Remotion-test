# P3 Visionless Production Gate — 100 real scenes, 0 LLM/Vision calls

**Books:** don-t-believe-everything-you-think, ready-player-one, the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation, the-paradox-of-choice · **Sampling:** deterministic even stride (25/book, rejects included) · **Generated:** 2026-10-05T15:47:50.913Z

## KPIs (the plan's five + coverage)

| KPI | Value |
|---|---|
| Semantic contract satisfaction | **0%** |
| Generic fallback rate | **0%** |
| IDLE_ACTOR_WALLPAPER rate | **55%** |
| Director fallback rate (adapter floor needed) | **0%** |
| Firewall reject rate | **0%** |
| Narrative intent → selected visual coverage | **53%** |

### P1 wiring — does the semantic chain reach production staging?

| Stage present on scene | % |
|---|---|
| narrativeAtom | 100% |
| visualIntent (P7: meaningful archetype) | 100% |
| visualIntent (shell present, legacy truthy) | 100% |
| visualContract | 100% |
| all three (meaningful) | **100%** |

### P7 intent persistence — meaningful vs shell-only

meaningful **100%** · shell-only 0% · missing 0% (acceptance target: meaningful ≥95% on plans after commit 2)

### P7 semantic judge — one engine, two consumers

| Metric | Value |
|---|---|
| Scenes with a relational staging obligation | 53/100 |
| Gate ↔ firewall HARD agreement (semantic set) | **100%** |

### P0 payload sanity

empty 0% · generic 0% · truncated 0% · duplicate 0%

### Per book

| Book | n | Contract PASS | Coverage | Idle wallpaper | Firewall hard | Avg gate score |
|---|---|---|---|---|---|---|
| don-t-believe-everything-you-think | 25 | 0% | 48% | 32% | 0 | 37 |
| ready-player-one | 25 | 0% | 52% | 24% | 0 | 35.1 |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | 25 | 0% | 60% | 64% | 0 | 33 |
| the-paradox-of-choice | 25 | 0% | 52% | 32% | 0 | 34.8 |

### Violation distribution (P6 taxonomy seed)

| Code | Scenes |
|---|---|
| gate:IDLE_ACTOR_WALLPAPER | 53 |
| gate:MISSING_STRUCTURAL_EQUIVALENCE | 42 |
| gate:VISUAL_SALIENCE_FAILURE | 1 |

### Top 20 suspects (P5 human contact sheet input)

| Book | Scene | Score | Flags | Archetype | Shot |
|---|---|---|---|---|---|
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-230 (frame 60215) | 10 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | medium |
| don-t-believe-everything-you-think | scene-207 (frame 55724) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | allegory_equivalence | illustration |
| ready-player-one | intro (frame 99) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | lowAngle |
| ready-player-one | scene-12 (frame 3364) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | diorama |
| ready-player-one | scene-132 (frame 35654) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | allegory_equivalence | diorama |
| ready-player-one | scene-204 (frame 55867) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | diorama |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-70 (frame 18582) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | closeUp |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-110 (frame 28862) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | wide |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-170 (frame 44019) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | wide |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-190 (frame 49315) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | allegory_equivalence | closeUp |
| the-paradox-of-choice | scene-48 (frame 12918) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | closeUp |
| the-paradox-of-choice | scene-216 (frame 59670) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | diorama |
| the-paradox-of-choice | scene-276 (frame 75631) | 20 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | medium |
| the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation | scene-200 (frame 52368) | 35 | IDLE_WALLPAPER, INTENT_NOT_STAGED | cause_effect | diorama |
| don-t-believe-everything-you-think | scene-45 (frame 11942) | 52 | IDLE_WALLPAPER, INTENT_NOT_STAGED | contrast | diorama |
| don-t-believe-everything-you-think | scene-99 (frame 26136) | 52 | IDLE_WALLPAPER, INTENT_NOT_STAGED | cause_effect | diorama |
| don-t-believe-everything-you-think | scene-36 (frame 9913) | 20 | INTENT_NOT_STAGED | contrast | diorama |
| don-t-believe-everything-you-think | scene-90 (frame 24145) | 20 | IDLE_WALLPAPER | contrast | diorama |
| ready-player-one | scene-60 (frame 16098) | 20 | IDLE_WALLPAPER | contrast | diorama |
| ready-player-one | scene-144 (frame 38774) | 20 | INTENT_NOT_STAGED | contrast | diorama |

_Measurement only — nothing here feeds a production gate. Motion-between-frames and pixel tests run separately via `scripts/p4-render-truth-audit.mjs` on rendered PNGs._
