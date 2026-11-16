/**
 * own-drawings.js — THE BOOK'S OWN DRAWINGS on a told stage (Film Flow 3 / told v2, 2026-11-16).
 *
 * dracula, the first real told book: the schooner Demeter was a red tile with a globe, London a tile with a building;
 * the three drawn objects were three polygons each and nobody had looked at them. Mute test: TEXT_ONLY 19/30.
 * So every named thing — of ANY kind — may carry a drawing made for this book, and a drawing is data that is
 *   resolved   one source: an entity either draws itself (`paths`) or points at an own icon (`motif`: a key of
 *              books/<slug>/motifs.json) — never both, never the same object drawn in two files; colour tokens
 *              (`ink`, `accent`, `paper`, any key of the book palette) become the book's colours;
 *   linted     enough of a drawing to be one (paths, commands, colours, how much of its box it fills);
 *   SEEN       printed on a sheet with no names (scripts/own-icons-sheet.js) and named by a fresh blind agent;
 *   judged     the blind name against the readings the lead agent accepted BEFORE the test (`reads`), bound to the
 *              drawing's hash — a drawing that was read as something else, or was changed after it was read, is
 *              refused at merge for every told beat that puts it on stage.
 * A drawing has STATES (the ship whole / wrecked, the box closed / open) and a place has a BACKDROP (the stage's
 * background); each is its own drawing with its own reading. Pure (no clock, no model call) — only `readBook` at the
 * bottom touches the disk.
 */
"use strict";
const crypto = require("crypto");

/** What makes a drawing a drawing. New numbers for a new check — none of them is a film quality bar. */
const RULES = {
  box: "0 0 520 520", backdropBox: "0 0 1920 760",
  minPaths: 5, maxPaths: 40, maxBackdropPaths: 70,
  minCommands: 24, // three polygons are 12–15 commands (dracula's first objects)
  minColors: 2, maxColors: 6,
  minFill: 0.6, // the drawing spans at least this share of its box along its longer side
  bleed: 0.04, // and stays inside the box (control points may overshoot a little)
};
const DEFAULT_PALETTE = { ink: "#1A1412", accent: "#C2410C", paper: "#FAF7F2" };

const sha = (v) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 16);
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const list = (v) => (Array.isArray(v) ? v : v != null && v !== "" ? [v] : []).map(String);

/** the book's colours: book.json palette < story bible world.palette; `accent` = the palette's red when it has no accent */
function paletteOf(book = {}, bible = {}) {
  const p = { ...(book.palette || {}), ...((bible.world && bible.world.palette) || {}) };
  return { ...DEFAULT_PALETTE, ...p, accent: p.accent || p.red || DEFAULT_PALETTE.accent };
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
/** a colour as written → a colour that can be drawn, or null when it is neither a hex nor a palette token */
function color(v, palette) {
  if (v == null || v === "none") return v == null ? undefined : "none";
  if (HEX.test(v)) return v;
  if (palette && typeof palette[v] === "string" && HEX.test(palette[v])) return palette[v];
  return null;
}

/** bounding box of a path's `d` (control points included: an over-estimate is fine for a fill check) and its commands */
function pathBox(d) {
  const tok = String(d).match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
  let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, n = 0;
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const see = (px, py) => { b.x0 = Math.min(b.x0, px); b.y0 = Math.min(b.y0, py); b.x1 = Math.max(b.x1, px); b.y1 = Math.max(b.y1, py); };
  const num = () => Number(tok[i++]);
  const ARGS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const lo = cmd.toLowerCase(), rel = cmd === lo, k = ARGS[lo];
    if (k == null) return { bad: `"${cmd}" is not a path command` };
    n++;
    if (lo === "z") { x = sx; y = sy; continue; }
    if (i + k > tok.length || tok.slice(i, i + k).some((t) => /[a-zA-Z]/.test(t))) return { bad: `"${cmd}" needs ${k} numbers` };
    const a = Array.from({ length: k }, num);
    if (lo === "h") { x = rel ? x + a[0] : a[0]; see(x, y); }
    else if (lo === "v") { y = rel ? y + a[0] : a[0]; see(x, y); }
    else if (lo === "a") { const nx = rel ? x + a[5] : a[5], ny = rel ? y + a[6] : a[6]; see(x, y); x = nx; y = ny; see(x, y); }
    else {
      for (let j = 0; j < k; j += 2) see(rel ? x + a[j] : a[j], rel ? y + a[j + 1] : a[j + 1]);
      const nx = rel ? x + a[k - 2] : a[k - 2], ny = rel ? y + a[k - 1] : a[k - 1];
      x = nx; y = ny;
      if (lo === "m") { sx = x; sy = y; cmd = rel ? "l" : "L"; } // further pairs after a move are lines
    }
  }
  return { ...b, commands: n };
}

