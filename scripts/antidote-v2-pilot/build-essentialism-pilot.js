#!/usr/bin/env node
/**
 * build-essentialism-pilot.js — Book 3 ("Essentialism") Antidote 10x Light-Polarity Pilot
 * using `kinfolkMinimal` Style Pack (ivoryBroadsheet / sageBotanical / terracottaStudio)
 * + all 6 NEW storytelling devices + CutoutStage book-specific animated characters.
 *
 * Slices (from public/captions/essentialism-the-disciplined-pursuit-of-less.vtt @ 30fps):
 *   Slice 1: 120.0s – 170.0s (50s = 1500 frames, 0..1499)
 *   Slice 2: 720.0s – 770.0s (50s = 1500 frames, 1500..2999)
 *   Slice 3: 1380.0s – 1430.0s (50s = 1500 frames, 3000..4499)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { parseWords, buildCaptions } = require("../lib/vtt");
const { assertVariety } = require("../lib/v2-variety-lint");
const { toArtDirection } = require("../lib/style-packs");

const ROOT = path.resolve(__dirname, "..", "..");
const MAIN_VTT = "C:/Users/savas/Cursor/Remotion/test/public/captions/essentialism-the-disciplined-pursuit-of-less.vtt";
const esbuild = require(path.join(ROOT, "node_modules", "esbuild"));

const tmpOut = path.join(os.tmpdir(), `antidote-v2-schema-${Date.now()}.cjs`);
esbuild.buildSync({
  entryPoints: [path.join(ROOT, "src/engines/antidote/schema.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: tmpOut,
  external: ["react", "remotion"],
});
const { antidoteConfigSchema } = require(tmpOut);
try { fs.unlinkSync(tmpOut); } catch {}

const img = (id) => `scenes/essentialism-10x-pilot/${id}.png`;

const allWords = parseWords(fs.readFileSync(MAIN_VTT, "utf8"));
const fixWord = (w) => (w === "highle" ? "high-level" : w === "fourburner" ? "four-burner" : w);

const slices = [
  [120, 170, 0],
  [720, 770, 1500],
  [1380, 1430, 3000],
];

const captions = [];
for (const [s0, s1, baseFrame] of slices) {
  const sliceWords = allWords
    .filter((w) => w.t >= s0 && w.t < s1)
    .map((w) => ({
      w: fixWord(w.w),
      t: w.t - s0,
      end: Math.min(w.end, s1) - s0,
    }));
  for (const c of buildCaptions(sliceWords, 30)) {
    captions.push({
      text: c.text,
      startFrame: baseFrame + c.startFrame,
      endFrame: baseFrame + c.endFrame,
      words: c.words.map((wd) => ({
        w: wd.w,
        s: baseFrame + wd.s,
        e: baseFrame + wd.e,
      })),
    });
  }
}

const config = {
  meta: {
    slug: "essentialism-10x-pilot",
    title: "Essentialism: The Disciplined Pursuit of Less",
    author: "Greg McKeown",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 4500,
    flow: 1,
    multiplane: true,
    artDirection: toArtDirection("kinfolkMinimal"),
    take: {
      note: "High-level execution is not an addition problem — it is the disciplined subtraction of everything non-essential.",
    },
  },
  captions,
  scenes: [
    // ── SLICE 1 (0..1500, 50s @ 120..170s) ──────────────────────────────────
    {
      id: "es1-b1-subtraction-manifesto",
      fromFrame: 0,
      durationFrames: 495,
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: { type: "flat", colors: ["#FAF7F0"], set: "none", texture: "none", stageMood: "ivoryBroadsheet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "manifesto",
        subject: "addition vs subtraction problem",
        action: "kineticManifesto strikes through ADDITION on cue and reveals SUBTRACTION",
        payoff: "anchors the book's core mental-model flip with zero clutter",
        revealFrame: 440,
      },
      kineticManifesto: {
        kicker: "THE CORE REFRAME",
        lines: [
          { text: "PRODUCTIVITY BY ADDITION", strikeAt: 410, at: 30 },
          { text: "EXECUTION BY SUBTRACTION", emphasis: true, tone: "accent", at: 430 },
        ],
        divider: "line",
        footnote: "Doing more meetings, side hustles, and projects is the trap.",
        footnoteAt: 245,
      },
    },
    {
      id: "es1-b2-carving-away",
      fromFrame: 495,
      durationFrames: 405,
      shot: "insert",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#EDF2EB"], set: "none", texture: "none", stageMood: "sageBotanical" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "document-quote",
        subject: "sculptor carving away the non-essential",
        action: "asymmetric editorialSpread pairs chisel art with highlighted oxygen quote",
        payoff: "makes subtraction feel tangible and deliberate",
        revealFrame: 130,
      },
      editorialSpread: {
        image: img("e1_marble_chisel"),
        mediaSide: "left",
        kicker: "THE DISCIPLINED PURSUIT",
        headline: "Carve Away Everything Else",
        quote: "Carving away the non-essential stuff just so the absolute essential thing actually has the oxygen to survive.",
        highlightPhrases: [
          { text: "non-essential stuff", at: 165 },
          { text: "oxygen to survive", at: 335 },
        ],
        attribution: "Essentialism · Greg McKeown",
      },
    },
    {
      id: "es1-b3-tetris-overload",
      fromFrame: 900,
      durationFrames: 600,
      shot: "insert",
      transition: { type: "zoomPush", frames: 12 },
      bg: { type: "flat", colors: ["#F5E9DC"], set: "none", texture: "none", stageMood: "terracottaStudio" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "cutout-drama",
        subject: "overwhelmed worker buried in Slack and Tetris calendar blocks",
        action: "cutoutStage animates illustrated character slumping as cutout stack & task cards drop in",
        payoff: "shows 10 AM overload in the book's exact watercolor world",
        revealFrame: 330,
      },
      cutoutStage: {
        backdrop: { image: img("e1_sunlit_desk_stage"), dim: 0.08, kenBurns: "pushIn" },
        banner: { text: "10:00 A.M. · THE EVERYDAY REALITY", at: 145 },
        actors: [
          {
            id: "worker",
            image: img("e1_char_overwhelmed"),
            x: 680,
            y: 590,
            width: 340,
            height: 540,
            enter: "left",
            at: 20,
            action: "overwhelmed",
            actionAt: 330,
            says: { text: "Lit up like a Christmas tree!", at: 420, side: "left", tone: "danger" },
          },
        ],
        props: [
          { image: img("e1_prop_tetris_stack"), x: 1250, y: 510, width: 320, fromX: 1250, fromY: -120, at: 320 },
          { label: "SLACK CHANNEL", sublabel: "42 unread threads", x: 1520, y: 310, fromX: 1520, fromY: -60, rot: 2.0, tone: "danger", at: 335 },
          { label: "TEAMS DASHBOARD", sublabel: "Back-to-back calls", x: 1540, y: 460, fromX: 1540, fromY: -60, rot: -1.5, tone: "accent", at: 380 },
          { label: "TETRIS CALENDAR", sublabel: "Blocks falling fast", x: 1520, y: 615, fromX: 1520, fromY: -60, rot: 1.5, tone: "danger", at: 545 },
        ],
        callout: "Your calendar looks like a high-speed game of Tetris.",
        calloutAt: 495,
      },
    },

    // ── SLICE 2 (1500..3000, 50s @ 720..770s) ────────────────────────────────
    {
      id: "es2-b1-paradox-tree",
      fromFrame: 1500,
      durationFrames: 525,
      shot: "insert",
      transition: { type: "blurCut", frames: 12 },
      bg: { type: "flat", colors: ["#FAF7F0"], set: "none", texture: "none", stageMood: "ivoryBroadsheet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "decision-tree",
        subject: "Paradox of Success 4 phases",
        action: "decisionTree branches into diffused efforts and prunes them on cue",
        payoff: "makes the Paradox of Success causal chain immediately clear",
        revealFrame: 340,
      },
      decisionTree: {
        title: "THE PARADOX OF SUCCESS",
        subtitle: "How winning creates the exact distractions that undermine clarity",
        root: { label: "Phase 1 · Success", sublabel: "Clear focus brings results" },
        branches: [
          { label: "Phase 2 · Flood of Options", sublabel: "Committees & side projects", outcome: "Popular at first", tone: "accent", at: 20, pruneAt: 340 },
          { label: "Phase 3 · Diffused Efforts", sublabel: "Spread incredibly thin", outcome: "Nothing done well", tone: "danger", at: 290, pruneAt: 380 },
          { label: "Phase 4 · Core Clarity", sublabel: "Protect what made you win", outcome: "Sustained Mastery", tone: "positive", at: 180, winner: true },
        ],
        callout: "Doing everything well is a myth — protect your core competency.",
        calloutAt: 410,
      },
    },
    {
      id: "es2-b2-desk-brackets",
      fromFrame: 2025,
      durationFrames: 390,
      shot: "insert",
      transition: { type: "slideCarryUp", frames: 12 },
      bg: { type: "flat", colors: ["#EDF2EB"], set: "none", texture: "none", stageMood: "sageBotanical" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "annotate-place",
        subject: "cluttered desk of diffused commitments",
        action: "annotatedScene uses crisp architectural corner brackets (zero circles)",
        payoff: "pinpoints how success-driven clutter buries core competency",
        revealFrame: 120,
      },
      annotatedScene: {
        image: img("e2_cluttered_desk"),
        framing: "editorialPrint",
        markerStyle: "bracket",
        kenBurns: "pushIn",
        dim: 0.04,
        banner: { text: "PHASE 4 · DISTRACTED FROM THE CORE", at: 20 },
        spotlights: [
          {
            cx: 960,
            cy: 470,
            rx: 210,
            ry: 150,
            label: "CORE COMPETENCY",
            note: "Buried under new options",
            labelX: 1680,
            labelY: 360,
            tone: "danger",
            at: 110,
          },
        ],
        stickers: [
          {
            title: "CLARITY UNDERMINED",
            subtitle: "Your own success created the noise",
            icon: "eye",
            x: 225,
            y: 520,
            rot: 0,
            tone: "accent",
            at: 210,
          },
        ],
      },
    },
    {
      id: "es2-b3-mentor-dialogue",
      fromFrame: 2415,
      durationFrames: 585,
      shot: "insert",
      transition: { type: "zoomPull", frames: 12 },
      bg: { type: "flat", colors: ["#FAF7F0"], set: "none", texture: "none", stageMood: "ivoryBroadsheet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "cutout-drama",
        subject: "young professional vs mentor on go-to person trap",
        action: "two book-specific watercolor cutouts converse with word-synced speech bubbles",
        payoff: "brings back recurring characters inside the book's exact art world",
        revealFrame: 500,
      },
      cutoutStage: {
        backdrop: { image: img("e2_studio_lounge_stage"), dim: 0.06, kenBurns: "pullOut" },
        banner: { text: "THE GO-TO PERSON ILLUSION", at: 20 },
        actors: [
          {
            id: "young_pro",
            image: img("e1_char_overwhelmed"),
            x: 560,
            y: 585,
            width: 320,
            height: 520,
            enter: "left",
            at: 10,
            action: "leanIn",
            actionAt: 130,
            says: { text: "Isn't being the go-to person ultimate job security?", at: 130, side: "right", tone: "accent" },
          },
          {
            id: "mentor",
            image: img("e2_char_mentor"),
            x: 1360,
            y: 585,
            width: 330,
            height: 540,
            flip: true,
            enter: "right",
            at: 30,
            action: "calm",
            actionAt: 495,
            says: { text: "Because it is a complete trap.", at: 495, side: "left", tone: "danger" },
          },
        ],
        callout: "Being indispensable for everything prevents you from doing what matters most.",
        calloutAt: 520,
      },
    },

    // ── SLICE 3 (3000..4500, 50s @ 1380..1430s) ──────────────────────────────
    {
      id: "es3-b1-tradeoff-scale",
      fromFrame: 3000,
      durationFrames: 645,
      shot: "insert",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#F5E9DC"], set: "none", texture: "none", stageMood: "terracottaStudio" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "tradeoff-scale",
        subject: "terrifying trade-off: revenue loss vs customer trust",
        action: "balanceScale tips decisively toward unimpeachable integrity as weights land",
        payoff: "shows trade-offs are choosing which problem you want",
        revealFrame: 420,
      },
      balanceScale: {
        title: "CHOOSING YOUR PROBLEM",
        subtitle: "Every real trade-off forces a choice between two hard realities",
        leftLabel: "SHORT-TERM PAIN",
        rightLabel: "LONG-TERM INTEGRITY",
        leftWeights: [
          { label: "Massive Revenue Loss", sublabel: "Explaining to angry shareholders", weight: 1.2, tone: "danger", at: 440 },
        ],
        rightWeights: [
          { label: "Unimpeachable Integrity", sublabel: "Refused compromised safety", weight: 1.6, tone: "positive", at: 145 },
          { label: "Saved Brand Trust Forever", sublabel: "Decisive leadership under fire", weight: 1.4, tone: "positive", at: 240 },
        ],
        verdict: "They knew exactly which problem they wanted.",
        verdictAt: 335,
      },
    },
    {
      id: "es3-b2-integrity-spread",
      fromFrame: 3645,
      durationFrames: 255,
      shot: "insert",
      transition: { type: "blurCut", frames: 12 },
      bg: { type: "flat", colors: ["#FAF7F0"], set: "none", texture: "none", stageMood: "ivoryBroadsheet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "document-quote",
        subject: "boardroom vs living room trade-off",
        action: "editorialSpread bridges corporate integrity to everyday personal choices",
        payoff: "replaces boxed quote card with clean full-bleed magazine layout",
        revealFrame: 60,
      },
      editorialSpread: {
        image: img("e3_pharmacy_integrity"),
        mediaSide: "right",
        kicker: "FROM BOARDROOM TO LIVING ROOM",
        headline: "Which Problem Do You Want?",
        points: [
          { label: "Decisive Elimination", detail: "Say no to good options to protect the vital few", at: 30, tone: "positive" },
          { label: "Personal Trade-Offs", detail: "Where we struggle most in daily life", at: 130, tone: "accent" },
        ],
        attribution: "Essentialism · Trade-Offs",
      },
    },
    {
      id: "es3-b3-four-burners",
      fromFrame: 3900,
      durationFrames: 600,
      shot: "insert",
      transition: { type: "zoomPush", frames: 12 },
      bg: { type: "flat", colors: ["#EDF2EB"], set: "none", texture: "none", stageMood: "sageBotanical" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "burner-grid",
        subject: "Four-Burner Stove analogy",
        action: "stackReveal burners dial down Friends and Health on cue, then challenge the cliche",
        payoff: "visualizes the four-burner stove dynamically in 2x2 dials",
        revealFrame: 420,
      },
      stackReveal: {
        variant: "burners",
        title: "THE FOUR-BURNER STOVE ANALOGY",
        subtitle: "Your life has four burners — the cliché says you must shut them down",
        items: [
          { label: "WORK", detail: "Career & output", level: 0.9, tone: "accent" },
          { label: "FAMILY", detail: "Home & loved ones", level: 0.85, tone: "positive" },
          { label: "FRIENDS", detail: "Social circle", level: 0.75, targetLevel: 0.0, changeAt: 420, tone: "accent" },
          { label: "HEALTH", detail: "Sleep & vitality", level: 0.8, targetLevel: 0.0, changeAt: 490, tone: "danger" },
        ],
        callout: "Turn off 1 to succeed, 2 for a billionaire — I refuse to accept that.",
        calloutAt: 530,
      },
    },
  ],
};

const parsed = antidoteConfigSchema.parse(config);
const varietyStats = assertVariety(parsed);

const outDir = path.join(ROOT, "audit", "essentialism-10x-pilot");
fs.mkdirSync(outDir, { recursive: true });
const cfgPath = path.join(outDir, "config.essentialism.json");
fs.writeFileSync(cfgPath, JSON.stringify(parsed, null, 2));

const extraPngs = fs
  .readdirSync(path.join(ROOT, "public", "scenes", "essentialism-10x-pilot"))
  .filter((f) => f.endsWith(".png") && !f.endsWith(".raw.png"))
  .sort()
  .map((f) => `public/scenes/essentialism-10x-pilot/${f}`);

const manifest = {
  schema: "stills/1",
  name: "Antidote 10x Book 3 Pilot (Essentialism - Light Polarity)",
  composition: "Antidote-lab",
  entry: "src/index.ts",
  silent: true,
  gl: "default",
  shards: 4,
  extra: extraPngs,
  jobs: [
    {
      id: "essentialism-stills",
      config: "config.essentialism.json",
      frames: [450, 780, 1340, 1920, 2260, 2930, 3460, 3810, 4440],
    },
    { id: "clip-s1", config: "config.essentialism.json", frames: [], clip: { from: 0, to: 1499 } },
    { id: "clip-s2", config: "config.essentialism.json", frames: [], clip: { from: 1500, to: 2999 } },
    { id: "clip-s3", config: "config.essentialism.json", frames: [], clip: { from: 3000, to: 4499 } },
  ],
};
const manifestPath = path.join(outDir, "manifest.essentialism.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✓ Wrote ${path.relative(ROOT, cfgPath)} (${parsed.scenes.length} scenes, ${parsed.captions.length} captions, ${parsed.meta.durationInFrames} frames)`);
console.log(`✓ Variety & Single-World stats:`, JSON.stringify(varietyStats));
console.log(`✓ Wrote ${path.relative(ROOT, manifestPath)} (${extraPngs.length} extra PNGs)`);
