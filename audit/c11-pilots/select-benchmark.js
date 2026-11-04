#!/usr/bin/env node
// Cycle 11 benchmark selection — deterministic, run ONCE before any authoring; its output is frozen and committed.
//   node audit/c11-pilots/select-benchmark.js > audit/c11-pilots/benchmark.json
// Pool: committed Antidote books (books/*/art.json + config.antidote.json), minus the pilot copy we-were-liars-pilot.
// Main set (30): beats the scene router types causal-mechanism (15) or abstract-concept (15) whose narration carries a
//   claim (>= 18 words, not opening with filler), at most 3 per book, at least 6 books, never the first/last 5 % of a
//   book, never within +-3 beats of a cycle-10 passage, never a beat whose source scene is a chapter card or has no
//   duration. Regression set (10): concrete-action / interaction beats, same rules, at most 2 per book.
// Order: a seeded hash of (slug, beat) — no human choice. The genre of each book is reported.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..", "..");
const { routeBeat } = require("./scene-router.js");
const C10 = { "15-secrets-successful-people-know-about-time-management": [73], "the-second-mountain": [199], "thinking-in-systems": [7, 75], farsighted: [2], "buffett-the-making-of-an-american-capitalist": [111], "the-art-of-saying-no": [51, 42], "nobody-wants-to-read-your-sh-t": [91], "stolen-focus": [282] };
const FILLER = /^(exactly|right|yeah|yes|totally|absolutely|so|okay|ok|wow|mhm|uh|um|precisely|it is|it does|and|but)\b[ ,.!]*/i;
const rank = (s, i) => crypto.createHash("sha256").update(`c11|${s}|${i}`).digest("hex");
const pool = [];
for (const slug of fs.readdirSync(path.join(ROOT, "books")).sort()) {
  if (slug === "we-were-liars-pilot") continue;
  const A = path.join(ROOT, "books", slug, "art.json"), C = path.join(ROOT, "books", slug, "config.antidote.json");
  if (!fs.existsSync(A) || !fs.existsSync(C)) continue;
  const art = JSON.parse(fs.readFileSync(A, "utf8")), cfg = JSON.parse(fs.readFileSync(C, "utf8"));
  const beats = art.beats || art;
  const genre = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "books", slug, "book.json"), "utf8")).genre || "?"; } catch { return "?"; } })();
  beats.forEach((b, i) => {
    const t = String(b.narration || "").trim();
    const words = t.split(/\s+/).filter(Boolean).length;
    const sc = cfg.scenes[i];
    if (!sc || !sc.durationFrames || sc.shot === "chapterCard" || sc.chapterCard) return;
    if (i < beats.length * 0.05 || i > beats.length * 0.95) return;
    if ((C10[slug] || []).some((p) => Math.abs(p - i) <= 5)) return;
    if (words < 18 || FILLER.test(t)) return;
    const r = routeBeat(t, { castCount: (b.cast || []).length });
    pool.push({ slug, genre, beat: i, scene: sc.id, durationFrames: sc.durationFrames, type: r.type, narration: t, rank: rank(slug, i) });
  });
}
pool.sort((a, b) => a.rank.localeCompare(b.rank));
const take = (types, n, perBook) => {
  const out = [], per = {};
  for (const p of pool) {
    if (!types.includes(p.type) || out.length >= n) continue;
    if ((per[p.slug] || 0) >= perBook) continue;
    if (out.some((o) => o.slug === p.slug && Math.abs(o.beat - p.beat) <= 3)) continue;
    per[p.slug] = (per[p.slug] || 0) + 1; out.push(p);
  }
  return out;
};
const causal = take(["causal-mechanism"], 15, 3);
const abstract = take(["abstract-concept"], 15, 3).filter((p) => !causal.some((c) => c.slug === p.slug && Math.abs(c.beat - p.beat) <= 3));
const action = take(["concrete-action", "interaction"], 10, 2);
const items = [...causal.map((p) => ({ ...p, set: "main", stratum: "causal" })), ...abstract.map((p) => ({ ...p, set: "main", stratum: "abstract" })), ...action.map((p) => ({ ...p, set: "regression", stratum: "action" }))]
  .map((p, k) => ({ id: `B${String(k + 1).padStart(2, "0")}`, ...p, rank: undefined }));
const dist = (arr, key) => arr.reduce((m, x) => ((m[x[key]] = (m[x[key]] || 0) + 1), m), {});
console.log(JSON.stringify({ schema: "c11-benchmark/1", frozen: "selected by script before any authoring (select-benchmark.js)", poolSize: pool.length,
  distribution: { main: { books: dist(items.filter((x) => x.set === "main"), "slug"), genres: dist(items.filter((x) => x.set === "main"), "genre") }, regression: { books: dist(items.filter((x) => x.set === "regression"), "slug") } },
  items }, null, 1));
