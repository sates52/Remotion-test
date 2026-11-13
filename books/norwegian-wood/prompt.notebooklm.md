# NotebookLM prompt — Norwegian Wood (Haruki Murakami)

**Slug:** `norwegian-wood` · **Genre:** fiction · **Engine:** antidote · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "Norwegian Wood" by Haruki Murakami.

THE ANGLE:
- Thesis: "Norwegian Wood" is not a nostalgic coming-of-age romance—it is an existential autopsy on survivor's guilt, exposing how grief traps youth between the quiet paralysis of the dead and the chaotic demand to live.
- Tone & Lens: Melancholic psychological realism, existential weight, 1960s backdrop, memory versus living reality.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): Open mid-thought: "The moment the orchestral cover of 'Norwegian Wood' plays on the landing plane in Hamburg, Toru Watanabe isn't reminiscing—he is physically crushed by the realization that remembering someone is already a betrayal of their real, agonizing absence."
2. THESIS: Argue that death is not the opposite of life but an active, parasitic co-presence forcing survivors to choose between sanctified ghosts and imperfect living people.
3. SETUP: Toru in late 1960s Tokyo, haunted by best friend Kizuki's sudden suicide at seventeen, caught between Kizuki's fragile surviving girlfriend Naoko in a Kyoto mountain sanatorium, and Midori Kobayashi, an exuberantly alive classmate offering an escape into the present.
4. BEATS (8 argued beats, fully developed with concrete book details):
   - Beat 1 (Kizuki's Exit at Seventeen): Kizuki's sudden garage carbon-monoxide suicide leaving no note—the permanent emotional rupture leaving Toru and Naoko frozen in time.
   - Beat 2 (Tokyo's Hollow Revolution): Contrast between late 1960s student barricades at Waseda University and Toru's apathy—reading Gatsby alone, showing intimate tragedy renders mass politics trivial.
   - Beat 3 (Nagasawa & Cold Detachment): Toru's nights in Tokyo bars with ruthless prodigy Nagasawa, showing the danger of extinguishing feelings to avoid suffering.
   - Beat 4 (Ami Hostel in Kyoto): Toru visiting Naoko and Reiko at the mountain retreat—a peaceful sanctuary serving as hospice for souls unable to bear social friction.
   - Beat 5 (Midori Kobayashi's Vitality): Midori bursting into Toru's life with frank humor, bookstore fires, and nursing her dying father—representing vitality as messy, stubborn survival.
   - Beat 6 (Reiko Ishida's Fractured Past): Reiko's confession of her breakdown and broken marriage—proving adulthood offers no immunity to psychological collapse.
   - Beat 7 (Naoko's Death & The Coastal Exile): Naoko hanging herself in the woods, triggering Toru's aimless wander along coastal Japan with a sleeping bag, facing grief's raw limits.
   - Beat 8 (The Memorial Rite & Reiko's Fifty Songs): Reiko visiting Toru's Tokyo flat with her guitar, playing fifty songs to mourn Naoko and releasing Toru back to the living.
5. COUNTERPOINT: Does Toru lack personal agency, passively buffeted by erratic souls, or is his passive witness the only honest stance in the shockwaves of suicide?
6. PAYOFF: The phone booth ending: calling Midori from a crowded station, unable to answer where he is, realizing choosing life leaves you stranded in the noisy center of nowhere.

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
1. Sesi **MP3** olarak indir → `public/audio/norwegian-wood.mp3` (.m4a da çalışır, ama uzun bir kitapta GitHub'ın 100 MB dosya sınırını aşabilir; o zaman render worker'ları reddeder)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/norwegian-wood.vtt`
3. Bu oturumda yaz: **"dosyalar hazır, preview hazırla"** (skill `preview-hazirla`: kitabın kendi worktree'si, storyboard, kapılar, kör sessiz test). Final render ayrı, operatör onaylı bir adım.
