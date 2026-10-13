# NotebookLM prompt — Beloved (Toni Morrison)

**Slug:** `beloved` · **Genre:** fiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Beloved" by Toni Morrison.

THE ANGLE:
- Non-obvious lens: "Beloved" is a ghost story whose real haunting is the ledger: what slavery counted as property, and what a mother counted as love.
- Arguable thesis: Morrison makes the reader do the accounting the characters were forced to do, so the novel's horror lives in arithmetic, not in the ghost.
- Cold open, mid-thought: "Sethe chose a grave over a bill of sale, and the book spends three hundred pages asking whether that was love or arithmetic."

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought on the single most provocative idea. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the one argument this whole discussion will prove.
3. SETUP: who/what the book puts in play (concrete names, stakes).
4. BEATS: 8 beats, each ONE specific claim from the book. DEVELOP each beat fully before moving on — do NOT list them quickly. Beat ideas, all grounded in the text: (1) 124 Bluestone Road as a house that keeps its own accounts; (2) the chokecherry tree scar on Sethe's back, read as a ledger entry; (3) Paul D's tin box and the bit in his mouth as the cost of being owned; (4) Sethe's "best thing" and the claim of the ones you love; (5) Denver's walk to the stone steps and the community that comes back; (6) Baby Suggs and the Clearing sermon on the body as the only thing you own; (7) the schoolteacher's visit as the moment the sum is finally paid; (8) the ending's "This is not a sad story," and who the book asks to remember. Use only what the book actually says; stay general on any detail you are unsure of.
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
- The killing of Sethe's baby daughter is analysed as a moral and structural event only. Never dwell on graphic detail, never glamorise it, never describe the child's suffering.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, numbers.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/beloved.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/beloved.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=beloved --title="Beloved" --author="Toni Morrison" --genre=fiction
```