/**
 * One drawing (paths in a viewBox) against RULES. → [messages]; empty = it may go to the blind test.
 * `kind`: "thing" (an entity, a state) or "backdrop" (a place behind the stage: wide, more paths allowed).
 */
function lintDrawing(d, { palette = DEFAULT_PALETTE, kind = "thing" } = {}) {
  const out = [], paths = Array.isArray(d && d.paths) ? d.paths : [];
  const vb = String((d && d.viewBox) || (kind === "backdrop" ? RULES.backdropBox : RULES.box)).split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some((n) => !Number.isFinite(n)) || vb[2] <= 0 || vb[3] <= 0) return [`viewBox "${d && d.viewBox}" is not "x y width height"`];
  const max = kind === "backdrop" ? RULES.maxBackdropPaths : RULES.maxPaths;
  if (paths.length < RULES.minPaths) out.push(`${paths.length} path(s) — a drawing a stranger can name has at least ${RULES.minPaths} (the silhouette, its parts, the detail that makes it THIS thing)`);
  if (paths.length > max) out.push(`${paths.length} paths — at most ${max} (flat vector, not an illustration)`);
  const colors = new Set(); let commands = 0;
  const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  paths.forEach((p, k) => {
    if (!p || typeof p.d !== "string" || !p.d.trim()) { out.push(`paths[${k}]: no "d"`); return; }
    if (/url\(|<|>/.test(p.d)) { out.push(`paths[${k}]: "d" is path data only`); return; }
    const b = pathBox(p.d);
    if (b.bad) { out.push(`paths[${k}]: ${b.bad}`); return; }
    commands += b.commands;
    if (Number.isFinite(b.x0)) { box.x0 = Math.min(box.x0, b.x0); box.y0 = Math.min(box.y0, b.y0); box.x1 = Math.max(box.x1, b.x1); box.y1 = Math.max(box.y1, b.y1); }
    for (const key of ["fill", "stroke"]) {
      if (p[key] == null || p[key] === "none") continue;
      const c = color(p[key], palette);
      if (c == null) out.push(`paths[${k}].${key} "${p[key]}" — a hex colour or a palette token (${Object.keys(palette).join(", ")})`);
      else colors.add(c.toLowerCase());
    }
    if (p.fill == null && p.stroke == null) colors.add(String(palette.ink).toLowerCase()); // drawn as an ink line
  });
  if (out.length) return out;
  if (commands < RULES.minCommands) out.push(`${commands} path commands in all — at least ${RULES.minCommands}: three rectangles are a diagram, not a drawing`);
  if (colors.size < RULES.minColors) out.push(`one colour — at least ${RULES.minColors} (the body and what stands out on it)`);
  if (colors.size > RULES.maxColors) out.push(`${colors.size} colours — at most ${RULES.maxColors}, taken from the book's palette`);
  const [vx, vy, vw, vh] = vb, w = box.x1 - box.x0, h = box.y1 - box.y0;
  if (Number.isFinite(w)) {
    if (Math.max(w / vw, h / vh) < RULES.minFill) out.push(`the drawing fills ${Math.round(Math.max(w / vw, h / vh) * 100)} % of its box — at least ${RULES.minFill * 100} % along its longer side (it is drawn small on stage otherwise)`);
    const bx = vw * RULES.bleed, by = vh * RULES.bleed;
    if (box.x0 < vx - bx || box.y0 < vy - by || box.x1 > vx + vw + bx || box.y1 > vy + vh + by) out.push(`the drawing leaves its box (${Math.round(box.x0)},${Math.round(box.y0)} – ${Math.round(box.x1)},${Math.round(box.y1)} in "${vb.join(" ")}")`);
  }
  return out;
}

const drawPaths = (paths, palette) => (paths || []).map((p) => {
  const o = { d: p.d };
  // a colour that is neither a hex nor a token is kept as written (the lint names it; an old drawing still draws)
  for (const key of ["fill", "stroke"]) { if (p[key] == null) continue; const c = color(p[key], palette); o[key] = c != null ? c : p[key]; }
  if (p.strokeWidth != null) o.strokeWidth = p.strokeWidth;
  if (p.opacity != null) o.opacity = p.opacity;
  return o;
});

