/**
 * make-contact-grid.mjs — Visionless-10x scratch: P5 contact sheet grid builder.
 *
 * Reads suspects from audit/visionless-10x/p3-gate.json, expects rendered stills
 * at audit/visionless-10x/stills/NN-<book>-<sceneId>.png (NN = 1-based suspect
 * index, zero-padded), and produces ONE combined labeled grid:
 *   audit/visionless-10x/contact-sheet.png   (2560x1800, 4 cols x 5 rows)
 *
 * Each cell: 640x360, big #NN badge (top-left), bottom banner
 * "<sceneId> | f<frame> | <book>". Run:
 *   node audit/visionless-10x/make-contact-grid.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const root = process.cwd();
const dir = path.join(root, "audit", "visionless-10x");
const stillsDir = path.join(dir, "stills");
const outFile = path.join(dir, "contact-sheet.png");
const filterFile = path.join(dir, "contact-grid.filter");
const logFile = path.join(dir, "contact-grid.log");

const gate = JSON.parse(fs.readFileSync(path.join(dir, "p3-gate.json"), "utf8"));
const suspects = (gate.suspects || []).slice(0, 20);
if (suspects.length !== 20) {
  console.error(`Expected 20 suspects, got ${suspects.length}`);
  process.exit(1);
}

// ffmpeg 8 -/filter_complex file loading strips quotes AND eats `C\:` escapes,
// so reference fonts via a colon-free relative path.
const fontsDir = path.join(dir, "fonts");
fs.mkdirSync(fontsDir, { recursive: true });
for (const f of ["arial.ttf", "arialbd.ttf"]) {
  const src = path.join("C:/Windows/Fonts", f);
  const dst = path.join(fontsDir, f);
  if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
}
const rel = (p) => path.relative(root, p).replace(/\\/g, "/");
const fontRegular = rel(path.join(fontsDir, "arial.ttf"));
const fontBold = rel(path.join(fontsDir, "arialbd.ttf"));

const shortBook = (b) =>
  b === "the-miracle-of-mindfulness-an-introduction-to-the-practice-of-meditation"
    ? "the-miracle-of-mindfulness"
    : b;

const chains = [];
const labels = [];
for (let i = 0; i < suspects.length; i++) {
  const s = suspects[i];
  const nn = String(i + 1).padStart(2, "0");
  const file = path.join(stillsDir, `${nn}-${s.book}-${s.sceneId}.png`);
  if (!fs.existsSync(file)) {
    console.error(`MISSING still: ${path.relative(root, file)}`);
    process.exit(1);
  }
  const badge = `#${String(i + 1)}`;
  const banner = `${s.sceneId} | f${s.captureFrame} | ${shortBook(s.book)}`;
  chains.push(
    `[${i}:v]scale=640:360,` +
      `drawbox=x=0:y=326:w=640:h=34:color=black@0.85:t=fill,` +
      `drawtext=fontfile=${fontBold}:text='${badge}':fontsize=44:fontcolor=white:x=10:y=8:box=1:boxcolor=black@0.75:boxborderw=8,` +
      `drawtext=fontfile=${fontRegular}:text='${banner}':fontsize=15:fontcolor=white:x=8:y=331[v${nn}]`
  );
  labels.push(`[v${nn}]`);
}

const script =
  chains.join(";") + ";" + labels.join("") +
  `concat=n=${suspects.length}:v=1:a=0[cat];[cat]tile=4x5[out]`;
// Pass the filter graph as a single argv element (spawnSync does correct Windows
// quoting; the script-file loading path mangles quotes/escapes).
fs.writeFileSync(filterFile, script + "\n");

const args = [];
for (let i = 0; i < suspects.length; i++) {
  const s = suspects[i];
  const nn = String(i + 1).padStart(2, "0");
  args.push("-i", rel(path.join(stillsDir, `${nn}-${s.book}-${s.sceneId}.png`)));
}
args.push(
  "-filter_complex", script,
  "-map", "[out]",
  "-frames:v", "1",
  "-y", rel(outFile)
);

const res = spawnSync("ffmpeg", args, { encoding: "buffer" });
fs.writeFileSync(logFile, Buffer.concat([res.stdout || Buffer.alloc(0), res.stderr || Buffer.alloc(0)]));
if (res.error) {
  console.error("spawn error:", res.error.message);
  process.exit(1);
}
if (res.status !== 0 || !fs.existsSync(outFile)) {
  console.error(`ffmpeg failed (exit ${res.status}) — see ${path.relative(root, logFile)}`);
  process.exit(1);
}
console.log(`OK ${outFile} (${fs.statSync(outFile).size} bytes)`);
process.exit(0);
