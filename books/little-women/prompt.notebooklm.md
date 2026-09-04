# NotebookLM prompt — Little Women (Louisa May Alcott)

**Slug:** `little-women` · **Genre:** classics · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Little Women" by Louisa May Alcott.

THE ANGLE (this is what makes this episode unique):
- Lens: the economics of goodness — money, female labor, and the price of being "good."
- Thesis to prove: "Little Women" is a quiet war between the book Alcott was paid to write — a moral guide for girls — and the book she couldn't help writing: a portrait of a woman who wants work, money, and freedom more than she wants love. Jo March is literature's first modern career woman smuggled inside a Christmas story.
- Open on this idea: "The first line of the most beloved book about sisters isn't about love — it's about money: 'Christmas won't be Christmas without any presents.'"

BEATS TO ARGUE (one specific claim each, in order):
1. Poverty is the engine, not the backdrop — the Marches are genteel poor, and nearly every "moral lesson" is really a lesson about money, gifts they can't afford, and a father absent at war.
2. Goodness is a performance imposed on them — the girls literally play "Pilgrim's Progress," carrying pretend burdens; virtue is a game Marmee assigns, not something they simply have.
3. The little women earn — Jo sells her hair for twenty-five dollars to send Marmee to their wounded father; Meg governesses, Amy trades limes at school; female labor keeps the family alive.
4. Beth is the impossible ideal Alcott has to kill — the sister who never wants anything for herself is "too good to live"; her death is the true cost of pure selflessness.
5. Amy is the misread sister — she burns Jo's only manuscript, marries Laurie, sails to Europe; she reads the marriage market as economics, and the novel quietly rewards her pragmatism.
6. Jo refuses Laurie — the great subversion: she turns down the romance every reader craves because she won't be absorbed into a man's world; she wants a garret and a pen more than a rich husband.
7. Professor Bhaer talks Jo out of her most profitable work — she burns her lucrative "sensation" stories for "respectable" writing, mirroring Alcott, who wrote anonymous potboilers to pay the bills.
8. The marriage ending is a reluctant compromise — Alcott married Jo to "the funny match" to spite readers who demanded Laurie; the "happy" ending is a negotiated defeat, not a wish granted.

RAISE THIS COUNTERPOINT: the subversive reading can be overstated — Alcott genuinely believed in duty and domestic warmth; the tenderness isn't only a Trojan horse, and Bhaer can be read as a real intellectual equal rather than a punishment.

END BY REFRAMING: the book endures not because it's cozy but because it's honest about the cost of being good — and every generation that still wishes Jo had married Laurie only proves Alcott's point about what the world demands of women.

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
1. Sesi indir → `public/audio/little-women.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/little-women.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=little-women --title="Little Women" --author="Louisa May Alcott" --genre=classics
```
