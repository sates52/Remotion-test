/**
 * p9b-render-smoke.cjs — P9-B.2a: PROPOSITION RENDERER SMOKE (the pixel proof).
 *
 * The P9-B stager (scripts/lib/proposition.js stageProposition) writes levers
 * into a scene config. P9-B.1 proved those levers exist in the SCHEMA; this
 * harness proves they reach PIXELS. One Remotion bundle of src/index.ts, then
 * paired stills of the-second-mountain (Antidote; committed config READ-ONLY —
 * every variant reaches the composition via selectComposition({inputProps}),
 * and renderStill then runs WITHOUT inputProps: @remotion/renderer 4.0.414
 * silently drops inputProps on an already-resolved composition, and the CLI
 * --props-file path renders defaultProps (runs 2/3/5/6 drew base pixels).
 * PNGs are scratch, never committed).
 *
 *   00 aa-control      the same config rendered twice → diff ≈ 0 (determinism)
 *   01 split           authored split seal + bg.split fields → two color fields
 *   02 flow            authored flow diagram → self-drawing graphic
 *   03 twoShot         two cast + authored twoShot seal → figures on BOTH sides
 *   04 perCast         face/action/holds levers on the staged cast member
 *   05 strike          style:"strike" vs "box" copy → the strike draws
 *   06 icon-empty      authored pole icon on an empty frame → drawn prop
 *
 * Each case also records the config-level `stagedPoles` verdict, so the pixel
 * claim and the gate's judge can be read side by side. Note: --props-file JSON
 * is read as UTF-8 by the CLI, so gb18030-terminals must use ASCII everywhere
 * (no ✓/✗/≥ literals in file bodies or strings).
 *
 * Usage: node audit/visionless-10x/p9b-render-smoke.cjs [--force] [--verdict-only]
 */
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const { decodePng, lumaOf } = require(path.join(__dirname, "..", "..", "scripts", "lib", "render-truth.js"));

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "p9b-smoke");
const P = require(path.join(ROOT, "scripts", "lib", "proposition.js"));

// The renderer's own enums (schema.ts) — the same sets plan-antidote hands the stager.
const EXPRESSIONS = new Set(["neutral", "happy", "sad", "surprised", "worried", "angry", "smirk", "blank", "afraid"]);
const ACTIONS = new Set(["idle", "talk", "point", "celebrate", "slump", "think", "walk", "sit", "hold", "reach", "lying", "collapsed", "falling", "fighting", "struggling", "grabbing"]);
const HAND_PROPS = new Set(["book", "phone", "key", "notes", "letter", "coin", "cup", "lightbulb", "mask", "photo", "mirror", "flower", "compass", "briefcase", "shield", "trophy", "hourglass", "sword", "target", "magnifier", "wallet", "gift", "zap", "laptop", "creditCard", "smartphone"]);
const { SCENE_ICONS } = require(path.join(ROOT, "scripts", "lib", "antidote-director.js"));
const CTX = { expressionEnum: EXPRESSIONS, actionEnum: ACTIONS, holdsEnum: HAND_PROPS, sceneIcons: SCENE_ICONS };

// -- Build the staged variants -----------------------------------------------
const book = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "the-second-mountain", "config.antidote.json"), "utf8"));
const SI = book.scenes.findIndex((s) => s.id === "scene-24"); // illustration, one everyman, walking, worried
if (SI < 0) { console.error("scene-24 not found"); process.exit(1); }
const baseScene = book.scenes[SI];
const FRAME = baseScene.fromFrame + Math.min(Math.round((baseScene.durationFrames || 240) * 0.62), (baseScene.durationFrames || 240) - 12);

/** author seal via the real contract path (normalize -> sealFor), then stage. */
function authorSeal({ relation, poles, representation = null, icon = null, perCast = [] }) {
  return P.sealFor(P.normalizeProposition({
    relation, poles, evidence: "p9b pixel smoke", src: "author",
    visual: { representation, icon, perCast },
  }).prop); // normalize returns a {ok, prop, errors} wrapper -- sealFor takes .prop
}
const clone = () => JSON.parse(JSON.stringify(book));

