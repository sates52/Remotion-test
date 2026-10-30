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

## 2. CI Failure Analyst (P2.3) — Haiku 5.5, waiting for the secret and `main`

- Source: `.github/workflows/ci-failure-analyst.md`, compiled with gh-aw v1.0.1 to `.lock.yml`.
- Engine: Claude, model **`claude-haiku-5-5`** (operator decision 2026-10-30; was `claude-sonnet-5-5`). The operator's API key was checked with the free `GET /v1/models` call: valid, and `claude-haiku-5-5` is listed. Billing is the Anthropic API via the `ANTHROPIC_API_KEY` secret. A Claude subscription is not supported by gh-aw.

Read-only by construction (verified in the lock):
- **GitHub tools:** read-only only (`actions_get`, `actions_list`, `get_job_logs`, …). `actions_run_trigger` is absent.
- **Safe outputs:** only `noop` (the step summary) and `report_*`.
- **Disabled:** `create-issue`, `report-failed-jobs`, failure-as-issue and threat detection. `staged: true`.
- **Network and shell:** network limited to defaults plus the Claude domains; bash and the CLI proxy are off.
- **Pinning:** actions are pinned by SHA and containers by digest.
- **Limits:** `max-turns` 20, 15 min, `max-ai-credits` **10** (≈ $0.10 per run; gh-aw prices it with the compiled Haiku table, input $0.10 / output $0.50 per MTok). Concurrency: one slot per analysed `run_id`.

To enable (the operator's steps):
1. Put the workflow on `main`, where `workflow_dispatch` lives.
2. Add the key: `gh secret set ANTHROPIC_API_KEY --repo sates52/Remotion-test`, typed by the operator, from an account with admin rights on the repo. The local `gh` login (`koplatform`) gets HTTP 403 on repository secrets.
3. Budget: approved by choosing Haiku 5.5 with the 10-credit cap above.

ESTIMATE per run reading 1–3 failed logs:
- **Haiku 5.5 (configured):** about $0.02–0.06, capped at $0.10.
- Sonnet 5.5 (for comparison only): about $0.40–0.80.
- Runner time: about 5–8 min (free on this public repo).

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
