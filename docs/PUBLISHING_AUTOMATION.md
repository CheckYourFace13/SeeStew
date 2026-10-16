# SeeStew publishing automation

## Schedules (UTC)

| Workflow | Cron | Local (America/Chicago CDT) |
|---|---|---|
| **Daily Story Generator** (`daily-story.yml`) | `0 10 * * *` | 05:00 daily |
| **Quick Reads Publisher** (`quick-reads.yml`) | `0 14 * * 2,4,6` | 09:00 Tue / Thu / Sat |

Both share concurrency group `seestew-publishing` (`cancel-in-progress: false`) and push with rebase retries.

## Queues

| Queue | File | Consumed by |
|---|---|---|
| Full stories | `content/story-queue.json` | `generate-daily-story.mjs` |
| Quick Reads | `content/quick-read-queue.json` | `generate-quick-read.mjs` |

Quick Reads **never** consume full-story pending items.

## Quality

- Full: ≥1500 words, ≥4 curated sources, existing CI gates
- Quick Read: ~300–500 words (validate 250–650), ≥2 sources, distinct generator prompt
- Empty queue / failed validation → **exit 1**, no filler

## Ops commands

```bash
npm run dry-run:publish          # select-only both
npm run dry-run:publish -- --full
npm run validate:queue
npm run validate:quick-read-queue
npm run report:publishing-health
```

## Alerts

GitHub Actions annotations (`::error::` / `::warning::`) + job step summary health report when:

- Queue empty or pending &lt; 15 (full) / low QR depth
- Quality gate fails
- Commit/push fails after rebase retries
- Scheduled job fails (visible in Actions; health report counts last 7 days)
