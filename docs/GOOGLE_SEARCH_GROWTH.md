# Google Search growth — SeeStew

Date: 2026-10-15  
Source: GSC export `seestew.com-Performance-on-Search-2026-10-15.zip` (last ~3 months)

## Headline metrics

| Metric | Value |
|---|---|
| Impressions | 4,871 |
| Clicks | 4 |
| CTR | ~0.1% |
| Avg position | 70.5 |

### Devices

| Device | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Desktop | 3 | 4,765 | 0.06% | 70.83 |
| Mobile | 1 | 104 | 0.96% | 54 |
| Tablet | 0 | 2 | — | 48.5 |

**Desktop finding:** Almost all impressions are desktop at deep average position (~71). Low CTR is primarily ranking depth, not a mobile-layout bug. The exception is pages that already rank high but still get zero clicks (snippet/CTR problem).

### Ignore operator noise

Top “queries” include `site.osha.gov "the triangle shirtwaist factory fire account"` etc. These are **search-operator** impressions, not ordinary keyword opportunities. Do not optimize for them.

## Top pages (real GSC)

| Page | Imp | Pos | Clicks | Note |
|---|---|---|---|---|
| Triangle Shirtwaist Fire 1911 | 508 | 40.84 | 0 | Volume leader; mid-pack |
| San Francisco Earthquake 1906 | 398 | 89.42 | 0 | Deep; year + cause angles |
| Gulf of Tonkin 1964 | 394 | 87.80 | 0 | Deep; “incident / never happened” intent |
| Zoot Suit Riots 1943 | 251 | 80.26 | 0 | Deep |
| Tuskegee syphilis study | 197 | 83.48 | 0 | Deep |
| **Great Molasses Flood 1919** | **180** | **5.77** | **0** | **High rank, zero clicks — CTR priority** |
| Lake Peigneur 1980 | 31 | 12.26 | 0 | Near page 1–2; entity in title |
| Radium Girls 1920s | 30 | 13.5 | 0 | Near page 2; CTR title |

Also: `www.seestew.com` and apex both appear in Pages.csv. Apex canonical + www→apex 301 already configured in `next.config.ts` / `siteConfig.url`.

## Molasses audit (priority #1)

- Content is substantive (tank, victims, lawsuit, sources) — **not** a thin page.
- Live SERP title used the long H1 (~81 chars), truncated by `buildArticleSerpTitle` (~70) **before** “Killed 21…Boston” — the CTR hook was cut off.
- Meta `seoDescription` ended with a hard `...` mid-sentence.
- Query rows naming molasses are sparse/deep; page-level position 5.77 still implies the URL appears for related SERPs where the snippet failed to earn a click.

**Deployed fix:** shortened H1/seoTitle to keep Boston + 1919 + deaths in the first ~60 chars; wrote a complete ~155-char meta description.

## Prioritized plan (10) — evidence-based

| # | Action | Evidence | Status |
|---|---|---|---|
| 1 | Fix Molasses SERP title + description CTR | Pos 5.77 / 180 imp / 0 clicks | **DONE** |
| 2 | Lake Peigneur title ≤70 chars + complete meta | Pos 12.26 | **DONE** |
| 3 | Radium Girls shorter entity-forward title + meta | Pos 13.5 | **DONE** |
| 4 | Zoot Suit H1 shorten so “1943 / L.A.” survive truncation | 251 imp @ ~80 | **DONE** |
| 5 | Triangle Shirtwaist: keep strong title; deepen internal links from labor/fire hubs; watch OSHA operator noise | 508 imp @ 40.8 | Plan — no mass rewrite |
| 6 | Gulf of Tonkin / SF Earthquake: unique “what actually happened / primary-source” intros; avoid duplicate encyclopedia tone | ~390 imp each @ ~88 | Plan |
| 7 | Confirm www→apex indexing consolidation in GSC (Remove obsolete www URLs over time) | Dual host rows in Pages.csv | Config already live |
| 8 | Near-page-1 watchlist (pos ≤20): Molasses, Lake Peigneur, Radium Girls — re-check CTR in 28 days | Devices + Pages | Monitor |
| 9 | Do **not** chase `site:osha.gov` queries | Queries.csv | Explicit ignore |
| 10 | Join real CJ history/museum/book advertisers before any network placements | CJ joined list = 0 relevant | Affiliate deferred |

## SEO fixes actually deployed this pass

1. `great-molasses-flood-1919` — title + seoTitle + seoDescription  
2. `lake-peigneur-1980` — title + seoTitle + seoDescription  
3. `radium-girls-1920s` — title + seoTitle + seoDescription  
4. `zoot-suit-riots-1943` — title + seoTitle + seoDescription  

No speculative mass rewrites of Triangle / Tonkin / SF Earthquake bodies.
