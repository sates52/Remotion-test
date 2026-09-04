# NotebookLM prompt — The Wedding People (Alison Espach)

**Slug:** `the-wedding-people` · **Genre:** fiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "The Wedding People" by Alison Espach.

THE ANGLE (what makes this episode unique):
- Lens: performance vs. honesty — a wedding is a six-day performance of a life "going well," colliding with the one woman who quit performing because she's decided to die.
- Thesis: Phoebe isn't saved by finding a reason to live — she's saved by finding people she can finally stop lying to. Despair here isn't the absence of a good life; it's the exhaustion of performing one, and the cure isn't happiness, it's honesty from strangers with no stake in her story.
- Open on this idea: "She books the nicest room of her life to end it — and the first person she tells is the bride."
- Phrase-that-pays: "the wedding people" = everyone still performing a life, versus the one guest who stopped.

BEATS TO ARGUE (one specific claim each; open on beat 1's cold-open line, develop each fully, don't rush the list):
1. The confession cracks the plan: she says the unsayable to a stranger in the elevator, the plan to die loses its grip — naming the truth to someone with zero stake in you is the first act of being saved.
2. The wedding is a performance machine: six days of everyone auditioning "the happy version" of themselves; she's the only one not performing, and that's exactly what makes her magnetic.
3. The bride and the suicidal guest are the same person: one controls everything, the other abandons everything, but both fear the life they built is wrong — and each becomes the other's medicine.
4. The stranger paradox: she's more honest with people she met yesterday than with a husband of years, because intimacy accumulates lies ("we're fine") while strangers get the unedited version.
5. The un-lived life: a scholar of other people's stories who forgot to author her own — the real despair is being a reader of your life instead of its writer.
6. Small pleasures are the real argument for staying: a borrowed dress, one good meal, absurd rituals — she's talked out of dying not by philosophy but by a genuinely good afternoon.
7. New connection arrives just when she'd sworn it was over: the groom, his daughter, the terror of letting a new life in when the old one nearly killed her — performed love versus honest love.
8. Reinvention isn't a makeover: staying is the quiet permission to stop performing and tell an unglamorous truth — the wedding and the funeral she'd planned are the same ceremony, and she votes to continue.

COUNTERPOINT: the premise is a fairy tale — a warm, wealthy bride adopting a suicidal stranger into a luxury wedding is wish-fulfillment, and the book risks making clinical despair look curable by a beautiful week. Is "honesty plus a gorgeous vacation" the cure, or a comforting fantasy? Argue both sides.

PAYOFF (reframe): the real claim is smaller and truer than "life is beautiful" — you don't have to want your whole life back, you just have to want tomorrow, and a stranger who lets you be honest can be enough to buy one more day. One more day is how anyone stays.

DEPTH ENGINE (run on EVERY beat — this is how the episode earns its length):
a) drop into a scene in present tense with one vivid sensory detail; voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example or angle from the book;
d) take one honest "wait — but then..." turn where the hosts genuinely disagree;
e) tie it back to the phrase-that-pays before the next beat.

LENGTH (target 45-60 min, minimum 45 — never shorter): give each beat 4-6 real minutes, but never pad. Don't repeat a point, don't restate the thesis over and over, no filler or "as we said earlier". Earn length by going DEEPER — a fresh example, a sharper objection, a real disagreement, a "wait — but then..." turn. If a beat runs dry, MOVE ON, don't recycle it. Two sharp people who can't stop talking about this book — not a summary stretched to fill time. Don't signal an ending before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the book. NEVER invent quotes, numbers, or events; if unsure of a detail, stay general.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — you're two people who couldn't stop thinking about this book.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/the-wedding-people.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/the-wedding-people.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=the-wedding-people --title="The Wedding People" --author="Alison Espach" --genre=fiction
```
