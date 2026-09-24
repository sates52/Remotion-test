#!/usr/bin/env node
/**
 * preview-ready.js — one answer to "can the operator preview this book?".
 *
 *   node scripts/preview-ready.js --slug=<slug>
 *
 * READY means: authored (gate-authorship PASS), every blocking gate report
 * PASS, and the latest blind mute test PASS (WRONG <= 1/30, image adds >= 60%).
 * Gate PASS alone is not enough — the old We Were Liars config passed every gate
 * and a blind judge found 9/30 frames WRONG.
 * Exit 0 = READY, 1 = NOT READY (reasons printed).
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const slug = (process.argv.find((a) => a.startsWith("--slug=")) || "").slice(7);
if (!slug) { console.error("Usage: node scripts/preview-ready.js --slug=<slug>"); process.exit(1); }
const BOOK = path.join(ROOT, "books", slug);
const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const engine = fs.existsSync(path.join(BOOK, "config.antidote.json")) ? "antidote" : fs.existsSync(path.join(BOOK, "config.vox.json")) ? "vox" : null;

const rows = [];
const check = (name, ok, detail = "") => rows.push({ name, ok, detail });

check("config exists", !!engine, engine || `run make-book for ${slug}`);
if (engine) {
  const art = engine === "antidote" ? path.join(BOOK, "art.json") : path.join(BOOK, "designs.json");
  check(`authored ${path.basename(art)}`, fs.existsSync(art), fs.existsSync(art) ? "" : "node scripts/storyboard.js prep → authors → merge --write");
  const g = spawnSync(process.execPath, ["scripts/gate-authorship.js", `--slug=${slug}`, "--report-only"], { cwd: ROOT, encoding: "utf8" });
  const gr = readJSON(path.join(BOOK, "authorship.report.json"));
  check("authorship gate", gr && gr.status === "PASS", gr ? JSON.stringify(gr.counts) : (g.stderr || "").slice(0, 200));
  if (engine === "antidote") {
    const fw = readJSON(path.join(BOOK, "narrative-visual-firewall.report.json"));
    check("narrative firewall", fw && fw.status === "PASS", fw ? `${fw.counts.violations} violations` : "not run — make-book step 1.895");
    const stx = readJSON(path.join(BOOK, "screen-text.report.json"));
    check("screen-text gate", stx && stx.status === "PASS", stx ? `${(stx.violations || []).length} violations` : "not run — make-book step 1.896");
  }
  const mt = readJSON(path.join(BOOK, "mute-test.json"));
  const runs = (mt && mt.runs) || [];
  const last = runs[runs.length - 1];
  // Holdout rule (mute-test.js): a PASS on reused frames is a diagnostic. The
  // verdict is the latest fresh-sample run; runs recorded before the rule
  // (no `sample` field) count as fresh only if they were not a --vs comparison.
  const isFresh = (r) => (r.sample ? r.sample === "fresh" : !r.vs);
  const verdict = [...runs].reverse().find(isFresh);
  const ok = !!(last && last.pass && verdict && verdict.pass);
  const tot = (r) => `${r.label}: WRONG ${r.totals.WRONG || 0}/${r.n}, ADDS ${r.totals.ADDS || 0}/${r.n}`;
  check("blind mute test (fresh holdout sample)", ok,
    !last ? "not run — node scripts/mute-test.js prep --slug=" + slug
      : ok ? tot(verdict) + (verdict !== last ? ` · latest ${tot(last)}` : "")
      : last.pass && (!verdict || !verdict.pass) ? `${tot(last)} is on reused frames; latest fresh run ${verdict ? tot(verdict) + " FAIL" : "none"} — node scripts/mute-test.js prep --slug=${slug} --label=holdout1 (fresh sample)`
      : tot(last));
  const meta = readJSON(path.join(BOOK, "youtube-meta.json"));
  rows.push({ name: "youtube pack refined (for upload, not preview)", ok: meta ? meta.needsClaudeRefine === false : false, detail: meta ? "" : "no youtube-meta.json", advisory: true });
}

const ready = rows.filter((r) => !r.advisory).every((r) => r.ok);
console.log(`\n── Preview readiness · ${slug}${engine ? ` [${engine}]` : ""}`);
for (const r of rows) console.log(`   ${r.ok ? "✓" : r.advisory ? "·" : "✗"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
console.log(ready ? `\n✅ READY — preview: http://localhost:3001/${engine === "vox" ? "Vox" : "Antidote"}-${slug}` : "\n❌ NOT READY");
process.exit(ready ? 0 : 1);
