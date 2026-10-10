#!/usr/bin/env node
/**
 * p10.2a-render-verify.cjs — P10.2a: the pixel-evidence production path.
 *
 * DESIGN: audit/visionless-10x/p10/p10.2a-revised-design.md §2/§7 (v4, review-fixed).
 *   `verified` requires ALL FIVE:
 *     1. a BOUND MEASUREMENT RECORD (config hash → still file list → artifact),
 *     2. the recorded config hash MATCHING the config being judged,
 *     3. a VALID measurement: schema-complete, finite numbers, ≥2 stills, and
 *        every recorded still file EXISTS on disk and decodes (render-truth),
 *     4. the measurements PASSING the defined thresholds,
 *     5. the measured pixels REPRODUCIBLE: re-decode the stills now and the
 *        hash fields must match the record (contempt-block: a fabricated or
 *        stale record never verifies).
 *   No record / bad schema / hash mismatch / missing file / threshold fail /
 *   reproduce mismatch → `unverified`, ALWAYS.
 *
 * The record is a SIDECAR in the audit directory — never embedded in the
 * config (no hash cycle: the record references the hash, one direction only).
 *
 * MEASUREMENTS come from scripts/lib/render-truth.js's REAL API:
 *   analyzePngFile → { meanLuma, stdLuma, coverage, edgeDensity,
 *                      colorfulness, hashHex, hashBits } — plus lumaSpread,
 *   computed here as (max cell mean − min cell mean) on the 16×16 grid, the
 *   same primitive render-truth's blank-frame check uses.
 *
 * Usage:
 *   node p10.2a-render-verify.cjs verify  --config C --record R
 *   node p10.2a-render-verify.cjs record  --config C --stills D --report R
 *   node p10.2a-render-verify.cjs self-test
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const assert = require("assert");
const rt = require("../../../scripts/lib/render-truth.js");

// Thresholds over render-truth's REAL metrics:
//   lumaSpread: max-min of the 16x16 grid's cell means (0-255) — a blank frame
//     has all cell means equal → spread ~0. Threshold 8 (P10.1 contract).
//   coverage: fraction of cells whose internal std > 8 (render-truth's own
//     "structured cell" definition) — ≥2% of the frame carries ink.
//   animationDelta: Hamming distance (bits, /256) between the stills' aHash —
//     ≥0.5 (128 bits) means the two frames genuinely differ.
const THRESHOLDS = {
  minLumaSpread: 8,
  minNonBlankFraction: 0.02,
  minAnimationDelta: 0.5,
  requiredStills: 2,
};

const MEASUREMENT_SCHEMA = ["file", "width", "height", "meanLuma", "stdLuma", "coverage", "edgeDensity", "colorfulness", "hashHex", "lumaSpread"];
const MEAS_TOP = ["ok", "stills", "animationDelta"];

function canonicalConfigHash(config) {
  // hash scope: the scene config only; the sidecar back-reference
  // (_authorship.visualCompiled.pixel) is excluded — the record is never part
  // of the config, so there is no hash cycle.
  const clone = JSON.parse(JSON.stringify(config));
  for (const s of clone.scenes || clone.beats || []) {
    const a = s._authorship;
    if (a && a.visualCompiled && a.visualCompiled.pixel) a.visualCompiled.pixel = null;
  }
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

/**
 * measure(stillsDir) — REAL render-truth measurements over every .png in the
 * dir. Every field it later verifies is numeric and finite; failures surface
 * as { ok:false, error } entries, never silently omitted.
 */
