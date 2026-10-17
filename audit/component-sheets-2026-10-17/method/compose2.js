const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const SP = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad";
const RAW = path.join(SP, "facesheet/zz-sheet-after2/zz-face-sheet");
const cells = require("./cells2.json");
const dir = path.join(SP, "sheets/face/after2"); fs.mkdirSync(dir, { recursive: true });
const order = cells.map((_, i) => i);
for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
const key = {};
order.forEach((ci, k) => {
  const c = cells[ci], id = `s-${String(k + 1).padStart(2, "0")}`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(RAW, `${c.id}-f${c.frame}.png`), "-vf", "crop=700:700:970:90,scale=600:600", "-map_metadata", "-1", path.join(dir, `${id}.png`)]);
  key[id] = { expression: c.expression, beard: c.beard, sex: c.sex, blink: c.blink };
});
fs.writeFileSync(path.join(SP, "sheets/face/after2-key.json"), JSON.stringify({ after2: key }, null, 1));
console.log("ok");
