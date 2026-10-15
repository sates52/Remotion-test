# Relationship staging experiment (Red Rising scene-17) — snapshot 2026-10-15

**Status: experimental, NOT integrated.** Nothing in this folder is wired into `src/` or `scripts/`
on any branch. Production defaults are unchanged. Integration needs a separate operator decision.

## What it is

The authored storyboard had no field for *who does what to whom*, so the planner and renderer never
received the relationship the narration describes (`semanticSignature` relation was empty in all five
Red Rising diagnostic segments). This experiment adds:

- a source-grounded relationship record (source, relation, target, means, rejectedMethod, purpose,
  speaker, modality), each field tied to a verbatim narration or story-bible quote;
- `scripts/lib/relationship-staging.js` (book-independent, fails closed when a part is not grounded);
- `RelationshipStage.tsx`: ruling group and ruled group as several figures each, a message carrier
  from the ruling group with a LIE mark, handed out to the ruled group, and a crossed-out rejected
  method; cue times taken from VTT word timings;
- a planner hook behind `ANTIDOTE_EXPERIMENT_RELATIONSHIP` (default off) and a `Scene.tsx` hook.

`src-snapshot/` holds full copies of the five changed files as they were in the sandbox code root
(based on commit 0c3a69a). `diffs/` holds the step diffs. `tests/` holds the regression test and its
result. `records/` holds the evidence.

## Verified

- Flag off: planner output byte-identical to the pre-change code; flag-off render identical.
- Flag on: configs differ only on scene-17, only in the staging field; no named character stands
  in for a group.
- The relationship survives 24 experimental make-book stage snapshots.
- Blind readability check (same model family, stills only): read as "the upper group controls the
  lower group by a story marked LIE, not by force".

## Not verified / open

- Gate B (independent semantic approval) is OPEN: the external reviewer helped draft the wording.
- Not a production chain PASS: briefs were ignored as heuristic, hard-gate exited 1 and the chain
  continued, firewall ran preview-only, audits soft.
- plan-antidote couples neighbouring scenes; a single-scene change can alter neighbours' shots.
- Last frames overlap the next scene's transition (LIE mark covered); fix in progress.
- Only one scene of one book. A second book is the next test.

Clips are not committed (binary); their SHA-256 values are in `records/clip-hashes.txt`.