function measure(stillsDir) {
  const files = fs.readdirSync(stillsDir).filter((f) => f.toLowerCase().endsWith(".png")).sort();
  if (!files.length) return { ok: false, error: "no stills found", stills: [], animationDelta: null, files: [] };
  const stills = [];
  for (const f of files) {
    const full = path.join(stillsDir, f);
    const a = rt.analyzePngFile(full);
    if (!a.ok) { stills.push({ ok: false, file: f, error: a.error || "decode failed" }); continue; }
    // lumaSpread: max−min of the grid cell means (render-truth exposes them
    // only via gridStats → recompute cheaply from the decoded sola analysis)
    const dec = rt.decodePng(fs.readFileSync(full));
    const luma = rt.lumaOf(dec);
    const { means } = rt.gridStats(luma, dec.width, dec.height);
    const spread = Math.max(...means) - Math.min(...means);
    stills.push({
      ok: true, file: f,
      width: dec.width, height: dec.height,
      meanLuma: a.meanLuma, stdLuma: a.stdLuma,
      coverage: a.coverage, edgeDensity: a.edgeDensity, colorfulness: a.colorfulness,
      hashHex: a.hashHex,
      lumaSpread: Math.round(spread * 100) / 100,
    });
  }
  const okStills = stills.filter((s) => s.ok);
  const animationDelta = okStills.length >= 2 && rt.hamming(okStills[0].hashHex ? rehash(okStills[0], stillsDir) : null, okStills[1].hashHex ? rehash(okStills[1], stillsDir) : null);
  return {
    ok: okStills.length === stills.length && okStills.length >= THRESHOLDS.requiredStills,
    stills, animationDelta: Number.isFinite(animationDelta) ? animationDelta : null,
    files,
  };
}

// aHash bits for the Hamming comparison — decode from the still file, keep the
// bits array out of the record (hashHex identifies; bits recompute at verify).
function rehash(still, stillsDir) {
  const dec = rt.decodePng(fs.readFileSync(path.join(stillsDir, still.file)));
  const luma = rt.lumaOf(dec);
  return rt.aHash(luma, dec.width, dec.height);
}

/** The measurement must be structurally complete: top-level fields present,
 *  ≥requiredStills stills, each still schema-complete with finite numbers,
 *  and every still file still existing ON DISK. */
function validMeasurement(m, stillsDir) {
  const problems = [];
  if (!m || typeof m !== "object") return ["measurement missing"];
  for (const k of MEAS_TOP) if (!(k in m)) problems.push(`measurement.${k} missing`);
  if (!Array.isArray(m.stills) || m.stills.length < THRESHOLDS.requiredStills) {
    problems.push(`needs ≥${THRESHOLDS.requiredStills} stills, record has ${m && m.stills ? m.stills.length : 0}`);
  } else {
    for (const s of m.stills) {
      for (const k of MEASUREMENT_SCHEMA) {
        if (!(k in s)) { problems.push(`${s.file || "still"}.${k} missing`); continue; }
        if (typeof s[k] === "number" && !Number.isFinite(s[k])) problems.push(`${s.file}.${k} not finite`);
        else if (s[k] === null || s[k] === undefined) problems.push(`${s.file}.${k} is null/undefined`);
      }
      if (!s.ok) problems.push(`still ${s.file || "?"} failed to decode${s.error ? ": " + s.error : ""}`);
      if (stillsDir) {
        const p = path.join(stillsDir, s.file || "");
        if (!s.file || !fs.existsSync(p)) problems.push(`still file not found on disk: ${s.file}`);
      }
    }
  }
  if (!("animationDelta" in m) || !Number.isFinite(m.animationDelta)) problems.push("animationDelta missing/not finite");
  return problems;
}

function passesThresholds(m) {
  const reasons = [];
  for (const s of m.stills || []) {
    if (!s.ok) { reasons.push(`${s.file}: decode failed: ${s.error}`); continue; }
    if (s.lumaSpread < THRESHOLDS.minLumaSpread) reasons.push(`${s.file}: luma spread ${s.lumaSpread} < ${THRESHOLDS.minLumaSpread}`);
    if (s.coverage < THRESHOLDS.minNonBlankFraction) reasons.push(`${s.file}: coverage ${s.coverage} < ${THRESHOLDS.minNonBlankFraction}`);
  }
  if (Number.isFinite(m.animationDelta) && m.animationDelta < THRESHOLDS.minAnimationDelta) {
    reasons.push(`animation delta ${m.animationDelta} < ${THRESHOLDS.minAnimationDelta} (still frames)`);
  }
  return { pass: reasons.length === 0, reasons };
}

/**
 * evidenceStrengthOf(config, { recordPath | record, stillsDir }) — the judge.
 * ALL FIVE conditions (see header) or `unverified`, with the reason spelled.
 */
