// Version A vs B sandbox configs: only the selected scenes may change what a viewer sees.
const fs = require("fs"), path = require("path");
const AB = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/ab";
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/ab-sandbox";
const SEL = JSON.parse(fs.readFileSync("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/authoring-ab-2026-10-17/selection.json", "utf8"));
const vis = (s) => JSON.stringify({ shot: s.shot, set: s.bg && s.bg.set, concept: s.concept || null, diagram: s.diagram ? s.diagram.type : null,
  chars: (s.characters || []).map((c) => [c.identity, c.expression, c.action, c.holds || null, !!c.silhouette]),
  props: (s.props || []).map((p) => p.type), texts: (s.texts || []).map((t) => [t.text, t.style || null]), rel: !!s.relationshipStaging });
const report = {};
for (const [slug, aFile, key] of [["burn-of-the-everflame", "burn-config-A.json", "burn"], ["the-art-of-saying-no", "asn-config-A.json", "the-art-of-saying-no"]]) {
  const A = JSON.parse(fs.readFileSync(path.join(AB, aFile), "utf8"));
  const B = JSON.parse(fs.readFileSync(path.join(SB, "books", slug, "config.antidote.json"), "utf8"));
  const sel = new Set(SEL[key].map((x) => x.scene).filter((id) => !(slug === "the-art-of-saying-no" && id === "scene-159")));
  const a = Object.fromEntries(A.scenes.map((s) => [s.id, s])), b = Object.fromEntries(B.scenes.map((s) => [s.id, s]));
  const timing = A.scenes.every((s, k) => B.scenes[k] && B.scenes[k].id === s.id && B.scenes[k].fromFrame === s.fromFrame && B.scenes[k].durationFrames === s.durationFrames);
  const changed = Object.keys(a).filter((id) => b[id] && vis(a[id]) !== vis(b[id]));
  report[slug] = { timingIdentical: timing, selected: [...sel], selectedChanged: changed.filter((id) => sel.has(id)),
    selectedUnchanged: [...sel].filter((id) => !changed.includes(id)), changedOutsideSelection: changed.filter((id) => !sel.has(id)),
    pairs: [...sel].map((id) => ({ id, A: vis(a[id]), B: vis(b[id]) })) };
  console.log(`${slug}: timing ${timing ? "identical" : "DIFFERS"}; selected changed ${report[slug].selectedChanged.length}/${sel.size}; unchanged selected ${report[slug].selectedUnchanged.join(",") || "-"}; changed OUTSIDE selection ${report[slug].changedOutsideSelection.length} ${report[slug].changedOutsideSelection.slice(0, 12).join(",")}`);
  for (const p of report[slug].pairs) console.log(`  ${p.id}\n    A ${p.A}\n    B ${p.B}`);
}
fs.writeFileSync(path.join(AB, "diff-ab.json"), JSON.stringify(report, null, 1));
