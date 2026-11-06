/**
 * node-bin.js — recreate MISSING node_modules/.bin shims from each installed package's own `bin` field.
 * Never runs npm, never deletes or overwrites an existing entry, never touches a package. Every book worktree links
 * its node_modules to the main checkout's, so a lost .bin stopped every book with NODE_MODULES_BROKEN and handed a
 * mechanical repair to the operator (cycle-16 friction audit). Shims follow npm's cmd-shim shape (sh + .cmd + .ps1).
 *
 *   const { healBin } = require("./lib/node-bin"); healBin("<main>/node_modules")  → { created: [...], packages: N }
 *   node scripts/lib/node-bin.js <node_modules> [--dry]
 * Regression: scripts/test-node-bin.js.
 */
const fs = require("fs");
const path = require("path");

const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

/** [{name, rel}] — rel is the bin target relative to node_modules, forward slashes */
function binsOf(nm) {
  const out = [];
  const pkgDirs = [];
  let top = []; try { top = fs.readdirSync(nm); } catch { return out; }
  for (const d of top) {
    if (d.startsWith(".")) continue;
    if (d.startsWith("@")) { try { for (const s of fs.readdirSync(path.join(nm, d))) pkgDirs.push(`${d}/${s}`); } catch {} }
    else pkgDirs.push(d);
  }
  for (const p of pkgDirs) {
    const pj = readJSON(path.join(nm, p, "package.json"));
    if (!pj || !pj.bin) continue;
    const bins = typeof pj.bin === "string" ? { [String(pj.name || p).split("/").pop()]: pj.bin } : pj.bin;
    for (const [name, target] of Object.entries(bins)) {
      if (!/^[\w.@-]+$/.test(name) || typeof target !== "string") continue;
      out.push({ name, rel: path.posix.normalize(`${p}/${target.replace(/\\/g, "/")}`) });
    }
  }
  return out;
}

const sh = (rel) => `#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\nexec node  "$basedir/../${rel}" "$@"\n`;
const cmd = (rel) => `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\nnode  "%dp0%\\..\\${rel.replace(/\//g, "\\")}" %*\r\n`;
const ps1 = (rel) => `#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\nif ($MyInvocation.ExpectingInput) { $input | & "node" "$basedir/../${rel}" $args } else { & "node" "$basedir/../${rel}" $args }\nexit $LASTEXITCODE\n`;

/** create the shims that are missing; existing files are left exactly as they are */
function healBin(nm, { dry = false } = {}) {
  const bins = binsOf(nm).filter((b) => fs.existsSync(path.join(nm, b.rel)));
  const dir = path.join(nm, ".bin");
  const created = [];
  for (const b of bins) {
    for (const [file, body] of [[b.name, sh(b.rel)], [`${b.name}.cmd`, cmd(b.rel)], [`${b.name}.ps1`, ps1(b.rel)]]) {
      const f = path.join(dir, file);
      if (fs.existsSync(f)) continue;
      if (!dry) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, body, { mode: 0o755 }); }
      created.push(file);
    }
  }
  return { created, bins: bins.length };
}

module.exports = { binsOf, healBin };

if (require.main === module) {
  const nm = process.argv[2];
  if (!nm) { console.error("usage: node scripts/lib/node-bin.js <node_modules> [--dry]"); process.exit(2); }
  const r = healBin(path.resolve(nm), { dry: process.argv.includes("--dry") });
  console.log(`${r.bins} bin(s) declared; ${r.created.length} shim file(s) ${process.argv.includes("--dry") ? "would be " : ""}created`);
}
