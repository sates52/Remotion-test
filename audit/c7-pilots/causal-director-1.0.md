
## CAUSAL STORY DIRECTOR (read before you author any beat — it decides what each beat must SHOW)

A viewer with the sound off must see what HAPPENS and what it CAUSES — not only who is talking or what the topic is.
A person doing a deed was not enough on its own (measured 2026-10-31: staging deeds raised CORRECT, but the picture
still carried the wrong or a neutral message on a quarter of the frames — the viewer saw an action and not its point).
The point is the CHANGE: the goal, the deed and the visible result together.

### Step 1 — the causal frame of every beat (write it, from the narration only)
Add `storyboard.causal` to every beat:

    "causal": { "kind": "event | decision | mechanism | comparison | emotion | idea | commentary",
                "actor": "<cast key or who/what acts, or null>", "goal": "<what they want, if SAID, else null>",
                "action": "<the deed or step, as said>", "object": "<the thing acted on, or null>",
                "target": "<the other person / place / group, or null>",
                "before": "<the state before, if said>", "after": "<the state after, if said>",
                "consequence": "<what changes because of it, if said>",
                "quote": "<the narration's own words (verbatim, from THIS beat) that state the action or the consequence>" }

Use only what the narration says in this beat or in the beats of your chunk around it. A field nothing supports is
null. Never invent a goal, a feeling, a deed, an object or a result; a metaphor is not a deed. `quote` must be copied
word for word from this beat's narration.

### Step 2 — the beat's KIND decides the staging
- **event** (someone does something concrete): stage the ACTOR doing the ACTION (an action from the vocabulary, with
  `actionCue` on the word where it happens), with the OBJECT in hand (`holds`) or as the icon, and the TARGET as the
  second cast member. The CONSEQUENCE must be on screen: the target's reaction (`partnerExpression` /
  `partnerAction`), the object's new state (`conceptMotion`), the person gone / seated / down. If the result lasts, the
  next beat keeps it (`"continue": true`).
- **decision** (someone chooses, refuses, commits, gives up): the person and the THING decided about on screen (held
  object or icon); a refusal is two people — the one who asks and the one who refuses, with different faces; two
  options the narration names → a `sorter` / split with those words. Never a lone face "deciding" (`think` reads as
  pointing).
- **mechanism** (how X leads to Y): the diagram that matches (causal / flow / mechanism / loop — "Which tool for which
  passage"), on THIS beat, labelled with the narration's words; people only when the narration's mechanism is about
  them doing it.
- **comparison** (this vs that, before vs after): both sides visible at once (split, `beforeAfter`, spectrum, two cast
  members doing the two things). A comparison carried only by a callout is text.
- **emotion** (a feeling changes BECAUSE of something): the face of the feeling AND its cause on screen (the person,
  object or event that caused it). A face without its cause is mood, not story.
- **idea** (an abstract claim with no actor): the measured tool for its shape; a metaphor only if the narration uses
  it; the icon test still applies. Do not force a person or an action into an abstract idea.
- **commentary** (the hosts' own reaction, banter, "right", "exactly"): keep it minimal — continue the previous stage
  or a plain face; never decorate.

### Step 3 — the consequence test (every event, decision and emotion beat)
Cover the callout. Look at the middle of the beat as drawn. Could a muted viewer name (a) who acts, (b) what they do,
(c) what changes because of it? If (c) is invisible, fix the staging: show the after-state (the target's reaction, the
object's new state, the person gone / seated / down, the result kept on the next beat). Put `actionCue` /
`conceptMotionCue` on the EARLIEST word that says the deed, so the after-state holds for most of the beat. A
consequence that only the callout states is TEXT_ONLY — say so in `noVisual` when the vocabulary cannot show it.

### Step 4 — a small sequence when one beat cannot hold it
When the narration tells one causal step across 2-4 beats: start state → the deed on its word → the result kept
(`continue`), changing only what the narration changes. Do not stretch a sequence over unrelated sentences.

### Step 5 — what stays
Callouts stay where the words are needed (a name, a number, a quote) — as the LABEL of the picture, never instead of
it. The book's cast, sets, own icons, continuity and every rule above stay. Diagrams stay where they explain.
