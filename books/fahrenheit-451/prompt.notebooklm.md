# NotebookLM prompt — Fahrenheit 451 (Ray Bradbury)

**Slug:** `fahrenheit-451` · **Genre:** classics · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Fahrenheit 451" by Ray Bradbury.

THE ANGLE (this is what makes this episode unique):
- Lens: Voluntary Stupefaction & The Tyranny of Frictionless Pleasure — read Fahrenheit 451 not as a cautionary tale of top-down state censorship, but as an autopsy of cultural suicide where a population willingly surrendered deep thought, grief, and literacy in exchange for speed, sensory anesthesia, and harmless entertainment.
- Thesis to prove: Censorship was never imposed by a totalitarian tyrant — it was demanded by the public; the real terror of Fahrenheit 451 is that humanity chose mindless dopamine and painless numbness over the agonizing friction of thinking.
- Open on this idea: "We all remember the firemen burning books, but we forget the most terrifying reveal in Fahrenheit 451: the government never forced anyone to stop reading — the public begged for the fire."

BEATS TO ARGUE (one specific claim each, in order):
1. The Fireman’s Dopamine High: Guy Montag grinning with kerosene soot ("It was a pleasure to burn") introduces how spectacle, destruction, and sensory rush replace creative labor in a culture addicted to instant adrenaline.
2. Clarisse McClellan & The Threat of Stillness: The 17-year-old girl asking Montag "Are you happy?" while tasting rain and smelling autumn leaves exposes how stillness, curiosity, and unmedicated observation are classified as antisocial mental illness.
3. Mildred’s Seashell Narcotic: Mildred overdosing on thirty sleeping pills with buzzing radio Seashells in her ears while robotic technicians pump her stomach like a septic tank demonstrates a society drowning in unconscious despair masked by constant audio noise.
4. Beatty’s Anatomy of Surrender: Captain Beatty’s bedroom lecture reveals the historical machinery: mass media, fast cars, condensed digests, and hypersensitive special-interest factions eroded literature long before any law made burning official.
5. The Parlor Walls & Synthetic Kinship: Mildred’s three-wall interactive television family demanding scripted lines illustrates how simulated parasocial relationships cannibalize genuine human intimacy, empathy, and marital connection.
6. Faber’s Three Missing Pillars: The retired English professor Faber explains that books themselves hold no magic; what society starved to death are three specific necessities: texture of information, leisure to digest it, and the freedom to act on what you learn.
7. The Mechanical Hound & Algorithmic Terror: The eight-legged steel beast with a four-inch procaine needle programmed to track olfactory profiles proves that frictionless societies turn automated technology into a silent enforcer of absolute conformity.
8. Granger & The Living Books: The outcast intellectuals memorizing Ecclesiastes and Plato around a wilderness campfire as atomic bombers incinerate the city in three seconds proves that civilization survives not on printed paper, but as living memory passed between people.

RAISE THIS COUNTERPOINT: Bradbury’s critique risks slipping into reactionary anti-technology nostalgia — blaming radio earphones, television screens, and automobiles for spiritual rot ignores that electronic media can democratize knowledge and build communities print never could.

END BY REFRAMING: Bradbury wasn't predicting that an authoritarian regime would come to burn our libraries; he was warning us that we would happily burn them ourselves the second our screens gave us effortless, painless distraction.

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
1. Sesi indir → `public/audio/fahrenheit-451.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/fahrenheit-451.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=fahrenheit-451 --title="Fahrenheit 451" --author="Ray Bradbury" --genre=classics
```
