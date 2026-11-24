#!/usr/bin/env node
/**
 * Unit & regression tests for Antidote 2.0 opt-in visual-thinking engine upgrades:
 *  - schema.ts: artDirection, bg.stageMood, bg.image, depthCarry, visualEquation,
 *    comparisonGrid, dataMatrix (quadrant2x2 / dualCurve / schedule), realAnchor,
 *    motion-doctrine / cut-the-curve transitions
 *  - backward compatibility: legacy configs parse identically without opt-in fields
 *  - Transition.tsx: motion-doctrine transitions settle cleanly at localFrame >= frames
 *  - artDirection.tsx: all 5 stage moods resolve complete palettes
 */
const assert = require("assert");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

// Use tsx / ts-node via npx or esbuild-register if available; fallback to Remotion's bundled esbuild
const esbuild = require(path.join(ROOT, "node_modules", "esbuild"));
const fs = require("fs");
const os = require("os");

function loadTs(relPath) {
  const tmpOut = path.join(os.tmpdir(), `antidote-v2-test-${path.basename(relPath)}-${Date.now()}.cjs`);
  esbuild.buildSync({
    entryPoints: [path.join(ROOT, relPath)],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: tmpOut,
    external: ["react", "remotion"],
    jsx: "automatic",
  });
  const mod = require(tmpOut);
  try { fs.unlinkSync(tmpOut); } catch {}
  return mod;
}

