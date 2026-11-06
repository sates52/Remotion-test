# Vox image providers: inventory and options (c16, 2026-11-06, research only)

No image API called, no key read/printed, only this file written; follows audit/c15/vox-audit.md. Fact-finding, not
legal advice. Web pages read 2026-11-06; "UNVERIFIED" = not confirmed on an official page.

## 1. Inventory: what generated the images of published Vox books

### 1.1 Code history (one provider, one model, one endpoint throughout)
- **Endpoint at every revision found:** `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b`,
  payload `{prompt, width:1024, height:1024, steps:4}`, no seed. **Git coverage starts 2026-09-16.** `scripts/gen-vox-images.py` first appears in `f3bc2f24` ("restore render
  pipeline scripts … from worker remote"). The oldest render-bundle snapshots, e.g. `1486ce70` and `041ef433`
  (dated 2000-01-01 by design), carry the same URL at :22.
- **Later commits changed only control logic** (`e5266482` 09-25, `dbf57296` 10-27, `5828c8cc` 10-29, `81a6c250` 11-03).
- **Before 2026-09-16 the evidence is notes, not code.** The operator memory note `remotion-vox-migration.md`
  (2026-08-08 update) and SKILL.md:75-77 both say "NVIDIA's hosted Flux.2-klein-4b".
- **No other image provider appears.** `git grep` on HEAD scripts/SKILL/AGENT_LOG finds no FLUX.1 / schnell / dev,
  SDXL, DALL-E, Imagen, Replicate, fal or Together.
- **Same endpoint, other scripts:** `gen-thumbnail.py` (added 2026-09-16, `f6f2d8b1`), `generate_chapter_assets.py`,
  `gen_sample_images.py`. Since 2026-09-24 Antidote thumbnails are scene-stills (Flux only with `--flux-thumb`,
  make-book.js:285-289); Vox thumbnails are a Flux hero.
- **Access tier:** the free trial, recorded as "$0, free-trial calls" (AGENT_LOG.md:2583;
  docs/cloud-pilot-2026-10-30.md:151,178). No paid NVIDIA subscription is mentioned anywhere in the repo.

### 1.2 Published Vox books (all: NVIDIA-hosted FLUX.2 [klein] 4B, trial access, per the history above)

| Slug | Published | Source of engine fact | Flux images (where recorded) |
|---|---|---|---|
| single-dad-dilemma | 2026-09-02 | PUBLISHED_BOOKS row 3; `books/…/config.vox.json` | UNKNOWN |
| the-iliad | 2026-09-03 | PUBLISHED_BOOKS:184 | UNKNOWN |
| educated | 2026-09-04 | PUBLISHED_BOOKS:132 | UNKNOWN |
| atonement, im-thinking-of-ending-things | 2026-09-07 | memory notes only (absent from PUBLISHED_BOOKS) | UNKNOWN |
| the-handmaids-tale | 2026-09-08 | memory notes only (absent from PUBLISHED_BOOKS) | UNKNOWN |
| all-the-light-we-cannot-see | 2026-09-28 | PUBLISHED_BOOKS:496 | 213 (memory) |
| sapiens | 2026-09-29 | PUBLISHED_BOOKS:841-850 | 255 |
| frederick-douglass-prophet-of-freedom | 2026-09-30 | PUBLISHED_BOOKS:890 | UNKNOWN |
| spare | 2026-10-02 | PUBLISHED_BOOKS:1033, 1080 | 229 |
| the-fourth-turning | 2026-10-02 | PUBLISHED_BOOKS:1114, 1134 | 261 |
| into-the-wild | 2026-10-06 | PUBLISHED_BOOKS:1209 | UNKNOWN |
| in-cold-blood | 2026-10-08 (memory) | PUBLISHED_BOOKS:1235 | 118 of 185 (AGENT_LOG:2017) |
| the-count-of-monte-cristo | 2026-10-14 | PUBLISHED_BOOKS row 43 | UNKNOWN |
| the-adventures-of-tom-sawyer | 2026-10-15 | PUBLISHED_BOOKS row 46 | UNKNOWN |
| a-civil-action | 2026-10-17 | PUBLISHED_BOOKS:1285 | UNKNOWN |
| the-crucible | 2026-10-23 | PUBLISHED_BOOKS:89 | 165 of 168 (AGENT_LOG:1163) |
| do-not-say-we-have-nothing | 2026-10-26 | PUBLISHED_BOOKS:104 | UNKNOWN |
| their-eyes-were-watching-god | 2026-10-27 | PUBLISHED_BOOKS:1384 | UNKNOWN |

### 1.3 Unknowns
- **Project Hail Mary (2026-08-28):** the engine is unrecorded and `books/project-hail-mary/` does not exist.
- **No per-image provenance survives:** `images.report.json` (no model field) exists only since 10-27, none is
  committed, and published `public/scenes/` were purged; provenance rests on code history, not per-file records.
- UNVERIFIED: a local uncommitted variant run before 2026-09-16; which NVIDIA trial ToS version applied on each
  date (c15 quotes v. 2025-09-19); whether NVIDIA-hosted output carries BFL's invisible watermark.
- **Register gaps:** PUBLISHED_BOOKS.md lacks several uploads that memory records (Atonement, Handmaid's Tale,
  I'm Thinking of Ending Things). The guard's source of truth is incomplete.

## 2. Options for commercially usable generation

### (a) Paid NVIDIA
- **What NVIDIA's FAQ says** (https://docs.api.nvidia.com/nim/docs/product):
  - Developer Program access "is for prototyping, research, development and testing purposes only".
  - Production means "any use of NIM for purposes other than development, testing, research or evaluation".
  - Production needs an NVIDIA AI Enterprise licence, "start[ing] at $4500 per GPU per year or ~ $1 per GPU per
    hour in the cloud". A 90-day production trial licence exists on request (https://docs.api.nvidia.com/nim/docs/faq).
- **No paid hosted tier found.** No paid per-call tier of build.nvidia.com / the API catalog was found (UNVERIFIED
  that none exists). Production means self-hosting the NIM container on your own or a rented GPU, plus the licence.
- **UNVERIFIED:** whether a downloadable NIM for FLUX.2 [klein] 4B exists.
- **Cost:** licence ~$1/GPU-h plus GPU rent. One book is about 1 GPU-hour → roughly $1.5–2. The annual licence is
  overkill at this volume.

### (b) Black Forest Labs API (the model's maker)
- **Price** (https://bfl.ai/pricing): FLUX.2 [klein] 4B costs $0.014 for the first MP plus $0.001 per extra MP and
  per reference MP; a 1024² image ≈ $0.014–0.015. [klein] 9B $0.015, [pro] $0.03, [flex] $0.05, Kontext [pro] $0.04.
- **Terms** (Developer ToS, last revised 2026-08-04, https://bfl.ai/legal/developer-terms-of-service): §3(b) "you own
  all right, title, and interest in and to Output"; §4(b) Outputs may be used "for your or their own personal or
  commercial purposes"; §3(b) "you may not generate or use any Output to create a Deepfake" — relevant because Vox
  depicts real people (Prince Harry, Lincoln, Douglass); the ToS definition of "Deepfake" was not read (UNVERIFIED).
- **API shape:** async POST `https://api.bfl.ai/v1/flux-2-klein-4b` → `polling_url` → `result.sample` (signed URL,
  10 min) (https://docs.bfl.ai/flux_2/flux2_text_to_image; path per help.bfl.ai klein guide). Up to 4 reference
  images; `seed` and `safety_tolerance` for klein UNVERIFIED.

### (c) Other authorised hosts of the same Apache-2.0 weights

The [klein] 4B weights are Apache-2.0: "open weights available for commercial use"
(https://huggingface.co/black-forest-labs/FLUX.2-klein-4B). Each host's own ToS also applies.

- **fal.ai** (https://fal.ai/models/fal-ai/flux-2/klein/4b): $0.005 per MP (≈ $0.005 per 1024² image); page lists
  commercial use as supported; inputs include seed and reference/edit images; per-image safety checker (switchable:
  UNVERIFIED); fal's own ToS on outputs not read (UNVERIFIED).
- **Replicate** (https://replicate.com/black-forest-labs/flux-2-klein-4b): page says Apache 2.0, commercial use
  allowed, multi-reference editing; ≈ $0.015/image per aggregator
  https://pricepertoken.com/image/model/black-forest-labs-flux-2-klein-4b (UNVERIFIED on Replicate); seed UNVERIFIED.
- **Together AI** (https://www.together.ai/pricing): klein and FLUX.1 schnell are not listed. Listed models are
  FLUX.2 [dev] $0.0154/img, [pro] and [flex] $0.03/img.
  - **Caution:** FLUX.2 [dev] weights are under the FLUX Non-Commercial licence (c15 §4). Commercial rights through
    Together's hosted [dev]: UNVERIFIED. Avoid.
- **OpenRouter** also lists flux.2-klein-4b (https://openrouter.ai/black-forest-labs/flux.2-klein-4b). Terms and
  price not read.

### (d) Self-hosting an Apache-2.0 model
- **Licences:** FLUX.2 [klein] 4B Apache-2.0 (HF page above). FLUX.1 [schnell] Apache-2.0, 12B, 1–4 steps,
  "personal, scientific, and commercial purposes", no reference input (https://huggingface.co/black-forest-labs/FLUX.1-schnell).
  Not klein 9B / FLUX.2 [dev] (non-commercial).
- **Hardware:** klein 4B "fits in ~13GB VRAM", RTX 3090/4070 and up, sub-second on high-end GPUs (HF page). It
  supports multi-reference editing (image-to-image) in the same model.
- **GitHub Actions (CPU only):** a public-repo runner has 4 CPU, 16 GB RAM, 14 GB SSD, free
  (https://docs.github.com/en/actions/reference/runners/github-hosted-runners). GPU runners exist only as paid
  larger runners on Team/Enterprise.
  - **Memory:** klein 4B in bf16, transformer plus Qwen-based text encoder, is ≈ 13+ GB, at the 16 GB RAM edge.
    A quantised (fp8/GGUF) build is likely needed (UNVERIFIED).
  - **Speed estimate (no CPU benchmark was found, UNMEASURED):** ≈ 4B params × 2 FLOP × ~4.6k tokens × 4 steps
    ≈ 1.5e14 FLOP per 1024² image. At ~0.1–0.2 TFLOP/s effective on 4 vCPU, that is **≈ 12–25 min per image**.
  - **Per book:** 110–265 images ≈ 22–110 runner-hours. Across the 10-account pool (~20 jobs each, 6 h/job), that
    is about 1–3 h wall time at $0.
  - **Downsides:** heavy engineering, ~16 GB download per job vs a 14 GB SSD, unproven quality match. schnell is
    worse on CPU (12B, ≈ 3× slower, does not fit 16 GB in bf16).
- **Rented GPU** (https://www.runpod.io/pricing): RTX 4090 $0.34/h Community, $0.89/h Secure; RTX 3090 $0.22/$0.50;
  serverless 24 GB $0.75–1.34/h.
  - Estimated ≈ 1–3 s per image on a 4090 (UNVERIFIED), plus ~10–15 min for setup and weight download. One book
    is ≈ 0.5 h, about **$0.2–0.5**.
  - Gives full control of seed, reference images and the safety filter, so no CONTENT_FILTERED drops from the host.

## 3. Recommendation table (cost per book = 110–265 images, ~1.3× for retries)

| Option | Commercial-use status | Cost / book | Seed / reference image | Integration effort with gen-vox-images.py |
|---|---|---|---|---|
| NVIDIA trial (status quo) | Trial ToS excludes production (c15 §4) | $0 | no seed sent; ref = preview only | none |
| NVIDIA AI Enterprise + self-hosted NIM | Production licence per NVIDIA FAQ | ≈ $1.5–2 (hourly) or $4,500/GPU/yr | seed yes (API); ref UNVERIFIED | medium-high: GPU host + NIM; klein NIM availability UNVERIFIED |
| BFL API, klein 4B | ToS: you own Output, commercial OK; no Deepfakes | ≈ $2–5 | up to 4 refs; seed UNVERIFIED | low: new URL, `x-key`, async poll + download |
| fal.ai, klein 4B | Apache-2.0 weights, page says commercial; host ToS UNVERIFIED | ≈ $0.7–1.8 | seed + reference/edit | low: fal client or REST, same payload shape |
| Replicate, klein 4B | Apache-2.0, page says commercial | ≈ $2–5 (UNVERIFIED) | multi-ref; seed UNVERIFIED | low |
| Self-host klein 4B, rented GPU | Apache-2.0, no host ToS in between | ≈ $0.2–0.5 + ops time | full (seed, refs, own filter) | medium: diffusers worker script + RunPod/serverless glue |
| Self-host klein 4B on GH Actions CPU | Apache-2.0 | $0 money; ≈ 22–110 runner-h | full | high: quantised build, disk limit, speed unmeasured |
| FLUX.2 [dev] / klein 9B anywhere self-hosted | Non-commercial weights | n/a | n/a | do not use |

**Reading of the table (operator decides):**
- Smallest step to a documented commercial basis: **BFL API** (model maker, explicit output-ownership terms; watch
  the Deepfake clause for real-person books). Cheapest hosted with seed + refs: **fal.ai** (read its ToS first).
  Lowest cost + full consistency control (seed, reference images for recurring cast): **rented-GPU self-host**.
- All three keep the same Apache-2.0 klein 4B model, so the look matches published books.
- None changes the status of already-published books; that question is recorded in §1 only.
