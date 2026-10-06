/**
 * render-stills-p9a.mjs — P9-A visual smoke proof (audit/, scratch output).
 * ONE Remotion bundle via sequential `npx remotion still` calls (each call
 * re-uses the repo's cached bundling where possible); 7 frames:
 *   into-the-wild (Vox): beat-024 053 127 143 210
 *   the-second-mountain (Antidote): scene-24 (treadmill illustration, A2) and
 *   scene-201 (closeUp two-cast, A1).
 * PNGs land in audit/visionless-10x/stills-p9a/ (scratch; never committed).
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const root = process.cwd();
const outDir = path.join(root, "audit/visionless-10x/stills-p9a");
fs.mkdirSync(outDir, { recursive: true });

const ITW = (n) => require0(`./books/into-the-wild/config.vox.json`).beats[n];
function require0(rel) {
  // plain JSON read (this file is ESM; use createRequire)
  return JSON.parse(fs.readFileSync(path.join(root, rel.replace("./", "")), "utf8"));
}

const itw = require0("./books/into-the-wild/config.vox.json");
const sm = require0("./books/the-second-mountain/config.antidote.json");

// the-second-mountain scene start offsets
const starts = [];
let acc = 0;
for (const s of sm.scenes) { starts.push(acc); acc += s.durationFrames || 0; }

const MID = (from, dur) => Math.round(from + dur * 0.62); // copy + animation settled

const targets = [
  { label: "01-itw-beat-024", comp: "Vox-into-the-wild", frame: MID(itw.beats[24].fromFrame, itw.beats[24].durationFrames) },
  { label: "02-itw-beat-053", comp: "Vox-into-the-wild", frame: MID(itw.beats[53].fromFrame, itw.beats[53].durationFrames) },
  { label: "03-itw-beat-127", comp: "Vox-into-the-wild", frame: MID(itw.beats[127].fromFrame, itw.beats[127].durationFrames) },
  { label: "04-itw-beat-143", comp: "Vox-into-the-wild", frame: MID(itw.beats[143].fromFrame, itw.beats[143].durationFrames) },
  { label: "05-itw-beat-210", comp: "Vox-into-the-wild", frame: MID(itw.beats[210].fromFrame, itw.beats[210].durationFrames) },
  // treadmill icon beat: text enters at +63, hold past settle
  { label: "06-tsm-scene-24-treadmill", comp: "Antidote-the-second-mountain", frame: starts[24] + 170 },
  // closeUp with two cast members (the A1 fix)
  { label: "07-tsm-scene-201-closeup2", comp: "Antidote-the-second-mountain", frame: starts[201] + 170 },
];

const CONCURRENCY = 3;
const results = targets.map((t, i) => ({ ...t, out: path.join(outDir, `${t.label}.png`), status: fs.existsSync(path.join(outDir, `${t.label}.png`)) ? "exists" : "pending" }));
const queue = results.filter((r) => r.status === "pending");
console.log(`[p9a-stills] ${results.length} frames, ${results.length - queue.length} exist, ${queue.length} to render, concurrency ${CONCURRENCY}`);

function renderOne(r) {
  const t0 = Date.now();
  try {
    execFileSync("npx", ["remotion", "still", r.comp, r.out, "--frame", String(r.frame), "--timeout", "120000"], {
      cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", timeout: 15 * 60 * 1000,
    });
    r.status = "rendered";
    r.seconds = Math.round((Date.now() - t0) / 1000);
    console.log(`[${r.label}] rendered f${r.frame} in ${r.seconds}s`);
  } catch (error) {
    const log = `${error.stdout || ""}\n${error.stderr || ""}`.slice(-4000);
    fs.writeFileSync(path.join(outDir, `${r.label}.err.log`), log);
    r.status = "failed";
    r.error = String(error.message).slice(0, 200);
    console.error(`[${r.label}] FAILED: ${r.error}`);
  }
}

let cursor = 0;
function worker() { while (cursor < queue.length) renderOne(queue[cursor++]); }
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
const failed = results.filter((r) => r.status === "failed");
console.log(`DONE: ${results.filter((r) => r.status !== "failed").length}/${results.length} stills${failed.length ? `, ${failed.length} FAILED` : ""}`);
process.exit(failed.length ? 1 : 0);
