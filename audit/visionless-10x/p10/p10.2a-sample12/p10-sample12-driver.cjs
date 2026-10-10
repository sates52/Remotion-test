"use strict";
// P10.2a fresh-sample driver (scratch). Buffett beats 7/50/94/138/182/226.
// Claims were authored from each beat's narration (_said) BEFORE any render.
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const REPO = "C:/Users/savas/Cursor/Remotion/test";
const { compile } = require(path.join(REPO, "scripts/lib/visual-compiler.js"));
const { authorshipStamp } = require(path.join(REPO, "scripts/lib/authorship.js"));
const OUT = __dirname;
const SERVE = path.join(OUT, "serve12");

const SAMPLE = [{"id":"buf-023","beat":23,"said":"Oh wow. So they just threw away free money. Literally threw it on the ground. Buffett figured out that human emotion leads to mathematical","visual":{"relation":"cause_effect","forbidden":["cast","captions"],"claims":[{"subject":"mirror","role":"pole-0","text":"emotion"},{"subject":"arrow","role":"relator"},{"subject":"balance","role":"pole-1","text":"math edge"}]}},{"id":"buf-066","beat":66,"said":"That's brilliant. Graham told his students to imagine they are in a private business partnership with a guy named Mr. Market who happens to be clinically manic depressive. Some day","visual":{"relation":"contrast","forbidden":["cast","captions"],"claims":[{"subject":"mask","role":"pole-0","text":"Mr. Market"},{"subject":"storm","role":"pole-1","text":"manic mood"}]}},{"id":"buf-110","beat":110,"said":"He was laying all his cards on the table. He told them upfront, point blank, \"If you think I can predict the macroeconomic future, or if you care about the daily fluctuations of th","visual":{"relation":"said_vs_real","forbidden":["cast","captions"],"claims":[{"subject":"compass","role":"pole-0","text":"predict the future"},{"subject":"clock","role":"pole-1","text":"daily noise"}]}},{"id":"buf-154","beat":154,"said":"a bargain on paper. It had very low book value. It didn't have massive factories or huge stores of working capital, but it had an incredibly","visual":{"relation":"contrast","forbidden":["cast","captions"],"claims":[{"subject":"ledge","role":"pole-0","text":"low book value"},{"subject":"iceberg","role":"pole-1","text":"hidden strength"}]}},{"id":"buf-198","beat":198,"said":"So Buffett steps in to inject $700 million into Salomon. But he doesn't just buy common stock like a regular Of course not.","visual":{"relation":"before_after","forbidden":["cast","captions"],"claims":[{"subject":"crack","role":"pole-0","text":"Salomon in trouble"},{"subject":"arrow","role":"relator"},{"subject":"shield","role":"pole-1","text":"$700M, not common stock"}]}},{"id":"buf-242","beat":242,"said":"They demand your time on their schedule. And that unpredictability terrified his independent nature just as much as his mother's sudden rages did when he was 9 years old.","visual":{"relation":"cause_effect","forbidden":["cast","captions"],"claims":[{"subject":"alarmClock","role":"pole-0","text":"their schedule"},{"subject":"arrow","role":"relator"},{"subject":"storm","role":"pole-1","text":"mother's rages at 9"}]}},{"id":"cre-041","beat":41,"said":"His brain was so thoroughly saturated with the rules of the domain that he intuitively knew when an idea violated the laws of thermodynamics or when the machining would be too comp","visual":{"relation":"cause_effect","forbidden":["cast","captions"],"claims":[{"subject":"book","role":"pole-0","text":"saturated with rules"},{"subject":"arrow","role":"relator"},{"subject":"magnifier","role":"pole-1","text":"spots a violation"}]}},{"id":"cre-083","beat":83,"said":"Which brings up a really fascinating question about the Yeah. The context, right? Because if the gatekeepers hold the keys, then when and where you are born has to matter","visual":{"relation":"cause_effect","forbidden":["cast","captions"],"claims":[{"subject":"key","role":"pole-0","text":"gatekeepers"},{"subject":"arrow","role":"relator"},{"subject":"city","role":"pole-1","text":"when and where"}]}},{"id":"cre-126","beat":126,"said":"I mean, I love an underdog story, but wait, isn't it dangerous to suggest that raw talent doesn't matter at all? I wouldn't say it doesn't matter at all. I feel like we're creeping","visual":{"relation":"contrast","forbidden":["cast","captions"],"claims":[{"subject":"ladder","role":"pole-0","text":"underdog story"},{"subject":"balance","role":"pole-1","text":"raw talent matters?"}]}},{"id":"cre-168","beat":168,"said":"see this 2 years ago to the outside world?\" And honestly, even to her in that exact moment in the dark, it feels like a solitary lightning bolt insight. The lone genius at work.","visual":{"relation":"said_vs_real","forbidden":["cast","captions"],"claims":[{"subject":"zap","role":"pole-0","text":"looks like a bolt"},{"subject":"icebergDepth","role":"pole-1","text":"2 years beneath"}]}},{"id":"cre-211","beat":211,"said":"Doing the thing for the sheer intoxicating joy of the process itself. Picture the poet Mark Strand. He is sitting at his desk staring at a piece of paper. The rest of the world has","visual":{"relation":"none","forbidden":["cast","captions"],"claims":[{"subject":"notes","size":"m","text":"Mark Strand's page"},{"subject":"heart","size":"s","text":"joy of process"}]}},{"id":"cre-253","beat":253,"said":"Are you missing the deep, rigorous, boring knowledge of the domain? Are you hiding your work, avoiding the harsh necessary judgment of the field?","visual":{"relation":"contrast","forbidden":["cast","captions"],"claims":[{"subject":"book","role":"pole-0","text":"boring domain knowledge"},{"subject":"law","role":"pole-1","text":"the field's judgment"}]}}];
function buildScene(s, vc) {
  const props = (vc.props || []).map((p) => ({
    type: p.type, x: p.x, y: p.y, scale: p.scale, at: p.at || 0, enter: p.enter || "fade",
    ...(Number.isInteger(p.stateIndex) ? { stateIndex: p.stateIndex } : {}),
    _visualClaim: p.role || p.type,
  }));
  const scene = {
    id: `${s.id}-visual`, type: "illustration", fromFrame: 0, durationFrames: 240, shot: "illustration",
    characters: [], props, texts: [],
    bg: { type: "gradient", colors: ["#D8CFC0", "#B8A98E"], set: "horizon", texture: "grain", accent: "#1C1712" },
    transition: { type: "cut", frames: 0, color: "#3E6B8C" },
  };
  scene._authorship = authorshipStamp({ brief: { narrative_intent: s.said, src: "claude" }, src: "brief" });
  scene._authorship.propTypes = [...new Set(props.map((p) => p.type))];
  return scene;
}

