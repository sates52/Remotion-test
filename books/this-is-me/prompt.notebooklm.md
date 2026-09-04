# NotebookLM prompt — This Is Me: A Reckoning (Hayden Panettiere)

**Slug:** `this-is-me` · **Genre:** memoir · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "This Is Me: A Reckoning" by Hayden Panettiere.

THE ANGLE (this is what makes this episode unique):
- Lens: the performance of okayness — how a child raised to be watched learned that being "fine" was the product she was paid to deliver.
- Thesis to prove: fame didn't break Hayden Panettiere; it HIRED her to play indestructible girls, and the depression, drinking, and pills weren't the performance failing — they were its bill coming due. The "reckoning" is realizing the mask was the job.
- Open on this idea: "The most famous line of her career was that she couldn't be hurt — and the whole world decided to believe it about the real girl, too."

BEATS TO ARGUE (one specific claim each, in order):
1. She was working before she could consent — a child on TV from toddlerhood (young Sheryl in Remember the Titans); the self was a product before it was a person.
2. "Save the cheerleader, save the world": as Claire on Heroes she played a girl who heals from any wound, and America fused that indestructibility onto the real teenager.
3. The cruel mirror of Nashville: playing Juliette Barnes through postpartum depression while living her own off-camera — art naming a pain she couldn't say, then treatment sold as tabloid drama.
4. The impossible math of motherhood: her daughter Kaya living abroad with Wladimir Klitschko, and the public verdict on a mother who steps back to protect instead of possess.
5. Addiction as maintenance, not rebellion: drink and pills as the upkeep cost of the "I'm fine" mask; the relapse-rehab loop a performer of wellness is built to hide.
6. Brian Hickerson: how someone trained to look okay stays inside harm — the private violence behind a composed red-carpet image.
7. She could fight for others but not herself — the Taiji dolphin activism, chased from Japan under threat of arrest, rage aimed outward but never inward.
8. Jansen: her brother's 2023 death as the wound that can't be performed away — the grief that forces this book into existence.

RAISE THIS COUNTERPOINT: framing addiction as "the cost of the job" can shade into letting herself off the hook — is a "reckoning" real accountability, or a rebrand? Where does self-awareness end and self-mythology begin?

END BY REFRAMING: the reckoning isn't that she got better — it's that she stopped performing getting better. The indestructible girl's real power was finally admitting she could break.

FLOW: cold open mid-thought on the hook (NO greetings) → thesis → the 8 beats IN ORDER, each developed fully → counterpoint → payoff last.

DEPTH ENGINE (run on EVERY beat — this is how the episode earns its length):
a) drop us into the scene in present tense with one vivid sensory detail; voice the people;
b) land the point ("here's what that means"); c) add a SECOND concrete example or angle from the book;
d) take one honest "wait — but then..." turn where the hosts genuinely disagree; e) tie back to the recurring phrase-that-pays before the next beat.

LENGTH (target 45-60 min, minimum 45 — never shorter): give each beat 4-6 real minutes, but NEVER pad. Don't repeat a point, restate the thesis, or stall with filler ("as we said earlier"). Earn length by going DEEPER — a fresh example, a sharper objection, a real disagreement — not by recycling ground. If a beat is spent, MOVE ON. Sound like two sharp people who can't stop talking about this book. Don't signal an ending before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the book and real, well-documented events. NEVER invent quotes, numbers, or events; if unsure of a detail, stay general.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character — two people who couldn't stop thinking about this book.
- No generic praise, no plot-recap for its own sake. Prefer specific over abstract: names, concrete scenes.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/this-is-me.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/this-is-me.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=this-is-me --title="This Is Me: A Reckoning" --author="Hayden Panettiere" --genre=memoir
```
