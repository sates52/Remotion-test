// Rebuild the action blind-eval results from journal.jsonl and unblind with the workflow's deterministic key
// (oldIsX = (bookIndex + pass) % 2 === 0). Saves reads / still reads / blinded judgments / key / scores.
const fs = require("fs"), path = require("path");
const [J, OUT] = process.argv.slice(2);
const lines = fs.readFileSync(J, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const label = Object.fromEntries(lines.filter((x) => x.type === "started").map((x) => [x.key, x.label]));
const by = {};
for (const x of lines.filter((x) => x.type === "result")) by[label[x.key]] = x.result;
const BOOKS = [{ slug: "burn-of-the-everflame", short: "burn" }, { slug: "15-secrets-successful-people-know-about-time-management", short: "15sec" }];
const reads = [], stills = [], judged = [];
BOOKS.forEach((b, bi) => {
  for (const ver of ["OLD", "NEW"]) for (const pass of [1, 2]) reads.push({ slug: b.slug, ver, pass, r: by[`read:${b.short}-${ver}-p${pass}`] });
  stills.push({ short: b.short, r: by[`still:${b.short}`] });
  for (const pass of [1, 2]) { const oldIsX = (bi + pass) % 2 === 0; judged.push({ short: b.short, pass, key: { X: oldIsX ? "OLD" : "NEW", Y: oldIsX ? "NEW" : "OLD" }, verdict: by[`judge:${b.short}-p${pass}`] }); }
});
for (const d of ["reads", "judging"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
fs.writeFileSync(path.join(OUT, "reads", "strip-reads.json"), JSON.stringify(reads, null, 1));
fs.writeFileSync(path.join(OUT, "reads", "still-reads.json"), JSON.stringify(stills, null, 1));
fs.writeFileSync(path.join(OUT, "judging", "judge-results-blinded.json"), JSON.stringify(judged.map(({ key, ...r }) => r), null, 1));
fs.writeFileSync(path.join(OUT, "judging", "judge-key.json"), JSON.stringify(judged.map((j) => ({ short: j.short, pass: j.pass, key: j.key })), null, 1));
for (const r of reads) console.log(`${r.slug.slice(0, 6)} ${r.ver} p${r.pass} | WHO: ${r.r.whoActs} | DOES: ${(r.r.actionInPicture || "").slice(0, 110)} | TO: ${(r.r.toWhomOrWhat || "").slice(0, 60)}`);
console.log("--- single stills (NEW)");
for (const s of stills) console.log(`${s.short} | ${s.r.whoDoesWhatToWhom}`);
console.log("--- judges (unblinded)");
const score = {};
for (const j of judged) {
  const v = j.verdict; if (!v) { console.log(j.short, j.pass, "MISSING"); continue; }
  for (const s of ["X", "Y"]) {
    const ver = j.key[s], k = `${j.short}:${ver}`, e = (score[k] = score[k] || { n: 0, who: 0, action: 0, target: 0, result: 0, fromPicture: 0, wrong: 0, wins: 0 });
    e.n++; for (const f of ["who", "action", "target", "result"]) if (v[s][f] === "yes") e[f]++;
    if (v[s].fromPictureNotText) e.fromPicture++; e.wrong += v[s].wrongReadings.length;
    console.log(`${j.short} p${j.pass} ${ver}: who=${v[s].who} action=${v[s].action} target=${v[s].target} result=${v[s].result} fromPicture=${v[s].fromPictureNotText} wrong=${JSON.stringify(v[s].wrongReadings)}`);
  }
  const w = v.moreExplanatory === "tie" ? "tie" : j.key[v.moreExplanatory];
  if (w !== "tie") score[`${j.short}:${w}`].wins++;
  console.log(`   -> more explanatory: ${w} | ${v.reason}`);
}
fs.writeFileSync(path.join(OUT, "judging", "scores-unblinded.json"), JSON.stringify(score, null, 1));
console.log("--- scores", JSON.stringify(score));
