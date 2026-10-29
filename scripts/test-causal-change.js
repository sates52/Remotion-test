#!/usr/bin/env node
// MECHANISM 4.0 — what a cycle DOES to what it carries and to where it started (causal.ts split / thin / erode,
// components/CausalChain.tsx), 2026-10-29. The carried thing multiplies on its word (a few / many / a flood — never a
// count), the copies spread thin, and the station the cycle undermines greys and cracks — never before the loop has
// brought the token back to it. Blind (essentialism 77-83, "the paradox of success", 3 readers per arm): multiply
// NNN -> YYY, thin PPP -> PYY vs the Mechanism 3.0 chain on the same beats (cycle and undermine YYY in both).
// Run: node scripts/test-causal-change.js
let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${!ok && info ? `  (${String(info).slice(0, 400)})` : ""}`); if (!ok) failed++; };
const C = require("../src/engines/antidote/causal.ts");
const { causalSchema } = require("../src/engines/antidote/schema.ts");
const BASE = {
  stations: [{ label: "CLARITY OF PURPOSE", glyph: "eye" }, { label: "EARLY SUCCESS", glyph: "spark" }, { label: "THE GO-TO PERSON", glyph: "people" }, { label: "DISTRACTED", glyph: "phone" }],
  token: { glyph: "coin", tag: "SUCCESS", tagTo: "NEW OPTIONS", from: 1, split: { into: "flood" } },
  erode: { station: 0 },
  loop: { to: 0 },
};
t("schema: split (qualitative) and erode parse", causalSchema.safeParse(BASE).success, JSON.stringify(causalSchema.safeParse(BASE).error?.issues?.slice(0, 2)));
t("schema: a split is a word, never a number", !causalSchema.safeParse({ ...BASE, token: { ...BASE.token, split: { into: 12 } } }).success);
t("schema: split / thin / erode are cue elements", causalSchema.safeParse({ ...BASE, cues: { split: "flood", thin: "thin", erode: "undermined" } }).success);
t("the copy counts are qualitative steps: few < many < flood", C.SPLIT_N.few < C.SPLIT_N.many && C.SPLIT_N.many < C.SPLIT_N.flood);

// timing: nothing before its word; erode waits for the loop to bring the token back to the eroded station
const spec = { ...BASE, at: { n0: 0, n1: 0, token: 0, n2: 10, n3: 20, split: 100, thin: 200, loop: [300], erode: 300 } };
let s = C.causalState(spec, 99);
t("before the split word: one token, no copies", s.split === 0 && s.thin === 0);
s = C.causalState(spec, 100 + C.SPLIT_LEN);
t("after the split word: the token has multiplied (split 1), not yet thin", s.split === 1 && s.thin === 0);
s = C.causalState(spec, 200 + C.THIN_LEN);
t("after the thin word: spread thin", s.thin === 1);
s = C.causalState(spec, 305);
t("erode on the same word as the loop: NOT yet — the token is still riding back", s.erode === 0 && s.token && s.token.back > 0, JSON.stringify(s));
s = C.causalState(spec, 300 + C.LOOP_LEN + C.ERODE_LEN + 2);
t("once the token is back at the start: the start is undermined (erode 1)", s.erode === 1);
const settled = { ...BASE, at: {}, done: ["n0", "n1", "n2", "n3", "token", "split", "thin", "loop", "erode"] };
s = C.causalState(settled, 0);
t("a continued beat: split / thin / erode reached earlier are drawn settled (persistent state)", s.split === 1 && s.thin === 1 && s.erode === 1);
t("no split data: the split element draws nothing (old configs unchanged)", C.causalState({ ...spec, token: { ...BASE.token, split: undefined } }, 400).split === 0);
// what the blind text reader is told
const seen = C.causalSeen(settled, new Set(["n0", "n1", "n2", "n3", "token", "split", "thin", "loop", "erode"]));
t("readcheck: the multiply, the thinning and the undermined start are told as drawn", /multiplies into a whole cluster/.test(seen) && /spread far apart, shrink and fade/.test(seen) && /"CLARITY OF PURPOSE" station turns grey and cracks when the arrow comes back to it/.test(seen), seen);

// merge refuses a cue without its data
const fs = require("fs"), path = require("path");
const SB = fs.readFileSync(path.join(__dirname, "storyboard.js"), "utf8");
t("merge: split/thin need token.split; erode needs erode.station (a real station)", /causal cue \$\{el\} without token\.split/.test(SB) && /causal cue erode without erode/.test(SB) && /erode\.station \$\{c\.erode\.station\} — there is no such station/.test(SB));
// the renderer draws them
const CC = fs.readFileSync(path.join(__dirname, "..", "src", "engines", "antidote", "components", "CausalChain.tsx"), "utf8");
t("renderer: the cluster (SPLIT_N copies) and the cracked, greyed station", /SPLIT_N\[c\.token\.split\.into\]/.test(CC) && /c\.erode && c\.erode\.station === k \? S\.erode/.test(CC));
console.log(failed ? `\n${failed} FAILED` : "\nall causal-change checks passed");
process.exit(failed ? 1 : 0);
