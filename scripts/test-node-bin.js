#!/usr/bin/env node
// test-node-bin.js — node-bin.js recreates only MISSING .bin shims from package bin fields (temp dir, < 1 s)
const fs = require("fs");
const os = require("os");
const path = require("path");
const { healBin } = require("./lib/node-bin");

let fail = 0;
const t = (name, ok, info = "") => { console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `  ${String(info).slice(0, 300)}`}`); if (!ok) fail++; };
const W = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };

const nm = fs.mkdtempSync(path.join(os.tmpdir(), "nodebin-"));
W(path.join(nm, "tool", "package.json"), JSON.stringify({ name: "tool", bin: "cli.js" }));
W(path.join(nm, "tool", "cli.js"), "");
W(path.join(nm, "@sc", "multi", "package.json"), JSON.stringify({ name: "@sc/multi", bin: { one: "./bin/one.js", two: "bin/two.js" } }));
W(path.join(nm, "@sc", "multi", "bin", "one.js"), "");
W(path.join(nm, "ghost", "package.json"), JSON.stringify({ name: "ghost", bin: { ghost: "missing.js" } }));
W(path.join(nm, "evil", "package.json"), JSON.stringify({ name: "evil", bin: { "../x": "a.js" } }));
W(path.join(nm, "evil", "a.js"), "");

let r = healBin(nm, { dry: true });
t("dry run writes nothing", r.created.length === 6 && !fs.existsSync(path.join(nm, ".bin")), JSON.stringify(r));
r = healBin(nm);
const bin = (f) => path.join(nm, ".bin", f);
t("string bin + object bin → sh, .cmd and .ps1 for each existing target", ["tool", "tool.cmd", "tool.ps1", "one", "one.cmd", "one.ps1"].every((f) => fs.existsSync(bin(f))), JSON.stringify(r));
t("a bin whose target file is missing gets no shim", !fs.existsSync(bin("two")) && !fs.existsSync(bin("ghost")));
t("a bin name with a path in it is ignored", !fs.existsSync(path.join(nm, "x")) && !fs.readdirSync(path.join(nm, ".bin")).some((f) => f.includes("..")));
t("shims point at the package file", /\.\.\/@sc\/multi\/bin\/one\.js/.test(fs.readFileSync(bin("one"), "utf8")) && /\\\.\.\\@sc\\multi\\bin\\one\.js/.test(fs.readFileSync(bin("one.cmd"), "utf8")));
fs.writeFileSync(bin("tool"), "KEEP");
r = healBin(nm);
t("an existing entry is never overwritten; a second run creates nothing", r.created.length === 0 && fs.readFileSync(bin("tool"), "utf8") === "KEEP", JSON.stringify(r));
fs.rmSync(nm, { recursive: true, force: true });

console.log(fail ? `\n${fail} node-bin check(s) FAILED` : "\nall node-bin checks passed");
process.exit(fail ? 1 : 0);
