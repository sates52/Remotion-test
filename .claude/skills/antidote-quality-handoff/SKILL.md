---
name: antidote-quality-handoff
description: >
  The standard report when an Antidote book's preview (or render) is finished: the three facts kept apart —
  technical (render-facts), quality (firewall BLOCK / REVIEW), decision (operator) — with the preview verdict
  (sealed blind mute test WRONG / dead / ADDS / EXPLAINS) on its own line, plus known quality debt and what the operator must decide for production. Use at
  the end of preview-hazirla, before asking for a production render, and when handing a book to another agent.
---

# Antidote quality hand-off

Sources (this skill only says what to collect and how to present it): `STORYBOARD_RUNBOOK.md` §4 (mute test), §5
(preview), §5b (render modes and the three facts), §8 (hand-off); `docs/AGENT-OPERATING-CONTRACT.md` §6–§7; the
operator report shape in `.claude/skills/preview-hazirla/SKILL.md` §5.

## Collect (change nothing in the storyboard, config or mute test; `preview-ready` only appends to `pipeline-record.json`, `feature-usage` writes under `audit/`)

| fact | read | report |
|---|---|---|
| Readiness | `node scripts/preview-ready.js --slug=<s>` output | READY / NOT READY and every ✗ line |
| Technical | `books/<s>/render-facts.json` (`verify-render-output.js`) | VERIFIED with frames, FAIL with its problems, or NOT_RUN — never inferred from "the render finished" |
| Preview verdict: sealed mute | `books/<s>/mute-test.json`: the fresh sealed run (label `final`) and any later fresh run, kept apart | WRONG n/30, dead n/30, ADDS n/30 (%), EXPLAINS n/30; PASS/FAIL against `data/quality-policy.json` (WRONG ≤ 1/30, dead ≤ 5/30 block; ADDS ≥ 60% target) |
| Quality: firewall | `books/<s>/narrative-visual-firewall*.report.json` | BLOCK n, REVIEW n |
| Advisory | `framecheck.json`, `audit/cause-ledger/<s>/` newest, `node scripts/feature-usage.js --slug=<s>` | report-only lines; never counted as the verdict |
| Decision | `books/<s>/render-decision.json` (accepted debt bound to a config hash) | the operator's, or "operator decision needed" |

## Present (Turkish to the operator; English inside the video and the YouTube pack)

1. The `preview-hazirla` §5 shape (book, preview URL, mute line, gates, for-review, next step).
2. Then the three facts, one line each, never merged: **Teknik** · **Kalite** (firewall) · **Karar** (operator);
   the sealed mute verdict stays on its own line (step 1).
3. Known quality debt: the failed frames from the sealed run (beat, verdict, one-line why) and their cause class if
   the cause-ledger names one; what was fixed after the verdict is listed as unverified, not as a pass.
4. The production decision the operator must make: render as is, render with accepted debt (exact config hash),
   or another fix round (at most the runbook's limit).

## Never

- Write PASS for a fact you did not measure; unknown is `NOT_VERIFIED`.
- Present a re-test of fixed frames as the verdict, or draw a new holdout from an open seal.
- Accept quality debt, upload, publish or clean up on your own — those are operator decisions (cleanup only on an
  explicit command, after upload).
- Claim an improvement in WRONG / dead from a code or rules change before a new book's fresh sealed mute test shows it.
