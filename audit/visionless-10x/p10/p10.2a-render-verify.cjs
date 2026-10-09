#!/usr/bin/env node
/**
 * p10.2a-render-verify.cjs — P10.2a: the pixel-evidence production path.
 *
 * DESIGN: audit/visionless-10x/p10/p10.2a-revised-design.md §2/§7 (v4).
 *   `verified` requires ALL THREE:
 *     1. a BOUND MEASUREMENT RECORD (config hash → still paths → artifact),
 *     2. the recorded config hash MATCHING the config being judged,
 *     3. the measurements PASSING the defined render-truth thresholds.
 *   No record → `unverified`, ALWAYS. The record is a SIDECAR in the audit
 *   directory — never embedded in the config (no hash cycle: the record
 *   references the hash, one direction only).
 *
 * Usage:
 *   node audit/visionless-10x/p10/p10.2a-render-verify.cjs verify \
 *        --config <config.json> --stills <dir> --report <out-record.json>
 *   node audit/visionless-10x/p10/p10.2a-render-verify.cjs record \
 *        --config <config.json> --stills <dir> --report <out-record.json>
 *        [--region name=x0,y0,x1,y1 ...]   (fractions of frame)
 *   node audit/visionless-10x/p10/p10.2a-render-verify.cjs self-test
 *
 * Hash scope (§2): canonical JSON of the SCENE CONFIG ONLY — the record's own
 * audit fields are excluded by enumeration because the record is never part of
 * the config.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const assert = require("assert");
const rt = require("../../../scripts/lib/render-truth.js");

const FRAME = { w: 1920, h: 1080 };
// Defined thresholds (render-truth THRESHOLDS + the P10.1 pixel-check contract):
// a still is EVIDENTIARY when it is not blank, has ink, and differs from the
// other still (animation delta) — measured, not assumed.
const THRESHOLDS = {
  minLumaSpread: 8,          // 0-255: blank frames are spread ~0
  minNonBlankFraction: 0.02, // at least 2% of pixels carry ink
  minAnimationDelta: 0.5,    // aHash mean distance between stills of one scene
  maxDuplicateDistance: 4,   // render-truth duplicate bits
};

function canonicalConfigHash(config) {
  // hash scope: the scene config only; enumeration-excluded audit fields are
  // the sidecar-back-references (visualCompiled.pixel) — nothing else.
  const clone = JSON.parse(JSON.stringify(config));
  for (const s of clone.scenes || clone.beats || []) {
    const a = s._authorship;
    if (a && a.visualCompiled && a.visualCompiled.pixel) a.visualCompiled.pixel = null;
  }
  const canonical = JSON.stringify(clone, Object.keys(JSON.parse(JSON.stringify(clone))).sort ? null : null);
  // stable stringify (sorted keys, recursive)
  const stable = (v) => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === "object") {
      const o = {};
      for (const k of Object.keys(v).sort()) o[k] = stable(v[k]);
      return o;
    }
    return v;
  };
  return crypto.createHash("sha256").update(JSON.stringify(stable(clone))).digest("hex").slice(0, 16);
}

function analyzeStill(file, regions) {
  const a = rt.analyzePngFile(file);
  if (!a.ok) return { ok: false, error: a.error || "decode failed", file };
  const out = {
    ok: true, file: path.basename(file), w: a.w, h: a.h,
    lumaSpread: Math.round((a.lumaMax - a.lumaMin) * 100) / 100,
    nonBlankFraction: a.nonBlankFraction,
    hash: a.hash,
    regions: {},
  };
  for (const [name, r] of Object.entries(regions || {})) {
    out.regions[name] = rt.regionStats(a, r.x0, r.y0, r.x1, r.y1);
  }
  return out;
}

function measure(stillsDir, regions) {
  const files = fs.readdirSync(stillsDir).filter((f) => f.endsWith(".png")).sort();
  if (!files.length) return { ok: false, error: "no stills found", stills: [] };
  const stills = files.map((f) => analyzeStill(path.join(stillsDir, f), regions));
  const okStills = stills.filter((s) => s.ok);
  const animationDelta = okStills.length >= 2 && rt.hamming(okStills[0].hash, okStills[1].hash);
  return {
    ok: okStills.length === stills.length && okStills.length > 0,
    stills, animationDelta: animationDelta || 0,
  };
}

function passesThresholds(m) {
  const reasons = [];
  if (!m.ok) return { pass: false, reasons: ["measurement failed: " + (m.error || "unknown")] };
  for (const s of m.stills) {
    if (s.lumaSpread < THRESHOLDS.minLumaSpread) reasons.push(`${s.file}: luma spread ${s.lumaSpread} < ${THRESHOLDS.minLumaSpread}`);
    if (s.nonBlankFraction < THRESHOLDS.minNonBlankFraction) reasons.push(`${s.file}: non-blank ${s.nonBlankFraction} < ${THRESHOLDS.minNonBlankFraction}`);
  }
  if (m.stills.length >= 2 && m.animationDelta < THRESHOLDS.minAnimationDelta) {
    reasons.push(`animation delta ${m.animationDelta} < ${THRESHOLDS.minAnimationDelta} (still frames)`);
  }
  return { pass: reasons.length === 0, reasons };
}

/**
 * evidenceStrengthOf(config) — the judge. ALL THREE conditions or `unverified`.
 */
