# NotebookLM prompt — Little Fires Everywhere (Celeste Ng)

**Slug:** `little-fires-everywhere` · **Genre:** fiction · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Little Fires Everywhere" by Celeste Ng.

THE ANGLE (this is what makes this episode unique):
- Lens: planned order as a form of violence — the moral blindness of the person who follows every rule.
- Thesis to prove: the real danger in this book isn't cruelty, it's the well-meaning rule-follower who mistakes her own comfort for justice. Elena Richardson never breaks a single rule and still burns three lives down — the book's argument is that there is no such thing as a neutral rule, and "good intentions" is exactly how the powerful stay innocent.
- Open on this idea: "Nobody in this book commits a crime. Elena Richardson follows every rule, means well the entire time — and still burns three lives to the ground."

BEATS TO ARGUE (one specific claim each, in order):
1. Shaker Heights is the first character, not a setting: a town that zones the color of your house, times your lawn, plans your life for your own good. Ng opens on planning-as-worldview — the order is the ideology the whole book will put on trial.
2. The house burns in the first sentence. Ng gives away the ending on purpose, so the suspense was never "what happens" — it's moral: who lit the little fires, and were they right to. Structure IS the thesis.
3. Mia vs. Elena isn't artist-vs-suburbanite, it's two theories of motherhood. Elena planned her four children like a project on schedule; Mia kept Pearl by walking away from the couple who paid her to carry the baby. The book asks which one is the "real" mother — and refuses the comfortable answer.
4. The custody trial — Bebe Chow, a poor Chinese immigrant birth mother, vs. the wealthy white McCulloughs over the baby they call Mirabelle and she calls May Ling — is the engine. Ng stacks it so the "reasonable," well-resourced verdict is the cruel one, and everyone stays polite while doing it.
5. Elena driving to Pennsylvania to dig up Mia's past is the sharpest move in the book: her surveillance is indistinguishable from care. She investigates a woman entirely out of "concern" and never once sees that concern and control are the same act.
6. Izzy — the daughter Elena has written off as the unstable problem child — is the only one who sees clearly. The family's designated chaos was actually its conscience; the "crazy" one is the moral center.
7. The children quietly inherit the poison. Pearl craves the ordered Richardson world; Lexie borrows Pearl's name to get an abortion; Trip and Moody both reach for Pearl. The parents' values reproduce themselves in the next generation without anyone deciding to pass them on.
8. The ending refuses catharsis: Izzy lights the fires and leaves, Mia and Pearl vanish again, and Elena still doesn't understand what she did. Order didn't lose to chaos — it was exposed as the arson all along.

RAISE THIS COUNTERPOINT: the novel can be schematic — Elena is almost too perfectly the villain of good intentions and Mia almost too perfectly the free artist; the class-and-race binary is drawn cleanly enough that some readers feel the trial was rigged by the author, not just by Shaker Heights.

END BY REFRAMING: the title was never about the one house that burned — every character has been setting little fires all along. Izzy just used a match instead of politeness.

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
1. Sesi indir → `public/audio/little-fires-everywhere.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/little-fires-everywhere.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=little-fires-everywhere --title="Little Fires Everywhere" --author="Celeste Ng" --genre=fiction
```
