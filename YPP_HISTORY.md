# YPP (YouTube Partner Program) History Log

Tracks YouTube Partner Program approval milestones, the content setup at the time, and lessons learned. Used to calibrate how aggressive/automated the pipeline can be without losing monetization eligibility.

## 2026-08-11 — ✅ APPROVED on v1 pipeline (pre-Vox)

| Field | Value |
| :--- | :--- |
| Outcome | **YPP APPROVED** |
| Pipeline version | **v1** (pre-Vox migration) |
| Narration voice | **NotebookLM (synthetic, not cloned)** |
| Script source | Custom per-book prompt → NotebookLM |
| Captions | YouTube VTT (timestamped) |
| Human presence | ~30s face-cam intro (custom-scripted, self-narrated) |
| Video assembly | Remotion (subtitles + NotebookLM audio) |

### Why this matters
Approval came through **even with the raw NotebookLM voice** and a mostly-automated summary/review format. This is a real-world data point showing YouTube's **practical enforcement bar is more lenient** than the strict wording of the July 2025 "inauthentic content" policy suggested.

### Working hypothesis for *why it passed*
The combination that likely carried it over the line:
- **Original production layer** — Remotion cinematic assembly, not a stock-footage slideshow.
- **Real human anchor** — the ~30s face-cam intro (genuine creator presence).
- **Custom per-book prompts** — enough differentiation that videos weren't carbon copies (avoided mass-produced signal).
- **Review/summary framing** — presented as a show, not a raw book reading.

### Open risks that did NOT block approval (but remain live)
- **Copyright / derivative content** — book content via NotebookLM is still a Content ID / derivative-work risk at scale, independent of YPP status.
- **AI disclosure** — synthetic audio should be flagged as altered content going forward.
- Monetization can be re-reviewed; approval is not permanent immunity.

### Implication for the Vox migration
Since v1 passed with synthetic voice + light human anchor, the Vox pipeline (voice clone + heavier automation) should **preserve as much as possible of what likely earned approval**: original Remotion production and per-book differentiation are now the load-bearing legs.

---

## 2026-08-11 — Post-approval strategy decisions (Vox direction)

Decisions made now that YPP is already secured (approval persists; not re-scanned per video):

- **Normal videos = FACELESS.** The ~30s face-cam anchor is dropped from regular uploads. This is acceptable because the channel is *already approved* — a cold application would have needed the face, an approved channel going faceless is low-risk.
- **Face presence hedge:** occasional Shorts with the user's face, to keep a human signal on the channel.
- **Compensation for removing the anchor:** the remaining two approval legs must carry more weight → (1) Remotion production quality is now non-negotiable (no slideshow drift), (2) strong per-book differentiation (no template-sameness).
- **Upload cadence:** 1/day approved, conditioned on *quality held constant + each video differentiated*. No day-one bursts (burst = farm signal). If pace threatens quality, cut pace not quality.
- **AI disclosure:** cloned/synthetic voice → mark **"Altered content = Yes"** per video (Studio → Content → Edit → Altered content). Does not hurt monetization. Candidate for pipeline automation at upload time.

### Risk has shifted, not disappeared
YPP application risk is behind us. Live risks now: (a) **copyright / Content ID** on book content (independent of YPP; mitigate by framing as analysis/commentary, not summary), (b) **farm-drift → demonetization on re-review** if the channel becomes "same template ×N" (mitigate with consistent branding + quality + differentiation).

### Branding status (TODO)
Only a face-intro clip exists. For a faceless channel, brand identity is the main visual-consistency signal. Missing pieces to build once as reusable Remotion components: **intro sting (5-8s logo+name+music), outro (5s subscribe+next-card), thumbnail template.** Caption style already exists and is consistent.

---

## 2026-11-17 — ❌ REJECTED on re-review: "generic or repetitive content" (policy: *inauthentic content*)

- YouTube renamed "repetitious content" to **inauthentic content** on 2025-07-15: "repetitive or mass-produced"; "content that
  looks like it's made with a template, or that may feel repetitive to viewers after watching several videos in a row";
  AI content is fine when it carries "the creator's original, authentic insights or perspective"; the same intro / outro is
  allowed when "the bulk of your content is different". The review is the channel as a whole: main theme, most-viewed,
  **newest**, metadata (titles, thumbnails, descriptions), About.
- The operator opened the appeal (2026-11-23). **While the appeal runs nothing on the channel is deleted or edited.**
- What the detector measures (Google Research, *Scalable Detection of Adversarial Synthetic Slop and Coordinated Media
  Abuse*, S-CTS, 2026 — read 2026-11-23): transcript text embeddings ("repetitive, templated narratives"), the salient terms
  of title + description, **upload pacing** (`avg_log_upload_pace`, `time_to_first_upload_secs`), frame-level visual
  embeddings; a trained category "Synthetic Text-to-Speech Narratives". Enforcement needs an account CLUSTER too — one
  channel with hand uploads is not a cluster, so the live risk is the content signals + the human YPP review.
- Measured on the channel that was reviewed (71 published videos, none made with the narrative-form / Film Flow code):
  one prompt spine (median 40 % shared words), "which brings us to the" in 67/85 films; description line
  "🔔 Subscribe for more book breakdowns." on 44 packs, `#BookSummary` on 83/83, "book summary" on 77/83 tag lists;
  **20 of 32 upload days carried 2–5 videos, the week of 09-28 carried 19** (the written "1/day, no bursts" rule had no code).
- Decisions (operator, 2026-11-23): upload pace **≤ 1 per day, ≤ 7 per week** (`data/quality-policy.json → uploadPace`,
  guarded by `scripts/upload-pace.js` + `package-youtube.js`); **Altered content = Yes on every video, recorded**
  (`youtube-meta.alteredContent`, lint `NO_ALTERED_CONTENT_RECORD`); the producer's note is required for every upload
  (`NO_PRODUCER_NOTE`); description / tags / hashtags are compared with every other pack (`lintPackSameness`:
  `DESCRIPTION_SHARED_LINE`, `DESCRIPTION_SHARED_RUN`, `TAGS_CHANNEL_STAPLES`, `HASHTAGS_CHANNEL_STAPLES`).
- The old catalogue: the operator's tiered list (`kanal-benzerlik-listesi.csv`: 22 "delete first", 39 "second wave",
  39 "keep", 93 unmeasured) waits for the appeal's outcome; a remake = a NEW recording on the v5 form prompt + Film Flow,
  never the old audio under new pictures (the transcript embedding would not change).
- Next (plan 2026-11-23): transcript sameness measure + bar (`transcript-sameness.js`), frame-level sameness on Actions
  (`visual-sameness.js`), the fixed pieces (producer-note card, chapter card, transitions, SFX) bound to the book skin,
  a Vox text-card time cap, `catalogue-triage.js` for the post-appeal remake order.

---
