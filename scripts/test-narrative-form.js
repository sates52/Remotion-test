#!/usr/bin/env node
/** test-narrative-form.js — every book is TOLD its own way: the form of the body, the hosts, the on-screen part label. No network. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const F = require("./lib/narrative-form");
const { checkNotebookPrompt } = require("./lib/notebooklm-prompt-check");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`ok  ${name}`); };
const KEYS = Object.keys(F.FORMS);

t("every form is complete: what the film is, the hosts' roles, five steps for a part, its own ending and part name", () => {
  assert.ok(KEYS.length >= 8);
  for (const k of KEYS) {
    const f = F.FORMS[k];
    for (const field of ["label", "part", "name", "fits", "is", "hosts", "ending"]) assert.ok(typeof f[field] === "string" && f[field].length >= 3, `${k}.${field}`);
    assert.strictEqual(f.develop.length, 5, `${k}: five steps keep the recording long (the 30-minute floor was measured with a five-step recipe)`);
    assert.ok(f.for.length && f.for.every((x) => ["fiction", "nonfiction"].includes(x)));
    assert.ok(/^[A-Z]+$/.test(f.part));
  }
  assert.strictEqual(new Set(KEYS.map((k) => F.FORMS[k].part)).size, KEYS.length, "no two forms call their parts the same");
  assert.strictEqual(new Set(KEYS.map((k) => F.FORMS[k].name)).size, KEYS.length);
  assert.strictEqual(new Set(KEYS.map((k) => F.FORMS[k].ending.split(":")[0])).size, KEYS.length, "no two forms end the same way");
  assert.ok(F.candidates("fiction").length >= 4 && F.candidates("nonfiction").length >= 5);
  assert.ok(!F.candidates("fiction").includes("trial") && !F.candidates("nonfiction").includes("portraits"));
});

t("the bodies of two forms are different texts — not one template with a word swapped", () => {
  const words = (s) => new Set(s.toLowerCase().replace(/[^a-z ]+/g, " ").split(/\s+/).filter((w) => w.length > 3));
  // what is common to every form by design (the speech rules, the block headings) is not what is compared
  const own = (k) => { const f = F.FORMS[k]; return [f.is, f.hosts, f.parts(8), f.ending, ...f.develop].join(" "); };
  for (const a of KEYS) for (const b of KEYS) {
    if (a >= b) continue;
    const A = words(own(a)), B = words(own(b)), both = [...A].filter((w) => B.has(w)).length;
    assert.ok(both / Math.min(A.size, B.size) < 0.45, `${a} / ${b} share ${Math.round((100 * both) / Math.min(A.size, B.size))} % of their words`);
  }
});

t("the block a prompt carries: the form, the hosts, the parts by the book's length, the five steps, the speech rules", () => {
  for (const k of KEYS) {
    const b = F.formBlock(k, { beats: 10 });
    for (const must of ["THE FORM OF THIS FILM", "- THE TWO HOSTS:", "- THE PARTS: 10 ", "ONE HONEST CRITICISM", `HOW EACH ${F.FORMS[k].part} IS DEVELOPED`, "SPEECH ("]) assert.ok(b.includes(must), `${k}: ${must}`);
    assert.strictEqual((b.match(/^[a-e]\) /gm) || []).length, 5);
    assert.ok(b.length < 1800, `${k}: ${b.length} chars — NotebookLM's Customize box is small`);
    for (const old of ["DEPTH ENGINE", "COUNTERPOINT:", "PAYOFF", "THESIS:"]) assert.ok(!b.includes(old), `${k} still carries the one spine's ${old}`);
  }
  for (const tic of ['"Exactly."', '"Right."', '"Absolutely."', '"deep dive"', "No sign-off"]) assert.ok(F.SPEECH.includes(tic));
  assert.throws(() => F.formBlock("nope"), /unknown narrative form/);
});

t("60 books in a row: never the form of the book before, every fitting form used, none more than its share", () => {
  for (const kind of ["fiction", "nonfiction"]) {
    const made = [];
    for (let i = 0; i < 60; i++) {
      const k = F.pickForm({ slug: `${kind}-${i}`, kind, recent: [...made].reverse() });
      assert.ok(F.candidates(kind).includes(k));
      if (made.length) assert.notStrictEqual(k, made[made.length - 1], `book ${i} is told like the one before`);
      made.push(k);
    }
    const uses = F.candidates(kind).map((k) => made.filter((m) => m === k).length);
    assert.ok(Math.min(...uses) >= 8 && Math.max(...uses) - Math.min(...uses) <= 4, `${kind}: ${uses.join(" ")}`);
  }
  assert.strictEqual(F.pickForm({ slug: "x", kind: "fiction", recent: [] }), F.pickForm({ slug: "x", kind: "fiction", recent: [] }), "deterministic for a book");
  assert.ok(F.validForm({ key: "case" }) && !F.validForm({ key: "summary" }) && !F.validForm(null));
});

t("the on-screen label is the part the hosts ANNOUNCE — never a number computed from the film's length", () => {
  const b = F.partBadges("case", ["the knife in the snow", "exhibit one, the letter", "more about it", "Exhibit two: the ledger", "as we saw in exhibit one", "exhibit number three the watch"]);
  assert.deepStrictEqual(b, ["CASE FILE", "EXHIBIT 01 / 03", "EXHIBIT 01 / 03", "EXHIBIT 02 / 03", "EXHIBIT 02 / 03", "EXHIBIT 03 / 03"]);
  assert.deepStrictEqual(F.partBadges("case", ["nothing announced", "exhibit one", "exhibit two"]), ["CASE FILE", "CASE FILE", "CASE FILE"], "fewer than three announced parts: the form's name, no invented number");
  assert.deepStrictEqual(F.partBadges("trial", ["round 1", "round 2", "round 3", "round 7"]), ["ROUND 01 / 03", "ROUND 02 / 03", "ROUND 03 / 03", "ROUND 03 / 03"], "a jump is not a part");
  assert.strictEqual(F.partBadges("unknown", ["a"]), null);
  const plan = fs.readFileSync(path.join(__dirname, "plan-antidote.js"), "utf8");
  assert.ok(plan.includes("badge: (FORM_BADGES && FORM_BADGES[i]) || `INSIGHT ${"), "a book without a form is labelled as before");
});

t("Step 0 writes the form into the prompt and the book record; the checker knows a formed prompt and still passes an old one", () => {
  const mp = fs.readFileSync(path.join(__dirname, "make-prompt.js"), "utf8");
  assert.ok(mp.includes("${formBlock(form, tier)}") && !mp.includes("STRUCTURE (follow strictly)") && !mp.includes("DEPTH ENGINE (run this on EVERY beat"));
  assert.ok(mp.includes("manifest.form = { key: FORM, part: FORMS[FORM].part") && mp.includes('--form-why="') && mp.includes("manifest.take ="));
  const formed = (body) => "# x\n\n**Engine:** antidote · **Form:** case ·\n\n```\nYou are two hosts doing a deep, original analysis of \"The Book\".\n\n" + body + "\n\n" + F.formBlock("case") + "\n\nFIRST MINUTE\n- OPEN: x\n- NAME IT: x\n- PROMISE x\n\nPICTURE FIRST (this becomes animation)\n\nLENGTH x\n\nHARD RULES:\n- x\n" + "pad ".repeat(120) + "\n```\n";
  const angle = "THE ANGLE:\n- Thesis to prove: the letter was never sent.\n\nTHE EXHIBITS OF THIS BOOK:\n" + [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `${i}. the thing number ${i} from the book`).join("\n");
  assert.deepStrictEqual(checkNotebookPrompt(formed(angle), { title: "The Book", engine: "antidote", form: "case" }).errors, []);
  assert.ok(checkNotebookPrompt(formed("THE ANGLE:\n- nothing yet"), { title: "The Book", engine: "antidote" }).errors.some((e) => /parts of THIS book are not written/.test(e)));
  assert.ok(checkNotebookPrompt(formed(angle), { title: "The Book", engine: "antidote", form: "duel" }).errors.some((e) => /book\.json says form "duel"/.test(e)));
  assert.ok(checkNotebookPrompt(formed(angle).replace("SPEECH (", "TALK ("), { title: "The Book", engine: "antidote" }).errors.some((e) => /lost its SPEECH block/.test(e)));
  // a prompt written before 2026-11-18 (the one spine) is judged by the rules it was written under
  const old = fs.readdirSync(path.join(__dirname, "..", "books")).map((s) => path.join(__dirname, "..", "books", s)).filter((d) => fs.existsSync(path.join(d, "prompt.notebooklm.md")) && fs.existsSync(path.join(d, "book.json")));
  assert.ok(old.length >= 10);
  for (const d of old) { const b = JSON.parse(fs.readFileSync(path.join(d, "book.json"), "utf8")); const r = checkNotebookPrompt(fs.readFileSync(path.join(d, "prompt.notebooklm.md"), "utf8"), { title: b.title, engine: b.engine }); assert.ok(!r.errors.some((e) => /parts of THIS book|lost its SPEECH|lost its HOW EACH/.test(e)), `${path.basename(d)}: an old prompt is asked for the new blocks`); }
});

console.log(`\n${n} checks passed`);
