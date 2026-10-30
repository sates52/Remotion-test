# Cross-agent regression register (standing list)

Real incidents from video-agent sessions. Each one stays here once fixed, so the next change can be checked against it.

**Levels:**
- **L1:** the code exists.
- **L2:** the fixture or test passes.
- **L3:** passes on a real book or the real platform.

**L3 needs real-session evidence.** A fixture never counts as L3. When a row moves up a level, add the evidence (file, run, date).

Started 2026-10-30 (cycle 3; details in `AGENT_LOG.md` → 2026-10-30). Tests are listed by name; all were green on
238ca499.

| # | case | root cause | fix | test (L2) | real evidence | level / open |
|---|---|---|---|---|---|---|
| 1 | The Magician's Nephew (MN): question after seal | the CONTINUE contract did not forbid ending the turn | "turn never ends on CONTINUE" in next-step + every stage tool + the 4 entry files | preview-autonomy, agent-entrypoints, autonomy-audit | BEFORE (pin 086a0941, pre-fix): `autonomy-audit` on the real MN session → FAIL, plus 11 claimed gates for review | **L2** · no session on post-fix code yet |
| 2 | Trust Fall (TF): question after bible | `--bible` printed no next step | grounding review + next step | plan-bible-grounding, autonomy-audit | TF bible (read-only): review flags Quinn, Remy, Damian. BEFORE (pin 9e27acec, pre-fix): real TF session → FAIL, 4 stops on CONTINUE ("I've stopped here so you can decide", "Should I keep going?", "Should I start fix round 1…?") | **L2** (autonomy) · L3 (detection only) |
| 3 | The Art of Strategy (AoS): question after bible PASS | as #1 | as #1 | preview-autonomy, autonomy-audit | BEFORE (pin 9e27acec, pre-fix): real AoS session → FAIL, 3 stops ("Tell me to continue and I'll run the rest", "Devam etmemi isterseniz…") | **L2** |
| 4 | MN: preview-ready.json missing while the console said READY | undefined `head` + empty catch | `lib/preview-record`: atomic write, read back, exit 0 only if recorded | preview-ready-record | MN record present (`head` fix); the atomic version is not yet used on a real book | L2 (L3 for the `head` fix) |
| 5 | MN: run3 superseded, run5 PASS | open-label filter by time | `lib/mute-verdict`: identity, retired sidecar | mute-verdict | MN preview-state READY (run5) | **L3** |
| 6 | MN: pinned maintenance upgrade | no controlled re-pin | `maintenance-upgrade.js` | maintenance-upgrade | MN `--check` refused correctly (25 feature files) | L3 (refusal) · no real upgrade done |
| 7 | render-accounts.json missing in a pinned worktree | the pinned render.js reads credentials from the worktree | launcher + `--book-root` (credentials read in place) | render-book-root | **MN real dispatch 2026-10-30 09:07–09:35 UTC**, launcher f0a4cbf0, 10/10 segments pushed and dispatched | **L3** (dispatch) |
| 8 | NO_DEBT without the operator's GO | quality-debt acceptance = render approval | `--authorize-render` (kind render-authorization) | render-preflight, gate-routing | MN: 09:07:43 preflight REFUSED (no authorization) → 09:07:57 authorization recorded (pin 086a0941, config 889a18f8, input dc2bd5a7) → 09:07:59 OK | **L3** |
| 9 | Vox: information not in the narration | bible not checked against the narration | era evidence + grounding review | plan-bible-grounding | TF / MN findings (read-only) | L2 · Vox image-subject check open |
| 10 | merge recovery filling fields mechanically | an action with `cast: []` silently dropped | ACTION_NO_PERSON refusal | merge-recovery | AoS beat 293 is the real case | L3 (detection) |
| 11 | cloud assembly: local FFmpeg suggested | old fallback text | render-deliver skill; a local join needs `--operator-approved` | cloud-assemble | **MN 2026-10-30:** cloud assembly run 41038122542 verified 57,493/57,493 frames; the film was downloaded and the local sha256 = the cloud report (843e0ea0…); h264 1080p30 + AAC 48 kHz stereo, 1922.9 s | **L3** |
| 12 | YouTube pack: TODO / copied fallback text | placeholders passed | lintPack placeholder hard fail | title-lint, youtube-gate | MN pack READY | L3 · template text in the thumbnail prompt is not caught |
| 13 | collapsed character reset in the next beat | no carried state | body-state continuity chains (+ take→place, drink→leave) | body-state | **TF 42-47 blind A/B 2026-10-30** (sit → continue): carry ON 5/5 "sits throughout", 0 WRONG; carry OFF 0/5, 5 WRONG (`audit/c4-pilots/result-flee-continuity.json`) | **L3 for sit → continue** · collapsed / falling / take→place / drink→leave: no real-book blind yet |
| 14 | stale checkout: old engine + rules.md | book started on old code | `book-start.js` from origin, pinned worktree | book-start | MN / TF / AoS worktrees pinned | L3 |
| 15 | **TF: audio/VTT tail — the analyzer and the gate disagree** | see below | — (not fixed) | — | TF 2026-10-30 | **L1 open** |
| 16 | adoption: 10x features eligible but not authored | see the adoption snapshot below | — (authoring) | — | 10 book worktrees, 2026-10-30 | open |

