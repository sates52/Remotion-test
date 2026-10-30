# The Magician's Nephew — fixes before YouTube upload (for the book owner)

Built 2026-10-30. Every claim below was checked by a second, independent read-only agent; the "verified" line is that check.
The film `out/the-magician-s-nephew.mp4` is technically sound: cloud-verified, sha256 843e0ea0…, 57,493 frames,
1080p30, AAC stereo, 32:03. **The items below are content errors. Do not upload until the blockers are fixed.**

Paths are relative to the book worktree `wt-book-the-magician-s-nephew/`. Nothing in the book was changed. Fix the
**authored source** (designs.json / storyboard/authored-*.json) as well as the derived config. make-book restores
authored decisions (storyboard invariant 1), so a fix made only in the config is overwritten.

| | blocker | should fix | cosmetic |
|---|---|---|---|
| items | 11 | 5 | 2 |

## Video re-render needed (on-screen picture or burned-in captions)

### MN-01 · golden-apple · **blocker-for-upload**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** beats[243] id beat-243 (29:32-29:41), images[0].prompt, line 40938; image public/scenes/the-magician-s-nephew/beat-243.png. The authored source is designs.json:4923 (subject) and :4929 (concreteVisual), plus storyboard/authored-7.json:13 and :19
- **Now:** "...kneels by a bed holding out a glowing golden apple to his mother, Mrs Kirke...". MEASURED: the rendered PNG shows a glowing YELLOW-GOLD apple.
- **Evidence:** The narration never calls the apple golden. Clean VTT cue 720 00:24:49.120 "retrieve a specific silver apple.", cue 736 00:25:24.480 "picks the silver apple", cue 783 00:27:04.880 "silver tree rapidly grows.", cue 881 00:30:28.320 "a tiny silver leaf tree". This beat's own cue 856 00:29:33.679 says only "Narnian apple". Every other apple frame in the film is silver: beats 203, 207, 209, 221, 233, 237, 215 (MEASURED contact sheet). In the book the fruit is silver (INFERRED from the source text, which is not in the repo). So the error is in the on-screen image, not in the narration.
- **Fix:** In designs.json:4923/4929 and authored-7.json:13/19 (the authored decision, so make-book restores the fix instead of overwriting it), replace "a glowing golden apple" with "a glowing silver apple" and "the golden apple" with "the silver apple". Regenerate beat-243.png (delete it, or let gen-vox-images regenerate it). Then config.vox.json line 40938 reads "...holding out a glowing silver apple to his mother...".
- **Scope:** on-screen frame (needs a video re-render of the segment holding 29:32-29:41)
- **Verified:** yes — Every location checks out (MEASURED): designs.json:4923 and :4929, authored-7.json:13 and :19, config.vox.json:40938. beat-243 runs 29:32-29:41. Cues 720, 736, 783, 881 and 856 read as quoted. beat-243.png shows a glowing yellow-gold apple. I also re-checked beats 203, 207, 209, 215, 221, 233 and 237: their prompts say "silver apple", and the images I opened (215, 221, 237) show silver. One note: the visual is a glowing yellow-gold apple. The prompt actually asks for a glowing *golden* apple, so the image matches its prompt and the error is in the authored text.

### MN-02 · golden-apple · **blocker-for-upload**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** beats[249] id beat-249 (30:14-30:21), images[0].prompt, line 41157; image public/scenes/the-magician-s-nephew/beat-249.png. The authored source is designs.json:5043 and storyboard/authored-7.json:151
- **Now:** "Digory Kirke ... sits alone at a kitchen table in the evening lamplight, eating the core of a golden apple." MEASURED: the PNG shows a yellow apple, and the boy wears a modern dark crew-neck sweatshirt instead of the bible's grey wool jacket.
- **Evidence:** Narration cue 876 00:30:17.679 "That evening, Digory ate the core of the" and cue 877 00:30:19.919 "Narnian apple." give no colour. Every silver cue listed in MN-01 applies, and the tree the core grows into is silver (cue 881 00:30:28.320).
- **Fix:** In designs.json:5043 and authored-7.json:151, replace "eating the core of a golden apple" with "holding the bitten core of a silver apple" and add "grey wool jacket and short trousers" (bible look). Then regenerate beat-249.png.
- **Scope:** on-screen frame (needs a video re-render of the segment holding 30:14-30:21)
- **Verified:** yes — MEASURED: designs.json:5043, authored-7.json:151 and config.vox.json:41157 are as quoted, and beat-249 runs 30:14-30:21. Cues 876 and 877 are correct. beat-249.png shows a yellow apple, cut open and bitten, not a core, and a dark crew-neck sweatshirt. Small correction: the wardrobe is not being overridden. The designs.json:5043 prompt never contained the bible look at all, so it has to be added, as the fix already says.

