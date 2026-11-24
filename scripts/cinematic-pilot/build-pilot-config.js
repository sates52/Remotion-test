#!/usr/bin/env node
/**
 * build-pilot-config.js — the cinema pilot's Vox config (2026-11-24): the three slices of The Magician's Nephew on the
 * book's real timeline, drawn with the art-locked scenes of prompts.json in cinema modes. Reads the book's planned
 * config READ-ONLY (its captions and meta); writes nothing under books/.
 *   node scripts/cinematic-pilot/build-pilot-config.js --book-config=<config.vox.json> --out=<pilot.json> [--audio=<rel>]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a, true]; }));
const P = JSON.parse(fs.readFileSync(path.join(__dirname, "prompts.json"), "utf8"));
const book = JSON.parse(fs.readFileSync(args["book-config"], "utf8"));
const FPS = 30, f = (s) => Math.round(s * FPS);
const im = (id) => `${P.outDir}/${id}.png`;
const cut = (id) => `${P.outDir}/${id}.cut.png`;

// the pilot's shot list: what each stretch of narration shows, in which mode (prompts.json says what each image is)
const SHOTS = [
  { id: "a1", from: 295.6, to: 311.3, type: "cinemaPanel", img: "a1", cinema: { camera: "pushIn", focus: [38, 34] } },
  { id: "a2", from: 311.3, to: 319.4, type: "cinemaPanel", img: "a2", cinema: { camera: "panLeft" } },
  { id: "a3", from: 319.4, to: 323.7, type: "cinemaPanel", img: "a3", cinema: { camera: "pushIn", focus: [50, 55] } },
  { id: "a4", from: 323.7, to: 329.2, type: "cinemaPanel", img: "a4", cinema: { camera: "pushIn", focus: [42, 60] } },
  { id: "a4b", from: 329.2, to: 338.0, type: "cinemaSplit", img: "a4", cinema: { at: 0.25, leftLabel: "Andrew", right: { cut: { path: cut("box"), w: 520 }, label: "An Atlantean box" } } },
  { id: "a5", from: 338.0, to: 353.2, type: "cinemaStatement", img: "a5", cinema: { card: "Ours is a high and lonely destiny.", by: "Uncle Andrew", side: "left" } },
  { id: "b1", from: 1076.0, to: 1092.7, type: "cinemaPanel", img: "b1", cinema: { camera: "pullOut" } },
  { id: "b2", from: 1092.7, to: 1110.2, type: "cinemaPanel", img: "b2", cinema: { camera: "pushIn", focus: [50, 36] } },
  { id: "b3", from: 1110.2, to: 1120.0, type: "cinemaSplit", img: "b3", cinema: { at: 0.25, leftLabel: "London iron", right: { cut: { path: cut("bar"), w: 560 }, label: "The void" } } },
  { id: "b4", from: 1120.0, to: 1128.4, type: "cinemaPanel", img: "b4", cinema: { camera: "pushIn", focus: [50, 30] } },
  { id: "b5", from: 1128.4, to: 1137.2, type: "cinemaPanel", img: "b5", cinema: { camera: "panRight" } },
  { id: "c1", from: 1739.0, to: 1748.6, type: "cinemaPanel", img: "c1", cinema: { camera: "pushIn", focus: [50, 58] } },
  { id: "c2", from: 1748.6, to: 1765.9, type: "cinemaStatement", img: "c2", cinema: { card: "He reduced it to a barroom anecdote.", side: "right", focus: [32, 45], cardTop: 30, cardWidth: 600, cardInset: 70 } },
  { id: "c3", from: 1765.9, to: 1772.7, type: "cinemaPanel", img: "c3", cinema: { camera: "pushIn", focus: [48, 50] } },
  { id: "c4", from: 1772.7, to: 1781.5, type: "cinemaSplit", img: "c4", cinema: { at: 0.3, right: { path: im("c5") } } },
  { id: "c5", from: 1781.5, to: 1797.7, type: "cinemaPanel", img: "c5", cinema: { camera: "pullOut", focus: [40, 45] } },
];
const ASR = [[/\bDegree\b/g, "Digory"], [/\bJotis\b/g, "Jadis"]]; // the book's own ASR misses in these slices
const fix = (t) => ASR.reduce((s, [a, b]) => s.replace(a, b), t);
const inSlices = (fr) => SHOTS.some((s) => fr >= f(s.from) - 2 && fr < f(s.to) + 2);
const beats = SHOTS.map((s) => ({ id: `pilot-${s.id}`, type: s.type, fromFrame: f(s.from), durationFrames: f(s.to) - f(s.from),
  images: [{ path: im(s.img), prompt: (P.scenes.find((x) => x.id === s.img) || {}).prompt || "", style: "card" }],
  props: { text: "", emphasis: [], keywords: [], cinema: s.cinema } }));
const captions = (book.captions || []).filter((c) => inSlices(c.startFrame)).map((c) => ({ ...c, text: fix(c.text), words: c.words.map((w) => ({ ...w, w: fix(w.w) })) }));
const cfg = {
  meta: { ...book.meta, audio: args.audio || book.meta.audio, artDirection: { paper: "#EDE4D3", ink: "#1E1A16", accent: "#C08A3E" }, progress: false },
  captions, beats, chapters: [],
};
fs.writeFileSync(args.out, JSON.stringify(cfg, null, 1));
console.log(`pilot config: ${beats.length} shots, ${captions.length} captions → ${args.out}`);
