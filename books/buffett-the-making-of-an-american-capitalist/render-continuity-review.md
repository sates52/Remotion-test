# Render continuity review — 2026-10-10

All ten GitHub segments completed successfully from isolated bundle
`d4d7fa470adea1990ce8f952d6a1f68eddd6b9ca`. The expected 73,306 video frames
were present. Initial concat had timestamp gaps: 2,454.485 seconds instead of
the 2,443.533-second composition. This was treated as a real technical failure,
not reclassified as REVIEW.

Lossless frame-clock normalization produced 73,306 frames, 2,443.533 seconds,
and zero presentation-timestamp deviations greater than 1 ms from frame/30.
The encoded-video payload SHA256 before and after was identical:
`65cd9f9dc0ee10e118749c41d1b4e127e503e3af768a57cb780e34b5461e1595`.
The complete mastered narration is used for the final mux rather than the
concatenated segment audio with boundary gaps. Original segments are retained.

Actual rendered frames inspected: scenes 2, 8, 15, 24, 34, 61, 66, 81, 117,
142, 157, 160, 225, 258 and 260. Evidence PNGs and frame/narration records are
under `out/continuity-frames/buffett-the-making-of-an-american-capitalist/`.

No confirmed narration–visual contradiction was found in these fifteen frames.
The custom textile loom renders as a loom (2/117/142), and the candy box as
chocolates (157). The fictitious boss is not shown as an actual third-party
authority (34). Mr. Market is explicitly introduced as an imagined partnership
(66). Fire matches the burning-building analogy (81), water the waterside scene
(225), family imagery the continuing human obligations (258), and the shield
the hypothetical wealth-protection thought experiment (260). Scene 24's woman
is the declared narration host, not a mistaken Buffett identity.

This is a representative frame inspection, not a full-film blind mute test or
an assertion that all 263 scenes are semantically proven. Pose/expression timing
and metaphor completeness still warrant sequence review. Existing narration
editorial risks remain in `narration-review.md`, including guaranteed-return
phrasing and the recording's incomplete final sentence.

Firewall: preview has 0 BLOCK / 440 REVIEW, with all findings preserved.
Strict production remains FAIL on strategy findings. Operator approval is
separate from the automated production verdict. No capability scores or semantic
thresholds were changed.