### MN-08 · demure · **blocker-for-upload**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** beats[138] id beat-138 (16:22-16:31, type quote, kicker "REWRITTEN MEMORY"), props.emphasis[0], line 37032. The authored source is designs.json:2814 (emphasis), :2820 (claim), :2821 (concreteVisual), :2822 (onScreenText "A DEMURE WOMAN"), and storyboard/authored-4.json:261, 267, 268, 269
- **Now:** "DEMURE". QuoteScene (src/engines/vox/scenes.tsx:171-193) renders it as a large serif quotation under a quote mark, so the film shows Andrew "saying" DEMURE.
- **Evidence:** The narration says "demine", not "demure": cue 488/489 00:16:26.160-00:16:31.749 "referring to her as a quote demine woman." and cue 849 00:29:17.120 "the demine woman he met." That is ASR for Uncle Andrew's line in the book, "a dem fine woman" (INFERRED from the book text, which is not in the repo). The author misread the ASR word as "demure", which reverses the meaning: Andrew is leering at her, not calling her modest.
- **Fix:** emphasis ["DEM FINE WOMAN"] (designs.json:2814, authored-4.json:261); onScreenText "A DEM FINE WOMAN"; claim "Andrew rewrites his memory of Jadis as 'a dem fine woman'."; concreteVisual "...Andrew's own words, 'a dem fine woman'..."
- **Scope:** on-screen frame (needs a video re-render of the segment holding 16:22-16:31)
- **Verified:** yes — MEASURED: beat-138 is a quote beat at 16:22-16:31. config.vox.json:37032 holds "DEMURE". The designs.json lines 2814/2820/2821/2822 and authored-4.json lines 261/267/268/269 are as quoted. In scenes.tsx:171-193, QuoteScene renders props.emphasis (up to 3 tokens) in serif under a red quotation mark, so DEMURE is on screen. "dem fine woman" stays INFERRED.

### MN-10 · asr-names · **blocker-for-upload**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** captions[] (the burned-in CaptionLayer, src/engines/vox/index.tsx:45, captions.tsx renders words uppercase on every frame). Aslan indices 419, 435, 441, 446, 474, 496, 508, 510, 511, 523, 538, 544, 547, 554, 593, 597, 603, 607, 609, 624, 633. Jadis 281, 288, 296, 366, 389, 393, 408, 565, 574, 588, 592, 626. Polly 45, 149, 278, 393, 669. Digory 44 (Kirk), 46, 127, 173, 230, 234, 266, 310, 389, 522, 545, 547, 573, 580, 643, 697. Charn 241, 283, 320, 339, 495. Letty 328, 330. Jackdaw 483. Dem fine 365, 653. Other words 84, 112, 138, 181, 253, 254, 261, 345, 348, 355, 394, 421, 457, 560, 660, 679
- **Now:** 78 burned-in caption lines carry the same ASR errors as the clean.vtt, e.g. captions[419] 19:00.1 "is almost unbearable. It's Alan.", captions[296] 13:12.2 "Exactly. Jisus is the embodiment...", captions[483] 21:50.7 "...a jackaw yells out,", captions[365] 16:27.8 "...a quote demine woman." On screen they render as uppercase "ALAN", "JISUS", "JACKAW", "DEMINE".
- **Evidence:** Same narration evidence as MN-03 to MN-09 and MN-11. The Vox film draws config.captions word by word (captions.tsx: active.words.map(w => w.w), textTransform uppercase), so fixing clean.vtt alone leaves these errors visible in the MP4.
- **Fix:** Apply the MN-03 to MN-09 and MN-11 replacements to both captions[i].text and captions[i].words[j].w. There is no raw public/captions/the-magician-s-nephew.vtt in the worktree to re-run fix-vtt-names.js on, so the edit has to be made in config directly, or the VTT restored and the captions re-planned. Then re-render.
- **Scope:** on-screen frame (burned-in captions are spread across the film, from 1:57 to 31:25, so this needs a re-render of essentially every segment, i.e. the whole film)
- **Verified:** yes — Corrections to the count and the list. The list cites 80 indices, but only 77 are unique (389, 393 and 547 appear twice), so the correct figure is 77 lines, not 78. A regex scan for these errors found exactly 75 lines, plus 261 ("Strike the bell and b") and 421 ("Karatio X Aitu, creation") = 77, all present in the list. The list gives no replacement for captions[421] (see missed item 1). Confirmed: config.captions has 711 entries, every one with words[] arrays. captions.tsx:42 maps active.words and line 58 sets textTransform uppercase. index.tsx:45 renders <CaptionLayer captions={config.captions}/>. There is no raw public/captions/the-magician-s-nephew.vtt (only captions.vtt, nl/ and the clean.vtt). The span runs from captions[44] at 1:57.4 to captions[697] at about 31:23. The keywords fields in beat props also carry errors (beat-049 "degree", beat-135 and beat-171 "lampost"), but they are NOT drawn, because emphasis is set and the engine falls back to keywords only when emphasis is empty.

