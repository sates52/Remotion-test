# Cloud pilot — regression on Actions, CI analyst, cloud mute test (2026-10-30)

MEASURED = from a run on this date; ESTIMATE = from published prices / token counts, no call made.

## 1. Deterministic regression suite (P2.2) — running

`.github/workflows/regression.yml` + `scripts/ci-run-tests.js` + `data/ci-regression.json`.

Triggers:
- `workflow_dispatch` — GitHub lists it once the file is on the default branch, `main`.
- A push to an isolated `ci/regression/**` branch.

What it does not do: model calls, renders, secret use. Its permissions are `contents: read`.

Runs on the same commit (MEASURED):

| | local (Windows 11, 8 CPUs, 4 at a time) | GitHub `ubuntu-latest` (4 vCPU, 4 at a time) |
|---|---|---|
| commit | 5549149a | 5549149a, then 39fb6560 (after 2 Linux fixes) |
| result | 98 pass · 1 FAIL (`test-render-dispatch` hit the 600 s timeout under load) · 5 known baseline | 5549149a: 98 pass · 1 FAIL (`test-preview-state`, POSIX symlink) · 5 baseline; 39fb6560: **100 pass · 0 fail · 5 baseline** |
| suite wall time | **15.5 min** | **69 s** (whole job 1 min 52 s incl. ~45 s dependency + apt setup) |
| CPU Σ / peak RSS | 1106 s / 517 MB committed (single-run profile) | 153 s / 295 MB |
| cost | local CPU / RAM / disk I/O | public repo: **$0** (≈ 2 runner-minutes; $0.006/min on a private repo) |

Linux portability fixes found by the pilot:
- `preview-state unlink` and its test removed a symlink with `rmdir`.
- `npm ci` hit a peer-dependency conflict. The fix was to install only the 5 packages the tests load.

Known baseline failures (fail on clean origin as well, listed in `data/ci-regression.json`):
- `action-clarity`
- `authorship-gate`
- `bible-integrity`
- `p9a-vox`
- `visual-compiler`

**Verdict:** move it. The deterministic suite is about 13× faster in the cloud, free, and removes the local load.

## 2. CI Failure Analyst (P2.3) — hardened, on `main`, NOT run

- Source: `.github/workflows/ci-failure-analyst.md`, compiled with gh-aw v1.0.1 to `.lock.yml`. The lock imports the prompt body from the `.md` at run time (`runtime-import`), so both files live on `main`, where `workflow_dispatch` is listed. They are the only files this pilot puts on `main`.
- Engine: Claude, model **`claude-haiku-5-5`**. Billing is the Anthropic API via the `ANTHROPIC_API_KEY` repository secret. A Claude subscription is not supported by gh-aw.
- **The first key was pasted into an agent chat. Treat it as compromised:** the operator replaces the secret with a new key and revokes the old one in the Anthropic Console. Never run the workflow on the old key.

### Read-only, verified in the compiled lock (2026-10-30)
- **Trigger:** only `workflow_dispatch` (input `run_id`). No schedule, push, `workflow_run` or issue trigger, so it never runs by itself and never re-triggers itself.
- **Permissions:** top level `{}`.
  - activation and agent jobs: `actions: read`, `contents: read`;
  - conclusion: `actions: read`;
  - detection: `contents: read`;
  - **no `: write` anywhere.** The conclusion job's former `issues: write` is gone: no-op, missing-tool and missing-data reports no longer go to tracking issues.
- **GitHub tools:** toolsets `repos, actions` only, with `GITHUB_READ_ONLY=1` and automatic lockdown. There are no issue or PR tools, and `actions_run_trigger` is absent.
- **Safe outputs:** `noop` (the step summary) only, `staged: true`. Disabled: create-issue, the missing-tool / missing-data reports, failed-jobs and failure-as-issue.
- **Threat detection: ON.** The agent reads untrusted log text, and on a public repo its step summary is public. So a separate detection job (Haiku, own cap 5 AIC) checks the agent output for prompt injection and secret leaks before the safe-output step. It runs with `continue-on-error: false` (a finding blocks the output) and `report-as-issue: false` (no tracking issue).
- **Network and shell:** network limited to defaults plus the Claude domains; bash and the CLI proxy are off. Secrets are masked in logs (`GH_AW_SECRET_NAMES`).
- **Pinning:** actions are pinned by SHA and containers by digest.

### Cost limits (1 AIC = $0.01, gh-aw cost docs)
| limit | value | enforced by |
|---|---|---|
| agent, per run | `max-ai-credits: 10` = $0.10 | firewall API proxy, priced with the compiled Haiku table (input $0.10 / output $0.50 per MTok); steering warnings first, then a hard stop |
| threat detection, per run | `max-ai-credits: 5` = $0.05 | same proxy, its own budget (gh-aw default would be 400) |
| this workflow, per 24 h | `max-daily-ai-credits: 200` = $2 (operator line) | activation guardrail; over the limit the agent job is skipped (gh-aw default would be 5000 = $50) |
| all paid AI work, per month | $50 budget: **warn $40, stop new paid AI work at $45**, about $2 / 24 h | `scripts/ai-budget.js` (`data/ai-budget.json`): agents start a paid workflow ONLY through `ai-budget.js dispatch`; direct-API pilots `check --usd` first and `record` after |
| operator stop switch | repository variable `AI_SPEND_PAUSED=true` | the workflow skips its activation job (`if:`), so nothing paid runs |
| turns / time | `max-turns` 20, agent 15 min, detection 10 min | engine / job timeouts |
| concurrency | one slot per analysed `run_id` | Actions |

