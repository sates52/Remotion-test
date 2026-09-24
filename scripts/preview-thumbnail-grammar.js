#!/usr/bin/env node
"use strict";
/**
 * preview-thumbnail-grammar.js — channel-feed preview of the thumbnail grammar.
 *
 *   node scripts/preview-thumbnail-grammar.js --slugs=we-were-liars,dust,the-stranger
 *
 * Simulates publishing the given books IN THAT ORDER after the current channel
 * (each pick sees the ones before it), renders every Thumb-<slug> with its
 * picked grammar, and writes out/thumbnail-grammar-preview/{<slug>.png,
 * index.html, sheet-168.png}. Read-only for books/ — the grammar is passed as
 * inputProps, nothing is written into any config (use thumbnail-grammar.js
 * --write for that).
 *
 * Fast: ONE bundle, and books.generated.ts is swapped for a registry holding
 * only the previewed books (the full one imports every config).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { pickGrammar, loadGrammarHistory } = require("./lib/thumbnail-grammar");

const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
const SLUGS = String(args.slugs || "").split(",").filter(Boolean);
if (!SLUGS.length) {
  console.error("Usage: node scripts/preview-thumbnail-grammar.js --slugs=a,b,c");
  process.exit(1);
}
const OUT = path.join(ROOT, "out", "thumbnail-grammar-preview");
fs.mkdirSync(OUT, { recursive: true });

// 1) grammar picks, in simulated publishing order
const engineOf = (slug) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "books", slug, "book.json"), "utf8").replace(/^﻿/, "")).engine === "antidote" ? "antidote" : "vox";
  } catch {
    return "vox";
  }
};
const history = loadGrammarHistory(ROOT, "__none__").filter((h) => !SLUGS.includes(h.slug));
const picks = [];
for (const slug of SLUGS) {
  const engine = engineOf(slug);
  const g = pickGrammar({ slug, engine, history });
  const { _score, ...grammar } = g;
  picks.push({ slug, engine, grammar });
  history.push({ slug, published: false, grammar });
  console.log(`  ${slug.padEnd(30)} ${engine.padEnd(9)} ${grammar.layout} / ${grammar.textPos} / ${grammar.type} / ${grammar.treatment} / ${grammar.accent}`);
}

// 2) slim registry: only the previewed books
const full = fs.readFileSync(path.join(ROOT, "src", "books.generated.ts"), "utf8").replace(/\r\n/g, "\n");
const keep = new Set(SLUGS);
const slim = full
  .split("\n")
  .filter((line) => {
    const m = line.match(/^import .* from '\.\.\/books\/([^/]+)\//);
    return !m || keep.has(m[1]);
  })
  .join("\n")
  .replace(/\n  \{\n    slug: '([^']+)',[\s\S]*?\n  \},/g, (block, slug) => (keep.has(slug) ? block : ""))
  .replace(/from '\.\.\/books\//g, "from '../../books/");
const SLIM_DIR = path.join(ROOT, "out", "_thumbpreview");
fs.mkdirSync(SLIM_DIR, { recursive: true });
const SLIM = path.join(SLIM_DIR, "books.generated.ts");
fs.writeFileSync(SLIM, slim);

(async () => {
  const { bundle } = require("@remotion/bundler");
  const { renderStill, selectComposition } = require("@remotion/renderer");
  const webpack = require("webpack");
  console.log("Bundling (slim registry)…");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "src", "index.ts"),
    webpackOverride: (config) => ({
      ...config,
      plugins: [...(config.plugins || []), new webpack.NormalModuleReplacementPlugin(/books\.generated$/, SLIM)],
    }),
  });

  // Google-font loading can stall the headless browser past Remotion's 30s
  // default on this box: longer timeout + retries, and one bad book never
  // sinks the whole sheet.
  const TIMEOUT = 180000;
  // --only=a,b re-renders a subset while the picks still see the whole feed.
  const ONLY = args.only ? new Set(String(args.only).split(",")) : null;
  for (const p of picks) {
    if (ONLY && !ONLY.has(p.slug)) {
      const prev = path.join(OUT, `${p.slug}.png`);
      if (fs.existsSync(prev)) p.file = prev;
      continue;
    }
    const id = `Thumb-${p.slug}`;
    const inputProps = { grammar: p.grammar, layout: p.grammar.layout };
    const output = path.join(OUT, `${p.slug}.png`);
    for (let attempt = 1; attempt <= 3 && !p.file; attempt++) {
      try {
        const composition = await selectComposition({ serveUrl, id, inputProps, timeoutInMilliseconds: TIMEOUT });
        await renderStill({ composition, serveUrl, output, inputProps, imageFormat: "png", timeoutInMilliseconds: TIMEOUT });
        p.file = output;
        console.log(`  ✓ ${path.relative(ROOT, output)}`);
      } catch (e) {
        console.warn(`  ⚠ ${id} attempt ${attempt}: ${String(e.message).split("\n")[0]}`);
      }
    }
  }
  const rendered = picks.filter((p) => p.file);
  if (!rendered.length) throw new Error("no thumbnail rendered");

  // 3) contact sheet: full + browse size, in feed order
  const cards = rendered
    .map((p) => {
      const g = p.grammar;
      return `<figure><img class="big" src="${p.slug}.png"><img class="small" src="${p.slug}.png">
<figcaption><b>${p.slug}</b> · ${p.engine}<br><code>${g.layout} · ${g.textPos} · ${g.type} · ${g.treatment} · ${g.accent}</code></figcaption></figure>`;
    })
    .join("\n");
  const feed = rendered.map((p) => `<img src="${p.slug}.png">`).join("");
  fs.writeFileSync(
    path.join(OUT, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Thumbnail grammar preview</title>
<style>body{background:#0f0f0f;color:#eee;font:14px system-ui;margin:24px}h2{font-weight:600}
.feed{display:flex;gap:8px;flex-wrap:wrap}.feed img{width:168px;height:94px;border-radius:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:20px}
figure{margin:0;display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:end}
.big{width:320px;border-radius:8px}.small{width:168px;border-radius:6px}figcaption{grid-column:1/3;color:#aaa}code{color:#9cf}</style>
<h2>Browse feed @168px (simulated publishing order)</h2><div class="feed">${feed}</div>
<h2>Each thumbnail</h2><div class="grid">${cards}</div>`,
  );

  // 4) one PNG of the 168px feed (for sharing / chat)
  try {
    const inputs = rendered.map((p) => `-i "${p.file}"`).join(" ");
    const scale = rendered.map((_, i) => `[${i}:v]scale=336:188[s${i}]`).join(";");
    const cols = Math.min(4, rendered.length);
    const layout = rendered.map((_, i) => `${(i % cols) * 344}_${Math.floor(i / cols) * 196}`).join("|");
    const tags = rendered.map((_, i) => `[s${i}]`).join("");
    execSync(
      `ffmpeg -y -loglevel error ${inputs} -filter_complex "${scale};${tags}xstack=inputs=${rendered.length}:layout=${layout}:fill=0x0f0f0f" "${path.join(OUT, "sheet-168.png")}"`,
      { stdio: "inherit" },
    );
  } catch (e) {
    console.warn(`  ⚠ sheet-168.png skipped (${e.message.split("\n")[0]})`);
  }
  console.log(`\nOpen: ${path.join(OUT, "index.html")}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
