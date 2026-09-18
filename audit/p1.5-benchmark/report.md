# P1.5 Benchmark Report: Semantic Gate vs. Pixel Vision Critic

**Evaluation Standard:** The Mute Test (*"If the narration were muted, would this image independently communicate the idea?"*)
**Ground Truth:** Vision Critic (Human/Visual Cognitive Interpretation of Rendered PNG)
**Deterministic Gate:** `VisualContract` + `VisualIntent` Pre-Render Semantic Firewall

## 1. 2x2 Accept / Reject Confusion Matrix

| Deterministic Gate | Vision GOOD (Ground Truth) | Vision WRONG (Ground Truth) | Total |
|---|---|---|---|
| **Gate PASS** | **0** (*True Accept*) | **6** (*False Accept / Critical Leaks*) | 6 |
| **Gate REJECT** | **0** (*False Reject*) | **20** (*True Reject*) | 20 |
| **Total** | 0 | 26 | 26 |

> [!IMPORTANT]
> **Key Diagnostic Discovery:**
> - In the 20 canonical scenes (10 Republic + 10 LOTF), the Gate had a **100% True Reject rate** (20/20). It correctly rejected every single legacy defective scene.
> - However, auditing the 7 scenes in LOTF where the Gate returned **PASS** revealed **6 Critical Leaks (False Accepts)** where metadata passed (score >= 60), but the actual rendered pixels contained absurd visual failures (e.g. Christmas gift box for Piggy's death, corporate productivity funnel for child psychology).

## 2. The 20 Canonical Production Scenes (10 Republic + 10 LOTF)

| Book | Scene ID | Frame | Narration Excerpt | Gate Verdict | Vision Score | Vision Verdict | Diagnostic Result |
|---|---|---|---|---|---|---|---|
| Republic | `scene-151` | 41392 | *"soul is not a single unified monolithic blob... tripartite"* | 🔴 REJECT | 30/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-262` | 71849 | *"democracy is intoxicatingly free... swings into tyranny"* | 🔴 REJECT | 20/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-217` | 59260 | *"prisoners chained inside cavernous cave... blank wall"* | 🔴 REJECT | 5/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-221` | 60566 | *"shadows are total sum of the universe"* | 🔴 REJECT | 12/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-195` | 53063 | *"he is the true navigator... drunken politicians mock him"* | 🔴 REJECT | 45/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-184` | 49823 | *"souls perfectly balanced by reason... philosopher kings"* | 🔴 REJECT | 25/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-37`  | 10340 | *"justice is nothing more than the advantage of stronger"* | 🔴 REJECT | 15/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-152` | 41692 | *"tripartite soul... three classes map onto mind"* | 🔴 REJECT | 25/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-236` | 65012 | *"turning the whole soul away from darkness toward light"* | 🔴 REJECT | 40/100 | 🔴 WRONG | **True Reject** |
| Republic | `scene-271` | 74359 | *"psychological profile of the tyrant... chilling"* | 🔴 REJECT | 35/100 | 🔴 WRONG | **True Reject** |
| LOTF | `intro` | 146 | *"British naval officer... pristine white uniform... exact same war"* | 🔴 REJECT | 15/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-01` | 447 | *"handed this book in middle school... boys misbehaving"* | 🔴 REJECT | 25/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-02` | 690 | *"fable about what happens when children don't have supervision"* | 🔴 REJECT | 18/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-03` | 963 | *"Golding's life as a scarred Royal Navy veteran of WWII"* | 🔴 REJECT | 32/100 | 🟡 WEAK | **True Reject** |
| LOTF | `scene-04` | 1336 | *"reading just shatters... cautionary tale about bullying... horror"* | 🔴 REJECT | 20/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-05` | 1682 | *"presented along stories of grand adventure... pirates"* | 🔴 REJECT | 18/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-06` | 1991 | *"Stephen King brings this up in his introduction"* | 🔴 REJECT | 15/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-07` | 2229 | *"what the British called ripping yarns, Hardy Boys"* | 🔴 REJECT | 8/100 | 🔴 WRONG | **True Reject** |
| LOTF | `scene-08` | 2450 | *"Dave Dawson... young heroes always moral, always safe"* | 🔴 REJECT | 45/100 | 🟡 WEAK | **True Reject** |
| LOTF | `scene-09` | 2749 | *"ironclad guarantee that Dave was going to shake him"* | 🔴 REJECT | 22/100 | 🔴 WRONG | **True Reject** |

## 3. Critical Leak Breakdown (False Accepts / Kaçaklar)

When the deterministic Gate returned **PASS**, what was actually rendered on the pixel canvas?

| Book | Scene ID | Spoken Claim | Rendered Pixels | Gate Verdict | Mute Test Score | Composition Failure Mode |
|---|---|---|---|---|---|---|
| LOTF | `scene-12` | *Kids ruthless one moment, generous next* | Corporate productivity funnel (*"100+ DISTRACTIONS & NOISE" -> "THE ESSENTIAL 1%"*) | 🟢 PASS (68) | 12/100 (🔴 WRONG) | **Domain Leakage / Metaphoric Flatness** |
| LOTF | `scene-80` | *Jack driven to absolute rage by humiliation* | Buzzword banner (*"THE FIVE-ALARM TRAP"*) + cartoon flame icon + motionless silhouette | 🟢 PASS (68) | 20/100 (🔴 WRONG) | **Action Legibility / Metaphoric Flatness** |
| LOTF | `scene-86` | *Militaristic faction appropriates technology* | Snapping chain links (*brokenChain*) + red spark | 🟢 PASS (68) | 25/100 (🔴 WRONG) | **Action Legibility / Outcome Inversion** |
| LOTF | `scene-92` | *Ralph's entire platform is based on rescue/fire* | Static cartoon flame + idle silhouette | 🟢 PASS (68) | 22/100 (🔴 WRONG) | **Visual Salience / Wallpaper Failure** |
| LOTF | `scene-182` | *Piggy: 'Give me my glasses'... fatal flaw* | Cheerful Christmas gift box with white bow | 🟢 PASS (68) | 8/100 (🔴 WRONG) | **Asset Identity / Emotional Polarity Reversal** |
| LOTF | `scene-190` | *Boulder drops from cliff... strikes Piggy* | Archery target with arrows | 🟢 PASS (68) | 18/100 (🔴 WRONG) | **Action Legibility / Asset Identity Failure** |

## 4. Analysis of the 5 Failure Modes

### 1. Scale Failure / Visual Salience Failure
- **Manifestation:** The intellectually critical visual element is rendered as an unreadable, microscopic 50-100px icon in the corner, while 70% of the viewport is consumed by a blank silhouette puppet staring blankly.
- **Example:** Republic `scene-221` (Cave shadows: the projection box is microscopic in the corner; the silhouette head fills the screen).

### 2. Action Legibility Failure
- **Manifestation:** High-velocity or violent narrative events (drops boulder, rage, fist fight, mock, mutiny) are depicted with static, motionless standees or abstract icons.
- **Example:** LOTF `scene-190` (Murder of Piggy with falling boulder depicted with an archery target) and `scene-80` (Jack's violent rage depicted with a motionless silhouette).

### 3. Asset Identity Failure
- **Manifestation:** A completely inappropriate, foreign asset is mapped to an emotional or physical beat simply because of a superficial dictionary match.
- **Example:** LOTF `scene-182` (Piggy's stolen glasses and imminent death depicted with a bright red Christmas gift box with a white ribbon).

### 4. Metaphoric Flatness / Domain Leakage
- **Manifestation:** Abstract self-help or business productivity concepts are blindly injected into ancient philosophy or classic literary tragedy.
- **Example:** Republic `scene-262` (*"THE PASSENGER SEAT"* over Athenian democracy); LOTF `scene-12` (*"100+ DISTRACTIONS & NOISE" -> "THE ESSENTIAL 1%"* over childhood cruelty).

### 5. Emotional Polarity Reversal
- **Manifestation:** The emotional gravity of the spoken narrative (tragedy, brutality, terror) is paired with cheerful, smiling, or comic visual assets.
- **Example:** Republic `scene-37` (Thrasymachus' brutal "might makes right" bomb depicted by a warmly smiling elderly philosopher puppet).

