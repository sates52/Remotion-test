# NotebookLM prompt — Nobody Wants to Read Your Sh*t (Steven Pressfield)

**Slug:** `nobody-wants-to-read-your-sh-t` · **Genre:** writing · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Nobody Wants to Read Your Sh*t" by Steven Pressfield.

THE ANGLE:
- Lens: The reader is not your audience, the reader is your adversary. Every page is a negotiation with someone actively looking for a reason to stop.
- Thesis to prove: Most writing advice tells you to find your voice; Pressfield argues the opposite. Self-expression is the problem. The writer's real job is empathy turned into structure: hook, build, payoff, a clear concept, a theme, a villain. And that same structure holds for an ad, a screenplay, a novel and a self-help book.
- Open on this idea: "The kindest thing anyone ever told you about your writing is that nobody wants to read it. Once you believe that, you start writing things people can't put down."

BEATS TO ARGUE (one specific claim each, in order):
1. The Ad Agency Lesson: a young writer learns his copy is invisible. Nobody wants to read an ad, so you earn every second. What that does to the ego, and why it's the most useful humiliation a writer can get.
2. Concept Before Copy: the big idea comes before any clever sentence. Why most failed pieces have no concept at all, only words.
3. What Is It ABOUT? Theme as the hidden spine. Every scene, every chapter, every argument has to answer one question. If you can't say it in a line, the reader can't feel it.
4. Hollywood's Three Acts: the screenwriting years teach hook, build, payoff. Why a beginning, middle and end is a contract with the reader, not a formula.
5. The Villain Makes the Hero: a story is only as strong as its antagonist. The hero must be the one who solves the crisis, and the villain needs a face and a goal.
6. The Inciting Incident: the moment the reader's question gets planted. Without it, there is no reason to turn the page.
7. Nonfiction Is a Story Too: Pressfield's own The War of Art works because it has a villain (Resistance), a hero (the artist) and stakes. A self-help book, a memo or a pitch lives or dies by the same structure.
8. The Professional Mindset: put yourself in the reader's chair, write the bad first draft, cut what's self-indulgent, ship it. Resistance gets loudest right before the finish line.

RAISE THIS COUNTERPOINT: Structure can become a straitjacket. Many works people love break the hook-build-payoff mold, and a writer who obsesses over the reader's attention can end up writing for the algorithm instead of for the truth.

END BY REFRAMING: "Nobody wants to read your sh*t" isn't contempt for the reader, it's respect. The moment you stop asking to be read and start earning it, your writing turns from a diary into a gift.

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
1. Sesi indir → `public/audio/nobody-wants-to-read-your-sh-t.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/nobody-wants-to-read-your-sh-t.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=nobody-wants-to-read-your-sh-t --title="Nobody Wants to Read Your Sh*t" --author="Steven Pressfield" --genre=writing
```
