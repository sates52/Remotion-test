// Author packets for the authoring A/B: narration of each frozen beat + neighbours' narration and staging.
// The OLD staging of the selected beats and every blind finding are deliberately left out.
const fs = require("fs"), path = require("path");
const ROOT = "C:/Users/savas/Cursor/Remotion/test";
const SEL = JSON.parse(fs.readFileSync("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/authoring-ab-2026-10-17/selection.json", "utf8"));
const OUT = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/ab";
const stagingOf = (b) => ({ cast: b.cast, set: b.set, shot: b.shotOverride || b.shot, concept: b.concept, diagram: b.diagram && b.diagram.type,
  callout: b.callout, expression: b.expression, action: b.action, holds: b.holds, stageRelationship: b.stageRelationship || undefined });
for (const slug of ["burn-of-the-everflame", "the-art-of-saying-no"]) {
  const art = JSON.parse(fs.readFileSync(path.join(ROOT, "books", slug, "art.json"), "utf8")).beats;
  const byI = Object.fromEntries(art.map((b) => [b.i, b]));
  const ids = SEL[slug === "burn-of-the-everflame" ? "burn" : slug].map((x) => parseInt(x.scene.replace("scene-", ""), 10));
  const chosen = new Set(ids);
  const beats = ids.map((i) => ({
    i, narration: byI[i].narration,
    before: [i - 2, i - 1].filter((k) => byI[k]).map((k) => ({ i: k, narration: byI[k].narration, ...(chosen.has(k) ? { staging: "(also being re-authored)" } : { staging: stagingOf(byI[k]) }) })),
    after: [i + 1, i + 2].filter((k) => byI[k]).map((k) => ({ i: k, narration: byI[k].narration, ...(chosen.has(k) ? { staging: "(also being re-authored)" } : { staging: stagingOf(byI[k]) }) })),
  }));
  fs.writeFileSync(path.join(OUT, `${slug}-packet.json`), JSON.stringify({ slug, beats }, null, 2));
  console.log(slug, ids.join(","));
}
