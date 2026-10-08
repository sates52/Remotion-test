#!/usr/bin/env node
/**
 * p10.1-driver.cjs — P10.1: beat #029, end to end (operator scope, 2026-10-08).
 *
 * Scope: ONLY Into the Wild beat #029 ("storm → flash flood in the washes"),
 * in an ISOLATED fixture (p10.1-fixture.json) carrying the book's OWN world,
 * palette and provenance. The production books/into-the-wild/config.antidote.json
 * and the TSM pilot shell are untouched. Live pipeline behavior unchanged.
 *
 * What it does:
 *   --build    compile the authored visual plan into a renderer-scene via the
 *              REAL staging primitives (stageProposition from scripts/lib/
 *              proposition.js + the renderer's own enums), judged by the FROZEN
 *              contract (stagedPoles) — the live gate's own judge. No schema
 *              violations, no synthetic staging beyond what the stager writes.
 *   --verify   frozen-contract verification only (no render).
 *   --render   one `npx remotion bundle` into p10/serve, then renderStill of
 *              the single scene at two frames (pilot P9-B.2a protocol:
 *              inputProps honored ONLY at selectComposition). Composition id:
 *              "Antidote-lab" used as a bare doorway — inputProps fully replace
 *              defaultProps, so no TSM or lab content can leak into the pixels.
 *   --capabilities  the renderer capability inventory for THIS beat (what the
 *              engine can and cannot draw today) — the UNREPRESENTABLE evidence.
 *
 * PNGs and the serve dir are scratch (gitignored); the fixture, the driver,
 * the capability report and the commit are the artifacts.
 */
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const OUT = path.join(__dirname);
const FIXTURE = JSON.parse(fs.readFileSync(path.join(OUT, "p10.1-fixture.json"), "utf8"));
const P = require(path.join(ROOT, "scripts", "lib", "proposition.js"));
const { SCENE_ICONS } = require(path.join(ROOT, "scripts", "lib", "antidote-director.js"));
const screenText = require(path.join(ROOT, "scripts", "lib", "screen-text.js"));
const { expression: expressionEnum, charAction, handProp, shotName } = require(path.join(ROOT, "src", "engines", "antidote", "schema.ts"));

const CTX = {
  expressionEnum: new Set(expressionEnum.options),
  actionEnum: new Set(charAction.options),
  holdsEnum: new Set(handProp.options),
  sceneIcons: SCENE_ICONS,
};
const SHOT_NAMES = new Set(shotName.options);

const DUR = FIXTURE.scene.durationFrames; // 240 frames ≈ 8s of narration
const WORLD = FIXTURE.world;

/** tokens minus filler — mirrors the contract's content filter (report-only). */
const FILLER = new Set(["the", "a", "an", "of", "it", "is", "was", "in", "on", "to", "and", "or", "for", "with", "his", "her", "their", "its", "that", "this", "not"]);
const content = (t) => screenText.tokens(String(t || "")).filter((w) => !FILLER.has(w) && w.length > 1);

