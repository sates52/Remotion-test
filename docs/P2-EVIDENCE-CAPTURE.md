# P2 Evidence Capture — Reusable Audit Infrastructure (Gate P2.2)

**Status:** operational behind a flag, default **OFF** · **Part of the semantic gate:** NO · **Baseline:** `1d96c9d` freeze + `73f0fa4` Gate P2.2

## What it is

A thin, strictly observational evidence-capture capability for blind
production audits (currently P2.2, per
[BOOK-TO-VISUAL-COMPILER-ROADMAP.md](BOOK-TO-VISUAL-COMPILER-ROADMAP.md)
Gate P2.2). When enabled, it preserves a small, reproducible sample of real
production **Gate-PASS** scenes with their rendered frame, so blind analysis
needs no manual file copying before cleanup. It changes nothing about how
videos are produced.

## What it is NOT

- Not part of the semantic gate. Gate logic, thresholds, HC1–HC10, scene
  selection and render timing are untouched.
- No Vision/LLM calls — production dependency stays **0**. The blind
  evaluation happens OUTSIDE production, on the captured package.
- Not cleanup suppression. It makes its own durable copies under `out/`
  (gitignored); normal cleanup continues to run.
- Never blocks: a capture failure is logged and the render proceeds. A
  successful production render never fails because of the audit layer.

## Enable / configure

```bash
# OFF by default. Enable for one render:
P2_EVIDENCE_CAPTURE=1 node scripts/render.js --slug=<slug> ...

# Optional knobs
P2_EVIDENCE_SAMPLE_SIZE=25    # PASS scenes to capture (default 25, min 1)
P2_EVIDENCE_SEED=42           # optional; deterministic shuffle selection
P2_EVIDENCE_TAG=p2.2-run1     # free-form tag stored in the manifest
```

## Where evidence is written

```
out/p2-blind-evidence/<slug>/<run>/
  manifest.json
  blind/sample-NNN/frame.png       ← the ONLY surface a blind evaluator sees
  metadata/sample-NNN/scene.json            (verbatim from config.antidote.json)
                            visual-intent.json
                            visual-contract.json
                            gate.json        (scene gate outcome + diagnostics)
```

No second data schema: `scene.json`, `visual-intent.json` and
`visual-contract.json` are verbatim copies of the existing pipeline artifacts
for the sampled scene. The manifest records mode, tag/checkpoint, timestamp,
slug, sample size, seed, eligible-PASS count, captured count and per-sample
paths (`blind` / `metadata`) for exact reconstruction. Frames are extracted
from the final `out/<slug>.mp4` at each scene's midpoint (ffmpeg, lossless
PNG). No secrets, keys or credentials are ever written into the package.

## Blind workflow

Hand evaluators only `blind/sample-NNN/frame.png` (no gate result, no intent,
no contract, no expected answer). Score GOOD / WRONG / UNCERTAIN with the
rater model always recorded (see `scripts/mute-reliability.js` discipline).
Reconcile against `metadata/` and the manifest afterwards. The headline P2.2
metric is **Gate PASS + Vision WRONG** — the false-accept rate on unseen
production scenes.

## Selection

Only scenes that reached **Gate = PASS** are eligible (hard-violation scene
IDs from `narrative-visual-firewall.report.json` are excluded;
diagnostic-only scenes stay eligible; contract-less scenes are skipped).
Default selection is the same even stratified spread the P1.1 audit uses;
with `P2_EVIDENCE_SEED` a Fisher–Yates shuffle makes the sample exactly
reproducible.

## Lifecycle

The capability stays in the repository; **active use is temporary**. During
P2.2: flag ON for sampled renders. After P2.2: flag OFF, evidence archived or
deleted as the operator decides (no automatic deletion exists). The same
switch can arm future audits (P2.3 / P3 / P4) without new pipeline code.

## Tests

`node scripts/test-p2-evidence-capture.js` — 31 assertions across the
operator-locked groups: disabled mode (no directory, normal behavior),
enabled mode (package + manifest + per-scene artifacts), REJECT exclusion,
cleanup survival, capture-failure non-blocking, deterministic sampling.
