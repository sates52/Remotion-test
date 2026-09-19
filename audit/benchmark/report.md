# Semantic Benchmark Suite (30 Cases)

**Date:** 2026-09-18T16:20:38.988Z
**Overall Score:** **30 / 30 (100.0%)**

### Category Breakdown

| Category | Passed | Total | Rate |
|---|---|---|---|
| `structural_equivalence` | 3 | 3 | 100% |
| `contrast` | 3 | 3 | 100% |
| `transformation` | 3 | 3 | 100% |
| `cause_effect` | 3 | 3 | 100% |
| `metaphor` | 3 | 3 | 100% |
| `historical_coherence` | 3 | 3 | 100% |
| `sensory_attribute_fidelity` | 3 | 3 | 100% |
| `narrative_voice_separation` | 3 | 3 | 100% |
| `outcome_polarity` | 3 | 3 | 100% |
| `domain_isolation` | 3 | 3 | 100% |

### Case Details

| ID | Category | Title | Bad Score | Good Score | Status | Caught Hard Violations |
|---|---|---|---|---|---|---|
| `bench-01` | structural_equivalence | City as Mirror of Soul | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-02` | structural_equivalence | Naval Officer as Equivalent to Island War | 20/100 | 53/100 | 🟢 PASS | SENSORY_COLOR_CONTRADICTION: Spoken 'white' attribute directly contradicted by character 'officer' suit styling 'rgb(169,93,5)'; MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel |
| `bench-03` | structural_equivalence | Totalitarian Party as Psychological Cage | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-04` | contrast | Democracy vs Tyranny | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-05` | contrast | Civilized Order vs Predatory Barbarism | 20/100 | 65/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-06` | contrast | Objective Science vs Fearful Superstition | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-07` | transformation | Clean Uniform Decaying into Stained Rags | 35/100 | 47/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-08` | transformation | Democracy Collapsing into Tyranny | 35/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-09` | transformation | Family Members Transforming into Monsters | 15/100 | 47/100 | 🟢 PASS | EMOTIONAL_CONTRADICTION: Character is celebrating during tragic/somber beat |
| `bench-10` | cause_effect | Unsupervised Children Yields Moral Collapse | 35/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-11` | cause_effect | Hyperinflation Causes Empire Collapse | 15/100 | 52/100 | 🟢 PASS | EMOTIONAL_CONTRADICTION: Character is celebrating during tragic/somber beat |
| `bench-12` | cause_effect | Terror Manifests Imaginary Beast | 35/100 | 47/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-13` | metaphor | Pig Head as Inherent Human Evil | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-14` | metaphor | Allegory of the Cave | 20/100 | 52/100 | 🟢 PASS | MISSING_STRUCTURAL_EQUIVALENCE: Claim asserts equivalence/analogy, but scene only depicts single domain without structural parallel; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-15` | metaphor | Ring of Gyges Moral Invisibility | 20/100 | 52/100 | 🟢 PASS | FORBIDDEN_PROP: Prop 'heart' is strictly forbidden for this narrative beat; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-16` | historical_coherence | WWII Royal Navy Trauma vs Medieval Armor | 35/100 | 52/100 | 🟢 PASS | ERA_ANACHRONISM: Modern 20th-century warfare trauma depicted with medieval heraldic crossed-swords/shield prop |
| `bench-17` | historical_coherence | Thirty Tyrants Coup in 404 BC | 20/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor; SETTING_MISMATCH: Anachronistic/incompatible background set for cognitive domain |
| `bench-18` | historical_coherence | Victorian Coal Mine Child Labor | 15/100 | 47/100 | 🟢 PASS | EMOTIONAL_CONTRADICTION: Character is celebrating during tragic/somber beat; SETTING_MISMATCH: Anachronistic/incompatible background set for cognitive domain |
| `bench-19` | sensory_attribute_fidelity | Pristine White Uniform Sensory Color Match | 20/100 | 53/100 | 🟢 PASS | SENSORY_COLOR_CONTRADICTION: Spoken 'white' attribute directly contradicted by character 'officer' suit styling 'rgb(169,93,5)'; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-20` | sensory_attribute_fidelity | Crimson Flag Raised Over Citadel | 35/100 | 52/100 | 🟢 PASS | SENSORY_COLOR_CONTRADICTION: Spoken 'crimson' attribute directly contradicted by prop 'flag' color '#0000ff' |
| `bench-21` | sensory_attribute_fidelity | Black Iron Gates of Fortress | 35/100 | 52/100 | 🟢 PASS | SENSORY_COLOR_CONTRADICTION: Spoken 'black' attribute directly contradicted by prop 'gate' color '#ffd700' |
| `bench-22` | narrative_voice_separation | Stephen King Novel Introduction Separation | 35/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-23` | narrative_voice_separation | Hannah Arendt Philosophical Banality of Evil | 35/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-24` | narrative_voice_separation | 1960s Literary Critics Reception | 35/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-25` | outcome_polarity | Ironclad Guarantee of Survival vs Burning Assets | 35/100 | 52/100 | 🟢 PASS | OUTCOME_REVERSAL: Guaranteed survival/safety claim depicted with burning or destruction of assets |
| `bench-26` | outcome_polarity | Peace Treaty Guarantee vs Sinking Ship | 35/100 | 52/100 | 🟢 PASS | OUTCOME_REVERSAL: Guaranteed survival/safety claim depicted with burning or destruction of assets |
| `bench-27` | outcome_polarity | Unbreached Defensive Fortress | 35/100 | 52/100 | 🟢 PASS | OUTCOME_REVERSAL: Guaranteed survival/safety claim depicted with burning or destruction of assets |
| `bench-28` | domain_isolation | Middle School Book Handout vs Nautical Compass | 20/100 | 52/100 | 🟢 PASS | FORBIDDEN_PROP: Prop 'compass' is strictly forbidden for this narrative beat; IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor |
| `bench-29` | domain_isolation | Agricultural Crop Crisis vs Sci-Fi Weapons | 35/100 | 52/100 | 🟢 PASS | SETTING_MISMATCH: Anachronistic/incompatible background set for cognitive domain |
| `bench-30` | domain_isolation | Psychological Denial vs Corporate Boardroom Chart | 20/100 | 52/100 | 🟢 PASS | IDLE_ACTOR_WALLPAPER: Complex proposition or psychological claim rendered with idle/talking statue actor; DOMAIN_LEAKAGE: Corporate/productivity visual in a non-institutional literary or psychological scene |
