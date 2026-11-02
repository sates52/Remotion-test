// P2: inventory of official mute runs usable as the calibration reference (read-only).
// A run qualifies when it has 30 stills + key.json + judge-key.json + judge-input.json + judge-result.json (single-V
// items, not a --vs run), the book is Antidote, its verdict is recorded in books/<slug>/mute-test.json, and the book is
// not one of the cycle-7 P1 holdout books.
const fs = require("fs"), path = require("path");
const R = "C:/Users/savas/Cursor/Remotion/";
const EXCLUDE = new Set(["red-rising", "beloved", "how-to-talk-to-anyone", "the-most-important-thing"]);
const roots = ["test", ...fs.readdirSync(R).filter((d) => /^wt-book-/.test(d))];
const J = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const seen = new Set(), out = [];
for (const r of roots) {
  const base = path.join(R, r, "audit", "mute");
  if (!fs.existsSync(base)) continue;
  for (const slug of fs.readdirSync(base)) {
    if (EXCLUDE.has(slug)) continue;
    const bookJson = [path.join(R, "wt-c4", "books", slug, "book.json"), path.join(R, r, "books", slug, "book.json"), path.join(R, "test", "books", slug, "book.json")].map(J).find(Boolean);
    const engine = bookJson && (bookJson.engine || "").toLowerCase();
    const mt = [path.join(R, "wt-c4", "books", slug, "mute-test.json"), path.join(R, r, "books", slug, "mute-test.json"), path.join(R, "test", "books", slug, "mute-test.json")].map(J).find((x) => x && x.runs);
    for (const label of fs.readdirSync(path.join(base, slug))) {
      const D = path.join(base, slug, label), id = `${slug}/${label}`;
      if (seen.has(id)) continue;
      const key = J(path.join(D, "key.json")), jk = J(path.join(D, "judge-key.json")), ji = J(path.join(D, "judge-input.json")), jr = J(path.join(D, "judge-result.json"));
      const imgs = fs.existsSync(path.join(D, "mute")) ? fs.readdirSync(path.join(D, "mute")).filter((f) => /^img-\d+\.png$/.test(f)) : [];
      if (!key || !jk || !ji || !jr || imgs.length !== 30) continue;
      const items = jr.items || jr;
      if (!Array.isArray(items) || !items.length || !items[0].V) continue;
      const run = mt && mt.runs.find((x) => x.label === label);
      if (!run || typeof run.pass !== "boolean") continue;
      seen.add(id);
      const wrong = items.filter((x) => x.V.correctness === "WRONG").length, dead = items.filter((x) => x.V.contribution === "NONE").length;
      out.push({ id, root: r, dir: D, engine, pass: run.pass, recorded: { wrong: run.totals && run.totals.WRONG, dead: run.dead }, judged: { wrong, dead }, explains: items.some((x) => x.V.explains != null), date: run.date || null });
    }
  }
}
const anti = out.filter((x) => x.engine === "antidote");
console.log(`runs: ${out.length} qualifying, ${anti.length} Antidote — PASS ${anti.filter((x) => x.pass).length}, FAIL ${anti.filter((x) => !x.pass).length}`);
for (const x of anti) console.log(`${x.pass ? "PASS" : "FAIL"} ${x.id} wrong ${x.judged.wrong} dead ${x.judged.dead} explains:${x.explains} ${x.date || ""}`);
fs.writeFileSync(path.join(__dirname, "calib-inventory.json"), JSON.stringify(anti, null, 1));
