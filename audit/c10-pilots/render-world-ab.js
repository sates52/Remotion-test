#!/usr/bin/env node
// Renders the cycle-10 world-state A/B (experiment tooling). ONE bundle of this tree's src/, the `Antidote-lab` host
// composition with each mini config as inputProps (props resolved at selectComposition — renderStill drops them on an
// already-selected composition), 3 stills per passage x arm at the pre-registered frames, and a 3-frame strip.
//   node audit/c10-pilots/render-world-ab.js --build=<dir from build-world-ab.js> [--only=P01,P02]
// Output: <build>/raw/<P>-<arm>-f<frame>.png, <build>/strips/<P>-<arm>.png, <build>/render-timing.json
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const BUILD = path.resolve(args.build);
const frames = JSON.parse(fs.readFileSync(path.join(BUILD, "frames.json"), "utf8"));
const only = args.only ? new Set(String(args.only).split(",")) : null;

(async () => {
  const { bundle } = require("@remotion/bundler");
  const { renderStill, selectComposition, openBrowser } = require("@remotion/renderer");
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), webpackOverride: (c) => c });
  const tBundle = (Date.now() - t0) / 1000;
  console.log(`bundle ${tBundle.toFixed(0)} s`);
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
  fs.mkdirSync(path.join(BUILD, "raw"), { recursive: true });
  fs.mkdirSync(path.join(BUILD, "strips"), { recursive: true });
  let n = 0;
  for (const [P, frs] of Object.entries(frames)) {
    if (only && !only.has(P)) continue;
    for (const arm of ["A", "B"]) {
      const config = JSON.parse(fs.readFileSync(path.join(BUILD, "configs", `${P}-${arm}.json`), "utf8"));
      const inputProps = { config };
      const composition = await selectComposition({ serveUrl, id: "Antidote-lab", puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 });
      const parts = [];
      for (const fr of frs) {
        const o = path.join(BUILD, "raw", `${P}-${arm}-f${fr}.png`);
        await renderStill({ composition, serveUrl, output: o, frame: fr, imageFormat: "png", puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 });
        parts.push(o); n++;
      }
      execFileSync("ffmpeg", ["-v", "error", "-y", ...parts.flatMap((x) => ["-i", x]), "-filter_complex",
        parts.map((_, i) => `[${i}:v]scale=640:-2,pad=iw+8:ih:0:0:white[v${i}]`).join(";") + ";" + parts.map((_, i) => `[v${i}]`).join("") + `hstack=inputs=${parts.length}`,
        path.join(BUILD, "strips", `${P}-${arm}.png`)]);
      console.log(`  ${P}-${arm}: ${frs.join(",")}`);
    }
  }
  await browser.close({ silent: true });
  const timing = { bundleSec: tBundle, totalSec: (Date.now() - t0) / 1000, stills: n };
  fs.writeFileSync(path.join(BUILD, "render-timing.json"), JSON.stringify(timing));
  console.log(`rendered ${n} stills in ${timing.totalSec.toFixed(0)} s`);
})().catch((e) => { console.error(e); process.exit(1); });
