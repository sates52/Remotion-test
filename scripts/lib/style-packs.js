/**
 * style-packs.js — Per-Book Visual Style Packs for Antidote 10x (YPP anti-clustering).
 *
 * 10 balanced packs (5 dark, 5 light). Consecutive books alternate polarity (dark <-> light)
 * and rotate annotationStyle, nodeShape, typography, and mood so no two books cluster.
 * `minorHarm: true` (CLAUDE.md Rule 8) forces `storybookVector` with zero photoreal Flux.
 */

const STYLE_PACKS = {
  midCenturyEditorial: {
    id: "midCenturyEditorial",
    polarity: "dark",
    mood: "obsidianGrid",
    secondaryMoods: ["warmParchment", "slateEditorial"],
    typography: "poppins",
    annotationStyle: "circle",
    nodeShape: "circle",
    layoutGrammar: "centered",
    captionAlign: "center",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["psychology", "communication", "self-help", "relationships"],
    artLock: "mid-century modern New Yorker editorial gouache and crisp ink illustration, warm muted tones, expressive brushwork, clean focal composition",
  },
  tacticalBlueprint: {
    id: "tacticalBlueprint",
    polarity: "dark",
    mood: "blueprintNavy",
    secondaryMoods: ["inkScroll", "emeraldNoir"],
    typography: "condensed",
    annotationStyle: "bracket",
    nodeShape: "hex",
    layoutGrammar: "cinemaWide",
    captionAlign: "center",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["strategy", "business", "systems", "engineering", "technology"],
    artLock: "architectural copper-plate etching and navy blueprint technical illustration, crisp ivory and vermilion drafting ink accents, clean uncluttered composition",
  },
  kinfolkMinimal: {
    id: "kinfolkMinimal",
    polarity: "light",
    mood: "ivoryBroadsheet",
    secondaryMoods: ["sageBotanical", "terracottaStudio"],
    typography: "serif",
    annotationStyle: "bracket",
    nodeShape: "tornPaper",
    layoutGrammar: "editorialLeft",
    captionAlign: "left",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["essentialism", "productivity", "minimalism", "focus", "clarity", "lifestyle"],
    artLock: "warm Kinfolk editorial fine-line ink and translucent gouache illustration on bright ivory archival paper, sunlit organic negative space, terracotta and sage accents, uncluttered minimalist framing",
  },
  botanicalWoodcut: {
    id: "botanicalWoodcut",
    polarity: "light",
    mood: "sageBotanical",
    secondaryMoods: ["ivoryBroadsheet", "warmParchment"],
    typography: "slab",
    annotationStyle: "underline",
    nodeShape: "arch",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["biology", "health", "nature", "habits"],
    artLock: "botanical woodcut engraving with soft sage and ochre watercolor washes on natural linen paper, crisp ink contours, airy negative space",
  },
  terracottaCraft: {
    id: "terracottaCraft",
    polarity: "light",
    mood: "terracottaStudio",
    secondaryMoods: ["ivoryBroadsheet", "inkScroll"],
    typography: "condensed",
    annotationStyle: "pin",
    nodeShape: "hex",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["craft", "leadership", "culture", "biography", "memoir"],
    artLock: "sunlit Mediterranean gouache and fine-nib ink illustration on warm clay paper, deep terracotta and Aegean teal accents, clean editorial framing",
  },
  sumiWoodblock: {
    id: "sumiWoodblock",
    polarity: "light",
    mood: "inkScroll",
    secondaryMoods: ["ivoryBroadsheet", "terracottaStudio"],
    typography: "serif",
    annotationStyle: "underline",
    nodeShape: "arch",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["philosophy", "history", "war", "classic"],
    artLock: "Japanese ukiyo-e woodblock print and sumi-e black ink wash on warm handmade washi paper, vermilion seal accent, bold clean silhouettes",
  },
  editorialNoir: {
    id: "editorialNoir",
    polarity: "dark",
    mood: "crimsonNight",
    secondaryMoods: ["obsidianGrid", "slateEditorial"],
    typography: "condensed",
    annotationStyle: "spotlightMask",
    nodeShape: "filmStrip",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["negotiation", "crime", "thriller", "investigative"],
    artLock: "high-contrast graphic novel noir ink illustration, deep charcoal shadows, selective warm tungsten key light, sharp cinematic composition",
  },
  financialLedger: {
    id: "financialLedger",
    polarity: "dark",
    mood: "emeraldNoir",
    secondaryMoods: ["warmParchment", "obsidianGrid"],
    typography: "slab",
    annotationStyle: "underline",
    nodeShape: "arch",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["finance", "economics", "investing", "entrepreneurship"],
    artLock: "vintage Wall Street stipple engraving and botanical ledger print on deep emerald and antique brass tones, crisp editorial framing",
  },
  risographPop: {
    id: "risographPop",
    polarity: "dark",
    mood: "deepViolet",
    secondaryMoods: ["warmParchment", "slateEditorial"],
    typography: "poppins",
    annotationStyle: "pin",
    nodeShape: "tornPaper",
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["creativity", "design", "marketing", "innovation"],
    artLock: "bold two-tone risograph screenprint illustration with subtle halftone grain, vibrant coral and gold ink on deep indigo, clean geometric shapes",
  },
  storybookVector: {
    id: "storybookVector",
    polarity: "light",
    mood: "warmParchment",
    secondaryMoods: ["ivoryBroadsheet", "sageBotanical"],
    typography: "slab",
    annotationStyle: "pin",
    nodeShape: "tornPaper",
    castMode: "vectorRig",
    minorHarmSafe: true,
    genreAffinity: ["fiction", "novel", "drama", "trauma"],
    artLock: "",
  },
};

