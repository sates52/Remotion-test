/**
 * render-stills.mjs — ONE-OFF scratch runner (audit/, not scripts/ per runbook
 * rule 8): renders the P3 top-20 suspect stills for the P5 human blind check.
 * Reads audit/visionless-10x/p3-gate.json → suspects, renders missing PNGs
 * with `npx remotion still` (existing PNGs skipped), 3 concurrent workers,
 * writes stills-manifest.json.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const root = process.cwd();
const gate = JSON.parse(fs.readFileSync(path.join(root, "audit/visionless-10x/p3-gate.json"), "utf8"));
const outDir = path.join(root, "audit/visionless-10x/stills");
fs.mkdirSync(outDir, { recursive: true });
const CONCURRENCY = 3;

const suspects = gate.suspects || [];
if (!suspects.length) {
  console.error("No suspects in p3-gate.json");
  process.exit(1);
}

const results = suspects.map((s, i) => {
  const num = String(i + 1).padStart(2, "0");
  const out = path.join(outDir, `${num}-${s.book}-${s.sceneId}.png`);
  return {
    n: i + 1, num, book: s.book, sceneId: s.sceneId, captureFrame: s.captureFrame,
    score: s.score, flags: s.flags, out, outRel: path.relative(root, out).replace(/\\/g, "/"),
    status: fs.existsSync(out) ? "exists" : "pending",
  };
});

const queue = results.filter((r) => r.status === "pending");
console.log(`[runner] ${results.length} suspects, ${results.length - queue.length} already on disk, ${queue.length} to render, concurrency ${CONCURRENCY}`);

function renderOne(r) {
  const t0 = Date.now();
  try {
    execFileSync("npx", ["remotion", "still", `Antidote-${r.book}`, r.out, "--frame", String(r.captureFrame), "--timeout", "120000"], {
      cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32", timeout: 12 * 60 * 1000,
    });
    r.status = "rendered";
    r.seconds = Math.round((Date.now() - t0) / 1000);
    console.log(`[${r.num}] rendered ${r.book}/${r.sceneId} f${r.captureFrame} in ${r.seconds}s`);
  } catch (error) {
    const log = `${error.stdout || ""}\n${error.stderr || ""}`.slice(-4000);
    fs.writeFileSync(path.join(outDir, `${r.num}.err.log`), log);
    r.status = "failed";
    r.error = String(error.message).slice(0, 200);
    console.error(`[${r.num}] FAILED ${r.book}/${r.sceneId}: ${r.error}`);
  }
}

let cursor = 0;
function worker(id) {
  while (cursor < queue.length) {
    const r = queue[cursor++];
    console.log(`[w${id}] → ${r.num}`);
    renderOne(r);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

fs.writeFileSync(
  path.join(root, "audit/visionless-10x/stills-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), concurrency: CONCURRENCY, total: results.length, rendered: results.filter((r) => r.status !== "failed").length, results }, null, 2),
);
const failed = results.filter((r) => r.status === "failed");
console.log(`DONE: ${results.filter((r) => r.status !== "failed").length}/${results.length} stills${failed.length ? `, ${failed.length} FAILED` : ""}`);
process.exit(0);