const scenarios = [];
const staged = {}; // name -> stageProposition/stagedPoles audit

function addScenario(name, mutate, { strip = false } = {}) {
  const config = clone();
  const s = config.scenes[SI];
  if (strip) { s.characters = []; s.props = []; delete s.concept; delete s.diagram; delete s.texts; }
  const audit = mutate ? mutate(s, config) : null;
  if (audit) staged[name] = audit;
  scenarios.push({ name, config, frame: FRAME });
}

// 00 -- A/A control: the SAME config twice. Any diff is renderer nondeterminism.
addScenario("00-aa-control-a", null);
addScenario("00-aa-control-b", null);

// 01 -- split: authored two-pole split; the split FIELD colors are the director's
// side of the same staging (Backdrop paints bg.split only under a split shot).
{
  const seal = authorSeal({
    relation: "contrast",
    poles: [{ text: "chosen work", status: "asserted" }, { text: "owed status", status: "rejected" }],
    representation: "split",
  });
  addScenario("01-split-two-poles", (s) => {
    const stage = P.stageProposition(seal, s, CTX);
    s.bg = { ...(s.bg || {}), split: ["#7FA8C9", "#E8B55A"] };
    return { seal, stage, poles: P.stagedPoles(s, { relation: "contrast", poles: seal.poles, visual: { representation: "split", icon: null, perCast: [] } }) };
  });
}

// 02 -- flow: authored cause->effect diagram (stageProposition writes it).
{
  const seal = authorSeal({
    relation: "cause_effect",
    poles: [{ text: "vows", status: "asserted" }, { text: "silence", status: "asserted" }],
    representation: "flow",
  });
  addScenario("02-flow-diagram", (s) => {
    const stage = P.stageProposition(seal, s, CTX);
    return { seal, stage, poles: P.stagedPoles(s, { relation: "cause_effect", poles: seal.poles, visual: { representation: "flow", icon: null, perCast: [] } }) };
  });
}

// 03 -- twoShot: authored casting (a second real cast member) + the twoShot seal.
{
  const seal = authorSeal({
    relation: "contrast",
    poles: [{ text: "the public self", status: "asserted" }, { text: "the private self", status: "rejected" }],
    representation: "twoShot",
    perCast: [{ entity: "everyman", face: "angry", action: "point", holds: null }, { entity: "tolstoy", face: "blank", action: "idle", holds: null }],
  });
  addScenario("03-two-shot-two-cast", (s) => {
    s.characters.push({ id: `${s.id}-smoke-1`, rig: "everyman", role: "everyman", identity: "tolstoy", enter: "fade", action: "idle", expression: "neutral" });
    const stage = P.stageProposition(seal, s, CTX);
    return { seal, stage, poles: P.stagedPoles(s, { relation: "contrast", poles: seal.poles, visual: { representation: "twoShot", icon: null, perCast: seal.perCast } }) };
  });
}

// 04 -- perCast face/action/holds on the EXISTING single cast member.
{
  const seal = authorSeal({
    relation: "contrast",
    poles: [{ text: "composure", status: "asserted" }, { text: "doubt", status: "rejected" }],
    perCast: [{ entity: "everyman", face: "angry", action: "point", holds: "compass" }],
  });
  addScenario("04-percast-levers", (s) => {
    const stage = P.stageProposition(seal, s, CTX);
    return { seal, stage, poles: P.stagedPoles(s, { relation: "contrast", poles: seal.poles, visual: { representation: null, icon: null, perCast: seal.perCast } }) };
  });
}

// 05 -- strike copy: the rejected pole's honest rendering vs plain box copy.
{
  addScenario("05-strike-copy", (s) => {
    s.texts.push({ text: "NOT THIS", style: "strike", at: 0, x: 960, y: 920, size: 88, enter: "pop", color: "#FFFFFF", boxColor: "#E23B57" });
    return { seal: null, stage: null, poles: null };
  });
  addScenario("05-strike-plain-twin", (s) => {
    s.texts.push({ text: "NOT THIS", style: "box", at: 0, x: 960, y: 920, size: 88, enter: "pop", color: "#FFFFFF", boxColor: "#E23B57" });
    return { seal: null, stage: null, poles: null };
  });
}

