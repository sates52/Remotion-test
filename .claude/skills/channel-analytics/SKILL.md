---
name: channel-analytics
description: >
  The channel's own YouTube performance, read-only: refresh the data, read the standing analysis (where views come
  from and how long they last, where viewers leave, what people typed, which titles / lengths / months do better),
  and lay a film's retention over its scenes. Use when the operator asks about "analytics", "izlenme", "retention",
  "kanal raporu", "hangi video tuttu", before deciding what a pipeline change should improve, after a book is
  published, and whenever a claim about "what works on the channel" is about to be made. Every harness (Claude Code,
  Antigravity, Cursor, Codex) runs the same commands and reads the same files.
---

# Channel analytics — one data set, one analysis, every agent

The channel's numbers are the only measure of whether the films work. Blind mute tests, gates and A/B stills are
proxies: use them to build, and this to decide what to build next. Talk to the operator in **Turkish**.

## 1. Refresh and read (two commands, any checkout on current `origin/god-mode`)

```bash
node scripts/yt-analytics.js all        # sync videos → match to books → pull analytics → report + insights
node scripts/yt-analytics.js insights   # re-build the analysis from the data already pulled (no network)
```

Then read, in this order:

| File (in the store, see §3) | What it is |
|---|---|
| `data/channel-insights.md` | **the standing analysis** — start here, quote it, do not re-derive it by hand |
| `data/channel-report.md` | one row per video: views, first 7 / 28 days, average view, retention checkpoints, top source |
| `data/snapshot-<date>.json` | the same rows as data, one file per day it was run (compare two dates for a trend) |
| `data/analytics/<videoId>.json` | one video: totals, daily views, traffic sources, 100-point retention curve |
| `data/channel-level.json` | last 90 days: watch time per source, search terms, browse detail, subscribed split |

One film against its scenes (after `all`): `node scripts/retention-map.js --slug=<slug> [--book-root=<the book's checkout>]`.

The data is at most as fresh as the last `all`; YouTube Analytics itself lags 2–3 days. Say the sync date when you
quote a number.

## 2. How to read it — the rules that keep the analysis honest

1. **Compare like with like.** "views 7d / 28d" (first 7 / 28 days after publishing) compare an old video with a new
   one; lifetime views do not. Engine, kind and title groups hold different books — a difference between them is a
   hint, never a controlled result. Groups marked `(thin)` (under 15 videos) are hints only.
2. **Retention says when a viewer left, never why.** A cause is a hypothesis until a change made for it moves the
   number on films made AFTER the change. The row to watch is "By publishing month → still at 1:00 / 2:00".
3. **Seconds per view by source is the intent check.** A source with many views and under ~90 s per view is sending
   people who wanted something else (2026-11-11: "<book> audiobook" searches; home impressions). More of those views
   is not progress.
4. **API names differ from Studio:** `SUBSCRIBER` = Browse features (home `what-to-watch` + subscriptions feed), not
   "subscribers"; `EXT_URL` = external, mostly Google Search; `RELATED_VIDEO` = suggested.
5. **Not in the API:** thumbnail impressions and click-through rate. The operator exports Studio → Analytics →
   Advanced mode → Export (Table data.csv); then `node scripts/yt-analytics.js import-csv <file>`. Without it, say
   "CTR not imported" — never estimate it.
6. **`retention-map.js` attributes, it does not measure a scene.** One retention point on a 40-minute film is ~24 s,
   several scenes; on a film with a few hundred views the curve is a staircase. Use it to find a region to look at.
7. **Never invent a success bar after the fact** ("10x", "60 %"). State the number before the change, the number
   after, on which videos, and how many.

## 3. Where things live, and what never happens

- **Store (outside every checkout): `%USERPROFILE%\.yt-analytics`** (`YT_ANALYTICS_DIR` overrides): `client_secret.json`,
  `token.json`, `data/`. All worktrees and all agents on this PC share it. The tool refuses a store inside a git checkout.
- **Never** copy the store into a repo, commit channel data, paste a token or the client secret into chat, a log, a
  commit or `AGENT_LOG.md`. Quoting numbers from the reports to the operator and in `AGENT_LOG.md` is fine.
- **Read-only.** Scopes are `youtube.readonly` + `yt-analytics.readonly`; nothing here uploads, edits a video, or
  changes a title. Published books stay frozen: analytics never rewrites `books/<slug>/` or `PUBLISHED_BOOKS.md`.
- **`not authorized yet`, or a token error:** the operator runs `node scripts/yt-analytics.js auth` once in their own
  terminal and approves in the browser (Google Cloud project `ytanalytics`, published "In production"). Do not ask
  them for credentials, and do not try another account.
- **An agent with no access to this PC's store** (a cloud session) cannot refresh: say so and work from the numbers
  recorded in `AGENT_LOG.md`.
- **A video shows `NO BOOK` or `FUZZY` in `match`:** add `{"<slug>": "<videoId>"}` to
  `data/video-map.manual.json` in the store and re-run `match`. Never guess a pairing.

## 4. When each agent uses it

| Moment | Do |
|---|---|
| The operator asks how the channel / a video is doing | `all`, then answer from `channel-insights.md` + the video's row |
| A book was published (after the upload, any time later) | `all` once the video is 3+ days old; nothing to record in the book |
| Before proposing or starting a systemic change (prompt, engine, titles, thumbnails, length) | read `channel-insights.md`; name the row the change should move and its value today |
| After such a change has shipped on 5+ published films | `all`; report the same row before / after in `AGENT_LOG.md` |
| Step 0 of a new book | nothing to run — the prompt's FIRST MINUTE and PICTURE FIRST blocks already come from this data |

## 5. Baseline (2026-11-11 — replace these when you re-measure, with the date)

202 long videos, 6,210 subscribers. Median still watching: 0:30 82 % · 1:00 39 % · 2:00 23 % · half 9 %; average view
3:36 (10 % of the film). YouTube search 43 % of views at 65 s per view; browse 40 % at 41 s; external (Google Search)
6 % at ~6 min; suggested 5 % at ~4.5 min. Subscribers +48 / −61 in 90 days. Films of 25–35 minutes have the best
average-viewed share (12.7 % vs 6.8 % over 45 minutes). First changes made from it (same day): the NotebookLM prompt
spine gained FIRST MINUTE and PICTURE FIRST, and "audiobook" left the generated tags and the title modifiers.
