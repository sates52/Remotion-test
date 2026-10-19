// Author packets for the sequence lab: window narration (in order) + 2 neighbours each side with their staging.
// The window beats' OLD staging is left out on purpose (no anchoring), and no blind findings are included.
const fs = require("fs"), path = require("path");
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/seq-lab";
const SEQ = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq";
const SEL = JSON.parse(fs.readFileSync("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/sequence-lab-2026-10-19/selection.json", "utf8"));
const staging = (b) => ({ cast: b.cast, set: b.set, shotOverride: b.shotOverride, concept: b.concept, diagram: b.diagram, callout: b.callout, expression: b.expression, action: b.action, holds: b.holds });
for (const side of ["fiction", "nonfiction"]) {
  const { slug, beats, idea } = SEL[side];
  const art = JSON.parse(fs.readFileSync(path.join(SB, "books", slug, "art.json"), "utf8")).beats;
  const by = Object.fromEntries(art.map((b) => [b.i, b]));
  const ids = beats.map((s) => parseInt(s.replace("scene-", ""), 10));
  const lo = Math.min(...ids), hi = Math.max(...ids);
  const out = {
    slug, ideaHint: idea,
    before: [lo - 2, lo - 1].filter((k) => by[k]).map((k) => ({ i: k, narration: by[k].narration, staging: staging(by[k]) })),
    window: ids.map((k) => ({ i: k, narration: by[k].narration })),
    after: [hi + 1, hi + 2].filter((k) => by[k]).map((k) => ({ i: k, narration: by[k].narration, staging: staging(by[k]) })),
  };
  fs.writeFileSync(path.join(SEQ, `${slug}-packet.json`), JSON.stringify(out, null, 2));
  console.log(slug, ids.join(","), "neighbours", out.before.length, out.after.length);
}