### MN-11 · other · **should-fix**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** cue 116 00:03:52.640 "sistern"; 154 00:05:04.560 "His [snorts] complaint"; 190 00:06:16.800 "Nietian"; 250 00:08:17.919 "liinal"; 343 00:11:23.120 "cruer"; 345 00:11:26.880 "desparing"; 356 00:11:47.920 "Strike the bell and b the danger"; 464 00:15:34.720 "ragd doll"; 467 00:15:40.079 and 523 00:17:44.160 "handsome cab"; 475 00:16:00.959 and 604 00:20:40.240 "lampost"; 733 00:25:17.039 "for bear"; 858 00:29:38.799 "frrowsy"; 883 00:30:32.720 "took a tel"
- **Now:** sistern / [snorts] / Nietian / liinal / cruer / desparing / b the danger / ragd / handsome cab / lampost / for bear / frrowsy / tel
- **Evidence:** Clear spelling and ASR errors. "cistern": beat-033 image prompt says "behind a cistern". "[snorts]" is a sound tag. "Nietzschean Superman". "liminal space". The bell inscription in the book reads "Strike the bell and bide the danger" and the gate reads "Take of my fruit for others or forbear" (INFERRED from the book). "hansom cab" is the Victorian vehicle. "lamp-post" matches beat-171 kicker "A LIVING LAMP-POST". "tel" is most likely "trowel" (INFERRED: beat-251 image prompt shows "a trowel between them").
- **Fix:** cistern; delete "[snorts] "; Nietzschean; liminal; crueler; despairing; bide the danger; rag doll; hansom cab; lamp-post; forbear; frowsy; trowel
- **Scope:** captions only (clean.vtt, upload-only). The same words are also burned in; see MN-10.
- **Verified:** yes — MEASURED: every listed cue matches. Cue 154 is the only bracket sound tag in the file. "tel" becoming "trowel" stays INFERRED: beat-251's prompt has "a trowel between them". The list missed cue 558 (00:19:04.880), "Karatio X Aitu, creation by", which is ASR for "creatio ex nihilo" (INFERRED). It is the same text as burned-in captions[421].

### MN-12 · hat · **blocker-for-upload**
- **File:** books/the-magician-s-nephew/story-bible.json
- **Where:** characters 'Frank the cabby' .look, line 103 (same text in bible.json:103). It propagates to designs.json:2991 (beat-147), 4548 (beat-224), 4569 (beat-225), 4590 (beat-226), storyboard/authored-4.json:465, authored-6.json:541, 565, 589, and config.vox.json lines 37370, 40243, 40282, 40322
- **Now:** "a weathered working-class London cabman, flat cap, heavy wool coat, thick moustache, Edwardian street worker". MEASURED: beat-147.png, beat-224.png, beat-225.png and beat-226.png all show Frank in a flat (newsboy) cap. In beat-226 the cap lies on the grass.
- **Evidence:** Narration cue 790 00:27:21.919 "A working-class guy in a bowler hat who loves his horse." plays over beat-225 (27:22-27:30), the very frame that shows him in a flat cap. beat-briefs.json:17069 even recorded "working-class guy bowler" as the said text. Uncle Andrew: no frame draws him with any hat, and the narration never mentions his hat, so there is NO Andrew hat mismatch.
- **Fix:** story-bible.json:103 and bible.json:103 become "...London cabman, black bowler hat, heavy wool coat, thick moustache...". In designs.json/authored-*.json beats 147, 224 and 225, change "flat cap" to "bowler hat", and in 226 "his flat cap resting on the grass" to "his bowler hat resting on the grass". Regenerate those 4 images.
- **Scope:** on-screen frame (re-render of the segments holding 17:37-17:46 and 27:14-27:38)
- **Verified:** yes — Correct on beats 147, 224 and 225, and on all the cited lines: story-bible.json:103, bible.json:103, designs.json:2991/4548/4569/4590, authored-4.json:465, authored-6.json:541/565/589, config.vox.json:37370/40243/40282/40322, and beat-briefs.json:17069. Cue 790 (00:27:21.919) mentions the bowler hat, and beat-225 runs 27:22-27:30. WRONG about beat-226: the cap does NOT lie on the grass (MEASURED). The image shows the crowned man (Frank, no cap) and the crowned wife standing, plus a THIRD figure, androgynous or female-looking, seated in front and WEARING the flat cap. The prompt clause "his flat cap resting on the grass" produced an extra person in a cap, not a cap. The fix should drop the cap from 226 entirely (for example, "Frank and Helen, two people only, crowned"), not swap in "bowler hat resting on the grass", which risks the same extra figure.

### MN-16 · other · **should-fix**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** beat-147 (17:37) images[0] line 37370 / designs.json:2991
- **Now:** Prompt: "a chain of figures ... all holding each other". MEASURED: beat-147.png shows a literal METAL CHAIN wrapped around Polly, Andrew and Frank and leading to the horse, and Jadis wears a plain grey dress with no crown.
- **Evidence:** Narration cue 522/523 00:17:40-00:17:46 "brings a whole chain of people with him ... They are all touching" means a human chain linked by touch (designs.json:2997 concreteVisual "all linked by touch"), not a shackle.
- **Fix:** subject becomes "Polly, Jadis (long dark gown, silver crown), Uncle Andrew, Frank the cabby (bowler hat) and the chestnut horse Strawberry in a line on a wet London street, each gripping the next one's hand, arm or bridle, no chains or ropes". Regenerate.
- **Scope:** on-screen frame (video re-render of the 17:37-17:46 segment)
- **Verified:** yes — MEASURED: beat-147 runs 17:37-17:46. config.vox.json:37370 and designs.json:2991/2997 are as quoted. beat-147.png shows a literal metal chain running from Jadis's hand through Andrew and Frank to the horse's bridle. Jadis wears a plain grey-brown dress with no crown. Frank wears a flat cap (overlaps MN-12).

