/**
 * style-packs.js — Per-Book Visual Style Packs for Antidote 10x (YPP anti-clustering).
 *
 * Every book selects a distinct visual material, mood palette, and art-direction lock
 * farthest from the last 8 books, while honoring `minorHarm: true` (CLAUDE.md Rule 8 →
 * mandatory `storybookVector` with zero photoreal Flux).
 */

const STYLE_PACKS = {
  midCenturyEditorial: {
    id: "midCenturyEditorial",
    mood: "obsidianGrid",
    secondaryMoods: ["warmParchment", "slateEditorial"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["psychology", "communication", "self-help", "relationships"],
    artLock: "mid-century modern New Yorker editorial gouache and crisp ink illustration, warm muted tones, expressive brushwork, clean focal composition",
  },
  tacticalBlueprint: {
    id: "tacticalBlueprint",
    mood: "blueprintNavy",
    secondaryMoods: ["inkScroll", "emeraldNoir"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["strategy", "business", "systems", "engineering", "technology"],
    artLock: "architectural copper-plate etching and navy blueprint technical illustration, crisp ivory and vermilion drafting ink accents, clean uncluttered composition",
  },
  sumiWoodblock: {
    id: "sumiWoodblock",
    mood: "inkScroll",
    secondaryMoods: ["obsidianGrid", "crimsonNight"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["philosophy", "history", "war", "classic"],
    artLock: "Japanese ukiyo-e woodblock print and sumi-e black ink wash on warm handmade washi paper, vermilion seal accent, bold clean silhouettes",
  },
  editorialNoir: {
    id: "editorialNoir",
    mood: "crimsonNight",
    secondaryMoods: ["obsidianGrid", "slateEditorial"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["negotiation", "crime", "thriller", "investigative", "memoir"],
    artLock: "high-contrast graphic novel noir ink illustration, deep charcoal shadows, selective warm tungsten key light, sharp cinematic composition",
  },
  financialLedger: {
    id: "financialLedger",
    mood: "emeraldNoir",
    secondaryMoods: ["warmParchment", "obsidianGrid"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["finance", "economics", "investing", "entrepreneurship"],
    artLock: "vintage Wall Street stipple engraving and botanical ledger print on deep emerald and antique brass tones, crisp editorial framing",
  },
  risographPop: {
    id: "risographPop",
    mood: "deepViolet",
    secondaryMoods: ["warmParchment", "slateEditorial"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["creativity", "design", "marketing", "innovation"],
    artLock: "bold two-tone risograph screenprint illustration with subtle halftone grain, vibrant coral and gold ink on deep indigo, clean geometric shapes",
  },
  slateDocumentary: {
    id: "slateDocumentary",
    mood: "slateEditorial",
    secondaryMoods: ["obsidianGrid", "inkScroll"],
    castMode: "illustrated",
    minorHarmSafe: false,
    genreAffinity: ["science", "medicine", "biography", "productivity"],
    artLock: "clean contemporary Atlantic magazine editorial illustration, cool slate and teal watercolor washes with fine fountain-pen linework",
  },
  storybookVector: {
    id: "storybookVector",
    mood: "warmParchment",
    secondaryMoods: ["slateEditorial", "obsidianGrid"],
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
    for (let i = 0; i < win.length; i++) {
      const weight = win.length - i;
      if (win[i].id !== pack.id) score += 3 * weight;
      if (win[i].mood !== pack.mood) score += 2 * weight;
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
    castMode: base.castMode,
    captions: "minimal",
    hud: "off",
    motionDoctrine: true,
    ...overrides,
  };
}

module.exports = { STYLE_PACKS, pickStylePack, toArtDirection };
