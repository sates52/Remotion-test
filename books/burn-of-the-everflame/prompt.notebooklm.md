# NotebookLM prompt — Burn of the Everflame (Penn Cole)

**Slug:** `burn-of-the-everflame` · **Genre:** fantasy · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Burn of the Everflame" by Penn Cole, the fourth and final book of the Kindred's Curse series.

THE ANGLE:
- Build the discussion around one arguable thesis: a crown's loyalty is tested hardest not on the battlefield but in the bond she cannot choose. Prove it through the war, the rebellion and the private stakes, not a plot recap.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought on the most provocative idea. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the one argument this whole discussion will prove.
3. SETUP: who and what is in play: a continent at war, a northern army, a southern rebellion, and the Crowns of Lumnos forced into an uneasy alliance.
4. BEATS: 8 beats, each ONE specific claim about the book. DEVELOP each beat fully before moving on — do NOT list them quickly.
5. COUNTERPOINT: one honest criticism, where the book strains or a reader pushes back.
6. PAYOFF: land the thesis on a line that reframes everything said before.

DEPTH ENGINE (run this on EVERY beat — this is how the episode earns its length):
a) drop us into a moment in present tense with one vivid image of the war or the Everflame; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example or angle from the book;
d) take one honest "wait - but then..." turn where the two hosts genuinely disagree;
e) tie it back to the recurring idea of the bond before moving to the next beat.

LENGTH (target 45-60 minutes, minimum 45 — never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. Do NOT repeat a point, do NOT restate the thesis over and over, do NOT stall with filler or "as we said earlier". Earn the length by going DEEPER: a fresh example, a sharper objection, a genuine disagreement, a real "wait — but then..." turn. If you run out of things to say about a beat, MOVE ON. Sound like two sharp people who honestly can't stop talking about this book. Do NOT signal an ending ("to wrap up", "in short", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts you can verify from the book. NEVER invent quotes, names, numbers, or events; if unsure of a detail, stay general instead of fabricating.
- Describe the violence in war and death as consequence and cost, never as lingering gore.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — you are two people who could not stop thinking about this book.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, sacrifices.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/burn-of-the-everflame.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/burn-of-the-everflame.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=burn-of-the-everflame --title="Burn of the Everflame" --author="Penn Cole" --genre=fantasy
```
