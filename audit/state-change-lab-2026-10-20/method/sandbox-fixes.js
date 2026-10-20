// Sandbox-only, outside the windows: make pre-existing records pass the CURRENT merge with the SAME meaning the
// old merge gave them. burn: "shot" was ignored -> delete it. 15-secrets: diagram + cast -> the planner dropped
// the person -> cast []. Logged to merge-fixes.txt.
const fs = require("fs"), path = require("path");
const [LAB, X] = process.argv.slice(2);
const log = [];
for (const slug of ["burn-of-the-everflame", "15-secrets-successful-people-know-about-time-management"]) {
  const dir = path.join(LAB, "books", slug, "storyboard");
  for (const f of fs.readdirSync(dir).filter((f) => /^authored-\d+\.json$/.test(f))) {
    const p = path.join(dir, f), arr = JSON.parse(fs.readFileSync(p, "utf8")); let n = 0;
    for (const b of arr) {
      if ("shot" in b) { log.push(`${slug} ${b.i}: deleted ignored "shot": ${JSON.stringify(b.shot)}`); delete b.shot; n++; }
      if (b.diagram && Array.isArray(b.cast) && b.cast.length) { log.push(`${slug} ${b.i}: diagram + cast ${JSON.stringify(b.cast)} -> cast []`); b.cast = []; n++; }
    }
    if (n) fs.writeFileSync(p, JSON.stringify(arr, null, 2));
  }
}
fs.writeFileSync(path.join(X, "merge-fixes.txt"), log.join("\n") + "\n");
console.log(log.length, "sandbox fixes");
