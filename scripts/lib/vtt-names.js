"use strict";
/**
 * vtt-names.js — Shared ASR proper-noun name protection (`books/<slug>/names.json`).
 *
 * Used by:
 *  - scripts/fix-vtt-names.js   (raw YouTube VTT with inline <c> timing tags)
 *  - scripts/clean-vtt.js       (YouTube CC upload .clean.vtt, cue text only)
 *  - scripts/rebuild-clean-vtt.js (rebuilt .clean.vtt from config captions)
 *  - scripts/plan-bible.js      (Levenshtein <= 2 ASR mismatch suggestions)
 *
 * Invariant: NEVER alters VTT timestamp lines (`HH:MM:SS.mmm --> HH:MM:SS.mmm`).
 */
const fs = require("fs");
const path = require("path");

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Horizontal whitespace ONLY ([ \t], never \s) so a YouTube rolling-caption line and
// the word-timed line beneath it are NEVER fused across a newline (stolen-focus bug).
const TAG_SEP = `(?:[ \\t]*(?:<\\/c>)?[ \\t]*<[0-9:.]+>[ \\t]*<c>[ \\t]*|[ \\t]+)`;

function rawVttRxFor(k) {
  const body = String(k).trim().split(/\s+/).map(esc).join(TAG_SEP);
  return new RegExp(`(^|[^A-Za-z0-9])(${body})(?=[^A-Za-z0-9]|$)`, "gi");
}

function plainTextRxFor(k) {
  const body = String(k).trim().split(/\s+/).map(esc).join(`[ \\t]+`);
  return new RegExp(`(^|[^A-Za-z0-9])(${body})(?=[^A-Za-z0-9]|$)`, "gi");
}

/**
 * Load sorted `[garble, correct]` pairs (longest key first) from `books/<slug>/names.json`
 * or an explicit `namesPath`. Ignores `_`-prefixed keys (like `_comment`) and empty entries.
 */
function loadNameMap({ root, slug, namesPath } = {}) {
  const file = namesPath
    ? path.resolve(namesPath)
    : (root && slug ? path.join(root, "books", slug, "names.json") : null);
  if (!file || !fs.existsSync(file)) return { file, pairs: [] };
  const raw = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const pairs = Object.entries(raw || {})
    .filter(([k, v]) => !String(k).startsWith("_") && String(k).trim().length > 0 && typeof v === "string" && v.trim().length > 0)
    .sort((a, b) => b[0].length - a[0].length);
  return { file, pairs };
}

/** Apply name map to plain text (cue text, narration strings). */
function applyNamesToText(text, pairs) {
  if (!text || !Array.isArray(pairs) || !pairs.length) {
    return { text: String(text || ""), total: 0, report: [] };
  }
  let out = String(text);
  const report = [];
  let total = 0;
  for (const [k, v] of pairs) {
    let n = 0;
    out = out.replace(plainTextRxFor(k), (m, pre) => {
      n++;
      return pre + v;
    });
    total += n;
    report.push([k, v, n]);
  }
  return { text: out, total, report };
}

/**
 * Apply name map to a raw YouTube VTT string line-by-line, strictly skipping header
 * and timestamp lines (`-->`) so raw VTT timestamps are NEVER modified.
 */
function applyNamesToRawVtt(rawVtt, pairs) {
  if (!rawVtt || !Array.isArray(pairs) || !pairs.length) {
    return { text: String(rawVtt || ""), total: 0, report: [] };
  }
  const hasCrlf = rawVtt.includes("\r\n");
  const lines = rawVtt.split(/\r?\n/);
  const compiled = pairs.map(([k, v]) => ({ k, v, rx: rawVttRxFor(k), count: 0 }));

  const outLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed === "WEBVTT" ||
      trimmed.startsWith("Kind:") ||
      trimmed.startsWith("Language:") ||
      trimmed.startsWith("NOTE") ||
      trimmed.includes("-->") ||
      /^\d+$/.test(trimmed)
    ) {
      return line;
    }
    let next = line;
    for (const item of compiled) {
      next = next.replace(item.rx, (m, pre) => {
        item.count++;
        return pre + item.v;
      });
    }
    return next;
  });

  const report = compiled.map((c) => [c.k, c.v, c.count]);
  const total = compiled.reduce((s, c) => s + c.count, 0);
  return { text: outLines.join(hasCrlf ? "\r\n" : "\n"), total, report };
}

/** Exact Levenshtein edit distance between two strings (case-insensitive). */
function levenshtein(a, b) {
  const s = String(a || "").toLowerCase();
  const t = String(b || "").toLowerCase();
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

const COMMON_CAP_WORDS = new Set([
  "The", "And", "But", "For", "Not", "You", "Her", "His", "She", "They", "This", "That",
  "With", "From", "Into", "When", "What", "Where", "Which", "There", "Here", "Then", "Now",
  "Just", "Like", "Even", "Also", "Still", "Every", "Each", "Some", "Most", "Many", "More",
  "Very", "Much", "Over", "Under", "After", "Before", "About", "Again", "Never", "Always",
  "First", "Second", "Third", "Chapter", "Part", "Book", "Story", "Author", "House", "Home",
  "School", "Police", "Mother", "Father", "Sister", "Brother", "Friend", "Woman", "People",
  "Years", "Months", "Weeks", "Days", "Night", "Morning", "London", "England", "America",
]);

/**
 * Scan narration text for capitalized ASR tokens within Levenshtein <= `maxDistance`
 * of any bible cast name token, to suggest entries for `books/<slug>/names.json`.
 */
function suggestNameMismatches(text, castNames, { maxDistance = 2, minMentions = 2 } = {}) {
  const names = (castNames || [])
    .flatMap((n) => String(n || "").split(/\s+/))
    .map((w) => w.replace(/[^A-Za-z']/g, ""))
    .filter((w) => w.length >= 3);
  const uniqueNames = [...new Map(names.map((n) => [n.toLowerCase(), n])).values()];
  if (!uniqueNames.length) return [];
  const exactSet = new Set(uniqueNames.map((n) => n.toLowerCase()));

  const counts = new Map();
  for (const m of String(text || "").matchAll(/\b([A-Z][a-z']{2,})\b/g)) {
    const tok = m[1];
    if (COMMON_CAP_WORDS.has(tok)) continue;
    const low = tok.toLowerCase();
    if (exactSet.has(low)) continue;
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }

  const suggestions = [];
  for (const [tok, count] of counts.entries()) {
    if (count < minMentions) continue;
    let best = null;
    for (const target of uniqueNames) {
      if (Math.abs(tok.length - target.length) > maxDistance) continue;
      // Avoid noisy short-word collisions (e.g., "Can" vs "Dan" or "May" vs "Ray" at dist 2)
      const allowedDist = Math.min(tok.length, target.length) <= 4 ? 1 : maxDistance;
      const d = levenshtein(tok, target);
      if (d >= 1 && d <= allowedDist) {
        if (!best || d < best.distance) best = { asrToken: tok, castName: target, distance: d, count };
      }
    }
    if (best) suggestions.push(best);
  }
  return suggestions.sort((a, b) => a.distance - b.distance || b.count - a.count);
}

module.exports = {
  loadNameMap,
  applyNamesToText,
  applyNamesToRawVtt,
  levenshtein,
  suggestNameMismatches,
};
