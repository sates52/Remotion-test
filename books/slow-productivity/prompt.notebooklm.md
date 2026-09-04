# NotebookLM prompt — Slow Productivity: The Lost Art of Accomplishment Without Burnout (Cal Newport)

**Slug:** `slow-productivity` · **Genre:** productivity · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
Two hosts. A 45-60 minute deep, original analysis of "Slow Productivity: The Lost Art of Accomplishment Without Burnout" by Cal Newport. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE (do NOT drift into a generic "work less" listicle): Thesis to prove - your burnout is not a willpower problem, it's a measurement error. Knowledge work never invented a way to measure real output, so it defaulted to measuring the only thing it CAN see: visible activity. That single accounting mistake - the book calls it "pseudo-productivity" - is what's grinding you down. The escape isn't discipline; it's refusing to be measured by the wrong ruler.

PHRASE-THAT-PAYS (recur ~4x): "The busyness was always a performance."

COLD OPEN (0:00-0:25, mid-thought, no greeting): "Isaac Newton took the better part of two decades to finish the book that invented modern physics - and spent chunks of those years just gardening and grinding lenses by hand. By every metric your job runs on, Newton would be on a performance improvement plan. So maybe the metric is the problem, not you."

BEATS (4-6 min each; one claim + one real figure from the book; drop into the scene in present tense with one sensory detail, THEN land it):
1. The wrong ruler gets invented. Peter Drucker names the "knowledge worker," hands them autonomy but no way to measure output. Into that vacuum steps pseudo-productivity: visible activity as a stand-in for value. The office becomes a stage where looking busy IS the job.
2. Then we tore down the walls. Email, Slack, remote work turn the stage into a 24/7 broadcast - the book cites a knowledge worker checking email or a messenger roughly once every six minutes. Busyness stops being a proxy for the work and becomes the entire work.
3. Principle 1 - Do fewer things. The hidden killer is the overhead tax: every project you accept drags its own meetings, threads, admin. Pile on enough and overhead alone eats the day; the real work never gets touched. Not less work - fewer fronts at once.
4. The Jane Austen correction. The myth: she dashed off masterpieces in stolen moments between chores. The truth in the book: she was barely productive until the family moved to Chawton and others took the household off her - fewer things, and only THEN the novels poured out.
5. Principle 2 - Work at a natural pace. Newton's two decades, Galileo's slow years - real knowledge work has always pulsed: intense bursts, long fallow stretches. The always-on grind isn't a standard we fell short of; it's the historical freak. Vary intensity over seasons, not hours.
6. The long timeline, made concrete. Georgia O'Keeffe's seasonal rhythm in New Mexico; Lin-Manuel Miranda reading a Hamilton biography on an actual vacation - the seed of a musical that needed years. Rest wasn't the enemy of the work; it was the soil for it.
7. Principle 3 - Obsess over quality, the escape hatch. John McPhee lies on a picnic table for two weeks just to find the STRUCTURE of one article. Get good enough and quality buys leverage - the right to say no. Jewel, broke and courted by labels, turns down a huge advance to protect the long game.
8. Andrew Wiles in the attic. Seven years of secret, invisible work on Fermat's Last Theorem - zero measurable output the whole time, then one of the century's great results. The purest refutation of the ruler: what mattered was never once visible on it.

COUNTERPOINT (be honest, sit in it): this can read as a manifesto for the privileged. The tenured professor and the freelancer with leverage CAN slow down. The nurse, the warehouse picker, the junior whose boss counts Slack messages cannot. Newport half-admits it targets workers who already have autonomy. Is slow productivity a solution - or a luxury good? Don't resolve it cheaply.

CLOSER (reframe): Newton wasn't underperforming. He measured the only thing that ever mattered - the work itself - and ignored the ruler that couldn't see it. Everything the office calls productivity was always a performance for an instrument that can't detect value. So stop performing productivity. Go make one thing worth the wait.

HARD RULES: English only. Use ONLY real facts/cases/figures from the book - never invent quotes, studies, or numbers; if unsure of a detail, stay general instead of fabricating. Never mention "sources", "notebook", or that this is AI; never break character - you are two people who can't stop arguing about this book. No greetings, no productivity-listicle, no generic praise; prefer names, concrete scenes, specifics. Target 45-60 min (min 45): go DEEPER, never pad or repeat, don't signal an ending before the final reframe.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/slow-productivity.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/slow-productivity.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=slow-productivity --title="Slow Productivity: The Lost Art of Accomplishment Without Burnout" --author="Cal Newport" --genre=productivity
```
