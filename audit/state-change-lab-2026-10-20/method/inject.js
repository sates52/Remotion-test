// Put the NEW beats into the sandbox's authored-K.json (the real storyboard input); OLD files saved once.
const fs = require("fs"), path = require("path");
const [LAB, X] = process.argv.slice(2);
const NEW = JSON.parse(fs.readFileSync(path.join(X, "new-authored.json"), "utf8"));
for (const [slug, beats] of Object.entries(NEW)) {
  const dir = path.join(LAB, "books", slug, "storyboard");
  for (const f of fs.readdirSync(dir).filter((f) => /^authored-\d+\.json$/.test(f))) {
    const p = path.join(dir, f), arr = JSON.parse(fs.readFileSync(p, "utf8"));
    let n = 0;
    for (const b of beats) { const k = arr.findIndex((x) => x.i === b.i); if (k >= 0) { const save = path.join(X, `${slug}-${f}.OLD.json`); if (!fs.existsSync(save)) fs.copyFileSync(p, save); arr[k] = b; n++; } }
    if (n) { fs.writeFileSync(p, JSON.stringify(arr, null, 2)); console.log(slug, f, n, "beat(s) placed"); }
  }
}
