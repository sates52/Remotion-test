/**
 * compile-10x-cues.js — Compiles spoken `*Cue` / `cue` phrases on 10x devices
 * into scene-relative frame numbers, strips helper cue keys, clamps action cues
 * so animations land cleanly before the 70% frame, warns on unmatched cues,
 * and auto-staggers long scenes.
 */
const { DEVICE_10X_KEYS } = require("./antidote-10x-keys");

const FILLER_STOP = new Set(["the", "a", "an", "to", "of", "in", "on", "at", "is", "are", "was", "were", "just", "very", "really", "actually", "so", "that", "and", "or"]);

function normPhrase(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normLoose(w) {
  const s = String(w || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (s.length <= 3) return s;
  return s.replace(/(ingly|edly|ation|ment|ness|ing|ies|ied|ed|es|s)$/, (m) => (m === "ies" ? "y" : ""));
}

function findCueFrame(phrase, { words = [], beatStartSec = 0, durationFrames = 180, fps = 30 } = {}) {
  const target = normPhrase(phrase);
  if (!target || !Array.isArray(words) || !words.length) return null;
  const tWords = target.split(" ").filter(Boolean);
  if (!tWords.length) return null;

  const wNorm = words.map((w) => {
    const txt = normPhrase(w.w ?? w.word ?? "");
    return {
      txt,
      loose: normLoose(txt),
      startSec: w.start != null ? Number(w.start) : Number(w.s ?? 0) / fps,
    };
  });

  const clampFrame = (startSec) => {
    const rel = Math.round((startSec - beatStartSec) * fps);
    return Math.max(6, Math.min(Math.max(12, durationFrames - 18), rel));
  };

  // Pass 1: exact normalized contiguous match
  for (let i = 0; i <= wNorm.length - tWords.length; i++) {
    let ok = true;
    for (let j = 0; j < tWords.length; j++) {
      if (wNorm[i + j].txt !== tWords[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return clampFrame(wNorm[i].startSec);
  }

  // Pass 2: apostrophe-stripped + stem-normalized contiguous match
  const tLoose = tWords.map(normLoose).filter(Boolean);
  if (tLoose.length) {
    for (let i = 0; i <= wNorm.length - tLoose.length; i++) {
      let ok = true;
      for (let j = 0; j < tLoose.length; j++) {
        if (wNorm[i + j].loose !== tLoose[j]) {
          ok = false;
          break;
        }
      }
      if (ok) return clampFrame(wNorm[i].startSec);
    }
  }

  // Pass 3: ordered content-word window match (allows up to 3 inserted/ASR-drifted words between anchors)
  const content = tLoose.filter((w) => w.length > 2 && !FILLER_STOP.has(w));
  if (content.length >= 2) {
    for (let i = 0; i < wNorm.length; i++) {
      if (wNorm[i].loose !== content[0]) continue;
      let cur = i;
      let matchedAll = true;
      for (let k = 1; k < content.length; k++) {
        let found = -1;
        const limit = Math.min(wNorm.length - 1, cur + 4);
        for (let m = cur + 1; m <= limit; m++) {
          if (wNorm[m].loose === content[k]) {
            found = m;
            break;
          }
        }
        if (found < 0) {
          matchedAll = false;
          break;
        }
        cur = found;
      }
      if (matchedAll) return clampFrame(wNorm[i].startSec);
    }
  }

  return null;
}

const TOP_CUE_MAP = [
  ["tossCue", "tossAt"],
  ["splitCue", "splitAt"],
  ["wipeCue", "wipeAt"],
  ["zoomCue", "zoomAt"],
  ["expandCue", "expandAt"],
  ["calloutCue", "calloutAt"],
  ["loopCue", "loopAt"],
  ["breakCue", "breakAt"],
  ["revealLessonCue", "revealLessonAt"],
  ["synthesisCue", "synthesisAt"],
  ["payoffCue", "payoffAt"],
  ["changeCue", "changeAt"],
];

const ARRAY_KEYS = [
  "events", "lines", "panels", "circles", "layers", "items", "stages",
  "epochs", "stations", "actors", "props", "connectors", "blocks", "channels",
  "branches", "leftWeights", "rightWeights", "spotlights", "stickers", "traces",
  "pillars", "steps",
];

function recordUnmatched(ctx, scene, dk, cueKey, phrase) {
  const msg = `[compile-10x-cues] unmatched ${dk}.${cueKey}="${phrase}" in ${scene.id || "scene"} (spoken words did not match)`;
  if (Array.isArray(ctx.warnings)) ctx.warnings.push(msg);
  if (Array.isArray(ctx.unmatchedCues)) ctx.unmatchedCues.push({ sceneId: scene.id || null, device: dk, key: cueKey, phrase });
  if (!ctx.quiet && Array.isArray(ctx.words) && ctx.words.length > 0) {
    console.warn(`  ⚠ ${msg}`);
  }
}

function compile10xCues(scene, ctx = {}) {
  if (!scene || typeof scene !== "object") return scene;
  const dur = Math.max(30, ctx.durationFrames || scene.durationFrames || 180);
  const maxReveal = Math.max(24, Math.round(dur * 0.72));
  const maxAction = Math.max(30, dur - 24);
  const maxWipeAt = Math.max(18, Math.round(dur * 0.52));
  const maxStrikeAt = Math.max(18, Math.round(dur * 0.58));

  for (const dk of DEVICE_10X_KEYS) {
    const dev = scene[dk];
    if (!dev || typeof dev !== "object") continue;

    if (typeof dev.at === "number" && dev.at > 18) dev.at = 12;

    for (const [cueKey, atKey] of TOP_CUE_MAP) {
      if (dev[cueKey] != null) {
        const rawPhrase = dev[cueKey];
        const f = findCueFrame(rawPhrase, { ...ctx, durationFrames: dur });
        if (f != null && dev[atKey] == null) dev[atKey] = f;
        else if (f == null && dev[atKey] == null) recordUnmatched(ctx, scene, dk, cueKey, rawPhrase);
        delete dev[cueKey];
      }
      if (typeof dev[atKey] === "number") {
        const hi = atKey === "wipeAt" ? Math.min(Math.max(24, dur - 30), maxWipeAt) : Math.max(24, dur - 30);
        dev[atKey] = Math.max(12, Math.min(hi, dev[atKey]));
      }
    }

    for (const arrKey of ARRAY_KEYS) {
      const arr = dev[arrKey];
      if (!Array.isArray(arr) || !arr.length) continue;
      let anyExplicitAt = false;
      for (const item of arr) {
        if (!item || typeof item !== "object") continue;
        if (item.cue != null) {
          const rawPhrase = item.cue;
          const f = findCueFrame(rawPhrase, { ...ctx, durationFrames: dur });
          if (f != null && item.at == null) item.at = f;
          else if (f == null && item.at == null) recordUnmatched(ctx, scene, dk, `${arrKey}[].cue`, rawPhrase);
          delete item.cue;
        }
        for (const [ck, ak] of [["strikeCue", "strikeAt"], ["pruneCue", "pruneAt"], ["changeCue", "changeAt"]]) {
          if (item[ck] != null) {
            const rawPhrase = item[ck];
            const f = findCueFrame(rawPhrase, { ...ctx, durationFrames: dur });
            if (f != null && item[ak] == null) item[ak] = f;
            else if (f == null && item[ak] == null) recordUnmatched(ctx, scene, dk, `${arrKey}[].${ck}`, rawPhrase);
            delete item[ck];
          }
        }
        if (typeof item.at === "number") anyExplicitAt = true;
      }
      if (dur > 240 && !anyExplicitAt && arr.length >= 2) {
        const span = Math.max(36, dur - 60);
        arr.forEach((item, idx) => {
          if (item && typeof item === "object" && item.at == null) {
            item.at = Math.round(12 + (idx * span) / Math.max(1, arr.length - 1));
          }
        });
      }
      // Clamp/rescale out-of-bounds authored `at` & `*At` timestamps so scenes never stay blank at 70% frame
      const atVals = arr.map((it) => (it && typeof it.at === "number" ? it.at : null)).filter((v) => v !== null);
      if (atVals.length) {
        const minAt = Math.min(...atVals);
        const maxAt = Math.max(...atVals);
        if (minAt > 36 || maxAt > maxReveal) {
          const targetMax = Math.min(maxAt, maxReveal);
          for (const item of arr) {
            if (item && typeof item.at === "number") {
              item.at = maxAt === minAt
                ? 12
                : Math.round(10 + ((item.at - minAt) / (maxAt - minAt)) * Math.max(12, targetMax - 10));
            }
          }
        }
      }
      for (const item of arr) {
        if (!item || typeof item !== "object") continue;
        const baseAt = typeof item.at === "number" ? item.at : 10;
        for (const ak of ["strikeAt", "pruneAt", "changeAt"]) {
          if (typeof item[ak] === "number") {
            const cap = ak === "strikeAt" ? Math.min(maxAction, maxStrikeAt) : maxAction;
            const lo = Math.min(cap, baseAt + 10);
            item[ak] = Math.max(lo, Math.min(cap, item[ak]));
          }
        }
      }
    }
  }
  ensureMotionPacing(scene, dur);
  return scene;
}

/**
 * Ensures no 10x scene holds static for > 7.5s (225 frames) by injecting
 * gentle midpoint `camera.pulses` into any >225f gap between authored reveals.
 */
function ensureMotionPacing(scene, dur) {
  if (!scene || typeof scene !== "object") return scene;
  const d = Math.max(30, dur || scene.durationFrames || 180);
  if (d <= 240) return scene;

  const times = [0, d];
  const pushAt = (v) => {
    if (typeof v === "number" && v >= 0 && v <= d) times.push(v);
  };
  for (const dk of DEVICE_10X_KEYS) {
    const dev = scene[dk];
    if (!dev || typeof dev !== "object") continue;
    for (const k of ["at", "tossAt", "splitAt", "wipeAt", "zoomAt", "expandAt", "calloutAt", "verdictAt", "footnoteAt", "loopAt", "payoffAt", "changeAt"]) {
      pushAt(dev[k]);
    }
    if (dev.intersection) pushAt(dev.intersection.at);
    if (dev.banner) pushAt(dev.banner.at);
    for (const arrKey of [...ARRAY_KEYS, "highlightPhrases", "points"]) {
      const arr = dev[arrKey];
      if (!Array.isArray(arr)) continue;
      for (const it of arr) {
        if (!it || typeof it !== "object") continue;
        pushAt(it.at);
        pushAt(it.strikeAt);
        pushAt(it.pruneAt);
        pushAt(it.changeAt);
      }
    }
  }
  if (scene.camera?.punch) pushAt(scene.camera.punch.at);
  for (const p of scene.camera?.pulses ?? []) pushAt(p);

  const sorted = [...new Set(times)].sort((a, b) => a - b);
  const injected = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > 225) {
      const steps = Math.ceil(gap / 200);
      for (let k = 1; k < steps; k++) {
        injected.push(Math.round(sorted[i - 1] + (gap * k) / steps));
      }
    }
  }
  if (injected.length) {
    const existing = Array.isArray(scene.camera?.pulses) ? scene.camera.pulses : [];
    const merged = [...new Set([...existing, ...injected])].sort((a, b) => a - b);
    scene.camera = { ...(scene.camera || { zoom: [1, 1.02], panX: [0, 0], panY: [0, 0] }), pulses: merged };
  }
  return scene;
}

module.exports = { compile10xCues, findCueFrame, ensureMotionPacing };
