/**
 * told-compile.js — FILM FLOW 2: an author says WHO is on stage and WHAT HAPPENS ON WHICH WORD; this turns it into the
 * keyframed stage the engine draws (src/engines/antidote/told.ts → components/ToldStage.tsx). 2026-11-14.
 *
 * Why a compiler: the two pilots the operator approved (zero-to-one, the-creative-curve) were written by hand as frame
 * numbers and pixel positions — 21 scenes took a session. An author of a 300-beat book must not count frames. So:
 *
 *   entities  (book level, storyboard/entities.json): every thing the narration names, once —
 *             { "<id>": { label, kind: company|product|place|idea|person|object|animal, glyph?, color?, look?, paths?, w? } }
 *             company / product / place / idea → an EMBLEM (its name in its colour + a plain glyph, never a copied logo);
 *             person → a FIGURE (the engine's own rig: look = age, outfit, headwear, hair, …); object / animal → the
 *             book's own DRAWING (paths, as in motifs.json).
 *   a told beat (in the authored chunk):
 *             "told": { "stage": { "layout": "versus", "who": ["microsoft", "google"] },
 *                       "events": [ { "on": "king", "do": "crown", "who": "microsoft" }, … ] }
 *             `on` is a word (or the first words of a phrase) of THIS beat's narration: the event LANDS on it.
 *
 * The compiler places things (layouts, label sides, rows, the title band), keeps what is on stage from beat to beat
 * (a thing stays where the last beat left it; nothing re-enters at a cut), moves what belongs to a thing with it (its
 * crown, its world, its labels), and refuses what it cannot honour (an unknown name, a word the narrator does not say).
 * Pure: (beats, entities) → stages. No clock, no randomness, no model call. Tested by test-told-compile.js.
 */
const T = require("../../src/engines/antidote/told.ts");

const INK = "#1E1E22", ACCENT = "#D9603C", RED = "#C2362B", GOLD = "#E8B93C";
const PALETTE = ["#2563EB", "#E0503A", "#2F8F5B", "#8A4FC7", "#D08A1E", "#0E8C96", "#B5372F", "#5A6B7A"];
const GLYPHS = ["monitor", "search", "doc", "browser", "building", "book", "coin", "globe", "gear", "phone", "chart", "star", "heart", "flag", "cart", "people", "bolt", "leaf"];
const KINDS = { company: "emblem", product: "emblem", place: "emblem", idea: "emblem", person: "figure", object: "icon", animal: "icon" };
const LAYOUTS = ["solo", "versus", "row", "court", "pairs"];
const DOS = ["enter", "exit", "arrange", "title", "label", "crown", "uncrown", "world", "cross", "stamp", "cover", "uncover", "dim", "restore", "grow", "shake", "apart", "together", "collide", "burst", "coins", "pair", "date", "focus", "wide", "clear", "change", "raw"];
const Y = { emblem: 470, figure: 790, icon: 600 };
const SAFE = { top: 130, bottom: 860 }; // the HUD above, the subtitle band below

