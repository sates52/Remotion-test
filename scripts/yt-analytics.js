#!/usr/bin/env node
/**
 * yt-analytics.js — the channel's own performance data, read-only (2026-11-11).
 *
 *   node scripts/yt-analytics.js auth                 one-time consent in the operator's browser
 *   node scripts/yt-analytics.js sync                 every uploaded video (id, title, date, duration, counters)
 *   node scripts/yt-analytics.js match                video ↔ book slug (PUBLISHED_BOOKS.md + books/<slug>/book.json)
 *   node scripts/yt-analytics.js pull [--only=<videoId|slug>,...] [--force]
 *                                                     per video: totals, daily, traffic sources, retention curve
 *   node scripts/yt-analytics.js import-csv <file>    impressions + CTR from a YouTube Studio export (not in the API)
 *   node scripts/yt-analytics.js report               channel table → <store>/data/channel-report.md
 *   node scripts/yt-analytics.js all                  sync + match + pull + report
 *
 * Credentials AND data live outside every checkout: %USERPROFILE%/.yt-analytics (YT_ANALYTICS_DIR), so all worktrees
 * share one copy and nothing about the channel's performance is committed or bundled. Scopes are read-only.
 * Thumbnail impressions / CTR are not offered by the Analytics API (only by the bulk Reporting API): import-csv covers them.
 * Published books are frozen: this tool reads their records and never writes into books/ or PUBLISHED_BOOKS.md.
 */
const fs = require("fs");
const path = require("path");
const auth = require("./lib/yt-auth");
const ch = require("./lib/yt-channel");

const ROOT = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = Object.fromEntries(argv.slice(1).filter((a) => a.startsWith("--")).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.slice(2), true]; }));
const positional = argv.slice(1).filter((a) => !a.startsWith("--"));

const STORE = auth.storeDir();
const DATA = path.join(STORE, "data");
const P = {
  videos: path.join(DATA, "videos.json"), map: path.join(DATA, "video-map.json"), manual: path.join(DATA, "video-map.manual.json"),
  ctr: path.join(DATA, "ctr.json"), analytics: path.join(DATA, "analytics"), report: path.join(DATA, "channel-report.md"),
};
const readJSON = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } };
const writeJSON = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)); };
const today = () => new Date().toISOString().slice(0, 10);

const DATA_API = "https://www.googleapis.com/youtube/v3";
const AN_API = "https://youtubeanalytics.googleapis.com/v2/reports";

async function sync() {
  const chan = await auth.apiGet(`${DATA_API}/channels`, { part: "snippet,contentDetails,statistics", mine: "true" });
  const c = (chan.items || [])[0];
  if (!c) throw new Error("the authorized account has no YouTube channel (run auth again and pick the channel's account)");
  const uploads = c.contentDetails.relatedPlaylists.uploads;
  const ids = [];
  for (let pageToken; ;) {
    const r = await auth.apiGet(`${DATA_API}/playlistItems`, { part: "contentDetails", playlistId: uploads, maxResults: 50, pageToken });
    ids.push(...(r.items || []).map((i) => i.contentDetails.videoId));
    pageToken = r.nextPageToken;
    if (!pageToken) break;
  }
  const listed = ids.length;
  ids.splice(0, ids.length, ...new Set(ids)); // the uploads playlist can list a video twice
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await auth.apiGet(`${DATA_API}/videos`, { part: "snippet,contentDetails,statistics,status", id: ids.slice(i, i + 50).join(",") });
    for (const v of r.items || []) {
      videos.push({
        id: v.id, title: v.snippet.title, publishedAt: v.snippet.publishedAt, durationSec: ch.parseISODuration(v.contentDetails.duration),
        privacy: v.status && v.status.privacyStatus, views: +v.statistics.viewCount || 0, likes: +v.statistics.likeCount || 0, comments: +v.statistics.commentCount || 0,
      });
    }
  }
  videos.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  writeJSON(P.videos, { syncedAt: new Date().toISOString(), channel: { id: c.id, title: c.snippet.title, subscribers: +c.statistics.subscriberCount || null, videoCount: +c.statistics.videoCount || null, views: +c.statistics.viewCount || null }, videos });
  console.log(`sync: ${videos.length} videos (${listed} playlist entries, channel reports ${c.statistics.videoCount}); ${videos.filter((v) => v.durationSec < 180).length} under 3 min`);
}

