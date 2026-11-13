// Pilot 2: the-creative-curve, first 99 s — PEOPLE (a king, a queen, a pope, a four-year-old Mozart, a publisher, the
// public), an OBJECT drawn for the book (the piano) and DATES, staged from what the narration says, on its words.
// usage: node told-creative-curve.js <baseline A config> <out config>
const fs = require("fs");
const [, , IN, OUT] = process.argv;
const cfg = JSON.parse(fs.readFileSync(IN, "utf8"));

const INK = "#1E1E22", ACC = "#D9603C", GOLD = "#E8B93C", STONE = "#D9D3C5", RED = "#C2362B";
const word = (id, label, x, y, size, o = {}) => ({ id, kind: "word", label, x, y, size, ...o });
const tile = (id, label, x, y, color, o = {}) => ({ id, kind: "tile", label, x, y, color, size: 44, ...o });
const fig = (id, x, y, variant, o = {}) => ({ id, kind: "figure", x, y, w: 260, body: "full", variant, ...o });
const coin = (id, x, y, o = {}) => ({ id, kind: "coin", x, y, s: 1.3, ...o });

// the hall: four stone pillars and a floor, there for the whole court scene
const hall = (enterAt) => [
  ...[200, 520, 1400, 1720].map((x, i) => ({ id: `pil${i}`, kind: "panel", color: STONE, x, y: 430, w: 84, h: 860, ...(enterAt != null ? { enter: { at: enterAt + i * 14, from: "top", dur: 16 } } : {}) })),
  { id: "floor", kind: "panel", color: "#CFC8B8", x: 960, y: 820, w: 1920, h: 60, ...(enterAt != null ? { enter: { at: enterAt, from: "fade", dur: 20 } } : {}) },
];
const KING = { age: "old", outfit: "robe", headwear: "crown", beard: "full", suit: "#7B2D43", shirt: "#F1E6C8", hair: "#B9B2A6", trim: GOLD, expression: "surprised" };
const QUEEN = { gender: "f", outfit: "dress", headwear: "crown", hairStyle: "bun", suit: "#2E5A88", shirt: "#F1E6C8", hair: "#6B4A2E", trim: GOLD, expression: "surprised" };
const NOBLE = { outfit: "cloak", hairStyle: "long", suit: "#3F5C46", shirt: "#F1E6C8", hair: "#D8D2C6", beard: "mustache", expression: "surprised" };
const POPE = { age: "old", outfit: "robe", headwear: "none", hairStyle: "bald", suit: "#F4F1EA", shirt: "#C2362B", accessory: "collar", trim: GOLD, expression: "surprised" };
const CHILD = { age: "child", height: 0.72, headScale: 1.18, outfit: "coat", hairStyle: "curly", suit: "#B5372F", shirt: "#F4F1EA", hair: "#EDE7DA", expression: "happy" };
const BLIND = { ...CHILD, overlay: [{ d: "M112 128 H288 V162 H112 Z", fill: INK, opacity: 1, layer: "front" }] };
const ROCHLITZ = { outfit: "coat", accessory: "tie", hairStyle: "receding", glasses: true, suit: "#34424F", shirt: "#F4F1EA", hair: "#5A4A3C", expression: "smirk" };
const PIANO = [
  { d: "M40 150 H480 V200 H40 Z", fill: "#3A322B" }, { d: "M60 200 H460 V430 H60 Z", fill: "#2A2420" },
  { d: "M74 290 H446 V352 H74 Z", fill: "#F4F1EA" },
  ...[104, 150, 196, 242, 288, 334, 380].map((x) => ({ d: `M${x} 290 h20 v38 h-20 Z`, fill: INK })),
  { d: "M84 430 h28 v70 h-28 Z", fill: "#2A2420" }, { d: "M408 430 h28 v70 h-28 Z", fill: "#2A2420" },
];
const court = (o = {}) => [
  fig("king", 330, 790, KING, { label: "KING", ...o.king }), fig("queen", 580, 790, QUEEN, { label: "QUEEN", ...o.queen }),
  fig("noble", 1330, 790, NOBLE, { flip: true, ...o.noble }), fig("pope", 1590, 790, POPE, { label: "POPE", flip: true, ...o.pope }),
];
const spot = (o = {}) => ({ id: "spot", kind: "planet", color: GOLD, x: 960, y: 590, size: 230, ...o });
const mozart = (variant, o = {}) => fig("moz", 960, 760, variant, { w: 230, ...o });

