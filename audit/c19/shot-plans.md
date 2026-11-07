# C19 shot plans (written before the engine parts; Stickman Video Director style: short shot list)

Principle (operator): the viewer follows the narrated ACTION and its RESULT across consecutive shots. Each shot names
where the eye goes, where the contact happens, which shot shows the result, and the word that times it. Only what the
narration says is staged. Same character identity and the object's end state are carried across every cut.
Frames are scene-relative (30 fps); anchors are the narrator's words from the word-timed VTT.

## 1. Burn of the Everflame #20–#22 — one place (the shore of Arboros), one Luther, one log
Narration: #20 "…Luther is standing by the coast of Arboros. He is swinging an axe." · #21 "Just hacking away. Swing,
strike, split. He is actively hunting down the largest, naughtiest, most difficult pieces of wood he can find" · #22 "to
shatter. And he looks awful… rough, untamed, dark beard…"
A (production today): #20 medium/shore, #21 medium/**forest**, #22 diorama/**stage** — the place changes at every cut.
| shot | frames (anchor) | attention | contact / change | result read in |
|---|---|---|---|---|
| #20a | 0–221 | the shore (establishing) | — | — |
| #20b | 221–363 ("Luther…standing", "swinging an axe"@312) | Luther, axe in hand, the log on the block | axe lifted on "swinging"@312 | — |
| #21a | 0–50 ("hacking away") | Luther + log, wide, same framing as #20b | rhythmic chops | — |
| #21b | 50–74 ("Swing"@50) | the axe head going up | — | — |
| #21c | 74–98 ("strike"@74) | the log's top-centre (the impact point) | axe edge lands ON the impact point at the cue | — |
| #21d | 98–283 ("split"@98) | the log | the SAME log halves from the impact point and falls apart | here, and kept |
| #22 | 0–214 ("to shatter"@10) | Luther (beard) next to the two halves on the ground | — | halves still on the ground |
Book assets: `log` (customSvg in an isolated copy of the book's motifs.json): a round log on a chopping block.

## 2. Feel-Good Productivity #221, #224, #225 — one runner, one road
Narration: #221 "Imagine you are running a marathon and your foot starts to ache. You have three options…" · #224 "…The
third option… is the unblock method. You stop running." · #225 "You take off your shoe. You find the pebble that is
causing the friction. You remove it. And then you resume running smoothly."
Not staged: #222/#223 are the rejected options (motivation / discipline) — they keep A. No limp (the narration says only
"ache").
A (production today): #221 twoShot/**cafe**, #224 wide/cafe, #225 medium/cafe — a runner never appears running.
| shot | frames (anchor) | attention | contact / change | result read in |
|---|---|---|---|---|
| #221 | 0–228 ("running"@24, "ache"@96) | the runner running on the road (side view, framing R) | face to worried on "ache"@96 | — |
| #224 | 0–209 ("stop running"@183) | the same runner, same framing | runs, then STOPS on "stop"@183 | stands |
| #225a | 0–41 ("shoe"@22) | the runner's hand and the shoe | takes the shoe off on "shoe"@22 (shoe in hand) | — |
| #225b | 41–108 ("pebble"@58) | the shoe → the pebble | the pebble comes out of the shoe on "pebble"@58 | pebble in view |
| #225c | 108–137 ("remove"@113) | the pebble | set down / thrown aside on "remove"@113, stays on the ground | pebble gone from the shoe |
| #225d | 137–202 ("resume running"@151) | the runner, framing R (= #221) | runs again, face happy on "smoothly"@173 | the pebble left behind |

## 3. The Lightning Thief #149–#150 — transfer test (recorded before any part was written: third-example.json)
Narration: #149 "…Percy is ready to uncap his sword. Instead, Annabeth pulls a red rubber ball … out of her bag and
tosses it. She just plays fetch with the most terrifying…" · #150 "beast in the … And Cerberus loves it …"
| shot | frames (anchor) | attention | contact / change | result read in |
|---|---|---|---|---|
| #149a | 50–115 ("Percy … sword"@50/@91) | Percy, sword in hand | — | — |
| #149b | 115–245 ("Annabeth pulls … ball … out of her bag"@149) | Annabeth's hand + the ball | takes the ball on "pulls"@149 | ball in hand |
| #149c | 245–341 ("tosses it"@245) | the ball | thrown on "tosses"@245, flies out to the right | — |
| #150 | 0–285 ("Cerberus loves it"@55) | Cerberus (book icon) with the ball | the ball is at Cerberus | the same red ball |

## Engine parts these plans need (reusable, written after this file)
shot-plan splitter (one beat → shots cut at anchor words, same narration / HUD / audio), actions `run`, `stop`,
`chop`, `throw`, hand props `axe` `shoe` `pebble` `ball`, prop motion `split` (a customSvg halves from an impact point
and stays split — a state motion carried by `continue`), contact geometry (the axe edge lands on the prop's impact
point). Frame-pure rendering (HyperFrames): every pose / prop state is a function of the frame alone, so a seek to a
frame and a sequential render give the same picture — checked on the critical frames.
