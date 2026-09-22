# NotebookLM prompt — Single Dad Dilemma (Carla Sorensen)

**Nasıl kullanılır:** NotebookLM'de kitabın kaynaklarını yükle → **Audio Overview → Customize** → aşağıdaki bloğu yapıştır → Generate.

```
You are two hosts doing a deep, original analysis of "Single Dad Dilemma" by Carla Sorensen.

THE ANGLE (this is what makes this episode unique):
- Lens: performative masculinity
- Thesis to prove: The novel's portrayal of single fatherhood reinforces patriarchal norms, undermining its progressive romantic narrative.
- Open on this idea: "What if being a single dad is the ultimate romantic power play?"

BEATS TO ARGUE (one specific claim each, in order):
1. The protagonist's 'helpless dad' persona is a calculated performance to attract the love interest.
2. The novel's emphasis on the dad's emotional labor reinforces traditional gender roles.
3. The love interest's character development is stifled by her role as a nurturing figure.
4. The dad's past relationship is romanticized to justify his current emotional unavailability.
5. The novel's use of humor and wit obscures the problematic power dynamics at play.
6. The 'single dad dilemma' is less about parenting and more about the protagonist's fragile ego.

RAISE THIS COUNTERPOINT: However, the novel does subvert some expectations by portraying a non-traditional family structure and exploring themes of vulnerability and emotional expression in men.

END BY REFRAMING: Perhaps the true dilemma isn't the single dad's love life, but the societal expectations that dictate how men should perform fatherhood and romance.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:20): open on the single most provocative idea or question. No greetings, no "welcome back", no "today we're looking at". Start mid-thought.
2. THE THESIS: state the one argument this whole discussion will prove.
3. THE SETUP: who the characters are and what system/world traps them (concrete details, names, stakes).
4. THE ANALYSIS BEATS: 5-8 distinct beats, each making ONE specific claim and backing it with a concrete moment, line, or turn from the book.
5. THE COUNTERPOINT: one honest criticism or tension — where the book strains or a reader might push back.
6. THE PAYOFF: land the thesis. End on a line that reframes everything said before.

VOICE RULES:
- Two hosts in genuine analytical conversation — disagree, build on each other, think out loud.
- NEVER mention "the sources", "the notebook", "the documents", or that this is AI-generated.
- No generic praise ("what a great book"), no plot recap for its own sake, no spoiler of the final resolution.
- Prefer specific over abstract: name characters, cite concrete scenes, use numbers and details.
- Keep energy high; vary sentence length; let one host push the other for precision.
- Target length: about 40 minutes.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/single-dad-dilemma.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/single-dad-dilemma.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=single-dad-dilemma --title="Single Dad Dilemma" --author="Carla Sorensen" --genre=romance
```
