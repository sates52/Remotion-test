/**
 * relationship-staging.js — EXPERIMENTAL (flag ANTIDOTE_EXPERIMENT_RELATIONSHIP_STAGING=1).
 *
 * Turns an authored, source-grounded relationship record into a book-independent
 * staging spec for one mechanism class: CONTROL BY NARRATIVE.
 *   ruling group --(announcement: a story, marked false)--> ruled group,
 *   with an alternative method shown as rejected.
 *
 * Everything book-specific (which group rules, their colours) comes from the book's
 * story bible `groups` table, which must carry evidence. Groups are drawn as groups:
 * no cast member ever stands in for a class. Fails closed: if any required piece is
 * missing or ungrounded, it returns null and the scene keeps its normal staging.
 */
const fs = require("fs");
const path = require("path");

const REJECTED_KINDS = new Set(["gun"]);
const HEX = /^#[0-9a-fA-F]{6}$/;

function groupSpec(groups, key, role) {
  const g = key && groups && groups[key];
  if (!g || g.role !== role) return null;
  if (!g.evidence || !g.evidence.quote || !g.evidence.source) return null;
  if (!HEX.test(g.body || "") || !HEX.test(g.accent || "")) return null;
  return { key, label: String(g.label || key), body: g.body, accent: g.accent, count: role === "ruling" ? 3 : 5 };
}

const tok = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, "");
// Cue point = the frame (relative to the scene start) where KEYWORD of the narration PHRASE is spoken,
// taken from the VTT word timings. Searched only inside the scene window. Null if not found.
function cueFor(ctx, phrase, keyword) {
  if (!ctx || !Array.isArray(ctx.words)) return null;
  const P = String(phrase).split(/\s+/).map(tok).filter(Boolean);
  const K = tok(keyword);
  const a = ctx.fromFrame / ctx.fps - 0.5, b = (ctx.fromFrame + ctx.durationFrames) / ctx.fps;
  const W = ctx.words.filter((x) => x.t >= a && x.t <= b).map((x) => ({ t: x.t, w: tok(x.w) }));
  for (let i = 0; i + P.length <= W.length; i++) {
    if (P.every((p, j) => W[i + j].w === p)) {
      const k = P.indexOf(K);
      const t = W[i + (k < 0 ? 0 : k)].t;
      return { local: Math.max(0, Math.round(t * ctx.fps) - ctx.fromFrame), seconds: t, phrase, keyword };
    }
  }
  return null;
}

function relationshipStaging(rel, bookDir, ctx) {
  if (!rel || typeof rel !== "object") return null;
  let bible = null;
  try { bible = JSON.parse(fs.readFileSync(path.join(bookDir, "story-bible.json"), "utf8")); } catch { return null; }
  const groups = bible && bible.groups;
  const ruling = groupSpec(groups, rel.source && rel.source.group, "ruling");
  const ruled = groupSpec(groups, rel.target && rel.target.group, "ruled");
  const means = rel.means || {};
  const label = means.label && means.label.quote ? String(means.label.quote) : null;
  const falseMarker = means.falseMarker && means.falseMarker.quote ? true : false;
  const rj = rel.rejectedMethod || {};
  const kind = REJECTED_KINDS.has(rj.icon) ? rj.icon : null;
  const scope = rj.scope ? String(rj.scope) : null;
  if (!ruling || !ruled || !label || !falseMarker || !kind || !scope) return null;
  const cues = {
    means: cueFor(ctx, means.label.quote, "story"),
    lie: cueFor(ctx, means.falseMarker.quote, "lie"),
    rejected: cueFor(ctx, scope, "not"),
  };
  if (!cues.means || !cues.lie || !cues.rejected) return null; // timing must come from the narration
  return {
    mechanism: "control-by-narrative",
    rulingGroup: ruling,
    ruledGroup: ruled,
    means: { label: label.toUpperCase(), marker: "LIE" },
    rejected: { kind, label: scope.toUpperCase() },
    cues,
  };
}

module.exports = { relationshipStaging };
