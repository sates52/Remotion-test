# Preview validation without production approval

Run `node scripts/render.js --slug=<slug> --method=github --segments=pool --preview-only`.
The ordinary command remains strict production validation. Preview keeps authorship,
asset, composition, screen-text and enforced semantic checks enabled.

The narrative firewall records every finding, with an explicit outcome:

- BLOCK: non-diagnostic errors, including unauthorized/foreign motifs, malformed or
  missing SVG geometry, missing provenance, subject/relation mismatches, invalid
  actions and unproven required action support. Unknown errors fail closed.
- REVIEW: existing report-only diagnostics, strategy requirement disagreements and
  unresolved strategy capability. These do not by themselves establish wrong pixels.

Production still fails on the same non-diagnostic strategy findings. Preview reports
use `narrative-visual-firewall.preview.report.json`, retain `productionStatus`, and
return PREVIEW-BLOCKED, PREVIEW-REVIEW or PREVIEW-PASS. The production report is never
overwritten by a preview invocation. Scores and thresholds are unchanged.

Book-registered custom SVGs are resolved by their actual viewBox and path geometry,
not `customSvg` transport tags or self-reported concept labels. A unique matching
registered motif must still be authorized by the scene contract. Forbidden motifs
and code-owned foreign-world origins remain blocked. Registered geometry establishes
asset provenance; it does not establish narration–visual correctness.

Split render state carries PREVIEW-ONLY through dispatch and recovery. Assembly writes
`out/<slug>.preview.mp4` and does not invoke production publishing or claim delivery
approval. A full local preview also uses the preview suffix. Worker segment names
remain compatible with the existing download workflow. Inspect rendered frames and
record confirmed visual errors before delivery; a preview exit code is not a semantic
quality certificate. Production post-render review requirements remain unchanged.

Regression commands:

```text
node scripts/test-preview-contract.js
node scripts/test-cross-book-firewall.js
node scripts/test-strategy-enforcement.js
node scripts/test-bible-integrity.js
```

The first three passed during the continuity repair. Bible integrity retained two
pre-existing fixture failures: unsupported gesture/push actions in older books. The
same failures were reproduced against the original firewall code; they were not
converted to REVIEW or suppressed.