## Case 15 — Trust Fall audio/VTT tail (2026-10-30)

The disagreement:
- **make-book's gate (+2 s) failed.** The original VTT's last cue ended at 36:51.040 and the audio at 2209.007 s (36:49.007), an overhang of 2.03 s.
- **`fix-vtt-tail.js --dry` refused with TAIL_NOT_SILENT.** No silence runs to the end of the file, because the NotebookLM recording is cut tightly after the last word.
- **Every word is timestamped before the audio ends.** The last word, "it.", starts at 2208.72 s. Only the final cue's END overhangs.
- At -30 to -40 dB there is a 0.33 s silence before the end, but the last word's timestamp falls inside it. At -50 dB there is no silence to the end at all.

What the TF agent did:
- It moved the last cue's end by hand to 36:49.000.
- It kept `books/trust-fall/vtt-backup/trust-fall.vtt.orig`.
- It did not use the tool, so there is no `vtt-tail-clamp.json` record and no `.pre-tail-clamp.bak`.
- The value is plausible, but the audit trail is missing and the tool forbids hand edits.

Open, for a later cycle (not done):
- Decide whether a tight-cut recording is acceptable when:
  - every word onset is before the end of the audio;
  - only the trailing cue's end overhangs;
  - the overhang is within the existing limit.
- Make that decision with a fixture built from this case.
- The +2 s gate is not to be changed.
- The TF files are the owner's: report to them, do not edit.

## Agent autonomy: how rows 1–3 reach L3 (Decision 6)

**Tool:** `node scripts/autonomy-audit.js --transcript=<session.jsonl> --slug=<slug>` (`--find=<slug>` lists Claude Code transcripts). It classifies each turn end:
- STOP_ON_CONTINUE: a stop or question while status said CONTINUE.
- WAITING: background work the agent started has not reported back yet.
- CLAIMED_GATE: the question names a real gate. A human confirms these; the verdict is REVIEW, never an automatic PASS.
- AT_GATE: the last status was READY or OPERATOR.

**BEFORE (2026-10-30, all three sessions ran on pins before the fix c923c2c1):**

| session | verdict | stops on CONTINUE | waiting | claimed gates |
|---|---|---|---|---|
| Trust Fall ee54fd6d | FAIL | 4 | 9 | 5 |
| The Art of Strategy 8ea518ed | FAIL | 3 | 23 | 1 |
| The Magician's Nephew 4b519f83 | FAIL | 1 | 44 | 11 |

The "before" stops above are measured. **No book is pinned on post-fix code yet**, so AFTER (L3) is not measured.

