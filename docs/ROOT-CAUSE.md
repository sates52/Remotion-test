# ROOT-CAUSE: Why Verity's Visuals Did Not Match Its Audio

**Date:** P2.0 investigation
**Status:** Fixed by P2.0 (bible integrity) + P2.0b (data contract) + P2.0c (template cleanup) + P2.1 (gate wiring)

## Symptom

Rendered Verity frames showed `civicPolis` / `kallipolis` / `fiveRegimes`
(Plato's Republic concepts) over Colleen Hoover narration. 91% of Verity's
props (148 `civicPolis` + 55 `fiveRegimes` + 37 `kallipolis`) belonged to a
different book's world, while `visualSubject` was empty on all 263 scenes.

## Root-cause chain (each link was necessary)

1. **Contaminated bible (insertion point: bible authoring step).**
   `plan-bible.js:341-346` scaffolds `allowedMotifs: []` as an *empty
   intentional* scaffold — but the authoring step that fills it copied
   Republic motifs into `books/verity/story-bible.json`. Nothing checked the
   claim against any external authority, because the bible *was* the
   authority.

2. **`worldAllowed()` trusted the bible.** The scene builder filtered props
   through `bible.visualProvenance.allowedMotifs`, which already contained the
   foreign motifs, so every contaminated prop passed.

3. **`inject-provenance.js:79` propagated the lie.** The bible's
   `allowedMotifs` array is copied by reference into every scene's
   `narrativeAtom`, `visualIntent`, and `visualContract` — one bad list became
   263 × 3 endorsements. Two data-contract bugs compounded it:
   - `:61` read `scene.narration` (a field that does not exist — all books
     store `_narration`), so `narrativeRelation` fell back to the constant
     `"philosophical discourse"`.
   - `:75` read `scene.chapter || scene.act` (neither exists — books store
     `_act`), so `sourceChapter` fell back to `"unknown"`.

4. **The firewall passed it (insertion point: contract-vs-bible tautology).**
   P1.1's `validateScene` proves scene-contract ⊆ bible. Because the bible
   itself was contaminated, the check was a tautology: contract matches bible,
   bible "allows" `civicPolis`, scene renders `civicPolis` → PASS. There was
   no bible-vs-narration or bible-vs-external-registry check anywhere.

5. **P1.5 gate was offline (insertion point: gate wiring).**
   `evaluate-gate-p15.mjs` is a hardcoded 2-book benchmark that never exits
   non-zero and is invoked by nothing in `render.js`. `FORBIDDEN_GENERIC_TEXT`
   was only ever evaluated inside `postrender-semantic-audit.js`, *after*
   pixels were produced.

## Secondary findings fixed in the same pass

- **Baked forbidden templates (insertion point: antidote-semantic-director.js).**
  `CONCEPT_ANCHORS` (`:46` `"THE PASSENGER SEAT"`, `:84-94` fallbacks
  `"THE 99% DEFAULT"` / `"THE HIDDEN MECHANISM"` / `"CRITICAL DISTINCTION"`)
  are emitted into `texts[].text` and are already baked into all three
  production configs (Verity 117, Republic 54, Sisyphus 50 occurrences).
  Cleaning the generator alone was insufficient; a strip pass over the configs
  was required.
- **Duplicate identities:** `varity`/`verity` and `loen`/`lowen` in Verity's
  cast — two keys each, one edit apart, sharing one display name.
- **Constant contract:** `narrativeRelation` and `sourceChapter` were
  sentinels on every scene, so the contract carried zero narrative
  information. Measured to be *identical* on the healthy Republic book, hence
  diagnostic-only: a degenerate contract is not proof of a wrong visual.

## Why the fix is generic

No code path names Verity, Plato, or Camus. Enforcement reads two
**code-owned registries** that a bible cannot edit:

- `data/motif-world.json` — motif → owning `worldId` (e.g. `civicPolis` →
  `plato-republic`). A bible claiming a motif owned by another world fails
  `FOREIGN_WORLD` at the claim level *and* at every use site.
- `data/shared-generic-motifs.json` — globally shared generic vocabulary.
- Everything else must be **grounded** in the scene's narration/bible
  vocabulary or it fails `VOCABULARY_NOT_GROUNDED`.

A fresh book needs zero registry edits: its motifs are either generic
(shared pool) or literally present in its own narration.
