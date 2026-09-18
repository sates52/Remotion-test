# Governed thumbnail system

The thumbnail pipeline is deliberately a separate creative decision from the
video render. Its job is to maximise qualified clicks: a clear promise that
the opening and the video actually fulfil, not the largest possible CTR.

## Pipeline

`plan-meta` → `thumbnail-art-director` → five Flux candidates →
`thumbnail-critic` → winner cut-out → Remotion still.

`make-book.js` runs this sequence for both Vox and Antidote books. The still is
only the final compositor; it must not invent a hook or choose a visual concept.

## Agent hand-off contract

1. The metadata agent supplies real chapter labels and an accurate description.
2. The art-director agent creates five different visual arguments: power, soul,
   scene, conflict and mystery. Each candidate contains `hook`, `evidence`,
   `visualSubject`, `layout`, and a Flux prompt.
3. The image agent renders each candidate without text. Generated copy always
   comes from Remotion, not the image model.
4. The critic combines pixel inspection with semantic relevance, mobile
   readability, hook/title complement and channel-level repetition checks.
5. The publishing agent must resolve `thumbnail.reviewRequired` before upload.
   A value of `true` is a human/editorial hand-off, not a permission to publish.

## Guardrails

- A hook is 1–5 words and must have evidence in a chapter, title or description.
- Exact hooks may not repeat across the channel.
- Generic or sensational language is marked for editorial review.
- Recent layout/angle overuse lowers a candidate score; it cannot win merely
  because it is sharper or brighter.
- Do not use unlicensed covers, film stills, celebrity likenesses, or claims the
  video does not substantiate.

Run `node scripts/thumbnail-channel-audit.js` to inspect channel repetition.
Run it before a batch to understand the current visual mix.
