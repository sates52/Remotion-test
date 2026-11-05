#!/usr/bin/env node
// Cycle 12 blinding + rater batches (experiment tooling; blind-c11.js for three arms A / B / C).
//   node audit/c11-pilots/blind-c11.js strips --build=<dir> --out=<dir>
//     copies every strip to <out>/blind/<hash>.png (hash of a secret salt + id + arm), writes <out>/blind-key.json
//     (name → id, arm; NEVER shown to a rater) and <out>/describe-batches.json (each describer gets ONE strip).
//   node audit/c11-pilots/blind-c11.js judges --out=<dir> --pass=1|2
//     after the descriptions exist (<out>/desc/<name>.json): judge files of 4 descriptions from 4 DIFFERENT beats, each with
//     narration + frozen answer key → <out>/judge-in-p<pass>/J<k>.json. Pass 2 uses a different seeded grouping.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..", "..");
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const cmd = process.argv[2];
const OUT = path.resolve(args.out);
const h = (s) => crypto.createHash("sha256").update(s).digest("hex");

if (cmd === "strips") {
  const BUILD = path.resolve(args.build);
  // incremental: an existing key keeps its salt and names; strips rendered since are added
  const KF = path.join(OUT, "blind-key.json");
  const prev = fs.existsSync(KF) ? JSON.parse(fs.readFileSync(KF, "utf8")) : null;
  const salt = prev ? prev.salt : crypto.randomBytes(16).toString("hex");
  fs.mkdirSync(path.join(OUT, "blind"), { recursive: true });
  const key = prev ? prev.key : {};
  for (const f of fs.readdirSync(path.join(BUILD, "strips")).sort()) {
    const m = f.match(/^(C\d\d)-(A|B|C)\.png$/); if (!m) continue;
    const name = h(`${salt}|${m[1]}|${m[2]}`).slice(0, 10);
    if (!key[name]) fs.copyFileSync(path.join(BUILD, "strips", f), path.join(OUT, "blind", `${name}.png`));
    key[name] = { id: m[1], arm: m[2] };
  }
  fs.writeFileSync(path.join(OUT, "blind-key.json"), JSON.stringify({ salt, key }, null, 1));
  const names = Object.keys(key).sort();
  fs.writeFileSync(path.join(OUT, "describe-batches.json"), JSON.stringify(names, null, 1));
  console.log(`blinded ${names.length} strips`);
} else if (cmd === "judges") {
  const pass = Number(args.pass);
  const { key } = JSON.parse(fs.readFileSync(path.join(OUT, "blind-key.json"), "utf8"));
  const bench = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c12-pilots/benchmark.json"), "utf8")).items.map((x) => [x.id, x]));
  const ak = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "audit/c12-pilots/answer-key.json"), "utf8")).items.map((x) => [x.id, x]));
  const names = Object.keys(key).filter((n) => fs.existsSync(path.join(OUT, "desc", `${n}.json`)));
  // seeded order; greedily fill batches of 4 with 4 different beats (never two arms of one beat in one batch)
  const order = names.slice().sort((a, b) => h(`p${pass}|${a}`).localeCompare(h(`p${pass}|${b}`)));
  const batches = [];
  for (const n of order) {
    let b = batches.find((x) => x.length < 4 && !x.some((y) => key[y].id === key[n].id));
    if (!b) { b = []; batches.push(b); }
    b.push(n);
  }
  const dir = path.join(OUT, `judge-in-p${pass}`);
  fs.mkdirSync(dir, { recursive: true });
  batches.forEach((b, k) => {
    const items = b.map((n) => {
      const d = JSON.parse(fs.readFileSync(path.join(OUT, "desc", `${n}.json`), "utf8"));
      const a = ak[key[n].id];
      return { img: n, narration: bench[key[n].id].narration,
        answerKey: { understanding: a.understanding, cause: a.cause, effect: a.effect, keyFacts: a.keyFacts, wrongInferences: a.wrong, supportsCausality: a.supportsCausality, asserted: a.asserted, notAsserted: a.notAsserted },
        description: { sees: d.sees, changed: d.changed, cause: d.cause, effect: d.effect, message: d.message, wouldConfuse: d.wouldConfuse } };
    });
    fs.writeFileSync(path.join(dir, `J${String(k + 1).padStart(2, "0")}.json`), JSON.stringify(items, null, 1));
  });
  console.log(`pass ${pass}: ${batches.length} judge files (${names.length} descriptions)`);
} else { console.error("usage: strips | judges"); process.exit(2); }
