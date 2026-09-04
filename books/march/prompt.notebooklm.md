# NotebookLM prompt — March (Geraldine Brooks)

**Slug:** `march` · **Genre:** historical-fiction · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "March" by Geraldine Brooks.

THE ANGLE (this is what makes this episode unique):
- Lens: the violence of idealism — how moral certainty destroys what it claims to protect
- Thesis to prove: March is not a war novel; it is a dissection of how a man's need to be righteous becomes its own form of cruelty — toward the enslaved people he patronizes, the wife he deceives, and the daughters he abandons, all while believing he is the hero of his own story.
- Open on this idea: "What if the most dangerous person in your family isn't the one who does wrong — but the one who's absolutely certain they're doing right?"

BEATS TO ARGUE (one specific claim each, in order):
1. Brooks steals the absent father from Little Women and puts him on trial — the novel exists to ask what Louisa May Alcott couldn't: was Father March worth the sacrifice his family made?
2. The pre-war Concord scenes expose March's abolitionism as performance — he bankrolls the cause with Marmee's inheritance, not his own sacrifice, and the text frames his generosity as a man spending someone else's currency.
3. The cotton plantation teaching episode — March believes he is liberating minds, but Brooks shows him unable to see Grace Clement as anything other than a project; his attraction to her is tangled with his savior complex, and the violence that follows is partly his blindness.
4. On the battlefield as chaplain, March watches men die and rewrites it in his letters home as noble purpose — Brooks gives us the real scene and the letter side by side, and the gap between them is the thesis in miniature: idealism requires lying.
5. The field hospital at Blank's Ferry is where the body breaks the ideology — March confronts wounds no sermon can dress, and his faith cracks not from doubt but from the sheer animal reality of suffering he helped send men into.
6. Marmee's chapter is the structural bomb — Brooks hands the entire narration to the wife, and suddenly we see March through the eyes of someone who loves him and is furious, who knows every lie in those letters and has been performing her own fiction of the supportive wife.
7. March's return home is not a homecoming but a haunting — the man who walks through the door is a stranger, and Brooks argues that war doesn't just damage soldiers, it replaces them; the family mourns someone who is technically alive.
8. The Alcott shadow — Brooks built March on Bronson Alcott, Louisa's real father, a Transcendentalist who dragged his family into poverty for his principles; the novel is asking whether American idealism has always demanded that women and children pay the bill.

RAISE THIS COUNTERPOINT: Does Brooks load the dice against March? He is never allowed a private moment of genuine, uncomplicated goodness — every act of conscience comes with an authorial footnote exposing its selfishness. Is that fair to the character, or does the novel need a flawed man more than a real one?

END BY REFRAMING: March is the book Louisa May Alcott couldn't write — the version of Little Women where the father comes home and the family realizes the war they survived wasn't the one in Virginia.

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
1. Sesi indir → `public/audio/march.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/march.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=march --title="March" --author="Geraldine Brooks" --genre=historical-fiction
```
