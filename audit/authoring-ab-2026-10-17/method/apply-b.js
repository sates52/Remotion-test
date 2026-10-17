// Put the version-B beats into the SANDBOX art.json (only the selected beats; i and narration kept).
const fs = require("fs"), path = require("path");
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/ab-sandbox";
const AB = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/ab";
const DROP = { "the-art-of-saying-no": new Set([159]) }; // current planner turns it into a chapter card in A and B
for (const slug of ["burn-of-the-everflame", "the-art-of-saying-no"]) {
  const artPath = path.join(SB, "books", slug, "art.json");
  const art = JSON.parse(fs.readFileSync(artPath, "utf8"));
  fs.writeFileSync(path.join(AB, `${slug}-art-A.json`), JSON.stringify(art, null, 2)); // version A, as rendered
  const B = JSON.parse(fs.readFileSync(path.join(AB, `${slug}-authoredB.json`), "utf8"));
  let n = 0;
  for (const b of B) {
    if (DROP[slug] && DROP[slug].has(b.i)) continue;
    const k = art.beats.findIndex((x) => x.i === b.i);
    if (k < 0) throw new Error(`${slug}: beat ${b.i} not in art.json`);
    if (b.narration !== art.beats[k].narration) throw new Error(`${slug}: beat ${b.i} narration differs`);
    const { explainedBy, noVisual, ...beat } = b;
    art.beats[k] = { ...beat, i: art.beats[k].i, narration: art.beats[k].narration };
    n++;
  }
  fs.writeFileSync(artPath, JSON.stringify(art, null, 2) + "\n");
  console.log(`${slug}: ${n} beat(s) replaced in sandbox art.json`);
}
