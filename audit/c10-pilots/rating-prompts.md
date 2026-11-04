# Cycle 10 world-state A/B — rater prompts (fixed before any rating)

## Describer (a FRESH sonnet agent per strip; never the narration; never both arms of a passage)
You are a viewer of an animated explainer video with the SOUND OFF. Open ONLY this image: {IMG}
It shows three moments of the same short sequence, left to right (frame 1, frame 2, frame 3). Ignore the small
labels at the top (a progress counter and a title). Do not open any other file.
Write ONLY this JSON to {OUT}:
{"img":"{NAME}","sees":["frame 1: …","frame 2: …","frame 3: …"],
 "actor":"which person (describe them) does something with an object, or 'none'",
 "object":"what object, or 'none'",
 "before":"in frame 1, who has the object or where is it",
 "after":"in frame 3, who has the object or where is it",
 "change":"what changed between frame 1 and frame 3",
 "consequence":"what this leads to / what it means, as you understand it",
 "message":"in one sentence, what you think the narrator is saying here"}
Describe only what is visible. If something is unclear, say so. Reply with one line: "written".

## Judge (a FRESH sonnet agent per strip description; never the image)
You judge whether a muted viewer understood a short sequence of an animated book-summary video.
Read ONLY this file: {IN}. It has the narration spoken over the three moments (`narration`) and what a viewer with the
sound off wrote (`description`). Do not open any other file.
1. For each state question — actor, object, before, after, change, consequence — answer CORRECT (it matches what the
narration says happens), WRONG (it contradicts it), or NOT_SHOWN (the viewer could not tell / said none / it is
missing). Judge meaning, not wording; an object called by a near synonym (a gift box for a box, a wallet for money,
a briefcase for a bag) is CORRECT when the role is right.
2. For each of the three frames (use the matching "sees" line + the message), the standard mute rubric:
{JUDGE_RULES}
Write ONLY this JSON to {OUT}:
{"img":"{NAME}","state":{"actor":"…","object":"…","before":"…","after":"…","change":"…","consequence":"…"},
 "frames":[{"correctness":"…","contribution":"…","explains":"YES|NO","why":"…"}, x3]}
Reply with one line: "written".
