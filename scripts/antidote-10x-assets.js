#!/usr/bin/env node
/**
 * antidote-10x-assets.js — Full-book Flux + 2x2 cutout asset generator within budget.
 *
 * Budgets:
 *  - Standard (`minorHarm: false`): default 80 (duration-scaled up to cap 90).
 *  - `minorHarm: true`: hard cap 25 strictly human-free, child-free symbolic place/object
 *    editorial illustrations (validated fail-closed before any Flux call).
 *
 * Usage:
 *   node scripts/antidote-10x-assets.js --slug=<slug> [--max-calls=80] [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { computeFluxBudget, validateMinorHarmSafePrompt, MINOR_HARM_MAX_FLUX } = require("./lib/build-10x-prompts");

const ROOT = path.resolve(__dirname, "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);

const SLUG = args.slug;
if (!SLUG) {
  console.error("Usage: node scripts/antidote-10x-assets.js --slug=<slug> [--max-calls=80] [--dry-run]");
  process.exit(1);
}

const bookPath = path.join(ROOT, "books", SLUG, "book.json");
const book = fs.existsSync(bookPath) ? JSON.parse(fs.readFileSync(bookPath, "utf8").replace(/^\uFEFF/, "")) : {};
const promptsFile = path.join(ROOT, "books", SLUG, "prompts.10x.json");
if (!fs.existsSync(promptsFile)) {
  console.error(`✗ Missing ${path.relative(ROOT, promptsFile)}`);
  process.exit(1);
}

const P = JSON.parse(fs.readFileSync(promptsFile, "utf8").replace(/^\uFEFF/, ""));
const isMinorHarm = Boolean(
  P.minorHarm === true ||
  book.minorHarm === true ||
  (book.engineProfile && book.engineProfile.minorHarm === true) ||
  (book.profile && book.profile.minorHarm === true)
);
const requestedCap = args["max-calls"] != null ? Number(args["max-calls"]) : (P.maxCalls != null ? Number(P.maxCalls) : null);
const maxCalls = computeFluxBudget({ minorHarm: isMinorHarm, maxCalls: requestedCap });
const scenes = Array.isArray(P.scenes) ? P.scenes : [];

console.log(`Book ${SLUG}: ${scenes.length} asset(s) declared (budget max-calls=${maxCalls}${isMinorHarm ? ", minorHarm symbolic-only cap=" + MINOR_HARM_MAX_FLUX : ""})`);
if (scenes.length > maxCalls) {
  console.error(`✗ Asset count ${scenes.length} exceeds --max-calls=${maxCalls}`);
  process.exit(1);
}

if (isMinorHarm) {
  const violations = [];
  if (P.artLock) {
    const lockCheck = validateMinorHarmSafePrompt(P.artLock, { mode: "scene" });
    if (!lockCheck.ok) violations.push(`artLock: ${lockCheck.reasons.join("; ")}`);
  }
  for (const s of scenes) {
    const check = validateMinorHarmSafePrompt(s.prompt, s);
    if (!check.ok) violations.push(`${s.id}: ${check.reasons.join("; ")}`);
  }
  if (violations.length) {
    console.error(`✗ minorHarm Flux safety guard BLOCKED ${violations.length} prompt(s):`);
    violations.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }
  console.log(`  ✓ minorHarm safety guard passed (${scenes.length} symbolic place/object prompt(s), 0 human/child/harm/photoreal tokens)`);
}

if (args["dry-run"]) {
  for (const s of scenes) console.log(`  - ${s.id} (${s.mode || "scene"}${s.cutout ? ", cutout" : ""})`);
  process.exit(0);
}

const sheetOut = path.join(ROOT, "books", SLUG, "assets-10x-sheet.png");
const res = spawnSync(
  "python",
  [path.join(ROOT, "scripts", "antidote-v2-pilot", "generate-assets.py"), `--prompts=${promptsFile}`, `--sheet=${sheetOut}`],
  { cwd: ROOT, stdio: "inherit" }
);
process.exit(res.status || 0);
