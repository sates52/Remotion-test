#!/usr/bin/env node
// Cycle 13 four-strip describer calibration (preregistration-c13.json → fourStripCalibration).
//   node audit/c13/calib-build.js --out=<dir>
// 16 cycle-12 strips (C01..C16, arm rotating A/B/C) under NEW blind names; 4 batches of 4 strips of 4 different beats,
// seeded order. Writes <out>/blind/<name>.png, <out>/blind-key.json ({ key: name → { id, arm } }), <out>/batches.json.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const C12 = path.join(__dirname, "..", "..", "..", "wt-c12", "audit", "c12-pilots");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const OUT = path.resolve(args.out);
const h = (s) => crypto.createHash("sha256").update(s).digest("hex");
fs.mkdirSync(path.join(OUT, "blind"), { recursive: true });
const items = Array.from({ length: 16 }, (_, i) => ({ id: `C${String(i + 1).padStart(2, "0")}`, arm: "ABC"[i % 3] }));
const old = JSON.parse(fs.readFileSync(path.join(C12, "ratings", "blind-key.json"), "utf8")).key;
const oldName = Object.fromEntries(Object.entries(old).map(([n, v]) => [`${v.id}-${v.arm}`, n]));
const key = {};
for (const it of items) {
  const name = h(`c13-calib|${it.id}|${it.arm}`).slice(0, 10);
  key[name] = { ...it, c12name: oldName[`${it.id}-${it.arm}`] };
  // the rated cycle-12 PNG (the JPEG in strips/ is a lossy copy): from the c12 scratch blind dir when given, else the JPEG
  const png = args.c12blind && path.join(path.resolve(args.c12blind), `${oldName[`${it.id}-${it.arm}`]}.png`);
  if (png && fs.existsSync(png)) fs.copyFileSync(png, path.join(OUT, "blind", `${name}.png`));
  else throw new Error(`missing cycle-12 strip for ${it.id}-${it.arm}`);
}
// 4 batches: beats i, i+4, i+8, i+12 → always 4 different beats; order inside a batch by a seeded hash
const names = Object.keys(key);
const byIdx = items.map((it) => names.find((n) => key[n].id === it.id));
const batches = [0, 1, 2, 3].map((b) => [b, b + 4, b + 8, b + 12].map((i) => byIdx[i]).sort((x, y) => h(`order|${x}`).localeCompare(h(`order|${y}`))));
fs.writeFileSync(path.join(OUT, "blind-key.json"), JSON.stringify({ key }, null, 1));
fs.writeFileSync(path.join(OUT, "batches.json"), JSON.stringify(batches, null, 1));
console.log(batches.map((b, i) => `D${i + 1}: ${b.join(" ")}`).join("\n"));