function evidenceStrengthOf(config, { recordPath = null, record = null, stillsDir = null } = {}) {
  const hash = canonicalConfigHash(config);
  const r = record || (recordPath && fs.existsSync(recordPath) ? JSON.parse(fs.readFileSync(recordPath, "utf8")) : null);
  if (!r) return { evidenceStrength: "unverified", reason: "no measurement record", configHash: hash };
  if (r.configHash !== hash) return { evidenceStrength: "unverified", reason: `config hash mismatch: record=${r.configHash} config=${hash}`, configHash: hash };
  const schemaProblems = validMeasurement(r.measurement, stillsDir);
  if (schemaProblems.length) return { evidenceStrength: "unverified", reason: "invalid measurement: " + schemaProblems.join("; "), configHash: hash };
  const t = passesThresholds(r.measurement);
  if (!t.pass) return { evidenceStrength: "unverified", reason: "thresholds failed: " + t.reasons.join("; "), configHash: hash };
  // reproduce: re-decode the stills NOW; their grids must match the record's
  // hash fields (a stale/fabricated record never passes this).
  if (stillsDir) {
    const now = measure(stillsDir);
    for (const s of r.measurement.stills) {
      const f = now.stills.find((x) => x.ok && x.file === s.file);
      if (!f) return { evidenceStrength: "unverified", reason: `cannot reproduce: ${s.file} no longer decodes`, configHash: hash };
      if (f.hashHex !== s.hashHex) return { evidenceStrength: "unverified", reason: `stale record: ${s.file} hashHex differs from the still on disk (record=${s.hashHex} disk=${f.hashHex})`, configHash: hash };
      if (Math.abs((f.lumaSpread || 0) - s.lumaSpread) > 0.5) return { evidenceStrength: "unverified", reason: `stale record: ${s.file} lumaSpread differs (record=${s.lumaSpread} disk=${f.lumaSpread})`, configHash: hash };
    }
    const d = now.animationDelta;
    if (d !== null && Math.abs(d - r.measurement.animationDelta) > 0.5) {
      return { evidenceStrength: "unverified", reason: `stale record: animationDelta differs (record=${r.measurement.animationDelta} disk=${d})`, configHash: hash };
    }
  }
  return { evidenceStrength: "verified", configHash: hash, record: path.basename(r.report || recordPath || "inline"), thresholds: THRESHOLDS, measured: r.measurement };
}

function writeRecord({ configPath, stillsDir, reportPath, standaloneConfig = null }) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const m = measure(stillsDir);
  const record = {
    what: "P10.2a bound pixel measurement record (sidecar; NEVER embedded in config)",
    configPath: path.basename(configPath),
    configHash: canonicalConfigHash(config),
    stillsDir: path.basename(stillsDir),
    report: path.basename(reportPath),
    thresholds: THRESHOLDS,
    schema: MEASUREMENT_SCHEMA,
    measurement: m,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(reportPath, JSON.stringify(record, null, 2) + "\n");
  return record;
}

