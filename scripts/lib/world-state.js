/**
 * world-state.js — WORLD STATE compiler (cycle 10 prototype, experiment branch dev/c10).
 *
 * The question it answers for every beat: WHERE is each object? An object has a stable id, a kind (a hand prop glyph)
 * and exactly ONE place at any time: in someone's hand ({ holder }) or resting beside someone ({ beside, on: table |
 * wall | floor }). Beats change it only through DEEDS:
 *   pickup  who picks up the object resting beside them         rest(who) -> hand(who)   rig: pickup + restsOn
 *   place   who sets the held object down on the table          hand(who) -> rest(who,table)   rig: place + holds
 *   drop    who lets the held object fall to the floor          hand(who) -> rest(who,floor)   rig: drop + holds
 *   give    who hands the held object to `to`                    hand(who) -> hand(to)    rig: take(to) + reach(who)
 *   hang    who hangs the held object on the wall hook           hand(who) -> rest(who,wall)   rig: place + holds
 * Between deeds the state simply persists: a holder keeps it in hand (holds), a resting object stays drawn beside its
 * person (restsOn) in every beat that person is on screen. An object never appears where no deed put it (no
 * teleport) and is never in two places (no duplication) — both are checked, and an inconsistent deed is an ERROR, not
 * a silent fix. The output is ordinary scene fields (characters[].action / holds / restsOn): the renderer draws what
 * the compiler wrote and knows nothing about the world. Pure: no Remotion, no I/O.
 *
 * world: { objects: [{ id, kind, start: { holder } | { beside, on } }] }
 * beat (aligned with scenes): { deeds: [{ who, verb, object, to?, cue? }] }
 */
const VERBS = new Set(["pickup", "place", "drop", "give", "hang"]);

function compileWorld(scenes, world, beats) {
  const errors = [];
  const state = {};
  for (const o of world.objects || []) {
    if (state[o.id]) errors.push(`object ${o.id} declared twice`);
    state[o.id] = { kind: o.kind, at: { ...o.start } };
  }
  const trace = [];
  const out = scenes.map((sc, i) => {
    const s = JSON.parse(JSON.stringify(sc));
    const chars = s.characters || [];
    const who = (c) => c.identity || c.role;
    const find = (id) => chars.find((c) => who(c) === id);
    const deeds = ((beats[i] || {}).deeds) || [];
    const before = JSON.parse(JSON.stringify(state));
    const busy = new Set();
    for (const d of deeds) {
      const o = state[d.object];
      if (!o) { errors.push(`beat ${i}: unknown object ${d.object}`); continue; }
      if (!VERBS.has(d.verb)) { errors.push(`beat ${i}: unknown verb ${d.verb}`); continue; }
      const c = find(d.who);
      if (!c) { errors.push(`beat ${i}: ${d.who} does the ${d.verb} but is not on screen`); continue; }
      const cue = d.cue != null ? { actionAt: d.cue } : {};
      if (d.verb === "pickup") {
        if (!(o.at.beside === d.who)) { errors.push(`beat ${i}: TELEPORT — ${d.who} picks up ${d.object}, which is ${JSON.stringify(o.at)}`); continue; }
        Object.assign(c, { action: "pickup", restsOn: { prop: o.kind, on: o.at.on }, ...cue }); delete c.holds;
        o.at = { holder: d.who };
      } else if (d.verb === "give") {
        const r = find(d.to);
        if (o.at.holder !== d.who) { errors.push(`beat ${i}: TELEPORT — ${d.who} gives ${d.object}, held by ${JSON.stringify(o.at)}`); continue; }
        if (!r) { errors.push(`beat ${i}: ${d.to} receives ${d.object} but is not on screen`); continue; }
        // the engine's hand-over: the RECEIVER takes (first in the cast), the giver reaches (continuity.ts handOffFrame)
        Object.assign(r, { action: "take", holds: o.kind, ...cue });
        Object.assign(c, { action: "reach" }); delete c.holds;
        s.characters = [r, ...chars.filter((x) => x !== r)];
        o.at = { holder: d.to };
        busy.add(d.to);
      } else {
        if (o.at.holder !== d.who) { errors.push(`beat ${i}: TELEPORT — ${d.who} ${d.verb}s ${d.object}, held by ${JSON.stringify(o.at)}`); continue; }
        const on = d.verb === "drop" ? "floor" : d.verb === "hang" ? "wall" : "table";
        Object.assign(c, { action: d.verb === "drop" ? "drop" : "place", holds: o.kind, ...cue });
        // the DEED beat already names the destination, so the rig sets it down THERE (a hang goes up to the hook) and
        // draws it resting there from the cue — never on a table that the next beat replaces with a wall (P02, cycle 10)
        if (on !== "floor") c.restsOn = { prop: o.kind, on }; // a drop draws its own fall (pose.fall) to the floor
        o.at = { beside: d.who, on };
      }
      busy.add(d.who);
    }
    // persistence: every object drawn where the state says, for whoever is on screen
    const drawn = {};
    for (const [id, o] of Object.entries(state)) {
      const deedObj = deeds.some((d) => d.object === id);
      if (o.at.holder) {
        const c = find(o.at.holder);
        if (c && !deedObj) {
          if (c.holds && c.holds !== o.kind) errors.push(`beat ${i}: ${o.at.holder} would hold two objects (${c.holds}, ${o.kind})`);
          c.holds = o.kind;
        }
        if (c) drawn[id] = (drawn[id] || 0) + 1;
      } else if (o.at.beside) {
        const c = find(o.at.beside);
        const wasHere = deedObj && deeds.some((d) => d.object === id && (d.verb === "place" || d.verb === "drop" || d.verb === "hang"));
        if (c && !deedObj) {
          if (c.restsOn && c.restsOn.prop !== o.kind) errors.push(`beat ${i}: two objects rest beside ${o.at.beside}`);
          c.restsOn = { prop: o.kind, on: o.at.on };
        }
        if (c || wasHere) drawn[id] = (drawn[id] || 0) + 1;
      }
    }
    // integrity of what will be drawn: an object only where its state is, never twice
    for (const c of s.characters || []) {
      if (c.holds && !Object.values(state).some((o) => o.kind === c.holds && (o.at.holder === who(c) || (deeds.some((d) => d.who === who(c)))))) {
        errors.push(`beat ${i}: ${who(c)} draws ${c.holds} but no object of that kind is theirs (TELEPORT)`);
      }
    }
    for (const [id, n] of Object.entries(drawn)) if (n > 1) errors.push(`beat ${i}: DUPLICATION — ${id} drawn ${n} times`);
    trace.push({ beat: i, deeds: deeds.map((d) => `${d.who} ${d.verb} ${d.object}${d.to ? ` -> ${d.to}` : ""}`), before: summarize(before), after: summarize(state) });
    return s;
  });
  return { scenes: out, errors, trace };
}

const summarize = (st) => Object.fromEntries(Object.entries(st).map(([id, o]) => [id, o.at.holder ? `hand:${o.at.holder}` : `${o.at.on}:${o.at.beside}`]));

module.exports = { compileWorld, VERBS };