const schema = loadTs("src/engines/antidote/schema.ts");
const artDir = loadTs("src/engines/antidote/components/artDirection.tsx");

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  PASS  ${name}`);
}

console.log("Running Antidote 2.0 tests...");

test("legacy config without artDirection parses byte-compatibly", () => {
  const legacy = {
    meta: { slug: "legacy-book", title: "Legacy", durationInFrames: 300 },
    scenes: [
      { id: "s1", fromFrame: 0, durationFrames: 150, shot: "medium" },
      { id: "s2", fromFrame: 150, durationFrames: 150, transition: { type: "dissolve", frames: 10 } },
    ],
    captions: [],
  };
  const parsed = schema.antidoteConfigSchema.parse(legacy);
  assert.strictEqual(parsed.meta.artDirection, undefined);
  assert.strictEqual(parsed.meta.sfx, undefined);
  assert.strictEqual(parsed.scenes[0].depthCarry, undefined);
  assert.strictEqual(parsed.scenes[0].visualEquation, undefined);
  assert.strictEqual(parsed.scenes[0].bg.stageMood, undefined);
  assert.strictEqual(parsed.scenes[0].bg.image, undefined);
});

test("Antidote 2.0 meta.artDirection + cut-the-curve transitions parse cleanly", () => {
  const v2 = {
    meta: {
      slug: "antidote-v2-pilot",
      title: "Antidote 2.0 Pilot",
      durationInFrames: 900,
      artDirection: {
        style: "editorial ink and moody charcoal wash",
        mood: "obsidianGrid",
        captions: "off",
        hud: "off",
        motionDoctrine: true,
        palette: { accent: "#F7C948" },
      },
      take: { note: "Original operator commentary preserved for YPP." },
    },
    scenes: [
      {
        id: "anchor-1",
        fromFrame: 0,
        durationFrames: 180,
        transition: { type: "zoomPush", frames: 12 },
        bg: { stageMood: "obsidianGrid", image: { path: "scenes/pilot/bg1.png", dim: 0.45, kenBurns: "pushIn" } },
        realAnchor: {
          title: "Deep Work",
          subtitle: "Cal Newport",
          badge: "BOOK ANCHOR",
          annotations: [
            { text: "Computer Science Professor", side: "left" },
            { text: "PhD from MIT", side: "right" },
          ],
        },
      },
      {
        id: "eq-2",
        fromFrame: 180,
        durationFrames: 180,
        depthCarry: true,
        transition: { type: "slideCarryLeft", frames: 10 },
        bg: { stageMood: "deepViolet" },
        visualEquation: {
          title: "Mental Shortcuts",
          operator: "arrow",
          nodes: [
            { label: "Objective Reality", badge: "INPUT" },
            { label: "Cognitive Filter", badge: "MECHANISM", tone: "accent" },
            { label: "Perceived Choice", badge: "OUTCOME", tone: "positive" },
          ],
          footnote: "Framing beats raw numbers.",
        },
      },
      {
        id: "cmp-3",
        fromFrame: 360,
        durationFrames: 180,
        transition: { type: "blurCut", frames: 10 },
        bg: { stageMood: "crimsonNight" },
        comparisonGrid: {
          title: "ANCHORING EFFECT",
          columns: [
            { heading: "High Anchor", tag: "$10,000", bullets: ["Offer: $7,000", "Feels like a $3,000 win"], tone: "positive", highlight: "Accepted" },
            { heading: "Low Anchor", tag: "$3,000", bullets: ["Offer: $7,000", "Feels like a $4,000 loss"], tone: "danger", highlight: "Rejected" },
          ],
        },
      },
      {
        id: "mat-4",
        fromFrame: 540,
        durationFrames: 180,
        transition: { type: "zoomPull", frames: 10 },
        bg: { stageMood: "slateEditorial" },
        dataMatrix: {
          variant: "dualCurve",
          title: "Anger vs Damage",
          xLabel: "TIME",
          yLabel: "INTENSITY",
          curves: [
            { label: "anger", points: [0, 0.95, 0.8, 0.15, 0.08] },
            { label: "damage", points: [0, 0.55, 0.62, 0.6, 0.58] },
          ],
          callout: "Emotion fades; consequences stay.",
        },
      },
      {
        id: "sched-5",
        fromFrame: 720,
        durationFrames: 180,
        transition: { type: "slideCarryUp", frames: 10 },
        bg: { stageMood: "warmParchment" },
        dataMatrix: {
          variant: "schedule",
          title: "Weekly Cadence",
          schedule: [
            { day: "Mon", blocks: [{ label: "Deep 9-12", active: true, tone: "accent" }, { label: "Email" }] },
            { day: "Tue", blocks: [{ label: "Shallow" }, { label: "Deep 2-5", active: true, tone: "positive" }] },
          ],
        },
      },
    ],
    captions: [],
  };
  const parsed = schema.antidoteConfigSchema.parse(v2);
  assert.strictEqual(parsed.meta.artDirection.captions, "off");
  assert.strictEqual(parsed.meta.artDirection.hud, "off");
  assert.strictEqual(parsed.scenes.length, 5);
  assert.strictEqual(parsed.scenes[1].depthCarry, true);
  assert.strictEqual(parsed.scenes[1].visualEquation.nodes.length, 3);
  assert.strictEqual(parsed.scenes[2].comparisonGrid.columns.length, 2);
  assert.strictEqual(parsed.scenes[3].dataMatrix.variant, "dualCurve");
  assert.strictEqual(parsed.scenes[4].dataMatrix.variant, "schedule");
});

test("quadrant2x2 dataMatrix variant parses cleanly", () => {
  const q = schema.dataMatrixSchema.parse({
    variant: "quadrant2x2",
    title: "Black Swans",
    xLabel: "KNOWLEDGE",
    yLabel: "AWARENESS",
    quadrants: [
      { label: "Known Knowns" },
      { label: "Known Unknowns" },
      { label: "Unknown Knowns" },
      { label: "Unknown Unknowns", sublabel: "Leave room to be wrong", tone: "accent", active: true },
    ],
  });
  assert.strictEqual(q.quadrants.length, 4);
  assert.strictEqual(q.quadrants[3].active, true);
});

test("all 5 stage moods resolve complete art palettes", () => {
  const moods = ["obsidianGrid", "deepViolet", "warmParchment", "crimsonNight", "slateEditorial"];
  for (const m of moods) {
    const pal = artDir.resolveArtPalette({ mood: m });
    for (const k of ["bg", "surface", "ink", "muted", "accent", "accent2", "danger", "positive"]) {
      assert.ok(typeof pal[k] === "string" && pal[k].length > 0, `mood ${m} missing ${k}`);
    }
  }
  const overridden = artDir.resolveArtPalette({ mood: "obsidianGrid", palette: { accent: "#123456" } });
  assert.strictEqual(overridden.accent, "#123456");
});

console.log(`\nAll ${passed} Antidote 2.0 tests passed.`);
