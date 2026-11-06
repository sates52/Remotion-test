# C16 — production-pipeline friction audit (read-only)

Checkout: `wt-cloud-stills` @ ba9fb94c (c15 = god-mode). Nothing edited, nothing rendered, no book worktree touched.
Tests run: `test-operator-approvals.js` 45/45 pass; `test-book-start.js` "all passed" (one earlier run printed
`✗ D. PRODUCTION_ALLOW_MAIN lets it start, recorded`, the rerun passed — possible flake, NOT investigated).

## 1. Word-count minimums on operator approvals / reasons

| Where | Rule | Guards | Class |
|---|---|---|---|
| `scripts/lib/operator-approvals.js:33,82` (`preview-state.js approve`, `:688-704`) | `--words` ≥ 6 words, every scope | fixRounds / images (capped by maxCalls) / **engineKeep** / technicalFix | **(b) friction** — the "Keep Antidote" refusal (2 words) |
| `scripts/lib/local-load-guard.js:20,27-28` | `--operator-local` ≥ 6 words | > 12 stills on this PC | (a) local heavy work |
| `scripts/lib/remotion-cli-guard.js:32,117` | `REMOTION_LOCAL_PRODUCTION_APPROVED` ≥ 6 words | full/chunk local render via shared CLI | (a) local production render |
| `scripts/lib/render-entry-guard.js:20,58` | `--operator-local-production` ≥ 6 words | local production render | (a) |
| `render-preflight.js:370` (`--authorize-render`), `render.js:294` (`--accept-quality-debt`), `render-github-assemble.js:52`, `maintenance-upgrade.js:83`, `mute-test.js:595,600`, `production-guard.js:87-88` (`PRODUCTION_ALLOW_*`), `book-start.js --repin/--adopt` | non-empty only | render / debt / local join / pin move / supersede / gate override | (a), no word count — fine |
| `make-prompt.js:212` `--engine-why` ≥ 40 chars | agent's own override rationale at Step 0 (not an operator approval) | Step 0 rubric override | agent-authored; leave |

Docs repeat the rule: `.claude/skills/preview-hazirla/SKILL.md:142` "(at least 6 words)".
**Status: NOT solved.** A word count cannot prove the words are the operator's (an agent can pad); it only refuses
short real answers. The scope list already refuses every real safety scope (`operator-approvals.js:32,79`), and
`limitsProblem` (`:67-74`) already forces the structured part (max rounds, beats + call cap, conditions, files).
**Fix (smallest):** `operator-approvals.js` `MIN_WORDS = 1` (non-empty, trimmed); keep "verbatim" in the message;
skill line 142: drop "(at least 6 words)". Test: `test-operator-approvals.js:50-51` → `"Keep Antidote"` records
engineKeep (exit 0) + `--words=""` refused. Leave the three (a) guards at 6.

## 2. Engine re-asked after Step 0

- `storyboard.js:803-835` (prep) recomputes `analyzeEngineFromVtt` every run and rewrites `book.engineCheck`;
  `confirmed = --confirm-engine || latest engineKeep approval` (`:814-815`). The previous `engineCheck.confirmed` is
  NOT carried over: a prep without the flag and without an approval record resets it and asks again (`:821-833`).
- `preview-state.js:130-138` stops `ENGINE_CONTRADICTION` unless `ec.confirmed` or a matching engineKeep; `:133`
  appends `--confirm-engine` to the next prep command when confirmed (chain holds only if agents use status' command).
- `make-book.js:113-127`, `make-prompt.js:174`: warnings only.
**Partly solved:** c1af8400 + 918ce8b4 (2026-11-03; AGENT_LOG "Cycle 8 … operator approvals", ~line 2449;
`test-operator-approvals.js` "engineKeep recorded …", "--scope=engine-confirm without --limits records engineKeep").
**Remaining:** (a) the 6-word rule (item 1) refuses recording "Keep Antidote" at all; (b) every approval is bound to
`productionBase` (`operator-approvals.js:46-58,108-118`), so any pin move — even an operator-approved
`maintenance-upgrade.js`, which by definition keeps the render input — makes engineKeep stale and re-asks (asserted as
intended: `test-operator-approvals.js:107`). Keeping the engine is about the recording, not the code.
**Fix:** in `matching()` compare only `engine, audioSha256, vttSha256` for scope `engineKeep` (pin still binds the
other scopes). Test: split `:107` — after the pin move engineKeep still matches (no ENGINE_CONTRADICTION), fixRounds
is stale. (Carrying `engineCheck.confirmed` across preps would need a VTT hash in engineCheck — not proposed.)

## 3. node_modules/.bin missing in a book worktree

Mechanism: `preview-state.js worktree` makes `wt-book-<slug>/node_modules` a **junction** to the main checkout's
(`:647-651`; worktree LOCKED so `git worktree remove --force` cannot empty main). `nodeModulesHealth()` (`:77-87`):
missing / real / broken / ok — **broken includes "main node_modules has no `.bin`"** (`:84-85`). Status (`:190-196`):
missing → agent `go` (`worktree` repair branch `:625-631`); broken → `stop NODE_MODULES_BROKEN` "the operator checks
the main checkout" — handed to the operator. Tests: `test-preview-state.js:291-312`.
**Live finding (verified 2026-11-06):** `C:/Users/savas/Cursor/Remotion/test/node_modules` exists (353 entries,
mtime 2026-11-06 10:30) but has **no `.bin`** and no `.package-lock.json`; AGENT_LOG ~line 1106 recorded "87/.bin, 359
entries". So every book worktree's status now stops NODE_MODULES_BROKEN, and `npx remotion` (render.js ×4, make-book
×2, pipeline ×2, preview-thumbnail ×2, render-thumbnails, lib/thumb-render, auto-chain) has no local bin. Cause of the
deletion: NOT determined.
Gaps: (i) `book-start.js` RESUME (`:174-212`) never checks/repairs the link; (ii) the repair branch (`:627`) recreates
only an ABSENT link — a wrong-target junction is not re-pointed; (iii) a `real` node_modules falls through to
"done … node_modules → main, locked" (`:196`, mislabel); (iv) no `.bin` self-heal exists anywhere.
**NOT solved.** Smallest safe change:
- `scripts/lib/bin-heal.js`: for each package in `<main>/node_modules` (incl. `@scope/*`) read `package.json.bin` and
  create only MISSING `.bin/<name>`, `<name>.cmd`, `<name>.ps1` shims (npm cmd-shim format). Additive: never deletes or
  overwrites, never touches a package, never runs npm install / scripts. Refuse when `@remotion/cli/package.json` is
  missing (a real broken install → operator, as now).