// ── build ────────────────────────────────────────────────────────────────────
function buildScene() {
  const scene = {
    id: "itw-029-visual",
    type: "illustration",
    fromFrame: 0,
    durationFrames: DUR,
    shot: FIXTURE.scene.shot, // "beforeAfter" — the author's two-pole composition
    characters: [], // castRemoved: the author's cast decision — weather needs nobody
    props: [],
    texts: [],
    bg: {
      type: "gradient",
      colors: ["#5E6B78", "#8A7A5E"], // storm sky → baked earth
      set: FIXTURE.scene.set, // "horizon" — desert floor + distant landforms
      texture: "grain",
      accent: WORLD.palette.ink,
    },
    // The engine's only per-scene accent lever (Scene.tsx: accent =
    // transition.color || bg.accent). ITW water blue — the flood's waves and
    // the descent arrow read as WATER, not as dark ink on dark ground.
    transition: { type: "cut", frames: 0, color: WORLD.palette.water },
  };

  // 1) The scene's own pictorial material — the authored visual plan, compiled
  //    onto the renderer's OWN levers. The fixture's prop list is the single
  //    source of truth; the driver only stamps palette colors.
  scene.props = FIXTURE.scene.props.map((p) => ({ ...p }));
  scene.props.push({ ...FIXTURE.scene.descentArrow });

  // 2) The author's proposition, sealed and staged by the REAL stager.
  const norm = P.normalizeProposition({
    relation: FIXTURE.proposition.relation,
    poles: FIXTURE.proposition.poles,
    evidence: FIXTURE.proposition.evidence,
    src: "author",
    visual: {
      representation: FIXTURE.contract.representation, // "beforeAfter"
      icon: FIXTURE.contract.visualIcon, // null — the picture plan is per-pole props
      perCast: FIXTURE.contract.perCast,
    },
  });
  if (!norm.ok) {
    console.error("[p10.1] proposition normalize FAILED:", norm.errors);
    process.exit(1);
  }
  const seal = P.sealFor(norm.prop);
  const stage = P.stageProposition(seal, scene, CTX);

  // 3) The frozen contract's own judge, on the exact scene that will render.
  const propForGate = {
    relation: seal.relation,
    poles: seal.poles,
    evidence: null,
    visual: { representation: seal.representation, icon: seal.icon, perCast: seal.perCast },
    src: "author",
  };
  const verdict = P.stagedPoles(scene, propForGate);

  // per-pole evidence accounting (report-only)
  const identities = new Set(scene.characters.map((c) => c && c.identity).filter(Boolean));
  const evidenceOf = (pole) => {
    if (pole.entity && identities.has(pole.entity)) return "entity";
    if (pole.text && scene.props.some((p) => p.type === pole.text)) return "pole-icon"; // storm === storm
    if (pole.text && scene.props.some((p) => p.type === "water") && /flood|water|wash/i.test(pole.text)) return "pictorial (water prop; no verbatim pole-icon binding)";
    if (scene.shot === "beforeAfter" && seal.representation === "beforeAfter") return "composition-bound (authored beforeAfter carrying the scene's own poles)";
    return "none";
  };
  const evidence = FIXTURE.proposition.poles.map((pole) => ({
    pole: pole.text,
    state: (verdict.verdicts.find((v) => v.pole === pole.text) || {}).state,
    evidence: evidenceOf(pole),
  }));

  return { scene, seal, stage, verdict, evidence };
}

// ── capabilities: what THIS renderer can and cannot draw for #029 ────────────
function capabilities() {
  const sets = ["none", "horizon", "office", "street", "room", "stage", "sky", "abstract", "kitchen", "bedroom", "classroom", "library", "cafe", "hospital", "court", "forest", "shore", "highway", "workstation", "startupGarage", "serverRoom", "pitchStage", "agora", "colonnade", "court", "cave", "shipDeck", "manuscript", "mountainSlope"];
  const has = (arr, x) => arr.includes(x);
  const levers = {
    set_enum_size: 26,
    sets_with_desert_or_mountain: has(sets, "desert") || has(sets, "mountain") || has(sets, "arroyo"),
    closest_set: "horizon (generic landform); mountainSlope exists but only via a book's own world declaration (Camus), and it is a slope, not a desert wash",
    storm_icon: has(SCENE_ICONS, "storm"),
    water_icon: has(SCENE_ICONS, "water"),
    lightning_as_separate_icon: has(SCENE_ICONS, "lightning"),
    lightning_in_storm_icon: "inside the storm icon (rain strokes + flickering bolt)",
    flood_state_machine: false, // no prop type models dry → surging across states
    flood_descent_composition: "authored x/y: storm icon high-left, water prop low, arrow between — the cause→effect descent as a composition of existing icons",
    per_pole_icons: "single visual.icon in the frozen proposition contract (poleIconOwners strict verbatim); two different pole→icon mappings need per-pole icons",
    diagram_flow: "flow diagram = two LABELLED CIRCLES + traveling token; the narrator's own pictures are absent (the P10 root cause, unchanged)",
    beforeAfter_shot: "two icon slots + arrow, dropsCast — carries the poles pictorially only if the scene's props state them",
    custom_svg: "per-book customSvg (schema propSchema.customSvg) — static paths only, one box, no frame-driven animation, no multi-state flood",
  };
  const unrepresentable = [
    "a true desert/arroyo SET (no set in the 26-set enum says 'dry desert wash'; 'horizon' is the closest generic landform)",
    "rain→runoff CAUSALITY inside one object: no prop models water GATHERING and surging down a channel (the storm icon rains; the water icon surges; nothing joins them causally in ONE object)",
    "per-pole icon bindings in the proposition contract (one visual.icon, verbatim-only)",
  ];
  return { levers, unrepresentable, verdict: "REPRESENTABLE_WITH_AUTHORED_COMPOSITION (within the frozen schema; no renderer code changed)" };
}

