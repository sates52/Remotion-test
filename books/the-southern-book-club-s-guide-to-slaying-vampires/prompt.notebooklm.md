# NotebookLM prompt — The Southern Book Club's Guide to Slaying Vampires (Grady Hendrix)

**Slug:** `the-southern-book-club-s-guide-to-slaying-vampires` · **Genre:** horror · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "The Southern Book Club's Guide to Slaying Vampires" by Grady Hendrix.

THE ANGLE (this is what makes this episode unique):
- Lens: the economics of unpaid domestic labor — how the suburb monetizes women's invisibility, and why the vampire is the system's perfect employee
- Thesis to prove: The real horror of Hendrix's novel isn't that a vampire moves into Mount Pleasant — it's that the neighborhood's entire social contract depends on women's labor being invisible, and James Harris simply exploits the infrastructure that was already built for exploitation.
- Open on this idea: "What if the scariest thing about a vampire moving next door isn't the blood — it's that your husband thinks you're hysterical for noticing?"

BEATS TO ARGUE (one specific claim each, in order):
1. Patricia Campbell's daily life is already a horror movie before James Harris arrives — the endless casserole deliveries, carpooling, and emotional management that the neighborhood runs on but nobody acknowledges as work.
2. The true-crime book club itself is a subversive act — these women are training themselves to see predators, but the men around them treat it as a cute hobby, a harmless distraction from "real" concerns.
3. James Harris doesn't break any rules Mount Pleasant hasn't already written — he targets the Black neighborhood on the other side of the highway because the suburb's geography was DESIGNED to make those residents invisible.
4. Carter Campbell's refusal to believe Patricia is the book's most devastating horror beat — when your own husband sides with the charming stranger over you because believing you would cost him social capital.
5. The children disappearing from Six Mile are the book's moral engine — Hendrix makes the reader confront that an entire community of missing kids gets zero attention while one white woman's bruise triggers a neighborhood meeting.
6. Mrs. Greene is the most radical character in the novel — an elderly woman who has survived real monsters (her own past) and becomes the book club's weapon precisely because the system has already decided she doesn't matter.
7. The escalation from polite suspicion to actual vampire-slaying violence maps exactly onto how women's anger works in real life — Patricia has to burn down her entire social standing before anyone takes the threat seriously.
8. The final act inverts the domesticity trap — the same casserole network, carpool logistics, and neighborhood gossip that kept these women powerless become the tactical infrastructure they use to kill the predator.

RAISE THIS COUNTERPOINT: Hendrix's racial commentary — using the exploitation of the Black neighborhood as a mirror for the white women's oppression — sometimes feels like it instrumentalizes Black suffering to illuminate white women's awakening. Does the novel earn that parallel, or does it replicate the very invisibility it critiques?

END BY REFRAMING: The book club doesn't defeat the vampire with stakes or garlic — they defeat him with the one thing the suburb never valued: the organized, furious labor of women who finally stopped asking permission.

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
1. Sesi indir → `public/audio/the-southern-book-club-s-guide-to-slaying-vampires.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/the-southern-book-club-s-guide-to-slaying-vampires.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=the-southern-book-club-s-guide-to-slaying-vampires --title="The Southern Book Club's Guide to Slaying Vampires" --author="Grady Hendrix" --genre=horror
```