### MN-17 · other · **cosmetic**
- **File:** books/the-magician-s-nephew/config.vox.json
- **Where:** beat-133 (15:48) images[0] line 36858; beat-136 (16:08) images[0]; beat-166 (19:55) images[0] line 38070
- **Now:** beat-133: "a tall woman ... standing in a stone hall, calm and regal" (MEASURED: Jadis in a stone hall). beat-136: "a wooden study desk with open books and a single lamp" (MEASURED: empty desk with a modern adjustable desk lamp, no person). beat-166: "standing in a stone hall" (MEASURED: Jadis in a stone hall).
- **Evidence:** beat-133 narration cue 15:48 "standing astride the roof of a stolen cab is a giant". beat-136 narration "Andrew, the supposed mastermind, cowers under the table when she arrives", and 1900 London has no modern desk lamp. beat-166 19:55 "When Jadis realizes what is happening", and she is standing in the newborn Narnia, not a hall.
- **Fix:** beat-133: "Jadis ... standing astride the roof of a hansom cab on a wet London street, whip raised". beat-136: "Uncle Andrew in his dressing gown cowering under a Victorian study table, gas lamp light". beat-166: "Jadis ... standing on bare new earth under a dawn sky, staring toward a singing lion, afraid". Regenerate.
- **Scope:** on-screen frame (video re-render of those segments)
- **Verified:** yes — MEASURED: beat-133 (15:48-15:52, config.vox.json:36858), beat-136 (16:08-16:15) and beat-166 (19:55-20:00, config.vox.json:38070) are as stated. beat-133.png and beat-166.png show Jadis crowned in a stone hall. beat-136.png shows an empty wooden table with open books and a modern adjustable desk lamp, no person. One correction: the narration excerpt for beat-136 is "contrast her with Uncle Andrew in this moment. Andrew, the supposed mastermind, cowers under the table when she arrives" (beat props.text, cues 479-480 and onward).

### MN-18 · other · **cosmetic**
- **File:** public/scenes/the-magician-s-nephew/
- **Where:** beat-215.png (26:10), beat-221.png (26:49), beat-237.png (28:55), beat-249.png (30:14)
- **Now:** MEASURED: Digory wears a modern grey T-shirt (215), jeans and a modern long-sleeve top (221), a modern sweatshirt (237) and a dark crew-neck sweatshirt (249).
- **Evidence:** The bible look (story-bible Digory) and the prompts themselves ask for "grey wool jacket and short trousers", an Edwardian 1900 schoolboy. Other frames such as beat-207 draw it correctly.
- **Fix:** Regenerate those images with the full bible look string ("grey wool jacket and short trousers, scuffed boots, Edwardian 1900") in the prompt.
- **Scope:** on-screen frame (video re-render of those segments)
- **Verified:** yes — The images match (MEASURED): 215 shows a modern grey-green V-neck T-shirt, 221 jeans and a modern long-sleeve top, 237 a dark crew-neck sweater, and 249 a dark crew-neck. All four apples except 249's are silver. Correction to the evidence: the prompts for 215, 221, 237 and 249 do NOT ask for "grey wool jacket and short trousers". They say only "Digory, a slim English boy of about eleven" (config beats 215/221/237, designs.json:5043). Only beat-207's prompt has the jacket, which is why 207 is correct. So the root cause is a bible look missing from the authored subject, not the generator ignoring the prompt. The fix (add the full look string to the authored designs/authored-*.json entries, then regenerate) stands.

## Upload captions only (clean.vtt — no re-render)

