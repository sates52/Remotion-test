#!/usr/bin/env node
/**
 * qa-stills-pixel.js — Post-render Pixel QA on cloud-rendered PNG stills.
 *
 * Usage:
 *   node scripts/qa-stills-pixel.js --dir=<stills-dir> [--polarity=dark|light] [--strict-motion] [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { decode } = require("./lib/png-lite");

function compareFramePair(bufA, bufB, opts = {}) {
  const a = decode(bufA);
  const b = decode(bufB);
  if (a.width !== b.width || a.height !== b.height) {
    return {
      ok: false,
      changedPixelRatio: 0,
      meanAbsDiff: 0,
      reason: `dimension mismatch (${a.width}x${a.height} vs ${b.width}x${b.height})`,
    };
  }
  const step = opts.step ?? 4;
  const captionTopRatio = opts.captionTopRatio ?? 0.84;
  const minChangedRatio = opts.minChangedRatio ?? 0.015;
  const maxY = Math.floor(a.height * captionTopRatio);
  let total = 0;
  let changed = 0;
  let diffSum = 0;
  for (let y = 0; y < maxY; y += step) {
    for (let x = 0; x < a.width; x += step) {
      const idx = (y * a.width + x) * 4;
      const dr = Math.abs(a.data[idx] - b.data[idx]);
      const dg = Math.abs(a.data[idx + 1] - b.data[idx + 1]);
      const db = Math.abs(a.data[idx + 2] - b.data[idx + 2]);
      const maxD = Math.max(dr, dg, db);
      if (maxD > 18) changed++;
      diffSum += (dr + dg + db) / 3;
      total++;
    }
  }
  const changedPixelRatio = Number((changed / Math.max(1, total)).toFixed(4));
  const meanAbsDiff = Number((diffSum / Math.max(1, total)).toFixed(2));
  return {
    ok: changedPixelRatio >= minChangedRatio,
    changedPixelRatio,
    meanAbsDiff,
    sampledPixels: total,
  };
}

function findPairs(files) {
  const set = new Set(files);
  const pairs = [];
  for (const f of files) {
    if (f.endsWith("__t20.png")) {
      const b = f.replace(/__t20\.png$/, "__t75.png");
      if (set.has(b)) pairs.push([f, b]);
    } else if (f.endsWith("_start.png")) {
      const b = f.replace(/_start\.png$/, "_end.png");
      if (set.has(b)) pairs.push([f, b]);
    } else if (f.endsWith("_before.png")) {
      const b = f.replace(/_before\.png$/, "_after.png");
      if (set.has(b)) pairs.push([f, b]);
    }
  }
  return pairs;
}

if (require.main === module) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const m = a.match(/^--([^=]+)=(.*)$/);
      return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
    })
  );

  if (!args.dir) {
    console.error("usage: node scripts/qa-stills-pixel.js --dir=<stills-dir> [--polarity=dark|light] [--strict-motion] [--json]");
    process.exit(2);
  }

  const baseDir = path.resolve(String(args.dir));
  const rawDir = fs.existsSync(path.join(baseDir, "raw")) ? path.join(baseDir, "raw") : baseDir;
  if (!fs.existsSync(rawDir)) {
    console.error(`Directory not found: ${rawDir}`);
    process.exit(2);
  }

  const files = fs.readdirSync(rawDir).filter((f) => f.endsWith(".png")).sort();
  const errors = [];
  const warnings = [];
  const stats = [];
  const pairs = [];

  for (const f of files) {
    const buf = fs.readFileSync(path.join(rawDir, f));
    const { width, height, data: rgba } = decode(buf);
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const luma = 0.2126 * rgba[idx] + 0.7152 * rgba[idx + 1] + 0.0722 * rgba[idx + 2];
        sum += luma;
        sumSq += luma * luma;
        count++;
      }
    }
    const mean = sum / Math.max(1, count);
    const variance = sumSq / Math.max(1, count) - mean * mean;
    const std = Math.sqrt(Math.max(0, variance));

    if (std < 6) {
      errors.push(`${f}: blank/solid frame detected (luma std=${std.toFixed(2)})`);
    }
    if (args.polarity === "dark" && mean > 170) {
      warnings.push(`${f}: expected dark polarity but mean luma=${mean.toFixed(1)}`);
    }
    if (args.polarity === "light" && mean < 85) {
      warnings.push(`${f}: expected light polarity but mean luma=${mean.toFixed(1)}`);
    }
    stats.push({ file: f, width, height, meanLuma: Number(mean.toFixed(1)), lumaStd: Number(std.toFixed(1)) });
  }

  for (const [fa, fb] of findPairs(files)) {
    const res = compareFramePair(
      fs.readFileSync(path.join(rawDir, fa)),
      fs.readFileSync(path.join(rawDir, fb))
    );
    pairs.push({ a: fa, b: fb, ...res });
    if (!res.ok) {
      const msg = `${fa} -> ${fb}: low intra-scene pixel delta (${(res.changedPixelRatio * 100).toFixed(2)}% < 1.50%)`;
      if (args["strict-motion"]) errors.push(msg);
      else warnings.push(msg);
    }
  }

  const ok = errors.length === 0 && files.length > 0;
  if (args.json) {
    console.log(JSON.stringify({ ok, checked: files.length, pairs, errors, warnings, stats }, null, 2));
  } else {
    console.log(`Pixel QA: ${files.length} PNG(s), ${pairs.length} pair(s) in ${rawDir} — ${ok ? "PASS" : "FAIL"}`);
    for (const e of errors) console.log(`  ✗ ${e}`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  process.exit(ok ? 0 : 1);
}

module.exports = { compareFramePair, findPairs };
