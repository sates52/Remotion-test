// P2 adjudication tally: on each disputed WRONG/dead flag, does the third chain side with the recorded verdict or the cloud?
const fs = require("fs"), path = require("path");
const [OUT, S, C] = process.argv.slice(2);
const o = JSON.parse(fs.readFileSync(OUT, "utf8"));
const R4 = Object.fromEntries((o.result || o).map((x) => [x.id, x.judge]));
const set = JSON.parse(fs.readFileSync(path.join(S, "calib-set-ids.json"), "utf8"));
const up = (x) => String(x || "").toUpperCase();
const R2 = {};
for (const l of fs.readFileSync(path.join(C, "ratings-official.jsonl"), "utf8").split("\n").filter(Boolean)) { const r = JSON.parse(l); R2[r.img.replace(/\.webp$/, "")] = r.judge; }
let ref = 0, cloud = 0; const rows = [], byFlag = { WRONG: { ref: 0, cloud: 0 }, NONE: { ref: 0, cloud: 0 } };
for (const [id, j] of Object.entries(R4)) {
  if (!j) { rows.push(`${id}: no third verdict`); continue; }
  const im = set.images.find((i) => i.id === id), a = im.ref, b = R2[id];
  for (const [f, pos] of [["correctness", "WRONG"], ["contribution", "NONE"]]) {
    const ra = up(a[f]) === pos, rb = up(b[f]) === pos, rc = up(j[f]) === pos;
    if (ra === rb) continue;
    const side = rc === ra ? "ref" : "cloud";
    if (side === "ref") ref++; else cloud++;
    byFlag[pos][side]++;
    rows.push(`${id} ${pos}: recorded=${ra} cloud=${rb} third=${rc} -> majority with ${side}`);
  }
}
console.log(rows.join("\n"));
console.log(`\ndisputes: majority with RECORDED ${ref}, with CLOUD-official ${cloud} · ${JSON.stringify(byFlag)}`);
fs.writeFileSync(path.join(S, "calib-r4-dev-result.json"), JSON.stringify({ ref, cloud, byFlag, rows, R4 }, null, 1));
