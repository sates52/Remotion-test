# NotebookLM prompt — Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered (Austin Kleon)

**Slug:** `show-your-work` · **Genre:** creativity · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
Two hosts. A 45-60 minute deep, original analysis of "Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered" by Austin Kleon. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE: Thesis to prove - Austin Kleon's book is not a social media marketing playbook; it is an assault on the romantic myth of the lone genius. In a hyper-connected world, obscurity—not failure or criticism—is the fatal trap for creators. Artistic value is not built by hoarding secrets in isolation, but by embracing the radical generosity of a "scenius" where documenting your messy daily process becomes the work itself. Phrase-that-pays: "Process over product."

COLD OPEN (0:00-0:25, mid-thought, no greeting): "The most destructive lie in creative work is that you have to vanish into a cabin for two years and emerge with a masterpiece. If you wait until you're a certified genius to show your work, you will die in complete obscurity."

BEATS (4-6 min each; argue one claim + ground it in Kleon's exact text & real anecdotes):
1. The Death of the Lone Genius & Brian Eno's "Scenius": Dismantling the solitary master myth. Eno's insight that great art emerges from an ecology of talent, amateur enthusiasm, and communal friction. Why amateur spirit beats professional turf protection every time.
2. Become a Documentarian of Your Own Process: Shifting from product to process. Otto Treumann's work journals and David Foster Wallace's scrap heaps. Why the sawdust and sketches on the studio floor are often more magnetic than the polished painting.
3. The Daily Dispatch & The "So What?" Filter: Committing to one small dispatch every 24 hours. The compound interest of 365 visible iterations versus the vanity of a polished resume. Using the ruthless "So what?" test to ensure generous sharing instead of self-indulgent noise.
4. Open the Cabinet of Curiosities: Resisting the impulse to hoard influences. Susan Sontag's lists and honoring cultural debts. Why having the courage to celebrate your weird, idiosyncratic obsessions builds an authentic fingerprint long before technical mastery.
5. Tell Good Stories & The Power of Context: Work never speaks for itself; human beings crave narrative arcs. The structural trio of Pitch, Story, and Explanation. George Orwell's cup of tea and why explaining the labor behind an artifact gives it emotional value.
6. Teach What You Know & Share Trade Secrets: The chef who openly publishes his secret recipes. Why teaching does not create rivals, it creates an devoted tribe. Scarcity mindset hoards knowledge; creative abundance understands that recipes don't equal execution.
7. The Vampire Test & Never Becoming Human Spam: Derek Sivers' litmus test: if interacting with someone leaves you spiritually and creatively drained, cut them off. The crucial difference between an active community participant and a self-absorbed human broadcast tower.
8. Selling Out, Buying In, & The Chain-Smoke Rule: Passing the hat without shame and the irreplaceable value of an owned email list. Why you must "chain-smoke" projects—lighting the next spark from the embers of the last—to survive the paralyzing post-launch hangover.

COUNTERPOINT: Push back honestly - doesn't broadcasting every raw, unpolished doodle erode the mystique of great art? If everyone floods the feed with their messy drafts, don't we drown the world in self-indulgent amateur noise while neglecting the silent, monastic discipline required for true mastery?

CLOSER: You don't share your work because you've arrived; you share your work so you can find the fellow travelers you were meant to create with. Stop waiting for permission to exist.

STORYTELLING STYLE: Master-keynote storytelling. Drop us into vivid scenes in present tense (the ink-stained desk, the terror of pressing publish on an unfinished sketch, the silence of an empty inbox). Allow honest friction: "Wait - but what if you put your trade secrets out there and somebody blatantly rips you off?"

LENGTH (target 45-60 min, minimum 45): Give each beat 4-6 real minutes. Do not pad, stall, or repeat. Earn the runtime by exploring Kleon's examples deeply and testing each other's skepticism. Do not wrap up before the final payoff.

HARD RULES: English only. Use ONLY ideas and cases from the book - never fabricate. Never mention "sources", "notebook", or AI; you are two thinkers obsessed with Kleon's ideas.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/show-your-work.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/show-your-work.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=show-your-work --title="Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered" --author="Austin Kleon" --genre=creativity
```
