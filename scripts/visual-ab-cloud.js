#!/usr/bin/env node
/**
 * visual-ab-cloud.js — send a heavy visual A/B to GitHub Cloud and bring its result back, hash-verified (cycle 6,
 * 2026-10-31; operator: LOCAL = creative work + quick preview, CLOUD = heavy A/B, blind rating, final render).
 *
 *   node scripts/visual-ab-cloud.js push  --manifest=<ab.json> --tag=<name> [--dry]
 *       hashes every input (each arm book's files, its captions + silent audio, the manifest's model / rule / cap) into
 *       ONE inputHash. If audit/cloud-ab/<inputHash>/ already holds a verified result it STOPS (no second paid run of
 *       the same test). Otherwise: ai-budget check for visual-ab.yml, then a PARENTLESS bundle commit (code + the arm
 *       books + ab/manifest.json with the hashes; no history, no big media) pushed to ci/visual-ab/<tag>. The push
 *       starts .github/workflows/visual-ab.yml. Nothing local changes.
 *   node scripts/visual-ab-cloud.js verify --manifest=ab/manifest.json      (runner) every input's sha256 = manifest
 *   node scripts/visual-ab-cloud.js seal   --manifest=ab/manifest.json --out=out-ab   (runner) seal.json: inputHash +
 *       the sha256 of result / key / ratings
 *   node scripts/visual-ab-cloud.js fetch  --tag=<name>
 *       waits for the run, downloads the visual-ab-result artifact, checks seal.json (every file's sha256 and the
 *       inputHash) and stores it in audit/cloud-ab/<inputHash>/. It never touches a book, a storyboard or sealed
 *       evidence; adopting a result is a separate, explicit decision.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.slice(2), true]; }));
const cmd = process.argv[2];
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const REPO = "sates52/Remotion-test";
const CODE_PATHS = ["src", "scripts", "data", "package.json", "tsconfig.json", "remotion.config.ts", ".gitignore", ".github/workflows/visual-ab.yml"];

function inputFiles(man) {
  const out = [];
  for (const p of man.passages) for (const slug of Object.values(p.arms)) {
    const dir = path.join("books", slug);
    for (const f of fs.readdirSync(path.join(ROOT, dir))) if (fs.statSync(path.join(ROOT, dir, f)).isFile()) out.push(path.posix.join("books", slug, f));
    for (const f of [`public/captions/${slug}.vtt`, `public/audio/${slug}.m4a`]) if (fs.existsSync(path.join(ROOT, f))) out.push(f);
  }
  return [...new Set(out)].sort();
}
const hashFiles = (files) => Object.fromEntries(files.map((f) => [f, sha(fs.readFileSync(path.join(ROOT, f)))]));
const inputHashOf = (man, files) => sha(JSON.stringify({ files, model: man.model, k: man.k || 2, rule: man.rule, passages: man.passages })).slice(0, 16);

if (cmd === "push") {
  const man = JSON.parse(fs.readFileSync(path.resolve(args.manifest), "utf8"));
  const files = hashFiles(inputFiles(man));
  const inputHash = inputHashOf(man, files);
  const cached = path.join(ROOT, "audit", "cloud-ab", inputHash, "seal.json");
  if (fs.existsSync(cached)) { console.log(`✓ already done: audit/cloud-ab/${inputHash}/ holds a verified result for these exact inputs — not run again`); process.exit(0); }
  const tag = args.tag || inputHash;
  const final = { ...man, inputHash, files, builtAt: new Date().toISOString() };
  console.log(`inputHash ${inputHash} · ${Object.keys(files).length} input files · model ${man.model} · cap $${man.maxUsd}`);
  if (args.dry) process.exit(0);
  execFileSync(process.execPath, [path.join(__dirname, "ai-budget.js"), "check", "--workflow=visual-ab.yml", `--usd=${man.maxUsd}`], { stdio: "inherit" });
  // parentless bundle commit from a temporary index: the shared index and branch stay untouched
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vab-"));
  const idx = path.join(tmp, "index");
  const env = { ...process.env, GIT_INDEX_FILE: idx };
  const git = (a, opts = {}) => execFileSync("git", a, { cwd: ROOT, env, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, ...opts });
  const manPath = path.join(tmp, "manifest.json");
  fs.writeFileSync(manPath, JSON.stringify(final, null, 1));
  // the REAL index lists the tracked code (the temporary index is empty until we fill it — the first push, 2026-10-31,
  // shipped 55 files and no code because of this)
  const tracked = execFileSync("git", ["ls-files", "-z", "--", ...CODE_PATHS], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).split("\0").filter(Boolean);
  if (tracked.length < 100) throw new Error(`only ${tracked.length} tracked code files — refusing to push an incomplete bundle`);
  const all = [...new Set([...tracked.filter((f) => fs.existsSync(path.join(ROOT, f))), ".github/workflows/visual-ab.yml", "scripts/visual-ab.js", "scripts/visual-ab-cloud.js", ...Object.keys(files)])];
  git(["read-tree", "--empty"]);
  for (let i = 0; i < all.length; i += 200) {
    const chunk = all.slice(i, i + 200);
    const lines = chunk.map((f) => `100644 ${git(["hash-object", "-w", "--", f]).trim()}\t${f}`).join("\n") + "\n";
    execFileSync("git", ["update-index", "--add", "--index-info"], { cwd: ROOT, env, input: lines });
  }
  const mb = git(["hash-object", "-w", "--", manPath]).trim();
  execFileSync("git", ["update-index", "--add", "--cacheinfo", `100644,${mb},ab/manifest.json`], { cwd: ROOT, env });
  const tree = git(["write-tree"]).trim();
  const commit = execFileSync("git", ["commit-tree", tree, "-m", `visual A/B ${man.name} · inputHash ${inputHash}`], { cwd: ROOT, env, encoding: "utf8" }).trim();
  execFileSync("git", ["push", "-q", "origin", `${commit}:refs/heads/ci/visual-ab/${tag}`, "--force"], { cwd: ROOT, stdio: "inherit" });
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(ROOT, "audit", "cloud-ab"), { recursive: true });
  fs.appendFileSync(path.join(ROOT, "audit", "cloud-ab", "pushes.jsonl"), JSON.stringify({ at: new Date().toISOString(), tag, inputHash, commit, files: all.length, model: man.model, maxUsd: man.maxUsd }) + "\n");
  console.log(`✓ pushed bundle ${commit.slice(0, 8)} (${all.length} files) to ci/visual-ab/${tag} — the workflow starts on its own; then: node scripts/visual-ab-cloud.js fetch --tag=${tag}`);
} else if (cmd === "verify") {
  const man = JSON.parse(fs.readFileSync(path.resolve(args.manifest), "utf8"));
  const bad = Object.entries(man.files).filter(([f, h]) => !fs.existsSync(path.join(ROOT, f)) || sha(fs.readFileSync(path.join(ROOT, f))) !== h);
  const again = inputHashOf(man, man.files);
  if (bad.length || again !== man.inputHash) { console.error(`✗ inputs do not match the manifest: ${bad.map(([f]) => f).join(", ") || "inputHash"}`); process.exit(1); }
  console.log(`✓ ${Object.keys(man.files).length} inputs match (inputHash ${man.inputHash})`);
} else if (cmd === "seal") {
  const man = JSON.parse(fs.readFileSync(path.resolve(args.manifest), "utf8"));
  const OUT = path.resolve(args.out);
  const files = ["result.json", "key.json", "ratings.jsonl", "render-timing.json"].filter((f) => fs.existsSync(path.join(OUT, f)));
  const seal = { inputHash: man.inputHash, name: man.name, model: man.model, commit: process.env.GITHUB_SHA || null, run: process.env.GITHUB_RUN_ID || null, files: Object.fromEntries(files.map((f) => [f, sha(fs.readFileSync(path.join(OUT, f)))])) };
  fs.writeFileSync(path.join(OUT, "seal.json"), JSON.stringify(seal, null, 1));
  console.log(`sealed ${files.length} files for inputHash ${man.inputHash}`);
} else if (cmd === "fetch") {
  const tag = args.tag;
  const gh = (a, enc = "utf8") => execFileSync("gh", a, { encoding: enc, maxBuffer: 512 * 1024 * 1024 });
  let run = null;
  for (let k = 0; k < 240; k++) {
    const runs = JSON.parse(gh(["api", `repos/${REPO}/actions/runs?branch=ci/visual-ab/${tag}&per_page=5`])).workflow_runs || [];
    run = runs[0] || null;
    if (run && run.status === "completed") break;
    execFileSync(process.execPath, ["-e", "setTimeout(()=>{},30000)"]);
  }
  if (!run || run.status !== "completed") { console.error("✗ no completed run yet for this tag"); process.exit(2); }
  const arts = JSON.parse(gh(["api", `repos/${REPO}/actions/runs/${run.id}/artifacts`])).artifacts || [];
  const a = arts.find((x) => x.name === "visual-ab-result");
  if (!a) { console.error(`✗ run ${run.id} (${run.conclusion}) has no visual-ab-result artifact`); process.exit(1); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vab-fetch-"));
  fs.writeFileSync(path.join(tmp, "r.zip"), gh(["api", `repos/${REPO}/actions/artifacts/${a.id}/zip`], "buffer"));
  const x = path.join(tmp, "x"); fs.mkdirSync(x);
  try { execFileSync(process.platform === "win32" ? "C:\\Windows\\System32\\tar.exe" : "unzip", process.platform === "win32" ? ["-xf", path.join(tmp, "r.zip"), "-C", x] : ["-q", path.join(tmp, "r.zip"), "-d", x]); }
  catch (e) { console.error("✗ could not unpack the artifact: " + e.message); process.exit(1); }
  const seal = JSON.parse(fs.readFileSync(path.join(x, "seal.json"), "utf8"));
  const bad = Object.entries(seal.files).filter(([f, h]) => sha(fs.readFileSync(path.join(x, f))) !== h);
  if (bad.length) { console.error(`✗ sealed files changed in transit: ${bad.map(([f]) => f).join(", ")}`); process.exit(1); }
  const dest = path.join(ROOT, "audit", "cloud-ab", seal.inputHash);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of [...Object.keys(seal.files), "seal.json"]) fs.copyFileSync(path.join(x, f), path.join(dest, f));
  const res = JSON.parse(fs.readFileSync(path.join(dest, "result.json"), "utf8"));
  fs.writeFileSync(path.join(dest, "run.json"), JSON.stringify({ run: run.id, conclusion: run.conclusion, created: run.created_at, updated: run.updated_at, wallSec: (Date.parse(run.updated_at) - Date.parse(run.created_at)) / 1000 }, null, 1));
  console.log(`✓ run ${run.id} (${run.conclusion}) · seal verified · stored in audit/cloud-ab/${seal.inputHash}/ · decision ${res.decision}`);
} else { console.error("usage: visual-ab-cloud.js push|verify|seal|fetch ..."); process.exit(2); }
