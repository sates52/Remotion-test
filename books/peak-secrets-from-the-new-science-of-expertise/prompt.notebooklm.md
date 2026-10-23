# NotebookLM prompt — Peak: Secrets from the New Science of Expertise (Anders Ericsson & Robert Pool)

**Slug:** `peak-secrets-from-the-new-science-of-expertise` · **Genre:** psychology · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Peak: Secrets from the New Science of Expertise" by Anders Ericsson & Robert Pool.

THE ANGLE:
- Lens: "talent" is a story we tell after the fact. Thesis to prove: experts are not people who practiced MORE - they are people who practiced at the edge of failure until their brains built mental representations the rest of us never form. Comfortable practice does not slowly help you; it quietly locks you at a plateau. Phrase-that-pays: "Comfort is where improvement stops."

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought - an ordinary student, digits read aloud one per second, stuck at seven... then, two hundred hours later, recalling eighty-two. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the argument above in plain words.
3. SETUP: the old story (gifted vs. ungifted) vs. Ericsson's claim - the body and brain adapt to whatever demand you place on them.
4. BEATS (8, each one argued claim, staged as an everyday person the listener can picture):
 B1 Perfect pitch is learned: the Tokyo study where ordinary young children trained into it - the "gift" was a training window.
 B2 The memory student: no special brain, just strategies he invented under pressure, and every wall he hit.
 B3 Naive vs. purposeful practice: why twenty years of playing tennis or driving makes you no better - automaticity freezes skill.
 B4 Deliberate practice: a teacher, a specific goal, immediate feedback, effort just past what you can do.
 B5 The brain rebuilds itself: London cab drivers learning the city and their growing hippocampus; adaptation is a cost the body pays only when pushed.
 B6 Mental representations: what a chess master, a doctor, a reader actually "see" that novices can't - and how you build them.
 B7 The 10,000-hour myth: what the Berlin violin study really found, and how the popular rule bent it.
 B8 Experience isn't expertise: why years on the job can make professionals worse, and what training that works looks like (feedback loops, plateaus broken on purpose, a self-taught writer copying and rebuilding essays).
5. COUNTERPOINT: does the book wave away genes and luck too fast? Does deliberate practice exist only in fields with teachers and clear scores? Let one host push hard.
6. PAYOFF: reframe - the question is never "do I have the gift?" but "where is my edge, and am I standing on it?"

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
1. Sesi indir → `public/audio/peak-secrets-from-the-new-science-of-expertise.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/peak-secrets-from-the-new-science-of-expertise.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=peak-secrets-from-the-new-science-of-expertise --title="Peak: Secrets from the New Science of Expertise" --author="Anders Ericsson & Robert Pool" --genre=psychology
```
