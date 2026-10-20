// Rebuild the workflow results from journal.jsonl (label -> result), unblind the judges with the same
// deterministic key the workflow used (oldIsX = (bookIndex + pass) % 2 === 0), save everything, print a summary.
const fs = require("fs"), path = require("path");
const [J, A] = process.argv.slice(2);
const lines = fs.readFileSync(J, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const label = Object.fromEntries(lines.filter((x) => x.type === "started").map((x) => [x.key, x.label]));
const byLabel = {};
for (const x of lines.filter((x) => x.type === "result")) byLabel[label[x.key]] = x.result;
const BOOKS = [{ slug: "burn-of-the-everflame", short: "burn" }, { slug: "15-secrets-successful-people-know-about-time-management", short: "15sec" }];
const reads = [], judged = [], stills = [];
BOOKS.forEach((b, bi) => {
  for (const ver of ["OLD", "NEW"]) for (const pass of [1, 2]) reads.push({ slug: b.slug, ver, pass, r: byLabel[`read:${b.short}-${ver}-p${pass}`] });
  stills.push({ short: b.short, r: byLabel[`still:${b.short}`] });
  for (const pass of [1, 2]) {
    const oldIsX = (bi + pass) % 2 === 0;
    judged.push({ slug: b.slug, short: b.short, pass, key: { X: oldIsX ? "OLD" : "NEW", Y: oldIsX ? "NEW" : "OLD" }, verdict: byLabel[`judge:${b.short}-p${pass}`] });
  }
});
fs.mkdirSync(path.join(A, "reads"), { recursive: true }); fs.mkdirSync(path.join(A, "judging"), { recursive: true });
fs.writeFileSync(path.join(A, "reads", "strip-reads.json"), JSON.stringify(reads, null, 1));
fs.writeFileSync(path.join(A, "reads", "still-reads.json"), JSON.stringify(stills, null, 1));
fs.writeFileSync(path.join(A, "judging", "judge-results-blinded.json"), JSON.stringify(judged.map(({ key, ...r }) => r), null, 1));
fs.writeFileSync(path.join(A, "judging", "judge-key.json"), JSON.stringify(judged.map((j) => ({ short: j.short, pass: j.pass, key: j.key })), null, 1));
const score = {};
for (const r of reads) console.log(`${r.slug.slice(0, 8)} ${r.ver} p${r.pass} | CHANGED: ${(r.r && r.r.whatChangedInPicture || "?").slice(0, 200)}`);
console.log("--- single stills (after the cue)");
for (const s of stills) console.log(`${s.short} | state: ${s.r && s.r.objectState} | guess: ${s.r && s.r.storyGuess}`);
console.log("--- judges (unblinded)");
for (const j of judged) {
  const v = j.verdict; if (!v) { console.log(j.short, j.pass, "MISSING"); continue; }
  const winner = v.moreExplanatory === "tie" ? "tie" : j.key[v.moreExplanatory];
  for (const s of ["X", "Y"]) {
    const ver = j.key[s]; const k = `${j.short}:${ver}`; score[k] = score[k] || { changedYes: 0, fromPicture: 0, wrong: 0, wins: 0, n: 0 };
    score[k].n++; if (v[s].whatChanged === "yes") score[k].changedYes++; if (v[s].changeFromPictureNotText) score[k].fromPicture++; score[k].wrong += v[s].wrongReadings.length;
    console.log(`${j.short} p${j.pass} ${ver}: was=${v[s].whatWas} changed=${v[s].whatChanged} happened=${v[s].whatHappened} fromPicture=${v[s].changeFromPictureNotText} wrong=${JSON.stringify(v[s].wrongReadings)}`);
  }
  if (winner !== "tie") score[`${j.short}:${winner}`].wins++;
  console.log(`   -> more explanatory: ${winner} | ${v.reason}`);
}
fs.writeFileSync(path.join(A, "judging", "scores-unblinded.json"), JSON.stringify(score, null, 1));
console.log("--- scores", JSON.stringify(score));
