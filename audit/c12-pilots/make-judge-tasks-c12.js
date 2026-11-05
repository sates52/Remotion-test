// C12 judge-task wrapper: c11 wrapper + item 3b polarityError (text verbatim from audit/c12-pilots/rating-prompts.md)
const fs = require("fs");
const S = process.argv[2];
const R = require("C:/Users/savas/Cursor/Remotion/wt-c12/scripts/lib/mute-rubric.js").JUDGE_RULES;
const INSTR = `You judge whether muted viewers understood short scenes of animated book-summary videos. This file holds 4 items; each has the narration spoken over the scene, the frozen answer key (what a muted viewer should understand, its cause, its effect, key facts, plausible wrong inferences, whether the narration states any causality at all, what the narrator asserts, and what the narration mentions but does NOT assert — notAsserted), and what a viewer with the sound off wrote (description). Judge each item on its own.
1. cause — CORRECT (the viewer's cause matches the key's cause in meaning), WRONG (contradicts it), NOT_SHOWN (unclear / missing / something else). effect — the same against the key's effect. If the key says supportsCausality: false, answer "NA" for both.
2. message — MATCH (the viewer's message states the key's understanding), PARTIAL (its subject or half of it), MISS.
3b. polarityError — YES if the viewer states as true (or as the narrator's point) something the key lists under notAsserted (a rejected premise, counterfactual, hypothesis, question, quoted speech, uncertain claim or the setup half of a contrast); otherwise NO.
3. wrongInference — YES if the viewer states something the key lists as a wrong inference, or a cause / claim that contradicts the narration; otherwise NO.
4. For each of the three frames (use the matching "sees" line + the message), the standard mute rubric:
${R}
Judge meaning, not wording; be strict and literal; do not reward a version for being prettier or busier.
Write ONLY a JSON array (4 objects, one per item, same order) to the output path you were given: [{"img":"…","cause":"…","effect":"…","message":"…","wrongInference":"YES|NO","polarityError":"YES|NO","why":"…","frames":[{"correctness":"…","contribution":"…","explains":"YES|NO","why":"…"},{…},{…}]}, …]`;
for (const p of [1, 2]) {
  const d = `${S}/judge-in-p${p}`;
  for (const f of fs.readdirSync(d).filter((x) => /^J\d+\.json$/.test(x))) {
    const items = JSON.parse(fs.readFileSync(`${d}/${f}`, "utf8"));
    fs.writeFileSync(`${d}/${f.replace(".json", ".task.json")}`, JSON.stringify({ instructions: INSTR, items }, null, 1));
  }
}
fs.writeFileSync(`${S}/judge-instructions.txt`, INSTR);
console.log("ok");
