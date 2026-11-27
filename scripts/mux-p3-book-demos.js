#!/usr/bin/env node
/**
 * mux-p3-book-demos.js — Muxes Phase 3 cloud slice MP4s with exact real book audio.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "audit", "p3-book-demos");
const CLIPS_DIR = path.join(OUT_DIR, "stills", "clips");
const MUX_DIR = path.join(OUT_DIR, "mux_tmp");
fs.mkdirSync(MUX_DIR, { recursive: true });

const slicesMeta = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "slices.json"), "utf8"));

for (const book of slicesMeta.books) {
  const muxedFiles = [];
  for (const s of book.slices) {
    const inClip = path.join(CLIPS_DIR, `${s.id}.mp4`);
    if (!fs.existsSync(inClip)) throw new Error(`Missing cloud clip: ${inClip}`);
    const dur = (s.s1 - s.s0).toFixed(3);
    const fadeOutSt = Math.max(0.1, s.s1 - s.s0 - 0.2).toFixed(3);
    const outSlice = path.join(MUX_DIR, `${s.id}_mux.mp4`);
    execSync(
      `cmd /c "ffmpeg -y -i "${inClip}" -ss ${s.s0} -t ${dur} -i "${book.audioPath}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af "afade=t=in:st=0:d=0.15,afade=t=out:st=${fadeOutSt}:d=0.2" -shortest "${outSlice}" 2>nul"`,
      { cwd: ROOT, stdio: "inherit" }
    );
    muxedFiles.push(outSlice);
  }
  const concatTxt = path.join(MUX_DIR, `${book.slug}.concat.txt`);
  fs.writeFileSync(concatTxt, muxedFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
  const finalMp4 = path.join(OUT_DIR, `${book.slug}.mp4`);
  execSync(`cmd /c "ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c copy "${finalMp4}" 2>nul"`, { cwd: ROOT, stdio: "inherit" });
  const probe = execSync(`cmd /c "ffprobe -v error -show_entries stream=codec_type,width,height,duration -of default=noprint_wrappers=1 "${finalMp4}""`, { cwd: ROOT, encoding: "utf8" });
  console.log(`\n=== ${book.slug}.mp4 ===\n${probe.trim()}`);
}