/** Books = the published register's table rows + every books/<slug>/book.json (newer books have no table row). */
function loadBooks() {
  const books = new Map();
  const md = fs.existsSync(path.join(ROOT, "PUBLISHED_BOOKS.md")) ? fs.readFileSync(path.join(ROOT, "PUBLISHED_BOOKS.md"), "utf8") : "";
  for (const b of ch.parsePublished(md)) books.set(b.slug, { ...b, inRegister: true });
  const add = (slug, bj) => {
    if (!bj || !bj.title) return;
    const prev = books.get(slug) || { slug };
    books.set(slug, {
      ...prev, title: prev.title || bj.title, author: prev.author || bj.author,
      engine: prev.engine || bj.engine || null, genre: prev.genre || bj.genre || null, kind: prev.kind || (bj.engineProfile && bj.engineProfile.kind) || null,
    });
  };
  const booksIn = (root) => {
    const dir = path.join(root, "books");
    for (const slug of fs.existsSync(dir) ? fs.readdirSync(dir) : []) add(slug, readJSON(path.join(dir, slug, "book.json")));
  };
  booksIn(ROOT);
  // A book lives in its own worktree (../wt-book-<slug>) and older ones only in the main checkout: read their records too.
  const parent = path.dirname(ROOT);
  for (const d of fs.existsSync(parent) ? fs.readdirSync(parent) : []) {
    const m = /^wt-book-(.+)$/.exec(d);
    if (m) add(m[1], readJSON(path.join(parent, d, "books", m[1], "book.json")));
  }
  for (const root of String(process.env.YT_BOOK_ROOTS || path.join(parent, "test")).split(path.delimiter).filter(Boolean)) {
    if (path.resolve(root) !== path.resolve(ROOT)) booksIn(root);
  }
  // The mute-test record names the engine of books whose folder is gone, and carries the verdict numbers.
  const titled = (slug) => slug.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
  for (const run of (readJSON(path.join(ROOT, "data", "engine-outcomes.json"), {}).runs) || []) {
    if (!run.slug) continue;
    const prev = books.get(run.slug) || { slug: run.slug, title: titled(run.slug) };
    const mute = !prev.mute || String(run.date) >= String(prev.mute.date) ? { date: run.date, n: run.n, wrong: run.wrong, adds: run.adds, pass: run.pass } : prev.mute;
    books.set(run.slug, { ...prev, engine: prev.engine || run.engine || null, genre: prev.genre || run.genre || null, mute });
  }
  return [...books.values()].filter((b) => b.title);
}

function match() {
  const v = readJSON(P.videos);
  if (!v) throw new Error("run sync first");
  const long = v.videos.filter((x) => x.durationSec >= 180);
  const { matches, unclaimed } = ch.matchVideos(loadBooks(), long, { manual: readJSON(P.manual, {}) });
  const found = matches.filter((m) => m.videoId);
  writeJSON(P.map, { matchedAt: new Date().toISOString(), matches: found, unmatchedBooks: matches.filter((m) => !m.videoId && m.candidates && m.candidates.length), unclaimedVideos: unclaimed });
  const count = (c) => found.filter((m) => m.confidence === c).length;
  console.log(`match: ${found.length} of ${long.length} long videos matched to a book (exact ${count("exact")}, fuzzy ${count("fuzzy")}, manual ${count("manual")})`);
  const title = (id) => (long.find((x) => x.id === id) || {}).title;
  for (const m of found.filter((x) => x.confidence === "fuzzy")) console.log(`  FUZZY     ${m.slug}  →  ${m.videoId}  "${title(m.videoId)}"  (${m.why})`);
  for (const id of unclaimed) console.log(`  NO BOOK   ${id}  "${title(id)}"`);
  if (unclaimed.length || count("fuzzy")) console.log(`Fix by hand in ${P.manual}  ({"<slug>": "<videoId>"}) and run match again.`);
}

