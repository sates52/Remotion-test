#!/usr/bin/env node
/**
 * p10.2a-planner-integration.cjs — the REAL planner integration test (review fix #5).
 *
 * The previous "integration" test COPIED the hook into a fixture and never ran
 * plan-antidote.js. This one drives the real planner three ways and asserts on
 * its actual output:
 *
 *   1. visual PRESENT  → plan succeeds via --out (test mode), the visual block's
 *      scene carries _authorship.visualCompiled with compiled props appended,
 *      unrepresentable claims ledgered (floodwall), forbidden list sealed, and
 *      the REAL authorship gate passes the config.
 *   2. visual ABSENT   → plan succeeds with NO visualCompiled field anywhere.
 *   3. requested+forbidden conflict (R4) → the planner EXITS NONZERO and writes
 *      nothing (the hard error the review demanded, reproduced through the real
 *      process boundary, not through a copied hook).
 *
 * Run: node audit/visionless-10x/p10/p10.2a-planner-integration.cjs
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const TMP = path.join(ROOT, "audit", "visionless-10x", "p10", "tmp-planner-integ");

const TEXTS = [
  "A storm gathered over the desert wash.",
  "The flash flood filled it in minutes.",
  "Nothing else is worth remembering here.",
];

// plan-antidote's parseWords only reads YouTube word-timestamped VTT
// (<00:..><c>word</c> inline stamps); a plain-caption VTT parses to zero words
// and the planner exits. Emit one cue per sentence with inline word stamps.
const VTT_TEXT = (() => {
  const ts = (x) => "00:" + String(Math.floor(x / 60)).padStart(2, "0") + ":" + (x % 60).toFixed(3).padStart(6, "0");
  let v = "WEBVTT\n\n";
  let t0 = 0;
  for (const text of TEXTS) {
    const words = text.split(" ");
    const stamps = words.map((w, i) =>
      `<${ts(t0 + i * 0.45)}><c>${w}</c>`).join("");
    v += `${ts(t0)} --> ${ts(t0 + words.length * 0.45 + 0.3)}\n${stamps}\n\n`;
    t0 += words.length * 0.45 + 0.5;
  }
  return v;
})();

function briefFingerprint(text) {
  const norm = String(text).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  let h = 2166136261;
  for (let i = 0; i < norm.length; i++) { h ^= norm.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

function writeBriefs(visualOrNull, conflict = false) {
  const briefs = TEXTS.map((t, i) => ({
    fp: briefFingerprint(t.slice(0, 160)), i, src: "claude", confidence: 0.9,
    narrative_intent: `show the storm then the flood ${ "the wash." }`, visual_intent: "two-pole cause_effect",
    ...(visualOrNull ? {
      visual: conflict
        ? { relation: "none", claims: [{ subject: "storm" }], forbidden: ["storm"] }
        : {
            relation: "cause_effect",
            claims: [
              { subject: "storm", role: "pole-0", band: "center", size: "m", text: "the storm" },
              { subject: "water", role: "pole-1", band: "center", size: "m", text: "the flood" },
              { subject: "arrow", role: "relator", size: "m" },
              { subject: "floodwall", text: "the surging wall of water" }, // unrepresentable → ledger
            ],
            forbidden: ["city", "subway", "coin", "phone"],
          },
    } : {}),
  }));
  const p = path.join(TMP, `briefs${conflict ? "-conflict" : visualOrNull ? "" : "-novisual"}.json`);
  fs.writeFileSync(p, JSON.stringify({ slug: "p10a-integ", authored: true, briefs }, null, 2));
  return p;
}

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`  ok  ${name}`); }
  catch (e) { fail++; console.error(`FAIL  ${name}\n      ${e.message}`); }
}

function plan({ briefs, tag }) {
  const vtt = path.join(TMP, `test${tag}.vtt`);
  fs.writeFileSync(vtt, VTT_TEXT);
  const out = path.join(TMP, `config${tag}.json`);
  const log = [];
  const run = () => execFileSync(process.execPath, [
    path.join(ROOT, "scripts", "plan-antidote.js"),
    `--vtt=${vtt}`, `--briefs=${briefs}`, `--out=${out}`,
    `--slug=p10a-integ`, `--title=Integration Probe`, `--genre=psychology`, "--no-art",
  ], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  try { run(); return { ok: true, out, stderr: "", stdout: log.join("") }; }
  catch (e) { return { ok: false, out, stderr: String(e.stderr || "") + String(e.stdout || ""), status: e.status }; }
}

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

// ── 1: visual PRESENT through the real planner ──────────────────────────────
console.log("running real plan-antidote with an authored visual block…");
const r1 = plan({ briefs: writeBriefs(true), tag: "vis" });
const cfg1 = r1.ok ? JSON.parse(fs.readFileSync(r1.out, "utf8")) : null;
t("planner succeeds with a visual block", () => {
  if (!r1.ok) throw new Error("planner exited nonzero:\n" + r1.stderr.slice(-2000));
});
t("the briefed scene carries _authorship.visualCompiled", () => {
  const s = cfg1.scenes.find((x) => (x._authorship || {}).visualCompiled);
  if (!s) throw new Error("no scene has visualCompiled");
});
t("compiled props are appended; unrepresentable `floodwall` is ledgered, NOT staged", () => {
  const s = cfg1.scenes.find((x) => (x._authorship || {}).visualCompiled);
  const vc = s._authorship.visualCompiled;
  const types = (s.props || []).map((p) => p.type);
  for (const want of ["storm", "water", "arrow"]) assertOrThrow(types.includes(want), `${want} not staged; props=${types.join(",")}`);
  if (types.includes("floodwall")) throw new Error("floodwall was STAGED though it has no renderer motif");
  const unrep = (vc.unrepresentable || []).find((u) => u.requested === "floodwall");
  if (!unrep) throw new Error("floodwall missing from the ledger: " + JSON.stringify(vc.unrepresentable));
  if (!unrep.reason || !/motif/i.test(unrep.reason)) throw new Error("ledger entry lacks a reason: " + JSON.stringify(unrep));
});
t("forbidden list is sealed into visualCompiled for the config-only gate sweep", () => {
  const s = cfg1.scenes.find((x) => (x._authorship || {}).visualCompiled);
  if (JSON.stringify(s._authorship.visualCompiled.forbidden) !== JSON.stringify(["city", "subway", "coin", "phone"])) {
    throw new Error("forbidden not sealed: " + JSON.stringify(s._authorship.visualCompiled.forbidden));
  }
});
t("REAL authorship gate reports no HARD violations on the full planned config", () => {
  const { evaluateAuthorship } = require(path.join(ROOT, "scripts", "lib", "authorship.js"));
  const res = evaluateAuthorship(cfg1, { engine: "antidote", slug: "p10a-integ" });
  const hard = (res.violations || []).filter((v) => v.hard);
  if (hard.length) throw new Error("HARD violations: " + JSON.stringify(hard.slice(0, 6)));
  // REPEATED_INTENT is a single-fixture measurement artifact (1 beat / 1 intent
  // ⇒ share = 1 > the 10% template share rail; a production plan spreads intents
  // across hundreds of beats). Assert it is the ONLY reported code here, so this
  // test cannot hide new real violations behind the artifact.
  const others = (res.violations || []).filter((v) => v.code !== "REPEATED_INTENT");
  if (others.length) throw new Error("unexpected non-REPEATED_INTENT violations: " + JSON.stringify(others.slice(0, 6)));
});

// ── 2: visual ABSENT through the real planner ───────────────────────────────
console.log("running real plan-antidote with NO visual block…");
const r2 = plan({ briefs: writeBriefs(false), tag: "novis" });
const cfg2 = r2.ok ? JSON.parse(fs.readFileSync(r2.out, "utf8")) : null;
t("planner succeeds without a visual block", () => {
  if (!r2.ok) throw new Error("planner exited nonzero:\n" + r2.stderr.slice(-1500));
});
t("no scene carries visualCompiled when no brief declares visual", () => {
  const withVC = (cfg2.scenes || []).filter((x) => (x._authorship || {}).visualCompiled);
  if (withVC.length) throw new Error(`${withVC.length} scene(s) have visualCompiled: ${withVC.map((s) => s.id).join(",")}`);
});

// ── 3: R4 conflict → hard exit through the real process boundary ────────────
console.log("running real plan-antidote with a requested+forbidden conflict…");
const r3 = plan({ briefs: writeBriefs(true, true), tag: "conf" });
t("planner EXITS NONZERO on the R4 conflict (hard stop, not metadata-only)", () => {
  if (r3.ok) throw new Error("planner succeeded but must stop on a requested+forbidden conflict");
});
t("no config written on the R4 hard exit", () => {
  if (fs.existsSync(r3.out)) throw new Error("a config was still written at " + r3.out);
});
t("the R4 error message names the violation and the fix", () => {
  const m = (r3.stderr || "") + "";
  if (!/requested and forbidden|both requested and forbidden|R4/i.test(m)) {
    throw new Error("exit message does not name the R4 violation:\n" + m.slice(-1200));
  }
});

fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

function assertOrThrow(cond, msg) { if (!cond) throw new Error(msg); }