async function main() {
  const doRender = process.argv.includes("--render");
  const report = [];
  for (const s of SAMPLE) {
    const vc = compile(s.visual);
    const scene = buildScene(s, vc);
    report.push({ id: s.id, beat: s.beat, said: s.said, ok: vc.ok, errors: vc.errors,
      claims: vc.claims, unrepresentable: vc.unrepresentable, dropped: vc.dropped,
      composition: vc.composition, certificate: vc.certificate, props: scene.props });
    s._scene = scene;
  }
  fs.writeFileSync(path.join(OUT, "sample12-compile.json"), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report.map((r) => ({ id: r.id, ok: r.ok, errors: r.errors, props: r.props.map((p) => p.type), unrep: r.unrepresentable, dropped: r.dropped.length, cert: r.certificate && r.certificate.pass })), null, 1));
  if (!doRender) return;

  const meta = { slug: "buffett-sample", title: "Buffett sample", author: "x", genre: "nonfiction", fps: 30, width: 1920, height: 1080, audio: null, durationInFrames: 240, multiplane: true, hud: { enabled: false }, cast: {} };
  const remotionCli = path.join(REPO, "node_modules", "@remotion", "cli", "remotion-cli.js");
  const run = (args) => new Promise((resolve) => execFile(process.execPath, [remotionCli, ...args], { cwd: REPO, timeout: 30 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 }, (err, so, se) => resolve({ err, log: `${so}\n${se}`.slice(-3000) })));
  fs.rmSync(SERVE, { recursive: true, force: true });
  const b = await run(["bundle", path.join(REPO, "src", "index.ts"), "--out-dir", SERVE, "--public-dir", path.join(REPO, "public")]);
  if (b.err) { fs.writeFileSync(path.join(OUT, "bundle.err.log"), b.log); throw new Error("bundle failed"); }
  const { selectComposition, renderStill } = require(path.join(REPO, "node_modules", "@remotion", "renderer"));
  for (const s of SAMPLE) {
    const config = { meta, scenes: [s._scene], captions: [], audioEvents: [] };
    const composition = await selectComposition({ serveUrl: SERVE, id: "Antidote-lab", inputProps: { config }, timeoutInMilliseconds: 240000 });
    for (const frame of [60, 200]) {
      const out = path.join(OUT, `${s.id}-f${frame}.png`);
      await renderStill({ composition, serveUrl: SERVE, output: out, frame, imageFormat: "png", timeoutInMilliseconds: 180000 });
      console.log(`[${s.id}] f${frame} ok`);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
