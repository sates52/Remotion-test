# AWS Lambda & S3 Cost Log

This log tracks the estimated costs for Remotion Lambda rendering sessions.

## March 25, 2026

| Session/Render ID | Status | Estimated Cost | Details |
| :--- | :--- | :--- | :--- |
| `xtzv8rv4jh` | Stalled (1GB) | ~$0.15 | Preliminary frames / Stall |
| `uhoa4mdwat` | Failed (Timed Out) | $0.568 | Reach 32% (2GB RAM) |
| `of80c3sh0f` | **Success** | $2.167 | Full 30-min render (2GB RAM) |
| **Total Daily** | | **~$2.90** | |

---

## March 27, 2026

| Session/Render ID | Status | Estimated Cost | Details |
| :--- | :--- | :--- | :--- |
| `dante-gbs-v4` | **Success** | $1.703 | Full render (41,108 frames) |
| **Total Daily** | | **~$1.70** | |

---

## AWS Free Tier Status (Monthly)

AWS Lambda offers **400,000 GB-seconds** and **1 million requests** free per month.

- **Estimated Usage (Mar 27 update)**: ~192,200 GB-seconds
- **Remaining Free Usage**: **~207,800 GB-seconds**
- **Safe Headroom**: You have enough free tier remaining for approximately **1.5 more** full videos (30-min length) this month.

> [!NOTE]
> Costs are estimates based on standard AWS pricing. S3 storage costs for videos are negligible if deleted periodically.