/** `{paths}` or `{motif}` → the paths as written, with where they came from. null = nothing drawn. */
function source(node, motifs, errors, where) {
  if (!node) return null;
  const has = Array.isArray(node.paths) && node.paths.length > 0;
  if (node.motif != null) {
    if (has) { errors.push(`${where}: both "paths" and "motif" — one drawing, one place: keep the own icon in motifs.json and point at it`); return null; }
    const m = (motifs || {})[node.motif];
    if (!m || !Array.isArray(m.paths) || !m.paths.length) { errors.push(`${where}: motif "${node.motif}" is not an own icon in motifs.json`); return null; }
    return { paths: m.paths, viewBox: node.viewBox || m.viewBox, reads: node.reads != null ? node.reads : m.reads || m.title, src: `motif:${node.motif}` };
  }
  return has ? { paths: node.paths, viewBox: node.viewBox, reads: node.reads, src: "entity" } : null;
}

/**
 * resolveEntities(entities, { motifs, palette }) → { entities, drawings, errors }
 *   entities  as written, plus for every DRAWN one: `paths` / `viewBox` in the book's colours, `states`
 *             { name: { paths, viewBox } } and (a place) `backdrop` { paths, viewBox } — what the compiler reads;
 *   drawings  every picture a viewer will be shown, one by one — the sheet, the blind test and the merge gate read
 *             this list: { key, entity, state?, backdrop?, intended, accepted[], hash, paths, viewBox, src }.
 * A person is the engine's rig and never a drawing.
 */
function resolveEntities(entities = {}, { motifs = {}, palette = DEFAULT_PALETTE } = {}) {
  const out = {}, drawings = [], errors = [];
  const motifKeys = new Map(Object.keys(motifs || {}).map((k) => [norm(k).replace(/ /g, ""), k]));
  for (const [id, e] of Object.entries(entities || {})) {
    const r = { ...e };
    if (e.kind === "person") { out[id] = r; continue; }
    const base = source(e, motifs, errors, `entity "${id}"`);
    // the same object in both files: an entity that draws itself while motifs.json has an icon of that name
    if (base && base.src === "entity") { const twin = motifKeys.get(norm(id).replace(/ /g, "")); if (twin) errors.push(`entity "${id}": motifs.json already draws "${twin}" — write "motif": "${twin}" instead of a second drawing`); }
    const push = (key, d, extra, what) => {
      const accepted = [...new Set(list(d.reads).map(norm).filter(Boolean))];
      const drawn = drawPaths(d.paths, palette), viewBox = d.viewBox || (extra.backdrop ? RULES.backdropBox : RULES.box);
      drawings.push({ key, entity: id, ...extra, intended: what, accepted, hash: sha({ viewBox, paths: drawn }), paths: drawn, viewBox, src: d.src,
        lint: lintDrawing({ paths: d.paths, viewBox }, { palette, kind: extra.backdrop ? "backdrop" : "thing" }) });
      return { paths: drawn, ...(d.viewBox ? { viewBox: d.viewBox } : {}) }; // a default box is not written into the stage (as told v1)
    };
    if (base) {
      Object.assign(r, push(id, base, {}, e.label || id));
      delete r.motif;
      r.states = {};
      for (const [name, st] of Object.entries(e.states || {})) {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) { errors.push(`entity "${id}": state "${name}" — lower-case letters, digits and "-"`); continue; }
        const s = source(st, motifs, errors, `entity "${id}" state "${name}"`);
        if (!s) { errors.push(`entity "${id}": state "${name}" has no drawing (paths, or motif)`); continue; }
        if ((s.viewBox || RULES.box) !== (base.viewBox || RULES.box)) errors.push(`entity "${id}": state "${name}" has another viewBox than the thing itself — the same box, the same silhouette, only the change drawn differently`);
        r.states[name] = push(`${id}#${name}`, s, { state: name }, `${e.label || id} (${name})`);
      }
    } else {
      delete r.paths;
      if (e.states && Object.keys(e.states).length) errors.push(`entity "${id}": states need the thing's own drawing first (paths, or motif)`);
    }
    if (e.backdrop) {
      if (e.kind !== "place") errors.push(`entity "${id}": only a place has a backdrop`);
      const s = source(e.backdrop, motifs, errors, `entity "${id}" backdrop`);
      if (s) r.backdrop = push(`${id}@backdrop`, s, { backdrop: true }, `${e.label || id} (the place, behind the stage)`);
      else { errors.push(`entity "${id}": backdrop has no drawing (paths)`); delete r.backdrop; }
    }
    out[id] = r;
  }
  return { entities: out, drawings, errors };
}

