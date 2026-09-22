# NotebookLM prompt — Feel-Good Productivity: How to Do More of What Matters to You (Ali Abdaal)

**Slug:** `feel-good-productivity` · **Genre:** productivity · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Feel-Good Productivity: How to Do More of What Matters to You" by Ali Abdaal.

THE ANGLE (this makes the episode unique):
- Lens: Emotional thermodynamics — breaking the discipline trap.
- Thesis to prove: Productivity is not an act of disciplined self-punishment; it is an emotional state management problem. Hustle culture treats willpower as fuel you burn through suffering, but biology works in reverse: feeling good is not the reward you earn after finishing the work—it is the biochemical fuel that makes hard work possible in the first place.
- Recurring phrase-that-pays: "Feeling good is the fuel, not the reward."
- Cold open on this line (0:00-0:25, mid-thought, no greeting): "Every productivity book told you that suffering was the price of admission—that discipline meant forcing yourself to do what you hate. What if the grind isn't driving your success, but is the exact friction burning your engine out?"

BEATS (argue each as its own claim, in order; develop fully, don't list; ground in everyday relatable workplace/desk friction and the book's core psychology):
1. The Willpower Myth & The Broaden-and-Build Engine. Hustle culture idolizes brute-force self-coercion, but Barbara Fredrickson's positive affect research proves that negative emotion narrows our cognitive field to survival panic, while positive emotions literally broaden our attention and unlock creative problem-solving.
2. The Play Shift: Designing for Fun. Play isn't frivolous time off or a weekend indulgence; it is an operational strategy. Asking "What would this look like if it were fun?" removes dread by turning obligation into curiosity, gamification, and experimentation.
3. The Autonomy Paradox: From "Have To" to "Choose To". Self-Determination Theory shows that when we feel coerced by bosses, deadlines, or internalized guilt, our energy instantly evaporates. Shifting your mental framing to agency and ownership restores power without changing the task.
4. The Comrade Effect: People as Energy Multipliers. We treat deep work as an isolated solo struggle, which accelerates fatigue. Relational energy—body doubling, accountability partners, and working alongside energizers—turns heavy cognitive lifting into shared momentum.
5. The Fog of Ambiguity: Replacing SMART with NICE Goals. Procrastination is almost never laziness; it is emotional paralysis caused by ambiguous next steps. Replacing rigid, anxiety-inducing SMART goals with NICE goals (Near-term, Input-based, Controllable, Energizing) dispels the fog.
6. Overcoming Inertia: The 5-Minute Defibrillator. The hardest part of any task is crossing the emotional threshold to begin. The 5-Minute Rule acts as an emergency defibrillator for stuck projects, shrinking initial resistance below the amygdala's threat radar.
7. Active Recovery vs. Numbing: Conserve and the CALM Framework. Collapsing onto the sofa to doomscroll social media isn't resting—it's low-stimulation sedation. True endurance demands intentional boundaries ("Hell Yeah or No") and active restoration through CALM hobbies (Competence, Autonomy, Liberty, Mellow).
8. The Alignment Horizon: Eulogy Virtues over Resume Vanity. Being hyper-efficient at tasks that don't matter is just burnout in slow motion. Aligning daily tasks with long-term "eulogy virtues" ensures you don't climb the productivity ladder only to realize it was leaning against the wrong wall.

COUNTERPOINT (raise honestly before the payoff): Abdaal formulated this as a Cambridge-educated doctor turned wealthy digital creator with complete control over his schedule and an army of assistants. For a shift worker, an underpaid teacher, or a corporate employee trapped under toxic micromanagement, can work really just "feel good," or is feel-good productivity a luxury product reserved for the privileged?

PAYOFF (reframe at the end): Stop treating productivity as a prison sentence you serve during the week to earn a fleeting weekend of relief. When you stop fighting your own biology and understand that joy isn't what happens after the work is done, but the engine that makes the work sustainable, the struggle disappears.

DEPTH ENGINE (run on EVERY beat — this earns the length): a) drop into a relatable everyday desk/workplace scene in present tense with sensory detail; b) land the point ("here's what that means for you"); c) add a SECOND concrete concept, study, or distinction from the book; d) take an honest "wait — but then..." turn where the hosts genuinely disagree; e) tie back to the phrase-that-pays before the next beat.

LENGTH (target 45-60 min, minimum 45 — never shorter): ~4-6 real minutes per beat, but NEVER pad. No repeating a point, no restating the thesis, no filler or throat-clearing. Earn length by going DEEPER—a fresh angle on workplace dynamics, a sharper objection, a genuine debate. If a beat is exhausted, MOVE ON. Do NOT signal an ending before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY concepts, frameworks, and documented psychology from the book. NEVER invent quotes, numbers, or studies; if unsure, stay general.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character.
- No generic praise, no recap for its own sake. Prefer concrete situations, real friction, and psychological mechanisms.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/feel-good-productivity.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/feel-good-productivity.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=feel-good-productivity --title="Feel-Good Productivity: How to Do More of What Matters to You" --author="Ali Abdaal" --genre=productivity
```
