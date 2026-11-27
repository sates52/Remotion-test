"use strict";
/**
 * thumb-hook-check.js — thumbnail hook visibility + letterbox + 168×94 browse check.
 *
 * 1. Hook visibility (320×180): render the same still with and without hook text;
 *    measure % of pixels that change by > DELTA (must be ≥ 0.8%).
 * 2. Letterbox guard (320×180): detect symmetric uniform top+bottom (or left+right)
 *    letterbox bars across the full frame OR inside either half of a split layout
 *    (requiring a crisp full-width horizontal seam at both bar boundaries so genuine
 *    typographic columns are not false-flagged). Warns/guards when > 18%.
 * 3. Browse-size 168×94 check: downscale to YouTube browse-feed size (168×94) and
 *    measure luminance contrast stddev, dynamic range (p95 - p5), edge fill, and
 *    hook pixel change at 168px.
 */
const { spawnSync } = require("child_process");

const W = 320, H = 180;
const BROWSE_W = 168, BROWSE_H = 94;
const DELTA = 48;            // gray-level change that counts as "the hook drew here" (contrast, not anti-alias noise)
const MIN_CHANGED = 0.008;   // ≥ 0.8 % of the frame must change for the hook to count as visible
const MAX_LETTERBOX_BLANK_PCT = 18;

/** Grayscale w×h bytes of an image file (ffmpeg), or null. */
function grayOfSize(file, w, h) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 24 });
  return r.status === 0 && r.stdout && r.stdout.length === w * h ? r.stdout : null;
}

/** Grayscale W×H bytes of an image file (ffmpeg), or null. */
function grayOf(file) {
  return grayOfSize(file, W, H);
}

/** Share of pixels the hook changed (with vs without). */
function hookDiff(withHook, withoutHook) {
  if (!withHook || !withoutHook || withHook.length !== withoutHook.length) return null;
  let n = 0;
  for (let i = 0; i < withHook.length; i++) if (Math.abs(withHook[i] - withoutHook[i]) > DELTA) n++;
  return n / withHook.length;
}

/** Verdict for one variant. */
function hookVisibility(withHook, withoutHook) {
  const changed = hookDiff(withHook, withoutHook);
  if (changed == null) return { hookVisible: null, changedPct: null, detail: "could not read one of the two renders" };
  const hookVisible = changed >= MIN_CHANGED;
  return { hookVisible, changedPct: +(changed * 100).toFixed(2), detail: `${(changed * 100).toFixed(2)}% of pixels change with the hook (visible ≥ ${MIN_CHANGED * 100}%)` };
}

/** Row stats within [x0, x1) for grayscale buffer `buf` (stride `w`). */
function rowStats(buf, w, y, x0, x1) {
  const len = x1 - x0;
  let sum = 0;
  const off = y * w;
  for (let x = x0; x < x1; x++) sum += buf[off + x];
  const mean = sum / len;
  let v = 0;
  for (let x = x0; x < x1; x++) {
    const d = buf[off + x] - mean;
    v += d * d;
  }
  return { mean, std: Math.sqrt(v / len) };
}

/**
 * Measure symmetric uniform top+bottom letterbox blank fraction within horizontal slice [x0, x1).
 * Requires:
 *  - top and bottom uniform bands (row std < 4.5, within ±8 gray levels of the border mean)
 *  - matching bar luminance (|topMean - botMean| < 12)
 *  - if `requireSeam`: sharp horizontal seam at BOTH inner boundaries (≥ 70% of columns jump > 10),
 *    which distinguishes a letterboxed 16:9 viewport from a centered text column.
 */
function horizontalBandBlankPct(buf, w, h, x0, x1, requireSeam) {
  const span = x1 - x0;
  if (span < 20) return 0;
  const topSeed = rowStats(buf, w, 0, x0, x1);
  const botSeed = rowStats(buf, w, h - 1, x0, x1);
  if (topSeed.std > 4.5 || botSeed.std > 4.5) return 0;
  if (Math.abs(topSeed.mean - botSeed.mean) > 12) return 0;

  let topRows = 0;
  for (let y = 0; y < Math.floor(h * 0.45); y++) {
    const s = rowStats(buf, w, y, x0, x1);
    if (s.std <= 4.5 && Math.abs(s.mean - topSeed.mean) <= 8) topRows++;
    else break;
  }
  let botRows = 0;
  for (let y = h - 1; y >= Math.ceil(h * 0.55); y--) {
    const s = rowStats(buf, w, y, x0, x1);
    if (s.std <= 4.5 && Math.abs(s.mean - botSeed.mean) <= 8) botRows++;
    else break;
  }
  const minBar = Math.max(4, Math.floor(h * 0.05));
  if (topRows < minBar || botRows < minBar) return 0;

  if (requireSeam) {
    const seamCoverage = (yBar, yInner) => {
      if (yInner < 0 || yInner >= h) return 0;
      let jumped = 0;
      for (let x = x0; x < x1; x++) {
        if (Math.abs(buf[yInner * w + x] - buf[yBar * w + x]) > 10) jumped++;
      }
      return jumped / span;
    };
    const topSeam = Math.max(seamCoverage(topRows - 1, topRows), seamCoverage(topRows - 1, topRows + 1));
    const botSeam = Math.max(seamCoverage(h - botRows, h - botRows - 1), seamCoverage(h - botRows, h - botRows - 2));
    if (topSeam < 0.7 || botSeam < 0.7) return 0;
  }

  return +(((topRows + botRows) / h) * 100).toFixed(2);
}