### MN-03 · asr-names · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (byte-identical copy: public/captions/the-magician-s-nephew.clean.vtt, md5 d4b785f2a38e4caa1e41f6c325d44558)
- **Where:** Aslan misspellings at cue 556 00:19:00.240 ("Alan"), 575 00:19:40.160 ("Alan's"), 585 00:19:59.760 ("Alen's"), 593 00:20:15.919 ("Alan"), 625 00:21:26.480 ("Alang"), 656 00:22:24.000, 671 00:22:55.280, 674 00:23:02.799, 676 00:23:05.600, 688 00:23:33.919, 705 00:24:16.720 ("Alen"), 714 00:24:35.440 ("Alon"), 717 00:24:41.679, 725 00:24:59.120 ("Alen"), 773 00:26:41.679 ("Alyn's"), 777 00:26:50.080 ("Alen"), 784 00:27:07.200 ("Alan"), 788 00:27:19.200, 792 00:27:25.279 ("Alen"), 811 00:28:03.919 ("Alin"), 822 00:28:27.039 ("Alen")
- **Now:** Alan / Alen / Alon / Alin / Alyn / Alang (21 cues). Only 2 cues spell "Aslan" correctly.
- **Evidence:** The character is Aslan, the lion. The same narration is spelled correctly elsewhere (cue for beat-196 "Aslan says, 'My son'"). The designs, bible and youtube-meta all say Aslan.
- **Fix:** Replace each variant with "Aslan" ("Alan's"/"Alen's"/"Alyn's" become "Aslan's"). Cue 674 becomes "uncle, Aslan. He sent us out by magic".
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — MEASURED: there are exactly 21 misspelled cues, matching the list, and they are spelled as listed. The two correct cues are 614 (00:21:03.760) and 696 (00:23:52.559, beat-196). The two clean.vtt files are byte-identical (md5 d4b785f2a38e4caa1e41f6c325d44558).

### MN-04 · asr-names · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** Jadis misspellings at cue 380 00:12:36.480 ("Jottis"), 388 00:12:51.920 ("Jais"), 399 00:13:12.240 ("Jisus"), 491 00:16:33.279 ("Jisus"), 517 00:17:30.799 ("Jettis"), 522 00:17:40.640 ("Jis"), 541 00:18:26.160 ("Jotis"), 738 00:25:29.200 ("Jattis"), 748 00:25:51.840, 767 00:26:26.159, 771 00:26:36.480 ("Jatis"), 813 00:28:07.919 ("Jis")
- **Now:** Jottis / Jais / Jisus / Jettis / Jis / Jotis / Jattis / Jatis (12 cues)
- **Evidence:** The character is Jadis, spelled correctly in 11 other cues and in every design and meta file.
- **Fix:** Replace each with "Jadis".
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — MEASURED: there are 12 misspelled cues as listed, and 11 correct "Jadis" cues (348, 416, 428, 442, 452, 454, 572, 584, 605, 653, 702).

### MN-05 · asr-names · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** Digory: cue 60 00:01:58.240 ("Digory Kirk"), 62 00:02:02.240, 417 00:13:54.639, 715 00:24:37.760 ("Digor's"), 174 00:05:46.080 ("he tells Degree"), 238 00:07:53.840, 517 00:17:30.799, 687 00:23:31.840, 717 00:24:41.679 ("Digree"), 314 00:10:22.399 ("Degre's"), 318 00:10:30.640, 836 00:28:52.559 ("Diggory"), 363 00:12:02.640 ("Digorit's"), 746 00:25:47.120 ("Diggery"), 756 00:26:06.159, 908 00:31:21.520 ("Digger")
- **Now:** Digor's / Degree / Digree / Degre's / Diggory / Digorit's / Diggery / Digger / Kirk
- **Evidence:** The character is Digory Kirke (book.json, story-bible, youtube-meta tag "Digory Kirke"). The film spells "Digory" correctly 31 times.
- **Fix:** "Digor's"/"Digorit's"/"Degre's" become "Digory's". "Degree", "Digree", "Diggory", "Diggery" and "Digger" become "Digory". "Kirk" becomes "Kirke". Cue 174 becomes "protects him. I mean, he tells Digory, 'Ours is a high and lonely destiny'"; the ASR line "hours ours" is continued in the next cue.
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — All 16 misspelled cues match. Precision fixes: cue 836 reads "Diggory's", so it becomes "Digory's". Cue 687 reads "Digree's", so it becomes "Digory's". The "hours ours" error sits in cue 175 (00:05:48.479), "hours ours is a high and lonely destiny." Cue 174 should end "he tells Digory," and cue 175 should become "'Ours is a high and lonely destiny.'" The ASR "hours" must be deleted in cue 175, not in 174. The count of correct cues is 30, or 31 if cue 60 ("Digory Kirk") is included.

### MN-06 · asr-names · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** Polly: cue 61 00:02:00.000 ("Paulie Plamer"), 204 00:06:46.080, 376 00:12:27.839, 870 00:30:05.600 ("Paulie"), 522 00:17:40.640 ("Paulolly")
- **Now:** Paulie Plamer / Paulie / Paulolly
- **Evidence:** The character is Polly Plummer (youtube-meta description, designs.json beat-218/251 "Polly Plummer"). Spelled "Polly" correctly in 7 cues.
- **Fix:** "Paulie Plamer" becomes "Polly Plummer"; "Paulie" and "Paulolly" become "Polly". Cue 522 becomes "Polly, Jadis, Uncle Andrew, the cabbie".
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — MEASURED: the 5 misspelled cues are as listed. Polly is spelled correctly in 7 cues (115, 302, 364, 369, 413, 768, 840).