// 06 -- pole icon on an EMPTY frame (stripped scene): concept + drawn prop.
{
  const seal = authorSeal({
    relation: "contrast",
    poles: [{ text: "the wild call", status: "asserted" }, { text: "the safe answer", status: "rejected" }],
    icon: "compass",
  });
  addScenario("06-icon-empty-base", null, { strip: true });
  addScenario("06-icon-empty-staged", (s) => {
    const stage = P.stageProposition(seal, s, CTX);
    return { seal, stage, poles: P.stagedPoles(s, { relation: "contrast", poles: seal.poles, visual: { representation: "icon", icon: "compass", perCast: [] } }) };
  }, { strip: true });
}

// -- Pixel metrics (pure, from lib/render-truth's decoder) --------------------
const REGION = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 }); // fractions of W/H
function regionStats(img, reg) {
  const W = img.width, H = img.height;
  const x0 = Math.floor(reg.x0 * W), x1 = Math.floor(reg.x1 * W);
  const y0 = Math.floor(reg.y0 * H), y1 = Math.floor(reg.y1 * H);
  let n = 0, sum = 0, ink = 0, hEdge = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const v = img.luma[y * W + x];
      sum += v; n++;
      if (v < 90) ink++;
      if (x + 2 < W) hEdge += Math.abs(v - img.luma[y * W + x + 2]);
    }
  }
  return { meanLuma: sum / n, inkRatio: ink / n, hEdgeDensity: hEdge / n };
}
function meanAbsDiff(a, b, reg = REGION(0, 1, 0, 1)) {
  const W = a.width;
  const x0 = Math.floor(reg.x0 * W), x1 = Math.floor(reg.x1 * W);
  const y0 = Math.floor(reg.y0 * a.height), y1 = Math.floor(reg.y1 * a.height);
  let sum = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * W + x; sum += Math.abs(a.luma[i] - b.luma[i]); n++; }
  return sum / n;
}
function diffMask(a, b, t = 4) {
  // Pixels whose luma moved >= t, their bounding box, and the mean |dl| inside
  // that box. The 00 A/A control pins the noise floor at 0 changed pixels, so
  // this counts REAL drawn change where a frame-wide mean would dilute a
  // thin-stroke SVG hero or a figure-sized edit into oblivion (run-7 lesson:
  // 02-flow changed 11.1% of the frame yet scored only a 6.36 global mean).
  const W = a.width, H = a.height;
  let cnt = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (Math.abs(a.luma[i] - b.luma[i]) >= t) {
        cnt++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  let sum = 0, n = 0;
  if (cnt) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * W + x; sum += Math.abs(a.luma[i] - b.luma[i]); n++; }
  return { count: cnt, frac: cnt / (W * H), bbox: [x0, y0, x1, y1], bboxMean: n ? sum / n : 0 };
}
const load = (p) => { const img = decodePng(fs.readFileSync(p)); return { ...img, luma: lumaOf(img) }; };

// -- Render: ONE shared bundle, per-scenario still via the P9-A-proven CLI path
const FORCE = process.argv.includes("--force");
const VERDICT_ONLY = process.argv.includes("--verdict-only");
fs.mkdirSync(OUT, { recursive: true });
const PROPS_DIR = path.join(OUT, "props");
fs.mkdirSync(PROPS_DIR, { recursive: true });
const CONCURRENCY = 3;

