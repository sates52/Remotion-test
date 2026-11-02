// Cycle 7 P1: deterministic holdout passage draw (written before any passage is read).
// For each book: windows of 12 consecutive beats; every beat >= 3 beats away from any unit a mute run sampled (all
// labels), not in the first/last 5% of the book, no overlap with passages used in earlier experiments, >= 9 beats longer
// than 2 s. Two windows per book drawn with a seeded RNG (seed = sha256(slug + "|c7")), >= 30 beats apart.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const R = "C:/Users/savas/Cursor/Remotion/";
const BOOKS = [
  { slug: "red-rising", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/red-rising", used: [] },
  { slug: "wonder", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/wonder", used: [[25, 35], [215, 225]] },
  { slug: "beloved", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/beloved", used: [] },
  { slug: "we-were-liars", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/we-were-liars", used: [] },
  { slug: "how-to-talk-to-anyone", genre: "ideas", src: R + "wt-book-how-to-talk-to-anyone", audit: R + "wt-book-how-to-talk-to-anyone/audit/mute/how-to-talk-to-anyone", used: [] },
  { slug: "the-most-important-thing", genre: "ideas", src: R + "wt-book-the-most-important-thing", audit: R + "wt-book-the-most-important-thing/audit/mute/the-most-important-thing", used: [] },
];
const W = 12, GAP = 1, MINLONG = 9, APART = 30; // GAP 1 = the sampled beat itself (fresh authors: a sampled beat is not CSD tuning)
const out = [];
for (const b of BOOKS) {
  const cfg = JSON.parse(fs.readFileSync(path.join(b.src, "books", b.slug, "config.antidote.json"), "utf8"));
  const art = JSON.parse(fs.readFileSync(path.join(b.src, "books", b.slug, "art.json"), "utf8"));
  const n = art.beats.length;
  if (cfg.scenes.length !== n) throw new Error(`${b.slug}: ${cfg.scenes.length} scenes vs ${n} beats`);
  const sampled = new Set();
  for (const lab of fs.existsSync(b.audit) ? fs.readdirSync(b.audit) : []) {
    const f = path.join(b.audit, lab, "sample.json");
    if (!fs.existsSync(f)) continue;
    for (const u of JSON.parse(fs.readFileSync(f, "utf8"))) { const k = cfg.scenes.findIndex((s) => s.id === u.id); if (k >= 0) sampled.add(k); }
  }
  const bad = (k) => [...sampled].some((s) => Math.abs(s - k) < GAP) || b.used.some(([a, z]) => k >= a && k <= z) || k < Math.ceil(n * 0.05) || k > Math.floor(n * 0.95);
  const cands = [];
  for (let s = 0; s + W - 1 < n; s++) {
    let ok = true, long = 0;
    for (let k = s; k < s + W; k++) { if (bad(k)) { ok = false; break; } if (cfg.scenes[k].durationFrames > 60) long++; }
    if (ok && long >= MINLONG) cands.push(s);
  }
  let seed = parseInt(crypto.createHash("sha256").update(b.slug + "|c7").digest("hex").slice(0, 8), 16);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const first = cands[Math.floor(rnd() * cands.length)];
  const far = cands.filter((s) => Math.abs(s - first) >= APART + W);
  const second = far[Math.floor(rnd() * far.length)];
  const pick = [first, second].filter((x) => x !== undefined).sort((x, y) => x - y);
  out.push({ slug: b.slug, genre: b.genre, source: b.src, beats: n, sampledUnits: sampled.size, candidates: cands.length, windows: pick.map((s) => [s, s + W - 1]) });
}
console.log(JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(__dirname, "passages.json"), JSON.stringify(out, null, 1));
