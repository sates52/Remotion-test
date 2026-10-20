// Same absolute frames for OLD (state-change lab BASE clip) and NEW; subtitle box masked (grey box over it) so blind
// readers never see the narration. Frames cover the scene before, the action beat around its authored moment, after.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const A = __dirname, X = path.dirname(A);
const W = {
  "burn-of-the-everflame": { scenes: ["scene-217", "scene-218", "scene-219"], act: "scene-219", old: path.join(X, "clips", "burn-of-the-everflame-OLD.mp4"), cfg: "burn-config.json" },
  "15-secrets-successful-people-know-about-time-management": { scenes: ["scene-73", "scene-74", "scene-75"], act: "scene-74", old: path.join(X, "clips", "15-secrets-successful-people-know-about-time-management-OLD.mp4"), cfg: "15-config.json" },
};
const plan = {};
for (const [slug, w] of Object.entries(W)) {
  const N = JSON.parse(fs.readFileSync(path.join(A, w.cfg), "utf8"));
  const S = (id) => N.scenes.find((s) => s.id === id);
  const [a, b, c] = w.scenes.map(S);
  const act = S(w.act), at = act.fromFrame + act.characters[0].actionAt;
  const frames = slug.startsWith("burn")
    ? [a.fromFrame + a.durationFrames * 0.5, b.fromFrame + b.durationFrames * 0.7, at - 24, at - 9, at, at + 20, at + 60, c.fromFrame + c.durationFrames - 5]
    : [a.fromFrame + a.durationFrames * 0.5, at - 20, at - 6, at + 10, at + 40, b.fromFrame + b.durationFrames - 5, c.fromFrame + 10, c.fromFrame + c.durationFrames * 0.7];
  const fr = frames.map(Math.round);
  const clipStart = a.fromFrame;
  plan[slug] = { actionAt: at, frames: fr, clipStart };
  for (const [ver, clip] of [["OLD", w.old], ["NEW", path.join(A, "clips", `${slug}-NEW.mp4`)]]) {
    const out = path.join(A, "strips", `${slug}-${ver}`);
    fs.mkdirSync(out, { recursive: true });
    fr.forEach((f, k) => {
      const n = f - clipStart;
      execFileSync("ffmpeg", ["-y", "-v", "error", "-i", clip, "-vf", `trim=start_frame=${n}:end_frame=${n + 1},drawbox=x=iw*0.24:y=ih*0.79:w=iw*0.52:h=ih*0.17:color=0x8A8A8A@1:t=fill,scale=960:-1`, "-vframes", "1", path.join(out, `f${k}.png`)]);
    });
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(out, "f%d.png"), "-vf", "scale=480:-1,tile=4x2:padding=6:color=white", "-frames:v", "1", path.join(A, `montage-${slug}-${ver}.png`)]);
  }
  console.log(slug, "actionAt", at, "frames", fr.join(","));
}
fs.writeFileSync(path.join(A, "strips-plan.json"), JSON.stringify(plan, null, 1));
