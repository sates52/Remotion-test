# NotebookLM prompt — The Frozen River (Ariel Lawhon)

**Slug:** `the-frozen-river` · **Genre:** historical-fiction · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "The Frozen River" by Ariel Lawhon.

THE ANGLE (non-obvious lens):
- The murder mystery (who killed Joshua Burgess, found frozen in the Kennebec) is the decoy. The real subject is EVIDENCE: who is allowed to produce it and who is allowed to be believed. In 1789 Maine a woman can't vote, can't sit a jury, and her testimony needs a man to corroborate it — yet the one person who can read the dead body and keep the town's only reliable record is a 54-year-old midwife, Martha Ballard, whose diary is a REAL historical document.
- ONE ARGUABLE THESIS to prove all episode: justice in early America was decided not in the courthouse but in the birthing room — a midwife's hands and her diary were a more honest evidence system than the official court, because the official one was built to discount women. Martha wins not with a weapon or a speech but by writing everything down.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): mid-thought — Martha over Burgess's body frozen into the river, called not to mourn but to examine. Land the paradox: the town won't let her testify, but needs her to read the corpse. No greetings.
2. THESIS: state the argument above.
3. SETUP: Hallowell, Maine, winter 1789. Martha Ballard, midwife. Rebecca Foster's rape accusation against Judge Joseph North and Col. Joshua Burgess; Burgess turns up dead. Stakes: a woman's word against two of the most powerful men in the county.
4. BEATS (8, each ONE claim, developed fully — do NOT list quickly): (1) The corpse is a document — Martha's examination makes the body testify when she can't. (2) The diary as the town's real ledger — decades of entries outlast every man's account. (3) Rebecca Foster and the corroboration trap — a woman's word requires a man to confirm it. (4) Midwifery as forensic authority — Martha's empirical knowledge vs. Dr. Page's credentialed guessing. (5) Judge Joseph North — power that writes the law it breaks; conflict of interest on the bench. (6) The trial — how the legal machine grinds a woman's truth down. (7) The cost of witness — Martha's own family and everything she stands to lose; not a lone hero. (8) The verdict of the record — history remembers because she wrote it down.
5. COUNTERPOINT: one honest criticism — Martha can read anachronistically modern and certain, the powerful men near-cartoonish; a reader can argue the novel flatters a 21st-century audience instead of sitting in 18th-century murk.
6. PAYOFF: reframe the mystery — the question was never who killed Burgess; it was who gets to be believed, and the answer was in a woman's diary all along.

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
1. Sesi indir → `public/audio/the-frozen-river.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/the-frozen-river.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=the-frozen-river --title="The Frozen River" --author="Ariel Lawhon" --genre=historical-fiction
```