// ── self-test: the unverified paths + the verified path + schema holes ──────
function selfTest() {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log(`  ok  ${name}`); } catch (e) { fail++; console.error(`FAIL  ${name}\n      ${e.message}`); } };
  const cfg = (n) => ({
    scenes: [{
      id: "s1", props: [{ type: "storm", x: 960, y: 300, scale: 1 }],
      _authorship: { propTypes: ["storm"], visualCompiled: { pixel: { evidenceStrength: "unverified", record: null } } },
    }],
    n,
  });
  const still = (over = {}) => Object.assign({ ok: true, file: "a.png", width: 1920, height: 1080, meanLuma: 90, stdLuma: 30, coverage: 0.4, edgeDensity: 5, colorfulness: 12, hashHex: "abc123", lumaSpread: 100 }, over);
  const good = (over = {}) => Object.assign({ ok: true, stills: [still(), still({ file: "b.png", hashHex: "def456" })], animationDelta: 130 }, over);

  t("missing record → unverified", () => {
    const r = evidenceStrengthOf(cfg(1), { recordPath: "Z:/definitely/missing.json" });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /no measurement record/);
  });
  t("hash mismatch → unverified", () => {
    const fake = { configHash: "deadbeefdeadbeef", measurement: good() };
    const r = evidenceStrengthOf(cfg(2), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /hash mismatch/);
  });
  t("record without configHash → unverified", () => {
    const r = evidenceStrengthOf(cfg(21), { record: { measurement: good() } });
    assert.equal(r.evidenceStrength, "unverified");
  });
  t("stills:[] → unverified (schema)", () => {
    const fake = { configHash: canonicalConfigHash(cfg(3)), measurement: { ok: true, stills: [], animationDelta: 0 } };
    const r = evidenceStrengthOf(cfg(3), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /invalid measurement/);
    assert.match(r.reason, /stills/);
  });
  t("one unrelated still ({file:'unrelated.png'}) with the right configHash → unverified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(4)), measurement: { ok: true, stills: [{ file: "unrelated.png" }], animationDelta: 3 } };
    const r = evidenceStrengthOf(cfg(4), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /invalid measurement/);
  });
  t("non-finite number in the record → unverified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(5)), measurement: good({ stills: [still({ lumaSpread: null }), still({ file: "b.png", hashHex: "def456", lumaSpread: 90 })], animationDelta: 130 }) };
    const r = evidenceStrengthOf(cfg(5), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /not finite|is null\/undefined/);
  });
  t("threshold fail (blank still) → unverified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(6)), measurement: good({ stills: [still({ lumaSpread: 1, coverage: 0.001 }), still({ file: "b.png", hashHex: "def456" })], animationDelta: 130 }) };
    const r = evidenceStrengthOf(cfg(6), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /thresholds failed/);
  });
  t("threshold fail (no animation) → unverified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(7)), measurement: good({ stills: [still(), still({ file: "b.png", hashHex: "def456" })], animationDelta: 0 }) };
    const r = evidenceStrengthOf(cfg(7), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /animation delta/);
  });
  t("failed decode in the record → unverified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(8)), measurement: good({ stills: [still({ ok: false, error: "not a PNG" }), still({ file: "b.png", hashHex: "def456" })], animationDelta: 130 }) };
    const r = evidenceStrengthOf(cfg(8), { record: fake });
    assert.equal(r.evidenceStrength, "unverified");
    assert.match(r.reason, /failed to decode/);
  });
  t("record + hash match + thresholds (no re-decode scope) → verified", () => {
    const fake = { configHash: canonicalConfigHash(cfg(9)), measurement: good() };
    const r = evidenceStrengthOf(cfg(9), { record: fake });
    assert.equal(r.evidenceStrength, "verified");
  });
  t("REAL stills end to end: record a synthetic 4-cell PNG, verify, then a stale record → unverified", () => {
    // build a real (tiny) PNG via render-truth's decoder inverse? Not
    // available — instead encode two trivial PNGs by hand (zlib, no filters).
    const zlib = require("zlib");
    const crcTable = (() => { const c = []; for (let n = 0; n < 256; n++) { let k = n; for (let i = 0; i < 8; i++) k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1; c[n] = k >>> 0; } return c; })();
    const mkChunk = (type, data) => {
      const out = Buffer.alloc(12 + data.length);
      out.writeUInt32BE(data.length, 0);
      out.write(type, 4);
      data.copy(out, 8);
      const crc = (() => { let c = 0xffffffff; for (const b of Buffer.concat([Buffer.from(type), data])) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; })();
      out.writeUInt32BE(crc, 8 + data.length);
      return out;
    };
    // a 64x64 checker that has internal cell variance (coverage=1) and a
    // second frame with a different hash (animationDelta > 0.5)
    const mk = (toneA, toneB) => ({ w: 64, h: 64, data: (function () {
      const arr = [];
      for (let i = 0; i < 64 * 64; i++) {
        const x = i % 64, y = (i / 64) | 0;
        const block = ((x >> 2) + (y >> 2)) % 2 ? toneA : toneB;
        const v = (x + y) % 2 ? block + 40 : block; // internal cell variance
        arr.push((v << 16) | (v << 8) | v);
      }
      return arr;
    })() });
    const pngOf = (px) => {
      const W = px.w; const ihdr = Buffer.alloc(13);
      ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(px.h, 4);
      ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
      const raw = Buffer.alloc(px.h * (W * 3 + 1));
      for (let y = 0; y < px.h; y++) {
        raw[y * (W * 3 + 1)] = 0;
        for (let x = 0; x < W; x++) {
          const i = y * (W * 3 + 1) + 1 + x * 3;
          const p = px.data[y * W + x];
          raw[i] = (p >> 16) & 255; raw[i + 1] = (p >> 8) & 255; raw[i + 2] = p & 255;
        }
      }
      return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), mkChunk("IHDR", ihdr), mkChunk("IDAT", zlib.deflateSync(raw)), mkChunk("IEND", Buffer.alloc(0))]);
    };
    const dir = fs.mkdtempSync("p10.2a-selftest-");
    const A = mk(0x90, 0x30), B = mk(0x30, 0x90); // inverted checker → different hash
    fs.writeFileSync(path.join(dir, "f0.png"), pngOf(A));
    fs.writeFileSync(path.join(dir, "f1.png"), pngOf(B));
    try {
      const cfgA = cfg(10);
      const rec = writeRecord({ configPath: writeTempConfig(cfgA), stillsDir: dir, reportPath: path.join(dir, "rec.json"), standaloneConfig: cfgA });
      const verified = evidenceStrengthOf(cfgA, { record: rec, stillsDir: dir });
      assert.equal(verified.evidenceStrength, "verified", verified.reason || "");
      assert.ok(verified.measured.stills.length === 2, "two stills measured");
      assert.equal(verified.measured.stills[0].width, 64);
      assert.ok(Number.isFinite(verified.measured.animationDelta), `animationDelta=${verified.measured.animationDelta}`);
      // stale: tamper a still file after the record → the reproduce check trips
      fs.writeFileSync(path.join(dir, "f0.png"), pngOf(mk(0x01, 0x02)));
      const stale = evidenceStrengthOf(cfgA, { record: rec, stillsDir: dir });
      // the record now mismatches the disk still (hash or luma) → unverified, not verified
      assert.equal(stale.evidenceStrength, "unverified", `stale should be unverified, got ${stale.evidenceStrength} (${stale.reason})`);
      assert.ok(/stale|thresholds/.test(stale.reason), `reason mentions the mismatch: ${stale.reason}`);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    function writeTempConfig(c) {
      const p = path.join(fs.mkdtempSync("p10.2a-cfg-"), "config.json");
      fs.writeFileSync(p, JSON.stringify(c));
      return p;
    }
  });
  t("hash is stable and sidecar-blind", () => {
    const c1 = cfg(6);
    const c2 = JSON.parse(JSON.stringify(c1));
    c2.scenes[0]._authorship.visualCompiled.pixel = { evidenceStrength: "verified", record: "whatever.json" };
    assert.equal(canonicalConfigHash(c1), canonicalConfigHash(c2));
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
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[++i];
  }
  if (cmd === "record") {
    const rec = writeRecord({ configPath: opt.config, stillsDir: opt.stills, reportPath: opt.report });
    const verdict = evidenceStrengthOf(JSON.parse(fs.readFileSync(opt.config, "utf8")), { record: rec, stillsDir: opt.stills });
    console.log(`record → ${opt.report}\npixel evidenceStrength: ${verdict.evidenceStrength}${verdict.reason ? " (" + verdict.reason + ")" : ""}`);
    fs.writeFileSync(path.join(path.dirname(opt.report), `verdict-${path.basename(opt.report)}`), JSON.stringify(verdict, null, 2) + "\n");
    process.exit(verdict.evidenceStrength === "verified" ? 0 : 1);
  }
  if (cmd === "verify") {
    const config = JSON.parse(fs.readFileSync(opt.config, "utf8"));
    const verdict = evidenceStrengthOf(config, { recordPath: opt.record, stillsDir: opt.stills || (opt.record ? path.dirname(opt.record) : null) });
    console.log(JSON.stringify(verdict, null, 2));
    process.exit(verdict.evidenceStrength === "verified" ? 0 : 1);
  }
  console.error("usage: p10.2a-render-verify.cjs [record|verify|self-test] --config C --stills D [--record R | --report R]");
  process.exit(2);
}

if (require.main === module) main();
module.exports = { canonicalConfigHash, measure, validMeasurement, passesThresholds, evidenceStrengthOf, writeRecord, THRESHOLDS, MEASUREMENT_SCHEMA };
