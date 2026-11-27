#!/usr/bin/env node
/**
 * build-p2-book-demos.js — Builds 3 real-book audio-synced Phase 2 demo configs
 * (Thinking, Fast and Slow / The First 90 Days / Procrastinate on Purpose)
 * + slices.json + stills/1 cloud manifest.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { parseWords, buildCaptions } = require("./lib/vtt");
const { toArtDirection } = require("./lib/style-packs");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "audit", "p2-book-demos");
fs.mkdirSync(OUT_DIR, { recursive: true });

const esbuild = require(path.join(ROOT, "node_modules", "esbuild"));
const tmpOut = path.join(os.tmpdir(), `antidote-p2-demos-schema-${Date.now()}.cjs`);
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

function sliceCaptions(vttPath, slices, fixWord = (w) => w) {
  const allWords = parseWords(fs.readFileSync(vttPath, "utf8"));
  const captions = [];
  for (const s of slices) {
    const sliceWords = allWords
      .filter((w) => w.t >= s.s0 && w.t < s.s1)
      .map((w) => ({
        w: fixWord(w.w),
        t: w.t - s.s0,
        end: Math.min(w.end, s.s1) - s.s0,
      }));
    for (const c of buildCaptions(sliceWords, 30)) {
      captions.push({
        text: c.text,
        startFrame: s.fromFrame + c.startFrame,
        endFrame: s.fromFrame + c.endFrame,
        words: c.words.map((wd) => ({
          w: wd.w,
          s: s.fromFrame + wd.s,
          e: s.fromFrame + wd.e,
        })),
      });
    }
  }
  return captions;
}

const flatBg = (color, stageMood) => ({
  type: "flat",
  colors: [color],
  set: "none",
  texture: "none",
  stageMood,
});

const cam = (z0 = 1, z1 = 1.02) => ({
  zoom: [z0, z1],
  panX: [0, 0],
  panY: [0, 0],
});

// ── 1. THINKING, FAST AND SLOW ──────────────────────────────────────────────
const tfsSlices = [
  { id: "tfs_s1", s0: 129.0, s1: 169.0, fromFrame: 0, toFrame: 1200 },
  { id: "tfs_s2", s0: 602.0, s1: 657.0, fromFrame: 1200, toFrame: 2850 },
  { id: "tfs_s3", s0: 1227.6, s1: 1258.6, fromFrame: 2850, toFrame: 3780 },
];
const tfsVtt = "C:/Users/savas/Cursor/Remotion/test/public/captions/thinking-fast-and-slow.vtt";
const tfsAudio = "C:/Users/savas/Cursor/Remotion/test/public/audio/thinking-fast-and-slow.m4a";
const tfsFix = (w) =>
  w.replace(/^Conorman$/i, "Kahneman").replace(/^wisiotti(\.?)$/i, "WYSIATI$1");

const tfsConfig = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 3780,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("swissModernist"),
    take: {
      note: "Our minds jump to confident stories from the tiny fraction of evidence right in front of us.",
    },
  },
  captions: sliceCaptions(tfsVtt, tfsSlices, tfsFix),
  scenes: [
    {
      id: "tfs-1a",
      fromFrame: 0,
      durationFrames: 630,
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: flatBg("#F5F1E8", "swissBauhaus"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "manifesto",
        subject: "WYSIATI golden rule",
        action: "kineticManifesto reveals What You See Is All There Is",
        payoff: "anchors Kahneman's core rule",
        revealFrame: 390,
      },
      kineticManifesto: {
        kicker: "KAHNEMAN'S GOLDEN RULE",
        lines: [
          { text: "WHAT YOU SEE", at: 195 },
          { text: "IS ALL THERE IS", emphasis: true, tone: "accent", at: 260 },
          { text: "WYSIATI", emphasis: true, tone: "danger", at: 390 },
          { text: "NEVER THE FULL PICTURE", at: 480 },
        ],
        divider: "line",
        footnote: "Your mind builds coherent stories from incomplete scraps",
        footnoteAt: 520,
      },
    },
    {
      id: "tfs-1b",
      fromFrame: 630,
      durationFrames: 570,
      shot: "insert",
      transition: { type: "halftoneCut", frames: 14 },
      bg: flatBg("#EFE9DC", "archivalBroadsheet"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "framework-map",
        subject: "System 1 and System 2",
        action: "vennMerge combines System 1 and System 2 into Human Judgment",
        payoff: "clarifies two operating modes, not brain lobes",
        revealFrame: 440,
      },
      vennMerge: {
        title: "TWO FICTITIOUS CHARACTERS",
        subtitle: "NOT PHYSICAL BRAIN REGIONS — TWO OPERATING MODES",
        circles: [
          { label: "SYSTEM 1", sublabel: "Fast & automatic", tone: "danger", at: 180 },
          { label: "SYSTEM 2", sublabel: "Slow & deliberate", tone: "positive", at: 360 },
        ],
        intersection: {
          label: "HUMAN JUDGMENT",
          detail: "Invisible daily errors",
          at: 440,
        },
        callout: "Mental shorthand — not physical lobes on an fMRI",
      },
    },
    {
      id: "tfs-2a",
      fromFrame: 1200,
      durationFrames: 630,
      shot: "insert",
      transition: { type: "paperTear", frames: 16 },
      bg: flatBg("#F5F1E8", "swissBauhaus"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "annotate-place",
        subject: "Halo Effect on stage",
        action: "upClose zooms into the smiling presenter before financials appear",
        payoff: "shows charisma bias in action",
        revealFrame: 210,
      },
      upClose: {
        title: "THE HALO EFFECT",
        subtitle: "DECIDED BEFORE THE FINANCIALS APPEAR",
        image: "scenes/p2-book-demos/tfs_stage_presenter.png",
        zoomTarget: { x: 0.38, y: 0.28, scale: 2.1 },
        zoomAt: 210,
        lensLabel: "CHARISMA BIAS",
        annotation: {
          headline: "BRILLIANT SMILE = BRILLIANT PLAN?",
          detail: "System 1 decides in seconds before seeing the numbers",
          side: "right",
        },
      },
    },
    {
      id: "tfs-2b",
      fromFrame: 1830,
      durationFrames: 600,
      shot: "insert",
      transition: { type: "halftoneCut", frames: 14 },
      bg: flatBg("#FAF7F0", "ivoryBroadsheet"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "mechanism-flow",
        subject: "paper-thin coherence",
        action: "visualEquation links confident speaker to System 1 affect to assumes all good",
        payoff: "explains the Halo Effect mechanism",
        revealFrame: 420,
      },
      visualEquation: {
        title: "PAPER-THIN COHERENCE",
        nodeShape: "hex",
        operator: "arrow",
        nodes: [
          { label: "CONFIDENT SPEAKER", sublabel: "Looks good", tone: "positive" },
          { label: "SYSTEM 1 AFFECT", sublabel: "Positive response", tone: "accent" },
          { label: "ASSUMES ALL GOOD", sublabel: "Rigid story", tone: "danger" },
        ],
        footnote: "Good people must do exclusively good things",
      },
    },
    {
      id: "tfs-2c",
      fromFrame: 2430,
      durationFrames: 420,
      shot: "insert",
      transition: { type: "paperTear", frames: 16 },
      bg: flatBg("#F5F1E8", "swissBauhaus"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "mechanism-flow",
        subject: "slick UI on terrible app",
        action: "explodedView separates surface UI from broken underlying code",
        payoff: "visualizes the app analogy",
        revealFrame: 325,
      },
      explodedView: {
        title: "THE HALO ILLUSION",
        subtitle: "SLICK INTERFACE ON A TERRIBLE APP",
        expandAt: 130,
        layers: [
          { label: "SLICK USER INTERFACE", badge: "SURFACE", tone: "positive", at: 30 },
          { label: "SMOOTH ANIMATIONS", badge: "ASSUMED", tone: "accent", at: 145 },
          { label: "UNDERLYING CODE", badge: "UNCHECKED", tone: "neutral", at: 245 },
          { label: "CRASHES IN 5 MIN", badge: "REALITY", tone: "danger", at: 325 },
        ],
      },
    },
    {
      id: "tfs-3a",
      fromFrame: 2850,
      durationFrames: 930,
      shot: "insert",
      transition: { type: "halftoneCut", frames: 14 },
      bg: flatBg("#EFE9DC", "archivalBroadsheet"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "data-proof",
        subject: "Zillow Zestimate anchoring",
        action: "barRace shows $500,000 Zestimate dragging valuation up from $200,000",
        payoff: "proves anchoring against physical reality",
        revealFrame: 690,
      },
      barRace: {
        title: "THE ZILLOW ANCHOR EFFECT",
        subtitle: "HOW THE FIRST NUMBER DRAGS YOUR ESTIMATE UP",
        epochs: [
          {
            label: "WITHOUT ZESTIMATE",
            at: 30,
            bars: [
              { id: "reality", label: "Actual House Value", value: 200, displayValue: "$200,000", tone: "positive" },
              { id: "mental", label: "Unanchored Estimate", value: 200, displayValue: "$200,000", tone: "neutral" },
            ],
          },
          {
            label: "ZESTIMATE SHOWN",
            at: 210,
            bars: [
              { id: "anchor", label: "Zillow Zestimate", value: 500, displayValue: "$500,000", tone: "danger" },
              { id: "mental", label: "Anchored Estimate", value: 380, displayValue: "Dragged Up", tone: "accent" },
              { id: "reality", label: "Rotting Roof & Floors", value: 200, displayValue: "$200,000", tone: "positive" },
            ],
          },
          {
            label: "WALK-OUT VERDICT",
            at: 690,
            bars: [
              { id: "anchor", label: "Zillow Zestimate", value: 500, displayValue: "$500,000", tone: "danger" },
              { id: "mental", label: "Your Valuation", value: 420, displayValue: "Pulled Up", tone: "accent" },
              { id: "reality", label: "Physical Reality", value: 200, displayValue: "$200,000", tone: "positive" },
            ],
          },
        ],
        callout: "The first number drags you up regardless of physical reality",
      },
    },
  ],
});

// ── 2. THE FIRST 90 DAYS ────────────────────────────────────────────────────
const f90Slices = [
  { id: "f90_s1", s0: 123.5, s1: 171.5, fromFrame: 0, toFrame: 1440 },
  { id: "f90_s2", s0: 1207.6, s1: 1255.6, fromFrame: 1440, toFrame: 2880 },
];
const f90Vtt = "C:/Users/savas/Cursor/Remotion/test/public/captions/the-first-90-days.vtt";
const f90Audio = "C:/Users/savas/Cursor/Remotion/test/public/audio/the-first-90-days.mp3";
const f90Fix = (w) => w.replace(/^lowhanging$/i, "low-hanging");

const f90Config = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-the-first-90-days",
    title: "The First 90 Days",
    author: "Michael Watkins",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 2880,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("xrayDiagnostics"),
    take: {
      note: "Early credibility comes from aligning fast wins with your boss's core priorities, not chasing easy busywork.",
    },
  },
  captions: sliceCaptions(f90Vtt, f90Slices, f90Fix),
  scenes: [
    {
      id: "f90-1a",
      fromFrame: 0,
      durationFrames: 930,
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: flatBg("#071821", "cyberXRay"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "spatial-journey",
        subject: "flying blind into Day One",
        action: "spatialJourney topoExpedition maps political landmines and transition risk",
        payoff: "stages the uncharted leadership transition",
        revealFrame: 760,
      },
      spatialJourney: {
        variant: "topoExpedition",
        title: "FLYING BLIND INTO DAY ONE",
        subtitle: "NO RELIABLE MAP FOR THE TRANSITION",
        stations: [
          { label: "NO RELIABLE MAP", detail: "Uncharted territory", tone: "accent", at: 20 },
          { label: "POLITICAL LANDMINES", detail: "Buried history", tone: "danger", at: 120 },
          { label: "FLYING BLIND", detail: "Leading the room", tone: "neutral", at: 390 },
          { label: "RISKIEST MOMENT", detail: "Career transition", tone: "danger", at: 760 },
        ],
      },
    },
    {
      id: "f90-1b",
      fromFrame: 930,
      durationFrames: 510,
      shot: "insert",
      transition: { type: "focusPull", frames: 16 },
      bg: flatBg("#0C1E33", "blueprintNavy"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "annotate-place",
        subject: "Day One hallway tension",
        action: "annotatedScene dollyZoom spotlights coffee cup and sideways glances",
        payoff: "grounds the visceral Day One moment",
        revealFrame: 375,
      },
      annotatedScene: {
        image: "scenes/p2-book-demos/f90_day1_hallway.png",
        kenBurns: "dollyZoom",
        markerStyle: "spotlightMask",
        dim: 0.22,
        banner: { text: "THE DREADED DAY ONE", at: 130 },
        spotlights: [
          {
            cx: 740,
            cy: 540,
            rx: 155,
            label: "CUP OF COFFEE",
            note: "Fresh paint & pure anxiety",
            labelPos: "left",
            tone: "accent",
            at: 195,
          },
          {
            cx: 1320,
            cy: 480,
            rx: 165,
            label: "SIDEWAYS GLANCES",
            note: "Everyone watching your first move",
            labelPos: "right",
            tone: "danger",
            at: 375,
          },
        ],
      },
    },
    {
      id: "f90-2a",
      fromFrame: 1440,
      durationFrames: 660,
      shot: "insert",
      transition: { type: "whipPan", frames: 14 },
      bg: flatBg("#071821", "cyberXRay"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "contrast",
        subject: "false dichotomy of easy wins",
        action: "crumpleToss discards coffee-machine myth and reveals boss-aligned wins",
        payoff: "refutes low-stakes busywork",
        revealFrame: 220,
      },
      crumpleToss: {
        title: "THE EARLY WIN TRAP",
        subtitle: "ESCAPE THE FALSE DICHOTOMY",
        myth: {
          badge: "FALSE DICHOTOMY",
          headline: "Fixing the coffee machine is better than nothing",
          bullets: ["Easy low-stakes busywork", "Unconnected to core goals"],
        },
        tossAt: 95,
        truth: {
          badge: "FIRST 90 DAYS RULE",
          headline: "Secure wins that matter specifically to your boss",
          detail: "Aggressively align early targets in your first 90 days",
          tone: "positive",
        },
      },
    },
    {
      id: "f90-2b",
      fromFrame: 2100,
      durationFrames: 780,
      shot: "insert",
      transition: { type: "focusPull", frames: 16 },
      bg: flatBg("#151C24", "slateEditorial"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "tradeoff-scale",
        subject: "low-hanging fruit vs core strategy",
        action: "balanceScale weighs coffee machine distraction against customer retention",
        payoff: "shows why core strategy wins credibility",
        revealFrame: 540,
      },
      balanceScale: {
        title: "BUSYWORK VS. CORE STRATEGY",
        subtitle: "WHAT ACTUALLY BUILDS CREDIBILITY",
        leftLabel: "LOW-HANGING FRUIT",
        rightLabel: "CORE STRATEGY",
        leftWeights: [
          { label: "Coffee Machine", sublabel: "Looks busy", weight: 0.8, tone: "danger", at: 20 },
          { label: "Old Playbook", sublabel: "Easily distracted", weight: 0.7, tone: "danger", at: 320 },
        ],
        rightWeights: [
          { label: "Customer Retention", sublabel: "Keeps boss awake", weight: 2.8, tone: "positive", at: 150 },
          { label: "Boss's Priority", sublabel: "Advances strategy", weight: 2.4, tone: "positive", at: 430 },
        ],
        verdict: "Advance core strategy — skip irrelevant easy wins",
        verdictAt: 540,
      },
    },
  ],
});

// ── 3. PROCRASTINATE ON PURPOSE ─────────────────────────────────────────────
const popSlices = [
  { id: "pop_s1", s0: 148.0, s1: 177.0, fromFrame: 0, toFrame: 870 },
  { id: "pop_s2", s0: 618.0, s1: 653.5, fromFrame: 870, toFrame: 1935 },
  { id: "pop_s3", s0: 1198.0, s1: 1212.5, fromFrame: 1935, toFrame: 2370 },
];
const popVtt = "C:/Users/savas/Cursor/Remotion/test/public/captions/procrastinate-on-purpose.vtt";
const popAudio = "C:/Users/savas/Cursor/Remotion/test/public/audio/procrastinate-on-purpose.mp3";

const popConfig = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-procrastinate-on-purpose",
    title: "Procrastinate on Purpose",
    author: "Rory Vaden",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 2370,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("bauhausMidnight"),
    take: {
      note: "Strategic delay works like subtractive EQ — you make what matters louder by cutting away the noise.",
    },
  },
  captions: sliceCaptions(popVtt, popSlices),
  scenes: [
    {
      id: "pop-1a",
      fromFrame: 0,
      durationFrames: 480,
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: flatBg("#121318", "bauhausNocturne"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "mechanism-flow",
        subject: "priority dilution",
        action: "gravityPile stacks daily expectations into an overload",
        payoff: "shows how dilution disguises itself as effectiveness",
        revealFrame: 415,
      },
      gravityPile: {
        title: "PRIORITY DILUTION",
        subtitle: "NEVER LOOKS LIKE LAZINESS — LOOKS LIKE BUSYNESS",
        dropZoneLabel: "DAILY ROUTINE OVERLOAD",
        items: [
          { label: "Urgent Ping", weight: 1, tone: "neutral", at: 20 },
          { label: "Effective Employee", weight: 1.4, tone: "accent", at: 255 },
          { label: "Team Player", weight: 1.3, tone: "accent", at: 315 },
          { label: "Involved Parent", weight: 1.5, tone: "accent", at: 370 },
          { label: "Hidden Friction", weight: 1.8, tone: "danger", at: 410 },
        ],
        callout: "Priority dilution hides behind being helpful",
        calloutAt: 415,
      },
    },
    {
      id: "pop-1b",
      fromFrame: 480,
      durationFrames: 390,
      shot: "insert",
      transition: { type: "pushThrough", frames: 16 },
      bg: flatBg("#0E1117", "obsidianGrid"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "live-interface",
        subject: "116 unread inbox flood",
        action: "liveInterface notificationFlood reveals 116 unread on Tuesday morning",
        payoff: "makes the morning inbox shock visceral",
        revealFrame: 265,
      },
      liveInterface: {
        variant: "notificationFlood",
        title: "TUESDAY MORNING",
        subtitle: "MID-LEVEL EXECUTIVE · WAKE UP MONITOR",
        channels: [
          { name: "Status Threads", count: "FYI", tone: "neutral", at: 60 },
          { name: "Team Requests", count: "NEW", tone: "accent", at: 150 },
          { name: "Executive Inbox", preview: "116 unread messages waiting", count: 116, tone: "danger", at: 265 },
          { name: "Urgent Alerts", count: "NOW", tone: "danger", at: 320 },
        ],
      },
    },
    {
      id: "pop-2a",
      fromFrame: 870,
      durationFrames: 555,
      shot: "insert",
      transition: { type: "pageTurn", frames: 16 },
      bg: flatBg("#121318", "bauhausNocturne"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "document-quote",
        subject: "audio engineering boost EQ",
        action: "editorialSpread pairs mixing console with novice EQ mistake",
        payoff: "sets up the subtractive EQ analogy",
        revealFrame: 480,
      },
      editorialSpread: {
        image: "scenes/p2-book-demos/pop_mixing_console.png",
        mediaSide: "left",
        kicker: "AUDIO ENGINEERING ANALOGY",
        headline: "Novices Boost Every Fader",
        quote: "Adding more volume and frequencies makes the whole track sound muddy and chaotic.",
        highlightPhrases: [
          { text: "more volume", at: 370 },
          { text: "muddy and chaotic", at: 495 },
        ],
        points: [
          { label: "Turn everything up", tone: "danger", at: 320 },
          { label: "Muddy & chaotic mix", tone: "danger", at: 480 },
        ],
      },
    },
    {
      id: "pop-2b",
      fromFrame: 1425,
      durationFrames: 510,
      shot: "insert",
      transition: { type: "pushThrough", frames: 16 },
      bg: flatBg("#1C0D12", "crimsonNight"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "before-after-wipe",
        subject: "boost EQ vs subtractive EQ",
        action: "beforeAfterWipe slices from muddy boost to subtractive EQ clarity",
        payoff: "delivers the core metaphor",
        revealFrame: 220,
      },
      beforeAfterWipe: {
        direction: "diagonal",
        wipeAt: 220,
        before: {
          label: "NOVICE MIX",
          headline: "Boost Everything",
          points: ["Add more volume", "Muddy chaotic calendar"],
          tone: "danger",
        },
        after: {
          label: "SUBTRACTIVE EQ",
          headline: "Take Things Away",
          points: ["Carve out competing noise", "Let key work punch through"],
          tone: "positive",
        },
      },
    },
    {
      id: "pop-3a",
      fromFrame: 1935,
      durationFrames: 435,
      shot: "insert",
      transition: { type: "pageTurn", frames: 16 },
      bg: flatBg("#121318", "bauhausNocturne"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: {
        job: "mechanism-flow",
        subject: "top of the funnel clutter",
        action: "analyticsFunnel shows eliminating junk at the top to prevent collapse",
        payoff: "visualizes defending the perimeter",
        revealFrame: 285,
      },
      analyticsFunnel: {
        title: "DEFEND THE PERIMETER",
        subtitle: "ELIMINATE JUNK AT THE TOP OF THE FUNNEL",
        bottleneckIndex: 0,
        stages: [
          { label: "INCOMING VOLUME", value: "ALL", share: 1.0, dropNote: "Trivial clutter enters", tone: "danger", at: 20 },
          { label: "ELIMINATE JUNK", value: "CUT", share: 0.62, dropNote: "Stop the drain on your hours", tone: "accent", at: 150 },
          { label: "DEFEND PERIMETER", value: "KEEP", share: 0.36, dropNote: "Prevent system collapse", tone: "positive", at: 285 },
        ],
        callout: "Eliminate top-of-funnel clutter before the system collapses",
      },
    },
  ],
});

const configs = [
  { file: "config.tfs.json", config: tfsConfig },
  { file: "config.f90.json", config: f90Config },
  { file: "config.pop.json", config: popConfig },
];
for (const { file, config } of configs) {
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(config, null, 2));
}

const slicesMeta = {
  books: [
    { slug: "demo-thinking-fast-and-slow", audioPath: tfsAudio, slices: tfsSlices },
    { slug: "demo-the-first-90-days", audioPath: f90Audio, slices: f90Slices },
    { slug: "demo-procrastinate-on-purpose", audioPath: popAudio, slices: popSlices },
  ],
};
fs.writeFileSync(path.join(OUT_DIR, "slices.json"), JSON.stringify(slicesMeta, null, 2));

const pickFrames = (scenes) => {
  const out = [];
  for (const sc of scenes) {
    out.push(sc.fromFrame + Math.min(240, Math.floor(sc.durationFrames * 0.45)));
    out.push(sc.fromFrame + Math.max(30, sc.durationFrames - 45));
  }
  return out.slice(0, 12);
};

const manifest = {
  schema: "stills/1",
  composition: "Antidote-lab",
  silent: true,
  gl: "default",
  extra: [
    "public/scenes/p2-book-demos/tfs_stage_presenter.png",
    "public/scenes/p2-book-demos/f90_day1_hallway.png",
    "public/scenes/p2-book-demos/pop_mixing_console.png",
  ],
  jobs: [
    {
      id: "tfs_grid",
      config: "config.tfs.json",
      frames: pickFrames(tfsConfig.scenes),
      grid: { cols: 4, width: 480 },
    },
    {
      id: "f90_grid",
      config: "config.f90.json",
      frames: pickFrames(f90Config.scenes),
      grid: { cols: 4, width: 480 },
    },
    {
      id: "pop_grid",
      config: "config.pop.json",
      frames: pickFrames(popConfig.scenes),
      grid: { cols: 4, width: 480 },
    },
    ...tfsSlices.map((s) => ({
      id: s.id,
      config: "config.tfs.json",
      frames: [],
      clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 },
    })),
    ...f90Slices.map((s) => ({
      id: s.id,
      config: "config.f90.json",
      frames: [],
      clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 },
    })),
    ...popSlices.map((s) => ({
      id: s.id,
      config: "config.pop.json",
      frames: [],
      clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 },
    })),
  ],
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `Built 3 configs + slices.json + manifest.json (${manifest.jobs.length} jobs):`,
  configs.map((c) => `${c.config.meta.slug} (${c.config.scenes.length} scenes, ${c.config.captions.length} captions)`).join(" | ")
);