async function query(params) {
  const r = await auth.apiGet(AN_API, { ids: "channel==MINE", ...params });
  const cols = (r.columnHeaders || []).map((h) => h.name);
  return (r.rows || []).map((row) => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

async function pullOne(v) {
  const startDate = v.publishedAt.slice(0, 10), endDate = today(), filters = `video==${v.id}`;
  const base = { startDate, endDate, filters };
  const core = "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares";
  let totals;
  try { totals = (await query({ ...base, metrics: `engagedViews,${core}` }))[0] || null; }
  catch (e) { if (e.status !== 400) throw e; totals = (await query({ ...base, metrics: core }))[0] || null; }
  const daily = await query({ ...base, dimensions: "day", metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained", sort: "day" });
  const traffic = await query({ ...base, dimensions: "insightTrafficSourceType", metrics: "views,estimatedMinutesWatched", sort: "-views" });
  let retention = [];
  try { retention = (await query({ ...base, dimensions: "elapsedVideoTimeRatio", metrics: "audienceWatchRatio,relativeRetentionPerformance" })).map((r) => [r.elapsedVideoTimeRatio, r.audienceWatchRatio, r.relativeRetentionPerformance]); }
  catch (e) { if (e.status !== 400) throw e; } // too little data for a curve yet
  return { videoId: v.id, pulledAt: new Date().toISOString(), startDate, endDate, totals, daily, traffic, retention };
}

async function pull() {
  const v = readJSON(P.videos);
  if (!v) throw new Error("run sync first");
  const map = readJSON(P.map, { matches: [] });
  const slugOf = new Map(map.matches.map((m) => [m.videoId, m.slug]));
  let list = v.videos.filter((x) => x.durationSec >= 180);
  if (flags.only) { const want = new Set(String(flags.only).split(",")); list = list.filter((x) => want.has(x.id) || want.has(slugOf.get(x.id))); }
  fs.mkdirSync(P.analytics, { recursive: true });
  let done = 0, failed = 0;
  const queue = [...list];
  await Promise.all(Array.from({ length: 3 }, async () => {
    for (let x; (x = queue.shift());) {
      const file = path.join(P.analytics, `${x.id}.json`);
      const prev = readJSON(file);
      if (prev && prev.endDate === today() && !flags.force) { done++; continue; }
      try { writeJSON(file, await pullOne(x)); done++; }
      catch (e) { failed++; console.log(`  FAILED ${x.id} "${x.title}": ${e.message}`); }
    }
  }));
  console.log(`pull: ${done} of ${list.length} videos up to date${failed ? `, ${failed} failed` : ""}`);
  if (failed) process.exitCode = 1;
}

function importCsv() {
  const file = positional[0];
  if (!file) throw new Error("usage: yt-analytics.js import-csv <Table data.csv>");
  const got = ch.studioCtr(ch.parseCsv(fs.readFileSync(file, "utf8")));
  writeJSON(P.ctr, { importedAt: new Date().toISOString(), source: path.basename(file), videos: { ...(readJSON(P.ctr, {}).videos || {}), ...got } });
  console.log(`import-csv: impressions / CTR for ${Object.keys(got).length} videos`);
}

function rowsForReport() {
  const v = readJSON(P.videos);
  if (!v) throw new Error("run sync first");
  const map = readJSON(P.map, { matches: [] });
  const ctr = (readJSON(P.ctr, {}).videos) || {};
  const books = new Map(loadBooks().map((b) => [b.slug, b]));
  const slugOf = new Map(map.matches.map((m) => [m.videoId, m]));
  return {
    channel: v.channel, syncedAt: v.syncedAt,
    rows: v.videos.filter((x) => x.durationSec >= 180).map((x) => {
      const a = readJSON(path.join(P.analytics, `${x.id}.json`));
      const m = slugOf.get(x.id), b = (m && books.get(m.slug)) || {};
      const t = (a && a.totals) || {};
      const days = Math.max(1, Math.round((Date.now() - Date.parse(x.publishedAt)) / 86400000));
      const daily = (a && a.daily) || [];
      const firstN = (n) => (days >= n ? daily.filter((d) => (Date.parse(d.day) - Date.parse(x.publishedAt.slice(0, 10))) / 86400000 < n).reduce((s, d) => s + (d.views || 0), 0) : null);
      const curve = ((a && a.retention) || []).map((r) => [r[0], r[1]]);
      const at = (sec) => (curve.length && x.durationSec ? ch.interp(curve, sec / x.durationSec) : null);
      const src = ((a && a.traffic) || [])[0];
      return {
        id: x.id, slug: m ? m.slug : null, confidence: m ? m.confidence : null, title: x.title, engine: b.engine || null, kind: b.kind || null, genre: b.genre || null,
        published: x.publishedAt.slice(0, 10), days, durationSec: x.durationSec, views: t.views ?? x.views, views7: firstN(7), views28: firstN(28),
        avgPct: t.averageViewPercentage ?? null, avgDur: t.averageViewDuration ?? null, r30: at(30), r50: curve.length ? ch.interp(curve, 0.5) : null,
        subs: t.subscribersGained ?? null, topSource: src ? `${src.insightTrafficSourceType} ${t.views ? Math.round((src.views / t.views) * 100) : "?"}%` : null,
        impressions: ctr[x.id] ? ctr[x.id].impressions : null, ctr: ctr[x.id] ? ctr[x.id].ctr : null, mute: b.mute || null,
      };
    }),
  };
}

function report() {
  const { channel, syncedAt, rows } = rowsForReport();
  const f = (n, d = 0) => (Number.isFinite(n) ? n.toFixed(d) : "–");
  const pct = (n) => (Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : "–");
  const line = (r) => `| ${r.published} | ${r.slug ? `\`${r.slug}\`` : `_${r.title.slice(0, 48).replace(/\|/g, "/")}_`} | ${r.engine || "–"} | ${r.kind || "–"} | ${ch.clock(r.durationSec)} | ${f(r.views)} | ${f(r.views7)} | ${f(r.views28)} | ${f(r.avgPct, 1)}% | ${ch.clock(r.avgDur)} | ${pct(r.r30)} | ${pct(r.r50)} | ${f(r.subs)} | ${Number.isFinite(r.ctr) ? `${f(r.ctr, 1)}%` : "–"} | ${r.topSource || "–"} |`;
  const head = "| published | book | engine | kind | length | views | views 7d | views 28d | avg viewed | avg duration | still at 0:30 | still at 50% | subs | CTR | top source |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|";
  const group = (name, key) => {
    const g = new Map();
    for (const r of rows) { const k = r[key] || "unknown"; g.set(k, [...(g.get(k) || []), r]); }
    const out = [`### By ${name} (medians)`, "", `| ${name} | videos | views | views 7d | avg viewed | avg duration | still at 0:30 | CTR |`, "|---|---|---|---|---|---|---|---|"];
    for (const [k, rs] of [...g].sort((a, b) => b[1].length - a[1].length)) {
      const md = (fn) => ch.median(rs.map(fn));
      out.push(`| ${k} | ${rs.length} | ${f(md((r) => r.views))} | ${f(md((r) => r.views7))} | ${f(md((r) => r.avgPct), 1)}% | ${ch.clock(md((r) => r.avgDur))} | ${pct(md((r) => r.r30))} | ${Number.isFinite(md((r) => r.ctr)) ? `${f(md((r) => r.ctr), 1)}%` : "–"} |`);
    }
    return out.join("\n");
  };
  // Analytics lags 2–3 days: a video with no counted view yet is "no data", not the weakest.
  const with7 = rows.filter((r) => Number.isFinite(r.views7) && r.views > 0).sort((a, b) => b.views7 - a.views7);
  const noAnalytics = rows.filter((r) => r.avgPct === null).length;
  const md = [
    `# Channel report — ${channel.title}`, "",
    `Synced ${syncedAt.slice(0, 16).replace("T", " ")} UTC. ${rows.length} long videos, ${f(channel.subscribers)} subscribers, ${f(channel.views)} channel views.`,
    `Matched to a book: ${rows.filter((r) => r.slug).length}. Without analytics yet: ${noAnalytics}. CTR ${rows.some((r) => Number.isFinite(r.ctr)) ? "from the imported Studio export" : "not imported (Studio → Analytics → Advanced mode → Export → import-csv)"}.`,
    "", "\"views 7d / 28d\" = views in the first 7 / 28 days after publishing, the only columns that compare an old video with a new one fairly.",
    "", group("engine", "engine"), "", group("kind", "kind"), "",
    "### Best first week", "", head, ...with7.slice(0, 5).map(line), "",
    "### Weakest first week", "", head, ...with7.slice(-5).reverse().map(line), "",
    "### Every video (newest first)", "", head, ...[...rows].sort((a, b) => b.published.localeCompare(a.published)).map(line), "",
  ].join("\n");
  fs.mkdirSync(path.dirname(P.report), { recursive: true });
  fs.writeFileSync(P.report, md);
  writeJSON(path.join(DATA, `snapshot-${today()}.json`), { channel, rows });
  console.log(`report: ${P.report}`);
}

async function main() {
  auth.assertOutsideRepo(STORE, ROOT);
  if (cmd === "auth") { const r = await auth.authorize(); console.log(`auth: done (read-only scopes granted: ${String(r.scope || "").split(" ").length})`); }
  else if (cmd === "sync") await sync();
  else if (cmd === "match") match();
  else if (cmd === "pull") await pull();
  else if (cmd === "import-csv") importCsv();
  else if (cmd === "report") report();
  else if (cmd === "all") { await sync(); match(); await pull(); report(); }
  else { console.log("usage: node scripts/yt-analytics.js auth | sync | match | pull [--only=..] [--force] | import-csv <file> | report | all"); process.exitCode = cmd ? 2 : 0; }
}
if (require.main === module) main().catch((e) => { console.error(`yt-analytics: ${e.message}`); process.exit(1); });
module.exports = { loadBooks, P };
