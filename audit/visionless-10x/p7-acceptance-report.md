# P7 Acceptance Benchmark — pinned 100-scene corpus, 0 LLM/Vision

**Books (pinned):** don-t-believe-everything-you-think, ready-player-one, the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation, the-paradox-of-choice · **Generated:** 2026-10-05T13:55:32.436Z

## Operator targets

| # | Target | Measured | Status |
|---|---|---|---|
| T1 | meaningful intent persistence ≥95% | 0% → 100% (post-inject simulation, commit-2 writer) | **MET (projected)** |
| T2 | P3 ↔ firewall HARD agreement = 100% | 100% | **MET** |
| T3 | relational archetype staging ≥80% | 0% (0/53) | **NOT MET (baseline)** |
| T4 | relational no_floor ≤10% | 86.8 (46/53) | **NOT MET (baseline)** |
| T5 | authored semantic requirement dropped = 0 | 0 | **MET** |
| T6 | customSvg false-positive = 0 | 0 (credited 3/10 svg scenes; drift-cleared without declaration) | **MET** |
| T7 | generic idle wallpaper <10% | 55% | **NOT MET (baseline)** |
| T8 | 30/30 semantic + 31/31 P2 regressions | semantic 30/30 · p2 31/31 | **MET** |

## Hard-decision drift vs the P6 pushed baseline

- don-t-believe-everything-you-think/scene-45#45: **cleared** (declared svg: true)
- don-t-believe-everything-you-think/scene-99#99: **cleared** (declared svg: true)

_Drift must be exactly the P6 K1 false-positive family: #18 (gauge, needle-in-red-zone) + the Two Arrows — both with declared customSvg reads. Everything else byte-identical._

## Null-floor telemetry (commit 4/5 decision columns)

```
{
 "NO_RELATION": 39,
 "RELATION_DETECTED_EXTRACTION_FAILED": 54,
 "preserved_authored_composition": 6,
 "AUTHORED_ALREADY_SATISFIES": 1
}
```

## Holdout: 10 relational scenes for the operator-gated config→pixel sanity render

| Book | Scene | Frame | Archetype | Grammar | Payload |
|---|---|---|---|---|---|
| great-at-work | scene-120 | 33082 | contrast | undefined | comparison_labels |
| great-at-work | scene-180 | 49435 | contrast | undefined | comparison_labels |
| great-at-work | scene-214 | 58680 | contrast | undefined | comparison_labels |
| the-second-mountain | scene-04 | 1080 | cause_effect | cause_effect_flow | flow_labels |
| the-second-mountain | scene-39 | 10690 | cause_effect | cause_effect_flow | flow_labels |
| the-second-mountain | scene-56 | 15046 | contrast | undefined | comparison_labels |
| the-second-mountain | scene-67 | 17928 | cause_effect | cause_effect_flow | flow_labels |
| the-second-mountain | scene-120 | 32772 | contrast | undefined | comparison_labels |
| the-second-mountain | scene-147 | 40219 | contrast | undefined | comparison_labels |
| i-robot | scene-108 | 30420 | cause_effect | cause_effect_flow | flow_labels |

_Render gate: operator acceptance only. PNG/manual review intentionally excluded from this benchmark (spec item 7)._
