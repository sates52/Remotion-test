# NotebookLM prompt — Creativity (Mihaly Csikszentmihalyi)

**Slug:** `creativity` · **Genre:** psychology · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Creativity: The Psychology of Discovery and Invention" by Mihaly Csikszentmihalyi.

THE ANGLE:
- Build the discussion around one arguable thesis: creativity is not a gift a few people are born with. It is a system. A person, a field of gatekeepers who decide what counts as new, and a domain of knowledge all have to line up before an idea is creative at all. Argue whether that makes creativity less mysterious or more mysterious.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought on the claim that the most creative people are often the most playful and the most disciplined at once. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the one argument this whole discussion will prove.
3. SETUP: what the book puts in play: the author's long study of exceptionally creative people, and the question of where a new idea actually comes from.
4. BEATS: 8 beats, each ONE specific claim from the book. DEVELOP each beat fully before moving on. Do NOT list them quickly.
5. COUNTERPOINT: one honest criticism, where the systems view strains or a reader pushes back.
6. PAYOFF: land the thesis on a line that reframes everything said before.

DEPTH ENGINE (run this on EVERY beat):
a) drop us into a scene in present tense with one vivid, ordinary detail: a studio at night, a lab bench, a kid with a notebook; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example, number, or angle from the book;
d) take one honest "wait, but then..." turn where the two hosts genuinely disagree;
e) tie it back to the recurring phrase-that-pays before moving to the next beat.

LENGTH (target 45-60 minutes, minimum 45, never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. Do NOT repeat a point you already made, do NOT restate the thesis over and over, do NOT stall with filler or "as we said earlier". Earn the length by going DEEPER: a fresh example, a sharper objection, a genuine disagreement. If you run out of things to say about a beat, MOVE ON. Do NOT signal an ending ("to wrap up", "in short", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation: disagree, interrupt, build on each other.
- Use ONLY facts from the book and its real, well-documented cases. NEVER invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, numbers.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/creativity.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/creativity.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=creativity --title="Creativity" --author="Mihaly Csikszentmihalyi" --genre=psychology
```