/**
 * What is wrong with the drawings AS DRAWINGS (too little of one, no accepted reading) — asked at prep and by the
 * sheet, before anyone authors with them. Not a compile error: a stage still compiles from a poor drawing.
 */
function drawingProblems(drawings) {
  const out = [];
  for (const d of drawings) {
    for (const m of d.lint) out.push(`drawing "${d.key}": ${m}`);
    if (!d.accepted.length) out.push(`drawing "${d.key}": no "reads" — the 1-3 word names a stranger may give it ("ship", "sailing ship"), written BEFORE the blind test`);
  }
  return out;
}

/**
 * Did the blind name say what the drawing is? Every word of an accepted reading is in the answer as a whole word
 * (plural-blind, any order: "sinking sailing ship" is a "sinking ship"; a "shipping label" is not a "ship").
 */
function readsAs(answer, accepted) {
  const words = (s) => norm(s).split(" ").filter(Boolean).map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  const a = new Set(words(answer));
  return (accepted || []).some((r) => { const w = words(r); return w.length > 0 && w.every((x) => a.has(x)); });
}

/**
 * judge(drawings, answers) → the verdict file: every drawing with the blind name it got. `answers` = { "<n>": "words" }
 * keyed by the sheet number (drawings are numbered in list order), or { "<key>": "words" }.
 */
function judge(drawings, answers = {}) {
  const rows = {};
  drawings.forEach((d, n) => {
    const answer = answers[String(n + 1)] != null ? answers[String(n + 1)] : answers[d.key];
    rows[d.key] = { n: n + 1, hash: d.hash, intended: d.intended, accepted: d.accepted, answer: answer == null ? null : String(answer), ok: answer != null && readsAs(answer, d.accepted) };
  });
  return { schema: "own-drawings/1", drawings: rows, named: Object.values(rows).filter((r) => r.ok).length, total: drawings.length };
}

/**
 * gate(drawings, verdict, usedEntities?) → [messages] — why a told beat may not put these things on stage yet.
 * A drawing is good when the verdict has it under its CURRENT hash and readings, read as intended.
 */
function gate(drawings, verdict, used = null) {
  const out = [], rows = (verdict && verdict.drawings) || {};
  for (const d of drawings) {
    if (used && !used.has(d.entity)) continue;
    const r = rows[d.key];
    if (!r || r.answer == null) out.push(`drawing "${d.key}" has not been named blind — node scripts/own-icons-sheet.js --slug=<slug>, a fresh agent names the sheet, then --judge`);
    else if (r.hash !== d.hash || JSON.stringify(r.accepted) !== JSON.stringify(d.accepted)) out.push(`drawing "${d.key}" (or its "reads") changed after it was named blind — run the sheet and the blind naming again`);
    else if (!r.ok) out.push(`drawing "${d.key}" was read as "${r.answer}", not ${d.accepted.map((a) => `"${a}"`).join(" / ")} — redraw it (or remove its paths: the emblem is the fallback)`);
  }
  return out;
}

/** every entity id a told beat touches (stage, backdrop, events, what is held or handed over) */
function usedBy(told) {
  const ids = new Set(), add = (v) => list(v).forEach((x) => ids.add(x));
  if (!told || typeof told !== "object") return ids;
  if (told.stage) { add(told.stage.who); add(told.stage.at); }
  for (const ev of Array.isArray(told.events) ? told.events : []) { if (!ev) continue; add(ev.who); add(ev.what); if (typeof ev.holds === "string") add(ev.holds); }
  return ids;
}

/**
 * How to draw one — generated from RULES and the book's palette, so the brief can never ask for what the lint refuses.
 * Printed into storyboard/entities.candidates.json (told.js entities) for the lead agent who writes entities.json.
 */
