# Vox image-generation audit (c15, 2026-11-05, read-only)

Checkout: wt-cloud-stills @ 45cc3d33. No image API was called and no key was read or printed. Paths are repo-relative.
Not legal advice: part 4 quotes the terms literally.

## 1. Models, endpoints, parameters
- **Images:** FLUX.2 [klein] 4B via NVIDIA's hosted API,
  `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b` (scripts/gen-vox-images.py:92; same URL in
  gen-thumbnail.py:35, generate_chapter_assets.py:21, gen_sample_images.py:14).
- **Beat request:** `{"prompt": p + NO_TEXT_SUFFIX, "width":1024, "height":1024, "steps":4}` (gen-vox-images.py:207).
  **No seed and no cfg/guidance are sent.** API docs: seed default 0 = random, cfg_scale fixed 0, steps max 4,
  "Only width=1024 is supported", response = base64 JPEG + finishReason SUCCESS|ERROR|CONTENT_FILTERED
  (https://docs.api.nvidia.com/nim/reference/black-forest-labs-flux_2-klein-4b-infer). Thumbnails send 1344x768
  (gen-thumbnail.py:160,:283): UNVERIFIED whether the server honours it.
- **Prompt wrapper:** `cinematic editorial still: {subject}. {iso}{palette}, shallow depth of field, no text…, 8k`
  (scripts/plan-vox.js:639-647). `iso` is the studio background used for cutouts; `palette` is per slug or genre.
  The no-text phrase is appended a second time at gen-vox-images.py:95/207.
- **Cutouts:** made locally with rembg/u2net (scripts/cutout.py:23-24). No API call.
- **LLM step:** `meta/llama-3.3-70b-instruct` at `https://integrate.api.nvidia.com/v1/chat/completions`
  (scripts/lib/llm.js:20,22). It is DORMANT: it runs only with `USE_NVIDIA=1` and a key (llm.js:30-32).
  Creative authoring is done by Claude agents by default.

## 2. What is free
- **No credit model any more.** NVIDIA staff 2025-09-10: "We no longer use a credit-based system for
  build.nvidia.com" (now rate-limited); 2025-09-17: "The trial period is not limited by a time period"
  (https://forums.developer.nvidia.com/t/request-more-4-000-credits-option-on-build-nvidia-com/344567). The Trial
  ToS §1.4 still mentions "Credits". **The code assumes no credits**; it only counts calls (`--max-calls`, :46-51,201).
- The repo records Flux images as $0 on the free trial (docs/cloud-pilot-2026-10-30.md:151,178;
  audit/ai-spend/2026-10.jsonl).
- **So it is free in money, but under trial terms (see §4).**
- Images per book (AGENT_LOG.md): In Cold Blood 185 image beats, 118 OK (:2017); The Crucible 165/168 (:1156);
  The Fourth Turning 264 (:2212); Sapiens 255 (:4373); All the Light 106 produced, ≈23 % filtered (:4799); Hamnet
  58 of 221 filtered (gen-vox-images.py:9). **Typical: about 110–265 images per 25–50 min book.**

## 3. Quotas, rate limits, retries, filtering
- **Pacing:** strictly sequential; ≤ 3 attempts per image, 120 s timeout (gen-vox-images.py:200,212), backoff
  `8*attempt` s (:228), 3 s between images (:246). No 429-specific handling (a 429 is just a failed attempt).
- **Rate limits are unpublished** ("The rate limits vary for each model, and we do not publish those", forum above).
  The repo's "~40 RPM" is the NIM VLM, not Flux (docs/cloud-pilot-2026-10-30.md:134). AGENT_LOG's 429s are rater /
  agent caps (:4020, :4076, :4149); no Flux 429 is recorded.
- **Failure memory:** a failed prompt is stored by sha256 and not retried unless it changes, `--beats` names it, or
  `--retry-failed` is passed (:118-139). After 2 CONTENT_FILTERED results, the 3rd attempt uses the `_SOFTEN`
  reworded prompt (:161-187, :204).
  - This fixes the AGENT_LOG.md:2228-2231 bug, where every attempt was softened.
- **CONTENT_FILTERED rates:** ≈36 % on true crime (AGENT_LOG.md:2010,2020), ≈23 % on WWII (:4799, :4944),
  58/221 ≈ 26 % on Hamnet.
  - It also hits harmless prompts: a loaf of rye bread, a typewriter, an empty stage (:1177).
  - Single words like "London" and "brick house" were refused deterministically (:3975).
- **A failed image is silently dropped from the config** ("reconciled", :248-268), so the beat renders as text only.
- **Prompt length:** AGENT_LOG reports HTTP 422 over 800 characters, which hit 24/168 images on The Crucible
  (:1171-1175). The API docs say prompt max 10,000. The two conflict; the 800 figure is the measured one. UNVERIFIED
  which limit applies now.

## 4. Commercial-use terms (literal)
- **The model licence is permissive.** FLUX.2 [klein] 4B and 4B Base are "apache-2.0". [klein] 9B and FLUX.2 [dev]
  are "FLUX Non-Commercial License" (https://github.com/black-forest-labs/flux2/wiki).
  - The wiki says BFL embeds invisible watermarks.
  - It does not state who owns the outputs.
  - UNVERIFIED whether NVIDIA's hosted output carries the watermark.
- **The access path is restrictive.** NVIDIA API Trial Terms of Service, v. 2025-09-19
  (https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf):
  - §1.2: access "for limited trial purposes only and without use of the API Service or Generated Content in
    production."
  - §1.4: "You must have a separate service subscription … to use the API Service in production … Unless you
    purchase a Subscription … you may only use the API Service for internal testing and evaluation purposes, not in
    production."
  - §4.2: "Except as indicated in the Section 1.2 … you may not copy, sell, rent, sublicense, transfer or distribute
    or make available to others any portion of the API Service or Generated Content."
  - §3.3: NVIDIA may use User Content and Generated Content to improve its products.
- **Verdict for a monetised YouTube channel:**
  - The Apache-2.0 model licence does not forbid commercial use.
  - But the images come through the **free trial**, whose terms literally exclude production use and distribution
    of Generated Content. Publishing them in monetised videos is outside those terms.
  - The repo already flagged this as the operator's decision (docs/cloud-pilot-2026-10-30.md:173-178;
    AGENT_LOG.md:2575).
  - Compliant routes:
    - an NVIDIA Subscription or AI Enterprise licence (staff: production needs AI Enterprise, forum above);
    - another host for the same Apache-2.0 4B weights under its own commercial terms (UNVERIFIED per provider);
    - self-hosting the weights, which needs a GPU (UNVERIFIED on this PC).
  - Do not switch to klein 9B or [dev] (non-commercial).

## 5. Character, scene and style consistency
- **No pixel-level consistency:** no seed (random each call, :207), no reference image / editing (the API's `image`
  input is a preview with preset example ids only, API docs), no LoRA.
- **Consistency is text only:** the bible `look` is reused verbatim in every `image.subject`
  (STORYBOARD_RUNBOOK.md:380-383); authored briefs are fingerprint-matched "so it names the person by the same
  `look`" (plan-vox.js:49-52, :922-929); per-slug/genre palette string (plan-vox.js:639-643); `gate-continuity`
  checks one look per cast member in text, not pixels (STORYBOARD_RUNBOOK.md:18); cutouts on a shared paper
  background unify style (cutout.py; SKILL.md:302).
- **Documented problems:**
  - Verbatim looks pushed prompts over the 800-character limit, so authored images were dropped (AGENT_LOG.md:1171).
  - Content-filter fixes rewrite the character itself: "seventeen-year-old girl" became "young woman" (:1156), and
    `_SOFTEN` replaces girl/boy/soldier/gun (:161-180).
  - WRONG frames from photoreal depictions of real people: John Brown and Lincoln (:2216-2218); a smiling Diana under
    tragic narration (:3978).
  - Image coverage was too low for the mute test: 87/249 beats (:4945).
  - The cut-out opacity gate exists only on a branch (AGENT_LOG.md:291).

## 6. Other costs per Vox scene
- **Render:** worker repos are public, so Actions minutes cost $0; limits 6 h/job, ~20 concurrent jobs/account
  (AGENT_LOG.md:6801-6806, :5357). Measured: 4,226 frames in 7 m 54 s on 2 workers + ~2 min cloud assembly
  (:812-814). One 8–10 s scene is a few runner-minutes, mostly start-up (per-scene timing UNVERIFIED).
- **Agent tokens:** storyboard / art direction are Claude agents; interactive sessions are not in any ledger
  (`data/ai-budget.json`, $500/month, covers only gh-aw workflows + visual-ab). Per-scene cost UNVERIFIED.
- **Wall time:** Flux ≈ 3–30 s per image (sleeps + latency, UNVERIFIED); local still budget ≤ 12
  (scripts/lib/local-load-guard.js:19), heavier work goes to `stills-cloud.js`.
- **Hidden cost:** filtered / over-length images silently become text-only beats, lowering ADDS (AGENT_LOG.md:2018).

## 7. One scene in isolation: possible with existing tools
Trial candidate: `books/east-of-eden`. It is not published, it is in the registry (src/books.generated.ts), and
beat-004 is an imagefocus beat at frames 1061-1319. `public/scenes/east-of-eden/` is empty in this checkout.
Run it in a scratch worktree, because the script writes `images.report.json` and may rewrite the config.

1. **Plan the image call (no call):**
   `python scripts/gen-vox-images.py books/east-of-eden/config.vox.json --beats=beat-004 --max-calls=1 --dry-run`
2. **Generate it:** the same command without `--dry-run`. That is 1 Flux call; under §1.2 this counts as evaluation.
3. **Render it:**
   - Silent, in the cloud: a `stills/1` manifest with `composition: "Vox-east-of-eden"`, a 1-beat config slice
     (copy the `one()` helper in dev/c10:audit/c10-pilots/render-spikes.js), `frames:[…]` or
     `clip:{from:0,to:258}`, and `extra:["public/scenes/east-of-eden/beat-004.png"]`. Then run
     `node scripts/stills-cloud.js push --manifest=… --tag=c15-vox1` and `fetch`
     (scripts/render-stills.js:9-21; stills-cloud.js:7-16).
   - With audio, locally: `node scripts/render.js --slug=east-of-eden --method=local --frames=1061-1319`. This is
     allowed up to 1,800 frames (LOCAL_RENDER_RULES.md:69) and needs `public/audio/east-of-eden.m4a` on disk.
- **Smallest safe trial:** steps 1+2 for one beat (two: `--beats=a,b --max-calls=2`), then 3 silent cloud stills.

## 8. Hybrid Antidote + Vox: a spike exists, production has nothing
- **Production:** each book is either `Vox-<slug>` or `Antidote-<slug>` (src/Root.tsx:31,81); render.js, the
  bundle and the gates take one engine config per slug; no schema field mixes engines.
- **Spike on `dev/c10`** (not production; 17596e44): `src/spikes/Cycle10Spikes.tsx` `SpikeHybrid` nests
  `<AntidoteBook>`, `<AntidoteBook>`, `<VoxBook>` in consecutive `<Sequence>`s; `scripts/lib/scene-router.js` routes
  each beat to an engine (~70 % abstract, ~5 % concrete action; routes in audit/c10-pilots/world-ab-strips/
  hybrid-routes.json). Rendered as stills only: "render is fine" (AGENT_LOG.md:210-212).
- **Gaps:** both engines mount `<Audio src=meta.audio>` from their own frame 0 (antidote/index.tsx:43;
  vox/index.tsx), so a sliced scene plays the start of the book: audio + captions need one top-level track. Both use
  absolute `fromFrame`. Render, bundle, firewall / authorship gates and books.generated assume one engine per slug.
- **Minimal integration point:** a `Hybrid-<slug>` composition that takes an ordered list of
  `{engine, sceneConfig (fromFrame rebased to 0), from}`. It plays one narration `<Audio>` and captions at the top,
  passes `meta.audio:null` to each engine, and lets render.js and render-bundle accept a `config.hybrid.json` that
  ships the Vox images.
