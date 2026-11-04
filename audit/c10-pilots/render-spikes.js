#!/usr/bin/env node
// Renders the cycle-10 spikes (experiment tooling): Spike-IK key frames, and Spike-Hybrid — one film, three renderers
// chosen per scene by scripts/lib/scene-router.js (an Antidote causal diagram, an Antidote world-state deed, a Vox image).
//   node audit/c10-pilots/render-spikes.js --ab=<ab build dir> --out=<dir>
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
fs.mkdirSync(OUT, { recursive: true });
const router = require(path.join(ROOT, "scripts", "lib", "scene-router.js"));

const one = (cfg, i, key = "scenes") => {
  const s = JSON.parse(JSON.stringify(cfg[key][i]));
  const d = s.durationFrames;
  s.fromFrame = 0; s.transition = { type: "cut", frames: 0 }; delete s.continueFromPrev;
  return { ...cfg, [key]: [s], captions: [], totalFrames: d, meta: { ...(cfg.meta || {}), durationInFrames: d } };
};
const tis = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "thinking-in-systems", "config.antidote.json"), "utf8"));
const causal = one(tis, 6);
const deed = one(JSON.parse(fs.readFileSync(path.join(path.resolve(args.ab), "configs", "P03-B.json"), "utf8")), 1);
const eoe = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "east-of-eden", "config.vox.json"), "utf8"));
const vox = one(eoe, eoe.beats.findIndex((b) => b.id === "beat-004"), "beats");
// the router's call on each scene's narration (what it would pick, and what a muted viewer must see)
const tisArt = JSON.parse(fs.readFileSync(path.join(ROOT, "books", "thinking-in-systems", "art.json"), "utf8"));
const routes = [
  { scene: "thinking-in-systems scene-06", narration: (tisArt.beats || tisArt)[6].narration, ...router.routeBeat((tisArt.beats || tisArt)[6].narration, { castCount: 0 }) },
  { scene: "thinking-in-systems beat 8 (P03 deed)", narration: (tisArt.beats || tisArt)[8].narration, ...router.routeBeat((tisArt.beats || tisArt)[8].narration, { castCount: 1 }) },
  { scene: "east-of-eden beat-004", narration: (eoe.beats.find((b) => b.id === "beat-004").props || {}).text, ...router.routeBeat("a lone figure standing where a dirt road forks across golden Salinas hills at dawn, 1900s farm country", { bookHasImages: true }) },
];
fs.writeFileSync(path.join(OUT, "hybrid-routes.json"), JSON.stringify(routes, null, 1));

(async () => {
  const { bundle } = require("@remotion/bundler");
  const { renderStill, selectComposition, openBrowser } = require("@remotion/renderer");
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), webpackOverride: (c) => c });
  const browser = await openBrowser("chrome", { chromiumOptions: { gl: "swangle" } });
  const shoot = async (id, inputProps, frames, name) => {
    const comp = await selectComposition({ serveUrl, id, puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 });
    const parts = [];
    for (const f of frames) { const o = path.join(OUT, `${name}-f${f}.png`); await renderStill({ composition: comp, serveUrl, output: o, frame: f, imageFormat: "png", puppeteerInstance: browser, inputProps, timeoutInMilliseconds: 240000 }); parts.push(o); }
    execFileSync("ffmpeg", ["-v", "error", "-y", ...parts.flatMap((x) => ["-i", x]), "-filter_complex", parts.map((_, i) => `[${i}:v]scale=640:-2,pad=iw+8:ih:0:0:white[v${i}]`).join(";") + ";" + parts.map((_, i) => `[v${i}]`).join("") + `hstack=inputs=${parts.length}`, path.join(OUT, `${name}-strip.png`)]);
    console.log(`${name}: ${frames.join(",")}`);
  };
  await shoot("Spike-IK", {}, [24, 58, 72, 100], "ik-shelf");
  await shoot("Spike-IK", {}, [144, 178, 192, 220], "ik-floor");
  const d1 = causal.meta.durationInFrames, d2 = deed.meta.durationInFrames;
  await shoot("Spike-Hybrid", { causal, deed, vox }, [Math.round(d1 * 0.8), d1 + Math.round(d2 * 0.75), d1 + d2 + Math.round(vox.meta.durationInFrames * 0.6)], "hybrid");
  await browser.close({ silent: true });
})().catch((e) => { console.error(e); process.exit(1); });
