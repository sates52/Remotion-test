// Unblind the pairwise judgments (pair-key.json) and tabulate per scene and in total.
const fs = require("fs"), path = require("path");
const AB = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/ab";
const key = JSON.parse(fs.readFileSync(path.join(AB, "pair-key.json"), "utf8"));
const judges = [1, 2].map((k) => Object.fromEntries(JSON.parse(fs.readFileSync(path.join(AB, `pair-result-${k}.json`), "utf8")).items.map((x) => [x.id, x])));
const sel = JSON.parse(fs.readFileSync("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/authoring-ab-2026-10-17/selection.json", "utf8"));
const rows = [];
for (const [pid, k] of Object.entries(key)) {
  const per = judges.map((J) => {
    const r = J[pid]; if (!r) return null;
    const A = r[k.X === "A" ? "X" : "Y"], B = r[k.X === "B" ? "X" : "Y"];
    const better = r.better === "TIE" ? "TIE" : r.better === "X" ? k.X : r.better === "Y" ? k.Y : "?";
    return { A, B, better, why: r.why };
  });
  rows.push({ pid, slug: k.slug, scene: k.scene, per });
}
rows.sort((a, b) => (a.slug + a.scene).localeCompare(b.slug + b.scene));
const bad = (v) => v && (v.correctness === "WRONG" || v.contribution === "NONE");
const tot = { pref: { A: 0, B: 0, TIE: 0 }, agree: 0, n: 0, A: { WRONG: 0, dead: 0, ADDS: 0, EXPLAINS: 0 }, B: { WRONG: 0, dead: 0, ADDS: 0, EXPLAINS: 0 } };
for (const r of rows) {
  const v = r.per.filter(Boolean);
  v.forEach((p) => { tot.pref[p.better]++; for (const s of ["A", "B"]) { if (p[s].correctness === "WRONG") tot[s].WRONG++; if (p[s].contribution === "NONE") tot[s].dead++; if (p[s].contribution === "ADDS") tot[s].ADDS++; if (String(p[s].explains).toUpperCase() === "YES") tot[s].EXPLAINS++; } });
  if (v.length === 2) { tot.n++; if (v[0].better === v[1].better) tot.agree++; }
  r.consensus = v.length === 2 && v[0].better === v[1].better ? v[0].better : "SPLIT";
  r.newMisread = v.some((p) => p.B.correctness === "WRONG" && p.A.correctness !== "WRONG");
}
console.log("scene".padEnd(34), "J1".padEnd(5), "J2".padEnd(5), "consensus", "  A (j1|j2)                 B (j1|j2)");
for (const r of rows) {
  const f = (s) => r.per.map((p) => (p ? `${p[s].correctness[0]}/${p[s].contribution.replace("TEXT_ONLY", "TXT")}` : "-")).join("|");
  console.log(`${r.slug.slice(0, 12)}/${r.scene}`.padEnd(34), (r.per[0] || {}).better.padEnd(5), (r.per[1] || {}).better.padEnd(5), r.consensus.padEnd(9), " ", f("A").padEnd(26), f("B"), r.newMisread ? "  <- NEW WRONG in B" : "");
}
console.log(`\npreference (both judges, ${rows.length} pairs x 2): B ${tot.pref.B} · A ${tot.pref.A} · TIE ${tot.pref.TIE}; judges agree on ${tot.agree}/${tot.n}`);
console.log(`consensus: B ${rows.filter((r) => r.consensus === "B").length} · A ${rows.filter((r) => r.consensus === "A").length} · TIE ${rows.filter((r) => r.consensus === "TIE").length} · split ${rows.filter((r) => r.consensus === "SPLIT").length}`);
console.log(`per-version totals over 2 judges (34 judgments each): A ${JSON.stringify(tot.A)} · B ${JSON.stringify(tot.B)}`);
fs.writeFileSync(path.join(AB, "pair-scored.json"), JSON.stringify({ rows, tot }, null, 1));
