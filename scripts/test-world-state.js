#!/usr/bin/env node
// WORLD STATE compiler (cycle 10 prototype, branch dev/c10): one place per object, deeds move it, the state persists
// between beats, an impossible deed is an error (never a silent teleport), nothing is drawn twice.
// Run: node scripts/test-world-state.js
const { compileWorld } = require("./lib/world-state");
let failed = 0;
const t = (name, ok, info) => { console.log(`${ok ? "✓" : "✗"} ${name}${!ok && info !== undefined ? `  (${JSON.stringify(info).slice(0, 300)})` : ""}`); if (!ok) failed++; };
const sc = (...ids) => ({ characters: ids.map((id) => ({ identity: id, action: "idle" })) });

// pickup → hold → place: the object is drawn where its state is, in every beat
{
  const r = compileWorld([sc("a"), sc("a"), sc("a"), sc("a")], { objects: [{ id: "o", kind: "phone", start: { beside: "a", on: "table" } }] },
    [{}, { deeds: [{ who: "a", verb: "pickup", object: "o" }] }, {}, { deeds: [{ who: "a", verb: "place", object: "o" }] }]);
  const c = r.scenes.map((s) => s.characters[0]);
  t("beat 0: resting on the table beside its person, not in hand", !r.errors.length && c[0].restsOn && c[0].restsOn.on === "table" && !c[0].holds, r.errors);
  t("beat 1: the pickup deed, from where it rests", c[1].action === "pickup" && c[1].restsOn.prop === "phone");
  t("beat 2: kept in hand with no deed authored (persistence)", c[2].holds === "phone" && !c[2].restsOn);
  t("beat 3: set down on the table", c[3].action === "place" && c[3].holds === "phone");
}
// a hand-over: the receiver takes, the giver reaches, the object is the receiver's from then on
{
  const r = compileWorld([sc("a", "b"), sc("a", "b"), sc("b", "a")], { objects: [{ id: "c", kind: "creditCard", start: { holder: "a" } }] },
    [{}, { deeds: [{ who: "a", verb: "give", object: "c", to: "b" }] }, {}]);
  t("give: the receiver is first in the cast and takes, the giver reaches", !r.errors.length && r.scenes[1].characters[0].identity === "b" && r.scenes[1].characters[0].action === "take" && r.scenes[1].characters[1].action === "reach" && !r.scenes[1].characters[1].holds, r.errors);
  t("after the hand-over only the receiver holds it", r.scenes[2].characters.find((x) => x.identity === "b").holds === "creditCard" && !r.scenes[2].characters.find((x) => x.identity === "a").holds);
}
// drop → it lies on the floor in the next beat; a person off screen does not carry their object on screen
{
  const r = compileWorld([sc("a"), sc("a"), sc("b"), sc("a")], { objects: [{ id: "x", kind: "gift", start: { holder: "a" } }] },
    [{}, { deeds: [{ who: "a", verb: "drop", object: "x" }] }, {}, {}]);
  t("drop: lies on the floor beside its person afterwards", !r.errors.length && r.scenes[3].characters[0].restsOn.on === "floor", r.errors);
  t("a beat without that person draws the object nowhere (it stays where it is, off screen)", !r.scenes[2].characters[0].holds && !r.scenes[2].characters[0].restsOn);
}
// impossible deeds are errors
{
  let r = compileWorld([sc("a", "b")], { objects: [{ id: "o", kind: "key", start: { beside: "b", on: "table" } }] }, [{ deeds: [{ who: "a", verb: "pickup", object: "o" }] }]);
  t("picking up an object that rests beside someone else → TELEPORT error", r.errors.some((e) => /TELEPORT/.test(e)));
  r = compileWorld([sc("a", "b")], { objects: [{ id: "o", kind: "key", start: { holder: "b" } }] }, [{ deeds: [{ who: "a", verb: "give", object: "o", to: "b" }] }]);
  t("giving an object one does not hold → TELEPORT error", r.errors.some((e) => /TELEPORT/.test(e)));
  r = compileWorld([sc("a")], { objects: [{ id: "o", kind: "key", start: { holder: "a" } }, { id: "p", kind: "cup", start: { holder: "a" } }] }, [{}]);
  t("two objects in one hand → error", r.errors.some((e) => /two objects/.test(e)));
  r = compileWorld([sc("a")], { objects: [{ id: "o", kind: "key", start: { holder: "a" } }] }, [{ deeds: [{ who: "z", verb: "place", object: "o" }] }]);
  t("a deed by someone not on screen → error", r.errors.some((e) => /not on screen/.test(e)));
  const authored = sc("a"); authored.characters[0].holds = "sword";
  r = compileWorld([authored], { objects: [] }, [{}]);
  t("an object drawn in a hand with no world object behind it → TELEPORT error", r.errors.some((e) => /TELEPORT/.test(e)));
}
// pure: the input scenes are not mutated
{
  const s = [sc("a")]; const before = JSON.stringify(s);
  compileWorld(s, { objects: [{ id: "o", kind: "key", start: { holder: "a" } }] }, [{}]);
  t("compileWorld does not mutate its input", JSON.stringify(s) === before);
}
console.log(failed ? `\n${failed} FAILED` : "\nall world-state checks passed");
process.exit(failed ? 1 : 0);
