#!/usr/bin/env node
"use strict";
/**
 * test-thumbnail-grammar.js — guard against the thumbnail system collapsing
 * back into one template (the 2026-09-24 bug: every book cinematic-bleed,
 * white/yellow, text left).
 *
 *   node scripts/test-thumbnail-grammar.js
 *
 * Pure checks, no render, no file writes:
 *  1. Simulated feed over every unpublished book: consecutive A thumbnails
 *     never share the same effective design, and >1 layout is used.
 *  2. Variants: A is never a text-only poster; B/C differ from A and each other
 *     by >= MIN_VARIANT_GAP design units.
 *  3. The TS slug-hash default (thumbnail-shared.ts) is not a constant.
 *  4. No fixed channel colour: CinematicBleed must not reference CTR_YELLOW.
 *  5. thumbnail-grammar.js refuses a published book.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { pickVariants, loadGrammarHistory, publishedSlugs, distance } = require("./lib/thumbnail-grammar");

const ROOT = path.join(__dirname, "..");
let failed = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "  ✓" : "  ✗"} ${msg}`);
  if (!ok) failed++;
};

const published = new Set(publishedSlugs(ROOT));
const engineOf = (slug) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "books", slug, "book.json"), "utf8").replace(/^﻿/, "")).engine === "antidote" ? "antidote" : "vox";
  } catch {
    return null;
  }
};
// the engine is read ONCE per book (2026-11-02): reading book.json twice raced with parallel tests that create and
// remove fixture books under books/ — the second read returned null and candidates(null) threw on the Linux runner
const engines = Object.fromEntries(fs.readdirSync(path.join(ROOT, "books")).map((s) => [s, engineOf(s)]));
const books = Object.keys(engines).filter((s) => !published.has(s) && engines[s]).sort();

// 1) + 2)
const history = loadGrammarHistory(ROOT, "__none__").filter((h) => h.published);
const layouts = new Set();
let prev = null;
let sameNeighbour = 0;
let variantProblems = [];
for (const slug of books) {
  const engine = engines[slug];
  const vs = pickVariants({ slug, engine, history, n: 3 });
  const a = vs[0];
  layouts.add(a.layout);
  if (prev && distance(a, prev) === 0) sameNeighbour++;
  if (a.layout === "text-poster") variantProblems.push(`${slug}: A is a text-only poster`);
  for (let i = 0; i < vs.length; i++)
    for (let j = i + 1; j < vs.length; j++)
      if (distance(vs[i], vs[j]) < 5) variantProblems.push(`${slug}: variants ${"ABC"[i]}/${"ABC"[j]} too close`);
  history.push({ slug, published: false, grammar: a });
  prev = a;
}
check(sameNeighbour === 0, `simulated feed of ${books.length} books: no two neighbours share a design (${sameNeighbour} repeats)`);
check(layouts.size > 1, `feed uses ${layouts.size} layouts (${[...layouts].join(", ")})`);
check(!variantProblems.length, `variants: A has a picture, B/C are distinct${variantProblems.length ? " — " + variantProblems.slice(0, 3).join("; ") : ""}`);

// 3) TS default is not a constant (read the source: pickLayout must use defaultGrammar)
const shared = fs.readFileSync(path.join(ROOT, "src", "engines", "thumbnail-shared.ts"), "utf8");
const pickLayoutBody = (shared.match(/export function pickLayout[\s\S]*?\n}/) || [""])[0];
check(/defaultGrammar\(/.test(pickLayoutBody) && !/return "cinematic-bleed"/.test(pickLayoutBody), "pickLayout() rotates via defaultGrammar (not a hard-coded layout)");

// 4) no fixed channel colour in the bleed
const vox = fs.readFileSync(path.join(ROOT, "src", "engines", "vox", "thumbnail.tsx"), "utf8");
const bleed = (vox.match(/export const CinematicBleed[\s\S]*?\n};/) || [""])[0];
check(bleed && !/CTR_YELLOW/.test(bleed), "CinematicBleed takes its accent from the book palette (no CTR_YELLOW)");

// 5) published books are refused
const pub = [...published][0];
if (pub) {
  let refused = false;
  try {
    execFileSync(process.execPath, [path.join(__dirname, "thumbnail-grammar.js"), `--slug=${pub}`, "--write"], { cwd: ROOT, stdio: "pipe" });
  } catch {
    refused = true;
  }
  check(refused, `thumbnail-grammar.js --write refuses published book (${pub})`);
}

// 6) Antidote 10x thumbnail pools (minorHarm: false vs true), PosterDrama10x, no CTR_YELLOW, letterbox + 168x94 check
{
  const { candidates, TENX_LAYOUTS } = require("./lib/thumbnail-grammar");
  const cStd = new Set(candidates("antidote", { is10x: true, minorHarm: false, hasCutout: true }).map((c) => c.layout));
  const cMh = new Set(candidates("antidote", { is10x: true, minorHarm: true, hasCutout: true }).map((c) => c.layout));
  check(TENX_LAYOUTS.has("poster-drama-10x"), "TENX_LAYOUTS includes poster-drama-10x");
  check(cStd.has("poster-drama-10x") && cStd.has("diagram-hook-10x") && cStd.has("cutout-hero-10x"), "minorHarm:false 10x pool includes poster-drama-10x, diagram-hook-10x, cutout-hero-10x");
  check(cMh.has("poster-drama-10x") && cMh.has("split-poster-10x") && cMh.has("editorial-cover-10x") && !cMh.has("cutout-hero-10x") && !cMh.has("diagram-hook-10x"), "minorHarm:true 10x pool isolates poster-drama/split-poster/editorial-cover (no cutout/diagram)");
  const antThumb = fs.readFileSync(path.join(ROOT, "src", "engines", "antidote", "Thumbnail.tsx"), "utf8");
  check(!/CTR_YELLOW/.test(antThumb), "Antidote 10x Thumbnail.tsx never references CTR_YELLOW");
  check(/PosterDrama10x/.test(antThumb) && /coverScale\s*=\s*Math\.max/.test(antThumb), "Antidote Thumbnail.tsx renders PosterDrama10x + zero-letterbox coverScale");

  const { analyzeLetterbox, analyzeBrowse168, W, H, BROWSE_W, BROWSE_H } = require("./lib/thumb-hook-check");
  // Synthetic 47% right-half letterbox frame (like legacy SplitPoster10x scale=0.35)
  const lbBuf = Buffer.alloc(W * H, 235);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W / 2; x++) lbBuf[y * W + x] = (x + y) % 2 === 0 ? 30 : 210;
    if (y >= 44 && y < 136) {
      for (let x = W / 2; x < W; x++) lbBuf[y * W + x] = 60 + ((x * 7 + y * 3) % 90);
    }
  }
  const lbRes = analyzeLetterbox(lbBuf, W, H);
  check(lbRes.warning === true && lbRes.letterboxBlankPct > 40, `letterboxBlankPct catches split-half letterbox (${lbRes.letterboxBlankPct}%)`);

  // Synthetic full-bleed high-contrast frame (0% letterbox)
  const fullBuf = Buffer.alloc(W * H, 0);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) fullBuf[y * W + x] = (x * 13 + y * 29) % 240;
  const fullLb = analyzeLetterbox(fullBuf, W, H);
  check(fullLb.warning === false && fullLb.letterboxBlankPct === 0, `letterboxBlankPct passes zero-letterbox frame (${fullLb.letterboxBlankPct}%)`);

  // Synthetic 168x94 browse contrast + hook check
  const b1 = Buffer.alloc(BROWSE_W * BROWSE_H, 25);
  const b2 = Buffer.alloc(BROWSE_W * BROWSE_H, 25);
  for (let y = 0; y < BROWSE_H; y++) {
    for (let x = 0; x < BROWSE_W; x++) {
      const base = x > 84 ? ((x * 5 + y * 11) % 200) + 40 : 22;
      b1[y * BROWSE_W + x] = base;
      b2[y * BROWSE_W + x] = base;
      if (x >= 10 && x <= 74 && y >= 24 && y <= 64 && (x + y) % 2 === 0) b1[y * BROWSE_W + x] = 245;
    }
  }
  const bRes = analyzeBrowse168(b1, b2, BROWSE_W, BROWSE_H);
  check(bRes.browseOk === true && bRes.hookChanged168Pct > 5, `browse168Check passes high-contrast legible cover (${bRes.detail})`);
}

console.log(failed ? `\n✗ ${failed} check(s) failed` : "\n✓ thumbnail grammar OK");
process.exit(failed ? 1 : 0);
