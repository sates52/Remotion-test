# NotebookLM prompt — Outlive (Peter Attia)

**Slug:** `outlive` · **Genre:** health · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
Two hosts. A 45-60 minute deep, original analysis of "Outlive: The Science and Art of Longevity" by Peter Attia. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE (do NOT drift into a generic list of health tips): Thesis to prove - modern medicine is optimized for the wrong finish line. It's brilliant at stopping fast death, useless against slow death, and shows up 20 years too late to the four diseases that actually kill you. The recurring blade: the finish line was never "don't die" - it's whether the last decade is worth living, and you EARN that decade starting now.

PHRASE-THAT-PAYS (recur ~4x): "Train for your marginal decade."

COLD OPEN (0:00-0:25, mid-thought, no greeting): "Here's a number no doctor ever told you: if you're in the bottom 25% of fitness for your age, your risk of dying isn't a little higher than a smoker's - it's HIGHER than the smoker's. And almost nobody in medicine has ever measured yours."

BEATS (4-6 min each; one claim + one real case/number from the book; drop into the scene in present tense, one sensory detail, voice the people, THEN land it):
1. Medicine 2.0 vs Medicine 3.0 - the ambulance at the bottom of the cliff. Medicine 2.0 conquered fast death (trauma, infection) and is nearly helpless against slow death. Attia's arc: the surgeon trained to react, who realized reacting is the whole disease.
2. The Four Horsemen - heart disease, cancer, neurodegeneration, type 2 diabetes. You'll very likely die of one. But each is a decades-long process we misdiagnose as a sudden event: atherosclerosis is quietly building in your twenties.
3. apoB and "lower, earlier, longer." LDL cholesterol is a proxy; apoB is the actual particle doing the damage. The system waits for your first heart attack - which for many people IS the first symptom.
4. Metabolic health is the soil all four grow in. Insulin resistance runs silently for years before any diagnosis; only a small fraction of adults are truly metabolically healthy. The decade nobody measures.
5. Healthspan, not lifespan - the Centenarian Decathlon. Don't ask "how long?" Ask "what do I want to physically DO at 85?" - carry the grandkid, lift the bag overhead, get off the floor - then reverse-engineer the training now.
6. VO2 max and strength are the master levers. Go from the bottom fitness tier to just above it and cut mortality risk roughly in half - bigger than almost any drug. Grip and leg strength predict how you die.
7. Attia the agnostic on food and sleep - no tribe, no dogma. A protein floor, the three levers of eating, and sleep as non-negotiable rather than a weakness. Where he admits he was flat wrong.
8. The chapter he almost cut - emotional health. The optimizer winning every biomarker while his family flinched when he walked in. A long healthspan is worthless if you can't stand to be around yourself.

COUNTERPOINT (be honest): this can read as a program for the wealthy and obsessive - CGMs, DEXA scans, apoB panels, hours of Zone 2. Is it longevity, or anxiety with a lab bill? Attia is arguably the case study. Sit in that tension before resolving it.

CLOSER (reframe): the most data-driven longevity scientist alive spends his final chapter admitting the numbers were never the point. The finish line was never "don't die." Train for your marginal decade.

HARD RULES: English only. Use ONLY real facts/cases/numbers from the book - never invent quotes, studies, or figures; if unsure, stay general. Never mention "sources", "notebook", or that this is AI; never break character. No greetings, no health-listicle, no generic praise; prefer names, concrete scenes, numbers. Target 45-60 min (min 45): go DEEPER, never pad or repeat, don't signal an ending before the final reframe.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/outlive.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/outlive.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=outlive --title="Outlive" --author="Peter Attia" --genre=health
```