/** Analyze a W×H grayscale buffer for accidental letterboxing (full-frame or split-half). */
function analyzeLetterbox(buf, w = W, h = H) {
  if (!buf || buf.length !== w * h) {
    return { letterboxBlankPct: null, fullFramePct: null, leftHalfPct: null, rightHalfPct: null, warning: false };
  }
  const fullFramePct = horizontalBandBlankPct(buf, w, h, 0, w, false);
  const half = Math.floor(w / 2);
  // Inset slightly from edges/center divider (6px) to avoid panel border strokes.
  const leftHalfPct = horizontalBandBlankPct(buf, w, h, 6, half - 6, true);
  const rightHalfPct = horizontalBandBlankPct(buf, w, h, half + 6, w - 6, true);
  const letterboxBlankPct = Math.max(fullFramePct, leftHalfPct, rightHalfPct);
  return {
    letterboxBlankPct,
    fullFramePct,
    leftHalfPct,
    rightHalfPct,
    warning: letterboxBlankPct > MAX_LETTERBOX_BLANK_PCT,
  };
}

/** Measure letterbox blank % on a rendered PNG file (or pass Buffer directly). */
function letterboxBlankPct(fileOrBuf) {
  const buf = Buffer.isBuffer(fileOrBuf) ? fileOrBuf : grayOf(fileOrBuf);
  return analyzeLetterbox(buf, W, H);
}

/** Pure 168×94 downscaled contrast, fill, and hook-delta analysis. */
function analyzeBrowse168(bufWith, bufWithout = null, w = BROWSE_W, h = BROWSE_H) {
  if (!bufWith || bufWith.length !== w * h) {
    return { browseOk: null, contrastStd168: null, dynamicRange168: null, edgeDensity168: null, hookChanged168Pct: null, detail: "could not read 168x94 render" };
  }
  const n = bufWith.length;
  let sum = 0;
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const v = bufWith[i];
    sum += v;
    hist[v]++;
  }
  const mean = sum / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) {
    const d = bufWith[i] - mean;
    varSum += d * d;
  }
  const contrastStd168 = +Math.sqrt(varSum / n).toFixed(2);

  const percentile = (p) => {
    const target = Math.floor(n * p);
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= target) return v;
    }
    return 255;
  };
  const dynamicRange168 = percentile(0.95) - percentile(0.05);

  let strongEdges = 0;
  const innerCount = (w - 2) * (h - 2);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = Math.abs(bufWith[y * w + (x + 1)] - bufWith[y * w + (x - 1)]);
      const gy = Math.abs(bufWith[(y + 1) * w + x] - bufWith[(y - 1) * w + x]);
      if (gx + gy > 24) strongEdges++;
    }
  }
  const edgeDensity168 = +((strongEdges / Math.max(1, innerCount)) * 100).toFixed(2);

  let hookChanged168Pct = null;
  if (bufWithout && bufWithout.length === n) {
    let ch = 0;
    for (let i = 0; i < n; i++) if (Math.abs(bufWith[i] - bufWithout[i]) > 40) ch++;
    hookChanged168Pct = +((ch / n) * 100).toFixed(2);
  }

  const browseOk =
    contrastStd168 >= 24 &&
    dynamicRange168 >= 90 &&
    edgeDensity168 >= 8 &&
    (hookChanged168Pct == null || hookChanged168Pct >= 0.7);

  return {
    browseOk,
    contrastStd168,
    dynamicRange168,
    edgeDensity168,
    hookChanged168Pct,
    detail: `168×94 std=${contrastStd168} range=${dynamicRange168} fill=${edgeDensity168}%${hookChanged168Pct != null ? ` hook=${hookChanged168Pct}%` : ""}`,
  };
}

/** Downscale PNG(s) to 168×94 via ffmpeg and run browse-size contrast/fill check. */
function browse168Check(withHookFile, withoutHookFile = null) {
  const b1 = grayOfSize(withHookFile, BROWSE_W, BROWSE_H);
  const b2 = withoutHookFile ? grayOfSize(withoutHookFile, BROWSE_W, BROWSE_H) : null;
  return analyzeBrowse168(b1, b2, BROWSE_W, BROWSE_H);
}

module.exports = {
  grayOf,
  grayOfSize,
  hookDiff,
  hookVisibility,
  analyzeLetterbox,
  letterboxBlankPct,
  analyzeBrowse168,
  browse168Check,
  W,
  H,
  BROWSE_W,
  BROWSE_H,
  DELTA,
  MIN_CHANGED,
  MAX_LETTERBOX_BLANK_PCT,
};
