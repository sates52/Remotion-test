# Sequence lab — explain one idea across several beats (2026-10-19)

Development experiment (not a book verdict: both books' beats were already seen by earlier blind runs).
Windows frozen first (`selection.json`, commit bf24262): fiction burn-of-the-everflame scene-96..104 (~83 s),
non-fiction 15-secrets-successful-people-know-about-time-management scene-73..81 (~70 s; published, sandbox copy only).

## What was done
- Sandbox worktree, same narration, same planner, same renderer for both versions. Baseline re-plan: burn 263/263
  scenes identical to the reference; 15-secrets window identical except one shot and one restored strike (both
  versions went through the same current planner).
- NEW = fresh authors with the sequence method (`inputs/sequence-method.md`, now rules.md "Sequences") and the new
  author-chosen continuation (`"continue": true`, engine/authored-continue be9587a: kept people do not re-enter,
  kept icons do not pop, a kept diagram adds only its new label). Authors saw narration + neighbours, not the old
  window staging and no blind findings. One merge fix: 15-secrets beat 76 callout shortened (`inputs/merge-fixes.txt`).
- Pipeline proof: NEW beats went into the real `authored-K.json` -> `storyboard merge --write` -> `make-book` ->
  config -> render. `inputs/preserve-check.json`: 15-secrets 9/9 authored decisions reached the config; burn 6/9 —
  beats 100-102 authored Diem next to a diagram and the planner dropped her (a diagram fills the frame). Merge now
  refuses a diagram beat with a cast, so this can no longer happen silently. Timings identical; nothing outside the
  windows changed.
- Clips (same audio/timing; 15-secrets is silent with captions because its audio was deleted after upload):
  `C:\Users\savas\Cursor\Remotion\archive\sequence-lab-2026-10-19\clips\<slug>-{OLD,NEW}.mp4` (not in git, 138 MB).
- Blind: one fresh describer per version per book on 18 ordered frames (`strips/`, `reads/`), two independent
  judges per book on the blinded pair (`judging/seqpair-*.json`, X/Y by seeded coin, versions hidden, TIE allowed).

## Result (2 judges each)

| | burn (fiction) OLD -> NEW | 15-secrets (non-fiction) OLD -> NEW |
|---|---|---|
| preferred | **NEW 2/2** | **OLD 2/2** |
| main idea from the pictures | PARTLY -> **YES** (both) | PARTLY -> PARTLY |
| start -> change -> result visible | PARTLY -> **YES** (both) | PARTLY -> PARTLY |
| text carries the explanation | MOST -> SOME | MOST -> MOST |
| wrong beats | 3 -> 1 (j1: 4, j2: 9) | 3 -> 3 / 4 |

## What improved, what did not
- Worked (fiction): keeping ONE person and ONE object (the queen and the flame) and growing ONE diagram (burning
  thrones -> 20 houses alienated -> funding and supply lost, via `continue`). The old version swapped in unrelated
  people every beat (horned man, suited man), which the judges called misleading in beats 2-4.
- Did not work (non-fiction): the new version kept an abstract `target` icon as "the most important task" over
  several beats; blind readers took it as "the inbox-zero goal" every time, so the misread spread. The old version
  already kept one person and had richer faces (shock, anxiety, relief). Rule 5 added to rules.md "Sequences".
- Vocabulary gaps the authors reported honestly (`noVisual`): no bedroom set; no inbox/email count; no blank logo;
  no supply-line/steel/ration icons; Ofus (a god) reads as "a bald armored man". Next capability candidate:
  object STATE that persists and changes across a sequence (a phone with an unread count 52 -> 0, a blank canvas).
## Limits of this evidence (corrected 2026-10-20)
- The judges did NOT watch the clips: they judged descriptions written from 18 frames per version. Motion and
  continuity across a cut (the point of `continue`) are therefore not verified by this test.
- One passage per genre: this does not show that sequences work for fiction and not for non-fiction; it shows that
  keeping one person + growing one diagram helped here, and keeping a misread abstract icon hurt here.
- Restaged authored shots (frozen-book sandbox: `gate-authorship --restore` is report-only) hit DIFFERENT beats in
  the two versions inside the 15-secrets window: OLD scene-77 medium -> closeUp, NEW scene-78 illustration ->
  twoShot (beat 6, one of NEW's wrong beats). So "same pipeline" does not prove the comparison was unaffected.
  Burn: no restaged decision in either version.
- Burn 6/9 preserved is not full preservation: beats 100-102 lost the authored person next to a diagram. Merge now
  refuses that combination, so the loss is no longer silent, but those three beats still need a valid rewrite
  (Burn is parked; not done).
- Test suites: all green except the 3 PRE-EXISTING test-authorship-gate failures (director vocabulary cases:
  lolita/subway refusal, onConceptRefused, allowed concept "car"), failing since before this work.
