import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ANTIDOTE_FONT } from "./KineticText";
import { Everyman } from "../characters/Everyman";
import { Motif } from "../motifs";
import { pose } from "../movements";
import { voiceAt, type Speech } from "../speech";
import { DEFAULT_VARIANT } from "../schema";
import type { VariantSpec, CharAction, HandProp, PropSpec } from "../schema";

/**
 * ToldStage — THE PICTURE SHOWS WHAT IS SAID (Film Flow level 2, pilot 2026-11-12).
 *
 * The operator's finding on real films: the narration says "Microsoft … Google … Windows versus Chrome OS" and the
 * screen shows a street and two unrelated people. Measured: a scene that names a company, product or person shows it
 * in 19–37 % of cases. This stage is drawn from the THINGS THE NARRATION NAMES: each one is an emblem (its name in its
 * own colour, with a plain glyph for what it is — never a copied logo), and what the narration says happens to them
 * happens on screen, on the word: they face each other, move apart, collide, line their products up against each
 * other, turn out to be the same house.
 *
 * A scene carries `told: ToldSpec`; it is drawn only when the film's flow level is ≥ 2 (flow.ts), in place of the
 * figure-and-text staging. Every item is a pure function of the frame: a start state, `enter`, `keys` that LAND on a
 * frame (the frame of the word), `exit`. No loops: nothing moves unless the narration gives it a reason.
 */

