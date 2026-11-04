#!/usr/bin/env node
// Renders the cycle-11 A/B (experiment tooling). ONE bundle of this tree's src/, the `Antidote-lab` host composition with
// each mini config as inputProps, 3 stills per item x arm at the pre-registered frames (30 / 60 / 90 % of the beat) and a
// 3-frame strip. An arm without a config (B did not compile) gets no strip — the tally counts it as B's failure.
//   node audit/c11-pilots/render-c11.js --build=<dir from build-c11.js> [--only=B01,B02] [--arms=A,B]
// Output: <build>/raw/<ID>-<arm>-f<frame>.png, <build>/strips/<ID>-<arm>.png, <build>/render-timing.json
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const BUILD = path.resolve(args.build);
const frames = JSON.parse(fs.readFileSync(path.join(BUILD, "frames.json"), "utf8"));
const only = args.only ? new Set(String(args.only).split(",")) : null;
const arms = String(args.arms || "A,B").split(",");

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
  const failed = [];
  for (const [P, frs] of Object.entries(frames)) {
    if (only && !only.has(P)) continue;
    for (const arm of arms) {
      const cf = path.join(BUILD, "configs", `${P}-${arm}.json`);
      if (!fs.existsSync(cf)) continue;
      try {
        const config = JSON.parse(fs.readFileSync(cf, "utf8"));
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
      } catch (e) { failed.push({ id: P, arm, error: String(e.message).slice(0, 400) }); console.log(`  ${P}-${arm}: FAILED ${String(e.message).slice(0, 160)}`); }
    }
  }
  await browser.close({ silent: true });
  const timing = { bundleSec: tBundle, totalSec: (Date.now() - t0) / 1000, stills: n, failed };
  fs.writeFileSync(path.join(BUILD, "render-timing.json"), JSON.stringify(timing, null, 1));
  console.log(`rendered ${n} stills in ${timing.totalSec.toFixed(0)} s, ${failed.length} failed`);
})().catch((e) => { console.error(e); process.exit(1); });
