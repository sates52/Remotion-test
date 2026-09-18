# P0 Director Adapter — design from the 22 A cases

**Status:** design only. This document authorizes neither a planner patch nor a
Gate change. It translates the shadow sample into an implementation contract
that must be reviewed before code is written.

## Evidence base

The P2.2a shadow sample has 22 A-class cases. Their real `VisualIntent`
requirements are:

| Intent archetype | Required action | A cases | Production pattern currently observed |
|---|---|---:|---|
| `contrast` | `show_two_opposing_states_or_polarities` | 12 | A single `talk`/`walk`/`think` presenter and one unrelated motif. |
| `allegory_equivalence` | `render_structural_parallel_between_domains` | 6 | A single domain icon or presenter, no parallel structure. |
| `cause_effect` | `depict_trigger_to_consequence_flow` | 3 | A talk/walk presenter plus static object. |
| `character_psychology` | `visualize_internal_tension_or_rupture` | 1 | A talking presenter and an icon without internal division. |

There were no A examples whose first fix is a new Gate rule. The target is the
smallest scene grammar that makes each existing Gate invariant true.

## Adapter boundary

```text
NarrativeAtom + VisualIntent
          ↓
  DirectorAdapter (pure, deterministic)
          ↓
DirectorOverrides
  { shot, cast, props/diagram, exclusions, rationale }
          ↓
existing director.direct() + planner assembly
          ↓
VisualContract firewall (unchanged)
```

The adapter should return **overrides**, not render components and not final
scene JSON. Existing authored art (`ART`), beat briefs, cast continuity, and
the director remain higher-priority inputs. The adapter only supplies a
minimum semantic floor when those inputs have not already supplied one.

## Required mappings

| VisualIntent requirement | Minimum grammar the adapter must request | Gate invariant it satisfies | Do not do |
|---|---|---|---|
| `show_two_opposing_states_or_polarities` | `split` or `twoShot`; two differentiated poles, or a comparison diagram/prop | Two distinct comparative elements | A presenter with a generic icon or a second idle extra. |
| `render_structural_parallel_between_domains` | comparison diagram or explicit two-domain split; labels/objects must map both sides | Structural equivalence | Two people merely standing together, or a single metaphor icon. |
| `depict_trigger_to_consequence_flow` | `insert`/diagram flow or a staged before→after/sequence with trigger and consequence | Non-wallpaper causal action | A static arrow, `talk`, or unrelated object as a proxy for causality. |
| `visualize_internal_tension_or_rupture` | split/fragmentation or two competing internal poles; character reaction can support but cannot be the only evidence | Non-wallpaper psychology | A worried face plus a decorative icon. |

## Attribute and exclusion transport

The adapter must pass—not reinterpret—the following intent fields into a
director-facing constraint object:

- `requiredAttributes.mood`, `visualRegister`, `primaryColorCue`, and
  `lightingOrTone` become palette/tone constraints where the scene grammar has
  a corresponding control.
- `forbiddenTropes` become exclusions during motif/prop and pose choice. They
  never become post-hoc exceptions to the Gate.
- `semanticRequirements` remain attached as machine-readable provenance for
  the later Gate and audit report.

No adapter mapping should use a corporate/productivity motif to satisfy a
literary, moral, psychological, or philosophical requirement.

## Precedence rules

1. Explicit human-authored scene/art direction that already fulfils the intent.
2. A valid explanatory diagram already selected by existing director logic.
3. DirectorAdapter minimum grammar.
4. Existing heuristic director defaults.

If an authored directive conflicts with an intent requirement, preserve both in
the audit record and let the unchanged VisualContract reject it. The adapter
must not silently overwrite human creative direction.

## P1 extractor fixtures — separate work

The three B examples must be stored as regression fixtures independently of
the adapter. They are action/emotion narration that the real heuristic extractor
returned as an empty/static atom. A P1 patch is only justified if a shared
grammar pattern is verified across those fixtures; it must not be hidden as a
fallback inside the DirectorAdapter.

## Definition of done for the later P0 patch

Before rendering, rerun the same P2.2a shadow sample and require:

- all 22 current A examples carry the corresponding minimum metadata grammar;
- no new C classification;
- B fixtures unchanged unless P1 is explicitly implemented;
- D cases remain excluded from automatic presenter fallback;
- legacy P1.5 reject fixtures remain rejects.

Only then produce new production PASS scenes, re-run P2.2, and evaluate pixels
with the blind Mute Test.
