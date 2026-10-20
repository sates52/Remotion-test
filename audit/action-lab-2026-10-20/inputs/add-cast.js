// Sandbox only: the two people burn 219's embrace needs (cast rule: every person a staged event needs is a cast key).
// Looks: the mate's from the narration ("a tall, copper-skinned man with dark braids"); Ignas's is not given by the
// narration — a neutral look, distinct from the rest of the cast (recorded as such).
const fs = require("fs"), path = require("path");
const LAB = process.argv[2];
const p = path.join(LAB, "books", "burn-of-the-everflame", "story-bible.json");
const b = JSON.parse(fs.readFileSync(p, "utf8"));
b.cast.ignas = {
  name: "Ignas", role: "a Kindred trapped in purgatory for millennia who finally breaks the curse (beats 218-219)",
  look: "a woman; the narration gives no look — neutral: pale grey dress, long silver-grey hair",
  variant: { gender: "f", age: "adult", build: "slight", outfit: "dress", suit: "#9CA3AF", shirt: "#E5E7EB", skin: "#E8C9A8", hair: "#B8B8B8", hairStyle: "long", headwear: "none", beard: "none", glasses: false, accessory: "none" },
  source: { quote: "She watches Ignas, who has been trapped in purgatory for millennia, finally break the curse." },
};
b.cast.ignasMate = {
  name: "Ignas's mate", role: "her long lost mortal mate", look: "a tall, copper-skinned man with dark braids",
  variant: { gender: "m", age: "adult", build: "average", outfit: "cloak", suit: "#7C4A2D", shirt: "#D6B48A", skin: "#A0623E", hair: "#1C1410", hairStyle: "braids", headwear: "none", beard: "none", glasses: false, accessory: "none" },
  source: { quote: "launches herself into the arms of a tall, copper- skinned man with dark braids, her long lost mortal mate." },
};
// the book's provenance must name them too (the narrative-visual firewall checks every staged identity against it)
b.visualProvenance = b.visualProvenance || {};
b.visualProvenance.allowedCharacters = [...new Set([...(b.visualProvenance.allowedCharacters || []), "ignas", "ignasMate"])];
fs.writeFileSync(p, JSON.stringify(b, null, 2));
const { variantSchema } = require(path.join(LAB, "src", "engines", "antidote", "schema.ts"));
for (const k of ["ignas", "ignasMate"]) {
  const r = variantSchema ? variantSchema.safeParse(b.cast[k].variant) : null;
  console.log(k, !r ? "(no variantSchema export)" : r.success ? "variant valid" : JSON.stringify(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)));
}
