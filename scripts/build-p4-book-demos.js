#!/usr/bin/env node
/**
 * build-p4-book-demos.js — Phase 4 Cloud Demo Proof (0 extra Flux calls):
 *  1. demo-p4-thinking-fast-and-slow  (kraftDossier / ochreKraft / magazineMasthead / printRule / paperGrain)
 *  2. demo-p4-the-first-90-days       (cobaltDrafting / cobaltBlueprint / filmFrame / cinemaLower / blueprintTech)
 *  3. demo-p4-procrastinate-on-purpose (kilnEditorial / terracottaEarth / diagonalSplit / kineticPill / editorialHalftone)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { parseWords, buildCaptions } = require("./lib/vtt");
const { toArtDirection } = require("./lib/style-packs");
const { compile10xCues } = require("./lib/compile-10x-cues");
const { applyColdOpenDirection } = require("./lib/cold-open");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "audit", "p4-book-demos");
fs.mkdirSync(OUT_DIR, { recursive: true });

const esbuild = require(path.join(ROOT, "node_modules", "esbuild"));
const tmpOut = path.join(os.tmpdir(), `antidote-p4-demos-schema-${Date.now()}.cjs`);
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
      .map((w) => ({ w: fixWord(w.w), t: w.t - s.s0, end: Math.min(w.end, s.s1) - s.s0 }));
    for (const c of buildCaptions(sliceWords, 30)) {
      captions.push({
        text: c.text,
        startFrame: s.fromFrame + c.startFrame,
        endFrame: s.fromFrame + c.endFrame,
        words: c.words.map((wd) => ({ w: wd.w, s: s.fromFrame + wd.s, e: s.fromFrame + wd.e })),
      });
    }
  }
  return captions;
}

const cam = (z0 = 1, z1 = 1.02) => ({ zoom: [z0, z1], panX: [0, 0], panY: [0, 0] });
const ambientBg = (stageMood, imgPath) => ({
  type: "flat",
  colors: ["#101319"],
  set: "none",
  texture: "none",
  stageMood,
  ...(imgPath ? {
    image: { path: imgPath, ambientCanvas: true, emptyStage: true, opacity: 0.22, blur: 7, tintOpacity: 0.72, kenBurns: "pushIn" },
  } : {}),
});

function polishScenes(scenes, packId, opening) {
  return scenes.map((sc, idx) => {
    compile10xCues(sc, { durationFrames: sc.durationFrames, fps: 30 });
    applyColdOpenDirection(sc, { index: idx, fromSec: sc.fromFrame / 30, opening, pack: { id: packId, polarity: "chromaticMid" }, authorContinue: false });
    return sc;
  });
}

// ── 1. THINKING, FAST AND SLOW (magazineMasthead / printRule / ochreKraft) ──
const tfsSlices = [
  { id: "p4_tfs_s1", s0: 129.0, s1: 169.0, fromFrame: 0, toFrame: 1200 },
  { id: "p4_tfs_s2", s0: 602.0, s1: 657.0, fromFrame: 1200, toFrame: 2850 },
  { id: "p4_tfs_s3", s0: 1227.6, s1: 1258.6, fromFrame: 2850, toFrame: 3780 },
];
const tfsConfig = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-p4-thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 3780,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("kraftDossier"),
    take: { note: "Our minds jump to confident stories from the tiny fraction of evidence right in front of us." },
  },
  captions: sliceCaptions("C:/Users/savas/Cursor/Remotion/test/public/captions/thinking-fast-and-slow.vtt", tfsSlices, (w) => w.replace(/^Conorman$/i, "Kahneman").replace(/^wisiotti(\.?)$/i, "WYSIATI$1")),
  scenes: polishScenes([
    {
      id: "p4-tfs-1a",
      fromFrame: 0,
      durationFrames: 630,
      chapterLabel: "PART 01 · WYSIATI",
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: ambientBg("ochreKraft", "scenes/p2-book-demos/tfs_stage_presenter.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "framework-map", subject: "Kahneman 3 rules", action: "bookBlueprint maps WYSIATI, Halo, Anchoring", payoff: "orients viewer", revealFrame: 420 },
      bookBlueprint: {
        title: "KAHNEMAN'S GOLDEN RULE",
        subtitle: "WHAT YOU SEE IS ALL THERE IS (WYSIATI)",
        thesis: "Your mind builds coherent stories from incomplete scraps.",
        pillars: [
          { number: "01", label: "WYSIATI", detail: "Jump to conclusions from scraps", status: "active", tone: "danger", at: 120 },
          { number: "02", label: "Halo Effect", detail: "One trait colors everything", status: "upcoming", at: 260 },
          { number: "03", label: "Anchoring", detail: "First number drags judgment", status: "upcoming", at: 400 },
        ],
        synthesis: "Meet the two characters driving these errors",
        synthesisAt: 500,
      },
    },
    {
      id: "p4-tfs-1b",
      fromFrame: 630,
      durationFrames: 570,
      chapterLabel: "PART 01 · SYSTEM 1 & 2",
      shot: "insert",
      transition: { type: "pageTurn", frames: 14 },
      bg: ambientBg("ochreKraft"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "framework-map", subject: "System 1 & 2", action: "vennMerge merges System 1 & 2", payoff: "clarifies modes", revealFrame: 440 },
      vennMerge: {
        title: "TWO FICTITIOUS CHARACTERS",
        subtitle: "NOT PHYSICAL BRAIN REGIONS — TWO OPERATING MODES",
        circles: [
          { label: "SYSTEM 1", sublabel: "Fast & automatic", tone: "danger", at: 180 },
          { label: "SYSTEM 2", sublabel: "Slow & deliberate", tone: "positive", at: 360 },
        ],
        intersection: { label: "HUMAN JUDGMENT", detail: "Invisible daily errors", at: 440 },
        callout: "Mental shorthand — not physical lobes on an fMRI",
      },
    },
    {
      id: "p4-tfs-2a",
      fromFrame: 1200,
      durationFrames: 840,
      chapterLabel: "PART 02 · HALO EFFECT",
      shot: "insert",
      transition: { type: "paperTear", frames: 16 },
      bg: ambientBg("ochreKraft"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "document-quote", subject: "Halo Effect case", action: "evidenceBoard pairs stage presenter with Halo principle", payoff: "grounds charisma bias", revealFrame: 420 },
      evidenceBoard: {
        title: "THE HALO EFFECT",
        subtitle: "DECIDED BEFORE THE FINANCIALS APPEAR",
        caseBadge: "STAGE CASE",
        image: "scenes/p2-book-demos/tfs_stage_presenter.png",
        subject: "Confident Speaker Pitching",
        setup: "A charismatic speaker flashes a brilliant smile and pitches a marketing plan.",
        finding: "Audience rates the plan brilliant in seconds",
        findingHighlight: "Before seeing a single financial number",
        lessonHeadline: "Good looks create a blind Halo",
        lessonDetail: "System 1 assumes everything else about them must be good too.",
        revealLessonAt: 420,
        tone: "danger",
      },
    },
    {
      id: "p4-tfs-2b",
      fromFrame: 2040,
      durationFrames: 810,
      chapterLabel: "PART 02 · THE APP ANALOGY",
      shot: "insert",
      transition: { type: "pageTurn", frames: 14 },
      bg: ambientBg("ochreKraft", "scenes/p2-book-demos/tfs_stage_presenter.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "mechanism-flow", subject: "slick UI to crash", action: "mechanismChain traces slick UI to app crash", payoff: "visualizes causal flaw", revealFrame: 480 },
      mechanismChain: {
        title: "SLICK INTERFACE, BROKEN CODE",
        subtitle: "HOW THE HALO EFFECT FOOLS YOUR BRAIN",
        variant: "linearChain",
        steps: [
          { label: "Slick UI", detail: "Nice buttons", badge: "SURFACE", tone: "positive", at: 40 },
          { label: "Smooth Motion", detail: "Feels polished", badge: "SIGNAL", tone: "accent", at: 220 },
          { label: "Assumed Flawless", detail: "Code unchecked", badge: "HALO", tone: "accent", at: 420 },
          { label: "Crashes in 5 Min", detail: "Hidden reality", badge: "FAILURE", tone: "danger", at: 620 },
        ],
        callout: "Surface polish hides broken underlying code",
        calloutAt: 640,
      },
    },
    {
      id: "p4-tfs-3a",
      fromFrame: 2850,
      durationFrames: 930,
      chapterLabel: "PART 03 · ANCHORING",
      shot: "insert",
      transition: { type: "paperTear", frames: 16 },
      bg: ambientBg("ochreKraft"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "data-proof", subject: "Zillow anchor", action: "barRace compares $500k vs $200k", payoff: "proves anchoring", revealFrame: 690 },
      barRace: {
        title: "THE ZILLOW ANCHOR EFFECT",
        subtitle: "HOW THE FIRST NUMBER DRAGS YOUR ESTIMATE UP",
        epochs: [
          { label: "WITHOUT ZESTIMATE", at: 30, bars: [{ id: "reality", label: "Actual House Value", value: 200, displayValue: "$200,000", tone: "positive" }, { id: "mental", label: "Unanchored Estimate", value: 200, displayValue: "$200,000", tone: "neutral" }] },
          { label: "ZESTIMATE SHOWN", at: 210, bars: [{ id: "anchor", label: "Zillow Zestimate", value: 500, displayValue: "$500,000", tone: "danger" }, { id: "mental", label: "Anchored Estimate", value: 380, displayValue: "Dragged Up", tone: "accent" }, { id: "reality", label: "Rotting Roof & Floors", value: 200, displayValue: "$200,000", tone: "positive" }] },
          { label: "WALK-OUT VERDICT", at: 690, bars: [{ id: "anchor", label: "Zillow Zestimate", value: 500, displayValue: "$500,000", tone: "danger" }, { id: "mental", label: "Your Valuation", value: 420, displayValue: "Pulled Up", tone: "accent" }, { id: "reality", label: "Physical Reality", value: 200, displayValue: "$200,000", tone: "positive" }] },
        ],
        callout: "The first number drags you up regardless of physical reality",
      },
    },
  ], "kraftDossier", { hook: "belief", naming: "early", promise: "stake" }),
});

// ── 2. THE FIRST 90 DAYS (filmFrame / cinemaLower / cobaltBlueprint) ─────────
const f90Slices = [
  { id: "p4_f90_s1", s0: 123.5, s1: 171.5, fromFrame: 0, toFrame: 1440 },
  { id: "p4_f90_s2", s0: 1207.6, s1: 1255.6, fromFrame: 1440, toFrame: 2880 },
];
const f90Config = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-p4-the-first-90-days",
    title: "The First 90 Days",
    author: "Michael Watkins",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 2880,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("cobaltDrafting"),
    take: { note: "Early credibility comes from aligning fast wins with your boss's core priorities, not chasing easy busywork." },
  },
  captions: sliceCaptions("C:/Users/savas/Cursor/Remotion/test/public/captions/the-first-90-days.vtt", f90Slices, (w) => w.replace(/^lowhanging$/i, "low-hanging")),
  scenes: polishScenes([
    {
      id: "p4-f90-1a",
      fromFrame: 0,
      durationFrames: 930,
      chapterLabel: "DAY 01 · FLYING BLIND",
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: ambientBg("cobaltBlueprint", "scenes/p2-book-demos/f90_day1_hallway.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "framework-map", subject: "transition map", action: "bookBlueprint maps Day 1 hazards", payoff: "orients transition", revealFrame: 700 },
      bookBlueprint: {
        title: "FLYING BLIND INTO DAY ONE",
        subtitle: "WHY LEADERSHIP TRANSITIONS FAIL EARLY",
        thesis: "No reliable map — yet you are expected to lead the room.",
        variant: "chapterPath",
        pillars: [
          { number: "01", label: "No Reliable Map", detail: "Uncharted territory", status: "done", tone: "accent", at: 40 },
          { number: "02", label: "Political Landmines", detail: "Hidden history", status: "active", tone: "danger", at: 180 },
          { number: "03", label: "Flying Blind", detail: "Spreadsheets hide truth", status: "upcoming", at: 420 },
          { number: "04", label: "Riskiest Moment", detail: "Career turning point", status: "upcoming", tone: "danger", at: 700 },
        ],
      },
    },
    {
      id: "p4-f90-1b",
      fromFrame: 930,
      durationFrames: 510,
      chapterLabel: "DAY 01 · THE HALLWAY",
      shot: "insert",
      transition: { type: "focusPull", frames: 16 },
      bg: ambientBg("cobaltBlueprint"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "annotate-place", subject: "Day One hallway", action: "annotatedScene dollyZoom spotlights tension", payoff: "grounds Day One", revealFrame: 375 },
      annotatedScene: {
        image: "scenes/p2-book-demos/f90_day1_hallway.png",
        kenBurns: "dollyZoom",
        markerStyle: "spotlightMask",
        dim: 0.22,
        banner: { text: "THE DREADED DAY ONE", at: 130 },
        spotlights: [
          { cx: 740, cy: 540, rx: 155, label: "CUP OF COFFEE", note: "Fresh paint & pure anxiety", labelPos: "left", tone: "accent", at: 195 },
          { cx: 1320, cy: 480, rx: 165, label: "SIDEWAYS GLANCES", note: "Everyone watching your first move", labelPos: "right", tone: "danger", at: 375 },
        ],
      },
    },
    {
      id: "p4-f90-2a",
      fromFrame: 1440,
      durationFrames: 660,
      chapterLabel: "EARLY WINS · FALSE DICHOTOMY",
      shot: "insert",
      transition: { type: "zoomPush", frames: 14 },
      bg: ambientBg("cobaltBlueprint", "scenes/p2-book-demos/f90_day1_hallway.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "contrast", subject: "coffee machine vs boss priority", action: "quoteDialogue stages false dichotomy", payoff: "exposes distraction", revealFrame: 420 },
      quoteDialogue: {
        title: "THE EARLY WIN TRAP",
        subtitle: "ESCAPE THE FALSE DICHOTOMY",
        speakerA: { name: "NEW LEADER", role: "Chasing easy wins", tone: "danger" },
        speakerB: { name: "WATKINS", role: "First 90 Days", tone: "positive" },
        lines: [
          { speaker: "A", text: "Isn't fixing the coffee machine better than nothing?", at: 40 },
          { speaker: "B", text: "It's a false dichotomy. Secure wins that matter to your boss.", at: 190 },
        ],
        subtext: {
          badge: "THE FIRST 90 DAYS RULE",
          headline: "Aggressively align early targets with your boss's core priorities",
          detail: "Easy busywork only proves you are easily distracted.",
          at: 420,
        },
      },
    },
    {
      id: "p4-f90-2b",
      fromFrame: 2100,
      durationFrames: 780,
      chapterLabel: "EARLY WINS · CORE STRATEGY",
      shot: "insert",
      transition: { type: "focusPull", frames: 16 },
      bg: ambientBg("cobaltBlueprint"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "tradeoff-scale", subject: "busywork vs strategy", action: "balanceScale weighs core strategy", payoff: "proves priority", revealFrame: 540 },
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
  ], "cobaltDrafting", { hook: "scene", naming: "after", promise: "map" }),
});

// ── 3. PROCRASTINATE ON PURPOSE (diagonalSplit / kineticPill / terracottaEarth)
const popSlices = [
  { id: "p4_pop_s1", s0: 148.0, s1: 177.0, fromFrame: 0, toFrame: 870 },
  { id: "p4_pop_s2", s0: 618.0, s1: 653.5, fromFrame: 870, toFrame: 1935 },
  { id: "p4_pop_s3", s0: 1198.0, s1: 1212.5, fromFrame: 1935, toFrame: 2370 },
];
const popConfig = antidoteConfigSchema.parse({
  meta: {
    slug: "demo-p4-procrastinate-on-purpose",
    title: "Procrastinate on Purpose",
    author: "Rory Vaden",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 2370,
    multiplane: true,
    hud: { enabled: false, showProgress: false, showBadge: false },
    artDirection: toArtDirection("kilnEditorial"),
    take: { note: "Strategic delay works like subtractive EQ — you make what matters louder by cutting away the noise." },
  },
  captions: sliceCaptions("C:/Users/savas/Cursor/Remotion/test/public/captions/procrastinate-on-purpose.vtt", popSlices),
  scenes: polishScenes([
    {
      id: "p4-pop-1a",
      fromFrame: 0,
      durationFrames: 480,
      chapterLabel: "PRIORITY DILUTION",
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: ambientBg("terracottaEarth", "scenes/p2-book-demos/pop_mixing_console.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "mechanism-flow", subject: "priority dilution loop", action: "mechanismChain dominoBreak snaps busyness loop", payoff: "shows dilution trap", revealFrame: 340 },
      mechanismChain: {
        title: "PRIORITY DILUTION",
        subtitle: "NEVER LOOKS LIKE LAZINESS — LOOKS LIKE BUSYNESS",
        variant: "dominoBreak",
        steps: [
          { label: "Daily Routine", detail: "Helpful employee", badge: "TRAP", tone: "accent", at: 20 },
          { label: "Urgent Noise", detail: "Dilutes focus", badge: "DRAIN", tone: "danger", at: 170 },
          { label: "Overload", detail: "No time left", badge: "CRASH", tone: "danger", at: 290 },
        ],
        breakAt: 340,
        breakLabel: "SUBTRACTIVE FOCUS",
        escapeOutcome: "Protect High-Value Work First",
      },
    },
    {
      id: "p4-pop-1b",
      fromFrame: 480,
      durationFrames: 390,
      chapterLabel: "TUESDAY MORNING",
      shot: "insert",
      transition: { type: "halftoneCut", frames: 14 },
      bg: ambientBg("terracottaEarth"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "live-interface", subject: "116 unread", action: "liveInterface reveals 116 unread", payoff: "makes inbox shock visceral", revealFrame: 265 },
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
      id: "p4-pop-2a",
      fromFrame: 870,
      durationFrames: 555,
      chapterLabel: "SUBTRACTIVE EQ",
      shot: "insert",
      transition: { type: "paperTear", frames: 16 },
      bg: ambientBg("terracottaEarth"),
      camera: cam(1, 1.01),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "document-quote", subject: "audio engineering analogy", action: "evidenceBoard pairs mixing console with subtractive EQ", payoff: "explains power by subtraction", revealFrame: 340 },
      evidenceBoard: {
        title: "AUDIO ENGINEERING ANALOGY",
        subtitle: "NOVICES BOOST — PROS SUBTRACT",
        caseBadge: "STUDIO MIX",
        image: "scenes/p2-book-demos/pop_mixing_console.png",
        subject: "Novices Boost Every Fader",
        setup: "Adding more volume and frequencies makes the whole track sound muddy and chaotic.",
        finding: "Pros use Subtractive EQ",
        findingHighlight: "Carve out competing frequencies",
        lessonHeadline: "Power comes from taking things away",
        lessonDetail: "Strategic delay is subtractive EQ for your calendar.",
        revealLessonAt: 340,
        tone: "accent",
      },
    },
    {
      id: "p4-pop-2b",
      fromFrame: 1425,
      durationFrames: 510,
      chapterLabel: "BOOST VS SUBTRACT",
      shot: "insert",
      transition: { type: "whipPan", frames: 14 },
      bg: ambientBg("terracottaEarth", "scenes/p2-book-demos/pop_mixing_console.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "before-after-wipe", subject: "boost EQ vs subtractive EQ", action: "beforeAfterWipe slices to clarity", payoff: "delivers core metaphor", revealFrame: 220 },
      beforeAfterWipe: {
        direction: "diagonal",
        wipeAt: 220,
        before: { label: "NOVICE MIX", headline: "Boost Everything", points: ["Add more volume", "Muddy chaotic calendar"], tone: "danger" },
        after: { label: "SUBTRACTIVE EQ", headline: "Take Things Away", points: ["Carve out competing noise", "Let key work punch through"], tone: "positive" },
      },
    },
    {
      id: "p4-pop-3a",
      fromFrame: 1935,
      durationFrames: 435,
      chapterLabel: "DEFEND THE PERIMETER",
      shot: "insert",
      transition: { type: "halftoneCut", frames: 14 },
      bg: ambientBg("terracottaEarth", "scenes/p2-book-demos/pop_mixing_console.png"),
      camera: cam(1, 1.02),
      characters: [],
      props: [],
      texts: [],
      shotIntent: { job: "mechanism-flow", subject: "top of funnel", action: "analyticsFunnel cuts junk", payoff: "defends perimeter", revealFrame: 285 },
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
  ], "kilnEditorial", { hook: "contrast", naming: "early", promise: "three" }),
});

const configs = [
  { file: "config.tfs.json", config: tfsConfig },
  { file: "config.f90.json", config: f90Config },
  { file: "config.pop.json", config: popConfig },
];
for (const { file, config } of configs) {
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(config, null, 2));
}

fs.writeFileSync(
  path.join(OUT_DIR, "slices.json"),
  JSON.stringify({
    books: [
      { slug: "demo-p4-thinking-fast-and-slow", audioPath: "C:/Users/savas/Cursor/Remotion/test/public/audio/thinking-fast-and-slow.m4a", slices: tfsSlices },
      { slug: "demo-p4-the-first-90-days", audioPath: "C:/Users/savas/Cursor/Remotion/test/public/audio/the-first-90-days.mp3", slices: f90Slices },
      { slug: "demo-p4-procrastinate-on-purpose", audioPath: "C:/Users/savas/Cursor/Remotion/test/public/audio/procrastinate-on-purpose.mp3", slices: popSlices },
    ],
  }, null, 2)
);

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
    { id: "p4_tfs_grid", config: "config.tfs.json", frames: pickFrames(tfsConfig.scenes), grid: { cols: 4, width: 480 } },
    { id: "p4_f90_grid", config: "config.f90.json", frames: pickFrames(f90Config.scenes), grid: { cols: 4, width: 480 } },
    { id: "p4_pop_grid", config: "config.pop.json", frames: pickFrames(popConfig.scenes), grid: { cols: 4, width: 480 } },
    ...tfsSlices.map((s) => ({ id: s.id, config: "config.tfs.json", frames: [], clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 } })),
    ...f90Slices.map((s) => ({ id: s.id, config: "config.f90.json", frames: [], clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 } })),
    ...popSlices.map((s) => ({ id: s.id, config: "config.pop.json", frames: [], clip: { from: s.fromFrame, to: s.toFrame - 1, scale: 0.75, crf: 22 } })),
  ],
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Built Phase 4 configs + slices.json + manifest.json (11 jobs)");
