#!/usr/bin/env node
/**
 * build-pilot-config.js — Build & Zod/Variety-validate the 3-slice Hybrid Antidote 2.1 pilot
 * for "How to Talk to Anyone" (Leil Lowndes) + GitHub Actions stills/clips manifest.
 *
 * Slices (from public/captions/how-to-talk-to-anyone.vtt @ 30fps):
 *   Slice 1: 297.0s – 355.0s (58s = 1740 frames, 0..1739)
 *   Slice 2: 1078.0s – 1136.0s (58s = 1740 frames, 1740..3479)
 *   Slice 3: 2073.0s – 2126.0s (53s = 1590 frames, 3480..5069)
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { parseWords, buildCaptions } = require("../lib/vtt");
const { assertVariety } = require("../lib/v2-variety-lint");

const ROOT = path.resolve(__dirname, "..", "..");
const MAIN_VTT = "C:/Users/savas/Cursor/Remotion/test/public/captions/how-to-talk-to-anyone.vtt";
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

// Build real word-timed captions for the 3 slices
const allWords = parseWords(fs.readFileSync(MAIN_VTT, "utf8"));
const fixWord = (w) =>
  w === "customtailored" ? "custom-tailored"
    : w === "fodness" ? "fondness"
      : w === "Loun" ? "Lowndes"
        : w;

const slices = [
  [297, 355, 0],
  [1078, 1136, 1740],
  [2073, 2126, 3480],
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
    slug: "how-to-talk-to-anyone-hybrid-pilot",
    title: "How to Talk to Anyone",
    author: "Leil Lowndes",
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 5070,
    flow: 1,
    multiplane: true,
    cast: {
      host: {
        name: "Elena",
        role: "narrator",
        variant: {
          skin: "#F0C39B",
          hair: "#4A2E1E",
          suit: "#D97736",
          shirt: "#F7F1E5",
          gender: "f",
          age: "adult",
          outfit: "coat",
          hairStyle: "curly",
          accessory: "necklace",
          expression: "happy",
        },
      },
      partner: {
        name: "Marcus",
        role: "protagonist",
        variant: {
          skin: "#E5B48B",
          hair: "#2B2623",
          suit: "#365675",
          shirt: "#F5F5F2",
          gender: "m",
          age: "adult",
          outfit: "suit",
          hairStyle: "short",
          glasses: true,
          accessory: "tie",
          expression: "neutral",
        },
      },
      researcher: {
        name: "Dr. Cole",
        role: "mentor",
        variant: {
          skin: "#EBC2A0",
          hair: "#C5CBD3",
          suit: "#424854",
          shirt: "#ECEAE4",
          gender: "m",
          age: "old",
          outfit: "vest",
          hairStyle: "receding",
          glasses: true,
          beard: "mustache",
          expression: "neutral",
        },
      },
      stranger: {
        name: "Clara",
        role: "foil",
        variant: {
          skin: "#D9A47C",
          hair: "#2E1F1B",
          suit: "#7D3143",
          shirt: "#F5ECE0",
          gender: "f",
          age: "adult",
          outfit: "coat",
          hairStyle: "long",
          accessory: "scarf",
          expression: "neutral",
        },
      },
    },
    artDirection: {
      style: "mid-century modern New Yorker editorial gouache and crisp ink illustration",
      mood: "obsidianGrid",
      captions: "minimal",
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
  captions,
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
      characters: [],
      props: [],
      texts: [],
      comparisonGrid: {
        layout: "fullBleedSplit",
        title: "MASS-PRODUCED VS. CUSTOM-TAILORED",
        columns: [
          {
            heading: "Fast Nervous Grin",
            tag: "ROBOTIC",
            tone: "danger",
            image: img("s1_fast_grin"),
            bullets: ["Flashed automatically at everyone", "Reads as an anxious reflex"],
          },
          {
            heading: "The Flooding Smile",
            tag: "CUSTOM-TAILORED",
            tone: "positive",
            image: img("s1_warm_smile"),
            bullets: ["Pause one beat, soak in their face", "Signals genuine delight in them"],
          },
        ],
      },
    },
    {
      id: "s1-b2-yale-setup",
      fromFrame: 420,
      durationFrames: 360,
      shot: "wide",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: {
        type: "flat",
        colors: ["#121A26"],
        set: "none",
        texture: "none",
        stageMood: "slateEditorial",
        image: { path: img("s1_yale_lab"), opacity: 0.92, dim: 0.24, groundFog: 0.48, kenBurns: "pushIn" },
      },
      camera: { zoom: [1, 1.03], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "cole-1",
          role: "researcher",
          x: 560,
          y: 605,
          scale: 0.62,
          body: "full",
          action: "talk",
          holds: "notes",
          holdHalo: true,
          says: { text: "Boston & Yale Study", at: 185 },
          lookAt: "partner",
        },
        {
          id: "elena-1",
          role: "host",
          x: 1120,
          y: 615,
          scale: 0.60,
          body: "full",
          flip: true,
          action: "idle",
          lookAt: "partner",
        },
        {
          id: "marcus-1",
          role: "partner",
          x: 1380,
          y: 615,
          scale: 0.60,
          body: "full",
          flip: true,
          action: "idle",
          lookAt: "partner",
        },
      ],
      props: [
        {
          type: "customSvg",
          x: 960,
          y: 235,
          scale: 0.52,
          at: 40,
          customSvg: {
            viewBox: "0 0 260 120",
            paths: [
              { d: "M10,16 H250 V104 H10 Z", fill: "#1A2230", stroke: "#F5B73B", strokeWidth: 4 },
              { d: "M42,46 H218", stroke: "#F5B73B", strokeWidth: 6 },
              { d: "M64,74 H196", stroke: "#9FB2C9", strokeWidth: 4 },
            ],
          },
        },
      ],
      texts: [],
    },
    {
      id: "s1-b3-blink-secret-task",
      fromFrame: 780,
      durationFrames: 480,
      shot: "twoShot",
      continueFromPrev: true,
      transition: { type: "cut", frames: 0 },
      bg: {
        type: "flat",
        colors: ["#121A26"],
        set: "none",
        texture: "none",
        stageMood: "slateEditorial",
        image: { path: img("s1_yale_lab"), opacity: 0.9, dim: 0.30, groundFog: 0.50, kenBurns: "pushIn" },
      },
      camera: { zoom: [1.05, 1.12], panX: [0, 0], panY: [0, -10] },
      characters: [
        {
          id: "elena-2",
          role: "host",
          action: "talk",
          expression: "happy",
          lookAt: "partner",
          says: { text: "Count every single blink...", at: 230 },
        },
        {
          id: "marcus-2",
          role: "partner",
          action: "idle",
          expression: "surprised",
          emotion: "lightbulb",
          emotionAt: 310,
          lookAt: "partner",
        },
      ],
      props: [
        {
          type: "customSvg",
          x: 960,
          y: 470,
          scale: 0.72,
          at: 190,
          customSvg: {
            viewBox: "0 0 320 140",
            paths: [
              { d: "M20,70 H300", stroke: "#F5B73B", strokeWidth: 5, opacity: 0.85 },
              { d: "M100,70 Q160,18 220,70 Q160,122 100,70 Z", fill: "#101319", stroke: "#F5B73B", strokeWidth: 6 },
              { d: "M160,70 m-18,0 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0", fill: "#2DD4BF" },
            ],
          },
        },
      ],
      texts: [],
    },
    {
      id: "s1-b4-study-results",
      fromFrame: 1260,
      durationFrames: 480,
      shot: "medium",
      depthCarry: true,
      transition: { type: "blurCut", frames: 12 },
      bg: { type: "flat", colors: ["#101319"], set: "none", texture: "none", stageMood: "obsidianGrid" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "cole-2",
          role: "researcher",
          action: "point",
          expression: "happy",
          holds: "notes",
        },
      ],
      props: [],
      texts: [],
      dataMatrix: {
        variant: "dualCurve",
        borderless: true,
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
      id: "s2-b1-melting-tension",
      fromFrame: 1740,
      durationFrames: 480,
      shot: "twoShot",
      transition: { type: "zoomPull", frames: 12 },
      bg: {
        type: "flat",
        colors: ["#170B0E"],
        set: "none",
        texture: "none",
        stageMood: "crimsonNight",
        image: { path: img("s2_warm_chat"), opacity: 0.9, dim: 0.28, groundFog: 0.50, kenBurns: "panRight" },
      },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "marcus-3",
          role: "partner",
          action: "talk",
          expression: "happy",
          lookAt: "partner",
          says: { text: "Brutally cold out there!", at: 35 },
        },
        {
          id: "clara-1",
          role: "stranger",
          action: "offer",
          holds: "letter",
          holdHalo: true,
          expression: "happy",
          lookAt: "partner",
          says: { text: "Come join us for dinner!", at: 315 },
        },
      ],
      props: [
        { type: "coffee", x: 960, y: 690, scale: 0.52, at: 15 },
      ],
      texts: [],
    },
    {
      id: "s2-b2-naked-city-anchor",
      fromFrame: 2220,
      durationFrames: 450,
      shot: "medium",
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#EFE7D6"], set: "none", texture: "none", stageMood: "warmParchment" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "elena-3",
          role: "host",
          action: "think",
          expression: "worried",
        },
      ],
      props: [],
      texts: [],
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
      id: "s2-b3-columbus-burden",
      fromFrame: 2670,
      durationFrames: 420,
      shot: "twoShot",
      transition: { type: "zoomPush", frames: 12 },
      bg: {
        type: "flat",
        colors: ["#121A26"],
        set: "none",
        texture: "none",
        stageMood: "slateEditorial",
        image: { path: img("s2_static_wall"), opacity: 0.88, dim: 0.32, groundFog: 0.52, kenBurns: "pushIn" },
      },
      camera: { zoom: [1, 1.03], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "marcus-4",
          role: "partner",
          action: "idle",
          expression: "blank",
          lookAt: "partner",
          says: { text: "Columbus.", at: 20 },
        },
        {
          id: "elena-4",
          role: "host",
          action: "think",
          expression: "worried",
          emotion: "sweat",
          emotionAt: 105,
          lookAt: "partner",
          says: { text: "Uh... what do I say?", at: 155 },
        },
      ],
      props: [
        { type: "boulder", x: 960, y: 540, scale: 0.65, arc: "grow", at: 70 },
      ],
      texts: [],
    },
    {
      id: "s2-b4-trampoline-equation",
      fromFrame: 3090,
      durationFrames: 390,
      shot: "insert",
      depthCarry: true,
      transition: { type: "slideCarryLeft", frames: 12 },
      bg: { type: "flat", colors: ["#121A26"], set: "none", texture: "none", stageMood: "slateEditorial" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      visualEquation: {
        layout: "borderless",
        title: "STATIC RESUME → CONVERSATIONAL TRAMPOLINE",
        subtitle: "Give them a hook they can actually bounce off",
        operator: "arrow",
        nodes: [
          { badge: "NAKED CITY", image: img("s2_static_wall"), label: "“Columbus, Ohio.”", sublabel: "Dead end — forces mental scrambling", tone: "danger" },
          { badge: "TRAMPOLINE", image: img("s2_trampoline"), label: "“Secret Product Testing Hub”", sublabel: "Gives them an effortless bounce", tone: "accent" },
          { badge: "PAYOFF", glyph: "★", label: "Instant Curiosity", sublabel: "Sparks natural follow-up questions", tone: "positive" },
        ],
        footnote: "Always attach one vivid hook to where you live or work.",
      },
    },

    // ── SLICE 3 (3480..5070, 53s @ ~34:30) ───────────────────────────────────
    {
      id: "s3-b1-lobby-to-boardroom",
      fromFrame: 3480,
      durationFrames: 540,
      shot: "wide",
      transition: { type: "blurCut", frames: 12 },
      bg: {
        type: "flat",
        colors: ["#101319"],
        set: "none",
        texture: "none",
        stageMood: "obsidianGrid",
        image: { path: img("s3_lobby_boardroom"), opacity: 0.92, dim: 0.24, groundFog: 0.48, kenBurns: "panRight" },
      },
      camera: { zoom: [1, 1.03], panX: [0, 0], panY: [0, 0] },
      characters: [
        {
          id: "elena-5",
          role: "host",
          x: 640,
          y: 610,
          scale: 0.60,
          body: "full",
          action: "walk",
          travel: [-220, 220],
          expression: "happy",
          lookAt: "partner",
        },
        {
          id: "clara-2",
          role: "stranger",
          x: 1380,
          y: 610,
          scale: 0.60,
          body: "full",
          flip: true,
          action: "talk",
          expression: "happy",
          lookAt: "partner",
          says: { text: "No one feels managed.", at: 360 },
        },
      ],
      props: [],
      texts: [
        { text: "CHOREOGRAPHING SAFETY · LOBBY TO BOARDROOM", x: 960, y: 120, size: 44, style: "box", boxColor: "rgba(16,19,25,0.82)", color: "#F5B73B", at: 18 },
      ],
    },
    {
      id: "s3-b2-sociopath-quadrant",
      fromFrame: 4020,
      durationFrames: 510,
      shot: "insert",
      depthCarry: true,
      transition: { type: "slideCarryUp", frames: 12 },
      bg: { type: "flat", colors: ["#19102E"], set: "none", texture: "none", stageMood: "deepViolet" },
      camera: { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] },
      characters: [],
      props: [],
      texts: [],
      dataMatrix: {
        variant: "quadrant2x2",
        borderless: true,
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
      characters: [],
      props: [],
      texts: [],
      comparisonGrid: {
        layout: "fullBleedSplit",
        title: "PLEASE DON'T DEPLOY ALL 92 TRICKS AT ONCE",
        columns: [
          {
            heading: "Mechanical Overload",
            tag: "MANIPULATIVE",
            tone: "danger",
            image: img("s3_robotic_overload"),
            bullets: ["Counting seconds before you smile", "Monitoring wrist angles & palm exposure"],
          },
          {
            heading: "Natural Integration",
            tag: "TRUE CHARISMA",
            tone: "positive",
            image: img("s3_natural_ease"),
            bullets: ["Practice one small habit at a time", "Let warmth become automatic"],
          },
        ],
      },
    },
  ],
};

const parsed = antidoteConfigSchema.parse(config);
const varietyStats = assertVariety(parsed);

const outDir = path.join(ROOT, "audit", "antidote-v2-pilot");
fs.mkdirSync(outDir, { recursive: true });
const cfgPath = path.join(outDir, "config.hybrid.json");
fs.writeFileSync(cfgPath, JSON.stringify(parsed, null, 2));

const manifest = {
  schema: "stills/1",
  name: "Antidote 2.1 Hybrid Pilot (How to Talk to Anyone)",
  composition: "Antidote-lab",
  entry: "src/index.ts",
  silent: true,
  gl: "default",
  shards: 4,
  extra: fs.readdirSync(path.join(ROOT, "public", "scenes", "antidote-v2-pilot"))
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => `public/scenes/antidote-v2-pilot/${f}`),
  jobs: [
    {
      id: "pilot-stills",
      config: "config.hybrid.json",
      frames: [220, 635, 1120, 1520, 2090, 2460, 2900, 3310, 3880, 4320, 4840],
    },
    { id: "clip-s1", config: "config.hybrid.json", frames: [], clip: { from: 0, to: 1739 } },
    { id: "clip-s2", config: "config.hybrid.json", frames: [], clip: { from: 1740, to: 3479 } },
    { id: "clip-s3", config: "config.hybrid.json", frames: [], clip: { from: 3480, to: 5069 } },
  ],
};
const manifestPath = path.join(outDir, "manifest.hybrid.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✓ Wrote ${path.relative(ROOT, cfgPath)} (${parsed.scenes.length} scenes, ${parsed.captions.length} captions, ${parsed.meta.durationInFrames} frames)`);
console.log(`✓ Variety stats:`, JSON.stringify(varietyStats));
console.log(`✓ Wrote ${path.relative(ROOT, manifestPath)}`);
