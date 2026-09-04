# NotebookLM prompt — Unreasonable Hospitality (Will Guidara)

**Slug:** `unreasonable-hospitality` · **Genre:** business · **Target:** 45–60 min · **Market:** US (English) · **Compact:** fits NotebookLM's Customize character limit.

**How to use:** NotebookLM → upload the book's sources → **Audio Overview → Customize** → set length to **"Longer"** → paste ONLY the block below → Generate. If the audio comes in under 45 min, regenerate.

```
Two hosts. A 45-60 minute deep, original analysis of "Unreasonable Hospitality" by Will Guidara. English only, natural US conversation - argue, interrupt, build on each other, think out loud.

ANGLE (do NOT drift into generic customer-service tips): Thesis - service and hospitality are not the same thing. Service is the black-and-white of doing your job competently; hospitality is the color, how you make a person FEEL. "Unreasonable" hospitality is spending disproportionate, almost irrational care on the tiny last stretch most businesses ignore - and it is the cheapest, most defensible edge there is, because caring can't be copied. The blade: that same devotion, left unwatched, curdles into people-pleasing, martyrdom, and burnout - giving more than you actually have is not generosity.

PHRASE-THAT-PAYS (recur ~4x): "Give people more than they expect."

COLD OPEN (0:00-0:25, mid-thought, no greeting): "Four regulars at the finest restaurant in New York are about to catch a flight home, and one of them sighs - we ate everywhere this trip, but we never got a real New York street hot dog. So Will Guidara bolts out the door, buys a two-dollar dirty-water dog off a cart, and has his four-star kitchen plate it like a course. That hot dog became the most famous thing they ever served."

BEATS (3-6 min each; one claim + one real case from the book; drop into the scene in present tense, one sensory detail, voice the people, THEN land it):
1. The two-dollar hot dog - the cheapest item ever served at a world-class restaurant became its signature, proof that the memory you create, not the money you spend, is what people carry home.
2. Service vs hospitality - service is doing your job right, hospitality is how it makes someone feel; you can have flawless service and zero warmth, and guests remember only the warmth.
3. The 95/5 rule - be ruthlessly disciplined about ninety-five percent of your spending precisely so you can be irrationally, unreasonably generous with the last five; excellence pays for the magic.
4. Make the charitable assumption - Guidara's "be one inch dumb": give people the benefit of the doubt, assume the best of a difficult guest or employee, and you unlock behavior a suspicious manager never sees.
5. Dreamweavers and the sandbox - he created a role whose only job was to invent magic moments, and gave the team tight constraints on purpose, because a boundary is what forces real creativity.
6. Excellence and hospitality are not mutually exclusive - the obsessive climb to make Eleven Madison Park number one in the world (World's 50 Best, 2017) ran on warmth, not in spite of it.
7. One size fits one - the beach picnic built indoors for a couple who never made it to the ocean; true hospitality is personal, aimed at THIS person, not a scripted policy applied to everyone.
8. Be the reason someone believes in the goodness of people - hospitality as legacy; the point was never the restaurant, it was making every person who walked in feel genuinely seen.

COUNTERPOINT (be honest): "unreasonable" is a luxury few can afford - a fine-dining room with huge margins and devoted staff is not a thin-margin business or an exhausted worker; pushed on people without the resources, "give more than they expect" becomes unpaid emotional labor and burnout. Sit in the tension the book itself brushes against - generosity you can't sustain isn't hospitality, it's self-erasure.

CLOSER (reframe): the edge was never the food or the money - it was the decision to care more than was reasonable, on purpose, for one person at a time. Give people more than they expect.

LENGTH (target 45-60 min, minimum 45): give each beat 4-6 real minutes, but NEVER pad to hit the number - do not repeat a point, do not restate the thesis over and over, no filler. Earn the length by going DEEPER (a fresh example, a sharper objection, a real disagreement), and if a beat is exhausted, MOVE ON rather than recycle it. Sound like two sharp people who genuinely can't stop talking about this book, not a recap stretched to fill time.

HARD RULES: English only. Use ONLY facts and real, documented cases from the book - never invent quotes, numbers, studies, or events; if unsure of a detail, stay general instead of fabricating. Never mention "sources", "notebook", "documents", or that this is AI; never break character - you are two people who could not stop thinking about this book. No greetings, no plot-recap, no generic praise. Go deep, do not wrap early.
```

---
## Next steps (pipeline)
1. Generate the audio in NotebookLM → save as `public/audio/unreasonable-hospitality.m4a` (or `.mp3`).
2. Upload to YouTube (unlisted) → download word-timestamped VTT → `public/captions/unreasonable-hospitality.vtt`.
3. Build the Vox video:
```
node scripts/make-book.js --slug=unreasonable-hospitality --title="Unreasonable Hospitality" --author="Will Guidara" --genre=business
```
