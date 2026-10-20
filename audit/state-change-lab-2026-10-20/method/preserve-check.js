// OLD config (as shipped/current) vs NEW config (sandbox make-book after the NEW beats): which scenes' VISUALS
// differ? Expected: only the window's changed beats. Also: did every authored decision of the NEW beats reach the config?
const fs = require("fs"), path = require("path");
const X = __dirname;
const vis = (s) => JSON.stringify({ shot: s.shot, set: s.bg && s.bg.set, diagram: s.diagram ? s.diagram.type : null,
  chars: (s.characters || []).map((c) => [c.identity, c.expression, c.action, c.holds || null]),
  props: (s.props || []).map((p) => [p.type, p.motion || null, p.motionAt ?? null]), texts: (s.texts || []).map((t) => [t.text, t.style || null]),
  from: s.fromFrame, dur: s.durationFrames, cont: !!s.continueFromPrev });
const NEW = JSON.parse(fs.readFileSync(path.join(X, "new-authored.json"), "utf8"));
const out = {};
for (const slug of Object.keys(NEW)) {
  const O = JSON.parse(fs.readFileSync(path.join(X, `${slug}-config-${process.argv[2] || "OLD"}.json`), "utf8"));
  const N = JSON.parse(fs.readFileSync(path.join(X, `${slug}-config-NEW.json`), "utf8"));
  const ob = Object.fromEntries(O.scenes.map((s) => [s.id, s]));
  const changed = N.scenes.filter((s) => !ob[s.id] || vis(ob[s.id]) !== vis(s)).map((s) => s.id);
  const win = NEW[slug].map((b) => `scene-${String(b.i).padStart(2, "0")}`);
  const decisions = NEW[slug].map((b) => {
    const s = N.scenes.find((x) => x.id === `scene-${String(b.i).padStart(2, "0")}`);
    const icon = (s.props || []).find((p) => p.type === b.concept);
    const checks = {
      concept: !!icon,
      conceptMotion: !!icon && icon.motion === b.conceptMotion,
      cast: JSON.stringify((s.characters || []).map((c) => c.identity)) === JSON.stringify(b.cast),
      callout: (s.texts || []).some((t) => t.text.toUpperCase() === b.callout.text.toUpperCase()),
      ...(b.shotOverride ? { shot: s.shot === b.shotOverride } : {}),
      ...(b.set ? { set: s.bg && s.bg.set === b.set } : {}),
      ...(b.expression ? { expression: (s.characters || [])[0] && s.characters[0].expression === b.expression } : {}),
      ...(b.action ? { action: (s.characters || [])[0] && s.characters[0].action === b.action } : {}),
      ...(b.continue ? { continue: s.continueFromPrev === true } : {}),
    };
    return { id: s.id, checks, allKept: Object.values(checks).every(Boolean), motionAt: icon && icon.motionAt };
  });
  out[slug] = { scenes: N.scenes.length, changedVisuals: changed, changedOutsideWindow: changed.filter((id) => !win.includes(id)), decisions };
  console.log(slug, "changed:", changed.join(",") || "none", "| outside window:", out[slug].changedOutsideWindow.join(",") || "none", "| decisions kept:", decisions.map((d) => `${d.id} ${d.allKept ? "ALL" : JSON.stringify(d.checks)}`).join("; "));
}
fs.writeFileSync(path.join(X, `preserve-check-${process.argv[2] || "OLD"}.json`), JSON.stringify(out, null, 2));
