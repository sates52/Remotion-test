// crop each still to a 700x700 face window -> 600x600, shuffled neutral ids, separate key
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const WT = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/t1-face";
const SP = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad";
const cells = require("./cells.json");
const OUT = path.join(SP, "sheets/face");
const key = {};
for (const ver of ["before", "after"]) {
  const dir = path.join(OUT, ver); fs.mkdirSync(dir, { recursive: true });
  const order = cells.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  key[ver] = {};
  order.forEach((ci, k) => {
    const c = cells[ci], id = `f-${String(k + 1).padStart(2, "0")}`;
    const src = path.join(WT, `zz-sheet-${ver}/zz-face-sheet/${c.id}-f${c.frame}.png`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", "crop=700:700:970:90,scale=600:600", "-map_metadata", "-1", path.join(dir, `${id}.png`)]);
    key[ver][id] = { expression: c.expression, beard: c.beard, sex: c.sex, blink: c.blink };
  });
}
fs.writeFileSync(path.join(OUT, "face-key.json"), JSON.stringify(key, null, 1));
console.log("ok");