### MN-07 · asr-names · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** Charn: cue 328 00:10:48.160, 429 00:14:21.120, 653 00:22:18.400 ("char"), 455 00:15:16.720 ("Char's"), 383 00:12:43.279 ("Shard"). Letty: cue 440 00:14:47.519, 443 00:14:53.760 ("Lety"). Jackdaw: cue 637 00:21:50.559 ("jackaw")
- **Now:** char / Char's / Shard; Lety; jackaw
- **Evidence:** The world is Charn (youtube-meta chapter "Jadis Wakes in Charn"; designs beat-183 "city of Charn"). The aunt is Aunt Letty (cue 464 spells it correctly). The bird is the jackdaw: beat-180 kicker emphasis "JACKDAW" and image prompt "a black jackdaw" (config line for beat-180).
- **Fix:** "char" becomes "Charn", "Char's" becomes "Charn's", "Shard" becomes "Charn", "Lety" becomes "Letty", "jackaw" becomes "jackdaw".
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — MEASURED: "char" appears in cues 328, 429 and 653, "Char's" in 455, "Shard" in 383 ("history of Shard"), "Lety" in 440 and 443, and "jackaw" in 637. beat-180 has emphasis "JACKDAW" and its prompt says "a black jackdaw". Aunt Letty is spelled correctly in cues 434, 452 and 464.

### MN-09 · demure · **blocker-for-upload**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** cue 489 00:16:28.480 and cue 849 00:29:17.120
- **Now:** "as a quote demine woman." / "the demine woman he met."
- **Evidence:** Same ASR mishearing as MN-08. Uncle Andrew's phrase in the book is "a dem fine woman" (INFERRED from the book).
- **Fix:** "as a quote, dem fine woman." / "the dem fine woman he met."
- **Scope:** captions only (clean.vtt, upload-only)
- **Verified:** yes — MEASURED: cue 489 (00:16:28.480) reads "as a quote demine woman." and cue 849 (00:29:17.120) reads "the demine woman he met."

### MN-11 · other · **should-fix**
- **File:** out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (+ identical public/captions copy)
- **Where:** cue 116 00:03:52.640 "sistern"; 154 00:05:04.560 "His [snorts] complaint"; 190 00:06:16.800 "Nietian"; 250 00:08:17.919 "liinal"; 343 00:11:23.120 "cruer"; 345 00:11:26.880 "desparing"; 356 00:11:47.920 "Strike the bell and b the danger"; 464 00:15:34.720 "ragd doll"; 467 00:15:40.079 and 523 00:17:44.160 "handsome cab"; 475 00:16:00.959 and 604 00:20:40.240 "lampost"; 733 00:25:17.039 "for bear"; 858 00:29:38.799 "frrowsy"; 883 00:30:32.720 "took a tel"
- **Now:** sistern / [snorts] / Nietian / liinal / cruer / desparing / b the danger / ragd / handsome cab / lampost / for bear / frrowsy / tel
- **Evidence:** Clear spelling and ASR errors. "cistern": beat-033 image prompt says "behind a cistern". "[snorts]" is a sound tag. "Nietzschean Superman". "liminal space". The bell inscription in the book reads "Strike the bell and bide the danger" and the gate reads "Take of my fruit for others or forbear" (INFERRED from the book). "hansom cab" is the Victorian vehicle. "lamp-post" matches beat-171 kicker "A LIVING LAMP-POST". "tel" is most likely "trowel" (INFERRED: beat-251 image prompt shows "a trowel between them").
- **Fix:** cistern; delete "[snorts] "; Nietzschean; liminal; crueler; despairing; bide the danger; rag doll; hansom cab; lamp-post; forbear; frowsy; trowel
- **Scope:** captions only (clean.vtt, upload-only). The same words are also burned in; see MN-10.
- **Verified:** yes — MEASURED: every listed cue matches. Cue 154 is the only bracket sound tag in the file. "tel" becoming "trowel" stays INFERRED: beat-251's prompt has "a trowel between them". The list missed cue 558 (00:19:04.880), "Karatio X Aitu, creation by", which is ASR for "creatio ex nihilo" (INFERRED). It is the same text as burned-in captions[421].

## YouTube metadata only (no re-render)

