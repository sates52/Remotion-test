# State-change lab — 2026-10-20 (plan P2 candidate 1: an authored object state actually changes on screen)

Plan: `docs/ANTIDOTE-REFERENCE-PLAN-2026-10-17.md` (P2, candidate 1). Code: branch commit on `god-mode` (see AGENT_LOG
2026-10-20 "authored state change"). Sandbox worktree `.claude/worktrees/state-lab`; no production book file was
written (Burn's files were COPIED read-only from the main checkout at ~09:04; 15-secrets is published and frozen —
sandbox copy only).

## The bug this answers — burn scene-218
- Narration: "She watches Ignas, who has been trapped in purgatory for millennia, finally break the curse."
- Authored (Burn agent, local): `concept: chains`, `shotOverride: beforeAfter`, callout "Finally break the curse".
- Config: `shot: beforeAfter`, ONE prop (`chains`), cast `luther`. The renderer drew one intact chain: the break lived
  only in the caption.
- Cause split:
  - ENGINE: `beforeAfter` builds its second icon from an engine `OPPOSITE` table, and never for an authored concept
    (`canBeforeAfter` requires `authoredConcept === undefined`) — so an authored beforeAfter is one icon, no arrow,
    no after-state, silently.
  - AUTHORING CONTRACT: there was no authored field for an end state at all (only `compass: spin`).
  - The `shot`-instead-of-`shotOverride` records are 7 OTHER Burn beats (241–261); 218 itself used `shotOverride`.
    Unsupported fields are refused at merge since 5b780c6.

## The capability (narrow extension of the existing `conceptMotion` chain)
`chains: break` (intact -> snapped apart, kept) and `phone: light` (dark screen -> lit with a message, kept). Start state
before the authored cue word, end state after it, as a pure function of the frame (`stateProgress`). A continued beat
with the same icon must repeat the motion (merge refuses otherwise); authored `beforeAfter` is refused. Merge ->
planner (word-synced `motionAt`) -> `_authorship.lock` -> gate drift/restore -> continuity carries the cue -> motif.

## Real chain evidence (authored-K.json -> merge --write -> make-book with every gate -> config -> render)
- Fiction, burn 217–219: NEW 218 = `chains` + `break` on "break the curse", `insert`, `cast: []`.
- Non-fiction, 15-secrets 73–76: NEW 74 = `phone` + `light` on "lights up" (designer reaches); 75 = `continue`, the
  same lit phone, afraid face ("52 unread emails"). OLD 74 had `concept: phone` AND `holds: phone` (two phones; the
  default phone motif is lit with a message from frame 16, so OLD shows no change at all).
- `inputs/new-authored.json` (the authored records), `inputs/*.OLD.json` (the files they replaced).
- Sandbox-only merge fixes OUTSIDE the windows, same meaning the old merge gave them (`inputs/merge-fixes-*.txt`):
  burn 7 ignored `shot` fields deleted; 15-secrets 12 diagram+cast beats -> `cast: []` (the planner dropped the person).
- Same-code baseline (BASE = old authored, same sandbox code, same make-book): `inputs/preserve-check-BASE.json`
  - burn: only scene-218 differs. 218: every authored decision reached the config (concept, motion, cast [], callout, shot).
  - 15-secrets: 74, 75 differ as authored (ALL decisions kept); 77 differs in its ENGINE-chosen shot only
    (closeUp -> medium: the shot menu's cooldown sees 74/75 as `illustration` now; 77 has no authored shot).
- Configs (window scenes only): `configs/*-{OLD,BASE,NEW}-window.json` (OLD = the shipped/current config, produced by
  older code — not used for the clips).
- Gates (sandbox make-book): burn exit 0 — screen-text PASS, composition PASS, continuity PASS, authorship drift 0;
  15-secrets exit 0 — 62 pre-existing drift scenes in this published book, none in 73–76. Mastering of the 15-secrets
  audio stub failed after planning (the sandbox only had a 1.4 MB audio stub; clips are judged mute).

## Jump test (a frame rendered on its own = the same frame in the clip)
`render-sequence-stills.js` renders each requested frame as its own seek; compared with the clip's frame (H.264):
burn f59887 (mid-break): 34.7 dB vs its own clip frame, 20.2 / 23.1 / 24.2 / 22.0 dB vs frames -2/-1/+1/+2 — the
standalone frame is the clip's frame, not a neighbour. f59877 (6 before cue): intact; f59903 (20 after): broken.
15-secrets f20380 (6 before cue): dark screen, no message; f20406: lit + message. Full-res files:
`C:\Users\savas\Cursor\Remotion\archive\state-change-lab-2026-10-20\jump-fullres\`; 960 px copies in `jump/`.

## Blind evaluation (picture, not caption)
- Clips: `C:\Users\savas\Cursor\Remotion\archive\state-change-lab-2026-10-20\clips\` (OLD = BASE config, NEW; same
  window, identical durations 25.32 s / 29.35 s).
- Strips: 8 frames per version at the SAME absolute frames (`inputs/strips2-plan.json`: 2 in the scene before, 4 in
  the change beat — 30%, 70%, cue+15, end-5 — 2 in the scene after), subtitle bar cropped so readers never see the
  narration. A first equal-interval strip was discarded before any judging: it skipped the last 1.3 s of burn 218,
  i.e. the whole end state, so it could not show the change in either version.
- 8 strip readers (2 per book × version), 2 single-still readers, 4 judges — fresh sonnet agents; readers saw only
  their images; judges saw narration + two descriptions as X/Y (balanced: each book OLD as X once, as Y once), tie allowed.
- Results (`judging/scores-unblinded.json`, key in `judging/judge-key.json`):
  | | change read from the PICTURE | judge prefers | wrong readings |
  |---|---|---|---|
  | burn OLD | 0/2 ("the chain never visibly breaks") | 0 | 2 (break only in text) |
  | burn NEW | 2/2 ("the middle link shatters, the halves separate") | 2 | 0 |
  | 15-secrets OLD | 0/2 (phone lit from the start) | 0 | 3 |
  | 15-secrets NEW | 2/2 ("dark screen -> bright white, bubble, rays") | 2 | 2 — both also in OLD (bubble read as messages not emails; no bed drawn) |
- Single still after the cue: burn "the chain is broken, two halves with a gap"; 15-secrets "the phone is on and lit
  up … an incoming message".

## Limits (read these before quoting the numbers)
- Two short passages, one state each; 4 judgments; sonnet readers and judges; judges saw descriptions, not images.
- Strips are 8 stills from the clip, not watched video; frames were fixed in advance and identical for both versions,
  but they were chosen to include the change beat (an equal-interval sample missed burn's end state).
- burn 218's cue is late in its beat: the broken chain is on screen ~1.3 s before the cut to 219. The mute-test still
  (max(70%, last text + 30) = frame 210 > cue 200) lands after the break.
- 15-secrets callout "THE SCREEN LIGHTS UP" appears 14 frames before the screen lights (it anchors on "screen", the
  motion on "lights").
- Not a book-level PASS; no mute bar was used or changed.
- Noise shared by both versions (not caused by this change, recorded for review): burn 217 renders as an untitled
  "CHAPTER 16" card (see AGENT_LOG for-review: youtube-meta `needsClaudeRefine` chapters -> 17 untitled cards).