const norm = (w) => String(w || "").toLowerCase().replace(/[^a-z0-9']/g, "");
const clone = (o) => JSON.parse(JSON.stringify(o));

/** The frame (beat-relative) at which `on` is said, searching from word index `from`. → {frame, index} or null */
function wordFrame(words, on, from = 0) {
  const want = String(on).split(/\s+/).map(norm).filter(Boolean);
  if (!want.length) return null;
  for (let i = from; i < words.length; i++) {
    if (want.every((w, k) => words[i + k] && norm(words[i + k].w) === w)) return { frame: words[i].f, index: i };
  }
  // a looser match: the word starts with what the author wrote ("compet" → "competition")
  for (let i = from; i < words.length; i++) if (norm(words[i].w).startsWith(want[0]) && want[0].length >= 4) return { frame: words[i].f, index: i };
  return null;
}

function slots(layout, n) {
  if (layout === "solo") return [{ x: 960, s: 1 }];
  if (layout === "versus") return [{ x: 560, s: 1 }, { x: 1360, s: 1 }];
  if (layout === "pairs") return [{ x: 560, y: 230, s: 0.5 }, { x: 1360, y: 230, s: 0.5 }];
  if (layout === "court") { // the first is in the middle, the others stand around: left, right, left, right
    const side = [330, 1590, 580, 1340, 130, 1790];
    return Array.from({ length: n }, (_, i) => (i === 0 ? { x: 960, s: 1 } : { x: side[(i - 1) % side.length], s: 1 }));
  }
  const s = n <= 3 ? 1 : n === 4 ? 0.8 : 0.65, a = 340, b = 1580;
  return Array.from({ length: n }, (_, i) => ({ x: n === 1 ? 960 : a + ((b - a) * i) / (n - 1), s }));
}

const titleSize = (text) => (text.length <= 14 ? 104 : text.length <= 22 ? 84 : text.length <= 30 ? 68 : 56);

/** The entity as a stage item (no position yet). */
function entityItem(id, e, colorOf) {
  const kind = KINDS[e.kind];
  if (kind === "emblem") return { id, kind: "emblem", label: e.label, sub: e.sub, glyph: e.glyph, color: e.color || colorOf(id), _role: "entity", _ent: id };
  if (kind === "figure") return { id, kind: "figure", label: e.label, variant: e.look || {}, w: e.w || 260, body: e.body || "full", action: e.action || "idle", holds: e.holds, flip: e.flip, _role: "entity", _ent: id };
  return { id, kind: "icon", label: e.label, paths: e.paths || [], viewBox: e.viewBox, w: e.w || 312, _role: "entity", _ent: id };
}

function validateEntities(entities) {
  const errors = [];
  for (const [id, e] of Object.entries(entities || {})) {
    if (!/^[a-z][a-z0-9-]*$/.test(id)) errors.push(`entity "${id}": the id is lower-case letters, digits and "-"`);
    if (!KINDS[e.kind]) errors.push(`entity "${id}": kind is one of ${Object.keys(KINDS).join(" | ")}`);
    if (KINDS[e.kind] !== "icon" && !String(e.label || "").trim()) errors.push(`entity "${id}": a ${e.kind} needs a label (the name the narration uses)`);
    if (KINDS[e.kind] === "icon" && !(Array.isArray(e.paths) && e.paths.length)) errors.push(`entity "${id}": an ${e.kind} is the book's own drawing — give its paths`);
    if (e.glyph && !GLYPHS.includes(e.glyph)) errors.push(`entity "${id}": glyph "${e.glyph}" cannot be drawn — one of ${GLYPHS.join(", ")} (or none: the first letter is shown)`);
  }
  return errors;
}

/**
 * compileTold(beats, entities) → { stages: [ToldSpec | null], errors: [{beat, message}], warnings: [...] }
 *   beats: [{ id, frames, words: [{w, f}], told? }] in film order; a beat without `told` ends the carried stage.
 */
function compileTold(beats, entities = {}) {
  const errors = validateEntities(entities).map((message) => ({ beat: null, message })), warnings = [];
  const ids = Object.keys(entities);
  const colorOf = (id) => PALETTE[ids.filter((k) => KINDS[entities[k].kind] === "emblem").indexOf(id) % PALETTE.length] || PALETTE[0];
  let carried = [], cam = { x: 960, y: 540, s: 1 }, seq = 0;
  const stages = [];

  for (const beat of beats) {
    if (!beat.told) { stages.push(null); carried = []; cam = { x: 960, y: 540, s: 1 }; continue; }
    const err = (message) => errors.push({ beat: beat.id, message });
    const told = beat.told, words = beat.words || [], D = beat.frames;
    // what the last beat left on stage: where it was at its last frame, already there (no entrance)
    const items = carried.map((it) => { const c = clone(it); delete c.enter; delete c.keys; delete c.exit; delete c.shake; return c; });
    const camKeys = cam.x !== 960 || cam.y !== 540 || cam.s !== 1 ? [{ at: 0, dur: 1, x: cam.x, y: cam.y, s: cam.s }] : [];
    const curCam = { ...cam };
    const find = (id) => items.find((it) => it.id === id && !it._gone);
    const stateAt = (it, f) => T.itemState(it, f) || { x: it.x, y: it.y, s: it.s ?? 1, o: it.o ?? 1, r: it.r ?? 0 };
    const key = (it, k) => { (it.keys = it.keys || []).push(k); };
    const bound = (ent) => items.filter((it) => it._bind === ent && !it._gone);
    /** move an entity; what belongs to it (crown, world, labels, cover) keeps its place relative to it */
    const move = (ent, at, to, dur = 18, ease = "inout") => {
      const it = find(ent); if (!it) return;
      const from = stateAt(it, at - dur), ns = to.s ?? from.s, nx = to.x ?? from.x, ny = to.y ?? from.y;
      key(it, { at, dur, ease, x: nx, y: ny, s: ns, ...(to.o != null ? { o: to.o } : {}), ...(to.r != null ? { r: to.r } : {}) });
      for (const b of bound(ent)) {
        const bs = stateAt(b, at - dur), ratio = ns / (from.s || 1);
        key(b, { at, dur, ease, x: nx + (bs.x - from.x) * ratio, y: ny + (bs.y - from.y) * ratio, s: bs.s * ratio });
      }
    };
    const leave = (it, at, dur = 10) => { it.exit = { at: Math.max(dur, at), dur }; it._gone = true; };
    const add = (it) => { items.push(it); return it; };
    const ensure = (ent, at, slot, from) => {
      const e = entities[ent];
      if (!e) { err(`"${ent}" is not in entities.json`); return null; }
      let it = find(ent);
      const kind = KINDS[e.kind], y = slot.y ?? Y[kind];
      if (it) { const st = stateAt(it, at); if (Math.abs(st.x - slot.x) > 1 || Math.abs(st.y - y) > 1 || Math.abs(st.s - slot.s) > 0.01) move(ent, Math.max(at, 20), { x: slot.x, y, s: slot.s }); return it; }
      it = add({ ...entityItem(ent, e, colorOf), x: slot.x, y, s: slot.s });
      if (kind === "figure" && slot.x > 960 && it.flip == null) it.flip = true; // faces the middle
      if (at > 0 || from) it.enter = { at: Math.max(14, at), from: from || (slot.x < 900 ? "left" : slot.x > 1020 ? "right" : kind === "figure" ? "bottom" : "pop"), dur: 14 };
      return it;
    };
    const arrange = (layout, who, at) => {
      if (!LAYOUTS.includes(layout)) return err(`layout "${layout}" — one of ${LAYOUTS.join(", ")}`);
      const sl = slots(layout, who.length);
      who.forEach((ent, i) => ensure(ent, at + (at > 0 ? i * 8 : 0), sl[Math.min(i, sl.length - 1)]));
      st8.layout = layout; st8.who = who.slice();
    };
    // titles sit in a band at the top of what the camera sees; a new one replaces the old
    const title = (text, at, box) => {
      for (const t of items.filter((x) => x._role === "title" && !x._gone)) leave(t, at - 2);
      const size = titleSize(text);
      add({ id: `title${++seq}`, kind: "word", label: String(text).toUpperCase(), size, box: box === "accent" ? ACCENT : box === "red" ? RED : box === "ink" ? INK : undefined,
        screen: true, x: 960, y: 160, enter: { at: Math.max(12, at), from: box ? "pop" : "top", dur: 12 }, _role: "title" });
    };
    const st8 = { layout: (carried._layout) || null, who: (carried._who) || [], rows: carried._rows || 0, dates: carried._dates || 0 };

    // a title the last beat left is cleared early in this one: every beat starts with a clean band
    for (const t of items.filter((x) => x._role === "title")) leave(t, 24);
    if (told.stage) arrange(told.stage.layout || "row", told.stage.who || [], 0);

    let cursor = 0;
    for (const ev of told.events || []) {
      if (!DOS.includes(ev.do)) { err(`"do": "${ev.do}" — one of ${DOS.join(", ")}`); continue; }
      let at = 0;
      if (ev.on != null) {
        const hit = wordFrame(words, ev.on, cursor) || wordFrame(words, ev.on, 0);
        if (!hit) { err(`"on": "${ev.on}" — the narrator does not say it in this beat (${words.map((w) => w.w).join(" ").slice(0, 160)})`); continue; }
        at = hit.frame; cursor = hit.index;
      } else if (Number.isFinite(ev.at)) at = Math.round(ev.at <= 1 ? ev.at * D : ev.at);
      at = Math.max(0, Math.min(D - 1, at));
      const who = Array.isArray(ev.who) ? ev.who : ev.who != null ? [ev.who] : [];
      const need = (n) => { if (who.length < n) { err(`${ev.do}: needs ${n === 1 ? "who" : `${n} names in who`}`); return false; } const missing = who.filter((w) => !find(w)); if (missing.length) { err(`${ev.do}: ${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} not on stage (enter or arrange first)`); return false; } return true; };
      const posOf = (ent) => stateAt(find(ent), at);
      switch (ev.do) {
        case "arrange": arrange(ev.layout || "row", who, at); break;
        case "enter": { const n = (st8.who.length || 0), sl = ev.x != null ? { x: ev.x, y: ev.y, s: ev.s ?? 1 } : slots(st8.layout || "row", Math.max(n + 1, 1))[n] || { x: 960, s: 1 }; for (const w of who) { ensure(w, at, sl, ev.from); if (!st8.who.includes(w)) st8.who.push(w); } break; }
        case "exit": if (need(1)) for (const w of who) { leave(find(w), at); for (const b of bound(w)) leave(b, at); st8.who = st8.who.filter((x) => x !== w); } break;
        case "title": if (!ev.text) err("title: needs text"); else title(ev.text, at, ev.box); break;
        case "label": if (need(1) && ev.text) { const p = posOf(who[0]), n = bound(who[0]).filter((b) => b._role === "label").length, side = p.x < 960 ? 1 : -1; add({ id: `${who[0]}.label${++seq}`, kind: "tile", label: String(ev.text).toUpperCase(), color: find(who[0]).color || INK, size: 38, x: p.x + side * 440 * p.s, y: p.y - 70 * p.s + n * 110, enter: { at: Math.max(12, at), from: side > 0 ? "right" : "left", dur: 12 }, _bind: who[0], _role: "label" }); } break;
        case "crown": if (need(1)) { const p = posOf(who[0]), k = find(who[0]).kind; add({ id: `${who[0]}.crown`, kind: "crown", x: p.x, y: p.y - (k === "figure" ? (find(who[0]).w || 260) * 2.25 + 30 : 202) * p.s, s: p.s, enter: { at: Math.max(12, at), from: "top", dur: 12 }, _bind: who[0], _role: "deco" }); } break;
        case "uncrown": if (need(1)) for (const b of bound(who[0]).filter((x) => x.kind === "crown")) leave(b, at); break;
        case "world": if (need(1)) for (const w of who) { const p = posOf(w); items.unshift({ id: `${w}.world`, kind: "planet", color: find(w).color || colorOf(w), size: 290, x: p.x, y: p.y, s: p.s, enter: { at: Math.max(14, at), from: "pop", dur: 14 }, _bind: w, _role: "world" }); } break;
        case "cross": { let p; if (who.length >= 2 && need(2)) { const a = posOf(who[0]), b = posOf(who[1]); p = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; add({ id: `dash${++seq}`, kind: "dash", x: a.x + 180, y: a.y, x2: b.x - 180, y2: b.y, drawFrom: Math.max(0, at - 30), drawTo: at, enter: { at: Math.max(2, at - 30), from: "fade", dur: 2 }, _role: "fx" }); } else if (need(1)) p = posOf(who[0]); if (p) add({ id: `cross${++seq}`, kind: "cross", color: ACCENT, x: p.x, y: p.y, enter: { at: Math.max(10, at), from: "pop", dur: 8 }, _role: "fx", ...(who.length === 1 ? { _bind: who[0] } : {}) }); break; }
        case "stamp": if (need(1) && ev.text) { const p = posOf(who[0]); add({ id: `${who[0]}.stamp`, kind: "word", label: String(ev.text).toUpperCase(), size: 104 * p.s, box: RED, r: -12, x: p.x, y: p.y, enter: { at: Math.max(8, at), from: "pop", dur: 7 }, _bind: who[0], _role: "deco" }); find(who[0]).shake = { at, dur: 18 }; } break;
        case "cover": if (need(1)) for (const w of who) { const p = posOf(w); add({ id: `${w}.cover`, kind: "bar", w: 280 * p.s, h: 64 * p.s, x: p.x, y: p.y - 30 * p.s, enter: { at: Math.max(12, at), from: "top", dur: 12 }, _bind: w, _role: "deco" }); } break;
        case "uncover": if (need(1)) for (const w of who) for (const b of bound(w).filter((x) => x.kind === "bar")) leave(b, at); break;
        case "dim": if (need(1)) for (const w of who) { const p = posOf(w); key(find(w), { at, dur: 14, o: 0.5, r: p.x < 960 ? -9 : 9, y: p.y + 35 }); } break;
        case "restore": if (need(1)) for (const w of who) { const e = entities[w], p = posOf(w); key(find(w), { at, dur: 14, o: 1, r: 0, y: p.y - (p.o < 0.99 ? 35 : 0) }); void e; } break;
        case "grow": if (need(1)) for (const w of who) move(w, at, { s: posOf(w).s * (ev.to || 1.25) }, 14, "back"); break;
        case "shake": if (need(1)) for (const w of who) find(w).shake = { at, dur: 20, amp: 14 }; break;
        case "apart": if (need(2)) { const a = posOf(who[0]), b = posOf(who[1]), l = a.x <= b.x ? 0 : 1; move(who[l], at, { x: 440 }); move(who[1 - l], at, { x: 1480 }); } break;
        case "together": case "collide": if (need(2)) {
          const a = posOf(who[0]), b = posOf(who[1]), l = a.x <= b.x ? 0 : 1, gap = 220 * Math.max(a.s, b.s) + 20;
          for (const w of who) for (const wd of bound(w).filter((x) => x._role === "world")) leave(wd, Math.max(16, at - 14), 16);
          move(who[l], at, { x: 960 - gap }, 26); move(who[1 - l], at, { x: 960 + gap }, 26);
          if (ev.do === "together") break;
        } else break;
        // falls through: a collision is a meeting and a burst
        case "burst": { let p = { x: 960, y: 450 }; if (who.length >= 2 && find(who[0]) && find(who[1])) { const a = posOf(who[0]), b = posOf(who[1]); p = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 20 }; for (const w of who) find(w).shake = { at, dur: 22, amp: 16 }; } add({ id: `burst${++seq}`, kind: "burst", color: "#F2C84B", x: p.x, y: p.y, s: 1.2, enter: { at: Math.max(8, at), from: "pop", dur: 8 }, _role: "fx" }); break; }
        case "coins": { const p = who.length && find(who[0]) ? posOf(who[0]) : { x: 960, y: 450 }, n = Math.max(1, Math.min(8, ev.n || 6)); for (let i = 0; i < n; i++) { const dx = ((i + 0.5) / n - 0.5) * 900, dy = 320 + ((i * 37) % 60); add({ id: `coin${++seq}`, kind: "coin", x: p.x, y: p.y, s: 1.4, enter: { at: Math.max(6, at + i * 2), from: "pop", dur: 6 }, keys: [{ at: at + 28 + i * 3, dur: 24, x: p.x + dx, y: Math.min(SAFE.bottom - 40, p.y + dy) }], _role: "fx" }); } break; }
        case "pair": {
          if (st8.who.length < 2) { err("pair: needs two things on stage (stage.who) — they become the two columns"); break; }
          if (st8.layout !== "pairs") { arrange("pairs", st8.who.slice(0, 2), Math.max(22, at - 16)); for (const w of st8.who.slice(0, 2)) for (const b of bound(w)) leave(b, Math.max(10, at - 20)); for (const f of items.filter((x) => x._role === "fx" && !x._gone)) leave(f, Math.max(10, at - 20)); }
          const y = 440 + st8.rows * 112, [a, b] = st8.who; st8.rows++;
          if (y > SAFE.bottom - 60) { warnings.push({ beat: beat.id, message: `pair "${ev.left}": a fifth row would sit under the subtitles — start a new stage` }); break; }
          const row = (id, text, x, color, from, f) => add({ id, kind: "tile", label: String(text).toUpperCase(), color, size: 46, x, y, enter: { at: Math.max(12, f), from, dur: 12 }, _role: "row" });
          row(`row${++seq}a`, ev.left, 560, find(a).color || INK, "left", at);
          const rf = ev.onRight ? (wordFrame(words, ev.onRight, cursor) || { frame: at + 30 }).frame : at + 30;
          add({ id: `row${seq}v`, kind: "word", label: "VS", size: 46, x: 960, y: y + 15, enter: { at: Math.max(12, Math.round((at + rf) / 2)), from: "pop", dur: 8 }, _role: "row" });
          row(`row${seq}b`, ev.right, 1360, find(b).color || INK, "right", rf);
          break; }
        case "date": { if (!ev.text) { err("date: needs text"); break; }
          if (!items.some((x) => x.id === "timeline" && !x._gone)) add({ id: "timeline", kind: "dash", x: 280, y: 640, x2: 1640, y2: 640, drawFrom: Math.max(0, at - 40), drawTo: Math.max(4, at - 4), enter: { at: Math.max(2, at - 40), from: "fade", dur: 2 }, _role: "row" });
          const x = ev.side === "left" ? 500 : ev.side === "right" ? 1340 : [960, 500, 1340][st8.dates % 3]; st8.dates++;
          add({ id: `date${++seq}`, kind: "tile", label: String(ev.text).toUpperCase(), color: ev.color === "red" ? RED : INK, size: 44, x, y: 540, enter: { at: Math.max(12, at), from: "top", dur: 12 }, _role: "row" }); break; }
        case "focus": if (need(1)) { const p = posOf(who[0]), s = ev.zoom || 1.3; Object.assign(curCam, { x: p.x + (p.x < 960 ? 200 : -200), y: Math.min(p.y, 520), s }); camKeys.push({ at: Math.max(22, at), dur: 22, ease: "inout", ...curCam }); } break;
        case "wide": Object.assign(curCam, { x: 960, y: 540, s: 1 }); camKeys.push({ at: Math.max(24, at), dur: 24, ease: "inout", ...curCam }); break;
        case "clear": { const what = ev.what || "extras", roles = what === "titles" ? ["title"] : what === "labels" ? ["label"] : what === "rows" ? ["row"] : ["title", "label", "row", "fx", "deco"]; for (const it of items.filter((x) => roles.includes(x._role) && !x._gone)) leave(it, at); if (roles.includes("row")) { st8.rows = 0; st8.dates = 0; } break; }
        case "change": if (need(1)) { // the same person, differently: another action, a blindfold, something in the hand
          const old = find(who[0]), p = posOf(who[0]), next = clone(old); delete next.keys; delete next.exit; delete next.shake;
          Object.assign(next, { id: who[0], x: p.x, y: p.y, s: p.s, o: 1, r: 0, enter: { at: Math.max(3, at), from: "fade", dur: 3 } });
          if (ev.action) next.action = ev.action; if (ev.holds) next.holds = ev.holds; if (ev.label) next.label = String(ev.label).toUpperCase();
          if (ev.look) next.variant = { ...(next.variant || {}), ...ev.look };
          old.id = `${who[0]}~${++seq}`; leave(old, at + 1, 3); items.splice(items.indexOf(old) + 1, 0, next); } break;
        case "raw": if (!ev.item || !ev.item.kind) err("raw: needs item {kind, x, y, …}"); else { const it = clone(ev.item); it.id = it.id || `raw${++seq}`; it._role = it._role || "fx"; if (!it.enter && at > 0) it.enter = { at: Math.max(10, at), from: "pop", dur: 10 }; add(it); } break;
        default: break;
      }
    }

    // nothing may sit under the subtitles or over the HUD when it comes to rest
    for (const it of items) {
      const end = T.itemState(it, D - 1); if (!end || it._role === "world" || it.kind === "panel" || it.kind === "dash") continue;
      const top = it.kind === "figure" ? end.y - (it.w || 260) * (it.body === "bust" ? 1.5 : 2.25) * end.s : end.y - 150 * end.s;
      if (it.kind !== "figure" && end.y > SAFE.bottom) warnings.push({ beat: beat.id, message: `${it.id} rests at y ${Math.round(end.y)} — under the subtitle band` });
      if (it._role !== "title" && top < 0) warnings.push({ beat: beat.id, message: `${it.id} rests above the frame (top ${Math.round(top)})` });
    }

    // draw order: worlds behind, the things, what belongs to them, rows and effects, titles on top
    const order = { world: 0, entity: 1, deco: 2, label: 3, row: 3, fx: 4, title: 5 };
    const drawn = items.map((it, i) => [it, i]).sort((a, b) => (order[a[0]._role] ?? 3) - (order[b[0]._role] ?? 3) || a[1] - b[1]).map(([it]) => it);
    const strip = (it) => { const c = {}; for (const [k, v] of Object.entries(it)) if (!k.startsWith("_") && v !== undefined) c[k] = v; return c; };
    stages.push({ v: T.TOLD_VERSION, items: drawn.map(strip), ...(camKeys.length ? { cam: camKeys } : {}) });

    // what stays for the next beat: everything still on stage at this beat's last frame, where it stands then
    carried = [];
    for (const it of drawn) {
      const end = T.itemState(it, D); if (!end || end.o < 0.02 || it._gone) continue;
      const keep = clone(it); delete keep.enter; delete keep.keys; delete keep.exit; delete keep.shake;
      Object.assign(keep, { x: end.x, y: end.y, s: end.s, o: end.o, r: end.r });
      if (keep.kind === "dash") { keep.drawFrom = -10; keep.drawTo = 0; }
      carried.push(keep);
    }
    Object.assign(carried, { _layout: st8.layout, _who: st8.who, _rows: st8.rows, _dates: st8.dates });
    cam = { ...curCam };
  }
  return { stages, errors, warnings };
}

module.exports = { compileTold, validateEntities, wordFrame, slots, GLYPHS, KINDS, LAYOUTS, DOS, PALETTE };
