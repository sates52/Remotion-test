// Blinded sequence-level pair for one book: narration of the window (per beat) + the OLD and NEW blind
// descriptions shuffled to X/Y with a seeded coin; versions hidden; key written separately.
const fs = require("fs"), path = require("path");
const slug = process.argv[2], short = process.argv[3], seed = parseInt(process.argv[4] || "17", 10);
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/seq-lab";
const SEQ = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq";
const SEL = JSON.parse(fs.readFileSync("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/sequence-lab-2026-10-19/selection.json", "utf8"));
const side = SEL.fiction.slug === slug ? SEL.fiction : SEL.nonfiction;
const cfg = JSON.parse(fs.readFileSync(path.join(SB, "books", slug, "config.antidote.json"), "utf8"));
const narr = side.beats.map((id, k) => { const s = cfg.scenes.find((x) => x.id === id); return { beat: k + 1, narration: (cfg.captions || []).filter((c) => c.startFrame >= s.fromFrame - 5 && c.startFrame < s.fromFrame + s.durationFrames).map((c) => c.text).join(" ") }; });
const read = (v) => { const j = JSON.parse(fs.readFileSync(path.join(SEQ, "reads", `${short}-${v}.json`), "utf8")); return { frames: j.frames.map((f) => ({ img: f.img.replace(".png", ""), text: f.text, sees: f.sees, changed: f.changed })), sequence: j.sequence, confusing: j.confusing }; };
const oldIsX = ((seed * 1103515245 + 12345) % 2147483648) / 2147483648 < 0.5;
const A = read("OLD"), B = read("NEW");
fs.writeFileSync(path.join(SEQ, `seqpair-${short}.json`), JSON.stringify({ narrationByBeat: narr, X: oldIsX ? A : B, Y: oldIsX ? B : A }, null, 2));
fs.writeFileSync(path.join(SEQ, `seqpair-${short}.key.json`), JSON.stringify({ X: oldIsX ? "OLD" : "NEW", Y: oldIsX ? "NEW" : "OLD" }));
console.log(`${short}: X=${oldIsX ? "OLD" : "NEW"} (key written separately)`);
