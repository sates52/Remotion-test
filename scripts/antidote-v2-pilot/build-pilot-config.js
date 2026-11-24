#!/usr/bin/env node
/**
 * build-pilot-config.js — Build & Zod-validate the 3-slice Antidote 2.0 pilot config
 * for "How to Talk to Anyone" (Leil Lowndes) + the GitHub Actions stills/clips manifest.
 *
 * Slices (from public/captions/how-to-talk-to-anyone.vtt @ 30fps):
 *   Slice 1: 297.0s – 355.0s (58s = 1740 frames, 0..1739)
 *   Slice 2: 1078.0s – 1136.0s (58s = 1740 frames, 1740..3479)
 *   Slice 3: 2073.0s – 2126.0s (53s = 1590 frames, 3480..5069)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "..", "..");
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

const img = (id) => `scenes/antidote-v2-pilot/${id}.png`;

const config = {
  meta: {
    slug: "how-to-talk-to-anyone-v2-pilot",
    title: "How to Talk to Anyone",
    author: "Leil Lowndes",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 5070,
    artDirection: {
      style: "mid-century modern New Yorker editorial gouache and crisp ink illustration",
      mood: "obsidianGrid",
      captions: "off",
      hud: "off",
      motionDoctrine: true,
      palette: {
        accent: "#F5B73B",
        accent2: "#2DD4BF",
        danger: "#F05D5E",
        positive: "#34D399",
      },
    },
    take: {
      note: "Charisma is not memorizing 92 tricks — it is lowering the other person's threat response before you ask for anything.",
    },
  },
  captions: [],
  scenes: [
    // ── SLICE 1 (0..1740, 58s @ ~05:00) ──────────────────────────────────────
    {
      id: "s1-b1-flooding-smile",
      fromFrame: 0,
      durationFrames: 420,
      shot: "insert",
      transition: { type: "cut", frames: 0 },
      bg: { type: "flat", colors: ["#101319"], set: "none", texture: "none", stageMood: "obsidianGrid" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      comparisonGrid: {
        title: "MASS-PRODUCED VS. CUSTOM-TAILORED",
        subtitle: "Why a delayed smile overrides a robotic pleasantry",
        columns: [
          {
            heading: "Fast Nervous Grin",
            tag: "ROBOTIC",
            tone: "danger",
            image: img("s1_fast_grin"),
            bullets: [
              "Flashed automatically at everyone",
              "Reads as an anxious reflex",
            ],
            highlight: "Feels generic and forgettable",
          },
          {
            heading: "The Flooding Smile",
            tag: "CUSTOM-TAILORED",
            tone: "positive",
            image: img("s1_warm_smile"),
            bullets: [
              "Pause one beat, soak in their face",
              "Let a warm smile flood your eyes",
            ],
            highlight: "Signals genuine delight in them",
          },
        ],
      },
    },
    {
      id: "s1-b2-yale-study",
      fromFrame: 420,
      durationFrames: 330,
      shot: "insert",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#121A26"], set: "none", texture: "none", stageMood: "slateEditorial" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      realAnchor: {
        badge: "RESEARCH STUDY",
        title: "BOSTON & YALE EXPERIMENT",
        subtitle: "The biology of unbroken attention",
        image: img("s1_yale_lab"),
        annotations: [
          { text: "Opposite-Sex Pairs", side: "left" },
          { text: "Casual Conversation", side: "left" },
          { text: "50% Given a Secret Task", side: "right" },
          { text: "50% Control Group", side: "right" },
        ],
      },
    },
    {
      id: "s1-b3-blink-task",
      fromFrame: 750,
      durationFrames: 510,
      shot: "insert",
      depthCarry: true,
      transition: { type: "zoomPush", frames: 12 },
      bg: { type: "flat", colors: ["#19102E"], set: "none", texture: "none", stageMood: "deepViolet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      visualEquation: {
        title: "THE SECRET BLINK-COUNTING TASK",
        subtitle: "What happens when you refuse to look away",
        operator: "arrow",
        nodes: [
          { badge: "INSTRUCTION", glyph: "👁", label: "Count Every Blink", sublabel: "Forces relentless, steady focus on their eyes" },
          { badge: "MECHANISM", image: img("s1_eye_contact"), label: "Unbroken Eye Contact", sublabel: "Zero glancing around the room", tone: "accent" },
          { badge: "RESULT", glyph: "★", label: "Deep Respect & Fondness", sublabel: "Partner feels uniquely seen and valued", tone: "positive" },
        ],
        footnote: "Intense, steady attention triggers immediate warmth.",
      },
    },
    {
      id: "s1-b4-study-results",
      fromFrame: 1260,
      durationFrames: 480,
      shot: "insert",
      transition: { type: "blurCut", frames: 12 },
      bg: { type: "flat", colors: ["#101319"], set: "none", texture: "none", stageMood: "obsidianGrid" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      dataMatrix: {
        variant: "dualCurve",
        title: "RESPECT & FONDNESS: BLINK-TASK VS. CONTROL",
        subtitle: "Subjects stared at reported dramatically higher connection",
        xLabel: "CONVERSATION TIME",
        yLabel: "REPORTED FONDNESS",
        curves: [
          { label: "Unbroken Eye Contact", points: [0.15, 0.34, 0.56, 0.78, 0.91], color: "#34D399" },
          { label: "Control Group", points: [0.15, 0.22, 0.28, 0.31, 0.35], color: "#9FB2C9" },
        ],
        callout: "The secret was never counting blinks — it was never breaking gaze.",
      },
    },

    // ── SLICE 2 (1740..3480, 58s @ ~18:00) ───────────────────────────────────
    {
      id: "s2-b1-banal-warmth",
      fromFrame: 1740,
      durationFrames: 480,
      shot: "insert",
      transition: { type: "zoomPull", frames: 12 },
      bg: { type: "flat", colors: ["#170B0E"], set: "none", texture: "none", stageMood: "crimsonNight" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      comparisonGrid: {
        title: "MELTING THICK TENSION",
        subtitle: "Why gentle warmth beats impressive credentials",
        columns: [
          {
            heading: "Cold Credentials",
            tag: "STATUS WALL",
            tone: "danger",
            image: img("s2_cold_credentials"),
            bullets: [
              "Leads with titles and academic proof",
              "Keeps social tension frozen",
            ],
            highlight: "Respect from afar, zero warmth",
          },
          {
            heading: "Gentle Misdirection",
            tag: "APPROACHABLE",
            tone: "positive",
            image: img("s2_warm_chat"),
            bullets: [
              "Shares a simple remark about the cold",
              "Offers a warm compliment on their child",
            ],
            highlight: "Ends with a dinner invitation",
          },
        ],
      },
    },
    {
      id: "s2-b2-naked-city-rule",
      fromFrame: 2220,
      durationFrames: 450,
      shot: "insert",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#EFE7D6"], set: "none", texture: "none", stageMood: "warmParchment" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      realAnchor: {
        badge: "CORE TECHNIQUE",
        title: "NEVER THE NAKED CITY",
        subtitle: "Eliminate the dead-end one-word answer",
        quote: "When you just say 'Columbus', you dump a massive cognitive burden onto the other person.",
        attribution: "Leil Lowndes",
        annotations: [
          { text: "One-Word Answer", side: "left" },
          { text: "Forces Mental Search", side: "right" },
        ],
      },
    },
    {
      id: "s2-b3-trampoline",
      fromFrame: 2670,
      durationFrames: 810,
      shot: "insert",
      depthCarry: true,
      transition: { type: "zoomPush", frames: 12 },
      bg: { type: "flat", colors: ["#121A26"], set: "none", texture: "none", stageMood: "slateEditorial" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      visualEquation: {
        title: "STATIC RESUME → CONVERSATIONAL TRAMPOLINE",
        subtitle: "Give them a hook they can actually bounce off",
        operator: "versus",
        nodes: [
          { badge: "NAKED CITY", image: img("s2_static_wall"), label: "“Columbus, Ohio.”", sublabel: "Dead end — forces them to scramble for a reply", tone: "danger" },
          { badge: "TRAMPOLINE", image: img("s2_trampoline"), label: "“Where Firms Test Secret Products”", sublabel: "Sparks instant curiosity and effortless follow-ups", tone: "positive" },
        ],
        footnote: "Always attach one vivid hook to where you live or work.",
      },
    },

    // ── SLICE 3 (3480..5070, 53s @ ~34:30) ───────────────────────────────────
    {
      id: "s3-b1-lobby-to-boardroom",
      fromFrame: 3480,
      durationFrames: 510,
      shot: "insert",
      transition: { type: "blurCut", frames: 12 },
      bg: {
        type: "flat", colors: ["#101319"], set: "none", texture: "none",
        stageMood: "obsidianGrid",
        image: { path: img("s3_lobby_boardroom"), opacity: 0.92, dim: 0.35, kenBurns: "panRight" },
      },
      camera: { zoom: [1, 1.03], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [
        { text: "CHOREOGRAPHING SAFETY\nLOBBY TO BOARDROOM", x: 960, y: 860, size: 54, style: "box", boxColor: "#101319", color: "#F5B73B", at: 18 },
      ],
    },
    {
      id: "s3-b2-sociopath-quadrant",
      fromFrame: 3990,
      durationFrames: 540,
      shot: "insert",
      depthCarry: true,
      transition: { type: "slideCarryUp", frames: 12 },
      bg: { type: "flat", colors: ["#19102E"], set: "none", texture: "none", stageMood: "deepViolet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      dataMatrix: {
        variant: "quadrant2x2",
        title: "THE COUNTERPOINT: THE SOCIOPATH PROBLEM",
        subtitle: "4 mechanics of charisma — and the trap of faking all 92 at once",
        xLabel: "AUTHENTICITY",
        yLabel: "TECHNIQUE",
        quadrants: [
          { label: "1. Eye Contact", sublabel: "Warm presence vs. mechanical staring" },
          { label: "2. Posture & Palms", sublabel: "Openness vs. rehearsed wrist angles" },
          { label: "3. Conversational Pacing", sublabel: "Listening vs. scripted timing" },
          { label: "4. Boundary Setting", sublabel: "True charisma respects human safety", tone: "accent", active: true },
        ],
        callout: "Never make anyone feel managed or manipulated.",
      },
    },
    {
      id: "s3-b3-overload-vs-natural",
      fromFrame: 4530,
      durationFrames: 540,
      shot: "insert",
      transition: { type: "zoomPull", frames: 12 },
      bg: { type: "flat", colors: ["#101319"], set: "none", texture: "none", stageMood: "obsidianGrid" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [], props: [], texts: [],
      comparisonGrid: {
        title: "PLEASE DON'T DEPLOY ALL 92 TRICKS AT ONCE",
        subtitle: "Why over-monitoring kills natural connection",
        columns: [
          {
            heading: "Mechanical Overload",
            tag: "MANIPULATIVE",
            tone: "danger",
            image: img("s3_robotic_overload"),
            bullets: [
              "Counting seconds before you smile",
              "Monitoring wrist angles & palm exposure",
            ],
            highlight: "Triggers people's threat radar",
          },
          {
            heading: "Natural Integration",
            tag: "TRUE CHARISMA",
            tone: "positive",
            image: img("s3_natural_ease"),
            bullets: [
              "Practice one small habit at a time",
              "Focus outward on the other person",
            ],
            highlight: "Effortless warmth & lasting trust",
          },
        ],
      },
    },
  ],
};

// Validate against Zod schema
const parsed = antidoteConfigSchema.parse(config);
const outDir = path.join(ROOT, "audit", "antidote-v2-pilot");
fs.mkdirSync(outDir, { recursive: true });
const cfgPath = path.join(outDir, "config.pilot.json");
fs.writeFileSync(cfgPath, JSON.stringify(parsed, null, 2));

// Build stills/1 manifest with explicit frames: [] on clip-only jobs
const extra = fs
  .readdirSync(path.join(ROOT, "public", "scenes", "antidote-v2-pilot"))
  .filter((f) => f.endsWith(".png"))
  .map((f) => `public/scenes/antidote-v2-pilot/${f}`);

const stillFrames = parsed.scenes.map((s) => Math.round(s.fromFrame + s.durationFrames * 0.6));
const manifest = {
  schema: "stills/1",
  name: "antidote-v2-htta-pilot",
  composition: "Antidote-lab",
  entry: "src/index.ts",
  shards: 4,
  silent: true,
  gl: "default",
  extra,
  jobs: [
    { id: "pilot-stills", config: "config.pilot.json", frames: stillFrames, grid: { cols: 5, width: 480 } },
    { id: "slice1", config: "config.pilot.json", frames: [], clip: { from: 0, to: 1739, crf: 20, scale: 1, concurrency: 2 } },
    { id: "slice2", config: "config.pilot.json", frames: [], clip: { from: 1740, to: 3479, crf: 20, scale: 1, concurrency: 2 } },
    { id: "slice3", config: "config.pilot.json", frames: [], clip: { from: 3480, to: 5069, crf: 20, scale: 1, concurrency: 2 } },
  ],
};
const manPath = path.join(outDir, "manifest.json");
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2));

console.log(`✓ Validated config.pilot.json (${parsed.scenes.length} scenes, ${parsed.meta.durationInFrames} frames)`);
console.log(`✓ Wrote manifest.json (${extra.length} Flux assets bundled, ${stillFrames.length} stills + 3 clips)`);
