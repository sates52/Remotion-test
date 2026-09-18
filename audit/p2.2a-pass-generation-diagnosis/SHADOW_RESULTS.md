# P2.2a shadow-adapter results

**Audit-only.** Real `extractNarrativeAtom()` and `deriveVisualIntent()` were compared with existing production metadata. No planner, Gate, or config was changed.

## Sample

- Total: 30
- By narration type: action_kinetic=5, emotional=5, causal=5, contrast=5, structural=5, abstract_reflective=5
- By P2.2 primary violation: IDLE_ACTOR_WALLPAPER=14, MISSING_STRUCTURAL_EQUIVALENCE=16
- Diagnosis: A=22, B=3, D=5

## Classification

- **A**: real intent has a concrete requirement but current metadata does not represent it.
- **B**: real atom/intent is materially empty for a non-static claim.
- **C**: metadata meets real intent but the real-atom Gate rejects it.
- **D**: real intent is static reflection; a different, deliberate visual strategy is needed.

## Scene evidence

| Book / scene | Type | P2.2 violation | Real intent | Existing metadata | A/B/C/D |
|---|---|---|---|---|---|
| crime-and-punishment / intro | action_kinetic | IDLE_ACTOR_WALLPAPER | cause_effect; depict_trigger_to_consequence_flow | actions: talk; props: food | A |
| the-myth-of-sisyphus / scene-46 | action_kinetic | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: caveallegory | A |
| the-republic / scene-09 | action_kinetic | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: thirtytyrants | B |
| crime-and-punishment / scene-28 | action_kinetic | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: civicpolis | A |
| the-myth-of-sisyphus / scene-76 | action_kinetic | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: ringofgyges | D |
| crime-and-punishment / scene-15 | emotional | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: civicpolis | A |
| the-myth-of-sisyphus / scene-09 | emotional | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: heart | B |
| the-republic / scene-15 | emotional | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk, idle; props: thirtytyrants | D |
| crime-and-punishment / scene-32 | emotional | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: civicpolis | B |
| the-myth-of-sisyphus / scene-109 | emotional | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: caveallegory | A |
| crime-and-punishment / scene-08 | causal | IDLE_ACTOR_WALLPAPER | cause_effect; depict_trigger_to_consequence_flow | actions: walk; props: book | A |
| the-myth-of-sisyphus / scene-05 | causal | IDLE_ACTOR_WALLPAPER | cause_effect; depict_trigger_to_consequence_flow | actions: talk; props: target | A |
| the-republic / scene-01 | causal | MISSING_STRUCTURAL_EQUIVALENCE | allegory_equivalence; render_structural_parallel_between_domains | actions: think; props: kallipolis | A |
| crime-and-punishment / scene-27 | causal | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: walk; props: civicpolis | A |
| the-myth-of-sisyphus / scene-15 | causal | IDLE_ACTOR_WALLPAPER | character_psychology; visualize_internal_tension_or_rupture | actions: talk; props: caveallegory | A |
| crime-and-punishment / scene-02 | contrast | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: linegrowth | A |
| the-myth-of-sisyphus / scene-06 | contrast | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: maze | A |
| the-republic / scene-02 | contrast | IDLE_ACTOR_WALLPAPER | contrast; show_two_opposing_states_or_polarities | actions: talk, idle; props: kallipolis | A |
| crime-and-punishment / scene-05 | contrast | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: think; props: target | A |
| the-myth-of-sisyphus / scene-07 | contrast | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: none | A |
| crime-and-punishment / scene-74 | structural | MISSING_STRUCTURAL_EQUIVALENCE | allegory_equivalence; render_structural_parallel_between_domains | actions: talk; props: civicpolis | A |
| the-myth-of-sisyphus / scene-144 | structural | MISSING_STRUCTURAL_EQUIVALENCE | allegory_equivalence; render_structural_parallel_between_domains | actions: point; props: caveallegory | A |
| the-republic / scene-45 | structural | IDLE_ACTOR_WALLPAPER | allegory_equivalence; render_structural_parallel_between_domains | actions: hold, idle; props: civicpolis | A |
| crime-and-punishment / scene-106 | structural | MISSING_STRUCTURAL_EQUIVALENCE | allegory_equivalence; render_structural_parallel_between_domains | actions: talk; props: civicpolis | A |
| the-myth-of-sisyphus / scene-238 | structural | MISSING_STRUCTURAL_EQUIVALENCE | allegory_equivalence; render_structural_parallel_between_domains | actions: walk; props: historicalathens | A |
| crime-and-punishment / scene-01 | abstract_reflective | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: book | D |
| the-myth-of-sisyphus / intro | abstract_reflective | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: talk; props: none | A |
| the-republic / intro | abstract_reflective | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: kallipolis | D |
| crime-and-punishment / scene-03 | abstract_reflective | IDLE_ACTOR_WALLPAPER | static_reflection; none | actions: talk; props: ripple | D |
| the-myth-of-sisyphus / scene-01 | abstract_reflective | MISSING_STRUCTURAL_EQUIVALENCE | contrast; show_two_opposing_states_or_polarities | actions: sit; props: game | A |

Full atom, intent, Gate, narration, and metadata evidence: `shadow-adapter.json`.