**First single run:**
- nominal maximum **$0.15** (agent 10 + detection 5 AIC);
- worst case **≈ $0.23**, if the request in flight when a cap is reached completes (at most about $0.04 per Haiku request on each of the two jobs);
- expected about $0.02–0.06;
- runner time is free on this public repo.

The proxy's accounting is gh-aw's estimate. The provider's bill is the truth, so it needs its own limit.


### Monthly counter (operator decision 2026-10-30: $50 / month, warn $40, stop $45, ~$2 / day)
`node scripts/ai-budget.js status` sums two sources:
1. The paid gh-aw workflows: this month's runs and each run's `usage` artifact (AIC, or tokens × the Haiku price). A run whose usage cannot be read counts at its per-run maximum ($0.15).
2. The ledger `audit/ai-spend/<YYYY-MM>.jsonl`, which direct-API pilots append to with `record`.

What it does:
- `dispatch` refuses at STOP (month + this job > $45), at STOP_DAILY (> $2 / 24 h), and at UNKNOWN (the run list cannot be read).
- A refusal stops only the paid job. Everything else continues.

Limits of the counter:
- **It is an estimate.** The Anthropic provider bill is the truth.
- A hard monthly limit could not be set in the Console (2026-10-30). The operator's options:
  - a prepaid credit balance with auto-reload OFF;
  - a workspace spend limit, when a non-Default workspace and an org admin / billing role are available.
- `gh aw logs` needs a newer `gh` than this PC has (2.24), so the counter reads the GitHub REST API directly.

### Anthropic Console (operator)
1. Create a separate **workspace** for CI (e.g. `ci-analyst`), and create the new key inside it.
2. Give that workspace a **monthly spend limit** of about $5 (a month of the daily cap is about $9.30), plus an email notification at about 50%.
3. Revoke the old key.

### Steps before the first paid run
1. The operator stores the NEW key: `gh secret set ANTHROPIC_API_KEY --repo sates52/Remotion-test`. The command prompts for the value; it never goes into a file, an argument or a log.
2. The operator approves the first run separately.
3. Run once: `gh workflow run ci-failure-analyst.lock.yml --repo sates52/Remotion-test -f run_id=<a failed run>`.
4. Measure the run's cost with `gh aw audit <run-id>` and reconcile it with the Console.

## 3. Cloud blind mute test (P2.4) — offline proof of concept

`scripts/lib/mute-manifest.js` and `scripts/mute-cloud-poc.js` build and verify the **immutable input manifest** of a sealed run. It records:
- engine commit and pin;
- config bytes and render input;
- the seal, with its ids hash re-verified;
- the sample ids;
- each blind frame's sha256;
- the frame key's sha256 (kept on the judge side);
- the describer prompt hash, with a narration-leak check;
- the judge input hash.

Two bundles travel:
- **Describer:** frames plus the prompt only. Never the narration, the key or judge files.
- **Judge:** text only, with no images.

Real case, read-only (MEASURED): the-magician-s-nephew run5.
- engine 086a0941 = pin.
- Stills come from the current config (889a18f8 / render input dc2bd5a7).
- Seal verified, 30 frames, 71.6 MB.
- No narration leak; the judge gets 0 images.
- `verify` OK; manifest 3e6e8a89.
- 60 calls per run.

ESTIMATE per run (30 frames, describer + judge):

| model | cost |
|---|---|
| Claude Sonnet 5.5 | ≈ $0.97 (Batch API ≈ half) |
| Claude Haiku 5.5 | ≈ $0.05 |
| NVIDIA NIM VLM (llama-3.2-11b-vision / nemotron VL) | $0 on the developer tier, ≥ 2 min at ~40 RPM — prototyping only; production use needs an AI Enterprise license |

Before a real call:
1. Downscale the frames to about 1092 px (≈ −40 % image tokens, smaller artifacts).
2. Get the operator's budget and secrets.
3. Run the cloud describer and judge as two separate jobs on the same manifest, with the thresholds in `data/quality-policy.json` unchanged.
4. Compare with the local sealed verdict of the same run (agreement on WRONG / DEAD / ADDS / EXPLAINS) before relying on it.

Not done: no model, no NIM and no paid call was made.

## 4. What stays local (P2.5)

| Stage | Where it runs | Why |
|---|---|---|
| Storyboard authoring, merge, readcheck, the agent loop | Local | Interactive and agent-driven |
| Mute sample rendering (stills) | Local (moves later) | Needs the bundle and Chrome; a cloud run needs the same per-render bundle the render pool uses |
| Full video render, cloud assembly | Already cloud | The render pool |
| Deterministic regression | **Cloud** | See section 1 |
