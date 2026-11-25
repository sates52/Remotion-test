/**
 * v2-narrative-lint.js — Semantic & Blind-Mute Pre-Flight Linter for Antidote 10x.
 *
 * Catches 4 high-impact storytelling & visual-compositing defects before cloud render:
 *   1. Verbatim subtitle-duplicate callouts / speech bubbles (>= 80% token overlap).
 *   2. Conflicting "Phase N / Step N" titles across consecutive scenes.
 *   3. Motion-density droughts (> 240 frames with zero visual events).
 *   4. CutoutStage speech bubble vs actor head bounding-box collision.
 */

function normTokens(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function tokenOverlap(a, b) {
  const ta = normTokens(a);
  const tb = new Set(normTokens(b));
  if (!ta.length || !tb.size) return 0;
  let hit = 0;
  for (const w of ta) if (tb.has(w)) hit++;
  return hit / ta.length;
}

function analyzeNarrative(config) {
  const scenes = Array.isArray(config?.scenes) ? config.scenes : [];
  const captions = Array.isArray(config?.captions) ? config.captions : [];
  const errors = [];
  const warnings = [];
  const phaseTitles = new Map();

  for (const s of scenes) {
    // 1. Verbatim subtitle duplicate check
    const textsToCheck = [];
    if (s.cutoutStage?.callout) textsToCheck.push({ label: "cutoutStage.callout", text: s.cutoutStage.callout, at: s.cutoutStage.calloutAt ?? 20 });
    for (const act of s.cutoutStage?.actors ?? []) {
      if (act.says?.text) textsToCheck.push({ label: `actor(${act.id}).says`, text: act.says.text, at: act.says.at ?? 0 });
    }
    for (const item of textsToCheck) {
      const absFrame = (s.fromFrame ?? 0) + item.at;
      const cap = captions.find((c) => absFrame >= c.startFrame - 15 && absFrame <= c.endFrame + 15);
      if (cap && tokenOverlap(item.text, cap.text) >= 0.85) {
        warnings.push(`${s.id}: ${item.label} ("${item.text}") duplicates active caption ("${cap.text}")`);
      }
    }

    // 2. Phase N / Step N contradiction check
    const allLabels = [
      s.annotatedScene?.banner?.text,
      s.cutoutStage?.banner?.text,
      s.decisionTree?.title,
      s.comicStrip?.title,
      ...(s.comicStrip?.panels ?? []).map((p) => `${p.step || ""} ${p.title || ""}`),
    ].filter(Boolean);
    for (const lbl of allLabels) {
      const m = /\b(phase|step)\s+(\d+)\b[:\s·\-]+([a-z0-9\s]{4,})/i.exec(lbl);
      if (m) {
        const key = `${m[1].toLowerCase()}-${m[2]}`;
        const val = m[3].trim().toLowerCase();
        if (phaseTitles.has(key) && !phaseTitles.get(key).includes(val) && !val.includes(phaseTitles.get(key))) {
          warnings.push(`${s.id}: ${key} title "${val}" conflicts with earlier "${phaseTitles.get(key)}"`);
        } else {
          phaseTitles.set(key, val);
        }
      }
    }

    // 3. Motion-density drought check (> 240 frames gap)
    const dur = s.durationFrames ?? 0;
    if (dur > 260) {
      const times = [0, dur];
      const pushAt = (v) => { if (typeof v === "number" && v >= 0 && v <= dur) times.push(v); };
      for (const p of s.cutoutStage?.props ?? []) pushAt(p.at);
      for (const c of s.cutoutStage?.connectors ?? []) pushAt(c.at);
      for (const a of s.cutoutStage?.actors ?? []) { pushAt(a.at); pushAt(a.actionAt); pushAt(a.says?.at); }
      for (const l of s.kineticManifesto?.lines ?? []) { pushAt(l.at); pushAt(l.strikeAt); }
      for (const p of s.comicStrip?.panels ?? []) { pushAt(p.at); pushAt(p.strikeAt); }
      for (const b of s.liveInterface?.blocks ?? []) pushAt(b.at);
      for (const c of s.liveInterface?.channels ?? []) pushAt(c.at);
      pushAt(s.beforeAfterWipe?.wipeAt);
      const sorted = [...new Set(times)].sort((a, b) => a - b);
      let maxGap = 0;
      for (let i = 1; i < sorted.length; i++) maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1]);
      if (maxGap > 240) warnings.push(`${s.id}: ${maxGap}-frame (${(maxGap / 30).toFixed(1)}s) motion gap exceeds 8s`);
    }

    // 4. CutoutStage face-bubble geometry check
    for (const act of s.cutoutStage?.actors ?? []) {
      if (act.says?.text) {
        const h = act.height ?? 560;
        const ay = Math.min(820, act.y);
        const by = Math.max(96, ay - h * 0.5 - 48);
        if (by > ay - h * 0.45) {
          errors.push(`${s.id}: actor "${act.id}" speech bubble y=${by} overlaps head box`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function assertNarrativeQuality(config) {
  const res = analyzeNarrative(config);
  if (!res.ok) {
    throw new Error(`Narrative quality check failed:\n  - ${res.errors.join("\n  - ")}`);
  }
  return res;
}

module.exports = { analyzeNarrative, assertNarrativeQuality };
