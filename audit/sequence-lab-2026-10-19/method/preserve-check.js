// Did every AUTHORED decision of the window reach the final config unchanged? And nothing outside the window moved?
const fs = require("fs"), path = require("path");
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/seq-lab";
const SEQ = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq";
const vis = (s) => JSON.stringify({ shot: s.shot, set: s.bg && s.bg.set, concept: s.concept || null, diagram: s.diagram ? s.diagram.type : null,
  chars: (s.characters || []).map((c) => [c.identity, c.expression, c.action, c.holds || null]), props: (s.props || []).map((p) => p.type), texts: (s.texts || []).map((t) => [t.text, t.style || null]) });
const out = {};
for (const slug of ["burn-of-the-everflame", "15-secrets-successful-people-know-about-time-management"]) {
  const NEW = JSON.parse(fs.readFileSync(path.join(SEQ, `${slug}-authoredNEW.json`), "utf8"));
  const cfg = JSON.parse(fs.readFileSync(path.join(SB, "books", slug, "config.antidote.json"), "utf8"));
  const OLD = JSON.parse(fs.readFileSync(path.join(SEQ, `${slug}-config-OLD.json`), "utf8"));
  const by = Object.fromEntries(cfg.scenes.map((s) => [s.id, s])), ob = Object.fromEntries(OLD.scenes.map((s) => [s.id, s]));
  const win = new Set(NEW.map((b) => `scene-${String(b.i).padStart(2, "0")}`));
  const rows = [];
  for (const b of NEW) {
    const id = `scene-${String(b.i).padStart(2, "0")}`, s = by[id], ch = (s.characters || []);
    const c0 = ch[0] || {}, issues = [];
    if (Array.isArray(b.cast) && JSON.stringify(ch.map((c) => c.identity)) !== JSON.stringify(b.cast)) issues.push(`cast ${JSON.stringify(b.cast)} -> ${JSON.stringify(ch.map((c) => c.identity))}`);
    if (b.set && s.bg && s.bg.set !== b.set) issues.push(`set ${b.set} -> ${s.bg.set}`);
    if (b.shotOverride && s.shot !== b.shotOverride) issues.push(`shot ${b.shotOverride} -> ${s.shot}`);
    if (b.concept !== undefined && (s.concept || null) !== (b.concept || null)) issues.push(`concept ${b.concept} -> ${s.concept}`);
    if (b.diagram && (!s.diagram || s.diagram.type !== b.diagram.type || JSON.stringify(s.diagram.labels) !== JSON.stringify(b.diagram.labels))) issues.push(`diagram ${JSON.stringify(b.diagram)} -> ${JSON.stringify(s.diagram && { type: s.diagram.type, labels: s.diagram.labels })}`);
    if (b.callout) { const t = (s.texts || []).find((x) => x.src === "art") || (s.texts || [])[0]; if (!t || t.text.toUpperCase() !== b.callout.text.toUpperCase() || (b.callout.style && t.style !== b.callout.style)) issues.push(`callout ${b.callout.text}/${b.callout.style} -> ${t && t.text}/${t && t.style}`); }
    if (b.expression && ch.length && c0.expression !== b.expression) issues.push(`expression ${b.expression} -> ${c0.expression}`);
    if (b.action && ch.length && c0.action !== b.action) issues.push(`action ${b.action} -> ${c0.action}`);
    if (b.holds && ch.length && c0.holds !== b.holds) issues.push(`holds ${b.holds} -> ${c0.holds}`);
    if (b.continue === true && !(s.continueFromPrev === true && s.transition && s.transition.type === "cut")) issues.push(`continue -> continueFromPrev ${s.continueFromPrev}, transition ${s.transition && s.transition.type}`);
    if (b.continue !== true && s.continueFromPrev) issues.push("continueFromPrev set but not authored");
    rows.push({ id, ok: !issues.length, issues, lock: s._authorship && s._authorship.lock ? { continue: s._authorship.lock.continue, cast: s._authorship.lock.cast } : null });
  }
  const outside = Object.keys(ob).filter((id) => !win.has(id) && by[id] && vis(ob[id]) !== vis(by[id]));
  const timing = OLD.scenes.every((s, k) => cfg.scenes[k] && cfg.scenes[k].id === s.id && cfg.scenes[k].fromFrame === s.fromFrame && cfg.scenes[k].durationFrames === s.durationFrames);
  out[slug] = { timingIdentical: timing, windowOk: rows.filter((r) => r.ok).length, window: rows.length, rows, changedOutsideWindow: outside };
  console.log(`${slug}: timing ${timing ? "identical" : "DIFFERS"}; authored decisions preserved ${out[slug].windowOk}/${rows.length}; changed outside window ${outside.length} ${outside.slice(0, 10).join(",")}`);
  rows.filter((r) => !r.ok).forEach((r) => console.log(`   ${r.id}: ${r.issues.join(" | ")}`));
}
fs.writeFileSync(path.join(SEQ, "preserve-check.json"), JSON.stringify(out, null, 1));
