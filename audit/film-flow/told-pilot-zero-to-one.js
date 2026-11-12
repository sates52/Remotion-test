// Pilot: zero-to-one, first 90 s, re-staged from what the narration SAYS (ToldStage). Frames are scene-relative and
// taken from the word timings of the passage (see the word list printed from the baseline config).
// usage: node told-zero-to-one.js <baseline A config> <out config>
const fs = require("fs");
const [, , IN, OUT] = process.argv;
const cfg = JSON.parse(fs.readFileSync(IN, "utf8"));

const BLUE = "#2563EB", RED = "#E0503A", INK = "#1E1E22", ACC = "#D9603C", GREY = "#6B7280";
const ms = (o = {}) => ({ id: "ms", kind: "emblem", label: "MICROSOFT", glyph: "monitor", color: BLUE, x: 560, y: 470, ...o });
const gg = (o = {}) => ({ id: "gg", kind: "emblem", label: "GOOGLE", glyph: "search", color: RED, x: 1360, y: 470, ...o });
const word = (id, label, x, y, size, o = {}) => ({ id, kind: "word", label, x, y, size, ...o });
const tile = (id, label, x, y, color, o = {}) => ({ id, kind: "tile", label, x, y, color, size: 46, ...o });

const told = {
  // "…the absolute Shakespearean[106] tragedy[128] that played out in Silicon[161] Valley[173] during the 2010s[200]
  //  between Microsoft[228] and Google,[250] … a really fundamental counterintuitive[344] (truth)"
  intro: {
    cam: [{ at: 360, s: 1.08, dur: 60, ease: "inout" }],
    items: [
      word("book", "ZERO TO ONE", 960, 440, 130, { exit: { at: 104 } }),
      word("t1", "A SHAKESPEAREAN TRAGEDY", 960, 400, 88, { enter: { at: 110, from: "pop" }, keys: [{ at: 224, y: 170, s: 0.62, dur: 16 }] }),
      word("t2", "SILICON VALLEY · 2010s", 960, 540, 52, { box: INK, enter: { at: 176, from: "bottom" }, keys: [{ at: 224, y: 250, s: 0.8, dur: 16 }] }),
      ms({ enter: { at: 234, from: "left", dur: 14 } }),
      gg({ enter: { at: 256, from: "right", dur: 14 } }),
      word("vs", "VS", 960, 500, 110, { box: ACC, enter: { at: 266, from: "pop" } }),
      // the curtain: it is already opening on the first frame
      { id: "curtL", kind: "panel", color: "#7A1F2B", x: 480, y: 540, w: 980, keys: [{ at: 44, x: -560, dur: 44, ease: "inout" }] },
      { id: "curtR", kind: "panel", color: "#7A1F2B", x: 1440, y: 540, w: 980, keys: [{ at: 44, x: 2480, dur: 44, ease: "inout" }] },
    ],
  },
  // "truth and that is competition[38] is for losers.[67] … not healthy.[170] … not a driver[204] of ultimate value[228]
  //  and it completely blinds[262] you.[274] You had these two tech behemoths.[324]"
  "scene-01": {
    cam: [{ at: 0, s: 1.08, dur: 1 }, { at: 30, s: 1, dur: 24, ease: "inout" }],
    items: [
      ms({ shake: { at: 68 }, keys: [{ at: 82, r: -9, y: 505, o: 0.5 }, { at: 252, r: 0, y: 470, o: 1 }, { at: 326, s: 1.25, ease: "back", dur: 12 }] }),
      gg({ shake: { at: 68 }, keys: [{ at: 82, r: 9, y: 505, o: 0.5 }, { at: 252, r: 0, y: 470, o: 1 }, { at: 326, s: 1.25, ease: "back", dur: 12 }] }),
      word("vs", "VS", 960, 500, 110, { box: ACC, exit: { at: 30 } }),
      word("w1", "COMPETITION", 960, 170, 112, { enter: { at: 42, from: "top" }, exit: { at: 244 } }),
      word("w2", "IS FOR LOSERS", 960, 300, 96, { box: ACC, enter: { at: 69, from: "pop" }, exit: { at: 244 } }),
      { id: "no", kind: "cross", color: ACC, x: 960, y: 560, enter: { at: 172, from: "pop" }, exit: { at: 204 } },
      { id: "value", kind: "coin", x: 960, y: 560, s: 2.2, enter: { at: 208, from: "pop" }, keys: [{ at: 244, y: 820, o: 0, dur: 14, ease: "inout" }] },
      { id: "blindL", kind: "bar", x: 560, y: 440, w: 280, h: 64, enter: { at: 266, from: "top" }, exit: { at: 312 } },
      { id: "blindR", kind: "bar", x: 1360, y: 440, w: 280, h: 64, enter: { at: 270, from: "top" }, exit: { at: 312 } },
      word("w3", "TWO TECH GIANTS", 960, 190, 84, { enter: { at: 322, from: "top" } }),
    ],
  },
  // "They started out in entirely[46] different[58] universes.[63] … Microsoft[111] was the undisputed[149]"
  "scene-02": {
    cam: [{ at: 130, x: 640, y: 480, s: 1.32, dur: 24, ease: "inout" }],
    items: [
      { id: "pl", kind: "planet", color: BLUE, x: 560, y: 470, size: 290, enter: { at: 50, from: "pop" }, keys: [{ at: 72, x: 440, dur: 18 }] },
      { id: "pr", kind: "planet", color: RED, x: 1360, y: 470, size: 290, enter: { at: 62, from: "pop" }, keys: [{ at: 72, x: 1480, dur: 18 }] },
      ms({ s: 1.25, keys: [{ at: 22, s: 1 }, { at: 72, x: 440, dur: 18 }] }),
      gg({ s: 1.25, keys: [{ at: 22, s: 1 }, { at: 72, x: 1480, dur: 18 }] }),
      word("w3", "TWO TECH GIANTS", 960, 190, 84, { exit: { at: 24 } }),
      word("u", "DIFFERENT UNIVERSES", 960, 130, 76, { enter: { at: 66, from: "top" }, exit: { at: 118 } }),
      { id: "crown", kind: "crown", x: 440, y: 268, enter: { at: 154, from: "top" } },
    ],
  },
  // "dominant king[14] of operating[33] systems[50] and, you know, desktop[93] office[110]  And Google[170] was this pure
  //  algorithm-driven search[252] engine[259] focused entirely on the internet.[314]"
  "scene-03": {
    cam: [{ at: 0, x: 640, y: 480, s: 1.32, dur: 1 }, { at: 176, x: 1280, y: 480, dur: 26, ease: "inout" }],
    items: [
      { id: "pl", kind: "planet", color: BLUE, x: 440, y: 470, size: 290 },
      { id: "pr", kind: "planet", color: RED, x: 1480, y: 470, size: 290 },
      ms({ x: 440 }), gg({ x: 1480 }),
      { id: "crown", kind: "crown", x: 440, y: 268 },
      tile("os", "OPERATING SYSTEMS", 900, 400, BLUE, { enter: { at: 46, from: "right" }, exit: { at: 168 } }),
      tile("office", "DESKTOP OFFICE", 900, 510, BLUE, { enter: { at: 106, from: "right" }, exit: { at: 168 } }),
      tile("search", "SEARCH ENGINE", 1040, 400, RED, { enter: { at: 258, from: "left" } }),
      tile("net", "THE INTERNET", 1040, 510, RED, { enter: { at: 318, from: "left" } }),
    ],
  },
  // "absolutely zero[27] structural reason for them to ever cross[89] paths[99] … But as they grew,[202] instead of looking
  //  at new frontiers,[245] they became[269] completely"
  "scene-04": {
    cam: [{ at: 0, x: 1280, y: 480, s: 1.32, dur: 1 }, { at: 26, x: 960, y: 540, s: 1, dur: 24, ease: "inout" }],
    items: [
      { id: "pl", kind: "planet", color: BLUE, x: 440, y: 470, size: 290, keys: [{ at: 208, s: 1.45, dur: 22 }, { at: 292, x: 540, dur: 18 }] },
      { id: "pr", kind: "planet", color: RED, x: 1480, y: 470, size: 290, keys: [{ at: 208, s: 1.45, dur: 22 }, { at: 292, x: 1380, dur: 18 }] },
      ms({ x: 440, keys: [{ at: 208, s: 1.3, dur: 22, ease: "back" }, { at: 292, x: 540, dur: 18 }] }),
      gg({ x: 1480, keys: [{ at: 208, s: 1.3, dur: 22, ease: "back" }, { at: 292, x: 1380, dur: 18 }] }),
      { id: "crown", kind: "crown", x: 440, y: 268, exit: { at: 22 } },
      
      tile("search", "SEARCH ENGINE", 1040, 400, RED, { exit: { at: 20 } }), tile("net", "THE INTERNET", 1040, 510, RED, { exit: { at: 20 } }),
      word("z", "ZERO REASON TO COLLIDE", 960, 140, 76, { enter: { at: 32, from: "top" }, exit: { at: 196 } }),
      { id: "path", kind: "dash", x: 740, y: 470, x2: 1180, y2: 470, drawFrom: 62, drawTo: 99, enter: { at: 62, from: "fade", dur: 2 }, exit: { at: 196 } },
      { id: "nopath", kind: "cross", color: ACC, x: 960, y: 470, enter: { at: 102, from: "pop" }, exit: { at: 196 } },
      { id: "outL", kind: "arrow", x: 150, y: 470, r: 180, enter: { at: 238, from: "fade" }, exit: { at: 272 } },
      { id: "outR", kind: "arrow", x: 1770, y: 470, enter: { at: 238, from: "fade" }, exit: { at: 272 } },
    ],
  },
  // "inexplicably obsessed[32] with each other.[60] It just became this massive[101] expensive[120] street[140] fight.[149]"
  "scene-05": {
    items: [
      { id: "pl", kind: "planet", color: BLUE, x: 540, y: 470, size: 290, s: 1.45, exit: { at: 44, dur: 16 } },
      { id: "pr", kind: "planet", color: RED, x: 1380, y: 470, size: 290, s: 1.45, exit: { at: 44, dur: 16 } },
      { id: "hit", kind: "burst", color: "#F2C84B", x: 960, y: 450, s: 1.2, enter: { at: 104, from: "pop", dur: 8 }, keys: [{ at: 150, s: 1.6, dur: 30 }] },
      ...[[-430, 720], [-250, 780], [-90, 740], [110, 790], [270, 730], [440, 770]].map(([dx, y], i) => ({ id: `c${i}`, kind: "coin", x: 960, y: 450, s: 1.4, enter: { at: 122 + i * 2, from: "pop", dur: 6 }, keys: [{ at: 150 + i * 3, x: 960 + dx, y, dur: 24, ease: "out" }] })),
      ms({ x: 540, s: 1.3, shake: { at: 102, dur: 22, amp: 16 }, keys: [{ at: 62, x: 740, dur: 26, ease: "inout" }, { at: 104, x: 715, r: -7, dur: 6 }] }),
      gg({ x: 1380, s: 1.3, shake: { at: 102, dur: 22, amp: 16 }, keys: [{ at: 62, x: 1180, dur: 26, ease: "inout" }, { at: 104, x: 1205, r: 7, dur: 6 }] }),
      word("sf", "STREET FIGHT", 960, 160, 112, { box: INK, enter: { at: 151, from: "top", dur: 10 } }),
    ],
  },
  // "It was Windows[43] versus[60] Chrome OS.[79] It was Bing[106] versus[120] Google Search.[142] Internet Explorer[168]
  //  versus[182] Chrome.[192]"
  "scene-06": {
    items: [
      { id: "hit", kind: "burst", color: "#F2C84B", x: 960, y: 450, s: 1.6, exit: { at: 14 } },
      word("sf", "STREET FIGHT", 960, 160, 112, { box: INK, exit: { at: 14 } }),
      ms({ x: 715, s: 1.3, r: -7, keys: [{ at: 28, x: 560, y: 230, s: 0.5, r: 0, dur: 22, ease: "inout" }] }),
      gg({ x: 1205, s: 1.3, r: 7, keys: [{ at: 28, x: 1360, y: 230, s: 0.5, r: 0, dur: 22, ease: "inout" }] }),
      tile("r1a", "WINDOWS", 560, 440, BLUE, { enter: { at: 46, from: "left" } }), word("r1v", "VS", 960, 455, 46, { enter: { at: 63, from: "pop" } }), tile("r1b", "CHROME OS", 1360, 440, RED, { enter: { at: 78, from: "right" } }),
      tile("r2a", "BING", 560, 552, BLUE, { enter: { at: 109, from: "left" } }), word("r2v", "VS", 960, 567, 46, { enter: { at: 123, from: "pop" } }), tile("r2b", "GOOGLE SEARCH", 1360, 552, RED, { enter: { at: 140, from: "right" } }),
      tile("r3a", "INTERNET EXPLORER", 560, 664, BLUE, { enter: { at: 164, from: "left" } }), word("r3v", "VS", 960, 679, 46, { enter: { at: 185, from: "pop" } }), tile("r3b", "CHROME", 1360, 664, RED, { enter: { at: 196, from: "right" } }),
    ],
  },
  // "Yes. Microsoft[12] Office[34] versus[51] Google[63] Docs.[72] Just endless.[99] … the perfect modern enactment of
  //  Romeo[228] and Juliet.[243]"
  "scene-07": {
    cam: [{ at: 112, s: 0.9, dur: 20, ease: "inout" }, { at: 214, s: 1, dur: 16 }],
    items: [
      ms({ x: 560, y: 230, s: 0.5, keys: [{ at: 218, x: 680, y: 500, s: 1, dur: 20, ease: "inout" }] }),
      gg({ x: 1360, y: 230, s: 0.5, keys: [{ at: 218, x: 1240, y: 500, s: 1, dur: 20, ease: "inout" }] }),
      ...[["r1", "WINDOWS", "CHROME OS", 440], ["r2", "BING", "GOOGLE SEARCH", 552], ["r3", "INTERNET EXPLORER", "CHROME", 664]].flatMap(([id, a, b, y]) => [
        tile(id + "a", a, 560, y, BLUE, { exit: { at: 204, dur: 14 } }), word(id + "v", "VS", 960, y + 15, 46, { exit: { at: 204, dur: 14 } }), tile(id + "b", b, 1360, y, RED, { exit: { at: 204, dur: 14 } })]),
      tile("r4a", "MICROSOFT OFFICE", 560, 776, BLUE, { enter: { at: 26, from: "left" }, exit: { at: 204, dur: 14 } }), word("r4v", "VS", 960, 791, 46, { enter: { at: 53, from: "pop" }, exit: { at: 204, dur: 14 } }), tile("r4b", "GOOGLE DOCS", 1360, 776, RED, { enter: { at: 72, from: "right" }, exit: { at: 204, dur: 14 } }),
      word("ro", "ROMEO", 680, 200, 72, { enter: { at: 231, from: "top" } }), word("and", "&", 960, 200, 72, { enter: { at: 240, from: "pop" } }), word("ju", "JULIET", 1240, 200, 72, { enter: { at: 247, from: "top" } }),
    ],
  },
  // "the opening lines of that play, right? Two[45] households[53] both alike[77] in dignity.[93] … The tragedy isn't
  //  just that they're fighting.[213]"
  "scene-08": {
    items: [
      { id: "hl", kind: "house", color: BLUE, x: 560, y: 840, w: 420, h: 330, enter: { at: 49, from: "bottom", dur: 14 } },
      { id: "hr", kind: "house", color: RED, x: 1360, y: 840, w: 420, h: 330, enter: { at: 57, from: "bottom", dur: 14 } },
      ms({ x: 680, y: 500, keys: [{ at: 49, x: 560, y: 590, s: 0.5, dur: 18, ease: "inout" }] }),
      gg({ x: 1240, y: 500, keys: [{ at: 57, x: 1360, y: 590, s: 0.5, dur: 18, ease: "inout" }] }),
      word("ro", "ROMEO", 680, 200, 72, { exit: { at: 30 } }), word("and", "&", 960, 200, 72, { exit: { at: 30 } }), word("ju", "JULIET", 1240, 200, 72, { exit: { at: 30 } }),
      word("th", "TWO HOUSEHOLDS", 960, 150, 84, { enter: { at: 56, from: "top" } }),
      word("eq", "=", 960, 620, 170, { enter: { at: 80, from: "pop" }, exit: { at: 206 } }),
      { id: "fight", kind: "burst", color: "#F2C84B", x: 960, y: 580, s: 0.7, enter: { at: 214, from: "pop", dur: 8 } },
    ],
  },
  // "they are basically the exact[41] same[55] family.[65] … rivals[202] actually grow more similar[242] the more they"
  "scene-09": {
    items: [
      { id: "one", kind: "house", color: GREY, x: 960, y: 840, w: 820, h: 330, enter: { at: 70, from: "fade", dur: 12 } },
      { id: "hl", kind: "house", color: BLUE, x: 560, y: 840, w: 420, h: 330, keys: [{ at: 62, x: 770, dur: 26, ease: "inout" }], exit: { at: 80, dur: 12 } },
      { id: "hr", kind: "house", color: RED, x: 1360, y: 840, w: 420, h: 330, keys: [{ at: 62, x: 1150, dur: 26, ease: "inout" }], exit: { at: 80, dur: 12 } },
      ms({ x: 560, y: 590, s: 0.5, keys: [{ at: 62, x: 790, dur: 26, ease: "inout" }] }),
      gg({ x: 1360, y: 590, s: 0.5, keys: [{ at: 62, x: 1130, dur: 26, ease: "inout" }] }),
      // the two colours fade into one: rivals grow alike
      { id: "msG", kind: "emblem", label: "MICROSOFT", glyph: "monitor", color: GREY, x: 790, y: 590, s: 0.5, o: 0, keys: [{ at: 244, o: 0.92, dur: 40, ease: "inout" }] },
      { id: "ggG", kind: "emblem", label: "GOOGLE", glyph: "search", color: GREY, x: 1130, y: 590, s: 0.5, o: 0, keys: [{ at: 244, o: 0.92, dur: 40, ease: "inout" }] },
      word("th", "TWO HOUSEHOLDS", 960, 150, 84, { exit: { at: 40 } }),
      { id: "fight", kind: "burst", color: "#F2C84B", x: 960, y: 580, s: 0.7, exit: { at: 30 } },
      word("same", "THE EXACT SAME FAMILY", 960, 160, 84, { box: INK, enter: { at: 66, from: "pop" }, exit: { at: 196 } }),
      word("alike", "RIVALS GROW ALIKE", 960, 160, 84, { enter: { at: 206, from: "top" } }),
    ],
  },
};

let n = 0;
for (const s of cfg.scenes) {
  const t = told[s.id];
  if (!t) continue;
  s.told = t; n++;
  s.texts = []; s.characters = []; s.props = []; delete s.diagram; delete s.shots; delete s.continueFromPrev; delete s.carryState;
  s.transition = { type: "cut", frames: 0 };       // one stage, carried from beat to beat: no wipe between them
  s.camera = { zoom: [1, 1], panX: [0, 0], panY: [0, 0] };
}
cfg.meta.flow = 2;
fs.writeFileSync(OUT, JSON.stringify(cfg));
console.log(`told: ${n} of ${cfg.scenes.length} scenes re-staged → ${OUT}`);
