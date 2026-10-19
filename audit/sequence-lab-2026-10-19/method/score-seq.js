// Unblind one book's sequence judgments.
const fs = require("fs"), path = require("path");
const short = process.argv[2];
const SEQ = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq";
const key = JSON.parse(fs.readFileSync(path.join(SEQ, `seqpair-${short}.key.json`), "utf8"));
const out = [];
for (const k of [1, 2]) {
  const f = path.join(SEQ, `seqjudge-${short}-${k}.json`); if (!fs.existsSync(f)) continue;
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  const v = (L) => j[L];
  const OLD = v(key.X === "OLD" ? "X" : "Y"), NEW = v(key.X === "NEW" ? "X" : "Y");
  const better = j.better === "TIE" ? "TIE" : key[j.better];
  out.push({ judge: k, better, why: j.why, OLD, NEW });
  const fmt = (x) => `idea ${x.idea} · development ${x.development} · text ${x.textCarried} · WRONG beats ${JSON.stringify((x.wrongBeats || []).map((w) => w.beat))} · dead ${JSON.stringify(x.deadBeats || [])}`;
  console.log(`judge ${k}: better = ${better}\n   OLD: ${fmt(OLD)}\n   NEW: ${fmt(NEW)}\n   why: ${j.why}`);
  for (const w of NEW.wrongBeats || []) console.log(`   NEW wrong beat ${w.beat}: ${w.why}`);
  for (const w of OLD.wrongBeats || []) console.log(`   OLD wrong beat ${w.beat}: ${w.why}`);
}
fs.writeFileSync(path.join(SEQ, `seqscore-${short}.json`), JSON.stringify(out, null, 1));
