// Same absolute frames for OLD and NEW; per window: 2 frames in the scene before, 4 in the change beat
// (30%, 70%, cue+15, last-5), 2 in the scene after. Frames are taken from each version's own clip,
// subtitle bar cropped (bottom 24%), so blind readers never see the narration text.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const X = __dirname;
const W = { "burn-of-the-everflame": ["scene-217", "scene-218", "scene-219"], "15-secrets-successful-people-know-about-time-management": ["scene-73", "scene-74", "scene-75"] };
const plan = {};
for (const [slug, [a, b, c]] of Object.entries(W)) {
  const N = JSON.parse(fs.readFileSync(path.join(X, `${slug}-config-NEW.json`), "utf8"));
  const S = (id) => N.scenes.find((s) => s.id === id);
  const sa = S(a), sb = S(b), sc = S(c);
  const p = sb.props.find((x) => x.motion);
  const cue = sb.fromFrame + p.motionAt;
  const frames = [sa.fromFrame + sa.durationFrames * 0.5, sa.fromFrame + sa.durationFrames * 0.9,
    sb.fromFrame + sb.durationFrames * 0.3, sb.fromFrame + sb.durationFrames * 0.7, cue + 15, sb.fromFrame + sb.durationFrames - 5,
    sc.fromFrame + sc.durationFrames * 0.4, sc.fromFrame + sc.durationFrames * 0.9].map(Math.round);
  const clipStart = sa.fromFrame;
  plan[slug] = { cue, frames, clipStart, scenes: [a, b, c] };
  for (const ver of ["OLD", "NEW"]) {
    const out = path.join(X, "strips2", `${slug}-${ver}`);
    fs.mkdirSync(out, { recursive: true });
    frames.forEach((f, k) => {
      const n = f - clipStart;
      execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(X, "clips", `${slug}-${ver}.mp4`),
        "-vf", `trim=start_frame=${n}:end_frame=${n + 1},crop=iw:ih*0.76:0:0,scale=960:-1`, "-vframes", "1", path.join(out, `f${k}.png`)]);
    });
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(out, "f%d.png"), "-vf", "scale=480:-1,tile=4x2:padding=6:color=white", "-frames:v", "1", path.join(X, `montage2-${slug}-${ver}.png`)]);
  }
  console.log(slug, "cue", cue, "frames", frames.join(","));
}
fs.writeFileSync(path.join(X, "strips2-plan.json"), JSON.stringify(plan, null, 1));