export type ToldKey = { at: number; x?: number; y?: number; s?: number; o?: number; r?: number; dur?: number; ease?: "out" | "back" | "inout" };
export type ToldItem = {
  id: string;
  kind: "emblem" | "tile" | "word" | "planet" | "house" | "coin" | "burst" | "dash" | "cross" | "crown" | "panel" | "bar" | "arrow" | "figure" | "icon";
  /** figure: the person — look (wardrobe.tsx: age, outfit, headwear, hair …), what they do, and what is in their hand */
  variant?: Record<string, unknown>; action?: string; cue?: number; body?: "bust" | "full"; flip?: boolean; holds?: string;
  /** icon: a library icon (motifs.tsx propType: an animal, an object), or the book own drawing as paths */
  icon?: string; paths?: Array<{ d: string; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }>; viewBox?: string;
  label?: string; sub?: string; glyph?: "monitor" | "search" | "doc" | "browser" | "none";
  color?: string; ink?: string; size?: number; w?: number; h?: number; box?: string;
  x: number; y: number; s?: number; o?: number; r?: number;
  /** dash: where the line ends; it draws itself from `drawFrom` to `drawTo` */
  x2?: number; y2?: number; drawFrom?: number; drawTo?: number;
  enter?: { at: number; from?: "left" | "right" | "top" | "bottom" | "pop" | "fade"; dur?: number };
  keys?: ToldKey[];
  exit?: { at: number; dur?: number };
  shake?: { at: number; dur?: number; amp?: number };
};
export type ToldSpec = { bg?: string; grid?: boolean; items: ToldItem[]; cam?: ToldKey[] };

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const EASE = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inout: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // a small overshoot (≈ 3 %): enough to land, not enough to wobble when ten things arrive one after another
  back: (t: number) => { const c = 0.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
type State = { x: number; y: number; s: number; o: number; r: number };

/** The state of something on `frame`: its start, then each key in order — a key LANDS on its `at`. */
export function toldState(base: State, keys: ToldKey[] | undefined, frame: number): State {
  let cur = { ...base };
  for (const k of [...(keys || [])].sort((a, b) => a.at - b.at)) {
    const dur = Math.max(1, k.dur ?? 14), start = k.at - dur;
    if (frame <= start) break;
    const e = EASE[k.ease ?? "out"](clamp((frame - start) / dur));
    const to = { x: k.x ?? cur.x, y: k.y ?? cur.y, s: k.s ?? cur.s, o: k.o ?? cur.o, r: k.r ?? cur.r };
    cur = { x: cur.x + (to.x - cur.x) * e, y: cur.y + (to.y - cur.y) * e, s: cur.s + (to.s - cur.s) * e, o: cur.o + (to.o - cur.o) * e, r: cur.r + (to.r - cur.r) * e };
    if (frame < k.at) break;
  }
  return cur;
}

function itemState(it: ToldItem, frame: number): State | null {
  let st = toldState({ x: it.x, y: it.y, s: it.s ?? 1, o: it.o ?? 1, r: it.r ?? 0 }, it.keys, frame);
  if (it.enter) {
    const dur = it.enter.dur ?? 12, k = (frame - (it.enter.at - dur)) / dur;
    if (k <= 0) return null;
    const e = EASE.back(clamp(k)), from = it.enter.from ?? "pop", far = 1 - e;
    if (from === "left") st = { ...st, x: st.x - 700 * far };
    else if (from === "right") st = { ...st, x: st.x + 700 * far };
    else if (from === "top") st = { ...st, y: st.y - 500 * far };
    else if (from === "bottom") st = { ...st, y: st.y + 500 * far };
    else if (from === "pop") st = { ...st, s: st.s * Math.max(0, e) };
    st = { ...st, o: st.o * clamp(k * 2.5) };
  }
  if (it.exit) {
    const dur = it.exit.dur ?? 10, k = clamp((frame - (it.exit.at - dur)) / dur);
    if (k >= 1) return null;
    st = { ...st, o: st.o * (1 - k) };
  }
  if (it.shake) {
    const dur = it.shake.dur ?? 16, d = frame - it.shake.at;
    // ONE knock and a settle (a swing and a half, dying away) — not a vibration: at 9 swings a second it read as the
    // picture trembling (operator, 2026-11-13)
    if (d >= 0 && d < dur) { const k = d / dur; st = { ...st, x: st.x + Math.sin(k * Math.PI * 3) * (it.shake.amp ?? 12) * (1 - k) * (1 - k) }; }
  }
  return st;
}

const FONT = ANTIDOTE_FONT; // the film's own typeface (loaded once by KineticText)
const textW = (s: string, size: number) => s.length * size * 0.62;

const Glyph: React.FC<{ kind: ToldItem["glyph"] }> = ({ kind }) => {
  const w = "#FFFFFF";
  switch (kind) {
    case "monitor": return (<g><rect x={-62} y={-52} width={124} height={84} rx={8} fill="none" stroke={w} strokeWidth={12} /><rect x={-10} y={36} width={20} height={20} fill={w} /><rect x={-40} y={54} width={80} height={12} rx={6} fill={w} /></g>);
    case "search": return (<g><circle cx={-12} cy={-12} r={40} fill="none" stroke={w} strokeWidth={13} /><line x1={18} y1={18} x2={56} y2={56} stroke={w} strokeWidth={16} strokeLinecap="round" /></g>);
    case "doc": return (<g><rect x={-44} y={-58} width={88} height={116} rx={8} fill="none" stroke={w} strokeWidth={11} />{[-28, -4, 20].map((y) => <line key={y} x1={-24} y1={y} x2={24} y2={y} stroke={w} strokeWidth={9} strokeLinecap="round" />)}</g>);
    case "browser": return (<g><rect x={-64} y={-50} width={128} height={100} rx={10} fill="none" stroke={w} strokeWidth={11} /><line x1={-64} y1={-22} x2={64} y2={-22} stroke={w} strokeWidth={9} /><circle cx={-44} cy={-36} r={5} fill={w} /><circle cx={-28} cy={-36} r={5} fill={w} /></g>);
    default: return null;
  }
};

const Draw: React.FC<{ it: ToldItem; frame: number }> = ({ it, frame }) => {
  const ink = it.ink ?? "#1E1E22", color = it.color ?? "#D9603C";
  switch (it.kind) {
    case "emblem": {
      const size = it.size ?? 56, lw = textW(it.label ?? "", size);
      return (<g>
        <rect x={-112} y={-136} width={240} height={240} rx={40} fill={ink} opacity={0.18} />
        <rect x={-120} y={-150} width={240} height={240} rx={40} fill={color} />
        <g transform="translate(0,-30)"><Glyph kind={it.glyph ?? "none"} /></g>
        {it.glyph === "none" || !it.glyph ? <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill="#fff">{(it.label ?? "?")[0]}</text> : null}
        <rect x={-lw / 2 - 22} y={112} width={lw + 44} height={size + 26} rx={12} fill={ink} />
        <text x={0} y={112 + size + 2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff" letterSpacing={1}>{it.label}</text>
        {it.sub ? <text x={0} y={112 + size + 62} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={ink}>{it.sub}</text> : null}
      </g>);
    }
    case "tile": {
      const size = it.size ?? 40, w = textW(it.label ?? "", size) + 118, h = size + 44; // room for the dot before the name
      return (<g>
        <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={h / 2} fill={ink} opacity={0.16} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#fff" stroke={color} strokeWidth={7} />
        <circle cx={-w / 2 + 34} cy={0} r={11} fill={color} />
        <text x={22} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={ink}>{it.label}</text>
      </g>);
    }
    case "word": {
      const size = it.size ?? 84, w = textW(it.label ?? "", size);
      return (<g>
        {it.box ? <rect x={-w / 2 - 26} y={-size * 0.82} width={w + 52} height={size * 1.2} rx={10} fill={it.box} /> : null}
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={it.box ? "#fff" : ink} letterSpacing={1}>{it.label}</text>
      </g>);
    }
    case "planet": return (<g><circle r={it.size ?? 300} fill={color} opacity={0.16} /><circle r={(it.size ?? 300) * 0.72} fill={color} opacity={0.14} /><ellipse rx={(it.size ?? 300) * 1.18} ry={(it.size ?? 300) * 0.24} fill="none" stroke={color} strokeWidth={6} opacity={0.4} transform="rotate(-14)" /></g>);
    case "house": {
      const w = it.w ?? 380, h = it.h ?? 300;
      return (<g>
        <polygon points={`${-w / 2 - 34},${-h} 0,${-h - 170} ${w / 2 + 34},${-h}`} fill={color} />
        <rect x={-w / 2} y={-h} width={w} height={h} fill={color} opacity={0.82} />
        <rect x={-44} y={-150} width={88} height={150} rx={6} fill={ink} opacity={0.7} />
        {[-1, 1].map((d) => <rect key={d} x={d * (w / 2 - 92) - 34} y={-h + 46} width={68} height={68} rx={6} fill="#fff" opacity={0.85} />)}
        {it.label ? <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={ink}>{it.label}</text> : null}
      </g>);
    }
    case "coin": return (<g><circle r={30} fill="#E8B93C" stroke="#B88A1E" strokeWidth={6} /><text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#7A5A10">$</text></g>);
    case "burst": {
      const pts = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2, r = i % 2 ? 70 : 150; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(" ");
      return <polygon points={pts} fill={color} stroke={ink} strokeWidth={8} strokeLinejoin="round" />;
    }
    case "dash": {
      const k = clamp((frame - (it.drawFrom ?? 0)) / Math.max(1, (it.drawTo ?? 20) - (it.drawFrom ?? 0)));
      return <line x1={0} y1={0} x2={((it.x2 ?? it.x) - it.x) * k} y2={((it.y2 ?? it.y) - it.y) * k} stroke={ink} strokeWidth={8} strokeDasharray="26 22" strokeLinecap="round" opacity={0.6} />;
    }
    case "cross": return (<g stroke={color} strokeWidth={22} strokeLinecap="round"><line x1={-44} y1={-44} x2={44} y2={44} /><line x1={44} y1={-44} x2={-44} y2={44} /></g>);
    case "crown": return <polygon points="-70,36 -84,-40 -38,-2 0,-58 38,-2 84,-40 70,36" fill="#E8B93C" stroke="#B88A1E" strokeWidth={7} strokeLinejoin="round" />;
    case "panel": return <rect x={-(it.w ?? 980) / 2} y={-(it.h ?? 1100) / 2} width={it.w ?? 980} height={it.h ?? 1100} fill={color} />;
    case "bar": return <rect x={-(it.w ?? 250) / 2} y={-(it.h ?? 56) / 2} width={it.w ?? 250} height={it.h ?? 56} rx={10} fill={ink} />;
    case "arrow": return (<g stroke={ink} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.75}><line x1={-60} y1={0} x2={60} y2={0} /><polyline points="30,-30 60,0 30,30" /></g>);
    default: return null;
  }
};

/** A name under a person, an animal or a thing: the same plate the emblems carry. */
const Tag: React.FC<{ label: string; size?: number; above?: number }> = ({ label, size = 40, above }) => {
  const w = textW(label, size) + 40;
  // `above` = px from the top of the box to the top of the head: a PERSON's name sits over the head, where the
  // subtitle band never covers it (under the feet it was hidden: the-creative-curve pilot, QUEEN / ROCHLITZ)
  const y0 = above != null ? above - (size + 34) : 6;
  return (
    <svg width={1} height={1} style={{ overflow: "visible", position: "absolute", left: "50%", top: above != null ? 0 : "100%" }}>
      <rect x={-w / 2} y={y0} width={w} height={size + 22} rx={10} fill="#1E1E22" />
      <text x={0} y={y0 + size + 2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill="#fff" letterSpacing={1}>{label}</text>
    </svg>
  );
};

/**
 * The stage. Every item sits in its own box at (x, y), so a drawn emblem, a rigged PERSON (any age, any dress — the
 * engine's own Everyman), a library ICON (an animal, an object: motifs.tsx) and a book's OWN drawing (customSvg paths)
 * share one stage, one camera and one clock. `absBase` = the film frame of this stage's frame 0, so a figure that
 * talks moves its mouth on the narration (speech.ts).
 */
export const ToldStage: React.FC<{ spec: ToldSpec; absBase?: number; speech?: Speech | null }> = ({ spec, absBase = 0, speech = null }) => {
  const frame = useCurrentFrame();
  const cam = toldState({ x: 960, y: 540, s: 1, o: 1, r: 0 }, spec.cam, frame);
  const voice = speech ? voiceAt(speech, absBase + frame) : undefined;
  return (
    <AbsoluteFill style={{ backgroundColor: spec.bg ?? "#F2F0EA", overflow: "hidden" }}>
      {spec.grid !== false ? (
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", opacity: 0.5 }}>
          {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 120} y1={0} x2={i * 120} y2={1080} stroke="#E2DFD6" strokeWidth={2} />)}
          {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 120} x2={1920} y2={i * 120} stroke="#E2DFD6" strokeWidth={2} />)}
        </svg>
      ) : null}
      {/* the camera looks AT a point (cam.x, cam.y) with a zoom: a push-in on the thing being talked about */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(960px, 540px) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)` }}>
        {spec.items.map((it) => {
          const st = itemState(it, frame);
          if (!st || st.o <= 0.001) return null;
          const tf = `rotate(${st.r}deg) scale(${st.s})`;
          if (it.kind === "figure") {
            // a PERSON: who the narration names, at the age and in the dress the book gives them
            const w = it.w ?? 300, full = it.body === "full", h = w * (full ? 2.25 : 1.5);
            const v = { ...DEFAULT_VARIANT, ...(it.variant || {}) } as VariantSpec;
            // THE POSE CLOCK never restarts at a cut. A figure that is already on stage when the scene starts (no `enter`)
            // has finished its gesture (settled), or — standing — runs on the film's own clock, so a blink carries over
            // the cut. Only a figure that enters here plays its gesture from the start. And a figure stands STILL unless
            // it is given something to do: only one that talks hears the narration (movements.ts Live.calm).
            const action = (it.action ?? "idle") as CharAction;
            const seed = it.id.length * 7 + Math.round(it.x);
            // each figure blinks on its own clock (offset by its seed): five people blinking on the same frame is a flicker
            const local = it.enter ? Math.max(0, frame - (it.enter.at - (it.enter.dur ?? 12))) : (action === "idle" || action === "talk" ? absBase + frame : frame + 100000) + (seed % 89) * 3;
            const p = pose(action, local, 30, it.cue ?? 24, "lead", { voice: action === "talk" ? voice : undefined, seed, calm: true });
            return (
              <div key={it.id} style={{ position: "absolute", left: st.x - w / 2, top: st.y - h, width: w, height: h, opacity: st.o, transform: tf, transformOrigin: "50% 100%" }}>
                <div style={it.flip ? { transform: "scaleX(-1)" } : undefined}><Everyman variant={v} pose={p} width={w} body={full ? "full" : "bust"} holds={it.holds as HandProp | undefined} /></div>
                {it.label ? <Tag label={it.label} size={it.size ?? 38} above={h * (1 - Math.min(1, v.height ?? 1)) * 0.9} /> : null}
              </div>
            );
          }
          if (it.kind === "icon") {
            // an ANIMAL or an OBJECT from the icon library, or the book's own drawing
            const box = 520 * (it.w ? it.w / 520 : 0.6);
            const prop = { type: it.icon ?? "customSvg", x: 960, y: 540, scale: 1, enter: "none", at: 0, arc: "none", color: it.color, color2: it.ink, customSvg: it.paths ? { viewBox: it.viewBox ?? "0 0 520 520", paths: it.paths } : undefined } as unknown as PropSpec;
            return (
              <div key={it.id} style={{ position: "absolute", left: st.x - box / 2, top: st.y - box / 2, width: box, height: box, opacity: st.o, transform: tf }}>
                <div style={{ position: "absolute", left: box / 2 - 960 * (box / 520), top: box / 2 - 540 * (box / 520), width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${box / 520})` }}>
                  <Motif spec={prop} accent={it.color ?? "#D9603C"} ink={it.ink ?? "#1E1E22"} />
                </div>
                {it.label ? <Tag label={it.label} size={it.size ?? 38} /> : null}
              </div>
            );
          }
          return (
            <div key={it.id} style={{ position: "absolute", left: st.x, top: st.y, opacity: st.o, transform: tf }}>
              <svg width={1} height={1} style={{ overflow: "visible", position: "absolute" }}><Draw it={it} frame={frame} /></svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