function drawingGuide(palette = DEFAULT_PALETTE) {
  return [
    `DRAW the things that carry the book — a ship, a chest, a machine, an animal, a city — of ANY kind (product, place, idea, company, object, animal): "paths" on the entity. A thing without a drawing is shown as a coloured tile with a stock glyph (the fallback).`,
    `Box: viewBox "${RULES.box}" (leave it out for this default); the drawing fills at least ${RULES.minFill * 100} % of the box along its longer side and stays inside it.`,
    `Layers, back to front: (1) the SILHOUETTE — one or two big filled shapes a stranger could name from the outline alone; (2) the PARTS that make it this kind of thing (masts and sails, keys and a roller, a horn and a cylinder); (3) one or two details in the accent colour. ${RULES.minPaths}–${RULES.maxPaths} paths, at least ${RULES.minCommands} path commands in all, absolute or relative commands, no text, no gradients.`,
    `Colours: ${RULES.minColors}–${RULES.maxColors}, from the book's palette by token — ${Object.entries(palette).map(([k, v]) => `"${k}" (${v})`).join(", ")} — plus hex tones of them where a part needs its own. Never a real logo, a brand mark or a copyrighted character: an original flat drawing made for this book.`,
    `"reads": the 1-3 word names a stranger may give it ("ship", "sailing ship") — written BEFORE the blind test; never add the word it was mistaken for.`,
    `STATES — what the narration CHANGES gets a drawing per state it shows (2-3 at most): "states": { "wrecked": { "reads": ["shipwreck", "wrecked ship"], "paths": [...] } } in the same box with the same base silhouette, only the change drawn differently. Authors then write { "do": "change", "who": "<id>", "state": "wrecked" }.`,
    `A PLACE may also be the stage's background: "backdrop": { "viewBox": "${RULES.backdropBox}", "reads": [...], "paths": [...] } — a wide, simple skyline / landscape standing on the bottom edge (it is drawn pale behind the things; up to ${RULES.maxBackdropPaths} paths). Authors write "stage": { ..., "at": "<place id>" }.`,
    `ONE SOURCE: an object that is already an own icon in books/<slug>/motifs.json is not drawn again — write "motif": "<its key>" on the entity (and on a state).`,
    `Then SEE them: node scripts/own-icons-sheet.js --slug=<slug> → a fresh agent names each numbered drawing blind → node scripts/own-icons-sheet.js --slug=<slug> --judge=<answers.json>. Merge refuses a told beat that uses a drawing nobody could name.`,
  ];
}

/**
 * drawnShare(config) — of the named THINGS standing on the film's told stages (people aside), how many appear as the
 * book's own drawing and how many as the fallback emblem. Counted per scene a thing stands in. → { drawn, emblem, share }
 */
function drawnShare(config) {
  let drawn = 0, emblem = 0;
  for (const s of (config && config.scenes) || []) {
    const seen = new Set();
    for (const it of (s.told && s.told.items) || []) {
      const id = String(it.id || "").split("~")[0];
      if (seen.has(id) || /\./.test(id)) continue; // a thing once per scene; what belongs to a thing (a.label3, a.held) is not a thing
      if (it.kind === "emblem") { emblem++; seen.add(id); }
      else if (it.kind === "icon" && it.label != null) { drawn++; seen.add(id); }
    }
  }
  return { drawn, emblem, share: drawn + emblem ? drawn / (drawn + emblem) : null };
}

/**
 * The one place that READS a book's drawings from disk (everything above is pure): entities.json, motifs.json, the
 * palette (book.json < story bible) and the blind-naming verdict → what the compiler, the sheet, prep and merge use.
 */
function readBook(bookDir) {
  const fs = require("fs"), path = require("path");
  const read = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, "")); } catch { return d; } };
  const sb = path.join(bookDir, "storyboard");
  const entities = read(path.join(sb, "entities.json"), {}) || {};
  const rawMotifs = read(path.join(bookDir, "motifs.json"), {}) || {}, motifs = rawMotifs.motifs || rawMotifs;
  const palette = paletteOf(read(path.join(bookDir, "book.json"), {}) || {}, read(path.join(bookDir, "story-bible.json"), {}) || {});
  const verdictFile = path.join(sb, "own-drawings.verdict.json");
  return { entities, motifs, palette, verdictFile, verdict: read(verdictFile, null), ...(({ entities: resolved, drawings, errors }) => ({ resolved, drawings, errors }))(resolveEntities(entities, { motifs, palette })) };
}

module.exports = { readBook, drawnShare, drawingGuide, RULES, DEFAULT_PALETTE, paletteOf, color, pathBox, lintDrawing, resolveEntities, drawingProblems, readsAs, judge, gate, usedBy, sha };