### MN-13 · thumbnail-template · **should-fix**
- **File:** books/the-magician-s-nephew/youtube-meta.json
- **Where:** thumbnail.subject (line 113) and thumbnail.fluxPrompt (line 120). The same text is in youtube.md:53 ("- Subject: ..."), out/the-magician-s-nephew/youtube-meta.json, out/the-magician-s-nephew/youtube.md and thumbnail-concepts.json concepts[0].visualSubject (line 18) / fluxPrompt (line 26)
- **Now:** subject ends "...low camera angle emphasizing scale, the people they want to reach barely visible at the edges"; fluxPrompt contains "...no watermark, no text, n, period-accurate, no anachronisms". The winning concept also keeps the generic angle text: hook "THE SETUP", thesis "Who controls the city, the story, or the world? Authority vs. challenger.", evidence "The Setup: How \"The Magician's Nephew\" Works ... and it's not what you'd expect."
- **Evidence:** MEASURED: "the people they want to reach barely visible at the edges" is the literal fallback string in scripts/thumbnail-art-director.js:233, and the thesis text is scripts/lib/thumbnail-concepts.js:19; nothing in the narration matches either. "n," is a truncated token. The rendered thumbnail (out/thumbnail-the-magician-s-nephew.png, MEASURED by eye) shows no template text: the visible hook is "POWER YOU CAN'T UNDO" and "by C.S. Lewis", so the leak sits in the metadata/prompt only. The requested red tray of rings is NOT visible in the image.
- **Fix:** subject becomes "a slim English boy of about eleven, short untidy brown hair, grey wool jacket and short trousers, scuffed boots, standing in Uncle Andrew's dusty London attic study beside a highback chair and a ticking clock, holding a glowing yellow ring over a red wooden tray of yellow and green rings, low camera angle". In fluxPrompt, delete " n," so it reads "no text, period-accurate". Then run plan-meta.js <config> --md-only (youtube.md line 53) and re-run render-thumbnails.js --slug=the-magician-s-nephew if the image should show the rings.
- **Scope:** YouTube metadata (youtube.md / youtube-meta.json). Re-render the thumbnail only if the rings are wanted in the image.
- **Verified:** yes — MEASURED: youtube-meta.json:113 and :120, youtube.md:53, out/ copies at the same lines, and thumbnail-concepts.json:15-18 and :26 are as quoted. The winner is power-00 (thumbnail-concepts.json:274-275). The hook "THE SETUP" and the thesis match scripts/lib/thumbnail-concepts.js:19. Slight wording fix: in scripts/thumbnail-art-director.js:233 the phrase is the tail of the generic power-angle template (the non-OVERLAY branch with a character), not a fallback-only string. The rendered thumbnail shows "POWER YOU CAN'T UNDO" and "by C.S. Lewis", the boy in a jacket and shorts in the attic, a wing chair, and no ring tray, all as stated.

### MN-14 · other · **should-fix**
- **File:** books/the-magician-s-nephew/youtube-meta.json
- **Where:** chapters[7] {t:1301} and the description line "21:41 Strawberry Takes Flight" (also out/the-magician-s-nephew/chapters.txt line 8, description.txt, youtube.md)
- **Now:** 21:41 Strawberry Takes Flight
- **Evidence:** At 21:41 the narration is Strawberry SPEAKING: cue 632 00:21:41.440 "cab horse Strawberry looking around and saying, 'But please, we don't know very much yet.'", then the jackdaw joke (cue 637). Strawberry only becomes winged Fledge and flies at cues 725/726 00:24:59-00:25:03, inside the 24:55 chapter.
- **Fix:** "21:41 Strawberry Speaks: Narnia's First Joke"
- **Scope:** YouTube metadata
- **Verified:** yes — MEASURED: chapters[7] t=1301 (youtube-meta.json:87-88), chapters.txt line 8, description.txt line 15, and youtube.md line 32 in both books/ and out/. Cues 632-634 ("saying, 'But please, we don't know very much yet.'") are Strawberry speaking. Cues 725-726 at 24:59 are the transformation into Fledge. config.vox.json has chapters [] (empty), so the chapter labels are not burned into the film. The fix is metadata-only.

### MN-15 · other · **should-fix**
- **File:** books/the-magician-s-nephew/youtube-meta.json
- **Where:** chapters[6] {t:1176} "Andrew and Jadis" and chapters[5] {t:955} "Jadis Follows Them to London" (and the matching lines in description, out/chapters.txt, out/description.txt, youtube.md)
- **Now:** 15:55 Jadis Follows Them to London / 19:36 Andrew and Jadis
- **Evidence:** Jadis has already followed them to London by cue 423 00:14:07.600 ("back into Uncle Andrew's study in 1900's"), inside the 13:47 chapter. At 15:55 the narration is the stolen-cab rampage (beat-134 15:52 "whipping a horse named Strawberry"). The 19:36-21:41 span is Aslan's song versus Jadis: she throws the iron bar at the lion (beats 167-169, 20:00-20:25), it grows into the lamp-post (beat-171 20:34) and she flees (beat-174 20:58). Uncle Andrew does not appear in it. The creation song itself starts at cue 531 00:18:03 and has no chapter.
- **Fix:** Change 15:55 to "Jadis Rampages Through London" and 19:36 to "The Iron Bar Becomes the Lamp-Post". Optionally add "18:03 Aslan Sings Narnia Into Being".
- **Scope:** YouTube metadata
- **Verified:** yes — Largely right. One nuance: the 19:36 label comes from cue 572 (00:19:36.160), "magic of Andrew and Jadis.", which is the only mention of Andrew in cues 560-640. Andrew is named once there as a contrast, but no Andrew action takes place in the span. The other evidence checks out: cue 423 (14:07.600) has the return to London, beat-133 starts at 15:48, and cue 531 (18:03.360) is the start of the song of creation. description.txt lines 13-14 and chapters.txt lines 6-7 match.

## Found by the verifier (not in the first list)

