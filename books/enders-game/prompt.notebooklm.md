# NotebookLM prompt — Ender's Game (Orson Scott Card)

**Slug:** `enders-game` · **Genre:** science-fiction · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
Two hosts. A 45-60 minute deep, original analysis of "Ender's Game" by Orson Scott Card. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE (do NOT drift into plot recap): Lens - empathy as a weapon. Thesis to prove - this is not the story of a gifted boy who saves humanity; it is the story of a society that learns the deadliest weapon is not cruelty but total understanding - to truly comprehend an enemy is to be able to annihilate them - so it manufactures the one child who can love his enemy completely, then hides the trigger so his conscience never gets a vote. Keep returning to that.

COLD OPEN (0:00-0:25, mid-thought, no greeting): "The kid who wiped out an entire alien species wasn't the cruelest child in the program. He was the most loving one. That was the whole point."

BEATS (4-6 min each; one claim + one concrete scene from the book):
1. Ender is engineered, not lucky - a "Third" bred as the midpoint between Peter (pure cruelty, rejected) and Valentine (pure mercy, rejected); the fleet wanted their fusion.
2. His violence is pre-emptive empathy - he destroys Stilson, then Bonzo, by modeling their entire future and erasing it, then weeps; the guilt is as real as the act.
3. His genius is reframing, not reflexes - "the enemy's gate is down" rewrites the null-gravity Battle Room; he wins by refusing the teachers' definition of the problem.
4. Graff weaponizes loneliness - engineered isolation strips Ender of every ally until understanding people becomes purely tactical. Cruelty as pedagogy.
5. The core paradox, his own words - "In the moment when I truly understand my enemy, I also love him." Understanding is not destruction's opposite; it is its prerequisite.
6. The Formics are our mirror - a hive mind that killed only because it could not conceive of individual minds, and stopped the instant it understood.
7. The final deception is the moral engine - Command School's "simulations" are the real war, hidden because Ender's conscience would refuse; his guilt is outsourced.
8. Speaker for the Dead is the answer - the last hive-queen's cocoon offers atonement; the empathy that made him the destroyer is the only thing that can carry the guilt.

COUNTERPOINT (be honest): the book may let Ender off too easily - every atrocity is a deception, so he carries infinite empathy and zero guilt; that can read as a power fantasy dressed as tragedy, even an alibi for atrocity ("I was manipulated"). Sit in that tension.

CLOSER (reframe): the scariest line isn't Ender's - it's the adults'. They built a child who could love the enemy enough to end them, and hid the knife so his love never stopped his hand. The real game was never Ender's; it was ours - how much of a person's soul we will spend to feel safe.

STORYTELLING: tell each scene like a master keynote storyteller - present tense, one vivid sensory detail, voice the people, THEN land the point. One recurring phrase-that-pays. One honest "wait - but then..." turn per beat where you genuinely disagree.

LENGTH (45-60 min, min 45): go DEEPER, never pad - no repeating, no restating the thesis, no filler; if a beat runs dry, move on. Do not signal an ending before the CLOSER.

HARD RULES: English only (US). Use ONLY facts from the book - never invent quotes, numbers, or events; if unsure, stay general. Never mention "sources", "notebook", or that this is AI; never break character - two people who cannot stop thinking about this book. No greetings, no plot-recap for its own sake, no generic praise.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/enders-game.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/enders-game.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=enders-game --title="Ender's Game" --author="Orson Scott Card" --genre=science-fiction
```
