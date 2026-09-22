# NotebookLM prompt — The Psychology of Money (Morgan Housel)

**Slug:** `psychology-of-money` · **Genre:** finance · **Target:** 35–45 min · **Market:** US (English) · **Compact:** fits NotebookLM's Customize character limit.

**How to use:** NotebookLM → upload the book's sources → **Audio Overview → Customize** → paste ONLY the block below → Generate.

```
Two hosts. A 35-45 minute deep, original analysis of "The Psychology of Money" by Morgan Housel. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE (do NOT drift into a generic list of money tips): Thesis to prove - doing well with money has almost nothing to do with intelligence and almost everything to do with behavior, and behavior can't be taught in a spreadsheet. The recurring blade: being REASONABLE beats being rational, because you have to be able to sleep at night and stay in the game long enough for time to do the work.

PHRASE-THAT-PAYS (recur ~4x): "Wealth is what you don't see."

COLD OPEN (0:00-0:25, mid-thought, no greeting): "A gas-station attendant in Vermont dies at 92 - and the will says eight million dollars. Same year, a Harvard-trained Merrill Lynch exec is losing his mansion to foreclosure. Nobody's IQ explains that."

BEATS (3-6 min each; one claim + one real case from the book; drop into the scene in present tense, one sensory detail, voice the people, THEN land it):
1. Ronald Read, the janitor who left 8 million, versus Richard Fuscone, the Harvard MBA who went bankrupt in 2008. Master key: money is a soft skill, where how you behave beats what you know.
2. No one is crazy - every choice is autobiographical. The Depression kid and the 1970s-inflation kid invest like opposites, and both are rational given the world that raised them.
3. Luck and risk are siblings. Bill Gates sat at one of the only school computers on Earth; Kent Evans, just as gifted, died climbing a mountain before it could pay off. Same skill, opposite dice.
4. Compounding is the quiet giant. Of Buffett's ~84 billion, over 81 came after age 65 - the secret isn't his returns, it's eighty unbroken years of runway. Jim Simons earns more per year and has far less, because he started late.
5. Getting rich versus staying rich. Jesse Livermore, richest man alive to broke. Survival and a little paranoia beat brilliance; wealth is optionality - never being forced to sell.
6. Tails drive everything. A handful of events carry almost all the gains; you can be wrong half the time and still win big.
7. The man-in-the-car paradox: nobody admires your Ferrari, they picture themselves in it. So wealth is the cars NOT bought - the restraint you can't see.
8. The highest dividend money pays is control over your time - the freedom to wake up and do what you want.

COUNTERPOINT (be honest): "just behave better" is thin, because behavior is nearly impossible to change, and Housel admits his own moves - extra cash, a paid-off house - are mathematically "irrational." Sit in that: reasonable beats rational.

CLOSER (reframe): the whole book collapses into one word - enough. Knowing when you have it is the only edge that never breaks. Wealth is what you don't see.

HARD RULES: English only. Use ONLY facts and real, documented cases from the book - never invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating. Never mention "sources", "notebook", "documents", or that this is AI; never break character - you are two people who could not stop thinking about this book. No greetings, no plot-recap, no generic praise. Target 35-45 minutes; go deep, do not wrap early.
```

---
## Next steps (pipeline)
1. Generate the audio in NotebookLM → save as `public/audio/psychology-of-money.m4a` (or `.mp3`).
2. Upload to YouTube (unlisted) → download word-timestamped VTT → `public/captions/psychology-of-money.vtt`.
3. Build the Vox video:
```
node scripts/make-book.js --slug=psychology-of-money --title="The Psychology of Money" --author="Morgan Housel" --genre=finance
```
