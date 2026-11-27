#!/usr/bin/env node
/**
 * fix-vtt-names.js — normalize ASR name misspellings in the RAW VTT, BEFORE planning.
 *
 * Reads books/<slug>/names.json via scripts/lib/vtt-names.js.
 * Preserves all VTT timestamp lines verbatim and saves <slug>.vtt.orig.bak once.
 *
 * Usage: node scripts/fix-vtt-names.js --slug=<slug> [--dry]
 */
const fs = require("fs");
const path = require("path");
const { loadNameMap, applyNamesToRawVtt } = require("./lib/vtt-names");

const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  }),
);
const SLUG = args.slug;
const DRY = !!args.dry;
if (!SLUG) {
  console.error("Kullanım: node scripts/fix-vtt-names.js --slug=<slug> [--dry]");
  process.exit(1);
}

const { file: mapPath, pairs } = loadNameMap({ root: ROOT, slug: SLUG });
if (!mapPath || !fs.existsSync(mapPath)) {
  console.log(`ℹ  books/${SLUG}/names.json yok — VTT isim düzeltmesi atlandı (opsiyonel adım).`);
  process.exit(0);
}
const vttPath = path.join(ROOT, "public", "captions", `${SLUG}.vtt`);
if (!fs.existsSync(vttPath)) {
  console.error(`❌ public/captions/${SLUG}.vtt yok.`);
  process.exit(1);
}

const raw = fs.readFileSync(vttPath, "utf8");
const { text: vtt, total, report } = applyNamesToRawVtt(raw, pairs);

for (const [k, v, n] of report) {
  console.log(`  ${n ? "✓" : "·"} ${String(n).padStart(4)}  ${JSON.stringify(k)} → ${JSON.stringify(v)}`);
}
if (!total) { console.log("ℹ  değişiklik yok."); process.exit(0); }

if (DRY) { console.log(`\n[dry] ${total} değişiklik yapılacaktı → ${vttPath}`); process.exit(0); }

const bak = vttPath + ".orig.bak";
if (!fs.existsSync(bak)) fs.copyFileSync(vttPath, bak);
fs.writeFileSync(vttPath, vtt);
console.log(`\n✓ ${total} isim düzeltildi → public/captions/${SLUG}.vtt`);
console.log(`  (yedek: public/captions/${SLUG}.vtt.orig.bak)`);
