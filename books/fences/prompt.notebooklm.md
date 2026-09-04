# NotebookLM prompt — Fences (August Wilson)

**Slug:** `fences` · **Genre:** plays · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Fences" by August Wilson.

THE ANGLE:
- THESIS: Troy Maxson is August Wilson's proof that survival and love use the same muscle — the toughness that kept Troy alive in a racist 1950s Pittsburgh is the exact force that crushes his son, his wife, and himself. The fence in his backyard is the play's verdict: Rose wants it to hold the family IN, Troy needs it to keep Death OUT, and Cory experiences it as a cage. Wilson's genius is showing all three are right at the same time.
- NON-OBVIOUS LENS: Read the play as a study of how trauma gets inherited not through cruelty but through protection. Troy doesn't hate Cory — he loves Cory the only way a man raised by a monster knows how.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought — "Here's the thing that wrecked me about Troy Maxson: the man builds a fence for three acts, and by the time he finishes it, he's locked out of his own family." No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state the argument — survival instinct and love are the same muscle, and that's the tragedy.
3. SETUP: 1957 Pittsburgh Hill District, Troy Maxson — 53-year-old garbage collector, former Negro League slugger who never got his shot at the majors because the color line broke too late for him. Rose, his wife of 18 years. Cory, their 17-year-old son with a football scholarship offer. Bono, Troy's best friend. Gabriel, Troy's brother with a metal plate in his head from WWII whose disability check bought the house Troy lives in.
4. BEATS (8 — develop each fully, 4-6 minutes each):
   (1) THE BASEBALL MONOLOGUE — Troy's Friday-night backyard speech: "You got to take the crooked with the straights." His entire worldview in one metaphor — life is an at-bat against Death, and the only option is to keep swinging. Dig into how Wilson uses baseball as Troy's private language for processing a world that never let him play.
   (2) THE GARBAGE TRUCK — Troy files a complaint: why can't Black men drive the trucks instead of just lifting garbage? He wins. First Black driver in Pittsburgh. But push into this: Troy fights the system to prove a man's worth is measured by what he DOES, then denies Cory the right to do the one thing Cory is good at. The contradiction is the play.
   (3) GABRIEL'S MONEY — Troy's brother Gabriel took shrapnel in the war, lost half his skull, now wanders the Hill District with a trumpet he thinks will open the gates of heaven. Troy signed the papers that committed Gabriel. The government disability money bought Troy's house. Wilson never lets Troy off the hook for this, and Troy never lets himself off either.
   (4) TROY vs. CORY: THE FOOTBALL FIGHT — A college recruiter comes for Cory and Troy kills it. "The white man ain't gonna let you get nowhere with that football noway." Is Troy protecting his son from the heartbreak he lived, or is he so broken by his own stolen dream that he can't watch his son have one? Wilson refuses to settle the question.
   (5) "I PLANTED MYSELF INSIDE YOU" — Rose's monologue after Troy confesses the affair with Alberta. The most devastating speech in American drama. Rose gave up every piece of herself and planted it inside this man and this family, and he took that gift and spent it on someone else. Dig deep into what Wilson is saying about Black women holding families together while the men they built around crumble.
   (6) THE AFFAIR AND ALBERTA — Troy doesn't cheat because he's heartless. He cheats because Alberta makes him feel like he's not losing. Wilson gives us the reason without giving us the excuse, and that's what separates this play from melodrama.
   (7) TROY'S FATHER — Act One's story about the day 14-year-old Troy's father caught him with a girl and beat him bloody, and Troy realized the man wasn't protecting morality — he wanted the girl for himself. Troy ran and never went back. The seed of everything: Troy learned fatherhood from a monster, and his entire life is an attempt to be a different kind of monster.
   (8) THE ENDING — Gabriel raises his trumpet to open heaven's gates for Troy's soul. No sound comes out. He dances instead, and the gates open. Wilson's final image: grace doesn't come through strength or rightness — it comes through the broken trying anyway.
5. COUNTERPOINT: Wilson loads the deck — Troy is SO magnetic, so verbally overpowering, that Rose and Cory sometimes feel like witnesses to his tragedy rather than full owners of their own. Is the play actually about a family, or is it a one-man show with collateral damage?
6. PAYOFF: land on the fence itself — Troy never finishes building it while he's alive. Cory and Raynell stand in the yard the day of his funeral, and the fence is there, complete. The thing Troy built to keep people out ended up being the only thing that held them together.

DEPTH ENGINE (run this on EVERY beat — this is how the episode earns its length):
a) drop us into a scene in present tense with one vivid sensory detail; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example, number, or angle from the play;
d) take one honest "wait - but then..." turn where the two hosts genuinely disagree;
e) tie it back to the recurring phrase — "the fence" — before moving to the next beat.

LENGTH (target 45-60 minutes, minimum 45 — never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. Do NOT repeat a point you already made, do NOT restate the thesis over and over, do NOT stall with filler, throat-clearing, or "as we said earlier". Earn the length by going DEEPER, not longer on the same ground: a fresh example, a sharper objection, a genuine disagreement between the two hosts, a real "wait — but then..." turn. If you truly run out of things to say about a beat, MOVE ON rather than recycle it. Sound like two sharp people who honestly can't stop talking about this play — not a summary stretched to fill time. Do NOT signal an ending ("to wrap up", "in short", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the play and its real, well-documented context. NEVER invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — you are two people who could not stop thinking about this play.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes, dialogue.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/fences.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/fences.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=fences --title="Fences" --author="August Wilson" --genre=plays
```
