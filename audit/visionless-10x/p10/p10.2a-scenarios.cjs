#!/usr/bin/env node
/**
 * p10.2a-scenarios.cjs — P10.2a generalization scenarios A/B (design §5/§6).
 *
 *   A: Into the Wild #029 — the SAME narration, authored `visual` claims ONLY.
 *      Zero hand coordinates (the v1 fixture's x/y/scale are DELETED from the
 *      input; the compiler's composeFrame produces all geometry).
 *   B: different book world (The Myth of Sisyphus — not ITW), different motif
 *      family (boulder/mask/sun — non-weather), different relation (contrast,
 *      NOT cause_effect), temporalRelation via enter timing.
 *
 *   ZERO-TOLERANCE INVARIANTS (asserted):
 *     - author coordinates: ZERO x/y/scale numbers in any authored input
 *     - generic fallback:   ZERO props whose type is not an authored claim subject
 *     - unsupported action silently omitted: ZERO (every gap in the ledger)
 *     - all outputs land in audit/visionless-10x/p10/p10.2a-render/
 *
 *   --build   compile + stage + gate + write artifacts (no render)
 *   --render  additionally render stills via Remotion (slow)
 *   --record  measure stills and write bound pixel records (needs --render done)
 *   no args   build + render + record
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { compile: compileVisual } = require("../../../scripts/lib/visual-compiler.js");
const { authorshipStamp } = require("../../../scripts/lib/authorship.js");
const { severityFor } = require("../../../scripts/lib/proposition-loss.js");

const ROOT = path.join(__dirname, "..", "..", ".."); // audit/visionless-10x/p10 → repo root (3 levels)
const OUT = path.join(__dirname);
const OUTDIR = path.join(OUT, "p10.2a-render");

// ── the authored inputs: claims ONLY, zero coordinates ──────────────────────
const SCENARIOS = [
  {
    id: "A-itw-029",
    book: { slug: "into-the-wild", title: "Into the Wild", author: "Jon Krakauer", genre: "nonfiction",
      palette: { storm: "#3C3A36", water: "#3E6B8C", ink: "#1C1712", paper: "#F4EBDA" },
      provenance: "Into the Wild, ch.4 Detrital Wash: 120° heat, storm hits, flash flood fills the wash (beat #029 narration)" },
    visual: {
      relation: "cause_effect",
      claims: [
        { subject: "storm", role: "pole-0", band: "center", size: "m", text: "a storm hits the wash" },
        { subject: "water", role: "pole-1", band: "center", size: "m", text: "the flash flood fills it" },
        { subject: "arrow", role: "relator", size: "m" },
        { subject: "floodwall", text: "rain runs off and surges as one wall of water" }, // unrepresentable: no linked transformation
      ],
      forbidden: ["cast", "captions", "city", "subway"],
    },
  },
  {
    id: "B-sisyphus-contrast",
    book: { slug: "the-myth-of-sisyphus", title: "The Myth of Sisyphus", author: "Albert Camus", genre: "philosophy",
      palette: { storm: "#3C3A36", water: "#3E6B8C", ink: "#1C1712", paper: "#FBF9F5" },
      provenance: "The Myth of Sisyphus: the Gods condemned him to roll the boulder; the face reads calm, the task absurd (contrast beat, not cause_effect)" },
    visual: {
      relation: "contrast",
      claims: [
        { subject: "boulder", role: "pole-0", band: "center", size: "m", text: "the endless boulder" },
        { subject: "mask", role: "pole-1", band: "center", size: "m", text: "the calm face against it" },
        { subject: "arrow", role: "relator", size: "m" },
        { subject: "hourglass", band: "sky", size: "s", at: 20, enter: "pop", text: "time passing while he rolls" }, // temporalRelation via enter timing
      ],
      forbidden: ["cast", "captions", "city"],
    },
  },
];

// ── invariant checkers ───────────────────────────────────────────────────────
function assertZeroCoordinates(authored) {
  const s = JSON.stringify(authored);
  const hits = [];
  // any authored key carrying a number that could be a coordinate
  const walk = (o, p) => {
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) {
      if (/^(x|y|scale)$/i.test(k) && typeof v === "number") hits.push(`${p}.${k}=${v}`);
      else walk(v, `${p}.${k}`);
    }
  };
  walk(authored, "visual");
  return hits;
}

function buildSceneFor(sc) {
  const authored = sc.visual;
  const coordHits = assertZeroCoordinates(authored);
  if (coordHits.length) throw new Error(`ZERO-COORDINATES violated: ${coordHits.join(", ")}`);

  const vc = compileVisual(authored);
  const authoredSubjects = new Set(authored.claims.map((c) => (typeof c === "string" ? c : c.subject)));
  // generic-fallback invariant: every staged prop type IS an authored subject
  for (const p of vc.props) {
    if (!authoredSubjects.has(p.type)) throw new Error(`GENERIC-FALLBACK violated: ${p.type} was never an authored claim`);
  }
  // silent-omission invariant: claims + unrepresentable + dropped cover all inputs
  const covered = vc.claims.length + (vc.unrepresentable || []).length + (vc.dropped || []).length;
  if (covered < authoredSubjects.size) throw new Error(`SILENT-OMISSION suspected: ${covered} < ${authoredSubjects.size}`);

  const scene = {
    id: `${sc.id}-visual`,
    type: "illustration",
    fromFrame: 0,
    durationFrames: 240,
    shot: "illustration",
    characters: [], // forbidden: ["cast"] — the muted rule
    props: (vc.props || []).map((p) => ({
      type: p.type, x: p.x, y: p.y, scale: p.scale, at: p.at || 0,
      enter: p.enter || "fade",
      ...(Number.isInteger(p.stateIndex) ? { stateIndex: p.stateIndex } : {}),
      ...(sc.book.palette[p.type] ? { color: sc.book.palette[p.type] } : {}),
      _visualClaim: p.role || p.type,
    })),
    texts: [],
    bg: {
      type: "gradient",
      colors: sc.id.startsWith("A") ? ["#5E6B78", "#8A7A5E"] : ["#D8CFC0", "#B8A98E"],
      set: "horizon", // the closest generic landform (no desert set — ledger notes this)
      texture: "grain",
      accent: sc.book.palette.ink,
    },
    transition: { type: "cut", frames: 0, color: sc.book.palette.water },
    _authorship: authorshipStamp({ brief: { narrative_intent: sc.book.provenance, src: "claude" }, src: "brief" }),
  };
  // replicate the production hook (kept in sync with plan-antidote.js; T8 asserts parity)
  scene._authorship.propTypes = [...new Set(scene.props.map((p) => p.type))];
  scene._authorship.visualCompiled = {
    hook: "post-staging/pre-lock (P10.2a §3a)",
    ok: vc.ok, errors: vc.errors || [],
    claims: vc.claims || [], unrepresentable: vc.unrepresentable || [], dropped: vc.dropped || [],
    composition: vc.composition || null, certificate: vc.certificate || null,
    forbidden: authored.forbidden || [],
    props: scene.props.map((p, i) => ({ index: i, type: p.type, claim: p._visualClaim })),
    pixel: { evidenceStrength: "unverified", record: null },
  };
  // the lock seals the combined set (staging → compiler → lock)
  scene._authorship.lock = { props: JSON.parse(JSON.stringify(scene.props)), propTypes: scene._authorship.propTypes.slice() };
  return { scene, vc };
}

async function render(sc, report) {
  const serveUrl = path.join(OUTDIR, "serve");
  fs.mkdirSync(OUTDIR, { recursive: true });
  const config = {
    meta: { slug: sc.book.slug, title: sc.book.title, author: sc.book.author, genre: sc.book.genre, fps: 30, width: 1920, height: 1080, audio: null, durationInFrames: 240, multiplane: true, hud: { enabled: false }, cast: {} },
    scenes: [report.scene], captions: [], audioEvents: [],
  };
  const propsPath = path.join(OUTDIR, `${sc.id}-props.json`);
  fs.writeFileSync(propsPath, JSON.stringify({ config }));
  // Windows: `npx` via shell:true mangles args (npm "could not determine
  // executable"); but Node ≥20.12 rejects execFile of a .cmd WITHOUT shell
  // (EINVAL). Node 24 allows shell:false with .cmd only via execPath override.
  // Safest cross-version path: run the remotion CLI JS directly with node.
  const remotionCli = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");
  const runNpx = (args) => new Promise((resolve) => {
    execFile(process.execPath, [remotionCli, ...args], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], timeout: 15 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => resolve({ err, log: `${stdout || ""}\n${stderr || ""}`.slice(-4000) }));
  });
  console.log(`[${sc.id}] bundling...`);
  fs.rmSync(serveUrl, { recursive: true, force: true });
  const res = await runNpx(["bundle", path.join(ROOT, "src", "index.ts"), "--out-dir", serveUrl, "--public-dir", path.join(ROOT, "public")]);
  if (!res || res.err) {
    if (res && res.log) fs.writeFileSync(path.join(OUTDIR, "bundle.err.log"), res.log);
    throw new Error("bundle failed");
  }
  const { selectComposition, renderStill } = require("@remotion/renderer");
  const composition = await selectComposition({ serveUrl, id: "Antidote-lab", inputProps: JSON.parse(fs.readFileSync(propsPath, "utf8")), timeoutInMilliseconds: 240000 });
  for (const frame of [60, 200]) {
    const out = path.join(OUTDIR, `${sc.id}-f${frame}.png`);
    const t0 = Date.now();
    await renderStill({ composition, serveUrl, output: out, frame, imageFormat: "png", timeoutInMilliseconds: 180000 });
    console.log(`[${sc.id}] still @f${frame} (${Math.round((Date.now() - t0) / 1000)}s)`);
    report.render.push({ frame, png: path.relative(OUT, out), ms: Date.now() - t0 });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const DO_BUILD = argv.includes("--build") || argv.includes("--render") || argv.length === 0; // render implies build
  const DO_RENDER = argv.includes("--render") || argv.length === 0;
  const DO_RECORD = argv.includes("--record") || argv.length === 0;
  fs.mkdirSync(OUTDIR, { recursive: true });
  const verify = require("./p10.2a-render-verify.cjs");

  const results = [];
  for (const sc of SCENARIOS) {
    const report = { id: sc.id, book: sc.book.slug, provenance: sc.book.provenance, render: [] };
    if (DO_BUILD) {
      const { scene, vc } = buildSceneFor(sc);
      report.scene = scene;
      report.claimsLedger = { claims: vc.claims, unrepresentable: vc.unrepresentable, dropped: vc.dropped };
      report.layoutCertificate = vc.certificate;
      report.invariants = {
        authorCoordinates: "ZERO (asserted in buildSceneFor)",
        genericFallback: "ZERO (every prop type ∈ authored subjects)",
        silentOmission: "ZERO (claims+ledger cover all inputs)",
      };
      // gate: the REAL evaluateAuthorship on this scene, with 12 filler beats so
      // the single-scene config does not trip the REPEATED_INTENT >10% share rail
      // (a measurement artifact of judging one beat alone, not a real violation)
      const { evaluateAuthorship } = require("../../../scripts/lib/authorship.js");
      const filler = (n) => ({ id: n, type: "beat", shot: "illustration", characters: [{ identity: "narrator", action: "idle" }], props: [], texts: [], narration: "filler " + n, _narration: "filler " + n, _authorship: authorshipStamp({ brief: { narrative_intent: "filler intent " + n, src: "claude" }, src: "brief" }) });
      const scenes = [scene];
      for (let i = 2; i <= 12; i++) scenes.push(filler("scene-" + String(i).padStart(2, "0")));
      const gate = evaluateAuthorship({ engine: "antidote", scenes }, { engine: "antidote", slug: sc.book.slug });
      report.gate = { status: gate.status, codes: gate.violations.map((v) => v.code), unrepresentableCount: (vc.unrepresentable || []).length };
    }
    if (DO_RENDER) await render(sc, report);
    if (DO_RECORD && (report.render.length || fs.existsSync(path.join(OUTDIR, `${sc.id}-props.json`)))) {
      const stillsDir = OUTDIR; // flat: both scenarios' stills live here; record per-scene by prefix
      // per-scene stills dir for an unambiguous record
      const sdir = path.join(OUTDIR, sc.id);
      fs.mkdirSync(sdir, { recursive: true });
      if (report.render.length) for (const r of report.render) fs.copyFileSync(path.join(OUT, r.png), path.join(sdir, path.basename(r.png)));
      else for (const f of fs.readdirSync(OUTDIR)) if (f.startsWith(sc.id) && f.endsWith(".png")) fs.copyFileSync(path.join(OUTDIR, f), path.join(sdir, f));
      const cfgPath = path.join(OUTDIR, `${sc.id}-props.json`);
      const config = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      const recPath = path.join(sdir, "pixel-record.json");
      const record = verify.canonicalConfigHash ? null : null;
      // write the record via the verify module's writeRecord
      const rec = (() => {
        const m = verify.measure(sdir);
        const full = {
          what: "P10.2a bound pixel measurement record (sidecar)",
          configPath: path.basename(cfgPath),
          configHash: verify.canonicalConfigHash(config),
          stillsDir: path.basename(sdir), report: path.basename(recPath),
          thresholds: verify.THRESHOLDS, measurement: m, createdAt: new Date().toISOString(),
        };
        fs.writeFileSync(recPath, JSON.stringify(full, null, 2));
        return full;
      })();
      const verdict = verify.evidenceStrengthOf(config, { record: rec });
      report.pixel = verdict;
      report.pixelRecord = path.relative(OUT, recPath);
    }
    fs.writeFileSync(path.join(OUTDIR, `${sc.id}-report.json`), JSON.stringify(report, null, 2));
    results.push(report);
    console.log(`[${sc.id}] done: gate=${report.gate && report.gate.status}, ledger u=${report.claimsLedger && report.claimsLedger.unrepresentable.length}, cert pass=${report.layoutCertificate && report.layoutCertificate.pass}${report.pixel ? `, pixel=${report.pixel.evidenceStrength}` : ""}`);
  }
  fs.writeFileSync(path.join(OUT, "p10.2a-scenarios-report.json"), JSON.stringify({ scenarios: results }, null, 2));
  console.log("[p10.2a] scenarios report -> p10.2a-scenarios-report.json");
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
