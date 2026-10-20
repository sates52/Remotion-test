# NotebookLM prompt — As Good As Dead (Holly Jackson)

**Slug:** `as-good-as-dead` · **Genre:** mystery · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "As Good As Dead" by Holly Jackson.

THE ANGLE:
- Thesis: "As Good As Dead" is not the resolution of Pip Fitz-Amobi's amateur detective arc—it is a forensic dissection of how the obsessive pursuit of justice systematically destroys the moral architecture of the seeker until she becomes indistinguishable from the monsters she exposed.
- Tone & Lens: Psychological deconstruction, legal and moral catastrophe, trauma-fueled culpability, and the illusion of closure. Analyze critically without glamorizing violence or panic.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): Open mid-thought: "The moment Pip realizes the police won't investigate her stalker isn't a plot convenience—it's the exact hinge where the system forces an amateur sleuth to either accept her own murder or become a premeditated killer."
2. THESIS: Argue that the novel detonates the cozy amateur-detective myth by proving true justice within a broken legal system requires calculated criminality and framing another predator to survive.
3. SETUP: Pip Fitz-Amobi, traumatized by the Andie Bell and Jamie Reynolds investigations, addicted to Lexapro and sleepless vigilance, finding chalk stick figures on her driveway and headless pigeons on her doorstep while Little Kilton police officer Hawkins waves her off.
4. BEATS (8 argued beats, fully developed with concrete book details):
   - Beat 1 (The Paranoia Tax): The physical and mental toll of hyper-vigilance—the recurring chalk figures, headless pigeons, and anonymous online threats that strip away Pip's college future, showing how investigative obsession leaves a person completely defenseless against real predation.
   - Beat 2 (Institutional Complicity & The Duct-Tape Killer): Connecting Andie Bell’s past case to a six-year pattern of missing local women; proving Jason Bell is the serial predator while the police department buried evidence to preserve their closed case clearance rates.
   - Beat 3 (The Abduction in the Woods): The visceral transition from investigator to captive—Pip being ambushed, bound with duct tape in an abandoned warehouse, confronting the reality that deduction and intellect cannot negotiate with a sadistic predator.
   - Beat 4 (The Act of Lethal Self-Preservation): Killing Jason Bell with a hammer—not in heroic triumph, but in suffocating, raw survival, immediately followed by the terrifying realization that the justice system will convict her for manslaughter instead of believing her story.
   - Beat 5 (The Forensic Counter-Investigation): The inverted mystery where Pip uses every forensic trick, timeline manipulation, and alibi construction learned across three books to stage a suicide and sanitize a crime scene against her own town's investigators.
   - Beat 6 (The Moral Sacrifice of Ravi Singh): Pulling Ravi into the conspiracy—the heartbreak of watching an innocent, loving partner forfeit his own integrity and legal innocence to become an accomplice in an elaborate cover-up.
   - Beat 7 (Framing the Unpunished): The calculated decision to pin Jason Bell's death on Max Hastings—exploiting a rapist's legal immunity and unpunished crimes to balance a broken moral ledger, trading one miscarriage of justice for another.
   - Beat 8 (The Price of Immunity): The painful isolation of survival—severing ties with Ravi, enduring the silence, and recognizing that beating the system cost Pip her humanity, her community, and her peace.
5. COUNTERPOINT: Address the reader's resistance to Pip's radical turn—does framing Max Hastings make her irredeemable, or does it unmask the hypocrisy of readers who demand justice only when it remains tidy and clean?
6. PAYOFF: Reframe the entire trilogy: Pip never solved mysteries to heal Little Kilton; she dug into darkness until the town's rotten institutional machinery demanded she either die a victim or survive as the ultimate orchestrator.

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
1. Sesi indir → `public/audio/as-good-as-dead.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/as-good-as-dead.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=as-good-as-dead --title="As Good As Dead" --author="Holly Jackson" --genre=mystery
```
