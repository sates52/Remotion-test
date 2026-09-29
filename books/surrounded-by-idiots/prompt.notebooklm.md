# NotebookLM prompt — Surrounded by Idiots (Thomas Erikson)

**Slug:** `surrounded-by-idiots` · **Genre:** nonfiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Surrounded by Idiots" by Thomas Erikson. English only, natural US conversation — argue, interrupt, build on each other, think out loud.

THE ANGLE (this is what makes this episode unique):
- Lens: communication as a translation problem — "idiots" are mistranslations, not stupid people
- Thesis to prove: Erikson's real claim is not that people fall into four boxes — it is that almost every conflict at work and home is a color collision: you speak your own color and judge everyone else for not hearing it. Learn to read the color, translate your message, and the "idiots" disappear.
- Open on this idea: "What if the reason you feel surrounded by idiots is that you're broadcasting on the wrong frequency — and everyone else thinks YOU'RE the idiot?"

BEATS TO ARGUE (one specific claim each, in order):
1. The grid: two axes (task-vs-people, reserved-vs-outgoing) make Red, Yellow, Green, Blue. Nobody is pure — one or two colors dominate.
2. RED: speed, results, control. Decides fast, hates small talk, steamrolls Greens without noticing.
3. YELLOW: energy, stories, applause. Inspires rooms, starts five projects, finishes one; chaos to Blue eyes.
4. GREEN: stability, kindness, quiet stubbornness. Keeps teams alive, avoids conflict, says yes then resists change silently.
5. BLUE: logic, quality, preparation. Needs facts and time; Blue questions feel like attacks to Yellows, but Blue caution saves Red recklessness.
6. Under stress masks slip: Reds explode, Yellows joke-deflect, Greens withdraw, Blues turn cold-critical. Name the color in seconds.
7. Read people fast: pace, voice, posture, email style. Two minutes of observation beats a test.
8. Adapt without faking: Reds get the bottom line, Yellows energy plus recognition, Greens time plus safety, Blues data plus space. Same message, four translations.

RAISE THIS COUNTERPOINT: Four colors is blunt DISC repackaged with thin science — labels can excuse or wound ("he's just a Red"). Does it still earn its keep as a tool even if the science is soft?

END BY REFRAMING: Never surrounded by idiots — surrounded by untranslated colors. Ask "what color are they hearing" and every difficult person becomes solvable.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought on the single most provocative idea. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the one argument this whole discussion will prove.
3. SETUP: who/what the book puts in play (concrete names, stakes).
4. BEATS: 8 beats, each ONE specific claim from the book. DEVELOP each beat fully before moving on — do NOT list them quickly.
5. COUNTERPOINT: one honest criticism — where the book strains or a reader pushes back.
6. PAYOFF: land the thesis on a line that reframes everything said before.

DEPTH ENGINE (run this on EVERY beat — this is how the episode earns its length):
a) drop us into a scene in present tense with one vivid sensory detail; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example, number, or angle from the book;
d) take one honest "wait - but then..." turn where the two hosts genuinely disagree;
e) tie it back to the recurring phrase-that-pays before moving to the next beat.

LENGTH (target 45-60 minutes, minimum 45 — never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. Do NOT repeat a point you already made, do NOT restate the thesis over and over, do NOT stall with filler, throat-clearing, or "as we said earlier". Earn the length by going DEEPER, not longer on the same ground: a fresh example, a sharper objection, a genuine disagreement between the two hosts, a real "wait — but then..." turn. If you truly run out of things to say about a beat, MOVE ON rather than recycle it. Sound like two sharp people who honestly can't stop talking about this book — not a summary stretched to fill time. Do NOT signal an ending ("to wrap up", "in short", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the book and its real, well-documented cases. NEVER invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — you are two people who could not stop thinking about this book.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, numbers.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/surrounded-by-idiots.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/surrounded-by-idiots.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=surrounded-by-idiots --title="Surrounded by Idiots" --author="Thomas Erikson" --genre=nonfiction
```