async function main() {
  console.log(`[p9b-smoke] ${scenarios.length} stills, base frame ${FRAME} (scene-24 @ 62%), out ${path.relative(ROOT, OUT)}`);
  // P9-B.2a bundling: ONE `npx remotion bundle` up front. A node-API bundle()
  // pointed at via --serve-url makes EVERY CLI still re-copy the 1.6GB public/
  // dir (the run-3 stall); the CLI's own bundle copies public/ exactly once and
  // every still then launches straight from the same serve dir.
  if (!VERDICT_ONLY) console.log("[p9b-smoke] bundling via npx remotion bundle (one public/ copy) ...");
  const t0 = Date.now();
  const serveUrl = path.join(OUT, "serve");
  const runNpx = (args) => new Promise((resolve) => {
    execFile("npx", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", timeout: 15 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => resolve({ err, log: `${stdout || ""}\n${stderr || ""}`.slice(-4000) }));
  });
  if (!VERDICT_ONLY) {
    fs.rmSync(serveUrl, { recursive: true, force: true });
    const res = await runNpx(["remotion", "bundle", path.join(ROOT, "src", "index.ts"), "--out-dir", serveUrl, "--public-dir", path.join(ROOT, "public")]);
    if (!res || res.err) {
      console.error("[p9b-smoke] bundle FAILED (see audit/visionless-10x/p9b-smoke/bundle.err.log)");
      if (res && res.log) fs.writeFileSync(path.join(OUT, "bundle.err.log"), res.log);
      process.exit(1);
    }
  }
  if (!VERDICT_ONLY) console.log(`[p9b-smoke] bundled in ${Math.round((Date.now() - t0) / 1000)}s -> ${path.relative(ROOT, serveUrl)}`);

  for (const sc of scenarios) {
    sc.out = path.join(OUT, `${sc.name}.png`);
    sc.propsFile = path.join(PROPS_DIR, `${sc.name}.json`);
    fs.writeFileSync(sc.propsFile, JSON.stringify({ config: sc.config }));
  }

  if (VERDICT_ONLY) {
    // Re-score the run-7 PNGs without re-bundling/re-rendering: same metrics,
    // same thresholds, same report path. Missing PNG is a hard error -- verdicts
    // must come from real pixels, never a silent re-render.
    const missing = scenarios.filter((sc) => !fs.existsSync(sc.out));
    if (missing.length) { console.error(`[p9b-smoke] --verdict-only: missing PNGs, run the full smoke first: ${missing.map((s) => s.name).join(", ")}`); process.exit(1); }
    for (const sc of scenarios) sc.status = "exists";
  }

  // P9-B.2a render protocol (the hard-won one): inputProps are honored ONLY at
  // selectComposition in @remotion/renderer 4.0.414 — renderStill({inputProps})
  // over an already-resolved composition and the CLI's --props-file BOTH silently
  // render defaultProps (runs 2/3/5/6 all drew base pixels; the resolution probe
  // proved comp.props DOES carry the staged config). So: resolve each scenario
  // through selectComposition({inputProps}), then renderStill with NO inputProps.
  const { selectComposition, renderStill } = require("@remotion/renderer");
  let cursor = 0;
  const renderOne = async (sc) => {
    if (fs.existsSync(sc.out) && !FORCE) { console.log(`[p9b-smoke] ${sc.name}: exists, skip`); sc.status = "exists"; return; }
    const t = Date.now();
    try {
      const composition = await selectComposition({ serveUrl, id: "Antidote-the-second-mountain", inputProps: { config: sc.config }, timeoutInMilliseconds: 240000 });
      const resolved = composition.props && composition.props.config && composition.props.config.scenes.find((s) => s.id === "scene-24");
      const marker = resolved && (resolved.shot !== "illustration" || (resolved.bg && resolved.bg.split) || (resolved.characters || []).length !== 1 || (resolved.props || []).length) ? "staged" : "DEFAULT(!)";
      await renderStill({ composition, serveUrl, output: sc.out, frame: sc.frame, imageFormat: "png", timeoutInMilliseconds: 180000 });
      sc.status = "rendered";
      console.log(`[p9b-smoke] ${sc.name}: rendered f${sc.frame} in ${Math.round((Date.now() - t) / 1000)}s [resolved: ${marker}]`);
    } catch (err) {
      sc.status = "failed";
      fs.writeFileSync(sc.out.replace(/\.png$/, ".err.log"), String(err && err.stack || err).slice(-4000));
      console.error(`[p9b-smoke] ${sc.name}: FAILED -> ${sc.out.replace(/\.png$/, ".err.log")}`);
    }
  };

  await new Promise((done) => {
    let live = 0;
    const next = () => {
      while (live < CONCURRENCY && cursor < scenarios.length) { live++; const sc = scenarios[cursor++]; renderOne(sc).then(() => { live--; next(); }); }
      if (live === 0 && cursor >= scenarios.length) done();
    };
    next();
  });

  const failedRender = scenarios.filter((sc) => sc.status === "failed");
  if (failedRender.length) { console.error(`[p9b-smoke] render failures: ${failedRender.map((s) => s.name).join(", ")}`); process.exit(1); }

  // -- Verdicts ---------------------------------------------------------------
  const png = {};
  for (const sc of scenarios) png[sc.name] = load(sc.out);
  const results = [];
  const check = (name, label, value, pass, detail) => results.push({ name, label, value: Math.round(value * 1000) / 1000, pass, detail });

  // 00 A/A
  const aa = meanAbsDiff(png["00-aa-control-a"], png["00-aa-control-b"]);
  check("00-aa-control", "renderer determinism (same config twice)", aa, aa < 0.5, "mean abs luma diff must be ~0");

  // 01 split
  {
    const L = REGION(0.08, 0.42, 0.15, 0.85), R = REGION(0.58, 0.92, 0.15, 0.85);
    const lb = regionStats(png["00-aa-control-a"], L), rb = regionStats(png["00-aa-control-a"], R);
    const ls = regionStats(png["01-split-two-poles"], L), rs = regionStats(png["01-split-two-poles"], R);
    const d = meanAbsDiff(png["00-aa-control-a"], png["01-split-two-poles"]);
    const fieldBase = Math.abs(lb.meanLuma - rb.meanLuma);
    const fieldStaged = Math.abs(ls.meanLuma - rs.meanLuma);
    check("01-split", "staged split differs from base", d, d >= 8, ">=8 mean abs luma");
    check("01-split", "two color fields divide the frame", fieldStaged, fieldStaged >= 8, `L/R mean luma delta >=8 (base ${Math.round(fieldBase)})`);
    check("01-split", "field contrast GROWS vs base", fieldStaged - fieldBase, fieldStaged - fieldBase >= 4, "staged L/R delta minus base L/R delta >=4");
  }

  // 02 flow diagram. Run-7 post-mortem: the authored flow REDREW 11.1% of the
  // frame (230k px at |dl|>=4, mean 12.3 inside the change bbox) yet failed a
  // frame-wide mean>=8 and a whole-region edge-density ratio -- thin-stroke
  // SVG over a 2M-pixel frame dilutes both instruments. Recalibrated to the
  // change mask (A/A noise floor: 0): diagram-sized MASS + local MAGNITUDE.
  {
    const d = meanAbsDiff(png["00-aa-control-a"], png["02-flow-diagram"]);
    const m = diffMask(png["00-aa-control-a"], png["02-flow-diagram"], 4);
    check("02-flow", "staged flow redraws a diagram-sized region", m.frac, m.frac >= 0.02, `>=2% of the frame changed at |dl|>=4 (measured ${(m.frac * 100).toFixed(1)}%, ${m.count} px; whole-frame mean ${d.toFixed(2)}, info only)`);
    check("02-flow", "the redraw is concentrated line-work, not noise", m.bboxMean, m.bboxMean >= 6, `mean |dl| inside the change bbox >=6 (measured ${m.bboxMean})`);
  }

  // 03 twoShot: a figure on BOTH sides
  {
    const L = REGION(0.12, 0.45, 0.3, 0.9), R = REGION(0.55, 0.88, 0.3, 0.9);
    const ls = regionStats(png["03-two-shot-two-cast"], L), rs = regionStats(png["03-two-shot-two-cast"], R);
    const d = meanAbsDiff(png["00-aa-control-a"], png["03-two-shot-two-cast"]);
    check("03-twoShot", "staged twoShot differs from base", d, d >= 5, ">=5 mean abs luma");
    check("03-twoShot", "figure ink on the LEFT half", ls.inkRatio, ls.inkRatio >= 0.005, "dark-pixel ratio >=0.5%");
    check("03-twoShot", "figure ink on the RIGHT half", rs.inkRatio, rs.inkRatio >= 0.005, "dark-pixel ratio >=0.5%");
  }

  // 04 perCast levers. Run-7 post-mortem: walk/worried -> point/angry + compass
  // REDREW 3.2% of the frame (66k px at |dl|>=4, mean 14.9, bbox = the figure:
  // x 169-540 / y 348-971) yet a frame-wide mean>=3 fails because one figure is
  // ~3% of the pixels. Recalibrated to the change mask (A/A floor: 0).
  {
    const d = meanAbsDiff(png["00-aa-control-a"], png["04-percast-levers"]);
    const m = diffMask(png["00-aa-control-a"], png["04-percast-levers"], 4);
    check("04-perCast", "face/action/holds levers redraw the figure", m.frac, m.frac >= 0.005 && m.bboxMean >= 8, `>=0.5% of the frame changed at |dl|>=4 AND bbox mean >=8 (measured ${(m.frac * 100).toFixed(2)}% @ ${m.bboxMean}; whole-frame mean ${d.toFixed(2)}, info)`);
  }

  // 05 strike. Run-7 post-mortem: the old band (y 0.76-0.98) was mis-scoped --
  // KineticText bottom-anchors a LOW callout above the caption band, so the
  // "NOT THIS" block draws around y ~0.40-0.53H; the band caught only its
  // bottom 34px (1.13). The change mask finds the real edit: 4.0% of the
  // frame, mean 61.5 inside a 543x183 text-block bbox. (A/A floor: 0.)
  {
    const m = diffMask(png["05-strike-plain-twin"], png["05-strike-copy"], 4);
    check("05-strike", "strike treatment redraws the callout block", m.bboxMean, m.frac >= 0.01 && m.bboxMean >= 20, `>=1% of the frame changed at |dl|>=4 AND bbox mean >=20 (measured ${(m.frac * 100).toFixed(1)}% @ ${m.bboxMean}, bbox ${m.bbox.join("/")})`);
  }

  // 06 icon on empty frame
  {
    const d = meanAbsDiff(png["06-icon-empty-base"], png["06-icon-empty-staged"]);
    const M = REGION(0.4, 0.85, 0.15, 0.75);
    const ms = regionStats(png["06-icon-empty-staged"], M), mb = regionStats(png["06-icon-empty-base"], M);
    check("06-icon", "authored pole icon reaches the empty frame", d, d >= 5, ">=5 mean abs luma vs stripped base");
    check("06-icon", "the icon's line-work lands in the motif zone", ms.hEdgeDensity - mb.hEdgeDensity, ms.hEdgeDensity > mb.hEdgeDensity + 0.5, `motif-zone h-edge density rises (base ${mb.hEdgeDensity.toFixed(2)} -> ${ms.hEdgeDensity.toFixed(2)})`);
  }

  const failed = results.filter((r) => !r.pass);
  const report = {
    what: "P9-B.2a proposition renderer pixel smoke -- staging levers reach pixels",
    instrument: "lever checks use the change mask (|dl|>=4; the 00 A/A control pins the floor at 0 changed px) -- changed-pixel mass + local magnitude, not frame-wide mean luma, which dilutes thin-stroke SVG and figure-sized edits (run-7 post-mortem)",
    book: "the-second-mountain (READ-ONLY; variants via --props-file inputProps.config)",
    baseScene: "scene-24 (illustration, everyman)",
    frame: FRAME,
    staged: staged,
    metrics: results,
    verdict: failed.length ? "FAIL" : "PASS",
  };
  fs.writeFileSync(path.join(__dirname, "p9b-pixel-smoke.json"), JSON.stringify(report, null, 2));
  for (const r of results) console.log(`  ${r.pass ? "PASS" : "FAIL"} [${r.name}] ${r.label} -- ${r.value}${r.pass ? "" : "  (" + r.detail + ")"}`);
  console.log(`P9B PIXEL SMOKE: ${results.length - failed.length}/${results.length} checks passed -> ${report.verdict}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => { console.error("smoke failed:", err); process.exit(1); });