const told = {
  // "picture this scene … this massive,[84] echoing, incredibly ornate[170] hall[185] in the mid700s.[206]"
  intro: {
    cam: [{ at: 0, s: 1.12, dur: 1 }, { at: 230, s: 1, dur: 200, ease: "inout" }],
    items: [...hall(84), word("hall", "A ROYAL HALL", 960, 330, 104, { enter: { at: 187, from: "pop" } }), word("yr", "THE 1700s", 960, 470, 76, { box: INK, enter: { at: 209, from: "bottom" } })],
  },
  // "You have European royalty,[86] you have popes,[110] … wrapped in these elaborate, heavy robes,[204] … absolute stunned[300]"
  "scene-01": {
    items: [...hall(),
      word("hall", "A ROYAL HALL", 960, 330, 104, { keys: [{ at: 40, y: 150, s: 0.6, dur: 18 }] }), word("yr", "THE 1700s", 960, 470, 76, { box: INK, exit: { at: 40 } }),
      spot({ enter: { at: 262, from: "pop", dur: 20 } }),
      ...court({ king: { enter: { at: 88, from: "left", dur: 14 } }, queen: { enter: { at: 96, from: "left", dur: 14 } }, noble: { enter: { at: 104, from: "right", dur: 14 } }, pope: { enter: { at: 112, from: "right", dur: 14 } } }),
      word("stun", "STUNNED SILENCE", 960, 270, 70, { enter: { at: 302, from: "pop" } }),
    ],
  },
  // "at the center[70] of the room is this tiny[113] four-year-old[146] kid,"
  "scene-02": {
    cam: [{ at: 150, x: 960, y: 600, s: 1.22, dur: 40, ease: "inout" }],
    items: [...hall(), word("hall", "A ROYAL HALL", 960, 150, 104, { s: 0.6, exit: { at: 30 } }), word("stun", "STUNNED SILENCE", 960, 270, 70, { exit: { at: 30 } }),
      spot(), ...court(),
      mozart(CHILD, { enter: { at: 115, from: "pop", dur: 12 } }),
      word("age", "FOUR YEARS OLD", 960, 250, 80, { box: ACC, enter: { at: 148, from: "pop" } }),
    ],
  },
  // "Wolfgang Amadeus Mozart,[29] just a toddler … completely blindfolded[192] yet his hands are just flying[276] across the
  //  piano[303] keys[312]"
  "scene-03": {
    cam: [{ at: 0, x: 960, y: 600, s: 1.22, dur: 1 }, { at: 300, x: 1040, y: 600, dur: 30, ease: "inout" }],
    items: [...hall(), spot(), ...court(),
      mozart(CHILD, { label: "MOZART", exit: { at: 192, dur: 3 } }),
      mozart(BLIND, { id: "mozB", label: "MOZART", enter: { at: 192, from: "fade", dur: 3 } }),
      word("age", "FOUR YEARS OLD", 960, 250, 80, { box: ACC, exit: { at: 60 } }),
      word("bl", "BLINDFOLDED", 1330, 300, 72, { box: INK, enter: { at: 194, from: "pop" }, exit: { at: 270 } }),
      { id: "piano", kind: "icon", paths: PIANO, x: 1215, y: 650, w: 330, enter: { at: 290, from: "right", dur: 16 } },
    ],
  },
  // "flawless[0] unbelievably complex[48] … the ultimate enduring image of the divine[144] prodigy.[154]"
  "scene-04": {
    cam: [{ at: 0, x: 1040, y: 600, s: 1.22, dur: 1 }, { at: 150, x: 960, y: 540, s: 1, dur: 40, ease: "inout" }],
    items: [...hall(), spot({ keys: [{ at: 150, s: 1.5, dur: 24, ease: "back" }] }), ...court(),
      mozart(BLIND, { id: "mozB", label: "MOZART", action: "reach" }),
      { id: "piano", kind: "icon", paths: PIANO, x: 1215, y: 650, w: 330 },
      ...[[1150, 420, 6], [1290, 360, 26], [1400, 440, 50], [1230, 270, 72]].map(([x, y, at], i) => word(`n${i}`, i % 2 ? "♫" : "♪", x, y, 90, { ink: ACC, enter: { at, from: "bottom", dur: 10 } })),
      word("div", "THE DIVINE PRODIGY", 960, 150, 88, { box: INK, enter: { at: 156, from: "top" } }),
    ],
  },
  // "touched by the gods,[21] born with a finished symphony[79] already playing in his head,[125] … that famous letter[228]
  //  from 1815[242]"
  "scene-05": {
    items: [...hall(), spot({ s: 1.5 }),
      ...court({ king: { exit: { at: 40 } }, queen: { exit: { at: 40 } }, noble: { exit: { at: 40 } }, pope: { exit: { at: 40 } } }),
      mozart(BLIND, { id: "mozB", label: "MOZART", action: "reach" }),
      { id: "piano", kind: "icon", paths: PIANO, x: 1215, y: 650, w: 330, exit: { at: 200 } },
      word("div", "THE DIVINE PRODIGY", 960, 150, 88, { box: INK, exit: { at: 60 } }),
      tile("sym", "A FINISHED SYMPHONY", 960, 250, GOLD, { enter: { at: 80, from: "top" }, keys: [{ at: 128, y: 380, s: 0.7, o: 0, dur: 22, ease: "inout" }] }),
      { id: "letter", kind: "emblem", label: "THE LETTER", glyph: "doc", color: "#A9824C", x: 1500, y: 470, enter: { at: 230, from: "right", dur: 14 } },
      word("y1815", "1815", 1500, 230, 96, { box: INK, enter: { at: 244, from: "pop" } }),
    ],
  },
  // "full compositions[10] just appear to his mind out of thin air.[84] … I really hate to shatter[130] this beautiful
  //  image,[161] but I actually have to stop[194] you right there.[211]"
  "scene-06": {
    items: [...hall(), spot({ s: 1.5, keys: [{ at: 134, o: 0.25, dur: 10 }] }),
      mozart(BLIND, { id: "mozB", label: "MOZART", shake: { at: 132, dur: 20 } }),
      { id: "letter", kind: "emblem", label: "THE LETTER", glyph: "doc", color: "#A9824C", x: 1500, y: 470 }, word("y1815", "1815", 1500, 230, 96, { box: INK }),
      ...[[860, 360, 12], [1060, 330, 34], [800, 250, 58], [1110, 240, 80]].map(([x, y, at], i) => word(`m${i}`, i % 2 ? "♫" : "♪", x, y, 84, { ink: ACC, enter: { at, from: "pop", dur: 8 }, exit: { at: 140 } })),
      word("stop", "STOP", 960, 200, 150, { box: RED, enter: { at: 196, from: "pop", dur: 8 } }),
    ],
  },
  // "that letter[15] you're talking about, it was a complete forgery.[72] … A total fabrication.[132]"
  "scene-07": {
    cam: [{ at: 26, x: 1380, y: 480, s: 1.3, dur: 22, ease: "inout" }],
    items: [...hall(), spot({ s: 1.5, o: 0.25 }), mozart(BLIND, { id: "mozB", label: "MOZART", exit: { at: 24 } }),
      { id: "letter", kind: "emblem", label: "THE LETTER", glyph: "doc", color: "#A9824C", x: 1500, y: 470, shake: { at: 72, dur: 18 } }, word("y1815", "1815", 1500, 230, 96, { box: INK }),
      word("stop", "STOP", 960, 200, 150, { box: RED, exit: { at: 20 } }),
      word("forg", "FORGERY", 1500, 470, 104, { box: RED, r: -12, enter: { at: 74, from: "pop", dur: 7 } }),
      word("fab", "A TOTAL FABRICATION", 1280, 720, 56, { enter: { at: 134, from: "bottom" } }),
    ],
  },
  // "That letter was published in a German music magazine[79] in 1815,[98] which … is decades[180] after Mozart[204] had
  //  already died.[230]"
  "scene-08": {
    cam: [{ at: 0, x: 1380, y: 480, s: 1.3, dur: 1 }, { at: 30, x: 960, y: 540, s: 1, dur: 26, ease: "inout" }],
    items: [...hall(),
            { id: "letter", kind: "emblem", label: "THE LETTER", glyph: "doc", color: "#A9824C", x: 1500, y: 470, keys: [{ at: 60, x: 1360, y: 330, s: 0.55, dur: 24, ease: "inout" }] },
      word("y1815", "1815", 1500, 230, 96, { box: INK, exit: { at: 40 } }),
      word("forg", "FORGERY", 1500, 470, 104, { box: RED, r: -12, keys: [{ at: 60, x: 1360, y: 330, s: 0.5, dur: 24, ease: "inout" }] }),
      word("fab", "A TOTAL FABRICATION", 1280, 720, 56, { exit: { at: 24 } }),
      { id: "line", kind: "dash", x: 280, y: 640, x2: 1640, y2: 640, drawFrom: 50, drawTo: 96, enter: { at: 50, from: "fade", dur: 2 } },
      tile("t1815", "1815 · LETTER PRINTED", 1340, 540, RED, { size: 46, enter: { at: 100, from: "top" } }),
      word("dec", "DECADES LATER", 960, 760, 64, { enter: { at: 182, from: "bottom" } }),
      { id: "arr", kind: "arrow", x: 960, y: 640, s: 1.6, enter: { at: 182, from: "fade" } },
      tile("t1791", "1791 · MOZART DIES", 500, 540, INK, { size: 46, enter: { at: 228, from: "top" } }),
    ],
  },
  // "The publisher[91] of that magazine, a man named Johann[130] Rochlitz,[144] was basically just trying to sell[204]
  //  subscriptions.[211]"
  "scene-09": {
    items: [...hall(),
      { id: "letter", kind: "emblem", label: "THE LETTER", glyph: "doc", color: "#A9824C", x: 1360, y: 330, s: 0.55, exit: { at: 80 } }, word("forg", "FORGERY", 1360, 330, 104, { box: RED, r: -12, s: 0.5, exit: { at: 80 } }),
      { id: "line", kind: "dash", x: 280, y: 640, x2: 1640, y2: 640, drawFrom: -10, drawTo: 0, exit: { at: 80 } }, { id: "arr", kind: "arrow", x: 960, y: 640, s: 1.6, exit: { at: 80 } },
      tile("t1815", "1815 · LETTER PRINTED", 1340, 540, RED, { size: 46, exit: { at: 80 } }), word("dec", "DECADES LATER", 960, 760, 64, { exit: { at: 80 } }), tile("t1791", "1791 · MOZART DIES", 500, 540, INK, { size: 46, exit: { at: 80 } }),
      fig("roch", 960, 800, ROCHLITZ, { w: 300, label: "ROCHLITZ", holds: "book", action: "hold", enter: { at: 132, from: "bottom", dur: 14 } }),
      word("pub", "THE PUBLISHER", 1400, 250, 80, { enter: { at: 94, from: "top" } }),
      tile("subs", "SUBSCRIPTIONS FOR SALE", 1420, 520, GOLD, { enter: { at: 208, from: "right" } }),
    ],
  },
  // "it was just a cash[22] grab[31] … he idolized Mozart,[115] sure. But he also recognized that the public[192] was deeply
  //  hungry[235] for this mythology[255] of the effortless supernatural"
  "scene-10": {
    items: [...hall(),
      word("pub", "THE PUBLISHER", 1400, 250, 80, { exit: { at: 20 } }),
      tile("subs", "SUBSCRIPTIONS FOR SALE", 1420, 520, GOLD, { exit: { at: 150 } }),
      ...[[760, 520], [860, 380], [1060, 380], [1160, 520], [700, 700], [1220, 700]].map(([x, y], i) => coin(`c${i}`, x, y, { enter: { at: 24 + i * 5, from: "top", dur: 10 }, exit: { at: 170 } })),
      word("cash", "A CASH GRAB", 1400, 250, 92, { box: INK, enter: { at: 33, from: "pop" }, exit: { at: 170 } }),
      fig("roch", 960, 800, ROCHLITZ, { w: 300, label: "ROCHLITZ", holds: "book", action: "hold", keys: [{ at: 186, x: 520, dur: 24, ease: "inout" }] }),
      ...[1180, 1400, 1620].map((x, i) => fig(`pub${i}`, x, 800, { outfit: ["casual", "dress", "vest"][i], gender: i === 1 ? "f" : "m", hairStyle: ["short", "long", "messy"][i], suit: ["#5C6F7A", "#8A5A7B", "#6A7B4F"][i], expression: "happy" }, { w: 230, flip: true, enter: { at: 194 + i * 10, from: "right", dur: 14 } })),
      word("publ", "THE PUBLIC", 1400, 290, 60, { enter: { at: 196, from: "top" } }),
      word("myth", "HUNGRY FOR THE MYTH", 1180, 160, 80, { box: ACC, enter: { at: 257, from: "pop" } }),
    ],
  },
};

let n = 0;
for (const s of cfg.scenes) {
  const t = told[s.id];
  if (!t) continue;
  s.told = { bg: "#F4F1EA", ...t }; n++;
  s.texts = []; s.characters = []; s.props = []; delete s.diagram; delete s.shots; delete s.continueFromPrev; delete s.carryState;
  s.transition = { type: "cut", frames: 0 };
  s.camera = { zoom: [1, 1], panX: [0, 0], panY: [0, 0] };
}
cfg.meta.flow = 2;
fs.writeFileSync(OUT, JSON.stringify(cfg));
console.log(`told: ${n} of ${cfg.scenes.length} scenes re-staged → ${OUT}`);
