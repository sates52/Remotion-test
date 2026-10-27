#!/usr/bin/env node
/**
 * render-decision.js — READ-ONLY: is the production render of THIS config already decided by the operator?
 *
 *   node scripts/render-decision.js --slug=<slug> [--json]
 *
 * Why (2026-10-27): agents asked the operator again for a decision the operator had already recorded (accepted
 * quality debt for an exact config with --accept-quality-debt, which is also that config's production-render
 * approval). The gate logic (lib/render-preflight.js evaluate) was right; there was no way to LOOK the decision up
 * without starting a render. This prints one verdict and changes nothing: it runs no firewall, writes no file,
 * dispatches nothing. It never turns a FAIL into a PASS:
 *   COVERED          exit 0  a recorded decision covers every REVIEW finding of this exact config (render-input hash):
 *                            the production render needs no new question — render.js still runs the real preflight
 *   BLOCK            exit 1  BLOCK findings: no decision can cover them
 *   NEEDS_DECISION   exit 2  REVIEW findings with no decision for this config (a new config or a new finding is never
 *                            covered by an older decision) — the operator decides
 *   NO_DEBT          exit 2  firewall PASS: no debt to accept; a production render still needs the operator's go
 *   NOT_APPLICABLE   exit 2  no narrative firewall for this engine (Vox); the production render needs the operator's go
 *   NO_REPORT/STALE  exit 3  no firewall report for this config — render.js's preflight computes it
 * The preview verdict is printed as it is (NOT READY stays NOT READY: an accepted decision does not change it).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const rp = require("./lib/render-preflight");

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const slug = args.slug;
if (!slug) { console.error("usage: node scripts/render-decision.js --slug=<slug> [--json]"); process.exit(2); }
const root = args.root ? path.resolve(String(args.root)) : path.resolve(__dirname, "..");

function decisionStatus({ root, slug }) {
  const dir = path.join(root, "books", slug);
  let engine = null;
  try { engine = JSON.parse(fs.readFileSync(path.join(dir, "book.json"), "utf8")).engine || null; } catch {}
  const cfgFile = ["config.antidote.json", "config.vox.json"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f) && (!engine || path.basename(f) === `config.${engine}.json`));
  if (!cfgFile) return { verdict: "NO_CONFIG", exit: 3, detail: `books/${slug}: no config.${engine || "<engine>"}.json` };
  const hash = rp.configHash(cfgFile), inputHash = rp.inputHashOf(cfgFile);
  // preview verdict, as recorded (never changed here)
  let preview = null;
  try {
    const pr = JSON.parse(fs.readFileSync(path.join(dir, "preview-ready.json"), "utf8"));
    const sha = crypto.createHash("sha256").update(fs.readFileSync(cfgFile)).digest("hex");
    preview = { ready: pr.ready === true, current: !pr.configSha256 || pr.configSha256 === sha || String(sha).startsWith(String(pr.configSha256)) };
  } catch {}
  const base = { slug, engine: engine || path.basename(cfgFile).split(".")[1], config: path.relative(root, cfgFile), configHash: hash, renderInputHash: inputHash, preview };
  if (!/config\.antidote\.json$/.test(cfgFile)) return { ...base, verdict: "NOT_APPLICABLE", exit: 2, detail: "no narrative firewall for this engine: there is no quality debt to accept; the production render needs the operator's go" };
  const repFile = path.join(dir, "narrative-visual-firewall.report.json");
  let rep = null;
  try { rep = JSON.parse(fs.readFileSync(repFile, "utf8")); } catch {}
  if (!rep) return { ...base, verdict: "NO_REPORT", exit: 3, detail: "no production firewall report yet — render.js's preflight computes it (nothing is decided before that)" };
  if (rep.renderInputHash && inputHash && rep.renderInputHash !== inputHash) return { ...base, verdict: "STALE_REPORT", exit: 3, detail: `the firewall report was computed on config ${rep.renderInputHash}, the config is now ${inputHash} — render.js's preflight recomputes it` };
  const firewall = rp.readQuality({ root, slug, preview: false });
  const ev = rp.evaluate({ mode: rp.MODE.PRODUCTION, firewall, hash, inputHash, decisions: rp.loadDecisions(root, slug) });
  const q = `${firewall.blocks} BLOCK, ${firewall.reviews} REVIEW`;
  if (firewall.blocks > 0) return { ...base, verdict: "BLOCK", exit: 1, quality: "FAIL", detail: `${q}: a BLOCK is never covered by a decision — fix it` };
  if (ev.decision === "PASS") return { ...base, verdict: "NO_DEBT", exit: 2, quality: "PASS", detail: "firewall PASS (no REVIEW): no debt to accept; the production render needs the operator's go" };
  if (ev.decision === "ACCEPTED_DEBT") {
    const d = ev.base;
    return { ...base, verdict: "COVERED", exit: 0, quality: "FAIL", decision: { at: d.at, commit: d.commit, configHash: d.configHash, renderInputHash: d.renderInputHash || null, reason: d.reason }, detail: `${q} — every finding (${ev.covered.length} distinct) covered by the operator's decision of ${d.at} (commit ${String(d.commit || "?").slice(0, 8)}, config ${d.renderInputHash || d.configHash}): "${String(d.reason || "").slice(0, 160)}"` };
  }
  return { ...base, verdict: "NEEDS_DECISION", exit: 2, quality: "FAIL", detail: `${q} — ${ev.blockers.join(" ")} The operator decides (render.js --accept-quality-debt="<why>" records it for this exact config).` };
}

module.exports = { decisionStatus };

if (require.main === module) {
  const st = decisionStatus({ root, slug });
  if (args.json) console.log(JSON.stringify(st, null, 2));
  else {
    console.log(`${st.verdict} ${slug}: ${st.detail}`);
    if (st.preview) console.log(`  preview: ${st.preview.ready ? "READY" : "NOT READY"}${st.preview.current ? "" : " (recorded on an older config)"} — unchanged by any decision`);
    let frozen = false; try { frozen = require("./lib/frozen").isFrozen(slug, root); } catch {}
    if (frozen) console.log("  PUBLISHED (frozen): this book is never re-rendered — the verdict is a record only");
    else if (st.verdict === "COVERED") console.log(`  → already decided: run the production render without asking again: node scripts/render.js --slug=${slug} --method=github (its preflight still checks everything and must say GO)`);
  }
  process.exit(st.exit);
}
