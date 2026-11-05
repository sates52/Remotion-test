/**
 * SemanticStage2 — Semantic Film Director 2.0 (cycle 12, experiment branch dev/c12). Draws a compiled v2 contract
 * (scripts/lib/semantic-director-v2.js). Differences from SemanticStage (v1, frozen for arm B):
 *  - VISUAL PROOF (CineCode visual-proof.md / iso-infographic.md, adapted): the stage is built piece by piece — an
 *    entity enters at its first read — and only the read in focus is at full strength; the rest is desaturated and
 *    lightened (never made transparent: ghosts read as absence).
 *  - SHOT READS: the read windows come from the contract; the compiler timed every change to complete as its result
 *    read begins, and the result holds to the end.
 *  - New change verbs: size (widen / narrow, the old size kept as a dashed outline), cover (one thing laid over
 *    another that stays visible underneath), reveal (something found that was there: a dotted sight-line and a
 *    spotlight, no causal token). A negated entity (a rejected premise / the rejected side of a contrast) is crossed
 *    out.
 *  - Scale: the focal subject is at least a third of the frame height (C11: a row of tiny figures did not read).
 *  - Camera purpose: hold / compare locked; consequence = a slow push toward the result while it is read; reveal =
 *    starts close on the cause and opens to the whole incident.
 *  - Quote cards (type H) stand on a neutral ground, never on the source set (C11 B09), with the speaker named when
 *    it is not the narrator.
 * Deterministic: (spec, frame) only. Accent only on the cause.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Everyman } from "../characters/Everyman";
import { pose } from "../movements";
import { Motif } from "../motifs";
import { HeldProp, HAND_PROPS } from "../handprops";
import type { CastBible, HandProp, VariantSpec } from "../schema";
import { DEFAULT_VARIANT } from "../schema";

export type Sem2Entity = { id: string; kind: "person" | "stock" | "object" | "group"; label?: string; glyph?: string; cast?: string; value?: number; mood?: string; present?: boolean; lane?: number; negated?: boolean; enter: number };
export type Sem2Effect = { entity: string; value?: number; mood?: string; present?: boolean; moveTo?: string; broken?: boolean; size?: number; cover?: string; reveal?: boolean };
export type Sem2Read = { from: number; to: number; focus: string; what: string };
export type SemanticCompiled2 = {
  v: 2; type: string; lanes: 1 | 2; laneLabels?: string[]; text?: string; speaker?: string | null;
  entities: Sem2Entity[]; occ: { cause: string; cue: number; effects: Sem2Effect[] }[]; reads: Sem2Read[];
  camera: "hold" | "compare" | "consequence" | "reveal"; timing: { token: number; pause: number; change: number };
};

const W = 1920;
const NEUTRAL = "#8A8F98";
const DIM = "grayscale(1) contrast(0.55) brightness(1.3)";
const ease = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type St = { value: number; value0: number; mood?: string; vis: number; vis0: number; moveTo?: string; moveK: number; broken: boolean; size: number; size0: number; cover?: string; coverK: number; revealK: number };

export function semanticState2(spec: SemanticCompiled2, frame: number): Record<string, St> {
  const s: Record<string, St> = {};
  for (const e of spec.entities) {
    const v = clamp01(e.value ?? 1), vis = e.present === false ? 0 : 1;
    s[e.id] = { value: v, value0: v, mood: e.mood, vis, vis0: vis, moveK: 0, broken: false, size: 1, size0: 1, coverK: 0, revealK: 0 };
  }
  const { token, pause, change } = spec.timing;
  for (const o of spec.occ) {
    const t0 = o.cue + token + pause;
    if (frame < t0) continue;
    const k = ease((frame - t0) / change);
    for (const f of o.effects) {
      const st = s[f.entity]; if (!st) continue;
      if (f.value != null) st.value = st.value + (clamp01(f.value) - st.value) * k;
      if (f.mood && k >= 0.5) st.mood = f.mood;
      if (f.present != null) st.vis = st.vis + ((f.present ? 1 : 0) - st.vis) * k;
      if (f.reveal) st.revealK = k;
      if (f.broken && k >= 0.5) st.broken = true;
      if (f.moveTo) { st.moveTo = f.moveTo; st.moveK = k; }
      if (f.size != null) st.size = st.size + (f.size - st.size) * k;
      if (f.cover) { st.cover = f.cover; st.coverK = k; }
    }
  }
  return s;
}

export function semanticLayout2(spec: SemanticCompiled2) {
  const two = spec.lanes === 2;
  const pos: Record<string, { x: number; y: number; s: number }> = {};
  for (let l = 0; l < (two ? 2 : 1); l++) {
    const row = spec.entities.filter((e) => (two ? (e.lane ?? 0) === l : true));
    const shrink = row.length >= 4 ? 0.8 : 1;
    row.forEach((e, i) => { pos[e.id] = { x: Math.round(160 + (W - 320) * (i + 1) / (row.length + 1)), y: two ? (l === 0 ? 320 : 790) : 560, s: (two ? 0.72 : 1) * shrink }; });
  }
  return pos;
}

// the focal subject reads at >= 1/3 of the frame height (1080 / 3 = 360 px)
const SIZE = { person: 380, stockW: 220, stockH: 440, icon: 0.82, gap: 60, fig: 1.5 };
const halfH = (k: Sem2Entity["kind"], s: number) => s * (k === "person" ? 285 : k === "stock" ? SIZE.stockH / 2 : k === "group" ? 70 : 213);

const Label: React.FC<{ x: number; y: number; text?: string; ink: string; s: number; anchor?: "middle" | "start" }> = ({ x, y, text, ink, s, anchor = "middle" }) =>
  text ? <text x={x} y={y} textAnchor={anchor} fontFamily="Inter, Arial, sans-serif" fontWeight={800} fontSize={46 * Math.max(0.8, s)} fill={ink} stroke="#FFFFFF" strokeWidth={8} paintOrder="stroke">{text.toUpperCase()}</text> : null;

const Figure: React.FC<{ x: number; y: number; s: number; ink: string; mode: "on" | "ghost" | "off" }> = ({ x, y, s, ink, mode }) => {
  const head = <circle cx={x} cy={y - 24 * s} r={13 * s} />, body = <rect x={x - 12 * s} y={y - 8 * s} width={24 * s} height={50 * s} rx={10 * s} />;
  if (mode === "on") return <g fill={ink}>{head}{body}</g>;
  if (mode === "ghost") return <g fill="none" stroke={ink} strokeWidth={3} strokeDasharray="5 5">{head}{body}</g>;
  return <g fill={ink} opacity={0.12}>{head}{body}</g>;
};

const Cross: React.FC<{ x: number; y: number; r: number; ink: string }> = ({ x, y, r, ink }) => (
  <g stroke={ink} strokeWidth={18} strokeLinecap="round"><line x1={x - r} y1={y - r} x2={x + r} y2={y + r} /><line x1={x + r} y1={y - r} x2={x - r} y2={y + r} /></g>
);

export const SemanticStage2: React.FC<{ spec: SemanticCompiled2; accent: string; ink: string; cast?: CastBible }> = ({ spec, accent, ink, cast }) => {
  const frame = useCurrentFrame();
  if (spec.type === "H" || !spec.entities.length) {
    const op = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <AbsoluteFill style={{ background: "#F3F1EC", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: op, maxWidth: 1400, textAlign: "center", fontFamily: "Inter, Arial, sans-serif", color: ink }}>
          <div style={{ fontWeight: 900, fontSize: 78, lineHeight: 1.12 }}>{spec.text || ""}</div>
          {spec.speaker ? <div style={{ marginTop: 28, fontWeight: 700, fontSize: 40, opacity: 0.75 }}>— {String(spec.speaker).toUpperCase()}</div> : null}
        </div>
      </AbsoluteFill>
    );
  }
  const pos = semanticLayout2(spec);
  const st = semanticState2(spec, frame);
  const { token, pause, change } = spec.timing;
  const read = [...spec.reads].reverse().find((r) => frame >= r.from && frame < r.to) || null;
  const focus = read ? read.focus : null;
  const dimmed = (id: string) => !!focus && focus !== id;
  const causes = new Set(spec.occ.filter((o) => frame >= o.cue - 8).map((o) => o.cause));
  const ent = (id: string) => spec.entities.find((e) => e.id === id)!;
  const visible = (e: Sem2Entity) => frame >= e.enter;
  const enterK = (e: Sem2Entity) => ease((frame - e.enter) / 10);
  const at = (id: string) => {
    const p = pos[id], s = st[id];
    if (!p || !s) return p;
    if (s.cover && pos[s.cover]) { const q = pos[s.cover]; return { x: p.x + (q.x - p.x) * s.coverK, y: p.y + (q.y - 40 * q.s - p.y) * s.coverK, s: p.s }; }
    if (s.moveTo && pos[s.moveTo]) { const q = pos[s.moveTo]; return { x: p.x + (q.x + 210 * q.s - p.x) * s.moveK, y: p.y + (q.y + 80 * q.s - p.y) * s.moveK, s: p.s }; }
    return p;
  };
  // camera purpose
  const last = spec.reads[spec.reads.length - 1];
  let camS = 1, camX = 0, camY = 0;
  if (spec.camera === "consequence" && last && pos[last.focus]) {
    const k = ease((frame - last.from) / 40);
    camS = 1 + 0.12 * k; const t = pos[last.focus]; camX = (W / 2 - t.x) * 0.25 * k; camY = (540 - t.y) * 0.25 * k;
  } else if (spec.camera === "reveal" && spec.occ[0] && pos[spec.occ[0].cause]) {
    const firstRead = spec.reads[1] || spec.reads[0];
    const k = 1 - ease((frame - (firstRead ? firstRead.from - 20 : 30)) / 30);
    const t = pos[spec.occ[0].cause]; camS = 1 + 0.3 * k; camX = (W / 2 - t.x) * k; camY = (540 - t.y) * k;
  }
  const camStyle: React.CSSProperties = { transform: `translate(${camX}px, ${camY}px) scale(${camS})`, transformOrigin: "960px 540px" };
  const filt = (id: string): React.CSSProperties => ({ filter: dimmed(id) ? DIM : undefined, transition: "none" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: spec.lanes === 2 ? 50 : 90, bottom: spec.lanes === 2 ? 20 : 70, borderRadius: 48, background: "rgba(255,255,255,0.7)" }} />
      <AbsoluteFill style={camStyle}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <defs><marker id="sem2Arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={ink} /></marker></defs>
          {spec.lanes === 2 ? <line x1={130} x2={W - 130} y1={565} y2={565} stroke={ink} strokeOpacity={0.3} strokeWidth={4} strokeDasharray="14 14" /> : null}
          {spec.lanes === 2 && spec.laneLabels ? spec.laneLabels.map((t, l) => <Label key={l} x={120} y={l === 0 ? 110 : 610} text={t} ink={ink} s={0.8} anchor="start" />) : null}
          {spec.occ.map((o, i) => {
            const a = pos[o.cause]; if (!a || frame < o.cue - 8 || !visible(ent(o.cause))) return null;
            const ring = interpolate(frame, [o.cue - 8, o.cue, o.cue + token + pause + change], [0, 1, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tk = ease((frame - o.cue) / token);
            const ha = halfH(ent(o.cause).kind, a.s);
            return (
              <g key={i}>
                <circle cx={a.x} cy={a.y} r={ha + 30} fill="none" stroke={accent} strokeWidth={12} opacity={ring} />
                {o.effects.map((f, j) => {
                  const b = pos[f.cover ? f.entity : f.entity]; if (!b || f.entity === o.cause || frame < o.cue) return null;
                  const hb = halfH(ent(f.entity).kind, b.s), same = Math.abs(a.y - b.y) < 2;
                  const ax = a.x, ay = same ? a.y - ha - 10 : a.y + (b.y > a.y ? ha : -ha);
                  const bx = b.x, by = same ? b.y - hb - 10 : b.y + (b.y > a.y ? -hb : hb);
                  const qx = (ax + bx) / 2, qy = same ? Math.min(ay, by) - 90 : (ay + by) / 2;
                  if (f.reveal) // found, not caused: a dotted sight-line, no token, no arrowhead
                    return <path key={j} d={`M ${ax} ${ay} Q ${qx} ${qy} ${bx} ${by}`} fill="none" stroke={ink} strokeOpacity={0.6 * Math.min(1, tk * 1.5)} strokeWidth={6} strokeDasharray="2 14" strokeLinecap="round" />;
                  const x = (1 - tk) * (1 - tk) * ax + 2 * (1 - tk) * tk * qx + tk * tk * bx, y = (1 - tk) * (1 - tk) * ay + 2 * (1 - tk) * tk * qy + tk * tk * by;
                  return (
                    <g key={j}>
                      <path d={`M ${ax} ${ay} Q ${qx} ${qy} ${bx} ${by}`} fill="none" stroke={ink} strokeOpacity={0.55 * Math.min(1, tk * 1.5)} strokeWidth={6} markerEnd={tk >= 1 ? "url(#sem2Arrow)" : undefined} />
                      {tk < 1 ? <circle cx={x} cy={y} r={22} fill={accent} /> : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
          {spec.entities.map((e) => {
            const p = pos[e.id], s = st[e.id]; if (!p || !s || !visible(e)) return null;
            const op = enterK(e);
            if (e.kind === "stock") {
              const sc = p.s * s.size, h = SIZE.stockH * p.s, w = SIZE.stockW * sc, inner = h - 20;
              const top = p.y - h / 2, floor = top + h - 10, changed = Math.abs(s.value - s.value0) > 0.02, w0 = SIZE.stockW * p.s * s.size0;
              return (
                <g key={e.id} opacity={op} style={filt(e.id)}>
                  {Math.abs(s.size - s.size0) > 0.02 ? <rect x={p.x - w0 / 2} y={top} width={w0} height={h} rx={22} fill="none" stroke={ink} strokeWidth={5} strokeDasharray="12 10" /> : null}
                  <rect x={p.x - w / 2} y={top} width={w} height={h} rx={22 * p.s} fill="#FFFFFF" stroke={ink} strokeWidth={8} />
                  <rect x={p.x - w / 2 + 10} y={floor - inner * s.value} width={w - 20} height={inner * s.value} rx={12 * p.s} fill={ink} fillOpacity={0.82} />
                  {changed ? <line x1={p.x - w / 2 - 18} x2={p.x + w / 2 + 18} y1={floor - inner * s.value0} y2={floor - inner * s.value0} stroke={ink} strokeWidth={5} strokeDasharray="12 10" /> : null}
                  {e.negated ? <Cross x={p.x} y={p.y} r={h / 2.4} ink={ink} /> : null}
                  <Label x={p.x} y={top + h + 56 * p.s} text={e.label} ink={ink} s={p.s} />
                </g>
              );
            }
            if (e.kind === "group") {
              const sc = p.s * SIZE.fig * s.size, gap = SIZE.gap * p.s * s.size;
              const n = Math.round(s.value * 10), n0 = Math.round(s.value0 * 10);
              return (
                <g key={e.id} opacity={op} style={filt(e.id)}>
                  {Array.from({ length: 10 }, (_, k) => <Figure key={k} x={p.x - 4.5 * gap + k * gap} y={p.y} s={sc} ink={ink} mode={k < n ? "on" : k < n0 ? "ghost" : "off"} />)}
                  {e.negated ? <Cross x={p.x} y={p.y} r={5 * gap} ink={ink} /> : null}
                  <Label x={p.x} y={p.y + 120 * p.s} text={e.label} ink={ink} s={p.s} />
                </g>
              );
            }
            if (e.kind === "object") {
              const q = at(e.id)!, r = 190 * p.s;
              const moved = (!!s.moveTo && s.moveK > 0.02) || (!!s.cover && s.coverK > 0.02);
              const gone = s.vis0 > 0.5 && s.vis < 0.98;
              return (
                <g key={e.id} style={filt(e.id)} opacity={op}>
                  {(moved || gone) ? <rect x={p.x - r} y={p.y - r} width={2 * r} height={2 * r} rx={30} fill="none" stroke={ink} strokeWidth={5} strokeDasharray="14 12" opacity={0.75} /> : null}
                  {moved ? <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ink} strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" opacity={0.7} /> : null}
                  {s.revealK > 0 ? <circle cx={p.x} cy={p.y} r={r * 1.15} fill="none" stroke={ink} strokeWidth={6} opacity={0.6 * s.revealK} /> : null}
                  <Label x={p.x} y={p.y + r + 56 * p.s} text={e.label} ink={ink} s={p.s} />
                </g>
              );
            }
            if (e.kind === "person") return (
              <g key={e.id} opacity={op} style={filt(e.id)}>
                {e.negated ? <Cross x={p.x} y={p.y} r={halfH("person", p.s)} ink={ink} /> : null}
                <Label x={p.x} y={p.y + halfH("person", p.s) + 56 * p.s} text={e.label} ink={ink} s={p.s} />
              </g>
            );
            return null;
          })}
        </svg>
        {spec.entities.map((e) => {
          const p = pos[e.id], s = st[e.id]; if (!p || !s || !visible(e)) return null;
          const acc = causes.has(e.id) ? accent : NEUTRAL;
          const op = enterK(e);
          if (e.kind === "object" && e.glyph) {
            const q = at(e.id)!, shrink = s.cover ? 1 - 0.15 * s.coverK : s.moveTo ? 1 - 0.3 * s.moveK : 1, sz = s.size * shrink;
            const crack = s.broken ? (
              <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
                <path d={`M ${q.x - 130 * p.s} ${q.y - 140 * p.s} L ${q.x - 10 * p.s} ${q.y - 20 * p.s} L ${q.x - 60 * p.s} ${q.y + 20 * p.s} L ${q.x + 120 * p.s} ${q.y + 140 * p.s}`} stroke="#FFFFFF" strokeWidth={24} fill="none" strokeLinecap="round" />
                <path d={`M ${q.x - 130 * p.s} ${q.y - 140 * p.s} L ${q.x - 10 * p.s} ${q.y - 20 * p.s} L ${q.x - 60 * p.s} ${q.y + 20 * p.s} L ${q.x + 120 * p.s} ${q.y + 140 * p.s}`} stroke={ink} strokeWidth={9} fill="none" strokeLinecap="round" />
              </svg>) : null;
            const cross = e.negated ? <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><Cross x={q.x} y={q.y} r={150 * p.s} ink={ink} /></svg> : null;
            const vis = s.vis0 === 0 && s.revealK > 0 ? s.revealK : s.vis;
            const glyph = (HAND_PROPS as Record<string, unknown>)[e.glyph]
              ? <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><g transform={`translate(${q.x} ${q.y}) scale(${4.2 * p.s * sz})`}><HeldProp prop={e.glyph as HandProp} ink={ink} accent={acc} /></g></svg>
              : <Motif spec={{ type: e.glyph, x: q.x, y: q.y, scale: SIZE.icon * p.s * sz, at: 0, enter: "none", arc: "none" } as any} accent={acc} ink={ink} />;
            return (
              <AbsoluteFill key={e.id} style={{ ...filt(e.id), opacity: op, zIndex: s.cover ? 2 : 1 }}>
                <AbsoluteFill style={{ opacity: vis }}>{glyph}</AbsoluteFill>
                {crack}{cross}
              </AbsoluteFill>
            );
          }
          if (e.kind === "person") {
            const cv = (e.cast && cast && cast[e.cast] && cast[e.cast]!.variant) || {};
            const v = { ...DEFAULT_VARIANT, ...cv, ...(s.mood ? { expression: s.mood } : {}) } as VariantSpec;
            const w = SIZE.person * p.s;
            return (
              <div key={e.id} style={{ position: "absolute", left: p.x - w / 2, top: p.y - w * 0.75, opacity: op * (0.15 + 0.85 * s.vis), ...filt(e.id) }}>
                <Everyman variant={v} pose={pose("idle", frame, 30)} width={w} body="bust" />
              </div>
            );
          }
          return null;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
