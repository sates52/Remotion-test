# NotebookLM prompt — Farsighted (Steven Johnson)

**Slug:** `farsighted` · **Genre:** nonfiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Farsighted: How We Make the Decisions That Matter the Most" by Steven Johnson.

LENS + THESIS: Read it as a book about imagination, not calculation. Thesis: our worst life-changing decisions fail BEFORE we choose - at the moment we accept that there are only two options. Phrase-that-pays: "widen the map before you choose."

STRUCTURE:
1. COLD OPEN (0:00-0:25): mid-thought - a young Charles Darwin, 1838, ruling a page into "Marry" and "Not Marry". No greetings.
2. THESIS, then SETUP: why the decisions that shape a life or a city get the least deliberate thought.
3. EIGHT BEATS, each one claim from the book, fully developed:
 1) Collect Pond: old Manhattan fills in its freshwater pond - a choice nobody really deliberated, and what grew on that ground.
 2) Franklin's "moral algebra" and Darwin's list: why writing it down helps, and what a pros-and-cons list cannot see.
 3) Mapping, the Abbottabad compound: months of deliberation in the room, more than two options on the table, the red team asked to argue it isn't him.
 4) Diversity of the group: why a mixed room surfaces what a like-minded one misses - and why it feels less comfortable.
 5) Predicting: scenario planning and Tetlock's forecasters - foxes beat hedgehogs; telling several futures instead of betting on one.
 6) The premortem: imagine it already failed and explain why.
 7) Deciding: weighing values openly - the book's own example of a family weighing a move across the country.
 8) Middlemarch: Dorothea's choice of Casaubon - fiction as a rehearsal space for the choices we only get to make once; then scale it up - climate, messages to the stars, choices made for people not yet born.
4. COUNTERPOINT: honest pushback - this deliberation needs time, a team and calm most people never get; can a premortem fix a midnight decision?
5. PAYOFF: reframe - farsightedness is not seeing further, it is seeing wider.

DEPTH ENGINE (EVERY beat): a) a present-tense scene with one sensory detail, voice the people; b) land it with an everyday decision a listener faces now - a job offer, a move, a relationship, a hire; c) a SECOND concrete example from the book; d) a real "wait - but then..." disagreement between hosts; e) tie back to the phrase-that-pays.

LENGTH: 45-60 minutes, never under 45; 4-6 real minutes per beat. Never pad: no repeating points, no restating the thesis, no filler or "as we said". Go deeper, not longer. If a beat runs dry, MOVE ON. Do not signal an ending before PAYOFF.

HARD RULES: English only (US). Two hosts who disagree and build on each other. ONLY facts from the book and its well-documented cases; NEVER invent quotes, numbers, studies or events - if unsure, stay general. Keep the Abbottabad beat on the deliberation, not the raid's violence. Never mention sources, notebook, documents or AI. No generic praise; prefer names, scenes, concrete choices.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/farsighted.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/farsighted.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=farsighted --title="Farsighted" --author="Steven Johnson" --genre=nonfiction
```
