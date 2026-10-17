// Score blind face reads (before vs after) against face-key.json.
const fs = require("fs");
const S = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/sheets/";
const key = JSON.parse(fs.readFileSync(S + "face/face-key.json", "utf8"));
const norm = (v) => key[v] || key[v.toLowerCase()] || key[v.toUpperCase()];
const out = {};
for (const ver of ["before", "after"]) {
  const K = norm(ver);
  const reads = [1, 2, 3].map((k) => { try { return JSON.parse(fs.readFileSync(S + `reads/face-${ver}-${k}.json`, "utf8")); } catch { return null; } }).filter(Boolean);
  const cells = {};
  for (const [img, cell] of Object.entries(K)) {
    const id = img.endsWith(".png") ? img : img + ".png";
    const label = `${cell.sex || "m"} ${cell.expression}${cell.blink ? "+blink" : ""} beard:${cell.beard || "none"}`;
    cells[label] = reads.map((r) => r.find((x) => x.img === id)).filter(Boolean)
      .map((x) => ({ mood: x.mood, smiling: String(x.smiling).toLowerCase(), eyes: String(x.eyes).toLowerCase() }));
  }
  out[ver] = { raters: reads.length, cells };
}
const smile = (arr) => arr.filter((x) => x.smiling === "yes" || x.smiling === "slightly").length;
console.log("cell".padEnd(36), "BEFORE smile/eyes/moods".padEnd(60), "AFTER smile/eyes/moods");
const labels = Object.keys(out.before.cells).sort();
let tot = { b: { n: 0, s: 0 }, a: { n: 0, s: 0 } };
for (const l of labels) {
  const b = out.before.cells[l] || [], a = (out.after.cells[l] || []);
  const fmt = (arr) => `${smile(arr)}/${arr.length} smile | eyes ${arr.map((x) => x.eyes).join(",")} | ${arr.map((x) => x.mood).join("; ")}`;
  console.log(l.padEnd(36), fmt(b).slice(0, 58).padEnd(60), fmt(a).slice(0, 90));
  if (/ neutral/.test(l) && !/blink/.test(l)) { tot.b.n += b.length; tot.b.s += smile(b); tot.a.n += a.length; tot.a.s += smile(a); }
}
console.log(`\nNEUTRAL faces read smiling (yes|slightly): before ${tot.b.s}/${tot.b.n}, after ${tot.a.s}/${tot.a.n}`);
fs.writeFileSync(S + "reads/face-scored.json", JSON.stringify(out, null, 1));
