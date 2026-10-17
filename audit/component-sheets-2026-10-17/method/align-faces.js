// Alignment: does each rater's facialHair match the key's beard for the image it filed the entry under?
const fs = require("fs");
const S = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/sheets/";
const key = JSON.parse(fs.readFileSync(S + "face/face-key.json", "utf8"));
const map = (b) => (b === "full" ? "beard" : b);
for (const ver of ["before", "after"]) for (const k of [1, 2, 3]) {
  const r = JSON.parse(fs.readFileSync(S + `reads/face-${ver}-${k}.json`, "utf8"));
  let ok = 0, hairOnly = 0;
  for (const e of r) {
    const c = key[ver][e.img.replace(".png", "")];
    const want = map(c.beard), got = String(e.facialHair).toLowerCase();
    if (want === got) ok++;
    else if (want !== "none" && got !== "none") hairOnly++; // stubble vs beard confusion, still aligned
  }
  console.log(`${ver}-${k}: facialHair exact ${ok}/${r.length}, stubble<->beard swaps ${hairOnly}, other mismatches ${r.length - ok - hairOnly}`);
}
