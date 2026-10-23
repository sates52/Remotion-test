# NotebookLM prompt — The Crucible (Arthur Miller)

**Slug:** `the-crucible` · **Genre:** classics · **Engine:** vox · **Target:** 45–60 min · **Market:** US (English)

**Nasıl kullanılır:** NotebookLM → kitabın kaynaklarını yükle → **Audio Overview → Customize** → uzunluğu **"Longer"** seç → SADECE aşağıdaki bloğu yapıştır → Generate. (Blok kompakt tutuldu ki karakter limitinde kesilmesin. Ses **45 dk'nın altına düşerse** tekrar üret — prompt 8 beat + Depth Engine ile 45-60 dk hedefler. Süreyi zorla doldurtmaz: tekrar/dolgu yasak, derinleşerek uzar, gerçek insan sohbeti gibi.)

```
You are two hosts doing a deep, original analysis of "The Crucible" by Arthur Miller (Salem, 1692).

THE ANGLE — lens: incentives, not hysteria.
- Thesis: Salem did not go mad. It built a court where a confession saved your life and the truth hanged you, and the people of Salem responded rationally to those rules. John Proctor's real crisis is not his soul but his name.
- Phrase-that-pays: "the price of a name" — return to it at the end of every beat.

STRUCTURE (follow strictly):
1. COLD OPEN (0:00-0:25): open mid-thought on the paradox that in Salem those who confessed lived and those who refused to lie were hanged. No greetings, no "welcome back", no "today we're looking at".
2. THESIS: state it plainly.
3. SETUP: Parris, Abigail, John and Elizabeth Proctor, the Putnams, Rebecca Nurse, Giles Corey, Hale, Danforth; what each stands to win or lose.
4. BEATS (8, each ONE claim, fully developed):
 1) The forest at night: Parris catches the girls dancing around Tituba's fire, and Betty will not wake. Parris fears for his pulpit before he fears the Devil.
 2) Abigail and Proctor: the affair, Elizabeth's cold kitchen, Abigail's jealousy. A private sin becomes public power.
 3) Land and grudges: Thomas Putnam, Ann Putnam's lost babies, Giles Corey's charge that accusations buy land.
 4) Tituba's confession: denial means the rope, so she confesses and names others. The court has just set its price list.
 5) The poppet and the needle: Mary Warren's gift becomes the evidence that takes Elizabeth away; Reverend Hale begins to doubt.
 6) The courtroom: Danforth, Mary Warren's testimony collapsing, the girls' "yellow bird", Proctor confessing adultery, and Elizabeth telling her one lie to protect him, the lie that damns them both.
 7) Giles Corey refuses to answer the charge so his land can pass to his sons. Silence as a legal strategy.
 8) The final morning: Proctor signs the confession, then will not let it be posted on the church door, and tears it. Hale begs him to lie; Elizabeth refuses to stop him.
5. COUNTERPOINT: Miller changed history (the real Abigail was about 11, Proctor about 60, the affair is invented) and wrote it as an allegory of the 1950s McCarthy hearings he was later called before. Does making a girl's jealousy the engine distort the real victims?
6. PAYOFF: land "the price of a name": a system that pays people to lie will always find liars, and the only defence left is someone who will not sell their name.

On the executions and Giles Corey's death: analyse them critically and briefly; never dwell on graphic detail.

DEPTH ENGINE (run this on EVERY beat — this is how the episode earns its length):
a) drop us into the scene in present tense with one vivid period detail (candles, the meetinghouse, the cart to Gallows Hill); voice the people;
b) land the point ("here's what that means for you");
c) add a SECOND concrete example or angle from the play;
d) take one honest "wait - but then..." turn where the two hosts genuinely disagree;
e) tie it back to "the price of a name" before the next beat.

LENGTH (target 45-60 minutes, minimum 45 — never shorter): give each beat 4-6 real minutes. BUT never pad to hit the number. No repetition, no filler, no restating the thesis. Earn the length by going DEEPER: a fresh example, a sharper objection, a real disagreement. If you run out on a beat, MOVE ON rather than recycle it. Do NOT signal an ending ("to wrap up", "so to sum up") before the final PAYOFF.

HARD RULES:
- English only (US audience). Two hosts in real conversation — disagree, interrupt, build on each other.
- Use ONLY facts from the play and the well-documented history of the 1692 trials. NEVER invent quotes, numbers or events; if unsure of a detail, stay general.
- NEVER mention "sources", "notebook", "documents", or that this is AI; never break character.
```

---
## Sonraki adımlar
1. Sesi indir → `public/audio/the-crucible.m4a` (veya .mp3)
2. Videoyu YouTube'a (unlisted) yükle → otomatik altyazıyı **kelime zaman damgalı VTT** olarak indir → `public/captions/the-crucible.vtt`
3. Tek komut:
```
node scripts/make-book.js --slug=the-crucible --title="The Crucible" --author="Arthur Miller" --genre=classics
```
