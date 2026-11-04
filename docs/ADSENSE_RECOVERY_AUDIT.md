# SeeStew AdSense recovery audit

**Date:** 2026-11-04  
**Live baseline SHA before fixes:** `f83a114` (origin/main at audit start)  
**Trigger:** Google AdSense “Needs attention: Low value content.” (`ads.txt` Authorized)

## Method

- Fetched live `https://seestew.com/sitemap.xml` (single sitemap, no nested indexes).
- Measured main-content word counts inside `<main>`, excluding nav/header/footer/scripts/forms.
- Compared Grokbot claims to live HTTP + source routes under `src/app`.
- No content was invented to hit arbitrary word counts.

## Sitemap inventory (live)

| Group | Count |
| --- | ---: |
| Total unique sitemap URLs | **253** |
| Articles | 135 |
| On-this-day date pages | 59 |
| Hubs | 33 |
| Topics | 6 |
| Video detail | 3 |
| Static / listing / legal | 17 |

All 253 sitemap URLs returned HTTP **200**.

## Grokbot claim verification

| Claim | Verdict |
| --- | --- |
| 76 of 250 sitemap pages under 200 words | **Substantially true** — **76 of 253** under 200 |
| Many `/on-this-day/[date]` pages ~90 words | **True direction** — median **72**, mean **75**, range 60–118; **all 59** under 200 |
| Hubs 140–190 words | **True for thin hubs** — highlighted low hubs 131–182; overall hubs 131–1,672 |
| `/newsletter` and `/contact` thin | **True** — ~28 and ~37 words |
| 404 loads 10 ad tags | **False as stated** — static HTML repeats AdSense strings via Next serialization; fully loaded 404 had **1** `.adsbygoogle` element and **1** ad iframe |
| `/search` 404 despite SearchAction | **Half-true** — `/search` is a genuine **404** with `noindex`; homepage **has no SearchAction** JSON-LD now |

## Thin / risk pages identified

### Anniversary dates (59)

- All were indexed via sitemap as card/list pages.
- **8 multi-event dates:** `january-24`, `march-1`, `march-25`, `may-31`, `july-17`, `july-30`, `october-8`, `december-1`.
- **51 single-event dates:** useful navigation, not durable encyclopedia pages.

### Historical hubs (thin set)

| Hub | Articles | Live words (approx) | Decision |
| --- | ---: | ---: | --- |
| `pennsylvania` | 3 | 131 | Improve intro + body summaries; **noindex** (below index min 4) |
| `california` | 3 | 137 | Same |
| `texas` | 3 | 137 | Same |
| `boston-history` | 3 | 161 | Same; distinct from Massachusetts via Salem exclusion |
| `massachusetts` | 4 | 161 | Improve; **keep indexable** |
| `1870s` | 3 | 163 | Improve; **noindex** |
| `1880s` | 4 | 181 | Improve; **keep indexable** |
| `chicago-disasters` | 4 | 182 | Improve; **keep indexable** |

No unsafe consolidation of distinct city/state intents. Massachusetts retains Salem; Boston hub remains Boston-only.

### Utility / other

- `/newsletter` — thin form page; expand with accurate digest explanation + labeled sample (not claiming a sent issue).
- `/contact` — functional SMTP form; **noindex,follow**; remove from sitemap; keep footer links.
- `/search` — no route; 404; do **not** add SearchAction or a search product solely for schema.
- Short detail pages — already noindex + out of sitemap.
- Video detail pages — have real editorial notes in source; keep indexed; no fake padding.
- `/insights` — managed feed; only in sitemap when feed present.

### Ads on errors

- Root layout previously loaded `adsbygoogle.js` sitewide (`beforeInteractive`), enabling Auto ads on 404.
- Fix: `data-seestew-no-ads` on `not-found.tsx` + client `AdSenseLoader` / `AdSlot` skip.
- Publisher verification meta (`google-adsense-account`) remains in root layout.
- No new ad units added.

### Homepage anniversary date

- Uses `America/New_York` via `todayPartsInSiteTz`.
- Live check 2026-11-04: correctly showed **“Upcoming anniversaries”** with “No curated anniversary is verified for November 4.”
- `revalidate = 60` retained to limit stale CDN “yesterday” HTML.

### SearchAction / article schema

- `buildWebSiteJsonLd()` has **no** SearchAction (correct while `/search` does not exist).
- Articles already emit BlogPosting with Chris author, publisher SeeStew, citations from real references.

## Remediation summary (this change set)

1. Multi-event anniversary pages: contextual summaries from article bodies; remain indexable.
2. Single-event anniversary pages: reachable, **noindex,follow**, removed from sitemap.
3. Thin hubs (<4 articles): improved distinctive intros + body summaries; **noindex,follow**; removed from sitemap.
4. Stronger hubs (≥4): improved intros/summaries; stay indexable.
5. Newsletter expanded; contact noindex; contact off sitemap.
6. 404 ad loading blocked without removing verification meta.
7. `npm run check:indexability` prevents future thin indexed batches.

## What was not done (on purpose)

- No fabricated anniversary events or 366 empty date pages.
- No mechanical em-dash purge or bulk article rewrites.
- No new ad units.
- No Hostinger image optimizer re-enable.
- No Resend; SMTP + SendFable preserved.
- No SearchAction / `/search` product without a real product need.
