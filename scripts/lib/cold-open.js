/**
 * cold-open.js — Antidote 10x Phase 3 ColdOpenDirector.
 *
 * Syncs 100% to the incoming NotebookLM audio (zero operator voice recording)
 * and choreographs the first 0:00–0:50s to crush the 0:30 -> 1:00 retention drop-off.
 */

const HOOK_DEVICE_MAP = {
  scene: {
    devices: ["annotatedScene(dollyZoom)", "upClose", "cutoutStage"],
    transition: "pushThrough",
    note: "Drop straight into the physical scene on frame 0 with dollyZoom or upClose.",
  },
  belief: {
    devices: ["crumpleToss", "kineticManifesto", "beforeAfterWipe"],
    transition: "whipPan",
    note: "State the common myth, then visually shatter/toss it on the narrator's turn.",
  },
  number: {
    devices: ["statSlam", "barRace", "cohortGrid"],
    transition: "pushThrough",
    note: "Slam the exact spoken number/cost immediately, then show its scale.",
  },
  ending: {
    devices: ["upClose", "annotatedScene(dollyZoom)", "timelineScrub"],
    transition: "focusPull",
    note: "Open on the final image/decision, then rewind the timeline.",
  },
  object: {
    devices: ["upClose", "annotatedScene", "explodedView"],
    transition: "focusPull",
    note: "Spotlight the signature object in frame 1 and zoom into its consequence.",
  },
  question: {
    devices: ["kineticManifesto", "decisionTree", "spatialJourney"],
    transition: "pushThrough",
    note: "Put the urgent question on stage cleanly and branch the stakes.",
  },
  contrast: {
    devices: ["beforeAfterWipe", "balanceScale", "comparisonGrid"],
    transition: "whipPan",
    note: "Split the two opposing choices side-by-side from second 1.",
  },
  confession: {
    devices: ["crumpleToss", "editorialSpread", "kineticManifesto"],
    transition: "focusPull",
    note: "Frame the misreading first, then strike/replace it with the book's scene.",
  },
};

function coldOpenRulesBlock(opening) {
  if (!opening || !opening.hook) return "";
  const spec = HOOK_DEVICE_MAP[opening.hook] || HOOK_DEVICE_MAP.scene;
  return [
    "",
    "## Cold-Open Visual Choreography (0:00–0:50s — Synced to Incoming Audio)",
    `- Book opening hook: \`${opening.hook}\` (naming: \`${opening.naming || "early"}\`, promise: \`${opening.promise || "stake"}\`).`,
    `- Keep beats in the first 50s (\`coldOpen: true\`) tight (**6–12s** per visual shift, never a 25s static hold).`,
    `- Preferred 10x opening devices: ${spec.devices.join(", ")}.`,
    `- Direction: ${spec.note}`,
  ].join("\n");
}

function applyColdOpenDirection(scene, { index = 0, fromSec = 999, opening = null, pack = null, authorContinue = false } = {}) {
  if (!scene || typeof scene !== "object" || fromSec >= 50) return scene;

  // Energetic cold-open camera momentum without breaking authored zoom
  const cam = scene.camera || { zoom: [1, 1], panX: [0, 0], panY: [0, 0] };
  const z0 = Array.isArray(cam.zoom) ? cam.zoom[0] : 1;
  const z1 = Array.isArray(cam.zoom) ? cam.zoom[1] : 1;
  if (Math.abs(z1 - z0) < 0.025) {
    scene.camera = { ...cam, zoom: [z0, Number((z0 + 0.042).toFixed(3))] };
  }

  // Hook-aligned transition for fast opening cuts (unless authored or continued)
  if (index > 0 && !authorContinue) {
    const hookSpec = opening && opening.hook ? HOOK_DEVICE_MAP[opening.hook] : null;
    const tType = (hookSpec && hookSpec.transition) || (pack && pack.polarity === "light" ? "paperTear" : "pushThrough");
    scene.transition = {
      ...(scene.transition || {}),
      type: tType,
      frames: 12,
    };
  }

  return scene;
}

module.exports = { HOOK_DEVICE_MAP, coldOpenRulesBlock, applyColdOpenDirection };