function evidenceStrengthOf(config, { recordPath = null, record = null } = {}) {
  const r = record || (recordPath && fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath, "utf8")) : null);
  const hash = canonicalConfigHash(config);
  if (!r) return { evidenceStrength: "unverified", reason: "no measurement record", configHash: hash };
  if (r.configHash !== hash) return { evidenceStrength: "unverified", reason: `config hash mismatch: record=${r.configHash} config=${hash}`, configHash: hash };
  if (!r.measurement || !r.measurement.ok) return { evidenceStrength: "unverified", reason: "record measurement incomplete", configHash: hash };
  const t = passesThresholds(r.measurement);
  if (!t.pass) return { evidenceStrength: "unverified", reason: "thresholds failed: " + t.reasons.join("; "), configHash: hash };
  return { evidenceStrength: "verified", configHash: hash, record: path.basename(r.report || recordPath || "inline") };
}

function writeRecord({ configPath, stillsDir, reportPath, regions }) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const m = measure(stillsDir, regions);
  const record = {
    what: "P10.2a bound pixel measurement record (sidecar; NEVER embedded in config)",
    configPath: path.basename(configPath),
    configHash: canonicalConfigHash(config),
    stillsDir: path.basename(stillsDir),
    report: path.basename(reportPath),
    thresholds: THRESHOLDS,
    measurement: m,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(reportPath, JSON.stringify(record, null, 2));
  return record;
}

// ── self-test: the three `unverified` paths + the verified path (synthetic) ──
function selfTest() {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log(`  ok  ${name}`); } catch (e) { fail++; console.error(`FAIL  ${name}\n      ${e.message}`); } };
  const cfg = (n) => ({ scenes: [{ id: "s1", props: [{ type: "storm", x: 960, y: 300, scale: 1 }], _authorship: { propTypes: ["storm"], visualCompiled: { pixel: { evidenceStrength: "unverified", record: null } } } }], n });

  t("missing record → unverified", () => {
    const r = evidenceStrengthOf(cfg(1), { recordPath: "Z:/definitely/missing.json" });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /no measurement record/);
  });
  t("hash mismatch → unverified", () => {
    const fake = { configHash: "deadbeefdeadbeef", measurement: { ok: true, stills: [{ file: "a.png", lumaSpread: 100, nonBlankFraction: 0.5, hash: 1 }], animationDelta: 3 } };
    const r = evidenceStrengthOf(cfg(2), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /hash mismatch/);
  });
  t("threshold fail (blank still) → unverified", () => {
    const h = canonicalConfigHash(cfg(3));
    const fake = { configHash: h, measurement: { ok: true, stills: [{ file: "a.png", lumaSpread: 1, nonBlankFraction: 0.001, hash: 7 }, { file: "b.png", lumaSpread: 100, nonBlankFraction: 0.4, hash: 8 }], animationDelta: 3 } };
    const r = evidenceStrengthOf(cfg(3), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /thresholds failed/);
  });
  t("threshold fail (no animation) → unverified", () => {
    const h = canonicalConfigHash(cfg(4));
    const fake = { configHash: h, measurement: { ok: true, stills: [{ file: "a.png", lumaSpread: 100, nonBlankFraction: 0.4, hash: 7 }, { file: "b.png", lumaSpread: 100, nonBlankFraction: 0.4, hash: 7 }], animationDelta: 0 } };
    const r = evidenceStrengthOf(cfg(4), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /animation delta/);
  });
  t("record + hash match + thresholds → verified", () => {
    const h = canonicalConfigHash(cfg(5));
    const fake = { configHash: h, measurement: { ok: true, stills: [{ file: "a.png", lumaSpread: 100, nonBlankFraction: 0.4, hash: 7 }, { file: "b.png", lumaSpread: 100, nonBlankFraction: 0.4, hash: 13 }], animationDelta: 3 } };
    const r = evidenceStrengthOf(cfg(5), { record: fake });
    assert.equal(r.evidenceStrength, "verified");
  });
  t("hash is stable and sidecar-blind (same config, pixel null or set → same hash)", () => {
    const c1 = cfg(6);
    const c2 = JSON.parse(JSON.stringify(c1));
    c2.scenes[0]._authorship.visualCompiled.pixel = { evidenceStrength: "verified", record: "whatever.json" };
    assert.equal(canonicalConfigHash(c1), canonicalConfigHash(c2), "no hash cycle: sidecar fields excluded");
  });
  console.log(`\n${pass} passed, ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "self-test") process.exit(selfTest());
  const cmd = args[0];
  const opt = {};
  const regions = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--region") { const [name, box] = args[++i].split("="); const [x0, y0, x1, y1] = box.split(",").map(Number); regions[name] = { x0, y0, x1, y1 }; }
    else if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[++i];
  }
  if (cmd === "record") {
    const rec = writeRecord({ configPath: opt.config, stillsDir: opt.stills, reportPath: opt.report, regions });
    const verdict = evidenceStrengthOf(JSON.parse(fs.readFileSync(opt.config, "utf8")), { record: rec });
    console.log(`record → ${opt.report}\npixel evidenceStrength: ${verdict.evidenceStrength}${verdict.reason ? " (" + verdict.reason + ")" : ""}`);
    process.exit(0);
  }
  if (cmd === "verify") {
    const config = JSON.parse(fs.readFileSync(opt.config, "utf8"));
    const verdict = evidenceStrengthOf(config, { recordPath: opt.report });
    console.log(JSON.stringify(verdict, null, 2));
    process.exit(verdict.evidenceStrength === "verified" ? 0 : 1);
  }
  console.error("usage: p10.2a-render-verify.cjs [record|verify|self-test] --config C --stills D --report R [--region name=x0,y0,x1,y1]");
  process.exit(2);
}

if (require.main === module) main();
module.exports = { canonicalConfigHash, measure, passesThresholds, evidenceStrengthOf, THRESHOLDS };
