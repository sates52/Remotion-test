// Cycle 8 CSD 1.1 (speech) holdout draw — written before any passage is read.
// Windows of 12 beats with >= 3 beats whose narration reports speech (a speech verb), never a beat a mute run sampled,
// not the first/last 5%, no overlap with the cycle-7 windows; seeded per slug; 2 windows per book, >= 30 beats apart.
// Books in a FIXED order; the first 2 fiction + first 2 idea books that yield 2 windows are used.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const R = "C:/Users/savas/Cursor/Remotion/";
const BOOKS = [
  { slug: "red-rising", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/red-rising", used: [[199, 210], [296, 307]] },
  { slug: "beloved", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/beloved", used: [[181, 192], [257, 268]] },
  { slug: "we-were-liars", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/we-were-liars", used: [] },
  { slug: "a-good-man-is-hard-to-find", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/a-good-man-is-hard-to-find", used: [] },
  { slug: "wonder", genre: "fiction", src: R + "wt-c4", audit: R + "test/audit/mute/wonder", used: [[25, 35], [215, 225]] },
  { slug: "how-to-talk-to-anyone", genre: "ideas", src: R + "wt-book-how-to-talk-to-anyone", audit: R + "wt-book-how-to-talk-to-anyone/audit/mute/how-to-talk-to-anyone", used: [[97, 108], [221, 232]] },
  { slug: "the-art-of-saying-no", genre: "ideas", src: R + "wt-c4", audit: R + "test/audit/mute/the-art-of-saying-no", used: [] },
  { slug: "the-most-important-thing", genre: "ideas", src: R + "wt-book-the-most-important-thing", audit: R + "wt-book-the-most-important-thing/audit/mute/the-most-important-thing", used: [[49, 60], [110, 121]] },
  { slug: "the-new-one-minute-manager", genre: "ideas", src: R + "wt-c4", audit: R + "test/audit/mute/the-new-one-minute-manager", used: [] },
  { slug: "surrounded-by-idiots", genre: "ideas", src: R + "wt-c4", audit: R + "test/audit/mute/surrounded-by-idiots", used: [] },
];
const SPEECH = /\b(says?|said|saying|asks?|asked|asking|tells?|told|telling|answers?|answered|replies|replied|reply|responds?|responded|whispers?|whispered|shouts?|shouted|yells?|yelled|calls? (him|her|them|out)|quotes?|goes like|so he goes|so she goes)\b/i;
const W = 12, MINLONG = 9, MINSPEECH = 2, APART = 30; // relaxed before any reading: 3 speech beats yielded 2 books
const out = [];
const take = { fiction: 0, ideas: 0 };
for (const b of BOOKS) {
  if (take[b.genre] >= 2) continue; // 2 books per genre, 2 windows each
  let cfg, art;
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(b.src, "books", b.slug, "config.antidote.json"), "utf8"));
    art = JSON.parse(fs.readFileSync(path.join(b.src, "books", b.slug, "art.json"), "utf8"));
  } catch (e) { out.push({ slug: b.slug, skipped: "no antidote config/art" }); continue; }
  const n = art.beats.length;
  if (cfg.scenes.length !== n) { out.push({ slug: b.slug, skipped: `${cfg.scenes.length} scenes vs ${n} beats` }); continue; }
  const sampled = new Set();
  for (const lab of fs.existsSync(b.audit) ? fs.readdirSync(b.audit) : []) {
    const f = path.join(b.audit, lab, "sample.json");
    if (!fs.existsSync(f)) continue;
    for (const u of JSON.parse(fs.readFileSync(f, "utf8"))) { const k = cfg.scenes.findIndex((s) => s.id === u.id); if (k >= 0) sampled.add(k); }
  }
  const narr = (k) => String(cfg.scenes[k]._narration || art.beats[k].narration || "");
  const bad = (k) => sampled.has(k) || b.used.some(([a, z]) => k >= a - 2 && k <= z + 2) || k < Math.ceil(n * 0.05) || k > Math.floor(n * 0.95);
  const cands = [];
  for (let s = 0; s + W - 1 < n; s++) {
    let ok = true, long = 0, sp = 0;
    for (let k = s; k < s + W; k++) { if (bad(k)) { ok = false; break; } if (cfg.scenes[k].durationFrames > 60) long++; if (SPEECH.test(narr(k))) sp++; }
    if (ok && long >= MINLONG && sp >= MINSPEECH) cands.push(s);
  }
  let seed = parseInt(crypto.createHash("sha256").update(b.slug + "|c8-speech").digest("hex").slice(0, 8), 16);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  if (!cands.length) { out.push({ slug: b.slug, genre: b.genre, candidates: 0, windows: [] }); continue; }
  const first = cands[Math.floor(rnd() * cands.length)];
  const far = cands.filter((s) => Math.abs(s - first) >= APART + W);
  const second = far.length ? far[Math.floor(rnd() * far.length)] : undefined;
  const wins = [first, second].filter((x) => x !== undefined).sort((x, y) => x - y).map((s) => [s, s + W - 1]);
  out.push({ slug: b.slug, genre: b.genre, source: b.src, beats: n, sampledUnits: sampled.size, candidates: cands.length, windows: wins });
  if (wins.length === 2) take[b.genre]++;
}
console.log(JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(__dirname, "speech-passages.json"), JSON.stringify(out, null, 1));
