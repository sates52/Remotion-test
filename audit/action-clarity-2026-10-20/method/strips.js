// OLD = the action-lab NEW clip (previous delivery), NEW = this delivery; same absolute frames.
// burn: subtitle box masked (it would give away the narration); 15-secrets FINAL LAYOUT: the real burned-in captions
// are left visible (the question is whether the held phone shows in the video people watch).
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const A = __dirname, X = path.dirname(A);
const plan = JSON.parse(fs.readFileSync(path.join(X, "act", "strips-plan.json"), "utf8"));
const MASK = "drawbox=x=iw*0.24:y=ih*0.79:w=iw*0.52:h=ih*0.17:color=0x8A8A8A@1:t=fill,";
const W = {
  "burn-of-the-everflame": { frames: plan["burn-of-the-everflame"].frames, mask: true },
  // 74 end-5, 75 +10, 75 70% (+ 74 cue+40 and 75 40%): the held phone after the take, with the real captions
  "15-secrets-successful-people-know-about-time-management": { frames: [20328, 20455, 20470, 20560, 20646], mask: false },
};
for (const [slug, w] of Object.entries(W)) {
  const clipStart = plan[slug].clipStart;
  for (const ver of ["OLD", "NEW"]) {
    const out = path.join(A, "strips", `${slug}-${ver}`);
    fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    w.frames.forEach((f, k) => {
      const n = f - clipStart;
      execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(A, "clips", `${slug}-${ver}.mp4`), "-vf", `trim=start_frame=${n}:end_frame=${n + 1},${w.mask ? MASK : ""}scale=960:-1`, "-vframes", "1", path.join(out, `f${k}.png`)]);
    });
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", path.join(out, "f%d.png"), "-vf", `scale=480:-1,tile=${w.frames.length > 5 ? "4x2" : "5x1"}:padding=6:color=white`, "-frames:v", "1", path.join(A, `montage-${slug}-${ver}.png`)]);
  }
  console.log(slug, w.frames.join(","));
}
fs.writeFileSync(path.join(A, "strips-plan.json"), JSON.stringify(W, null, 1));
