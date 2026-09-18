# NotebookLM prompt — Wool Omnibus (Hugh Howey)

**Slug:** `wool-omnibus` · **Genre:** science-fiction · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Wool Omnibus" by Hugh Howey.

THE ANGLE (this is what makes this episode unique):
- Lens: The Architecture of Compliant Dying — how the Silo turns hope into an execution weapon to preserve totalitarian equilibrium.
- Thesis to prove: Wool is not an escape story about a toxic post-apocalyptic wasteland — it is an indictment of the lie that human survival requires engineered blindness. The Silo's ultimate weapon is not its lethal air or its secret police, but the green pastoral illusion projected onto the cleaner's visor: the regime makes death feel like revelation so dissidents eagerly scrub the cameras for the citizens inside, maintaining the very prison they believe they are dismantling.
- Open on this idea: "Every single person who swore they would never clean the sensors ended up scrubbing the glass — because hope is the regime's deadliest execution tool."

BEATS TO ARGUE (one specific claim each, in order):
1. Holston's opening descent through the 144 levels establishes the Silo's physical verticality as psychological control — gravity itself enforces caste, keeping Mechanical trapped two exhausting days below IT in the grease and noise of the Down Deep.
2. Allison's discovery of the forbidden pre-Silo server drive reveals the regime's original sin: the Founders didn't just hide history, they erased all memory of a living earth and replaced human identity with the unchallengeable legal scripture of "The Pact."
3. The cleaning ritual functions as an insidious psychological trap — the fake lush video feed inside the helmet tricks the condemned cleaner into believing they are liberating the Silo, turning their final gasping moments into willing state maintenance.
4. Juliette Nichols is appointed Sheriff not because she plays politics, but because she understands physical load tolerances — her daring underwater repair of the failing turbine generator proves that Mechanical survives on tangible truth while IT survives on manufactured illusions.
5. The calculated poisoning of Mayor Ruth Jahns with canteen water during her trek up from the depths reveals IT's true nature: Bernard Holland is not an administrator, but the high priest of an unelected shadow theocracy that liquidates anyone threatening the Silo's social equilibrium.
6. Walker's quiet realization about heat tape unmasks the industrial mechanics of state murder: IT deliberately manufactures porous, failing tape for cleaning suits so dissenters perish within minutes, whereas Mechanical's heavy-duty nylon-poly heat tape allows Juliette to survive the toxic exterior.
7. Juliette walking past the hill into the wasteland shatters the core myth of solitary human isolation — she discovers dozens of identical airlock mounds stretching across the horizon, exposing Silo 18 as merely one experimental cell in a vast, coordinated human terrarium.
8. The flooded, rotting corridors of Silo 17 and its feral survivor Solo demonstrate the fatal flaw in the Founders' blueprint: when rebellion erupts without technical competence and systemic truth, the result is not freedom, but total societal extinction.

RAISE THIS COUNTERPOINT: Does Howey's reliance on the IT conspiracy and secret legacy manuals reduce a profound sociological examination of obedience into a mechanical puzzle-box, where survival hinges on possessing the right roll of heat tape rather than confronting human nature?

END BY REFRAMING: The real horror of the Silo was never the poison air outside — it was the terrifying realization that after three hundred years, the people inside became more terrified of the sky than the poison.

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
1. Sesi indir → `public/audio/wool-omnibus.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/wool-omnibus.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=wool-omnibus --title="Wool Omnibus" --author="Hugh Howey" --genre=science-fiction
```