function pickStylePack({ slug = "", genre = "", minorHarm = false, recent = [] } = {}) {
  if (minorHarm) return STYLE_PACKS.storybookVector;
  const win = (Array.isArray(recent) ? recent : [])
    .map((r) => (typeof r === "string" ? STYLE_PACKS[r] : r))
    .filter(Boolean)
    .slice(0, 8);
  const g = String(genre || "").toLowerCase();

  let best = null;
  for (const pack of Object.values(STYLE_PACKS)) {
    if (pack.id === "storybookVector") continue;
    if (win[0] && (win[0].id === pack.id || win[0].mood === pack.mood)) continue;
    let score = 0;
    if (win[0] && win[0].polarity && pack.polarity !== win[0].polarity) {
      score += 40;
    }
    for (let i = 0; i < win.length; i++) {
      const weight = win.length - i;
      if (win[i].id !== pack.id) score += 3 * weight;
      if (win[i].mood !== pack.mood) score += 2 * weight;
      if (win[i].annotationStyle !== pack.annotationStyle) score += 2 * weight;
      if (win[i].nodeShape !== pack.nodeShape) score += 2 * weight;
      if (win[i].typography !== pack.typography) score += 2 * weight;
    }
    if (pack.genreAffinity.some((a) => g.includes(a))) score += 12;
    let tie = 0;
    for (let i = 0; i < slug.length; i++) tie = (tie * 31 + slug.charCodeAt(i) + pack.id.charCodeAt(0)) % 997;
    if (!best || score > best.score || (score === best.score && tie > best.tie)) {
      best = { pack, score, tie };
    }
  }
  return best ? best.pack : STYLE_PACKS.midCenturyEditorial;
}

function toArtDirection(packOrId, overrides = {}) {
  const pack = typeof packOrId === "string" ? STYLE_PACKS[packOrId] : packOrId;
  const base = pack || STYLE_PACKS.midCenturyEditorial;
  return {
    stylePack: base.id,
    style: base.artLock || "clean symbolic flat-vector storybook stage",
    mood: base.mood,
    polarity: base.polarity,
    typography: base.typography,
    annotationStyle: base.annotationStyle,
    nodeShape: base.nodeShape,
    layoutGrammar: base.layoutGrammar || "centered",
    captionAlign: base.captionAlign || "center",
    castMode: base.castMode,
    captions: "minimal",
    hud: "off",
    motionDoctrine: true,
    ...overrides,
  };
}

module.exports = { STYLE_PACKS, pickStylePack, toArtDirection };