- Call it from `preview-state.js worktree` (both branches) and from status when the only fault is "no .bin"; re-point
  a wrong-target junction (link-only removal exactly as `unlink`, `:673-683`) when main's node_modules is healthy;
  book-start RESUME runs the WT's `preview-state.js worktree --slug` (the non-destructive repair) before printing.
- Test (`test-preview-state.js` after `:312`): main has `pkg/package.json {bin}` and no `.bin` → `worktree` heals →
  `code done`, SENTINEL intact, nothing removed; wrong-target junction → re-pointed; no `@remotion/cli` → still
  NODE_MODULES_BROKEN. (`npm rebuild --ignore-scripts` in main as the heal: bin-only behaviour NOT verified, and it
  runs npm on the shared tree — not recommended.)

## 4. Running books restarted unnecessarily

- book-start resumes an existing pinned worktree, never recreates it (`book-start.js:174-212`); a book started
  elsewhere is refused (`:216-230`); the pin is kept when origin moves. Solved (`test-book-start.js`).
- Render / assembly / mute prep / mute-reliability: pid locks (`lib/run-lock.js`, 2026-10-26 "ONE RUN PER BOOK";
  render.js:356,382; render-deliver.js:133; cloud-assemble:133; mute-test.js:144-155) + `renderInFlight`. Solved
  (`test-run-lock.js`).
- **make-book is NOT covered:** it writes `{status:"running", startedAt}` with no pid/host (`make-book.js:148`,
  `lib/make-book-marker.js:29-34`) and takes no run lock. `verify()` (`make-book-marker.js:46`) reports "running" as
  "did not finish (a blocking step failed or it crashed)" and `preview-state.js:347-349` hands out the make-book
  command again — a second session restarts a make-book that is still running (by reading; not reproduced).
  **Fix:** `markStarted` records `pid, host`; make-book takes `takeRunLock(books/<slug>/.make-book-lock.json)`;
  `verify` returns `inFlight:true` when that pid is alive on this host; status → stage `makeBook running`, next =
  "wait, do not restart" (no command). Test: test-preview-state with a marker holding `process.pid` → no make-book
  command; dead pid → "did not finish" as today.

## 5. Routine quality fixes asking again

- `MAX_FIX_ROUNDS = 2` (`preview-state.js:43`, runbook §4, operator decision — keep) is raised by a matching fixRounds
  approval (`:427-429,458`); Vox images: approval + `approval-use` call ledger (`:350-357`). Solved within one attempt
  (c1af8400; `test-operator-approvals.js` "recorded 4, 2 rounds used -> CONTINUE, limit 4").
- Remaining: the 6-word rule (item 1); approvals expire on a pin move (item 2b — defensible for fixRounds, keep);
  `technicalFix` is recorded but read by NO gate (only `describe`, `operator-approvals.js:135`), so it never clears a
  stop. Say "record-only" in `preview-hazirla/SKILL.md:140-147`; which stop it was meant to clear: NOT verified.

## Summary
Solved: book-start resume, render/assembly/mute single-run locks, fix-round + image approvals within one attempt, engine
keep via a recorded approval. Needs change: (1) MIN_WORDS 6 → non-empty for routine scopes; (2) engineKeep not bound to
the pin; (3) additive `.bin` self-heal + RESUME link repair (main node_modules has no `.bin` RIGHT NOW); (4) make-book
pid marker + run lock. Highest value: (3) (live, stops every book) and (1) (the exact refusal the operator saw).
