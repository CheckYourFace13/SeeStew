# Historical Eras & Quick Reads — SeeStew

## Daily publishing (verified 2026-10-15)

| Window | Result |
|---|---|
| Oct 1–11, 2026 | 1 story/day (GitHub Action commits) |
| Oct 12–15, 2026 | **Missed** — `content/story-queue.json` had **0 pending** topics |

**Fix:** `scripts/story-queue-batch-5.mjs` (34 sourced topics) registered; `MIN_PENDING_TOPICS = 30`; validate fails hard at 0 pending.

Cadence remains: **one full researched article/day** via `.github/workflows/daily-story.yml` (10:00 UTC). Failures exit non-zero — no fabricated filler.

## Historical Eras

Independent of topic category. Event years only (`eventYear` / slug year / overrides).

| Slug | Years |
|---|---|
| colonial-america | before 1775 |
| revolution-early-republic | 1775–1820 |
| antebellum-civil-war | 1821–1865 |
| reconstruction-gilded-age | 1866–1900 |
| progressive-wwi | 1901–1919 |
| twenties-depression | 1920–1938 |
| world-war-ii | 1939–1945 |
| postwar-cold-war | 1946–1991 |
| modern-america | 1992–present |

Routes: `/hubs/<era-slug>` (existing hubs system). Empty eras are not indexed (`HUB_MIN_ARTICLES`).

Backfill: `node scripts/backfill-historical-eras.mjs`

## Quick Reads

- Format flag: `"format": "quick-read"` on article JSON
- ~300–500 words / 1–3 min; quality profile in `check-article-quality.ts` (250–650 band, ≥2 sources)
- Same `/articles/[slug]` template; filter: `/articles?format=quick-read`
- No Amazon/CJ affiliate blocks on Quick Reads
- Topic queue: `content/quick-read-queue.json` (pending ideas only — publish when research clears gates)
- Target: **2–3/week**, never forced

## Discovery (no new header nav)

Homepage + archive links: Latest Stories · Quick Reads · Browse by Era · On This Day. Header stays Stories / Videos / Shorts.