Every Step-0 book (Carrie, How to Talk to Anyone, Never Lie, The Most Important Thing) is on 88db7e09, which is pre-fix. A book enters the AFTER measurement only when it starts on, or is re-pinned (`--repin`, the owner's decision) to, a commit that contains c923c2c1.


In the next real video-agent sessions, count every point where the agent stops or asks along this chain:
bible → prep → merge → make-book → seal → blind → preview-ready.

Evidence is the session transcript, plus `preview-state.js status` at each stop:
- **PASS:** no routine stop or question until READY or a real operator gate (cost, data loss, quality debt, render, publish, credentials).
- **FAIL:** a stop or question while status says CONTINUE.

Record the book, harness, stage and quote here. Two real PASS sessions on different harnesses are needed for L3.

## Quality backlog (not regressions; priorities for the next visual cycle)

- **The Art of Strategy: low ADDS and zero EXPLAINS.** Sealed run `final`, 2026-10-30: WRONG 2/30, dead 8/30, ADDS 7/30 (23%), EXPLAINS 0/30, FAIL. Judge notes include "coin conveys money, subject only", "clock conveys time pressure, not the choice mechanism", and a surprised face that contradicts the narration. This is a real-book quality problem found after the fact, and the **top research question for the next visual development cycle**:
  - Why does the picture add so little, and never explain, on a strategy/ideas book?
  - Measure the cause classes on its sealed run before designing anything.
- **Flee:** unchanged. The new parameters (lean, airborne phase, look back, afraid face) are hypotheses. A real moving blind A/B is needed before production.
- **Character continuity:** chains are at L2 (fixtures). A real moving blind test is open (row 13).
- **Motive 1.0:** round 2 failed the independent holdout (NO SHIP, `dev/motive-1` 8cfe4b28). No third round without the operator.
- **Mechanism 4.0:** stays out of production.

## Findings to pass to the book owners (active books; content not touched)

- **MN:**
  - ASR names in the captions (Alen, Jisus, Paulie…);
  - "golden apple" on screen, though the apple is silver;
  - a flat cap drawn instead of a bowler hat;
  - the "DEMURE" label;
  - template text in the thumbnail prompt.
- **TF:**
  - the bible gives the teen characters adult looks;
  - Quinn and the parents are missing from the cast;
  - case 15 above.
- **AoS:** beat 293 (a `place` with `cast: []`); low ADDS and zero EXPLAINS.

## Real-book 10x adoption snapshot (2026-10-30, read-only, all worktrees)

**Shipped 10x features are used on only 9 of 1,276 authored beats in the 4 storyboarded Antidote books.**
- Uses: refute 4 (AoS 255-258); leave 2, flee 1, place 1 (TF); place 1 (AoS 293, dropped by the planner).
- Not used anywhere: scorecard, lift, drink, mechanism, causal chain, ledger.
- Carried state is the only path in wide use. The planner stamps carryState on 117 scenes in Essentialism, 52 in TF and 37 in AoS.

Eligible beats that were missed, and why:
- **Authoring:**
  - AoS b80-81 refute;
  - AoS b217-220 mechanism / ledger (b219-220 authored as "Empty frame");
  - AoS b109-116 flee, drawn as a road icon; the blind read it WRONG ("open road suggests escape");
  - TF b50-52 refute.
- **Authoring on old code:** Essentialism was authored at 24d7186d, which has no 10x commits:
  - b182-190 scorecard (the 90% rule);
  - b77-83 ledger;
  - b122 refute.
- **Pin too old:** Thinking, Fast and Slow (ebc317cc) is already rendered, so no retrofit.
- **Over-adoption:** TF leave (b15, b252) and place (b11) were authored on metaphorical narration. They were not blind-sampled, and a literal deed may misread.
- **Never verified blind on a real book:** TF b140 flee.

The Art of Strategy's low ADDS is mostly **staging density, not a missing renderer** (counts measured, cause inferred):
- 141 of 327 beats have cast [], no concept and no diagram.
- 13 of the 30 sampled stills were frames of that kind; 11 of those 13 read as TEXT_ONLY.
- Its blind run (08:56Z) predates its current config (09:33Z), so the current config is not judged yet.