// ── render (pilot protocol) ──────────────────────────────────────────────────
async function render(sceneReport) {
  const OUTDIR = path.join(OUT, "p10.1-render");
  const serveUrl = path.join(OUTDIR, "serve");
  fs.mkdirSync(OUTDIR, { recursive: true });
  const world = FIXTURE.world;

  const config = {
    meta: {
      slug: "into-the-wild",
      title: world.title,
      author: world.author,
      genre: "nonfiction",
      fps: 30,
      width: 1920,
      height: 1080,
      audio: null, // isolated fixture: no narration audio file loaded
      durationInFrames: DUR,
      multiplane: true,
      hud: { enabled: false },
      cast: world.cast,
    },
    scenes: [sceneReport.scene],
    captions: [], // MUTED semantic view: zero captions — the muted rule
    audioEvents: [],
  };

  const propsPath = path.join(OUTDIR, "p10.1-props.json");
  fs.writeFileSync(propsPath, JSON.stringify({ config }));

  const runNpx = (args) => new Promise((resolve) => {
    execFile("npx", args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", timeout: 15 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => resolve({ err, log: `${stdout || ""}\n${stderr || ""}`.slice(-4000) }));
  });

  console.log("[p10.1] bundling via npx remotion bundle ...");
  fs.rmSync(serveUrl, { recursive: true, force: true });
  const res = await runNpx(["remotion", "bundle", path.join(ROOT, "src", "index.ts"), "--out-dir", serveUrl, "--public-dir", path.join(ROOT, "public")]);
  if (!res || res.err) {
    console.error("[p10.1] bundle FAILED");
    if (res && res.log) fs.writeFileSync(path.join(OUTDIR, "bundle.err.log"), res.log);
    process.exit(1);
  }
  console.log(`[p10.1] bundled -> ${path.relative(ROOT, serveUrl)}`);

  const { selectComposition, renderStill } = require("@remotion/renderer");
  // P9-B.2a protocol: inputProps honored ONLY at selectComposition.
  const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
  // "Antidote-lab" is a BARE DOORWAY: duration/fps/size match, and inputProps
  // fully REPLACE defaultProps — no lab or TSM content reaches the pixels.
  const composition = await selectComposition({ serveUrl, id: "Antidote-lab", inputProps, timeoutInMilliseconds: 240000 });
  const frames = [60, 200]; // mid-storm and late-beat (bolt flicker / flood surge visible)
  for (const frame of frames) {
    const out = path.join(OUTDIR, `itw-029-f${frame}.png`);
    const t = Date.now();
    await renderStill({ composition, serveUrl, output: out, frame, imageFormat: "png", timeoutInMilliseconds: 180000 });
    console.log(`[p10.1] still @f${frame} -> ${path.relative(ROOT, out)} (${Math.round((Date.now() - t) / 1000)}s)`);
    sceneReport.render.push({ frame, png: path.relative(OUT, out), ms: Date.now() - t });
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2);
  const DO_BUILD = argv.includes("--build") || argv.length === 0;
  const DO_RENDER = argv.includes("--render") || argv.length === 0;
  const DO_CAPS = argv.includes("--capabilities");

  const caps = capabilities();
  const sceneReport = { render: [] };
  let built = null;

  if (DO_BUILD || DO_RENDER) {
    built = buildScene();
    sceneReport.scene = built.scene;
    sceneReport.stage = built.stage;
    sceneReport.verdict = built.verdict;
    sceneReport.evidence = built.evidence;
    console.log(`[p10.1] staged: ${JSON.stringify(built.stage.staged)}`);
    console.log(`[p10.1] skipped: ${JSON.stringify(built.stage.skipped)}`);
    console.log(`[p10.1] contract verdict: twoSided=${built.verdict.twoSided} unstaged=${built.verdict.unstaged} poleViolation=${built.verdict.poleViolation}`);
    for (const e of built.evidence) console.log(`[p10.1]   ${e.pole} -> ${e.state} (${e.evidence})`);
  }

  if (DO_CAPS || argv.length === 0) {
    fs.writeFileSync(path.join(OUT, "p10.1-capabilities.json"), JSON.stringify(caps, null, 2));
    console.log(`[p10.1] capability report -> p10.1-capabilities.json`);
  }

  if (DO_RENDER) await render(sceneReport);

  if (DO_BUILD || DO_RENDER) {
    const report = {
      what: "P10.1 beat #029 — the authored visual plan reached pixels (isolated ITW fixture)",
      fixture: "p10.1-fixture.json",
      world: { slug: WORLD.slug, palette: WORLD.palette, provenance: WORLD.provenance },
      build: { staged: built.stage.staged, skipped: built.stage.skipped },
      contract: { twoSided: built.verdict.twoSided, unstaged: built.verdict.unstaged, poleViolation: built.verdict.poleViolation, verdicts: built.verdict.verdicts, evidence: built.evidence },
      capabilities: caps,
      render: sceneReport.render,
    };
    fs.writeFileSync(path.join(OUT, "p10.1-report.json"), JSON.stringify(report, null, 2));
    console.log("[p10.1] report -> p10.1-report.json");
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
module.exports = { buildScene, capabilities };