- asr-names/other: cue 558 00:19:04.880 in out/the-magician-s-nephew/the-magician-s-nephew.clean.vtt (and the identical public/captions copy) reads "to exist. Karatio X Aitu, creation by". It should be "creatio ex nihilo" (INFERRED from context: the creation song). The same text is burned in as config.vox.json captions[421] ("exist. Karatio X Aitu, creation"). MN-10 lists index 421 but no list item gives its replacement.
- asr-names: the "hours ours" fragment is in cue 175 00:05:48.479 ("hours ours is a high and lonely destiny."), not cue 174. It is burned in too: config captions around index 127-ish/173 (MN-10 Digory indices). The fix must delete "hours" in cue 175 and the matching caption words[] entry.
- hat (worse than listed): beat-226.png (27:30-27:38) shows an EXTRA third person, seated and wearing the flat cap, next to the crowned Frank and Helen. The prompt clause "his flat cap resting on the grass" (designs.json:4590, authored-6.json:589, config.vox.json:40322) produced a duplicate figure. The fix should remove the cap clause entirely.
- other (non-rendered, low priority): the beat props.text and keywords fields carry the ASR errors, e.g. beat-049 keywords "degree" (config.vox.json:33733), beat-135 and beat-171 "lampost" (36925, 38248), and beat-147 text "Paulolly, Jis ... handsome cab". MEASURED: they do not reach the screen, because QuoteScene and the other scenes fall back to keywords only when emphasis is empty, and the only DocumentScene beat (beat-019, which renders props.text as body) is error-free. Fix them only for consistency.
- other (metadata, minor): chapter "13:47 The Yellow Rings and the Dead City" (youtube-meta.json chapters[4] t=827). At 13:44-13:48 (cues 413-414) the children are fleeing Charn back to London with Jadis attached. The dead city itself was introduced at about 10:48 (cue 328). The label is arguably off, but this is a judgement call, not a clear error.

## Checked and NOT an error

- Golden apple in the NARRATION: refuted. No cue in the clean VTT calls the apple golden. Every coloured mention is silver (cues 720, 736, 783, 881). The 'golden' cues are the bell (Charn), the lion and the garden wall ('walls of gold', cue at 25:05), and those match the book. The golden apple exists only in the images of beat-243 and beat-249 (MN-01, MN-02). No kicker or emphasis says 'GOLDEN APPLE'; beat-203's kicker is 'THE SILVER APPLE'.
- Uncle Andrew hat mismatch: not confirmed. No Andrew frame draws a hat (beats 001/002/039/137/189/239/240 bare-headed, beat-137 shows a black frock suit), and the narration never mentions his hat. The only hat conflict is Frank the cabby: flat cap on screen, 'bowler hat' in narration cue 790 (MN-12).
- Raw VTT public/captions/the-magician-s-nephew.vtt does not exist in the worktree. public/captions/captions.vtt and public/captions/nl/captions.vtt belong to another book (0 and 3 Digory/Alen hits). So fix-vtt-names.js cannot be re-run from the raw file, and the fixes have to be applied to clean.vtt and config.vox.json captions directly.
- NARRATION facts that cannot be fixed without re-recording (reported, not listed as fixes). Cue 876 00:30:17.679 'Digory ate the core of the Narnian apple': in the book his mother eats the apple and Digory buries the core (INFERRED from the book; the narration is internally consistent with burying the core next). Cue 558 00:19:04.880 'Karatio X Aitu, creation by': unclear ASR, probably a Latin phrase such as 'creatio ex ...'. I could not verify the intended words, so I left it out of the caption fix list; a human should listen to the audio at 19:05.
- Gap in the brief, not a confirmed error: books/the-magician-s-nephew/config.vox.json has 'chapters': [], so the film has no on-screen chapter cards or ProgressRail chapters. YouTube chapters live only in the description.
- On-screen kickers and emphasis contain no misspelled names (checked all 261 beats): ASLAN, JADIS, POLLY, DIGORY, STRAWBERRY, FLEDGE, JACKDAW, AUNT LETTY, FRANK and CHARN are all spelled correctly. The only on-screen word error is DEMURE (MN-08). The misspellings on screen are all in the burned-in caption bar (MN-10).
- Tags and title (out/the-magician-s-nephew/tags.txt, title.txt) contain no placeholders or errors. out/description.txt matches youtube-meta.description apart from a trailing newline.

## Order of work for the owner
1. Fix the authored sources for every video item: designs.json and authored-*.json, plus the bible look where it is named.
   Then regenerate the affected images (beat-243, beat-249, and the hat and outfit beats) and re-run make-book.
2. Fix the burned-in caption words in the config captions, then the upload `clean.vtt` (both copies).
3. Fix the YouTube metadata, then run `node scripts/lint-titles.js --slug=the-magician-s-nephew --pack`; it must print YouTube READY.
4. Changes to the picture or the burned-in captions mean a new render input, so you need:
   - a new sealed mute holdout and preview-ready (a fresh label, never a re-run of run5);
   - a new `--authorize-render` for that input, from the operator;
   - a new cloud render.
   **Captions-only and metadata-only fixes do not need a re-render.**
