# Narrative Visual Firewall (P1.1)

Antidote production is blocked unless an authored, book-scoped contract proves
what each planned scene is allowed to show. This is a semantic safety system;
it does not add visual styles or repair a failed plan.

## Authoring authority

`books/<slug>/story-bible.json` must contain:

```json
{
  "world": { "era": "modern existential philosophy", "worldId": "camus-absurdism" },
  "visualProvenance": {
    "bookId": "the-myth-of-sisyphus",
    "worldId": "camus-absurdism",
    "allowedMotifs": ["boulder", "slope"],
    "forbiddenMotifs": ["caveAllegory", "ringOfGyges"],
    "allowedCharacters": ["sisyphus", "camus"],
    "allowedLocations": ["mountainSlope"],
    "allowedProps": ["boulder"]
  }
}
```

Every scene's `narrativeAtom`, `visualIntent`, and `visualContract` repeats the
same provenance fields. `visualContract.visualEvidence` must name the visual
subjects, relations, and states that the final frame sequence will show. Named
characters additionally need `characterIntent` with identity, role, action,
gaze, and state. An empty or generic presenter cannot satisfy a named identity.

For example, the Sisyphus descent needs `subjects: ["Sisyphus", "boulder", "slope"]`,
`relations: ["walks_down_after_boulder_rolls_away"]`, and a character intent
whose action is the actual descent. A boulder icon next to a presenter fails.

## Gates

Pre-render (also invoked by `scripts/render.js` for every Antidote transport):

```powershell
node scripts/validate-narrative-visual-firewall.js --slug=<slug>
```

It writes `books/<slug>/narrative-visual-firewall.report.json` and blocks on
`FOREIGN_WORLD`, `SUBJECT_MISMATCH`, `RELATION_MISMATCH`,
`CHARACTER_MISMATCH`, `MOTIF_NOT_ALLOWED`, `STORY_BIBLE_INCOMPLETE`, or
`PROVENANCE_MISSING`.

Post-render requires actual frame evidence, never a planner claim:

```powershell
node scripts/postrender-semantic-audit.js --slug=<slug> --extract --review=<review.json>
```

The review file has `{ "reviews": [...] }`; each entry is keyed by `sceneId`
and supplies booleans for `visualSubjectVisible`, `visualRelationVisible`,
`visualStateVisible`, `foreignWorldLeakage`, and `characterIdentityMismatch`.
The gate passes only with at least 20 stratified reviewed frames, at least 90%
`semantic_visual_coverage`, and zero leakage or character mismatches.
